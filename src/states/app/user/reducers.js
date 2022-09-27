import {
    TEST
} from './types';


const initializeState = {
    text: 'abc'
};

const reducer = (state = initializeState, action) => {
    let newState = { ...state };

    switch (action.type) {

        case TEST:
            newState.text = action.data

            break;



        default:
            break;

    }
    return { ...newState };
};

export default reducer;


