const express = require('express');

const { Post, User, Image, Comment } = require('../models');

const router = express.Router();

// 여러 포스트 가져오기
router.get('/', async(req, res, next) => {
  try {
    const posts = await Post.findAll({
      limit: 10, // 10개만 가져오기 
      //offset: 0, // 0+1부터 limit개(offset 방식은 데이터 변경으로 인해 꼬일 수 있으므로 잘 안씀, 대신 lastId)
      order:  [['createdAt', 'DESC'], // 최신 것부터 내림차순으로 가져오기
               [Comment, 'createdAt', 'DESC'] // 다음으로 댓글은 댓글들의 생성일 내림차순으로 정렬
      ], 
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }]
      }, {
        model: User,
        as: 'Likers',
        attributes: ['id'],
      }],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
  
});

module.exports = router;