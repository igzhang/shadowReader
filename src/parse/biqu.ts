import axios from "axios";
import cheerioModule = require("cheerio");
import iconv = require('iconv-lite');
import { window } from "vscode";
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

    constructor(currentPageURL: string, readedCount: number) {
        this.currentPageURL = currentPageURL;
        this.readedCount = readedCount;
    }

    close(): void {};

    private init() {
        this.fetchPage(this.currentPageURL);
    }

    private fetchPage(pageURL: string): void {
        axios.get(pageURL, {responseType: "arraybuffer"}).then(response => {
            let data = iconv.decode(response.data, this.defaultEncode);
            const $ = cheerioModule.load(data);
            this.cacheText = $("#content").text().replace(/\n/, "   ");
            return "";
        }).catch(err => {
            window.showErrorMessage(err);
        });
    }

    getNextPage(pageSize: number): string {
        if (this.cacheText.length === 0) {
            this.fetchPage(this.currentPageURL);
        }

        this.lastPageSize = pageSize;
        if (this.readedCount === this.cacheText.length - 1) {
            this.fetchPage(this.nextPageURL);
            this.readedCount = 0;
        }
        let showText = this.cacheText.substr(this.readedCount, pageSize);
        this.readedCount += pageSize;
        if (this.readedCount > this.cacheText.length - 1) {
            this.readedCount = this.cacheText.length - 1;
        }
        return showText;
    }

    getPrevPage(pageSize: number): string {
        console.log(pageSize);
        return "";
    }

    getPercent(): string {
        return "";
    }

    getPersistHistory(): BookStore {
        return {
            kind: BookKind.online,
            readedCount: this.readedCount - this.lastPageSize,
            sectionPath: this.currentPageURL,
        };
    };
}