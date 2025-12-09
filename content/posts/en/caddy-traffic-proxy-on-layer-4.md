---
title: "Layer 4 Traffic Proxying with Caddy: A Practical Guide"
date: 2025-12-10
tags:
- Caddy
- Network
---

## Background

On one of my VPS servers with optimized routing, port 443 needs to serve two distinct purposes:

1. Hosting my blog for visitors from mainland China, handling HTTPS encryption/decryption and serving static content
2. Disguising certain special-purpose traffic to mimic HTTPS traffic from well-known, commonly-allowed websites (yes, I'm talking about Reality)

This meant I needed a solution to handle both roles simultaneously on the same port of the same server.

## Choosing the Solution

I've long been aware that Nginx's `stream` directive can achieve Layer 4 (raw TCP stream forwarding) traffic splitting based on SNI recognition. However, as a devoted Caddy user who has written numerous [Caddy-related posts](/en/tags/Caddy/), I still prefer Caddy despite Nginx's recent ACME v2 support. The simplicity and usability of Caddyfile keep me coming back.

After some research, I discovered that while the latest Caddy version (v2.10) doesn't natively support Layer 4 traffic proxying, there's a community module called [caddy-l4](https://github.com/mholt/caddy-l4) that provides exactly this functionality. With 1.5k stars on GitHub and active maintenance, it seemed worth trying.

## Installation

Although the official Caddy APT repository doesn't include the caddy-l4 module, I recommend first installing the base Caddy version through APT, then using Caddy's official [download page](https://caddyserver.com/download) to build a custom binary with the modules you need. Download it and replace the system Caddy executable. This approach makes systemd service configuration much easier. Just remember to disable the Caddy APT repository to prevent automatic updates from overwriting your custom build.

For future updates, you can simply run:

```bash
caddy upgrade
```

Caddy will automatically detect the modules included in your current binary, trigger an online build from the official website to generate a new binary with those modules, and perform the replacement. You just need to manually restart the systemd service to complete the update.

If Caddy's online build service fails (it's been somewhat unstable lately), you can [follow the documentation](https://caddyserver.com/docs/build#xcaddy) to compile Caddy locally using xcaddy:

```bash
xcaddy build --with github.com/mholt/caddy-l4
```

## Configuration

Here's my original Caddyfile configuration for the blog:

```
zhul.in {
    root * /var/www/zhul.in

    encode zstd gzip
    file_server

    handle_errors {
            rewrite * /404.html
            file_server
    }
}

www.zhul.in {
    redir https://zhul.in{uri}
}
```

Since both zhul.in and www.zhul.in were using ports 80 and 443, I needed to move the HTTPS listeners to a different port and let caddy-l4 handle port 443.

Here's the modified Caddyfile:

```
http://zhul.in:80, https://zhul.in:8443 {
    root * /var/www/zhul.in

    encode zstd gzip
    file_server

    handle_errors {
            rewrite * /404.html
            file_server
    }
}

http://www.zhul.in:80, https://www.zhul.in:8443 {
    redir https://zhul.in{uri}
}
```

Next, I added the caddy-l4 configuration:

```
{
    layer4 {
        :443 {
            @zhulin tls sni zhul.in www.zhul.in
            route @zhulin {
                proxy 127.0.0.1:8443
            }

            @proxy tls sni osxapps.itunes.apple.com
            route @proxy {
                proxy 127.0.0.1:20443
            }
        }
    }
}
```

The syntax is quite straightforward. First, listen on port 443 within the `layer4` block. Then define SNI-based matching rules using `@name tls sni domain`. Finally, use `route @name` to specify how to handle traffic matching each rule—here I'm using `proxy ip:port` to forward the traffic.

Since my special traffic masquerades as Apple iTunes traffic, the SNI signature in the configuration is `osxapps.itunes.apple.com`. This traffic gets forwarded to local port 20443, where another service handles it.

caddy-l4 offers various other matching methods and routing handlers. Check out their [examples on GitHub](https://github.com/mholt/caddy-l4/tree/master/docs/examples) for more details.

Once configured, restart the Caddy service:

```bash
sudo systemctl restart caddy
```

## See Also
- [mholt/caddy-l4: Layer 4 (TCP/UDP) app for Caddy](https://github.com/mholt/caddy-l4)
- [Build from source — Caddy Documentation](https://caddyserver.com/docs/build)
