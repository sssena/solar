import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons
import ViewListIcon from '@material-ui/icons/ViewList';
import SearchIcon from '@material-ui/icons/Search';
import CreateIcon from '@material-ui/icons/Create';

class PrivateList extends Component {
  render() {
    return (
      <List>
        <ListItem button>
          <Link to={"/projects"}>
            <ListItemIcon>
              <ViewListIcon />
            </ListItemIcon>
          </Link>
        </ListItem>
        <ListItem button>
          <Link to={"/search"}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
          </Link>
        </ListItem>
        { this.props.showCreate ? ( 
          <ListItem button >
            <Link to={"/create"}>
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
            </Link>
          </ListItem>
        ) : null }
      </List>
    );
  }
}

export default PrivateList;
