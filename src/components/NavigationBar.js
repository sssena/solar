import React, { Component } from 'react';

// material-ui components
import { withStyles } from '@material-ui/core/styles';

// local components
import { AuthConsumer } from './common/AuthContext'
import MainList from './NavigationBar/MainList'
import PrivateList from './NavigationBar/PrivateList'

/*
 * @author. sena
 * @comment. 'App' defines Frame for application
 */
class NavigationBar extends Component {
  render() {
    return (
      <AuthConsumer>
        {({ hasAuth, canCreate }) => (
          <div>
            <MainList hasAuth={hasAuth} />
            { hasAuth ? ( <PrivateList canCreate={canCreate} /> ) : null }
          </div>
        )}
      </AuthConsumer>
    );
  }
}

export default NavigationBar;
