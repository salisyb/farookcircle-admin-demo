import { api, apiExternal } from './config/axios';
import { store } from '../store';


export const getTransactionsHistory = async () => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return api.get('/api/v1/admin/transaction', {}, config);
  };



export const filterTransaction = async (filter) => {

  const {token} = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return api.get(`/api/v1/admin/transaction?${filter}`, {}, config);
}


export const getUsernameTransaction = async (userId) => {


  const {token} = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  
  return api.get(`/api/v1/admin/transaction/${userId}/user`, {}, config);

}
