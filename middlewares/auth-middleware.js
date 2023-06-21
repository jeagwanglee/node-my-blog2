const jwt = require('jsonwebtoken');
const User = require('../schemas/user.js');

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? '').split(' ');

  if (authType !== 'Bearer' || !authToken) {
    return res.status(400).json({ errorMessage: '로그인 후에 이용할 수 있는 기능입니다.' });
  }

  try {
    const { userId } = jwt.verify(authToken, 'secret-key');
    const user = await User.findById(userId);
    res.locals.user = user;
    next();
  } catch (error) {
    console.error(err);
    res.status(401).send({ errorMessage: '로그인 후 이용 가능한 기능입니다.' });
    return;
  }
};
