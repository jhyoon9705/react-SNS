const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User, Post } = require('../models'); // db.User
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

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
        }, {
          model: User,
          as: 'Followings', // 모델에서 as를 썼으면 include 할 때에도 as를 써줘야 함
        }, {
          model: User,
          as: 'Followers',
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

module.exports = router;