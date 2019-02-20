import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from 'react-router-dom';

// local links
import { AuthConsumer } from './common/AuthContext'
import Accounts from './App/Accounts/Accounts'; 
import Wallet from './App/Wallet/Wallet';
import Browser from './App/Browser/Browser';
import ProjectList from './App/ProjectList/ProjectList';
import Search from './App/Search/Search';
import Create from './App/Create/Create';
import Debug from './App/Debug/Debug';

// local styles
import './ContentsView.css';
//const styles = {
//    display: 'flex',
//    flexGrow: 1,
//    width: '90vw',
//    height: '95vh',
//    padding: '0.5em'
//};

/*
 * @author. sena@soompay.net
 * @comment. 'ContentsView' is an actual view-part of App.
 *           <Route> defines path to component.
 */
class ContentsView extends Component {
    render() {
        return (
            <AuthConsumer>
                {({ hasAuth, walletAddress, login  }) => (
                    <main className="contents-view">
                        <Route exact path="/"   render={(props) => <Accounts {...props} login={login} />} />
                        <Route path="/accounts" render={(props) => <Accounts {...props} login={login} />} />
                        <Route path="/wallet"   render={(props) => <Wallet {...props} address={walletAddress} />} />
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
