---
title: 我的博客部署方案
date: 2022-11-04 16:41:28
sticky:
execrpt:
tags:
- Network
- Github Action
- Hexo
- Blog
---

一直以来，我的博客使用的几乎都是 Hexo 框架。

静态博客的一大优点就是可以支持 Serverless 部署，这使得我们可以直接在 Github Pages、Vercel 等平台直接部署上我的博客，如果用上 `.eu.org` ~~或者非洲国家免费域名~~就可以实现零成本的博客部署。

当然，我现在的博客并非是零成本搭建的，如你所见，我购入了印度国别域名 `zhul.in` 来凑出 _竹林_ 的谐音。并在 Github Pages、Vercel 等平台的访问质量每况愈下的情况下又购入了位于香港的 VPS，这就引申出了今天的内容——介绍我博客的部署方案。

我的博客是使用 HK vps + Github Pages 两处部署实现的，通过 dnspod 免费版的域名分境内/外解析实现了分流。当境内的访客访问我的博客时，他们将会被解析到香港的 vps 上以获得更好的体验，而境外的访客将会被解析到 Github pages，毕竟 Github Pages 在境外的速度并不慢，并且稳定性肯定比我这小鸡要好得多。

不过关于通过 dns 解析分流这件事，之前看[城南旧事](https://www.cities.ee/read-1553.html)的博客中有提到可以使用境外的 GeoScaling 完成，其免费支持全球分as、城市、经纬等智能解析，也支持自编辑脚本，看起来以后可以去试一试。

![Dnspod截图](https://cdn.zhullyb.top/uploads/2024/08/12/6364d4f46ff1c.webp)

而 Hexo 框架最被人诟病的一点是更新麻烦。这一点不可否认，使用 `hexo generate` 生成静态网页文件再部署到服务器上的过程在一台新设备上是不小的工作量，它涉及 git、nodejs 的安装，涉及到 ssh key 和 rsync，整个环境的搭建就要废上不小的工夫。

在博客内容的更新方面，我选择了将整个 Hexo 的 workdir 全部上传到 github，使用 Github Action 帮助我同时完成静态页面的生成和 Github Pages 及 vps 的部署工作。具体的代码可以直接[见我的 GIthub 仓库](https://github.com/zhullyb/zhullyb.github.io/blob/master/.github/workflows/deploy.yml)，我在这里简单讲下思路。

1. 安装 nodejs

   这个没什么可说的，有现成的 Github Action 去完成这件事，我这边直接使用了`actions/setup-node@v2`。

2. 使用 npm/yarn 安装相关依赖

   这个直接跑 `yarn install` 即可。

3. 为每个文件重新设定最后修改时间

   这一步其实是挺重要的，Hexo框架生成每篇文章的最后修改时间的依据是该文件的最后修改时间，而对于 Github Action 的容器来说，每一个文件都刚刚被下载下来，都是最新的，这就会导致你的每一篇文章每次部署时都会被认为刚才修改过。

   我们这边可以直接使用 git 记录的时间来作为文件的最后修改时间。（参考 [Sea's Blog](https://mrseawave.github.io/blogs/articles/2021/01/07/ci-hexo-update-time/)）

   ```bash
   git ls-files | while read filepath; do touch -d "$(git log -1 --format='@%ct' $filepath)" "$filepath" && echo "Fixed: $filepath"; done
   ```

4. 设置时区

   读我的博客的人应该大多都是东八区的人，那我们应当把 Github Action 容器的时区设置为东八区，和自己 `git commit` 时所使用的设备的时间保持一致，否则某些文章的日期可能会发生一天的偏移。

   ```bash
   export TZ='Asia/Shanghai'
   ```

5. 生成静态网页文件

   ```bash
   yarn build
   ```

6. 部署到 Github Pages

   使用 `peaceiris/actions-gh-pages@v3`

7. 初始化 Github Action 容器上的 ssh 私钥

   应当在 Github 仓库的设置里先新建一个 secret，填入自己的 ssh 私钥（更加标准的做法应当是为 github action 专门生成一对 ssh 密钥，将公钥上传到自己的 vps，将私钥上传到 Github 仓库的 secret 中）。

   ![github secret setting](https://cdn.zhullyb.top/uploads/2024/08/12/6364dbbfeb8f6.webp)

   我这边直接从[点墨阁](https://blog.m-l.cc/2021/07/06/yong-github-actions-bu-shu-hexo/)那边抄了点代码直接用。

8. 使用 hexo 的 deploy 插件调用 rsync 将静态文件上传到自己服务器的对应目录（static server 你应当已经设置好了）

   ```bash
   yarn deploy
   ```

***

注: 本篇博客中引用的所有博客页面均在 `web.archive.org` 进行了存档，如后续遇到页面打不开的问题请自行前往查询存档。
