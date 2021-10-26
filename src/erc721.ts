import { getInfoFromIpfs, log } from './utils';

import { infuraEndpoint } from './config';

const Web3 = require("web3");

export class Erc721Handler {
    infuraKey: string;
    abi: string;
    address: string;
    contract: any;

    constructor(infuraKey:string, abi:any, address:string) {
        this.infuraKey = infuraKey;
        this.abi = abi;
        this.address = address;

        this.initialize();
    }

    initialize() {
        let provider = new Web3.providers.WebsocketProvider(infuraEndpoint + this.infuraKey);
        let web3 = new Web3(provider);
    
        this.contract = new web3.eth.Contract(this.abi, this.address);
    }

    async getTokenInfo(tokenId:number) {
        const tokenURI = await this.contract.methods.tokenURI(tokenId).call();
        log(tokenURI);
    
        return await getInfoFromIpfs(tokenURI);
    }
}