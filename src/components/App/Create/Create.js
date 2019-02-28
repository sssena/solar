import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';

// local components
import './Create.css';
import { web3 } from '../../../web3';
import SummaryForm from './Create/SummaryForm';
import TokenForm from './Create/TokenForm';
import CrowdsaleForm from './Create/CrowdsaleForm';
import StaffForm from './Create/StaffForm';
import RoadmapForm from './Create/RoadmapForm';

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
        validationFlag: false
    };

    constructor(){
        super();

        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);

        this.getValidationData = this.getValidationData.bind(this);

        this.getSteps = this.getSteps.bind(this);
        this.getStepContent = this.getStepContent.bind(this);
    }

    handleNext = () => {
        this.setState({ activeStep: (this.state.activeStep + 1), validationFlag: false });
    }
    handleBack = () => {
        this.setState({ activeStep: (this.state.activeStep - 1), validationFlag: true });
    }

    getValidationData( data ) {
        console.log( data );
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
                    validationFlag: data.flag
                });
                break;
        }
    }

    getSteps(){
        return ["Title", "Token", "Crowdsale", "Staff", "Roadmap"];
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
            default:
                return "confirm create";
                //return (<ConfirmCreateForm />);
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
                        disabled={this.state.validationFlag ? false : true}
                        className="create-step-controller-btn"
                        variant="contained"
                        color="primary"
                        onClick={this.handleNext} >
                        { this.state.activeStep == steps.length -1 ? 'Finish' : 'Next' }
                    </Button>
                </div>
            </div>
        );
    }
}

function mapStateToProps( state ){
    return state.authentication;
}
export default connect(mapStateToProps)(Create);
