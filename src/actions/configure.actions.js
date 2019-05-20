import { configureConstants } from '../helpers/constants';
import configureStorage from 'electron-json-storage';
import path from 'path';

configureStorage.setDataPath( path.resolve( __dirname, 'appData') );

export const configureActions = {
    set,
    get
}

function set( key, value ){
    return dispatch => {
        let data = {};
        data[key] = value;

        console.log( 'Set configure. [key: %s, value: %s]', key, value );
        configureStorage.set( 'configure', { data }, () => { 
            dispatch( setConfiguration({ result: true }) );
        });
    }

    function setConfiguration( data ){ return { type: configureConstants.SET, data: data }}
}

function get( key ){
    return dispatch => { 
        configureStorage.get( 'configure', (error, data) => { 
            if( error ){ 
                return { 
                    type: configureConstants.GET,
                    result: false, 
                    data: error 
                }; 
            } else {
                let value = '';
                if( data.hasOwnProperty( key ) ) {
                    value = data[key];
                    console.log( '               [value: %s]', JSON.stringify(value) );
                    dispatch( getConfiguration({ result: true, data: value }));
                }
            }
        });
    }

    function getConfiguration(){ return { type: configureConstants.GET, data: data }}
}
