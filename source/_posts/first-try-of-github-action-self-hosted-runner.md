---
title: 初试 Github Action Self-hosted Runner，想说爱你不容易
date: 2025-09-05 05:54:17
sticky:
tags:
- Github
- Github Action
- CI/CD
- Experience
---

在今年八月的时候，我这边所在的一个 Github Organization 在私有项目开发阶段频繁触发 CI，耗尽了 Github 为免费计划 (Free Plan) 提供的[每月 2000 分钟 Action 额度](https://docs.github.com/en/get-started/learning-about-github/githubs-plans#github-free-for-organizations)（所有私有仓库共享，公有仓库不计）。大致看了下，CI 流设置得是合理的，那么就要另寻他法看看有没有办法去提供更宽裕的资源，因此也就盯上了文章标题中所提到的 [Github Action Self-hosted Runner](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners)。

对于这个 Self-hosted Runner，与 Github 官方提供的 runner 相比，主要有以下几个优势

- 针对私有仓库，拥有无限制的 Action 运行时长
- 可以自行搭配更强大的硬件计算能力和内存
- 可以接入内网环境，方便与内网/局域网设备通信

## 配置安装

由于不清楚需要的网络环境，我这次测试直接选用了一台闲置的香港 vps，4核4G + 80G 硬盘 + 1Gbps 大口子的配置，除了硬盘读写稍微拉胯一些，别的地方可以说是拉满了。

Self-hosted Runner 的配置本身是相当直接和清晰的，照着官方提供的方案基本没什么问题。

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/7c0475cdb1aa9.webp)

三个主流平台都有，如果好好加以利用，应该可以涵盖包括 iPhone 应用打包等一系列的需求。

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/96ff7cb263da1.webp)

在观察一下我这边拿到手的 2.328.0 版本的 runner 安装文件压缩包的体积在 220MB 左右，内置了 node20 和 node24 各两个版本的运行环境。

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/f775e3bcd2cdc.webp)

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/d0d4fe4611a40.webp)

在执行完 config.sh 后，当前目录下就会多出一个 svc.sh，可以帮助利用这东西来调用 systemd 实现进程守护之类的需求。

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/43c6b19038def.webp)

再次刷新网页，就可以看到 Self-hosted Runner 处于已经上线的状态了

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/6dad15beff900.webp)

## 指定 Action 采用自己的 Runner

这一步很简单，只需在原 Action 的 yml 文件中改变 runs-on 字段即可

```diff
jobs:
  run:
+    runs-on: self-hosted
-    runs-on: ubuntu-latest
```

## 实测

当我满心欢喜地将 CI 流程从 Github 官方的 runner 切换到自托管的 runner 后，问题很快就浮现了，而这也正是我“爱不起来”的主要原因。问题集中体现在我习以为常的 `setup-python` 这一由 Github 官方维护的 Github Action Flow 中，提示 3.12 版本没找到。

![](https://r2-reverse.5435486.xyz/uploads/2025/09/05/1c93947170a85.webp)

在 Github 官方提供的虚拟环境中，这些 Action 会为我们准备好指定版本的开发环境。例如，`uses: actions/setup-python` 加上 `with: python-version: '3.12'` 就会自动在环境中安装并配置好 Python 3.12.x。我对此已经习以为常，认为这是一个“开箱即用”的功能。但在 Self-hosted Runner 上，情况略有些不同。setup-python 在[文档](https://github.com/actions/setup-python/blob/main/docs/advanced-usage.md#using-setup-python-with-a-self-hosted-runner)中指出

> Python distributions are only available for the same [environments](https://github.com/actions/runner-images#available-images) that GitHub Actions hosted environments are available for. If you are using an unsupported version of Ubuntu such as `19.04` or another Linux distribution such as Fedora, `setup-python` may not work.

setup-python 这个 Action **只支持 Github Action 所采用的同款操作系统**，而我 VPS 的 Debian 不受支持，因此有这个误报，同时也给我的 Debian 判了死刑。

## 症结所在：对 Self-hosted Runner 的误解

我潜意识里认为，Self-hosted Runner 仅仅是将计算成本从 Github 服务器转移到了本地，而 `actions/setup-python` 这种官方标准动作，理应会像 Github-hosted Runner 中那样，优雅地为我下载、安装、并配置好我需要的一切。然而，**Self-hosted  Runner 的本质只是从 Github 接收任务，并在当前的操作系统环境中执行指令**，并不保证和 Github 官方提供的 Runner 的运行环境一致。

Self-hosted Runner 不是一个开箱即用的“服务”，而是**一个需要你亲自管理的“基础设施”**。你需要负责服务器的安装、配置、安全更新、依赖管理、磁盘清理等一系列运维工作。它更适合那些对 CI/CD 有更高阶需求的团队或个人：比如 CI/CD 消费大户、需要特定硬件（如 ARM、GPU）进行构建的团队、或者 CI 流程深度依赖内部网络资源的企业。对于像我这样只是愿意拿出更多的本地计算资源来获取更多 Action 运行时长的普通开发者而言，它带来的运维心智负担，似乎是有一点重了。
