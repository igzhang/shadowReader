export interface Craweler {
    // search book according to keyword
    // return: key is name, value is index html
    searchBook(keyWord: string): Promise<Map<string, string>>;

    // find chapter detail url according to index html
    findChapterURL(url: string): Promise<Map<string, string>>;
}