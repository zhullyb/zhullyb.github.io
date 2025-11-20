---
title: SSH to the Rescue - Running APT Updates on Internal Network Servers via SSH Tunnels
date: 2025-03-30 21:45:24
sticky:
tags:
- Apt
- Network
- OpenSSH
- Caddy
- Linux
- Debian
---

This all started when Jinghong's [former technical director](https://blog.cnpatrickstar.com/) complained that the school's internal network servers couldn't connect to the external network, making APT installation and updates extremely difficult. He had to manually download packages from the source, along with their dependencies, and the dependencies of those dependencies... and then transfer all these packages to the server via sftp/rsync or similar methods for manual installation.

![](https://static.031130.xyz/uploads/2025/03/30/0447b7d64886a.webp)

Thus, this article was born. We can use Caddy (Nginx works too, of course) on our local machine to reverse proxy an APT mirror site, establish port forwarding through an SSH tunnel, allowing the internal network server to access the local Caddy server and thereby reach the external mirror site.

## Prerequisites

- Your control machine (your own computer) can directly connect to the computer via SSH (possibly using some network tools), rather than first logging into a jump host via SSH and then logging into the target server from there. The latter situation can certainly achieve our goal using similar methods, but would be more complex.
- Your control machine (your own computer) can connect to public mirror sites while connected to the internal network server (~~if not, you might want to sync a local mirror in advance to create an offline mirror site~~).

## Reverse Proxying the Mirror Site

I chose Caddy over Nginx here - on one hand, Caddy's configuration files are simpler to write, and on the other hand, Caddy is written in Golang, so it's a single binary that works everywhere, and Windows can directly [download](https://caddyserver.com/download) and run it.

Using the most common Tsinghua TUNA mirror site as an example, a simple Caddy configuration file looks like this:

```nginx
:8080 {
    reverse_proxy https://mirrors.tuna.tsinghua.edu.cn {
        header_up Host {http.reverse_proxy.upstream.hostport}
    }
}
```

Save the above code as a file named Caddyfile, then run it using the caddy command in the saved path:

```bash
caddy run --config ./Caddyfile
```

![](https://static.031130.xyz/uploads/2025/03/30/8ef15a08e4852.webp)

If there are no errors, you should be able to see the Tsinghua mirror site on your local port 8080:

![](https://static.031130.xyz/uploads/2025/03/30/a9083c95c07a2.webp)

> You may notice that the reverse proxied page differs slightly from Tsinghua's mirror site - it doesn't have Tsinghua's logo. This is probably because the page's JavaScript checks the host, and if it's not Tsinghua or BFSU's page, it won't add the school name. But this doesn't affect our ability to fetch updates from these mirror sites.

## Establishing the SSH Tunnel

To establish the tunnel, use the following command:

```bash
ssh -R 8085:localhost:8080 root@remote.example.com
```

The -R flag indicates establishing a reverse tunnel. For other parameter options, you can refer to this blog post "[SSH Tunneling Techniques](https://www.entropy-tree.top/2024/04/18/ssh-tunneling-techniques/)", also written by a Jinghong senior.

At this point, we've established SSH port forwarding from the internal network server's port 8085 to our local machine's port 8080. (I used port 8085 to distinguish it from port 8080; in practice, you can use any available port)

We can test whether we can access it normally on the server using curl. Here I simply accessed a README file in the Debian source root directory:

```bash
curl http://localhost:8085/debian/README
```

![](https://static.031130.xyz/uploads/2025/03/30/597c4af0d398d.webp)

## Changing Sources

So now we have a reverse proxy of the Tsinghua open source mirror site on the internal network server's port 8085, and we can access all content in the mirror site through port 8085.

First, follow the [instructions from Tsinghua Open Source Mirror Site](https://mirrors.tuna.tsinghua.edu.cn/help/debian/) to change sources. **Remember to check "Force security updates to use mirror"**.

![](https://static.031130.xyz/uploads/2025/03/30/46e3c7030ded4.webp)

Then, we replace all instances of https://mirrors.tuna.tsinghua.edu.cn in the sources with http://localhost:8085:

```bash
sed -i 's|https\?://mirrors\.tuna\.tsinghua\.edu\.cn|http://localhost:8085|g' `grep -rlE 'http(s)?://mirrors\.tuna\.tsinghua\.edu\.cn' /etc/apt/`
```

![Running apt update](https://static.031130.xyz/uploads/2025/03/30/a8f0c70d48f5b.webp)

![Installing unzip using apt](https://static.031130.xyz/uploads/2025/03/30/07919bf939e92.webp)

As you can see, we've successfully implemented APT updates and software installation on the internal network server through an SSH tunnel.

> Friendly reminder: SSH tunnels were frequently used in the early 2010s to establish cross-border access, but quickly faded from the scene due to their distinctive traffic characteristics. Therefore, don't use SSH for large amounts of cross-border network transmission, as it's easy to get blocked.

Of course, there are many ways to achieve this goal. Other tools like frp can achieve the same effect, but the SSH tunnel solution can be started and stopped on demand without additional configuration, which is why I primarily recommend it.
