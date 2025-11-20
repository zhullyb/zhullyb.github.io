---
title: "Migration from node-sass to dart-sass: A Troubleshooting Chronicle"
date: 2025-07-05 17:57:02
sticky:
tags:
- Web
- Vue.js
- Sass
- CSS
- JavaScript
---

## Update Goals

- node-sass -> sass (dart-sass)
- Minimize impact, avoid updating other dependency versions unless necessary
- Based on the above two conditions, see if we can upgrade the node.js version

## Reasons to Abandon node-sass

- [node-sass has been deprecated, dart-sass is the officially recommended successor by Sass](https://sass-lang.com/blog/libsass-is-deprecated/)
- node-sass installation on Windows is very troublesome, requiring both Python 2 and Microsoft Visual C++ on the development machine during npm installation
- When installing node-sass, resources need to be pulled from GitHub, which has a low success rate in certain network environments

## Current Project Dependency Versions

- `node@^12`
- `vue@^2`
- `webpack@^3`
- `vue-loader@^14`
- `sass-loader@^7.0.3`
- `node-sass@^4`

## Update Strategy

### node.js

Webpack officially doesn't provide the maximum node version supported by webpack 3, and even if webpack officially supports it, related webpack plugins may not. Therefore, whether the node version can be updated can only be determined through testing. Fortunately, although this project's CI/CD runs on node 12, I've been using node 14 for daily development, so I'll take this opportunity to upgrade the node version to 14.

### webpack, sass-loader

The webpack version is currently in a "ticking time bomb" state of not updating unless necessary. Based on the current webpack 3 limitation, the maximum supported sass-loader version is ^7 (sass-loader's [8.0.0 version changelog](https://github.com/webpack-contrib/sass-loader/blob/v8.0.0/CHANGELOG.md) explicitly states that version 8.0.0 requires webpack 4.36.0).

If sass-loader@^7 in the project supports using dart-sass, then there's no need to update sass-loader, and consequently no need to update webpack; otherwise, webpack would need to be updated to 4, and then determine the sass-loader version accordingly.

So does it support it or not? I found this package.json snippet on the [webpack official documentation page introducing sass-loader](https://www.webpackjs.com/loaders/sass-loader/):

```json
{
  "devDependencies": {
    "sass-loader": "^7.2.0",
    "sass": "^1.22.10"
  }
}
```

This proves that at least sass-loader@7.2.0 already supported dart-sass, so the webpack version can stay at ^3, and sass-loader can temporarily stay at version 7.0.3. If there are issues later, it can be updated to the latest version 7.3.1 in the ^7 range.

### dart-sass

I couldn't find the maximum sass version supported by sass-loader@^7. GitHub Copilot confidently told me:

> **Official documentation quote:**
>
> > sass-loader@^7.0.0 requires node-sass >=4.0.0 or sass >=1.3.0, <=1.26.5.
>
> **Suggestion:**
>
> - If you need to use a higher version of `sass`, please upgrade to `sass-loader` 8 or higher.

However, I couldn't find any trace of this text on the internet. Moreover, the last version in sass's ~1.26 range is 1.26.11, not 1.26.5. [According to common npm versioning principles](https://docs.npmjs.com/about-semantic-versioning), releases that only change the patch version while keeping the major and minor versions the same generally only contain bugfixes without breaking changes. It's unlikely that updating from 1.26.5 to 1.26.11 would suddenly become incompatible with sass-loader 7, so this is more likely an AI hallucination or limited training data.

Out of caution, I ultimately decided to use the last version of sass 1.22 mentioned in the webpack official documentation, which is 1.22.12.

## Analysis Complete, Let's Update

### Step 1: Uninstall node-sass, Install sass@^1.22.12

```bash
npm uninstall node-sass
npm install sass@^1.22.12
```

### Step 2: Update webpack Configuration (Optional)

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
+                // In fact, this line doesn't need to be added in most sass-loader versions, sass-loader can automatically detect whether it's sass or node-sass
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

### Step 3: Batch Replace /deep/ Syntax with ::v-deep

Because [the /deep/ syntax was deprecated in 2017](https://chromestatus.com/feature/4964279606312960), /deep/ became an unsupported deep selector. node-sass, with its excellent error tolerance, could continue to provide compatibility, but dart-sass doesn't support this syntax. So we need to batch replace the /deep/ syntax with ::v-deep, which, although abandoned in Vue's subsequent RFC, is still effectively supported to this day.

```bash
# Something like this, using VSCode's batch replace also works
sed -i 's#\s*/deep/\s*# ::v-deep #g' $(grep -rl '/deep/' .)
```

### Step 4: Fix Other Sass Syntax Errors

During the migration, I found some non-standard syntax in the project. node-sass, with its excellent robustness, silently forced parsing, while dart-sass can't handle this rough work. Therefore, these syntax errors need to be manually fixed based on compilation errors. I encountered two types:

```diff
// Extra colon
.foo {
-  color:: #fff;
+  color: #fff;
}

// :nth-last-child without specified number
.bar {
-  &:nth-last-child() {
+  &:nth-last-child(1) {
      margin-bottom: 0;
  }
}
```

## Pitfalls

### ::v-deep Styles Not Taking Effect

After updating dependencies, everything seemed fine at first glance, so I pushed to the test environment. Less than a day later, a colleague called me - the ::v-deep deep selector wasn't working?

Trying my luck, GPT gave the following answer:

> In the **Vue 2 + vue-loader + Sass** combination, **this syntax is correct**, **provided that your build toolchain supports the `::v-deep` syntax** (such as `vue-loader@15` and above + `sass-loader`).

Although I still haven't verified why updating to vue-loader@15 is required to use ::v-deep syntax, after updating vue-loader, the ::v-deep syntax did work. While writing this article, I found some clues that might explain this issue:

1. The vue-loader [version 14 official documentation](https://vue-loader-v14.vuejs.org/en/features/scoped-css.html#deep-selectors) simply doesn't have examples of ::v-deep syntax. [This example was only added after vue-loader 15.7.0 was released](https://github.com/vuejs/vue-loader/commit/2585d254fc774386a898887467fbdd30eb864b53).

2. Someone mentioned in a vue-cli GitHub Issue comment:

   > `::v-deep` implemented in @vue/component-compiler-utils v2.6.0, should work after you reinstall the deps.

   And vue-loader only [added @vue/component-compiler-utils to its dependencies in version 15.0.0-beta.1](https://github.com/vuejs/vue-loader/commit/e32cd0e4372fcc6f13b6c307402713807516d71c#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519), and didn't [update its @vue/component-compiler-utils version to the required ^3.0.0 until vue-loader 15.7.1](https://github.com/vuejs/vue-loader/commit/c359a38db0fbb4135fc97114baec3cd557d4123a).

Can we upgrade to vue-loader 16 or even 17? No. The [vue-loader v16.1.2 changelog](https://github.com/vuejs/vue-loader/releases/tag/v16.1.2) clearly states:

> Note: vue-loader v16 is for Vue 3 only.

### vue-loader 14 -> 15 Breaking Changes

When migrating vue-loader from 14 upward, running directly without modifying the webpack configuration will encounter Vue syntax recognition issues. Specifically, even though .vue file naming uses correct and valid syntax, the compiler just won't recognize it during build/development, reporting syntax errors. vue-loader officially has a [migration document](https://vue-loader.vuejs.org/migrating.html) that needs attention.

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

Additionally, in my project, I needed to remove the babel-loader for .vue files in the webpack configuration:

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

## Final Update Status

- `node@^12` -> `node@^14`
- `vue-loader@^14` -> `vue-loader@^15`
- `node-sass@^4` -> `sass@^1.22.12`

All other dependency versions remain unchanged

## References

- [Switching from node-sass to dart-sass - Juejin](https://juejin.cn/post/7327094228350500914)
- [node-sass migration to dart-sass | Bolg](https://sunchenggit.github.io/2021/01/13/node-sass%E8%BF%81%E7%A7%BBdart-sass/)
- [sass-loader | webpack Documentation](https://www.webpackjs.com/loaders/sass-loader/)
- [Sass: LibSass is Deprecated](https://sass-lang.com/blog/libsass-is-deprecated/)
- [sass - npm](https://www.npmjs.com/package/sass?activeTab=versions)
- [node-sass - npm](https://www.npmjs.com/package/node-sass)
- [About semantic versioning | npm Docs](https://docs.npmjs.com/about-semantic-versioning)
- [Make /deep/ behave like the descendant combinator " " in CSS live profile - Chrome Platform Status](https://chromestatus.com/feature/4964279606312960)
- [sass-loader/CHANGELOG.md at v8.0.0 · webpack-contrib/sass-loader](https://github.com/webpack-contrib/sass-loader/blob/v8.0.0/CHANGELOG.md)
- [Release v16.1.2 · vuejs/vue-loader](https://github.com/vuejs/vue-loader/releases/tag/v16.1.2)
- [refactor: use @vue/component-compiler-utils · vuejs/vue-loader@e32cd0e](https://github.com/vuejs/vue-loader/commit/e32cd0e4372fcc6f13b6c307402713807516d71c#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519)
- [chore: update @vue/component-compiler-utils to v3 · vuejs/vue-loader@c359a38](https://github.com/vuejs/vue-loader/commit/c359a38db0fbb4135fc97114baec3cd557d4123a)
- [dart-sass does not support /deep/ selector · Issue #3399 · vuejs/vue-cli](https://github.com/vuejs/vue-cli/issues/3399#issuecomment-466319019)
- [Scoped CSS · vue-loader v14](https://vue-loader-v14.vuejs.org/en/features/scoped-css.html)
- [Migrating from v14 | Vue Loader](https://vue-loader.vuejs.org/migrating.html)
