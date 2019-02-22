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
        <Badge variant="secondary"><FailIcon className="label-icon"/>{FAIL_MESSAGE}</Badge>
    );
}

function ErrorLabel() {
    return(
        <Badge variant="danger"><ErrorIcon className="label-icon"/>{ERROR_MESSAGE}</Badge>
    );
}

export { SuccessLabel, FailLabel, ErrorLabel };
