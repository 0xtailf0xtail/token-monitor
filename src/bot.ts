import { address, discordChannelId, } from './config';

import { GreatBurningMonitor } from './monitor';
import { abi } from './contracts/souls'
import { log } from './utils';

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
    log("discord bot is ready");
    if(!channel) {
        console.log("failed to get channel object");
        process.exit(1);
    }
    let monitor = new GreatBurningMonitor(infuraKey, abi, address);

    monitor.start(async (wizardInfo:any, soulInfo:any) => {
        const embed = new MessageEmbed()
        .setTitle("Wizard has been burned!")
        .setImage(soulInfo.image)
        .setThumbnail(wizardInfo.image)
        .addFields(
            { name: "Burned Wizard", value: wizardInfo.name },
            { name: "Appeared Soul", value: soulInfo.name},
        )
        .setColor('#0099ff');
    
        channel.send({
            embeds: [embed],
        });
    });
});

client.login(discordToken);

