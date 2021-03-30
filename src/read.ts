import { workspace, ExtensionContext } from "vscode";
import { setStatusBarMsg } from "./util";
import { BookKind, BookStore } from "./parse/model";
import { Parser } from "./parse/interface";
import { TxtFileParser } from "./parse/txt";

let bookPath: string = "";
let parser: Parser;
const readEOFTip = "已达到结尾";


function loadParser(context: ExtensionContext, bookPath: string): Parser {
  let store = context.globalState.get(bookPath, 0);

  let bookStore: BookStore;
  // compatible old version
  if (typeof store === "number") {
    bookStore = {
      kind: BookKind.local,
      readedCount: store,
    };
  } else {
    bookStore = store as BookStore;
  }

  switch (bookStore.kind) {
    case BookKind.local:
      return new TxtFileParser(bookPath, bookStore.readedCount);
  
    default:
      throw new Error("book kind is not supported");
  }
}

export function readNextLine(context: ExtensionContext): string {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  let content = parser.getNextPage(pageSize);
  if (content.length === 0) {
    return readEOFTip;
  }
  let percent = parser.getPercent();
  context.globalState.update(bookPath, parser.getPersistHistory());
  return `${content} ${percent}%`;
}

export function readPrevLine(context: ExtensionContext): string {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  let content = parser.getPrevPage(pageSize);
  let percent = parser.getPercent();
  context.globalState.update(bookPath, parser.getPersistHistory());
  return `${content} ${percent}%`;
}

export function closeAll(): void {
  if (parser) {
    parser.close();
  }
}

export function loadFile(context: ExtensionContext, newfilePath: string) {
  if (parser) {
    parser.close();
  }
  parser = loadParser(context, newfilePath);
  bookPath = newfilePath;
  let text = readNextLine(context);
  setStatusBarMsg(text);
}

export function searchContentToEnd(context: ExtensionContext, keyword: string): string {
  let keywordIndex = 0;
  let preLineEndMatch = false;
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  while (true) {
    let content = parser.getNextPage(pageSize);
    if (content.length === 0) {
      break;
    }

    for (let char of content) {
      if (char === keyword[keywordIndex]) {
        keywordIndex++;
        if (keywordIndex === keyword.length) {
          if (preLineEndMatch) {
            return readPrevLine(context);
          } else {
            let percent = parser.getPercent();
            context.globalState.update(bookPath, parser.getPersistHistory());
            return `${content} ${percent}%`;;
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
  return readEOFTip;
}
