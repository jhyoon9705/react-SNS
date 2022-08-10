module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', { // mysql에는 자동으로 소문자, 복수화되어 users 테이블 생성
    // id는 mysql에서 자동으로 1,2,3,...으로 기본 삽입됨
    content: {
      type: DataTypes.TEXT, // 글자 수 무제한
      allowNull: false,
    },
  }, { // 두번째 객체는 모델에 대한 setting
    charset: 'utf8mb4', // 한글 사용
    collate: 'utf8mb4_general_ci' // 한글 사용
  });
  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User); // Comment User에 속해있음
    db.Comment.belongsTo(db.Post);
    // belongsTo는 Comment 테이블에 UserId, PostId라는 column을 만들어줌 
    // ex) UserId: 1 => 1번 User가 단 Comment
    // ex) PostId: 3 => 3번 Post에 달린 Comment
  };

  return Comment;
}