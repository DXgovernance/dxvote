const fs = require('fs');
const Web3 = require('web3');
const args = process.argv;
require('dotenv').config();
const BN = Web3.utils.BN;
// Get network to use from arguments
const network = 'mainnet';
const repToken = "0x7a927a93f221976aae26d5d077477307170f0b7c";
const repMapping = "0x458c390a29c6bed4aec37499b525b95eb0de217d";

if (!network) throw('Not network selected, --network parameter missing');

const httpProviderUrl = `https://${network}.infura.io/v3/${process.env.REACT_APP_KEY_INFURA_API_KEY}`
const web3 = new Web3(httpProviderUrl)
console.log('Getting rep holders from', repToken, httpProviderUrl)

const DXRepABI = [{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_blockNumber","type":"uint256"}],"name":"balanceOfAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_blockNumber","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"},{"name":"_amount","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

const DXRepMappingABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"source","type":"address"},{"indexed":true,"internalType":"bytes32","name":"topic","type":"bytes32"},{"indexed":false,"internalType":"string","name":"value","type":"string"}],"name":"Signal","type":"event"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"topic","type":"bytes32"},{"internalType":"string","name":"value","type":"string"}],"name":"signal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

const DXRep = new web3.eth.Contract(DXRepABI, repToken);
const DXRepMapping = new web3.eth.Contract(DXRepMappingABI, repMapping);
const fromBlock = 7850172;

async function main() {
  const toBlock = (await web3.eth.getBlock('latest')).number;
  const dxRepEvents = await DXRep.getPastEvents("allEvents", {fromBlock, toBlock});
  const dxRepMappingEvents = await DXRepMapping.getPastEvents("allEvents", {fromBlock, toBlock});

  let addresses = {};
  for (var i = 0; i < dxRepEvents.length; i++) {
    if (dxRepEvents[i].event == 'Mint') {
      const mintedRep = new BN(dxRepEvents[i].returnValues._amount.toString());
      const toAddress = dxRepEvents[i].returnValues._to;
      if (addresses[toAddress]) {
        addresses[toAddress] = addresses[toAddress].add(mintedRep);
      } else {
        addresses[toAddress] = mintedRep;
      }
    }
  }
  for (var i = 0; i < dxRepEvents.length; i++) {
    if (dxRepEvents[i].event == 'Burn') {
      const burnedRep = new BN(dxRepEvents[i].returnValues._amount.toString());
      const fromAddress = dxRepEvents[i].returnValues._from;
      addresses[fromAddress] = addresses[fromAddress].sub(burnedRep)
    }
  }
  for (var i = 0; i < dxRepMappingEvents.length; i++) {
    if (
      dxRepMappingEvents[i].returnValues.topic == '0xac3e2276e49f2e2937cb1feecb361dd733fd0de8711789aadbd4013a2e0dac14'
      && dxRepMappingEvents[i].returnValues.value.length == 42
      && addresses[dxRepMappingEvents[i].returnValues.source]
      && dxRepMappingEvents[i].returnValues.source != dxRepMappingEvents[i].returnValues.value
    ) {
      const signaledAddress = dxRepMappingEvents[i].returnValues.value;
      const fromAddress = dxRepMappingEvents[i].returnValues.source;
      console.log(fromAddress, signaledAddress)
      if (addresses[signaledAddress]) {
        addresses[signaledAddress] = addresses[signaledAddress].add(addresses[fromAddress]);
      } else {
        addresses[signaledAddress] = addresses[fromAddress];
      }
      delete addresses[fromAddress];
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
    totalRep: totalRep.toString(),
    totalRepHolders: Object.keys(addresses).length
  }
  console.log('REP Holders:', repHolders.totalRep, repHolders.totalRepHolders)
  fs.writeFileSync('.repHolders.json', JSON.stringify(repHolders));
} 

Promise.all([main()]).then(process.exit);
