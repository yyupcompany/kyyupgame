<template>
  <MobileCenterLayout title="活动相册" back-path="/mobile/activity/activity-index">
    <div class="activity-photos-mobile">
      <!-- 操作栏 -->
      <div class="action-bar">
        <van-uploader :after-read="onUpload" multiple :max-count="9">
          <van-button type="primary" size="small" icon="photograph">上传照片</van-button>
        </van-uploader>
      </div>

      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
      </van-dropdown-menu>

      <!-- 照片列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="photo-groups">
          <div v-for="group in photoGroups" :key="group.activityId" class="photo-group">
            <div class="group-header">
              <span class="group-title">{{ group.activityTitle }}</span>
              <span class="group-count">{{ group.photos.length }}张</span>
            </div>
            <div class="photo-grid">
              <div v-for="(photo, index) in group.photos" :key="photo.id" class="photo-item" @click="previewPhotos(group.photos, index)">
                <van-image :src="photo.url" width="100%" height="100%" fit="cover" />
              </div>
            </div>
          </div>
        </div>
        <van-empty v-if="photoGroups.length === 0 && !loading" description="暂无照片" />
      </van-pull-refresh>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast, showImagePreview } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterActivity = ref('')
const loading = ref(false)
const refreshing = ref(false)

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' }
]

interface Photo { id: number; url: string; activityId: number }
interface PhotoGroup { activityId: number; activityTitle: string; photos: Photo[] }

const photoGroups = ref<PhotoGroup[]>([])

const loadData = async () => {
  return [
    { activityId: 1, activityTitle: '开放日活动', photos: [
      { id: 1, url: 'https://via.placeholder.com/300/1989fa', activityId: 1 },
      { id: 2, url: 'https://via.placeholder.com/300/07c160', activityId: 1 },
      { id: 3, url: 'https://via.placeholder.com/300/ff9800', activityId: 1 }
    ]},
    { activityId: 2, activityTitle: '家长会', photos: [
      { id: 4, url: 'https://via.placeholder.com/300/9c27b0', activityId: 2 },
      { id: 5, url: 'https://via.placeholder.com/300/2196f3', activityId: 2 }
    ]}
  ]
}

const onRefresh = async () => {
  loading.value = true
  photoGroups.value = await loadData()
  loading.value = false
  refreshing.value = false
}

const onFilter = () => { onRefresh() }

const onUpload = () => {
  showToast('上传中...')
  setTimeout(() => showSuccessToast('上传成功'), 1000)
}

const previewPhotos = (photos: Photo[], index: number) => {
  showImagePreview({ images: photos.map(p => p.url), startPosition: index })
}

onMounted(() => { onRefresh() })
</script>

<style scoped lang="scss">
.activity-photos-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.action-bar {
  padding: 12px 16px;
  background: #fff;
}

.photo-groups {
  padding: 12px;
}

.photo-group {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;

  .group-header {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #ebedf0;
    .group-title { font-size: 15px; font-weight: 500; }
    .group-count { font-size: 12px; color: #969799; }
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 4px;
    .photo-item { aspect-ratio: 1; }
  }
}
</style>
