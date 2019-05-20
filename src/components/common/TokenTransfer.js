import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
//import './TokenTransfer.css';
import { web3 } from '../../web3';
import { contractHandlers } from '../../helpers/contracts';
import { statusActions } from '../../actions';
import utils from '../../helpers/utils';

/*
 * @author. sena
 * @comment. 'TokenTransfer' is a pop-up view to transfer token.
 */
class TokenTransfer extends Component {
    state = {
        error: false,
        toError: false,
        amountError: false,
        passwordError: false,
        message: ''
    };

    constructor(){
        super();

        this.tokenTransfer = this.tokenTransfer.bind(this);
        this.validationCheck = this.validationCheck.bind(this);
    }

    handleToChange = ( event ) => {
        this.setState({ to: event.target.value });
    }

    handleAmountChange = ( event ) => {
        let amount = Number( event.target.value );
        this.setState({ amount: amount });
    }

    handlePasswordChange = ( event ) => {
        this.setState({ password: event.target.value });
    }

    async validationCheck(){
        // amount check
        let amount = this.state.amount;
        if( isNaN(amount) ){
            this.setState({ amountError: true, message: "Invalid amount." });
            return false;
        }

        // balance check
        let balance = 0;
        let result = false;

        try {
            balance = await this.props.tokenContract.activeOf( this.props.auth.address ).toNumber();
            balance = web3._extend.utils.fromWei( balance );
            
            if( balance <= amount ){
                this.setState({ amountError: true, message: "Balance is not enough." });
                return false;
            }

            // password check
            result = await web3.personal.unlockAccount( this.props.auth.address, this.state.password );
            if( !result ){
                this.setState({ passwordError: true, message: "Check your password." });
                result = false;
            }
        } catch (error){
            if( error.message.includes("could not decrypt key with given passphrase") ){
                this.setState({ passwordError: true, message: "Check your password." });
            } else {
                console.error(error);
            }
            result = false;
        }

        return result;
    }

    async tokenTransfer() {
        if( ! await this.validationCheck() ){ return; }

        this.props.dispatch( statusActions.start() );

        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.password,
            },
            to: this.state.to,
            tokenAddress: this.props.tokenContract.address,
            amount: await web3._extend.utils.toWei( this.state.amount )
        };

        let result = false;
        let message = 'Token transfered successfully.';

        try{
            result = await contractHandlers.tokenTransfer( params );
        } catch( error ){
            console.error( error );
            result = false;
        }

        if( !result ){
            message = "Fail to send. Try again.";
        }
        
        this.props.dispatch( statusActions.done() );
        this.setState({ error: result ? false : true, message: message }, () => {
            if( !this.state.error ){
                this.props.closeAction();
            }
        });
    }

    render() {
        return (
            <div className="common-join-crowdsale">
                <TextField required
                    disabled
                    label="from"
                    type="text"
                    className="textfield"
                    variant="outlined"
                    margin="normal" 
                    value={this.props.auth.address}
                />

                <TextField required
                    label="to"
                    error={this.state.toError}
                    type="text"
                    className="textfield"
                    onChange={this.handleToChange}
                    variant="outlined"
                    margin="normal" 
                />

                <TextField required
                    label="amount"
                    error={this.state.amountError}
                    type="number"
                    className="textfield"
                    onChange={this.handleAmountChange}
                    variant="outlined"
                    margin="normal" 
                    InputProps={{ endAdornment: <InputAdornment position="end">{this.props.tokenContract.symbol().toString()}</InputAdornment>}}
                />

                <TextField
                    label="password"
                    type="password"
                    error={this.state.passwordError}
                    className="textfield"
                    onChange={this.handlePasswordChange}
                    variant="outlined"
                    margin="normal" />

                {
                    this.state.toError || this.state.amountError || this.state.passwordError || this.state.error ? (
                        <div className="chip-div">
                            <Chip
                                icon={<ErrorIcon className="chip-icon"/>}
                                className={"status-chip"}
                                label={this.state.message} />
                        </div> ) : null
                }

                <Button
                    variant="contained"
                    color="primary"
                    className="purchase-btn"
                    onClick={this.tokenTransfer}> Purchase </Button>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(TokenTransfer);
