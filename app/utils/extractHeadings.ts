/**
 * 标题接口
 */
export interface Heading {
	id: string
	text: string
	level: number
}

/**
 * 从 AST 节点中提取文本内容
 */
function extractText(node: any): string {
	if (!node) return ''
	if (typeof node === 'string') return node

	if (Array.isArray(node)) {
		// minimark 格式: ['tag', {props}, ...children]
		if (node.length >= 2 && typeof node[0] === 'string' && typeof node[1] === 'object') {
			const children = node.slice(2)
			return children.map(extractText).join('')
		}
		return node.map(extractText).join('')
	}

	if (node.value && typeof node.value === 'string') {
		return node.value
	}

	if (node.children && Array.isArray(node.children)) {
		return node.children.map(extractText).join('')
	}

	return ''
}

/**
 * 从 Nuxt Content 的 body AST 中提取标题
 * @param body - Nuxt Content 的 body 对象
 * @returns 标题数组
 */
export function extractHeadings(body: any): Heading[] {
	if (!body) return []

	const headings: Heading[] = []
	const nodes = body.value || body

	function traverse(node: any) {
		if (!node) return

		// 处理数组
		if (Array.isArray(node)) {
			// 检查是否是 minimark 节点格式: ['tag', {props}, ...children]
			if (node.length >= 2 && typeof node[0] === 'string' && typeof node[1] === 'object') {
				const tag = node[0]
				const props = node[1]
				const children = node.slice(2)

				// 检查是否是标题标签 (h1-h6)
				const headingMatch = tag.match(/^h([1-6])$/)
				if (headingMatch?.[1] && props.id) {
					const level = parseInt(headingMatch[1])
					const text = children.map(extractText).join('').trim()

					if (text) {
						headings.push({
							id: props.id,
							text,
							level
						})
					}
				}

				// 递归遍历子节点
				children.forEach(traverse)
			} else {
				// 普通数组，遍历每个元素
				node.forEach(traverse)
			}
		}
		// 处理对象节点
		else if (typeof node === 'object') {
			if (node.children && Array.isArray(node.children)) {
				node.children.forEach(traverse)
			}
			if (node.value && Array.isArray(node.value)) {
				node.value.forEach(traverse)
			}
		}
	}

	traverse(nodes)
	return headings
}
