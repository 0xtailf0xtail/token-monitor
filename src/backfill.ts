import { address, infuraEndpoint, wizardTokenUrlBase } from './config';
import { getInfoFromIpfs, log } from './utils';

import { abi } from './contracts/souls'
import { tweetBurnResult } from './twitter';

const Web3 = require("web3");

// Load project key of Infura
const infuraKey = process.env.INFURA_KEY;
if( !infuraKey ) {
    log("Please specify the environment varilable INFURA_KEY");
    process.exit(1);
}

const provider = new Web3.providers.WebsocketProvider(infuraEndpoint + infuraKey);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, address);

// Read processed soulds
const processedSoulsFile = "./data/processedSouls.txt";
let processedSouls = new Map<string, boolean>();
const fs = require('fs');
try {
    let lines = fs.readFileSync(processedSoulsFile, 'utf-8').split('\n');
    console.log(lines);
    lines.forEach((soulId:string) => {
        if(Number(soulId)) {
            processedSouls.set(soulId, true);
        }
    })
} catch (err) {
    console.log(err);
    // Do nothing
}
console.log(processedSouls);

// Monitor new events
async function start() {
    const events = await contract.getPastEvents('SoulBurned', { fromBlock: 13525666, toBlock: 13540428 })
    for (let event of events) {
        const wizardId = event.returnValues.tokenId;
        const soulId = event.returnValues.soulId;
        if(!processedSouls.has(soulId)) {
            console.log(soulId);
            // Get soulInfo
            let soulInfo;
            try {
                soulInfo = await getTokenInfo(soulId);
                soulInfo.id = soulId;
            } catch(err) {
                console.log(err);
                console.log("failed to retrieve soulInfo: " + soulId);
                process.exit(1);
            }

            // Get wizardInfo
            let wizardInfo;
            try {
                wizardInfo = await getInfoFromIpfs(wizardTokenUrlBase + wizardId);
                wizardInfo.id = wizardId;
            } catch(err) {
                console.log(err);
                console.log("failed to retrieve wizardInfo: " + soulId);
                process.exit(1);
            }

            // Send the result to Twitter
            tweetBurnResult(wizardInfo, soulInfo);

            // Append to the processedSouls file
            fs.appendFileSync(processedSoulsFile, soulId + "\n");

            // Wait 5 minutes
            await new Promise(resolve => setTimeout(resolve, 300 * 1000));
        } else {
            console.log(soulId + " is already processed. Skip.")
        }
    };
    // done
    process.exit(0);
};

async function getTokenInfo(tokenId:number) {
    const tokenURI = await contract.methods.tokenURI(tokenId).call();
    return await getInfoFromIpfs(tokenURI);
}

start();

