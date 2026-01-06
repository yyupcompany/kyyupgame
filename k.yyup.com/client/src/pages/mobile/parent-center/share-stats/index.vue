<template>
  <MobileMainLayout
    title="分享统计"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="share-stats-page">
      <!-- 刷新按钮 -->
      <div class="refresh-section">
        <van-button 
          type="primary" 
          size="small" 
          icon="replay" 
          :loading="loading"
          @click="refreshData"
        >
          刷新数据
        </van-button>
      </div>

      <!-- 统计概览卡片 -->
      <van-cell-group inset title="数据概览">
        <van-grid :column-num="2" :border="false" :gutter="12">
          <van-grid-item>
            <div class="stat-card">
              <van-icon name="share-o" size="24" color="#409EFF" />
              <div class="stat-content">
                <div class="stat-value">{{ totalShares }}</div>
                <div class="stat-label">总分享次数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <van-icon name="eye-o" size="24" color="#67C23A" />
              <div class="stat-content">
                <div class="stat-value">{{ totalViews }}</div>
                <div class="stat-label">总播放次数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <van-icon name="friends-o" size="24" color="#E6A23C" />
              <div class="stat-content">
                <div class="stat-value">{{ totalReach }}</div>
                <div class="stat-label">触达人数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <van-icon name="chart-trending-o" size="24" color="#F56C6C" />
              <div class="stat-content">
                <div class="stat-value">{{ engagementRate }}%</div>
                <div class="stat-label">互动率</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </van-cell-group>

      <!-- 搜索和筛选 -->
      <van-cell-group inset title="分享记录">
        <van-field
          v-model="searchKeyword"
          placeholder="搜索分享内容"
          left-icon="search"
          clearable
          @input="handleSearch"
        />
        
        <van-cell
          title="筛选条件"
          :value="filterText"
          is-link
          @click="showFilter = true"
        />
      </van-cell-group>

      <!-- 分享记录列表 -->
      <van-cell-group inset>
        <template v-if="shareRecords.length > 0">
          <van-cell
            v-for="record in filteredRecords"
            :key="record.id"
            class="share-record-cell"
            :border="false"
            @click="viewDetail(record)"
          >
            <template #title>
              <div class="record-title">{{ record.title }}</div>
            </template>
            
            <template #label>
              <div class="record-time">{{ record.shareTime }}</div>
            </template>
            
            <template #value>
              <van-button 
                size="mini" 
                type="primary" 
                plain
                @click.stop="viewDetail(record)"
              >
                查看详情
              </van-button>
            </template>
            
            <template #right-icon>
              <van-icon name="arrow" size="16" />
            </template>
          </van-cell>
          
          <!-- 记录统计信息 -->
          <div 
            v-for="record in filteredRecords" 
            :key="'stats-' + record.id"
            class="record-stats"
          >
            <div class="stats-row">
              <div class="stat-item">
                <van-icon name="share-o" size="16" />
                <span>转发 {{ record.shareCount }}</span>
              </div>
              <div class="stat-item">
                <van-icon name="eye-o" size="16" />
                <span>播放 {{ record.viewCount }}</span>
              </div>
              <div class="stat-item">
                <van-icon name="good-job-o" size="16" />
                <span>点赞 {{ record.likeCount }}</span>
              </div>
            </div>
          </div>
        </template>
        
        <van-empty v-else description="暂无分享记录" />
      </van-cell-group>

      <!-- 筛选弹窗 -->
      <van-popup 
        v-model:show="showFilter" 
        position="bottom" 
        :style="{ height: '60%' }"
        round
      >
        <div class="filter-popup">
          <div class="filter-header">
            <span>筛选条件</span>
            <van-button type="primary" size="small" @click="applyFilter">确定</van-button>
          </div>
          
          <div class="filter-content">
            <!-- 时间范围筛选 -->
            <van-cell-group inset title="时间范围">
              <van-cell
                title="开始时间"
                :value="startDate"
                is-link
                @click="showStartDatePicker = true"
              />
              <van-cell
                title="结束时间"
                :value="endDate"
                is-link
                @click="showEndDatePicker = true"
              />
            </van-cell-group>
            
            <!-- 分享类型筛选 -->
            <van-cell-group inset title="分享类型">
              <van-checkbox-group v-model="selectedTypes">
                <van-cell
                  v-for="type in shareTypes"
                  :key="type.value"
                  :title="type.label"
                  clickable
                  @click="toggleType(type.value)"
                >
                  <template #right-icon>
                    <van-checkbox :name="type.value" />
                  </template>
                </van-cell>
              </van-checkbox-group>
            </van-cell-group>
          </div>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-date-picker
        v-model="startDateValue"
        :show="showStartDatePicker"
        title="选择开始日期"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
      
      <van-date-picker
        v-model="endDateValue"
        :show="showEndDatePicker"
        title="选择结束日期"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />

      <!-- 返回顶部 -->
      <van-back-top right="20" bottom="80" />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { showToast, showLoadingToast, closeToast, showFailToast } from 'vant'
import { parentShareStatsApi, type ShareRecord, type ShareStats, SHARE_TYPE_MAP } from '@/api/modules/parent-share-stats'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const showFilter = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

// 统计数据
const totalShares = ref(0)
const totalViews = ref(0)
const totalReach = ref(0)
const engagementRate = ref(0)

// 分享记录
const shareRecords = ref<ShareRecord[]>([])

// 筛选相关
const startDate = ref('开始时间')
const endDate = ref('结束时间')
const startDateValue = ref(new Date())
const endDateValue = ref(new Date())
const selectedTypes = ref<string[]>([])
const filterText = ref('全部')

// 分享类型选项
const shareTypes = Object.entries(SHARE_TYPE_MAP).map(([value, label]) => ({
  value,
  label
}))

// 计算属性
const filteredRecords = computed(() => {
  let records = shareRecords.value

  // 关键词搜索
  if (searchKeyword.value) {
    records = records.filter(record => 
      record.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 类型筛选
  if (selectedTypes.value.length > 0) {
    records = records.filter(record => 
      selectedTypes.value.includes(record.type || '')
    )
  }

  return records
})

// 方法
const loadData = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    // 获取分享统计数据
    try {
      const statsParams = {
        startDate: startDate.value === '开始时间' ? undefined : startDate.value,
        endDate: endDate.value === '结束时间' ? undefined : endDate.value,
        type: selectedTypes.value.length > 0 ? selectedTypes.value : undefined
      }

      const statsResponse = await parentShareStatsApi.getShareStats(statsParams)

      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data
        totalShares.value = data.totalShares || 0
        totalViews.value = data.totalViews || 0
        totalReach.value = data.totalReach || 0
        engagementRate.value = Number(data.engagementRate?.toFixed(1)) || 0
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      showFailToast('获取统计数据失败，使用模拟数据')
      loadMockStats()
    }

    // 获取分享记录
    try {
      const recordsParams = {
        page: 1,
        pageSize: 50,
        keyword: searchKeyword.value || undefined,
        type: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
        startDate: startDate.value === '开始时间' ? undefined : startDate.value,
        endDate: endDate.value === '结束时间' ? undefined : endDate.value
      }

      const recordsResponse = await parentShareStatsApi.getShareRecords(recordsParams)

      if (recordsResponse.success && recordsResponse.data) {
        shareRecords.value = recordsResponse.data.list || []
      }
    } catch (error) {
      console.error('获取分享记录失败:', error)
      showFailToast('获取分享记录失败，使用模拟数据')
      loadMockRecords()
    }

  } catch (error) {
    console.error('加载数据失败:', error)
    showFailToast('加载数据失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 加载模拟统计数据
const loadMockStats = () => {
  totalShares.value = 156
  totalViews.value = 2340
  totalReach.value = 890
  engagementRate.value = 38.5
}

// 加载模拟分享记录
const loadMockRecords = () => {
  shareRecords.value = [
    {
      id: 1,
      title: '宝宝发育测评报告',
      shareTime: '2025-11-24 14:30',
      shareCount: 12,
      viewCount: 156,
      likeCount: 45,
      type: 'assessment',
      content: '宝宝的发育测评结果显示各项指标正常'
    },
    {
      id: 2,
      title: '脑开发游戏成就',
      shareTime: '2025-11-23 09:15',
      shareCount: 8,
      viewCount: 98,
      likeCount: 23,
      type: 'game',
      content: '完成了脑力训练游戏的最新关卡'
    },
    {
      id: 3,
      title: '孩子成长轨迹',
      shareTime: '2025-11-22 16:20',
      shareCount: 15,
      viewCount: 234,
      likeCount: 67,
      type: 'growth',
      content: '记录了孩子本月的成长变化'
    },
    {
      id: 4,
      title: '亲子活动分享',
      shareTime: '2025-11-21 10:45',
      shareCount: 6,
      viewCount: 87,
      likeCount: 19,
      type: 'activity',
      content: '参加了幼儿园组织的亲子活动'
    }
  ]
}

// 刷新数据
const refreshData = () => {
  loadData()
  showToast('数据已刷新')
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑在计算属性中处理
}

// 查看详情
const viewDetail = async (record: ShareRecord) => {
  try {
    showLoadingToast({ message: '加载详情...', forbidClick: true })

    const response = await parentShareStatsApi.getShareDetail(record.id)

    if (response.success && response.data) {
      closeToast()
      // TODO: 跳转到详情页面或打开详情弹窗
      showToast(`分享详情：${record.title}`)
      console.log('分享详情数据:', response.data)
    } else {
      showFailToast('获取分享详情失败')
    }
  } catch (error) {
    console.error('获取分享详情失败:', error)
    showFailToast('获取分享详情失败')
  } finally {
    closeToast()
  }
}

// 筛选相关方法
const toggleType = (type: string) => {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
}

const applyFilter = () => {
  showFilter.value = false
  updateFilterText()
  loadData()
}

const updateFilterText = () => {
  if (selectedTypes.value.length === 0) {
    filterText.value = '全部'
  } else {
    const selectedNames = shareTypes
      .filter(type => selectedTypes.value.includes(type.value))
      .map(type => type.label)
    filterText.value = selectedNames.join('、')
  }
}

// 日期选择处理
const onStartDateConfirm = (value: Date) => {
  startDate.value = value.toLocaleDateString()
  showStartDatePicker.value = false
}

const onEndDateConfirm = (value: Date) => {
  endDate.value = value.toLocaleDateString()
  showEndDatePicker.value = false
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.share-stats-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

.refresh-section {
  padding: var(--spacing-md) 16px 0;
  display: flex;
  justify-content: flex-end;

  .van-button {
    min-width: 80px;
    font-weight: 500;
  }
}

// 统计卡片样式优化
.stat-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: var(--spacing-lg) 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--van-primary-color), var(--van-success-color));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  &:hover::before {
    opacity: 1;
  }

  .van-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  }

  .stat-content {
    margin-left: 16px;
    flex: 1;
    min-width: 0;

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }

    .stat-label {
      font-size: var(--text-sm);
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.025em;
    }
  }
}

// 分享记录样式优化
.share-record-cell {
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);

  &:active {
    transform: scale(0.995);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .record-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 6px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .record-time {
    font-size: var(--text-xs);
    color: #94a3b8;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    &::before {
      content: '🕐';
      font-size: var(--text-sm);
    }
  }
}

.record-stats {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0 0 12px 12px;
  margin: 0 16px 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-top: none;

  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: var(--spacing-md);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    text-align: center;
    padding: var(--spacing-sm);
    border-radius: 8px;
    background: var(--card-bg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
    }

    .van-icon {
      font-size: var(--text-lg);
      margin-bottom: 2px;
    }

    span {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      line-height: 1.2;
    }

    // 为不同类型的统计设置不同的图标颜色
    &:nth-child(1) .van-icon { color: #3b82f6; } // 分享 - 蓝色
    &:nth-child(2) .van-icon { color: #10b981; } // 播放 - 绿色
    &:nth-child(3) .van-icon { color: #f59e0b; } // 点赞 - 橙色
  }
}

// 筛选弹窗样式优化
.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

    span {
      font-size: var(--text-lg);
      font-weight: 600;
      color: #1e293b;
    }
  }

  .filter-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
    background: #fafbfc;

    .van-cell-group {
      margin-bottom: 16px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }
}

// 日期选择器样式优化
:deep(.van-picker) {
  .van-picker__toolbar {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .van-picker-column {
    font-size: var(--text-base);
    font-weight: 500;
  }
}

// 空状态优化
:deep(.van-empty) {
  padding: 60px 20px;

  .van-empty__description {
    color: #64748b;
    font-size: var(--text-sm);
    font-weight: 500;
  }
}

// 搜索框样式优化
:deep(.van-field) {
  .van-field__left-icon {
    color: #3b82f6;
  }

  &.van-field--focused {
    .van-field__left-icon {
      color: var(--van-primary-color);
    }
  }
}

// 响应式优化
@media (max-width: 375px) {
  .stat-card {
    padding: var(--spacing-md) 12px;

    .stat-content {
      margin-left: 12px;

      .stat-value {
        font-size: var(--text-xl);
      }

      .stat-label {
        font-size: var(--text-xs);
      }
    }
  }

  .record-stats .stats-row {
    gap: var(--spacing-sm);
  }
}

@media (min-width: 768px) {
  .share-stats-page {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.08);
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .share-stats-page {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }

  .stat-card {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);

    .stat-content {
      .stat-value {
        color: #f1f5f9;
      }

      .stat-label {
        color: #94a3b8;
      }
    }
  }

  .share-record-cell {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);

    .record-title {
      color: #f1f5f9;
    }

    .record-time {
      color: #64748b;
    }
  }

  .record-stats {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border-color: rgba(255, 255, 255, 0.1);

    .stat-item {
      background: #0f172a;

      span {
        color: #cbd5e1;
      }
    }
  }
}

// 无障碍优化
.stat-card,
.share-record-cell {
  &:focus {
    outline: 2px solid var(--van-primary-color);
    outline-offset: 2px;
  }
}

// 动画优化
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.share-record-cell,
.record-stats {
  animation: slideInUp 0.3s ease-out;
}

.share-record-cell:nth-child(1) { animation-delay: 0.1s; }
.share-record-cell:nth-child(2) { animation-delay: 0.15s; }
.share-record-cell:nth-child(3) { animation-delay: 0.2s; }
.share-record-cell:nth-child(4) { animation-delay: 0.25s; }
</style>