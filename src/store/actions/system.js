import * as systemActions from '../constants/system';
import * as api from '../../api/system.api';

export const fetchAllTicket = () => async (dispatch) => {
  const request = await api.getAllTicket();
  if (request.ok) {
    dispatch({ type: systemActions.GET_TICKETS, payload: request.data });
  }
};
