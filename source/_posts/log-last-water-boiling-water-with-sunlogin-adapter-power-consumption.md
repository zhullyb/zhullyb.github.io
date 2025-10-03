---
title: 使用向日葵智能插座 C2 用电记录推算宿舍上次烧水时间
date: 2024-09-24 05:17:47
sticky:
tags:
- IoT
- Python
- Hardware
- Bot
---

我宿舍里入口处有一张公用的桌子，上面有一个烧水壶。根据生活经验，当用手摸烧水壶外壳能感受到明显热量时，水壶内的水大概是两小时内烧的，绝对能喝；但如果用手摸烧水壶外壳感受不到明显热量时，水壶内的水就不知道是什么时候烧的了，可能是三小时前，也可能是三天前。此时，在不寻求外部科学仪器介入的情况下，唯一能做的是询问寝室成员上一次水是谁烧的，是什么时候烧的。但寝室成员并不总是能够及时回答，可能在睡觉，也可能不在寝室里，~~还有可能出现记忆错乱。~~

因此，**我们需要一种可靠的方案获取上一次烧水时间。**

前两天陪黄老板出门吃宵夜的时候和他提到了这个难题，我提出在烧水壶附近加装物理按钮，按动时向局域网内的 HomeServer 发送请求记录准确的烧水时间。他提出可以在烧水壶前加装智能插座，使用智能插座的耗电量来推算上一次烧水时间。这是一个可行方案，上次烧水时间不需要分钟级的精准度，**小时级的精准度在这个需求上完全够用**，这是一个更好的方案。

在「[使用 Root 后的安卓手机获取向日葵智能插座 C2 的开关 api](/2023/11/01/unveiling-sunflower-smart-adapter-api-intercepting-utilizing-api-android-packet-sniffing/)」这篇文章中，我有过抓包向日葵官方 app 的流量数据的经验，这一次直接故技重施。很可惜，我发现**用电量数据**并不能直接从局域网内向智能插座获取，**必须要从向日葵官方的服务器拉下来**。其实想想也知道，用电数据一旦精确到小时级，日积月累下来会对硬件的存储提出一定的挑战，而比较合理的方案就是由硬件向官方的服务器每小时通信一次记录下来。

![抓包](https://r2-reverse.5435486.xyz/uploads/2024/09/24/bd6b0bdbab1da.webp)

不过好消息是，**官方服务器的这个接口并没有进行鉴权**，不需要进行额外的操作，一条 curl 命令都能下载下来。

![curl 命令下载用电量数据](https://r2-reverse.5435486.xyz/uploads/2024/09/24/bf4ad72e00044.webp)

```shell
https://sl-api.oray.com/smartplug/powerconsumes/${SN}
```

SN 码也不需要自己去抓包，直接在官方应用的设备关于页面就能看到。

![关于页面](https://r2-reverse.5435486.xyz/uploads/2024/09/24/edca671f53571.webp)

json 数据的结构很明显，最外层是一个 Array，里面有若干个 object

```json
[
  {
    "consume": 0,
    "starttime": 1727125200,
    "endtime": 1727128740,
    "index": 0
  },
...
]
```

- consume: 这段时间消耗的用电量，单位 Wh
- starttime: 开始时间，unix 时间戳
- endtime: 结束时间，unix 时间戳
- index: 智能插座的第几个孔位（为插排预留的参数，智能插座只有 0 这一个位置）

所以我们要做的就是每小时下载一次这个 json 文件，需要时从 json 中寻找上一次用电量较高的小时，取那个小时的 starttime 时间戳转换为东八区人类可读的时间即可。

```python
def last_water():
    with open('power.json', 'r') as f:
        powers = json.load(f)
    for i in powers:
        if i.get('consume') >= 30:
            t = i.get('starttime')
            break
    last_water_time = datetime.datetime.fromtimestamp(t)
    now = datetime.datetime.now()
    time_delta = now - last_water_time
    sec = time_delta.total_seconds()
    hours = sec / 3600
    lwt_str = last_water_time.strftime('%m月%d日%H点')
    return f"上次烧水时间为「{lwt_str}」，距离现在「{hours:.2f}」小时"
```

至于每小时下载的任务，我这里是使用 crontab + curl 命令实现的，用 python 写个死循环跑也可以。

那么数据都取到了，剩下的就是人机交互的部分，这部分夸张点的可以写 web，写小程序，甚至写个安卓应用挂个桌面插件，想怎么做都可以。我这里就单纯将数据接入 qqbot 扔到了宿舍群，简单写了个关键词触发。

![宿舍群](https://r2-reverse.5435486.xyz/uploads/2024/09/24/1a0637d61471f.webp)
