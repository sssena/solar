const Projects = require('electron-json-storage');
const path = require('path');
Projects.setDataPath( path.resolve( __dirname, 'appData') );

/* local-storage data structure(json) */
// {
//      projects: [ ... mca list ... ]
// }

async function add( account, address ){
    if( account == undefined || address == undefined ) {
        console.log('empty key storage.add : ', account, address ); 
        return false;
    }
    return new Promise( (resolve, reject ) => {
        Projects.get( account, ( error, data ) =>{
            let list = [];
            if( data.projects != undefined ){
                list = data.projects;
            }

            let exist = false;
            for( let item of list ){
                if( item == address ) exist = true;
            }

            if( !exist ) list.push( address );
            Projects.set( account, { projects: list }, () => { resolve() } );
        });
    });
}

function remove( account, address ){
    if( account == undefined || address == undefined ) {
        console.log('empty key storage.remove: ', account, address); 
        return false;
    }
    return new Promise( (resolve, reject ) => {
        Projects.get( account, ( error, data ) =>{
            let list = [];

            if( data.projects != undefined ){
                list = data.projects;
            }

            let exist = -1;
            for( let i = 0; i < list.length; i++ ){
                if( list[i] == address ){
                    exist = i;
                }
            }
            if( 0 <= exist ){ list.splice( exist, 1 ); }
            Projects.set( account, { projects: list }, () => { resolve() } );
        });
    });
}

function get( account ){
    if( account == undefined ){  
        console.log('empty key storage.get: ', account); 
        return [];
    }

    return new Promise( (resolve) => {
        Projects.get( account, ( error, data ) => {
            if( error ) resolve( [] ); // return empty array 
            resolve( data.projects );
        });
    });
}

function isAdded( account, address ){
    if( account == undefined || address == undefined ) {
        console.log('empty key storage.isAdded: ', account, address); 
        return false;
    }
    return new Promise( (resolve) => {
        Projects.get( account, ( error, data ) => {
            if( error ) resolve( false );
            if( data == undefined || data.projects == undefined ) {
                resolve( false );
            } else {
                let found = false;
                for( let item of data.projects ){
                    if( item == address ) found = true ;
                }
                resolve( found );
            }
        });
    });
}

export const storageHandlers = {
    add,
    remove,
    get,
    isAdded
};
