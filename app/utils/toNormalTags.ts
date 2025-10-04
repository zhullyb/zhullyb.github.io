export default function toNormalTags(tags: string | string[] | undefined) {
	if (Array.isArray(tags)) {
		return tags
	} else if (typeof tags === 'string') {
		return [tags]
	} else {
		return []
	}
}
