import { openSync, closeSync, readSync, fstatSync } from "fs";
import iconv = require('iconv-lite');
import { Parser } from "./interface";

export class TxtFileParser implements Parser {
    private static fd: number;
    private static readonly stringMaxSize: number = 4;
    private static readonly encoding: string = "utf32-le";
    private static fileByteSize: number;

    getPage(size: number, start: number): [string, number] {
        let bufferSize = TxtFileParser.stringMaxSize * size;
        let buffer = Buffer.alloc(bufferSize);

        let readAllBytes = readSync(TxtFileParser.fd, buffer, 0, bufferSize, start);
        if (readAllBytes === 0) {
            return ["", 0];
        }

        let showText = iconv.decode(buffer, TxtFileParser.encoding);
        showText = showText.trim().replace(/\n/g, "   ").replace(/\r/g, "  ");
        return [showText, bufferSize];
    }

    // todo: open another book and close current book
    open(name: string): void {
        TxtFileParser.fd = openSync(name, 'r');
        TxtFileParser.fileByteSize = fstatSync(TxtFileParser.fd).size;
    }

    close(): void {
        if (TxtFileParser.fd) {
            closeSync(TxtFileParser.fd);
        }
    }

    getTotalSize(): number {
        return TxtFileParser.fileByteSize;
    }
}