const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Comment, User, Image } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.')
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({ // 컴퓨터 하드디스크(추후에 s3 클라우드 storage로 변경)
    destination(req, file, done) {
      done(null, 'uploads'); // uploads라는 폴더에 저장
    },
    filename(req, file, done) { // ex) photo.png
      const ext = path.extname(file.originalname); // 확장자 추출 (ex. .png)
      const basename = path.basename(file.originalname, ext) // ex) photo
      done(null, basename + '_' + new Date().getTime() + ext); // ex) photo2022081722150213.png
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB (서버에 너무 큰 용량 들어가는 것을 방지)
});
router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
// input 하나(image)에서 여러개 올릴 때: array
// 하나 올릴 때: single
// 이미지 안 올리고 텍스트, json...: none()

  console.log(req.files);
  res.json(req.files.map((v) => v.filename));
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (req.body.image) { // 이미지를 올린 경우
      if (Array.isArray(req.body.image)) { // 이미지를 여러 개 올리면 [1.png, 2.png]
        const images = await Promise.all(req.body.image.map((image) => Image.create({src: image})));
        await post.addImages(images);
      } else { // 이미지를 하나만 올리면 1.png
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
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