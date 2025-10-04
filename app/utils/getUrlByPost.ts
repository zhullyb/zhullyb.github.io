import type { Post } from '~/types/post'

export default function getUrlByPost(post: Post) {
	const newDate = new Date(post.date)
	const year = newDate.getFullYear()
	const month = String(newDate.getMonth() + 1).padStart(2, '0')
	const day = String(newDate.getDate()).padStart(2, '0')
	return `/${year}/${month}/${day}/${post.path.split('/').pop()}`
}
