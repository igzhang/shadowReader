# shadow-reader

vscode摸鱼看书插件，老板站在身后也不发现不了

## Features
- 支持状态栏显示
- 支持本地文本阅读
- 其他编码格式自动转码（支持格式GB18030、Big5、UTF-8、UTF-16、UTF-32等）

## Quick Start
1. ctrl+shift+p，`shadowReader:开始工作`
![feature X](./images/start.jpg)
主菜单如下
![feature X](./images/main.jpg)
2. 选择`添加新书籍`，选择文件，并起一个好记的名字吧
![feature X](./images/nick.png)
3. 选择`开始阅读`，选择刚添加的`活着`
![feature X](./images/select_book.jpg)
4. 使用快捷键，上一页`alt+,`，下一页`alt+.`，老板键`alt+/`
![feature X](./images/show_text.jpg)
5. Enjoy!

## Extension Settings
* `shadowReader.pageSize`: 每次最多显示字数
* 修改快捷键：首选项 -- 键盘快捷方式
![feature X](./images/keybind.jpg)

## Design Mind
- 专注vscode插件
- 专注隐蔽性、易用性

## Known Issues
- 上下一页的无反应（暂不清楚形成原因，可通过重新设置快捷键解决）

## Future Feature
- 向前、向后搜索内容
- 在线图书下载
- 其他格式支持(比如.epub)
- 其他隐藏显示手段

## Inspire
本插件灵感来自于[Thief-Book-VSCode](https://github.com/cteamx/Thief-Book-VSCode)，二者区别：  

- 大文件：Thief-Book-VSCode使用全部加载的方式，shadow-reader采用流式加载的方式
- 编码：Thief-Book-VSCode仅支持utf8编码，shadow-reader已支持多种转码
- 维护：Thief-Book-VSCode最近更新为2019年，shadow-reader会一直维护
- 功能：shadow-reader未来会更新更多功能，而不局限于**状态栏**和**本地文件**
