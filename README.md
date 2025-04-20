# User Management Service API

Tài liệu API cho User Management Service với xác thực JWT.

## Thông tin chung

- **Base URL**: `https://user-management-service-production-38e1.up.railway.app/api/v1`
- **Content-Type**: `application/json`
- **Xác thực**: JWT Token (Bearer)

## Cấu trúc response

### Response thành công
```json
{
  "status": "success",
  "message": "Thông báo kết quả",
  "data": {
    // Dữ liệu trả về
  }
}
```

### Response lỗi
```json
{
  "status": "error",
  "message": "Thông báo lỗi",
  "code": "Mã lỗi",
  "errors": [
    // Chi tiết lỗi (nếu có)
  ]
}
```

## API Endpoints

### 1. Kiểm tra trạng thái server

- **URL**: `https://user-management-service-production-38e1.up.railway.app/health`
- **Method**: `GET`
- **Xác thực**: Không

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Server is running",
  "data": {
    "timestamp": "2024-03-14T10:30:00.000Z",
    "environment": "development"
  }
}
```

### 2. Đăng ký người dùng

- **URL**: `/auth/register`
- **Method**: `POST`
- **Xác thực**: Không

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Response thành công (201)
```json
{
  "status": "success",
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f2e8b7c261e6001234abcd",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Response lỗi (409)
```json
{
  "status": "error",
  "message": "Email đã được sử dụng",
  "code": "EMAIL_EXISTS"
}
```

#### Response lỗi validation (422)
```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Mật khẩu phải có độ dài từ 6 đến 20 ký tự",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Tên phải có độ dài từ 2 đến 50 ký tự",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### 3. Đăng nhập

- **URL**: `/auth/login`
- **Method**: `POST`
- **Xác thực**: Không

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f2e8b7c261e6001234abcd",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Email hoặc mật khẩu không chính xác",
  "code": "INVALID_CREDENTIALS"
}
```

### 4. Đăng xuất

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đăng xuất thành công"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
}
```

### 5. Đổi mật khẩu

- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request body
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đổi mật khẩu thành công"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Mật khẩu hiện tại không chính xác",
  "code": "INVALID_CURRENT_PASSWORD"
}
```

### 6. Lấy thông tin người dùng

- **URL**: `/user/profile`
- **Method**: `GET`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "_id": "65f2e8b7c261e6001234abcd",
    "name": "User Name",
    "email": "user@example.com",
    "socialAccounts": [
      {
        "platform": "Facebook",
        "profileUrl": "https://www.facebook.com/nguoidung",
        "socialId": "fb_123456",
        "accessToken": "access_token_here"
      },
      {
        "platform": "Youtube",
        "profileUrl": "https://www.youtube.com/nguoidung",
        "socialId": "yt_abcdef",
        "accessToken": "access_token_here"
      }
    ],
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T10:30:00.000Z"
  }
}
```

#### Response lỗi (404)
```json
{
  "status": "error",
  "message": "Không tìm thấy người dùng",
  "code": "USER_NOT_FOUND"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
}
```

### 7. Thêm/chỉnh sửa tài khoản liên kết

- **URL**: `/user/social`
- **Method**: `POST` hoặc `PUT`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request body
```json
{
  "platform": "Facebook",
  "socialId": "fb_123456",
  "profileUrl": "https://www.facebook.com/nguoidung",
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Thêm tài khoản liên kết thành công",
  "data": {
    "socialAccount": {
      "platform": "Facebook",
      "socialId": "fb_123456",
      "profileUrl": "https://www.facebook.com/nguoidung",
      "accessToken": "access_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### Response lỗi validation (422)
```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "msg": "Nền tảng không hợp lệ",
      "param": "platform",
      "location": "body"
    },
    {
      "msg": "URL hồ sơ không hợp lệ",
      "param": "profileUrl",
      "location": "body"
    }
  ]
}
```

#### Response lỗi (404)
```json
{
  "status": "error",
  "message": "Không tìm thấy người dùng",
  "code": "USER_NOT_FOUND"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
}
```

### 8. Xóa tài khoản liên kết

- **URL**: `/user/social/{platform}`
- **Method**: `DELETE`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Xóa tài khoản liên kết thành công",
  "data": {
    "platform": "Facebook"
  }
}
```

#### Response lỗi (404)
```json
{
  "status": "error",
  "message": "Không tìm thấy tài khoản liên kết",
  "code": "SOCIAL_ACCOUNT_NOT_FOUND"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
}
```

## Mã lỗi

| Mã lỗi | Mô tả |
|--------|-------|
| `EMAIL_EXISTS` | Email đã được sử dụng |
| `INVALID_CREDENTIALS` | Email hoặc mật khẩu không chính xác |
| `INVALID_TOKEN` | Token không hợp lệ |
| `TOKEN_EXPIRED` | Token đã hết hạn |
| `TOKEN_MISSING` | Không tìm thấy token xác thực |
| `TOKEN_BLACKLISTED` | Token đã bị vô hiệu hóa |
| `USER_NOT_FOUND` | Không tìm thấy người dùng |
| `INVALID_CURRENT_PASSWORD` | Mật khẩu hiện tại không chính xác |
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ |
| `NOT_FOUND` | Route không tồn tại |
| `SOCIAL_ACCOUNT_NOT_FOUND` | Không tìm thấy tài khoản liên kết |
| `INTERNAL_SERVER_ERROR` | Lỗi server |

## Xử lý lỗi validation

Khi gửi dữ liệu không hợp lệ, API sẽ trả về lỗi với mã `VALIDATION_ERROR` và danh sách các lỗi cụ thể:

```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Mật khẩu phải có độ dài từ 6 đến 20 ký tự",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Tên phải có độ dài từ 2 đến 50 ký tự",
      "param": "name",
      "location": "body"
    }
  ]
}
```

## Quy tắc validation

| Trường | Quy tắc |
|--------|---------|
| `email` | Phải là email hợp lệ |
| `password` | Độ dài từ 6 đến 20 ký tự |
| `name` | Độ dài từ 2 đến 50 ký tự |
| `currentPassword` | Không được để trống |
| `newPassword` | Độ dài từ 6 đến 20 ký tự |
| `platform` | Phải là một trong: Facebook, Youtube, Tiktok |
| `socialId` | Không được để trống |
| `profileUrl` | Phải là URL hợp lệ |
| `accessToken` | Không được để trống |
| `refreshToken` | Không bắt buộc |

## Hướng dẫn sử dụng

1. **Đăng ký tài khoản**:
   - Gọi API `/auth/register` với email, password và tên
   - Lưu token nhận được để sử dụng cho các API khác

2. **Đăng nhập**:
   - Gọi API `/auth/login` với email và password
   - Lưu token nhận được để sử dụng cho các API khác

3. **Sử dụng token**:
   - Thêm token vào header `Authorization: Bearer <token>` cho các API cần xác thực
   - Nếu token hết hạn hoặc không hợp lệ, gọi API đăng nhập để lấy token mới

4. **Đăng xuất**:
   - Gọi API `/auth/logout` với token hiện tại
   - Token sẽ bị vô hiệu hóa và không thể sử dụng lại

5. **Đổi mật khẩu**:
   - Gọi API `/auth/change-password` với mật khẩu hiện tại và mật khẩu mới
   - Cần xác thực bằng token

6. **Lấy thông tin người dùng**:
   - Gọi API `/user/profile` để lấy thông tin người dùng
   - Cần xác thực bằng token

7. **Thêm/chỉnh sửa tài khoản liên kết**:
   - Gọi API `/user/social` với thông tin tài khoản mạng xã hội
   - Cần xác thực bằng token
   - Có thể sử dụng POST để thêm mới hoặc PUT để cập nhật

8. **Xóa tài khoản liên kết**:
   - Gọi API `/user/social/{platform}` với phương thức DELETE
   - Cần xác thực bằng token
   - Thay thế `{platform}` bằng tên nền tảng cần xóa (ví dụ: Facebook, Youtube)

## Ví dụ sử dụng với Axios

```javascript
// Cấu hình Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Đăng ký
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Đăng nhập
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Đăng xuất
const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    throw error.response.data;
  }
};

// Đổi mật khẩu
const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Lấy thông tin người dùng
const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Thêm/chỉnh sửa tài khoản liên kết
const updateSocialAccount = async (socialData) => {
  try {
    const response = await api.post('/user/social', socialData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Xóa tài khoản liên kết
const deleteSocialAccount = async (platform) => {
  try {
    const response = await api.delete(`/user/social/${platform}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

```

## YouTube API Integration

### Endpoints

#### Authentication
- `GET /api/v1/youtube/auth/url` - Lấy URL xác thực YouTube
  - Yêu cầu: Header Authorization (Bearer token)
  - Response: 
    ```json
    {
      "status": "success",
      "message": "Lấy URL xác thực thành công",
      "data": {
        "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
      }
    }
    ```

- `GET /api/v1/youtube/auth/callback` - Xử lý callback sau khi xác thực
  - Query params: code, state
  - Response:
    ```json
    {
      "status": "success",
      "message": "Liên kết tài khoản YouTube thành công",
      "data": {
        "channel": {
          "id": "channel_id",
          "title": "Channel Title",
          "description": "Channel Description",
          "thumbnail": "thumbnail_url"
        }
      }
    }
    ```

#### Video Upload
- `POST /api/v1/youtube/upload` - Upload video lên YouTube
  - Yêu cầu: 
    - Header Authorization (Bearer token)
    - Form data:
      - video: File video (max 100MB)
      - title: Tiêu đề video
      - description: Mô tả video
      - tags: Các tag phân cách bằng dấu phẩy
  - Response:
    ```json
    {
      "status": "success",
      "message": "Upload video thành công",
      "data": {
        "videoId": "video_id",
        "title": "Video Title",
        "description": "Video Description",
        "thumbnail": "thumbnail_url"
      }
    }
    ```

### Error Codes
- `AUTH_CODE_MISSING`: Không tìm thấy mã xác thực
- `YOUTUBE_CHANNEL_NOT_FOUND`: Không tìm thấy kênh YouTube
- `USER_NOT_FOUND`: Không tìm thấy người dùng
- `VIDEO_FILE_MISSING`: Không tìm thấy file video
- `YOUTUBE_ACCOUNT_NOT_LINKED`: Chưa liên kết tài khoản YouTube
- `INTERNAL_SERVER_ERROR`: Lỗi server