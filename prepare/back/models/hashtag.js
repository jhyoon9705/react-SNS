module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define('Hashtag', { // mysql에는 자동으로 소문자, 복수화되어 users 테이블 생성
    // id는 mysql에서 자동으로 1,2,3,...으로 기본 삽입됨
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  }, { // 두번째 객체는 모델에 대한 setting
    charset: 'utf8mb4', // 한글 사용
    collate: 'utf8mb4_general_ci' // 한글 사용
  });
  Hashtag.associate = (db) => {
    db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' }); // 다대다 관계
    // belongsToMany는 ex) PostHashtag라는 별도의 테이블이 생기고,
    // HastagId와 PostId 컬럼이 생성
  };

  return Hashtag;
}