/* eslint-disable default-param-last */
import * as systemActions from '../constants/system';

const initialState = {
  tickets: [],
  isLoading: false,
};

export default function systemReducer(state = initialState, action) {
  switch (action.type) {
    case systemActions.TOGGLE_LOADING:
      return {
        ...state,
        isLoading: !state.isLoading,
      };
    case systemActions.GET_TICKETS:
      return {
        ...state,
        tickets: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}
