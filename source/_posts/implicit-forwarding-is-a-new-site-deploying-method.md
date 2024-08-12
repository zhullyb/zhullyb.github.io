---
title: 隐式转发——骚套路建站方案
date: 2023-03-26 00:10:02
sticky:
execrpt:
tags:
- Network
---

其实很久以前就接触到了国内 DNS 解析服务商提供的这个「隐式 URL」 这种 “DNS 记录类型”了，但我域名没有备案，一直没有机会去体验。

![DNSPOD 的解析面板中提供的记录类型](https://cdn.zhullyb.top/uploads/2024/08/12/641f1e2cd8809.png)

今天社团内某个同学在折腾自己博客的时候又用到了「隐式 URL」，于是就借此机会了解了一下相关内容。

[DNSPOD 文档的描述](https://docs.dnspod.cn/dns/help-redirect-url/)如下

> **隐性转发**：用的是 iframe 框架技术、非重定向技术，效果为浏览器地址栏输入 `http://www.dnspod.cn` 回车，打开网站内容是目标地址 `http://cloud.tencent.com/` 的网站内容，但地址栏显示当前地址 `http://www.dnspod.cn` 。

也就是说，所谓「隐式 URL」，只不过是域名解析的服务商用他们的服务器去响应了访客的请求，并回应了一段使用了 iframe 的 html 。这段代码打开了一个大小为 100% 的窗口去请求了被“隐式代理”的站点。我这位同学域名是备案在阿里云下的，阿里云所使用的 html 代码如下:

```html
<!doctype html><html><frameset rows="100%"><frame src="http://example.com"><noframes><a href="http://example.com">Click here</a></noframes></frameset></html>
```

在下图中，我通过更改 hosts 文件实现将百度的域名在本地被解析到 localhost，并使用 iframe 标签将 b 站嵌入到页面中。当然，这并不能说明什么事情，不过是我个人的恶趣味罢了。

![example](https://cdn.zhullyb.top/uploads/2024/08/12/641f2272ab7fb.png)

将 `http://example.com`改为目标站点，我们完全可以摆脱国内云服务商，在自己的服务器上直接实现「隐式代理」的效果。

**而这种方案，恰巧可以用于在境内机子上建站，尤其是针对未备案的域名。**

碍于 Github Pages 在境内的访问体验并不好，所以直接把博客部署在 Github Pages 下一直都不是首选，因此很多人都会选择去购买一台境内的小鸡，带宽虽然不大，但跑个博客什么的其实没什么大问题，但备案就很麻烦了。

我们可以通过在 Github Pages（或者其他境外的服务器） 上挂一个 `index.html` ，html 中使用 iframe 嵌套一个部署在境内小鸡上的网页来规避掉备案的问题。而境内小鸡可以选用非标准端口去监听请求。

<img src="https://cdn.zhullyb.top/uploads/2024/08/12/642014b05bb43.png" alt="使用隐式转发" style="zoom:67%;" />

<img src="https://cdn.zhullyb.top/uploads/2024/08/12/642014519ce2a.png" alt="2.drawio.png" style="zoom:67%;" />

这样带来的好处是访客只需要从境外的服务器上获取一个不到 1 KB 大小的 html ，随后的所有请求都是指向境内云服务器的，所以网页打开时的体验会得到改善。

隐式转发拥有以下优势：

- 直接向境内的云服务器发送请求，速度会得到改善 （相比于直接部署在境外服务器上的方案）
- 不怎么消耗境外服务器的流量 （相比于使用境外服务器反向代理的方案）
- 浏览器的地址栏不会直接显示 ip 或端口号（相比于未备案使用境内服务器的非标准端口的方案）
- 不需要备案（相比于备案后使用境内服务器的 80/443 端口的方案）

但也存在以下劣势：

- 移动端设备访问时好像还是会展示 PC 端的界面（存疑
- 现代浏览器访问时可能会有 `strict-origin-when-cross-origin` 的问题（一般好像是出现在 iframe 的 html 是 https 访问，而目标站点是 http 访问的情况？）
- 一些古老的浏览器可能不支持 iframe （？
- 访问目标站点的其他路径时，浏览器地址栏的显示的地址不会变

***

那么应[某些群友的要求](https://cdn.zhullyb.top/uploads/2024/08/12/64201607999e3.png)，本文的第二作者为 [Finley](https://blog.f1nley.xyz)，通信作者为 [LanStarD](https://blog.chordvers.com/)。

