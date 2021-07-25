import axios from "axios";
import cheerioModule = require("cheerio");
import iconv = require('iconv-lite');
import { Parser } from "./interface";
import { BookKind, BookStore } from "./model";

export class BiquWebParser implements Parser {

    private prevPageURL: string = "";
    private nextPageURL: string = "";
    private currentPageURL: string;
    private readedCount: number;
    private cacheText = "";
    private readonly defaultEncode = "gbk";
    private lastPageSize = 0;
    private title = "";
    private indexPageURL: string;
    private readonly baseURL = "https://www.biqubao.com";

    constructor(currentPageURL: string, readedCount: number, indexPageURL: string) {
        this.currentPageURL = currentPageURL;
        this.readedCount = readedCount;
        this.indexPageURL = indexPageURL;
    }

    close(): void {};

    private async fetchPage(pageURL: string): Promise<void> {
        this.currentPageURL = pageURL;
        const response = await axios.get(pageURL, { responseType: "arraybuffer" });
        let data = iconv.decode(response.data, this.defaultEncode);
        const $ = cheerioModule.load(data);
        this.cacheText = $("#content").text().replace(/\n/g, "   ");
        this.title = $("h1").text();
        $(".bottem1>a").each((i, ele) => {
            switch (i) {
                case 0:
                    this.prevPageURL = `${this.baseURL}${$(ele).prop("href")}`;
                    break;

                case 2:
                    this.nextPageURL = `${this.baseURL}${$(ele).prop("href")}`;
                    break;
            
                default:
                    break;
            }
        });
    }

    async getCacheText(start: number, pageSize: number): Promise<string> {
        this.lastPageSize = pageSize;
        return this.cacheText.substr(start, pageSize);
    }

    async getNextPage(pageSize: number): Promise<string> {  
        if (this.cacheText.length === 0) {
            await this.fetchPage(this.currentPageURL);
        }

        if (this.readedCount === this.cacheText.length) {
            if (this.nextPageURL === this.indexPageURL) {
                return "已无新章节";
            }
            await this.fetchPage(this.nextPageURL);
            this.readedCount = 0;
        }

        this.lastPageSize = pageSize;
        let showText = this.cacheText.substr(this.readedCount, pageSize);
        this.readedCount = this.readedCount + pageSize;
        if (this.readedCount >= this.cacheText.length) {
            this.readedCount = this.cacheText.length;
        }
        return showText;
    }

    async getPrevPage(pageSize: number): Promise<string> {
        if (this.cacheText.length === 0) {
            await this.fetchPage(this.currentPageURL);
        }

        if (this.readedCount - pageSize === 0 && this.prevPageURL !== this.indexPageURL) {
            await this.fetchPage(this.prevPageURL);
            this.readedCount = this.cacheText.length + pageSize;
        }

        this.readedCount = this.readedCount - pageSize * 2;
        if (this.readedCount < 0) {
            this.readedCount = 0;
        }
        return this.getNextPage(pageSize);
    }

    getPercent(): string {
        return `${this.title}`;
    }

    getPersistHistory(): BookStore {
        return {
            kind: BookKind.online,
            readedCount: this.readedCount - this.lastPageSize,
            sectionPath: this.currentPageURL,
        };
    };
}