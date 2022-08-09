# react-SNS 
___

#### ※ Tech stack
 - **Front**: React, Next.js (+ Redux, Redux-saga (Redux-thunk))
 - **Back**:  
___
## [Front-end]

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

## Part 06. Redux-saga
### 1. Generator
- 중단점이 있는 함수(@ `yield`)

**예시)**
```js
const gen = function* () {
  console.log(1);
  yield;
  console.log(2);
  yield;
  console.log(3)
  yield 4;
}
```
```js
const generator = gen();

generator.next() // 1 출력
generator.next() // 2 출력
generator.next() // 3 출력, 4 return
generator.next() // return undefined, done: true
```

- 절대 멈추지 않는 generator
  - eventListener처럼 사용 가능

  ```js
  let i = 0;
  const gen = function*() {
    while(true) {
      yield  i++;
    }
  }
  const g = gen();
  -----
  g.next(); -> return value: 1
  g.next(); -> return value: 2
  g.next(); -> return value: 3
  ...
  ```

<br />

### 2. Saga effects
#### 1. all, take, fork, call, put
- `all`: 여러 saga들을 합쳐주는 역할을 하며, 배열을 받음
- `take`: 해당 action이 dispatch 되면 generator를 next함
- `fork`: 함수를 실행(비동기 함수를 호출), 두번째 인자부터는 매개변수로 사용
- `call`: 동기 함수를 호출, 두번째 인자부터는 매개변수로 사용
- `put`: 특정 action을 dispatch 시켜주며, 파라미터로는 action 객체가 들어감
```js
function logInAPI(data) {
  return axios.post("/api/login", data);
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data); 
    // fork와 call의 두 번째 인자부터는 매개변수 = loginAPI(action.data)
    // action.type에는 로그인 request가, action.data에는 로그인 data가 들어있음
    yield put({
      type: "LOG_IN_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_IN_FAILURE",
      data: err.response.data,
    });
  }
}

function* watchLogIn() {
  yield take("LOG_IN_REQUEST", logIn);
}

function* watchLogOut() {
  yield take("LOG_OUT_REQUEST", logOut);
}

function* watchAddPost() {
  yield take("ADD_POST_REQUEST", addPost);
}

// generator
export default function* rootSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchAddPost),
  ]);
}
```
<br />

#### 2. call과 fork의 차이
- `call`: 동기 함수를 호출(blocking)
- `fork`: 비동기 함수를 호출(non-blocking)

위(1) 코드의 login generator 가장 윗 줄의 코드를
```js
const result = yield call(logInAPI, action.data); 
```
처럼 `call`을 사용할 경우, `loginAPI`가 return할 때까지 기다려서 결과를 result에 넣어줌

<br />

반면, 다음과 같이 `fork`를 사용하여 작성할 경우,
```js
const result = yield fork(logInAPI, action.data); 
```
요청을 보낸 다음, 결과가 돌아오는 것과 상관 없이 바로 다음 코드가 실행됨(non-blocking) <br />
따라서 위(1)의 코드에서는 `call`을 사용해야 함

**참고)** saga의 effect들 앞에 `yield` 키워드를 붙여주는 이유 중 하나는, 한 줄씩 실행하며 테스트가 가능하기 때문에 테스트 코드를 이용하여 테스트 시에 편리함

<br />

#### 3. takeEvery, takeLatest, throttle
다음과 같이 `take`를 사용하여 작성할 경우,
```js
function* watchLogIn() {
  yield take("LOG_IN_REQUEST", logIn);
}
```
action을 캐치하여 함수를 실행시키지만, 한 번 실행된 후에는 실행할 수 없음(일회성) <br />
즉, 한 번 로그인 한 후에는 다시 로그인 요청을 보낼 수 없음

<br />

따라서 while문을 이용하여 다음과 같이 무한히 실행하도록 해야하는데,
```js
function* watchLogIn() {
  while(true) {
    yield take("LOG_IN_REQUEST", logIn);
  }
}
```
이를 **`takeEvery`** 를 사용하여 작성하면 다음과 같음
```js
function* watchLogIn() {
    yield takeEvery("LOG_IN_REQUEST", logIn);
}
```

<br />

만약 로그인 버튼이 여러 번 눌렸을 떄, 가장 마지막 요청만 dispatch 하고 싶다면 다음과 같이 **`takeLatest`** 를 사용
  - 완료된 요청은 놔두고, 동시에 로딩 중인 요청들에 대해서만 마지막 요청을 제외한 요청을 취소
  - 서버로의 요청을 취소하는 것이 아닌, 서버로부터 오는 응답을 취소하는 것임
  - 즉, 서버에는 데이터가 여러 개 저장될 수 있으므로 서버 쪽에서 반드시 같은 데이터가 여러 번 저장된 것이 아닌지 확인이 필요함

```js
function* watchLogIn() {
    yield takeLatest("LOG_IN_REQUEST", logIn);
}
```

<br />

**`takeLatest`** 가 잘못된 중복 클릭에 대한 요청이 아닌 응답을 취소하는 것과는 다르게 **`throttle`** 을 사용하면 요청에 제한을 둠(DOS 공격 방지 가능)
```js
function* watchLogIn() {
    yield throttle("LOG_IN_REQUEST", logIn, 10000);
}
```

<br />

서버를 만들기 전, **`delay`** 를 사용하여 서버 요청에 대한 비동기적인 효과를 줄 수 있음
```js
yield delay(1000);
```

<br />

#### 4. 디바운싱과 쓰로틀링
- **디바운싱(debouncing)** : 연속으로 호출되는 함수들 중에 마지막(또는 처음)에 호출되는 함수만 실행되도록 하는 것 <br />
  ex) 브라우저의 resize 이벤트는 브라우저의 크기를 변경하는 중에 계속해서 발생 -> 그때마다 내부 로직이 실행되면 성능 상의 문제 발생 -> 디바운싱 <br />
  ex) 검색 창 <br />
- **쓰로틀링(throttling)** : 마지막 함수가 호출된 후 일정 시간이 지나기 전에 다시 호출되지 않도록 하는 것 <br />
  ex) 스크롤링 <br />

<br />

#### 5. Workflow 예시(login)
a. id, password를 입력 후 로그인 버튼 클릭 <br />
b. `LoginForm.js` 내부의 `onSubmitForm()`에 의해 `loginRequestAction({ id, password })`가 실행(dispatch) <br />
c-1. `sagas\user.js`의 `watchLogIn()`에 걸려서 `logIn` generator가 실행 <br />
c-2. c-1과 동시에 `reducers\user.js`의 switch문 내부의 `LOG_IN_REQUEST`가 실행 <br />
d. `sagas\user.js`의 `logIn` generator 내부의  `yield delay(1000);`에 의해 1초 뒤에 `LOG_IN_SUCCESS`가 disptch <br />
e. `reducers\user.js`의 switch문 내부의 `LOG_IN_SUCCESS`가 실행 <br />
f. `me`에 데이터가 들어가면서 `isLoggedIn = true` 및 로그인 처리 <br />

___

## Part 07. Immer
- 구조가 복잡한 객체도 매우 쉽고 짧은 코드를 사용하여 불변성을 유지하면서 업데이트하는 것을 도와주는 라이브러리

**immer를 사용하지 않을 경우,** 객체의 구조가 깊어지면 코드가 복잡해짐
```js
const object = {
  somewhere: {
    deep: {
      inside: 3,
      array: [1, 2, 3, 4]
    },
    bar: 2,
  },
  foo: 1
};

// immer를 사용하지 않고, somewhere.deep.inside 값을 4로 바꾸기
let nextObject = {
  ...object,
  somewhere: {
    ...object.somewhere,
    deep: {
      ...object.somewhere.deep,
      inside: 4
    }
  }
};
```

**immer를 사용할 경우,** 스프레드 연산자(`...`)를 사용할 필요가 없고, 다음과 같이 매우 간단해짐
```js
// immer를 사용하여, somewhere.deep.inside 값을 4로 바꾸기
import produce from 'immer';
const nextObject = produce(object, draft => {
  // 바꾸고 싶은 값 바꾸기
  draft.somewhere.deep.inside = 4;
})

```
___

## Part 08. Infinite scrolling
- 컴포넌트가 마운트되면 `LOAD_POST_REQUEST`를 호출하도록 설정
```js
// pages\index.js
...
const Home = () => {
  ...
  useEffect(() => {
    dispatch({
      type: LOAD_POST_REQUEST
    })
  }, []);
  ...
}
```
- loadPost에 관련된 reducer 생성
```js
// reducers\post.js
const reducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case LOAD_POSTS_REQUEST:
        draft.loadPostsLoading = true;
        draft.loadPostsDone = false;
        draft.loadPostsError = null;
        break;

      case LOAD_POSTS_SUCCESS:
        draft.loadPostsLoading = false;
        draft.loadPostsDone = true;
        draft.mainPosts = action.data.concat(draft.mainPosts);
        draft.hasMorePosts = draft.mainPosts.length < 50;
        // hasMorePosts가 false면 새로운 post를 가져오려는 시도를 하지 않음
        // 즉, 여기서는 50개까지만 load
        break;

      case LOAD_POSTS_FAILURE:
        draft.loadPostsLoading = false;
        draft.loadPostsError = action.error;
        break;
      
      ...
```

- `LOAD_POST` saga를 생성
```js
// sagas\post.js
function loadPostsAPI(data) {
  return axios.get("/api/posts", data);
}

function* loadPosts(action) {
  try {
    yield delay(1000);
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: generateDummyPost(10),
    });
  } catch (err) {
    yield put({
      type: LOAD_POSTS_FAILURE,
      data: err.response.data,
    });
  }
}

...

function* watchLoadPosts() {
  yield throttle(5000, LOAD_POSTS_REQUEST, loadPosts);
  // throttle은 응답을 차단할 뿐, 요청 자체를 차단, 취소하지 못함
  // 따라서 loadPostsLoading이 LOAD_POST_REQUEST시에 true가 되었다가 SUCCESS하면 false가 되므로
  // loadPostsLoading이 false인 경우에만 LOAD_POST_REQUEST를 dispatch 하도록 함
  // (중복 Request 차단)
}
```

- 스크롤을 어느정도 끝까지 내렸을 때, 새로운 post들을 load 하기
  - `window.scrollY`: 얼마나 스크롤을 내렸는지 (a)
  - `document.documentElement.clientHeight`: 화면이 보이는 길이 (b)
  - `document.documentElement.scrollHeight`: 총 길이 (c)
  - **끝까지 내렸을 때: a + b = c**
  <br />
  - useEffect에서 addEventListener할 때에는 반드시 removeEventListner를 return해서 스크롤 했던 것을 해제

```js
// pages\index.js
useEffect(() => {
    function onScroll() {
       if (window.scrollY + document.documentElement.clientHeight 
        > document.documentElement.scrollHeight - 300) {
          // loadPostsLoading이 false인 경우에만 LOAD_POST_REQUEST를 dispatch 하도록 함
        if (hasMorePosts && !loadPostsLoading) {
          dispatch({
            type: LOAD_POSTS_REQUEST,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading]);
  ```

참고) 계속된 스크롤로 메모리가 찰 경우(모바일의 경우에 데스크탑보다 쉽게 참)를 대비해서 react-virtualized를 사용
  - react-virtualized: 화면에는 3-4개의 post밖에 띄우지 못하므로, 3-4개의 post만 화면에 그려주고 나머지는 메모리에 저장시킴

___
## [Back-end]
## Part 09. Running the server with node.js
### 1. 프론트 서버와 백 서버를 나누는 이유
- 앱의 규모가 커졌을 떄를 대비하기 위함
- 서버(컴퓨터) 하나에 프론트, 백 서버를 모두 두는 경우
  - 프론트는 SSR을, 백은 API를 제공
  - 프론트와 백엔드의 요청량이 비대칭일 경우(ex. 프론트는 1초에 1000, 백은 1초에 10)
  - 메모리나 CPU 부족하면 스케일링(Scaling)을 하게 됨(서버를 통째로 즉, 프론트와 백을  함께 복사 → 프론트의 1000만큼의 요청을 2대의 컴퓨터가 나누어 받음)
  - 쓸데없는 백엔드 서버까지 복사하게 되므로 공간 낭비 발생
  - 따라서, 대규모 서비스의 경우 각 기능별로 서버를 나누어주는 경우가 많음
  
<br />

### 2. 서버 실행 기본 코드
```js
// back\app.js
// node app.js로 실행
const http = require('http');
const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  res.write('Hello node1'); // 내부에 html도 작성 가능
  res.write('Hello node2');
  res.end('Hello node3');
})
server.listen(3065, () => {
  console.log('서버 실행 중')
});
```

- 서버 실행 후, `localhost:3065` 접속 시 `Hello node1Hello node2Hello node3` 출력
- `req`: 브라우저나 프론트 서버에서 온 요청에 대한 정보
- `res`: 응답에 대한 정보
<br />
- 프론트 서버나 브라우저가 요청을 1회 보내면, 서버에서 응답 1회가 필수
- 서버가 응답을 안 보낼 경우, 특정 시간 후에 브라우저가 자동으로 '응답 실패'로 처리 
- 여러 개의 데이터가 필요한 경우
  - 1회 요청을 보냈을 때, 여러 개의 데이터를 묶어서 한번에 보내거나
  - 요청을 여러 번 보내서, 응답을 여러 번 받음
  - 요청 1회에 응답을 2회 이상 보내면 안됨

___

## Part 10. Routing with express
### 0. REST API (Representational State Transfer API)
- REST?
- 자원의 이름으로 구분하여 해당 자원의 상태(정보)를 주고 받는 모든 것을 의미
- 즉, 자원(resource)의 표현(representation)에 의한 상태 전달
- A. 자원의 표현
  - ex) DB의 학생 정보가 자원일 때, 'student'를 자원의 표현으로 정함
- B. 상태(정보) 전달
  - 데이터가 요청되어지는 시점에 자원의 상태(정보)를 전달
  - JSON 혹은 XML을 통해 데이터를 주고 받는 것이 일반적
- HTTP URL을 통해 자원을 명시하고 HTTP Method(POST, GET, etc.)를 통해 해당 자원에 대한 CRUD Opertation을 적용하는 것을 의미
- CRUD Operation
  - Create: 생성(POST)
  - READ: 조회(GET)
  - Update: 수정(PUT)
  - Delete: 삭제(DELETE)
  - header 정보 조회: (HEAD)
- REST가 필요한 이유
  - 애플리케이션 분리 및 통합
  - 다양한 클라이언트의 등장

<br />

- REST API?
- REST 기반으로 서비스 API를 구현하는 것

### 1. Express
#### 1. Express 기본 코드
- 브라우저의 주소창에 입력하는 것은 `GET` 요청
- `res.send`: 문자열로 응답
- `res.json`: json 객체로 응답

```js
const express = require('express');

const app = express();

// localhost:3065/api -> hello api 응답
app.get('/api', (req, res) => {
  res.send('hello api');
})

// localhost:3065/api/posts -> 아래의 객체로 응답
app.get('/api/posts', (req, res) => {
  res.json([
    { id: 1, content: 'hello'},
    { id: 2, content: 'hello2'},
    { id: 3, content: 'hello3'},
  ]);
});

app.listen(3065, () => {
  console.log('서버 실행 중')
});
```

<br />

#### 2. Express로 라우터 분리하기
- 공통되는 주소들은 `routes` 폴더 안에 하나의 파일로 분리
- 공통 부분은 제거하고, 그 부분을 `app.js` 파일에서 `.use()`로 prefix 설정 및 사용
```js
// routes\post.js
const express = require('express');

const router = express.Router();
router.post('/', (req, res) => { // POST /post
  res.json({id: 1, content: 'hello'});
});

router.delete('/', (req, res) => { // DELETE /post
  res.json({id: 1});
});

module.exports = router;
```

```js
// back\app.js
const postRouter = require('./routes/post');
...
app.use('/post', postRouter); // post가 prefix
```
___

## Part 11. Sequelize
### 1. Sequelize란?
- DB 작업을 쉽게 할 수 있도록 도와주는 ORM 라이브러리
  - ORM(Object-Releational Mapping): js 객체와 RDB를 서로 연결해주는 도구

### 2. Sequelize 설치하기
#### 1. 패키지 설치
> npm i sequelize sequelize-cli mysql3
> npx sequelize init // sequelize 세팅

#### 2. 비밀번호, DB 이름, port 번호 설정
- config\config.json 내부에 mysql 비밀번호 입력
```js
"development": {
    "username": "root",
    "password": "mypassword", // here
    "database": "react-SNS", // here
    "host": "127.0.0.1",
    "port": "3306", // here (mysql port)
    "dialect": "mysql"
  },
```

#### 3. `models/index.js` 파일 수정
```js
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 배포 시에는 'production', 개발 시에는 'development'
const config = require('../config/config')[env]; // config\config.json 파일에서 development 부분을 가져옴
const db = {};

// sequelize가 node와 mysql을 연결해줌
const sequelize = new Sequelize(config.database, config.username, config.password, config);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```


___
##### ※ 해당 repository의 code는 '인프런 - [리뉴얼] React로 NodeBird SNS 만들기' 강좌를 참조하여 작성하였습니다.