import { datashopAPI } from './config/axios';
import { store } from '../store';

export const getAllTicket = async () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/system/admin/ticket', {}, config);
};

export const getUserTickets = async (user) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get('/system/admin/ticket', { user }, config);
};

export const getTicketById = async (id) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get(`/system/admin/ticket/${id}/`, {}, config);
};

export const getTicketByUser = async (userId) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get(`/system/admin/${userId}/ticket`, {}, config);
};

export const createTicket = async (payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multiform/form-data',
    },
  };
  return datashopAPI.post('/system/admin/ticket', payload, config);
};

export const closeTicket = async (id, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.put(`/system/admin/ticket/${id}/`, payload, config);
};

export const getTicketMessage = async (ticketId) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return datashopAPI.get(`/system/admin/ticket/${ticketId}/messages`, {}, config);
};

export const createTicketMessage = async (ticketId, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  return datashopAPI.post(`/system/admin/ticket/${ticketId}/messages`, payload, config);
};



export const getUsersCount = async () => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  return datashopAPI.get('/system/users-count', {}, config);
};

export const getPendingDeductions = async (ticketId, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  return datashopAPI.get('/wallet/wallet-deduction', payload, config);
};


export const respondPendingWithdrawal = async (id, payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  return datashopAPI.put(`/wallet/wallet-deduction/${id}`, payload, config);
};