import { configureConstants } from '../helpers/constants';
import path from 'path';
import configureStorage from 'electron-json-storage';

let initialState = {};
configureStorage.setDataPath( path.resolve( __dirname, 'appData') );
configureStorage.get( 'configure', ( error, data ) =>{
    let list = [];
    if( data == undefined ){ data = {}; }
    initialState = data;
});

export function configure( state = initialState, action ){
    switch( action.type ){
        case configureConstants.GET:
            return { data: action.value };
            break;
        case configureConstants.SET:
            return { data: action.value };
            break;
        default:
            return initialState;
    }
}
