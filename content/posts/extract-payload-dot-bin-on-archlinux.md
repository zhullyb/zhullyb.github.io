---
title: 在Archlinux上解包A/B机型的payload.bin
date: 2021-02-07
tags: 
      - Android
      - Archlinux
      - Rom编译
      - Python
---


解包A/B机型的OTA更新包时，会发现zip文件中只有一个payload.bin文件

解包这个文件，我们需要用到这个叫[payload_dumper](https://github.com/vm03/payload_dumper/blob/master/payload_dumper.py)的python脚本，同时需要安装依赖: ```community/python-google-api-core```和```python-bsdiff4```，我解包的时候发现缺少python3版本的python-bsdiff4，因此已经打包上传至[AUR](https://aur.archlinux.org/packages/python-bsdiff4)

```bash
git clone https://github.com/vm03/payload_dumper.git
cd payload_dumper
mv path/to/payload.bin payload_dumper
python payload_dumper.py payload.bin
```

然后就可以在该项目文件夹的output路径下找到解包后的img镜像