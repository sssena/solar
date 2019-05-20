import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local import
import './ConfirmPassword.css';
import { web3 } from '../../web3';

/*
 * @author. sena@soompay.net
 * @comment. 'ConfirmPassword' check password.
 *
 */
class ConfirmPassword extends Component {
    constructor( props ) {
        super( props );

        this.confirm = this.confirm.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);

        this.state = {
            password: ''
        };
    }

    handlePasswordChange( event ) {
        this.setState( { password: event.target.value });
    }

    async confirm() {
        let result = false;
        let error = null;

        try {
            if( this.props.useUnlock ){
                result = await web3.personal.unlockAccount( this.props.auth.address, this.state.password, 300 );
            } else {
                result = await web3.personal.loginAccount( this.props.auth.address, this.state.password );
            }
        } catch( error ) {
            error = error;
            result = false;
        }

        if( !result ){
            this.setState({
                result: false,
                message: "Check your password."
            });
            return;
        }

        let passcode = this.state.password;
        if( this.state.password == undefined ){ passcode = ''; }
        this.props.closeAction({ result: true, passcode: passcode });
    }

    render() {
        return (
            <div className="confirm-password-form">

                <TextField disabled
                    defaultValue={this.props.auth.address}
                    className="textfield"
                    variant="outlined"
                    margin="normal" />

                <TextField
                    error={this.state.result}
                    label="Password"
                    type="password"
                    className="textfield"
                    onChange={this.handlePasswordChange}
                    variant="outlined"
                    margin="normal" />

                {
                    this.state.result == false ? (
                        <Chip
                            icon={<ErrorIcon className="chip-icon"/>}
                            className="status-chip"
                            label={this.state.message} />
                    ) : null
                }

                <Button variant="contained" color="primary" className="confirm-password-btn" onClick={this.confirm}> Confirm </Button>
            </div>

        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(ConfirmPassword);
