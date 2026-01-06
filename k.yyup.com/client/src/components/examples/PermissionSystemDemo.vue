<!--
4层权限系统演示组件
Four-Level Permission System Demo Component

Level 1: 菜单权限 - 控制侧边栏显示
Level 2: 页面权限 - 控制页面访问
Level 3: 页面操作权限 - 控制页面内操作
Level 4: 按钮权限 - 控制具体按钮显示
-->

<template>
  <div class="permission-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🔐 4层权限系统演示</span>
          <el-button
            type="primary"
            size="small"
            @click="loadPagePermissions"
          >
            加载页面权限
          </el-button>
        </div>
      </template>

      <!-- Level 1: 菜单权限 -->
      <el-divider content-position="left">
        <el-tag type="primary">Level 1: 菜单权限</el-tag>
      </el-divider>
      <p>已通过侧边栏菜单验证（路由加载时自动完成）</p>
      <el-space>
        <el-tag>菜单项数量: {{ permissionsStore.menuItems.length }}</el-tag>
        <el-tag>用户角色: {{ permissionsStore.userRoles.join(', ') }}</el-tag>
        <el-tag :type="permissionsStore.isAdmin ? 'danger' : 'info'">
          {{ permissionsStore.isAdmin ? '管理员' : '普通用户' }}
        </el-tag>
      </el-space>

      <!-- Level 2: 页面权限 -->
      <el-divider content-position="left">
        <el-tag type="success">Level 2: 页面权限</el-tag>
      </el-divider>
      <p>已通过页面访问验证（路由守卫自动完成）</p>
      <el-space>
        <el-button 
          type="success" 
          size="small" 
          @click="testPagePermission"
          :loading="pagePermissionLoading"
        >
          测试页面权限
        </el-button>
        <span v-if="pagePermissionResult !== null">
          权限结果: 
          <el-tag :type="pagePermissionResult ? 'success' : 'danger'">
            {{ pagePermissionResult ? '有权限' : '无权限' }}
          </el-tag>
        </span>
      </el-space>

      <!-- Level 3: 页面操作权限 -->
      <el-divider content-position="left">
        <el-tag type="warning">Level 3: 页面操作权限</el-tag>
      </el-divider>
      <div v-if="pagePermissions.hasPagePermissions">
        <p>页面操作权限加载成功</p>
        <el-space wrap>
          <el-tag>总计: {{ pagePermissions.pagePermissions?.summary.total }}</el-tag>
          <el-tag>操作: {{ pagePermissions.pagePermissions?.summary.actions }}</el-tag>
          <el-tag>导航: {{ pagePermissions.pagePermissions?.summary.navigation }}</el-tag>
          <el-tag>其他: {{ pagePermissions.pagePermissions?.summary.operations }}</el-tag>
        </el-space>
        
        <div style="margin-top: var(--spacing-2xl);">
          <h4>操作权限列表:</h4>
          <el-space wrap>
            <el-tag 
              v-for="permission in pagePermissions.actionPermissions" 
              :key="permission.id"
              size="small"
              type="warning"
            >
              {{ permission.chinese_name || permission.name }}
            </el-tag>
          </el-space>
        </div>
      </div>
      <div v-else>
        <el-empty description="点击上方按钮加载页面操作权限" />
      </div>

      <!-- Level 4: 按钮权限演示 -->
      <el-divider content-position="left">
        <el-tag type="danger">Level 4: 按钮权限</el-tag>
      </el-divider>
      
      <div class="permission-examples">
        <h4>权限指令演示:</h4>
        
        <!-- 单个权限指令 -->
        <div class="example-group">
          <h5>v-permission 单个权限:</h5>
          <el-space wrap>
            <el-button 
              v-permission="'EDIT_STUDENT'" 
              type="primary" 
              size="small"
            >
              编辑学生 (EDIT_STUDENT)
            </el-button>
            <el-button 
              v-permission="'DELETE_STUDENT'" 
              type="danger" 
              size="small"
            >
              删除学生 (DELETE_STUDENT)
            </el-button>
            <el-button 
              v-permission="'VIEW_REPORT'" 
              type="info" 
              size="small"
            >
              查看报告 (VIEW_REPORT)
            </el-button>
          </el-space>
        </div>

        <!-- 多权限or逻辑 -->
        <div class="example-group">
          <h5>v-permissions 多权限(or逻辑):</h5>
          <el-space wrap>
            <el-button 
              v-permissions="['EDIT_STUDENT', 'VIEW_STUDENT']" 
              type="primary" 
              size="small"
            >
              学生管理 (编辑或查看)
            </el-button>
            <el-button 
              v-permissions="['DELETE_TEACHER', 'ADMIN_ACCESS']" 
              type="danger" 
              size="small"
            >
              高级操作 (删除教师或管理员)
            </el-button>
          </el-space>
        </div>

        <!-- 多权限and逻辑 -->
        <div class="example-group">
          <h5>v-permission-all 多权限(and逻辑):</h5>
          <el-space wrap>
            <el-button 
              v-permission-all="['EDIT_STUDENT', 'DELETE_STUDENT']" 
              type="warning" 
              size="small"
            >
              学生全管理 (编辑且删除)
            </el-button>
            <el-button 
              v-permission-all="['ADMIN_ACCESS', 'SYSTEM_CONFIG']" 
              type="danger" 
              size="small"
            >
              系统管理 (管理员且系统配置)
            </el-button>
          </el-space>
        </div>

        <!-- 禁用模式演示 -->
        <div class="example-group">
          <h5>权限指令修饰符演示:</h5>
          <el-space wrap>
            <el-button 
              v-permission:hide="'NON_EXISTENT_PERMISSION'" 
              type="info" 
              size="small"
            >
              隐藏模式 (无权限会隐藏)
            </el-button>
            <el-button 
              v-permission:disable="'NON_EXISTENT_PERMISSION'" 
              type="info" 
              size="small"
            >
              禁用模式 (无权限会禁用)
            </el-button>
            <el-button 
              v-permission="'NON_EXISTENT_PERMISSION'" 
              type="info" 
              size="small"
            >
              默认模式 (无权限会隐藏)
            </el-button>
          </el-space>
        </div>

        <!-- 批量权限验证 -->
        <div class="example-group">
          <h5>批量权限验证:</h5>
          <el-button 
            type="primary" 
            size="small" 
            @click="testBatchPermissions"
            :loading="batchPermissionLoading"
          >
            测试批量权限验证
          </el-button>
          <div v-if="batchPermissionResults" style="margin-top: var(--spacing-2xl);">
            <el-space wrap>
              <el-tag 
                v-for="(hasPermission, permission) in batchPermissionResults" 
                :key="permission"
                :type="hasPermission ? 'success' : 'danger'"
                size="small"
              >
                {{ permission }}: {{ hasPermission ? '✅' : '❌' }}
              </el-tag>
            </el-space>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 实时权限状态 -->
    <el-card style="margin-top: var(--spacing-xl);">
      <template #header>
        <span>📊 实时权限状态</span>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="菜单权限">
          {{ permissionsStore.hasMenuItems ? `${permissionsStore.menuItems.length}个` : '未加载' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户角色">
          {{ permissionsStore.userRoles.join(', ') || '无角色' }}
        </el-descriptions-item>
        <el-descriptions-item label="管理员权限">
          <el-tag :type="permissionsStore.isAdmin ? 'danger' : 'info'">
            {{ permissionsStore.isAdmin ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="页面操作权限">
          {{ pagePermissions.hasPagePermissions ? 
             `${pagePermissions.pagePermissions?.summary.total}个` : '未加载' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePermissionsStore } from '@/stores/permissions'
import { usePagePermissions } from '@/composables/usePagePermissions'
import { ElMessage } from 'element-plus'

// 页面信息
const currentPath = ref('/permission-demo')
const pageId = ref('2010') // 假设这是学生管理页面的ID

// stores
const permissionsStore = usePermissionsStore()

// Level 3 & 4 权限管理
const pagePermissions = usePagePermissions(pageId.value, currentPath.value)

// Level 2 测试状态
const pagePermissionLoading = ref(false)
const pagePermissionResult = ref(null)

// 批量权限验证状态
const batchPermissionLoading = ref(false)
const batchPermissionResults = ref(null)

/**
 * Level 2: 测试页面权限
 */
const testPagePermission = async () => {
  pagePermissionLoading.value = true
  try {
    const hasPermission = await permissionsStore.checkPagePermission(
      currentPath.value, 
      'STUDENT_MANAGEMENT'
    )
    pagePermissionResult.value = hasPermission
    
    ElMessage({
      type: hasPermission ? 'success' : 'warning',
      message: `页面权限验证结果: ${hasPermission ? '有权限' : '无权限'}`
    })
  } catch (error) {
    console.error('页面权限测试失败:', error)
    ElMessage.error('页面权限测试失败')
  } finally {
    pagePermissionLoading.value = false
  }
}

/**
 * Level 3: 加载页面操作权限
 */
const loadPagePermissions = async () => {
  try {
    await pagePermissions.loadPagePermissions()
    ElMessage.success('页面操作权限加载成功')
  } catch (error) {
    console.error('页面操作权限加载失败:', error)
    ElMessage.error('页面操作权限加载失败')
  }
}

/**
 * Level 3: 测试批量权限验证
 */
const testBatchPermissions = async () => {
  batchPermissionLoading.value = true
  try {
    const permissionsToTest = [
      'EDIT_STUDENT',
      'DELETE_STUDENT', 
      'VIEW_STUDENT',
      'EDIT_TEACHER',
      'DELETE_TEACHER',
      'ADMIN_ACCESS',
      'SYSTEM_CONFIG'
    ]
    
    const results = await pagePermissions.batchCheckPermissions(permissionsToTest)
    batchPermissionResults.value = results
    
    const grantedCount = Object.values(results).filter(Boolean).length
    ElMessage.success(`批量权限验证完成: ${grantedCount}/${permissionsToTest.length} 个权限通过`)
    
  } catch (error) {
    console.error('批量权限验证失败:', error)
    ElMessage.error('批量权限验证失败')
  } finally {
    batchPermissionLoading.value = false
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 确保权限store已初始化
  if (!permissionsStore.hasMenuItems) {
    try {
      await permissionsStore.initializePermissions()
    } catch (error) {
      console.error('权限初始化失败:', error)
    }
  }
})
</script>

<style scoped>
.permission-demo {
  padding: var(--spacing-xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.example-group {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-4xl);
  border: var(--border-width) solid var(--border-color-lighter);
  border-radius: var(--spacing-xs);
  background-color: var(--bg-tertiary);
}

.example-group h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-regular);
  font-weight: 500;
}

.permission-examples {
  margin-top: var(--spacing-4xl);
}

.permission-examples h4 {
  margin-bottom: var(--spacing-4xl);
  color: var(--text-primary);
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>