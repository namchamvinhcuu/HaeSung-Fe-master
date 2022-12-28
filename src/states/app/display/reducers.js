import { SAVE_DISPLAY_DATA } from './types';

const initializeState = {
  totalOrderQty: 0,
  totalActualQty: 0,
  totalNGQty: 0,

  totalGoodQtyInjection: 0,
  totalNGQtyInjection: 0,
  totalGoodQtyAssy: 0,
  totalNGQtyAssy: 0,

  totalEfficiency: 0,
  data: [],
};

const reducer = (state = initializeState, action) => {
  let newState = { ...state };

  switch (action.type) {
    case SAVE_DISPLAY_DATA:
      newState = { ...action.data };
      break;

    default:
      break;
  }
  return { ...newState };
};

export default reducer;
