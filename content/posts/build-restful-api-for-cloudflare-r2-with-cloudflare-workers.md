---
title: 自建图床小记二——使用 Workers 为 R2 构建 Restful API
date: 2024-08-13 22:58:26
sticky:
tags:
- Image Hosting
- Cloudflare
- JavaScript
- Python
---

## 访问 R2 的两种方式

一般来说，想要访问 Cloudflare R2 中的文件，会有两种方式。

### 一种是在 R2 的设置界面设置自定义域

![设置自定义域](https://static.031130.xyz/uploads/2024/08/13/61fe9ede194af.webp)

### 另一种是通过 Cloudflare Workers 进行访问

![通过 Cloudflare Workers](https://static.031130.xyz/uploads/2024/08/13/846164273571d.webp)

***

**那么应该选择哪种？选择 Cloudflare Workers！**

## 为什么是 Cloudflare Workers？

要回答这个问题比较困难，但可以回答另一个问题——「为什么不设置自定义域实现直接访问？」

### 自定义域的访问存在限制

设置自定义域的访问方式存在较多的限制，让我们先来复习一下[上一篇博客中](/2024/08/12/new-picbed-based-on-cloudflare-and-upyun/)提到的 DNS 解析方案 1

![DNS 解析方案 1](https://static.031130.xyz/uploads/2024/08/13/03d8243b67593.webp)

在这里，我们需要将图床访问域名通过 NS 接入 DnsPod 实现境内外的分流，但 R2 所允许设置的自定义域必须是通过 NS 接入 Cloudflare 的，这存在冲突。那如果我们先将自定义域设置为通过 NS 接入 Cloudflare 的工具人域名，再将图床访问域名通过 CNAME 解析到工具人域名会不会有问题呢？恭喜你获得 403 Forbidden。

如果通过[上一篇文章](/2024/08/12/new-picbed-based-on-cloudflare-and-upyun/)中的 DNS 解析方案 2 来进行 DNS 解析，能不能成功设置为 Cloudflare R2 的自定义域呢？也不行，Cloudflare R2 的自定义域会占用域名的解析，这意味着你无法将图床访问域名解析到用于分流的工具人域名。

***

**结论：截至本文写作时间，设置自定义域的方案不适用于 DNS 分流的图床架构。**

### 如何上传文件到 Cloudflare R2？

#### 网页端直接上传

最简单的上传方式是直接在 Cloudflare 进行网页上传，但这种方案不适合自动化脚本，也没法接入 Typora

![直接在网页端进行上传](https://static.031130.xyz/uploads/2024/08/13/b4d1b5b3edfae.webp)

#### 使用 Amazon S3 的兼容 API

##### 手动调用 S3 API

Cloudflare R2 被设计为兼容 Amazon S3 的存储方案，自然兼容 Amazon S3 的上传 API，在 [Cloudflare Docs 中有关于 S3 API 的实现情况](https://developers.cloudflare.com/r2/api/s3/api/)记载，大部分接口功能都是实现了的。但。。。但 S3 使用的是 [AWS Signature](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/create-signed-request.html) 作为鉴权，你不会希望在每个自动化程序中都自己实现一次的。。。

![https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/images/sigV4-using-auth-header.png](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/images/sigV4-using-auth-header.png)

##### 使用 aws-cli 等 SDK

使用 aws-cli 可以自动实现计算 AWS Signature，这是一种可行的方案，但我可能会在别的服务中使用到我的图床，不是所有的服务所处的环境都能够执行 shell 命令，也不是所有的编程语言都有现成的 SDK 可用。

#### 使用 Cloudflare Workers 构建 Restful API

[在 Cloudflare Docs 中明确提出可以使用 Cloudflare Workers 访问 Cloudflare R2 Bucket，](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/#5-access-your-r2-bucket-from-your-worker)通过 Workers 设置界面的按钮，可以非常方便的将 R2 Bucket 作为一个 R2Object 绑定到 JavaScript 的一个变量中，[这里有相关的开发文档](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)。

![绑定为变量](https://static.031130.xyz/uploads/2024/08/13/45e58b47f3aeb.webp)

***

**结论: 从易用性上来看，使用 Cloudflare Workers 构建 Restful API 这种上传文件的方案是最为合适的。**

## 使用 Cloudflare Workers 构建 Restful API 的方案有没有什么缺点？

有。

- Cloudflare Workers 的每日额度是有限的，在极端的流量下可能会用完（应该不会吧？）
- Cloudflare Workers 的内存限制为 128MB，在上传下载 > 100MB 的文件时可能会出错。有这种体积上传需求的场景建议使用别的上传方案。

## 如何构建？

直接贴代码

```javascript
const hasValidHeader = (request, env) => {
	return request.headers.get('X-Custom-Auth-Key') === env.AUTH_KEY_SECRET;
};

function authorizeRequest(request, env, key) {
	switch (request.method) {
		case 'PUT':
		case 'DELETE':
			return hasValidHeader(request, env);
		case 'GET':
			return true;
		default:
			return false;
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const key = decodeURI(url.pathname.slice(1));

		if (!authorizeRequest(request, env, key)) {
			return new Response('Forbidden\n', { status: 403 });
		}

		switch (request.method) {
			case 'PUT':
				const objectExists = await env.MY_BUCKET.get(key);

				if (objectExists !== null) {
					if (request.headers.get('Overwrite') !== 'true') {
						return new Response('Object Already Exists\n', { status: 409 });
					}
				}

				await env.MY_BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!\n`);

			case 'GET':
				const object = await env.MY_BUCKET.get(key);

				if (object === null) {
					return new Response('Object Not Found\n', { status: 404 });
				}

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);

				return new Response(object.body, {
					headers,
				});
			case 'DELETE':
				await env.MY_BUCKET.delete(key);
				return new Response('Deleted!\n');

			default:
				return new Response('Method Not Allowed\n', {
					status: 405,
					headers: {
						Allow: 'PUT, GET, DELETE',
					},
				});
		}
	},
};
```

代码的大部分都是基于 Cloudflare Docs 中给出的样例，修改了几个小的优化点

- 删除了 ALLOW_LIST 部分代码，默认所有文件都是可以被访问的
- 在上传一个文件时，如果目标路径存在同名文件，则不直接覆盖，而是返回 409 的异常 HTTP 相应，如果想要强制覆盖，则需要在 Http Header 中加入 `Overwrite: true`
- 解出请求路径时，使用 decodeURI( ) 方法先进行解码，解决文件路径中含有中文时会导致请求失败的问题。

填入代码后，还需要绑定两个变量，一个是 R2 Bucket

![](https://static.031130.xyz/uploads/2024/08/13/45e58b47f3aeb.webp)

另一个是自己的管理密码

![](https://static.031130.xyz/uploads/2024/08/14/96da1f62f5fe7.webp)

## 如何使用 Cloudflare Workers 构建的 Restful API 进行文件操作？

### 上传

以 python 为例，上传一个文件 1MB.bin 到 /example/ 目录下，上传的 url 就是文件最终的存在路径。

```python
import requests

AUTH_KEY_SECRET='1145141919810'

with open('1MB.bin', ''rb) as f:
    file_content = f.read()

requests.put(
	'https://r2.example.workers.dev/example/1MB.bin',
    headers={
        'X-Custom-Auth-Key': AUTH_KEY_SECRET,
        'Overwrite': True	# 如果不需要强制覆盖可以删除这一行
    }
)
```

### 访问

通过浏览器直接访问 `https://r2.example.workers.dev/example/1MB.bin` 应该就能访问到

### 删除

仍然以 python 为例，删除刚才的文件

```python
import requests

AUTH_KEY_SECRET='1145141919810'

with open('1MB.bin', ''rb) as f:
    file_content = f.read()

requests.delete(
	'https://r2.example.workers.dev/example/1MB.bin',
    headers={
        'X-Custom-Auth-Key': AUTH_KEY_SECRET
    }
)
```

## 参见

- [用 cloudflare 的 R2 和 worker 来做文件托管](https://blog.yswtrue.com/yong-cloudflare-de-r2-he-worker-lai-zuo-wen-jian-tuo-guan/)
- [Workers API reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Use R2 from Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
- [创建已签名的 AWS API 请求](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/create-signed-request.html)
