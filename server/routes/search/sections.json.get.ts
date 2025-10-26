export default defineEventHandler(async event => {
	return await queryCollectionSearchSections(event, 'posts', {
		ignoredTags: ['code', 'pre']
	})
})
