---
title: 执行 repo sync 后将 git-lfs 中的资源文件 checkout
date: 2023-05-03 01:15:35
description: 本文将介绍在执行 repo sync 后如何高效处理 git-lfs 中未被自动拉取的资源文件。通过分析常见问题，如 git-lfs 未安装或全仓库执行命令效率低下，我们提供了一种优化方案：仅对包含 .lfsconfig 文件的仓库执行 git lfs install 和 git lfs pull 操作，从而提升同步效率并减少不必要的资源消耗。适合 Android 系统开发、AOSP 源码维护及使用 repo 工具管理多仓库的开发者参考。
sticky:
tags:
- 笔记
---

> 最近期中考试挺忙的，五一好不容易有一些自己的时间，于是打算重操旧业，搞点有意思的内容，没想到准备阶段就出了新问题，有点跟不上时代了

本次遇到的问题是在执行 `repo sync` 命令后储存在 git-lfs 中的文件没有被自动 pull 并 checkout 出来，尽管我在 `repo init` 阶段已经加了 `--git-lfs` 参数了。

上 google 简单查了查，查到一篇 [stackoverflow](https://stackoverflow.com/questions/67280310/how-to-run-git-lfs-automatically-after-repo-sync) 的回答，给出的思路是使用 `repo forall -c 'git lfs pull'` 的方案解决的，意思是在 repo 同步的每一个 git 仓库中都自动执行 `git lfs pull` 命令，但这个解决方案在我这有两个问题。

- 仓库的 git-lfs 没有被安装，所以 git-lfs 会直接报错
- 将整个安装源码一千多个仓库一一执行这些命令的速度太慢了

解决方案也很简单，直接检测每个 git 仓库下是否存在 `.lfsconfg` 文件，存在的话就执行 `git lfs install && git lfs pull`

```bash
repo forall -c 'test -e .lfsconfig && git lfs install && git lfs pull'
```

