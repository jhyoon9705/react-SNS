const express = require('express');

const { Post, Comment, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    const fullPost = await Post.findOne({ // 그냥 post를 저장하면 content, UserId 밖에 없음
      where: { id: post.id },
      include : [{
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User, // 댓글 작성자
        }]
      }, {
        model: User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }]
    })
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }  
});

router.post('/:postId/comment', isLoggedIn, async(req, res, next) => { // 바뀌는 부분: parameter
  try {
    // 존재하지 않는 게시글에 댓글을 다는 것을 방지(악성 사용자 방지)
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    })
    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }],
    })
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }  
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res) => {
  try {
    await Post.destroy({ // destroy: 제거할 떄 사용 @sequelize
      where: { 
        id: req.params.postId,
        UserId: req.user.id, // 내가 쓴 게시글일 경우만 삭제 가능
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;