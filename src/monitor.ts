// Load contract information
// This script should support any ERC-721 token
import  { abi, address } from './contract'

const Web3 = require("web3");

// Load project key of Infura
const infuraKey = process.env.INFURA_KEY
if( !infuraKey ) {
    console.log("Please specify the environment varilable INFURA_KEY");
    process.exit(1);
}

// Initialize 
let web3 = new Web3(
  new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/" + infuraKey)
);

const contract = new web3.eth.Contract(abi, address);

// Monitor new events
contract.events.Transfer(
    { fromBlock: "latest" },
    (errors:any, events:any) => {
        if (!errors) {
            for(const transfer of events ) {
                const tokenId = transfer.returnValues.tokenId;
                const prevOwner = transfer.returnValues.from;
                const newOwner = transfer.returnValues.to;
                console.log("Token ID " + tokenId + " has been transfered from " + prevOwner + " to " + newOwner);
            }
        }
    }
);