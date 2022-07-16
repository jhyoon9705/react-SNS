import React from "react";
import AppLayout from "../components/AppLayout";
import Head from "next/head";

import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

const Profile = () => {
  const followerList = [
    { nickname: "abc123" },
    { nickname: "zzanggu" },
    { nickname: "nodebird" },
  ];
  const followingList = [
    { nickname: "abc123" },
    { nickname: "zzanggu" },
    { nickname: "nodebird" },
  ];

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉 목록" data={followingList} />
        <FollowList header="팔로워 목록" data={followerList} />
      </AppLayout>
    </>
  );
};

export default Profile;
