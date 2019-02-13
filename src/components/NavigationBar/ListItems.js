import React from 'react';
import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons
import GradiantIcon from '@material-ui/icons/Gradient';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import BugReportIcon from '@material-ui/icons/BugReport';
import ViewListIcon from '@material-ui/icons/ViewList';
import SearchIcon from '@material-ui/icons/Search';
import CreateIcon from '@material-ui/icons/Create';

export const mainListItems = (
  <div>
    <ListItem button>
      <Link to={"/wallet"}>
        <ListItemIcon>
          <GradiantIcon />
        </ListItemIcon>
      </Link>
    </ListItem>
    <ListItem button>
      <Link to={"/browser"}>
        <ListItemIcon>
          <ScreenShareIcon />
        </ListItemIcon>
      </Link>
    </ListItem>
    <ListItem button>
      <Link to={"/debug"}>
        <ListItemIcon>
          <BugReportIcon />
        </ListItemIcon>
      </Link>
    </ListItem>
  </div>
);

export const permissionedListItems = (
  <div>
    <ListItem button disabled>
      <ListItemIcon>
        <ViewListIcon />
      </ListItemIcon>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <CreateIcon />
      </ListItemIcon>
    </ListItem>
  </div>
);
