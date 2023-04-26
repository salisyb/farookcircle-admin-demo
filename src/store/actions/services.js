
import { toast } from 'react-toastify';
import * as api from '../../api/services';
import * as actionType from '../constants/services';

// get the list of users and update store
export const getServices = () => async (dispatch) => {
  dispatch({ type: actionType.USER_LOADING });
  const response = await api.getServices();

  if (response.ok) {
    return dispatch({ type: actionType.GET_SERVICES, payload: response.data.data });
  }
};

// // create new user and add to the store
// export const addNewUser = (data) => async (dispatch) => {
//   dispatch({ type: actionType.USER_LOADING });
//   const response = await api.createUser(data);

//   if (response.ok) {
//     toast.success('You have successfully Create New User');
//     return dispatch({ type: actionType.CREATE_USER, payload: response.data });
//   }

//   console.log(response.data);
//   // eslint-disable-next-line no-unused-expressions
//   response.data ? toast.error('Un-able to add user please try again') : toast.error(response.problem);
//   dispatch({ type: actionType.USER_LOADED });
//   return 0;
// };

// // remove the user from the list
// export const removeUser = (userId) => async (dispatch) => {
//   dispatch({ type: actionType.USER_LOADING });

//   const response = await api.removeUser(userId);

//   if (response.ok) {
//     toast.success('You have successfully Remove User');
//     return dispatch({ type: actionType.REMOVE_USER, payload: userId });
//   }

//   console.log(response.data);
//   // eslint-disable-next-line no-unused-expressions
//   response.data ? toast.error('Un-able to remove user please try again') : toast.error(response.problem);
//   dispatch({ type: actionType.USER_LOADED });
//   return 0;
// };

// // remove the user from the list
// export const updateUser = (data) => async (dispatch) => {
//   dispatch({ type: actionType.USER_LOADING });

//   const response = await api.updateUser(data.id, data);

//   if (response.ok) {
//     toast.success('You have successfully Remove User');
//     return dispatch({ type: actionType.UPDATE_USER });
//   }

//   // eslint-disable-next-line no-unused-expressions
//   response.data ? toast.error('Un-able to remove user please try again') : toast.error(response.problem);
//   dispatch({ type: actionType.USER_LOADED });
//   return 0;
// };
