import cheerioModule = require("cheerio");
import axios from "axios";
import iconv = require('iconv-lite');
import { window } from "vscode";
import { Craweler } from "./interface";
import { CrawelerDomains } from "../const";

type BookSearchResult = Map<string, string>;

export class CaimoCrawler implements Craweler {

    private readonly baseURL = <string>CrawelerDomains.get("caimoURL");
    private readonly defaultEncode = "utf-8";
    private readonly requestHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
    };

    private async fetchHTML(url: string, params?: Record<string, string>): Promise<string> {
        const response = await axios.get(url, {
            headers: this.requestHeaders,
            params,
            responseType: "arraybuffer",
        });
        return iconv.decode(response.data, this.defaultEncode);
    }

    private parseBookLinks(data: string): BookSearchResult {
        const $ = cheerioModule.load(data);
        const choices = new Map<string, string>();
        $("a[href^='/txt/']").each((_i, ele) => {
            const title = $(ele).text().trim();
            const href = $(ele).prop("href");
            if (!title || !href) {
                return;
            }
            if (!choices.has(title)) {
                choices.set(title, this.baseURL + href);
            }
        });
        return choices;
    }

    private async searchFromShelf(keyWord: string): Promise<BookSearchResult> {
        const seedPages = [
            "/",
            "/shuku/",
            "/rank/",
            "/rank/weekvisit/",
            "/rank/monthvisit/",
            "/rank/goodnum/",
            "/shuku/xuanhuan/1.html",
            "/shuku/wuxia/1.html",
            "/shuku/yanqing/1.html",
            "/shuku/dushi/1.html",
            "/shuku/lishi/1.html",
            "/shuku/youxi/1.html",
            "/shuku/kehuan/1.html",
            "/shuku/tongren/1.html",
            "/shuku/qita/1.html",
        ];
        const normalizedKeyword = keyWord.trim().toLowerCase();
        const matches = new Map<string, string>();

        for (const page of seedPages) {
            const data = await this.fetchHTML(this.baseURL + page);
            const choices = this.parseBookLinks(data);
            for (const [title, url] of choices) {
                if (title.toLowerCase().includes(normalizedKeyword)) {
                    matches.set(title, url);
                }
            }
        }
        return matches;
    }

    async searchBook(keyWord: string): Promise<Map<string, string>> {
        try {
            const data = await this.fetchHTML(this.baseURL + "/search/", { searchkey: keyWord });
            const choices = this.parseBookLinks(data);
            if (choices.size > 0) {
                return choices;
            }
        } catch (error: any) {
            if (error?.response?.status && error.response.status !== 404) {
                window.showWarningMessage(`站内搜索不可用，改用书库检索: ${error.message}`);
            }
        }

        try {
            const choices = await this.searchFromShelf(keyWord);
            if (choices.size === 0) {
                window.showWarningMessage("当前书源未找到匹配书籍，可尝试更完整的书名");
            }
            return choices;
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }
    }

    async findChapterURL(url: string): Promise<Map<string, string>> {
        let data: string;
        try {
            data = await this.fetchHTML(url);
        } catch (error: any) {
            window.showErrorMessage(error.message);
            throw error;
        }

        const $ = cheerioModule.load(data);
        let choices = new Map<string, string>();
        $("a[href^='/read/']").each((_i, ele) => {
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
