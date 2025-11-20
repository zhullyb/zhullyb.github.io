<template>
	<nav v-if="prevPost || nextPost" class="post-navigation">
		<NuxtLinkLocale v-if="prevPost" class="nav-button prev" :to="prevPost.path">
			<MaterialSymbolsArrowBackIos class="nav-arrow" />
			<div class="nav-content">
				<span class="nav-label">{{ t('postNavigation.prev') }}</span>
				<span class="nav-title">{{ prevPost.title }}</span>
			</div>
		</NuxtLinkLocale>

		<NuxtLinkLocale v-if="nextPost" class="nav-button next" :to="nextPost.path">
			<MaterialSymbolsArrowForwardIos class="nav-arrow" />
			<div class="nav-content">
				<span class="nav-label">{{ t('postNavigation.next') }}</span>
				<span class="nav-title">{{ nextPost.title }}</span>
			</div>
		</NuxtLinkLocale>
	</nav>
</template>

<script setup lang="ts">
	import type { Post } from '~/types/post'

	interface Props {
		prevPost?: Post | null
		nextPost?: Post | null
	}

	defineProps<Props>()

	const { t } = useI18n()
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
		text-decoration: none;
		transition: border-color 0.2s ease;
		cursor: pointer;

		color: #24292e;
		border: 1px solid #e1e4e8;
		.dark-mode({
      border: 1px solid @dark-border-color;
      color: #c9d1d9;
    });

		&:hover {
			border-color: @active-blue;

			.nav-arrow,
			.nav-label,
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
		transition: color 0.2s ease;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.4;
		color: #24292e;

		.dark-mode({
      color: #c9d1d9;
    });
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
