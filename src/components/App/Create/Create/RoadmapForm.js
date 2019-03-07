import React, { Component } from 'react';
import { connect } from 'react-redux';

// bootstrap
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Alert from 'react-bootstrap/Alert';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import Divider from '@material-ui/core/Divider';

// for date time range
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

// icons
import InfoIcon from '@material-ui/icons/Info';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import RemoveIcon from '@material-ui/icons/RemoveCircle';

// local components
import './RoadmapForm.css';
import { DATE_TIME_FORMAT } from '../../../../helpers/constants';
import { MOMENT_OPTION_REMOVE_MINUTE_SECOND } from '../../../../helpers/constants';

//local defines
const moment = extendMoment( Moment );
const ERROR_MESSAGE_DATE_IS_REQUIRED = "Date is required.";
const ERROR_MESSAGE_DATE_SHOULD_LARGER_THEN_BEFORE = "Date must be after the previous roadmap.";
const ERROR_MESSAGE_DUPLICATED_WITH_CROWDSALE = "Date is overlaped by crowdsale.";
const ERROR_MESSAGE_DUPLICATED_WITH_OTHERS = "Date is overlapped.";
const ERROR_MESSAGE_WITHDRAW_IS_REQUIRED = "Address is required.";
const ERROR_MESSAGE_TOTAL_WITHDRAW_LIMIT = "Total withdraw amount exceeds crowdsale softcap.";

/*
 * @author. sena
 * @comment. 'RoadmapForm' provides roadmap form to create project  
 */
class RoadmapForm extends Component {
    state = {
        roadmaps: [],
        totalWithdrawalError: false,
        message: ''
    };

    constructor( props ){
        super( props );

        this.handleAddRoadmap = this.handleAddRoadmap.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
    }

    sendDataToParent(){
        let flag = ((!this.state.totalWithdrawalError) && (this.state.remainAmounts == 0));
        for( var i = 0; i < this.state.roadmaps.length; i++ ){
            if( this.state.roadmaps[i].date.dateError ){
                flag = false;
                break;
            }
        }

        this.props.sendData({
            values: {
                roadmaps: this.state.roadmaps,
                remainAmounts: this.state.remainAmounts,
                totalWithdrawal: this.state.totalWithdrawal
            }, 
            flag: flag 
        }); 
    }

    handleAddRoadmap(){
        let newRoadmap = this.state.roadmaps.concat({ 
            date: {
                startDate: moment().set( MOMENT_OPTION_REMOVE_MINUTE_SECOND ),
                endDate: moment().add(1, 'days').set( MOMENT_OPTION_REMOVE_MINUTE_SECOND )
            },
            withdrawal: 0
        });
        this.setState({ roadmaps: newRoadmap }, async () => {
            await this.roadmapDateValidation();
            this.calculateRemainAmount();
        });
    }

    handleRemoveRoadmap( index ) {
        if( index < 0 ){ return; }

        this.state.roadmaps.splice( index, 1 );
        this.setState({ roadmaps: this.state.roadmaps }, async () => {
            await this.roadmapDateValidation();
            this.calculateRemainAmount();
        });
    }

    handleDateChange( index, event, data ){
        let roadmaps = this.state.roadmaps;
        let dateError = false;
        let message = '';
        let date = {};

        if( data.startDate == undefined || data.startDate == '' ){
            dateError = true;
            message = ERROR_MESSAGE_DATE_IS_REQUIRED;
        }

        roadmaps[index].date = {
            startDate: data.startDate,
            endDate: data.endDate,
            dateError: dateError
        }

        this.setState({
            roadmaps: roadmaps,
            message: message
        }, () => {
            this.roadmapDateValidation();
        });
    }

    roadmapDateValidation(){
        let roadmaps = this.state.roadmaps;
        let crowdsales = this.props.data.crowdsales;
        let message = '';

        // initialize
        for( var i = 0; i < roadmaps.length; i++ ){
            roadmaps[i].date.dateError = false;
        }

        // check duplication with crowdsale date
        for( var i = 0; i < roadmaps.length; i++ ){
            for( var j = 0; j < crowdsales.length; j++ ){
                let crowdsaleRange = moment.range( crowdsales[j].date.startDate, crowdsales[j].date.endDate );
                let thisRoadmapRange = moment.range( roadmaps[i].date.startDate, roadmaps[i].date.endDate );

                if( crowdsaleRange.overlaps( thisRoadmapRange ) ){
                    roadmaps[i].date.dateError = true;
                    message = ERROR_MESSAGE_DUPLICATED_WITH_CROWDSALE;
                }
            }
        }

        // check duplication with other roadmaps
        for( var i = 0; i < roadmaps.length; i++ ){
            for( var j = 0; j < roadmaps.length; j++ ){
                if( i == j ) continue;
                let targetRange = moment.range( roadmaps[i].date.startDate, roadmaps[i].date.endDate );
                let thisRoadmapRange = moment.range( roadmaps[j].date.startDate, roadmaps[j].date.endDate );

                if( targetRange.overlaps( thisRoadmapRange ) ){
                    roadmaps[j].date.dateError = true;
                    message = ERROR_MESSAGE_DUPLICATED_WITH_OTHERS;
                }
            }
        }

        // check start date is before than previous roadmap.
        for( var i = 0; i < roadmaps.length; i++ ){
            if( i > 0 ){
                if( (roadmaps[i].date.startDate).isBefore( roadmaps[i-1].date.startDate ) ){
                    roadmaps[i].date.dateError = true;
                    message = ERROR_MESSAGE_DATE_SHOULD_LARGER_THEN_BEFORE;
                }
            }
        }

        this.setState({
            roadmap: roadmaps,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    handleWithdrawClick( index, event ){
        let roadmaps = this.state.roadmaps;
        roadmaps[index].withdrawal = ''; // let input value empty

        this.setState({ roadmaps: roadmaps }, () => {
            this.sendDataToParent();
        });
    }

    handleWithdrawChange( index, event ){
        let roadmaps = this.state.roadmaps;
        let withdrawal = Number(event.target.value);
        let totalWithdrawalError = false;
        let message = this.state.message;

        if( withdrawal < 0 ){ withdrawal = 0; }
        if( withdrawal == '' || withdrawal == undefined ) { withdrawal = 0; }

        roadmaps[index].withdrawal = withdrawal;

        this.setState({
            roadmaps: roadmaps,
            message: message
        }, () => {
            this.calculateRemainAmount();
        });
    }

    calculateRemainAmount(){
        // calculate total ~ remain amounts
        let roadmaps = this.state.roadmaps;
        let totalWithdrawalError = false;
        let message = this.state.message;
        let totalWithdrawal = 0;

        for( var i = 0; i < roadmaps.length; i++ ){
            totalWithdrawal += roadmaps[i].withdrawal;
        }

        let remainAmounts = (this.props.data.crowdsales[0].softcap - this.props.data.crowdsales[0].firstWithdrawal - totalWithdrawal);
        if( remainAmounts < 0 ){
            totalWithdrawalError = true;
            message = ERROR_MESSAGE_TOTAL_WITHDRAW_LIMIT;
        }

        this.setState({
            totalWithdrawal: totalWithdrawal,
            totalWithdrawalError: totalWithdrawalError,
            remainAmounts: remainAmounts,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    componentWillMount(){
        let defaultData = this.props.data;
        // it changes global variable of crowdsale. so make new moment.
        let crowdsaleEndDate = moment(this.props.data.crowdsales[0].date.endDate);
        let roadmaps = [{
            date: {
                startDate: moment(crowdsaleEndDate.add(1, 'days')),
                endDate: moment(crowdsaleEndDate.add(2, 'days'))
            },
            withdrawal: 0
        }];
        let remainAmounts = (this.props.data.crowdsales[0].softcap - this.props.data.crowdsales[0].firstWithdrawal);
        let totalWithdrawal = 0;
        
        // default value from parent
        if( defaultData.roadmaps != undefined && defaultData.roadmaps.length != 0 ){
            roadmaps = defaultData.roadmaps;
        }

        if( defaultData.remainAmounts != undefined ){
            remainAmounts = defaultData.remainAmounts;
        }

        if( defaultData.totalWithdrawal != undefined ){
            totalWithdrawal = defaultData.totalWithdrawal;
        }

        this.setState({ 
            roadmaps: roadmaps,
            totalWithdrawal: totalWithdrawal,
            totalWithdrawalError: false,
            remainAmounts: remainAmounts,
            message: ''
        }, () => {
            this.roadmapDateValidation();
        });
    }

    render() {
        const locale = { 
            format: DATE_TIME_FORMAT,
        };

        const remainAmountsPopover = (
            <Popover title="Remain amounts" className="crowdsale-info-popover">
                <h5> Crowdsale info </h5>
                Please Check below datas and create roadmaps.
                <div  className="crowdsale-info-popover-number">
                    <p> Softcap : <strong> {this.props.data.crowdsales[0].softcap} </strong> CRP </p>
                    <p> First Withdraw : <strong> {this.props.data.crowdsales[0].firstWithdrawal} </strong> CRP </p>
                    <p> Roadmap Total : <strong> {this.state.totalWithdrawal} </strong> CRP </p>
                    <Divider/>
                    <p> Remain : <strong> {this.state.remainAmounts} </strong> CRP </p> 
                    <Alert variant="warning"> <InfoIcon className="v-middle"/> <span className="v-middle">Make remain amounts to 0.</span> </Alert>
                </div>
            </Popover>
        );

        return (
            <div className="create-form-roadmap">
                <div className="create-form-step-header">
                    <h4> Roadmap </h4>
                    <IconButton aria-label="add roadmap" onClick={this.handleAddRoadmap} disabled={this.state.remainAmounts <= 0}> <PlaylistAddIcon/> </IconButton>
                    <OverlayTrigger trigger="click" defaultShow={true} placement="right" overlay={remainAmountsPopover} delay={3000}>
                        <IconButton aria-label="show remains"> <InfoIcon/> </IconButton>
                    </OverlayTrigger>
                    <p> {this.state.message} </p>
                </div>
                <div className="create-form-roadmap-list">
                    {
                        this.state.roadmaps.map( (item, index) => (
                            <div className="create-form-roadmap-list-item" key={index}>
                                {(index == 0 ? null : <IconButton onClick={this.handleRemoveRoadmap.bind(this, index)} aria-label="remove roadmap"> <RemoveIcon/> </IconButton>)}
                                <DatetimeRangePicker
                                    autoApply
                                    minDate={this.props.data.crowdsales[0].date.endDate}
                                    timePicker
                                    timePicker24Hour
                                    timePickerIncrement={60}
                                    locale={locale}
                                    startDate={item.date.startDate}
                                    endDate={item.date.endDate}
                                    className="datepicker"
                                    onApply={this.handleDateChange.bind(this, index)}>
                                    <TextField
                                        id={String(index)}
                                        error={item.date.dateError}
                                        label="Start date"
                                        value={moment( item.date.startDate ).format( DATE_TIME_FORMAT )}
                                        className="textfield"
                                    />
                                    <TextField
                                        id={String(index)}
                                        error={item.date.dateError}
                                        label="End date"
                                        value={moment( item.date.endDate ).format( DATE_TIME_FORMAT )}
                                        className="textfield"
                                    />
                                </DatetimeRangePicker>
                                <TextField
                                    id="withdrawal"
                                    label="Withdraw"
                                    type="number"
                                    value={item.withdrawal}
                                    className="textfield"
                                    error={item.withdrawalError||this.state.totalWithdrawalError}
                                    onClick={this.handleWithdrawClick.bind(this, index)}
                                    onChange={this.handleWithdrawChange.bind(this, index)}
                                    helperText="Cannot exceeds crowdsale's softcap"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">CRP</InputAdornment>
                                    }}
                                />

                        </div>
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
export default connect(mapStateToProps)(RoadmapForm);
