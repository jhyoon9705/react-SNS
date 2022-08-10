module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', { // mysql에는 자동으로 소문자, 복수화되어 users 테이블 생성
    // id는 mysql에서 자동으로 1,2,3,...으로 기본 삽입됨
    src: {
      type: DataTypes.STRING(200), // 글자 수 무제한
      allowNull: false,
    },
  }, { // 두번째 객체는 모델에 대한 setting
    charset: 'utf8', // 한글 사용
    collate: 'utf8_general_ci' // 한글 사용
  });
  Image.associate = (db) => {
    db.Image.belongsTo(db.Post);
  };

  return Image;
}