/**
 * 从 Nuxt Content 的 body AST 中提取纯文本
 * @param node - AST 节点
 * @returns 纯文本字符串
 */
function extractTextFromAST(node: any): string {
	if (!node) return ''

	// 如果是字符串，直接返回
	if (typeof node === 'string') return node

	// 如果是数组(minimark 格式: [tag, props, ...children])
	if (Array.isArray(node)) {
		// 检查是否是 minimark 节点格式
		if (node.length >= 2 && typeof node[0] === 'string' && typeof node[1] === 'object') {
			// minimark 格式: ['p', {}, 'text', 'more text']
			// 跳过 tag (node[0]) 和 props (node[1]),只处理 children (node[2]...)
			const children = node.slice(2)
			return children.map(extractTextFromAST).join('')
		}

		// 否则当作普通数组处理
		return node.map(extractTextFromAST).join('')
	}

	// 如果有 value 属性(文本节点)
	if (node.value && typeof node.value === 'string') {
		return node.value
	}

	// 如果有 children,递归处理
	if (node.children && Array.isArray(node.children)) {
		return node.children.map(extractTextFromAST).join('')
	}

	return ''
}

/**
 * 处理 body,提取纯文本并限制字数
 * @param body - Nuxt Content 的 body 对象
 * @param maxLength - 最大字数限制,默认 300
 * @returns 处理后的纯文本
 */
export function processExcerpt(body: any, maxLength = 300): string {
	if (!body) return ''

	// 从 body.value 中提取文本
	const fullText = extractTextFromAST(body.value || body)

	// 移除多余的空白字符
	const cleanedText = fullText.replace(/\s+/g, ' ').trim()

	// 限制字数
	if (cleanedText.length <= maxLength) {
		return cleanedText
	}

	return cleanedText.slice(0, maxLength) + '...'
}
