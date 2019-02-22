import React, { Component } from 'react';
import { Router } from 'react-router-dom';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import NavigationBar from './NavigationBar';
import ContentsView from './ContentsView';
import { history } from  '../helpers/history';

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
        // history.listen( (location, action) => {
        // });
    }

    render() {
        return (
            <Router history={history}>
                <div style={ flex }>
                    <NavigationBar />
                    <ContentsView />
                </div>
            </Router>
        );
    }
}

export default App;
