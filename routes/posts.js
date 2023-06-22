const express = require('express');
const router = express.Router();
const Post = require('../schemas/post.js');
const authMiddleware = require('../middlewares/auth-middleware.js');

//  1. 게시글 작성 POST
// 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능
// 제목, 작성 내용을 입력하기

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId, nickname } = res.locals.user;

    if (!title || !content) {
      res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else if (typeof title !== 'string') {
      res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
    } else if (typeof content !== 'string') {
      res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
    } else {
      const post = new Post({ userId, nickname, title, content });
      await post.save();
      res.status(200).json({ message: '게시글 작성에 성공했습니다.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({
      message: '게시글 작성에 실패했습니다.',
    });
  }
});

// 2. 게시글 전체 목록 조회 GET
// 제목, 작성자명(nickname), 작성 날짜를 조회하기
// 작성 날짜 기준으로 내림차순 정렬하기
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    const data = posts.map((post) => {
      return {
        postId: post._id,
        userId: post.userId,
        nickname: post.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });
    return res.json({ posts: data });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({
      errorMessage: '게시글 조회에 실패했습니다.',
    });
  }
});

// 3. 게시글 상세 조회 GET
// 제목, 작성자명(nickname), 작성 날짜, 작성 내용을 조회하기
router.get('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const post = await Post.find({ _id: _postId });

    if (post.length === 1) {
      const [result] = post.map((post) => {
        const { _id: postId, userId, nickname, title, content, createdAt, updatedAt } = post;
        return {
          postId,
          userId,
          nickname,
          title,
          content,
          createdAt,
          updatedAt,
        };
      });
      res.status(200).json({ result });
    } else {
      res.status(400).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 게시글 수정 PUT
router.put('/:_postId', authMiddleware, async (req, res) => {
  try {
    const { _postId } = req.params;
    const { title, content } = req.body;
    const existPost = await Post.find({ _id: _postId });

    if (!title || !content) {
      res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else if (typeof title !== 'string') {
      res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
    } else if (typeof content !== 'string') {
      res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
    } else if (existPost.length === 0) {
      return res.status(404).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    } else {
      try {
        await Post.updateOne({ _id: _postId }, { $set: { title, content } });
        res.status(200).json({ message: '게시글을 수정하였습니다.' });
      } catch (error) {
        res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' });
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '게시글 수정에 실패했습니다.' });
  }
});

// 게시글 삭제 DELETE
router.delete('/:_postId', authMiddleware, async (req, res) => {
  try {
    const { _postId } = req.params;
    const post = await Post.find({ _id: _postId });

    // 게시글이 존재하지 않을 경우 404
    if (post.length === 0) {
      return res.status(404).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    } else {
      try {
        await Post.deleteOne({ _id: _postId });
        res.status(200).json({ message: '게시글을 삭제하였습니다.' });
      } catch (error) {
        res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '게시글 삭제에 실패했습니다.' });
  }
});

module.exports = router;
