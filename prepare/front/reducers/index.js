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
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE: // SSR이 완료될 때 호출되는 action
      console.log('HYDRATE', action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
