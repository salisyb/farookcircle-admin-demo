import { api, apiExternal } from './config/axios';
import { store } from '../store';


export const getServices = () => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return api.get('/api/v1/admin/services', {}, config);
  };



  export const getCurrentProcessor = () => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return api.get('/api/v1/admin/processor', {}, config);
  };



  export const updateCurrentServiceProcessor = (processor) => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = { processor: { name: processor } };

    return api.post('/api/v1/admin/processor', payload, config);
  };
  


  export const getCurrentDiscount = () => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return api.get('/api/v1/admin/discount', {}, config);
  };



  export const updateCurrentServiceDiscount = (payload) => {
    const { token } = store.getState().auth;
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };


    return api.post('/api/v1/admin/discount', payload, config);
  };
  


export const updateServices = (payload) => {
  const { token } = store.getState().auth;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return api.post('/api/v1/admin/services/update', payload, config);
};


export const getProcessors = () => api.get('/api/v1/admin/current-processors');
