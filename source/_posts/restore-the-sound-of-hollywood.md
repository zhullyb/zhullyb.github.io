---
title: 如何拯救失声的 hollywood
date: 2022-07-25 11:25:44
sticky:
execrpt:
tags:
- Fun
- Linux
---

我刚开始接触 Linux 下的 hollywood 时，我记得它运行时是有声音的，应该是 007 的主题音乐，如今再次装上 hollywood，却发现音乐没了。

在 Github 找到 hollywood，发现有一个 [issue](https://github.com/dustinkirkland/hollywood/issues/58) 也提到了这个问题。

原作者在该 issue 中回复道

> 没错，它只是一段视频，音频受到版权保护。

所以不难看出，作者因为版权问题而去掉了音频，进而导致 hollywood 失声。但我们作为用户，是不是可以想办法获取到老版本中那段带有音频的 mp4 文件呢？

答案是肯定的。

得益于 git 的版本控制特色，在 hollywood 的 github 仓库中，我们可以找到原来的 [mp4 文件](https://github.com/dustinkirkland/hollywood/blob/67839229f878a08521885e9fc05dd2d3ba10ddd1/share/hollywood/mi.mp4)。

下载这个 mp4 文件后，我们将其放入 `/usr/share/hollywood/` 路径下，重命名为 `soundwave.mp4`，并确保其被正确设定为 0644 权限。

```bash
sudo install -Dm644 ./mi.mp4 /usr/share/hollywood/soundwave.mp4
```

接下来试着跑一跑 `hollywood`，发现依然没有声音。再次查阅源码，发现缺少了 `mplayer` 这个依赖。

使用包管理器安装 `mplayer` 后，运行 `hollywood` 就可以听到声音了。

然而，你觉不觉得这个音乐。。。听上去怪怪的。。。

没错，作者在去掉音频后，给 `soundwave.mp4` [设定了加速播放](https://github.com/dustinkirkland/hollywood/commit/95f77d570d86cd8b8fe0e0939049609f81d1bae0#diff-3e2bf53af1a38136a109ac4fa1b11189e7b6fcd4385e1c68683093f73c6ac485)。而我们现在需要这段视频被原速播放。编辑 `/usr/lib/hollywood/mplayer`

```diff
#!/bin/bash
#
# Copyright 2014 Dustin Kirkland <dustin.kirkland@gmail.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
command -v mplayer >/dev/null 2>&1 || exit 1
trap "pkill -f -9 lib/hollywood/ >/dev/null 2>&1; exit" INT
PKG=hollywood
dir="$(dirname $0)/../../share/$PKG"
-DISPLAY= mplayer -vo caca -loop 0 -ss $((RANDOM % 100)) -speed 100 $MPLAYER_OPTS $dir/soundwave.mp4
+DISPLAY= mplayer -vo caca -loop 0 $MPLAYER_OPTS $dir/soundwave.mp4
```

再次运行，确认修改已经成功。
