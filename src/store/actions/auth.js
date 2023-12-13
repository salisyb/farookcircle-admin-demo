import { toast } from 'react-toastify';
import * as api from '../../api/auth.api';
import * as actionType from '../constants/auth';

export const loginUser = (data) => async (dispatch) => {
  dispatch({ type: actionType.USER_LOADING });
  const response = await api.signIn(data);

  if (response.ok) {
    toast.success('You have successfully login');
    const { username, token } = response.data;
    return dispatch({ type: actionType.LOGIN_SUCCEED, payload: { token, user: { username } } });
  }


  // eslint-disable-next-line no-unused-expressions
  response.data ? toast.error('Invalid username or password') : toast.error(response.problem);
  dispatch({ type: actionType.AUTH_ERROR });
  return 0;
};

export const userLogOut = () => (dispatch) => {
  localStorage.removeItem('user_session');
  dispatch({ type: actionType.USER_LOGOUT });
};
