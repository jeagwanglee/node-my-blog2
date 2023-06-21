const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../schemas/user.js');

// 로그인 API

router.post('/', async (req, res) => {
  try {
    //닉네임, 비밀번호를 request에서 전달받기
    const { nickname, password } = req.body;

    const user = await User.findOne({ nickname });

    // 해당하는 유저가 존재하지 않는 경우
    if (!user || password !== user.password) {
      res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    } else {
      //로그인 성공 시, 로그인에 성공한 유저의 정보를 JWT를 활용하여 클라이언트에게 Cookie로 전달하기
      const token = jwt.sign({ userId: user.userId }, 'secret-key');
      res.cookie('Authorization', `Bearer ${token}`);
      res.status(200).json({ token });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
  }
});

module.exports = router;
