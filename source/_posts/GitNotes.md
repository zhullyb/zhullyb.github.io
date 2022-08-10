---
title: git笔记
date: 2020-07-11
tags: 
      - Linux
      - 笔记 
---


### git自动填入账号密码

打开终端，输入

```shell
git config --global credential.helper store
```
此时，我们就已经开启了git账号密码的本地储存，在下一次push时只要输入账号密码就可以一劳永逸了。

### git设置默认的commit编辑器

```shell
git config --global core.editor $editor_name
```

Ps: $editor_name指的是你选用的编辑器，一般为nano、vim等

### pick一个仓库中连续的几个commit

```shell
git cherry-pick <commit1_id..^<cimmitn_id
```

Ps: <commit1_id和<commitn_id分别指第一个你想要pick的commit_id和最后一个你想要pick的commit_id

### pick失败时如何撤销此次pick

```shell
git cherry-pick --abort
```

## 踩坑记录

发生背景：

clone了一个内核仓库，大概是1.4G左右的大小，在github新建了一个repository，打算push上去，报错如下

```shell
[zhullyb@Archlinux sdm845]$ git push -u origin master
Enumerating objects: 5724101, done.
Counting objects: 100% (5724101/5724101), done.
Delta compression using up to 4 threads
Compressing objects: 100% (983226/983226), done.
Writing objects: 100% (5724101/5724101), 1.34 GiB | 2.46 MiB/s, done.
Total 5724101 (delta 4693465), reused 5723950 (delta 4693375), pack-reused 0
error: RPC failed; curl 92 HTTP/2 stream 0 was not closed cleanly: INTERNAL_ERROR (err 2)
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
Everything up-to-date
```

搜索互联网，最终使用的解决方案

```shell
git config http.version HTTP/1.1		#原文中加了--global，不过我就临时遇到这种情况，不考虑加
```

最终应该可以使用如下命令设置回来

```
git config http.version HTTP/2
```

