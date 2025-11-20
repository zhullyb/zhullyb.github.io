<template>
  <span class="pagination" id="pagination">
    <!-- 上一页箭头 -->
    <NuxtLinkLocale class="pagination-block" :to="getPageUrl(currentPage - 1)" :aria-disabled="currentPage === 1"
      v-if="currentPage > 1">
      &lt;
    </NuxtLinkLocale>
    <!-- 页码列表 -->
    <template v-for="page in pagesToShow" :key="page">
      <span v-if="page === '...'" class="space">…</span>
      <NuxtLinkLocale v-else-if="typeof page === 'number'" class="pagination-block"
        :class="{ current: page === currentPage }" :to="getPageUrl(page)">{{ page }}</NuxtLinkLocale>
    </template>
    <!-- 下一页箭头 -->
    <NuxtLinkLocale class="pagination-block" :to="getPageUrl(currentPage + 1)" v-if="currentPage < totalPages">
      &gt;
    </NuxtLinkLocale>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  urlPrefix: {
    type: String,
    default: ''
  }
})

// 生成页码数组，带省略号
const pagesToShow = computed(() => {
  let pages: (number | string)[] = []
  const { currentPage, totalPages } = props
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  } else {
    // 靠近开头
    if (currentPage <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPages]
    }
    // 靠近结尾
    else if (currentPage >= totalPages - 3) {
      pages = [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ]
    }
    // 中间
    else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
    }
  }
  return pages
})

function getPageUrl(page: number) {
  if (page < 1 || page > props.totalPages) return '#'
  return page === 1 ? `${props.urlPrefix}/` : `${props.urlPrefix}/page/${page}/`
}
</script>

<style lang="less" scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.pagination-block {
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  cursor: pointer;

  .dark-mode({
    color: #fff;
  });

&.current {
  background: #f8f9fa;
  cursor: default;

  .dark-mode({
    background: @dark-second-color;
    color: #fff;
  });
}

&:not(.current) {
  &:hover {
    background: #f8f9fa;
    color: @active-blue;

    .dark-mode({
      background: @dark-second-color;
    });
}
}
}

.space {
  padding: 0 0.5rem;
  color: #999;
}
</style>
