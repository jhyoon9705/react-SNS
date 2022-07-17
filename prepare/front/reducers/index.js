import { HYDRATE } from "next-redux-wrapper";
import { combineReducers } from "redux";
import user from "./user";
import post from "./post";

// action creator
// const changeNickname = (data) => {
//   return {
//     type: "CHANGE_NICKNAME",
//     data,
//   };
// };

// store.dispatch(changeNickname('yoonjh'));

// Reducer: (이전 상태, 액션) => 다음 상태
const rootReducer = combineReducers({
  // SSR을 위해 HYDRATE 추가를 하기 위해 index reducer를 추가
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
