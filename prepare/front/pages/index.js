import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { useSelector, useDispatch } from "react-redux";

const Home = () => {
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
  const dispatch = useDispatch();

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });
    dispatch({
      type: LOAD_POSTS_REQUEST,
    });
  }, []);

  // 스크롤을 어느정도 끝까지 내렸을 때, 새로운 post들을 load하기
  // useEffect에서 addEventListener할 때에는 반드시 removeEventListner를 return해서 스크롤 했던 것을 해제
  // 그렇지 않으면 메모리에 쌓이게 됨
  useEffect(() => {
    function onScroll() {
      // console.log(
      //   // 얼마나 스크롤을 내렸는지, 화면이 보이는 길이, 총 길이
      //   // 끝까지 내렸을 때: window.scrollY + document.documentElement.clientHeight 
      //   // = document.documentElement.scrollHeight
      // window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight
      // );
      if (window.scrollY + document.documentElement.clientHeight 
        > document.documentElement.scrollHeight - 300) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
          // 계속된 스크롤로 메모리가 찰 경우(모바일의 경우에 데스크탑보다 쉽게 참)를 대비해서
          // react-virtualized를 사용
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);
  
  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

export default Home;
