import produce from 'immer';

export const initialState = {
  loadMyInfoLoading: false, // 유저 정보 가져오기 시도중
  loadMyInfoDone: false,
  loadMyInfoError: null,
  followLoading: false, // 팔로우 시도중
  followComplete: false,
  followError: null,
  unfollowLoading: false, // 언팔로우 시도중
  unfollowComplete: false,
  unfollowError: null,
  logInLoading: false, // 로그인 시도중
  logInComplete: false,
  logInError: null,
  logOutLoading: false, // 로그아웃 시도중
  logOutDone: false,
  logOutError: null,
  signUpLoading: false, // 회원가입 시도중
  signUpDone: false,
  signUpError: null,
  changeNicknameLoading: false, // 닉네임 변경 시도중
  changeNicknameDone: false,
  changeNicknameError: null,
  me: null,
  signUpData: {},
  loginData: {},
};

export const LOAD_MY_INFO_REQUEST = 'LOAD_MY_INFO_REQUEST';
export const LOAD_MY_INFO_SUCCESS = 'LOAD_MY_INFO_SUCCESS';
export const LOAD_MY_INFO_FAILURE = 'LOAD_MY_INFO_FAILURE';

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST';
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS';
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE';

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const CHANGE_NICKNAME_REQUEST = 'CHANGE_NICKNAME_REQUEST';
export const CHANGE_NICKNAME_SUCCESS = 'CHANGE_NICKNAME_SUCCESS';
export const CHANGE_NICKNAME_FAILURE = 'CHANGE_NICKNAME_FAILURE';

export const FOLLOW_REQUEST = 'FOLLOW_REQUEST';
export const FOLLOW_SUCCESS = 'FOLLOW_SUCCESS';
export const FOLLOW_FAILURE = 'FOLLOW_FAILURE';

export const UNFOLLOW_REQUEST = 'UNFOLLOW_REQUEST';
export const UNFOLLOW_SUCCESS = 'UNFOLLOW_SUCCESS';
export const UNFOLLOW_FAILURE = 'UNFOLLOW_FAILURE';

export const ADD_POST_TO_ME = 'ADD_POST_TO_ME';
export const REMOVE_POST_OF_ME = 'REMOVE_POST_OF_ME';

// const dummyUser = (data) => ({
//   ...data,
//   nickname: 'jhyoon',
//   id: 1,
//   Posts: [{ id: 1 }],
//   Followings: [{ nickname: 'zzangu' }, { nickname: 'simpson' }, { nickname: 'ppukka' }],
//   Followers: [{ nickname: 'zzangu' }, { nickname: 'simpson' }, { nickname: 'ppukka' }],
// });

// redux-thunk를 쓰는 경우 예시
// redux-thunk: 한번에 dispatch를 여러번 할 수 있게 해줌
// <->redux-saga: delay / 클릭 두 번시 마지막의 것만 요청(takeLatest) / throttle(특정 시간에 요청 횟수 제한)등 추가기능 제공
// 비동기 action-creator
// export const loginAction = (data) => {
//   return (dispatch, getState) => {
//     const state = getState(); // combineReducers안에 있는 initialState 반환
//     dispatch(loginRequestAction());
//     axios
//       .post('/api/login')
//       .then((res) => {
//         dispatch(loginSuccessAction(res.data));
//       })
//       .catch((err) => {
//         dispatch(loginFailureAction(err));
//       });
//   };
// };

// 아래 action-generator 6개는 redux-thunk용 / 각 요청마다 3개(request, success, failure) 3개씩
export const loginRequestAction = (data) => ({
  type: LOG_IN_REQUEST,
  data,
});

// Failure/Success Action은 saga가 put으로 호출해주기 때문에 굳이 만들 필요없음
// export const loginSuccessAction = (data) => {
//   return {
//     type: 'LOG_IN_SUCCESS',
//     data,
//   };
// };

// export const loginFailureAction = (data) => {
//   return {
//     type: 'LOG_IN_FAILURE',
//     data,
//   };
// };

export const logoutRequestAction = () => ({
  type: LOG_OUT_REQUEST,
});

// export const logoutSuccessAction = () => {
//   return {
//     type: 'LOG_OUT_SUCCESS',
//   };
// };

// export const logoutFailureAction = () => {
//   return {
//     type: 'LOG_OUT_FAILURE',
//   };
// };

// redux-thunk, saga 적용 이전
// export const logoutAction = () => {
//   return {
//     type: 'LOG_OUT',
//   };
// };

// export const loginAction = () => {
//   return {
//     type: 'LOG_IN',
//   };
// };

const reducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case LOAD_MY_INFO_REQUEST:
        draft.loadMyInfoLoading = true;
        draft.loadMyInfoError = null;
        draft.loadMyInfoDone = false;
        break;

      case LOAD_MY_INFO_SUCCESS:
        draft.loadMyInfoLoading = false;
        draft.me = action.data;
        draft.loadMyInfoDone = true;
        break;
   
      case LOAD_MY_INFO_FAILURE:
        draft.loadMyInfoLoading = false;
        draft.loadMyInfoError = action.error;
        break;

      case FOLLOW_REQUEST:
        draft.followLoading = true;
        draft.followError = null;
        draft.followDone = false;
        break;

      case FOLLOW_SUCCESS:
        draft.followLoading = false;
        draft.me.Followings.push({ id: action.data });
        draft.followDone = true;
        break;
   
      case FOLLOW_FAILURE:
        draft.followLoading = false;
        draft.followError = action.error;
        break;

      case UNFOLLOW_REQUEST:
        draft.unfollowLoading = true;
        draft.unfollowError = null;
        draft.unfollowDone = false;
        break;

      case UNFOLLOW_SUCCESS:
        draft.unfollowLoading = false;
        draft.me.Followings = draft.me.Followings.filter((v) => v.id !== action.data);
        draft.unfollowDone = true;
        break;
   
      case UNFOLLOW_FAILURE:
        draft.unfollowLoading = false;
        draft.unfollowError = action.error;
        break;        

      case LOG_IN_REQUEST:
        draft.logInLoading = true;
        draft.logInError = null;
        draft.logInDone = false;
        break;

      case LOG_IN_SUCCESS:
        draft.logInLoading = false;
        draft.me = action.data;
        draft.logInDone = true;
        break;
   
      case LOG_IN_FAILURE:
        draft.logInLoading = false;
        draft.logInError = action.error;
        break;

      case LOG_OUT_REQUEST:
        draft.logOutLoading = true;
        draft.logOutError = null;
        draft.logOutDone = false;
        break;
  
      case LOG_OUT_SUCCESS:
        draft.logOutLoading = false;
        draft.me = null;
        draft.logOutDone = true;
        break;
  
      case LOG_OUT_FAILURE:
        draft.logOutLoading = false;
        draft.logoutError = action.error;
        break;

      case SIGN_UP_REQUEST:
        draft.signUpLoading = true;
        draft.signUpError = null;
        draft.signUpDone = false;
        break;
  
      case SIGN_UP_SUCCESS:
        draft.signUpLoading = false;
        draft.signUpDone = true;
        break;
  
      case SIGN_UP_FAILURE:
        draft.signUpLoading = false;
        draft.signUpError = action.error;
        break;
  
      case CHANGE_NICKNAME_REQUEST:
        draft.changeNicknameLoading = true;
        draft.changeNicknameError = null;
        draft.changeNicknameDone = false;
        break;
  
      case CHANGE_NICKNAME_SUCCESS:
        draft.me.nickname = action.data.nickname;
        draft.changeNicknameLoading = false;
        draft.changeNicknameDone = true;
        break;
  
      case CHANGE_NICKNAME_FAILURE:
        draft.changeNicknameLoading = false;
        draft.changeNicknameError = action.error;
        break;
  
      case ADD_POST_TO_ME:
        draft.me.Posts.unshift({ id: action.data });
        break;

        // 아래의 코드를 위의 코드로 대체(immer)
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Posts: [{ id: action.data }, ...state.me.Posts],
        //   },
        // };
  
      case REMOVE_POST_OF_ME:
        draft.me.Posts = draft.me.Posts.filter((v) => v.id !== action.data);
        break;

        // 아래의 코드를 위의 코드로 대체(immer)
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Posts: state.me.Posts.filter((v) => v.id !== action.data),
        //   },
        // };
  
      default:
        break;
    }
  });
};

export default reducer;
