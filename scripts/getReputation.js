const fs = require('fs');
const Web3 = require('web3');
const args = process.argv;
require('dotenv').config();
const BN = Web3.utils.BN;
// Get network to use from arguments
let network, repToken, fromBlock, toBlock;
for (var i = 0; i < args.length; i++) {
  if (args[i] == '--network')
    network = args[i+1];
  if (args[i] == '--repToken')
    repToken = args[i+1];
  if (args[i] == '--fromBlock')
    fromBlock = args[i+1];
  if (args[i] == '--toBlock')
    toBlock = args[i+1];
}
if (!network) throw('Not network selected, --network parameter missing');

const httpProviderUrl = `https://${network}.infura.io/v3/${process.env.REACT_APP_KEY_INFURA_API_KEY}`
const web3 = new Web3(httpProviderUrl)
console.log('Getting rep holders from', repToken, httpProviderUrl)

const DXRepABI = [{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_blockNumber","type":"uint256"}],"name":"balanceOfAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_blockNumber","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"},{"name":"_amount","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

const DXRep = new web3.eth.Contract(DXRepABI, repToken);

async function main() {
  const allEvents = await DXRep.getPastEvents("allEvents", {fromBlock, toBlock});
  let addresses = {};
  for (var i = 0; i < allEvents.length; i++) {
    if (allEvents[i].event == 'Mint') {
      const mintedRep = new BN(allEvents[i].returnValues._amount.toString());
      const toAddress = allEvents[i].returnValues._to;
      if (addresses[toAddress]) {
        addresses[toAddress] = addresses[toAddress].add(mintedRep);
      } else {
        addresses[toAddress] = mintedRep;
      }
    }
  }
  for (var i = 0; i < allEvents.length; i++) {
    if (allEvents[i].event == 'Burn') {
      const burnedRep = new BN(allEvents[i].returnValues._amount.toString());
      const fromAddress = allEvents[i].returnValues._from;
      addresses[fromAddress] = addresses[fromAddress].sub(burnedRep)
    }
  }
  let totalRep = new BN(0);
  for (var address in addresses) {
    totalRep = totalRep.add(addresses[address])
    addresses[address] = addresses[address].toString();
  }
  const repHolders = {
    addresses: addresses,
    network: network,
    repToken: repToken,
    fromBlock: fromBlock,
    toBlock: toBlock,
    totalRep: totalRep.toString()
  }
  console.log('REP Holders:', repHolders)
  fs.writeFileSync('.repHolders.json', JSON.stringify(repHolders));
} 

Promise.all([main()]).then(process.exit);
