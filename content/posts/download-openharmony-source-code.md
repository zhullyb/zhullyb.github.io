---
title: 下载一份openharmony的源码
top: false
description: 想要下载 OpenHarmony 的源码却不知道从何入手？本文详细介绍了从环境准备到源码同步的完整流程，包括 Git 和 repo 工具的配置、源码目录结构解析，以及常见错误的解决方法。文章还通过实际磁盘占用数据，将 OpenHarmony 与 AOSP 的源码体积进行对比，引发对系统完整性的思考。适合对开源系统感兴趣、希望深入探索 OpenHarmony 的开发者阅读。
date: 2021-06-06 16:47:34
tags: 
---

> 不知道为什么，总是有人告诉我鸿蒙已经开源了，不信可以自己去看源码balabala，其实鸿蒙的手机端目前为止依然没有开源，或者说没有完整完整开源。本文我将介绍如何拉取一份openharmony开源的源码。

首先需要准备以下东西

- 一台装有类unix环境的电脑（wsl大概也行）
- 6G磁盘剩余空间
- 互联网（如果使用手机流量的话大概是1.5G）

0. #### 安装git

   没什么好说的，不再赘述。

1. #### 设置git用户名和邮箱

```
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

2. #### 下载repo（这个大多数发行版自己都有打包，但是都比较滞后，不如直接下载最新版的二进制文件设置好path变量直接用）

```bash
mkdir -p ~/bin
curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
chmod a+x ~/bin/repo

cat >> ~/.bashrc <<EOF

# set PATH so it includes user's private bin if it exists
if [ -d "\$HOME/bin" ] ; then
    PATH="\$HOME/bin:\$PATH"
fi
EOF

source ~/.bashrc
```

3. #### 新建一个文件夹以同步源码

```bash
mkdir openharmony
```

4. #### 进入这个文件夹

```bash
cd openharmony
```

5. #### 初始化repo

```bash
repo init -u https://gitee.com/openharmony/manifest.git --depth=1
```

​	注:  `--depth=1`是为了仅保留一层commit记录，防止过多的历史commit占用空间，如果你想保留历	史commit，那可以把这里的`--depth=1`去掉。

6. #### 使用repo正式开始同步源码

```bash
repo sync
```

repo在sync的时候其实可以加很多选项，可以通过`repo help`自行研究，我自己常用的是`repo sync  --force-sync --current-branch --no-tags --no-clone-bundle --optimized-fetch --prune -j$(nproc --all) -f1`

看到以下提示代表同步成功

```
repo sync has finished successfully.
```

### 后话

结果就当源码下载好并开始checkout后，出现了以下错误

```
Garbage collecting: 100% (220/220), done in 1.204s
Updating files: 100% (35/35), done.
Updating files: 100% (27/27), done.
git-lfs filter-process --skip: line 1: git-lfs: command not found
fatal: the remote end hung up unexpectedly
error.GitError: Cannot checkout device_hisilicon_modules: Cannot initialize work tree for device_hisilicon_modules
error: Cannot checkout device_hisilicon_modules
```

看着error很容易可以发现是我的系统没有`git-lfs`的原因，看样子openharmony使用了git-lfs来储存了某个大文件。

```bash
sudo pacman -S git-lfs	#别的发行版请自行查找相关安装方法
```

于是乎，安装好`git-lfs`重新sync源码

oepnharmony目录下，`.repo`文件夹内是你从git服务器上下载下来的原始数据，repo将在所有数据下载完成以后将他们自动checkout成代码。

源码结构是下面这个样子

```
.
├── applications
├── base
├── build
├── build.py -> build/lite/build.py
├── build.sh -> build/build_scripts/build.sh
├── developtools
├── device
├── docs
├── domains
├── drivers
├── foundation
├── .gn -> build/core/gn/dotfile.gn
├── interface
├── kernel
├── prebuilts
├── productdefine
├── .repo
├── test
├── third_party
├── utils
└── vendor

18 directories, 3 files
```



![这里是OpenHarmony包含.repo原始数据的全部大小](https://static.031130.xyz/uploads/2024/08/12/62f3cb1057a22.webp)

![这里是OpenHarmony的.repo原始数据的大小](https://static.031130.xyz/uploads/2024/08/12/62f3cb13027fb.webp)

**我提供个参考数据，AOSP源码不含.repo原始数据的大小是40G，就openharmony这个代码量，恐怕很难让我相信这是一个兼容安卓应用的系统的完整代码。**

![这里是AOSP的.repo原始数据大小](https://static.031130.xyz/uploads/2024/08/12/62f3cb15ccbf1.webp)

![这里是AOSP包含.repo原始数据的大小](https://static.031130.xyz/uploads/2024/08/12/62f3cb182333b.webp)
