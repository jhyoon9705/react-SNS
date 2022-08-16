const express = require('express');

const { Post } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    })
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }  
});

router.post('/:postId/comment', isLoggedIn, async (req, res) => { // 바뀌는 부분: parameter
  try {
    // 존재하지 않는 게시글에 댓글을 다는 것을 방지(악성 사용자 방지)
    const post = await Post.findOne({
      where: { id: req.params.postId } 
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: req.params.postId,
      UserId: req.user.id,
    })
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }  
});

router.delete('/', (req, res) => {
  res.json({id: 1});
});

module.exports = router;