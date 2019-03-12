import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

// local components
import './Create.css';
import createMainContract from '../../../helpers/contracts';
import ConfirmPassword from '../../common/ConfirmPassword';
import SummaryForm from './Create/SummaryForm';
import TokenForm from './Create/TokenForm';
import CrowdsaleForm from './Create/CrowdsaleForm';
import StaffForm from './Create/StaffForm';
import RoadmapForm from './Create/RoadmapForm';
import Receipt from './Create/Receipt';
import { statusActions } from '../../../actions'

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

    handleConfirmPasswordClose = ( result ) => {
        this.setState({ openConfirmPassword: false, authorized: result }, () => {
            if( this.state.authorized ){
                this.createProject();
            }
        });
    }

    makeMomentToUnixTime( params ){
        // crowdsales
        for(var i = 0; i < params.crowdsales.length; i++ ){
            params.crowdsales[i].date.startDate = params.crowdsales[i].date.startDate.clone().unix();
            params.crowdsales[i].date.endDate = params.crowdsales[i].date.endDate.clone().unix();
        }

        // roadmaps
        for(var i = 0; i < params.roadmaps.length; i++ ){
            params.roadmaps[i].date.startDate = params.roadmaps[i].date.startDate.clone().unix();
            params.roadmaps[i].date.endDate = params.roadmaps[i].date.endDate.clone().unix();
        }

        return params;
    }

    async createProject(){
        let createParams = { // this.makeMomentToUnixTime({
            owner: this.props.authentication.auth.address,
            title: this.state.title,
            token: {
                name: this.state.name,
                symbol: this.state.symbol
            },
            crowdsales: this.state.crowdsales[0], //TODO: send array 
            staff: this.state.staff,
            roadmaps: this.state.roadmaps
        }; // );

        this.props.dispatch( statusActions.start() );

        if( this.state.authorized ){
            let result = await createMainContract( createParams ).catch( (error) => {
                console.log( error );
                this.props.dispatch( statusActions.done() );
            });

            console.log( result.result, result.error );
            this.props.dispatch( statusActions.done() );
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
                return ;// TODO: Error
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
