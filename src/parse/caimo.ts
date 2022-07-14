import axios from "axios";
import cheerioModule = require("cheerio");
import iconv = require('iconv-lite');
import { window } from "vscode";
import { Parser } from "./interface";
import { BookKind, BookStore } from "./model";
import { CrawelerDomains } from "../const";

export class CaimoWebParser implements Parser {

    private prevPageURL: string = "";
    private nextPageURL: string = "";
    private currentPageURL: string;
    private readedCount: number;
    private cacheText = "";
    private readonly defaultEncode = "utf-8";
    private lastPageSize = 0;
    private title = "";
    private indexPageURL: string;
    private readonly baseURL = <string>CrawelerDomains.get("caimoURL");

    constructor(currentPageURL: string, readedCount: number, indexPageURL: string) {
        this.currentPageURL = currentPageURL;
        this.readedCount = readedCount;
        this.indexPageURL = indexPageURL;
    }

    close(): void {};

    private async fetchPage(pageURL: string): Promise<void> {
        this.currentPageURL = pageURL;
        let data: string;
        try {
            const response = await axios.get(pageURL, { responseType: "arraybuffer" });
            data = iconv.decode(response.data, this.defaultEncode);
        } catch (e: any) {
            window.showErrorMessage(e.message);
            throw e;
        }
        
        const $ = cheerioModule.load(data);

        let html = $("#content").html();
        if (!html) {
            window.showErrorMessage("爬不到内容啦");
            return;
        }

        this.cacheText = html.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<div>.*<\/div>/g, '').trim();
        this.title = $(".title em").text();

        this.prevPageURL = this.baseURL + $("#prev_url").prop("href");
        this.nextPageURL = this.baseURL + $("#next_url").prop("href");
    }

    async getCacheText(start: number, pageSize: number): Promise<string> {
        this.lastPageSize = pageSize;
        return this.cacheText.slice(start, start + pageSize);
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
        let showText = this.cacheText.slice(this.readedCount, this.readedCount + pageSize);

        let lineBreakPosition = showText.indexOf("\n");
        if (lineBreakPosition === -1) {
            this.readedCount += pageSize;
        }else{
            this.readedCount += lineBreakPosition + 1;
            showText = showText.slice(0, lineBreakPosition);
        }

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