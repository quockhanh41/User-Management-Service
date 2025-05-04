const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const socialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ["facebook", "youtube", "tiktok"]
  },
  profileUrl: {
    type: String,
    required: true
  },
  socialId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: false
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ"
      ]
    },
    password: {
      type: String,
      required: true,
      // select: true // Thay đổi thành true để luôn select password
    },
    name: {
      type: String,
      required: [true, "Tên không được để trống"],
      trim: true,
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [50, "Tên không được vượt quá 50 ký tự"]
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    socialAccounts: [socialAccountSchema]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });

// Virtual để lấy id dưới dạng UUID
userSchema.virtual("id").get(function () {
  return this._id;
});

// Phương thức toJSON để chuyển đổi _id thành id
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.password; // Xóa password khỏi response
  return obj;
};


const User = mongoose.model("User", userSchema);

module.exports = User;
