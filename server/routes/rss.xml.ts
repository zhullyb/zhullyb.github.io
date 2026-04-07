import { defineEventHandler } from 'h3'
import { buildAtomFeed } from '../utils/atom-feed'

export default defineEventHandler(event =>
  buildAtomFeed(event, {
    contentLang: 'zh-CN',
    locale: 'zh',
    xmlLang: 'zh-CN',
    selfPath: '/rss.xml',
    fallbackTitle: '未命名文章'
  })
)
