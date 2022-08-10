module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', { // mysql에는 자동으로 소문자, 복수화되어 users 테이블 생성
    // id는 mysql에서 자동으로 1,2,3,...으로 기본 삽입됨
    content: {
      type: DataTypes.TEXT, // 글자 수 무제한
      allowNull: false,
    },
  }, { // 두번째 객체는 모델에 대한 setting
    charset: 'utf8mb4', // 한글 사용, mb4는 이모티콘 포함
    collate: 'utf8mb4_general_ci' // 한글 사용
  });
  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // Post는 User에 속해있음
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsTo(db.Post, { as: 'Retweet'}); // 리트윗 PostId가 아닌 RetweetId가 생성
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag'}); // 다대다 관계
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); // 게시글과 사용자의 좋아요 관계, as로 구별(별칭)
    // cf) 일대일관계: hasOne => User.hasOne(UserInfo), UserInfo.belongsTo(User) / belongsTo쪽에 id가 생김
  };

  return Post;
}