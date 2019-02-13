import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from 'react-router-dom';

// Local links
import Wallet from './App/Wallet/Wallet';
import Wallet_NoPermission from './App/Wallet/Wallet';
import Browser from './App/Browser/Browser';
import ProjectList from './App/ProjectList/ProjectList';
import Search from './App/Search/Search';
import Create from './App/Create/Create';
import Debug from './App/Debug/Debug';

const styles = {
  display: 'flex',
  flexGrow: 1,
  padding: '0.5em',
  height: '100%',
  overflow: 'auto',
};

/*
 * @author. sena
 * @comment. 'ContentsView' is an actual view-part of App
 */
class ContentsView extends Component {
  render() {
    return (
        <main style={ styles }>
            <Route exact path="/" component={Wallet_NoPermission}/>
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
