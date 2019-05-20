import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// chart
import { Pie } from 'react-chartjs-2';

// material-ui
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';


// local import
import './VoteResultGraph.css';

/*
 * @author. sena@soompay.net
 * @comment. 'VoteResultGraph' draws graph with start/end date.
 *
 */
class VoteResultGraph extends Component {
    state = {
        graphType: 'count'
    };

    constructor( props ) {
        super( props );
    }

    handleGraphTypeToggle = (type) => {
        this.setState({ graphType: type });
    }

    render() {
        // pie chart data
        let countData = {
            labels: ['Agree', 'Disagree'],
            datasets:[{
                label: '# of Vote',
                data: [ this.props.agree, this.props.disagree ],
                backgroundColor: [ '#27cea2', '#fbdb78' ]
            }]
        };
        let weightData = {
            labels: ['Agree(%)', 'Disagree(%)'],
            datasets:[{
                label: '# of Vote Weight',
                data: [ this.props.agreeWeight, this.props.disagreeWeight],
                backgroundColor: [ '#3fb596', '#e46c8b' ]
            }]
        };

        return (
            <div className="vote-graph">
                <Button 
                    color={(this.state.graphType == 'count') ? "primary" : "default"}
                    onClick={this.handleGraphTypeToggle.bind(this, 'count')}>Count</Button>
                <Button 
                    color={(this.state.graphType == 'weight') ? "primary" : "default"}
                    onClick={this.handleGraphTypeToggle.bind(this, 'weight')}>Weight</Button>

               <Pie data={this.state.graphType == 'count' ? countData : weightData} className="chart" />
                
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="label">Agree</TableCell>
                            <TableCell className="value">{this.props.agree}</TableCell>
                            <TableCell className="value">{this.props.agreeWeight}%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="label">Disagree</TableCell>
                            <TableCell className="value">{this.props.disagree}</TableCell>
                            <TableCell className="value">{this.props.disagreeWeight}%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="label">Total</TableCell>
                            <TableCell className="value">{this.props.agree + this.props.disagree}</TableCell>
                            <TableCell className="value">100%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(VoteResultGraph);
