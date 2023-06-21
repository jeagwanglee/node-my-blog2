const express = require('express');
const router = express.Router();

const postsRouter = require('./posts.js');
const commentsRouter = require('./comments.js');
const usersRouter = require('../routes/users.js');

router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/users', usersRouter);

module.exports = router;
