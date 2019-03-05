import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// local components
import './SummaryForm.css';

const ERROR_MESSAGE_TITLE_IS_REQUIRED = "Title is required.";

/*
 * @author. sena
 * @comment. 'SummaryForm' provides title form to create project  
 */
class SummaryForm extends Component {
    state = {
        title: '',
        titleError: false
    };

    constructor( props ){
        super( props );

        this.handleTitleChange = this.handleTitleChange.bind(this);
    }

    sendDataToParent(){
        let flag = ( !this.state.titleError && this.state.title.length != 0 );
        this.props.sendData({
            values: {
                title: this.state.title,
            },
            flag: flag
        });
    }

    handleTitleChange( e ) {
        this.setState({ title: e.target.value }, () => {
            this.validationCheck();
        });
    }

    validationCheck(){
        let titleError = false;
        let message = '';

        if( this.state.title.length == 0 ){
            titleError = true;
            message = ERROR_MESSAGE_TITLE_IS_REQUIRED;
        }

        this.setState({ titleError: titleError, message: message }, () => {
            this.sendDataToParent();
        });
    }

    componentWillMount(){
        let defaultData = this.props.data;
        let title = '';

        if( defaultData != undefined && defaultData.title != undefined && defaultData.title.length != 0 ){
            title = defaultData.title;
        }

        this.setState({ title: title }, () => {
            //this.validationCheck();
        });
    }

    render() {
        return (
            <div className="create-form-summary">
                <div className="create-form-step-header">
                    <h4> Summary </h4>
                    <p> {this.state.message} </p>
                </div>
                <TextField
                    error={this.state.titleError}
                    id="title"
                    label="Title"
                    value={this.state.title}
                    placeholder="Title"
                    className="textfield"
                    margin="normal"
                    onChange={this.handleTitleChange}
                />
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(SummaryForm);
