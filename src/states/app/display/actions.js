import { SAVE_DISPLAY_DATA, SET_DELIVERY_ORDER } from './types';

const saveDisplayData = (payload) => {
  return (dispatch) => {
    dispatch({
      type: SAVE_DISPLAY_DATA,
      data: payload,
    });
  };
};
const setDeliveryOrder = (payload) => {
  return (dispatch) => {
    dispatch({
      type: SET_DELIVERY_ORDER,
      data: payload,
    });
  };
};
export { saveDisplayData, setDeliveryOrder };
