import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';

// icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// local components
import './NavigationBar.css';
import MainList from './NavigationBar/MainList';
import PrivateList from './NavigationBar/PrivateList';
import { authActions }  from '../actions';
import StatusBar from './NavigationBar/StatusBar';

/*
 * @author. sena
 * @comment. 'NavigationBar' is side-navigation-bar.
 */
class NavigationBar extends Component {
    state={
        open: false
    };

    constructor( props ){
        super( props );
        this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    }

    handleDrawerToggle = () => { this.setState({ open: !this.state.open }); }

    render() {
        const { classes } = this.props
        return(
            <div className={this.state.open?"navi navi-opened":"navi navi-closed"} >
                <div className="navi-toolbar">
                    <IconButton onClick={this.handleDrawerToggle}>
                        {this.state.open?<ChevronLeftIcon/>:<ChevronRightIcon/>}
                    </IconButton>
                </div>

                <MainList hasAuth={this.props.authentication.loggedIn} />
                
                {
                    this.props.authentication.loggedIn ? 
                        <>
                        <Divider/>
                        <PrivateList canCreate={this.props.authentication.auth.canCreate} /> 
                        </>
                        : null
                }
            </div>
        );
    }
}

function mapStateToProps( state ) {
    const { authentication } = state;
    return {
        authentication
    };
}
export default connect(mapStateToProps)(NavigationBar);
