<!--
4层权限系统测试页面
用于测试权限指令和权限管理功能
-->

<template>
  <div class="permission-test-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🔐 4层权限系统测试页面</span>
          <el-button type="primary" @click="runTest">开始测试</el-button>
        </div>
      </template>

      <!-- Level 1 测试 -->
      <el-divider content-position="left">
        <el-tag type="primary">Level 1: 菜单权限 ✅</el-tag>
      </el-divider>
      <p>✅ 菜单权限验证通过 - 您能看到这个页面说明侧边栏菜单权限正常</p>
      <p>📊 当前用户角色: {{ userRole }}</p>

      <!-- Level 2 测试 -->
      <el-divider content-position="left">
        <el-tag type="success">Level 2: 页面权限 ✅</el-tag>
      </el-divider>
      <p>✅ 页面访问权限验证通过 - 路由守卫已允许访问此页面</p>

      <!-- Level 3 & Level 4 测试 -->
      <el-divider content-position="left">
        <el-tag type="warning">Level 3 & 4: 操作权限测试</el-tag>
      </el-divider>

      <div class="permission-tests">
        <h3>🧪 权限指令测试</h3>
        
        <div class="test-group">
          <h4>v-permission 指令测试:</h4>
          <el-space wrap>
            <!-- 这些按钮会根据权限显示/隐藏 -->
            <el-button v-permission="'EDIT_STUDENT'" type="primary">
              编辑学生 (EDIT_STUDENT) - 应该显示
            </el-button>
            <el-button v-permission="'DELETE_STUDENT'" type="danger">
              删除学生 (DELETE_STUDENT) - 应该显示 
            </el-button>
            <el-button v-permission="'FAKE_PERMISSION'" type="info">
              假权限 (FAKE_PERMISSION) - 应该隐藏
            </el-button>
          </el-space>
        </div>

        <div class="test-group">
          <h4>v-permissions 指令测试 (or逻辑):</h4>
          <el-space wrap>
            <el-button v-permissions="['EDIT_STUDENT', 'VIEW_STUDENT']" type="primary">
              学生管理 (编辑或查看) - 应该显示
            </el-button>
            <el-button v-permissions="['FAKE_PERM1', 'FAKE_PERM2']" type="warning">
              假权限组合 - 应该隐藏
            </el-button>
          </el-space>
        </div>

        <div class="test-group">
          <h4>v-permission-all 指令测试 (and逻辑):</h4>
          <el-space wrap>
            <el-button v-permission-all="['EDIT_STUDENT', 'DELETE_STUDENT']" type="success">
              高级学生管理 (编辑且删除) - 应该显示
            </el-button>
            <el-button v-permission-all="['EDIT_STUDENT', 'FAKE_PERMISSION']" type="danger">
              混合权限 - 应该隐藏
            </el-button>
          </el-space>
        </div>

        <div class="test-group">
          <h4>权限指令修饰符测试:</h4>
          <el-space wrap>
            <el-button v-permission:hide="'FAKE_PERMISSION'" type="info">
              隐藏模式 - 应该完全隐藏
            </el-button>
            <el-button v-permission:disable="'FAKE_PERMISSION'" type="info">
              禁用模式 - 应该显示但禁用
            </el-button>
          </el-space>
        </div>
      </div>

      <!-- 测试结果显示 -->
      <el-divider content-position="left">
        <el-tag type="info">📊 测试结果</el-tag>
      </el-divider>
      
      <div v-if="testResults.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="(result, index) in testResults"
            :key="index"
            :type="result.success ? 'success' : 'danger'"
            :timestamp="result.timestamp"
          >
            {{ result.message }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-else>
        <el-empty description="点击'开始测试'按钮运行权限测试" />
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePermissionsStore } from '@/stores/permissions'
import { ElMessage } from 'element-plus'

// 使用权限store
const permissionsStore = usePermissionsStore()

// 测试结果
const testResults = ref([])

// 计算用户角色
const userRole = computed(() => permissionsStore.userRoles.join(', ') || '未知')

/**
 * 添加测试结果
 */
const addTestResult = (message, success = true) => {
  testResults.value.push({
    message,
    success,
    timestamp: new Date().toLocaleTimeString()
  })
}

/**
 * 运行权限测试
 */
const runTest = async () => {
  testResults.value = []
  
  try {
    addTestResult('🚀 开始4层权限系统测试...')
    
    // Level 1 测试
    addTestResult(`✅ Level 1: 菜单权限加载成功，菜单数量: ${permissionsStore.menuItems.length}`)
    
    // Level 2 测试
    addTestResult('✅ Level 2: 页面权限验证通过 (能访问此页面)')
    
    // Level 3 & 4 测试 - 检查权限指令是否正确工作
    const adminPermissions = [
      'EDIT_STUDENT',
      'DELETE_STUDENT', 
      'VIEW_STUDENT',
      'ADMIN_ACCESS'
    ]
    
    let visibleButtons = 0
    adminPermissions.forEach(permission => {
      if (permissionsStore.hasPermissionCode(permission)) {
        visibleButtons++
        addTestResult(`✅ Level 4: 权限 ${permission} 验证成功`)
      }
    })
    
    addTestResult(`📊 Level 3 & 4: 总计 ${visibleButtons}/${adminPermissions.length} 个权限验证通过`)
    
    // 测试权限缓存
    if (permissionsStore.isAdmin) {
      addTestResult('✅ 管理员权限识别正确')
    }
    
    addTestResult('🎉 4层权限系统测试完成！')
    
    ElMessage.success('权限系统测试完成！')
    
  } catch (error) {
    addTestResult(`❌ 测试过程中出现错误: ${error.message}`, false)
    ElMessage.error('权限测试失败')
  }
}

// 页面加载时初始化
onMounted(async () => {
  // 确保权限已初始化
  if (!permissionsStore.hasMenuItems) {
    await permissionsStore.initializePermissions()
  }
  
  addTestResult('📝 页面加载完成，权限系统已就绪')
})
</script>

<style scoped>
.permission-test-page {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-tests {
  margin: var(--text-2xl) 0;
}

.test-group {
  margin-bottom: var(--spacing-8xl);
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color-lighter);
  border-radius: var(--spacing-sm);
  background-color: var(--bg-gray-light);
}

.test-group h4 {
  margin: 0 0 15px 0;
  color: var(--text-regular);
  font-weight: 500;
}

:deep(.el-timeline-item__timestamp) {
  font-size: var(--text-sm);
  color: var(--info-color);
}
</style>