import { window, ExtensionContext, workspace } from "vscode";
import path = require('path');
import { checkFileDecodeOrConvert, bookLibraryKey, deleteFile, downloadFileAndConvert } from "./store";
import { loadFile, searchContentToEnd } from "./read";
import { setStatusBarMsg } from "./util";
import got from "got";


let bookLibraryDict: object = {};
let onlineBookObject: object;

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
            (async () => {
                try {
                    const response = await got.get(onlineBookURL, {responseType: "json"});
		            onlineBookObject = response.body as object;
                    window.showInputBox({
                        value: "*",
                        placeHolder: "*代表随机",
                        prompt: "要搜索的书名"
                    }).then(
                        bookFuzzyName => {
                            if (bookFuzzyName) {
                                let quickPickMenu = [];
                                for (const key in onlineBookObject) {
                                    if (bookFuzzyName === "*" || key.includes(bookFuzzyName)) {
                                        quickPickMenu.push(key);
                                        if (quickPickMenu.length > 6) {
                                            break;
                                        }
                                    }
                                }
                                window.showQuickPick(quickPickMenu, {
                                    matchOnDescription: true,
                                }).then(selectBookName => {
                                    if (selectBookName && hasKey(onlineBookObject, selectBookName)) {
                                        downloadFileAndConvert(context, selectBookName, onlineBookObject[selectBookName]);
                                    }
                                });
                            }
                        }
                    );
                } catch(err) {
                    window.showErrorMessage(`获取在线书籍错误${err}`);
                }
            })();
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
                let text = searchContentToEnd(context, keyWord);
                setStatusBarMsg(text);
                window.showInformationMessage("搜索完成");
            }
        }
    );
}