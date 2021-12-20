import { address } from './config';

const got = require("got"); 

export function log(log:string) {
    var datetime = new Date();
    console.log(datetime.toISOString() + ":" + log);    
}

export async function getInfoFromIpfs(url:string) {
    const ipfsGwUrl = getIpfsGwUrl(url);
    const response = await got(ipfsGwUrl).json();

    // Replace image URL for convinience
    response.image = await getIpfsGwUrl(response.image);

    return response;
}

function getIpfsGwUrl(url:string): string {
    return url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
}

export async function downloadImageBase64(url:string) {
    const response = await got(url).buffer();
    return response.toString('base64');
}

export function getOpenSeaLink(soulId:number): string {
    return "https://opensea.io/assets/" + address + "/" + soulId
}

export function getOpenSeaOwnerLink(ownerAddress:string): string {
    return "https://opensea.io/accounts/" + ownerAddress;
}