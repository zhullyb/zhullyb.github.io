---
title: Monitoring Fedora Copr Build Status with Cloudflare Workers
date: 2025-02-23 12:12:53
sticky:
tags:
- JavaScript
- Cloudflare
- Fedora
---

> ~~Admittedly, I've gotten addicted to Cloudflare Workers~~

In my earlier post [*"Updating RPM Spec Files for Packaging with GitHub Actions"*](/2024/04/29/update-a-rpm-spec-by-github-action/), I used GitHub Actions to automate spec file version bumps. Combined with Fedora Copr's webhook support, this enables fully automated package builds. It seemed perfect — except there was no build status monitoring, meaning I had no way to get timely notifications when a build failed (whether due to a bug in the spec itself or a network issue during the build).

[Nishikino Carbonyl](https://yanqiyu.info) suggested [notifications.fedoraproject.org](https://notifications.fedoraproject.org/), which supports configuring notifications — there's even a Copr option under Filters > Applications. Unfortunately, it didn't work in practice. The notification settings there appear to only configure *email filtering rules* — if Copr never intended to send you an email on build failure in the first place, no filter rule will make one appear.

Fortunately, Fedora Copr has a well-documented [API](https://copr.fedorainfracloud.org/api_3/docs). The `/monitor` endpoint can be used to fetch the latest build status for packages.

![](https://static.031130.xyz/uploads/2025/02/23/637811d2d85f6.webp)

So the plan is: use a Cloudflare Workers cron job to periodically call this endpoint and check for any failed builds.

Let's start with the fetch logic:

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

Next, the notification logic. I'm using a Feishu (Lark) webhook bot here:

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

Finally, the cron handler and build status parsing:

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
            await notify(`COPR build failures detected for the following packages:\n${errorPackages.join("\n")}`)
        } else {
            console.log("All COPR packages built successfully")
        }
    }
};
```

Then go to the Cloudflare Workers Settings page and configure a Cron expression. I set mine to trigger at minute 55 of every hour — that's only 24 Workers invocations per day, basically nothing.

![](https://static.031130.xyz/uploads/2025/02/23/c38edfd637934.webp)

**Drawback:** I didn't bother setting up a persistent database to track which packages have already been flagged. This means once a package fails, you'll get a notification every hour until it's fixed. ~~Feels like spam calls from an unknown number.~~ I'm not planning to fix this for now — maybe I'll just lower the cron frequency instead.
