---
title: onedrive(by abraunegg) —— 一个 Linux 下的开源 OneDrive 客户端(cli)
date: 2022-12-24 22:40:13
description: 本文介绍了在 Linux 系统下使用 abraunegg 开发的开源命令行版 OneDrive 客户端。内容涵盖从安装、授权登录、配置文件设置，到选择性同步、自定义同步路径等核心功能的详细操作步骤。同时，文章还解析了 monitor 与 standalone 两种运行模式的区别，并提供了常用命令行参数的使用示例，如 --dry-run、--local-first、--download-only 等，帮助用户更灵活地控制文件同步行为。无论是桌面用户还是服务器环境，都能通过本指南快速搭建稳定可靠的 OneDrive 同步服务。
sticky:
index_img: https://static.031130.xyz/uploads/2024/08/12/63a71425507b6.webp
tags:
- Linux
- Archlinux
- OpenSource Project
- Experience
- OneDrive
---

> 这款 Linux 下的 OneDrive 客户端我其实一年前就已经在用了，最近打算给自己的 vps 重装系统并重新部署下 aria 的下载服务，顺便把上传到 OneDrive 的功能增加进去，便又想到了这款运行在命令行中的第三方开源 Linux 客户端，去谷歌上搜索了一番，依然没有什么成规模的中文博客去写它的用法，于是就打算自己来写。~~那肯定不是因为我博客这个月没有什么题材~~

## 安装

abraunegg 用 D 语言写的 OneDrive 客户端安装起来并不是什么难事，Ubuntu/Debian/Fedora 等常见发行版的仓库中均有它的身影，具体情况在 [Github 项目页面](https://github.com/abraunegg/onedrive/blob/master/docs/INSTALL.md)中都有描述。

在 Archlinux 下，我可以直接从 AUR/ArchlinuxCN 中安装 `onedrive-abraunegg` 这个包来安装这个项目。

```bash
sudo pacman -S onedrive-abraunegg
```

## 运行前配置

> 本章内容中的所用到的和没有用到的命令都可以在[该项目的 Github 仓库](https://github.com/abraunegg/onedrive/blob/master/docs/USAGE.md)中找到。

在终端直接运行 `onedrive` 命令，程序将打印出一行地址。

![登陆地址](https://static.031130.xyz/uploads/2024/08/12/63a71dbfd6ed3.webp)

使用浏览器打开地址，就会跳出微软的登陆页面，正常登陆即可。

登陆成功后，浏览器将会显示一片白屏，不必慌张，直接将浏览器地址栏中的网址复制后粘贴进终端中即可完成配置，获取到的 `refresh_token` 将会被保存到 `$HOME/.config/onedrive` 下。

![浏览器显示白屏](https://static.031130.xyz/uploads/2024/08/12/63a71e1f9c916.webp)

![授权成功](https://static.031130.xyz/uploads/2024/08/12/63a71ec6d5aca.webp)

账号授权成功以后我有两个迫切的需求需要在开始同步前解决: 

- 我不希望把我 OneDrive 里所有的文件下载下来，我在 OneDrive 中存放了至少 1T 的数据，而我的系统盘就只有 512G，这绝对是放不下的，所以我想仅同步部分文件夹。
- 我需要修改被同步到的文件夹的路径，我不想把 OneDrive 上的文件下载到我的 `/home` 下。

***

要解决第一个需求，我们可以通过创建 `sync_list` 的方式指定我们要同步的文件，在 `$HOME/.config/onedrive` 路径下创建 `sync_list` ，并填入需要的文件或文件夹名，或在 `!`或`-` 后面写上不想同步的文件或文件夹名即可，支持通配符，在[原仓库的文档中](https://github.com/abraunegg/onedrive/blob/master/docs/USAGE.md#performing-a-selective-sync-via-sync_list-file)给出了非常详细的描述。

***

我们可以先使用 `onedrive --display-config` 命令查看我们当前的配置情况。（我这边直接应用 Github 文档中展示的内容）

```
onedrive version                             = vX.Y.Z-A-bcdefghi
Config path                                  = /home/alex/.config/onedrive
Config file found in config path             = true
Config option 'sync_dir'                     = /home/alex/OneDrive
Config option 'enable_logging'               = false
...
Selective sync 'sync_list' configured        = false
Config option 'sync_business_shared_folders' = false
Business Shared Folders configured           = false
Config option 'webhook_enabled'              = false
```

这很显然，OneDrive 中的文件默认将会被保存到 `$HOME/OneDrive` 中。为了修改这个位置项，我们直接在 `$HOME/.config/onedrive/` 路径下创建一个名为 `config` 的文件，把此处给的 c[onfiguration examples](https://github.com/abraunegg/onedrive/blob/master/docs/USAGE.md#the-default-configuration-file-is-listed-below) 全部复制进去，找到 `sync_dir` 把前面的注释删掉，改成自己喜欢的路径 ~~（别问我为什么写 /tmp，问就是我内存够大~~

![修改同步路径！](https://static.031130.xyz/uploads/2024/08/12/63a7282ee55e7.webp)

修改好此处的配置文件后，可以再次运行 `onedrive --display-config` 检查自己的配置文件格式有没有问题、自己更改的配置项有没有生效，这样就解决了我的第二个需求。

## Standalone Mode / Monitor Mode?

这款 OneDrive 客户端支持以两种方式运行，monitor 模式将会监控本地磁盘上的文件状态，因而在同步路径内的文件从一个路径移动到另一个路径时，客户端将不会傻傻地执行「在原路径删除远端文件-重新上传新路径的本地文件」的这一个过程，具体使用 monitor 或 standalone 模式还请自行斟酌，可参考 [Moving files into different folders should not cause data to delete and be re-uploaded](https://github.com/abraunegg/onedrive/blob/master/docs/known-issues.md#moving-files-into-different-folders-should-not-cause-data-to-delete-and-be-re-uploaded) .

## 开始同步

使用该客户端执行同步的命令很简单，即

```bash
onedrive --synchronize
```

但可选的运行参数很多，我只举出最常用的几个例子

### --dry-run

使用 `--dry-run` 选项后，OneDrive 将不会执行同步操作，它将在终端输出原本将会被执行的操作以供你排查自己的配置是否正确。

### --local-first

字面意思，`--local-first` 即为本地优先，同步时如果遇到文件冲突将会优先参考本地的情况。

### --single-directory

`--single-directory` 后面需要跟一个子文件夹在 OneDrive 根目录中的相对路径，这将使本次的同步操作仅对单个文件夹生效。

### --download-only

字面意思，`--download-only` 即为仅下载模式。

### --upload-only

字面意思，`--upload-only`即为仅上传模式，后跟 `--no-remote-delete`将不会在 OneDrive 网盘中删除本地相较于网盘中缺少的文件，真正做到 upload only.

### --resync

当下列配置项被更改时，需要执行 `--resync` 来确保客户端正在按照更新后的配置文件来同步你的数据

- sync_dir
- skip_dir
- skip_file
- drive_id
- Modifying sync_list
- Modifying business_shared_folders
