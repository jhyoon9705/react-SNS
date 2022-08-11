const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // db.User
const router = express.Router();

router.post('/', async (req, res, next) => { // POST /user/
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

module.exports.router;