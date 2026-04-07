import backgrounds from './app/data/backgrounds'
import friendLinks from './app/data/friend-links'
import type { BlogConfig, BlogLocale, LocalizedValue } from './app/types/site'

export const resolveBlogLocale = (locale?: string): BlogLocale => (locale === 'en' ? 'en' : 'zh')

export const pickLocalizedValue = <T>(value: LocalizedValue<T>, locale?: string) =>
  value[resolveBlogLocale(locale)]

const blogConfig: BlogConfig = {
  site: {
    url: 'https://zhul.in/',
    defaultLocale: 'zh',
    title: {
      zh: '竹林里有冰的博客',
      en: "Zhullyb's Blog"
    },
    slogan: {
      zh: '朱云绘彩风燎焰，丹音颂礼冰缠烟',
      en: '朱云绘彩风燎焰，丹音颂礼冰缠烟'
    },
    description: {
      zh: '这里是我的个人博客，专注于分享技术干货、学习心得和生活感悟，涵盖前端开发、后端架构、人工智能、编程技巧、工具推荐等多个领域。我持续更新原创内容，记录成长过程中的思考与收获，致力于帮助更多开发者和技术爱好者提升技能、拓展视野。如果你对技术、产品和互联网行业感兴趣，相信你能在这里找到有价值的知识与灵感。',
      en: 'This is my personal blog focused on technology, learning notes, and everyday observations. I write about frontend development, backend architecture, AI, programming techniques, useful tools, and the lessons I learn along the way.'
    }
  },
  author: {
    name: '竹林里有冰',
    avatar: 'https://static.031130.xyz/avatar.webp',
    email: 'zhullyb@outlook.com',
    homepage: 'https://zhul.in'
  },
  navigation: [
    {
      text: 'nav.home',
      link: '/'
    },
    {
      text: 'nav.archives',
      link: '/archives/'
    },
    {
      text: 'nav.tags',
      link: '/tags/'
    },
    {
      text: 'nav.links',
      link: '/links/'
    },
    {
      text: 'nav.about',
      link: '/about/'
    }
  ],
  appearance: {
    backgrounds
  },
  assets: {
    preconnect: ['https://static.031130.xyz'],
    markdownStylesheet:
      'https://s4.zstatic.net/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css'
  },
  content: {
    homePageSize: 10
  },
  comments: {
    waline: {
      serverURL: 'https://waline.zhul.in/',
      meta: ['nick', 'mail', 'link'],
      requiredMeta: ['nick'],
      emoji: ['https://registry.npmmirror.com/@waline/emojis/^1/files/weibo'],
      dark: 'auto',
      wordLimit: 0,
      pageSize: 10,
      login: 'disable'
    }
  },
  analytics: {
    umami: {
      enabled: true,
      scriptSrc: '/js/u.js',
      websiteId: '5346b89b-f4bf-4593-971d-1f41a1118bc1'
    }
  },
  links: friendLinks,
  redirects: {
    '/2020/07/11/GitNotes/': '/2020/07/11/gitnotes/',
    '/2020/07/11/RepoNotes/': '/2020/07/11/reponotes/',
    '/2020/08/10/AndroidUnpack/': '/2020/08/10/androidunpack/',
    '/2020/10/08/NoHello/': '/2020/10/08/nohello/',
    '/2020/12/22/Did-UOS-have-Secure-Boot-Signature/':
      '/2020/12/22/did-uos-have-secure-boot-signature/',
    '/2021/01/01/Why-I-dont-recommend-Manjaro/': '/2021/01/01/why-i-dont-recommend-manjaro/',
    '/2023/11/12/a-introduce-of-GLWTPL/': '/2023/11/12/a-introduce-of-glwtpl/',
    '/tags/CI-CD/': '/tags/CI%2FCD/',
    '/tags/Casual-Talk/': '/tags/Casual%20Talk/',
    '/tags/Github-Action/': '/tags/Github%20Action/',
    '/tags/Lsky-Pro/': '/tags/Lsky%20Pro/',
    '/tags/Nuxt-Content/': '/tags/Nuxt%20Content/',
    '/tags/OpenSource-Project/': '/tags/OpenSource%20Project/',
    '/tags/RPM-Package/': '/tags/RPM%20Package/',
    '/tags/Shell-Script/': '/tags/Shell%20Script/',
    '/tags/Virtual-Machine/': '/tags/Virtual%20Machine/',
    '/tags/Vue-js/': '/tags/Vue.js',
    '/tags/Web-PKI/': '/tags/Web%20PKI/',
    '/tags/vercel/': '/tags/Vercel/',
    '/tags/%E9%95%9C%E5%83%8F%E7%AB%99/': '/tags/Mirror%20Site/',
    '/tags/%E5%9B%BE%E5%BA%8A/': '/tags/Image%20Hosting/',
    '/tags/%E7%AC%94%E8%AE%B0/': '/tags/Notes/',
    '/tags/%E7%BF%BB%E8%AF%91/': '/tags/Translation/',
    '/tags/%E5%A4%A7%E4%BD%AC%E5%AF%B9%E8%AF%9D%E7%AC%94%E8%AE%B0/': '/tags/Notes/',
    '/2025/11/11/dns-cold-start-dilemma/en/': '/en/2025/11/11/dns-cold-start-dilemma/',
    '/2025/11/05/http-2-server-push-is-practically-obsolete/en/':
      '/en/2025/11/05/http-2-server-push-is-practically-obsolete/'
  }
}

export default blogConfig
