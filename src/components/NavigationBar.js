import React, { Component } from 'react';
import { connect } from 'react-redux';

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
  render() {
    return (
          <div>
            <MainList hasAuth={this.props.authentication.loggedIn} />
            <PrivateList canCreate={this.props.authentication.auth.canCreate} /> 
          </div>
    );
  }
}

function mapStateToProps( state ) {
    const { authentication } = state;
    return {
        authentication
    };
}

export default connect(mapStateToProps)(NavigationBar);
