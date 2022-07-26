# react-SNS 
___

#### ※ Tech stack
 - **Front**: React, Next.js (+ Redux, Redux-saga (Redux-thunk))
 - **Back**:  
___

## Part 01. Screen Configuration
### 1. Grid system
&nbsp;: '**24 / n**열'로 계산하여 적용
- xs(extra-small): 0~600px / 모바일
- sm(small): 600~960px / 태블릿
- md(medium): 960~1280px / 작은 데스크탑
- lg(large): 1280~1920px
- xl(extra-large): 1920px~
```js
// 예시
// 0~600px 화면에서는 2열로, 600~960px 화면에서는 4열로... 배치
<Grid item xs={12} sm={6} md={4} lg={3}>
  ...
</ Grid>
```
<br />

### 2. 링크를 새창에서 열기(a tag)
- `target` 속성
  - `_blank`: 새 창이나 새 탭에서 열기
  - `_self`: 햔재 프레임(frame)에서 페이지 열기(default)
  - `_parent`: 부모 프레임(frame)에서 페이지 열기
  - `_top`: 현재 창에서 full window로 페이지 열기
<br />
- **`_blank` 사용 시 주의할 점**
: 보안 상의 문제를 해결하기 위해 `rel="noreferrer noopener` 속성을 추가해주어야 함
  > 참고) 링크된 페이지의 js에서 window.opener로 부모 window의 object에 접근해서 'window.opener.location = 새로운 URL'로 부모 window URL을 바꿀 경우, 보안 상의 문제 발생

<br />

### 3. style 객체로 인한 리렌더링 문제
- React는 리렌더링 시, Virtual-DOM으로 달라진 부분을 검사하다가 return 부분에서 달라진 부분이 있을 경우, 그 부분만 다시 그림
- 태그 안에 객체 형태로 style을 설정할 경우, 리렌더링할 때 다른 객체로 인식하므로 해당 태그부터 내부까지 불필요하게 리렌더링되는 상황이 발생함
  > {} === {} : false
  ```js
  <div style={{marginTop: 10}}>
    ...
  </div>
  ```
- 따라서, styled-component 또는 useMemo 등의 사용으로 객체의 불변성을 유지해주어야 함
  ```js
  // styled-component 예시
  import styled from "styled-components";
  ...
  const ButtonWrapper = styled.div`
  margin-top: 10px;
  `;
  ...
  <FormWrapper> 
    ... 
  </FormWrapper>
  
  ```
  ```js
  // useMemo(:값을 caching) 예시
  import { useMemo } from 'react';

  // 리렌더링되어도 style 객체는 계속 같은 객체로 유지
  const style = useMemo(() => ({marginTop: 10}), []);
  ...
  <div style={style}>
    ...
  </div>
  ```

<br />

### 4. 여러 pages들에서 공통되는 부분 분리하기
- pages 폴더 안에 `_app.js` 파일을 생성하여 처리
- pages/index.js의 return 부분이 Component로 들어가게 됨 (_app.js가 index.js의 부모)
- cf) 특정 컴포넌트(↔ 페이지)끼리 공통인 것들은 layout component를 만들어서 개별 컴포넌트를 감싸면 됨
- `head`를 수정할 경우, `next`에서 제공하는 `<Head>` 컴포넌트를 이용
```js
// 예시 (pages/_app.js)
import PropTypes from "prop-types";
import Head from "next/head";
import "antd/dist/antd.css";

const NodeBird = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>reactSNS</title>
      </Head>
      <Component />
    </>
  );
};

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default NodeBird;
```
___
##### ※ 해당 repository의 code는 '인프런 - [리뉴얼] React로 NodeBird SNS 만들기' 강좌를 참조하여 작성하였습니다.