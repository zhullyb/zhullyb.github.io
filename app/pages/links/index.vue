<template>
	<DefaultLayout title="友链">
		<div class="link-container">
			<div class="link-card" v-for="link in blogConfig.links" :key="link.link">
				<img
					v-if="link.avatar"
					:src="link.avatar"
					:alt="`${link.title} avatar`"
					class="link-avatar"
				/>
				<NuxtLink :to="link.link">
					<h3 class="link-title">{{ link.title }}</h3>
					<p class="link-intro">{{ link.intro }}</p>
				</NuxtLink>
			</div>
		</div>
	</DefaultLayout>
</template>

<script setup lang="ts">
	import blogConfig from '~~/blog.config'
</script>

<style scoped lang="less">
	.link-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}

	.link-card {
		padding: 16px;
		display: flex;
		align-items: center;
		transition: box-shadow 0.3s ease;

		&:hover {
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		}
	}

	.link-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		margin-right: 16px;
	}

	.link-title {
		margin: 0;
		font-size: 1.25rem;
		color: #333;
	}

	.link-intro {
		margin: 4px 0 0;
		color: #666;
	}
</style>
