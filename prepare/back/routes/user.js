const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User, Post, Image, Comment } = require('../models'); // db.User
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize'); 

const router = express.Router();

router.get('/', async(req, res, next) => {
  try {
    if (req.user) { // 사용자가 있는 경우에만 보내줌
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes:
        {
          exclude: ['password'],
        },
        include: [{
          model: Post, 
          attributes: ['id'], // 로그인 정보 불러올 떄에는 id만 불러와서 숫자만 새면 됨
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      })
    res.status(200).json(fullUserWithoutPassword);
  } else { // 사용자가 없으면 안 보내줌
    res.status(200).json(null);
  }
  } catch(error) {
    console.error(error);
    next(error);
  }  
});

// err, user, info는 done()의 인자
router.post('/login', isNotLoggedIn, (req, res, next) => { // 미들웨어 확장(req, res, next를 사용하기 위함)
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => { // passport 로그인
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: //['id', 'nickname', 'email'], // 원하는 정보만 보냄
        {
          exclude: ['password'], // 원하는 정보만 보내지 않음
        },
        include: [{ // 포함시키기
          model: Post, // models\user.js에서 관계설정 한 모델들
          // hasMany라서 model:Post가 복수형이 되어 me.Posts가 됨
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followings', // 모델에서 as를 썼으면 include 할 때에도 as를 써줘야 함
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      })
      return res.status(200).json(fullUserWithoutPassword); // 로그인 완료, 사용자 정보를 프론트로 넘겨줌
    })
  })(req, res, next);
});

router.post('/', isNotLoggedIn, async (req, res, next) => { // POST /user/
  try {
    const exUser = await User.findOne({ // 이메일 중복검사 (없으면 exUser = null)
      where: { // 조건
        email: req.body.email,
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용 중인 아이디입니다.'); // 상태코드와 데이터 전송
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // 10~13, 높을수록 강한 암호화, 시간 증가
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    })
    res.status(201).send('회원가입 OK'); // async, await가 없으면 이 코드가 먼저 실행될 수 있음
  } catch {
    console.error(error);
    next(error); // status 500
  }
 
});

router.post('/logout', isLoggedIn, (req, res) => { // passport@0.6, 콜백함수를 제공하고 그 안에서 응답
  req.logout((err) => {
    req.session.destroy();
    if (err) {
      res.redirect("/");
    } else {
      res.send('Logout OK');
    }
  });
});

router.get('/followers', isLoggedIn, async (req, res, next) => { // GET /user/followers
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('존재하지 않는 사용자입니다.')
    }
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.get('/followings', isLoggedIn, async (req, res, next) => { // GET /user/followings
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('존재하지 않는 사용자입니다.')
    }
    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({
      nickname: req.body.nickname, // 무엇을
    }, {
      where: { id: req.user.id } // 누구것(어느것)
    });
    res.status(200).json({nickname: req.body.nickname});
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// 팔로워 차단(차단시킬 사람이 나를 언팔로우 하도록)
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('존재하지 않는 사용자는 차단할 수 없습니다.')
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('존재하지 않는 사용자는 팔로우 할 수 없습니다.')
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => { // DELETE /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('존재하지 않는 사용자는 언팔로우 할 수 없습니다.')
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.get('/:userId/posts', async(req, res, next) => {
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
      where.id = { [Op.lt] : parseInt(req.query.lastId, 10) }; // id가 lastId보다 작은 것
    }
    const posts = await Post.findAll({
      where,
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
      }, {
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      },
    ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
  
});

module.exports = router;