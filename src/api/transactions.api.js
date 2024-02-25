import { api, datashopAPI } from './config/axios';
import { store } from '../store';

export const getTransactionsHistory = async (query) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/api/v1/admin/transactions', query, config);
};

export const filterTransaction = async (filter) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get(`/api/v1/admin/transaction?${filter}`, {}, config);
};

export const getUsernameTransaction = async (userId) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return api.get(`/api/v1/admin/transaction/${userId}/user`, {}, config);
};

export const refundUser = async (transactionRef) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return api.post('/api/v1/order/refund', { transactionRef }, config);
};
