const express = require('express');
const connect = require('./schemas');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

connect();

app.use(express.json()); //요청 본문(body)의 내용을 파싱하여 js객체로(json형태로) 변환
app.use(cookieParser());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('정상 연결');
});

app.listen(port, () => {
  console.log(port, '포트로 서버 열림!');
});
