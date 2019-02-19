import React, { Component } from 'react';

// Create Authentification context
const AuthContext = React.createContext();

class AuthProvider extends Component {
  state = { 
    hasAuth: false,
    canCreate: false,
    walletAddress: ''
  }

  constructor() {
    super();

    this.login = this.login.bind( this );
    this.logout = this.logout.bind( this );
  }

  login( id, walletAddress ) {
    console.log( 'Logged in. ', new Date() );
    console.log( 'User id:', id );
    console.log( 'Wallet address:', walletAddress );

    this.setState({ hasAuth: true, canCreate: true, walletAddress: walletAddress });
    //TODO: Redirect to '/wallet'
  }

  logout() {
    this.setState({ hasAuth: false, canCreate: false });
  }

  render(){
    return (
      <AuthContext.Provider
        value={{ 
          hasAuth: this.state.hasAuth, 
          canCreate: this.state.canCreate, 
          walletAddress: this.state.walletAddress,
          login: this.login,
          logout: this.logout
        }} >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

const AuthConsumer = AuthContext.Consumer;
export { AuthProvider, AuthConsumer };
