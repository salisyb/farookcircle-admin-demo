/* eslint-disable default-param-last */
import * as actionType from '../constants/services';

const initialState = {
  services: [],
};

export default function materialsReducer(state = initialState, action) {
  switch (action.type) {
    case actionType.USER_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case actionType.GET_SERVICES:
      return {
        ...state,
        services: action.payload,
      };
    default:
      return state;
  }
}
