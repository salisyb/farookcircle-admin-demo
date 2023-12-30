import { combineReducers } from 'redux';
import auth from './auth';
import users from './users';
import services from './services';
import system from './system';

export default combineReducers({
  auth,
  users,
  services,
  system,
});
