const express = require('express');
const router = express.Router();
const Comment = require('../schemas/comment.js');
const Post = require('../schemas/post.js');
const authMiddleware = require('../middlewares/auth-middleware.js');

//  POST 댓글 생성
// 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
// 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post('/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const { userId, nickname } = res.locals.user;
    const post = await Post.find({ _id: postId });

    if (post.length === 0) {
      res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    } else if (!comment) {
      return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else {
      await Comment.create({ postId, userId, nickname, comment });
      res.status(200).json({ message: '댓글을 작성하였습니다.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// 2. 댓글 목록 조회 GET
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.find({ _id: postId });
    const comments = await Comment.find({ postId });

    if (post.length === 0) {
      res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
      return;
    }
    const result = comments.map((item) => {
      return {
        commentId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        comment: item.comment,
        createdAt: item.createdAt,
      };
    });
    res.json({ comments: result });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
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
      return res.status(404).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
    }

    await Comment.updateOne({ _id: _commentId }, { $set: { content } });

    res.status(200).json({ message: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 게시글 삭제 DELETE
router.delete('/:_commentId', async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password } = req.body;

    const comment = await Comment.find({ _id: _commentId }); // post가 배열로 반환됨.
    if (comment.length === 0) {
      return res.status(404).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
    }

    await Comment.deleteOne({ _id: _commentId });
    res.status(200).json({ errorMessage: '댓글을 삭제하였습니다.' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }

  //   if (password !== post[0].password) {
  //     return res.status(400).json({ success: false, errorMessage: '비밀번호가 틀렸습니다.' });
  //   }
});

module.exports = router;
