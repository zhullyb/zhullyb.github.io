---
title: 如何解决adb未授权的问题
date: 2021-01-25
tags: 
      - Android
      - Linux
      - Rom编译
---

在调试安卓设备的时候，我们经常会遇到adb未授权的问题，本方案适用于未开机时遇到以下两种情况。

1. 当我们编译eng的时候，adb应该会默认授权所有设备，但是有部分Rom并不会。

2. 当我们编译userdebug的时候，adb就不会授权给所有设备了，如果卡开机，使用adb抓取log将会是非常麻烦的事情。

此时我们需要手动导入我们的adbkey

1. 手机重启到Recovery模式

2. 找到你电脑的adbkey公钥，一般叫做```adbkey.pub```

3. 
   ```bash
   adb push ${the/location/to/your/key} /data/misc/adb/adb_keys
   ```

   比如我就是

   ```bash
   adb push ~/.android/adbkey.pub /data/misc/adb/adb_keys
   ```

4. 重启手机，~~愉快~~苦逼地去抓log
