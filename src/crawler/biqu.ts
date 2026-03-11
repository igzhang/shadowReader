import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import { window } from "vscode";
import { Craweler } from "./interface";
import { CrawelerDomains } from "../const";

export class BiquCrawler implements Craweler {

    private readonly baseURL = <string>CrawelerDomains.get("biquURL");
    private readonly defaultEncode = "utf-8";
    private readonly requestHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
    };

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        let data: string;
        try {
            const response = await axios.get(this.baseURL + "/search/", {
                headers: this.requestHeaders,
                params: { keyword: keyWord },
                responseType: "arraybuffer",
            });
            data = iconv.decode(response.data, this.defaultEncode);
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a[href^='/']").each((_i, ele) => {
            const title = $(ele).text().trim();
            const href = $(ele).prop("href");
            if (!title || !href || !/^\/\d+$/.test(href)) {
                return;
            }
            if (!choices.has(title)) {
                choices.set(title, this.baseURL + href);
            }
        });
        return choices;
    }

    async findChapterURL(url: string): Promise<Map<string, string>> {
        let data: string;
        try {
            const response = await axios.get(url, {
                headers: this.requestHeaders,
                responseType: "arraybuffer",
            });
            data = iconv.decode(response.data, this.defaultEncode);
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a[href^='/']").each((_i, ele) => {
            const title = $(ele).text().trim();
            const href = $(ele).prop("href");
            if (!title || !href || !title.startsWith("第")) {
                return;
            }
            if (!choices.has(title)) {
                choices.set(title, this.baseURL + href);
            }
        });
        return choices;
    }
}
