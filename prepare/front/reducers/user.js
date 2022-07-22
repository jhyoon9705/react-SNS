export const initialState = {
  isLoggingIn: false, // 로그인 시도중
  isLoggedIn: false,
  isLoggingOut: false, // 로그아웃 시도중
  me: null,
  signUpData: {},
  loginData: {},
};

// redux-thunk를 쓰는 경우 예시
// redux-thunk: 한번에 dispatch를 여러번 할 수 있게 해줌
// <->redux-saga: delay / 클릭 두 번시 마지막의 것만 요청(takeLatest) / throttle(특정 시간에 요청 횟수 제한)등 추가기능 제공
// 비동기 action-creator
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

// 아래 action-generator 6개는 redux-thunk용 / 각 요청마다 3개(request, success, failure) 3개씩
export const loginRequestAction = (data) => {
  return {
    type: "LOG_IN_REQUEST",
    data,
  };
};

// Failure/Success Action은 saga가 put으로 호출해주기 때문에 굳이 만들 필요없음
// export const loginSuccessAction = (data) => {
//   return {
//     type: "LOG_IN_SUCCESS",
//     data,
//   };
// };

// export const loginFailureAction = (data) => {
//   return {
//     type: "LOG_IN_FAILURE",
//     data,
//   };
// };

export const logoutRequestAction = () => {
  return {
    type: "LOG_OUT_REQUEST",
  };
};

// export const logoutSuccessAction = () => {
//   return {
//     type: "LOG_OUT_SUCCESS",
//   };
// };

// export const logoutFailureAction = () => {
//   return {
//     type: "LOG_OUT_FAILURE",
//   };
// };

// redux-thunk, saga 적용 이전
// export const logoutAction = () => {
//   return {
//     type: "LOG_OUT",
//   };
// };

// export const loginAction = () => {
//   return {
//     type: "LOG_IN",
//   };
// };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOG_IN_REQUEST":
      return {
        ...state,
        isLoggingIn: true,
      };

    case "LOG_IN_SUCCESS":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true,
        me: { ...action.data, nickname: "jhyoon" },
      };

    case "LOG_IN_FAILURE":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: false,
      };

    case "LOG_OUT_REQUEST":
      return {
        ...state,
        isLoggingOut: true,
      };

    case "LOG_OUT_SUCCESS":
      return {
        ...state,
        isLoggingOut: false,
        isLoggedIn: false,
        me: null,
      };

    case "LOG_OUT_FAILURE":
      return {
        ...state,
        isLoggingOut: false,
      };
    default:
      return state;
  }
};

export default reducer;
