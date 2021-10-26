import { address, startBlock } from './config';

// Load contract information
import { abi } from './contracts/souls';
import { infuraEndpoint } from './config';
import { log } from './utils'

const Web3 = require("web3");

export function start(infuraKey:string, eventCallBack:(wizardTokenId:number, soulTokenId:number) => void) {
    log("starting web3");

    // Initialize web3
    let provider = new Web3.providers.WebsocketProvider(infuraEndpoint + infuraKey)
    let web3 = new Web3(provider);

    const contract = new web3.eth.Contract(abi, address);

    // Monitor new events
    contract.events.SoulBurned({ fromBlock: startBlock })
    .on("connected", (subscriptionId:any) => {
        log("connected: " + subscriptionId);
    })
    .on("data", (event:any) => {
        log("data");     
        const wizardId = event.returnValues.tokenId; // wizard ID
        const souldId = event.returnValues.soulId; // sould ID
        log("Wizard ID " + wizardId + " has been burned and Sould ID " + souldId + " has been minted");

        eventCallBack(wizardId, souldId);
    })
    .on("changed", (event:any) => {
        log("changed");
        // remove event from local database
    })
    .on("error", (error:any, receipt:any) => {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        log("error");
        console.log(error, receipt);
        log("restarting web3");
        start(infuraKey, eventCallBack);
    })
    .on("end", () => {
        log("end");
        log("restarting web3");
        start(infuraKey, eventCallBack);
    });
}