---
title: repo笔记
date: 2020-07-11
description: 本文介绍了在使用 repo 工具进行代码同步时的两个实用技巧：如何清理同步过程中产生的不完整碎片文件，以及如何编写自动化脚本以提高同步效率。针对常见的 tmp_pack 碎片文件问题，提供了查找和删除的具体命令；同时，还详细讲解了如何编写一个自动重试的 repo 同步脚本，以应对网络不稳定导致的同步失败。适合经常使用 repo 进行大型代码库管理的开发者阅读，帮助提升工作流程的稳定性和效率。
tags: 
      - Linux
      - 笔记
---


### 清除同步过程中产生的不完整碎片文件

在```源码路径/.repo```下搜索tmp_pack
将搜索结果中出现的所有文件全部删除

以下命令仅供参考

```bash
rm -rf */*/*/*/objects/pack/tmp_pack_*
```

### repo自动同步

##### 下载脚本

```shell
echo #!/bin/bash
echo "======start repo sync======"
repo sync  --force-sync --current-branch --no-tags --no-clone-bundle --optimized-fetch --prune -j$(nproc --all)
while [ $? == 1 ]; do
echo "======sync failed, re-sync again======"
sleep 3
repo sync  --force-sync --current-branch --no-tags --no-clone-bundle --optimized-fetch --prune -j$(nproc --all)
done
> repo.sh
```

**授予运行权限**

```bash
chmod a+x repo.sh
```

##### 运行脚本

```shell
bash repo.sh
```

