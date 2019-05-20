import { netStatusConstants } from '../helpers/constants';

const initialState = false;

export function isConnected( state = initialState, action ){
    switch ( action.type ) {
        case netStatusConstants.IS_CONNECTED:
            return true;

        case netStatusConstants.IS_DISCONNECTED:
            return false;

        default:
            return state;
    }
}
