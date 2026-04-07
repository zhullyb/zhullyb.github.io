import { setHeader } from 'h3'
import type { H3Event } from 'h3'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { XMLBuilder } from 'fast-xml-parser'
import blogConfig, { pickLocalizedValue } from '../../blog.config'
import type { Post } from '~/types/post'
import type { BlogLocale } from '~/types/site'

type RawPost = {
  title?: string
  description?: string
  path: string
  date?: string | Date | null
  tags?: string[] | null
  rawbody?: string
}

type AtomEntry = {
  id: string
  title: string
  updated: string
  link: { $href: string; $rel: string }
  content: { $type: 'html'; $: string }
  published?: string
  author?: { name: string; email?: string; uri?: string }
  category?: Array<{ $term: string }>
}

type AtomFeedOptions = {
  contentLang: string
  locale: BlogLocale
  xmlLang: string
  selfPath: string
  fallbackTitle: string
}

const builder = new XMLBuilder({
  attributeNamePrefix: '$',
  cdataPropName: '$',
  format: true,
  ignoreAttributes: false,
  textNodeName: '_'
})

const normaliseSiteUrl = (url: string) => url.replace(/\/+$/, '')

const buildAbsoluteUrl = (siteUrl: string, path: string) => {
  path = path.endsWith('/') ? path : path + '/'
  return new URL(path, `${siteUrl}/`).toString()
}

const buildPostLink = (post: Post, siteUrl: string) => buildAbsoluteUrl(siteUrl, post.path)

const formatIsoDate = (input?: string | Date | null) => {
  if (!input) return undefined
  const date = typeof input === 'string' ? new Date(input) : input
  return Number.isNaN(date?.getTime() ?? NaN) ? undefined : date!.toISOString()
}

async function renderMarkdownToHtml(rawbody: RawPost['rawbody']): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

  const mdText = rawbody?.replace(/^---\n[\s\S]*?\n---\n/, '') || ''
  const html = await processor.process(mdText || '')
  return String(html)
}

async function fetchLatestPosts(event: H3Event, contentLang: string): Promise<RawPost[]> {
  return queryCollection(event, 'posts')
    .where('lang', '=', contentLang)
    .order('date', 'DESC')
    .select('title', 'description', 'path', 'date', 'tags', 'rawbody')
    .all() as Promise<RawPost[]>
}

export async function buildAtomFeed(event: H3Event, options: AtomFeedOptions) {
  const siteUrl = normaliseSiteUrl(blogConfig.site.url)
  const posts = await fetchLatestPosts(event, options.contentLang)
  const datedPosts = posts.filter((post: RawPost) => Boolean(post.date))

  const entries: AtomEntry[] = await Promise.all(
    datedPosts.map(async post => {
      const typedPost: Post = {
        title: post.title ?? options.fallbackTitle,
        date:
          typeof post.date === 'string'
            ? post.date
            : (formatIsoDate(post.date) ?? new Date().toISOString()),
        path: post.path,
        description: post.description,
        tags: Array.isArray(post.tags) ? post.tags : undefined
      }

      const link = buildPostLink(typedPost, siteUrl)
      const fullContent = await renderMarkdownToHtml(post.rawbody)
      const updated = formatIsoDate(post.date) ?? new Date().toISOString()
      const published = formatIsoDate(post.date)
      const tagCategories = typedPost.tags?.filter(Boolean)

      const entry: AtomEntry = {
        id: link,
        title: typedPost.title,
        updated,
        link: { $href: link, $rel: 'alternate' },
        content: { $type: 'html', $: fullContent }
      }

      if (published) {
        entry.published = published
      }

      if (blogConfig.author) {
        entry.author = {
          name: blogConfig.author.name,
          email: blogConfig.author.email,
          uri: blogConfig.author.homepage
        }
      }

      if (tagCategories?.length) {
        entry.category = tagCategories.map(tag => ({ $term: tag }))
      }

      return entry
    })
  )

  const latestUpdate = entries[0]?.updated
  const feedUpdated = latestUpdate ?? new Date().toISOString()
  const title = pickLocalizedValue(blogConfig.site.title, options.locale)
  const description = pickLocalizedValue(blogConfig.site.description, options.locale)

  const feed = {
    $xmlns: 'http://www.w3.org/2005/Atom',
    '$xml:lang': options.xmlLang,
    id: siteUrl,
    title,
    updated: feedUpdated,
    subtitle: description,
    rights: `© ${new Date(feedUpdated).getFullYear()} ${blogConfig.author?.name ?? title}`,
    link: [
      { $href: `${siteUrl}${options.selfPath}`, $rel: 'self', $type: 'application/atom+xml' },
      { $href: siteUrl, $rel: 'alternate' }
    ],
    ...(blogConfig.author
      ? {
          author: {
            name: blogConfig.author.name,
            email: blogConfig.author.email,
            uri: blogConfig.author.homepage
          },
          icon: blogConfig.author.avatar,
          logo: blogConfig.author.avatar
        }
      : {}),
    entry: entries
  }

  setHeader(event, 'Content-Type', 'application/atom+xml; charset=utf-8')
  return builder.build({
    '?xml': { $version: '1.0', $encoding: 'UTF-8' },
    feed
  })
}
