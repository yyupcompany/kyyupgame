<template>
  <div class="role-switcher" v-if="isDevelopment">
    <el-card class="switcher-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="default" />
          <span>角色测试切换器</span>
          <el-button 
            size="small" 
            @click="toggleExpanded"
            :icon="expanded ? 'ArrowUp' : 'ArrowDown'"
            text
          />
        </div>
      </template>
      
      <div v-show="expanded" class="switcher-content">
        <!-- 当前角色信息 -->
        <div class="current-role">
          <div class="role-info">
            <span class="label">当前角色：</span>
            <el-tag :type="getRoleTagType(currentRole)" size="large">
              {{ getRoleLabel(currentRole) }}
            </el-tag>
          </div>
          <div class="role-permissions">
            <span class="label">权限数量：</span>
            <span class="value">{{ userPermissions.length }}</span>
          </div>
        </div>

        <!-- 角色切换按钮 -->
        <div class="role-buttons">
          <el-button
            v-for="role in availableRoles"
            :key="role.value"
            :type="currentRole === role.value ? 'primary' : 'default'"
            :disabled="currentRole === role.value"
            @click="switchRole(role.value)"
            size="small"
          >
            <UnifiedIcon name="default" />
            {{ role.label }}
          </el-button>
        </div>

        <!-- 功能测试区域 -->
        <div class="test-functions">
          <h4>功能测试</h4>
          <div class="test-buttons">
            <el-button size="small" @click="testAIShortcuts">
              测试快捷操作
            </el-button>
            <el-button size="small" @click="testPermissions">
              测试权限验证
            </el-button>
            <el-button size="small" @click="testAIAssistant">
              测试AI助手
            </el-button>
            <el-button size="small" @click="clearTestData">
              清理测试数据
            </el-button>
          </div>
        </div>

        <!-- 测试结果 -->
        <div class="test-results" v-if="testResults.length > 0">
          <h4>测试结果</h4>
          <div class="results-list">
            <div 
              v-for="(result, index) in testResults" 
              :key="index"
              class="result-item"
              :class="result.status"
            >
              <div class="result-header">
                <UnifiedIcon name="Close" />
                <span class="result-title">{{ result.title }}</span>
                <span class="result-time">{{ formatTime(result.timestamp) }}</span>
              </div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, 
  ArrowUp, 
  ArrowDown,
  Crown,
  UserFilled,
  Avatar,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAIAssistantStore } from '@/stores/ai-assistant'
import { getUserShortcuts } from '@/api/ai-shortcuts'
import { formatDate } from '@/utils/date'

// 响应式数据
const userStore = useUserStore()
const aiStore = useAIAssistantStore()
const expanded = ref(false)
const testResults = ref<Array<{
  title: string
  message: string
  status: 'success' | 'error'
  timestamp: string
}>>([])

// 开发环境检查
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true')
})

// 当前角色
const currentRole = computed(() => userStore.userInfo?.role || 'user')
const userPermissions = computed(() => userStore.userPermissions || [])

// 可用角色
const availableRoles = [
  { value: 'principal', label: '园长', icon: 'star' },
  { value: 'admin', label: '管理员', icon: 'UserFilled' },
  { value: 'teacher', label: '教师', icon: 'Avatar' },
  { value: 'user', label: '普通用户', icon: 'User' }
]

// 角色权限映射
const rolePermissions = {
  principal: [
    'AI_SHORTCUTS_VIEW', 'AI_SHORTCUTS_CREATE', 'AI_SHORTCUTS_UPDATE', 'AI_SHORTCUTS_DELETE',
    'ENROLLMENT_VIEW', 'ENROLLMENT_MANAGE', 'STATISTICS_VIEW', 'REPORTS_VIEW'
  ],
  admin: [
    'AI_SHORTCUTS_VIEW', 'AI_SHORTCUTS_CREATE', 'AI_SHORTCUTS_UPDATE', 'AI_SHORTCUTS_DELETE',
    'SYSTEM_SETTINGS', 'USER_MANAGE', 'ROLE_MANAGE', 'PERMISSIONS_MANAGE'
  ],
  teacher: [
    'AI_SHORTCUTS_VIEW', 'STUDENTS_VIEW', 'STUDENTS_MANAGE', 'CLASSES_VIEW'
  ],
  user: [
    'AI_SHORTCUTS_VIEW'
  ]
}

// 工具函数
const getRoleLabel = (role: string) => {
  const roleMap = {
    principal: '园长',
    admin: '管理员',
    teacher: '教师',
    user: '普通用户'
  }
  return roleMap[role] || role
}

const getRoleTagType = (role: string) => {
  const typeMap = {
    principal: 'danger',
    admin: 'warning',
    teacher: 'success',
    user: 'info'
  }
  return typeMap[role] || 'info'
}

const formatTime = (timestamp: string) => {
  return formatDate(timestamp, 'HH:mm:ss')
}

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// 切换角色
const switchRole = (role: string) => {
  try {
    // 模拟角色切换
    const mockUserInfo = {
      id: 1,
      username: `test_${role}`,
      email: `${role}@test.com`,
      role: role,
      name: getRoleLabel(role),
      avatar: ''
    }
    
    // 更新用户信息
    userStore.userInfo = mockUserInfo
    userStore.userPermissions = rolePermissions[role] || []
    
    // 更新本地存储
    localStorage.setItem('user-info', JSON.stringify(mockUserInfo))
    localStorage.setItem('user-permissions', JSON.stringify(userStore.userPermissions))
    
    // 更新AI助手上下文
    aiStore.updatePageContext(
      { path: window.location.pathname } as any,
      userStore
    )
    
    addTestResult(
      '角色切换',
      `成功切换到${getRoleLabel(role)}角色，权限数量：${userStore.userPermissions.length}`,
      'success'
    )
    
    ElMessage.success(`已切换到${getRoleLabel(role)}角色`)
  } catch (error) {
    console.error('角色切换失败:', error)
    addTestResult(
      '角色切换',
      `切换到${getRoleLabel(role)}角色失败：${error}`,
      'error'
    )
    ElMessage.error('角色切换失败')
  }
}

// 测试AI快捷操作
const testAIShortcuts = async () => {
  try {
    const result = await getUserShortcuts()
    const shortcuts = result.data
    
    addTestResult(
      'AI快捷操作测试',
      `成功获取${shortcuts.length}个快捷操作，角色：${currentRole.value}`,
      'success'
    )
    
    // 验证角色权限
    const hasRoleSpecificShortcuts = shortcuts.some(s => 
      s.role === currentRole.value || s.role === 'all'
    )
    
    if (hasRoleSpecificShortcuts) {
      addTestResult(
        '角色权限验证',
        '快捷操作角色过滤正常',
        'success'
      )
    } else {
      addTestResult(
        '角色权限验证',
        '未找到适合当前角色的快捷操作',
        'error'
      )
    }
    
  } catch (error) {
    console.error('AI快捷操作测试失败:', error)
    addTestResult(
      'AI快捷操作测试',
      `测试失败：${error}`,
      'error'
    )
  }
}

// 测试权限验证
const testPermissions = () => {
  const expectedPermissions = rolePermissions[currentRole.value] || []
  const actualPermissions = userStore.userPermissions || []
  
  const hasAllPermissions = expectedPermissions.every(permission => 
    actualPermissions.includes(permission)
  )
  
  if (hasAllPermissions) {
    addTestResult(
      '权限验证测试',
      `权限验证通过，拥有${actualPermissions.length}个权限`,
      'success'
    )
  } else {
    const missingPermissions = expectedPermissions.filter(permission => 
      !actualPermissions.includes(permission)
    )
    addTestResult(
      '权限验证测试',
      `权限验证失败，缺少权限：${missingPermissions.join(', ')}`,
      'error'
    )
  }
}

// 测试AI助手
const testAIAssistant = () => {
  try {
    // 检查AI助手状态
    const panelVisible = aiStore.panelVisible
    const currentContext = aiStore.currentPageContext
    
    addTestResult(
      'AI助手测试',
      `AI助手状态：${panelVisible ? '已打开' : '已关闭'}，上下文：${currentContext?.title || '无'}`,
      'success'
    )
    
    // 测试快捷操作缓存
    const cachedShortcuts = aiStore.getCachedShortcuts()
    if (cachedShortcuts) {
      addTestResult(
        '快捷操作缓存',
        `缓存有效，包含${cachedShortcuts.length}个快捷操作`,
        'success'
      )
    } else {
      addTestResult(
        '快捷操作缓存',
        '缓存无效或为空',
        'error'
      )
    }
    
  } catch (error) {
    console.error('AI助手测试失败:', error)
    addTestResult(
      'AI助手测试',
      `测试失败：${error}`,
      'error'
    )
  }
}

// 清理测试数据
const clearTestData = () => {
  testResults.value = []
  aiStore.clearShortcutsCache()
  ElMessage.success('测试数据已清理')
}

// 添加测试结果
const addTestResult = (title: string, message: string, status: 'success' | 'error') => {
  testResults.value.unshift({
    title,
    message,
    status,
    timestamp: new Date().toISOString()
  })
  
  // 限制结果数量
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10)
  }
}

// 组件挂载时的初始化
onMounted(() => {
  if (isDevelopment.value) {
    addTestResult(
      '测试环境',
      '角色测试切换器已启用',
      'success'
    )
  }
})
</script>

<style scoped lang="scss">
.role-switcher {
  position: fixed;
  top: var(--position-20xl);
  right: var(--spacing-xl);
  width: 100%; max-width: 320px;
  z-index: var(--z-index-dropdown)px;
  
  .switcher-card {
    border: 2px solid var(--primary-color);
    
    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      color: var(--primary-color);
      
      .el-icon {
        font-size: var(--text-lg);
      }
      
      span {
        flex: 1;
      }
    }
    
    .switcher-content {
      .current-role {
        padding: var(--text-sm);
        background: var(--bg-hover);
        border-radius: var(--radius-md);
        margin-bottom: var(--text-lg);
        
        .role-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          
          .label {
            font-weight: 500;
            color: var(--text-regular);
          }
        }
        
        .role-permissions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          
          .label {
            font-weight: 500;
            color: var(--text-regular);
          }
          
          .value {
            color: var(--primary-color);
            font-weight: 600;
          }
        }
      }
      
      .role-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
        margin-bottom: var(--text-lg);
        
        .el-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
      }
      
      .test-functions {
        margin-bottom: var(--text-lg);
        
        h4 {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
        
        .test-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
        }
      }
      
      .test-results {
        h4 {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
        
        .results-list {
          max-min-height: 60px; height: auto;
          overflow-y: auto;
          
          .result-item {
            padding: var(--spacing-sm);
            border-radius: var(--spacing-xs);
            margin-bottom: var(--spacing-sm);
            border-left: 3px solid;
            
            &.success {
              background: #f0f9ff;
              border-left-color: var(--success-color);
            }
            
            &.error {
              background: #fef0f0;
              border-left-color: var(--danger-color);
            }
            
            .result-header {
              display: flex;
              align-items: center;
              gap: var(--spacing-lg);
              margin-bottom: var(--spacing-xs);
              
              .el-icon {
                font-size: var(--text-base);
                
                &:first-child {
                  color: inherit;
                }
              }
              
              .result-title {
                flex: 1;
                font-weight: 500;
                font-size: var(--text-sm);
              }
              
              .result-time {
                font-size: var(--text-2xs);
                color: var(--info-color);
              }
            }
            
            .result-message {
              font-size: var(--text-xs);
              color: var(--text-regular);
              line-height: 1.4;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .role-switcher {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin: var(--text-lg) 0;
  }
}
</style>
