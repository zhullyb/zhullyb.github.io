---
title: 使用 Github Action 更新用于 rpm 打包的 spec 文件
date: 2024-04-29 19:19:54
description: 本文介绍了如何使用 Github Action 自动更新 RPM 打包所需的 spec 文件，特别适用于上游项目频繁发布新版本的情况。通过结合 netoarmando/rpmdev-bumpspec-action，实现在 Fedora 容器中自动调用 rpmdev-bumpspec 工具，更新版本号和变更日志。文章详细展示了从检出代码、获取版本信息、条件触发更新，到自动提交更改和触发 Copr 构建的完整流程，适合 Fedora/RPM 打包维护者和 CI/CD 自动化实践者参考。
sticky:
tags:
- Fedora
- RPM Package
- Github Action
---

有一些软件包的上游本身就是使用 Github Action 发版的，每次 commit 都会触发 Github Action 去构建并分发新版本，使用构建时的时间日期作为版本号。针对这种包，手动更新费时费力，而规范的 specfile 应当是更新 `%changelog` 的，因此应当是使用 rpmdev-bumpspec 命令。只不过 rpmdev-bumpspec 需要在 rpm 系发行版或者装有 rpm 系列依赖包的发行版下执行，这不是随随便便一个 Linux 环境就能运行的。

我找到了 [netoarmando/rpmdev-bumpspec-action](https://github.com/netoarmando/rpmdev-bumpspec-action) 这个 Github Action，它通过启动一个 Fedora 的 docker 实现了使用 rpmdev-bumpspec 的效果。虽然 release 中只有一个 2021 年构建的 v1 版本，~~但 Fedora 的版本高低不影响 rpmdev-bumpspec 的效果。~~但每次 Github Action 执行时都会使用 fedora:latest 的 docker 重新构建一遍，不用担心 fedora 版本过低。

于是我们便解决了最核心的问题——处理 spec 文件。接下来只要补充好头尾的步骤即可。

***

首先使用 actions/checkout 释出仓库内的文件

```yaml
- name: Checkout
  uses: actions/checkout@v2
  with:
    fetch-depth: 0
```

通过 shell 命令获取仓库内 spec 文件的版本号，存入 $GITHUB_ENV

```yaml
- name: Get Current Version
  run: |
    CURRENT_VERSION=`grep -E '^Version:' *.spec | awk '{print $2}'`
    echo "CURRENT_VERSION=$CURRENT_VERSION" >> $GITHUB_ENV
```

通过 Github API 获取目标软件的最新版本号，存入 $GITHUB_ENV

```yaml
- name: Export latest geoip version
  run: |
    NEW_VERSION=`curl -s https://api.github.com/repos/{user_name}/{repo_name}/releases/latest | jq -r '.tag_name' | sed 's/v//g'`
    echo "NEW_VERSION=$NEW_VERSION" >> $GITHUB_ENV
```

当仓库内 spec 版本号与软件最新版本号不一致时，运行 rpmdev-bumpspec

```yaml
- name: Run rpmdev-bumpspec action
  if: ${{ env.CURRENT_VERSION != env.NEW_VERSION }}
  uses: netoarmando/rpmdev-bumpspec-action@v1
  with: 
    specfile: '{filename}'
    new: ${{ env.NEW_VERSION }}
    userstring: "username <username@mail.com>"
```

当仓库内 spec 版本号与软件最新版本号不一致时，保存更改，推入仓库。

```yaml
- name: Commit changes
  if: ${{ env.CURRENT_VERSION != env.NEW_VERSION }}
  run: |
    git config --local user.email "zhullyb@outlook.com"
    git config --local user.name "zhullyb"
    git add .
    git commit -m "upgpkg: v2ray-geoip@${{ env.NEW_VERSION }}"
    git push
```

（可选）当仓库内 spec 版本号与软件最新版本号不一致时，通过 curl 语句触发 copr 的 webhook，让 copr 进行构建。

```yaml
- name: trigger copr webhook
  if: ${{ env.CURRENT_VERSION != env.NEW_VERSION }}
  run: |
    curl -X POST ${{ secrets.COPR_HOOK_URL }}v2ray-geoip/
```

最终的 yml 文件可以参考[这里](https://github.com/v2rayA/v2raya-copr/blob/master/.github/workflows/upgpkg-v2ray-geoip.yml)
