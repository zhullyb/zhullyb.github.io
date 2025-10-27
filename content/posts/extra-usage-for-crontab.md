---
title: crontab 中简单的@语法糖
date: 2024-02-08 17:21:31
sticky:
tags:
- Linux
- crontab
---

说来惭愧，其实我用了这么久的 Linux，一直没有学会编写 crontab 脚本。一行的开头写上五位莫名其妙的数字或星号，后面跟上需要执行的命令，看上去很 kiss，~~但我确实记不住，以至于我现在每次写 crontab 都是让 ChatGPT 来帮我写。~~

不过我最近查阅 Linux 下设置开机自启脚本的方案的时候，意外地看到 crontab 中居然可以用 `@reboot command` 的方式去写，这让我意识到 crontab 也是有一些简单的语法糖的。在查阅了 [crontab 的 manual](https://man.archlinux.org/man/crontab.5.en#EXTENSIONS) 后，我发现一共有下面这么几种 @ 写法的语法糖。这是在全网大部分的 crontab 中文教程中是没有的。

| 语法糖      | 执行条件     | 等效表达式  |
| ----------- | ------------ | ----------- |
| `@reboot`   | 开机时候运行 |             |
| `@yearly`   | 一年一次     | `0 0 1 1 *` |
| `@annually` | 一年一次     | `0 0 1 1 *` |
| `@monthly`  | 一月一次     | `0 0 1 * *` |
| `@weekly`   | 一周一次     | `0 0 * * 0` |
| `@daily`    | 一天一次     | `0 0 * * *` |
| `@hourly`   | 一小时一次   | `0 * * * *` |

这几个简单的语法糖可以满足大部分 crontab 的情况，免去了对使用者学习并记忆 crontab 的表达式的要求。

比如说，如果我希望我的系统在每次开机时都用 TG Bot 发送一条上线信息，那就是

```bash
@reboot curl -s -X POST https://api.telegram.org/bot{id}:{apikey}/sendMessage -d chat_id={uid} -d text="`date`"
```

