import { api } from './config/axios';

export const signIn = (data) => api.post('/api/v1/user/auth/login', JSON.stringify(data));
