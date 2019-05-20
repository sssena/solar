import React, { Component } from 'react';
import { connect } from 'react-redux';

// charts
import { Pie, Doughnut } from 'react-chartjs-2';

// bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';

// icon
import SendTokenIcon from '@material-ui/icons/Send';
import RedrawIcon from '@material-ui/icons/Brush';



// local components
import './TokenView.css';
import { web3 } from '../../../../../web3';
import { contractHandlers } from '../../../../../helpers/contracts';
import utils from '../../../../../helpers/utils';
import TokenTransfer from '../../../../common/TokenTransfer';

/*
 * @author. sena
 * @comment. 'TokenView' shows a address info.
 */
class TokenView extends Component {
    state = {
        address: '',
        addressError: false,
        openTokenTransfer: false,
        graphType: 'fund',
        graphData: undefined,
        showDetail: false,
        tokenInfo: {
            name: undefined,
            symbol: undefined,
            useSto: false,
            supply: 0
        },
        balanceInfo: {
            active: 0,
            pend: 0,
            total: 0
        },
        fundInfo: {
            total: 0,
            used: 0,
            softFund: 0,
            hardFund: 0
        }
    };

    constructor(){
        super();

        this.drawGraph = this.drawGraph.bind(this);
        this.handleTokenTransferOpen = this.handleTokenTransferOpen.bind(this);
        this.handleTokenTransferClose = this.handleTokenTransferClose.bind(this);
        this.handleAccountChange = this.handleAccountChange.bind(this);
        this.updateBalanceChart = this.updateBalanceChart.bind(this);
    }

    handleGraphTypeToggle = ( type ) => {
        this.setState({ graphType: type }, () => { this.drawGraph() });
    }

    handleShowDetailToggle = ( event ) => {
        this.setState({ showDetail: event.target.checked }, () => { this.drawGraph() });
    }

    // token transfer
    handleTokenTransferOpen = async () => {
        this.setState({ openTokenTransfer: true });
    }

    handleTokenTransferClose = () => {
        this.setState({ openTokenTransfer: false });
        this.loadData();
    }

    handleAccountChange = ( event ) => {
        this.setState({ address: event.target.value, addressError: false });
    }

    updateBalanceChart = async () => {
        // check format
        if( !utils.isAddress( this.state.address.toLowerCase()) ){
            this.setState({ addressError: true });
            return;
        }

        let tokenContract = this.state.tokenContract;
        // update balanceInfo
        let balanceInfo = {
            active: await web3._extend.utils.fromWei( await tokenContract.activeOf( this.state.address ).toString() ),
            pend: await web3._extend.utils.fromWei( await tokenContract.pendingOf( this.state.address ).toString() ),
            total: await web3._extend.utils.fromWei( await tokenContract.balanceOf( this.state.address ).toString() ),
        };

        // drawGraph
        this.setState({ balanceInfo: balanceInfo }, () => { this.drawGraph(); });
    }

    async drawGraph(){
        let type = this.state.graphType;
        let fundInfo = this.state.fundInfo;
        let balanceInfo = this.state.balanceInfo;
        let tokenInfo = this.state.tokenInfo;
        let labels = [];
        let data = [];
        let colors = [];

        if( type == 'fund'){
            if( this.state.showDetail ){ 
                labels = ['Soft fund', 'Hard fund', 'Used']; 
                data = [
                    fundInfo.softFund,
                    fundInfo.hardFund,
                    fundInfo.used,
                ];
            } else { 
                labels = ['Remain', 'Used']; 
                data = [
                    fundInfo.remain,
                    fundInfo.used,
                ];
            }
        } else if ( type == 'balance' ){
            if( this.state.showDetail ){ 
                labels = ['(Account\'s)Active', '(Account\'s)Pending', 'Others']; 
                data = [
                    balanceInfo.active,
                    balanceInfo.pend,
                    ( tokenInfo.supply - balanceInfo.total ),
                ];
            } else { 
                labels = ['Account\'s', 'Others']; 
                data = [
                    balanceInfo.total,
                    ( tokenInfo.supply - balanceInfo.total ),
                ];
            }
        }

        if( this.state.showDetail ){
           colors = ['#7986cb', '#90caf9', '#b2dfdb']; 
        } else {
           colors = ['#42a5f5', '#b2dfdb']; 
        }

        this.setState({ 
            graphData: {
                labels: labels,
                datasets:[{
                    data: data,
                    backgroundColor: colors
                }]
            }
        });
    }

    async loadData(){
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( !contract ){ 
            this.setState({ isUndefined: true });
            return;
        }

        let tokenInfo = {
            name: contract.token_param()[0].toString(),
            symbol: contract.token_param()[1].toString(),
            useSto: ( contract.token_param()[2].toNumber() ) ? true : false,
            supply: 0
        };

        let balanceInfo = {
            active: 0,
            pend: 0,
            total: 0
        };

        // token information
        let tokenContract = await contractHandlers.getTokenContract( this.props.mainContractAddress );
        if( tokenContract != null && tokenContract.address != undefined ){
            // supply
            tokenInfo.supply = await web3._extend.utils.fromWei( tokenContract.supply().toString() );

            // user balance
            balanceInfo = {
                active: await web3._extend.utils.fromWei( await tokenContract.activeOf( this.props.auth.address ).toString() ),
                pend: await web3._extend.utils.fromWei( await tokenContract.pendingOf( this.props.auth.address ).toString() ),
                total: await web3._extend.utils.fromWei( await tokenContract.balanceOf( this.props.auth.address ).toString() ),
            };
        }

        // fund information
        let fundInfo = {
            total: 0,
            used: 0,
            remain: 0
        };
        let fundContract = await contractHandlers.getFundContract( this.props.mainContractAddress );
        if( fundContract != null && fundContract.address != undefined ){ 
            let total = await web3._extend.utils.fromWei( await fundContract.fund_list()[0].toString() );
            let remain = await web3._extend.utils.fromWei( await fundContract.fund_list()[1].toString() );
            let used = total - remain;

            fundInfo = {
                total: total,
                remain: remain,
                used: used,
                softFund: await web3._extend.utils.fromWei( await fundContract.fund_list()[2].toString() ),
                hardFund: await web3._extend.utils.fromWei( await fundContract.fund_list()[3].toString() )
            };
        }

        this.setState({ 
            stage: await contract.stage().toString(),
            tokenContract: tokenContract,
            tokenInfo: tokenInfo,
            balanceInfo: balanceInfo,
            fundInfo: fundInfo
        }, () => { this.drawGraph(); });
    }
    
    componentWillMount(){
        this.loadData();
    }

    render() {
        if( this.state.isUndefined ) { return null; }

        let canSend = false;
        if(( this.state.stage == '3' || this.state.stage == '5' ) 
            && this.state.balanceInfo.active > 0
            && this.state.tokenContract.address != undefined 
        ) canSend = true;

        return (
            <div className="detail-token">
                <Alert variant="info" className="my-balance">
                    <table> 
                        <tbody>
                            <tr>
                                <td className="label"> My Own </td>
                                <td className="amount">{this.state.balanceInfo.total}</td>
                                <td className="unit">
                                    {
                                        this.state.tokenInfo.useSto ? (
                                            <Tooltip title="This token using STO." placement="top">
                                                <Badge id="sto-badge" color="secondary" badgeContent="STO">
                                                    {this.state.tokenInfo.symbol}
                                                </Badge>
                                            </Tooltip> ) : (
                                                this.state.tokenInfo.symbol
                                            )
                                    }
                                    <IconButton disabled={!(canSend)} onClick={this.handleTokenTransferOpen}>
                                        <SendTokenIcon fontSize="small"/>
                                    </IconButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Alert>
                <Paper className="detail-token-info">
                    <Table className="border-less-table">
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={3} className="address">
                                    {this.state.tokenContract != undefined ? this.state.tokenContract.address : ''}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="label">My Active Balance</TableCell>
                                <TableCell className="amount">{this.state.balanceInfo.active}</TableCell>
                                <TableCell className="unit">{this.state.tokenInfo.symbol}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="label">My Pending Balance</TableCell>
                                <TableCell className="amount">{this.state.balanceInfo.pend}</TableCell>
                                <TableCell className="unit">{this.state.tokenInfo.symbol}</TableCell>
                            </TableRow>
                            <TableRow><TableCell colSpan={3}><hr/></TableCell></TableRow>
                            <TableRow>
                                <TableCell className="label">Total Supply</TableCell>
                                <TableCell className="amount">{this.state.tokenInfo.supply}</TableCell>
                                <TableCell className="unit">CRP</TableCell>
                            </TableRow>
                            <TableRow><TableCell colSpan={3}><hr/></TableCell></TableRow>
                            <TableRow>
                                <TableCell className="label">Funding</TableCell>
                                <TableCell className="amount">{this.state.fundInfo.total}</TableCell>
                                <TableCell className="unit">CRP</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="label">Used</TableCell>
                                <TableCell className="amount">{this.state.fundInfo.used}</TableCell>
                                <TableCell className="unit">CRP</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="label">Remain</TableCell>
                                <TableCell className="amount">{this.state.fundInfo.remain}</TableCell>
                                <TableCell className="unit">CRP</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
                <Paper className="detail-token-graph">
                    <Button 
                        color={(this.state.graphType == 'fund') ? "primary" : "default"}
                        onClick={this.handleGraphTypeToggle.bind(this, 'fund')}>Fund</Button>
                    <Button 
                        color={(this.state.graphType == 'balance') ? "primary" : "default"}
                        onClick={this.handleGraphTypeToggle.bind(this, 'balance')}>Balance</Button>

                    <FormControlLabel
                        className="show-detail"
                        label="Show Detail"
                        control={
                            <Switch
                                color="primary"
                                checked={this.state.showDetail}
                                value={this.state.showDetail}
                                onChange={this.handleShowDetailToggle}
                            />
                        }
                    />
                    <div className="chart">
                        {
                            this.state.graphData == undefined ? null : <Doughnut width={400} height={400} data={this.state.graphData}/>
                        }
                    </div>
                    {
                        this.state.graphType == 'balance' ? (
                            <div className="graph-address">
                                    <TextField required
                                        id="account"
                                        label="Account"
                                        defaultValue={this.props.auth.address}
                                        className={this.state.addressError ? "textfield error" : "textfield"}
                                        onChange={this.handleAccountChange}
                                        variant="outlined"
                                        margin="normal"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton aria-label="Redraw chart" onClick={this.updateBalanceChart} > <RedrawIcon/> </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                            </div>
                        ): null 
                    }
                </Paper>
                <Dialog
                    open={this.state.openTokenTransfer}
                    onClose={this.handleTokenTransferClose} >
                    <TokenTransfer
                        tokenContract={this.state.tokenContract}
                        closeAction={this.handleTokenTransferClose} />
                </Dialog>

            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(TokenView);
