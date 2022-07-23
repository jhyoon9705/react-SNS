export const initialState = {
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

const dummyUser = (data) => ({
  ...data,
  nickname: 'jhyoon',
  id: 1,
  Posts: [{ id: 1 }],
  Followings: [{ nickname: 'zzangu' }, { nickname: 'simpson' }, { nickname: 'ppukka' }],
  Followers: [{ nickname: 'zzangu' }, { nickname: 'simpson' }, { nickname: 'ppukka' }],
});

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
  switch (action.type) {
    case LOG_IN_REQUEST:
      return {
        ...state,
        logInLoading: true,
        logInError: null,
        logInDone: false,
      };

    case LOG_IN_SUCCESS:
      return {
        ...state,
        logInLoading: false,
        logInDone: true,
        me: dummyUser(action.data),
      };

    case LOG_IN_FAILURE:
      return {
        ...state,
        logInLoading: false,
        logInError: action.error,
      };

    case LOG_OUT_REQUEST:
      return {
        ...state,
        logOutLoading: true,
        logOutDone: false,
        logOutError: null,
      };

    case LOG_OUT_SUCCESS:
      return {
        ...state,
        logOutLoading: false,
        logOutDone: true,
        me: null,
      };

    case LOG_OUT_FAILURE:
      return {
        ...state,
        logOutLoading: false,
        logOutError: action.error,
      };
    case SIGN_UP_REQUEST:
      return {
        ...state,
        signUpLoading: true,
        signUpDone: false,
        signUpError: null,
      };

    case SIGN_UP_SUCCESS:
      return {
        ...state,
        signUpLoading: false,
        signUpDone: true,
      };

    case SIGN_UP_FAILURE:
      return {
        ...state,
        signUpLoading: false,
        signUpError: action.error,
      };

    case CHANGE_NICKNAME_REQUEST:
      return {
        ...state,
        changeNicknameLoading: true,
        changeNicknameDone: false,
        changeNicknameError: null,
      };

    case CHANGE_NICKNAME_SUCCESS:
      return {
        ...state,
        changeNicknameLoading: false,
        changeNicknameDone: true,
      };

    case CHANGE_NICKNAME_FAILURE:
      return {
        ...state,
        changeNicknameLoading: false,
        changeNicknameError: action.error,
      };

    case ADD_POST_TO_ME:
      return {
        ...state,
        me: {
          ...state.me,
          Posts: [{ id: action.data }, ...state.me.Posts],
        },
      };

    case REMOVE_POST_OF_ME:
      return {
        ...state,
        me: {
          ...state.me,
          Posts: state.me.Posts.filter((v) => v.id !== action.data),
        },
      };

    default:
      return state;
  }
};

export default reducer;
