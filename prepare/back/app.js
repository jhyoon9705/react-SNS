const express = require('express');
const postRouter = require('./routes/post');
const app = express();
const db = require('./models');

db.sequelize.sync()
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(console.error);

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



app.listen(3065, () => {
  console.log('서버 실행 중')
});