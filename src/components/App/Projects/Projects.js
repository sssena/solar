import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';

// icons
import SendIcon from '@material-ui/icons/Send';

// local components
import './Projects.css';
//import web3 from '../../../web3';
//import { web3 } from '../../../web3';

/*
 * @author. sena
 * @comment. 'Projects' shows a address info.
 */
class Projects extends Component {
    state = {
        mainContract: null
    };

    constructor(){
        super();
    }

    // handleFunctionsOpen = ( event ) => {
    //     this.setState({
    //     });
    // }
    // handleFunctionsClose = () => {
    //     this.setState({
    //     });
    // }

    // async loadOwnProject(){
    //     let mainContract = await web3.eth.getMainContractAddress( this.props.auth.address );
    //     this.setState({ mainContract: mainContract });
    // }

    // componentWillMount(){
    //     this.loadOwnProject();
    //     //this.loadMarkedProject();
    // }

    // render() {
    //     return (
    //         <div className="projects">
    //             <Card className="project-area">
    //                 <CardHeader
    //                     title="My project"
    //                     subheader="Manage your project."
    //                 >
    //                 </CardHeader>
    //                 <CardContent>

    //                 </CardContent>
    //             </Card>
    //         </div>
    //     );
    // }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(Projects);
