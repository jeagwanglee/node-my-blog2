const express = require('express');
const router = express.Router();
const User = require('../schemas/user.js');
const pattern = /^[a-zA-Z0-9]+$/;

// 회원가입 API
router.post('/signup', async (req, res) => {
  try {
    const { nickname, password, confirm } = req.body;

    const existUser = await User.find({ nickname });

    // 닉네임 형식 (3자이상, 알파벳 대소문자, 숫자로 구성하기 (이미 존재하는 닉네임과 중복되면 안됨)
    // 문자열 형식 검사
    if (nickname.length < 3 || !pattern.test(nickname)) {
      return res.status(412).json({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
    }
    // 비밀번호 일치 확인
    if (password !== confirm) {
      return res.status(412).json({ errorMessage: '패스워드가 일치하지 않습니다.' });
    }

    // 비번 형식이 일치하는지 (4자 이상
    if (password.length < 4) {
      return res.status(412).json({ errorMessage: '패스워드 형식이 일치하지 않습니다.' });
    }
    // 패스워드에 닉네임 포함
    if (password.includes(nickname)) {
      return res.status(412).json({ errorMessage: '패스워드에 닉네임이 포함되어 있습니다.' });
    }

    // 닉네임 중복 (이미 DB에 존재하는 닉네임)
    if (existUser.length) {
      return res.status(412).json({ errorMessage: '중복된 닉네임입니다.' });
    }

    // DB에 회원 저장
    const user = new User({ nickname, password });
    await user.save();

    res.status(201).json({ message: '회원가입에 성공하였습니다.' });
  } catch (error) {
    // 예외 케이스에서 처리 못한 에러 catch

    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
  }
});

module.exports = router;
