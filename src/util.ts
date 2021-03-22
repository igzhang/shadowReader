import { StatusBarItem, window } from "vscode";

export const searchToEndCommandID = "shadowReader.searchToEnd";
let myStatusBarItem: StatusBarItem = window.createStatusBarItem();
myStatusBarItem.command = searchToEndCommandID;


export function setStatusBarMsg(msg: string) {
    if (msg.length > 0) {
        myStatusBarItem.text = msg;
        myStatusBarItem.show();
    } else {
        myStatusBarItem.hide();
    }
}