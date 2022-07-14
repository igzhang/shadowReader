import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import https = require('https');
import { window } from "vscode";
import { Craweler } from "./interface";

const ignoreSSL = axios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});

function sleep(delay: number) {
    return new Promise(reslove => {
      setTimeout(reslove, delay)
    })
}

export class BiquCrawler implements Craweler {

    private readonly baseURL = "https://www.ruihangkeji.com";
    private readonly defaultEncode = "utf-8";

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        let data: string = "";
        let self = this;
        let count = 0;
        const retryCount = 5;
        let result;
        while (count < retryCount) {
            try {
                const response = await ignoreSSL.get(self.baseURL + "/search.php", {
                    params: { keyword: keyWord }
                });
                result = response;
                if (response.data.indexOf("Verify") !== -1) {
                    count++;
                    await sleep(1000);
                    continue;
                }
                data = response.data;
                break;
            } catch (error: any) {
                window.showErrorMessage(error.message);
                throw error;
            }
        }
        
        if (count >= retryCount) {
            let error_msg = "遭遇验证码次数过多，稍后再试吧";
            window.showErrorMessage(error_msg);
            throw new Error(error_msg);
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a.result-game-item-title-link").each(function (_i, ele) {
            choices.set($(ele).prop("title"), self.baseURL + $(ele).prop("href"));
        });
        if (choices.size == 0) {
            console.log(result)
        }
        return choices;
        
    }

    async findChapterURL(url: string): Promise<Map<string, string>> {
        let data: string;
        let self = this;
        try {
            const response = await axios.get(url, {responseType: "arraybuffer"});
            data = iconv.decode(response.data, this.defaultEncode);
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("#list a").each(function (_i, ele) {
            choices.set($(ele).text(), self.baseURL + $(ele).prop("href"));
        });
        return choices;
    }
}