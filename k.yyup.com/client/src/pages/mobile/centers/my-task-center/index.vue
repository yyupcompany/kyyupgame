<template>
  <MobileCenterLayout title="页面" back-path="/mobile/centers">
    <div class="page">
      <van-cell-group inset>
        <van-cell title="数据加载中" v-if="loading" />
        <van-cell v-else title="数据" :value="dataCount.toString()" />
      </van-cell-group>
      <van-list v-model:loading="listLoading" :finished="finished" @load="loadData">
        <van-cell v-for="item in dataList" :key="item.id" :title="item.title || item.name" is-link />
      </van-list>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'

const loading = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const dataCount = ref(0)
const dataList = ref<any[]>([])

const loadData = async () => {
  try {
    listLoading.value = true
    const response = await request.get('/tasks')
    if (response.success && response.data) {
      dataList.value = response.data.items || response.data.list || response.data
      dataCount.value = response.data.total || dataList.value.length
      finished.value = true
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    listLoading.value = false
  }
}

onMounted(async () => {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  loading.value = true
  await loadData()
  loading.value = false
  closeToast()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';
.page { min-height: 100vh; background-color: var(--bg-color-page); padding-bottom: 20px; }
</style>
