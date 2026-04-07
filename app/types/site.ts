export type BlogLocale = 'zh' | 'en'

export type LocalizedValue<T> = Record<BlogLocale, T>

export interface BackgroundStyle {
  backgroundColor?: string
  backgroundImage: string
  backgroundRepeat?: string
  backgroundPosition?: string
  backgroundSize?: string
}

export interface FriendLink {
  title: string
  intro?: string
  link: string
  avatar?: string
}

export interface NavItem {
  text: string
  link: string
}

export interface AuthorConfig {
  name: string
  avatar?: string
  email?: string
  homepage?: string
}

export interface WalineConfig {
  serverURL: string
  meta: string[]
  requiredMeta: string[]
  emoji: string[]
  dark: string
  wordLimit: number
  pageSize: number
  login: string
}

export interface DonateMethodConfig {
  key: string
  label: LocalizedValue<string>
  qrCode: string
  alt: LocalizedValue<string>
}

export interface DonatePageConfig {
  path: string
  title: LocalizedValue<string>
  intro: LocalizedValue<string[]>
  methods: DonateMethodConfig[]
}

export interface NodeSupportConfig {
  enabled: boolean
  supportId: string
  title: string
  description: string
  primaryBrand: {
    image: string
    href: string
    alt: string
  }
  secondaryBrand: {
    image: string
    href: string
    alt: string
  }
  githubUrl: string
  promotionUrl: string
}

export interface BlogConfig {
  site: {
    url: string
    defaultLocale: BlogLocale
    title: LocalizedValue<string>
    slogan: LocalizedValue<string>
    description: LocalizedValue<string>
  }
  author: AuthorConfig
  navigation: NavItem[]
  appearance: {
    backgrounds: BackgroundStyle[]
  }
  assets: {
    preconnect: string[]
    markdownStylesheet: string
  }
  content: {
    homePageSize: number
  }
  comments: {
    waline: WalineConfig
  }
  analytics: {
    umami: {
      enabled: boolean
      scriptSrc: string
      websiteId: string
    }
  }
  footer: {
    social: {
      github?: string
      mastodon?: string
      email?: string
    }
    poweredBy: {
      name: string
      url: string
    }
    copyright: {
      startYear: number
      owner: string
    }
    nodeSupport: NodeSupportConfig
  }
  pages: {
    donate: DonatePageConfig
  }
  links: FriendLink[]
  redirects: Record<string, string>
}
