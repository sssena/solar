//const Web3 = require('../dist/web3.js');
var Web3 = require('../index');
const web3 = new Web3();

exports.uWeb3 = function (ip, port) { // 'http://192.168.0.133:8545'
    const http = "http://";
    web3.setProvider(new web3.providers.HttpProvider(http + ip + ":" + port));

    this.EOA = [web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2]];

    this.unlock = function (eoa) {
        web3.personal.unlockAccount(eoa)
    };

    this.getTxList = function (eoa, limit) {
        return web3.eth.getTransactionList(eoa, limit);
        //return web3.eth.getTransactionList(eoa, limit, function(){
        //    console.log('done');
        //});
    };

    this.filterContract = function (from, limit) {
        return web3.eth.getContractAddress(from, limit)
    };

    this.estimate = function (object) {
        return web3.eth.estimateGas(object);
    };

    // this.sendTx = function (from, to, value, gas, gasprice) {
        this.sendTx = function (from, to, value, gas) {
        // console.log(gas-1000000);
        // var gass = gas-10000;
        // console.log(gass);
        // return web3.eth.sendTransaction({from: from, to: to, value: web3.toWei(value, "ether"), gas:gas, gasPrice:web3.toWei(gasprice, "ether")})

        return web3.eth.sendTransaction({from: from, to: to, value: web3.toWei(value, "ether"), gas: gas})
        // return web3.eth.sendTransaction({from: from, to: to, value: value})
    };

    this.getMyCoin = function (eoa) {
        // return web3.fromWei(web3.eth.getBalance(eoa), "ether")
        return web3.eth.getBalance(eoa)
    };

    this.reSendTx = function (txHash) {
        return web3.eth.resendTx(txHash)
        // return web3.eth.resend({from:from, to:to, value: web3.toWei(value, "ether"), nonce:nonce})
    };

    this.getTx = function (txID) {
        return web3.eth.getTransaction(txID)
    };

    this.searchCaList = function (url, symbol) {
        return web3.eth.searchContractList(url, symbol)
    };

    this.sendPTx = function (from, account) {
        return web3.eth.sendPermissionTx(from, account)
    };

    this.getPTx = function (eoa) {
        return web3.eth.getPermissionTx(eoa)
    };

    this.getMCA = function (eoa) {
        return web3.eth.getMainContractAddress(eoa)
    };

    this.isLocalEoa = function (eoa) {
        return web3.eth.isAccount(account)
    };

    this.getCaTxList = function (ca, eoa, limit) {
        return web3.eth.getCaTransactionList(ca, eoa, limit)
    };

    this.getEoaTxList = function (eoa, limit) {
        return web3.eth.getEoaTransactionList(eoa, limit)
    };

    this.getAdmin = function () {
        return web3.eth.getAdminAddress()
    };

    this.getToAscii = function (input) {
        return web3.toAscii(input)
    };

    this.erc20abi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_subtractedValue",
                    "type": "uint256"
                }
            ],
            "name": "decreaseApproval",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_addedValue",
                    "type": "uint256"
                }
            ],
            "name": "increaseApproval",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "INITIAL_SUPPLY",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

};

// deploy
// function remix() {
//     var hello4Contract = web3.eth.contract([{
//         "constant": false,
//         "inputs": [{"name": "myName", "type": "string"}],
//         "name": "setAello",
//         "outputs": [],
//         "payable": false,
//         "stateMutability": "nonpayable",
//         "type": "function"
//     }, {
//         "constant": true,
//         "inputs": [],
//         "name": "getAello",
//         "outputs": [{"name": "", "type": "string"}],
//         "payable": false,
//         "stateMutability": "view",
//         "type": "function"
//     }]);
//
//     var hello4 = hello4Contract.new(
//         {
//             from: web3.eth.accounts[0],
//             data: '0x60806040526040805190810160405280600581526020017f68656c6c6f0000000000000000000000000000000000000000000000000000008152506000908051906020019061004f929190610062565b5034801561005c57600080fd5b50610107565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100a357805160ff19168380011785556100d1565b828001600101855582156100d1579182015b828111156100d05782518255916020019190600101906100b5565b5b5090506100de91906100e2565b5090565b61010491905b808211156101005760008160009055506001016100e8565b5090565b90565b6102d7806101166000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063435ffe94146100515780638da9b772146100ba575b600080fd5b34801561005d57600080fd5b506100b8600480360381019080803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919291929050505061014a565b005b3480156100c657600080fd5b506100cf610164565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561010f5780820151818401526020810190506100f4565b50505050905090810190601f16801561013c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b8060009080519060200190610160929190610206565b5050565b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101fc5780601f106101d1576101008083540402835291602001916101fc565b820191906000526020600020905b8154815290600101906020018083116101df57829003601f168201915b5050505050905090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061024757805160ff1916838001178555610275565b82800160010185558215610275579182015b82811115610274578251825591602001919060010190610259565b5b5090506102829190610286565b5090565b6102a891905b808211156102a457600081600090555060010161028c565b5090565b905600a165627a7a72305820335cc33f2d4f95a648b17d8e984b3ab414cd39a312d06d8a20e11d1b1115a4a40029',
//             gas: '4700000'
//         }, function (e, contract) {
//             console.log(e, contract);
//             if (typeof contract.address !== 'undefined') {
//                 console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
//             }
//         });
//
//     console.log("[ kmoon ] hello4 : " + hello4);
// }
//
// remix();
// // const data = '0x60806040526040805190810160405280600581526020017f68656c6c6f0000000000000000000000000000000000000000000000000000008152506000908051906020019061004f929190610062565b5034801561005c57600080fd5b50610107565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100a357805160ff19168380011785556100d1565b828001600101855582156100d1579182015b828111156100d05782518255916020019190600101906100b5565b5b5090506100de91906100e2565b5090565b61010491905b808211156101005760008160009055506001016100e8565b5090565b90565b6102d7806101166000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063435ffe94146100515780638da9b772146100ba575b600080fd5b34801561005d57600080fd5b506100b8600480360381019080803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919291929050505061014a565b005b3480156100c657600080fd5b506100cf610164565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561010f5780820151818401526020810190506100f4565b50505050905090810190601f16801561013c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b8060009080519060200190610160929190610206565b5050565b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101fc5780601f106101d1576101008083540402835291602001916101fc565b820191906000526020600020905b8154815290600101906020018083116101df57829003601f168201915b5050505050905090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061024757805160ff1916838001178555610275565b82800160010185558215610275579182015b82811115610274578251825591602001919060010190610259565b5b5090506102829190610286565b5090565b6102a891905b808211156102a457600081600090555060010161028c565b5090565b905600a165627a7a72305820335cc33f2d4f95a648b17d8e984b3ab414cd39a312d06d8a20e11d1b1115a4a40029';
// // console.log(web3.eth.sendTransaction({from: web3.eth.accounts[0], data:data, gas:200000}));
