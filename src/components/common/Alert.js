import React, { Component } from 'react';

// material-ui components

// local import
import './Alert.css';

/*
 * @author. sena@soompay.net
 * @comment. 'Alert' defines circular progress bar for window.
 */
function Alert( props ) {
    return (
        <div className="alert-background">
            <h4>Connection refused. check the geth is running!</h4>
        </div>
    );
}
export default Alert;
