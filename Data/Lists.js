const https = require('https');
const { randomInt, randomBytes } = require('crypto');
const { URL } = require('url');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { Telegraf } = require('telegraf');
const fs = require('fs');

// Disable SSL verification (not recommended for production)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Bot token from environment variable or directly
const bot = new Telegraf(process.env.BOT_TOKEN || '7863322072:AAFLohSBYqeTpx8eLrsZz0YBD_4rEP627-4');

// Global variables
let sentRequests = 0;
let completed = false;
let itemID = '';
let amount = 0;
let proxyType = 'http';
let proxyList = [];
let sendType = 0; // 0 for views, 1 for shares
let nThreads = 10;

// Data sets
const UserAgent = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    // Add more user agents
];

const DeviceTypes = [
    "iPhone1,1", "iPhone1,2", "iPhone2,1", "iPhone3,1", "iPhone3,2", "iPhone3,3", 
    "iPhone4,1", "iPhone5,1", "iPhone5,2", "iPhone5,3", "iPhone5,4", "iPhone6,1", 
    "iPhone6,2", "iPhone7,1", "iPhone7,2", "iPhone8,1", "iPhone8,2", "iPhone8,4", 
    "iPhone9,1", "iPhone9,2", "iPhone9,3", "iPhone9,4", "iPhone10,1", "iPhone10,2", 
    "iPhone10,3", "iPhone10,4", "iPhone10,5", "iPhone10,6", "iPhone11,2", "iPhone11,4", 
    "iPhone11,6", "iPhone11,8", "iPhone12,1", "iPhone12,3", "iPhone12,5", "iPhone12,8", 
    "iPhone13,1", "iPhone13,2", "iPhone13,3", "iPhone13,4", "iPhone14,2", "iPhone14,3", 
    "iPhone14,4", "iPhone14,5", "iPod1,1", "iPod2,1", "iPod3,1", "iPod4,1", "iPod5,1", 
    "iPod7,1", "iPod9,1", "iPad1,1", "iPad1,2", "iPad2,1", "iPad2,2", "iPad2,3", 
    "iPad2,4", "iPad3,1", "iPad3,2", "iPad3,3", "iPad2,5", "iPad2,6", "iPad2,7", 
    "iPad3,4", "iPad3,5", "iPad3,6", "iPad4,1", "iPad4,2", "iPad4,3", "iPad4,4", 
    "iPad4,5", "iPad4,6", "iPad4,7", "iPad4,8", "iPad4,9", "iPad5,1", "iPad5,2", 
    "iPad5,3", "iPad5,4", "iPad6,3", "iPad6,4", "iPad6,7", "iPad6,8", "iPad6,11", 
    "iPad6,12", "iPad7,1", "iPad7,2", "iPad7,3", "iPad7,4", "iPad7,5", "iPad7,6", 
    "iPad7,11", "iPad7,12", "iPad8,1", "iPad8,2", "iPad8,3", "iPad8,4", "iPad8,5", 
    "iPad8,6", "iPad8,7", "iPad8,8", "iPad8,9", "iPad8,10", "iPad8,11", "iPad8,12", 
    "iPad11,1", "iPad11,2", "iPad11,3", "iPad11,4", "iPad11,6", "iPad11,7", "iPad12,1", 
    "iPad12,2", "iPad14,1", "iPad14,2", "iPad13,1", "iPad13,2", "iPad13,4", "iPad13,5", 
    "iPad13,6", "iPad13,7", "iPad13,8", "iPad13,9", "iPad13,10", "iPad13,11", "Watch1,1", 
    "Watch1,2", "Watch2,6", "Watch2,7", "Watch2,3", "Watch2,4", "Watch3,1", "Watch3,2", 
    "Watch3,3", "Watch3,4", "Watch4,1", "Watch4,2", "Watch4,3", "Watch4,4", "Watch5,1", 
    "Watch5,2", "Watch5,3", "Watch5,4", "Watch5,9", "Watch5,10", "Watch5,11", "Watch5,12", 
    "Watch6,1", "Watch6,2", "Watch6,3", "Watch6,4", "Watch6,6", "Watch6,7", "Watch6,8", 
    "Watch6,9", "SM-G9900", "sm-g950f", "SM-A136U1", "SM-M225FV", "SM-E426B", "SM-M526BR", 
    "SM-M326B", "SM-A528B", "SM-F711B", "SM-F926B", "SM-A037G", "SM-A225F", "SM-M325FV", 
    "SM-A226B", "SM-M426B", "SM-A525F"
];

const Platforms = ["android", "windows", "iphone", "web"];
const Channel = ["tiktok_web", "googleplay", "App%20Store"];
const ApiDomain = [
    "api22-core-c-useast1a.tiktokv.com",
    "api19-core-c-useast1a.tiktokv.com",
    "api16-core-c-useast1a.tiktokv.com",
    "api21-core-c-useast1a.tiktokv.com"
];

// Banner function
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

// Proxy functions
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

// Request functions
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
            // In Node.js, we'd need to make a head request to get the final URL
            // For simplicity, we'll assume it's already the final URL
            return parsedURL.pathname.split("/")[1];
        } else {
            return parsedURL.pathname.split("/")[1];
        }
    } catch (error) {
        return null;
    }
}

// Bot commands
bot.start((ctx) => {
    showBanner(ctx);
    ctx.reply('Welcome to TikTok Bot! Use /startbot to begin.');
});

bot.command('startbot', async (ctx) => {
    showBanner(ctx);
    
    // Ask for video URL
    await ctx.reply('Please send the TikTok video URL:');
    
    // Wait for user response
    bot.on('text', async (ctx) => {
        const videoUrl = ctx.message.text;
        itemID = clearURL(videoUrl);
        
        if (!itemID) {
            return ctx.reply('Invalid TikTok URL. Please try again.');
        }
        
        // Ask for amount
        await ctx.reply('Enter the amount (0 for unlimited):');
        
        // Wait for amount
        bot.on('text', async (ctx) => {
            amount = parseInt(ctx.message.text) || 0;
            
            // Ask for threads
            await ctx.reply('Enter the number of threads:');
            
            // Wait for threads
            bot.on('text', async (ctx) => {
                nThreads = parseInt(ctx.message.text) || 10;
                
                // Ask for type
                await ctx.reply('Select type:\n0 - Views\n1 - Shares');
                
                // Wait for type
                bot.on('text', async (ctx) => {
                    sendType = parseInt(ctx.message.text) || 0;
                    
                    // Ask for proxy type
                    await ctx.reply('Select proxy type:\n0 - http\n1 - socks4\n2 - socks5');
                    
                    // Wait for proxy type
                    bot.on('text', async (ctx) => {
                        const proxyChoice = ctx.message.text;
                        if (proxyChoice === '0') proxyType = 'http';
                        else if (proxyChoice === '1') proxyType = 'socks4';
                        else if (proxyChoice === '2') proxyType = 'socks5';
                        
                        // Load proxies
                        if (!loadProxies()) {
                            return ctx.reply('Failed to load proxies. Make sure proxies.txt exists.');
                        }
                        
                        // Start bot
                        ctx.reply('Bot started! Check your results after 5-10 minutes.');
                        
                        // Start threads
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
    
    // Start progress reporter
    const progressInterval = setInterval(() => {
        ctx.telegram.sendMessage(ctx.chat.id, `${sentRequests} requests sent.`, { disable_notification: true });
    }, 10000);
    
    // Start worker threads
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

// Start the bot
bot.launch().then(() => {
    console.log('Bot started');
}).catch(err => {
    console.error('Bot failed to start:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
