// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showMainMenu } from "./menu";
import { readNextLine, readPrevLine, closeAll } from "./read";


function showHelloWorld() {
	vscode.window.setStatusBarMessage("Hello world");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let getNextPage = vscode.commands.registerCommand("shadowReader.getNextPage", () => {
		let text: string;
		try {
			text = readNextLine(context);
		} catch (e) {
			text = <string>e;
		}
		vscode.window.setStatusBarMessage(text);
	});
	context.subscriptions.push(getNextPage);

	let getPrevPage = vscode.commands.registerCommand("shadowReader.getPrevPage", () => {
		let text: string;
		try {
			text = readPrevLine(context);
		} catch (e) {
			text = <string>e;
		}
		vscode.window.setStatusBarMessage(text);
	});
	context.subscriptions.push(getPrevPage);

	let startMain = vscode.commands.registerCommand("shadowReader.start", async () => {
		await showMainMenu(context);
	});
	context.subscriptions.push(startMain);

	let showBossInfo = vscode.commands.registerCommand("shadowReader.showBossInfo", () => {
		showHelloWorld();
	});
	context.subscriptions.push(showBossInfo);

}

// this method is called when your extension is deactivated
export function deactivate() {
	closeAll();
}
