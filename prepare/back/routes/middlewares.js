exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { // passport에서 isAuthenticated() 제공
    next(); // 괄호 안에 내용이 있으면 에러처리, 없으면 다음 미들웨어로...
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('로그인하지 않은 사용자만 접근이 가능합니다.');
  }
}