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
  links: FriendLink[]
  redirects: Record<string, string>
}
