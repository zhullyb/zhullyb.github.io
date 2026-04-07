import { defineEventHandler } from 'h3'
import { buildAtomFeed } from '../../utils/atom-feed'

export default defineEventHandler(event =>
  buildAtomFeed(event, {
    contentLang: 'en',
    locale: 'en',
    xmlLang: 'en-US',
    selfPath: '/en/rss.xml',
    fallbackTitle: 'Untitled'
  })
)
