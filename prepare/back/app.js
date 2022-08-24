const express = require('express');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');
const db = require('./models');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan'); // 요청과 응답을 기록
const passportConfig = require('./passport');
const app = express();
const hpp = require('hpp');
const helmet = require('helmet');

dotenv.config();

db.sequelize.sync()
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(console.error);
  passportConfig(); // passport 설정 적용

  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(hpp());
    app.use(helmet());
  } else {
    app.use(morgan('dev'));
  }

  // middleware는 위에서 아래로, 왼쪽에서 오른쪽으로!
  app.use(morgan('dev')); // 프론트에서 백으로 요청을 보내면 어떤 요청을 보냈는지 기록이 뜸

  app.use('/', express.static(path.join(__dirname, 'uploads')));
  // directory name(현재폴더(back/)) + 'uploads' (운영체제에 따른 경로 구분자 다른 것을 해결)
  // '/'는 front의 Postform.js에서 지정한 경로(http://localhost:3065/)
  
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })); // 모든 요청 허용(CORS 문제 해결)
  // 위 코드 두줄은 다른 router들보다 위에 작성(코드 진행이 순차적임)
  app.use(express.json()); // 프론트에서 받은 데이터들을 req.body에 넣어줌
  app.use(express.urlencoded({extended: true})); // 프론트에서 받은 데이터들을 req.body에 넣어줌
  // 로그인을 하면 브라우저와 서버는 같은 정보를 가지고 있어야 함
  // 서버에서 로그인정보(비밀번호 등)을 브라우저로 보내면 보안상 위험하므로 쿠키를 대체하여 보내주고 쿠키를 저장(쿠키를 세션과 연결함)
  // 세선: 서버쪽이 쿠키와 로그인정보 등을 통째로 들고있는 것
  // 이때, 서버쪽에서는 메모리를 아끼기 위해 쿠키와 아이디(1)만을 저장해두고, 나중에 브라우저에서 쿠키를 보내면
  // db에서 데이터를 복구(1번 아이디를 갖고 있는 데이터를 가지고 옴)
  app.use(cookieParser('nodebirdsecret'));
  app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET, // 쿠키를 만들어내는 시크릿키(노출되면 안됨)
  }));
  app.use(passport.initialize());
  app.use(passport.session());

// 브라우저의 주소창에 입력하는 것은 GET 요청
app.get('/', (req, res) => {
  res.send('hello express');
})

app.get('/api', (req, res) => {
  res.send('hello api');
})

// app.get('/posts', (req, res) => {
//   res.json([
//     { id: 1, content: 'hello'},
//     { id: 2, content: 'hello2'},
//     { id: 3, content: 'hello3'},
//   ]);
// });

app.use('/post', postRouter); // post가 prefix
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

// 에러 처리 미들웨어가 내부적으로 이 위치에 존재
// (미들웨어는 위에서 아래로, 왼쪽에서 오른쪽으로 실행)
// 바꾸고 싶다면(ex. 에러 페이지를 따로 띄우기 등)
// app.user((err, req, res, next) => {
//  ...
//});
// 와 같이 작성 가능

app.listen(3065, () => {
  console.log('서버 실행 중')
});