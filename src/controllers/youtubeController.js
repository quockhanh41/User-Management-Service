const { google } = require('googleapis');
const User = require('../models/User');

// Khởi tạo OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production' ? process.env.YOUTUBE_PRODUCTION_REDIRECT_URI : process.env.YOUTUBE_LOCAL_REDIRECT_URI
);

// Tạo URL xác thực
exports.getAuthUrl = (req, res) => {
  try {
    const userId = req.user.userId;
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      response_type: 'code',
      redirect_uri: process.env.NODE_ENV === 'production' ? process.env.YOUTUBE_PRODUCTION_REDIRECT_URI : process.env.YOUTUBE_LOCAL_REDIRECT_URI,
      prompt: 'consent',
      client_id: process.env.YOUTUBE_CLIENT_ID,
      scope: scopes.join(' '),
      state: userId,
      flowName: 'GeneralOAuthFlow'
    });

    res.status(200).json({
      status: 'success',
      message: 'Lấy URL xác thực thành công',
      data: {
        authUrl: url
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo URL xác thực:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Xử lý callback sau khi xác thực
exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Không tìm thấy mã xác thực',
        code: 'AUTH_CODE_MISSING'
      });
    }

    // Đổi code lấy tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Lấy thông tin kênh YouTube
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.channels.list({
      part: 'snippet',
      mine: true
    });

    const channel = response.data.items[0];
    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy kênh YouTube',
        code: 'YOUTUBE_CHANNEL_NOT_FOUND'
      });
    }
  
    // Kiểm tra xem kênh YouTube đã liên kết với user nào chưa
    const existingUser = await User.findOne({
      'socialAccounts.platform': 'youtube',
      'socialAccounts.socialId': channel.id
    });

    if (existingUser && existingUser._id !== userId) {
      return res.status(409).json({
        status: 'error',
        message: 'Kênh YouTube này đã được liên kết với tài khoản khác',
        code: 'YOUTUBE_CHANNEL_ALREADY_LINKED',
        data: {
          userId: existingUser._id,
          email: existingUser.email
        }
      });
    }
  
    // Lưu thông tin tài khoản liên kết
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    const socialAccount = {
      platform: 'youtube',
      socialId: channel.id,
      name: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails.default.url,
      profileUrl: `https://www.youtube.com/channel/${channel.id}`,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };
 
    // Kiểm tra xem tài khoản liên kết đã tồn tại chưa
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === 'youtube'
    );

    if (existingAccountIndex !== -1) {
      user.socialAccounts[existingAccountIndex] = socialAccount;
    } else {
      user.socialAccounts.push(socialAccount);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Liên kết tài khoản YouTube thành công',
      data: {
        channel: {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.default.url
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi xử lý callback:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Upload video lên YouTube
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const userId = req.user.userId;

    // Kiểm tra file video
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Không tìm thấy file video',
        code: 'VIDEO_FILE_MISSING'
      });
    }

    // Lấy thông tin tài khoản YouTube
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    const youtubeAccount = user.socialAccounts.find(
      account => account.platform === 'youtube'
    );

    if (!youtubeAccount) {
      return res.status(404).json({
        status: 'error',
        message: 'Chưa liên kết tài khoản YouTube',
        code: 'YOUTUBE_ACCOUNT_NOT_LINKED'
      });
    }

    // Cấu hình OAuth2 client với access token
    oauth2Client.setCredentials({
      access_token: youtubeAccount.accessToken,
      refresh_token: youtubeAccount.refreshToken
    });

    // Khởi tạo YouTube API client
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Upload video
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title,
          description,
          tags: tags ? tags.split(',') : []
        },
        status: {
          privacyStatus: 'private'
        }
      },
      media: {
        body: req.file.buffer
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Upload video thành công',
      data: {
        videoId: response.data.id,
        title: response.data.snippet.title,
        description: response.data.snippet.description,
        thumbnail: response.data.snippet.thumbnails.default.url
      }
    });
  } catch (error) {
    console.error('Lỗi khi upload video:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 

