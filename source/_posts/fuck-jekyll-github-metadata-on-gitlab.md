---
title:      记一次在Gitlab部署Jekyll博客时遇到的jekyll-github-metadata报错问题
date:       2021-04-16
tags:       笔记
---


我的博客是挂在GitlabPages上的，在为博客更换主题的时候遇到了一点点小麻烦。

报错如图：

![](https://storage.zhullyb.workers.dev/PicBed/2021-04-16_23-17.png?raw)

当然，我这边也会附上详细的报错日志，以便后人能够通过关键词搜索到。

```
Configuration file: /builds/zhullyb/test/_config.yml
            Source: /builds/zhullyb/test
       Destination: public
 Incremental build: disabled. Enable with --incremental
      Generating... 
       Jekyll Feed: Generating feed for posts
   GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.
   GitHub Metadata: Error processing value 'url':
             ERROR: YOUR SITE COULD NOT BE BUILT:
                    ------------------------------------
                    No repo name found. Specify using PAGES_REPO_NWO environment variables, 'repository' in your configuration, or set up an 'origin' git remote pointing to your github.com repository.
Cleaning up file based variables 00:01
ERROR: Job failed: exit code 1
```

经过了一番瞎折腾以后，我依然没有解决问题，而每次push都要等待gitlab的ci构建两道三分钟，实在磨不动的我去看了[jekyll-github-metadata](https://github.com/jekyll/github-metadata)的README，结合上文的报错，我一下子就看懂了。

`jekyll-github-metadata`可以通过github中的信息自动为jekyll提供`site.github`、`site.title`、`site.description`、`site.url`和`site.baseurl`。而由于我们在用的是Gitlab，所以jekyll-github-metadata就无法获取到这些信息，需要我们手动指定。报错中缺少的就是`url`

于是打开`_config.yml`，把`url`给补上，顺便把别的变量一同加上，如图：

![](https://storage.zhullyb.workers.dev/PicBed/2021-04-16_23-51.png?raw)
