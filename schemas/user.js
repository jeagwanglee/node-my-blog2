const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// 가상의 userId 값을 할당
userSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});

// user 정보를 JSON으로 형변환 할 때 virtual 값이 출력되도록 설정
userSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('User', userSchema);
