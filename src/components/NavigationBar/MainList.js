import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons
import GradiantIcon from '@material-ui/icons/Gradient';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
//import BugReportIcon from '@material-ui/icons/BugReport';

class MainList extends Component {
  render() {
    return (
      <List>
        <ListItem button>
          { this.props.login ? 
              <Link to={"/wallet"}> 
                <ListItemIcon>
                  <GradiantIcon />
                </ListItemIcon>
              </Link>
            : <Link to={"/account"}> 
                <ListItemIcon>
                  <GradiantIcon />
                </ListItemIcon>
              </Link> 
          }
        </ListItem>
        <ListItem button>
          <Link to={"/browser"}>
            <ListItemIcon>
              <ScreenShareIcon />
            </ListItemIcon>
          </Link>
        </ListItem>
      </List>
    );
  }
  // Debug menu is a hidden part 
  //      <ListItem button>
  //        <Link to={"/debug"}>
  //          <ListItemIcon>
  //            <BugReportIcon />
  //          </ListItemIcon>
  //        </Link>
  //      </ListItem>
}

export default MainList;
