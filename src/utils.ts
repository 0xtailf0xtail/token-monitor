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
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
}