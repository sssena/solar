import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import MainList from './NavigationBar/MainList'
import PrivateList from './NavigationBar/PrivateList'

/*
 * @author. sena
 * @comment. 'App' defines Frame for application
 */
class NavigationBar extends Component {
  permission = {
    login: false,
    create: false
  }

  handleLoginState( state ) {
    this.setPermission({ login: state});
  }
  handleCreateState( state ) {
    this.setPermission({ create: state});
  }

  render() {
    return (
      <div>
        <MainList login={this.permission.login}/>
        <PrivateList showCreate={this.permission.create}/>
      </div>
    );
  }
}

export default NavigationBar;
