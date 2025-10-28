<template>
	<nav v-if="prevPost || nextPost" class="post-navigation">
		<a
			v-if="prevPost"
			class="nav-button prev"
			:href="prevPost.path"
			@click.prevent="navigateTo(prevPost.path)"
		>
			<div class="nav-arrow">←</div>
			<div class="nav-content">
				<span class="nav-label">上一篇</span>
				<span class="nav-title">{{ prevPost.title }}</span>
			</div>
		</a>

		<a
			v-if="nextPost"
			class="nav-button next"
			:href="nextPost.path"
			@click.prevent="navigateTo(nextPost.path)"
		>
			<div class="nav-content">
				<span class="nav-label">下一篇</span>
				<span class="nav-title">{{ nextPost.title }}</span>
			</div>
			<div class="nav-arrow">→</div>
		</a>
	</nav>
</template>

<script setup lang="ts">
	import type { Post } from '~/types/post'

	interface Props {
		prevPost?: Post | null
		nextPost?: Post | null
	}

	defineProps<Props>()
</script>

<style lang="less" scoped>
	.post-navigation {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.nav-button {
		flex: 0 1 calc(50% - 0.5rem);
		max-width: calc(50% - 0.5rem);
		min-width: 280px;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border: 1px solid #e1e4e8;
		background: #fff;
		text-decoration: none;
		color: #24292e;
		transition: border-color 0.2s ease;
		cursor: pointer;

		&:hover {
			border-color: @active-blue;

			.nav-title {
				color: @active-blue;
			}
		}

		&.prev {
			margin-right: auto;

			.nav-content {
				text-align: left;
			}
		}

		&.next {
			margin-left: auto;
			flex-direction: row-reverse;

			.nav-content {
				text-align: right;
			}
		}
	}

	.nav-arrow {
		font-size: 1.5rem;
		font-weight: 600;
		color: #6a737d;
		flex-shrink: 0;
		line-height: 1;
	}

	.nav-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		flex: 1;
	}

	.nav-label {
		font-size: 0.875rem;
		color: #6a737d;
		font-weight: 500;
	}

	.nav-title {
		font-size: 1rem;
		font-weight: 600;
		color: #24292e;
		transition: color 0.2s ease;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.4;
	}

	.tablet-down({
    .post-navigation {
      flex-direction: column;
      gap: 0.75rem;
    }

    .nav-button {
      min-width: 100%;
    }
  });
</style>
