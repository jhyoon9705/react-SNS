const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrpyt');
const { User } = require('../models');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', // req.body.email
    passwordField: 'password', // req.body.password
  }, async (email, password, done) => {
    try {
      const user = await User.fineOne({
        where: { email } // = {email: email}
      });
      if (!user) {
        return done(null, flase, { reason: '존재하지 않는 사용자입니다.'}); // done(서버 에러, 성공, 클라이언트 에러(보내는 측에서 잘못보낸것))
      }
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        return done(null, user); // 성공에 사용자 정보를 넘갸줌
      }
      return done(null, false, { return: '비밀번호가 틀렸습니다.'});
    } catch (error) {
      console.error(error);
      return done(error);
    }
    
  }));
}