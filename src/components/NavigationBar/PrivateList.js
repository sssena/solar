import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons
import ViewListIcon from '@material-ui/icons/ViewList';
import SearchIcon from '@material-ui/icons/Search';
import CreateIcon from '@material-ui/icons/Create';

// local imports
import { history } from '../../helpers/history';

class PrivateList extends Component {
    sendLink = ( link ) => {
        history.push( link );
    }

    render() {
        return (
            <List>
                <ListItem button onClick={this.sendLink.bind(this, '/projects')}>
                    <ListItemIcon>
                        <ViewListIcon />
                    </ListItemIcon>
                    <ListItemText>Projects</ListItemText>
                </ListItem>
                <ListItem button onClick={this.sendLink.bind(this, '/search')}>
                    <ListItemIcon>
                        <SearchIcon />
                    </ListItemIcon>
                    <ListItemText>Search</ListItemText>
                </ListItem>
                { this.props.canCreate ? ( 
                    <ListItem button onClick={this.sendLink.bind(this, '/create')}>
                        <ListItemIcon>
                            <CreateIcon />
                        </ListItemIcon>
                        <ListItemText>Create</ListItemText>
                    </ListItem>
                ) : null }
            </List>
        );
    }
}

PrivateList.propTypes = {
    canCreate: PropTypes.bool.isRequired
};

export default PrivateList;
