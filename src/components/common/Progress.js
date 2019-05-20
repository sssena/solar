import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';

// local import
import './Progress.css';

/*
 * @author. sena@soompay.net
 * @comment. 'Progress' defines circular progress bar for window.
 */
// function Progress( props ) {
//     return (
//         <div className="progress-background">
//             <CircularProgress className="progress-circle" />
//             <h5>{props.message}</h5>
//         </div>
//     );
// }
//
class Progress extends Component {
    render(){
        return (
            <div className="progress-background">
                <CircularProgress className="progress-circle" />
                <h5 className="progress-message">{this.props.message}</h5>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    const { message } = state.isProcessing;
    return {
        message
    };
}
export default connect(mapStateToProps)(Progress);
