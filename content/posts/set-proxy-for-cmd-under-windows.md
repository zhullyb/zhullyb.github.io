---
title:      在Windows下给cmd设置代理
date:       2020-03-03
description: 本文将详细介绍如何在Windows系统下为命令行（cmd）和Git配置代理，帮助用户解决网络访问限制问题。内容涵盖两种常见代理工具（ShadowsocksR和v2ray）的具体设置方法，包括代理端口配置及环境变量设置步骤。无论您是开发者还是普通用户，都能通过本指南快速实现网络代理，提升工作效率和访问体验。适合Windows用户、网络管理初学者及需要代理设置的技术爱好者参考。
tags:
    - Windows
    - Network
---


## cmd打开方法
按住```win```+```R```键，调出一个运行框，接着输入```cmd```并回车即可
## 设置cmd代理
一般性使用的如果是ShadowsockR的话，代理端口都是1080，v2ray的话则是10808

#### ShadowsocksR

```powershell
set http_proxy=http://127.0.0.1:1080
set https_proxy=http://127.0.0.1:1080
```
#### v2ray

```powershell
set http_proxy=http://127.0.0.1:10808
set https_proxy=http://127.0.0.1:10808
```

## 为git设置代理

#### ShadowsocksR

```powershell
git config --global http.proxy http://127.0.0.1:1080
git config --global https.proxy http://127.0.0.1:1080
```

#### v2ray

```powershell
git config --global http.proxy http://127.0.0.1:10808
git config --global https.proxy http://127.0.0.1:10808
```

