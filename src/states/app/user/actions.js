import { CHANGE_LANGUAGE } from './types';

const changeLanguage = (language) => {
  return (dispatch) => {
    dispatch({
      type: CHANGE_LANGUAGE,
      data: language,
    });
  };
};

export { changeLanguage };
