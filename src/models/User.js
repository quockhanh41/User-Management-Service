const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: true // Thay đổi thành true để luôn select password
    },
    name: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
      {
    timestamps: true, // Tự động thêm created_at và updated_at
    versionKey: false, // Không thêm trường __v
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
