import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import path from 'path';

// material-ui components 
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

// icons
import UpdateIcon from '@material-ui/icons/Cached';
import ConsoleIcon from '@material-ui/icons/AspectRatio';

// local components
import './Config.css';
import { web3 } from '../../../web3';
import utils from '../../../helpers/utils';
import { configureActions } from '../../../actions';

/*
 * @author. sena
 * @comment. 'Config' is hidden menu for configure.
 */
class Config extends Component {
    state = {
        config: {
            timezone: 'UTC'
        }
    };

    constructor(){
        super();
        this.handleTimezoneChange = this.handleTimezoneChange.bind(this);
    };

    handleTimezoneChange = ( event ) => {
        this.setState({ timezone: event.target.value });
        let state = configureActions.set( 'timezone', event.target.value );
    }

    async componentWillMount(){
        console.log( configureActions.get( 'timezone' ));
        this.setState({ config: this.props.configure });
    }

    render() {
        return (
            <div className="config-item-list">
                <Card className="config-item">
                    <CardHeader title="Timezone" subheader={"Current: " + this.state.config.timezone}/>
                    <CardContent>
                        <FormControl>
                            <InputLabel htmlFor="timezone">Timezone</InputLabel>
                            <Select
                                value={this.state.config.timezone}
                                onChange={this.handleTimezoneChange}
                                inputProps={{ name: 'timezone', id: 'timezone' }}
                            >
                                <MenuItem value="UTC">UTC</MenuItem>
                                <MenuItem value="Asia/Seoul">KST, GMT+0900</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    const { loggingIn } = state.authentication;
    const configure = state.configure;
    return { loggingIn, configure };
}
export default connect(mapStateToProps)(Config);

