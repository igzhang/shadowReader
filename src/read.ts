import { workspace, ExtensionContext, window } from "vscode";
import { setStatusBarMsg } from "./util";
import { Parser } from "./parse/interface";
import { TxtFileParser } from "./parse/txt";

let fileName: string = "";
let parser: Parser;
let historyCursor = 0;
const readEOFMsg = "已读完啦！   100.00%";

function readContent(context: ExtensionContext, pageSize: number): string {
  // check config
  if(fileName.length === 0) {
    return "请先选择书籍";
  }

  // get content
  let [nextPage, readedBytes] = parser.getPage(pageSize, historyCursor);

  if (readedBytes === 0) {
    return readEOFMsg;
  }

  // update history
  historyCursor += readedBytes;
  context.globalState.update(fileName, historyCursor);

  // calculate read precent
  let precent = (historyCursor / parser.getTotalSize() * 100).toFixed(2);

  return `${nextPage}   ${precent}%`;
}

export function readNextLine(context: ExtensionContext): string {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  return readContent(context, pageSize);
}

export function readPrevLine(context: ExtensionContext): string {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  historyCursor -= pageSize * 8;
  if (historyCursor < 0) {
    historyCursor = 0;
  }
  return readNextLine(context);
}

export function closeAll(): void {
  if (parser) {
    parser.close();
  }
}

function loadHistoryStack(context: ExtensionContext, filePath: string) {
  historyCursor = context.globalState.get(filePath, 0);
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  historyCursor -= pageSize * 4;
  if (historyCursor < 0) {
    historyCursor = 0;
  }
}

export function loadFile(context: ExtensionContext, newfilePath: string) {
  if (parser) {
    parser.close();
  } else {
    parser = new TxtFileParser();
  }

  parser.open(newfilePath);
  loadHistoryStack(context, newfilePath);

  fileName = newfilePath;
  let text = readNextLine(context);
  setStatusBarMsg(text);
}

export function searchContentToEnd(context: ExtensionContext, keyword: string): string {
  let keywordIndex = 0;
  let preLineEndMatch = false;
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  while (true) {
    // read content
    let [nextPage, readedBytes] = parser.getPage(pageSize, historyCursor);
    if (readedBytes === 0) {
      break;
    }

    // update history
    historyCursor += readedBytes;
    
    for (let char of nextPage) {
      if (char === keyword[keywordIndex]) {
        keywordIndex++;
        if (keywordIndex === keyword.length) {
          if (preLineEndMatch) {
            return readPrevLine(context);
          } else {
            let precent = (historyCursor / parser.getTotalSize() * 100).toFixed(2);
            context.globalState.update(fileName, historyCursor);
            return `${nextPage}   ${precent}%`;;
          }
        }
      } else {
        keywordIndex = 0;
      }
    }

    // between two lines
    if (keywordIndex !== 0) {
      preLineEndMatch = true;
    }
  }
  return readEOFMsg;
}
