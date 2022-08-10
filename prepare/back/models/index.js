const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 배포 시에는 'production', 개발 시에는 'development'
const config = require('../config/config')[env]; // config\config.json 파일에서 development 부분을 가져옴
const db = {};

// sequelize가 node와 mysql을 연결해줌
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// 다음과 같이 실행하면 테이블이 만들어짐
db.Comment = require('./comment')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);

// 반복문 돌면서 associate 관계를 연결
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// sequelize에 모델들이 모두 등록 완료

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
