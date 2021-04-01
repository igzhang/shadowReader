export const enum BookKind {
    local,
    online,
}

export interface BookStore {
    kind: BookKind,
    readedCount: number,
    sectionPath?: string,
}
