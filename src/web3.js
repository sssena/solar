/*
 * @author. sena@soompay.net
 * @comment. return web3 object from electron.
 */
web3 = require('electron').remote.getGlobal('web3');
//console.log( web3 );

module.exports = { web3 };
