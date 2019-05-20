import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons
import GradiantIcon from '@material-ui/icons/Gradient';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';

import { history } from '../../helpers/history';

class MainList extends Component {
    sendLink = ( link ) => {
        history.push( link );
    }

    openLink = () => {
        require("electron").shell.openExternal("http://www.crpspace.com/");
    }

    render() {
        return (
            <List>
                { this.props.hasAuth ? 
                        <ListItem button onClick={this.sendLink.bind(this, '/wallet')}>
                            <ListItemIcon>
                                <AccountBalanceWalletIcon />
                            </ListItemIcon>
                            <ListItemText>Wallet</ListItemText>
                        </ListItem>
                        :
                        <ListItem button onClick={this.sendLink.bind(this, '/accounts')}>
                            <ListItemIcon>
                                <GradiantIcon />
                            </ListItemIcon>
                            <ListItemText>Accounts</ListItemText>
                        </ListItem>
                }
                <ListItem button onClick={this.openLink.bind(this)}>
                    <ListItemIcon>
                        <ScreenShareIcon />
                    </ListItemIcon>
                    <ListItemText>Browser</ListItemText>
                </ListItem>
            </List>
        );
    }
}

MainList.propTypes = {
    hasAuth: PropTypes.bool.isRequired
};
export default MainList;
