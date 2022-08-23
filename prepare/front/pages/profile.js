import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { END } from 'redux-saga';
import Router from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import axios from 'axios';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';
import AppLayout from '../components/AppLayout';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

const Profile = () => {
  // const followerList = [
  //   { nickname: 'abc123' },
  //   { nickname: 'zzanggu' },
  //   { nickname: 'nodebird' },
  // ];
  // const followingList = [
  //   { nickname: 'abc123' },
  //   { nickname: 'zzanggu' },
  //   { nickname: 'nodebird' },
  // ];

  const fetcher = (url) => axios.get(url, { withCredentials: true }).then((result) => result.data);

  // const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const [followingsLimit, setFollowingsLimit] = useState(3);
  const [followersLimit, setFollowersLimit] = useState(3);

  // 둘 다 없으면 로딩중, 둘 중 하나만 있으면 성공 또는 실패
  const { data: followersData, error: followerError } = useSWR(`http://localhost:3065/user/followers?limit={followersLimit}`, fetcher);
  const { data: followingsData, error: followingError } = useSWR(`http://localhost:3065/user/followers?limit={followingsLimit}`, fetcher);

  // SWR로 대체
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   });
  // }, []);

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   });
  // }, []);
  
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  if (!me) {
    return '내 정보 로딩중...';
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로잉/ 팔로워 로딩 중 에러가 발생합니다.</div>;
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
        <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
  console.log('getServerSideProps start');
  console.log(req.headers);
  const cookie = req ? req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  store.dispatch(END);
  console.log('getServerSideProps end');
  await store.sagaTask.toPromise();
});

export default Profile;
