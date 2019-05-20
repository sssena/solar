// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import React from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import rootReducer from './reducers/rootReducer';

import App from './components/App';

const store = createStore( rootReducer, applyMiddleware( thunkMiddleware ) );
console.log( store )

window.onload = () => {
    ReactDOM.render( 
        <Provider store={store}>
            <App/>
        </Provider>, 
        document.getElementById('app')
    );
};
