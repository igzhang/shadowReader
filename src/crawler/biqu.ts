import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import { workspace } from "vscode";
import { Craweler } from "./interface";
import { convertChineseToNumber } from "../chinese_to_number";


export class BiquCrawler implements Craweler {

    private readonly baseURL = "https://www.biqubao.com";
    private readonly defaultEncode = "gbk";

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        let data: string;
        let self = this;
        try {
            const response = await axios.get(self.baseURL + "/search.php", {
                params: { q: keyWord }
            });
            data = response.data;
        } catch (error) {
            throw new Error(error);
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a.result-game-item-title-link").each(function (_i, ele) {
            choices.set($(ele).prop("title"), self.baseURL + $(ele).prop("href"));
        });
        return choices;
        
    }

    async findChapterURL(url: string, chapter: number): Promise<string> {
        let chapterURL: string = "";
        let data: string;
        let self = this;
        try {
            const response = await axios.get(url, {responseType: "arraybuffer"});
            data = iconv.decode(response.data, this.defaultEncode);
        } catch (error) {
            throw new Error(error);
        }

        const $ = cheerioModule.load(data);
        let regExpString = <string>workspace.getConfiguration().get("shadowReader.chapterRegExp");
        let re = new RegExp(regExpString);
        $("a").each(function (_i, ele) {
            let regRes = re.exec($(ele).text());
            if (regRes && convertChineseToNumber(regRes[1]) === chapter) {
                chapterURL = $(ele).prop("href");
                return false;
            }
            return true;
        });
        return `${self.baseURL}${chapterURL}`;
    }
}