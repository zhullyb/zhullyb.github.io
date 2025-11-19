---
title: repo笔记
date: 2020-07-11
tags:
      - Linux
      - Notes
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

