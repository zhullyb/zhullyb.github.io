---
title: 基于 Cloudflare Workers 实现的在线服务状态检测告警系统
date: 2025-01-18 02:00:08
sticky:
tags:
- Cloudflare
- JavaScript
- crontab
- Network
---

## 起因

受一些客观因素的影响，微精弘前一阵子针对学校教务系统的数据爬取服务状态出现了非常不稳定的状态，而后端在设计初并没有考虑到异常告警机制，恰逢现任员工都身陷期末周的痛苦之中，我这种计院 Lite 专业的精弘老人就打算实现一个针对「**微精弘主后端 <->  funnel 爬虫服务 <-> 教务系统**」这一条链路的告警机制。旨在短期内（即期末周结束之前）填补微精弘的后端服务告警机制的空白，让运维人员能够及时收到并处理排查后端网络链路的异常情况，尽最大努力保证服务在线率，保障工大本科生在期末周内使用体验。

## 需求分析

![微精弘的技术架构图](https://static.031130.xyz/uploads/2025/01/19/74362573e371d.webp)

> 如果你不知道微精弘的具体架构实现，这里有一篇由前技术总监提笔并由现任技术总监完善的架构杂谈「[微精弘 | 架构杂谈](https://mp.weixin.qq.com/s/8d6JAPsLa4TzLr50uDG8uw)」，原文最初发表于前者的[博客](https://blog.cnpatrickstar.com/posts/wejh-architecture/)。

基于上述客观条件以及我个人在服务监控告警领域近乎为 0 的经验，我一拍脑袋提出了以下几点需求：

1. 稳定性。告警服务本身必须要比我们的主后端更加稳定，这是告警服务的基础。
2. 针对现有服务的侵入性低。告警服务不能影响到现有服务，最好能够完全分离开来，不应当部署在同一台服务器上。
3. 开发快速。整个服务需要尽快落地，因为现有的服务在一周内出现了三次故障，且由于主动的监控告警机制的缺失，我们每次都要等服务 down 机的两小时后才意识到服务挂掉了，如果真在考试周这个使用高峰期内再出现这样的故障不容允许的（用户需要查询考场信息）。
4. 尽可能低的运维成本。没什么好解释的，谁也不希望一个告警服务占用太多的运维成本，无论是人力上的还是资源上的。

## 技术选型

结合我已有的经验，我选用了 **Cloudflare Worker** 来完成这个任务。Cloudflare Workers 本身是支持 **cron job** 的，能够以分钟级为单位的间隔对服务进行主动探测。Cloudflare 每天都有 10w 次免费的 Workers 调用额度，本身的服务在线率也过硬，唯一的缺点可能就是海外节点访问国内服务器的延迟过高了。不过考虑到我们探测的是在线情况而非延迟情况，倒也不是不能接受。

由于服务特性的关系，我们容许一定的访问失败概率。比如五次访问中如果有两三次失败，我们也认为线路是通的，~~可能只是教务系统的土豆快熟了~~。因此并不是每一次失败的探测都需要进行告警。另外，我们还需要记录当前的服务状态，一旦服务被认定为下线状态，后续探测失败我们就不再进行告警，直到我们重新判定服务状态为上线（即每段连续的下线时间都只触发一次告警）。Cloudflare Worker 是一种 serverless 服务，且每次执行探测任务的可能都不是同一个 Cloudflare 的边缘节点，因此我们没法使用变量在内存中记录目前的服务状态，需要引入外部数据库来完成短期内的数据存储。

在数据库上，我们必须选择 Cloudflare 自家的在线数据库服务，通过 Cloudflare 自己内部的网络传输数据库查询结果才能得到尽可能低的延迟。在一番考量过后，KV 数据库和 SQL 数据库中，我果断选择了 **Cloudflare D1** 这个 SQL 数据库（本质是 SQLite），D1 数据库以更长的查询时间换取数据的实时性。Cloudflare 为免费用户提供了每天 500w 行读取和 10w 行写入的免费额度，只要好好加以利用，就不太可能超出限额。后续我还考虑通过这些数据库的数据使用 Cloudflare Worker 构建 uptime status 的后端 API，实现一个类似 status.openai.com 的在线服务状态可视化界面。

![OpenAI 的 uptime status](https://static.031130.xyz/uploads/2025/01/19/f817539504140.webp)

## 登陆 wrangler

```bash
wrangler login
```

## 项目初始化

由于之前有过一些编写 Cloudflare Workers 的经验，我深知在 Cloudflare 网页的 code server 编辑器上编辑单文件的 worker.js 的不便，选择使用 Cloudflare 官方推出的工具 [wrangler](https://developers.cloudflare.com/workers/wrangler/) 进行项目的初始化。

```bash
npm create cloudflare@latest wjh-monitor
```

> Q: What would you like to start with? 
> A: Hello World example 
>
> Q: Which template would you like to use? 
> A: Hello World Worker 
>
> Q: Which language do you want to use? 
> A: TypeScript

![得到的项目结构](https://static.031130.xyz/uploads/2025/01/20/bf105c9fc18a3.webp)

我们只需要在 `index.ts` 中编写我们的主要逻辑即可。

## 数据库初始化

```bash
wrangler d1 create wjh-monitor-db
```

随后会输出这些内容，我们需要把这些配置文件写入项目的 `wrangler.toml` 文件中

```toml
[[d1_databases]]
binding = "DB"
database_name = "wjh-monitor-db"
database_id = "ffffffff-ffff-ffff-ffff-ffffffffffff"
```

编写一个 sql 文件创建数据表，并通过 wrangler 创建它

```sql
// schema.sql
CREATE TABLE IF NOT EXISTS DATA (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	check_item VARCHAR(10),
	response_time INTEGER NOT NULL,
	success BOOLEAN NOT NULL,
	online_status BOOLEAN NOT NULL,
	notify BOOLEAN DEFAULT FALSE,
	other TEXT,
	INDEX check_time_idx (check_time)
);
INSERT INTO DATA (
		response_time,
		success,
		online_status,
		notify,
		other
	)
VALUES (100, 1, 1, 0, 'initial');
```

使用 sql 文件创建远程数据表

```bash
wrangler d1 execute wjh-monitor-db --remote --file=./schema.sql
```

随后我们可以使用 wrangler 在远程数据库上执行 query 命令，并获得相应的结果

```
wrangler d1 execute wjh-monitor-db --remote --command='SELECT * FROM DATA'
```

## 主体逻辑编写

说实话，代码部分没什么太多好说的，正要了解思路直接去看[源码](https://github.com/zhullyb/wjh-monitor)就好。我在这里简单提两点。

1. 目录下的 `worker-configuration.d.ts` 定义了 env 变量的类型定义，如果我们在项目中绑定了一些变量（比如我们在 `wrangler.toml` 中绑定了 d1 数据库，变量名为 DB），需要在这里声明以防止后续 TypeScript 的报错。

2. 在 `export default {}` 中是将会被导出的主要函数，Hello World 项目编写了 fetch 函数，这是在 workers 被通过 http 方式访问时所调用的，如果要使用 cron job 功能，我们需要编写 scheduled 函数来被 workers 调用，并在 `wrangler.toml` 中配置好 crontab 触发器。

3. 我们在 `wrangler.toml` 中绑定了 DB 变量作为数据库的快捷访问方式，因此我们可以在代码中通过 [D1 数据库的 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) 来实现针对数据库的快捷操作，如

   ```javascript
   const res = await env.DB.prepare("SELECT * FROM DATA ORDER BY check_time DESC LIMIT 4").run();
   ```

需要注意的是，workers 不存在上下文，每一次访问的处理都是前后独立的，如果你需要临时存储一些数据，不要使用变量，一定要存入持久化存储的数据库。

预览:

```bash
wrangler dev
```

部署:

```bash
wrangler deploy
```

## 小插曲

由于我对后端经验的缺乏，我在编写 sql 语句时没有意识到建立索引的重要性。我在查询时使用了 `ORDER BY <未建立索引字段> LIMIT 5` 的方式来查询最近五次的记录，这导致数据库不得不在我每次查询时都完整遍历一遍整张表。随着 cronjob 每分钟运行时插入一条新数据，记录的行数随时间增加，每次查询的成本也逐渐增加，最终造成了单日访问八百多万行的记录，超出了 Cloudflare 的免费额度，一度造成了项目被迫下线的风险。

![](https://static.031130.xyz/uploads/2025/01/20/fb463f45038ac.webp)

所幸 Cloudflare 没有给我停机，而我也及时定位到了问题并补建了索引，使每日的读取量回到了正常的状态。

![蓝色线条为读取，黄色线条为写入](https://static.031130.xyz/uploads/2025/01/19/83f69aff3a7b4.webp)

## 参见

[Cloudflare D1 · Cloudflare D1 docs](https://developers.cloudflare.com/d1/)

[Cron Triggers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

[Cloudflare D1 使用记录](https://blog.sww.moe/post/cloudflare-d1/)
