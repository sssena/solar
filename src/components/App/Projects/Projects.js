import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';

// icons
import SearchIcon from '@material-ui/icons/Search';
import SendTokenIcon from '@material-ui/icons/Send';
import SaleIcon from '@material-ui/icons/MonetizationOn';
import FavoriteBorder from '@material-ui/icons/StarBorder';
import FavoriteIcon from '@material-ui/icons/Star';

// local components
import './Projects.css';
import { web3 } from '../../../web3';
import { history } from '../../../helpers/history';
import { contractHandlers } from '../../../helpers/contracts';
import { storageHandlers } from '../../../helpers/storage';
import { getStageLabel } from '../../common/Labels';
import ConfirmPassword from '../../common/ConfirmPassword';
import TokenTransfer from '../../common/TokenTransfer';
import JoinToCrowdsale from '../../common/JoinToCrowdsale';
import ProjectList from '../../common/ProjectList';
import utils from '../../../helpers/utils';

/*
 * @author. sena
 * @comment. 'Projects' shows a address info.
 */
class Projects extends Component {
    state = {
        mainContract: null,
        openTokenTransfer: false,
        openJoinToCrowdsale: false,
        projects: []
    };

    constructor(){
        super();
    }

    async loadOwnProject(){
        let mainContractAddress = await web3.eth.getMainContractAddress( this.props.auth.address );
        if( mainContractAddress == 0x0 || mainContractAddress == '0x' ){ return; } // never had created project.

        let contract = await contractHandlers.getMainContract( mainContractAddress );
        if( !contract ){ return; }

        let stage = contract.stage().toString();
        let title = contract.title();

        this.setState({
            mainContractAddress: mainContractAddress,
            stage: stage,
            title: title
        });
    }

    async loadProjects(){
        let addresses = await storageHandlers.get( this.props.auth.address );
        if( addresses == undefined ) addresses = [];

        let resultList = [];
        for( var address of addresses ){
            let contract = await contractHandlers.getMainContract( address );
            if( contract == null || contract == undefined || contract.address == '0x' || contract.address == 0x0){
                continue;
            }
            let stage = await contract.stage().toString();

            let hasAmount = 0;
            let tokenContract = await contractHandlers.getTokenContract( address );
            if( !(tokenContract == null || tokenContract == undefined || tokenContract.address == '0x' || tokenContract.address == 0x0) ){
                hasAmount = await tokenContract.balanceOf( this.props.auth.address ).toNumber();
                hasAmount = await web3._extend.utils.fromWei( hasAmount );
            }

            let canSend = false;
            if( hasAmount ){
                if( contract.stage().toString() == '3' || contract.stage().toString()== '5' ) {
                    canSend = true;
                }
            }

            let onSale = false;
            let crowdsale = null;
            let crowdsaleContract = await contractHandlers.getFirstCrowdsaleContract( address );
            if( crowdsaleContract == null || crowdsaleContract.address == '0x' || crowdsaleContract.address == 0x0 ){
                crowdsaleContract = contract.sale_param();
                crowdsale = {
                    address: undefined,
                    onSale: onSale
                };
            } else {
                if( stage == "2"
                    && crowdsaleContract.sale_info()[0].toNumber() < moment().unix()
                    && crowdsaleContract.sale_info()[1].toNumber() > moment().unix()
                    && crowdsaleContract.total_CRP().toNumber() < crowdsaleContract.sale_info()[3] ){
                    onSale = true;
                }

                crowdsale = {
                    address: crowdsaleContract.address,
                    onSale: onSale
                };
            }

            resultList.push({
                address: contract.address,
                title: await contract.title(),
                stage: await getStageLabel( contract.stage().toString(10) ),
                symbol: await contract.token_param()[1],
                hasAmount: hasAmount,
                canSend: canSend,
                crowdsale: crowdsale,
                favorite: await storageHandlers.isAdded( this.props.auth.address, contract.address )
            });
        }

        this.setState({ projects: resultList });
    }

    goToDetailView( address ){
        history.push('/projects/detail/' + address);
    }

    componentDidMount(){
        this.loadOwnProject();
        this.loadProjects();
    }

    render() {
        let stage = getStageLabel( this.state.stage );
        return (
            <div className="projects">
                <Card className="project-area detail">
                {
                    !this.state.mainContractAddress ? (
                        <CardContent>
                            <h2 className="title">No project created</h2>
                            <div className="info">
                                Create your own project. You can fund your way through the crowd sale and create a movie.
                                In order to create a project, you need to have permission to create it on the CRP Web.
                            </div>
                        </CardContent>
                    ) : (
                    <CardContent>
                        <h2 className="title">{this.state.title}</h2> {stage}
                        <p className="address">{this.state.mainContractAddress}</p>
                        <div className="t-right">
                            <Button size="small" onClick={this.goToDetailView.bind(this,this.state.mainContractAddress)}> Go to detail </Button>
                        </div>
                    </CardContent>
                    )
                }
                </Card>
                <ProjectList projects={this.state.projects} reloadFunction={this.loadProjects.bind(this)}/>
            </div>
        );
    }
}
function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(Projects);
