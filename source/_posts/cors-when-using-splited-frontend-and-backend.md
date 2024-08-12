---
title: 结合 Vue.js 与 php 完成的 web 期末大作业，讲讲前后端分离站点开发与部署中可能遇到的 CORS 跨域问题
date: 2024-01-10 23:55:36
sticky:
execrpt:
tags:
- Vue.js
- PHP
- Network
- 笔记
---

在[上一篇博客](/2023/12/27/php-and-vuejs-project-deploy-on-caddy/)中，我讲到了 web 期末大作业的上云部署。整个项目是使用 Vue.js 作为前端，php 作为后端，mysql 作为数据库实现的。

在使用 Vue.js 开发前端界面时，我选择了使用 vite 脚手架帮助开发，这意味着我的作品将使用前后端分离的架构实现。因此在开发部署过程中均遇到了跨域的问题，故写下这篇博客记录下解决方案。

## 基于后端返回对应 http 响应头的解决方案

### 开发阶段

在我完成前后端的开发，并且经过 Apifox 的 mock 测试后，第一次在浏览器尝试前后端对接，遇到了 `CORS Missing Allow Origin` 的报错。

![CORS Missing Allow Origin](https://cdn.zhullyb.top/uploads/2024/08/12/659ec607c69af.webp)

vite 启动的 dev 开发服务器使用的域是 `http://localhost:5173` ，而 php 后端我指定的是 `http://127.0.0.1:8080` ，前后端并不运行在一个域下，前端使用 Axios(AJAX) 向后端发送请求获取资源输入 CORS 跨域资源共享的范畴。

关于跨域资源共享 CORS 的相关内容，[阮一峰老师在 2016 年就已经在他的博客中有过解释](https://www.ruanyifeng.com/blog/2016/04/cors.html)，看了下也是全网中文内容中解释得比较通俗易懂的，因此本文在这方面不过多做解释。错误的提示信息是 Missing Allow Origin，结合阮一峰老师的博文，我们应该在后端向前端发送的 http 响应头中添加 `Access-Control-Allow-Origin` 这一字段。

在一般的前后端分离项目（不涉及 cookie 等 Credentials 属性）中，我们可以将这一字段设置为 * 通配符，默认允许所有的域向自己发起跨域资源请求。php 可以通过下面这行代码很方便地进行设置:

```php
header('Access-Control-Allow-Origin: *');
```

但在用户的注册登录方面，我使用了 session 作为用户的登录凭据。阮一峰老师关于 CORS 的博文中有这样一句话:

> 需要注意的是，如果要发送Cookie，`Access-Control-Allow-Origin`就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的`document.cookie`也无法读取服务器域名下的Cookie。

因此，我们必须明确指定 `Access-Control-Allow-Origin` 字段为前端所使用的域，写上 `http://localhost:5173` 才行。

```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```

再次刷新网页，获得了新的错误 `CORS Missing Allow Credentials`

![CORS Missing Allow Credentials](https://cdn.zhullyb.top/uploads/2024/08/12/659ec95acc0bc.webp)

这个问题处理起来也简单

```php
header('Access-Control-Allow-Credentials: true');
```

再次运行网页，跨域问题成功解决。

### 部署阶段

顺着这个思路进行下去，我们在部署阶段解决跨域问题需要做的事情很简单。提前将前端部署起来，将前端的域写到后端返回给前端的 http 相应头中即可。需要注意的是，`Access-Control-Allow-Origin` 字段仅允许填写一个值，如果需要同时允许来自多个不同域的跨域资源共享，后端部分需要根据前端发来的请求头中的 `Origin` 字段相应地设置响应头中的 `Access-Control-Allow-Origin` 。当然，nginx 等先进的 static server 也支持劫持 http 请求，添加相关的 Access-Control 语句，也可以在这一层解决这个问题。

## 直接规避跨域的方案

上面通过后端返回带有 Access-Control 语句相应头的解决方案确实可以解决问题，却显得不够优雅。开发和部署阶段都要手动的去指定前端的域来允许跨域资源共享，这一点过于麻烦了，因此引出了下面的解决方案。

### 开发阶段

在 vite（或者其他同类开发服务器）的帮助下，我们可以使用前端的开发服务器去反向代理后端服务，也就是让前端的请求打到前端服务器上，由前端服务器去返回后端服务器返回的结果。

在 `vite.config.ts` 配置文件下，我将原本的

```typescript
export default defineConfig({
  plugins: [vue()],
})
```

换成了

```typescript
export default () => {
  process.env = { ...process.env, ...loadEnv(process.cwd(),'') };

  const config = {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: http://127.0.0.1:8080,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
  return defineConfig(config)
};
```

同时将 Axios create 时的 `baseURL` 参数去除。

这样一套组合拳下来，将所有打向 `/api*` 的请求和响应通过前端的开发服务器作为中介做了中转，让浏览器以为并没有跨域（事实上也没有跨域），从而解决了相关的问题。

### 部署阶段

在开发阶段，我们通过 vite 的开发服务器做反向代理规避了跨域请求，但在部署阶段就用不了了。由于 vite 服务器的性能太弱，一般情况下我们是不会在生产环境中使用 vite 作为正式的服务器的，而是使用 vite build 出网站的静态网页资源，通过 nginx 等 static server 去向用户提供前端网页。而通过 vite build 出来的静态网页资源本身是不具备反向代理的能力的，这意味着没法在前端侧规避跨域问题。此时，我们应该配置 nginx 规避跨域问题。我一向不怎么使用 nginx，使用的是它的平替品 caddy，因此 nginx 的配置文件需要大家自行搜索，[我的 caddyfile 在上一篇博客中已经给出](https://zhul.in/2023/12/27/php-and-vuejs-project-deploy-on-caddy/#Caddy-%E9%85%8D%E7%BD%AE)，仅供参考。
