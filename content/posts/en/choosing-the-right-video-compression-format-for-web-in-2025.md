---
title: In 2025, How to Choose the Right Video Compression Algorithm for Web Pages?
date: 2025-06-02 20:59:10
sticky:
tags:
- HTML
- Web
- Network
---

The issue arose from the need to display a ~5‑minute product showcase video on a webpage. The original H.264-encoded file weighed 60 MB, with a bitrate of 1646 kbps—impractical for network delivery: not only does it inflate CDN bandwidth costs, but it also severely degrades the user experience under weak network conditions. Thus, we must compress the video using more modern codecs while ensuring broad browser compatibility (fortunately, IE is no longer a concern).

## What Are the Mainstream Compression Algorithms Today?

### AV1

As of 2025, AV1 stands as the most compression-efficient mainstream video codec. It has been fully adopted by major platforms such as YouTube, Netflix, and Bilibili, making it the top choice for new deployments. Beyond its superior compression, AV1’s royalty-free status encourages hardware vendors and browser developers to integrate support freely—both in hardware and software.

![](https://static.031130.xyz/uploads/2025/06/02/aec1af1718064.webp)
![](https://static.031130.xyz/uploads/2025/06/02/76a312b5a668b.webp)

Unfortunately, Safari still lacks *software* decoding for AV1. Only Apple devices with M3 (or later) chips and iPhone 15 Pro (or later) support *hardware* AV1 decoding. Older Apple devices simply cannot play AV1 videos in Safari.
*(Let’s just say Safari has become the modern-day IE—a clear roadblock to Web advancement.)*

![Safari fails outright on a MacBook Pro with an M2 Pro chip.](https://static.031130.xyz/uploads/2025/06/02/01ddcc3948406.webp)

Beyond playback compatibility, AV1 encoding is demanding. Among consumer GPUs, only NVIDIA RTX 40-series, AMD RX 7000-series, and Intel Arc A380 (and newer) support *hardware* AV1 *encoding*. Apple’s M-series chips still offer *no* AV1 encoding hardware acceleration whatsoever. On my ThinkPad with an Intel Core i7‑1165G7, software encoding via `libaom-av1` crawls at ~0.0025× real-time speed—compressing a 5‑minute 1080p video takes over a full day.

![](https://static.031130.xyz/uploads/2025/06/02/923ca02e1d835.webp)

### H.265 / HEVC

As the official successor to H.264, HEVC (H.265) has arguably squandered its potential. It is governed by multiple patent pools (e.g., MPEG LA, HEVC Advance, Velos Media), resulting in fragmented and costly licensing terms. These high licensing fees have drastically limited its adoption—especially in open ecosystems and web contexts.

Chromium and Firefox refuse to shoulder HEVC licensing costs, so they do *not* ship with built-in HEVC *software* decoders. Browsers today generally follow a **“hardware decode if possible; otherwise, give up”** policy. Firefox on Linux, however, tries a workaround: if hardware decode fails, it leverages system-installed FFmpeg for software decoding. Fortunately, HEVC—standardized in 2013—has now gained near-universal hardware decode support: Apple treats HEVC as a first-class citizen, supporting it across its entire product lineup.

Uncovered edge cases remain: Chromium/Firefox on Windows 7, and Chromium on Linux (including domestic Chinese distros like UOS and Kylin).

![Chrome on Linux, lacking HEVC hardware decode, mistakenly treats the video as audio-only.](https://static.031130.xyz/uploads/2025/06/02/2e8e5100f645a.webp)

### VP9

VP9, introduced by Google in 2013, serves as one of H.264’s successors. Its compression efficiency rivals HEVC—yet its biggest advantage is being **completely royalty-free**. VP9 was Google’s defiant response to HEVC’s licensing hurdles: *“You keep feasting on royalties; I’ll host a free buffet.”*

![](https://static.031130.xyz/uploads/2025/06/03/a9b473a3bd120.webp)

Thanks to its zero-cost licensing and aggressive promotion across Google’s ecosystem (YouTube, WebRTC, Chrome), VP9 quickly became the de facto standard for web video—especially before AV1’s rise. In fact, it even pressured Apple—longtime gatekeeper of proprietary codecs—to add VP9 support to Safari in macOS 11 (Big Sur) and iOS 14 (though WebM container support arrived slightly later).

VP9 enjoys near-universal *software* decode support: Chromium, Firefox, Edge, and even Safari include native support. Hardware decode support is also widespread: Intel Skylake (6th Gen Core) and later, NVIDIA GTX 950+, and AMD Vega/RDNA GPUs all support full VP9 decode. Unless you're running museum-grade hardware, VP9 playback “just works.”

Encoding remains VP9’s weak point—Google’s reference encoder, `libvpx`, lags behind `x264`/`x265` in speed. Without hardware acceleration, VP9 encoding can still take hours. Still, compared to AV1, VP9 is far more usable: Intel introduced VP9 *hardware encoding* as early as Kaby Lake (7th Gen Core), and vendor support has matured significantly since.

### H.264 / AVC

H.264—the venerable veteran—remains the undisputed champion of video codecs over the past two decades. Since its standardization in 2003, it has dominated everything: web streaming, Blu-ray, live broadcasts, surveillance, and smartphone recording.

Its unbeatable strength? **Universal compatibility**. Almost any screen-equipped device can decode H.264. *Software* decode has been standard in browsers and players for well over a decade; *hardware* decode dates back to Intel Sandy Bridge, NVIDIA Fermi, AMD VLIW4—and even Raspberry Pis or smart refrigerators can handle it.

While H.264 does involve patents, its licensing is comparatively pragmatic: MPEG LA’s pool is affordable, and free online video streaming incurs no fees. Thus, Chromium, Firefox, Safari, and Edge all ship with H.264 software decode built in.

That said, as a 20‑year‑old codec, H.264 lags far behind VP9, HEVC, and AV1 in compression efficiency. At equivalent quality, H.264 typically needs 30–50% higher bitrates than AV1—making it suboptimal for bandwidth- or storage-constrained scenarios. Yet in today’s pragmatic world—where *playability beats perfection*—H.264 remains the default fallback, the “reliable old workhorse”.

So even as AV1, HEVC, and VP9 gain ground, H.264 retains its central role in the video ecosystem—so long as some browsers lack AV1 support (looking at you, Safari), servers want to avoid costly transcoding, or users still run legacy devices.

### Summary

Browsers can no longer singlehandedly abstract away hardware and OS discrepancies. Real-world edge cases persist beyond what compatibility tables can capture.

| Codec          | Compression Efficiency | Browser Support                                                                 | Desktop Support                                                                                           | Mobile Support                                                                                      | Notes                                                                                      |
|----------------|------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| **AV1**        | ★★★                    | Chrome / Chromium: ✅ v70+ (Oct 2018)                                            | ✅ (hardware preferred, software fallback)                                                               | ✅                                                                                                 | Safari: hardware-only (M3/A17 Pro+); **no software decode**                             |
|                |                        | Firefox: ✅ v67+ (May 2019) desktop; ✅ v113+ (May 2023) Android                 |                                                                                                           |                                                                                                     |                                                                                           |
| **HEVC (H.265)** | ★★☆                  | Chrome / Chromium: ⚠️ hardware decode only (no software, unless via MS Store plugin on Windows) | ⚠️                                                                                                      | ⚠️                                                                                                | Firefox: hardware decode only; Linux may fall back to system FFmpeg                    |
|                |                        | Safari: ✅ full support (macOS 10.13+/iOS 11+, 2017)                              |                                                                                                           |                                                                                                     | Apple is HEVC’s strongest advocate                                                      |
| **VP9**        | ★★☆                    | Chrome / Chromium / Firefox / Edge: ✅                                           | ✅ (Intel Skylake+, NVIDIA GTX 950+, AMD Vega/RDNA)                                                     | ✅                                                                                                 | Safari: ✅ (v14.1+/iOS 17.4+, 2021–2024; WebM support slightly later)                   |
| **H.264 (AVC)** | ★☆☆                   | ✅ All major browsers (desktop & mobile)                                         | ✅ (Intel Sandy Bridge+, NVIDIA Fermi+, AMD VLIW4+, Raspberry Pi, etc.)                                 | ✅                                                                                                 | Universal fallback; “if it plays anywhere, it’s H.264”                                 |

## How to Choose?

We aren’t a professional video platform like YouTube or Bilibili, capable of offering users multiple resolutions and codec options.

![Bilibili offers three codec options for the same video.](https://static.031130.xyz/uploads/2025/06/03/096484dbc0f3a.webp)

Our final strategy must balance **compression efficiency**, **playback compatibility**, and **encoding time**.

### Option 1: AV1 as Primary, H.264 as Fallback

Modern browsers support multiple `<source>` elements inside `<video>`, letting the browser pick the first playable one:

```html
<video controls poster="preview.jpg">
  <source src="video.av1.webm" type='video/webm; codecs="av01"' />
  <source src="video.h264.mp4" type='video/mp4; codecs="avc1"' />
  Your browser does not support video playback.
</video>
```

This approach leverages AV1 for bandwidth savings on modern devices, while H.264 ensures compatibility on older browsers (e.g., legacy Safari). No JavaScript or complex detection logic is needed.

However, this may not be ideal for us:
- My top-end Apple M4 MacBook still lacks *AV1 hardware encoding*—a 5‑minute encode takes ~3 hours via software.
- Iterative tuning (adjusting CRF, bitrate, etc.) would be painfully slow.
- Even with AV1 *decode* supported in Chromium/Firefox, older hardware may suffer high CPU usage—leading to fan noise and complaints (as seen during YouTube’s AV1 rollout).

### Option 2: VP9 as the Sole Choice

Given AV1’s encoding costs and playback burdens, VP9 emerges as a compelling alternative. Its browser support is robust, eliminating the need for an H.264 fallback. Moreover, VP9 *hardware encoding* is now widely available on recent CPUs/GPUs—enabling rapid iteration to find the optimal trade-off between file size and visual quality.

> *Note*: While VP9 is most commonly packaged in WebM, the Opus audio codec (standard in WebM) still has spotty Safari support (only since Safari 17.4, March 2024). Consider using AAC audio in an MP4 container for broader compatibility.

![Opus audio codec browser support (Can I Use)](https://static.031130.xyz/uploads/2025/06/03/ec3b5dbcbcc29.webp)

## Audio Bitrate Too High? Trim It Further

So far, we’ve focused on *video* compression, but the *audio* track offers room for savings too.

```
Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 128 kb/s (default)
```

For a product demo video, 128 kbps stereo AAC is excessive. Switching to 64 kbps mono saved an additional ~2 MB—without perceptible quality loss in narration-heavy content.

## Final Thoughts

For frontend developers, selecting a video codec is no longer just about “smallest file size”. It’s a balancing act among device capabilities, browser support, user experience, and development overhead.

We must embrace modern codecs like AV1 and VP9 *where feasible*, yet remain grounded in real-world constraints. HTML5’s `<source>` fallback mechanism empowers us to deliver elegant, resilient video experiences—even as the underlying codec landscape fragments.

After all, the Web has never lacked *possibility*—what’s rare is *elegance in execution*. If codec development is the domain of hardware engineers and video platforms, then those few lines of `<source>` within a `<video>` tag?
That’s *our* trench—the frontend engineer’s battlefield.

## References

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
- “Why 4K Today Looks Worse Than 4 Years Ago” (original video unavailable)
