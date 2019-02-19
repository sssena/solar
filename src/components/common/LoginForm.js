import React, { Component } from 'react';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// local imports
import './LoginForm.css';

/*
 * @author. sena@soompay.net
 * @comment. 'LoginForm' defines Login format.
 *           Id,password for CRP-webp and wallet address.
 *
 */
class LoginForm extends Component {
  constructor( props ) {
    super( props );

    this.signIn = this.signIn.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);

    this.state = {
      id: '',
      password: '',
      idError: false,
      pwError: false
    }
  }

  handleIdChange( e ) {
    this.setState( { id: e.target.value, idError: false })
  }
  handlePasswordChange( e ) {
    this.setState( { password: e.target.value, pwError: false })
  }

  signIn(){
    let id = this.state.id;
    let password = this.state.password;

    if( this.validationCheck( id, password ) ){
      //TODO: add CRP-web Authentification
      console.log( "TODO: CRP-web Authentificaiton!" );

      this.props.loginAction( id, this.props.address );
      this.props.closeAction();
    }
  }

  validationCheck( id, password ) {
    if ( id == '' ) {
      this.setState({ idError: true });
      return false;
    }

    if ( password == '' ) {
      this.setState({ pwError: true });
      return false;
    }
    return true;
  }

  render() {
    return (
      <div className="login-form">
          <TextField 
            required
            id="id"
            label="Id"
            className={(this.state.idError) ? "textfield error" : "textfield"}
            onChange={this.handleIdChange}
            variant="outlined"
            margin="normal" />

          <TextField 
            required
            id="standard-password"
            label="Password"
            className={(this.state.pwError) ? "textfield error" : "textfield"}
            onChange={this.handlePasswordChange}
            variant="outlined"
            margin="normal" />

          <TextField disabled
            id="wallet-address"
            defaultValue={this.props.address}
            helperText="This address is what you choosed from the list."
            className="textfield"
            variant="outlined"
            margin="normal" />

          <Button variant="contained" color="primary" className="login-btn" onClick={this.signIn}> Login </Button>
      </div>
    );
  }
}

export default LoginForm;
