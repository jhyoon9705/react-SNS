// 모든 페이지(pages)에서 모두 공통인 것들
import PropTypes from "prop-types";
import Head from "next/head"; // 공통 head 부분을 바꾸고 싶을 경우 import하여 사용 (ex. 문서 제목 etc)
import "antd/dist/antd.css";

import wrapper from "../store/configureStore";

// next@6부터는 redux 사용 시 Provider로 감싸주지 않아도 됨(<Provider store={store}>)
const NodeBird = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>NodeBird</title>
      </Head>
      <Component />
    </>
  );
};

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(NodeBird);
