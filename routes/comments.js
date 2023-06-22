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
        updatedAt: item.updatedAt,
      };
    });
    res.json({ comments: result });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

// 댓글 수정 PUT
router.put('/:_commentId', authMiddleware, async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { comment } = req.body;
    const { nickname } = res.locals.user;
    const [targetComment] = await Comment.find({ _id: _commentId });

    //# 403 댓글의 수정 권한이 존재하지 않는 경우  (로그인한 유저와 댓글 작성자가 일치해야 함.)
    if (nickname !== targetComment.nickname) {
      res.status(403).json({ message: '댓글의 수정 권한이 존재하지 않습니다.' });
    } else if (!comment) {
      res.status(412).json({ message: '댓글 내용을 입력해주세요.' });
    } else if (!targetComment) {
      res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
    } else {
      try {
        await Comment.updateOne({ _id: _commentId }, { $set: { comment } });
        res.status(200).json({ message: '댓글을 수정하였습니다.' });
      } catch (error) {
        res.status(400).json({ errorMessage: '댓글 수정이 정상적으로 처리되지 않았습니다.' });
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
});

// 댓글 삭제 DELETE
router.delete('/:_commentId', authMiddleware, async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { nickname } = res.locals.user;
    const [targetComment] = await Comment.find({ _id: _commentId });
    const [post] = await Post.find({ _id: targetComment.postId });

    if (!post) {
      res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    } else if (nickname !== targetComment.nickname) {
      res.status(403).json({ message: '댓글의 삭제 권한이 존재하지 않습니다.' });
    } else if (!targetComment) {
      res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
    } else {
      try {
        await Comment.deleteOne({ _id: _commentId });
        res.status(200).json({ errorMessage: '댓글을 삭제하였습니다.' });
      } catch (error) {
        res.status(400).json({ errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.' });
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;
