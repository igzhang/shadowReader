import { Parser } from "./interface";

export class BiquWebParser implements Parser {

    private 

    close(): void {};

    getNextPage(pageSize: number): string {
        return "";
    }

    getPrevPage(pageSize: number): string {
        return ""
    }

    getPercent(): string {
        return ""
    }

    getPersistHistory(): BookStore;
}