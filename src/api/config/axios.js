import { create } from 'apisauce';


export const api = create({
  baseURL: 'https://retail-manager.farookcircle.com',
});

export const apiExternal = create({
  baseURL: '',
});



export const datashopAPI = create({
  baseURL: 'https://datashop.farookcircle.com',
})