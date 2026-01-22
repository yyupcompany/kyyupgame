<template>
  <MobileSubPageLayout title="孩子管理" back-path="/mobile/parent-center">
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <van-search
        v-model="searchText"
        placeholder="搜索孩子姓名/班级"
        @search="handleSearch"
        @clear="handleClearSearch"
        show-action
        action-text="搜索"
      />

      <div class="filter-tabs">
        <van-tabs v-model:active="childStatus" @change="handleStatusChange" sticky>
          <van-tab title="全部" name="" />
          <van-tab title="小班" name="小班" />
          <van-tab title="中班" name="中班" />
          <van-tab title="大班" name="大班" />
        </van-tabs>
      </div>
    </div>

    <!-- 添加孩子按钮 -->
    <div class="action-bar">
      <van-button
        type="primary"
        block
        round
        icon="plus"
        @click="handleAddChild"
      >
        添加孩子
      </van-button>
    </div>

    <!-- 孩子列表 -->
    <div class="children-list" v-loading="loading">
      <!-- 卡片视图（少量数据时） -->
      <div v-if="showCardView" class="cards-view">
        <div
          v-for="child in filteredChildren"
          :key="child.id"
          class="child-card"
          @click="handleViewChild(child)"
        >
          <div class="card-header">
            <van-image
              :src="child.avatar || defaultAvatar"
              width="60"
              height="60"
              round
              class="child-avatar"
            >
              <template #error>
                <div class="avatar-placeholder">{{ child.name?.charAt(0) || '孩' }}</div>
              </template>
            </van-image>
            <div class="card-title">
              <h3>{{ child.name }}</h3>
              <van-tag
                :type="child.gender === '男' ? 'primary' : 'danger'"
                size="small"
              >
                {{ child.gender }}
              </van-tag>
            </div>
          </div>

          <div class="card-content">
            <div class="info-item">
              <van-icon name="calendar-o" size="16" />
              <span>{{ child.age }}岁</span>
            </div>
            <div class="info-item">
              <van-icon name="school-o" size="16" />
              <van-tag :type="getClassType(child.className)" size="small">
                {{ child.className }}
              </van-tag>
            </div>
            <div class="info-item">
              <van-icon name="user-o" size="16" />
              <span>{{ child.birthday }}</span>
            </div>
          </div>

          <div class="card-actions">
            <van-button
              type="primary"
              size="small"
              @click.stop="handleViewChild(child)"
            >
              查看
            </van-button>
            <van-button
              type="success"
              size="small"
              @click.stop="handleEditChild(child)"
            >
              编辑
            </van-button>
            <van-button
              type="default"
              size="small"
              @click.stop="handleViewGrowth(child)"
            >
              成长档案
            </van-button>
          </div>
        </div>
      </div>

      <!-- 列表视图（大量数据时） -->
      <div v-else class="list-view">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="child in filteredChildren"
            :key="child.id"
            class="child-cell"
            @click="handleViewChild(child)"
          >
            <template #title>
              <div class="child-name">
                {{ child.name }}
                <van-tag
                  :type="child.gender === '男' ? 'primary' : 'danger'"
                  size="small"
                >
                  {{ child.gender }}
                </van-tag>
              </div>
            </template>

            <template #label>
              <div class="child-info">
                <span>{{ child.age }}岁</span>
                <van-tag
                  :type="getClassType(child.className)"
                  size="small"
                >
                  {{ child.className }}
                </van-tag>
                <span>{{ child.birthday }}</span>
              </div>
            </template>

            <template #right-icon>
              <div class="action-buttons">
                <van-button
                  type="primary"
                  size="mini"
                  @click.stop="handleViewChild(child)"
                >
                  查看
                </van-button>
                <van-button
                  type="success"
                  size="mini"
                  @click.stop="handleEditChild(child)"
                >
                  编辑
                </van-button>
                <van-button
                  type="default"
                  size="mini"
                  @click.stop="handleViewGrowth(child)"
                >
                  成长
                </van-button>
              </div>
            </template>
          </van-cell>
        </van-list>
      </div>
    </div>

    <!-- 孩子详情弹窗 -->
    <van-popup
      v-model:show="showChildDetail"
      position="bottom"
      :style="{ height: '90%' }"
      round
      safe-area-inset-bottom
    >
      <div class="child-detail-popup" v-if="currentChild">
        <div class="popup-header">
          <div class="header-title">
            <van-image
              :src="currentChild.avatar || defaultAvatar"
              width="50"
              height="50"
              round
            />
            <div class="title-info">
              <h2>{{ currentChild.name }}</h2>
              <div class="title-meta">
                <van-tag
                  :type="currentChild.gender === '男' ? 'primary' : 'danger'"
                  size="small"
                >
                  {{ currentChild.gender }}
                </van-tag>
                <span class="child-age">{{ currentChild.age }}岁</span>
              </div>
            </div>
          </div>
          <van-button
            type="primary"
            size="small"
            @click="handleEditChild(currentChild)"
          >
            编辑
          </van-button>
        </div>

        <div class="popup-content">
          <!-- 基本信息 -->
          <van-cell-group title="基本信息" inset>
            <van-cell title="姓名" :value="currentChild.name" />
            <van-cell title="性别" :value="currentChild.gender" />
            <van-cell title="年龄" :value="`${currentChild.age}岁`" />
            <van-cell title="出生日期" :value="currentChild.birthday" />
            <van-cell title="班级">
              <template #value>
                <van-tag :type="getClassType(currentChild.className)" size="small">
                  {{ currentChild.className }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="入园时间" :value="currentChild.enrollmentDate" />
          </van-cell-group>

          <!-- 家长信息 -->
          <van-cell-group title="家长信息" inset>
            <div v-if="currentChild.parents && currentChild.parents.length > 0">
              <van-cell
                v-for="parent in currentChild.parents"
                :key="parent.id"
                :title="parent.name"
                :label="`${parent.relation} · ${parent.phone}`"
                @click="handleViewParent(parent)"
                is-link
              />
            </div>
            <van-empty v-else description="暂无家长信息" />
          </van-cell-group>

          <!-- 健康记录 -->
          <van-cell-group title="健康记录" inset>
            <div v-if="currentChild.healthRecords && currentChild.healthRecords.length > 0">
              <van-cell
                v-for="record in currentChild.healthRecords"
                :key="record.id"
                :title="record.type"
                :label="`${record.date} · ${record.description}`"
              >
                <template #value>
                  <van-tag :type="getHealthRecordType(record.type)" size="small">
                    {{ record.type }}
                  </van-tag>
                </template>
              </van-cell>
            </div>
            <van-empty v-else description="暂无健康记录" />
          </van-cell-group>

          <!-- 最近评价 -->
          <van-cell-group title="最近评价" inset>
            <div v-if="currentChild.evaluations && currentChild.evaluations.length > 0">
              <van-cell
                v-for="evaluation in currentChild.evaluations"
                :key="evaluation.id"
                :title="evaluation.title"
                :label="`${evaluation.date} · ${evaluation.teacher}`"
                @click="handleViewEvaluation(evaluation)"
                is-link
              />
            </div>
            <van-empty v-else description="暂无评价记录" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 评价详情弹窗 -->
    <van-popup
      v-model:show="showEvaluationDetail"
      position="bottom"
      :style="{ height: '60%' }"
      round
      safe-area-inset-bottom
    >
      <div class="evaluation-detail-popup" v-if="currentEvaluation">
        <div class="popup-header">
          <h3>评价详情</h3>
          <van-button
            type="default"
            size="small"
            @click="showEvaluationDetail = false"
          >
            关闭
          </van-button>
        </div>

        <div class="popup-content">
          <van-cell-group inset>
            <van-cell title="标题" :value="currentEvaluation.title" />
            <van-cell title="日期" :value="currentEvaluation.date" />
            <van-cell title="评价老师" :value="currentEvaluation.teacher" />
            <van-cell title="评价内容">
              <template #value>
                <div class="evaluation-content">{{ currentEvaluation.content }}</div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 悬浮操作按钮 -->
    <van-floating-bubble
      icon="plus"
      @click="handleAddChild"
    />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { STUDENT_ENDPOINTS, PARENT_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

interface Parent {
  id: number
  name: string
  relation: string
  phone: string
}

interface HealthRecord {
  id: number
  date: string
  type: string
  description: string
  recorder: string
}

interface Evaluation {
  id: number
  date: string
  title: string
  teacher: string
  content: string
}

interface Child {
  id: number
  name: string
  gender: string
  age: number
  birthday: string
  className: string
  enrollmentDate: string
  avatar?: string
  parents: Parent[]
  healthRecords: HealthRecord[]
  evaluations: Evaluation[]
}

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const searchText = ref('')
const childStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showChildDetail = ref(false)
const currentChild = ref<Child | null>(null)

const showEvaluationDetail = ref(false)
const currentEvaluation = ref<Evaluation | null>(null)

// 孩子数据 - 初始化为空数组，从API加载
const children = ref<Child[]>([])

// 默认头像
const defaultAvatar = '/src/assets/logo.png'

// 根据搜索条件和状态过滤孩子
const filteredChildren = computed(() => {
  let result = children.value

  // 按班级筛选
  if (childStatus.value) {
    result = result.filter(child => (child.className || '').includes(childStatus.value))
  }

  // 按搜索文本筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(child =>
      (child.name || '').toLowerCase().includes(searchLower) ||
      (child.className || '').toLowerCase().includes(searchLower)
    )
  }

  // 计算总数
  total.value = result.length

  // 模拟分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return result.slice(startIndex, endIndex)
})

// 判断是否显示卡片视图（4个以内显示卡片）
const showCardView = computed(() => {
  return filteredChildren.value.length <= 4 && filteredChildren.value.length > 0
})

// 获取班级对应的类型
const getClassType = (className: string | null | undefined): "primary" | "success" | "warning" | "danger" => {
  if (!className) return 'primary'
  if (className.includes('小班')) {
    return 'primary'
  } else if (className.includes('中班')) {
    return 'success'
  } else if (className.includes('大班')) {
    return 'warning'
  }
  return 'primary'
}

// 获取健康记录类型对应的类型
const getHealthRecordType = (type: string): "primary" | "success" | "warning" | "danger" => {
  switch (type) {
    case '体检':
      return 'primary'
    case '生病':
      return 'danger'
    case '疫苗':
      return 'success'
    case '过敏':
      return 'warning'
    default:
      return 'default'
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 清除搜索
const handleClearSearch = () => {
  searchText.value = ''
  currentPage.value = 1
  fetchData()
}

// 处理状态变化
const handleStatusChange = () => {
  currentPage.value = 1
  fetchData()
}

// 处理加载更多
const onLoad = () => {
  currentPage.value++
  fetchData().then(() => {
    finished.value = filteredChildren.value.length >= total.value
  })
}

// 编辑孩子信息
const handleEditChild = (child: Child) => {
  showToast('正在跳转到编辑页面...')
  router.push(`/mobile/parent-center/children/edit/${child.id}`)
}

// 添加孩子
const handleAddChild = () => {
  showToast('正在跳转到添加孩子页面...')
  router.push('/mobile/parent-center/children/add')
}

// 查看成长档案
const handleViewGrowth = (child: Child) => {
  router.push({
    path: '/mobile/parent-center/child-growth',
    query: { id: child.id.toString() }
  })
}

// 查看家长信息
const handleViewParent = (parent: Parent) => {
  router.push(`/mobile/parent-center/parent-detail/${parent.id}`)
}

// 查看孩子详情
const handleViewChild = async (child: Child) => {
  try {
    console.log('[孩子管理] 查看孩子详情:', child.name)
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const response: ApiResponse = await request.get(STUDENT_ENDPOINTS.GET_BY_ID(child.id))

    if (response.success && response.data) {
      // 获取孩子的家长信息
      try {
        const parentsResponse: ApiResponse = await request.get(STUDENT_ENDPOINTS.GET_PARENTS(child.id))
        if (parentsResponse.success && parentsResponse.data) {
          response.data.parents = parentsResponse.data
        }
      } catch (error) {
        console.warn('获取家长信息失败:', error)
      }

      currentChild.value = response.data
      showChildDetail.value = true
      closeToast()
    } else {
      closeToast()
      showToast(response.message || '获取孩子详情失败')
    }
  } catch (error) {
    console.error('获取孩子详情失败:', error)
    closeToast()
    showToast('获取孩子详情失败')
  }
}

// 查看评价详情
const handleViewEvaluation = (evaluation: Evaluation) => {
  currentEvaluation.value = evaluation
  showEvaluationDetail.value = true
}

// 获取数据
const fetchData = async () => {
  if (currentPage.value === 1) {
    loading.value = true
  }

  try {
    const parentId = userStore.userInfo?.id
    if (!parentId) {
      showToast('无法获取家长信息')
      return
    }

    const params = {
      keyword: searchText.value,
      className: childStatus.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
      parentId: parentId  // 只显示当前家长的孩子
    }

    const response: ApiResponse = await request.get(STUDENT_ENDPOINTS.BASE, { params })

    if (response.success && response.data) {
      const data = response.data
      if (Array.isArray(data)) {
        if (currentPage.value === 1) {
          children.value = data
        } else {
          children.value.push(...data)
        }
        total.value = data.length
      } else if (data.items && Array.isArray(data.items)) {
        if (currentPage.value === 1) {
          children.value = data.items
        } else {
          children.value.push(...data.items)
        }
        total.value = data.total || data.items.length
      } else if (data.rows && Array.isArray(data.rows)) {
        if (currentPage.value === 1) {
          children.value = data.rows
        } else {
          children.value.push(...data.rows)
        }
        total.value = data.count || data.rows.length
      } else {
        children.value = []
        total.value = 0
      }
    } else {
      children.value = []
      total.value = 0
      showToast(response.message || '获取孩子列表失败')
    }
  } catch (error) {
    console.error('获取孩子列表失败:', error)
    showToast('获取孩子列表失败')
    children.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  fetchData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
@import "@/styles/design-tokens.scss";

// 搜索和筛选区域
.search-filter-section {
  background: white;
  padding: var(--spacing-md);
  margin-bottom: 8px;

  .filter-tabs {
    margin-top: 12px;

    :deep(.van-tabs__wrap) {
      background: white;
    }

    :deep(.van-tabs__nav) {
      background: white;
      border-bottom: 1px solid #ebedf0;
    }
  }
}

// 操作栏
.action-bar {
  padding: 0 16px 12px;
  background: white;
}

// 孩子列表
.children-list {
  padding: 0 12px;
  background: var(--van-background-color-light);
  min-height: 60vh;
}

// 卡片视图
.cards-view {
  .child-card {
    background: white;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: var(--spacing-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .child-avatar {
        margin-right: 12px;

        .avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: var(--text-lg);
        }
      }

      .card-title {
        flex: 1;

        h3 {
          margin: 0 0 4px 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }
    }

    .card-content {
      margin-bottom: 12px;

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: 6px;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);

        &:last-child {
          margin-bottom: 0;
        }

        .van-icon {
          color: var(--van-text-color-3);
        }
      }
    }

    .card-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: space-between;

      .van-button {
        flex: 1;
        height: 32px;
      }
    }
  }
}

// 列表视图
.list-view {
  .child-cell {
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;

    .child-name {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
    }

    .child-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-sm);
      color: var(--van-text-color-2);

      span {
        &:not(:last-child)::after {
          content: '·';
          margin-left: 8px;
          color: var(--van-text-color-3);
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .van-button {
        height: 24px;
        padding: 0 8px;
        font-size: 11px;
      }
    }
  }
}

// 弹窗样式
.child-detail-popup,
.evaluation-detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 20px;
    background: white;
    border-bottom: 1px solid #ebedf0;
    position: sticky;
    top: 0;
    z-index: 10;

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .title-info {
        h2 {
          margin: 0 0 4px 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
        }

        .title-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .child-age {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;

    .van-cell-group {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .evaluation-content {
      line-height: 1.6;
      color: var(--van-text-color-2);
      font-size: var(--text-sm);
      white-space: pre-wrap;
    }
  }
}

// 空状态
.van-empty {
  padding: var(--spacing-lg) 0;
}

// 响应式调整
@media (max-width: 375px) {
  .cards-view {
    .child-card {
      padding: var(--spacing-md);

      .card-actions {
        .van-button {
          font-size: var(--text-xs);
          padding: 0 6px;
        }
      }
    }
  }

  .list-view {
    .action-buttons {
      .van-button {
        font-size: 10px;
        padding: 0 6px;
      }
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .search-filter-section,
  .action-bar {
    background: var(--van-background-color);
  }

  .cards-view {
    .child-card {
      background: var(--van-background-color);
      color: var(--van-text-color);
    }
  }
}
</style>
