import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';

// local imports
import './LoginForm.css';

// local defines
const LOGIN_SUCCEED_MESSAGE = "Login succeed!";
const LOGIN_FAILED_MESSAGE = "Login failed. check your id or password.";
const LOGIN_LOADING_MESSAGE = "Check your id or password.";

/*
 * @author. sena@soompay.net
 * @comment. 'LoginForm' defines Login format.
 *           Id,password for CRP-webp and wallet address.
 */
class LoginForm extends Component {
    constructor( props ) {
        super( props );

        this.signIn = this.signIn.bind(this);
        this.handleIdChange = this.handleIdChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);

        this.state = {
            id: '',
            password: '',
            loginState: 'none',
            idError: false,
            pwError: false
        }
    }

    handleIdChange( e ) {
        this.setState( { id: e.target.value, idError: false })
    }
    handlePasswordChange( e ) {
        this.setState( { password: e.target.value, pwError: false })
    }

    signIn(){
        let id = this.state.id;
        let password = this.state.password;
        this.setState({ loginState: 'loading', message: LOGIN_LOADING_MESSAGE });

        if( this.validationCheck( id, password ) ){
            //TODO: add CRP-web Authentification
            console.log( "TODO: CRP-web Authentificaiton!" );

            let result = this.props.loginAction( id, this.props.address );
            if( !result ) {
                this.setState({ loginState: 'failed', message: LOGIN_FAILED_MESSAGE });
            } else {
                this.setState({ loginState: 'success', message: LOGIN_SUCCEED_MESSAGE });
                // TODO:set timer
                this.props.closeAction();
            }
        }
    }

    validationCheck( id, password ) {
        if ( id == '' ) {
            this.setState({ idError: true });
            return false;
        }

        if ( password == '' ) {
            this.setState({ pwError: true });
            return false;
        }
        return true;
    }

    render() {
        if( this.state.loginState == 'success' ) {
            return <Redirect to={'/wallet'} /> ;
        } else {
            let icon = null;
            if( this.state.loginState == 'success' ){
                icon = <DoneIcon className="login-state-icon" />;
            } else if( this.state.loginState == 'failed' ){
                icon = <ErrorIcon className="login-state-icon" />;
            }
            return (
                <div className="login-form">
                    <TextField 
                        required
                        autoFocus
                        id="id"
                        label="Id"
                        className={(this.state.idError) ? "textfield error" : "textfield"}
                        onChange={this.handleIdChange}
                        variant="outlined"
                        margin="normal" />

                    <TextField 
                        required
                        id="standard-password"
                        label="Password"
                        type="password"
                        className={(this.state.pwError) ? "textfield error" : "textfield"}
                        onChange={this.handlePasswordChange}
                        variant="outlined"
                        margin="normal" />

                    <TextField disabled
                        id="wallet-address"
                        defaultValue={this.props.address}
                        helperText="This address is what you choosed from the list."
                        className="textfield"
                        variant="outlined"
                        margin="normal" />

                    <Chip 
                        icon={icon}
                        className={this.state.loginState}
                        label={this.state.message} />

                    <Button variant="contained" color="primary" className="login-btn" onClick={this.signIn}> Login </Button>
                </div>
            );
        }
    }
}

export default LoginForm;
