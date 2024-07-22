/* eslint-disable default-param-last */
import * as actionType from '../constants/users';

const initialState = {
  users: [],
  usersWallet: [],
  transactions: [],
  walletSum: 0,
  currentBalance: 0,
  owner: '',
  history: [],
  isLoading: false,
  added: false,
  count: 0,
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case actionType.USER_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case actionType.USER_LOADED:
      return {
        ...state,
        isLoading: false,
      };
    case actionType.SET_USERS_COUNT:
      return {
        ...state,
        count: action.payload,
      };
    case actionType.GET_STAFF_ACCOUNT:
      return {
        ...state,
        currentBalance: action.payload.currentBalance,
        owner: action.payload.owner,
        history: action.payload.history,
        isLoading: false,
      };
    case actionType.GET_USERS:
      return {
        ...state,
        users: action.payload,
        isLoading: false,
      };
    case actionType.CREATE_USER:
      return {
        ...state,
        users: [action.payload.user, ...state.users],
        isLoading: false,
        added: true,
      };
    case actionType.REMOVE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
        isLoading: false,
      };
    case actionType.UPDATE_USER:
      return {
        ...state,
        isLoading: false,
        added: true,
      };
    case actionType.GET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
      };
    case actionType.GET_USERS_WALLET:
      return {
        ...state,
        usersWallet: action.payload.wallets,
        walletSum: action.payload.walletSum,
        isLoading: false,
      };
    default:
      return state;
  }
}
