import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import { Craweler } from "./interface";


export class BiquCrawler implements Craweler {

    private static readonly baseURL = "https://www.biqubao.com";
    private readonly defaultEncode = "gbk";

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        try {
            const response = await axios.get(BiquCrawler.baseURL + "/search.php", {
                params: {
                    q: keyWord,
                },
            });
            const $ = cheerioModule.load(response.data);
            let choices = new Map<string, string>();
            $("a.result-game-item-title-link").each(function (_i, ele) {
                choices.set($(ele).prop("title"), BiquCrawler.baseURL + $(ele).prop("href"));
            });
            return choices;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findChapterURL(url: string, chapter: string): Promise<string> {
        const startString = `第${chapter}章`;
        let chapterURL: string = "";
        try {
            const response = await axios.get(url, {responseType: "arraybuffer"});
            let data = iconv.decode(response.data, this.defaultEncode);
            const $ = cheerioModule.load(data);
            $("a").each(function (_i, ele) {
                if ($(ele).text().startsWith(startString)) {
                    chapterURL = $(ele).prop("href");
                    return false;
                }
                return true;
            });
            return `${BiquCrawler.baseURL}${chapterURL}`;
        } catch (error) {
            throw new Error(error);
        }
    }
}