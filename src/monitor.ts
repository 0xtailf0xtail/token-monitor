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

function start() {
    // Initialize web3
    let provider = new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/" + infuraKey)
    let web3 = new Web3(provider);

    const contract = new web3.eth.Contract(abi, address);

    // Monitor new events
    contract.events.Transfer({ fromBlock: "latest" })
    .on("connected", (subscriptionId:any) => {
        console.log("connected");
        console.log(subscriptionId);
    })
    .on("data", (event:any) => {
        console.log("data");
        const tokenId = event.returnValues.tokenId;
        const prevOwner = event.returnValues.from;
        const newOwner = event.returnValues.to;
        console.log("Token ID " + tokenId + " has been transfered from " + prevOwner + " to " + newOwner);
    })
    .on("changed", (event:any) => {
        console.log("changed");
        // remove event from local database
    })
    .on("error", (error:any, receipt:any) => {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log("error");
        console.log(error, receipt);
        console.log("restarting web3");
        start();
    })
    .on("end", () => {
        console.log("end");
        console.log("restarting web3");
        start();
    });
}

console.log("starting web3");
start();