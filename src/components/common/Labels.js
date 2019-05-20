import React, { Component } from 'react';

import { Badge } from 'react-bootstrap';

// material-ui components
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

// icons
import ErrorIcon from '@material-ui/icons/Error';
import FailIcon from '@material-ui/icons/Block';
import DoneIcon from '@material-ui/icons/Done';

// local css
import './Labels.css';

// local defines
const SUCCESS_MESSAGE = "Success";
const FAIL_MESSAGE = "Fail";
const ERROR_MESSAGE = "Error";

/*
 * @author. sena@soompay.net
 * @comment. 'Lables' defines status labes.
 *           @error, @success, @fail ...etc...
 */
function SuccessLabel() {
    return(
        <div className="label-div">
            <Badge variant="success">
                <DoneIcon className="label-icon"/>
            </Badge>
            <span className="label-text-success">{SUCCESS_MESSAGE}</span>
        </div>
    );
}

function FailLabel() {
    return(
        <div className="label-div">
            <Badge variant="secondary">
                <DoneIcon className="label-icon"/>
            </Badge>
            <span className="label-text-faiol">{FAIL_MESSAGE}</span>
        </div>
    );
}

function ErrorLabel() {
    return(
        <div className="label-div">
            <Badge variant="danger">
                <DoneIcon className="label-icon"/>
            </Badge>
            <span className="label-text-error">{ERROR_MESSAGE}</span>
        </div>
    );
}

/*
 * @author. sena@soompay.net
 * @comment. project stage labels
 * */
function getStageLabel( stage ){
    if( stage == undefined || stage == null ){
        return Unknown();
    }

    let label = null;
    switch( stage.toString() ){
        case "0":
            label = Init();
            break;
        case "1":
            label = Ready();
            break;
        case "2":
            label = Sailing();
            break;
        case "3":
            label = Proceeding();
            break;
        case "4":
            label = Failed();
            break;
        case "5":
            label = Complete();
            break;
        default:
            label = Unknown();
            break;
    }
    return label;
}

function Init() {
    return( <Badge className="label-big" pill variant="secondary">INIT</Badge>);
}
function Ready() {
    return( <Badge className="label-big label-ready" pill variant="warning">READY</Badge>);
}
function Failed() {
    return( <Badge className="label-big" pill variant="danger">FAIL</Badge>);
}
function Sailing() {
    return( <Badge className="label-big" pill variant="info">SAILING</Badge>);
}
function Proceeding() {
    return( <Badge className="label-big" pill variant="primary">PROCEEDING</Badge>);
}
function Complete() {
    return( <Badge className="label-big" pill variant="success">COMPLETE</Badge>);
}
function Unknown() {
    return( <Badge className="label-big" pill variant="dark">UNKNOWN</Badge>);
}

export { SuccessLabel, FailLabel, ErrorLabel, getStageLabel };
