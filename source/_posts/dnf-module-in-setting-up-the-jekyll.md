---
title: 在Fedora搭建jekyll环境——dnf module
date: 2022-01-12 22:11:42
sticky:
tags:
- Fedora
---

## 起因

我之前的博客一直用的是[这个主题](https://github.com/qiubaiying/qiubaiying.github.io)，直接使用 Fedora 官方源里的 `rubygem-jekyll` 似乎无法正常安装 Gemfile 中的依赖。之前使用 Archlinux 的时候，我是直接从 AUR 安装了一个 `ruby-2.6` 来使用的，但最近转到 Fedora 以后似乎就没法用这样的方案来解决了。

好在天无绝人之路，Fedora 也提供了安装老版本的 ruby 的方案——使用 dnf 的 module 功能。

## 关于 dnf module

关于 dnf 的 module 功能到底是用来做什么的，其实我并不清楚。虽说 Fedora 提供了[文档](https://docs.fedoraproject.org/en-US/modularity/)，但就凭我的读中文文档都吃力的水准，似乎没有办法通过英文文档来理解这个全新的概念，~~所以我选择直接莽过去~~。

就我目前的理解而言，dnf 的 module 似乎并不致力于帮助用户完成系统内某一程序的新老版本共存的难题，而仅仅是给用户提供了停留在老版本软件的权利。module 所负责的，是保证老版本的程序能在你的系统上正常运行起来，而不会因为其他组件的更新而导致老版本的程序无法正常使用。

### 基本的使用方法

通过下列命令可以查看目前所支持的 module

```bash
sudo dnf module list
```

通过下列命令可以选择 module 所要停留的版本( 以 ruby 2.7 为例 )

```bash
sudo dnf module enable ruby:2.7
```

通过下列命令可以取消锁定 module 程序所要停留的版本( 以 ruby 为例 )

```bash
sudo dnf module reset ruby
```

## 开始配置该 jekyll 主题的运行环境

```bash
sudo dnf module install ruby:2.7
sudo dnf install ruby-devel

cd /path/to/the/jekyll-blog/
bundle install --path vendor/bundle
```

完成后，我们即可在 jekyll-blog 目录下 使用 `bundle exec jekyll` 来正常运行 jekyll 了。试着跑一下 `bundle exec jekyll server`

![成功，彻彻底底！](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f3caeec8ef6.webp)

## 参考材料

[Fedora Docs](https://docs.fedoraproject.org/en-US/modularity/)

[openSUSE 中文社区主页贡献指南](https://github.com/openSUSE-zh/page-opensuse-zh/blob/main/CONTRIBUTING.md)

[Switching to use Ruby 2.7 (or older) in Fedora 34 using DNF Modules](https://blog.kagesenshi.org/2021/05/ruby24-fedora34.html) 「[WebArchive](https://web.archive.org/web/20220112143005/https://blog.kagesenshi.org/2021/05/ruby24-fedora34.html)」
