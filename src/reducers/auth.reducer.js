import { authConstants } from '../helpers/constants';

const initialState = {
    loggedIn: false,
    auth: {
        id: '',
        address: '',
        canCreate: false
    }
};

export function authentication( state = initialState, action ){
    switch ( action.type ) {
        case authConstants.LOGIN_SUCCESS:
            return {
                loggedIn: true,
                auth: action.auth
            };

        case authConstants.LOGIN_FAILURE:
        case authConstants.LOGOUT:
            return initialState ;

        default:
            return state;
    }
}
