import {
    TEST,

} from './types';



const funcTest = (text) => {
    return dispatch => {

        dispatch({
            type: TEST,
            data: text

        });
    };
};



export {
    funcTest

};
