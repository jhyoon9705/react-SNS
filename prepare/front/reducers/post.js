export const initialState = {
  mainPosts: [
    {
      id: 1,
      User: {
        id: 1,
        nickname: "jhyoon",
      },
      content: "첫 번째 게시글 #해시태그 #익스프레스",
      Images: [
        {
          src: "https://via.placeholder.com/200/0000FF/808080",
        },
        {
          src: "https://via.placeholder.com/200/FFFF00/000000",
        },
        {
          src: "https://via.placeholder.com/200/FF0000/FFFFFF",
        },
      ],
      Comments: [
        {
          User: {
            nickname: "nero",
          },
          content: "hello~~~!",
        },
        {
          User: {
            nickname: "hero",
          },
          content: "Nice to meet you!",
        },
      ],
    },
  ],
  imagePaths: [],
  postAdded: false,
};

const ADD_POST = "ADD_POST";
export const addPost = {
  type: ADD_POST,
};

const dummyPost = {
  id: 2,
  content: "This is a dummy data",
  User: {
    id: 1,
    nickname: "jhyoon",
  },
  Images: [],
  Comments: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST:
      return {
        ...state,
        mainPosts: [dummyPost, ...state.mainPosts],
        postAdded: true,
      };
    default:
      return state;
  }
};

export default reducer;
