import React, { Component } from 'react';
import Identicon from 'react-identicons';

// material-ui components
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
//import CardContent from '@material-ui/core/CardContent';

// local styles
import './Account.css';

// local defines
const IDENTICON_DEFAULT_SIZE = 15;

/*
 * @author. sena@soompay.net
 * @comment. 'Account' defines account information format.
 *           address, identicon and balance.
 *
 */
class Account extends Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <Card className="account">
        <CardHeader
          avatar={
            <Avatar className="avatar">
              <Identicon 
                string={this.props.address} 
                size={IDENTICON_DEFAULT_SIZE}/>
            </Avatar>
          }
          title={this.props.address}
          subheader={this.props.balance}
        />
      </Card>
    );
  }
}

export default Account;
