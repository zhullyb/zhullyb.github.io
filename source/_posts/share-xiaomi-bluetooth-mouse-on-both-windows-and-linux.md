---
title: 在Windows与Linux双系统下共享蓝牙鼠标
date: 2021-05-30
tags: 
      - Linux
      - Archlinux
      - Windows
---

 我自己使用的鼠标是一只[小米的无线蓝牙双模鼠标](https://www.mi.com/mouse)。但是由于我的USB接口不是很充裕，我平时还是蓝牙鼠标用的比较多。

 但是，每当我在Windows和Archlinux上切换时，我不得不重新配对我的蓝牙鼠标。原因我在翻译Archwiki上关于蓝牙鼠标相关叙述时已经解释得非常清楚了，我摘在下面：

 “首先，计算机保存蓝牙设备的 MAC 地址和配对密钥；然后，蓝牙设备保存计算机的 MAC 地址和配对密钥。这两步通常不会有问题，不过设备蓝牙端口的 MAC 地址在 Linux 和 Windows 上都是相同的 (这在硬件层面上就设定好了)。然而，当在 Windows 或 Linux  中重新配对设备时，它会生成一个新密钥，覆盖了蓝牙设备之前保存的密钥，即与 Windows 配对产生的密钥会覆盖原先与 Linux  配对的密钥，反之亦然。“

先在Linux上连接蓝牙鼠标，再重启到Windows重新配对蓝牙蓝牙鼠标。

到[微软官网](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec)下载`PsExec.zip`，解压后，记住你所解压的路径。

在Windows中，使用管理员权限打开`cmd.exe`

![在Windows下使用管理员权限打开cmd](https://bu.dusays.com/2022/08/10/62f3cb081565a.webp)

cd到PsExec解压目录，使用如下命令将我们所需要的蓝牙密钥信息保存到C盘根目录下。

```cmd
psexec.exe -s -i regedit /e C:\BTKeys.reg HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services\BTHPORT\Parameters\Keys
```

![使用psexec获取蓝牙信息](https://bu.dusays.com/2022/08/10/62f3cb0aae88f.webp)

根目录的BTkeys.reg可以直接用记事本打开，内容大概是下面这个样子

![BTkeys.reg](https://bu.dusays.com/2022/08/10/62f3cb0d9e04f.webp)

 为了方便后面的解说，我用各种颜色标注了起来。

在Linux下获取su权限以后，我们需要将Linux下随机分配给鼠标的蓝牙地址改成在Windows上获取的那个地址。上图中「红部分」划出来的就是Windows下获取的地址。

```bash
[zhullyb@Archlinux ~]$ su
Password: 
[root@Archlinux zhullyb]# cd /var/lib/bluetooth/E0\:94\:67\:74\:0D\:5F/
[root@Archlinux E0:94:67:74:0D:5F]# ls
C6:2A:1B:33:2E:71  cache  settings
[root@Archlinux E0:94:67:74:0D:5F]# mv C6\:2A\:1B\:33\:2E\:71/ C4\:F6\:B3\:2C\:BD\:7E
```

再编辑`/var/lib/bluetooth/<本机蓝牙地址/<鼠标蓝牙地址/info`

原文件如下：

```
[General]
Name=MiMouse
Appearance=0x03c2
AddressType=static
SupportedTechnologies=LE;
Trusted=true
Blocked=false
WakeAllowed=true
Services=00001530-1212-efde-1523-785feabcd123;00001800-0000-1000-8000-00805f9b34fb;00001801-0000-1000-8000-00805f9b34fb;0000180a-0000-1000-8000-00805f9b34fb;0000180f-0000-1000-8000-00805f9b34fb;00001812-0000-1000-8000-00805f9b34fb;

[IdentityResolvingKey]
Key=067764BF59A7531E978AFDC6BB5EC8E1

[LongTermKey]
Key=E3C49B4F3256018192942EB0CDDEE6A3
Authenticated=0
EncSize=16
EDiv=28209
Rand=15970850852728832717

[DeviceID]
Source=2
Vendor=10007
Product=64
Version=40

[ConnectionParameters]
MinInterval=6
MaxInterval=9
Latency=100
Timeout=600
```

- 「黄色部分」`LTK` 对应 `LongTermKey` 下的 `Key`，把小写转换成大写并删去逗号即可。
- 「绿色部分」`ERand` 对应 `Rand`。这里比较特殊的是，我们必须先将 Windows 中的值倒转过来再转换为 10 进制。即`c2,83,7f,8f,7c,76,b4,02`-`02,b4,76,7c,8f,7f,83,c2`-`194910961239294914`
- 「蓝色部分」`EDIV` 对应 `EDiv`。把 16 进制转换成 10 进制即可，这里就不用倒转了。

具体的转换方法我不再赘述，我把我的转换过程放在下面，我相信各位读者能够看懂。

```bash
[zhullyb@Archlinux ~]$ echo 'e3,c0,b2,8e,64,2b,12,16,d8,c2,d7,d4,59,55,92,cd' | tr a-z A-Z | sed 's/[[:punct:]]//g'
E3C0B28E642B1216D8C2D7D4595592CD
[zhullyb@Archlinux ~]$ echo $((16#02B4767C8F7F83C2))	#这里我是手动倒叙的
194910961239294914
[zhullyb@Archlinux ~]$ echo $((16#000055a3))
21923
```

做完这些操作以后，`sudo systemctl start bluetooth`即可
