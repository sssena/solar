import React, { Component } from 'react';
import moment from 'moment';
import path from 'path';

// material-ui components 
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

// icons
import UpdateIcon from '@material-ui/icons/Cached';
import ConsoleIcon from '@material-ui/icons/AspectRatio';

// local components
import './Debug.css';
import { web3 } from '../../../web3';
import utils from '../../../helpers/utils';

/*
 * @author. sena
 * @comment. 'Debug' is hidden menu for developers.
 */
class Debug extends Component {
    state = {
        station: {}
    };

    constructor(){
        super();
    }

    update(){
        this.componentWillMount();
    }

    async updateBlockNumber(){
        let blockNumber = web3.eth.blockNumber;

        this.setState({ 
            blockNumber: blockNumber,
            lastBlockNumberUpdate: moment( Date.now() ).format('MMMM Do YYYY, hh:mm:ss')
        });
    }

    async updatePeerCount(){
        let peerCount = web3.net.peerCount;

        this.setState({ 
            peerCount: peerCount,
            lastPeerCountUpdate: moment( Date.now() ).format('MMMM Do YYYY, hh:mm:ss')
        });
    }

    updateExecutionTime(){
        let now = moment( Date.now() );
        let startedTime = moment( require('electron').remote.getGlobal('startTime') );
        let executionTime = now.diff( startedTime, 'seconds' );
        executionTime = moment.duration(executionTime, 'seconds')
        executionTime = utils.humanizeSecondsDuration(executionTime);

        this.setState({ executionTime: executionTime });
    }

    async componentWillMount(){
        // get station info
        // 0: Geth
        // 1: network info
        // 2: node version
        // 3: environment
        // 4: golang version
        let stationInfo = web3.version.node.split('/');

        // get crp web3 version
        let web3Version = 'v' + web3.version.api;

        // set timer to update execution time
        setInterval( () => {this.updateExecutionTime()}, 1000 );

        // set timer to update blockNumber
        this.updateBlockNumber();
        setInterval( () => {this.updateBlockNumber()}, 10000 );

        // set timer to update peerCount 
        this.updatePeerCount();
        setInterval( () => {this.updatePeerCount()}, 30000 );

        this.setState({
            station: {
                cli: stationInfo[0],
                network: stationInfo[1],
                version: stationInfo[2],
                environment: stationInfo[3],
            },
            web3Version: web3Version
        });
    }

    render() {
        return (
            <div className="debug-item-list">
                <Card className="debug-item">
                    <CardHeader title="Station Information" subheader={this.state.station.cli + "/" + this.state.station.environment}/>
                    <img src={path.join(__dirname, '../public/imgs/station.png')} width="100" height="100"/>
                    <CardContent>
                        <Typography component="p">
                            {this.state.station.version}
                        </Typography>
                    </CardContent>
                </Card>
                <Card className="debug-item">
                    <CardHeader title="Web3 Information" subheader=" "/>
                    <img src={path.join(__dirname, '../public/imgs/moon.png')} width="100" height="100"/>
                    <CardContent>
                        <Typography component="p">
                            {this.state.web3Version}
                        </Typography>
                    </CardContent>
                </Card>
                <Card className="debug-item">
                    <CardHeader title="Blocks" subheader={"Last update: " + this.state.lastBlockNumberUpdate}/>
                    <img src={path.join(__dirname, '../public/imgs/blocks.png')} width="100" height="100"/>
                    <CardContent>
                        <Typography component="p">
                            <span className="label">height:</span> {this.state.blockNumber}
                        </Typography>
                    </CardContent>
                </Card>
                <Card className="debug-item">
                    <CardHeader title="Solar Execution Time" subheader=" "/>
                    <img src={path.join(__dirname, '../public/imgs/hourglass.png')} width="100" height="100"/>
                    <CardContent>
                        <Typography component="p">
                            {this.state.executionTime}
                        </Typography>
                    </CardContent>
                </Card>
                <Card className="debug-item">
                    <CardHeader title="Peer Information" subheader={"Last update: " + this.state.lastPeerCountUpdate}/>
                    <img src={path.join(__dirname, '../public/imgs/peers.png')} width="100" height="100"/>
                    <CardContent>
                        <Typography component="p">
                            {this.state.peerCount}<span className="label"> peers are connected on </span> {this.state.station.network}
                        </Typography>
                    </CardContent>
                </Card>
                <Card className="debug-item">
                    <CardHeader title="Station console" subheader="Click to open console"/>
                    <a href="#" onClick={this.handleConsoleOpen}>
                        <img src={path.join(__dirname, '../public/imgs/console.png')} width="100" height="100"/>
                    </a>
                    <CardContent> </CardContent>
                </Card>
            </div>
        );
    }
}

export default Debug;
