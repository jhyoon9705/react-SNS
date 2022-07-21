// generator 예시 (중단점이 있는 함수)
// const gen = function* () {
//   console.log(1);
//   yield;
//   console.log(2);
//   yield;
//   console.log(3);
//   yield 4;
// }
// const generator = gen();
// -----
// generator.next() -> 1 출력
// generator.next() -> 2 출력
// generator.next() -> 3 출력 (return value: 4)
// generator.next() -> undefined

// 절대 멈추지 않는 generator / eventListener처럼 활용 가능
// let i = 0;
// const gen = function*() {
//   while(true) {
//     yield  i++;
//   }
// }
// const g = gen();
// -----
// g.next(); -> return value: 1
// g.next(); -> return value: 2
// g.next(); -> return value: 3
// ...

import { all, fork, call, put, take } from "redux-saga/effects";
import axios from "axios";

// effect들 앞에 yield 키워드를 붙여주는 이유
// test 시에 편리 (한줄씩 실행하며 테스트가 가능)

function logInAPI(data) {
  return axios.post("/api/login", data);
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출
    // fork와 call의 두 번째 인자부터는 매개변수 = loginAPI(action.data)
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

function logOutAPI() {
  return axios.post("/api/logout");
}

function* logOut() {
  try {
    const result = yield call(logOutAPI); // fork를 쓰면 비동기, call은 동기 함수 호출
    yield put({
      type: "LOG_OUT_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_OUT_FAILURE",
      data: err.response.data,
    });
  }
}

function addPostAPI(data) {
  return axios.post("/api/post", data);
}

function* addPost() {
  try {
    const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출
    yield put({
      type: "ADD_POST_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "ADD_POST_FAILURE",
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
  // all: 배열 안에 있는 것들을 한번에 실행
  yield all([
    // fork: 함수를 실행 (비동기 함수 호출)
    // <-> call: 동기 함수 호출
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchAddPost),
  ]);
}
