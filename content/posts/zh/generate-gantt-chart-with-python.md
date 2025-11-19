---
title: 使用 Python 生成甘特图(Gantt Chart)
date: 2024-04-24 12:02:58
sticky:
index_img: https://static.031130.xyz/uploads/2024/08/12/662890f78f1da.webp
tags:
- Python
---

在写操作系统的作业的时候有几道题给出了几个进程的相关信息，要求我们画出几种简单调度的甘特图。操作系统的作业一直是电子版，上传 pdf 即可的。我觉得手画甘特图拍照嵌入 pdf 中不太优雅，过于掉价，因此就想直接生成甘特图嵌入。

在谷歌搜寻了一番，我发现现在的甘特图生成网站都太现代化了，根本不是操作系统课上教的样子了。

![现代化的甘特图](https://static.031130.xyz/uploads/2024/08/12/662888bd5a0af.webp)

所幸我找到了 [gao-keyong/matplotlib-gantt](https://github.com/gao-keyong/matplotlib-gantt/)，虽然只有两个 star（没事，加上我就 3 stars 了），但确实能用，README 中的样例也是我期望的样子。

项目中自带了一个 jupyter 的示例，算得上是非常简单易上手的了，依赖方面只要装好 matplotlib 就可以使用，不存在依赖地狱。尽管是三年前的项目，在我本机的 Python 3.11 上仍然能够正常运行。

![](https://static.031130.xyz/uploads/2024/08/12/66288ba6414d4.webp)



tuple 中的第一个数字表示从当前时间开始，第二个数字表示持续时间。每一个表示 category 的 list 中可以存在多个 tuple。

给一些咱生成的例子。

***

```python
from gantt import *
category_names = ['P1', 'P2', 'P3', 'P4', 'P5']

results = {
    'FCFS': [[(0,2)], [(2,1)], [(3,8)], [(11,4)], [(15,5)]],
    'SJF': [[(1,2)], [(0,1)], [(12,8)], [(3,4)], [(7,5)]],
    'non-compreemptive priority': [[(13,2)],[(19,1)],[(0,8)],[(15,4)],[(8,5)]],
    'RR (quantum=2)': [[(0,2)], [(2,1)],[(3,2),(9,2),(15,2),(18,2)], [(5,2),(11,2)], [(7,2),(13,2),(17,1)]]
}

arrival_t = [0, 0, 0, 0]

gantt(category_names, results, arrival_t).show()

```

![](https://static.031130.xyz/uploads/2024/08/12/662890f78f1da.webp)

***

```python
from gantt import *
category_names = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

results = {
    '': [[(0,20)], [(25,10),(45,10),(75,5)], [(35,10),(55,5),(80,10)], [(60,15)], [(100,5),(115,5)],[(105,10)]],
}

arrival_t = [0]

gantt(category_names, results, arrival_t).show()

```

![](https://static.031130.xyz/uploads/2024/08/12/662891bfa52fc.webp)
