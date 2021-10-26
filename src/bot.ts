import { address, discordChannelId, wizardTokenUrlBase } from './config';
import { getInfoFromIpfs, log } from './utils';

import { Erc721Handler } from './erc721';
import { abi } from './contracts/souls'
import { start } from './monitor';

const { MessageEmbed, Client, Intents } = require("discord.js");

// Load project key of Infura
const infuraKey = process.env.INFURA_KEY;
if( !infuraKey ) {
    log("Please specify the environment varilable INFURA_KEY");
    process.exit(1);
}

// Initialize discord client
const discordToken = process.env.DISCORD_TOKEN;
if ( !discordToken ) {
    log("Please specify the environment varilable DISCORD_TOKEN");
    process.exit(1);
}

//const webhook = new WebhookClient({ id: '', token: discordToken}); 
const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });
client.once('ready', async () => {
    const channel = await client.channels.fetch(discordChannelId);

    let soul = new Erc721Handler(infuraKey, abi, address);

    start(infuraKey, async (wizardId:number, soulId:number) => {
        let soulInfo:any;
        try {
            soulInfo = await soul.getTokenInfo(soulId);
        } catch {
            // well let's use the placeholder for now
            soulInfo = {"name": "Unknow soul", "image":"https://via.placeholder.com/400"};
        }
        console.log(soulInfo);
        log(soulInfo.name);
        log(soulInfo.image);

        // since wizard is burned, we can't get the metadata url from tokenURI
        // But ipfs should still have it 
        const wizardInfo = await getInfoFromIpfs(wizardTokenUrlBase + wizardId);

        postWizard(channel, wizardInfo, soulInfo)
    });
});
client.login(discordToken);

function postWizard(channel:any, wizardInfo:any, soulInfo:any) {
    const embed = new MessageEmbed()
    .setTitle("Wizard has been burned!")
    .setImage(soulInfo.image)
    .setThumbnail(wizardInfo.image)
    .addFields(
        { name: "Burned Wizard", value: wizardInfo.name },
        { name: "Appeared Soul", value: soulInfo.name},
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
