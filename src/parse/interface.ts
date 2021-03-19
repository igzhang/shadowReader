export interface Parser {

    // open resource with encode utf-8;
    open(name: string): void;

    // close resource if necessary;
    close(): void;

    // get page text
    // @param: number: read string length <= size
    // @param: start: start bytes
    // return: [text info, readed bytes]
    getPage(size: number, start: number): [string, number];

    // get total size of resource
    getTotalSize(): number;
}