const numHanMap = new Map<string, number>([
    ["一", 1],
    ["二", 2],
    ["三", 3],
    ["四", 4],
    ["五", 5],
    ["六", 6],
    ["七", 7],
    ["八", 8],
    ["九", 9],
    ["零", 0],
]);

const unitHanMap = new Map<string, number>([
    ["十", 10],
    ["百", 100],
    ["千", 1000],
    ["万", 10000],
]);

// convert chinese to number, for example “二十” -> 20
// current support “十百千万”
export function convertChineseToNumber(han: string): number {
    let directNum = parseInt(han, 10);
    if (!isNaN(directNum)) {
        return directNum;
    }
    
    let ans = 0;
    let num = 0;
    let withoutUnit = true;
    let stack: Array<number> = [];

    // startwith unit, for example "十一" -> "一十一"
    if(unitHanMap.has(han[0])) {
        han = "一" + han;
    }

    for (let index = 0; index < han.length; index++) {
        if (numHanMap.has(han[index])) {
            num = <number>numHanMap.get(han[index]);
            stack.push(num);
            if (index === han.length - 1) {
                ans += num;
            }
        } else if (unitHanMap.has(han[index])) {
            withoutUnit = false;
            ans += (<number>unitHanMap.get(han[index])) * num;
        }
    }

    if (withoutUnit) {
        stack.pop();
        let unit = 10;
        while (stack.length > 0) {
            ans += <number>stack.pop() * unit;
            unit *= 10;
        }
    }

    return ans;
}