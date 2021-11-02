import { downloadImageBase64, getOpenSeaLink, log } from "./utils";

import got from "got/dist/source";

// Load twitter keys from environment variables
const twitterToken = process.env.TWITTER_TOKEN;
if( !twitterToken ) {
    log("Please specify the environment varilable TWITTER_TOKEN");
    process.exit(1);
}
const twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET;
if( !twitterTokenSecret ) {
    log("Please specify the environment varilable TWITTER_TOKEN_SECRET");
    process.exit(1);
}
const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
if( !twitterConsumerKey ) {
    log("Please specify the environment varilable TWITTER_CONSUMER_KEY");
    process.exit(1);
}
const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
if( !twitterConsumerSecret ) {
    log("Please specify the environment varilable TWITTER_CONSUMER_SECRET");
    process.exit(1);
}

const Twit = require('twit')
const T = new Twit({
    access_token: twitterToken,
    access_token_secret: twitterTokenSecret,
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: false, // optional - requires SSL certificates to be valid.
  });

export async function tweetBurnResult(wizardInfo:any, soulInfo:any) {
    let success = false;
    for(let retryCount = 0; retryCount <= 2; retryCount++) {
        log("tweeting soudId " + soulInfo.id + " : " + retryCount);
        try {
            await tweet(wizardInfo, soulInfo);
            log("tweeting soulId " + soulInfo.id + " finished successfully");
            success = true;
            break;
        } catch(err) {
            // retry after 1s + jitter wait
            await new Promise(f => setTimeout(f, 1000 + Math.floor(Math.random() * 500)));
            continue;
        }
    }
    if(!success) {
        log("give up tweeting soulId " + soulInfo.id);
    }
}

function tweet(wizardInfo:any, soulInfo:any) {
    return new Promise(async (resolve, reject) => {
        // Download images. They can be done in parallel if performance matters.
        let soulImage = await downloadImageBase64(soulInfo.image);
        let wizardImage = await downloadImageBase64(wizardInfo.image);

        T.post('media/upload', {media_data: soulImage.toString('base64')}, function(error:any, soulMedia:any, response:any) {
            if (!error) {
                T.post('media/upload', {media_data: wizardImage.toString('base64')}, function(error:any, wizardMedia:any, response:any) {
                    if(!error) {
                        var status = {
                            status: '🔥 "' + wizardInfo.name + '" has transmuted into "' + soulInfo.name + '"\n' +
                             getOpenSeaLink(soulInfo.id),
                            media_ids: [wizardMedia.media_id_string, soulMedia.media_id_string]
                        };
                        T.post('statuses/update', status, function(error:any, tweet:any, response:any) {
                            if (!error) {
                                resolve(true);
                            }
                            if (error) {
                                log("failed to post the status for " + soulInfo.id);
                                console.log(error);
                                reject(error);
                            }
                        });
                    } else {
                        log("failed to upload the image of " + wizardInfo.id);
                        console.log(error);
                        reject(error);
                    }
                })
            } else {
                log("failed to upload the image of " + soulInfo.id);
                console.log(error);
                reject(error);
            }
        });
    });
}
