---
title: 尝试体验 Fedora COPR 中的 allow SSH 功能
date: 2024-07-15 11:14:12
sticky:
execrpt:
tags:
- Fedora
- Experience
---

在今年的早些时候，我在 COPR 看到了一个新出现的名为「allow SSH」的按钮。

![](https://bu.dusays.com/2024/07/15/6694949de2921.png)

我在 COPR 的 User Documentation 中找到了对应的描述。

> Sometimes it is useful to manually debug failed builds not locally but within the Copr infrastructure. That’s why it is possible to allow SSH access to a copr builder. More information in the [SSH access to Copr builders](https://frostyx.cz/posts/ssh-access-to-copr-builders) blog post.

COPR 的这项功能允许包维护者远程访问自己没有的 CPU 架构或 Linux 发行版的 Linux 环境，大大减少打包时的痛点。

## 开始使用

尝试点击按钮，获得如下界面，可以填写自己的 ssh 公钥，最多可以选择两台设备，如果选择的设备数量大于 2，则剩下的人物会维持在 pending 状态，直到被你 ssh 连接的构建机完成对应的构建任务。

![](https://bu.dusays.com/2024/07/15/66949782e9177.png)

在该次构建的详情页面，等待 backend.log 按钮出现

![](https://bu.dusays.com/2024/07/15/6694ca668003e.png)

在这个 url 对应的文件中，我们可以找到需要的 ssh 命令

![](https://bu.dusays.com/2024/07/15/6694988c63899.png)

使用对应的 ssh 命令即可连上构建服务器

![连接成功](https://bu.dusays.com/2024/07/15/669499b25cd1b.png)

先跑个 neofetch 看看，双核 16G，看着还行。

![neofetch](https://bu.dusays.com/2024/07/15/669499b56e156.png)

随手跑了个 speedtest，竟然是千兆上下传对等的网速。

![speedtest 结果](https://bu.dusays.com/2024/07/15/6694bc062f6a3.png)

在这台机子上，我们可以使用 builder-live.log 中的命令手动触发一次构建（不过我这里跑了一半就报错了，疑似是系统不够完善）

![构建命令](https://bu.dusays.com/2024/07/15/6694b09a57e06.png)

不过很可惜，COPR 似乎并没有给我们中途去干预/调试构建过程的方案，仅仅是提供了一个可供自由操作的 Linux 环境。使用 copr-rpmbuild 命令可以进行对应的构建，但构建过程依然是在沙箱内进行，且没有给中途暂停/调试的机会。如果需要一步步手动的构建，还是建议使用 rpmbuild 命令进行。

## 杂项

- 使用 `copr-builder help` 命令可以获取打包机的提示信息
- 使用 `copr-builder show` 命令查看剩余时间
- 使用 `copr-builder prolong` 可以延长打包机的有效时长
- 使用 `copr-builder release` 可以销毁当前的打包机环境

## 限制

- 由于安全原因，构建结束后，只有 spec 文件和日志可以被存储到 copr 对应项目的服务器。打包机会使用一个独特的沙箱防止其构建产物被二次使用，哪怕是同一个用户都不行。
- 为了避免资源艾琳娜贵妃，同一用户在同一时刻最多只能使用两台具有 ssh 访问权限的打包机。
- 由于上面的两套规定，当 copr 构建失败时并不能自动启动 SSH 访问权限，需要用户手动在面板上 resubmit 当前任务并选择使用 SSH 访问权限。
- 打包机在默认情况下 1 小时后自动销毁，除非你手动申请延长时间，最长为 48 小时。
- 有些打包机只有 IPv6 的访问地址，你没得选。如果你无法连接 IPv6 网络，你可以取消当前的任务并重新发布并期待能给你下发一台具有 IPv4 访问地址的打包机（其实非常少），或者使用代理。
- 如果 SRPM 构建失败，则不能 resubmit 当前任务。这是 COPR 的实现逻辑问题，未来可能得到改善。

## 参考

[「SSH access to Copr builders」](https://frostyx.cz/posts/ssh-access-to-copr-builders)
