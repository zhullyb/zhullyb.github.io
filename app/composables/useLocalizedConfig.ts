import type { BlogLocale, LocalizedValue } from '~/types/site'

export const useBlogLocaleKey = () => {
  const { locale } = useI18n()

  return computed<BlogLocale>(() => (locale.value === 'en' ? 'en' : 'zh'))
}

export const useLocalizedConfigValue = <T>(value: LocalizedValue<T>) => {
  const localeKey = useBlogLocaleKey()

  return computed(() => value[localeKey.value])
}
