import { all, fork, put, takeLatest, delay } from "redux-saga/effects";
import axios from "axios";
import {
  ADD_POST_REQUEST,
  ADD_POST_SUCCESS,
  ADD_POST_FAILURE,
  ADD_COMMENT_REQUEST,
  ADD_COMMENT_SUCCESS,
  ADD_COMMENT_FAILURE,
} from "../reducers/post";

function addPostAPI(data) {
  return axios.post("/api/post", data);
}

function* addPost() {
  try {
    // const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: ADD_POST_FAILURE,
      data: err.response.data,
    });
  }
}

function addCommentAPI(data) {
  return axios.post(`/api/post/${data.postId}/comment`, data);
}

function* addComment() {
  try {
    // const result = yield call(addPCommentAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: ADD_COMMENT_FAILURE,
      data: err.response.data,
    });
  }
}

function* watchAddPost() {
  // while (true) {
  //   yield take("ADD_POST_REQUEST", addPost);
  // }
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

export default function* postSaga() {
  yield all([fork(watchAddPost), fork(watchAddComment)]);
}
