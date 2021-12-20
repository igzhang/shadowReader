import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import { window } from "vscode";
import { Craweler } from "./interface";


export class BiquCrawler implements Craweler {

    private readonly baseURL = "https://www.biqugee.com";
    private readonly defaultEncode = "gbk";

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        let data: string;
        let self = this;
        try {
            const response = await axios.get(self.baseURL + "/search.php", {
                params: { q: keyWord }
            });
            data = response.data;
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a.result-game-item-title-link").each(function (_i, ele) {
            choices.set($(ele).prop("title"), self.baseURL + $(ele).prop("href"));
        });
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