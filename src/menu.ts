import { window, ExtensionContext } from "vscode";
import path = require('path');
import { checkFileDecodeOrConvert, bookLibraryKey } from "./store";
import { loadFile } from "./read";

enum Menu {
    readBook = "开始阅读",
    newBook = "添加新书籍",
    newLocalBook = "本地书籍",
}

export async function showMainMenu(context: ExtensionContext) {
    let firstChoice = await window.showQuickPick([Menu.readBook, Menu.newBook], {
        matchOnDescription: true,
    });
    switch (firstChoice) {
        case Menu.readBook:
            showBookLibraryList(context);
            break;

        case Menu.newBook:
            newBookMenu(context);
            break;

        default:
            break;
    }
}

async function newBookMenu(context: ExtensionContext) {
    let newBookChoice = await window.showQuickPick([Menu.newLocalBook, ], {
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
    
        default:
            break;
    }
}

async function showBookLibraryList(context: ExtensionContext) {
    let bookLibraryDictString = context.globalState.get(bookLibraryKey, "{}");
    let bookLibraryDict = JSON.parse(bookLibraryDictString);
    let bookChoice = await window.showQuickPick(Object.keys(bookLibraryDict), {
        matchOnDescription: true,
    });
    if (bookChoice) {
        loadFile(context, bookLibraryDict[bookChoice]);
    }
}
