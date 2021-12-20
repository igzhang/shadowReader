# Change Log
版本改动日志

### 0.5.3
>> 发布时间2021-12-20
- bug fix：修改笔趣阁域名

### 0.5.3
>> 发布时间2021-09-08
- impovement：去掉`shadowReader.chapterRegExp`配置，将章节选择由数字改为列表选择
- impovement：优化网络书籍报错提示

### 0.5.2
>> 发布时间2021-08-27
- bug fix：在线书籍章节选取错误，详见[issue](https://github.com/igzhang/shadowReader/issues/11)

### 0.5.1
>> 发布时间2021-07-25
- feature：自动老板键--长时间不操作，默认使用老板键（感谢MerlinBlade提供的思路，详见[issue](https://github.com/igzhang/shadowReader/issues/7)）
- impovement：第二次点击老板键，会返回原文本

### 0.4.1
>> 发布时间2021-04-01
- impovement：改版“网络书籍”功能，修改为目标网站在线阅读，当前支持笔趣阁（感谢isSamle提供的思路）

### 0.3.1
>> 发布时间2021-03-25
- feature：增加“网络书籍”选项

### 0.2.1
>> 发布时间2021-03-22
- feature：增加“删除书籍”、“根据内容向后查找”功能
- bug fix：新打开的文件，进度为0%

### 0.1.3
>> 发布时间2021-03-19
- impovement：修改默认编码为utf32le
- bug fix：退出vscode时，当前阅读进度未保存

### 0.1.2
>> 发布时间2021-03-18
- bug fix: 新添加utf8文件失败的问题
- impovement：修改默认快捷键为alt，以避免影响注释功能

### 0.1.1
>> 发布时间2021-03-18
- impovement：全新用户UI
- feature：自动转码（支持格式参考[chardet](https://www.npmjs.com/package/chardet)）

### 0.0.1
>> 发布时间2021-03-16
- feature：支持本地utf8文件
- feature：自动保存当前书签
