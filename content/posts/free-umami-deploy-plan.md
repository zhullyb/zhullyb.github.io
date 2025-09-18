---
title: 【已过期】使用 vercel+supabase 免费部署 umami
date: 2022-11-08 13:37:53
description: 本文详细介绍了如何利用Vercel和Supabase免费部署Umami网站统计工具，无需自备服务器或承担额外费用。文章从放弃传统统计服务（如百度统计和友盟）的缘由讲起，逐步引导读者完成Supabase项目创建、数据库初始化、环境变量配置以及Vercel一键部署的全过程。内容涵盖关键操作截图、注意事项和常见问题提示，适合希望快速、低成本搭建隐私友好型网站统计系统的博主和开发者参考。
sticky:
tags:
- Network
- umami
- OpenSource Project
- vercel
---

> 讲起静态网站的访客统计，我最先使用的是百度统计，但后来转到了 umeng，发现后续的几天百度爬虫的光顾次数反而多了起来。好家伙，使用百度统计相当于把自己网站访问量向百度全盘托出，~~我说我的博客怎么还不被百度收录呢~~。
>
> 后来，umeng 推出了新的服务条款，好像是说不再向未备案的站点提供服务，随后不得不转向自部署的开源网站统计程序。

umami 提供了多种部署方式，在 vps 上可以非常轻松地使用 docker 一键部署，但上次 vps 到期时用 1Mbps 的小水管拖了好久都没有把博客前几个月的访客数据拖下来，一气之下我选择直接丢掉了这些可有可无的数据。

所以这一次，我决定放弃在自己的 vps 上部署，转去探索免费的部署方案。

umami 的官方文档上提供了非常多的部署方案，我个人比较喜欢 vercel，本站的随机图片 api 就是挂在 vercel 上的，界面比较简洁，且境内访问还算OK。

![umami官方文档提供的部署方案](https://static.031130.xyz/uploads/2024/08/12/6369ee9308dc3.webp)

但问题在于 vercel 本身并不提供免费的数据库，所以我们不得不去寻找一些长期免费提供数据库的供应商，我选择了 [supabase](https://supabase.com/pricing)。

在下图中选择顶栏的 **Pricing** 后看到这个 **$0/month** 就~~疯狂戳烂这个 Get Started~~

![supabase价目表](https://static.031130.xyz/uploads/2024/08/12/6369ef8d3451e.webp)

随便填写个项目名然后输入一个足够强大的密码，地区选择美国就行，东部西部无所谓（毕竟我也不知道 vercel 的机房是在东部还是西部）

![创建项目ing](https://static.031130.xyz/uploads/2024/08/12/6369f03faba15.webp)

看到这个小小的绿标就说明数据库正在初始化(~~你先别急，让我先急~~

![项目初始化中](https://static.031130.xyz/uploads/2024/08/12/6369f0d98a59c.webp)

![进行一通设置，把网站关闭后直接打入冷宫（x](https://static.031130.xyz/uploads/2024/08/12/6369f209c27aa.webp)

随后打开官方文档，点击其[描述 vercel 那一页](https://umami.is/docs/running-on-vercel)中大大的 **Deploy**

![vercel on Document](https://static.031130.xyz/uploads/2024/08/12/6369f2bda5f78.webp)

初始化过程中，vercel 会要求你创建一个 git 仓库，一般私有库就够了。

![创建仓库](https://static.031130.xyz/uploads/2024/08/12/6369f33ccf6d0.webp)

随后需要我们设置两个环境变量，第一个 `DATABASE_URL` 就是我们刚刚从 supabase 中复制下来并替换好 password 的 url，第二个 `HASH_SALT`需要你随意生成一长串字符串~~（比如你可以找一个新手让他帮你退出 vim~~

![设置环境变量](https://static.031130.xyz/uploads/2024/08/12/6369f3adbd34d.webp)

点击 **Deploy** 并等上两分钟，我们就部署完啦（首页没东西，白屏是正常的

![部署成功](https://static.031130.xyz/uploads/2024/08/12/6369f58f6acd4.webp)

来到项目首页，点击任意域名即可访问到我们部署的 umami，不过 vercel 的域名近年来也有被污染的情况，建议在设置里绑定自己的域名。

![项目首页](https://static.031130.xyz/uploads/2024/08/12/6369f5ec7a0e2.webp)

哦对了，别忘了 umami 的默认用户名密码是`admin`和`umami`，别到时候点击进去看到登陆框一脸懵，这是在文档里写过的。
