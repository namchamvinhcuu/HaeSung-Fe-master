import {
    CHANGE_LANGUAGE
} from './types';


const initializeState = {
    language: 'VI',
};

const reducer = (state = initializeState, action) => {
    let newState = { ...state };

    switch (action.type) {

        case CHANGE_LANGUAGE:
            console.log('CHANGE_LANGUAGE action')
            newState.language = action.data
            break;

        default:
            break;

    }
    return { ...newState };
};

export default reducer;


