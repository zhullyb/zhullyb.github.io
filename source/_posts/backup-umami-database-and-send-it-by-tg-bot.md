---
title: 备份 umami 数据库，并使用 TG Bot 保存 dump 文件
date: 2024-02-01 00:00:01
sticky:
execrpt:
tags:
- umami
- Shell Script
- Bot
---

前一阵子看到点墨的博客[「定时备份mysql/mariadb数据库并上传至tgbot」](https://blog.m-l.cc/2023/11/09/ding-shi-bei-fen-mysql-mariadb-shu-ju-ku-bing-shang-chuan-zhi-tgbot/)，我意识到个人站点的数据库 dump 使用 TG Bot 存放是一个非常合适的做法。个人站点的数据库体积本身就不大，TG Bot 又有官方提供的 api，非常适合自动化任务。我就寻思着给我的 umami 数据库也写个定时任务备份一下，也不至于之前做一次迁移数据全部爆炸的悲剧重演。

我的 umami 是[「使用 vercel+supabase 免费部署 umami」](/2022/11/08/free-umami-deploy-plan/)部署出来的，数据库在 supabase 上，因此我们先打开 supabase 的 dashboard，获取到数据库的 url。

![supabase 操作面板](https://bu.dusays.com/2024/01/31/65ba6aae157e6.png)

密码我自然是不记得了，不过好在 Firefox 的密码管理器帮我记住了，直接去设置里就能找到。即使密码忘了也不要紧，往下翻有重置密码的按钮。

随后就要开始编写我们的教本了，这是我的

```bash
#!/bin/bash

DATABASE_URL="postgres://"
DATE=$(date '+%F')

TG_BOT_TOKEN='1145141919:ABCDEFGHIJKLVMNOPQRSTUVWXYZabcdefgh'
TG_CHAT_ID='9191415411'

pg_dump ${DATABASE_URL} > umami_dump_${DATE}.sql
curl -F document=@umami_dump_${DATE}.sql https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument?chat_id=${TG_CHAT_ID}
rm umami_dump_${DATE}.sql
```

将这段代码保存为 `umami_db_dumper.sh`，随后 `chmod +x ./umami_db_dumper.sh` 授予可执行权限。

可以先在命令行中执行命令试一下这段脚本是否正常工作

```bash
./umami_db_dumper.sh
```

这段代码在我本机正常工作，可惜在我的 Ubuntu VPS 上报错

```
pg_dump: error: server version: 14.1; pg_dump version: 12.17 (Ubuntu 12.17-0ubuntu0.20.04.1)
pg_dump: error: aborting because of server version mismatch
```

看上去是 VPS 上的 PostgreSQL 版本过低，Google 搜索一顿后，我在一篇[「Upgrade pg_dump version in ubuntu | by Anushareddy」](https://devopsworld.medium.com/upgrade-pg-dump-version-in-ubuntu-545d691d4695) 文章中找到了方案，添加 PostgreSQL 官方提供的 apt 源将 VPS 上的 PostgreSQL 更新到新版即可解决。

```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install postgresql-client
```

确保脚本正常工作后，使用 `crontab -e` 设置自动任务

```bash
0 2 * * * /root/umami_db_dumper.sh
```

![数据库备份](https://bu.dusays.com/2024/02/10/65c79455b2e40.png)
