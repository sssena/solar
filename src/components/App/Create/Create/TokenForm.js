import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// local components
import './TokenForm.css';

//local defines
const ERROR_MESSAGE_SYMBOL_LENGTH = "Symbol should be 3~4 characters.";
const ERROR_MESSAGE_SYMBOL_IS_REQUIRED = "Symbol is required.";
const ERROR_MESSAGE_NAME_IS_REQUIRED = "Token name is required.";

/*
 * @author. sena
 * @comment. 'TokenForm' provides title form to create project  
 */
class TokenForm extends Component {
    state = {
        name: '',
        symbol: '',
        nameError: false,
        symbolError: false
    };

    constructor( props ){
        super( props );

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleSymbolChange = this.handleSymbolChange.bind(this);
    }

    sendDataToParent(){
        this.props.sendData({
            values: {
                name: this.state.name,
                symbol: this.state.symbol
            }, 
            flag: ( !this.state.nameError && !this.state.symbolError ) && ( this.state.name.length > 0 && this.state.symbol.length > 0 )
        });
    }

    handleNameChange( e ){
        let name = e.target.value;
        let nameError = false;
        let message = '';

        if( this.state.name.length == 0 ){
            nameError = true;
            message = ERROR_MESSAGE_NAME_IS_REQUIRED;
        }

        this.setState({ 
            name: name,
            nameError: nameError
        }, () => {
            this.sendDataToParent();
        });
    }

    handleSymbolChange( e ){
        let symbol = (e.target.value).toUpperCase();
        let symbolError = false;
        let message = '';

        let reg = new RegExp( '[^a-zA-Z]', 'g' );
        symbol = symbol.replace( reg, '' );

        if( symbol.length > 4 ){
            symbol = symbol.slice( 0, 4 );
        }

        // symbol validation
        if( symbol.length == 0 ){
            symbolError = true;
            message = ERROR_MESSAGE_SYMBOL_IS_REQUIRED;
        } else if ( symbol.length < 3 ){
            symbolError = true;
            message = ERROR_MESSAGE_SYMBOL_LENGTH;
        }

        this.setState({ 
            symbol: symbol,
            symbolError: symbolError
        }, () => {
            this.sendDataToParent();
        });
    }

    componentDidMount(){
        let defaultData = this.props.data;
        let name = '';
        let symbol = '';

        if( defaultData.name != undefined && defaultData.name.length > 0 && defaultData.symbol != undefined && defaultData.symbol.length > 0 ){
            name = defaultData.name;
            symbol = defaultData.symbol;
        }

        this.setState({ 
            name: name, 
            symbol: symbol
        }, () => {
            this.sendDataToParent();
        });
    }

    render() {
        return (
            <div className="create-form-token">
                <h4 className="create-form-step-header"> Token </h4>
                <TextField
                    id="name"
                    label="Token name"
                    placeholder="Token Name"
                    value={this.state.name}
                    error={this.state.nameError ? true : false}
                    onChange={this.handleNameChange}
                    className="textfield"
                    margin="normal"
                />
                <TextField
                    id="symbol"
                    label="Token symbol"
                    placeholder="Token Symbol"
                    value={this.state.symbol}
                    error={this.state.symbolError ? true : false}
                    onChange={this.handleSymbolChange}
                    className="textfield"
                    margin="normal"
                    helperText="Symbols can only contain uppercase letters of 3~4 digits."
                />
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(TokenForm);
