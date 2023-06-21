const express = require('express');
const router = express.Router();
const Comment = require('../schemas/comment.js');

//  POST 댓글 생성
router.post('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const { user, password, content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: '댓글 내용을 입력해주세요.',
      });
    }

    await Comment.create({ postId: _postId, user, password, content });
    res.status(200).json({ message: '댓글을 생성하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 2. 댓글 목록 조회 GET
router.get('/:_postId', async (req, res) => {
  try {
    const { _postId } = req.params;
    const comments = await Comment.find({ postId: _postId }); // 객체의 배열을 할당한다.
    const data = comments.map((comment) => {
      const { _id: commentId, user, content, createdAt } = comment;
      return {
        commentId,
        user,
        content,
        createdAt,
      };
    });
    res.json({ data });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

// // 게시글 수정 PUT
router.put('/:_commentId', async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password, content } = req.body;
    const [comment] = await Comment.find({ _id: _commentId });

    if (!content) {
      return res.status(400).json({
        message: '댓글 내용을 입력해주세요.',
      });
    }
    // commentId에 해당하는 댓글이 없을 경우 404
    if (!comment) {
      return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }

    await Comment.updateOne({ _id: _commentId }, { $set: { content } });

    res.status(200).json({ message: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 게시글 삭제 DELETE
router.delete('/:_commentId', async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password } = req.body;

    const comment = await Comment.find({ _id: _commentId }); // post가 배열로 반환됨.
    if (comment.length === 0) {
      return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }

    await Comment.deleteOne({ _id: _commentId });
    res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }

  //   if (password !== post[0].password) {
  //     return res.status(400).json({ success: false, errorMessage: '비밀번호가 틀렸습니다.' });
  //   }
});

module.exports = router;
