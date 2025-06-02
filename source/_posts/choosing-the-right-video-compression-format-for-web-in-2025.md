---
title: 2025 年，如何为 web 页面上展示的视频选择合适的压缩算法？
date: 2025-06-02 20:59:10
sticky:
tags:
- HTML
- Web
- Network
---

事情的起因是需要在网页上展示一个时长约为 5 分钟的产品展示视频，拿到的 H264 编码的原文件有 60MB 大。高达 1646 Kbps 码率的视频文件通过网络传输，烧 cdn 流量费用不说，对于弱网环境下的用户体验也绝对不会好。因此必须在兼顾浏览器兼容性（太好了不用管 IE）的情况下，使用更现代的视频压缩算法进行压缩。

## 哪些压缩算法是目前的主流？

### AV1

AV1 作为目前压缩效率最高的主流视频编码格式，在 2025 年的今天已经在 YouTube、Netflix、Bilibili 等视频网站全面铺开，毫无疑问是最值得优先考虑的选择；除了优异的压缩效率以外，AV1 免版税的优势使得各硬件厂商和浏览器内核开发者可以无所顾忌的将 AV1 编码的支持添加到自己的产品中。

![](https://static.031130.xyz/uploads/2025/06/02/aec1af1718064.webp)

![](https://static.031130.xyz/uploads/2025/06/02/76a312b5a668b.webp)

可惜的是，Safari 并没有对 AV1 编码添加软解支持，只有在搭载 Apple M3 及后续生产的 Mac 和 iPhone 15 Pro 后续的机型才拥有硬解 AV1 的能力，在此之前生产的产品均无法使用 Safari 播放 AV1 编码的视频。~~我宣布 Safari 已经成为当代 IE，妥妥阻碍 Web 发展的绊脚石~~

![Safari 在搭载 M2Pro 处理器的 Macbook Pro 上直接罢工了](https://static.031130.xyz/uploads/2025/06/02/01ddcc3948406.webp)

除此之外，AV1 在压制视频时对设备的要求较高。在桌面端的消费级显卡中，目前只有 NVIDIA RTX 40 系、AMD Radeon RX 7000 系、IntelArc A380 及后续的产品拥有 AV1 的编码（encode）支持。而 Apple M 系列芯片至今没有任何一款产品拥有对 AV1 编码的硬件支持。这也导致我在我搭载 Intel Core i7-1165G7 的 ThinkPad 上使用 AV1 编码压缩视频时被迫使用 libaom-av1 进行软件编码，1080p 的视频压缩效率为 0.0025x 的速率，五分钟的视频要压一天多的时间。

![](https://static.031130.xyz/uploads/2025/06/02/923ca02e1d835.webp)

### H.265 / HEVC

作为 H.264 / AVC 的下一代继任者，H.265（又称 HEVC）的表现可谓是一手好牌打得稀巴烂。HEVC 由多个专利池（如 MPEG LA、HEVC Advance 和 Velos Media）管理，授权费用高且分散，昂贵的专利授权费用严重限制了它的普及速度和范围，尤其是在开放生态和网页端应用中。

Chromium / Firefox 不愿意当承担专利授权费的冤大头，拒绝在当今世界最大的两个开源浏览器内核中添加默认的 H.265 软解支持，目前主流浏览器普遍采用**能硬解就硬解，硬解不了就摆烂**的支持策略。Firefox on Linux 倒是另辟蹊径，不仅会尝试使用硬解，还会尝试使用用户在电脑上装的 ffmpeg 软解曲线救国。不过好在毕竟是 2013 年就确定的标准，现在大部分硬件厂商都集体被摁着脖子交了专利授权费以保证产品竞争力，Apple 更是 HEVC 的一等公民，保证了全系产品的 HEVC 解码能力。

目前未覆盖到的场景主要是 Chromium / Firefox on Windows 7 和 Chromium on Linux（包括 UOS、麒麟等一众国产 Linux 发行版）。

![在 Linux 上不支持硬解 H.265 的 Chrome 直接把视频当作音频播放了](https://static.031130.xyz/uploads/2025/06/02/2e8e5100f645a.webp)

### VP9

VP9 是 Google 于 2013 年推出的视频编码格式，作为 H.264 的继任者之一，在压缩效率上接近 H.265（HEVC），但最大的杀手锏是——**彻底免专利费**。这也让 VP9 成为 Google 对 HEVC 高额授权费用的掀桌式回应：**你们慢慢吃，我开一桌免费的。**

![](https://static.031130.xyz/uploads/2025/06/03/a9b473a3bd120.webp)

借着免专利的东风和 Google 自家产品矩阵的强推，VP9 在 YouTube、WebRTC 乃至 Chrome 浏览器中迅速站稳了脚跟。特别是在 AV1 普及之前，VP9 几乎是网页视频播放领域的事实标准，甚至逼得苹果这个“编解码俱乐部元老”在 macOS 11 Big Sur 和 iOS 14 上的 Safari 破天荒地加入了 VP9 支持（尽管 VP9 in webm 的支持稍晚一些，具体见上表）。

VP9 的软解码支持基本无死角：Chromium、Firefox、Edge 都原生支持，Safari 也一反常态地“从了”。硬件解码方面，从 Intel Skylake（第六代酷睿）开始，NVIDIA GTX 950 及以上、AMD Vega 和 RDNA 系显卡基本都具备完整的 VP9 解码能力——总之，只要不是博物馆级别的老电脑，就能愉快播放 VP9 视频。

当然，编码仍是 VP9 的短板。Google 官方提供的开源实现 libvpx，速度比不上 x264/x265 等老牌选手，在缺乏硬件加速的场景下，仍然属于“关机前压一宿”的那种体验。不过相比 AV1 的 libaom-av1，VP9 至少还能算“可用”，适合轻量化应用、实时通信或是对压制速度敏感的用户，而早在 7 代 Intel 的 Kaby Lake 系列产品就已经引入了 VP9 的硬件编码支持，各家硬件厂商对 VP9 硬件编码的支持发展到今天还算不错。

### H.264 / AVC

作为“老将出马一个顶俩”的代表，H.264 / AVC 无疑是过去二十年视频编码领域的霸主。自 2003 年标准确定以来，凭借良好的压缩效率、广泛的硬件支持和相对合理的专利授权策略，H.264 迅速成为从网络视频、蓝光光盘到直播、监控乃至手机录像的默认选择。如果你打开一个视频网站的视频流、下载一个在线视频、剪辑一个 vlog，大概率都绕不开 H.264 的身影。

H.264 的最大优势在于——**兼容性无敌**。不夸张地说，只要是带屏幕的设备，就能播放 H.264 视频。软解？早在十几年前的浏览器和媒体播放器中就已普及；硬解？从 Intel Sandy Bridge、NVIDIA Fermi、AMD VLIW4 这些“史前”架构开始就已加入对 H.264 的完整支持——你甚至可以在树莓派、智能冰箱上流畅播放 H.264 视频。

虽然 H.264 同样存在和 H.265 相同的专利问题，但其授权策略明显更温和——MPEG LA 提供的专利池授权门槛较低，且不向免费网络视频收取费用，使得包括 Chromium、Firefox 在内的浏览器都默认集成了 H.264 的软解功能。Apple 和 Microsoft 更是早早将其作为视频编码和解码的第一公民，Safari 和 Edge 天生支持 H.264，不存在任何兼容性烦恼。

当然，作为一项 20 多年前的技术，H.264 在压缩效率上已经明显落后于 VP9、HEVC 和 AV1。相同画质下，H.264 的码率要比 AV1 高出 30～50%，在追求极致带宽利用或存储节省的应用场景中就显得有些力不从心。然而在今天这个“能播比好看更重要”的现实环境中，H.264 依然是默认方案，是“稳健老哥”的代名词。

所以，即便 AV1、HEVC、VP9 各有亮点，H.264 依旧凭借“老、稳、全”三大核心竞争力，在 2025 年依然牢牢占据着视频生态链的中枢地位——只要这个世界还有浏览器不支持 AV1（可恶的 Safari 不支持软解），服务器不想烧钱转码视频，或用户设备太老，H.264 就不会退场。

### 小结

在视频编码方面，浏览器不再是那个能靠一己之力抹平硬件和系统差异的超人，所以总有一些特殊情况是表格中无法涵盖的。

| 编解码器     | 压缩效率 | 浏览器            | 桌面端支持                                                 | 移动端支持                                       | 备注                                                         |
| ------------ | -------- | ----------------- | ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| AV1          | ★★★      | Chrome / Chromium | 是 (v70+，发布于 2018 年 10 月)                            | 是 (v70+，发布于 2018 年 10 月)                  | 硬解优先，软解后备                                           |
|              |          | Firefox           | 是 (v67+，发布于 2019 年 5 月)                             | 是 (v113+，发布于 2023 年 5 月)                  | 硬解优先，软解后备                                           |
|              |          | Safari            | 不完全支持 (仅近两年的产品支持)                            | 不完全支持 (仅近两年的产品支持)                  | **仅支持硬解** (M3, A17 Pro 系芯片后开始支持)，**无软解支持** |
| HEVC (H.265) | ★★☆      | Chrome / Chromium | 不完全支持                                                 | 不完全支持                                       | **仅支持硬解，无软解支持**（Windows 可从微软商店安装付费的软解插件） |
|              |          | Firefox           | 不完全支持                                                 | 不完全支持                                       | **仅支持硬解，无软解支持**（Linux 可依赖系统 ffmpeg 实现软解） |
|              |          | Safari            | 近期设备全部支持 (macOS High Sierra+，发布于 2017 年 6 月) | 近期设备全部支持 (iOS 11+，发布于 2017 年 10 月) | 苹果是 H.265 一等公民                                        |
| VP9          | ★★☆      | Chrome / Chromium | 是                                                         | 是                                               | 支持良好                                                     |
|              |          | Firefox           | 是                                                         | 是                                               | 支持良好                                                     |
|              |          | Safari            | 是 (v14.1+，发布于 2021 年 4 月)                           | 是 (iOS 17.4+，发布于 2024 年 3 月)              | 支持稍晚（此处指兼容 vp9 的 webm 时间，vp9 in WebRTC 的兼容时间更早） |
| H.264 (AVC)  | ★☆☆      | Chrome / Chromium | 是                                                         | 是                                               | 通用                                                         |
|              |          | Firefox           | 是                                                         | 是                                               | 通用                                                         |
|              |          | Safari            | 是                                                         | 是                                               | 通用                                                         |

## 怎么选？

我们不是专业的视频托管平台，不像 YouTube、Bilibili 那样专业到可以向用户提供多种分辨率、压缩算法的选择。

![Bilibili 为用户提供了三种压缩算法](https://static.031130.xyz/uploads/2025/06/03/096484dbc0f3a.webp)

最终的选择策略，必须在**压缩效率、播放兼容性、编码耗时**等维度之间做出权衡。

### 选择一：AV1 挑大梁，H.264 保兼容

现代浏览器支持在 `<video>` 标签中使用 `<source>` 标签和 MIME type 让浏览器按需播放

```html 
<video controls poster="preview.jpg">
  <source src="video.av1.webm" type='video/webm; codecs="av01"' />
  <source src="video.h264.mp4" type='video/mp4' />
  当前浏览器不支持视频播放
</video>
```

通过这样的写法，浏览器会自动选择最先能解码的 `source`，无需写复杂的判断逻辑或使用 JavaScript 动态切换。默认的 AV1 编码在最大程度上减少了传输流量降低成本，享受现代浏览器与设备的压缩红利；而 H.264 则作为兜底方案，保证了在不支持 AV1 的 Safari 等老旧设备上的回放兼容性。

然而这个选择可能并不是太合适，一方面我手上最先进的处理器 Apple M4 并不支持硬件编码 AV1 视频，5 分钟的视频压完需要整整 3 个小时，如果还需要视压缩质量来回调整压缩参数重新压上几次，那可真是遭老罪了；另一方面，即使 Chromium / Firefox 等主流浏览器内核现在都支持 AV1 的软解，但在一些硬件较老的设备上播放 AV1 编码的视频可能让用户的电脑风扇原地起飞，这一点在 YouTube 大力推广 AV1 的时候就曾遭到不少用户的诟病。

### 选择二：VP9 独挑大梁

考虑到 AV1 编码的高昂成本和~~用户电脑风扇原地起飞的风险~~，VP9 也是一个非常具有竞争力的选择。VP9 在主流浏览器中得到了非常好的兼容，因此可以考虑放弃 H.264 的 fallback 方案独挑大梁。而 VP9 硬件编码在近几年的硬件设备上的普遍支持也给足了我勇气，让我可以多次调整压缩质量重新压缩，找一个在文件体积和画面清晰度之间的 sweet point。

*由于是 VP9 独挑大梁，因此大多数人可能会考虑使用与 VP9 最为适配的 webm 格式封装视频。但目前在 webm 中最广泛使用的音频编码 opus 在 Safari 上的兼容性并不是太好（在 2024 年 3 月发布的 Safari 17.4 才开始支持），建议斟酌一下是不是继续用回 AAC 编码，并将视频封装在 mp4 中。*

![https://caniuse.com/opus](https://static.031130.xyz/uploads/2025/06/03/ec3b5dbcbcc29.webp)

## 音频码率太高？再砍一刀

上面说了那么多的视频压缩算法，其实只是局限于视频画面的压缩，音频这一块其实还能再压一点出来。

```
Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 128 kb/s (default)
```

一个介绍产品的视频，在音频部分采用了 48000 Hz 双声道采样，码率高达 128 kbps，说实话有点奢侈。我直接砍成 64 kbps 单声道，又省下 2MB 的文件大小。

## 写在最后

对于前端开发者来说，视频压缩算法的选择早已不是单纯的“压得小不小”问题，而是一场在设备能力、浏览器兼容性、用户体验与开发成本之间的博弈。我们既要跟上技术演进的节奏，拥抱 AV1、VP9 等更高效的编解码器，也要在实际项目中照顾到现实中的设备分布和播放环境。

在理想与落地之间，我们所能做的，就是充分利用 HTML5 提供的容错机制，搭配好合适的编码策略和封装格式，让网页上的每一段视频都能在合适的设备上、以合理的代价播放出来。

毕竟，Web 从来不缺“能不能做”，缺的是“做得优雅”。如果说编码器是硬件工程师和视频平台的战场，那 `<video>` 标签下的这几行 `<source>`，才是属于我们前端工程师的战壕。

## 参见

- [网页视频编码指南 - Web 媒体技术 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/Media/Guides/Formats/Video_codecs)
- [Encoding & Quality - Netflix Research](https://research.netflix.com/research-area/video-encoding-and-quality)
- [How the VP9 Codec Supports Now Streaming to Apple Devices & More | dolby.io](https://optiview.dolby.com/resources/blog/playback/how-the-vp9-codec-supports-now-streaming-to-apple-devices-more/)
- [Audio/Video | The Chromium Project](https://www.chromium.org/audio-video/)
- [AV1 video format | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/av1)
- [WebM video format | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/webm)
- [HEVC/H.265 video format | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/hevc)
- [Opus audio format | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/opus)
- [MPEG-4/H.264 video format | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/mpeg4)
- [AV1 - Wikipedia](https://en.wikipedia.org/wiki/AV1)
- [High Efficiency Video Coding - Wikipedia](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding)
- [VP9 - Wikipedia](https://en.wikipedia.org/wiki/VP9)
- [Advanced Video Coding - Wikipedia](https://en.wikipedia.org/wiki/Advanced_Video_Coding)
- [Encode and Decode Capabilities for 7th Generation Intel® Core™...](https://www.intel.com/content/www/us/en/developer/articles/technical/encode-and-decode-capabilities-for-7th-generation-intel-core-processors-and-newer.html)
- [macOS High Sierra - 维基百科，自由的百科全书](https://zh.wikipedia.org/zh-cn/MacOS_High_Sierra)
- [Chrome 70 adds AV1 video support, improves PWAs on Windows, and more [APK Download]](https://www.androidpolice.com/2018/10/17/chrome-70-adds-av1-video-support-improves-pwas-windows-apk-download/)
- [Firefox for Android 113.0, See All New Features, Updates and Fixes](https://www.mozilla.org/en-US/firefox/android/113.0/releasenotes/)
- [视频网站的“蓝光”是怎么骗你的？——视频画质全解析【柴知道】_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1nW4y1V7kR/)
- 《4K 清晰度不如4年前，视频变糊是你的错觉吗》- 原视频已 404
