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

// local styles
const flex = {
    display: 'flex'
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

        const { dispatch } = this.props;
        history.push('/');
    }

    render() {
        return (
            <Router history={history}>
                <div style={ flex }>
                    <NavigationBar />
                    <ContentsView />
                    { this.props.isProcessing ? <Progress/> : null }
                </div>
            </Router>
        );
    }
}

function mapStateToProps( state ) {
    const { isProcessing } = state;
    return {
        isProcessing // get a progress status, and show loading bar.
    };
}
export default connect(mapStateToProps)(App);
