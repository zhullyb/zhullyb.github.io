---
title:      使用Chrome的同步api为chromium开启同步功能
date:       2021-04-15
tags:
- 笔记
---

今年两三月的时候，Google限制了chromium的同步api次数，导致各个发行版内置的chromium将不再能继续使用Google的数据同步功能。

今天在翻 archlinuxcn 的群组的时候翻到了一段脚本: [https://gist.github.com/foutrelis/14e339596b89813aa9c37fd1b4e5d9d5](https://gist.github.com/foutrelis/14e339596b89813aa9c37fd1b4e5d9d5)

大意就是说，由于Archlinux特殊的chromium启动方式导致我们可以在设置`oauth2-client-id`和`oauth2-client-secret`的情况下通过chrome的同步api继续使用Google的同步服务，说得太多了也没必要，毕竟原文就在那里，看不看取决于你，我这里直接给命令吧。

```shell
echo "--oauth2-client-id=77185425430.apps.googleusercontent.com
--oauth2-client-secret=OTJgUOQcT7lO7GsGZq2G4IlT" >> ~/.config/chromium-flags.conf
```

再次打开chromium,你就会发现你心心念念的同步功能回来了。

![](https://static.031130.xyz/uploads/2024/08/12/62f3cafe4a5ec.webp)

~~然而，并不是所有的发行版都像 Archlinux 这样考虑到 oauth，我们也不可能像 Archlinux 官方那样有这个闲情雅致为没一个 Chromium 去添加这个 [patch](https://github.com/archlinux/svntogit-packages/blob/packages/chromium/trunk/use-oauth2-client-switches-as-default.patch) 以后重新编译一遍，大部分人都是直接用发行版源里的。针对这种情况，我们可以直接手写一个脚本~~

```bash
#!/usr/bin/bash
export GOOGLE_DEFAULT_CLIENT_ID=77185425430.apps.googleusercontent.com
export GOOGLE_DEFAULT_CLIENT_SECRET=OTJgUOQcT7lO7GsGZq2G4IlT
exec /usr/bin/chromium-browser "$@"		# 我用的 Fedora 的启动命令是 chromium-browser，别的发行版用户还请自行调整
```

当我满心欢喜地把脚本扔进 `$HOME/.local/bin` 后，我却突然发现 Fedora 官方源中把 chromium 的启动命令写死在了 `/usr/bin/chromium-browser`，如果直接去改 `/usr/bin/chromium-browser` 的话，每次更新都会被覆盖。

**正确的做法**应该是把 desktop 文件复制一份到桌面，再去改内容。

```bash
mkdir -p $HOME/.local/share/applications/
cp /usr/share/applications/chromium-browser.desktop $HOME/.local/share/applications/
sed -i "s|/usr/bin/chromium-browser|GOOGLE_DEFAULT_CLIENT_ID=77185425430.apps.googleusercontent.com GOOGLE_DEFAULT_CLIENT_SECRET=OTJgUOQcT7lO7GsGZq2G4IlT /usr/bin/chromium-browser|g" $HOME/.local/share/applications/chromium-browser.desktop
```

