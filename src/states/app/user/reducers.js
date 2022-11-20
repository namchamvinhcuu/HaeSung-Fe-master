import { CHANGE_LANGUAGE } from './types';

const initializeState = {
  language: 'EN',
};

const reducer = (state = initializeState, action) => {
  let newState = { ...state };

  switch (action.type) {
    case CHANGE_LANGUAGE:
      newState.language = action.data;
      break;

    default:
      break;
  }
  return { ...newState };
};

export default reducer;
