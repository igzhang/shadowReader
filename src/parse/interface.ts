import { BookStore } from "./model";

export interface Parser {

    // close resource if necessary;
    close(): void;

    // get next page content, if string.length === 0, means no more content
    getNextPage(pageSize: number): Promise<string>;

    // get prev page content
    getPrevPage(pageSize: number): Promise<string>;

    // get percent info
    getPercent(): string;

    // get persist read history, used to cache history
    getPersistHistory(): BookStore;
}