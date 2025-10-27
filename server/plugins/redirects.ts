import { defineEventHandler } from 'h3'
import blogConfig from '../../blog.config'

export default defineNitroPlugin(nitroApp => {
	const redirects = blogConfig.urlRedirects as Record<string, string>

	// 为每个重定向路径创建处理器
	for (const [fromPath, toPath] of Object.entries(redirects)) {
		nitroApp.router.use(
			fromPath,
			defineEventHandler(event => {
				const fullTargetUrl = `${blogConfig.url.replace(/\/$/, '')}${toPath}`

				// 设置响应头
				event.node.res.setHeader('Content-Type', 'text/html; charset=utf-8')

				// 返回包含 meta refresh、canonical 和 JS 重定向的 HTML
				return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>页面跳转中... - ${blogConfig.title}</title>
	<link rel="canonical" href="${fullTargetUrl}">
	<meta http-equiv="refresh" content="0;url=${toPath}">
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			margin: 0;
			padding: 2rem;
			text-align: center;
			background-color: #f5f5f5;
		}
		.container {
			background: white;
			padding: 2rem;
			border-radius: 8px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
			max-width: 600px;
		}
		h1 {
			font-size: 1.5rem;
			margin-bottom: 1rem;
			color: #333;
		}
		p {
			margin: 1rem 0;
			color: #666;
		}
		a {
			color: #0066cc;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
	</style>
	<script>
		// 立即进行 JavaScript 重定向
		(function() {
			window.location.replace('${toPath}');
		})();
	</script>
</head>
<body>
	<div class="container">
		<h1>页面已迁移</h1>
		<p>正在跳转到新地址...</p>
		<p>如果没有自动跳转,请点击: <a href="${toPath}">${fullTargetUrl}</a></p>
	</div>
</body>
</html>`
			})
		)
	}
})
