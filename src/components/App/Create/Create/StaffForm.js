import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';

// icons
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import RemoveIcon from '@material-ui/icons/RemoveCircle';

// local components
import './StaffForm.css';
import utils from '../../../../helpers/utils';

//local defines
const FLOAT_TYPE_DECIMAL_FIX = 1;
const ERROR_MESSAGE_ADDRESS_IS_REQUIRED = "Address is required.";
const ERROR_MESSAGE_ADDRESS_FORMAT = "Invalid address.";
const ERROR_MESSAGE_ADDRESS_IS_DUPLICATED = "Address is duplicated.";
const ERROR_MESSAGE_TOTAL_RATIO_LIMIT = "Total ratio should not grater than 100%";
const ERROR_MESSAGE_RATIO_IS_NOT_NUMBER = "Ratio is not a number.";

/*
 * @author. sena
 * @comment. 'StaffForm' provides title form to create project  
 */
class StaffForm extends Component {
    state = {
        staff: [],
        ratioError: false,
        message: ''
    };

    constructor( props ){
        super( props );

        this.handleAddStaff = this.handleAddStaff.bind(this);
    }

    sendDataToParent(){
        let flag = !this.state.ratioError;
        for( var i = 0; i < this.state.staff.length; i++ ){
            flag = flag && !this.state.staff[i].addressError;
        }

        this.props.sendData({
            values: {
                staff: this.state.staff
            }, 
            flag: flag 
        }); 
    }

    handleAddStaff(){
        let newStaff = this.state.staff.concat({ 
            address: '',
            addressError: false,
            ratio: 0
        });
        this.setState({ staff: newStaff }, () => {
            this.sendDataToParent();
        });
    }

    handleRemoveStaff ( index ) {
        if( index < 0 ){ return; }

        this.state.staff.splice( index, 1 );
        this.setState({ staff: this.state.staff }, () => {
            this.totalRatioValidationCheck();
            //this.sendDataToParent();
        });
    }

    handleAddressChange( index, event ){
        let staff = this.state.staff;
        let address = event.target.value;
        let message = '';

        staff[index].address = address;
        this.addressValidationCheck();
    }

    addressValidationCheck(){
        let staff = this.state.staff;
        let message = '';

        // initialization
        for( var i = 0; i < staff.length; i++ ){
            staff[i].addressError = false;
        }

        //check address format 
        for( var i = 0; i < staff.length; i++ ){
            // ignore empty row
            if( staff[i].ratio == 0 && staff[i].address.length == 0 ) continue;

            if( !utils.isAddress( staff[i].address ) ){
                staff[i].addressError = true;
                message = ERROR_MESSAGE_ADDRESS_FORMAT;
            }
        }

        // check duplication
        for( var i = 0; i < staff.length; i++ ){
            for( var j = 0; j < staff.length; j++ ){
                // ignore empty row
                if( staff[i].address.length == 0 && staff[j].address.length == 0) continue;
                if( i == j ) continue;

                if( staff[i].address == staff[j].address ){
                    staff[i].addressError = true;
                    staff[j].addressError = true;
                    message = ERROR_MESSAGE_ADDRESS_IS_DUPLICATED;
                }
            }
        }

        // set state
        this.setState({ 
            staff: staff,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    handleRatioClick( index ){
        let staff = this.state.staff;
        staff[index].ratio = ''; // let input value empty 

        this.setState({ staff: staff });
    }

    handleRatioChange( index, event ){
        let staff = this.state.staff;
        let ratio = Number(event.target.value);
        /* parseFloat() return empty value when arg is NaN.
           Number() return 0 instead. 극혐 */
        let ratioError = false;
        let message = '';

        if( ratio < 0 ){ ratio = 0; }
        if( ratio > 100 ){ ratio = 100; }

        staff[index].ratio = ratio;

        if( ratio != 0 && staff[index].address.length == 0 ){
            staff[index].addressError = true;
            message = ERROR_MESSAGE_ADDRESS_IS_REQUIRED;
        }
        this.totalRatioValidationCheck();
    }

    totalRatioValidationCheck(){
        let staff = this.state.staff;
        let totalRatio = 0;
        let ratioError = false;
        let message = '';

        for( var i = 1; i < staff.length; i++ ){ // start with 1 = ignore owner ratio
            totalRatio += staff[i].ratio;
        }
        staff[0].ratio = parseFloat( 100 - totalRatio ); // Automatically setting

        if( staff[0].ratio < 0 ){
            ratioError = true;
            message = ERROR_MESSAGE_TOTAL_RATIO_LIMIT;
        }

        this.setState({ 
            staff: staff,
            ratioError: ratioError,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    };

    componentWillMount(){
        let defaultData = this.props.data;
        let staff = [{
            address: this.props.auth.address,
            addressError: false,
            ratio: 100
        }];

        // default value from parent
        if( defaultData.staff != undefined && defaultData.staff.length != 0 ){
            staff = defaultData.staff;
        }

        this.setState({ 
            staff: staff
        }, () => {
            this.sendDataToParent();
        });
    }

    render() {
        return (
            <div className="create-form-staff">
                <div className="create-form-step-header">
                    <h4> Staff </h4>
                    <IconButton aria-label="add staff" onClick={this.handleAddStaff} disabled={this.state.ratioError} > <PersonAddIcon/> </IconButton>
                    <p> {this.state.message} </p>
                </div>
                <div className="create-form-staff-list">
                    {
                        this.state.staff.map( (item, index) => (
                            index == 0 ? (
                                <div className="create-form-staff-owner" key={index}>
                                    <TextField
                                        disabled
                                        label="Owner"
                                        value={this.state.staff[0].address}
                                        className="textfield address"
                                    />
                                    <TextField
                                        disabled
                                        error={this.state.ratioError}
                                        label="Ratio"
                                        type="number"
                                        value={this.state.staff[0].ratio}
                                        className="textfield ratio"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="create-form-staff-list-item" key={index}>
                                    <IconButton onClick={this.handleRemoveStaff.bind(this, index)} aria-label="remove staff"> <RemoveIcon/> </IconButton>
                                    <TextField
                                        id={String(index)}
                                        error={item.addressError}
                                        label="Address"
                                        value={item.address}
                                        onChange={this.handleAddressChange.bind(this, index)}
                                        className="textfield address"
                                    />
                                    <TextField
                                        id={String(index)}
                                        error={this.state.ratioError}
                                        label="Ratio"
                                        type="number"
                                        value={item.ratio}
                                        className="textfield ratio"
                                        helperText="Summary of all ratio cannot over 100%"
                                        onClick={this.handleRatioClick.bind(this, index)}
                                        onChange={this.handleRatioChange.bind(this, index)}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                    />
                                </div>
                            )
                        ))
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(StaffForm);
