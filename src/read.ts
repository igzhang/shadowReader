import { workspace, ExtensionContext } from "vscode";
import { setStatusBarMsg } from "./util";
import { BookKind, BookStore } from "./parse/model";
import { Parser } from "./parse/interface";
import { TxtFileParser } from "./parse/txt";
import { BiquWebParser } from "./parse/biqu";

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
    
    case BookKind.online:
      return new BiquWebParser(<string>bookStore.sectionPath, bookStore.readedCount, bookPath);
  
    default:
      throw new Error("book kind is not supported");
  }
}

export async function readNextLine(context: ExtensionContext): Promise<string> {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  let content = await parser.getNextPage(pageSize);
  if (content.length === 0) {
    return readEOFTip;
  }
  let percent = parser.getPercent();
  context.globalState.update(bookPath, parser.getPersistHistory());
  return `${content}   ${percent}`;
}

export async function readPrevLine(context: ExtensionContext): Promise<string> {
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  let content = await parser.getPrevPage(pageSize);
  let percent = parser.getPercent();
  context.globalState.update(bookPath, parser.getPersistHistory());
  return `${content}   ${percent}`;
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
  let text = readNextLine(context).then(text => {
    setStatusBarMsg(text);
  });
}

export async function searchContentToEnd(context: ExtensionContext, keyword: string): Promise<string> {
  let keywordIndex = 0;
  let preLineEndMatch = false;
  let pageSize: number = <number>workspace.getConfiguration().get("shadowReader.pageSize");
  while (true) {
    let content = await parser.getNextPage(pageSize);
    if (content.length === 0) {
      break;
    }

    for (let char of content) {
      if (char === keyword[keywordIndex]) {
        keywordIndex++;
        if (keywordIndex === keyword.length) {
          if (preLineEndMatch) {
            return await readPrevLine(context);
          } else {
            let percent = parser.getPercent();
            context.globalState.update(bookPath, parser.getPersistHistory());
            return `${content}   ${percent}`;;
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
