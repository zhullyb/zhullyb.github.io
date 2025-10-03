---
title: 为 Element 添加自己喜欢的贴纸
date: 2022-08-10 19:51:19
sticky:
tags:
---



> 在读这篇文章之前，你应该已经知道 element、matrix 是什么，这部分内容咱就不过多展开讲了。

## 需要准备的

- PC 端 element
- python3.6+ 环境
- 能够挂静态资源的站点（比如 Github Pages、Gitlab Pages、Vercel 等免费平台的账号）
- 可能需要能够突破大局域网限制的网络环境

需要用到的项目 [maunium/stickerpicker](https://github.com/maunium/stickerpicker)

## 克隆主项目

```bash
git clone https://github.com/maunium/stickerpicker.git && cd stickerpicker
```

## 使用 pip 安装依赖

其实本来想直接用包管理去安装这个项目的依赖的，可惜我看了一眼依赖列表，有整整一半的依赖没有被 Fedora 打包，所以干脆就直接用 pip 安装算了。

```bash
pip install .
```

## 选择一：将本地图片制成贴纸包

在项目根目录下创新一个新的目录。

```bash
mkdir <pack directory>
```

将需要的图片放入其中。如果需要排序，可以在图片的文件名最前面加上数字标号。

执行命令进行打包

```bash
sticker-pack <pack directory> --add-to-index web/packs/
```

如果想要给目录贴纸包命名，则可以追加`--title <custom title>`，否则将直接设置为目录名

## 选择二：从 tg 获取现成的贴纸包

项目内已经为我们准备了 ```sticker-import``` 命令来帮助我们直接从 tg 获取表情包，那我们直接收下

```bash
sticker-import <pack_url>
```

第一次使用时，会要求我们登陆 matrix 和 tg 账号

matrix 的 `homeserver` 和 `access token` 可以在 PC 端 element 的设置里找到

![element 在 pc 端上而设置界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4dab8c7647.webp)

tg 登陆时需要你输入手机号码，或者某一个 tg bot 的 token，这个大家都懂。

运行完成后，贴纸包就被上传到了你所使用的 matrix homeserver 上。

***

接着我们需要做的事情就是将 `web` 文件夹部署到 github pages 等做成静态站点，这个比较简单，不再赘述，我这里直接部署在了 `https://matrix-sticker.zhullyb.top` 我们下文就直接拿它做演示，看得上的也可以直接拿来用。另外，[@朝色](https://blog.zhaose.cyou/) 的 url 也可以直接拿来使用 `https://sticker.zhaose.cyou/web/`

## 添加到 element

这是本篇文章最吊诡的地方，element 其实并没有为我们准备这么一个添加自定义 sticker 的地方，从某种意义上讲，我们是把我们的 sticker 给 hack 进去。

在 element 的 pc 端找到任意一个对话框，输入 `/devtools` 并发送

![如图](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4f4d55f4d3.webp)

将会出现如下页面，选择 `Explore account data`

![1660220693791.png](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4f5179fd73.webp)

找到 `m.widgets`，如果没有，就点击下图标出的按钮

![1660220786171.png](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4f57459b6f.webp)

在新的页面中，填写如下内容，url 那一行应当改为自己部署的页面，并发送请求

```json
{
    "stickerpicker": {
        "content": {
            "type": "m.stickerpicker",
            "url": "https://matrix-sticker.zhullyb.top/?theme=$theme",
            "name": "Stickerpicker",
            "data": {}
        },
        "sender": "@you:matrix.server.name",
        "state_key": "stickerpicker",
        "type": "m.widget",
        "id": "stickerpicker"
    }
}
```

![发送请求](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4f6d9e120e.webp)

重启 element，此时就可以享受到自己导入的 sticker 了，手机端的 element 设置也将会被同步。

补一张效果图

![效果图](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f4f7728b1e6.webp)
