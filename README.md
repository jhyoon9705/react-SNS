# react-SNS 
___

#### ※ Tech stack
 - **Front**: React, Next.js (+ Redux, Redux-saga (Redux-thunk))
 - **Back**:  
___

## Part 01. Screen Configuration (+ Custom hook)
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
- **`_blank` 사용 시 주의할 점:**  보안 상의 문제를 해결하기 위해 `rel="noreferrer noopener` 속성을 추가해주어야 함
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

<br />

### 5. 커스텀 훅(Custom hook)
다음과 같은 코드가 있는 경우
```js
const [nickname, setNickname] = useState('');
const onChangeNickname = useCallback((e) => {
  setNickname(e.target.value);
}, []);

const [id, setId] = useState('');
const onChangeId = useCallback((e) => {
  setId(e.target.value);
}, []);

const [password, setPassword] = useState('');
const onChangePassword = useCallback((e) => {
  setPassword(e.target.value);
}, []);
```
중복되는 코드가 너무 많음. 따라서 custom hook으로 만들어주면 편리해짐

```js
// hooks/useInput.js
import { useState, useCallback } from "react";

export default (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler]; // 배열에 setValue도 추가하여 추가적으로 반환 가능
};
```
위와 같이 커스텀 훅을 만들고, 다음과 같이 사용함
```js
const [nickname, setNickname] = useInput('');
const [id, onChangeId] = useInput('');
const [password, onChangePassword] = useInput('');
```

___

## Part 02. Apply redux/middleware/redux-devtools
### 1. Redux-devtools-extension
- redux history 기록 용도로 사용하며, 개발모드일때만 사용하도록 설정하는 것이 좋음(Chrome 개발자 도구 호환)
- `npm i redux-devtools-extension` 필요
<br />

### 2. next-redux-wrapper
: Next.js에 redux를 간편하게 붙이도록 도와주는 라이브러리
```js
// store/configureStore.js
// next-redux-wrapper를 사용
import { createWrapper } from "next-redux-wrapper";
import { createStore, applyMiddleware, compose } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "../reducers";

const configureStore = () => {
  const middlewares = []; // saga 또는 thunk 도입 시, 이 배열 안에 삽입
  const enhancer =
    process.env.NODE_ENV === "production"
      ? compose(applyMiddleware(...middlewares)) // 배포용 미들웨어
      : composeWithDevTools(applyMiddleware(...middlewares)); // 개발용 미들웨어
  const store = createStore(reducer, enhancer);
  return store;
};

const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === "development", 
  // debug: true일 경우, 개발 시에 redux에 관한 자세한 설명을 확인 가능
});

export default wrapper;
```
이를 `pages/_app.js`에 가져와서, 아래와 같이 high-order 컴포넌트로 감싸줌
```js
import wrapper from "../store/configureStore";
...
export default wrapper.withRedux(NodeBird);
```
또한, Next.js에서는 `<Provider store={store}>...</Provider>`처럼 Provider로 감싸주지 않음 (next@6부터는 알아서 `Provider`로 감싸줌)

<br />

### 3. Redux
#### 3-1. Redux의 개념
**`store`** 에 있는 데이터들을
```js
// store 예시
{
  name: 'jhyoon9705'
  age: '26',
  password: 'abc1234',
}
```
아래와 같은 **`action`** 들을 **`dispatch`** 하여 조작함
```js
{
  type: 'CHANGE_PASSWORD' // type은 action의 이름
  data: '9876zyx',
}
```
그러나 js는 'CHANGE_PASSWORD'이 무엇인지 알지 못하기 때문에 **`reducer`** 에서 정의해주어야 함
```js
// reducer 예시 
// cf) (이전 상태, 액션) => 다음 상태
switch (action.type) {
  case 'CHANGE_PASSWORD':
    return {
      ...state,
      password: action.data,
      posts: [{}, {}, {}],
    }
}
```

#### 3-2. 불변성(Immutability)
```js
{} === {} // false
const a = {};
const b = a;
a=== b // true
```
- `reducer`에서 return할 때, **객체 자체는 새로 만들어서** return함
    - **Why?** : 객체를 새로 만들어야 변경 내역이 추적이 가능 (덮어써버리면 이전 기록을 확인할 수 없음
    - Redux 사용의 주요 목적 중 하나는 'data 변경의 history 관리'
- spread 연산자(`...`)를 사용하는 이유
    - 코드 길이 줄이기
    - 메모리 절약(바뀌지 않는 항목들은 참조 관계를 유지 / 어차피 새로운 객체이기 때문에 둘이 다르다는 것을 redux가 인식함)
    ```js
    // A code (spread 연산자 사용 X)
    return {
      name: 'jhyoon9705',
      age: 26,
      password: action.data,
      posts: [{}, {}, {}], // 바뀔 때 마다 객체 생성(메모리 소모)
    }

    // B code (spread 연산자 사용 O)
    return {
      ...state,
      password: action.data,
      posts: [{}, {}, {}], // 계속 유지가 되는 경우 참조 관계를 유지
    }
    ```

#### 3-3. Action creator
- 모든 변경 상황에 대하여 모든 action들을 매번 만들어주기는 어려움
- 따라서, **동적으로 action을 만들어주는 함수**를 만들어서 사용
  ```js
  // action creator 예시
  const changeNickname = (data) => {
    return {
      type: 'CHANGE_NICKNAME',
      data,
    }
  }
    ```
- nickname을 'simpson'으로 바꾸고 싶을 경우 다음과 같이 사용
  ```js
  store.dispatch(changeNickname('simpson'));
  ```


___



##### ※ 해당 repository의 code는 '인프런 - [리뉴얼] React로 NodeBird SNS 만들기' 강좌를 참조하여 작성하였습니다.