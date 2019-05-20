import React, { Component } from 'react';
import { connect } from 'react-redux';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './JoinToCrowdsale.css';
import { web3 } from '../../web3';
import { contractHandlers } from '../../helpers/contracts';
import { storageHandlers } from '../../helpers/storage';
import { statusActions } from '../../actions';
import utils from '../../helpers/utils';

/*
 * @author. sena
 * @comment. 'JoinToCrowdsale' is a pop-up view to join crowdsale.
 */
class JoinToCrowdsale extends Component {
    state = {
    };

    constructor(){
        super();

        this.joinToCrowdsale = this.joinToCrowdsale.bind(this);
        this.validationCheck = this.validationCheck.bind(this);
    }

    handleAmountChange = ( event ) => {
        let amount = Number( event.target.value );
        this.setState({ amount: amount });
    }

    handlePasswordChange = ( event ) => {
        this.setState({ password: event.target.value });
    }

    async validationCheck(){
        let amount = this.state.amount;
        if( isNaN(amount) ){
            this.setState({ amountError: true, message: "Invalid amount." });
            return false;
        }

        let balance = 0;
        let result = false;
        try {
            balance = await web3.eth.getBalance( this.props.auth.address ).toNumber();
            balance = web3._extend.utils.fromWei( balance );
            
            if( balance <= amount ){
                this.setState({ amountError: true, message: "Balance is not enough." });
                return false;
            }

            // crp range check
            if( this.props.crowdsale.crpMin > amount || this.props.crowdsale.crpMax < amount ){
                this.setState({ amountError: true, message: "Amount is invalid." });
                return false;
            }

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

    async joinToCrowdsale(){
        if( ! await this.validationCheck()){
            return;
        }

        this.props.dispatch( statusActions.start() );

        let params = {
            donor: {
                account: this.props.auth.address,
                password: this.state.password,
            },
            crowdsaleAddress: this.props.crowdsale.address,
            amount: await web3._extend.utils.toWei( this.state.amount )
        };

        let result = false;
        let message = 'Joined to crowdsale successfully.';
        try{
            result = await contractHandlers.joinToCrowdsale( params );
        } catch( error ){
            console.error( error );
            result = false;
        }

        if( !result ){
            message = "Fail to join. Try again.";
        } else {
            // add to favorite
            await storageHandlers.add(this.props.auth.address, this.props.mainAddress );
        }

        this.props.dispatch( statusActions.done() );
        this.setState({ error: result ? false : true, message: message });
        this.props.closeAction();
    }

    async componentWillMount(){
        let balance = await web3.eth.getBalance( this.props.auth.address );
        balance = await web3._extend.utils.fromWei( balance.toNumber() );

        this.setState({ balance: balance });
    }

    render() {
        return (
            <div className="common-join-crowdsale">
                <Alert variant="info">
                    Can send at least {this.props.crowdsale.crpMin}, up to {this.props.crowdsale.crpMax} CRP.
                    <br/>Your balance is {this.state.balance} CRP.
                </Alert>
                <TextField required
                    label="amount"
                    error={this.state.amountError}
                    type="number"
                    className="textfield"
                    onChange={this.handleAmountChange}
                    variant="outlined"
                    margin="normal" 
                    InputProps={{ endAdornment: <InputAdornment position="end">CRP</InputAdornment>}}
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
                this.state.amountError || this.state.passwordError || this.state.error ? (
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
                onClick={this.joinToCrowdsale}> Purchase </Button>
        </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(JoinToCrowdsale);
