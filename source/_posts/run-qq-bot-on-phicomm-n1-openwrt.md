---
title: 在运行OpenWRT的N1盒子上部署 QQBot
date: 2023-07-31 04:11:31
sticky:
execrpt:
tags:
- Linux
- Network
- QQ Bot
---

由于学校社团的招新需要，我写了一个依赖于 go-cqhttp 运行的 QQ Bot，并没有实现什么花里胡哨的功能，只是实现了关键词回复和新人入群时的欢迎语。因为没考虑后续维护的问题，代码也写得比较草，但毕竟是能跑。这么一个小型的程序并不会占用的多少的服务器资源，单独为这么一个 Bot 去开一台国内的 vps 似乎是有些大材小用了，刚好我手上有一台运行在 OpenWRT 上的 Phicomm N1 盒子，反正也是 Linux 系统，便打算拿来挂 QQ Bot。

## 安装 JDK

由于腾讯近几个月对于 Bot 风控非常严格，所以不得不采用 SignServer 项目 [fuqiuluo/unidbg-fetch-qsign](https://github.com/fuqiuluo/unidbg-fetch-qsign) 来确保 Bot 账号不会被风控一次保证 Bot 运行的稳定性。而这个项目又是使用 Java 开发的，因此需要先安装 JDK/JRE。但 OpenWRT 的开发者可能并没有考虑到在路由器设备上运行 Java 程序的需求，因此 OpenWRT 的源里面是没有预先打包 JDK 的，因此我们需要额外安装。我直接 google 搜索了 `install java on openwrt` 的关键词，在 Github 找到了这个脚本: https://gist.github.com/simonswine/64773a80e748f36615e3251234f29d1d。但很遗憾，代码跑不起来，下载时提示 404。于是我打开脚本细细一看，脚本中 jdk 的版本号和设备的架构均需要改动。具体改动如下:

```diff
- REVISION=8.212.04-r0
+ REVISION=8.302.08-r1
# 版本号请自行去仓库内翻最新的
......
- URL=http://dl-cdn.alpinelinux.org/alpine/v3.10/community/armv7/
+ URL=http://dl-cdn.alpinelinux.org/alpine/v3.14/community/aarch64/
......
- # verify packages
- sha256sum -c <<EOF
- e2fce9ee7348e9322c542206c3c3949e40690716d65e9f0e44dbbfca95d59d8c  openjdk8-8.212.04-r0.apk
- 26ad786ff1ebeeb7cd24abee10bc56211a026a2d871cf161bb309563e1fcbabc  openjdk8-jre-8.212.04-r0.apk
- 947d5f72ed2dc367c97d1429158913c9366f9c6ae01b7311dd8546b10ded8743  openjdk8-jre-base-- 8.212.04-r0.apk
- c6a65402bf0a7051c60b45e1c6a8f4277a68a8b7e807078f20db17e0233dea8e  openjdk8-jre-lib-8.212.04-r0.apk
- EOF
# 我这里直接将 sha256 校验给删除了，有兴趣可以自己去更新这几个文件的文件名和其对应的哈希值
```

随后 `chmod +x` 授予脚本可执行权限后直接执行，我们就将 alpine linux 上的 openjdk 成功解包并安装到了我们的 OpenWRT 中，我们只需要配置好环境变量即可完成安装。但我又比较懒，我看见 SignServer 的启动脚本里是可以通过读取 `$JAVA_HOME` 来获取 Java 二进制可执行文件的代码逻辑，于是我便在每次启动 SignServer 脚本前提前执行 `export JAVA_HOME=/opt/java-1.8-openjdk` 即可。

## 安装 screen

相比起前面 JDK 的安装，这一步 screen 的安装反而没有那么麻烦，[在最新版本的 OpenWRT 源中，screen 已经被包括进去了](https://openwrt.org/packages/pkgdata/screen)，我们直接把 OpenWRT 换好源，从源里就可以安装。

```bash
opkg update
opkg install screen
```

## 下载 fixed 版本的 go-cqhttp

由于 SignServer 更新，在其请求中多添加了 key 的参数要求，导致原版 go-cqhttp 的最新 release 中释出的二进制文件无法适配最新版的 SignServer，我暂时选用了一个[修复了这个问题的 fork](https://openwrt.org/packages/pkgdata/screen) 去运行 Bot。下载到 OpenWRT 后记得也要授予可执行文件。

## 安装 Python 脚本中所需要使用到的库

OpenWRT 自带了 python 和 pip，这让我很欣慰。直接使用 pip 安装 flask 和 xlrd 等库即可，完全没有难度。

## 运行 SignServer

这一步很简单，将原项目的 Release 下载下来解压后上传到 OpenWRT 的某个路径后，开个 screen 窗口，设置好 JAVA_HOME 变量后再去调用 SignServer 中自带的 shell 脚本即可

## 运行 go-cqhttp

这一步也很简单，得益于 go 静态链接的特性，我们不需要为 go-cqhttp 安装任何额外的依赖就可以执行 Release 中的二进制文件，直接将我们在 PC 上登录好的 session、配置好的 device.json、config.yml 等文件上传到 N1 ，开个 screen 窗口运行即可。

## 运行主程序

这个没什么好讲的，同样是开个 screen 窗口运行 `python main.py` 的事情

python 代码如下:

```python
from flask import Flask,request
import requests
import xlrd

# 读取 xls 中的关键词以及回应语句，将其加载到 dict 数据结构中
_data2 = xlrd.open_workbook('/root/8yue222.xls')
main_table2 = _data2.sheets()[0]
key_lst2 = main_table2.col_values(0)[1:]
value_lst2 = main_table2.col_values(1)[1:]
final_dict = dict(zip(key_lst2,value_lst2))
# 读取第二份 xls，并对相同的关键词做覆盖
_data = xlrd.open_workbook('/root/daihao.xls')
main_table = _data.sheets()[0]
key_lst = main_table.col_values(4)[1:]
key_lst = [str(int(item)) if type(item) == float else item for item in key_lst if item != '']
key_lst.remove('Gary')
value_lst = main_table.col_values(5)[1:]
value_lst = [str(int(item)) if type(item) == float else item for item in value_lst if item != '']
final_dict.update(dict(zip(key_lst,value_lst)))

app = Flask(__name__)
class API:
        @staticmethod
        def send(message):
                url = "http://127.0.0.1:5700/send_msg"
                data = request.get_json()
                params = {
                        "group_id":data['group_id'],
                        "message":message
                }
                requests.get(url,params=params)

@app.route('/', methods=["POST"])
def post_data():
    data = request.get_json()
    print(data)
    if data['post_type'] == 'message':
        message = data['message']
        messagex()
    elif data['post_type'] == 'notice' and data['notice_type'] == 'group_increase':
        welcome()
    else:
        print("忽略消息")

    return "OK"

def messagex():
        data = request.get_json()
        message = data['message'].replace('％','%')
        for key in final_dict.keys():
                if key == message:
                        API.send(final_dict[key])
                        break

def welcome():
        data = request.get_json()
        group_id = data['group_id']
        user_id = data['user_id']
        API.send("[CQ:at,qq={}] 欢迎来到浙江工业大学，精弘网络欢迎各位的到来！如果想进一步了解我们，请戳精弘首页：www.jh.zjut.edu.cn\n输入 菜单 获取精小弘机器人的菜单 哦！\n请及时修改群名片\n格式如下：姓名+专业/大类".format(user_id))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5701)
```

>  参考资料: 
>
> https://gist.github.com/simonswine/64773a80e748f36615e3251234f29d1d
>
> https://blog.csdn.net/qq_64126275/article/details/128586651
