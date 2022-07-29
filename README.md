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

### 4. 여러 page들에서 공통되는 부분 분리하기
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

## Part 03. Split reducers
- `reducers/index.js` 파일이 너무 길어지면 코드 가독성이 떨어짐
- initialState의 항목별로 reducer를 나누어주는 것이 좋음 (ex. user, post, ...)
- 나눈 뒤, `index.js`에서 각각 import하여 redux의 `combineReducers`를 사용하여 합쳐줌
```js
// reducers/index.js
const rootReducer = combineReducers({
  // SSR을 위한 HYDRATE 추가를 하기 위해 index reducer를 추가
  index: (state = {}, action) => {
    switch (action.type) {
      case HYDRATE:
        return { ...state, ...action.payload };

      default:
        return state;
    }
  },
  user,
  post,
});

export default rootReducer;
```
- user의 initialState와 post의 initialState는 `combineReducers`에 의해 알아서 합쳐서 넣어줌
  - 즉, `index.js`에는 initialState가 존재하지 않음

___

## Part 04. Implementation with dummy data
### 1. Optional chaining (`?.`)
- 만약 아래와 같이 코드를 작성한다면 `me`가 존재하지 않을 수도 있기 때문에 불러오지 못한다면 undefined 에러가 발생함
  ```js
  const { me } = useSelector((state) => state.user);
  const id = me.id;
  ```
- 따라서 다음과 같은 형태로 `me`가 있으면 `me.id`가 id에 들어가고, 없으면 id 값을 undefined로 정의함
  ```js
  const { me } = useSelector((state) => state.user);
  const id = me && me.id;
  ```
- 위 코드를 **optional chaining**을 적용하면
  ```js
  const { me } = useSelector((state) => state.user);
  const id = me?.id;
  ```
  또는
  ```js
  const { id } = useSelector((state) => state.user.me?.id);
  ```
<br />

### 2. 배열 렌더링
#### 2-1. key
- `key`는 React가 어떤 항목을 변경, 추가, 삭제할지 식별하는 것을 도와줌
- 배열을 렌더링할 때는 `key`라는 props를 설정해야함
  - `key` 값이 있으면, 배열이 변경되었을 때, 변경된 요소만 리렌더링(즉, 수정되지 않는 기존의 값은 그대로 두고 원하는 곳에 내용을 삽입하거나 삭제)
  - `key` 값이 없으면, 중간 값이 바뀌었을 때, 그 하위 값들이 전부 변하여 모두 리렌더링

#### 2-2. 변화하는 배열의 index를 key로 사용하면 안되는 이유
- 배열이 요소 추가, 삭제, 변경 등으로 변화할 경우, 배열이 새로 바뀌게 되면서 컴포넌트가 리렌더링 됨
- 이때 index가 요소들에 새로 mapping 되는데, React는 `key`가 동일할 경우 동일한 DOM element를 보여주기 때문에 문제가 발생

#### 2-3. key 값 설정
- 요소가 추가, 삭제 등으로 배열이 변화하더라도 변하지 않는 unique한 값을 `key` 값으로 사용
  - 서버에서 받아온 DB의 AUTO_INCREMENT된 값
  - shortid 패키지 사용하여 생성된 랜덤한 값
  - etc.

<br />

### 3. styled-component의 최소화
- styled-component 안에 자손선택자(`&`)를 사용하여 styled-component의 수를 최소화 할 수 있음
```js
const Header = styled.header`
  height: 44px;
  background: white;
  position: relative;
  padding: 0;
  text-align: center;

  & h1 {
    margin: 0;
    font-size: 17px;
    color: #333;
    line-height: 44px;
  }

  & button {
    position: absolute;
    right: 0;
    top: 0;
    padding: 15px;
    line-height: 14px;
    cursor: pointer;
  }
`;

...
  <Header>
    <h1>상세 이미지</h1>
    <button onClick={onClose}>X</button>
  </Header>
...

```

<br />

### 4. styled-component의 Global style
- 애플리케이션 레벨에서 전체적으로 적용하고 싶은 속성이 있을 경우(또는 기존 스타일이 덮어써짐), styled-component의 `createGlobalStyle`을 사용
```js
const Global = createGlobalStyle`
  .ant-row {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
`;

...
return (
    <div>
      <Global /> // 아무데나 넣어주면 됨
      <Menu mode="horizontal">
        <Menu.Item>
        ...
);
```

<br />

### 5. Component 폴더
- style 설정 등으로 인해 코드가 너무 길어지면 가독성이 좋지 않음
- 따라서 컴포넌트 이름의 파일을 하나 만들고(`components\imagesZoom`), `index.js`와 `styles.js`을 만들어서 `index.js`에는 일반적인 코드를, `styles.js`에는 style들을 export하여 작성

※ 이 repository의 `component\imagesZoom` 참고
___

## Part 05. Redux-thunk
### 1. Redux-thunk
- Redux가 **비동기 action**을 dispatch할 수 있도록 도와주는 역할(middleware)
- thunk는 '지연'의 의미
- 일반적인 redux와 달리, action 대신에 **함수를 return하는 action creator**를 작성하는 것을 허용
```js
const INCREMENT_COUNTER = 'INCREMENT_COUNTER'

// 일반적인 action creator (동기 action creator)
function increment() {
  return {
    type: INCREMENT_COUNTER
  }
}

// 함수를 return하는 action creator (비동기 action creator)
  // incrementAsync를 호출하기 전까지는 return 부분이 실행되지 않음
function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment())
    }, 1000)
  }
}
```
- 비동기 action creator의 장점
  - 하나의 action에서 dispatch를 여러 번 하는 것이 가능
  - 하나의 비동기 action에 여러 개의 동기 action을 dispatch 할 수 있음

  <br />

### 2. Custom middleware
- middleware는 삼단함수로 작성
- 예시: action을 실행하기 전에 console에 log를 찍어주는 middleware
  ```js
  const loggerMiddleware = ({ dispatch, getState }) => (next) => (action) => {
    console.log(action);
    return next(action);
  }
  ```

<br />

### 3. 비동기 요청에서의 REQUEST/SUCCESS/FAILURE
- 원칙적으로 비동기 요청은 `request`, `success`, `failure` 3단계로 구성함
```js
export const loginAction = (data) => {
  return (dispatch, getState) => {
    const state = getState(); // combineReducers안에 있는 initialState 반환
    dispatch(loginRequestAction());
    axios
      .post("/api/login")
      .then((res) => {
        dispatch(loginSuccessAction(res.data));
      })
      .catch((err) => {
        dispatch(loginFailureAction(err));
      });
  };
};

// 아래 action-generator 6개는 redux-thunk용 
// 각 요청마다 3개(request, success, failure) 3개씩
export const loginRequestAction = (data) => {
  return {
    type: "LOG_IN_REQUEST",
    data,
  };
};

export const loginSuccessAction = (data) => {
  return {
    type: "LOG_IN_SUCCESS",
    data,
  };
};

export const loginFailureAction = (data) => {
  return {
    type: "LOG_IN_FAILURE",
    data,
  };
};
```  


___
##### ※ 해당 repository의 code는 '인프런 - [리뉴얼] React로 NodeBird SNS 만들기' 강좌를 참조하여 작성하였습니다.