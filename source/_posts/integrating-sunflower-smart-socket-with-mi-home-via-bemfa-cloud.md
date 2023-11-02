---
title: 通过巴法云将向日葵智能插座接入米家，实现小爱同学远程控制
date: 2023-11-02 10:17:02
sticky:
execrpt:
tags:
- IoT
- MiAI
- NetWork
- Linux
- Python
- Hardware
- Fun
---

在[上一篇博客](/2023/11/01/unveiling-sunflower-smart-adapter-api-intercepting-utilizing-api-android-packet-sniffing/)中，我们介绍了如何在本地局域网中通过发送 http 请求控制向日葵智能插座 C2 的开关状态。但这还远远不够，我自己是小米生态链的忠实用户，在宿舍里也接入了四五个米家的智能设备，因此我想把这个智能插座接入米家，实现离家时一键关闭。

在阅读[小米IoT开发者平台](https://iot.mi.com/)的接入文档后，我发现米家对于个人开发者并不友好，接入文档大部分要完成企业认证以后才能实现。在谷歌一番搜索过后，我发现了通过假设 Home Assistant 后通过巴法云接入米家的方案。但我眼下就这一个非米家的智能家具，暂时还不想去碰 Home Assistant 那套体系。

因此我便找上了[巴法云](https://cloud.bemfa.com/)。在巴法云的官网中提到，他们是「专注物联网设备接入&一站式解决方案」，对于个人开发者，目前平台免费使用。网站的文档虽然并不优雅美观，却透露出实用主义的气息，针对接入提供了 TCP 长连接和 MQTT 两种方案，看着就很适合实现我的需求。

在巴法云文档中的「[五分钟入门](https://cloud.bemfa.com/docs/#/?id=_21-%e8%ae%a2%e9%98%85%e5%8f%91%e5%b8%83%e6%a8%a1%e5%bc%8f)」那一栏介绍了远程控制的业务逻辑:

> 如果单片机订阅了一个主题，手机往这个主题推送个消息指令，单片机由于订阅了这个主题，就可以收到发往这个主题的消息，就可以达到手机控制单片机的目的。

所以我需要在巴法云的控制台创建一个针对于智能插座的主题，让我局域网内的一台设备订阅这个主题。接入米家以后，米家需要控制向日葵的智能插座时就向巴法云的这个主题推送一条消息，局域网内的设备就能接收到推送消息，进而调用智能插座的 api 实现远程开关。在这里，我选择使用一台刷了 Armbian 的 N1 作为局域网内的转发器。整个控制流程看上去是下面这个样子:

![控制流程图](https://bu.dusays.com/2023/11/02/65430fbf56dee.png)

我并不知道 tcp 长连接的数据传输应该如何实现，但看起来 MQTT 是一个比较成熟的协议，因此我选择使用 MQTT 作为巴法云和 N1 之间的通讯协议。

在巴法云的控制台，选择 MQTT 设备云，创建一个新的主题，注意需要以 001~009 结尾，否则在米家里看不见创建的这个主题。

> > 当主题名字后三位是001时为插座设备。
>
> > 当主题名字后三位是002时为灯泡设备。
>
> > 当主题名字后三位是003时为风扇设备。
>
> > 当主题名字后三位是004时为传感器设备。
>
> > 当主题名字后三位是005时为空调设备。
>
> > 当主题名字后三位是006时为开关设备。
>
> > 当主题名字后三位是009时为窗帘设备。
>
> 当主题名字为其他时，默认为普通主题节点，不会同步到米家。

![创建新主题](https://bu.dusays.com/2023/11/02/654310bb3133b.png)

此时，我便可以在手机的米家中找到巴法云并接入这个插座。

![米家找连接巴法云](https://bu.dusays.com/2023/11/02/654312974e393.png)

至此，米家那边的接入已经完成了，虽然没法在米家中找到对应设备的卡片，但是可以在小爱同学的小爱训练计划中找到对应的设备。

我们还需要让本地的 N1 盒子使用 MQTT 协议订阅巴法云的消息。

参考代码如下:

```python
#!/usr/bin/python3

import paho.mqtt.client as mqtt
import requests

# 智能插座相关
host = ''
sn = ''
key = ''
time = ''

# 巴法云相关
client_id = ''
theme = ''

def set_adapter_status(status: bool):
    url = 'http://' + host + '/plug'
    requests.get(url, params={
        "status": 1 if status else 0,
        "sn": sn,
        "key": key,
        "_api": "set_plug_status",
        "time": time,
        "index": 0
    })

def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code:" + str(rc))

def on_message(client, userdata, msg):
    if msg.payload.decode("utf-8") == 'on':
        set_adapter_status(True)
    elif msg.payload.decode("utf-8") == 'off':
        set_adapter_status(False)

def on_subscribe(client, userdata, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))
    
client = mqtt.Client(client_id=client_id, clean_session=False, protocol=mqtt.MQTTv311)
client.on_connect = on_connect
client.on_message = on_message
client.on_subscribe = on_subscribe

client.connect("bemfa.com", 9501, 60)
client.subscribe(theme, qos=1)
client.loop_forever()
```

## 参考链接

- [巴法开放平台](https://cloud.bemfa.com/docs/#/)

- [Python MQTT客户端  paho-mqtt](https://www.cnblogs.com/Mickey-7/p/17402095.html)
- [Python MQTT 客户端对比](https://www.emqx.com/zh/blog/comparision-of-python-mqtt-client)
