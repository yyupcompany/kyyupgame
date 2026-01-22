<template>
  <MobileCenterLayout title="活动列表" back-path="/mobile/activity/activity-index">
    <template #right>
      <van-icon name="filter-o" size="20" @click="showFilter = true" />
    </template>

    <div class="activity-list-mobile">
      <!-- 搜索栏 -->
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动"
        shape="round"
        @search="onSearch"
      />

      <!-- 筛选标签 -->
      <div class="filter-tags">
        <van-tag 
          v-for="tag in filterTags" 
          :key="tag.key"
          :type="activeFilter === tag.key ? 'primary' : 'default'"
          round
          @click="setFilter(tag.key)"
        >
          {{ tag.label }}
        </van-tag>
      </div>

      <!-- 活动列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-if="activities.length === 0 && !loading" class="empty-state">
            <van-empty description="暂无活动" />
          </div>
          <div
            v-for="item in activities"
            :key="item.id"
            class="activity-item"
            @click="viewActivity(item)"
          >
            <div class="item-cover" v-if="item.coverUrl">
              <img :src="item.coverUrl" :alt="item.name" />
            </div>
            <div class="item-content">
              <div class="item-header">
                <span class="item-title">{{ item.name }}</span>
                <van-tag :type="getStatusType(item.status)" size="medium">
                  {{ getStatusLabel(item.status) }}
                </van-tag>
              </div>
              <div class="item-meta">
                <span><van-icon name="clock-o" /> {{ formatDate(item.startDate) }}</span>
                <span><van-icon name="friends-o" /> {{ item.participantCount || 0 }}人</span>
              </div>
              <div class="item-location">
                <van-icon name="location-o" /> {{ item.location || '待定' }}
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilter" position="right" :style="{ width: '80%', height: '100%' }">
      <div class="filter-popup">
        <h3>筛选条件</h3>
        <van-cell-group>
          <van-cell title="活动类型">
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="filterForm.type" :options="typeOptions" />
              </van-dropdown-menu>
            </template>
          </van-cell>
          <van-cell title="活动状态">
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="filterForm.status" :options="statusOptions" />
              </van-dropdown-menu>
            </template>
          </van-cell>
        </van-cell-group>
        <div class="filter-actions">
          <van-button type="default" block @click="resetFilter">重置</van-button>
          <van-button type="primary" block @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import type { TagType } from 'vant'

const router = useRouter()

const searchKeyword = ref('')
const activeFilter = ref('all')
const showFilter = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const filterTags = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ended', label: '已结束' }
]

const filterForm = reactive({
  type: '',
  status: ''
})

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '亲子活动', value: 'parent_child' },
  { text: '节日活动', value: 'festival' },
  { text: '户外活动', value: 'outdoor' },
  { text: '教育活动', value: 'education' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '进行中', value: 'ongoing' },
  { text: '即将开始', value: 'upcoming' },
  { text: '已结束', value: 'ended' }
]

const activities = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    ongoing: 'success',
    upcoming: 'primary',
    ended: 'default'
  }
  return types[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束'
  }
  return labels[status] || status
}

const setFilter = (key: string) => {
  activeFilter.value = key
  activities.value = []
  finished.value = false
  onLoad()
}

const onSearch = () => {
  activities.value = []
  finished.value = false
  onLoad()
}

const onRefresh = async () => {
  activities.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onLoad = async () => {
  loading.value = true
  try {
    // TODO: 调用API
    setTimeout(() => {
      activities.value = [
        { id: '1', name: '亲子运动会', coverUrl: '', startDate: '2024-12-20', location: '运动场', status: 'upcoming', participantCount: 28 },
        { id: '2', name: '新年联欢会', coverUrl: '', startDate: '2024-12-31', location: '大礼堂', status: 'upcoming', participantCount: 45 }
      ]
      loading.value = false
      finished.value = true
    }, 500)
  } catch (error) {
    loading.value = false
  }
}

const viewActivity = (item: any) => {
  router.push(`/mobile/activity/activity-detail/${item.id}`)
}

const resetFilter = () => {
  filterForm.type = ''
  filterForm.status = ''
}

const applyFilter = () => {
  showFilter.value = false
  activities.value = []
  finished.value = false
  onLoad()
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped lang="scss">
.activity-list-mobile {
  min-height: 100vh;
  background: #f7f8fa;

  .filter-tags {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: #fff;
    overflow-x: auto;
  }

  .activity-item {
    display: flex;
    background: #fff;
    margin: 12px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .item-cover {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      background: #f5f5f5;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-content {
      flex: 1;
      padding: 12px;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;

        .item-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      }

      .item-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .item-location {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .empty-state {
    padding: 40px 0;
  }
}

.filter-popup {
  padding: 16px;

  h3 {
    margin-bottom: 16px;
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
