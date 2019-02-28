import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';

// for date time range
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

// icons
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import RemoveIcon from '@material-ui/icons/RemoveCircle';

// local components
import './RoadmapForm.css';
import { DATE_TIME_FORMAT } from '../../../../helpers/constants';
import { MOMENT_OPTION_REMOVE_MINUTE_SECOND } from '../../../../helpers/constants';
//import { web3 } from '../../../../web3';

//local defines
const moment = extendMoment(Moment);
//const DATE_TIME_FORMAT = "YYYY-MM-DD HH";
const ERROR_MESSAGE_DATE_IS_REQUIRED = "Address is required.";
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
        let flag = !this.state.totalWithdrawalError;
        for( var i = 0; i < this.state.roadmaps.length; i++ ){
            if( this.state.roadmaps[i].withdrawal == 0 ){
                flag = false;
                break;
            }
        }

        this.props.sendData({
            values: {
                roadmaps: this.state.roadmaps
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
        this.setState({ roadmaps: newRoadmap }, () => {
            this.roadmapDateValidation();
        });
    }

    handleRemoveRoadmap( index ) {
        if( index < 0 ){ return; }

        this.state.roadmaps.splice( index, 1 );
        this.setState({ roadmaps: this.state.roadmaps }, () => {
            this.roadmapDateValidation();
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
        let message = '';

        if( withdrawal < 0 ){ withdrawal = 0; }
        if( withdrawal == '' || withdrawal == undefined ) { withdrawal = 0; }
        roadmaps[index].withdrawal = withdrawal;

        let summary = 0;
        for(var i = 0; i < roadmaps.length; i++ ){
            summary += roadmaps[i].withdrawal;
        }

        if( summary > this.props.data.crowdsales[0].softcap ){ // fixed: first crowdsales's softcap
            totalWithdrawalError = true;
            message = ERROR_MESSAGE_TOTAL_WITHDRAW_LIMIT;
        }

        this.setState({
            roadmaps: roadmaps,
            totalWithdrawalError: totalWithdrawalError,
            message: message
        }, () => {
            this.sendDataToParent();
        });
    }

    componentWillMount(){
        let defaultData = this.props.data;
        let roadmaps = [{
            date: {
                startDate: moment().set( MOMENT_OPTION_REMOVE_MINUTE_SECOND ),
                endDate: moment().add(100, 'days').set( MOMENT_OPTION_REMOVE_MINUTE_SECOND )
            },
            withdrawal: 0
        }];
        
        // default value from parent
        if( defaultData.roadmaps != undefined && defaultData.roadmaps.length != 0 ){
            roadmaps = defaultData.roadmaps;
        }

        this.setState({ 
            roadmaps: roadmaps,
            totalWithdrawalError: false,
            message: ''
        }, () => {
            this.roadmapDateValidation();
        });
    }

    render() {
        const locale = { format: DATE_TIME_FORMAT };

        return (
            <div className="create-form-roadmap">
                <h4 className="create-form-step-header"> Roadmap </h4>
                <IconButton aria-label="add roadmap" onClick={this.handleAddRoadmap} > <PlaylistAddIcon/> </IconButton>
                <div className="create-form-roadmap-list">
                    {
                        this.state.roadmaps.map( (item, index) => (
                            <div className="create-form-roadmap-list-item" key={index}>
                                {(index == 0 ? null : <IconButton onClick={this.handleRemoveRoadmap.bind(this, index)} aria-label="remove roadmap"> <RemoveIcon/> </IconButton>)}
                                <DatetimeRangePicker
                                    autoApply
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
