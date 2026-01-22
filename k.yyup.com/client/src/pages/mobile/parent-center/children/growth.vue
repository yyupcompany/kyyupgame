<template>
  <MobileSubPageLayout title="成长档案" back-path="/mobile/parent-center">
    <div class="mobile-growth-page">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <van-skeleton :row="3" animated />
        <van-skeleton :row="5" animated />
        <van-skeleton :row="8" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!childInfo" class="empty-container">
        <van-empty description="未找到孩子信息" />
      </div>

      <!-- 成长内容 -->
      <div v-else class="growth-content">
        <!-- 孩子基本信息 -->
        <van-cell-group inset class="child-info-section">
          <van-cell title="姓名" :value="childInfo.name" />
          <van-cell title="性别" :value="childInfo.gender" />
          <van-cell title="年龄" :value="`${childInfo.age}岁`" />
          <van-cell title="出生日期" :value="childInfo.birthday" />
        </van-cell-group>

        <!-- 身高体重图表 -->
        <div class="chart-section">
          <van-card title="成长曲线">
            <template #tags>
              <van-radio-group v-model="chartType" direction="horizontal" size="small">
                <van-radio name="height">身高</van-radio>
                <van-radio name="weight">体重</van-radio>
                <van-radio name="both">全部</van-radio>
              </van-radio-group>
            </template>
            <template #desc>
              <div class="chart-container" ref="chartContainer"></div>
            </template>
          </van-card>
        </div>

        <!-- 成长里程碑 -->
        <div class="milestones-section">
          <van-card>
            <template #title>
              <div class="section-header">
                <span>成长里程碑</span>
                <van-button size="mini" type="primary" @click="handleAddMilestone">
                  添加
                </van-button>
              </div>
            </template>
            <template #desc>
              <van-steps direction="vertical" :active="milestones.length">
                <van-step
                  v-for="milestone in childInfo.milestones"
                  :key="milestone.id"
                  :title="milestone.title"
                  :description="milestone.date"
                >
                  <div class="milestone-content">
                    <p class="milestone-desc">{{ milestone.description }}</p>
                    <div v-if="milestone.images && milestone.images.length > 0" class="milestone-images">
                      <van-image
                        v-for="(image, index) in milestone.images"
                        :key="index"
                        :src="image"
                        fit="cover"
                        class="milestone-image"
                        @click="previewImages(milestone.images, index)"
                      />
                    </div>
                  </div>
                </van-step>
              </van-steps>
            </template>
          </van-card>
        </div>

        <!-- 成长评估记录 -->
        <div class="assessment-section">
          <van-card>
            <template #title>
              <div class="section-header">
                <span>评估记录</span>
                <van-button size="mini" type="primary" @click="handleAddRecord">
                  添加
                </van-button>
              </div>
            </template>
            <template #desc>
              <div class="assessment-list">
                <van-swipe-cell
                  v-for="record in childInfo.assessments"
                  :key="record.id"
                  :before-close="beforeClose"
                >
                  <div class="assessment-item">
                    <div class="assessment-header">
                      <span class="assessment-date">{{ record.date }}</span>
                      <span class="assessment-evaluator">{{ record.evaluator }}</span>
                    </div>
                    <div class="assessment-stats">
                      <div class="stat-item">
                        <span class="stat-label">身高</span>
                        <span class="stat-value">{{ record.height }}cm</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">体重</span>
                        <span class="stat-value">{{ record.weight }}kg</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">头围</span>
                        <span class="stat-value">{{ record.headCircumference }}cm</span>
                      </div>
                    </div>
                    <div v-if="record.remarks" class="assessment-remarks">
                      备注：{{ record.remarks }}
                    </div>
                  </div>
                  <template #right>
                    <van-button
                      square
                      type="primary"
                      text
                      style="height: 100%"
                      @click="handleEditRecord(record)"
                    >
                      编辑
                    </van-button>
                    <van-button
                      square
                      type="danger"
                      text
                      style="height: 100%"
                      @click="handleDeleteRecord(record)"
                    >
                      删除
                    </van-button>
                  </template>
                </van-swipe-cell>
              </div>
            </template>
          </van-card>
        </div>
      </div>

      <!-- 添加/编辑记录弹窗 -->
      <van-popup v-model:show="showRecordDialog" position="bottom" :style="{ height: '80%' }">
        <van-form @submit="saveRecord" ref="recordFormRef">
          <div class="form-header">
            <h3>{{ currentRecord.id ? '编辑记录' : '添加记录' }}</h3>
            <van-button type="primary" native-type="submit">保存</van-button>
          </div>
          <div class="form-content">
            <van-field
              v-model="currentRecord.date"
              name="date"
              label="评估日期"
              placeholder="请选择日期"
              is-link
              readonly
              @click="showDatePopup = true"
            />
            <van-field
              v-model.number="currentRecord.height"
              name="height"
              label="身高(cm)"
              type="number"
              placeholder="请输入身高"
            />
            <van-field
              v-model.number="currentRecord.weight"
              name="weight"
              label="体重(kg)"
              type="number"
              placeholder="请输入体重"
            />
            <van-field
              v-model.number="currentRecord.headCircumference"
              name="headCircumference"
              label="头围(cm)"
              type="number"
              placeholder="请输入头围"
            />
            <van-field
              v-model="currentRecord.evaluator"
              name="evaluator"
              label="评估人"
              placeholder="请输入评估人"
            />
            <van-field
              v-model="currentRecord.remarks"
              name="remarks"
              label="备注"
              type="textarea"
              placeholder="请输入备注"
              rows="3"
            />
          </div>
        </van-form>

        <!-- 日期选择器 -->
        <van-popup v-model:show="showDatePopup" position="bottom">
          <van-date-picker
            v-model="selectedDate"
            @confirm="onDateConfirm"
            @cancel="showDatePopup = false"
          />
        </van-popup>
      </van-popup>

      <!-- 添加里程碑弹窗 -->
      <van-popup v-model:show="showMilestoneDialog" position="bottom" :style="{ height: '80%' }">
        <van-form @submit="saveMilestone">
          <div class="form-header">
            <h3>添加里程碑</h3>
            <van-button type="primary" native-type="submit">保存</van-button>
          </div>
          <div class="form-content">
            <van-field
              v-model="currentMilestone.date"
              name="date"
              label="日期"
              placeholder="请选择日期"
              is-link
              readonly
              @click="showMilestoneDatePopup = true"
            />
            <van-field
              v-model="currentMilestone.category"
              name="category"
              label="类别"
              placeholder="请选择类别"
              is-link
              readonly
              @click="showCategoryPopup = true"
            />
            <van-field
              v-model="currentMilestone.title"
              name="title"
              label="标题"
              placeholder="请输入标题"
            />
            <van-field
              v-model="currentMilestone.description"
              name="description"
              label="描述"
              type="textarea"
              placeholder="请输入描述"
              rows="3"
            />
          </div>
        </van-form>

        <!-- 里程碑日期选择器 -->
        <van-popup v-model:show="showMilestoneDatePopup" position="bottom">
          <van-date-picker
            v-model="milestoneDate"
            @confirm="onMilestoneDateConfirm"
            @cancel="showMilestoneDatePopup = false"
          />
        </van-popup>

        <!-- 类别选择器 -->
        <van-popup v-model:show="showCategoryPopup" position="bottom">
          <van-picker
            :columns="categories"
            @confirm="onCategoryConfirm"
            @cancel="showCategoryPopup = false"
          />
        </van-popup>
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast, showSuccessToast, showFailToast } from 'vant'
import * as echarts from 'echarts'
import { request } from '@/utils/request'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { useUserStore } from '@/stores/user'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { growthRecordsApi } from '@/api/modules/growth-records'

interface Assessment {
  id: number
  date: string
  height: number
  weight: number
  headCircumference: number
  evaluator: string
  remarks: string
}

interface Milestone {
  id: number
  date: string
  category: 'physical' | 'language' | 'cognitive' | 'social' | 'emotional' | 'other'
  title: string
  description: string
  images: string[]
}

interface ChildInfo {
  id: number
  name: string
  gender: string
  age: number
  birthday: string
  assessments: Assessment[]
  milestones: Milestone[]
}

// 组合式API
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const childId = ref<number | null>(null)
const childInfo = ref<ChildInfo | null>(null)
const chartType = ref<'height' | 'weight' | 'both'>('both')
const chartInstance = ref<echarts.ECharts | null>(null)
const chartContainer = ref<HTMLElement | null>(null)

// 记录弹窗相关
const showRecordDialog = ref(false)
const recordFormRef = ref()
const currentRecord = ref<Partial<Assessment>>({})
const showDatePopup = ref(false)
const selectedDate = ref(new Date())

// 里程碑弹窗相关
const showMilestoneDialog = ref(false)
const currentMilestone = ref<Partial<Milestone>>({})
const showMilestoneDatePopup = ref(false)
const milestoneDate = ref(new Date())
const showCategoryPopup = ref(false)

const milestones = ref<any[]>([])

// 类别选项
const categories = [
  { text: '身体', value: 'physical' },
  { text: '语言', value: 'language' },
  { text: '认知', value: 'cognitive' },
  { text: '社交', value: 'social' },
  { text: '情感', value: 'emotional' },
  { text: '其他', value: 'other' }
]

// 方法
const fetchChildInfo = async () => {
  // 获取孩子ID逻辑
  let id: number | null = null

  if (route.params.id) {
    id = parseInt(route.params.id as string)
  } else if (route.query.id) {
    id = parseInt(route.query.id as string)
  } else if (route.query.childId) {
    id = parseInt(route.query.childId as string)
  }

  if (!id || isNaN(id)) {
    const savedChildId = localStorage.getItem('parent_selected_child_id')
    if (savedChildId) {
      id = parseInt(savedChildId)
    }
  }

  if (!id || isNaN(id)) {
    const parentId = userStore.userInfo?.id
    if (!parentId) {
      showToast('请先登录')
      router.push('/login')
      return
    }

    try {
      const childrenResponse = await request.get(STUDENT_ENDPOINTS.BASE, {
        params: { parentId }
      })

      if (childrenResponse.success && childrenResponse.data) {
        const children = Array.isArray(childrenResponse.data)
          ? childrenResponse.data
          : (childrenResponse.data.items || childrenResponse.data.rows || [])

        if (children.length === 0) {
          showToast('您还没有关联的孩子，请先添加孩子')
          router.push('/mobile/parent-center/children')
          return
        }

        if (children.length === 1) {
          id = children[0].id
          childId.value = id
        } else {
          showToast('请先选择要查看的孩子')
          router.push('/mobile/parent-center/children')
          return
        }
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error)
      showToast('请先选择要查看的孩子')
      router.push('/mobile/parent-center/children')
      return
    }
  }

  if (!id || isNaN(id)) {
    showToast('孩子ID不能为空，请先选择孩子')
    router.push('/mobile/parent-center/children')
    return
  }

  childId.value = id
  localStorage.setItem('parent_selected_child_id', String(id))

  loading.value = true
  try {
    // 使用新的成长记录API
    const response = await growthRecordsApi.getGrowthReport(childId.value, { months: 6 })

    if (response.data?.data) {
      childInfo.value = response.data.data

      nextTick(() => {
        initChart()
      })
    } else {
      showFailToast('获取孩子成长信息失败')
    }
  } catch (error) {
    console.error('获取孩子成长信息失败:', error)
    showFailToast('获取孩子成长信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const initChart = () => {
  if (!childInfo.value || !chartContainer.value) return

  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  chartInstance.value = echarts.init(chartContainer.value)

  const assessments = childInfo.value.assessments.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const dates = assessments.map(item => item.date)
  const heights = assessments.map(item => item.height)
  const weights = assessments.map(item => item.weight)

  const option: any = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: []
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [],
    series: []
  }

  if (chartType.value === 'height' || chartType.value === 'both') {
    option.legend.data.push('身高')
    option.yAxis.push({
      type: 'value',
      name: '身高(cm)'
    })
    option.series.push({
      name: '身高',
      type: 'line',
      data: heights,
      smooth: true,
      itemStyle: { color: '#409EFF' }
    })
  }

  if (chartType.value === 'weight' || chartType.value === 'both') {
    option.legend.data.push('体重')
    option.yAxis.push({
      type: 'value',
      name: '体重(kg)',
      position: chartType.value === 'both' ? 'right' : 'left'
    })
    option.series.push({
      name: '体重',
      type: 'line',
      data: weights,
      smooth: true,
      itemStyle: { color: '#67C23A' }
    })
  }

  chartInstance.value.setOption(option)
}

const handleAddRecord = () => {
  currentRecord.value = {
    date: new Date().toISOString().split('T')[0],
    height: 0,
    weight: 0,
    headCircumference: 0,
    evaluator: '',
    remarks: ''
  }
  showRecordDialog.value = true
}

const handleEditRecord = (record: Assessment) => {
  currentRecord.value = { ...record }
  showRecordDialog.value = true
}

const saveRecord = () => {
  if (!childInfo.value) return

  if (!currentRecord.value.date || !currentRecord.value.height || !currentRecord.value.weight) {
    showToast('请填写必要的信息')
    return
  }

  if (currentRecord.value.id) {
    const index = childInfo.value.assessments.findIndex(item => item.id === currentRecord.value.id)
    if (index !== -1) {
      childInfo.value.assessments[index] = currentRecord.value as Assessment
    }
  } else {
    const newId = Math.max(0, ...childInfo.value.assessments.map(a => a.id)) + 1
    childInfo.value.assessments.push({
      ...currentRecord.value,
      id: newId
    } as Assessment)
  }

  showRecordDialog.value = false
  nextTick(() => {
    initChart()
  })
  showSuccessToast('保存成功')
}

const handleDeleteRecord = (record: Assessment) => {
  showConfirmDialog({
    title: '警告',
    message: '确定要删除这条记录吗？',
  }).then(() => {
    if (!childInfo.value) return

    childInfo.value.assessments = childInfo.value.assessments.filter(item => item.id !== record.id)

    nextTick(() => {
      initChart()
    })
    showSuccessToast('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const handleAddMilestone = () => {
  currentMilestone.value = {
    date: new Date().toISOString().split('T')[0],
    category: 'physical',
    title: '',
    description: '',
    images: []
  }
  showMilestoneDialog.value = true
}

const saveMilestone = () => {
  if (!childInfo.value) return

  if (!currentMilestone.value.date || !currentMilestone.value.title) {
    showToast('请填写必要的信息')
    return
  }

  const newId = Math.max(0, ...childInfo.value.milestones.map(m => m.id)) + 1
  childInfo.value.milestones.push({
    ...currentMilestone.value,
    id: newId
  } as Milestone)

  showMilestoneDialog.value = false
  showSuccessToast('保存成功')
}

const beforeClose = ({ position }: any) => {
  if (position === 'right') {
    // 编辑或删除操作会阻止关闭
    return false
  }
}

const previewImages = (images: string[], index: number) => {
  // TODO: 实现图片预览
  console.log('预览图片', images, index)
}

const handleBack = () => {
  router.back()
}

// 选择器确认事件
const onDateConfirm = (value: Date) => {
  currentRecord.value.date = value.toISOString().split('T')[0]
  showDatePopup.value = false
}

const onMilestoneDateConfirm = (value: Date) => {
  currentMilestone.value.date = value.toISOString().split('T')[0]
  showMilestoneDatePopup.value = false
}

const onCategoryConfirm = ({ selectedValues }: any) => {
  currentMilestone.value.category = selectedValues[0]
  showCategoryPopup.value = false
}

// 监听器
watch(chartType, () => {
  nextTick(() => {
    initChart()
  })
})

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  fetchChildInfo()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-growth-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: var(--spacing-xl);
}

.loading-container,
.empty-container {
  padding: 60px 20px;
  text-align: center;
}

.growth-content {
  .child-info-section {
    margin: var(--spacing-md) 16px;
  }

  .chart-section {
    margin: var(--spacing-md) 16px;

    :deep(.van-card) {
      .van-card__content {
        padding: var(--spacing-md) 0;
      }
    }

    .chart-container {
      height: 300px;
      width: 100%;
    }
  }

  .milestones-section,
  .assessment-section {
    margin: var(--spacing-md) 16px;

    :deep(.van-card) {
      .van-card__content {
        padding: var(--spacing-md) 0;
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  font-weight: 600;
}

.milestone-content {
  margin-top: var(--spacing-sm);

  .milestone-desc {
    font-size: var(--text-sm);
    color: var(--van-text-color-2);
    margin: var(--spacing-sm) 0;
  }

  .milestone-images {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;

    .milestone-image {
      width: 60px;
      height: 60px;
      border-radius: var(--spacing-sm);
    }
  }
}

.assessment-list {
  .assessment-item {
    padding: var(--spacing-md);
    background: var(--van-background-color);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    .assessment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .assessment-date {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--van-text-color);
      }

      .assessment-evaluator {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }

    .assessment-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: var(--spacing-md);

      .stat-item {
        text-align: center;

        .stat-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: var(--spacing-xs);
        }

        .stat-value {
          display: block;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-primary-color);
        }
      }
    }

    .assessment-remarks {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--van-border-color);
    }
  }
}

:deep(.van-swipe-cell__wrapper) {
  border-radius: var(--spacing-sm);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
  }
}

.form-content {
  padding: var(--spacing-md);
  flex: 1;
  overflow-y: auto;
}

:deep(.van-field__label) {
  width: 80px;
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>