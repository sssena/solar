import { statusConstants } from '../helpers/constants';

const initialState = {
    isProcessing: false,
    message: ''
};

export function isProcessing( state = initialState, action ){
    switch ( action.type ) {
        case statusConstants.IS_PROCESSING:
            return { isProcessing: true, message: '' };

        case statusConstants.IS_NOT_PROCESSING:
            return { isProcessing: false, message: '' };

        case statusConstants.SEND_MESSAGE:
            return { isProcessing: true, message: action.message };

        default:
            return state;
    }
}
