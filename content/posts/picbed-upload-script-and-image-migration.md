---
title: 自建图床小记四——上传脚本编写与图片迁移
date: 2024-08-20 23:12:30
sticky:
tags:
- Python
- 图床
- Linux
- Network
- Shell Script
---

前面三篇小记分别讲述了[图床的整体架构](/2024/08/12/new-picbed-based-on-cloudflare-and-upyun/)、[用 Workers 构建 Restful API](/2024/08/13/build-restful-api-for-cloudflare-r2-with-cloudflare-workers/) 和 [自动更新部署 SSL 证书](/2024/08/14/auto-renew-ssl-certificate-and-deploy-to-upyun-with-github-action/)，这一篇c处理由此带来的图片上传问题，主要是要为 Typora 编写自动上传脚本，并为博客原有的图片进行迁移。

## 自动上传脚本

主要还是给 Typora 用，实现这种效果

![Typora 自动上传](https://static.031130.xyz/uploads/2024/08/12/62f3b881e3c4c.gif)

```bash
#!/bin/bash

HOST="upload.example.com"
CDN_HOST="cdn.example.com"
UPLOAD_PATH="uploads/$(date +%Y/%m/%d)"

AUTH_TOKEN="1145141919810"

webp=false
markdown=false
force=false
keep=false

while getopts ":mwfkp:" opt; do
    case $opt in
        m|markdown) markdown=true ;;
        w|webp) webp=true ;;
        f|force) force=true ;;
        k|keep) keep=true ;;
        p|path) UPLOAD_PATH=$OPTARG ;;
        \?) echo "Invalid option: -$OPTARG" ;;
    esac
done
shift $((OPTIND - 1))

UPLOAD_URL="https://$HOST/$UPLOAD_PATH"
if [[ "$UPLOAD_URL" == */ ]]; then
    UPLOAD_URL="${UPLOAD_URL%?}"
fi

for image in "$@"; do
    if [ "$webp" = true ]; then
        cwebp -quiet "$image" -o "${image%.*}.webp"
        image="${image%.*}.webp"
    fi

    if [ "$keep" = true ]; then
        FILENAME=$(basename "$image")
    else
        FILENAME="$(md5sum $image | cut -c 1-13).$(basename $image | cut -d. -f2)"
    fi

    if [ "$force" = true ]; then
        UPLOAD_RESPONSE=$(curl -s -X PUT "${UPLOAD_URL}/$FILENAME" \
            -w "%{http_code}" \
            --data-binary @"$image" \
            -H "X-Custom-Auth-Key: $AUTH_TOKEN" \
            -H "Overwrite: true" \
        )
    else
        UPLOAD_RESPONSE=$(curl -s -X PUT "${UPLOAD_URL}/$FILENAME" \
            -w "%{http_code}" \
            --data-binary @"$image" \
            -H "X-Custom-Auth-Key: $AUTH_TOKEN" \
        )
    fi

    UPLOAD_HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
    
    if [ -n "$UPLOAD_PATH" ]; then
        CDN_URL="https://$CDN_HOST/$UPLOAD_PATH/$FILENAME"
    else
        CDN_URL="https://$CDN_HOST/$FILENAME"
    fi

    if [ "$UPLOAD_HTTP_CODE" != "200" ]; then
        echo "上传失败: $UPLOAD_RESPONSE"
        continue
    fi

    if [ "$markdown" = true ]; then
        echo "![](${CDN_URL})"
    else
        echo "${CDN_URL}"
    fi
done
```

这一次使用 Cloudflare Workers 构建的 Restful API 很有意思，使用了 `GET`、`PUT` 和 `DELETE` 三个请求类型。`GET` 请求很常见，是用来获取图片的，`PUT` 和 `DELETE` 在 web 开发就不如 `GET` 和 `POST` 常见了，这一次也是让我体会到了这两个 http verb 在 Storage Bucket 操作中是有多么形象了。

- `PUT` - 从直观上来讲，就是将某个文件放到目标位置

  打个比方，我向 `https://cdn.example.com/img/avatar.webp` 打了一个请求，并带上了要上传的文件，那就意味着我将这个文件放到了 Storage Bucket 的 `/img/avatar.webp` 这个位置，所以我在上传后，应该就能用 `GET` 请求我刚才 `PUT` 的那个 URL 获取我刚才上传的东西。如果那个路径存在文件，那么默认行为是直接覆盖。

- `DELETE` - 删除目标路径的文件

  和 `PUT` 一样，我在请求对应 URL 后，Storage Bucket 中对应 URL 路径的资源应该被删除。

`PUT` 和 `DELETE` 这两个 Http Verb 让我们更像是在对一个真实的文件系统进行操作，而非那种传统的使用 `POST` 上传的图床那样，我们并不通过 POST 请求上传一个文件，然后获取资源最终被放置位置的 URL —— 我们自己决定资源被存放的位置。

在这个 Shell 脚本中，引入了四个可选选项

```bash
    m|markdown) markdown=true ;;
    w|webp) webp=true ;;
    f|force) force=true ;;
    k|keep) keep=true ;;
    p|path) UPLOAD_PATH=$OPTARG ;;
```

- markdown 选项决定返回值是否以 `![]()` 这种 URL 格式返回
- webp 决定上传过程中是否将图片转为 webp 后再上传
- force 决定如果遇到文件路径冲突，是否强制覆盖云端的文件
- keep 决定是否保留文件原有的文件名进行上传
- path 决定文件具体被存放的路径（或者使用默认的路径）

`HOST` 是图床用于上传的地址，`CDN_HOST` 是图床用于被方可访问的地址。

由于急着用，也没考虑协程的处理方式，等等看后期有没有时间用 Python 重写吧。

## 博客图床迁移脚本

因为只用一次，所以也没使用协程或者多线程的方式去上传文件——毕竟图片不多，也就两三百张。

```python
import os
import re
import requests

# 哪些后缀的文件需要检测是否存在老图床的 URL 并进行迁移？
file_extension = [
    '.md',
    '.yml',
    '.html'
]

pic_urls = []

_files = []

# 用于匹配老图床的正则表达式，这里是按照 lsky pro 的格式编写的
pattern = r'https://cdn.example.com/\d{4}/\d{2}/\d{2}/[a-z0-9]{13}\.[a-z]{3,4}'

# 图片的上传部分，需要先从原 url 中下载图片，在上传到新图床中，如果需要的话可以在中途转换为 webp 格式
def upload(url):
    """
    此处的返回值应该是新的 url
    """

# 遍历目标后缀文件名的文件，如果存在老图床的 url，则将 url 加入到 pic_urls 列表中，并将这个文件的文件名（相对路径）添加到 _files 列表中
for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(tuple(file_extension)):
            file_name = os.path.join(root, file)
            with open(file_name, 'r') as f:
                content = f.read()
            urls = re.findall(pattern, content)
            if urls:
                pic_urls.extend(urls)
                _files.append(file_name)

# 先转为集合，再转回列表，进行去重
pic_urls = list(set(pic_urls))
print("共找到图片：", len(pic_urls))

url_dict = {}

# 将列表中的图片进行上传，每张图片最多尝试三次上传，如果三次都失败，则保留原连接
for i,u in enumerate(pci_urls, start=1):
    for t in range(1,4):
        try:
            new_u = upload(u)
            continue
        except:
            if t == 3:
                new_u = u
                print(f"{u} 无法上传：{e}")
	url_dict[u] = new_u
    print(f"{i} / {len(pic_urls)}")

# 对 _files 列表中的文件一一完成替换
for file in _files:
    with open(file, 'r') as f:
        content = f.read()
    for k, v in url_dict.items():
        content = content.replace(k, v)
    with open(file, 'w') as f:
        f.write(content)
    print("完成替换：", file)
```

