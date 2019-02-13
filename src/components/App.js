import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { HashRouter } from 'react-router-dom';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import NavigationBar from './NavigationBar';
import ContentsView from './ContentsView';

const flex = {
  display: 'flex'
};

/*
 * @author. sena
 * @comment. 'App' defines Frame for application
 */
class App extends Component {
  render() {
    return (
      <HashRouter>
        <div style={ flex }>
          <NavigationBar />
          <ContentsView />
        </div>
      </HashRouter>
    );
  }
}

export default App;
