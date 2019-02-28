import React, { Component } from 'react';

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';

// local import
import './Progress.css';

/*
 * @author. sena@soompay.net
 * @comment. 'Progress' defines circular progress bar for window.
 */
function Progress( props ) {
    return (
        <div className="progress-background">
            <CircularProgress className="progress-circle" />
        </div>
    );
}
export default Progress;
