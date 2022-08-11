const express = require('express');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const app = express();
const db = require('./models');
const cors = require('cors');

db.sequelize.sync()
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(console.error);

  app.use(cors({
    origin: '*',
    credentials: true,
  })); // 모든 요청 허용(CORS 문제 해결)
  // 위 코드 두줄은 다른 router들보다 위에 작성(코드 진행이 순차적임)
  app.use(express.json()); // 프론트에서 받은 데이터들을 req.body에 넣어줌
  app.use(express.urlencoded({extended: true})); // 프론트에서 받은 데이터들을 req.body에 넣어줌

// 브라우저의 주소창에 입력하는 것은 GET 요청
app.get('/', (req, res) => {
  res.send('hello express');
})

app.get('/api', (req, res) => {
  res.send('hello api');
})

app.get('/api/posts', (req, res) => {
  res.json([
    { id: 1, content: 'hello'},
    { id: 2, content: 'hello2'},
    { id: 3, content: 'hello3'},
  ]);
});

app.use('/post', postRouter); // post가 prefix
app.use('/user', userRouter);



app.listen(3065, () => {
  console.log('서버 실행 중')
});