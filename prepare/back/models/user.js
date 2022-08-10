module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', { // mysql에는 자동으로 소문자, 복수화되어 users 테이블 생성
    // id는 mysql에서 자동으로 1,2,3,...으로 기본 삽입됨
    email: {
      type: DataTypes.STRING(30), // 이메일 타입 검사는 js로, db에서는 기본적인 검사 수행(STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME, ...)
      allowNull: false, // 필수 여부(false: 필수)
      unique: true, // 고유한 값(중복 불가)
    },
    nickname: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100), // 비밀번호는 암호화하므로 길이를 넉넉하게
      allowNull: false,
    },
  }, { // 두번째 객체는 모델에 대한 setting
    charset: 'utf8', // 한글 사용
    collate: 'utf8_general_ci' // 한글 사용
  });
  User.associate = (db) => {
    db.User.hasMany(db.Post); // User는 여러 개의 Post를 가질 수 있음
    db.User.hasMany(db.Comment); // User는 여러 개의 Comment 가질 수 있음
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); // 사용자와 게시글의 좋아요 관계, 중간 테이블의 이름 설정할 수 있음(반대쪽도 똑같이)
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'FollowingId'});
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'FollowerId'}); // 자동으로 아이디 만들어줄 때, userId가 중복되므로 foreignKey 필요
  }; // 테이블 간의 관계 ex) user가 작성한 comment

  return User;
}