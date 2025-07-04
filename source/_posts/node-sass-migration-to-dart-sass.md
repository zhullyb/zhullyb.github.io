---
title: node-sass 迁移至 dart-sass 踩坑实录
date: 2025-07-05 17:57:02
sticky:
tags:
- Web
- Vue.js
- Sass
- CSS
- JavaScript
---

## 更新目标

- node-sass -> sass ( dart-sass )
- 减少影响面，非必要不更新其他依赖的版本
- 在前两条基础上，看看能否提升 node.js 的版本

## 抛弃 node-sass 的理由

- [node-sass 已经停止维护，dart-sass 是 sass 官方主推的继任者](https://sass-lang.com/blog/libsass-is-deprecated/)
- node-sass 在 windows 下的安装非常麻烦，npm 安装时需要开发机上同时装有 python2 和 Microsoft Visual C++
- 在安装 node-sass 时，需要从 Github 拉取资源，在特定网络环境下成功率并不高

## 项目依赖版本现状

- `node@^12`
- `vue@^2`
- `webpack@^3`
- `vue-loader@^14`
- `sass-loader@^7.0.3`
- `node-sass@^4`

## 更新思路

### node.js

webpack 官方并没有提供 webpack 3 支持的最高 node 版本，且即使 webpack 官方支持，webpack 的相关插件也未必支持。因此 node 版本能否更新就只能自己试。好在尽管这个项目的 CI/CD 跑在 node 12，但我日常都在用 node 14 开发，因此顺势将 node 版本提升至 14。

### webpack、sass-loader

webpack 的版本目前处于非必要不更新的定时炸弹状态，基于现有的 webpack 3 限制，所支持的最高 sass-loader 版本就是 ^7 （ sass-loader 在 [8.0.0 版本的更新日志](https://github.com/webpack-contrib/sass-loader/blob/v8.0.0/CHANGELOG.md)中明确指出 8.0.0 版本需要 webpack 4.36.0）。

如果项目中 sass-loader@^7 支持使用 dart-sass 就可以不更新 sass-loader，也就不必更新 webpack 版本；反之，就需要同步更新 webpack 至 4，再视情况定下 sass-loader 的版本。

那么到底支不支持呢？我在 [webpack 官方文档介绍 sass-loader 的页面](https://www.webpackjs.com/loaders/sass-loader/)找到了这样一段 package.json 片段

```json
{
  "devDependencies": {
    "sass-loader": "^7.2.0",
    "sass": "^1.22.10"
  }
}
```

这证明起码在 sass-loader@7.2.0 这一版本就已经支持 dart-sass 了，因此 webpack 版本可以停留在 ^3，而 sass-loader 暂时停留在 7.0.3 版本，如果后续有问题可以更新到 ^7 版本中最新的 7.3.1 版本。

### dart-sass

sass-loader@^7 所支持的最高 sass-loader 我并没有查到，Github Copilot 信誓旦旦地告诉我

> **官方文档引用：**
>
> > sass-loader@^7.0.0 requires node-sass >=4.0.0 or sass >=1.3.0, <=1.26.5.
>
> **建议：**
>
> - 如果需要使用更高版本的 `sass`，请升级到 `sass-loader` 8 或更高版本。

但事实上，我并没有在互联网上找到这段文本的蛛丝马迹。并且在 sass 的 ~1.26 版本中最后一个版本是 1.26.11 而非 1.26.5，[根据常见的 npm 版本号原则](https://docs.npmjs.com/about-semantic-versioning)，major version 和 minor version 不变，只改变了 patch version 的发版一般只有 bugfix 而没有 breaking change，不至于从 1.26.5 更新到 1.26.11 就突然不支持 sass-loader 7 了，因此更可能是 AI 幻觉或者是训练数据受限。

出于谨慎考虑，最终决定采用 webpack 官方文档中提到的 sass 1.22 的最后一个版本，也就是 1.22.12。

## 分析完成，动手更新

### 第一步，卸载 node-sass，安装 sass@^1.22.12

```bash
npm uninstall node-sass
npm install sass@^1.22.12
```

### 第二步，更新 webpack 配置（非必须）

```diff
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
+            options: {
+                // 事实上，这一行在大部分 sass-loader 版本中不用加，sass-loader 能自动检测本地是 sass 还是 node-sass
+                implementation: require('sass')
+              },
            },
          },
        ],
      },
    ],
  },
};
```

### 第三步，批量替换 /deep/ 语法为 ::v-deep

因为 [/deep/ 写法在 2017 年被弃用](https://chromestatus.com/feature/4964279606312960) ，/deep/ 变成了不受支持的深度作用选择器，node-sass 凭借其出色的容错性能够继续提供兼容，但 dart-sass 则不支持这种写法。于是需要将 /deep/ 语法批量替换成 ::v-deep 写法，这种写法虽然在 vue 的后续 rfc 被放弃了，但直至今日依然在事实上被支持。

```bash
# 大概就是这么个意思，用 vscode 的批量替换其实也行
sed -i 's#\s*/deep/\s*# ::v-deep #g' $(grep -rl '/deep/' .)
```

### 第四步，修复其他 sass 语法错误

在迁移的过程中，我发现项目中有一些不规范的写法，node-sass 凭借出色的鲁棒性不吭一声强行解析，而 dart-sass 则干不了这粗活。因此需要根据编译时的报错手动修复一下这些语法错误，我这里一共遇到两种。

```diff
// 多打了一个冒号
.foo {
-  color:: #fff;
+  color: #fff;
}

// :nth-last-child 没指定数字
.bar {
-  &:nth-last-child() {
+  &:nth-last-child(1) {
      margin-bottom: 0;
  }
}
```

## 踩坑

### ::v-deep 样式不生效

依赖更新完后看了两眼好像是没问题，就推测试环境了。结果一天没到就被同事 call 了，::v-deep 这种深度作用选择器居然没有生效？

抱着试一试的态度，GPT 给了如下回答

> 在 **Vue 2 + vue-loader + Sass** 的组合下，**这种写法是正确的**，**前提是你的构建工具链支持 `::v-deep`** 语法（如 `vue-loader@15` 及以上版本 + `sass-loader`）。

虽说我依然没有查证到为什么更新 vue-loader@15 才能使用 ::v-deep 语法，但对 vue-loader 进行更新后，::v-deep 语法确实生效了。在撰写本文时，我找到了些许蛛丝马迹，可能能解释这一问题。

1. vue-loader 在 [14 版本的官方文档](https://vue-loader-v14.vuejs.org/en/features/scoped-css.html#deep-selectors)就是没有 ::v-deep 写法的示例，[这一示例一直在 vue-loader 15.7.0 版本发布后才被加入](https://github.com/vuejs/vue-loader/commit/2585d254fc774386a898887467fbdd30eb864b53)。

2. vue-cli 的 Github Issue 评论区中有人提到

   > `::v-deep` implemented in @vue/component-compiler-utils v2.6.0, should work after you reinstall the deps.

   而 vue-loader 在 15.0.0-beta.1 版本才[将 @vue/component-compiler-utils 加入到自己的 dependencies 中](https://github.com/vuejs/vue-loader/commit/e32cd0e4372fcc6f13b6c307402713807516d71c#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519)，并直到 vue-loader 15.7.1 中才[将其 @vue/component-compiler-utils 的版本号更新到满足要求的 ^3.0.0](https://github.com/vuejs/vue-loader/commit/c359a38db0fbb4135fc97114baec3cd557d4123a)

那能否升级到 vue-loader 16 甚至 17 版本呢？不行，在 [vue-loader v16.1.2 的更新日志](https://github.com/vuejs/vue-loader/releases/tag/v16.1.2)中明确写道

> Note: vue-loader v16 is for Vue 3 only.

### vue-loader 14 -> 15 breaking change

vue-loader 从 14 往上迁移时，不修改 webpack 配置直接跑会遇到 vue 语法不识别的问题。具体表现为 .vue 文件命名都是正确有效的语法，但构建开发时编译器就是不认，报语法错误。vue-loader 官方有一份[迁移文档](https://vue-loader.vuejs.org/migrating.html)，需要注意一下。

```
ERROR in ./src/......
Module parse failed: Unexpected token(1:0)
You may need an appropriate loader to handle this file type.
```

```diff
// ...
import path from 'path'
+const VueLoaderPlugin = require('vue-loader/lib/plugin')

// ...

  plugins: [
+    new VueLoaderPlugin()
    // ...
  ]
```

除此之外，在我这个项目中需要额外移除 webpack 配置中针对 .vue 文件的 babel-loader

```diff
{
  test: /\.vue$/,
  use: [
-    {
-      loader: 'babel-loader'
-    },
    {
      loader: 'vue-loader',
    }
  ]
}
```

## 最终更新情况

- `node@^12` -> `node@^14`
- `vue-loader@^14` -> `vue-loader@^15`
- `node-sass@^4` -> `sass@^1.22.12`

其余依赖版本维持不变

## 参见

- [node-sass更换为dart-sass`dart-sass` 和 `node-sass`都是用来将`sass`编译成 - 掘金](https://juejin.cn/post/7327094228350500914)
- [node-sass迁移dart-sass | Bolg](https://sunchenggit.github.io/2021/01/13/node-sass%E8%BF%81%E7%A7%BBdart-sass/)
- [sass-loader | webpack 中文文档 | webpack中文文档 | webpack中文网](https://www.webpackjs.com/loaders/sass-loader/)
- [Sass: LibSass is Deprecated](https://sass-lang.com/blog/libsass-is-deprecated/)
- [sass - npm](https://www.npmjs.com/package/sass?activeTab=versions)
- [node-sass - npm](https://www.npmjs.com/package/node-sass)
- [About semantic versioning | npm Docs](https://docs.npmjs.com/about-semantic-versioning)
- [Make /deep/ behave like the descendant combinator " " in CSS live profile (in css file or inside of \<style>) - Chrome Platform Status](https://chromestatus.com/feature/4964279606312960)
- [sass-loader/CHANGELOG.md at v8.0.0 · webpack-contrib/sass-loader](https://github.com/webpack-contrib/sass-loader/blob/v8.0.0/CHANGELOG.md)
- [Release v16.1.2 · vuejs/vue-loader](https://github.com/vuejs/vue-loader/releases/tag/v16.1.2)
- [refactor: use @vue/component-compiler-utils · vuejs/vue-loader@e32cd0e](https://github.com/vuejs/vue-loader/commit/e32cd0e4372fcc6f13b6c307402713807516d71c#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519)
- [chore: update @vue/component-compiler-utils to v3 · vuejs/vue-loader@c359a38](https://github.com/vuejs/vue-loader/commit/c359a38db0fbb4135fc97114baec3cd557d4123a)
- [dart-sass does not support /deep/ selector · Issue #3399 · vuejs/vue-cli](https://github.com/vuejs/vue-cli/issues/3399#issuecomment-466319019)
- [Scoped CSS · vue-loader v14](https://vue-loader-v14.vuejs.org/en/features/scoped-css.html)
- [Migrating from v14 | Vue Loader](https://vue-loader.vuejs.org/migrating.html)

