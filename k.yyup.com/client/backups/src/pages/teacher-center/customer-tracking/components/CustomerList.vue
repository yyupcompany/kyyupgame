<template>
  <div class="customer-list">
    <!-- 筛选和搜索 -->
    <div class="list-header">
      <div class="filters">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px" @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="新客户" value="new" />
          <el-option label="跟进中" value="following" />
          <el-option label="已成交" value="success" />
          <el-option label="已流失" value="lost" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索客户姓名或电话"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="actions">
        <el-button type="primary" @click="$emit('add-customer')">
          <el-icon><Plus /></el-icon>
          新增客户
        </el-button>
        <el-button @click="$emit('refresh')">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 客户表格 -->
    <el-table :data="filteredCustomers" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="客户姓名" min-width="100" />
      <el-table-column prop="phone" label="联系电话" min-width="120" />
      <el-table-column prop="childName" label="孩子姓名" min-width="100" />
      <el-table-column prop="childAge" label="孩子年龄" min-width="90">
        <template #default="{ row }">
          {{ row.childAge }}岁
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastFollowTime" label="最后跟进" min-width="140">
        <template #default="{ row }">
          {{ formatTime(row.lastFollowTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="nextFollowTime" label="下次跟进" min-width="140">
        <template #default="{ row }">
          <span :class="{ 'text-danger': isOverdue(row.nextFollowTime) }">
            {{ formatTime(row.nextFollowTime) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="220" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="$emit('view-customer', row)">
              查看
            </el-button>
            <el-button size="small" type="primary" @click="$emit('add-follow', row)">
              跟进
            </el-button>
            <el-button size="small" type="success" @click="$emit('view-history', row)">
              记录
            </el-button>
            <el-button size="small" type="warning" @click="$emit('view-sop', row)">
              SOP
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Customer {
  id: string
  name: string
  phone: string
  childName: string
  childAge: number
  status: string
  lastFollowTime: string
  nextFollowTime: string
}

interface Props {
  customers: Customer[]
  loading?: boolean
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0
})

// Emits
const emit = defineEmits<{
  'add-customer': []
  'refresh': []
  'view-customer': [customer: Customer]
  'add-follow': [customer: Customer]
  'view-history': [customer: Customer]
  'view-sop': [customer: Customer]
  'filter-change': [filters: { status: string; keyword: string; page: number; pageSize: number }]
}>()

// 响应式数据
const filterStatus = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const filteredCustomers = computed(() => {
  let result = props.customers
  
  if (filterStatus.value) {
    result = result.filter(customer => customer.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(customer => 
      customer.name.toLowerCase().includes(keyword) ||
      customer.phone.includes(keyword)
    )
  }
  
  return result
})

// 方法
const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    NEW: 'info',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'danger',
    new: 'info',
    following: 'warning',
    success: 'success',
    lost: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    NEW: '新客户',
    FOLLOWING: '跟进中',
    CONVERTED: '已转化',
    LOST: '已流失',
    new: '新客户',
    following: '跟进中',
    success: '已成交',
    lost: '已流失'
  }
  return texts[status] || status
}

const isOverdue = (time: string) => {
  if (!time) return false
  return new Date(time) < new Date()
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleFilterChange = () => {
  currentPage.value = 1
  emitFilterChange()
}

const handleSearch = () => {
  currentPage.value = 1
  emitFilterChange()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  emitFilterChange()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emitFilterChange()
}

const emitFilterChange = () => {
  emit('filter-change', {
    status: filterStatus.value,
    keyword: searchKeyword.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

// 监听器
watch([filterStatus, searchKeyword], () => {
  handleSearch()
})
</script>

<style scoped>
.customer-list {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.filters {
  display: flex;
  gap: var(--text-sm);
}

.actions {
  display: flex;
  gap: var(--text-sm);
}

/* 使用全局 table-actions 样式，移除本地重复定义 */

.text-danger {
  color: var(--danger-color);
}

.pagination-wrapper {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: center;
}
</style>
