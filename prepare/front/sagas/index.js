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

import { all, fork } from "redux-saga/effects";
import axios from 'axios';

import postSaga from "./post";
import userSaga from "./user";

axios.defaults.baseURL = 'http://localhost:3065'; // 공통 부분 묶기
axios.defaults.withCredentials = true;

// generator
export default function* rootSaga() {
  // all: 배열 안에 있는 것들을 한번에 실행
  yield all([
    // fork: 함수를 실행 (비동기 함수 호출)
    // <-> call: 동기 함수 호출
    fork(postSaga),
    fork(userSaga),
  ]);
}

// cf) 쓰로틀링 vs 디바운싱 (블로그 참고하여 추후 대체)
