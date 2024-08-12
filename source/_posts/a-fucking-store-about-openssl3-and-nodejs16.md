---
title: nodejs16：是我配不上 openssl 3 咯？
date: 2022-08-04 17:31:49
sticky:
tags:
- Fedora
- nodejs
- openssl
---

![长毛象的截图.png](https://cdn.zhullyb.top/uploads/2024/08/12/62eba4eabc963.webp)

今年上半年升级 Fedora 36 的时候遇到了这个问题。

那会儿很无奈，一直在等 nodejs16 合并提供 `--openssl-legacy-provider` 的[那个 PR](https://github.com/nodejs/node/pull/42972)。nodejs16 是一个 lts 版本，照道理来说，既然要提供 Long-term Support，而 openssl 1 作为它的依赖之一，生命周期结束又在 nodejs16 之前，那是不是应该给 nodejs16 backport 在 nodejs17 上实现的 `--openssl-legacy-provider` 参数选项呢？否则绝大多数发行版都会在 openssl 1 的生命周期结束之前切换到 openssl 3，那 nodejs16 不就没法用了嘛。

然而，nodejs 在他们的官网上发布的[一篇博客](https://nodejs.org/en/blog/announcements/nodejs16-eol/)刷新了我的世界观，而此前的那个 PR 甚至一度被关停。（此处有[寒晶雪提供的中文翻译](https://whiteboard-ui8.pages.dev/translation/nodejs-eol-v16-0626/)）

博客称他们将会把 nodejs16 的生命周期结束时间提前以防止 openssl 1 生命周期在 nodejs16 生命周期结束之前结束（这种做法甚至还有先例）

很无奈，那会儿有两个 npm 管理的软件没法在 Fedora 36 上编译出来，就一直搁置了下去。

***

不过好在，事情还是有转机的。（要不然就这档子鸡毛蒜皮的小事我也不会专门去写篇博客出来）

前几天我给 [atpoossfl 仓库](https://github.com/atpoossfl/repo)打了 rpm 版本的 nvm 以后，意外地发现 nvm 所提供的 nodejs 会自带 openssl。

![此为 nvm 安装的 nodejs14 目录](https://cdn.zhullyb.top/uploads/2024/08/12/62ebadf02a5b3.webp)

所以我们只需要使用 nvm 安装的 nodejs16 即可解决 Fedora36 以后没有 openssl 1 的问题。

> 使用 Fedora 的用户需要注意，Fedora 官方源中的`yarnpkg`在打包时遇到了错误，他们将 `/usr/lib/node_modules/yarn/bin/yarn.js` 的 shebang 给改成了 `#!/usr/bin/node`，应当改回 `#!/usr/bin/env node`才能让 yarn 正常使用上 nvm 提供的 nodejs；或者干脆添加 [dl.yarnpkg.com](https://dl.yarnpkg.com/rpm/yarn.repo) 提供的 `yarn` 软件包。在写 specfile 的 `BuildRequires` 时，可以直接写成 `/usr/bin/yarn` 来避免频繁在 `yarn` 和 `yarnpkg` 这两个包名间改动。

***

更好的消息是，nodejs 已经在 `v16.17.0-proposal` 和 `v16.x-staging` 分支收下了这个为 nodejs16 提供 `--openssl-legacy-provider` 的 [commit](https://github.com/nodejs/node/commit/e7b99e8c8d229ee2cc1d657ae44f715e7e5f852f)。相信在不久的将来，这个 commit 将会进入主线，并在 `v16.17` 版本的 nodejs16 上发挥它的作用。

![commit](https://cdn.zhullyb.top/uploads/2024/08/12/62ebb0927943f.webp)



