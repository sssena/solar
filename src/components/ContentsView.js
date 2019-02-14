import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from 'react-router-dom';

// Local links
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
  padding: '0.5em',
  height: '100%',
  overflow: 'auto',
};

/*
 * @author. sena@soompay.net
 * @comment. 'ContentsView' is an actual view-part of App.
 *           <Route> defines path to component.
 */
class ContentsView extends Component {
  render() {
    return (
        <main style={ styles }>
            <Route exact path="/" component={Accounts}/>
            <Route path="/accounts" component={Accounts}/>
            <Route path="/wallet" component={Wallet}/>
            <Route path="/debug" component={Debug}/>
            <Route path="/browser" component={Browser}/>
            <Route path="/projects" component={ProjectList}/>
            <Route path="/search" component={Search}/>
            <Route path="/create" component={Create}/>
        </main>
    );
  }
}

export default ContentsView;