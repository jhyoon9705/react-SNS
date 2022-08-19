import React, { useEffect } from "react";
import axios from 'axios';
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { useSelector, useDispatch } from "react-redux";
import { END } from 'redux-saga';
import wrapper from '../store/configureStore';

const Home = () => {
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
  const dispatch = useDispatch();

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // 렌더링 전 데이터 불러오는 부분을 가장 먼저 하기
  // SSR을 위해 아래 getServerSideProps 안으로...
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_MY_INFO_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_POSTS_REQUEST,
  //   });
  // }, []);

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

// Home보다 먼저 실행
export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req, res }) => {
  // 서버 쪽에서 실행되면 store.req가 존재
  const cookie = req ? req.headers.cookie : '';

  // 프론트 서버에서 쿠키가 공유되는 문제 주의!
  axios.defaults.headers.Cookie = '';
  // if(서버일 때 && 쿠키가 있을 때에만) 사용자의 쿠키를 넣어줌. 아니면 쿠키를 지움
  if (req && cookie) { // 조건문이 없으면 다른 사람이 요청을 보냈을 때도 사용자(나)의 쿠키가 들어갈 수 있음
    axios.defaults.headers.Cookie = cookie;
  }
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  store.dispatch(END);
  await store.sagaTask.toPromise();
});
// 위 dispatch가 실행되면 실행된 결과를 HYDRATE로 보내줌

export default Home;
