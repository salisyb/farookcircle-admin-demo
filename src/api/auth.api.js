import { datashopAPI, api } from './config/axios';
import { store } from '../store';

export const signIn = (data) => api.post('/api/v1/user/auth/login', JSON.stringify(data));
export const getUserInfo = async () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return datashopAPI.get('/system/admin/staff-info', {}, config);
};
