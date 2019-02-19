import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from 'react-router-dom';

// Local links
import { AuthConsumer } from './common/AuthContext'
import Wallet from './App/Wallet/Wallet';
import Accounts from './App/Wallet/Accounts'; // without login
import Browser from './App/Browser/Browser';
import ProjectList from './App/ProjectList/ProjectList';
import Search from './App/Search/Search';
import Create from './App/Create/Create';
import Debug from './App/Debug/Debug';

// Local styles
const styles = {
  display: 'flex',
  flexGrow: 1,
  width: '90vw',
  height: '95vh',
  padding: '0.5em'
};

/*
 * @author. sena@soompay.net
 * @comment. 'ContentsView' is an actual view-part of App.
 *           <Route> defines path to component.
 */
class ContentsView extends Component {
  render() {
    return (
      <AuthConsumer>
        {({ hasAuth, login  }) => (
          <main style={ styles }>
            <Route exact path="/"   render={(props) => <Accounts {...props} login={login} />} />
            <Route path="/accounts" render={(props) => <Accounts {...props} login={login} />} />
            <Route path="/wallet"   component={Wallet} />
            <Route path="/debug"    component={Debug} />
            <Route path="/browser"  component={Browser} />
            <Route path="/projects" component={ProjectList} />
            <Route path="/search"   component={Search} />
            <Route path="/create"   component={Create} />
          </main>
        )}
      </AuthConsumer>
    );
  }
}

export default ContentsView;
