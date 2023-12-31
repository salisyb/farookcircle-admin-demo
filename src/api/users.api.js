import { store } from '../store';
import { api } from './config/axios';

export const getUsers = () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get('/api/v1/user/get-agents', {}, config);
};

export const validateUser = (username) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get(`/api/v1/user/validate-agent/${username}`, {}, config);
};

export const createUser = (data) => api.post('/api/v1/auth/admin/users/', data);
export const getUser = (userId) => api.get(`/api/v1/auth/admin/users/${userId}/`);
export const updateUser = (userId, data) => api.get(`/api/v1/auth/admin/users/${userId}/`, data);
export const removeUser = (userId) => api.delete(`/api/v1/auth/admin/users/${userId}/`);

export const getUsersWallet = () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get('/api/v1/admin/agents/wallet', {}, config);
};

export const fundUsersWallet = (userId, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.post(`/api/v1/admin/agents/wallet/${userId}`, payload, config);
};

export const getNotification = () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get('/api/v1/admin/notify', {}, config);
};

export const createNotification = (payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.post(`/api/v1/admin/notify`, payload, config);
};

export const updateNotification = (userId, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.post(`/api/v1/admin/agents/wallet/${userId}`, payload, config);
};

export const deleteNotification = (notifyId) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.delete(`/api/v1/admin/notify/${notifyId}`, {}, config);
};

// staff dashobard

export const getListOfTransactins = (query = {}) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get('/api/v1/deposit', query, config);
};

export const agentFundUserWallet = (payload = {}) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.post('/api/v1/deposit', payload, config);
};
