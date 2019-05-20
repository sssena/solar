import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material-ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

// local components
import './Create.css';
import { contractHandlers } from '../../../helpers/contracts';
import ConfirmPassword from '../../common/ConfirmPassword';
import SummaryForm from './Create/SummaryForm';
import TokenForm from './Create/TokenForm';
import CrowdsaleForm from './Create/CrowdsaleForm';
import StaffForm from './Create/StaffForm';
import RoadmapForm from './Create/RoadmapForm';
import Receipt from './Create/Receipt';
import { statusActions } from '../../../actions';
import { web3 } from '../../../web3';
import { history } from '../../../helpers/history';

/*
 * @author. sena
 * @comment. 'Create' is a view for creating project 
 */
class Create extends Component {
    state = {
        activeStep: 0,
        title: '',
        name: '',
        symbol: '',
        useSto: false,
        crowdsales: [],
        staff: [],
        roadmaps:[],
        validationFlag: false,
        openConfirmPassword: false,
        authorized: false
    };

    constructor(){
        super();

        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleConfirmPasswordOpen = this.handleConfirmPasswordOpen.bind(this);
        this.handleConfirmPasswordClose = this.handleConfirmPasswordClose.bind(this);
        this.createProject = this.createProject.bind(this);
        this.getValidationData = this.getValidationData.bind(this);
        this.getSteps = this.getSteps.bind(this);
        this.getStepContent = this.getStepContent.bind(this);
    }

    handleNext = () => {
        if( this.state.activeStep == this.getSteps().length - 1 ){
            this.setState({ openConfirmPassword: true });
        } else {
            this.setState({ activeStep: (this.state.activeStep + 1), validationFlag: false });
        }
    }

    handleBack = () => {
        this.setState({ activeStep: (this.state.activeStep - 1), validationFlag: true });
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ openConfirmPassword: false, authorized: data.result, passcode: data.passcode }, () => {
            if( this.state.authorized ){
                this.createProject();
            }
        });
    }

    async getParams(){
        let createParams = {
            owner: {
                account: this.props.authentication.auth.address,
                password: this.state.passcode
            },
            passcode: this.state.passcode,
            title: this.state.title,
            token: {
                name: this.state.name,
                symbol: this.state.symbol,
                useSto: (this.state.useSto ? 1 : 0 )
            },
            crowdsales: [],
            staff: this.state.staff,
            roadmaps: []
        };

        // Moment has mutability. so need to clone before make it unix time
        for( var i = 0; i < this.state.crowdsales.length; i++ ){
            createParams.crowdsales.push({
                date: {
                    startDate: this.state.crowdsales[i].date.startDate.clone().unix(),
                    endDate: this.state.crowdsales[i].date.endDate.clone().unix()
                },
                softcap: await web3._extend.utils.toWei( this.state.crowdsales[i].softcap ),
                hardcap: await web3._extend.utils.toWei( this.state.crowdsales[i].hardcap ),
                additionalSupply: this.state.crowdsales[i].additionalSupply,
                crpRange: {
                    min: await web3._extend.utils.toWei( this.state.crowdsales[i].crpRange.min ),
                    max: await web3._extend.utils.toWei( this.state.crowdsales[i].crpRange.max ),
                },
                exchangeRatio: this.state.crowdsales[i].exchangeRatio,
                firstWithdrawal: await web3._extend.utils.toWei( this.state.crowdsales[i].firstWithdrawal ),
            });
        }

        for( var i = 0; i < this.state.roadmaps.length; i++ ){
            createParams.roadmaps.push({
                date: {
                    startDate: this.state.roadmaps[i].date.startDate.clone().unix(),
                    endDate: this.state.roadmaps[i].date.endDate.clone().unix()
                },
                withdrawal: await web3._extend.utils.toWei( this.state.roadmaps[i].withdrawal ),
            });
        }

        return createParams;
    }

    async createProject(){
        let error = null;
        let createParams = await this.getParams();

        this.props.dispatch( statusActions.start() );
        this.props.dispatch( statusActions.sendMessage('Create new project...') );

        if( this.state.authorized ){
            let result = await contractHandlers.createProject( createParams )
                .catch( (error) => {
                    console.error( error );
                    result = false;
                });

            // failed.
            if( !result ){
                this.props.dispatch( statusActions.done() );
                alert('Fail to create project. Try again.\n If the problem persists, restart the application.');
                return;
            }

            this.props.dispatch( statusActions.done() );
            history.push( '/projects' );
        }
    }

    getValidationData( data ) {
        switch( this.state.activeStep ){
            case 0:
                this.setState({ 
                    title: data.values.title, 
                    validationFlag: data.flag 
                });
                break;

            case 1:
                this.setState({ 
                    name: data.values.name, 
                    symbol: data.values.symbol, 
                    useSto: data.values.useSto, 
                    validationFlag: data.flag 
                });
                break;

            case 2:
                this.setState({ 
                    crowdsales: data.values.crowdsales,
                    validationFlag: data.flag
                });
                break;

            case 3:
                this.setState({
                    staff: data.values.staff,
                    validationFlag: data.flag
                });
                break;

            case 4:
                this.setState({
                    roadmaps: data.values.roadmaps,
                    remainAmounts: data.values.remainAmounts,
                    totalWithdrawal: data.values.totalWithdrawal,
                    validationFlag: data.flag
                });
                break;
        }
    }

    getSteps(){
        return ["Title", "Token", "Crowdsale", "Staff", "Roadmap", "Confirm"];
    }

    getStepContent( step ){
        switch( step ){
            case 0:
                return ( <SummaryForm sendData={this.getValidationData} data={this.state} /> );
                break;
            case 1:
                return ( <TokenForm sendData={this.getValidationData} data={this.state} /> );
                break;
            case 2:
                return ( <CrowdsaleForm sendData={this.getValidationData} data={this.state} /> );
                break;
            case 3:
                return ( <StaffForm sendData={this.getValidationData} data={this.state} /> );
                break;
            case 4:
                return ( <RoadmapForm sendData={this.getValidationData} data={this.state} /> );
                break;
            case 5:
                return ( <Receipt projectInfo={this.state}/> );
                break;
            default:
                return null;// TODO: Error
        }
    }

    render() {
        const steps = this.getSteps();
        return (
            <div className="create">
                <h2 className="create-header"> Create your project </h2>
                <Stepper className="create-stepper" activeStep={this.state.activeStep}>
                    {
                        steps.map( (label, index) => {
                            const props = {};
                            const labelProps = {};

                            return(
                                <Step key={label} {...props}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })
                    }
                </Stepper>
                <div className="create-form">
                    { this.getStepContent(this.state.activeStep) }
                </div>
                <div className="create-step-controller">
                    <Button
                        disabled={this.state.activeStep === 0}
                        onClick={this.handleBack}
                        className="create-step-controller-btn">
                        Back
                    </Button>
                    <Button
                        disabled={(this.state.validationFlag || this.state.activeStep == steps.length -1) ? false : true}
                        className="create-step-controller-btn"
                        variant="contained"
                        color="primary"
                        onClick={this.handleNext} >
                        { this.state.activeStep == steps.length -1 ? 'Create' : 'Next' }
                    </Button>
                </div>
                <Dialog
                    open={this.state.openConfirmPassword}
                    onClose={this.handleConfirmPasswordClose} >
                    <ConfirmPassword 
                        useUnlock={true}
                        closeAction={this.handleConfirmPasswordClose} />
                </Dialog>

            </div>
        );
    }
}

function mapStateToProps( state ){
    return state;
}
export default connect(mapStateToProps)(Create);
