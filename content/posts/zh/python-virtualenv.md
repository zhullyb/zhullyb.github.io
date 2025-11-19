---
title: 虚拟Python环境
date: 2021-01-20
tags: 
      - Rom编译
      - Python
      - Linux
---

在python使用中，我们经常会遇到本地默认python版本与程序所需要的python版本不一致的问题，此时我们需要创建一个虚拟的python环境。

## 安装目标python版本

### Ubuntu系

#### 主程序

参考[https://www.cnblogs.com/m3721w/articles/10344887.html](https://www.cnblogs.com/m3721w/articles/10344887.html)

#### pip

```bash
sudo apt isntall python-pip		#python2
sudo apt isntall python3-pip	#python3
```

### Archlinux

```bash
yay -S python【xx】		#如yay -S python38
```

### 源码安装

#### 主程序:

```bash
wget https://www.python.org/ftp/python/【x.x.x】/Python-【x.x.x】.tgz
tar xzvf Python-【x.x.x】.tgz
cd Python-x.x.x
./configure
make
sudo make install
```

#### pip

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python【x.x】 get-pip.py -i  https://mirrors.bfsu.edu.cn/pypi/web/simple
pip config set global.index-url https://mirrors.bfsu.edu.cn/pypi/web/simple		#换源
```

## 安装virtualenv

### 常规发行版

```bash
pip install virtualenv			#python2
pip3 install virtualenv			#python3
```

### Archlinux

```
sudo pacman -S python2-virtualenv	#python2
sudo pacman -S python-virtualenv	#python3
```

## 使用virtualenv

### 创建virtualenv环境

#### 常规发行版

```bash
virtualenv $(TRAGET_PATH) python=python【x.x】
```

#### Archlinux

```bash
virtualenv2 $(TRAGET_PATH) python=python2.【x】		#python2
virtualenv $(TRAGET_PATH) python=python3.【x】		#python3
```

### 启用virtualenv环境

```bash
source $(TARGET_PATH)/bin/activate
```

### 退出virtualenv环境

```bash
deactivate
```

### 删除virtualenv环境

```bash
rm -rf $(TRAGET_PATH)
```

