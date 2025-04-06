import { store } from '../store';
import { api, datashopAPI } from './config/axios';

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

export const createUser = (data) => api.post('/api/v1/admin/user', data);
export const updateUserInfo = async (data) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/api/v1/admin/user', data, config);
};

export const getUserBankAccount = async (username) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/api/v1/admin/user/bank', {username}, config);
};


export const getBankList = async () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/api/bank-list', {}, config);
};


export const createUserBankAccount = async (data) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/api/v1/admin/user/bank', data, config);
};




export const updateUserPassword = async (data) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/api/v1/admin/user-password-reset', data, config);
};

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

export const getStaffAccount = (query = {}) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.get('/api/v1/account', query, config);
};

export const getListOfTransactions = (query = {}) => {
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

export const agentDeductUser = (payload = {}) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/wallet/wallet-deduction', payload, config);
};

export const checkDeductionDetail = (payload = {}) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/wallet/wallet-deduction', payload, config);
};

export const sendUserMessage = (payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/api/v1/admin/message', payload, config);
};

export const sendUserEmail = (payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.post('/api/v1/admin/email', payload, config);
};
