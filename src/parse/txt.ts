import { openSync, closeSync, readSync, fstatSync } from "fs";
import iconv = require('iconv-lite');
import { workspace } from "vscode";
import { BookKind, BookStore } from  "./model";
import { Parser } from "./interface";

export class TxtFileParser implements Parser {
    private fd: number;
    private readonly stringMaxSize: number = 4;
    private readonly encoding: string = "utf32-le";
    private totalByteSize: number;
    private readedCount: number;
    private lastPageSize: number = 0;
    
    constructor (bookPath: string, readedCount: number) {
        this.fd = openSync(bookPath, 'r');
        this.totalByteSize = fstatSync(this.fd).size;
        this.readedCount = readedCount;
    }

    getPage(size: number, start: number): [string, number] {
        this.lastPageSize = size;
        let bufferSize = this.stringMaxSize * size;
        let buffer = Buffer.alloc(bufferSize);

        let readAllBytes = readSync(this.fd, buffer, 0, bufferSize, start);
        if (readAllBytes === 0) {
            return ["", 0];
        }

        let showText = iconv.decode(buffer, this.encoding);
        let newlineReplace = <string>workspace.getConfiguration().get("shadowReader.newlineReplace");
        showText = showText.trim().replace(/\n/g, newlineReplace).replace(/\r/g, '');
        return [showText, bufferSize];
    }

    async getNextPage(pageSize: number): Promise<string> {
        let [showText, bufferSize] = this.getPage(pageSize, this.readedCount);
        if (bufferSize === 0) {
            return "";
        }
        this.readedCount += bufferSize;
        return showText;
    }

    getPrevPage(pageSize: number): Promise<string> {
        this.readedCount -= pageSize * 2 * this.stringMaxSize;
        if (this.readedCount < 0) {
            this.readedCount = 0;
        }
        return this.getNextPage(pageSize);
    }

    close(): void {
        closeSync(this.fd);
    }

    getPercent(): string {
        return `${(this.readedCount / this.totalByteSize * 100).toFixed(2)}%`;
    }

    getPersistHistory(): BookStore {
        return {
            kind: BookKind.local,
            readedCount: this.readedCount - this.lastPageSize * this.stringMaxSize,
        };
    }
}