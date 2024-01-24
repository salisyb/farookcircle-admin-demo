import { create } from 'apisauce';

export const api = create({
  baseURL: 'https://retail-manager.farookcircle.com',
});

export const apiExternal = create({
  baseURL: '',
});

export const datashopAPI = create({
  baseURL: 'https://datashop.farookcircle.com',
});

// export const datashopAPI = create({
//   baseURL: 'http://127.0.0.1:8000',
// });