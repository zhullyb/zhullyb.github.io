<template>
	<Teleport to="body">
		<Transition name="search-overlay">
			<div
				v-if="modelValue"
				class="search-overlay"
				role="dialog"
				aria-modal="true"
				@mousedown.self="close"
			>
				<div class="search-overlay__panel">
					<div class="search-overlay__header">
						<input
							ref="inputRef"
							type="search"
							v-model="searchTerm"
							class="search-overlay__input"
							placeholder="搜索文章，支持多个关键词"
						/>
						<button
							class="search-overlay__close"
							type="button"
							@click="close"
							aria-label="关闭搜索"
						>
							×
						</button>
					</div>

					<div v-if="pending" class="search-overlay__state">正在准备索引…</div>
					<div v-else class="search-overlay__body">
						<p v-if="!searchTerm.trim()" class="search-overlay__state">
							输入关键词开始搜索。
						</p>
						<p v-else-if="!results.length" class="search-overlay__state">
							没有找到匹配内容，换个关键词试试？
						</p>
						<div v-else class="search-overlay__count">
							共找到 {{ results.length }} 条结果
						</div>

						<ul v-if="results.length" class="search-overlay__list">
							<li
								v-for="result in results"
								:key="result.id"
								class="search-overlay__item"
							>
								<NuxtLink
									:to="result.id"
									class="search-overlay__link"
									@click="close"
								>
									<h3 class="search-overlay__item-title">
										{{ result.documentTitle }}
									</h3>
									<p class="search-overlay__item-meta">
										共 {{ result.matchCount }} 处匹配
										<span v-if="result.sectionLabel">
											· {{ result.sectionLabel }}</span
										>
									</p>
									<p class="search-overlay__item-snippet">{{ result.snippet }}</p>
								</NuxtLink>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
	interface SearchSection {
		id: string
		title?: string
		titles?: string[]
		content?: string
		level?: number
	}

	interface RawResult {
		id: string
		baseId: string
		documentTitle: string
		sectionTitle: string
		snippet: string
		score: number
	}

	interface EnhancedResult {
		id: string
		documentTitle: string
		sectionLabel: string
		snippet: string
		score: number
		matchCount: number
	}

	const props = defineProps<{
		modelValue: boolean
	}>()

	const emit = defineEmits<{
		(event: 'update:modelValue', value: boolean): void
	}>()

	const searchTerm = ref('')
	const inputRef = ref<HTMLInputElement | null>(null)

	const { data, pending } = await useAsyncData('posts-search-sections', () =>
		queryCollectionSearchSections('posts', {
			ignoredTags: ['code', 'pre']
		})
	)

	const sections = computed<SearchSection[]>(() => data.value ?? [])
	const maxResults = 50

	const results = computed<EnhancedResult[]>(() => {
		const term = searchTerm.value.trim().toLowerCase()
		if (!term) {
			return []
		}

		const tokens = Array.from(new Set(term.split(/\s+/).filter(Boolean)))
		if (!tokens.length) {
			return []
		}

		const rawResults = sections.value
			.map(section => {
				const baseContent = (section.content ?? '').replace(/\s+/g, ' ').trim()
				if (!baseContent) {
					return null
				}

				const documentTitle = getDocumentTitle(section)
				const sectionTitle = getSectionTitle(section)
				const composite = `${documentTitle} ${sectionTitle} ${baseContent}`.toLowerCase()

				if (!tokens.every(token => composite.includes(token))) {
					return null
				}

				let score = 0
				tokens.forEach(token => {
					if (documentTitle.toLowerCase().includes(token)) {
						score += 4
					} else if (sectionTitle.toLowerCase().includes(token)) {
						score += 3
					} else {
						score += 1
					}
				})

				return {
					id: section.id,
					baseId: getBaseId(section.id),
					documentTitle,
					sectionTitle,
					snippet: buildSnippet(baseContent, tokens),
					score
				}
			})
			.filter((section): section is RawResult => Boolean(section))
			.sort((a, b) => b.score - a.score)

		if (!rawResults.length) {
			return []
		}

		const aggregated = new Map<
			string,
			{
				id: string
				baseId: string
				documentTitle: string
				sectionTitles: string[]
				snippets: string[]
				score: number
				matchCount: number
				bestScore: number
			}
		>()

		rawResults.forEach(result => {
			const existing = aggregated.get(result.baseId)
			if (!existing) {
				aggregated.set(result.baseId, {
					id: result.id,
					baseId: result.baseId,
					documentTitle: result.documentTitle,
					sectionTitles: result.sectionTitle ? [result.sectionTitle] : [],
					snippets: [result.snippet],
					score: result.score,
					matchCount: 1,
					bestScore: result.score
				})
				return
			}

			existing.matchCount += 1
			existing.score += result.score
			existing.snippets.push(result.snippet)

			if (result.sectionTitle && !existing.sectionTitles.includes(result.sectionTitle)) {
				if (existing.sectionTitles.length < 3) {
					existing.sectionTitles.push(result.sectionTitle)
				}
			}

			if (result.score > existing.bestScore) {
				existing.bestScore = result.score
				existing.id = result.id
			}
		})

		return Array.from(aggregated.values())
			.map(item => ({
				id: item.id,
				documentTitle: item.documentTitle,
				sectionLabel: buildSectionLabel(item.sectionTitles, item.matchCount),
				snippet: buildAggregatedSnippet(item.snippets),
				score: item.score,
				matchCount: item.matchCount
			}))
			.sort((a, b) => b.score - a.score)
			.slice(0, maxResults)
	})

	const onKeydown = (event: KeyboardEvent) => {
		if (!props.modelValue) {
			return
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			close()
		}
	}

	if (import.meta.client) {
		watch(
			() => props.modelValue,
			value => {
				if (value) {
					document.body.style.setProperty('overflow', 'hidden')
					nextTick(() => {
						searchTerm.value = ''
						inputRef.value?.focus()
					})
				} else {
					document.body.style.removeProperty('overflow')
				}
			}
		)

		onMounted(() => {
			window.addEventListener('keydown', onKeydown)
		})

		onBeforeUnmount(() => {
			window.removeEventListener('keydown', onKeydown)
			document.body.style.removeProperty('overflow')
		})
	}

	function close() {
		emit('update:modelValue', false)
	}

	function getDocumentTitle(section: SearchSection) {
		return section.titles?.[0] ?? section.title ?? '未命名文章'
	}

	function getSectionTitle(section: SearchSection) {
		if (!section.titles?.length) {
			return section.title ?? ''
		}
		const trail = section.titles.slice(1).filter(Boolean)
		return trail.at(-1) ?? section.title ?? ''
	}

	function getBaseId(id: string) {
		const hashIndex = id.indexOf('#')
		return hashIndex === -1 ? id : id.slice(0, hashIndex)
	}

	function buildAggregatedSnippet(snippets: string[]) {
		const unique: string[] = []
		snippets.forEach(snippet => {
			const normalized = snippet.trim()
			if (!normalized) {
				return
			}
			if (!unique.includes(normalized)) {
				unique.push(normalized)
			}
		})

		if (!unique.length) {
			return ''
		}

		const combined = unique.slice(0, 2).join(' … ')
		return combined.length > 240 ? `${combined.slice(0, 240)}…` : combined
	}

	function buildSectionLabel(sectionTitles: string[], matchCount: number) {
		if (!matchCount) {
			return ''
		}

		if (matchCount === 1) {
			return sectionTitles[0] ?? ''
		}

		if (!sectionTitles.length) {
			return ''
		}

		const label = sectionTitles.join('、')
		return `涉及段落：${label}${matchCount > sectionTitles.length ? '…' : ''}`
	}

	function buildSnippet(content: string, tokens: string[]) {
		if (!content) {
			return ''
		}

		const lower = content.toLowerCase()
		const firstMatch = tokens
			.map(token => lower.indexOf(token))
			.filter(index => index >= 0)
			.sort((a, b) => a - b)[0]

		if (firstMatch === undefined) {
			return truncate(content)
		}

		const radius = 60
		const start = Math.max(0, firstMatch - radius)
		const end = Math.min(content.length, firstMatch + radius)
		const snippet = content.slice(start, end)
		const prefix = start > 0 ? '…' : ''
		const suffix = end < content.length ? '…' : ''
		return `${prefix}${snippet}${suffix}`
	}

	function truncate(content: string) {
		return content.length > 140 ? `${content.slice(0, 140)}…` : content
	}
</script>

<style lang="less" scoped>
	.search-overlay-enter-active,
	.search-overlay-leave-active {
		transition: opacity 0.2s ease;
	}

	.search-overlay-enter-from,
	.search-overlay-leave-to {
		opacity: 0;
	}

	.search-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 120px 16px 40px;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(2px);
		z-index: 2000;
	}

	.search-overlay__panel {
		width: min(720px, 100%);
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 160px);
		overflow: hidden;
	}

	.search-overlay__header {
		display: flex;
		align-items: center;
		padding: 16px 20px 16px 16px;
		gap: 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.search-overlay__input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		font-size: 16px;
		background: rgba(255, 255, 255, 0.85);
		transition: border-color 0.2s ease;

		&:focus {
			outline: none;
			border-color: @active-blue;
		}
	}

	.search-overlay__close {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: transparent;
		font-size: 24px;
		line-height: 24px;
		cursor: pointer;
		color: rgba(0, 0, 0, 0.55);

		&:hover {
			color: rgba(0, 0, 0, 0.8);
		}
	}

	.search-overlay__body {
		overflow-y: auto;
		padding: 8px 0 20px;
	}

	.search-overlay__state {
		margin: 20px;
		text-align: center;
		color: rgba(0, 0, 0, 0.58);
	}

	.search-overlay__count {
		margin: 12px 24px 0;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.7);
	}

	.search-overlay__list {
		list-style: none;
		margin: 16px 0 0;
		padding: 0 8px 8px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.search-overlay__item {
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
		transition: transform 0.2s ease;

		&:hover {
			transform: translateY(-2px);
		}
	}

	.search-overlay__link {
		display: block;
		padding: 16px 20px;
		text-decoration: none;
		color: inherit;
	}

	.search-overlay__item-title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: @active-blue;
	}

	.search-overlay__item-meta {
		margin: 8px 0 0;
		font-size: 13px;
		color: rgba(0, 0, 0, 0.6);

		span {
			color: rgba(0, 0, 0, 0.55);
		}
	}

	.search-overlay__item-snippet {
		margin: 12px 0 0;
		font-size: 14px;
		line-height: 1.6;
		color: rgba(0, 0, 0, 0.8);
	}

	@media (max-width: 768px) {
		.search-overlay {
			padding: 80px 12px 20px;
		}

		.search-overlay__panel {
			max-height: calc(100vh - 120px);
		}
	}
</style>
