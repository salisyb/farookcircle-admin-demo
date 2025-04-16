/* eslint-disable no-unneeded-ternary */
/* eslint-disable default-param-last */
import { getWithExpiry, setWithExpiry } from '../../utils/helper';
import * as auth from '../constants/auth';


const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 1 day


const userSession = getWithExpiry('user_session');

const initialState = {
  token: userSession?.token || null,
  isAuthenticated: userSession?.token ? true : false,
  isLoading: false,
  user: userSession?.user || null,
};

// const initialState = {
//   token: null,
//   isAuthenticated: false,
//   isLoading: false,
//   user: null,
// };

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case auth.USER_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case auth.LOGIN_SUCCEED:
      setWithExpiry('user_session', action.payload, TOKEN_EXPIRY);
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
      case auth.USER_UPDATE:
        return {
          ...state,
          user: action.payload,
        }
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
