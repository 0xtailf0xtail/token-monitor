import { getInfoFromIpfs, log } from './utils'
import { startBlock, wizardTokenUrlBase } from './config';

// Load contract information
import { abi } from './contracts/souls';
import { infuraEndpoint } from './config';

const Web3 = require("web3");

export class GreatBurningMonitor {
    infuraKey: string;
    abi: string;
    address: string;
    contract: any;

    constructor(infuraKey:string, abi:any, address:string) {
        this.infuraKey = infuraKey;
        this.abi = abi;
        this.address = address;
    }

    initialize() {
        const provider = new Web3.providers.WebsocketProvider(infuraEndpoint + this.infuraKey);
        const web3 = new Web3(provider);
    
        this.contract = new web3.eth.Contract(this.abi, this.address);
    }

    async getTokenInfo(tokenId:number) {
        const tokenURI = await this.contract.methods.tokenURI(tokenId).call();
        log(tokenURI);
    
        return await getInfoFromIpfs(tokenURI);
    }

    async start(eventCallBack:(wizardTokenId:number, soulTokenId:number) => void) {
        log("starting web3");
        this.initialize()

        // Monitor new events
        this.contract.events.SoulBurned({ fromBlock: startBlock })
        .on("connected", async (subscriptionId:any) => {
            log("connected: " + subscriptionId);
        })
        .on("data", async (event:any) => {
            const wizardId = event.returnValues.tokenId; // wizard ID
            const soulId = event.returnValues.soulId; // sould ID
            log("Wizard ID " + wizardId + " has been burned and Sould ID " + soulId + " has been minted");

            let soulInfo:any = "";
            for(let retryCount = 0; retryCount < 5; retryCount++) {
                try {
                    soulInfo = await this.getTokenInfo(soulId);
                    if(soulInfo != "") {
                        break;
                    }
                } catch {
                    console.log("metadata of " + soulId + " isn't available yet. Retry " + retryCount);
                    // retry after 500ms wait
                    await new Promise(f => setTimeout(f, 500));
                    continue;
                }
            }
            if(soulInfo == "") {
                // well let's use the placeholder for now
                soulInfo = {"name": "Unknow soul", "image":"https://via.placeholder.com/400"};
            }

            soulInfo.id = soulId;
            console.log(soulInfo);
    
            // since wizard is burned, we can't get the metadata url from tokenURI
            // But ipfs should still have it 
            let wizardInfo = await getInfoFromIpfs(wizardTokenUrlBase + wizardId);
            wizardInfo.id = wizardId;

            eventCallBack(wizardInfo, soulInfo);
        })
        .on("error", async (error:any, receipt:any) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            log("error");
            console.log(error, receipt);
            log("restarting web3");
            this.start(eventCallBack);
        })
        .on("end", async () => {
            log("end");
            log("restarting web3");
            this.start(eventCallBack);
        });
    }   
}
