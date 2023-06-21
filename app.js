const express = require('express');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');

const connect = require('./schemas');
connect();

app.use(express.json()); //요청 본문(body)의 내용을 파싱하여 js객체로(json형태로) 변환

app.use('/posts', postsRouter);

app.use('/comments', commentsRouter);

app.get('/', (req, res) => {
  res.send('정상 연결');
  //   res.json({ result: 'complete' });
});

app.listen(port, () => {
  console.log(port, '포트로 서버 열림!');
});
