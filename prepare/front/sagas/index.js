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

import {
  all,
  fork,
  call,
  put,
  take,
  takeEvery,
  takeLatest,
  throttle,
  delay,
} from "redux-saga/effects";
import axios from "axios";

// effect들 앞에 yield 키워드를 붙여주는 이유
// test 시에 편리 (한줄씩 실행하며 테스트가 가능)

function logInAPI(data) {
  return axios.post("/api/login", data);
}

function* logIn(action) {
  try {
    // // 나중에 서버 만들면 사용
    // const result = yield call(logInAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출
    // // fork와 call의 두 번째 인자부터는 매개변수 = loginAPI(action.data)

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

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
    //const result = yield call(logOutAPI); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

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
    // const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

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
  // while (true) { // while(true)가 없으면 1회용이 됨(한번 로그인 하면 watchLogIn이 없어짐)(동기)
  //   yield take("LOG_IN_REQUEST", logIn);
  // }

  // while(true) 대신에 takeEvery 사용 가능(비동기)
  // yield takeEvery("LOG_IN_REQUEST", logIn);

  // takeLatest는 여러번 눌렸을 시에 왼료되지 않은 작업들 중 마지막 클릭(요청)만 실행함(<->takeEvery)
  // 정확히는, 로딩중인 같은 요청을 취소하는 것이 아니라 서버로 부터 온 응답을 취소하는 것
  // 따라서 서버쪽에서 서버에 같은 데이터가 중복 저장되지 않았는지 확인이 필요함
  // 첫번째 클릭만 실행하려면 takeLeading 사용
  yield takeLatest("LOG_IN_REQUEST", logIn);

  // // 2초동안 LOG_IN_REQUEST는 딱 1번만 실행하도록 제한, DOS 공격 방지 가능
  // yield throttle("LOG_IN_REQUEST", logIn, 2000);
}

function* watchLogOut() {
  // while (true) {
  //   yield take("LOG_OUT_REQUEST", logOut);
  // }
  yield takeLatest("LOG_OUT_REQUEST", logOut);
}

function* watchAddPost() {
  // while (true) {
  //   yield take("ADD_POST_REQUEST", addPost);
  // }
  yield takeLatest("ADD_POST_REQUEST", addPost);
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

// cf) 쓰로틀링 vs 디바운싱 (블로그 참고하여 추후 대체)
