import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Button from '@material-ui/core/Button';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

// icons
import StatusIcon from '@material-ui/icons/SignalCellularAlt';
import LogoutIcon from '@material-ui/icons/MeetingRoom';
import DebugIcon from '@material-ui/icons/BugReport';
import ConfigIcon from '@material-ui/icons/Build';

// local components
import './StatusBar.css';
import { web3 } from '../../web3';
import { authActions, netStatusActions } from '../../actions';
import { history } from '../../helpers/history';

/*
 * @author. sena
 * @comment. 'StatusBar' shows network status. And It includes hidden menus like debug, logout. 
 */
class StatusBar extends Component {
    state = {
        open: false,
        withDebug: true
    };

    constructor(){
        super();
    }

    handleClick = ( action ) => {
        const { dispatch } = this.props;

        if( action == 'Logout' ) {
            dispatch( authActions.logout() );
        } else if( action == 'Debug') { 
            history.push('/debug'); 
        } else if( action == 'Config') { 
            history.push('/config'); 
        }

        this.handleClose();
    }

    handleToggle = () => {
        this.setState({ open: !(this.state.open) });
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    async checkStatus(){
        let status = false;
        const { dispatch } = this.props;

        try{
            status = await web3.net.listening;
        } catch( error ){
            status = false;
        }

        if( !status ){
            dispatch( netStatusActions.disconnected() );
            this.setState({connected: "disconnect"});
        } else {
            dispatch( netStatusActions.connected() );
            this.setState({connected: "connect"});
        }
    }

    componentWillMount(){
        setInterval( ()=>{this.checkStatus()}, 1000 );
        this.checkStatus();
    }

    render() {
        return (
            <div className="status-bar">
                <SpeedDial
                    ariaLabel="Network status"
                    className={"status " + this.state.connected}
                    open={this.state.open}
                    hidden={false}
                    icon={<StatusIcon fontSize="small"/>}
                    onClick={this.handleToggle}
                    direction="right"
                >
                    <SpeedDialAction
                        key="Config"
                        icon={<ConfigIcon/>}
                        tooltipTitle="Config"
                        onClick={this.handleClick.bind(this, "Config")}
                    />
                    {
                        this.state.withDebug ? (
                            <SpeedDialAction
                                key="Debug"
                                icon={<DebugIcon/>}
                                tooltipTitle="Debug"
                                onClick={this.handleClick.bind(this, "Debug")}
                            />
                        ) : null
                    }
                    {
                        this.props.authentication.loggedIn ? (
                            <SpeedDialAction
                                key="Logout"
                                icon={<LogoutIcon/>}
                                tooltipTitle="Logout"
                                onClick={this.handleClick.bind(this, "Logout")}
                            />
                        ) : null 
                    }
                </SpeedDial>
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state;
}
export default connect(mapStateToProps)(StatusBar);
