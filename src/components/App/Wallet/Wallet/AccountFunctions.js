import React, { Component } from 'react';

// material-ui components
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';

// QR Code
import QRCode from 'qrcode.react';

// local components
import './AccountFunctions.css';

/*
 * @author. sena
 * @comment. 'AccountFunctions' has 3 functions for account address.
 *          1. copy to clipboard
 *          2. set a label (comming soon...!)
 *          3. create QR Code
 */
class AccountFunctions extends Component {
    state = {
        qrCodeOpen: false
    };

    constructor(){
        super();

        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.setLabel = this.setLabel.bind(this);
    }

    toggleQRCode = () => {
        this.setState( state => ({ qrCodeOpen: !state.qrCodeOpen }));
    }

    copyToClipboard() {
        const {clipboard} = require('electron');
        clipboard.writeText( this.props.address );
    }

    setLabel() {
        console.log("set a label");
    }   

    render() {
        const open = Boolean(this.props.anchorElement);
        return (
            <Popover
                id="functions"
                open={open}
                onClose={this.props.closeAction}
                anchorEl={this.props.anchorElement}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
            > 
                <List>
                    <ListItem button onClick={this.copyToClipboard}>
                        <ListItemText primary="Copy to clipboard" secondary="Copy address to your clipboard." />
                    </ListItem>
                    <ListItem button onClick={this.setLabel}>
                        <ListItemText primary="Set a label" secondary="Set a lebel for address. Still in dev..." />
                    </ListItem>
                    <ListItem button onClick={this.toggleQRCode}>
                        <ListItemText primary="Show QR code" secondary="Show QR code from your address." />
                    </ListItem>
                    <Collapse in={this.state.qrCodeOpen} timeout="auto" unmountOnExit>
                        <div className="qrcode-view">
                            <QRCode value={this.props.address} level="L" includeMargin={true}/>
                            <img className="icon-small qrcode-message" src="home/sena/ws/solar/public/imgs/qr-code.png"/> 
                            <span className="qrcode-message"> 
                                Scan this image <br/> with your phone. 
                            </span>
                        </div>
                    </Collapse>
                </List>
            </Popover>
        );
    }
}

export default AccountFunctions;
