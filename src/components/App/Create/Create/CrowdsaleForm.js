import React, { Component } from 'react';
import { connect } from 'react-redux';

// for additional supply
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

// for date time range 
import moment from 'moment';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';

// local components
import './CrowdsaleForm.css';
import ErrorSnackbar from '../../../common/ErrorSnackbar';
import { DATE_TIME_FORMAT } from '../../../../helpers/constants';
import { MOMENT_OPTION_REMOVE_MINUTE_SECOND } from '../../../../helpers/constants';
import { CRP_RANGE_MIN, CRP_RANGE_MAX } from '../../../../helpers/constants';
import { INPUT_NUMBER_MAX } from '../../../../helpers/constants';

//local defines
//const DATE_TIME_FORMAT = "YYYY-MM-DD HH";
//const CRP_RANGE_MIN = 0;
//const CRP_RANGE_MAX = 10000000;
//const INPUT_NUMBER_MAX = 1000000000; // one billion
const ERROR_MESSAGE_DATE_LIMIT = "End date should be later than start date.";
const ERROR_MESSAGE_DATE_IS_REQUIRED = "Date is required.";
const ERROR_MESSAGE_SOFTCAP_IS_REQUIRED = "Softcap is required.";
const ERROR_MESSAGE_HARDCAP_IS_REQUIRED = "Hardcap is required.";
const ERROR_MESSAGE_FIRSTWITHDRAWAL_IS_REQUIRED = "Withdrawal is required.";
const ERROR_MESSAGE_FIRSTWITHDRAWAL_LIMIT = "Withdrawal amount should be smaller than softcap.";
const ERROR_MESSAGE_HARDCAP_LIMIT = "Hardcap should be larger than softcap.";
const ERROR_MESSAGE_INPUT_NUMBER_MAX = "Cannot exceed " + INPUT_NUMBER_MAX;
const ERROR_MESSAGE_EXCHANGERATIO_IS_REQUIRED = "Exchange ratio is required";

const SliderWithTooltip = createSliderWithTooltip( Slider );
const Range = createSliderWithTooltip( Slider.Range )

/*
 * @author. sena
 * @comment. 'CrowdsaleForm' provides :reate form to create project  
 */
class CrowdsaleForm extends Component {
    constructor( props ){
        super( props );
    }

    checkError(){
        let flag = true;
        let crowdsales = this.state.crowdsales;

        for( var i = 0; i < crowdsales.length; i++ ){
            flag = ( !crowdsales[i].date.dateError 
                && !crowdsales[i].firstWithdrawalError && !crowdsales[i].softcapError && !crowdsales[i].hardcapError && !crowdsales[i].exchangeRatioError ) // error check
                && ( crowdsales[i].softcap != 0 && crowdsales[i].hardcap != 0 && crowdsales[i].exchangeRatio != 0 ) // empty value check (except firstWithdrawal)
                && ( crowdsales[i].firstWithdrawal != '' && crowdsales[i].softcap != '' && crowdsales[i].hardcap != '' && crowdsales[i].exchangeRatio != '' ) // empty value check

            if( !flag ){ return flag; } // return if found error
            
        }
        return flag;
    }

    sendDataToParent(){
        let flag = this.checkError();

        this.props.sendData({
            values: {
                crowdsales: this.state.crowdsales
            }, 
            flag: flag 
        }); 
    }

    handleDateChange( index, event, data ){
        let crowdsales = this.state.crowdsales;
        let dateError = false;
        let message = '';

        // check empty
        if( data.startDate == undefined || data.startDate == '' ){
            dateError = true;
            message = ERROR_MESSAGE_DATE_IS_REQUIRED;
        }

        if( data.startDate.isSame( data.endDate, 'second') ){
            dateError = true;
            message = ERROR_MESSAGE_DATE_LIMIT;
        }

        crowdsales[index].date = {
            startDate: data.startDate, 
            endDate: data.endDate,
            dateError: dateError
        };

        this.setState({
            date: { 
                crowdsales: crowdsales,
            },
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    handleFirstWithdrawalClick( index, event ){
        let crowdsales = this.state.crowdsales;
        crowdsales[index].firstWithdrawal = '';

        this.setState({ crowdsales: crowdsales }, () => { this.sendDataToParent() });
    }

    handleSoftcapClick( index, event ){
        let crowdsales = this.state.crowdsales;
        crowdsales[index].softcap = '';

        this.setState({ crowdsales: crowdsales }, () => { this.sendDataToParent() });
    }

    handleHardcapClick( index, event ){
        let crowdsales = this.state.crowdsales;
        crowdsales[index].hardcap = '';

        this.setState({ crowdsales: crowdsales }, () => { this.sendDataToParent() });
    }

    handleExchangeRatioClick( index, event ){
        let crowdsales = this.state.crowdsales;
        crowdsales[index].exchangeRatio = '';

        this.setState({ crowdsales: crowdsales }, () => { this.sendDataToParent() });
    }


    handleFirstWithdrawalChange( index, event ){
        let crowdsales = this.state.crowdsales;
        let firstWithdrawal = Number(event.target.value);
        let firstWithdrawalError = false;
        let message = '';

        if( firstWithdrawal == undefined || firstWithdrawal == 0 ){
            firstWithdrawalError = true;
            message = ERROR_MESSAGE_FIRSTWITHDRAWAL_IS_REQUIRED;
        }
        crowdsales[index].firstWithdrawal = firstWithdrawal;
        crowdsales[index].firstWithdrawalError = firstWithdrawalError;

        this.setState({
            crowdsales: crowdsales,
            message: message
        }, () => {
            this.amountsValidationCheck( index );
        });
    }

    handleSoftcapChange( index, event ){
        let crowdsales = this.state.crowdsales;
        let softcap = Number(event.target.value);
        let softcapError = false;
        let message = '';

        if( softcap == undefined || softcap == 0 ){
            softcapError = true;
            message = ERROR_MESSAGE_SOFTCAP_IS_REQUIRED;
        }

        crowdsales[index].softcap = softcap;
        crowdsales[index].softcapError = softcapError;

        this.setState({
            crowdsales: crowdsales,
            message: message
        }, () => {
            this.amountsValidationCheck( index );
        });
    }

    handleHardcapChange( index, event ){
        let crowdsales = this.state.crowdsales;
        let hardcap = Number(event.target.value);
        let hardcapError = false;
        let message = '';

        if( hardcap == undefined || hardcap == 0 ){
            hardcapError = true;
            message = ERROR_MESSAGE_HARDCAP_IS_REQUIRED;
        }

        crowdsales[index].hardcap = hardcap;
        crowdsales[index].hardcapError = hardcapError;

        this.setState({
            crowdsales: crowdsales,
            message: message
        }, () => {
            this.amountsValidationCheck( index );
        });
    }

    amountsValidationCheck( index ){
        // get values from state
        let crowdsales = this.state.crowdsales;
        let softcap = crowdsales[index].softcap;
        let hardcap = crowdsales[index].hardcap;
        let firstWithdrawal = crowdsales[index].firstWithdrawal;

        // initialize
        let firstWithdrawalError = false;
        let softcapError = false;
        let hardcapError = false;
        let message = '';

        // integer max value check
        if( firstWithdrawal > INPUT_NUMBER_MAX ){
            firstWithdrawalError = true;
            message = ERROR_MESSAGE_INPUT_NUMBER_MAX;
        }
        if( softcap > INPUT_NUMBER_MAX ){
            softcapError = true;
            message = ERROR_MESSAGE_INPUT_NUMBER_MAX;
        }
        if( hardcap > INPUT_NUMBER_MAX ){
            hardcapError = true;
            message = ERROR_MESSAGE_INPUT_NUMBER_MAX;
        }

        // compare
        if( hardcap <= softcap ){
            hardcapError = true;
            softcapError = true;
            message = ERROR_MESSAGE_HARDCAP_LIMIT;
        }
        
        if( firstWithdrawal >= softcap ){
            firstWithdrawalError = true;
            softcapError = true;
            message = ERROR_MESSAGE_FIRSTWITHDRAWAL_LIMIT;
        }

        crowdsales[index].firstWithdrawalError = firstWithdrawalError;
        crowdsales[index].softcapError = softcapError;
        crowdsales[index].hardcapError = hardcapError;

        this.setState({
            crowdsales: crowdsales,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    handleAdditionalSupplyChange( index, value ){
        let crowdsales = this.state.crowdsales;

        if( typeof(value) == "object" ){ value = Number( value.target.value ); }
        if( value > 500 ) value = 500;

        crowdsales[index].additionalSupply = value;

        this.setState({
            crowdsales: crowdsales
        }, () => {
            this.sendDataToParent();
        });
    }

    handleExchangeRatioChange( index, event ){
        let crowdsales = this.state.crowdsales;
        let exchangeRatio = Number(event.target.value);
        let exchangeRatioError = false;
        let message = '';

        if( exchangeRatio == undefined || exchangeRatio == 0 ){
            exchangeRatioError = true;
            message = ERROR_MESSAGE_EXCHANGERATIO_IS_REQUIRED;
        }

        crowdsales[index].exchangeRatio = exchangeRatio;
        crowdsales[index].exchangeRatioError = exchangeRatioError;

        this.setState({
            crowdsales: crowdsales,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    handleCrpRangeChange( index, value ){
        let crowdsales = this.state.crowdsales;
        crowdsales[index].crpRange = {
            min: value[0],
            max: value[1]
        };

        this.setState({
            crowdsales: crowdsales
        }, () => {
            this.sendDataToParent();
        });
    }

    handleCrpRangeInputChange( index, type, event ){
        let crowdsale = this.state.crowdsales[index];
        let value = Number( event.target.value );

        if( value < CRP_RANGE_MIN ){ value = CRP_RANGE_MIN; }
        else if( value > CRP_RANGE_MAX ){ value = CRP_RANGE_MAX; }

        if( type == 'min' ){
            crowdsale.crpRange.min = value;
        } else if( type == 'max' ){
            crowdsale.crpRange.max = value;
        }

        if( crowdsale.crpRange.min > crowdsale.crpRange.max ){  // sort
            let temp = crowdsale.crpRange.min;
            crowdsale.crpRange.min = crowdsale.crpRange.max;
            crowdsale.crpRange.max = temp;
        }

        let crowdsales = this.state.crowdsales;
        crowdsales[index] = crowdsale;

        this.setState({
            crowdsales: crowdsales
        }, () => {
            this.sendDataToParent();
        });
    }

    componentWillMount(){
        let defaultData = this.props.data.crowdsales; //TODO: crowdsale could be more than 1
        let crowdsales = [{
            date: {
                startDate: moment().add(1, 'days').set( MOMENT_OPTION_REMOVE_MINUTE_SECOND ),
                endDate: moment().add(30, 'days').set( MOMENT_OPTION_REMOVE_MINUTE_SECOND ),
                dateError: false
            },
            firstWithdrawal: 0,
            firstWithdrawalError: false,
            softcap: 0,
            softcapError: false,
            hardcap: 0,
            hardcapError: false,
            additionalSupply: 50,
            exchangeRatio: 0,
            exchangeRatioError: false,
            crpRange: {
                min: 1,
                max: 5000000
            }
        }];

        // get data from create page. (back/next)
        if( defaultData != undefined && defaultData.length != 0 ){
            crowdsales = defaultData;
        }

        this.setState({ 
            crowdsales: crowdsales,
            message: ''
        }, () => {
            this.sendDataToParent();
        });
    }

    render() {
        const locale = { format: DATE_TIME_FORMAT };
        const trackStyle = {
            backgroundColor: '#3f51b5'
        };
        const handleStyle = {
            borderColor: '#3f51b5',
            backgroundColor: 'white'
        };

        return (
            <div className="create-form-crowdsale">
                <div className="create-form-step-header">
                    <h4> Crowdsale </h4>
                    <p> {this.state.message} </p>
                </div>
                { this.state.crowdsales.map( (item, index) => (
                    <div key={index}>
                        <DatetimeRangePicker 
                            timePicker
                            timePicker24Hour
                            timePickerIncrement={5}
                            locale={locale}
                            startDate={item.date.startDate}
                            endDate={item.date.endDate}
                            //minDate={moment().add(1, 'days')}
                            className="create-form-crowdsale-items"
                            onApply={this.handleDateChange.bind(this, index)}>
                            <TextField
                                error={item.date.dateError}
                                id="startDate"
                                label="Start date"
                                value={moment(item.date.startDate).format( DATE_TIME_FORMAT )}
                                className="textfield"
                                onChange={this.handleDateChange.bind(this, index)}
                            /> 
                            <TextField
                                error={item.date.dateError}
                                id="endDate"
                                label="End date"
                                value={moment(item.date.endDate).format( DATE_TIME_FORMAT )}
                                className="textfield"
                                onChange={this.handleDateChange.bind(this, index)}
                            />
                        </DatetimeRangePicker>
                        <div className="create-form-crowdsale-items">
                            <TextField
                                id="fitstWithdrawal"
                                label="First Withdrawal"
                                type="number"
                                value={item.firstWithdrawal}
                                className="textfield"
                                error={item.firstWithdrawalError}
                                onClick={this.handleFirstWithdrawalClick.bind(this, index)}
                                onChange={this.handleFirstWithdrawalChange.bind(this, index)}
                                helperText="Withdrawal amount should be smaller than softcap."
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                }}
                            />
                            <TextField
                                id="softcap"
                                label="Softcap"
                                type="number"
                                value={item.softcap}
                                className="textfield"
                                error={item.softcapError}
                                onClick={this.handleSoftcapClick.bind(this, index)}
                                onChange={this.handleSoftcapChange.bind(this, index)}
                                helperText="Softcap should be bigger than first withdrawal."
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                }}
                            />
                            <TextField
                                id="hardcap"
                                label="Hardcap"
                                type="number"
                                value={item.hardcap}
                                className="textfield"
                                error={item.hardcapError}
                                onClick={this.handleHardcapClick.bind(this, index)}
                                onChange={this.handleHardcapChange.bind(this, index)}
                                helperText="Hardcap should be bigger than softcap."
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                }}
                            />
                        </div>
                        <div className="create-form-crowdsale-additionalsupply">
                            <Typography variant="caption" gutterBottom align="left">Additional supply</Typography>
                            <SliderWithTooltip 
                                className="slider-additionalsupply"
                                min={0} max={500}
                                step={10}
                                value={item.additionalSupply}
                                onChange={this.handleAdditionalSupplyChange.bind(this, index)}
                                trackStyle={trackStyle}
                                handleStyle={handleStyle}
                                tipFormatter={(value) => { return `${value} %`; }}
                            />
                            <TextField
                                id="additionalSupply"
                                type="number"
                                value={item.additionalSupply}
                                className="textfield tail"
                                onChange={this.handleAdditionalSupplyChange.bind(this, index)}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                                }}
                            />
                        </div>
                        <div className="create-form-crowdsale-items">
                            <TextField
                                id="exchangeRatio"
                                label="Exchange ratio"
                                type="number"
                                value={item.exchangeRatio}
                                className="textfield"
                                error={item.exchangeRatioError}
                                onClick={this.handleExchangeRatioClick.bind(this, index)}
                                onChange={this.handleExchangeRatioChange.bind(this, index)}
                                InputProps={{
                                    startAdornment: <InputAdornment className="create-form-crowdsale-adornment" position="start"> 1 CRP : </InputAdornment>,
                                    endAdornment: <InputAdornment position="end">{this.props.data.symbol}</InputAdornment>
                                }}
                            />
                        </div>
                        <div className="create-form-crowdsale-crprange">
                            <Typography variant="caption" gutterBottom align="left">CRP Range ({CRP_RANGE_MIN}~{CRP_RANGE_MAX})</Typography>
                            <Range 
                                min={CRP_RANGE_MIN} max={CRP_RANGE_MAX}
                                step={1}
                                value={[item.crpRange.min, item.crpRange.max]}
                                onChange={this.handleCrpRangeChange.bind(this, index)}
                                trackStyle={[trackStyle]}
                                handleStyle={handleStyle}
                                tipFormatter={(value) => { return `${value} CRP`; }}
                            />
                            <TextField
                                id="crpRangeMin"
                                type="number"
                                value={item.crpRange.min}
                                className="textfield tail-big"
                                onChange={this.handleCrpRangeInputChange.bind(this, index, 'min')}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                }}
                            />
                             ~
                            <TextField
                                id="crpRangeMax"
                                type="number"
                                value={item.crpRange.max}
                                className="textfield tail-big"
                                onChange={this.handleCrpRangeInputChange.bind(this, index, 'max')}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(CrowdsaleForm);
