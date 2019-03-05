import React, { Component } from 'react';

// material-ui components
import Snackbar from '@material-ui/core/Snackbar';
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './ErrorSnackbar.css';

/*
 * @author. sena
 * @comment. 'ErrorSnackbar' defines snackbar for showing error messages.   
 */
class ErrorSnackbar extends Component {
    state = {
    };

    constructor( props ){
        super( props );
    }

    render() {
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={this.props.showErrorMessage}
                autoHideDuration={5000}
                onClose={this.props.hideErrorMessage}
                ContentProps={{
                    'aria-describedby': 'message-id'
                }}
                message={
                    <span className="error-snackbar">
                        <ErrorIcon className="error-snackbar-icon"/> {this.props.message}
                    </span>
                }
            />
        );
    }
}

export default (ErrorSnackbar);
