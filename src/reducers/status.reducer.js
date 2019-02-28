import { statusConstants } from '../helpers/constants';

const initialState = false;

export function isProcessing( state = initialState, action ){
    switch ( action.type ) {
        case statusConstants.IS_PROCESSING:
            return true;

        case statusConstants.IS_NOT_PROCESSING:
            return false;

        default:
            return state;
    }
}
