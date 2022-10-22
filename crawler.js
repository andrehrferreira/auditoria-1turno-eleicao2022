/**
 * Crawler de BUs em binario e JSON do site do TSE
 * 
 * @autor Andre Ferreira <andrehrf@gmail.com>
 * @see https://resultados.tse.jus.br/oficial/app/index.html
 */

import * as puppeteer from 'puppeteer';
import * as path from "path";
import * as fs from "fs";
import * as cliProgress from "cli-progress";

process.on('uncaughtException', function(err) {
    console.log(err)
})

class CrawlerBUs{
    async createBrowser(){
        const describe = (jsHandle) => {
            return jsHandle.executionContext().evaluate((obj) => {
                return obj;
            }, jsHandle);
        }

        this.browser = await puppeteer.launch({
            headless: true,
            enableServiceWorkers: true,
            ignoreCSSErrors: true,
            ignoreJSErrors: true,
            ignoreRequestErrors: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        this.page.setViewport({width: 1920, height: 1024});
        this.page.setRequestInterception(false);
        this.page.on('console', async message => {
            try{
                const args = await Promise.all(message.args().map(arg => describe(arg)));
    
                if(args[0]?.name == "entidadeBoletimUrna"){
                    const zona = args[0].identificacao.municipioZona.zona?.value;
                    const municipio = args[0].identificacao.municipioZona.municipio?.value;
                    const secao = args[0].identificacao.secao?.value;

                    if(!fs.existsSync(`./BUs/${municipio}`))
                        fs.mkdirSync(`./BUs/${municipio}`);

                    if(!fs.existsSync(`./Screenshots/${municipio}`))
                        fs.mkdirSync(`./Screenshots/${municipio}`);

                    fs.writeFileSync(`./BUs/${municipio}/BU-${municipio}-${zona}-${secao}.json`, JSON.stringify(args[0]));
                    await this.page.screenshot({path: `./Screenshots/${municipio}/BU-${municipio}-${zona}-${secao}.png`,  fullPage: true});
                    this.browser.close();
                }
            }
            catch(e){}
        })
        //.on('pageerror', ({ message }) => console.log(message))
        .on('response', async response => {
            try{
                const url = response.url();
        
                if(response.url().includes('.bu')){
                    const filename = path.basename(url);
                    fs.writeFileSync(`./Binary/${filename}`, await response.buffer());
                }
            }
            catch(e){}
        })
        //.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`));
    }

    async getPageData(url){
        try{
            await this.page.goto(url, { waitUntil: ["networkidle0", "domcontentloaded"] });
            await this.page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        }
        catch(e){
            //console.log(e)
        }
    }
}

(async () => {
    let crawlerIndex = (fs.existsSync("crawlerIndex.txt")) ? fs.readFileSync("crawlerIndex.txt", "utf-8") : 0;
    const urlList = JSON.parse(fs.readFileSync('./linksBUs.json'));

    //try{ crawlerIndex = parseInt(crawlerIndex); }
    //catch(e){}

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(urlList.length, 0);
    let promises = [];
    
    for(let keyUrl = 0; keyUrl < urlList.length; keyUrl+=8){
        try{
            //if(keyUrl > crawlerIndex){
                //await fs.writeFileSync('crawlerIndex.txt', keyUrl.toString());
                
                for(let key = 0; key < 8; key++){
                    bar1.increment();  
                    const link = decodeURIComponent(urlList[keyUrl + key].url);
                    const municipio = parseInt(getDataByRegex(/mubu=(.*?);/gm, link)[1]);
                    const zona = parseInt(getDataByRegex(/zn=(.*?);/gm, link)[1]);
                    const secao = parseInt(getDataByRegex(/se=(.*?)\//gm, link)[1]);
                    
                    if(!fs.existsSync(`./BUs/${municipio}/BU-${municipio}-${zona}-${secao}.json`)){
                        //console.log(`./BUs/${municipio}/BU-${municipio}-${zona}-${secao}.json`)

                        promises.push(new Promise(async (resolve) => {                                                  
                            const urlData = urlList[keyUrl + key];
                            const crawler = new CrawlerBUs();
                            await crawler.createBrowser();
                            await crawler.getPageData(urlData.url);
                            resolve();
                        }));
                    }
                }

                if(promises.length > 0)
                    await Promise.all(promises);

                promises = [];
            //}
        }
        catch(e){ 
            console.log(e); 
        }
    }
})();


function getDataByRegex(regex, str){
    let m;
    let result = [];

    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) 
            regex.lastIndex++;
            
        m.forEach((match, groupIndex) => {
            result[groupIndex] = match;
        });
    }

    return result
}