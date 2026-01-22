<template>
  <MobileCenterLayout title="用户中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleAddUser" />
    </template>

    <div class="user-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="3" :gutter="10">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 搜索 -->
      <div class="search-section">
        <van-search v-model="searchKeyword" placeholder="搜索用户姓名/手机号" @search="loadUsers" />
        <van-dropdown-menu>
          <van-dropdown-item v-model="roleFilter" :options="roleOptions" @change="loadUsers" />
        </van-dropdown-menu>
      </div>

      <!-- 用户列表 -->
      <div class="user-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-if="users.length === 0 && !loading" class="empty-state">
              <van-empty description="暂无用户数据" />
            </div>
            <div v-for="item in users" :key="item.id" class="user-card" @click="viewUser(item)">
              <div class="user-avatar">
                <van-image v-if="item.avatar" :src="item.avatar" round fit="cover" />
                <div v-else class="avatar-placeholder">{{ item.name?.charAt(0) }}</div>
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ item.name }}
                  <van-tag size="medium" :type="getRoleType(item.role)">{{ getRoleLabel(item.role) }}</van-tag>
                </div>
                <div class="user-meta">
                  <span>{{ item.phone }}</span>
                  <span>{{ item.department }}</span>
                </div>
              </div>
              <div class="user-status" :class="item.status">
                {{ item.status === 'active' ? '在职' : '离职' }}
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const searchKeyword = ref('')
const roleFilter = ref('')

// 数据
const users = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'total', label: '总用户', value: 85 },
  { key: 'active', label: '在职', value: 78 },
  { key: 'new', label: '本月新增', value: 5 }
])

// 角色选项
const roleOptions = [
  { text: '全部角色', value: '' },
  { text: '管理员', value: 'admin' },
  { text: '园长', value: 'principal' },
  { text: '教师', value: 'teacher' },
  { text: '财务', value: 'finance' }
]

// 初始化
onMounted(() => {
  loadUsers()
})

// 加载用户
const loadUsers = async () => {
  loading.value = true
  users.value = [
    { id: 1, name: '张园长', phone: '138****1234', role: 'principal', department: '园长室', status: 'active', avatar: '' },
    { id: 2, name: '李老师', phone: '139****5678', role: 'teacher', department: '大班组', status: 'active', avatar: '' },
    { id: 3, name: '王老师', phone: '137****9012', role: 'teacher', department: '中班组', status: 'active', avatar: '' },
    { id: 4, name: '赵主任', phone: '136****3456', role: 'admin', department: '行政部', status: 'active', avatar: '' }
  ]
  loading.value = false
  finished.value = true
}

// 刷新
const onRefresh = async () => {
  await loadUsers()
  refreshing.value = false
}

const onLoad = () => { finished.value = true }

// 角色映射
const getRoleType = (role: string) => {
  const map: Record<string, string> = { admin: 'danger', principal: 'primary', teacher: 'success', finance: 'warning' }
  return map[role] || 'default'
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = { admin: '管理员', principal: '园长', teacher: '教师', finance: '财务' }
  return map[role] || '普通用户'
}

// 操作
const handleAddUser = () => showToast('添加用户')
const viewUser = (item: any) => showToast(`查看用户: ${item.name}`)
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.user-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
}

.stats-section {
  padding: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--van-primary-color);
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
    margin-top: 4px;
  }
}

.search-section {
  padding: 0 12px 12px;
  display: flex;
  gap: 8px;
  
  :deep(.van-search) {
    flex: 1;
    padding: 0;
  }
  
  :deep(.van-dropdown-menu__bar) {
    background: transparent;
    box-shadow: none;
    height: auto;
  }
}

.user-list {
  padding: 0 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .user-avatar {
    width: 48px;
    height: 48px;
    
    :deep(.van-image) {
      width: 100%;
      height: 100%;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .user-meta {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 4px;
      
      span + span {
        margin-left: 12px;
      }
    }
  }
  
  .user-status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    
    &.inactive {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
