---
title: 使用 Github Action 跑 rpmbuild
date: 2022-03-06 16:02:54
sticky:
tags:
- Fedora
- RPM Package
- Github Action
---

一直打算用 Github Action 跑 rpmbuild 构建 rpm 包，然后传到 Action 的 Artifacts 里面，用户就可以在登陆 Github 帐号的情况下进行下载。只要不发 Release，应该就不算「再分发」的行为，也就自然规避了再分发闭源软件的法律风险。

然而，现有的那些 Action 几乎全都是针对 CentOS 老古董定制的，，有些甚至连 buildrequires 都不帮你安装，而且大部分情况下都不支持 Source 直接填写一个链接，需要你直接提供 Source 文件。我自己又不可能在 Github 的仓库里用 lfs 强行存一个 200MB+ 的二进制文件，显然是不符合我要求的。还有几个项目使用 mock 去构建的，但使用 mock 构建需要提前用 rpmbuild 生成 srpm，在我们的个人电脑上可以理解为用一个干净的 chroot 打包防止自己的环境受污染，但在一个全新的、用完一次就要扔掉的 docker 里面还要防止环境被污染似乎有些画蛇添足的嫌疑。

最终，我选择了 [naveenrajm7/rpmbuild](https://github.com/marketplace/actions/rpm-build) 这个项目。（虽然我并不理解为什么他要用 nodejs 去调用系统命令去执行 rpmbuild 等一系列步骤，我也没学过这类语言。不过项目的 [main.ts](https://github.com/naveenrajm7/rpmbuild/blob/master/src/main.ts) 我还是能仿写的。）

在经过三四个小时的摸爬滚打下，我还是成功地将这个项目按照我的想法改完了。

- 采用 Fedora 35 作为 host 进行 rpmbuild
- 自动安装 buildrequires
- 自动下载 source
- 允许仓库内自带本地 source
- 移除针对 srpm 的构建

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/bb263c91c7bf4.webp)

改完后的 action 在 [zhullyb/rpmbuild-github-action](https://github.com/zhullyb/rpmbuild-github-action)，欢迎使用。

最终是在 [zhullyb/dingtalk-for-fedora](https://github.com/zhullyb/dingtalk-for-fedora) 项目成功实装了，有兴趣的访客们可以去尝试着一起来白嫖 Github Action 呀！ >_<
