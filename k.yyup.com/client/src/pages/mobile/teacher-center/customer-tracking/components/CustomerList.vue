<template>
  <div class="mobile-customer-list">
    <!-- 搜索和筛选 -->
    <div class="search-header">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索客户姓名或电话"
        @input="handleSearch"
        @clear="handleClear"
        show-action
      >
        <template #action>
          <div @click="showFilterPopup = true" class="filter-btn">
            <van-icon name="filter-o" size="16" />
            筛选
          </div>
        </template>
      </van-search>
    </div>

    <!-- 快速统计 -->
    <div class="stats-row">
      <van-grid :border="false" :column-num="4">
        <van-grid-item
          v-for="stat in statsData"
          :key="stat.type"
          @click="handleStatClick(stat.type)"
        >
          <div class="stat-item">
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 客户卡片列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        :error.sync="error"
        error-text="请求失败，点击重试"
        @load="onLoad"
      >
        <CustomerCard
          v-for="customer in displayCustomers"
          :key="customer.id"
          :customer="customer"
          @click="handleCustomerClick(customer)"
          @call="handleCallCustomer(customer)"
          @follow="handleAddFollow(customer)"
          @more="showActionSheet(customer)"
        />
      </van-list>
    </van-pull-refresh>

    <!-- 筛选弹窗 -->
    <van-popup
      v-model:show="showFilterPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="filter-popup">
        <div class="popup-header">
          <div class="popup-title">筛选条件</div>
          <van-button type="primary" size="small" @click="applyFilters">确定</van-button>
        </div>

        <div class="filter-content">
          <van-cell-group inset>
            <van-cell title="客户状态">
              <template #right-icon>
                <van-radio-group v-model="filterStatus" direction="horizontal">
                  <van-radio name="" checked-color="#1989fa">全部</van-radio>
                  <van-radio name="new" checked-color="#07c160">新客户</van-radio>
                  <van-radio name="following" checked-color="#ff976a">跟进中</van-radio>
                  <van-radio name="success" checked-color="#7232dd">已成交</van-radio>
                  <van-radio name="lost" checked-color="#ee0a24">已流失</van-radio>
                </van-radio-group>
              </template>
            </van-cell>

            <van-cell title="来源渠道">
              <template #right-icon>
                <van-radio-group v-model="filterSource" direction="horizontal">
                  <van-radio name="" checked-color="#1989fa">全部</van-radio>
                  <van-radio name="官网" checked-color="#07c160">官网</van-radio>
                  <van-radio name="微信" checked-color="#ff976a">微信</van-radio>
                  <van-radio name="电话" checked-color="#7232dd">电话</van-radio>
                  <van-radio name="推荐" checked-color="#ee0a24">推荐</van-radio>
                </van-radio-group>
              </template>
            </van-cell>

            <van-cell title="排序方式">
              <template #right-icon>
                <van-radio-group v-model="sortBy" direction="horizontal">
                  <van-radio name="createTime" checked-color="#1989fa">创建时间</van-radio>
                  <van-radio name="lastFollow" checked-color="#07c160">最后跟进</van-radio>
                  <van-radio name="nextFollow" checked-color="#ff976a">下次跟进</van-radio>
                </van-radio-group>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 操作菜单 -->
    <van-action-sheet
      v-model:show="showActionSheetVisible"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      cancel-text="取消"
    />

    <!-- 悬浮新增按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="handleAddCustomer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomerCard from './CustomerCard.vue'

interface Customer {
  id: string
  name: string
  phone: string
  childName: string
  childAge: number
  childGender: string
  status: string
  source: string
  lastFollowTime?: string
  nextFollowTime?: string
  createTime: string
  teacherName: string
}

interface Props {
  customers?: Customer[]
  loading?: boolean
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  customers: () => [],
  loading: false,
  total: 0
})

const emit = defineEmits<{
  'add-customer': []
  'refresh': []
  'filter-change': [filters: any]
  'view-customer': [customer: Customer]
  'call-customer': [customer: Customer]
  'add-follow': [customer: Customer]
  'view-history': [customer: Customer]
  'view-sop': [customer: Customer]
}>()

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const filterSource = ref('')
const sortBy = ref('createTime')
const showFilterPopup = ref(false)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const error = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const showActionSheetVisible = ref(false)
const selectedCustomer = ref<Customer | null>(null)

// 统计数据
const statsData = computed(() => {
  const customers = props.customers
  return [
    {
      type: 'total',
      label: '全部',
      value: customers.length,
      color: '#1989fa'
    },
    {
      type: 'new',
      label: '新客户',
      value: customers.filter(c => c.status === 'new' || c.status === 'NEW').length,
      color: '#07c160'
    },
    {
      type: 'following',
      label: '跟进中',
      value: customers.filter(c => c.status === 'following' || c.status === 'FOLLOWING').length,
      color: '#ff976a'
    },
    {
      type: 'success',
      label: '已成交',
      value: customers.filter(c => c.status === 'success' || c.status === 'CONVERTED').length,
      color: '#7232dd'
    }
  ]
})

// 过滤和排序后的客户列表
const filteredCustomers = computed(() => {
  let result = [...props.customers]

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(customer =>
      customer.status === filterStatus.value ||
      customer.status.toLowerCase() === filterStatus.value.toLowerCase()
    )
  }

  // 来源筛选
  if (filterSource.value) {
    result = result.filter(customer =>
      customer.source.includes(filterSource.value)
    )
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(customer =>
      customer.name.toLowerCase().includes(keyword) ||
      customer.phone.includes(keyword) ||
      customer.childName.toLowerCase().includes(keyword)
    )
  }

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'createTime':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      case 'lastFollow':
        return new Date(b.lastFollowTime || 0).getTime() - new Date(a.lastFollowTime || 0).getTime()
      case 'nextFollow':
        return new Date(a.nextFollowTime || '9999-12-31').getTime() - new Date(b.nextFollowTime || '9999-12-31').getTime()
      default:
        return 0
    }
  })

  return result
})

// 显示的客户列表（分页）
const displayCustomers = computed(() => {
  return filteredCustomers.value.slice(0, currentPage.value * pageSize.value)
})

// 操作菜单项
const actionSheetActions = computed(() => [
  {
    name: '查看详情',
    icon: 'eye-o'
  },
  {
    name: '拨打电话',
    icon: 'phone-o'
  },
  {
    name: '添加跟进',
    icon: 'edit'
  },
  {
    name: '跟进记录',
    icon: 'description'
  },
  {
    name: 'SOP进度',
    icon: 'chart-trending-o'
  }
])

// 方法
const handleSearch = () => {
  currentPage.value = 1
  finished.value = false
  emit('filter-change', getFilters())
}

const handleClear = () => {
  searchKeyword.value = ''
  handleSearch()
}

const handleStatClick = (type: string) => {
  filterStatus.value = type === 'total' ? '' : type
  showFilterPopup.value = true
}

const applyFilters = () => {
  currentPage.value = 1
  finished.value = false
  showFilterPopup.value = false
  emit('filter-change', getFilters())
}

const getFilters = () => ({
  keyword: searchKeyword.value,
  status: filterStatus.value,
  source: filterSource.value,
  sortBy: sortBy.value,
  page: currentPage.value,
  pageSize: pageSize.value
})

const onRefresh = () => {
  finished.value = false
  loading.value = true
  currentPage.value = 1
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
    loading.value = false
  }, 1000)
}

const onLoad = () => {
  // 模拟加载更多数据
  setTimeout(() => {
    if (displayCustomers.value.length >= filteredCustomers.value.length) {
      finished.value = true
    } else {
      currentPage.value++
    }
    loading.value = false
  }, 500)
}

const handleCustomerClick = (customer: Customer) => {
  emit('view-customer', customer)
}

const handleCallCustomer = (customer: Customer) => {
  emit('call-customer', customer)
}

const handleAddFollow = (customer: Customer) => {
  emit('add-follow', customer)
}

const showActionSheet = (customer: Customer) => {
  selectedCustomer.value = customer
  showActionSheetVisible.value = true
}

const handleActionSelect = (action: any) => {
  if (!selectedCustomer.value) return

  const customer = selectedCustomer.value

  switch (action.name) {
    case '查看详情':
      emit('view-customer', customer)
      break
    case '拨打电话':
      emit('call-customer', customer)
      break
    case '添加跟进':
      emit('add-follow', customer)
      break
    case '跟进记录':
      emit('view-history', customer)
      break
    case 'SOP进度':
      emit('view-sop', customer)
      break
  }

  showActionSheetVisible.value = false
}

const handleAddCustomer = () => {
  emit('add-customer')
}

// 监听器
watch([filterStatus, filterSource, sortBy], () => {
  if (!showFilterPopup.value) {
    applyFilters()
  }
})

onMounted(() => {
  // 初始化加载数据
  emit('filter-change', getFilters())
})
</script>

<style scoped lang="scss">
.mobile-customer-list {
  background: var(--van-background-color);
  min-height: 100vh;
  padding-bottom: 60px;

  .search-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--van-background-color);

    .filter-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--van-primary-color);
      font-size: var(--van-font-size-md);
    }
  }

  .stats-row {
    background: white;
    margin: var(--van-padding-sm);
    border-radius: var(--van-border-radius-lg);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(100, 101, 102, 0.08);

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: 600;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--van-font-size-xs);
        color: var(--van-gray-6);
      }
    }
  }

  :deep(.van-list) {
    padding: 0 var(--van-padding-sm);
  }

  :deep(.van-pull-refresh) {
    min-height: calc(100vh - 200px);
  }
}

.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    .popup-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
    }
  }

  .filter-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);

    :deep(.van-cell) {
      padding: var(--van-padding-lg);

      .van-cell__title {
        font-weight: 500;
        margin-right: var(--van-padding-md);
      }
    }

    :deep(.van-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: var(--van-padding-sm);

      .van-radio {
        margin-right: var(--van-padding-md);
        margin-bottom: var(--van-padding-xs);

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}

/* 暗黑模式适配 */
:deep([data-theme="dark"]) {
  .mobile-customer-list {
    .stats-row {
      background: var(--van-background-color-dark);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>