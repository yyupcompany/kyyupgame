<template>
  <MobileCenterLayout title="活动搜索" back-path="/mobile/activity/activity-index">
    <div class="activity-search-mobile">
      <!-- 搜索框 -->
      <van-sticky>
        <van-search
          v-model="searchText"
          placeholder="搜索活动名称/地点"
          show-action
          @search="onSearch"
          @cancel="onCancel"
        />
      </van-sticky>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onFilter" />
          <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
          <van-dropdown-item v-model="filterTime" :options="timeOptions" @change="onFilter" />
        </van-dropdown-menu>
      </div>

      <!-- 热门搜索 -->
      <div class="hot-search" v-if="!searchText && !hasSearched">
        <div class="section-title">热门搜索</div>
        <div class="hot-tags">
          <van-tag
            v-for="tag in hotTags"
            :key="tag"
            size="medium"
            plain
            @click="searchText = tag; onSearch()"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div class="search-history" v-if="!searchText && !hasSearched && searchHistory.length > 0">
        <div class="section-title">
          <span>搜索历史</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="history-tags">
          <van-tag
            v-for="(tag, index) in searchHistory"
            :key="index"
            size="medium"
            plain
            closeable
            @click="searchText = tag; onSearch()"
            @close="removeHistory(index)"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="hasSearched">
        <div class="results-header">
          <span>找到 {{ resultList.length }} 个活动</span>
          <van-dropdown-menu>
            <van-dropdown-item v-model="sortType" :options="sortOptions" @change="onSort" />
          </van-dropdown-menu>
        </div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div class="result-list">
              <div
                v-for="item in resultList"
                :key="item.id"
                class="result-card"
                @click="viewDetail(item)"
              >
                <div class="card-image">
                  <van-image
                    :src="item.coverImage || 'https://via.placeholder.com/120x80'"
                    width="120"
                    height="80"
                    fit="cover"
                    radius="4"
                  />
                  <van-tag :type="getStatusTagType(item.status)" class="status-tag">
                    {{ getStatusLabel(item.status) }}
                  </van-tag>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ item.title }}</div>
                  <div class="card-info">
                    <van-icon name="clock-o" />
                    <span>{{ formatDate(item.startTime) }}</span>
                  </div>
                  <div class="card-info">
                    <van-icon name="location-o" />
                    <span>{{ item.location }}</span>
                  </div>
                  <div class="card-meta">
                    <span class="participants">
                      <van-icon name="friends-o" />
                      {{ item.currentCount }}/{{ item.capacity }}人
                    </span>
                    <span class="fee" v-if="item.fee > 0">¥{{ item.fee }}</span>
                    <span class="fee free" v-else>免费</span>
                  </div>
                </div>
              </div>
            </div>

            <van-empty v-if="resultList.length === 0 && !loading" description="未找到相关活动" />
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 搜索状态
const searchText = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 筛选选项
const filterType = ref('')
const filterStatus = ref('')
const filterTime = ref('')
const sortType = ref('time')

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '开放日', value: 'open-day' },
  { text: '家长会', value: 'parent-meeting' },
  { text: '亲子活动', value: 'family' },
  { text: '招生宣讲', value: 'recruitment' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '报名中', value: 1 },
  { text: '进行中', value: 2 },
  { text: '已结束', value: 3 }
]

const timeOptions = [
  { text: '全部时间', value: '' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' },
  { text: '近三个月', value: 'quarter' }
]

const sortOptions = [
  { text: '时间排序', value: 'time' },
  { text: '热门优先', value: 'hot' },
  { text: '人数优先', value: 'participants' }
]

// 热门搜索
const hotTags = ['开放日', '亲子活动', '家长会', '运动会', '毕业典礼']

// 搜索历史
const searchHistory = ref<string[]>(['开放日', '亲子'])

const clearHistory = () => {
  searchHistory.value = []
}

const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
}

// 搜索结果
interface Activity {
  id: number
  title: string
  startTime: string
  location: string
  status: number
  capacity: number
  currentCount: number
  fee: number
  coverImage?: string
}

const resultList = ref<Activity[]>([])

// 状态转换
const getStatusTagType = (status: number): TagType => {
  const map: Record<number, TagType> = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'default' }
  return map[status] || 'default'
}

const getStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '计划中', 1: '报名中', 2: '进行中', 3: '已结束' }
  return map[status] || '未知'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 搜索操作
const onSearch = async () => {
  if (!searchText.value.trim()) return
  
  // 保存搜索历史
  if (!searchHistory.value.includes(searchText.value)) {
    searchHistory.value.unshift(searchText.value)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
  }

  hasSearched.value = true
  loading.value = true
  finished.value = false

  // 模拟搜索
  await new Promise(resolve => setTimeout(resolve, 500))
  
  resultList.value = [
    { id: 1, title: '开放日活动', startTime: '2025-01-15 09:00:00', location: '幼儿园大厅', status: 1, capacity: 50, currentCount: 32, fee: 0 },
    { id: 2, title: '亲子运动会', startTime: '2025-01-20 08:30:00', location: '操场', status: 1, capacity: 100, currentCount: 78, fee: 50 },
    { id: 3, title: '新年联欢会', startTime: '2025-01-25 14:00:00', location: '多功能厅', status: 0, capacity: 80, currentCount: 0, fee: 0 }
  ]

  loading.value = false
  finished.value = true
}

const onCancel = () => {
  searchText.value = ''
  hasSearched.value = false
  resultList.value = []
}

const onFilter = () => {
  if (hasSearched.value) {
    onSearch()
  }
}

const onSort = () => {
  // 排序逻辑
}

const onLoad = () => {
  // 加载更多
}

const onRefresh = async () => {
  await onSearch()
  refreshing.value = false
}

const viewDetail = (item: Activity) => {
  router.push(`/mobile/activity/activity-detail/${item.id}`)
}
</script>

<style scoped lang="scss">
.activity-search-mobile {
  min-height: 100vh;
  background: #f7f8fa;
}

.filter-section {
  background: #fff;
}

.hot-search,
.search-history {
  padding: 16px;
  background: #fff;
  margin-top: 12px;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #323233;
    margin-bottom: 12px;
  }

  .hot-tags,
  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.search-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    font-size: 13px;
    color: #969799;
  }

  .result-list {
    padding: 12px;
  }

  .result-card {
    display: flex;
    gap: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;

    .card-image {
      position: relative;
      flex-shrink: 0;

      .status-tag {
        position: absolute;
        top: 4px;
        left: 4px;
      }
    }

    .card-content {
      flex: 1;
      min-width: 0;

      .card-title {
        font-size: 15px;
        font-weight: 500;
        color: #323233;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-info {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #969799;
        margin-bottom: 4px;
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;

        .participants {
          font-size: 12px;
          color: #646566;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .fee {
          font-size: 14px;
          font-weight: 500;
          color: #ee0a24;

          &.free {
            color: #07c160;
          }
        }
      }
    }
  }
}
</style>
