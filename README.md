# blog-next (WIP)

这是一个使用 Nuxt v4 + Nuxt Content v3 构建的博客系统，目前仍在开发中。

## 自定义入口

目前站点信息已经收口到几个固定入口，常见个性化不需要再去组件里翻硬编码：

- `blog.config.ts`
  站点标题、描述、导航、评论、统计、重定向规则
- `app/data/friend-links.ts`
  友链数据
- `app/data/backgrounds.ts`
  首页/页脚背景图案
- `app/components/custom/`
  强个性、偏展示型的自定义组件，比如页脚内容
- `app/pages/donate/index.vue`
  打赏页，直接改页面本身
- `content/others/zh/about.md`
  中文关于页
- `content/others/en/about.md`
  英文关于页

如果只是换站点名称、评论服务或统计配置，优先修改 `blog.config.ts` 即可。

## Todo List

- [x] 博客首页（文章列表）
  - [ ] 封面图片
- [x] 文章详情页
  - [x] Markdown 渲染
  - [x] 图片预览
  - [x] 侧栏目录
  - [x] 文末上/下一篇
  - [x] 接入 waline 评论
  - [x] 代码块高亮
  - [ ] 代码块折叠
- [x] 归档
- [x] 标签
- [x] 关于
- [x] RSS 订阅
- [x] 搜索功能
- [x] 友链
- [x] 新旧 URL 兼容重定向
- [x] 接入 umami 统计
- [x] 深色模式
- [ ] 无 title 小记
