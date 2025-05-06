const axios = require('axios');
const fs = require('fs');
const colors = require('colors');

class XProxy {
    constructor() {
        this.proxy_w_regex = [
            ["http://spys.me/proxy.txt", "%ip%:%port% "],
            ["http://www.httptunnel.ge/ProxyListForFree.aspx", " target=\"_new\">%ip%:%port%</a>"],
            ["https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.json", "\"ip\":\"%ip%\",\"port\":\"%port%\","],
            ["https://raw.githubusercontent.com/fate0/proxylist/master/proxy.list", '"host": "%ip%".*?"country": "(.*?){2}",.*?"port": %port%'],
            ["https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list.txt", '%ip%:%port% (.*?){2}-.-S \\+'],
            ["https://www.us-proxy.org/", "<tr><td>%ip%<\\/td><td>%port%<\\/td><td>(.*?){2}<\\/td><td class='hm'>.*?<\\/td><td>.*?<\\/td><td class='hm'>.*?<\\/td><td class='hx'>(.*?)<\\/td><td class='hm'>.*?<\\/td><\\/tr>"],
            ["https://free-proxy-list.net/", "<tr><td>%ip%<\\/td><td>%port%<\\/td><td>(.*?){2}<\\/td><td class='hm'>.*?<\\/td><td>.*?<\\/td><td class='hm'>.*?<\\/td><td class='hx'>(.*?)<\\/td><td class='hm'>.*?<\\/td><\\/tr>"],
            ["https://www.sslproxies.org/", "<tr><td>%ip%<\\/td><td>%port%<\\/td><td>(.*?){2}<\\/td><td class='hm'>.*?<\\/td><td>.*?<\\/td><td class='hm'>.*?<\\/td><td class='hx'>(.*?)<\\/td><td class='hm'>.*?<\\/td><\\/tr>"],
            ['https://www.socks-proxy.net/', "%ip%:%port%"],
            ['https://free-proxy-list.net/uk-proxy.html', "<tr><td>%ip%<\\/td><td>%port%<\\/td><td>(.*?){2}<\\/td><td class='hm'>.*?<\\/td><td>.*?<\\/td><td class='hm'>.*?<\\/td><td class='hx'>(.*?)<\\/td><td class='hm'>.*?<\\/td><\\/tr>"],
            ['https://free-proxy-list.net/anonymous-proxy.html', "<tr><td>%ip%<\\/td><td>%port%<\\/td><td>(.*?){2}<\\/td><td class='hm'>.*?<\\/td><td>.*?<\\/td><td class='hm'>.*?<\\/td><td class='hx'>(.*?)<\\/td><td class='hm'>.*?<\\/td><\\/tr>"],
            ["https://www.proxy-list.download/api/v0/get?l=en&t=https", '"IP": "%ip%", "PORT": "%port%",'],
            ["https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=6000&country=all&ssl=yes&anonymity=all", "%ip%:%port%"],
            ["https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt", "%ip%:%port%"],
            ["https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt", "%ip%:%port%"],
            ["https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt", "%ip%:%port%"],
            ["https://www.hide-my-ip.com/proxylist.shtml", '"i":"%ip%","p":"%port%",'],
            ["https://raw.githubusercontent.com/scidam/proxy-list/master/proxy.json", '"ip": "%ip%",\n.*?"port": "%port%",'],
            ['https://www.freeproxychecker.com/result/socks4_proxies.txt', "%ip%:%port%"],
            ['https://proxy50-50.blogspot.com/', '%ip%</a></td><td>%port%</td>'],
            ['http://free-fresh-proxy-daily.blogspot.com/feeds/posts/default', "%ip%:%port%"],
            ['http://free-fresh-proxy-daily.blogspot.com/feeds/posts/default', "%ip%:%port%"],
            ['http://www.live-socks.net/feeds/posts/default', "%ip%:%port%"],
            ['http://www.socks24.org/feeds/posts/default', "%ip%:%port%"],
            ['http://www.proxyserverlist24.top/feeds/posts/default', "%ip%:%port%"],
            ['http://proxysearcher.sourceforge.net/Proxy%20List.php?type=http', "%ip%:%port%"],
            ['http://proxysearcher.sourceforge.net/Proxy%20List.php?type=socks', "%ip%:%port%"],
            ['http://proxysearcher.sourceforge.net/Proxy%20List.php?type=socks', "%ip%:%port%"],
            ['https://www.my-proxy.com/free-anonymous-proxy.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-transparent-proxy.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-socks-4-proxy.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-socks-5-proxy.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-2.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-3.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-4.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-5.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-6.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-7.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-8.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-9.html', '%ip%:%port%'],
            ['https://www.my-proxy.com/free-proxy-list-10.html', '%ip%:%port%'],
        ];

        this.proxy_direct = [
            'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all',
            'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=5000&country=all&ssl=all&anonymity=all',
            'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all',
            'https://www.proxyscan.io/download?type=http',
            'https://www.proxyscan.io/download?type=https',
            'https://www.proxyscan.io/download?type=socks4',
            'https://www.proxyscan.io/download?type=socks5',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://github.com/TheSpeedX/PROXY-List/blob/master/socks4.txt',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt',
            'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
            'https://multiproxy.org/txt_all/proxy.txt',
            'http://rootjazz.com/proxies/proxies.txt',
            'http://ab57.ru/downloads/proxyold.txt',
            'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
            'https://proxy-spider.com/api/proxies.example.txt',
            'https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt',
            'https://www.proxy-list.download/api/v1/get?type=socks4',
            'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt'
        ];

        this.headers = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
        };

        this.proxy_output = [];
        this.scrape_counter = 0;
    }

    fileRead(name) {
        try {
            const data = fs.readFileSync(name, 'utf8');
            return data.split('\n').filter(line => line.trim() !== '');
        } catch (err) {
            console.error(`Error reading file: ${err}`);
            return [];
        }
    }

    fileWrite(name, contents) {
        try {
            fs.writeFileSync(name, contents.join('\n'), 'utf8');
            return true;
        } catch (err) {
            console.error(`Error writing file: ${err}`);
            return false;
        }
    }

    getProxies() {
        return this.proxy_output;
    }
}

class ProxyScrape extends XProxy {
    async _scrape(url, custom_regex) {
        try {
            const response = await axios.get(url, { timeout: 5000, headers: this.headers });
            const proxylist = response.data;

            const ipRegex = '([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3})';
            const portRegex = '([0-9]{1,5})';
            const regexStr = custom_regex
                .replace('%ip%', ipRegex)
                .replace('%port%', portRegex);

            const regex = new RegExp(regexStr, 'g');
            let match;

            while ((match = regex.exec(proxylist)) !== null) {
                if (match[1] && match[2]) {
                    this.proxy_output.push(`${match[1]}:${match[2]}`);
                    this.scrape_counter++;
                }
            }

            console.log(colors.rainbow(`Scraped : ${this.scrape_counter}`));
        } catch (error) {
            console.log(colors.rainbow(`Scraped : ${this.scrape_counter}`));
        }
    }

    async scrapeRegex() {
        const promises = this.proxy_w_regex.map(source => 
            this._scrape(source[0], source[1])
        );
        await Promise.all(promises);
    }

    async scrapeDirect() {
        const promises = this.proxy_direct.map(async (source) => {
            try {
                const response = await axios.get(source, { timeout: 5000, headers: this.headers });
                const page = response.data;

                const regex = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):([0-9]{1,5})/g;
                let match;

                while ((match = regex.exec(page)) !== null) {
                    this.proxy_output.push(`${match[1]}:${match[2]}`);
                }
            } catch (error) {
                // Silently continue if there's an error
            }
        });

        await Promise.all(promises);
    }
}

async function start() {
    const p = new ProxyScrape();
    console.log(colors.rainbow("Scraping Proxy"));
    
    await p.scrapeRegex();
    await p.scrapeDirect();
    
    const output = p.getProxies();
    const clean_output = [...new Set(output)];
    
    console.log(colors.rainbow(`Length without duplicates : ${clean_output.length}`));
    console.log(colors.rainbow("Saved to Proxies.txt"));
    
    // Ensure Data directory exists
    if (!fs.existsSync('./Data')) {
        fs.mkdirSync('./Data');
    }
    
    p.fileWrite('./Data/Proxies.txt', clean_output);
}

start().catch(err => console.error('Error:', err));