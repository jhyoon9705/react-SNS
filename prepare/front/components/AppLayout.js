// 특정 컴포넌트끼리 공통인 것들
import React, { useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Menu, Input, Row, Col } from "antd";
import styled from "styled-components";
import UserProfile from "../components/UserProfile";
import LoginForm from "../components/LoginForm";
import { useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";

const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;

const Global = createGlobalStyle`
  .ant-row {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  .ant-col:first-child {
    padding-left: 0 !important;
  }

  .ant-col:last-child {
    padding-right: 0 !important;
  }
`;

const AppLayout = ({ children }) => {
  // isLoggedIn이 바뀌면 알아서 컴포넌트가 리렌더링
  const { isLoggedIn } = useSelector((state) => state.user);
  // const isLoggedIn = useSelector((state =? state.user.isLoggedIn)); 과 동일
  return (
    <div>
      <Global />
      <Menu mode="horizontal">
        <Menu.Item>
          <Link href="/">
            <a>노드버드</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/profile">
            <a>프로필</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <SearchInput style={{ verticalAlign: "middle" }} />
        </Menu.Item>
        <Menu.Item>
          <Link href="/signup">
            <a>회원가입</a>
          </Link>
        </Menu.Item>
      </Menu>
      <Row gutter={8}>
        {/* gutter는 column 사이의 간격 */}
        {/* xs: 모바일 / sm: 태블릿 / md: 작은 데스크탑 */}
        {/* 24가 max / 즉, n/24 */}
        <Col xs={24} md={6}>
          {isLoggedIn ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          {/* 새 창에서 보기는 target="_blank" / 보안상 문제 해결을 위해 rel */}
          <a
            href="https://github.com/jhyoon9705"
            target="_blank"
            rel="noreferrer noopener"
          >
            Made by jhyoon
          </a>
        </Col>
      </Row>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
