---
title: I Can’t Access dl.google.com — A Network Debugging Story Under TUN
date: 2026-01-31
sticky:
tags:
- Network
- DNS
---

If you’re familiar enough with the current network environment in mainland China, you probably know that `dl.google.com` is **often directly accessible without a proxy**.  
For example, you can download the Chrome offline installer directly from  
[google.cn/chrome/?standalone=1](https://google.cn/chrome/?standalone=1) on a domestic network, and the final download domain is `dl.google.com`.

My usual setup is to keep my proxy tool’s TUN mode enabled 24/7. All traffic goes through a virtual network interface first, and then routing rules decide automatically whether it should go through the proxy or connect directly. Most of the time this setup is pretty hassle-free — until recently, when I was rolling updates on Arch Linux with `yay` and suddenly ran into an SSL connection failure with `dl.google.com`.

![yay update failed](https://static.031130.xyz/uploads/2026/01/31/df5e547511070.webp)

It wasn’t just `yay`. My browser showed the exact same result:

![Firefox access failed](https://static.031130.xyz/uploads/2026/01/31/8ada158510aba.webp)

My first instinct was: *did my routing rules break again?*  
(They’re not written by me, so blaming them first is perfectly reasonable.)

## The Rule Is DIRECT — No One Else to Blame

I double-checked the routing rules. Traffic with SNI `dl.google.com` was explicitly configured as **DIRECT**.

![Mihomo routing rules](https://static.031130.xyz/uploads/2026/01/31/96d27a20f2bf3.webp)

That made things strange. Logically:

- `dl.google.com` itself is often directly reachable from domestic networks
- The rule clearly says DIRECT

To be honest, I’d seen this issue before. Back then I had higher-priority tasks, so I just turned off the proxy tool, finished the update, and moved on. This time, though, I had nothing urgent on my plate — so I decided to finally dig into it properly.

## It Resolved to an Overseas IP

First, I disabled the proxy tool’s `fake-ip` mode and switched back to real IP resolution to avoid introducing extra variables. Then I used `curl -vv` to access a `dl.google.com` download URL and see where it was actually trying to connect.

![curl -vv output](https://static.031130.xyz/uploads/2026/01/31/d3dbfc513de9f.webp)

Looking back now, I can say with confidence: the resolved IP belonged to Google’s **overseas CDN**, not a domestic or domestically reachable data center.

![IP geolocation](https://static.031130.xyz/uploads/2026/01/31/7ba8a0b8a2579.webp)

For those unfamiliar: when resolving `dl.google.com` for users in mainland China, DNS often returns **domestically reachable IPs** (otherwise direct downloads wouldn’t work at all).  
The overseas IP returned here was unreachable on my connection. Combined with the fact that I had configured `dl.google.com` as DIRECT, the result was:

> DNS returned an “overseas IP”
>
> + Rules enforced DIRECT
>   = Direct connection to an unreachable destination
>   = TLS handshake failure

So this wasn’t a case of “the direct rule didn’t work”. It was more like:  
**the rule worked perfectly, but DNS led me straight into a ditch.**

## Who Is Answering for dl.google.com?

In the Mihomo core, the main DNS-related configuration options are:

1. `nameserver`: default resolvers (most domains use these)
2. `direct-nameserver`: resolvers for DIRECT domains (only available in newer versions)
3. `proxy-server-nameserver`: resolvers for proxy node hostnames (irrelevant here)
4. `default-nameserver`: used to resolve “domain-form” nameservers in the DNS config itself (not expanded here)

Since `dl.google.com` was marked as a DIRECT domain, Mihomo should theoretically prefer `direct-nameserver`. If that isn’t set, it falls back to `nameserver`.

At the time, my `nameserver` configuration was:

- `https://dns.alidns.com/dns-query`

My intuition was simple: if the resolution looked like it came from an overseas CDN pool, I should verify whether AliDNS (DoH) itself was returning that overseas IP.

## Querying AliDNS DoH Directly — Overseas Pool Confirmed

AliDNS provides a JSON-based query interface, so I tested it directly with curl:

```bash
curl -s 'https://dns.alidns.com/resolve?name=dl.google.com&type=A'
```

![DoH response](https://static.031130.xyz/uploads/2026/01/31/b457af9299330.webp)

The returned IP was exactly the overseas one I’d seen earlier. At this point, I could confidently conclude:

**At least on my current network exit, AliDNS resolves `dl.google.com` to an overseas IP that is unreachable for me.**

### This Requires Two Conditions (Both Are Necessary)

It’s important to emphasize something here: this is *not* simply “AliDNS always resolves it wrong”. After running a bunch of comparisons, I found the conditions to be surprisingly strict:

> **The issue reliably reproduces only when *both* “China Mobile broadband” and “AliDNS (including 223.5.5.5 or AliDNS DoH)” are used together.**  
> Remove either condition, and the problem usually disappears.

More specifically:

- **Switch to China Telecom or China Unicom broadband**: with the same AliDNS, `dl.google.com` usually resolves correctly
- **Stay on China Mobile broadband, but don’t use AliDNS**: resolution is usually fine
- **China Mobile broadband + AliDNS**: high probability of getting an overseas IP pool, and DIRECT connections fail

I also ran nationwide resolution tests on itdog, and the reproduction rate was indeed much higher on China Mobile networks.

![itdog test results](https://static.031130.xyz/uploads/2026/01/31/d93222096f005.webp)

Why does this happen? Honestly, I can’t provide a single authoritative explanation. What I *can* say is that the behavior is extremely consistent, and consistent enough for me to conclude:

**The problem isn’t TUN itself — it’s that, under TUN, my DNS choice sent `dl.google.com` to an address pool that’s unreachable on China Mobile.**

## How Did I Finally Fix It?

Since the issue was the combination of **China Mobile + AliDNS**, the solution was straightforward:

**Stop letting `dl.google.com` be resolved by AliDNS.**

You can do this by configuring `direct-nameserver`, using `nameserver-policy`, switching to another public DNS like `119.29.29.29`, or even delegating DNS resolution to your home router.

```yaml
direct-nameserver:
  - 192.168.8.1

nameserver-policy:
  "dl.google.com": [119.29.29.29]
```

After this change, `yay` updates worked normally again, and browsers could directly access `dl.google.com` without issues.

## References

- [Minimal anti–DNS-leak configuration for the mihomo core (2025) – Development & Tuning – LINUX DO](https://linux.do/t/topic/1061825)
