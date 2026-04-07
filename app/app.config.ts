import blogConfig from '../blog.config'

export default defineAppConfig({
  site: blogConfig.site,
  author: blogConfig.author,
  assets: blogConfig.assets,
  content: blogConfig.content,
  comments: blogConfig.comments,
  pages: blogConfig.pages,
  footer: blogConfig.footer,
  links: blogConfig.links,
  nav: {
    items: blogConfig.navigation
  },
  appearance: blogConfig.appearance
})
