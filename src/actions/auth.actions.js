import { authConstants } from '../helpers/constants';
import { history } from '../helpers/history';

export const authActions = {
    login,
    logout
}

function login( id, password, address ){
    return dispatch => {

        // TODO: login api from CRP web.
        if( id == 'a' ) {
            console.log( 'Logged in. ', new Date() );
            console.log( 'User id:', id );
            console.log( 'Wallet address:', address );

            // TODO: cancreate?
            let canCreate = true;

            dispatch( success({ id: id, address: address, canCreate: canCreate }) );

            // redirect
            history.push('/wallet');
        } else {
            dispatch( failure("Login failed.") );
        }
    };

    function success( auth ) { return { type: authConstants.LOGIN_SUCCESS, auth }; }
    function failure( error ) { return { type: authConstants.LOGIN_FAILURE, error }; }
}

function logout() {
    return dispatch => {
        dispatch( clear({ id: '', address: '', canCreate: false }) );
        history.push('/accounts');
    }
    function clear( auth ) { return { type: authConstants.LOGOUT, auth }; }
}
