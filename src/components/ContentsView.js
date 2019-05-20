import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from 'react-router-dom';

// local links
//import { AuthConsumer } from './common/AuthContext'
import Accounts from './App/Accounts/Accounts'; 
import Wallet from './App/Wallet/Wallet';
//import Browser from './App/Browser/Browser';
import Projects from './App/Projects/Projects';
import Detail from './App/Projects/Projects/Detail';
import Search from './App/Search/Search';
import Create from './App/Create/Create';
import Debug from './App/Debug/Debug';
import Config from './App/Config/Config';

// local styles
import './ContentsView.css';

/*
 * @author. sena@soompay.net
 * @comment. 'ContentsView' is an actual view-part of App.
 *           <Route> defines path to component.
 */
class ContentsView extends Component {
    //<!--Route path="/browser"  component={Browser} /-->
    render() {
        return (
                <main className="contents-view">
                    <Route exact path="/"   render={(props) => <Accounts {...props} login={false} />} />
                    <Route path="/accounts" render={(props) => <Accounts {...props} login={false} />} />
                    <Route path="/wallet"   render={(props) => <Wallet {...props} />} />
                    <Route path="/debug"    component={Debug} />
                    <Route path="/config"    component={Config} />
                    <Route exact path="/projects" component={Projects} />
                    <Route exact path="/projects/detail/:address"   component={Detail} />
                    <Route path="/search"   component={Search} />
                    <Route path="/create"   component={Create} />
                </main>
        );
    }
}

export default ContentsView;
