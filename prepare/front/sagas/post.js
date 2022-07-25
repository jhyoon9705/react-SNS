import { all, fork, put, takeLatest, delay, throttle } from "redux-saga/effects";
import axios from "axios";
import {
  ADD_POST_REQUEST,
  ADD_POST_SUCCESS,
  ADD_POST_FAILURE,
  ADD_COMMENT_REQUEST,
  ADD_COMMENT_SUCCESS,
  ADD_COMMENT_FAILURE,
  REMOVE_POST_FAILURE,
  REMOVE_POST_REQUEST,
  REMOVE_POST_SUCCESS,
  LOAD_POSTS_REQUEST,
  LOAD_POSTS_SUCCESS,
  LOAD_POSTS_FAILURE,
  generateDummyPost
} from "../reducers/post";
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from "../reducers/user";
import shortId from "shortid";

function loadPostsAPI(data) {
  return axios.get("/api/posts", data);
}

function* loadPosts(action) {
  try {
    // const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
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

function addPostAPI(data) {
  return axios.post("/api/post", data);
}

function* addPost(action) {
  try {
    // const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

    const id = shortId.generate();
    yield put({
      type: ADD_POST_SUCCESS,
      data: {
        id, 
        content: action.data,
      }
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: id,
    });
  } catch (err) {
    yield put({
      type: ADD_POST_FAILURE,
      data: err.response.data,
    });
  }
}

function removePostAPI(data) {
  return axios.delete("/api/post", data);
}

function* removePost(action) {
  try {
    // const result = yield call(addPostAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

    yield put({
      type: REMOVE_POST_SUCCESS,
      data: action.data,
    });
    yield put({
      type: REMOVE_POST_OF_ME,
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: REMOVE_POST_FAILURE,
      data: err.response.data,
    });
  }
}

function addCommentAPI(data) {
  return axios.post(`/api/post/${data.postId}/comment`, data);
}

function* addComment(action) {
  try {
    // const result = yield call(addPCommentAPI, action.data); // fork를 쓰면 비동기, call은 동기 함수 호출

    // 서버 만들기 전 (for dev), delay effect로 비동기적인 효과 사용
    yield delay(1000);

    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: action.data,
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

function* watchRemovePost() {
  // while (true) {
  //   yield take("ADD_POST_REQUEST", addPost);
  // }
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

function* watchLoadPosts() {
  yield throttle(5000, LOAD_POSTS_REQUEST, loadPosts);
  // 응답을 차단할 뿐, 요청 자체를 차단하지 못함
  // 따라서 loadPostsLoading이 LOAD_POST_REQUEST시에 true가 되었다가 SUCCESS하면 FALSE가 되므로
  // loadPostsLoading이 FALSE인 경우에만 LOAD_POST_REQUEST를 dispatch 하도록 함(중복 Request 차단)
}

export default function* postSaga() {
  yield all([
    fork(watchAddPost),
    fork(watchAddComment), 
    fork(watchRemovePost), 
    fork(watchLoadPosts)
  ]);
}
