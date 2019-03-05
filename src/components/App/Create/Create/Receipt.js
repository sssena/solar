import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

// local components
import './Receipt.css';
import { DATE_TIME_FORMAT } from '../../../../helpers/constants';

//local defines

/*
 * @author. sena
 * @comment. 'Receipt' provides :reate form to create project  
 */
class Receipt extends Component {
    state = {
    };

    constructor( props ){
        super( props );
    }

    componentWillMount(){
    }

    render() {
        let date = moment().format("YYYY-MM-DD HH:mm:ss");
        let projectInfo = this.props.projectInfo;

        return (
            <div className="create-form-crowdsale">
                <Alert variant="info"> Check the properties. You cannot modify after project created.</Alert>
                <Paper className="create-receipt">
                    <Typography variant="h4" component="h3"> {projectInfo.title} </Typography>
                    <Typography component="p"> Create: {date} </Typography>
                    <Table className="create-receipt-table">
                        <TableBody>
                            <TableRow hover={true}> 
                                <TableCell colSpan={2} variant="head"> Token Name </TableCell>
                                <TableCell align="right"> {projectInfo.name} </TableCell>
                            </TableRow>
                            <TableRow hover={true}> 
                                <TableCell colSpan={2} variant="head"> Token Symbol </TableCell>
                                <TableCell align="right"> {projectInfo.symbol} </TableCell>
                            </TableRow>
                        </TableBody>
                        {
                            projectInfo.crowdsales.map((item, index) => (
                                <TableBody key={index}>
                                    <TableRow hover={true}> 
                                        <TableCell colSpan={2} variant="head"> {index+1}{index==0?'st': (index==1?'nd':(index==2?'rd':'th'))} Crowdsale </TableCell>
                                        <TableCell align="right" variant="head"> {item.date.startDate.format("YYYY-MM-DD HH:00")} ~ {item.date.endDate.format("YYYY-MM-DD HH:00")} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell rowSpan={6}/>
                                        <TableCell variant="head">First Withdrawal</TableCell>
                                        { index == 0 ? 
                                                <TableCell align="right"> {item.firstWithdrawal} CRP </TableCell> 
                                                : "N/A" }
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head"> Softcap </TableCell>
                                        <TableCell align="right"> {item.softcap} CRP </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head"> Hardcap </TableCell>
                                        <TableCell align="right"> {item.hardcap} CRP </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head"> Additional Supply </TableCell>
                                        <TableCell align="right"> {item.additionalSupply} % </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head"> Exchange Ratio </TableCell>
                                        <TableCell align="right"> 1 CRP : {item.exchangeRatio} {projectInfo.symbol} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head"> CRP Range </TableCell>
                                        <TableCell align="right"> {item.crpRange.min} ~ {item.crpRange.max} CRP </TableCell>
                                    </TableRow>
                                </TableBody>
                            ))
                        }
                        <TableBody>
                            <TableRow hover={true}>
                                <TableCell colSpan={3} variant="head"> Staff (total: {projectInfo.staff.length} members)</TableCell>
                            </TableRow>
                        </TableBody>
                        {
                            projectInfo.staff.map((item, index) => (
                                <TableBody key={index}>
                                    <TableRow> 
                                        <TableCell rowSpan={2}/>
                                        <TableCell variant="head"> Address </TableCell>
                                        <TableCell align="right"> {item.address} </TableCell>
                                    </TableRow>
                                    <TableRow> 
                                        <TableCell variant="head"> Ratio </TableCell>
                                        <TableCell align="right"> {item.ratio} % </TableCell>
                                    </TableRow>
                                </TableBody>
                            ))
                        }
                        {
                            projectInfo.roadmaps.map((item, index) => (
                                <TableBody key={index}>
                                    <TableRow hover={true}> 
                                        <TableCell colSpan={2} variant="head"> {index+1}{index==0?'st': (index==1?'nd':(index==2?'rd':'th'))} Roadmap </TableCell>
                                        <TableCell align="right"> {item.date.startDate.format("YYYY-MM-DD HH:00")} ~ {item.date.endDate.format("YYYY-MM-DD HH:00")} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell rowSpan={6}/>
                                        <TableCell variant="head" > Withdrawal</TableCell>
                                        <TableCell align="right"> {item.withdrawal} CRP </TableCell> 
                                    </TableRow>
                                </TableBody>
                            ))
                        }
                    </Table>
                </Paper>
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(Receipt);
