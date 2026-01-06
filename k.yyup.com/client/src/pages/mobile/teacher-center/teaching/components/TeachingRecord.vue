<template>
  <div class="teaching-record">
    <!-- 操作栏 -->
    <div class="action-bar">
      <van-button type="primary" size="small" @click="handleCreateRecord">
        <van-icon name="plus" />
        添加记录
      </van-button>
      <van-button size="small" @click="handleExport">
        <van-icon name="down" />
        导出记录
      </van-button>
    </div>

    <!-- 筛选条件 -->
    <van-card class="filter-card">
      <van-form @submit="handleFilter">
        <van-field
          v-model="filterForm.className"
          name="className"
          label="班级"
          placeholder="选择班级"
          readonly
          is-link
          @click="showClassFilter = true"
        />

        <van-field
          v-model="filterForm.dateRangeText"
          name="dateRange"
          label="日期范围"
          placeholder="选择日期范围"
          readonly
          is-link
          @click="showDateRange = true"
        />

        <div class="filter-buttons">
          <van-button type="primary" size="small" @click="handleFilter">
            <van-icon name="search" />
            筛选
          </van-button>
          <van-button size="small" @click="handleResetFilter">重置</van-button>
        </div>
      </van-form>
    </van-card>

    <!-- 记录列表 -->
    <div class="record-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="record in displayRecords"
            :key="record.id"
            class="record-item"
          >
            <van-card>
              <!-- 头部信息 -->
              <template #title>
                <div class="record-title">{{ record.className }} - {{ record.courseName }}</div>
              </template>

              <template #desc>
                <div class="record-meta">
                  <van-tag type="primary" size="small">{{ formatDate(record.date) }}</van-tag>
                  <span class="meta-item">{{ record.duration }}分钟</span>
                  <span class="meta-item">出勤: {{ record.attendance }}人</span>
                  <van-tag :type="getCourseTypeColor(record.courseType)" size="small">
                    {{ getCourseTypeText(record.courseType) }}
                  </van-tag>
                </div>
              </template>

              <!-- 主要内容 -->
              <div class="record-content">
                <div class="content-text">{{ record.content }}</div>

                <!-- 媒体文件 -->
                <div v-if="record.mediaFiles && record.mediaFiles.length > 0" class="media-section">
                  <div class="section-title">教学媒体</div>
                  <div class="media-grid">
                    <div
                      v-for="media in record.mediaFiles.slice(0, 4)"
                      :key="media.id"
                      class="media-item"
                      @click="handleViewMedia(media)"
                    >
                      <img
                        v-if="media.type === 'image'"
                        :src="media.url"
                        :alt="media.name"
                        class="media-image"
                      />
                      <div v-else class="media-video">
                        <van-icon name="video-o" />
                      </div>
                    </div>
                    <div
                      v-if="record.mediaFiles.length > 4"
                      class="media-more"
                      @click="handleViewAllMedia(record)"
                    >
                      +{{ record.mediaFiles.length - 4 }}
                    </div>
                  </div>
                </div>

                <!-- 学生表现 -->
                <div v-if="record.studentPerformance" class="performance-section">
                  <div class="section-title">学生表现</div>
                  <div class="performance-text">{{ record.studentPerformance }}</div>
                </div>

                <!-- 评分信息 -->
                <div class="rating-section">
                  <div class="rating-item">
                    <span class="rating-label">课堂互动:</span>
                    <van-rate :model-value="record.interactionLevel" :size="16" readonly />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">教学效果:</span>
                    <van-rate :model-value="record.effectivenessLevel" :size="16" readonly />
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <template #footer>
                <div class="record-actions">
                  <van-button size="small" @click="handleViewRecord(record)">
                    <van-icon name="eye-o" />
                    查看
                  </van-button>
                  <van-button size="small" @click="handleEditRecord(record)">
                    <van-icon name="edit" />
                    编辑
                  </van-button>
                  <van-button size="small" type="danger" @click="handleDeleteRecord(record)">
                    <van-icon name="delete-o" />
                    删除
                  </van-button>
                </div>
              </template>
            </van-card>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && displayRecords.length === 0"
        description="暂无教学记录"
        image="default"
      />
    </div>

    <!-- 筛选弹窗 -->
    <!-- 班级筛选 -->
    <van-popup v-model:show="showClassFilter" position="bottom" round>
      <van-picker
        :columns="classColumns"
        @confirm="onClassFilterConfirm"
        @cancel="showClassFilter = false"
      />
    </van-popup>

    <!-- 日期范围筛选 -->
    <van-popup v-model:show="showDateRange" position="bottom" round>
      <van-calendar
        v-model:show="showDateRange"
        type="range"
        @confirm="onDateRangeConfirm"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>

    <!-- 媒体预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

    <!-- 教学记录详情对话框 -->
    <TeachingRecordDetailDialog
      v-model="recordDetailVisible"
      :record="selectedRecord"
      @edit="handleRecordDetailEdit"
      @share="handleRecordDetailShare"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import TeachingRecordDetailDialog from './TeachingRecordDetailDialog.vue'

interface TeachingRecord {
  id: number
  className: string
  courseName: string
  date: string
  duration: number
  attendance: number
  courseType: string
  content: string
  mediaFiles?: Array<{
    id: number
    name: string
    type: 'image' | 'video'
    url: string
  }>
  studentPerformance?: string
  interactionLevel: number
  effectivenessLevel: number
}

interface Props {
  records: TeachingRecord[]
  loading?: boolean
}

interface Emits {
  (e: 'create-record'): void
  (e: 'edit-record', record: TeachingRecord): void
  (e: 'delete-record', record: TeachingRecord): void
  (e: 'refresh'): void
  (e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 状态管理
const refreshing = ref(false)
const finished = ref(false)
const showClassFilter = ref(false)
const showDateRange = ref(false)
const showImagePreview = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)
const recordDetailVisible = ref(false)
const selectedRecord = ref<TeachingRecord | null>(null)

// 筛选表单
const filterForm = reactive({
  classId: '',
  className: '',
  dateRange: null as [Date, Date] | null,
  dateRangeText: ''
})

// 选择器选项
const classColumns = [
  { text: '全部班级', value: '' },
  { text: '大班A', value: '1' },
  { text: '中班B', value: '2' },
  { text: '小班C', value: '3' }
]

// 日期范围限制
const minDate = new Date(2024, 0, 1)
const maxDate = new Date(2030, 11, 31)

// 计算属性
const displayRecords = computed(() => {
  let result = props.records || []

  // 应用筛选条件
  if (filterForm.classId) {
    result = result.filter(record => {
      const classMap: Record<string, string> = {
        '1': '大班A',
        '2': '中班B',
        '3': '小班C'
      }
      return record.className === classMap[filterForm.classId]
    })
  }

  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    result = result.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  return result
})

// 方法
const handleCreateRecord = () => {
  emit('create-record')
}

const handleEditRecord = (record: TeachingRecord) => {
  emit('edit-record', record)
}

const handleDeleteRecord = async (record: TeachingRecord) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除 "${record.className} - ${record.courseName}" 这条教学记录吗？`,
    })
    emit('delete-record', record)
  } catch (error) {
    // 用户取消删除
  }
}

const handleViewRecord = (record: TeachingRecord) => {
  selectedRecord.value = record
  recordDetailVisible.value = true
}

const handleExport = () => {
  // 导出教学记录为CSV文件
  if (!displayRecords.value || displayRecords.value.length === 0) {
    showToast('暂无数据可导出')
    return
  }

  try {
    // CSV头部
    let csvContent = '\uFEFF' // BOM for UTF-8
    csvContent += '班级,课程名称,日期,时长(分钟),出勤人数,课程类型,课程内容,学生表现,课堂互动,教学效果\n'

    // 添加数据行
    displayRecords.value.forEach(record => {
      const row = [
        record.className,
        record.courseName,
        formatDate(record.date),
        record.duration,
        record.attendance,
        getCourseTypeText(record.courseType),
        record.content?.replace(/,/g, '，')?.replace(/\n/g, ' ') || '',
        record.studentPerformance?.replace(/,/g, '，')?.replace(/\n/g, ' ') || '',
        record.interactionLevel,
        record.effectivenessLevel
      ]
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    // 创建Blob并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `教学记录_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`已导出 ${displayRecords.value.length} 条记录`)
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败，请重试')
  }
}

const handleRecordDetailEdit = (record: TeachingRecord) => {
  recordDetailVisible.value = false
  emit('edit-record', record)
}

const handleRecordDetailShare = (record: TeachingRecord) => {
  showToast('分享功能开发中...')
}

const handleViewMedia = (media: any) => {
  if (media.type === 'image') {
    previewImages.value = [media.url]
    previewIndex.value = 0
    showImagePreview.value = true
  } else {
    showToast(`播放视频: ${media.name}`)
  }
}

const handleViewAllMedia = (record: TeachingRecord) => {
  const images = record.mediaFiles?.filter(m => m.type === 'image').map(m => m.url) || []
  if (images.length > 0) {
    previewImages.value = images
    previewIndex.value = 0
    showImagePreview.value = true
  } else {
    showToast('没有可预览的图片')
  }
}

const handleFilter = () => {
  // 触发筛选
  showToast('筛选条件已应用')
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    classId: '',
    className: '',
    dateRange: null,
    dateRangeText: ''
  })
  showToast('筛选条件已重置')
}

// 筛选器确认回调
const onClassFilterConfirm = ({ selectedOptions }: any) => {
  filterForm.className = selectedOptions[0].text
  filterForm.classId = selectedOptions[0].value
  showClassFilter.value = false
}

const onDateRangeConfirm = (dates: [Date, Date]) => {
  filterForm.dateRange = dates
  filterForm.dateRangeText = `${formatDate(dates[0])} 至 ${formatDate(dates[1])}`
  showDateRange.value = false
}

// 下拉刷新和加载更多
const onRefresh = () => {
  refreshing.value = true
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  emit('load-more')
  // 模拟加载完成
  setTimeout(() => {
    finished.value = true
  }, 1000)
}

// 工具方法
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const getCourseTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'regular': 'primary',
    'review': 'success',
    'practice': 'warning',
    'assessment': 'danger'
  }
  return colorMap[type] || 'default'
}

const getCourseTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'regular': '常规课程',
    'review': '复习课程',
    'practice': '实践活动',
    'assessment': '测评课程'
  }
  return textMap[type] || type
}
</script>

<style lang="scss" scoped>
.teaching-record {
  background-color: var(--van-background-color);
  min-height: 100vh;

  .action-bar {
    display: flex;
    gap: var(--van-padding-sm);
    padding: var(--van-padding-md);
    background-color: var(--van-background-color-light);
    border-bottom: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
    }
  }

  .filter-card {
    margin: var(--van-padding-sm);

    .filter-buttons {
      display: flex;
      gap: var(--van-padding-sm);
      margin-top: var(--van-padding-sm);

      .van-button {
        flex: 1;
      }
    }
  }

  .record-list {
    .record-item {
      margin-bottom: var(--van-padding-sm);

      :deep(.van-card) {
        margin: 0 var(--van-padding-sm);
        border-radius: var(--van-border-radius-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .record-title {
      font-size: var(--van-font-size-lg);
      font-weight: bold;
      color: var(--van-text-color);
      margin-bottom: var(--van-padding-xs);
    }

    .record-meta {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-md);

      .meta-item {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
      }
    }

    .record-content {
      .content-text {
        font-size: var(--van-font-size-md);
        line-height: 1.6;
        color: var(--van-text-color-2);
        margin-bottom: var(--van-padding-md);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .section-title {
        font-size: var(--van-font-size-sm);
        font-weight: bold;
        color: var(--van-text-color);
        margin-bottom: var(--van-padding-xs);
      }

      .media-section {
        margin-bottom: var(--van-padding-md);

        .media-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--van-padding-xs);

          .media-item {
            aspect-ratio: 1;
            border-radius: var(--van-border-radius-md);
            overflow: hidden;
            cursor: pointer;

            .media-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .media-video {
              width: 100%;
              height: 100%;
              background-color: var(--van-background-2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--van-text-color-2);
              font-size: var(--van-font-size-lg);
            }
          }

          .media-more {
            aspect-ratio: 1;
            background-color: var(--van-background-2);
            border-radius: var(--van-border-radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            cursor: pointer;
            font-weight: bold;
          }
        }
      }

      .performance-section {
        margin-bottom: var(--van-padding-md);

        .performance-text {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .rating-section {
        .rating-item {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          margin-bottom: var(--van-padding-xs);

          .rating-label {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            min-width: 80px;
          }
        }
      }
    }

    .record-actions {
      display: flex;
      gap: var(--van-padding-xs);

      .van-button {
        flex: 1;
      }
    }
  }
}

// 暗黑模式适配
:root[data-theme='dark'] .teaching-record {
  .action-bar {
    border-bottom-color: var(--van-border-color-dark);
  }

  :deep(.van-card) {
    background-color: var(--van-background-2);
  }

  .media-grid .media-more {
    background-color: var(--van-background-3);
  }
}
</style>