---
title: 以 Archlinux 中 makepkg 的方式打开 rpmbuild
date: 2024-05-03 22:48:39
sticky:
execrpt:
tags:
- Archlinux
- Fedora
- RPM Package
- Linux
---

在 Redhat 系的发行版上打包软件的时候，会发现与 Archlinux 完全不同的思路。

Fedora 所代表的 Redhat 阵营一看就是那种宏大叙事的大型发行版，rpmbuild 在默认情况下会在 $HOME/rpmbuild 下的一系列文件夹进行构建过程。使用 `rpmdev-setuptree` 命令会创建好下面这些目录进行构建。

```bash
$ tree rpmbuild
rpmbuild
├── BUILD
├── BUILDROOT
├── RPMS
├── SOURCES
├── SPECS
└── SRPMS
```

Fedora 将所有的软件的构建都集中在一个 rpmbuild 目录中，BUILD 是编译时使用的，BUILDROOT 是最终安装目录，RPMS 是存放最终产物的，SOURCES 是存放源码等文件的，SPECS 是存放指导构建过程的 spec 文件的，而 SRPMS 是 RH 系为了 reproducibility 而单独将 spec 和源文件打包的产物。除了 rpmbuild 命令以外，Fedora 还有一套使用容器构建 rpm 包的 [mock](https://fedoraproject.org/wiki/Using_Mock_to_test_package_builds) 构建系统，与 Archlinux 的 [devtools](https://archlinux.org/packages/extra/any/devtools/) 类似，这里不作过多叙述。

反观 Arch 的构建目录，~~就有一股浓浓的小作坊气味~~。每个软件包自己拥有一个目录，指导构建过程的 PKGBUILD 文件、源文件和最终的产物都放在这个目录下，目录下的 src 和 pkg 文件夹分别对应 rpm 的 BUILD 和 BUILDROOT，前者是源文件被解压的目录和编译过程进行的目录，后者是软件最终的安装目录。

```bash
$ tree repo
repo
├── src
├── pkg
└── PKGBUILD
```

好巧不巧，我偏偏习惯这个小作坊气息的 arch build system，每个软件包独享一个自己的目录，~~干净又卫生~~。我自然也希望在 Fedora 下打 rpm 包的时候能够使用类似 Archlinux 下 makepkg 使用的目录结构。

## 简单了解

在了解一系列 rpmbuild 中宏（macros）相关的知识后，我意识到这并非不可能。

使用如下的命令可以获取目前系统中定义的所有宏

```bash
rpm --showrc
```

而可以使用如下命令检查某一个宏目前被定义成了什么值

```bash
rpm --eval "%{_topdir}"
```

更多关于宏的描述可以在 https://rpm-software-management.github.io/rpm/manual/macros.html 获取

## 修改路径

我们可以把定义成 $HOME/rpmbuild 的 %_topdir 重新定义成当前目录。

在 $HOME/.rpmmacros 中，去除顶部对 %_topdir 的定义，重新填上以下这些定义，即可初步完成我想要的效果。

```
%_topdir    %(pwd)
%_builddir %{_topdir}/src
%_buildrootdir %{_topdir}/pkg
%_rpmdir %{_topdir}
%_sourcedir %{_topdir}
%_specdir %{_topdir}
%_srcrpmdir %{_topdir}
```

现在在任何一个目录下执行 rpmbuild 相关命令，都会把 src 认为是构建目录，pkg 是最后安装目录，spec 文件和源文件早当前文件夹下，构建产物在当前文件夹下的 x86_64（或者别的架构名，这一层目录我还没有找到应该如何去掉）下。

## 自动安装依赖文件

Fedora 中的 rpmbuild 不带有 makepkg -s 的功能，不能自动安装依赖。不过这也不意味着需要自己傻傻地去翻 spec 看看需要哪些构建依赖。可以使用 dnf 的 builddep 命令实现

```bash
sudo dnf builddep ./*.spec
```

不过 dnf 没有什么完成构建后自动卸载依赖的选项。~~这些依赖装完以后就一辈子赖在你的电脑上了~~，才不是，可以在构建完成后使用 dnf 自带的后悔药功能撤销上一条命令执行的效果。

```bash
sudo dnf history undo 0
```

不过如果在 builddep 过程中，dnf 从 updates 源里更新了一些软件，那么它在 undo 时可能就没法获取更新前的软件版本。会有 `Cannot find rpm nevra`  的提示

![](https://cdn.zhullyb.top/uploads/2024/08/12/6635018238ffa.webp)

可以使用 `--skip-broken` 命令跳过那些没法找到老版本的软件，继续卸载其余的软件。

## 自动下载源文件

很多使用 spec 中会在 source 里写上下载地址，而不是附上源码文件。rpm 似乎因为一些原因禁止了 rpmbuild 自动下载源文件的功能。可以通过在使用 rpmbuild 的时候带上 `--undefine=_disable_source_fetch` 取消定义这个行为，或者干脆在调用 rpmbuild 之前执行一遍

```bash
spectool -gR *.spec
```

这样也能自动下载源文件。

## 构建行为

makepkg 的默认构建行为就是只构建最终的安装包，Archlinux 中并没有 Fedora 那样打 source rpm 保证 reproduceability 的行为，这在 rpmbuild 中对应的是 `-bb` 选项。

使用 `rpmbuild -bb *.spec` 即可

***

上面介绍完了 rpmbuild 和 makepkg 的主要差异，应该可以自己搓一个 rpmbuild-wrapper 去实现以 makepkg 的方式打开 rpmbuild 的目标了，具体的 wrapper 脚本我就不放出来献丑了。
