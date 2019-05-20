import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material-ui components
import LinearProgress from '@material-ui/core/LinearProgress';

// icons

// local import
import './DateGraph.css';

/*
 * @author. sena@soompay.net
 * @comment. 'DateGraph' draws graph with start/end date.
 *
 */
class DateGraph extends Component {
    state = {};
    constructor( props ) {
        super( props );
    }

    drawGraph(){
        let startDate = this.props.startDate;
        let endDate = this.props.endDate;
        let today = moment().unix();

        let value = (today - startDate) / (endDate - startDate) * 100;
        if( value > 100 ) { 
            value = 100; 
        } else if( value < 0 ){
            value = 0;
        }

        this.setState({ 
            value: value,
            startDateStr: moment.unix( startDate ).format('YY.MM.DD'),
            startTimeStr: moment.unix( startDate ).format('HH:mm'),
            endDateStr: moment.unix( endDate ).format('YY.MM.DD'),
            endTimeStr: moment.unix( endDate ).format('HH:mm')
        });
        //}, () => { console.log(this.state) });
    }

    componentWillMount(){
        this.drawGraph();
    }

    render() {
        return (
            <div className="date-graph">
                <div className="start-date">
                    <span className="date">{this.state.startDateStr}</span><br/>
                    <span className="time">{this.state.startTimeStr}</span>
                </div>
                <div className="date-progress-bar">
                    <LinearProgress 
                        className="bar-graph "
                        variant="determinate" 
                        value={this.state.value} />
                </div>
                <div className="end-date">
                    <span className="date">{this.state.endDateStr}</span><br/>
                    <span className="time">{this.state.endTimeStr}</span>
                </div>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(DateGraph);
