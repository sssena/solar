import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import Slider from '@material-ui/lab/Slider';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './AddCrowdsalePoll.css';
import { web3 } from '../../../../../../web3';
import { contractHandlers } from '../../../../../../helpers/contracts';
import { statusActions } from '../../../../../../actions';
import { DATE_TIME_FORMAT } from '../../../../../../helpers/constants';
import { CRP_RANGE_MIN, CRP_RANGE_MAX } from '../../../../../../helpers/constants';
import { INPUT_NUMBER_MAX } from '../../../../../../helpers/constants';
import utils from '../../../../../../helpers/utils';


// defines
const ERROR_MESSAGE_DATE_LIMIT = "End date should be later than start date.";
const ERROR_MESSAGE_SALE_DATE_LIMIT = "Sale can start after voting is over.";
const ERROR_MESSAGE_DATE_IS_REQUIRED = "Date is required.";
const ERROR_MESSAGE_MIN_RANGE = "Min should be a number between 0 ~ MAX.";
const ERROR_MESSAGE_MAX_RANGE = "Max should be a number between MIN ~ " + CRP_RANGE_MAX + ".";
const ERROR_MESSAGE_PREMIUM_DATE_RANGE = "Premium End date is invalid.";
const ERROR_MESSAGE_INVALID_VALUE = "Value is invalid.";

/*
 * @author. sena
 * @comment. 'AddCrowdsalePoll' is a pop-up view to join crowdsale.
 */
class AddCrowdsalePoll extends Component {
    state = {
        dateError: false,
        saleDateError: false,
        premiumError: false,
        hardcapError: false,
        minError: false,
        maxError: false,
        rateError: false,
        startDate: moment(),
        endDate: moment().add(10, 'days'),
        saleStartDate: moment().add(11, 'days'),
        saleEndDate: moment().add(20, 'days'),
        premiumLimit: {
            startDate: moment().add(12, 'days'),
            endDate: moment().add(18, 'days'),
        },
        premiumDate: moment().add(14, 'days'),
        symbol: ''
    };

    constructor(){
        super();

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSaleDateChange = this.handleSaleDateChange.bind(this);
        this.handlePremiumDateChange = this.handlePremiumDateChange.bind(this);
        this.handlePremiumDateSliderChange = this.handlePremiumDateSliderChange.bind(this);
        this.handleChange = this.handleDateChange.bind(this);
        this.handleMinChange = this.handleMinChange.bind(this);
        this.handleMaxChange = this.handleMaxChange.bind(this);
        this.handleRateChange = this.handleRateChange.bind(this);
        this.handleHardcapChange = this.handleHardcapChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.validationCheck = this.validationCheck.bind(this);
        this.validateIntegerValues = this.validateIntegerValues.bind(this);
        this.createCrowdsalePoll = this.createCrowdsalePoll.bind(this);
    }

    handleDateChange = ( event, data ) => {
        this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            dateError: false
        });
    }

    handleSaleDateChange = ( event, data ) => {
        let saleStartDate = data.startDate.clone();
        let saleEndDate = data.endDate.clone();

        // can select 20% ~ 80% points
        let term = (saleEndDate.diff( saleStartDate, 'days' )) * 0.2 ;
        let premiumLimit = {
            startDate: saleStartDate.add( term, 'days' ),
            endDate: saleEndDate.subtract( term, 'days' ),
        };

        this.setState({
            saleStartDate: data.startDate,
            saleEndDate: data.endDate,
            saleDateError: false,
            premiumLimit: premiumLimit
        });
    }

    handlePremiumDateChange = ( event, data ) => {
        this.setState({ premiumDate: data.startDate });
    }

    handlePremiumDateSliderChange = ( event, value ) => {
        this.setState({ premiumDate: moment.unix(value) })
    }

    handleMinChange = ( event ) => {
        let min = Number( event.target.value );
        this.setState({ min: min, minError: false });
    }

    handleMaxChange = ( event ) => {
        let max = Number( event.target.value );
        this.setState({ max: max, maxError: false });
    }

    handleRateChange = ( event ) => {
        let rate = Number( event.target.value );
        this.setState({ rate: rate, rateError: false });
    }

    handleHardcapChange = ( event ) => {
        let hardcap = Number( event.target.value );
        this.setState({ hardcap: hardcap, hardcapError: false });
    }

    handlePasswordChange = ( event ) => {
        this.setState({ password: event.target.value, passwordError: false });
    }

    validateIntegerValues = ( value ) => {
        if( value == undefined || isNaN( value ) ){ return false; }
        if( value < 0 || value > INPUT_NUMBER_MAX ){ return false ; }

        return true;
    }

    async validationCheck() {
        // 1. check date
        if( this.state.startDate == undefined || this.state.startDate == '' || this.state.endDate == undefined || this.state.endDate == '' ){
            this.setState({ dateError: true, message: ERROR_MESSAGE_DATE_IS_REQUIRED });
            return false ;
        }

        if( this.state.startDate.isSame( this.state.endDate, 'second') ){
            this.setState({ dateError: true, message: ERROR_MESSAGE_DATE_LIMIT });
            return false ;
        }

        // 2. check sale date
        if( this.state.saleStartDate == undefined || this.state.saleStartDate == '' 
            || this.state.saleEndDate == undefined || this.state.saleEndDate == '' ){
            this.setState({ saleDateError: true, message: ERROR_MESSAGE_DATE_IS_REQUIRED });
            return false ;
        }

        if( this.state.saleStartDate.isBefore( this.state.endDate, 'second') ){
            this.setState({ saleDateError: true, message: ERROR_MESSAGE_SALE_DATE_LIMIT });
            return false ;
        }

        if( this.state.saleStartDate.isSame( this.state.saleEndDate, 'second') ){
            this.setState({ saleDateError: true, message: ERROR_MESSAGE_DATE_LIMIT });
            return false ;
        }

        // 3. check premium date
        if( this.state.premiumDate == undefined || this.state.premiumDate == '' ){
            this.setState({ premiumError: true, message: ERROR_MESSAGE_DATE_IS_REQUIRED });
            return false ;
        }

        if( !(this.state.premiumDate.isAfter( this.state.premiumLimit.startDate ) && this.state.premiumDate.isBefore( this.state.premiumLimit.endDate )) ){
            this.setState({ premiumError: true, message: ERROR_MESSAGE_PREMIUM_DATE_RANGE });
            return false ;
        }

        // 4. check hardcap, min, max, rate
        // min additional check
        if( !this.validateIntegerValues( this.state.min ) ){
            this.setState({ minError: true, message: ERROR_MESSAGE_INVALID_VALUE });
            return false ;
        }
        if( this.state.min > this.state.max || this.state.min < CRP_RANGE_MIN ){
            this.setState({ minError: true, message: ERROR_MESSAGE_MIN_RANGE });
            return false ;
        }

        // max additional check
        if( !this.validateIntegerValues( this.state.max ) ){
            this.setState({ maxError: true, message: ERROR_MESSAGE_INVALID_VALUE });
            return false ;
        }
        if( this.state.max < this.state.min || this.state.max > CRP_RANGE_MAX ){
            this.setState({ maxError: true, message: ERROR_MESSAGE_MAX_RANGE });
            return false ;
        }

        if( !this.validateIntegerValues( this.state.rate ) ){
            this.setState({ rateError: true, message: ERROR_MESSAGE_INVALID_VALUE });
            return false ;
        }

        if( !this.validateIntegerValues( this.state.hardcap ) ){
            this.setState({ hardcapError: true, message: ERROR_MESSAGE_INVALID_VALUE });
            return false ;
        }

        // 5. check password
        let result = false;
        try{
            result = await web3.personal.unlockAccount( this.props.auth.address, this.state.password );
            if( !result ){
                this.setState({ passwordError: true, message: "Check your password." });
                result = false;
            }
        } catch( error ){
            if( error.message.includes("could not decrypt key with given passphrase") ){
                this.setState({ passwordError: true, message: "Check your password." });
            } else {
                console.error(error);
            }
            result = false;
        }

        return result;
    }

    async createCrowdsalePoll(){
        if( !await this.validationCheck() ){ return; }

        this.props.dispatch( statusActions.start() );
        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.password
            },
            address: this.props.address,
            hardcap: await web3._extend.utils.toWei( this.state.hardcap ),
            min: await web3._extend.utils.toWei( this.state.min ),
            max: await web3._extend.utils.toWei( this.state.max ),
            rate: this.state.rate,
            startDate: this.state.startDate.format('X'),
            endDate: this.state.endDate.format('X'),
            saleStartDate: this.state.saleStartDate.format('X'),
            saleEndDate: this.state.saleEndDate.format('X'),
            premiumDate: this.state.premiumDate.format('X'),
        };

        let message = '';
        let result = await contractHandlers.addCrowdsalePoll( params );
        if( !result ){
            message = "Fail to Create. Try again.";
        }

        this.props.dispatch( statusActions.done() );
        this.setState({ error: result ? false : true, message: message });

        if( result ){ this.props.closeAction(); }
    }

    async componentWillMount(){
        let token = await contractHandlers.getTokenContract( this.props.address );
        this.setState({ symbol: token.symbol() });
    }

    render() {
        const locale = { format: DATE_TIME_FORMAT };

        return (
            <div className="add-crowdsale-poll">
                <DatetimeRangePicker
                    timePicker
                    timePicker24Hour
                    timePickerIncrement={5}
                    locale={locale}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    minDate={moment()}
                    onApply={this.handleDateChange}>
                    <TextField
                        error={this.state.dateError}
                        id="pollStartDate"
                        label="Poll Start Date"
                        value={moment(this.state.startDate).format( DATE_TIME_FORMAT )}
                        className="textfield date"
                        onChange={this.handleDateChange}
                    />
                    <TextField
                        error={this.state.dateError}
                        id="endDate"
                        label="Poll End Date"
                        value={moment(this.state.endDate).format( DATE_TIME_FORMAT )}
                        className="textfield date"
                        onChange={this.handleDateChange}
                    />
                </DatetimeRangePicker>
                <div>
                    <Slider 
                        disabled
                        className="date-slider-background"
                        value={0}
                    />
                    <Slider 
                        className="date-slider"
                        value={this.state.premiumDate.unix()}
                        min={this.state.premiumLimit.startDate.unix()}
                        max={this.state.premiumLimit.endDate.unix()}
                        step={60*60}
                        onChange={this.handlePremiumDateSliderChange}
                    />
                </div>
                <DatetimeRangePicker
                    timePicker
                    timePicker24Hour
                    timePickerIncrement={5}
                    locale={locale}
                    startDate={this.state.saleStartDate}
                    endDate={this.state.saleEndDate}
                    minDate={this.state.endDate}
                    onApply={this.handleSaleDateChange}>
                    <TextField
                        error={this.state.saleDateError}
                        label="Sale Start Date"
                        value={moment(this.state.saleStartDate).format( DATE_TIME_FORMAT )}
                        className="textfield date"
                        onChange={this.handleSaleDateChange}
                    />
                    <TextField
                        error={this.state.saleDateError}
                        label="Sale End Date"
                        value={moment(this.state.saleEndDate).format( DATE_TIME_FORMAT )}
                        className="textfield date"
                        onChange={this.handleSaleDateChange}
                    />
                </DatetimeRangePicker>
                <DatetimeRangePicker
                    timePicker
                    timePicker24Hour
                    timePickerIncrement={5}
                    singleDatePicker
                    locale={locale}
                    saleStartDate={this.state.premiumDate}
                    minDate={this.state.premiumLimit.startDate}
                    maxDate={this.state.premiumLimit.endDate}
                    onApply={this.handlePremiumDateChange}>
                    <TextField
                        error={this.state.premiumError}
                        id="premiumDate"
                        label="Premium End Date"
                        value={moment(this.state.premiumDate).format( DATE_TIME_FORMAT )}
                        className="textfield premium-date"
                        onChange={this.handlePremiumDateChange}
                    />
                </DatetimeRangePicker>

                <div>
                    <TextField required
                        label="Min"
                        error={this.state.minError}
                        type="number"
                        className="textfield min"
                        onChange={this.handleMinChange}
                        variant="outlined"
                        margin="normal" 
                        InputProps={{endAdornment: <InputAdornment position="end">CRP</InputAdornment>}}
                    />
                    <TextField required
                        label="Max"
                        error={this.state.maxError}
                        type="number"
                        className="textfield max"
                        onChange={this.handleMaxChange}
                        variant="outlined"
                        margin="normal" 
                        InputProps={{endAdornment: <InputAdornment position="end">CRP</InputAdornment>}}
                    />
                </div>

                <TextField required
                    label="Rate"
                    error={this.state.rateError}
                    type="number"
                    className="textfield"
                    onChange={this.handleRateChange}
                    variant="outlined"
                    margin="normal" 
                    InputProps={{ startAdornment: <InputAdornment position="start">1CRP:</InputAdornment>,
                        endAdornment: <InputAdornment position="end">{this.state.symbol}</InputAdornment>}}
                    />

                <TextField required
                    label="Hardcap"
                    error={this.state.hardcapError}
                    type="number"
                    className="textfield"
                    onChange={this.handleHardcapChange}
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
                this.state.hardcapError || this.state.passwordError || this.state.dateError || this.state.premiumError || this.state.saleDateError || this.state.minError || this.state.maxError || this.state.rateError ? (
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
                onClick={this.createCrowdsalePoll}> Create </Button>
        </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(AddCrowdsalePoll);
