import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// icons
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';

// local imports
import './Login.css';
import { authActions }  from '../../../actions';

// local defines
const LOGIN_SUCCEED_MESSAGE = "Login succeed!";
const LOGIN_FAILED_MESSAGE = "Login failed. check your id or password.";
const LOGIN_LOADING_MESSAGE = "Check your id or password.";

/*
 * @author. sena@soompay.net
 * @comment. 'Login' defines Login format.
 *           Id,password for CRP-webp and wallet address.
 */
class Login extends Component {
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

        // reset login status
        this.props.dispatch( authActions.logout() );
    }

    handleIdChange( e ) {
        this.setState( { id: e.target.value, idError: false })
    }
    handlePasswordChange( e ) {
        this.setState( { password: e.target.value, pwError: false })
    }

    signIn() {
        const { dispatch } = this.props;
        let id = this.state.id;
        let password = this.state.password;

        this.setState({ loginState: 'loading', message: LOGIN_LOADING_MESSAGE });

        if( this.validationCheck( id, password ) ){
            dispatch( authActions.login( id, password, this.props.address ));
            //     this.setState({ loginState: 'success', message: LOGIN_SUCCEED_MESSAGE });
        }
        this.setState({ loginState: 'failed', message: LOGIN_FAILED_MESSAGE });
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

function mapStateToProps( state ) {
    const { logginIn } = state.authentication;
    return {
        logginIn
    };
}

export default connect(mapStateToProps)(Login);
