import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import { AuthProvider } from './common/AuthContext';
import NavigationBar from './NavigationBar';
import ContentsView from './ContentsView';

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
  }

  render() {
    return (
      <HashRouter>
        <AuthProvider>
          <div style={ flex }>
            <NavigationBar />
            <ContentsView />
          </div>
        </AuthProvider>
      </HashRouter>
    );
  }
}

export default App;
