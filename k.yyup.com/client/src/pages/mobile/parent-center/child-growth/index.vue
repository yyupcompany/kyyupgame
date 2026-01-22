<template>
  <MobileSubPageLayout title="成长报告" back-path="/mobile/parent-center">
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="refreshData">
      <!-- 加载状态 -->
      <van-loading v-if="loading && !refreshing" type="spinner" color="#1989fa" vertical>
        加载中...
      </van-loading>

      <template v-else>
    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <div class="stat-card">
            <van-icon name="notes-o" size="24" color="#409EFF" />
            <div class="stat-content">
              <div class="stat-value">{{ growthRecords.length }}</div>
              <div class="stat-label">成长记录</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <van-icon name="calendar-o" size="24" color="#67C23A" />
            <div class="stat-content">
              <div class="stat-value">{{ monthlyRecords }}</div>
              <div class="stat-label">本月记录</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <van-icon name="flag-o" size="24" color="#E6A23C" />
            <div class="stat-content">
              <div class="stat-value">{{ milestonesCount }}</div>
              <div class="stat-label">里程碑</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <van-icon name="photo-o" size="24" color="#909399" />
            <div class="stat-content">
              <div class="stat-value">{{ photosCount }}</div>
              <div class="stat-label">成长相册</div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 孩子选择器 -->
    <div class="child-selector-section">
      <van-cell-group inset>
        <van-cell title="选择孩子" is-link @click="showChildPicker = true" :value="selectedChildName" />
      </van-cell-group>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content-section">
      <!-- 成长时间线 -->
      <van-cell-group inset>
        <template #title>
          <div class="section-header">
            <span>成长时间线</span>
            <van-button type="primary" size="small" @click="addGrowthRecord">
              <van-icon name="plus" />
              添加记录
            </van-button>
          </div>
        </template>

        <div class="timeline-content">
          <van-steps direction="vertical" :active="growthRecords.length">
            <van-step v-for="(record, index) in growthRecords" :key="record.id">
              <div class="timeline-card">
                <!-- 记录头部 -->
                <div class="record-header">
                  <div class="record-left">
                    <van-tag :type="getTagType(record.type)" size="small">
                      {{ record.typeName }}
                    </van-tag>
                    <div class="record-title">{{ record.title }}</div>
                    <div class="record-date">{{ formatDate(record.date) }}</div>
                  </div>
                  <div class="record-actions">
                    <van-icon name="edit" size="18" @click="editRecord(record)" />
                    <van-icon name="delete" size="18" color="#f56c6c" @click="deleteRecord(record)" />
                  </div>
                </div>

                <!-- 记录内容 -->
                <div class="record-content">{{ record.content }}</div>

                <!-- 记录照片 -->
                <div v-if="record.photos && record.photos.length > 0" class="record-photos">
                  <van-image
                    v-for="(photo, photoIndex) in record.photos"
                    :key="photoIndex"
                    :src="photo.url"
                    width="60"
                    height="60"
                    radius="6"
                    fit="cover"
                    @click="previewPhotos(record.photos, photoIndex)"
                  />
                </div>
              </div>
            </van-step>
          </van-steps>

          <van-empty
            v-if="growthRecords.length === 0"
            description="暂无成长记录"
            :image-size="120"
          />
        </div>
      </van-cell-group>

      <!-- 成长里程碑 -->
      <van-cell-group inset title="成长里程碑">
        <div class="milestones-content">
          <div
            v-for="milestone in milestones"
            :key="milestone.id"
            class="milestone-item"
          >
            <div class="milestone-icon">
              <van-icon :name="getMilestoneIcon(milestone.icon)" size="20" />
            </div>
            <div class="milestone-info">
              <div class="milestone-title">{{ milestone.title }}</div>
              <div class="milestone-desc">{{ milestone.description }}</div>
              <div class="milestone-date">{{ formatDate(milestone.date) }}</div>
            </div>
          </div>

          <van-empty
            v-if="milestones.length === 0"
            description="暂无里程碑记录"
            :image-size="80"
          />
        </div>
      </van-cell-group>

      <!-- 本月统计 -->
      <van-cell-group inset title="本月统计">
        <div class="stats-content">
          <van-cell class="stat-item">
            <template #title>
              <span class="stat-label">身高增长</span>
            </template>
            <template #value>
              <span class="stat-value">+{{ stats.heightGrowth }}cm</span>
            </template>
          </van-cell>
          <van-cell class="stat-item">
            <template #title>
              <span class="stat-label">体重增长</span>
            </template>
            <template #value>
              <span class="stat-value">+{{ stats.weightGrowth }}kg</span>
            </template>
          </van-cell>
          <van-cell class="stat-item">
            <template #title>
              <span class="stat-label">新技能</span>
            </template>
            <template #value>
              <span class="stat-value">{{ stats.newSkills }}个</span>
            </template>
          </van-cell>
          <van-cell class="stat-item">
            <template #title>
              <span class="stat-label">活动参与</span>
            </template>
            <template #value>
              <span class="stat-value">{{ stats.activities }}次</span>
            </template>
          </van-cell>
        </div>
      </van-cell-group>
    </div>

    <!-- 孩子选择弹窗 -->
    <van-popup v-model:show="showChildPicker" position="bottom">
      <van-picker
        :columns="childPickerColumns"
        @confirm="onChildConfirm"
        @cancel="showChildPicker = false"
      />
    </van-popup>

    <!-- 添加/编辑记录弹窗 -->
    <van-popup v-model:show="showRecordDialog" position="bottom" :style="{ height: '80%' }">
      <div class="record-dialog">
        <van-nav-bar
          :title="isEditing ? '编辑记录' : '添加记录'"
          left-text="取消"
          right-text="保存"
          @click-left="showRecordDialog = false"
          @click-right="saveRecord"
        />
        <div class="record-form">
          <van-form ref="recordFormRef" @submit="saveRecord">
            <van-field
              v-model="recordForm.title"
              name="title"
              label="标题"
              placeholder="请输入记录标题"
              :rules="[{ required: true, message: '请输入记录标题' }]"
            />
            <van-field name="type" label="类型">
              <template #input>
                <van-radio-group v-model="recordForm.type" direction="horizontal">
                  <van-radio name="skill">技能发展</van-radio>
                  <van-radio name="activity">活动参与</van-radio>
                  <van-radio name="health">健康成长</van-radio>
                  <van-radio name="social">社交能力</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="recordForm.content"
              name="content"
              label="内容"
              type="textarea"
              placeholder="请输入记录内容"
              :rules="[{ required: true, message: '请输入记录内容' }]"
            />
            <van-field name="photos" label="照片">
              <template #input>
                <van-uploader
                  v-model="recordForm.photos"
                  multiple
                  :max-count="4"
                  :after-read="handlePhotoUpload"
                />
              </template>
            </van-field>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 照片预览 -->
    <van-image-preview
      v-model:show="showPhotoPreview"
      :images="previewPhotosList"
      :start-position="photoPreviewIndex"
    />
      </template>
    </van-pull-refresh>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { showToast, showConfirmDialog, showImagePreview, showLoadingToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { childGrowthApi, type Child, type GrowthRecord, type Milestone, type GrowthStats } from '@/api/modules/child-growth'

// 响应式数据
const selectedChildId = ref<number | null>(null)
const selectedChildName = ref('')
const showChildPicker = ref(false)
const showRecordDialog = ref(false)
const showPhotoPreview = ref(false)
const isEditing = ref(false)
const recordFormRef = ref()
const previewPhotosList = ref<string[]>([])
const photoPreviewIndex = ref(0)
const loading = ref(false)
const refreshing = ref(false)

const children = ref<Child[]>([
  { id: 1, name: '小明', age: 5, class: '大班' },
  { id: 2, name: '小红', age: 4, class: '中班' }
])

const growthRecords = ref<GrowthRecord[]>([
  {
    id: 1,
    title: '学会骑自行车',
    content: '今天在公园里终于学会了骑自行车，虽然摔了几次但是很开心！',
    type: 'skill',
    typeName: '技能发展',
    date: '2024-11-15',
    photos: [
      { url: 'https://via.placeholder.com/100x100/4facfe/ffffff?text=骑车' }
    ]
  },
  {
    id: 2,
    title: '第一次画画比赛',
    content: '参加了幼儿园的画画比赛，获得了优秀奖，画的是彩虹和太阳。',
    type: 'activity',
    typeName: '活动参与',
    date: '2024-11-10',
    photos: [
      { url: 'https://via.placeholder.com/100x100/43e97b/ffffff?text=画画' }
    ]
  },
  {
    id: 3,
    title: '身高体检记录',
    content: '本月身高增长了2cm，体重增加了0.5kg，生长发育正常。',
    type: 'health',
    typeName: '健康成长',
    date: '2024-11-05',
    photos: []
  }
])

const milestones = ref<Milestone[]>([
  {
    id: 1,
    title: '学会独立穿衣服',
    description: '可以自己穿脱简单的衣服',
    icon: 'user',
    date: '2024-11-01'
  },
  {
    id: 2,
    title: '认识26个字母',
    description: '能够正确认读和书写所有字母',
    icon: 'book',
    date: '2024-10-15'
  }
])

const stats = ref<GrowthStats>({
  heightGrowth: 2.5,
  weightGrowth: 0.8,
  newSkills: 3,
  activities: 8
})

const recordForm = reactive<GrowthRecord>({
  id: 0,
  title: '',
  content: '',
  type: 'skill',
  typeName: '技能发展',
  date: new Date().toISOString().split('T')[0],
  photos: []
})

// 计算属性
const childPickerColumns = computed(() =>
  children.value.map(child => ({
    text: `${child.name} (${child.class})`,
    value: child.id
  }))
)

const monthlyRecords = computed(() =>
  growthRecords.value.filter(record => {
    const recordDate = new Date(record.date)
    const now = new Date()
    return recordDate.getMonth() === now.getMonth() &&
           recordDate.getFullYear() === now.getFullYear()
  }).length
)

const milestonesCount = computed(() => milestones.value.length)
const photosCount = computed(() =>
  growthRecords.value.reduce((total, record) =>
    total + (record.photos?.length || 0), 0
  )
)

// API调用方法
const loadChildren = async () => {
  try {
    loading.value = true
    const response = await childGrowthApi.getChildren()
    if (response.data && response.data.length > 0) {
      children.value = response.data
      selectedChildId.value = children.value[0].id
      selectedChildName.value = `${children.value[0].name} (${children.value[0].class || children.value[0].grade || ''})`
      await loadGrowthData()
    }
  } catch (error) {
    console.error('加载孩子列表失败:', error)
    showToast('加载孩子列表失败')
    // 使用模拟数据作为后备
    if (children.value.length > 0) {
      selectedChildId.value = children.value[0].id
      selectedChildName.value = `${children.value[0].name} (${children.value[0].class})`
    }
  } finally {
    loading.value = false
  }
}

const loadGrowthData = async () => {
  if (!selectedChildId.value) return

  try {
    loading.value = true

    // 并行加载数据
    const [recordsResponse, milestonesResponse, statsResponse] = await Promise.all([
      childGrowthApi.getGrowthRecords({ childId: selectedChildId.value, pageSize: 50 }),
      childGrowthApi.getMilestones(selectedChildId.value),
      childGrowthApi.getGrowthStats(selectedChildId.value, 'month')
    ])

    if (recordsResponse.data) {
      growthRecords.value = recordsResponse.data
    }

    if (milestonesResponse.data) {
      milestones.value = milestonesResponse.data
    }

    if (statsResponse.data) {
      stats.value = statsResponse.data
    }

    showToast('数据加载成功')
  } catch (error) {
    console.error('加载成长数据失败:', error)
    showToast('加载成长数据失败，使用模拟数据')
    // 这里已经有模拟数据作为后备
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const refreshData = async () => {
  refreshing.value = true
  await loadGrowthData()
}

const addGrowthRecord = () => {
  isEditing.value = false
  Object.assign(recordForm, {
    id: 0,
    title: '',
    content: '',
    type: 'skill',
    typeName: '技能发展',
    date: new Date().toISOString().split('T')[0],
    photos: []
  })
  showRecordDialog.value = true
}

const editRecord = (record: GrowthRecord) => {
  isEditing.value = true
  Object.assign(recordForm, record)
  showRecordDialog.value = true
}

const saveRecord = async () => {
  try {
    if (!recordFormRef.value) return

    // 表单验证
    await recordFormRef.value.validate()

    showLoadingToast({ message: isEditing.value ? '更新中...' : '保存中...', forbidClick: true })

    // 设置类型名称
    const typeNames = {
      skill: '技能发展',
      activity: '活动参与',
      health: '健康成长',
      social: '社交能力'
    }
    recordForm.typeName = typeNames[recordForm.type] || '其他'

    const recordData = {
      title: recordForm.title,
      content: recordForm.content,
      type: recordForm.type,
      photos: recordForm.photos,
      childId: selectedChildId.value!
    }

    if (isEditing.value) {
      // 更新记录
      await childGrowthApi.updateGrowthRecord(recordForm.id, recordData)
      const index = growthRecords.value.findIndex(r => r.id === recordForm.id)
      if (index > -1) {
        growthRecords.value[index] = { ...recordForm }
      }
      showToast('记录更新成功')
    } else {
      // 创建新记录
      const response = await childGrowthApi.createGrowthRecord(recordData)
      if (response.data) {
        const newRecord = response.data
        growthRecords.value.unshift(newRecord)
        showToast('记录添加成功')
      }
    }

    showRecordDialog.value = false
  } catch (error) {
    console.error('保存记录失败:', error)
    showToast(isEditing.value ? '更新失败，请重试' : '保存失败，请重试')
  }
}

const deleteRecord = async (record: GrowthRecord) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除记录"${record.title}"吗？此操作不可恢复。`,
    })

    showLoadingToast({ message: '删除中...', forbidClick: true })

    await childGrowthApi.deleteGrowthRecord(record.id)

    const index = growthRecords.value.findIndex(r => r.id === record.id)
    if (index > -1) {
      growthRecords.value.splice(index, 1)
      showToast('删除成功')
    }
  } catch (error) {
    if (error) {
      console.error('删除记录失败:', error)
      showToast('删除失败，请重试')
    } else {
      showToast('已取消删除')
    }
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getTagType = (type: string) => {
  const types = {
    skill: 'success',
    activity: 'warning',
    health: 'danger',
    social: 'primary'
  }
  return types[type] || 'default'
}

const getMilestoneIcon = (iconName: string) => {
  const iconMap = {
    user: 'contact',
    book: 'notes-o',
    star: 'star-o',
    heart: 'heart-o',
    trophy: 'medal-o'
  }
  return iconMap[iconName] || 'bookmark-o'
}

const onChildConfirm = ({ selectedValue }: { selectedValue: number }) => {
  selectedChildId.value = selectedValue
  const child = children.value.find(c => c.id === selectedValue)
  if (child) {
    selectedChildName.value = `${child.name} (${child.class})`
    loadGrowthData()
  }
  showChildPicker.value = false
}

const previewPhotos = (photos: Array<{ url: string }>, index: number) => {
  previewPhotosList.value = photos.map(photo => photo.url)
  photoPreviewIndex.value = index
  showPhotoPreview.value = true
}

const handlePhotoUpload = async (file: any) => {
  try {
    // 这里可以实现实时照片上传预览
    // 实际上传会在保存记录时统一处理
    console.log('准备上传照片:', file.file.name)

    // 可以在这里添加图片压缩、预览等功能
    if (file.file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB')
      return
    }
  } catch (error) {
    console.error('照片上传预处理失败:', error)
    showToast('照片处理失败')
  }
}

// 生命周期
onMounted(async () => {
  await loadChildren()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.stats-section {
  padding: var(--van-padding-sm) var(--van-padding-md);
  background: var(--card-bg);
  margin-bottom: var(--van-padding-sm);

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    background: var(--van-background-color-light);
    border: 1px solid var(--van-border-color);

    .stat-content {
      margin-left: var(--van-padding-sm);
      text-align: center;
      flex: 1;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: var(--van-text-color-primary);
        line-height: 1.2;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-secondary);
        margin-top: 2px;
      }
    }
  }
}

.child-selector-section {
  margin-bottom: var(--van-padding-sm);
}

.main-content-section {
  padding-bottom: var(--van-padding-lg);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md) 0;
  }

  .timeline-content {
    padding: var(--van-padding-sm);

    .timeline-card {
      background: var(--van-background-color-light);
      border-radius: var(--van-radius-md);
      margin: var(--van-padding-sm) 0;
      padding: var(--van-padding-md);

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-sm);

        .record-left {
          flex: 1;

          .record-title {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color-primary);
            margin: var(--van-padding-xs) 0;
          }

          .record-date {
            font-size: var(--text-xs);
            color: var(--van-text-color-secondary);
          }
        }

        .record-actions {
          display: flex;
          gap: var(--van-padding-sm);
          align-items: center;
        }
      }

      .record-content {
        font-size: var(--text-sm);
        color: var(--van-text-color-regular);
        line-height: 1.5;
        margin-bottom: var(--van-padding-sm);
      }

      .record-photos {
        display: flex;
        gap: var(--van-padding-xs);
        flex-wrap: wrap;
      }
    }
  }

  .milestones-content {
    padding: var(--van-padding-sm);

    .milestone-item {
      display: flex;
      gap: var(--van-padding-md);
      padding: var(--van-padding-md);
      background: var(--van-background-color-light);
      border-radius: var(--van-radius-md);
      margin-bottom: var(--van-padding-sm);

      .milestone-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-primary-color);
        color: white;
        border-radius: var(--van-radius-sm);
        flex-shrink: 0;
      }

      .milestone-info {
        flex: 1;

        .milestone-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color-primary);
          margin-bottom: var(--van-padding-xs);
        }

        .milestone-desc {
          font-size: var(--text-xs);
          color: var(--van-text-color-secondary);
          margin-bottom: var(--van-padding-xs);
          line-height: 1.4;
        }

        .milestone-date {
          font-size: 11px;
          color: var(--van-text-color-placeholder);
        }
      }
    }
  }

  .stats-content {
    .stat-item {
      .stat-label {
        font-size: var(--text-sm);
        color: var(--van-text-color-secondary);
      }

      .stat-value {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--van-primary-color);
      }
    }
  }
}

.record-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .record-form {
    flex: 1;
    padding: var(--van-padding-md);
    overflow-y: auto;
  }
}

// 响应式优化
@media (max-width: 375px) {
  .stats-section {
    .stat-card {
      padding: var(--van-padding-sm);

      .stat-content {
        .stat-value {
          font-size: var(--text-lg);
        }

        .stat-label {
          font-size: 11px;
        }
      }
    }
  }

  .timeline-card .record-header {
    flex-direction: column;
    gap: var(--van-padding-xs);

    .record-actions {
      align-self: flex-end;
    }
  }
}

// 覆盖 Vant 组件样式
:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-step__title) {
  font-size: var(--text-sm);
}

:deep(.van-cell-group__title) {
  padding: var(--van-padding-md) var(--van-padding-md) var(--van-padding-sm);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--van-text-color-primary);
}
@import '@/styles/mobile-base.scss';
</style>

