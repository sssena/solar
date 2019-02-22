import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';

import './Progress.css';

/*
 * @author. sena@soompay.net
 * @comment. 'Progress' defines circular progress bar for window.
 */

// function Progress( props ) {
//     return (
//         <div className="progress-background">
//             <CircularProgress className="progress-circle" />
//         </div>
//     );
// }

class Progress extends Component {
    constructor(){
        super();

        this.state = {
            isProcessing: false
        }
    }

    processing(){
        this.setState({ isProcessing: true });
    }

    done(){
        this.setState({ isProcessing: false });
    }

    render() {
        return (
            <div className={ this.state.isProcessing ? "progress-background" : "none" }>
                <CircularProgress className="progress-circle" />
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return { isProcessing: state.isProcessing };
}

//Progress.propTypes = {
//    classes: PropTypes.object.isRequired
//}

//export default Progress;
export default connect( mapStateToProps )(Progress);
