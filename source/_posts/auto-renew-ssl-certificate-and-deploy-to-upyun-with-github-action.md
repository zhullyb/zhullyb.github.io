---
title: 自建图床小记三—— SSL 证书的自动更新与部署
date: 2024-08-14 10:35:18
sticky:
tags:
- Bot
- CDN
- Github Action
- Network
- Linux
- SSL certificates
- 图床
---

## 为什么要自动更新？

众所周知，为站点开启 https 访问需要获得对应 host 的 ssl 证书，而如果希望证书被访客的浏览器所信任，需要拿到由 Certificate Authority (CA) 签发的 ssl 证书。在前一阵子那波 BAT 等大厂提供的云服务停止发放免费的由 TrustAsia/DigiCert 签发的一年有效期免费 ssl 证书之后，市面上已经没有被广泛信任的 CA 签发的免费的一年有效期的 ssl 证书了，于是不得不用回由 Let's Encrypt/ZeroSSL 等 CA 签发三个月免费证书。

但话又说回来，三个月有效期确实不太够，一年有效期的证书就一年一更，手动申请部署也不麻烦；三个月有效期的证书手动就有点麻烦了——我一般会在证书到期的前 15 天进行更新，防止最后几天自己太忙了没时间管。

## 这套图床架构的自动更新有没有困难？

### 境外

通过 Cloudflare SaaS 接入的域名通过验证后会自动获得由 Cloudflare 提供的由 Google Trust Services 签发的证书，不需要我们操心。

![SSL Certificate provided by Cloudflare](https://static.031130.xyz/uploads/2024/08/14/831d714565906.webp)

### 境内

咱选用的又拍云 CDN 提供了免费的 Let's Encrypt 证书及其自动续期服务，但需要我们把图床访问域名的 DNS CNAME 解析到他们家。

![SSL Certificate provided by upyun](https://static.031130.xyz/uploads/2024/08/14/b16f7752ef522.webp)

这里有个问题，我们这套图床架构在境外的解析是解析到 Cloudflare 的，不可能通过 Let's Encrypt 的 acme challenge。如果使用 upyun 申请 ssl 证书，则意味着每次更新都要我们手动将境外的 dns 解析记录暂时解析到又拍云，待证书更新成功后再解析回 Cloudflare，非常麻烦。

## 使用 Github Action 跑 acme.sh 获取 ssl 证书

本着「能使用长期免费稳定服务就使用长期免费稳定服务」的思想，决定使用 Github Action 申请 ssl 证书。

在 Github Action 跑 acme.sh 获取 ssl 证书意味着不能使用 http 文件检验的方式检验域名所有权，需要使用 dns 检验。截至本文写作时间，acme.sh 已经支持了 150+ 个主流的 DNS 解析商（Managed DNS providers）的 api，针对不支持 api 修改 dns 解析记录的，还可以使用 [DNS alias 模式](https://github.com/acmesh-official/acme.sh/wiki/DNS-alias-mode)——即将需要申请 ssl 证书的域名先 cname 到一个工具人域名上，将工具人域名通过 NS 解析到 acme.sh 支持的 DNS 解析商，进而实现 CA 对域名所有权的验证。

### 先在本地跑起来

我采用的是 Cloudflare，直接在个人资料页创建一个具有编辑 DNS 权限的 API 令牌

![创建令牌](https://static.031130.xyz/uploads/2024/08/14/c0262d4aea708.webp)

![获得令牌](https://static.031130.xyz/uploads/2024/08/14/f30bfc93970bc.webp)

随后在自己的域名页面，找到区域 ID 和 账户 ID

![区域 ID 和 账户 ID](https://static.031130.xyz/uploads/2024/08/14/4c8d4a2019812.webp)

在自己的本机安装 acme.sh,设置好 Cloudflare DNS 的几个变量

```bash
export CF_Token=""
export CF_Account_ID=""
export CF_Zone_ID=""
```

随后可以尝试使用 acme.sh 签发 ssl 证书

```
acme.sh --issue --dns dns_cf -d cdn.example.com
```

![ssl 证书到手](https://static.031130.xyz/uploads/2024/08/14/c78bc5afa3641.webp)

### 上 Github Action

原本是打算直接用 [Menci/acme](https://github.com/Menci/acme) 这个 Action的，可惜遇到了点问题。

在我本地，Cloudflare 相关的 Token 和 ID 并没有被写入到 account.conf，而是被写在 `cdn.example.com_ecc/cdn.exampe.com.conf`，大概就没办法直接用这个 Action 了，不得不转去手搓。不过好在 Menci/acme 中还是能抄到不少的。

#### 压缩本地的 ca 文件夹

```bash
cd $HOME/.acme.sh/ && tar cz ca | base64 -w0
```

#### 安装 acme.sh

```yaml
- name: Install acme.sh
  run: curl https://get.acme.sh | sh
```

#### 解压 ca 文件夹

```yaml
- name: Extract account files for acme.sh
  run: |
    echo "${{ secrets.ACME_SH_ACCOUNT_TAR }}" | base64 -d | tar -C ~/.acme.sh -xz
```

#### 执行 acme.sh 申请证书

```yaml
- name: Issue Certificate
  run: |
    export CF_Token="${{ secrets.CF_TOKEN }}"
    export CF_Zone_ID="${{ secrets.CF_ZONE_ID }}"
    export CF_Account_ID="${{ secrets.CF_ACCOUNT_ID }}"
    mkdir -p output
    ~/.acme.sh/acme.sh --issue --dns dns_cf --force -d ${{ env.domain }} --fullchain-file output/fullchain.pem --key-file output/key.pem
```

#### 压缩证书

```yaml
- name: zip Certificate
  run: |
    zip -j output/${{ env.domain }}_$(date +%Y%m%d).zip output/fullchain.pem output/key.pem
```

#### 通过 tg bot 发送压缩包给自己

```yaml
- name: Push Certificate
  run: |
    TG_BOT_TOKEN="${{ secrets.TG_BOT_TOKEN }}"
    TG_CHAT_ID="${{ secrets.TG_CHAT_ID }}"
    curl -s -X POST https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument -F chat_id=${TG_CHAT_ID} -F document="@output/${{ env.domain }}_$(date +%Y%m%d).zip"
```

#### 部署到又拍云

这里使用的是 [menci/deploy-certificate-to-upyun](https://github.com/Menci/deploy-certificate-to-upyun/)。由于又拍云没有提供上传 ssl 证书的 api，因此只能通过模拟用户登陆的方式实现。

```yaml
- name: Deploy To Upyun
  uses: Menci/deploy-certificate-to-upyun@beta-v2
  with:
    subaccount-username: ${{ secrets.UPYUN_SUBACCOUNT_USERNAME }}
    subaccount-password: ${{ secrets.UPYUN_SUBACCOUNT_PASSWORD }}
    fullchain-file: output/fullchain.pem
    key-file: output/key.pem
    domains: |
      ${{ env.domain }}
    delete-unused-certificates: true
```

![SSL 证书成功部署到又拍云](https://static.031130.xyz/uploads/2024/08/14/222a754d25c97.webp)

## 参见

- [使用 GitHub Actions 自动申请与部署 ACME SSL 证书](https://blog.men.ci/ssl-with-github-actions/)
- [（续）acme.sh脚本使用新cloudflare api令牌申请证书](https://shiping.date/82.html)
- [acmesh-official/acme.sh](https://github.com/acmesh-official/acme.sh)
