import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import axios from 'axios';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

// icons
import SearchIcon from '@material-ui/icons/Search';

// local components
import './Search.css';
import { web3 } from '../../../web3';
import { history } from '../../../helpers/history';
import utils from '../../../helpers/utils';
import { contractHandlers } from '../../../helpers/contracts';
import { storageHandlers } from '../../../helpers/storage';
import { getStageLabel } from '../../common/Labels';
import ProjectList from '../../common/ProjectList';

/*
 * @author. sena
 * @comment. 'Search' is a web-browser
 */
class Search extends Component {
    state = {
        resultList: [],
    }

    constructor(){
        super();

        this.search = this.search.bind(this);
    }

    // search
    handleInputChange = ( event ) => {
        let input = event.target.value;
        this.setState({ input: input });
    }

    async search() {
        if( this.state.input == '' || this.state.input == undefined ){ return; }

        let resultList = [];
        if( utils.isAddress( (this.state.input).toLowerCase() ) ){  // address searching
            resultList.push( (this.state.input).toLowerCase() );
        } else { // key searching
            let key = this.state.input.toUpperCase();

            let response = {};
            response = await axios({
                method: 'POST',
                dataType: 'json',
                url: 'http://localhost:3000/search/symbol',
                data: {
                    symbol: key
                }
            }).catch( (error) => {
                console.error(error);
                response = {
                    data: {
                        data: []
                    }
                }
            });

            if( response.data.data == undefined ){ return; }

            // response has a token conract address. change it to main address.
            for ( var i = 0; i < response.data.data.length; i++ ){
                let tokenContract = await contractHandlers.getTokenContractWithAddress( response.data.data[i][0] );
                if( tokenContract == null || tokenContract.address == 0x0 || tokenContract.address == '0x' ) continue;
                resultList.push( await tokenContract.main_contract() );
            }
        }
        this.setState({ addresses: resultList }, () => { this.setDataToList() });
    }

    async setDataToList() {
        let addresses = this.state.addresses;
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
        this.setState({ resultList: resultList });
    }

    render() {
        return (
            <div className="search">
                <div className="search-bar">
                    <TextField
                        placeholder="Search"
                        onChange={this.handleInputChange}
                        className="textfield w-100"
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton aria-label="search" onClick={this.search} > <SearchIcon/> </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <ProjectList projects={this.state.resultList} reloadFunction={this.setDataToList.bind(this)} />
        </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(Search);
