const passport = require('passport');
const local = require('./local');
const {User} = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => { // user: req.login()의 user
    done(null, user.id);
  });

  // 로그인을 성공한 후, 그 다음 요청부터 id로 DB로부터 사용자 정보를 복구해냄
  passport.deserializeUser(async (id, done) => {
    try{
      const user = await User.findOne({ where: {id}});
      done(null, user); // 사용자 정보를 복구하여 req.user에 넣어줌
    } catch(error) {
      console.error(error);
      done(error);
    }
    
  });

  local();
};