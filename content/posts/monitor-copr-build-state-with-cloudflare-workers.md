---
title: 使用 Cloudflare Workers 监控 Fedora Copr 构建状态
date: 2025-02-23 12:12:53
description: 本文介绍了如何利用 Cloudflare Workers 定时监控 Fedora Copr 项目的构建状态，并在构建失败时通过飞书机器人发送通知。文章详细解析了 Copr API 的调用方式、构建状态判断逻辑以及 Cloudflare Workers 的 cron 定时任务配置方法，帮助开发者及时获取构建失败信息，提升持续集成流程的可靠性。适合对自动化运维、CI/CD 和 Cloudflare Workers 感兴趣的开发者和系统管理员阅读。
sticky:
tags:
- JavaScript
- Cloudflare
- Fedora
---

> ~~确信，是 cloudflare workers 用上瘾了~~

在[「使用 Github Action 更新用于 rpm 打包的 spec 文件」](/2024/04/29/update-a-rpm-spec-by-github-action/)一文中，我利用 Github Action 实现了自动化的 spec 版本号更新，配合 Fedora Copr 的 webhook 就可以实现 Copr 软件包更新的自动化构建。看似很完美，但缺少了一个构建状态的监控机制，这导致出现构建错误的时候我不能及时得到通知（无论构建错误是 spec 本身的问题或者是构建时的网络环境问题）。

[西木野羰基](https://yanqiyu.info) 提出 [notifications.fedoraproject.org](https://notifications.fedoraproject.org/) 可以配置通知，Filters 的 Applications 选项中有 copr，但很可惜，实测没有效果。这里的通知配置的似乎只是邮件的过滤规则——如果 copr 本来就没打算构建失败的时候给你发邮件，那即使建立了过滤规则，依然是不可能收到邮件的。

不过好在 Fedora Copr 本身有非常完备的 [api 文档](https://copr.fedorainfracloud.org/api_3/docs)，`/monitor` 这个 API 能用来获取软件包最新的构建情况。

![](https://static.031130.xyz/uploads/2025/02/23/637811d2d85f6.webp)

因此，我们就可以通过 Cloudflare 的 cronjob 定时请求这个接口，查询是否有软件包构建失败。

先来编写打请求的部分

```javascript
async function fetchCopr() {
    const ownername = "zhullyb";
    const projectname = "v2rayA";

    const url = new URL("https://copr.fedorainfracloud.org/api_3/monitor")
    url.searchParams.set("ownername", ownername)
    url.searchParams.set("projectname", projectname)
    const response = await fetch(url)
    const data = await response.json()
    if (data.output !== "ok") {
        throw new Error("Failed to fetch COPR data")
    }
    return data
}
```

随后编写通知部分，我这里采用的是飞书的 webhook 机器人

```javascript
async function notify(text) {
    const webhook = "https://open.feishu.cn/open-apis/bot/v2/hook/ffffffff-ffff-ffff-ffff-ffffffffffff"
    const body = {
        msg_type: "text",
        content: {
            text: text
        }
    }
    const response = await fetch(webhook, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    console.log(response)
}
```

最后就是 cronjob 的调用部分和构建状态解析部分

```javascript
export default {
    async fetch(request, env, ctx) {
      return new Response('Hello World!');
    },

    async scheduled(event, env, ctx) {
        const data = await fetchCopr()
        const errorPackages = new Array()

        for (const pkg of data.packages) {
            for (const chroot of Object.values(pkg.chroots)) {
                if (chroot.state == "failed") {
                    errorPackages.push(pkg.name)
                    break
                }
            }
        }

        if (errorPackages.length > 0) {
            await notify(`COPR 以下包发生构建失败:\n${errorPackages.join("\n")}`)
        } else {
            console.log("COPR 所有包构建成功")
        }
    }
};
```

随后在 Cloudflare Workers 的 Settings 部分设置好 Cron 表达式即可，我这里选择在每小时的 55 分进行一次检测，这样下来一天只会消耗 24 次 workers 次数，简直毫无压力。

![](https://static.031130.xyz/uploads/2025/02/23/c38edfd637934.webp)

**缺点:** 我懒得使用持久化数据库记录软件包构建的成功状态，这会导致出现一个包构建失败后，每隔 1 小时都会有一条提醒，~~什么夺命连环 call~~。我目前不想修复这个问题，要不然还是降低 cron 的触发频率好了。
