<template>
  <MobileCenterLayout title="系统中心" back-path="/mobile/centers">
    <div class="system-center-mobile">
      <!-- 系统信息 -->
      <div class="system-info">
        <div class="info-card">
          <van-cell-group inset>
            <van-cell title="系统版本" :value="systemInfo.version" />
            <van-cell title="最后更新" :value="systemInfo.lastUpdate" />
            <van-cell title="运行状态" :value="systemInfo.status" value-class="status-running" />
          </van-cell-group>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <div class="section-title">系统管理</div>
        <van-cell-group inset>
          <van-cell
            v-for="item in systemMenus"
            :key="item.key"
            :title="item.title"
            :icon="item.icon"
            is-link
            @click="handleMenu(item)"
          >
            <template #right-icon>
              <van-badge v-if="item.badge" :content="item.badge" />
              <van-icon v-else name="arrow" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <div class="menu-section">
        <div class="section-title">安全设置</div>
        <van-cell-group inset>
          <van-cell
            v-for="item in securityMenus"
            :key="item.key"
            :title="item.title"
            :icon="item.icon"
            is-link
            @click="handleMenu(item)"
          />
        </van-cell-group>
      </div>

      <div class="menu-section">
        <div class="section-title">数据管理</div>
        <van-cell-group inset>
          <van-cell
            v-for="item in dataMenus"
            :key="item.key"
            :title="item.title"
            :icon="item.icon"
            is-link
            @click="handleMenu(item)"
          />
        </van-cell-group>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-section">
        <div class="section-title">快捷操作</div>
        <van-grid :column-num="4" :gutter="12">
          <van-grid-item v-for="action in quickActions" :key="action.key" @click="handleAction(action.key)">
            <van-icon :name="action.icon" :color="action.color" size="24" />
            <span class="action-label">{{ action.label }}</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 存储使用情况 -->
      <div class="storage-section">
        <div class="section-title">存储使用</div>
        <div class="storage-card">
          <div class="storage-header">
            <span>已使用 {{ storage.used }} / {{ storage.total }}</span>
            <span class="percentage">{{ storage.percentage }}%</span>
          </div>
          <van-progress :percentage="storage.percentage" :stroke-width="8" />
          <div class="storage-detail">
            <div class="detail-item" v-for="item in storage.details" :key="item.type">
              <div class="dot" :style="{ background: item.color }"></div>
              <span class="type">{{ item.type }}</span>
              <span class="size">{{ item.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 系统信息
const systemInfo = reactive({
  version: 'v2.5.0',
  lastUpdate: '2026-01-05',
  status: '运行正常'
})

// 系统管理菜单
const systemMenus = [
  { key: 'users', title: '用户管理', icon: 'friends-o' },
  { key: 'roles', title: '角色权限', icon: 'shield-o' },
  { key: 'org', title: '组织架构', icon: 'cluster-o' },
  { key: 'logs', title: '操作日志', icon: 'notes-o', badge: 'NEW' }
]

// 安全设置菜单
const securityMenus = [
  { key: 'password', title: '密码策略', icon: 'lock' },
  { key: 'login', title: '登录设置', icon: 'user-o' },
  { key: 'whitelist', title: 'IP白名单', icon: 'location-o' }
]

// 数据管理菜单
const dataMenus = [
  { key: 'backup', title: '数据备份', icon: 'replay' },
  { key: 'restore', title: '数据恢复', icon: 'upgrade' },
  { key: 'clean', title: '数据清理', icon: 'delete-o' }
]

// 快捷操作
const quickActions = [
  { key: 'cache', label: '清除缓存', icon: 'delete-o', color: '#ef4444' },
  { key: 'refresh', label: '刷新配置', icon: 'replay', color: '#6366f1' },
  { key: 'check', label: '系统检测', icon: 'search', color: '#10b981' },
  { key: 'help', label: '帮助文档', icon: 'question-o', color: '#f59e0b' }
]

// 存储信息
const storage = reactive({
  used: '15.2GB',
  total: '50GB',
  percentage: 30,
  details: [
    { type: '媒体文件', size: '8.5GB', color: '#6366f1' },
    { type: '文档资料', size: '3.2GB', color: '#10b981' },
    { type: '系统数据', size: '2.1GB', color: '#f59e0b' },
    { type: '其他', size: '1.4GB', color: '#94a3b8' }
  ]
})

// 操作
const handleMenu = (item: any) => {
  showToast(`进入${item.title}`)
}

const handleAction = async (key: string) => {
  if (key === 'cache') {
    try {
      await showConfirmDialog({
        title: '确认清除',
        message: '确定要清除系统缓存吗？'
      })
      showToast('缓存已清除')
    } catch {
      // 用户取消
    }
  } else {
    showToast(`执行${key}操作`)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.system-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
  padding-bottom: 20px;
}

.system-info {
  padding: 12px;
  
  .info-card {
    :deep(.van-cell-group) {
      margin: 0;
    }
  }
  
  .status-running {
    color: #10b981;
  }
}

.menu-section {
  padding: 0 12px 12px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color-2);
    margin-bottom: 8px;
    padding-left: 4px;
  }
}

.quick-section {
  padding: 12px;
  background: var(--van-background);
  margin: 0 12px 12px;
  border-radius: 8px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
  
  .action-label {
    font-size: 11px;
    color: var(--van-text-color-2);
    margin-top: 4px;
  }
}

.storage-section {
  padding: 0 12px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color-2);
    margin-bottom: 8px;
    padding-left: 4px;
  }
  
  .storage-card {
    background: var(--van-background);
    border-radius: 8px;
    padding: 16px;
    
    .storage-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--van-text-color);
      
      .percentage {
        font-weight: 600;
        color: var(--van-primary-color);
      }
    }
    
    .storage-detail {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .type {
          color: var(--van-text-color-2);
        }
        
        .size {
          margin-left: auto;
          color: var(--van-text-color);
        }
      }
    }
  }
}
</style>
