const express = require('express');
const router = express.Router();
const Post = require('../schemas/post.js');

//  1. 게시글 작성 POST
router.post('/', async (req, res) => {
  try {
    const { user, password, title, content } = req.body;
    await Post.create({ user, password, title, content });
    res.status(200).json({ message: '게시글을 생성하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({
      message: '데이터 형식이 올바르지 않습니다.',
    });
  }
});

// 2. 게시글 전체 목록 조회 GET
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({}); // 객체의 배열을 할당한다.
    const data = posts.map((post) => {
      const { _id: postId, user, title, createdAt } = post;
      return {
        postId,
        user,
        title,
        createdAt,
      };
    });
    return res.json({ data });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});

// 3. 게시글 상세 조회 GET
router.get('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const post = await Post.find({ _id: _postId });

    const [data] = post.map((post) => {
      const { _id: postId, user, title, content, createdAt } = post;
      return {
        postId,
        user,
        title,
        content,
        createdAt,
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 게시글 수정 PUT
router.put('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password, user, title, content } = req.body;

    const existPost = await Post.find({ _id: _postId });
    if (existPost.length === 0) {
      return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
    }

    await Post.updateOne({ _id: _postId }, { $set: { user, title, content } });
    res.status(200).json({ message: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }

  // if (password !== existPost[0].password) {
  //   return res.status(400).json({ success: false, errorMessage: '비밀번호가 틀렸습니다.' });
  // }
});

// 게시글 삭제 DELETE
router.delete('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password } = req.body;
    const post = await Post.find({ _id: _postId }); // post가 배열로 반환됨.

    // 게시글이 존재하지 않을 경우 404
    if (post.length === 0) {
      return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
    }

    await Post.deleteOne({ _id: _postId });
    res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }

  // if (password !== post[0].password) {
  //   return res.status(400).json({ success: false, errorMessage: '비밀번호가 틀렸습니다.' });
  // }
});

module.exports = router;
