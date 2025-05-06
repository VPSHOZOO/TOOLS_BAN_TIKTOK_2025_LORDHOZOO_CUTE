const https = require('https');
const { randomInt, randomBytes } = require('crypto');
const { URL } = require('url');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { Telegraf } = require('telegraf');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const bot = new Telegraf(process.env.BOT_TOKEN || 'token');
let sentRequests = 0;
let completed = false;
let itemID = '';
let amount = 0;
let proxyType = 'http';
let proxyList = [];
let sendType = 0; 
let nThreads = 10;
const UserAgent = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
];
const DeviceTypes = ["iPhone", "iPad", "Android"];
const Platforms = ["android", "ios", "web"];
const Channel = ["googleplay", "appstore", "tiktokweb"];
const ApiDomain = ["api.tiktokv.com", "api16-normal-c-useast1a.tiktokv.com"];
function showBanner(ctx) {
    const banner = `
===============================
 ▀█▀ █ █▄▀ ▀█▀ █▀█ █▄▀
 ░█░ █ █░█ ░█░ █▄█ █░█
===============================
=    TOOLS BAN TIKTOK 2025    =
===============================
AUTHOR  : LORDHOZOOO
DILIRIS  : 2025-05-06 SELASA
YOUTUBE  : LORDHOZOO
TIKTOK   : LORDHOZOO
===============================
=           TEAM              =
===============================
= SYSTEM UMBRELA DRAK9999    =
===============================
`;
    ctx.replyWithMarkdown(`\`\`\`${banner}\`\`\``);
}
function loadProxies() {
    try {
        const data = fs.readFileSync('proxies.txt', 'utf8');
        proxyList = data.split('\n').filter(proxy => proxy.trim() !== '');
        return proxyList.length > 0;
    } catch (err) {
        return false;
    }
}
function getRandomProxy() {
    if (proxyList.length === 0) return null;
    return proxyList[randomInt(0, proxyList.length)];
}
async function sendView() {
    const proxyUrl = getRandomProxy();
    const platform = Platforms[randomInt(0, Platforms.length)];
    const osVersion = randomInt(1, 12);
    const deviceType = DeviceTypes[randomInt(0, DeviceTypes.length)];
    const headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": UserAgent[randomInt(0, UserAgent.length)]
    };
    const appName = ["tiktok_web", "musically_go"][randomInt(0, 2)];
    const deviceID = randomInt(1e18, 1e19).toString();
    const apiDomain = ApiDomain[randomInt(0, ApiDomain.length)];
    const channel = Channel[randomInt(0, Channel.length)];
    const URI = `https://${apiDomain}/aweme/v1/aweme/stats/?channel=${channel}&device_type=${deviceType}&device_id=${deviceID}&os_version=${osVersion}&version_code=220400&app_name=${appName}&device_platform=${platform}&aid=1988`;
    const data = `item_id=${itemID}&play_delta=1`;
    try {
        let config = {
            headers: headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 5000
        };
        if (proxyUrl) {
            if (proxyType === 'socks4' || proxyType === 'socks5') {
                config.httpsAgent = new SocksProxyAgent(`${proxyType}://${proxyUrl}`);
            } else {
                config.httpsAgent = new HttpsProxyAgent(`http://${proxyUrl}`);
            }
        }
        await axios.post(URI, data, config);
        return true;
    } catch (error) {
        return false;
    }
}
async function sendShare() {
    const platform = Platforms[randomInt(0, Platforms.length)];
    const osVersion = randomInt(1, 12);
    const deviceType = DeviceTypes[randomInt(0, DeviceTypes.length)];
    const headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": UserAgent[randomInt(0, UserAgent.length)]
    };
    const appName = ["tiktok_web", "musically_go"][randomInt(0, 2)];
    const deviceID = randomInt(1e18, 1e19).toString();
    const apiDomain = ApiDomain[randomInt(0, ApiDomain.length)];
    const channel = Channel[randomInt(0, Channel.length)];
    const URI = `https://${apiDomain}/aweme/v1/aweme/stats/?channel=${channel}&device_type=${deviceType}&device_id=${deviceID}&os_version=${osVersion}&version_code=220400&app_name=${appName}&device_platform=${platform}&aid=1988`;
    const data = `item_id=${itemID}&share_delta=1`;
    try {
        const config = {
            headers: headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 5000
        };
        await axios.post(URI, data, config);
        return true;
    } catch (error) {
        return false;
    }
}
function clearURL(link) {
    try {
        const parsedURL = new URL(link);
        const host = parsedURL.hostname.toLowerCase();
        
        if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
            return parsedURL.pathname.split("/")[1];
        } else {
            return parsedURL.pathname.split("/")[1];
        }
    } catch (error) {
        return null;
    }
}
bot.start((ctx) => {
    showBanner(ctx);
    ctx.reply('Welcome to TikTok Bot! Use /startbot to begin.');
});
bot.command('startbot', async (ctx) => {
    showBanner(ctx);
    await ctx.reply('Please send the TikTok video URL:');
    bot.on('text', async (ctx) => {
        const videoUrl = ctx.message.text;
        itemID = clearURL(videoUrl);
        
        if (!itemID) {
            return ctx.reply('Invalid TikTok URL. Please try again.');
        }
        await ctx.reply('Enter the amount (0 for unlimited):');
        bot.on('text', async (ctx) => {
            amount = parseInt(ctx.message.text) || 0;
            await ctx.reply('Enter the number of threads:');
            bot.on('text', async (ctx) => {
                nThreads = parseInt(ctx.message.text) || 10;
                await ctx.reply('Select type:\n0 - Views\n1 - Shares');
                bot.on('text', async (ctx) => {
                    sendType = parseInt(ctx.message.text) || 0;
                    await ctx.reply('Select proxy type:\n0 - http\n1 - socks4\n2 - socks5');
                    bot.on('text', async (ctx) => {
                        const proxyChoice = ctx.message.text;
                        if (proxyChoice === '0') proxyType = 'http';
                        else if (proxyChoice === '1') proxyType = 'socks4';
                        else if (proxyChoice === '2') proxyType = 'socks5';
                        if (!loadProxies()) {
                            return ctx.reply('Failed to load proxies. Make sure proxies.txt exists.');
                        }
                        ctx.reply('Bot started! Check your results after 5-10 minutes.');
                        
                        startBot(ctx);
                    });
                });
            });
        });
    });
});
function startBot(ctx) {
    completed = false;
    sentRequests = 0;
    const progressInterval = setInterval(() => {
        ctx.telegram.sendMessage(ctx.chat.id, `${sentRequests} requests sent.`, { disable_notification: true });
    }, 10000);
    const sendProcess = sendType === 0 ? sendView : sendShare;
    for (let i = 0; i < nThreads; i++) {
        (async function worker() {
            while (!completed) {
                if (await sendProcess()) {
                    sentRequests++;
                    if (amount > 0 && sentRequests >= amount) {
                        completed = true;
                        clearInterval(progressInterval);
                        ctx.reply(`Finished sending ${sentRequests} requests!`);
                    }
                }
            }
        })();
    }
}
bot.launch().then(() => {
    console.log('Bot started');
}).catch(err => {
    console.error('Bot failed to start:', err);
});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));