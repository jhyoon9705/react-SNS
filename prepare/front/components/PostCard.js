import React, { useState, useCallback } from "react";
import { Card, Popover, Button, Avatar, List, Comment } from "antd";
import {
  RetweetOutlined,
  HeartOutlined,
  MessageOutlined,
  EllipsisOutlined,
  HeartTwoTone,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import PostImages from "./PostImages";
import CommentForm from "./CommentForm";
import PostCardContent from "./PostCardContent";
import { REMOVE_POST_REQUEST, LIKE_POST_REQUEST, UNLIKE_POST_REQUEST } from "../reducers/post";
import FollowButton from './FollowButton';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const onLike = useCallback(() => {
    dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  }, []);
  const onUnlike = useCallback(() => {
    dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  }, []);
  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, []);
  const onRemovePost = useCallback(() => {
    dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  }, []);

  const { me } = useSelector((state) => state.user);
  const id = me && me.id;
  // me.id가 있으면 해당 값이 id에 들어가고, 없으면 undefined
  // const id = me?.id; 도 가능(optional chaining / 있는지 없는지 의심이 되는 부분에서 사용)
  const liked = post.Likers.find((v) => v.id === id);

  return (
    <div style={{ marginBottom: 20 }}>
      <Card
        cover={post.Images[0] && <PostImages images={post.Images} />}
        actions={[
          // 배열 안에 jsx를 넣을 때는 key값을 할당하여야 함
          <RetweetOutlined key="retweet" />,
          liked ? (
            <HeartTwoTone
              twoToneColor="#eb2f96"
              key="heart"
              onClick={onUnlike}
            />
          ) : (
            <HeartOutlined key="heart" onClick={onLike} />
          ),
          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover
            key="more"
            content={
              <Button.Group>
                {id && post.User.id === id ? (
                  <>
                    <Button>수정</Button>
                    <Button type="danger" onClick={onRemovePost} loading={removePostLoading}>삭제</Button>
                  </>
                ) : (
                  <Button>신고</Button>
                )}
              </Button.Group>
            }
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
        extra={id && <FollowButton post={post} />}
      >
        <Card.Meta
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={<PostCardContent postData={post.content} />}
        />
      </Card>
      {commentFormOpened && (
        <div>
          <CommentForm post={post} />
          <List
            header={`${post.Comments.length}개의 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Avatar>{item.User.nickname[0]}</Avatar>}
                  content={item.content}
                />
              </li>
            )}
          />
        </div>
      )}
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};
export default PostCard;
