const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 배포 시에는 'production', 개발 시에는 'development'
const config = require('../config/config')[env]; // config\config.json 파일에서 development 부분을 가져옴
const db = {};

// sequelize가 node와 mysql을 연결해줌
const sequelize = new Sequelize(config.database, config.username, config.password, config);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
