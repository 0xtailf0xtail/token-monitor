import { address, discordChannelId, useWebhook } from './config';

import { GreatBurningMonitor } from './monitor';
import { abi } from './contracts/souls'
import { log } from './utils';
import { tweetBurnResult } from './twitter';

// Load project key of Infura
const infuraKey = process.env.INFURA_KEY;
if( !infuraKey ) {
    log("Please specify the environment varilable INFURA_KEY");
    process.exit(1);
}

// Initialize discord client
const { MessageEmbed, Client, Intents, WebhookClient } = require("discord.js");

if(useWebhook) {
    const discordWebhook = process.env.DISCORD_WEBHOOK;
    if ( !discordWebhook ) {
        log("Please specify the environment varilable DISCORD_WEBHOOK");
        process.exit(1);
    }

    const webhookClient = new WebhookClient({ url: discordWebhook });
    startMonitoring(infuraKey, abi, address, webhookClient);
} else {
    const discordToken = process.env.DISCORD_TOKEN;
    if ( !discordToken ) {
        log("Please specify the environment varilable DISCORD_TOKEN");
        process.exit(1);
    }
    const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

    client.once('ready', async () => {
        const channel = await client.channels.fetch(discordChannelId);
        log("discord bot is ready");
        if(!channel) {
            console.log("failed to get channel object");
            process.exit(1);
        }

        startMonitoring(infuraKey, abi, address, channel);

    });

    client.login(discordToken);
}

function startMonitoring(infuraKey: string, abi:any, address:string, channel: any) {
    let monitor = new GreatBurningMonitor(infuraKey, abi, address);

    monitor.start(async (wizardInfo:any, soulInfo:any) => {
        const embed = new MessageEmbed()
        .setTitle("Wizard has been burned!")
        .setImage(soulInfo.image)
        .setThumbnail(wizardInfo.image)
        .addFields(
            { name: "Burned Wizard", value: "[" + wizardInfo.name + "](https://www.forgottenrunes.com/lore/wizards/" + wizardInfo.id + "/0)" },
            { name: "Appeared Soul", value: "[" + soulInfo.name + "](https://opensea.io/assets/" + address + "/" + soulInfo.id + ")" },
        )
        .setColor('#0099ff');
    
        channel.send({
            embeds: [embed],
        });

        // Send the result to Twitter as well
        tweetBurnResult(wizardInfo, soulInfo);
    });
}
