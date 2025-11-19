---
title: 'First Experience with GitHub Action Self-hosted Runner: Love is Not Easy'
date: 2025-09-05 05:54:17
sticky:
tags:
- Github
- Github Action
- CI/CD
- Experience
---

In August of this year, a GitHub Organization I'm part of frequently triggered CI during private project development, exhausting the [2,000 minutes of monthly Action quota](https://docs.github.com/en/get-started/learning-about-github/githubs-plans#github-free-for-organizations) provided by GitHub for the Free Plan (shared across all private repositories, public repositories don't count). After reviewing the CI workflow setup, which seemed reasonable, I needed to find alternative solutions to provide more generous resources. This led me to explore the [GitHub Action Self-hosted Runner](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners) mentioned in the article title.

Compared to GitHub's official runners, Self-hosted Runners offer several key advantages:

- Unlimited Action runtime for private repositories
- Ability to configure more powerful hardware computing power and memory
- Access to internal network environments, facilitating communication with intranet/LAN devices

## Configuration and Installation

Since I wasn't sure about the network environment requirements, I directly chose an idle Hong Kong VPS for this test, with specs of 4 cores, 4GB RAM, 80GB disk, and 1Gbps bandwidth. Aside from somewhat lacking disk read/write performance, everything else was maxed out.

The configuration of Self-hosted Runner itself is quite straightforward and clear, following the official guidelines without any issues.

![](https://static.031130.xyz/uploads/2025/09/05/7c0475cdb1aa9.webp)

All three mainstream platforms are supported, and if utilized properly, it should cover a range of needs including iPhone app packaging.

![](https://static.031130.xyz/uploads/2025/09/05/96ff7cb263da1.webp)

Looking at the runner installation file I received, version 2.328.0, the compressed package is around 220MB and includes built-in node20 and node24 runtime environments, two versions each.

![](https://static.031130.xyz/uploads/2025/09/05/f775e3bcd2cdc.webp)

![](https://static.031130.xyz/uploads/2025/09/05/d0d4fe4611a40.webp)

After executing config.sh, a svc.sh file appears in the current directory, which can be used to leverage systemd for process management and similar needs.

![](https://static.031130.xyz/uploads/2025/09/05/43c6b19038def.webp)

Refreshing the web page again shows that the Self-hosted Runner is now online.

![](https://static.031130.xyz/uploads/2025/09/05/6dad15beff900.webp)

## Specifying Actions to Use Your Own Runner

This step is simple - just change the runs-on field in the original Action's yml file:

```diff
jobs:
  run:
+    runs-on: self-hosted
-    runs-on: ubuntu-latest
```

## Real-World Testing

When I excitedly switched the CI workflow from GitHub's official runner to the self-hosted runner, problems quickly surfaced, and this is the main reason I "can't love it." The issues were concentrated in the `setup-python` GitHub Action Flow, which is maintained by GitHub officially, showing an error that version 3.12 wasn't found.

![](https://static.031130.xyz/uploads/2025/09/05/1c93947170a85.webp)

In GitHub's official virtual environment, these Actions prepare the specified version of the development environment for us. For example, `uses: actions/setup-python` combined with `with: python-version: '3.12'` automatically installs and configures Python 3.12.x in the environment. I had grown accustomed to this and considered it an "out-of-the-box" feature. However, on Self-hosted Runner, the situation is somewhat different. The setup-python [documentation](https://github.com/actions/setup-python/blob/main/docs/advanced-usage.md#using-setup-python-with-a-self-hosted-runner) states:

> Python distributions are only available for the same [environments](https://github.com/actions/runner-images#available-images) that GitHub Actions hosted environments are available for. If you are using an unsupported version of Ubuntu such as `19.04` or another Linux distribution such as Fedora, `setup-python` may not work.

The setup-python Action **only supports the same operating systems used by GitHub Actions**, and my VPS's Debian is not supported, hence this error, which also sealed Debian's fate.

## The Root Cause: Misunderstanding Self-hosted Runner

I subconsciously believed that Self-hosted Runner merely transferred the computational cost from GitHub's servers to local infrastructure, and that official standard actions like `actions/setup-python` should elegantly download, install, and configure everything I need, just like in GitHub-hosted Runners. However, **the essence of Self-hosted Runner is simply receiving tasks from GitHub and executing instructions within the current operating system environment**, without guaranteeing consistency with the runtime environment provided by GitHub's official Runners.

Self-hosted Runner is not an out-of-the-box "service," but rather **"infrastructure" that you need to personally manage**. You are responsible for server installation, configuration, security updates, dependency management, disk cleanup, and a series of operational tasks. It's more suitable for teams or individuals with advanced CI/CD requirements: such as heavy CI/CD consumers, teams needing specific hardware (like ARM, GPU) for builds, or enterprises whose CI workflows deeply depend on internal network resources. For ordinary developers like me who simply want to provide more local computing resources to gain more Action runtime, the operational mental burden it brings seems a bit heavy.
