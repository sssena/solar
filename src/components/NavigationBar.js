import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';

// local components
import { mainListItems, permissionedListItems } from './NavigationBar/ListItems';

// local define
const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: '50em',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: '3.8em'
  }
});

/*
 * @author. sena
 * @comment. 'App' defines Frame for application
 */
class NavigationBar extends Component {
  render() {
    const { classes } = this.props; // class id from running application

    return (
      <div>
        <List>{mainListItems}</List>
        <List>{permissionedListItems}</List>
      </div>
    );
  }
}

NavigationBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NavigationBar);
