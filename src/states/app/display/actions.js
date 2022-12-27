import { SAVE_DISPLAY_DATA } from './types';

const saveDisplayData = (payload) => {
  return (dispatch) => {
    dispatch({
      type: SAVE_DISPLAY_DATA,
      data: payload,
    });
  };
};

export { saveDisplayData };
