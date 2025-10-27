// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts

const blogConfig = {
	title: '竹林里有冰的博客',
	slogan: '朱云绘彩风燎焰，丹音颂礼冰缠烟',
	description:
		'这里是我的个人博客，专注于分享技术干货、学习心得和生活感悟，涵盖前端开发、后端架构、人工智能、编程技巧、工具推荐等多个领域。我持续更新原创内容，记录成长过程中的思考与收获，致力于帮助更多开发者和技术爱好者提升技能、拓展视野。如果你对技术、产品和互联网行业感兴趣，相信你能在这里找到有价值的知识与灵感。',
	author: {
		name: '竹林里有冰',
		avatar: 'https://static.031130.xyz/avatar.webp',
		email: 'zhullyb@outlook.com',
		homepage: 'https://zhul.in'
	},
	url: 'https://zhul.in/',
	waline: {
		serverURL: 'https://waline.zhul.in/',
		meta: ['nick', 'mail', 'link'],
		requiredMeta: ['nick'],
		lang: 'zh-CN',
		emoji: ['https://registry.npmmirror.com/@waline/emojis/^1/files/weibo'],
		wordLimit: 0,
		pageSize: 10,
		login: 'disable',
		locale: {
			placeholder: '快发个评论让我知道你在看（x'
		}
	},
	urlRedirects: {
		'/2020/07/11/GitNotes/': '/2020/07/11/gitnotes/',
		'/2020/07/11/RepoNotes/': '/2020/07/11/reponotes/',
		'/2020/08/10/AndroidUnpack/': '/2020/08/10/androidunpack/',
		'/2020/10/08/NoHello/': '/2020/10/08/nohello/',
		'/2020/12/22/Did-UOS-have-Secure-Boot-Signature/':
			'/2020/12/22/did-uos-have-secure-boot-signature/',
		'/2021/01/01/Why-I-dont-recommend-Manjaro/': '/2021/01/01/why-i-dont-recommend-manjaro/',
		'/2023/11/12/a-introduce-of-GLWTPL/': '/2023/11/12/a-introduce-of-glwtpl/',
		'/tags/CI-CD/': '/tags/CI%2FCD/',
		'/tags/Casual-Talk/': '/tags/Casual%20Talk/',
		'/tags/Github-Action/': '/tags/Github%20Action/',
		'/tags/Lsky-Pro/': '/tags/Lsky%20Pro/',
		'/tags/Nuxt-Content/': '/tags/Nuxt%20Content/',
		'/tags/OpenSource-Project/': '/tags/OpenSource%20Project/',
		'/tags/RPM-Package/': '/tags/RPM%20Package/',
		'/tags/Shell-Script/': '/tags/Shell%20Script/',
		'/tags/Virtual-Machine/': '/tags/Virtual%20Machine/',
		'/tags/Vue-js/': '/tags/Vue.js',
		'/tags/Web-PKI/': '/tags/Web%20PKI/'
	},
	links: [
		{
			title: '精弘 RSS 看板',
			intro: '浙江工业大学精弘网络技术团队',
			link: 'https://zjutjh.github.io',
			avatar: 'https://static.031130.xyz/uploads/2024/12/31/71b730c8be4a8.webp'
		},
		{
			title: 'iNetech Blog',
			intro: '凡心所向，素履所往',
			link: 'https://blog.udp0.com',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/6653ed001e208.webp'
		},
		{
			title: "Karuboniru's Blog",
			intro: '就是个学物理的，懂个屁的计算机',
			link: 'https://yanqiyu.info',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/62f7d8f114851.webp'
		},
		{
			title: '星外之神的博客',
			intro: '天下难事，必作于易；天下大事，必作于细。',
			link: 'https://wszqkzqk.github.io',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/62f7d98e0fd18.webp'
		},
		{
			title: "Endle's Blog",
			intro: 'Fedora/Firefox/Wine User.',
			link: 'https://endle.github.io/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/62f7db1280c26.webp'
		},
		{
			title: 'ImBearChild',
			intro: '又一个WordPress站点，我的自留地',
			link: 'https://imbearchild.cyou/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/74139df97bae3.webp'
		},
		{
			title: '白杨的文档站',
			intro: '鸽子/咸鱼/openSUSE 新闻译者',
			link: 'https://whiteboard-ui8.pages.dev/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/259396342424f.webp'
		},
		{
			title: '派大星的石头屋',
			intro: '一头蠢猪罢了',
			link: 'https://blog.cnpatrickstar.com/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/6329b2a587c1f.webp'
		},
		{
			title: "Finley's Blog",
			intro: '一个不想平庸的平庸之人. 来自浙江工业大学的计算机科学学生, 正在努力成为一名全栈开发者.',
			link: 'https://www.f1nley.xyz/',
			avatar: 'https://static.031130.xyz/uploads/2024/09/23/5c47b2d971736.webp'
		},
		{
			title: "j10c's Blog",
			link: 'https://site.j10ccc.xyz'
		},
		{
			title: 'i1nfo',
			intro: 'I Info forever',
			link: 'https://blog.i1nfo.com/',
			avatar: 'https://blog.i1nfo.com/images/iinfo-sq.png'
		},
		{
			title: 'Node Sans',
			intro: '不知道 Node 和 Sans 有什么关系',
			link: 'https://blog.node189.top',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/65c37927314ac.webp'
		},
		{
			title: '树下集熵',
			intro: 'the mirror of life',
			link: 'https://www.entropy-tree.top/'
		},
		{
			title: 'chloris',
			link: 'https://www.cnblogs.com/chloris/'
		},
		{
			title: '惜寞 - 无人小间',
			intro: '也许大概应该可能 maybe/possible 会发（水）点文章',
			link: 'https://lonesome.cn/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/653dce34279de.webp'
		},
		{
			title: '青鸟の博客',
			intro: '一只不会飞的小笨鸟',
			link: 'https://blog.bluebird.icu/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/665c87250daa1.webp'
		},
		{
			title: '浅浅子的博客',
			intro: '内心丰盈者独行也如众',
			link: 'https://blog.qianqianzyk.top/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/659f548c17c9b.webp'
		},
		{
			title: "Skykey's Home",
			intro: 'Skykey的私人博客ᕕ( ᐛ )ᕗ',
			link: 'https://blog.skykey.fun'
		},
		{
			title: '点墨的私人部落阁',
			intro: '寄情山水的arch玩客',
			link: 'https://blog.m-l.cc/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/65ce4796c447d.webp'
		},
		{
			title: 'T-ON-Y的小窝',
			intro: 'wwwww',
			link: 'https://tonywu.top/',
			avatar: 'https://static.031130.xyz/uploads/2024/08/12/665c86dd86375.webp'
		},
		{
			title: '望舒的尘歌壶',
			intro: '技术宅拯救世界',
			link: 'https://blog.phlin.cn/',
			avatar: 'https://qiuniu.phlin.cn/bucket/icon.png'
		},
		{
			title: '消失在彩霞里的博客',
			intro: '一只爱编程的小马',
			link: 'https://blog.aiyin.club/',
			avatar: 'https://static.031130.xyz/uploads/2024/09/24/9d106a106aef1.webp'
		},
		{
			title: '風雪城',
			intro: '浩繁星空下的一场稚嫩的梦',
			link: 'https://blog.chyk.ink/',
			avatar: 'https://static.031130.xyz/uploads/2024/11/18/9b6f5d7231d91.webp'
		},
		{
			title: '纸鹿本鹿',
			intro: '纸鹿至麓不知路，支炉制露不止漉',
			link: 'https://blog.zhilu.cyou/',
			avatar: 'https://www.zhilu.cyou/api/avatar.png'
		},
		{
			title: 'SugarMGP',
			intro: '白糖的记事本',
			link: 'https://blog.sugarmgp.cn/',
			avatar: 'https://blog.sugarmgp.cn/img/icon.png'
		}
	]
}

export default blogConfig
