// Load contract information
// This script should support any ERC-721 token
import  { abi, address } from './contract'

const Web3 = require("web3");
const got = require("got"); 

// Load project key of Infura
const infuraKey = process.env.INFURA_KEY;
if( !infuraKey ) {
    log("Please specify the environment varilable INFURA_KEY");
    process.exit(1);
}

const discordToken = process.env.DISCORD_TOKEN;
if ( !discordToken ) {
    log("Please specify the environment varilable DISCORD_TOKEN");
    process.exit(1);
}
const { MessageEmbed, WebhookClient, Client, Intents } = require("discord.js");
//const webhook = new WebhookClient({ id: '', token: discordToken}); 
const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });
let channel:any;
client.once('ready', async () => {
    log("starting web3");
    channel = await client.channels.fetch('901411350696308759');
    channel.send("hello");
    start();
});
client.login(discordToken);

function postWizard(name:string, image:string) {
    const embed = new MessageEmbed()
    .setTitle("Wizard has been burned!")
    .setImage(image)
    .setThumbnail(image)
    .addFields(
        { name: "Burned Wizard", value: name },
        { name: "Appeared Soul", value: name},
    )
    .setColor('#0099ff');

    // TODO: must get it from the configuration
    if(channel) {
        channel.send({
           embeds: [embed],
        });
    } else {
        console.log("failed to get channel object");
    }
}

function start() {
    // Initialize web3
    let provider = new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/" + infuraKey)
    let web3 = new Web3(provider);

    const contract = new web3.eth.Contract(abi, address);

    // Monitor new events
    contract.events.Transfer({ fromBlock: "latest" })
    .on("connected", (subscriptionId:any) => {
        log("connected");
        log(subscriptionId);
    })
    .on("data", (event:any) => {
        log("data");
        const tokenId = event.returnValues.tokenId;
        const prevOwner = event.returnValues.from;
        const newOwner = event.returnValues.to;
        log("Token ID " + tokenId + " has been transfered from " + prevOwner + " to " + newOwner);
        getTokenInfo(contract, tokenId).then(result => {
            console.log(result);
            log(result.name);
            log(getIpfsGwUrl(result.image));
            postWizard(result.name, getIpfsGwUrl(result.image))
        });
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
        start();
    })
    .on("end", () => {
        log("end");
        log("restarting web3");
        start();
    });
}

async function getTokenInfo(contract:any, tokenId:number) {
    const tokenURI = await contract.methods.tokenURI(tokenId).call();
    log(tokenURI);

    return await getInfoFromIpfs(tokenURI);
}

async function getInfoFromIpfs(url:string) {
    const ipfsGwUrl = getIpfsGwUrl(url);
    const response = await got(ipfsGwUrl).json();
    return response;
}

function getIpfsGwUrl(url:string): string {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
}

function log(log:string) {
    var datetime = new Date();
    console.log(datetime.toISOString() + ":" + log);    
}
