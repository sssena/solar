import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';

import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';

// local components
import './AddAccountForm.css';
import { web3 } from '../../../web3';
import { statusActions } from '../../../actions';

// local defines
const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

const PERFECT_MESSAGE = "Perfect!";
const VERYGOOD_MESSAGE = "Powerful.";
const GOOD_MESSAGE = "Good.";
const BAD_MESSAGE = "Too weak..";
const CONFIRM_REQUIRED_MESSAGE = "Password confirm is required.";
const MISMATCH_MESSAGE = "Passwords are not matched.";
const MATCH_MESSAGE = "Passwords are matched.";

/*
 * @author. sena@soompay.net
 * @comment. 'AddAccountForm' defines create new account format.
 *           password and password-confirm are required.
 */
class AddAccountForm extends Component {
    constructor( props ) {
        super( props );

        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handlePasswordConfirmChange = this.handlePasswordConfirmChange.bind(this);
        this.createAccount = this.createAccount.bind(this);

        this.state = {
            password: '',
            passwordConfirm: '',

            //validation 
            confrimRequired: false,
            perfection: 'none',
            message: ''
        }
    }

    handlePasswordChange( e ) {
        let password = e.target.value;
        this.setState({ password: password }, () => {
            this.validationCheck();
        });
    }

    handlePasswordConfirmChange( e ) {
        let passwordConfirm = e.target.value;
        this.setState({ passwordConfirm: passwordConfirm }, () => {
            this.validationCheck();
        });
    }

    validationCheck(){
        if( this.state.password.length > 0 && !this.passwordValidationCheck() ){
            return false;
        }

        if( this.state.passwordConfirm.length <= 0 ){
            return false
        } else if( !this.confirmValidationCheck() ){
            return false;
        }

        this.setState({ 
            perfection: 'perfect',
            message: PERFECT_MESSAGE 
        });
        return true;
    }

    passwordValidationCheck( ) {
        if( strongRegex.test( this.state.password ) ) {
            this.setState({ 
                perfection: 'verygood',
                message: VERYGOOD_MESSAGE 
            });
            return true;
        } else if( mediumRegex.test( this.state.password ) ) {
            this.setState({ 
                perfection: 'good',
                message: GOOD_MESSAGE
            });
            return true;
        } else {
            this.setState({ 
                perfection: 'bad',
                message: BAD_MESSAGE 
            });
        }
        return false;
    }

    confirmValidationCheck( ) {
        if( (this.state.password !== this.state.passwordConfirm) ){
            this.setState({ 
                perfection: 'bad',
                message: MISMATCH_MESSAGE 
            });
            return false;
        } 
        return true;
    }

    async createAccount(){
        const { dispatch } = this.props;
        dispatch( statusActions.start());
        if( this.state.passwordConfirm.length == 0 ){
            this.setState({ confirmRequired: true });
            return;
        } else if( !this.validationCheck() ){
            //TODO
        } else {
            let result = await web3.personal_newAccount( this.state.password );
            dispatch( statusActions.done());

            if( result ) {
                this.props.closeAction( true );
            } else {
                //TODO: fail
            }
        }
    }

    render() {
        let icon = null;

        // setting chip icon
        if( this.state.message == PERFECT_MESSAGE ) {
            icon = <SentimentVerySatisfiedIcon className="chip-icon" />;
        } else if ( this.state.message == VERYGOOD_MESSAGE ){
            icon = <SentimentSatisfiedIcon className="chip-icon" />;
        } else if ( this.state.message == GOOD_MESSAGE ){
            icon = <SentimentSatisfiedIcon className="chip-icon" />;
        } else if ( this.state.message == BAD_MESSAGE ){
            icon = <SentimentDissatisfiedIcon className="chip-icon" />;
        }

        return (
            <div className="add-account-form">
                <TextField required
                    id="password"
                    label="Password"
                    type="password"
                    className="textfield"
                    onChange={this.handlePasswordChange}
                    variant="outlined"
                    margin="normal" />

                <TextField required
                    id="password-confirm"
                    label="Confirm"
                    type="password"
                    className={(this.state.confirmRequired) ? "textfield error" : "textfield"}
                    onChange={this.handlePasswordConfirmChange}
                    variant="outlined"
                    margin="normal" />

                <div className="chip-div">
                    <Chip 
                        icon={icon}
                        className={this.state.perfection}
                        label={this.state.message} />
                </div>

                <Button 
                    disabled={this.state.perfection == "perfect" ? false : true}
                    variant="contained" 
                    color="primary" 
                    className="add-account-btn" 
                    onClick={this.createAccount}> Create </Button>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    // should do this to using 'dispatch()' method.
    return state;
}
export default connect(mapStateToProps)(AddAccountForm);
//export default AddAccountForm;
