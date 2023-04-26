/* eslint-disable no-unneeded-ternary */
/* eslint-disable default-param-last */
import * as auth from '../constants/auth';

const userSession = localStorage.getItem('user_session') ? JSON.parse(localStorage.getItem('user_session')) : {};

const initialState = {
  token: userSession.token || null,
  isAuthenticated: userSession.token ? true : false,
  isLoading: false,
  user: userSession.user || null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case auth.USER_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case auth.LOGIN_SUCCEED:
      localStorage.setItem('user_session', JSON.stringify(action.payload));
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
    case auth.USER_LOGOUT:
      return {};
    case auth.AUTH_ERROR:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}
