import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { connect } from 'react-redux';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import NavigationBar from './NavigationBar';
import ContentsView from './ContentsView';
import { history } from  '../helpers/history';
import Progress from './common/Progress'; // loading bar
import Alert from './common/Alert'; // connect status with geth
import StatusBar from './NavigationBar/StatusBar';

// local styles
const flex = {
    display: 'flex',
    height: '100vh'
};

/*
 * @author. sena@soompay.net
 * @comment. 'App' defines Frame for application.
 *           HashRouter is a router for single-page-navigation should contains <Router> object.
 *           <Router> are located in <ContentsView>, 
 *           <LInk>, linking path for route, are located in <NavigationBar>.
 */
class App extends Component {
    constructor( props ) {
        super( props );

        history.push('/');
    }

    render() {
        return (
            <Router history={history}>
                <div style={ flex }>
                    <NavigationBar />
                    <StatusBar className="status-bar"/>
                    <ContentsView />
                    { this.props.isProcessing ? <Progress/> : null }
                    { this.props.isConnected ? null : <Alert/> }
                </div>
            </Router>
        );
    }
}

function mapStateToProps( state ) {
    const { isProcessing } = state.isProcessing;
    const { isConnected } = state;
    return {
        isProcessing, // get a progress status, and show loading bar.
        isConnected // get a geth connected status, and show alert.
    };
}
export default connect(mapStateToProps)(App);
