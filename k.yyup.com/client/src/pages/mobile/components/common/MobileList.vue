<template>
  <div class="mobile-list">
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <!-- 长列表 -->
      <van-list
        v-model:loading="loading"
        v-model:error="error"
        :finished="finished"
        :finished-text="finishedText"
        :offset="offset"
        @load="handleLoad"
      >
        <div class="list-header" v-if="$slots.header">
          <slot name="header"></slot>
        </div>

        <div class="list-items">
          <div
            v-for="(item, index) in localItems"
            :key="itemKey ? item[itemKey] : index"
            class="list-item"
            :class="{ clickable }"
            @click="handleItemClick(item, index)"
          >
            <slot name="item" :item="item" :index="index"></slot>
          </div>
        </div>

        <div class="list-empty" v-if="!loading && !error && localItems.length === 0">
          <van-empty :image="emptyImage" :description="emptyText">
            <template v-if="$slots.empty">
              <slot name="empty"></slot>
            </template>
          </van-empty>
        </div>

        <div class="list-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  items?: any[]
  itemKey?: string
  loading?: boolean
  error?: boolean
  finished?: boolean
  finishedText?: string
  offset?: number
  emptyText?: string
  emptyImage?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  offset: 300,
  finishedText: '没有更多了',
  emptyText: '暂无数据',
  emptyImage: 'default',
  clickable: false
})

const emit = defineEmits<{
  refresh: []
  load: []
  'item-click': [item: any, index: number]
}>()

const refreshing = ref(false)
const loading = ref(props.loading)
const error = ref(props.error)
const finished = ref(props.finished)
const localItems = ref([...props.items])

// 监听 props 变化
watch(() => props.items, (newItems) => {
  localItems.value = [...newItems]
})

watch(() => props.loading, (newLoading) => {
  loading.value = newLoading
})

watch(() => props.error, (newError) => {
  error.value = newError
})

watch(() => props.finished, (newFinished) => {
  finished.value = newFinished
})

const handleRefresh = () => {
  refreshing.value = true
  emit('refresh')
  // 模拟异步刷新完成
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const handleLoad = () => {
  emit('load')
}

const handleItemClick = (item: any, index: number) => {
  emit('item-click', item, index)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-list {
  .list-header,
  .list-footer {
    padding: var(--spacing-md);
  }

  .list-item {
    &.clickable {
      cursor: pointer;
      transition: background-color 0.3s;

      &:active {
        background-color: var(--bg-color-page);
      }
    }
  }

  .list-empty {
    padding: 60px 0;
  }
}
</style>
