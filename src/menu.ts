import { window, ExtensionContext, workspace } from "vscode";
import path = require('path');
import { checkFileDecodeOrConvert, bookLibraryKey, deleteFile } from "./store";
import { loadFile, searchContentToEnd } from "./read";
import { setStatusBarMsg } from "./util";
import { Craweler } from "./crawler/interface";
import { CrawelerDomains } from "./const";
import { BiquCrawler } from "./crawler/biqu";
import { CaimoCrawler } from "./crawler/caimo";
import { BookKind } from "./parse/model";

let bookLibraryDict: object = {};

enum Menu {
    readBook = "开始阅读",
    newBook = "添加新书籍",
    newLocalBook = "本地书籍",
    deleteBook = "删除书籍",
    newOnlineBook = "网络书籍",
}

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
}

export async function showMainMenu(context: ExtensionContext) {
    let firstChoice = await window.showQuickPick([Menu.readBook, Menu.newBook, Menu.deleteBook], {
        matchOnDescription: true,
    });
    let bookChoice: string | undefined;
    switch (firstChoice) {
        case Menu.readBook:
            bookChoice = await showBookLibraryList(context);
            if (bookChoice && hasKey(bookLibraryDict, bookChoice)) {
                loadFile(context, bookLibraryDict[bookChoice]);
            }
            break;

        case Menu.newBook:
            newBookMenu(context);
            break;

        case Menu.deleteBook:
            bookChoice = await showBookLibraryList(context);
            if (bookChoice) {
                deleteFile(context, bookChoice);
                window.showInformationMessage("删除成功");
            }
            break;

        default:
            break;
    }
}

function newOnlineCraweler(): Craweler {
    let bookURL = workspace.getConfiguration().get("shadowReader.onlineBookURL");
    switch (bookURL) {
        case <string>CrawelerDomains.get("caimoURL"):
            return new CaimoCrawler();
        case <string>CrawelerDomains.get("biquURL"):
            return new BiquCrawler();
        default:
            return new CaimoCrawler();;
    }
}

async function newBookMenu(context: ExtensionContext) {
    let newBookChoice = await window.showQuickPick([Menu.newLocalBook, Menu.newOnlineBook ], {
        matchOnDescription: true,
    });
    switch (newBookChoice) {
        case Menu.newLocalBook:
            window.showOpenDialog().then((filePaths) => {
            	if (filePaths && filePaths.length > 0) {
                    window.showInputBox({
                        value: path.basename(filePaths[0].fsPath),
                        placeHolder: "别名",
                        prompt: "起个名子吧（重名会覆盖哦）"
                    }).then(
                        nickName => {
                            if (nickName) {
                                checkFileDecodeOrConvert(context, filePaths[0].fsPath, nickName);
                            }
                        }
                    );
            	}
            });
            break;
    
        case Menu.newOnlineBook:
            let onlineBookURL: string | undefined = workspace.getConfiguration().get("shadowReader.onlineBookURL");
            if (!onlineBookURL) {
                window.showErrorMessage("onlineBookURL未配置");
                return;
            }
            window.showInputBox({
                value: "",
                prompt: "要搜索的书名"
            }).then(async bookFuzzyName => {
                if (bookFuzzyName) {
                    let crawler: Craweler = newOnlineCraweler();
                    let bookDict = await crawler.searchBook(bookFuzzyName);
                    window.showQuickPick(Array.from(bookDict.keys()), {matchOnDescription: true}).then(async value => {
                        if (value) {
                            let bookURL = <string>bookDict.get(value);
                            let chapterURLDict = await crawler.findChapterURL(bookURL);
                            window.showQuickPick(Array.from(chapterURLDict.keys()), {matchOnDescription: true}).then( startChapter => {
                                if(startChapter) {
                                    let bookLibraryDictString = context.globalState.get(bookLibraryKey, "{}");
                                    let bookLibraryDict = JSON.parse(bookLibraryDictString);
                                    bookLibraryDict[value] = bookURL;
                                    context.globalState.update(bookLibraryKey, JSON.stringify(bookLibraryDict));
                                    context.globalState.update(bookURL, {
                                        kind: BookKind.online,
                                        readedCount: 0,
                                        sectionPath: <string>chapterURLDict.get(startChapter),
                                    });
                                    window.showInformationMessage("添加成功");
                                }
                            });
                        }
                    });
                }
            });
            
            break;

        default:
            break;
    }
}

async function showBookLibraryList(context: ExtensionContext): Promise<string | undefined> {
    let bookLibraryDictString = context.globalState.get(bookLibraryKey, "{}");
    bookLibraryDict = JSON.parse(bookLibraryDictString);
    return await window.showQuickPick(Object.keys(bookLibraryDict), {
        matchOnDescription: true,
    });
}

export function showSearchKeywordBox(context: ExtensionContext) {
    window.showInputBox({
        placeHolder: "注意：会自动跳转",
        prompt: "按照内容向后搜索"
    }).then(
        keyWord => {
            if (keyWord) {
                let text = searchContentToEnd(context, keyWord).then(text => {
                    setStatusBarMsg(text);
                    window.showInformationMessage("搜索完成");
                });
            }
        }
    );
}