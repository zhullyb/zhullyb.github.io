---
title:      在Windows下给cmd设置代理
date:       2020-03-03
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

