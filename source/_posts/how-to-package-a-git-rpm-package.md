---
title: 如何打出一个「-git」的rpm包
date: 2022-02-07 10:23:29
sticky:
execrpt:
tags:
- Fedora
- RPM Package
---

> 本文中，笔者通过 github api 获取最新的 commit_id ，以一种曲线救国的方式成功为 rpm 打下了一个 `-git` 包。

## On Archlinux

用过 AUR 的 Arch 用户应该知道，makepkg 支持 "-git" 包。当我们执行 makepkg 时，PKGBUILD 中的 `pkgver` 函数会自动被运行，并将输出的结果作为本次打包的版本号。这是一个非常棒的设计，我们不需要去手动更新 PKGBUILD，就可以直接从 git 服务区拉取最新的 master 分支编译打包，对于跟进开发进度而言非常方便。

一般来说，一个 `-git` 包的版本号会分成 2~4 个部分，最为核心的是 `count` 和 `commit_id`：`count`用于记录这是第几次提交，通过提交的次数作为版本号的靠前部分可以帮助包管理器比较版本号的新旧，比如第21次提交的代码一定比第18次的更加新，而21也正好比18大，包管理器也就凭借着这个数字来保证其可以在用户在更新的时候为用户选择一个更新版本的包；而 `commit_id`则可以帮助人类更快定位这个包是在哪一次代码提交以后编译的，以帮助 开发者/用户 定位问题。

## On Fedora

然而，这个思路在 rpm 上似乎无法实现。rpmbuild 执行的时候会事先根据版本号在 BUILDROOT 路径下创造一个 `%{name}-%{version}-%{release}-%{arch}`的目录，如此一来，就必须先确定版本号，无法像 PKGBUILD 那样使用一个 pkgver 的函数去自动更新版本号。此外，rpm 似乎专注于软件包的 Reproducibility，也就是希望拿到了指导 rpmbuild 打包的 specfile 以后打出一个相同包的能力，因此，使用同一份 specfile 在不同时间打出一个不同包的这种行为似乎并不符合 Fedora/Redhat 的哲学，所以我们怕是等不到 rpm 支持这个功能的那一天了。

## Turn of events

当然，这也并非不可能完成的任务，在 [西木野羰基](https://yanqiyu.info/) 的指引下，我在 Fedora Docs 找到了[对于某个 Branch 的打包样版](https://docs.fedoraproject.org/en-US/packaging-guidelines/SourceURL/#_branch_example)。其实也就是直接从 github 下载 master 分支的 master.tar.gz 压缩包来获取最新的源码，这样就确保了每一次 rpmbuild 的时候都能获取最新的源码。接下来需要处理的就是版本号的问题。

## Sad Story

很可惜，master.tar.gz 压缩包中并不包括 `.git` 文件，我们无法通过 `git rev-list --count HEAD` 来获取 `count` 计数，此外，最新的 `commit_id` 我们也不得而知。即使我们知道这些参数，也无法在 rpmbuild 执行之前自动把这些参数填进 specfile 中。

## Improvement

好在天无绝人之路，在 Liu Sen 的 [RPM 中宏的简单介绍](https://forum.suse.org.cn/t/topic/13626) 一文中发现宏其实也可以类似 bash 中的 `$()` 一样定义成系统运行某些命令后的结果，通过仿写 copr 上 *atim/fractal* 的 [specfile](https://download.copr.fedorainfracloud.org/results/atim/fractal/fedora-35-x86_64/03000082-fractal-master/fractal-master.spec) 定义了下面两个宏。

```
%global timenow %(echo $(date +%Y%m%d.%H%M))
%global commit_short_id %(api_result=$(curl -s https://api.github.com/repos/<username>/<reponame>/branches/master | head -n 4 | tail -n 1); echo ${api_result:12:7})
```

版本号就可以直接写成 `%{timenow}.%{commit_id_short}`

- `%{timenow}` 是直接通过运行系统的 date 命令获得一个精确到分钟的时间来当作 `count` 给 dnf 判断版本号大小使用

- `%{commit_id_short}` 从 api.github.com 获取到该仓库最新的 commit 号，配合粗制滥造的 shell 命令做切片，提取前7 位，帮助用户和开发者快速定位源码版本使用。当然，也可以选择直接使用 `jq` 作为 json 的解释器。

## Review

至此，我们成功解决了在 rpm 上打 `-git` 包的问题，不过仍然有以下缺点

- 仅支持 github 上的项目，对于其他的 git 托管服务商还需要去查阅他们的 api 文档
- 粗制滥造的 shell 命令可能不足以应对以后的 github api 变更
- 使用了精确到分钟的时间作为计数器，导致版本号过长
- 使用 copr 打包的时候，有概率出现 srpm 与 rpm 之间版本号出现分钟级的差异
