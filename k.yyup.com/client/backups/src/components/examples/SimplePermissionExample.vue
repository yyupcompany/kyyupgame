<!--
简化的权限使用示例
前端开发者只需要关心这些简单的权限验证方式
-->

<template>
  <div class="simple-permission-example">
    <el-card>
      <template #header>
        <span>🔐 前端权限使用示例（简化版）</span>
      </template>

      <!-- 基础权限指令使用 -->
      <div class="permission-section">
        <h3>📋 权限指令使用</h3>
        <p>前端开发者只需要知道权限代码，不需要了解后端架构</p>
        
        <el-space wrap>
          <!-- 单个权限验证 -->
          <el-button v-permission="'EDIT_STUDENT'" type="primary">
            ✏️ 编辑学生
          </el-button>
          
          <el-button v-permission="'DELETE_STUDENT'" type="danger">
            🗑️ 删除学生
          </el-button>
          
          <!-- 多权限验证（or逻辑） -->
          <el-button v-permissions="['VIEW_STUDENT', 'EDIT_STUDENT']" type="success">
            👁️ 学生管理
          </el-button>
          
          <!-- 禁用模式 -->
          <el-button v-permission:disable="'ADMIN_ONLY'" type="warning">
            🔒 管理员功能
          </el-button>
        </el-space>
      </div>

      <!-- 编程式权限检查 -->
      <div class="permission-section">
        <h3>💻 编程式权限检查</h3>
        
        <el-space wrap>
          <el-button @click="checkSinglePermission" type="info">
            检查单个权限
          </el-button>
          
          <el-button @click="checkMultiplePermissions" type="info">
            检查多个权限
          </el-button>
          
          <el-button @click="checkRolePermission" type="info">
            检查角色权限
          </el-button>
        </el-space>

        <!-- 检查结果显示 -->
        <div v-if="checkResults.length > 0" class="results">
          <h4>检查结果：</h4>
          <ul>
            <li v-for="result in checkResults" :key="result.id">
              <el-tag :type="result.success ? 'success' : 'danger'">
                {{ result.message }}
              </el-tag>
            </li>
          </ul>
        </div>
      </div>

      <!-- 常用权限代码参考 -->
      <div class="permission-section">
        <h3>📚 常用权限代码参考</h3>
        <p>前端开发者可以直接使用这些权限代码，不需要了解后端的具体实现</p>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <h4>学生管理</h4>
            <ul class="permission-list">
              <li><code>EDIT_STUDENT</code> - 编辑学生</li>
              <li><code>DELETE_STUDENT</code> - 删除学生</li>
              <li><code>VIEW_STUDENT</code> - 查看学生</li>
              <li><code>EXPORT_STUDENT</code> - 导出学生数据</li>
            </ul>
          </el-col>
          
          <el-col :span="8">
            <h4>教师管理</h4>
            <ul class="permission-list">
              <li><code>EDIT_TEACHER</code> - 编辑教师</li>
              <li><code>DELETE_TEACHER</code> - 删除教师</li>
              <li><code>VIEW_TEACHER</code> - 查看教师</li>
              <li><code>MANAGE_PERFORMANCE</code> - 绩效管理</li>
            </ul>
          </el-col>
          
          <el-col :span="8">
            <h4>系统管理</h4>
            <ul class="permission-list">
              <li><code>ADMIN_ACCESS</code> - 管理员权限</li>
              <li><code>SYSTEM_CONFIG</code> - 系统配置</li>
              <li><code>USER_MANAGEMENT</code> - 用户管理</li>
              <li><code>BACKUP_DATA</code> - 数据备份</li>
            </ul>
          </el-col>
        </el-row>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePermissionsStore } from '@/stores/permissions-simple'
import { ElMessage } from 'element-plus'

// 使用权限store
const permissionsStore = usePermissionsStore()

// 检查结果
const checkResults = ref([])

/**
 * 检查单个权限
 */
const checkSinglePermission = async () => {
  try {
    const hasPermission = await permissionsStore.hasPermission('EDIT_STUDENT')
    
    checkResults.value.push({
      id: Date.now(),
      message: `EDIT_STUDENT 权限: ${hasPermission ? '✅ 有权限' : '❌ 无权限'}`,
      success: hasPermission
    })
    
    ElMessage.success('单个权限检查完成')
  } catch (error) {
    ElMessage.error('权限检查失败')
  }
}

/**
 * 检查多个权限
 */
const checkMultiplePermissions = async () => {
  try {
    const permissions = ['EDIT_STUDENT', 'DELETE_STUDENT', 'VIEW_TEACHER']
    const results = await permissionsStore.hasPermissions(permissions)
    
    Object.entries(results).forEach(([permission, hasPermission]) => {
      checkResults.value.push({
        id: Date.now() + Math.random(),
        message: `${permission}: ${hasPermission ? '✅ 有权限' : '❌ 无权限'}`,
        success: hasPermission
      })
    })
    
    ElMessage.success('批量权限检查完成')
  } catch (error) {
    ElMessage.error('批量权限检查失败')
  }
}

/**
 * 检查角色权限
 */
const checkRolePermission = () => {
  const isAdmin = permissionsStore.hasRole('admin')
  const isTeacher = permissionsStore.hasRole('teacher')
  
  checkResults.value.push({
    id: Date.now(),
    message: `管理员角色: ${isAdmin ? '✅ 是' : '❌ 否'}`,
    success: isAdmin
  })
  
  checkResults.value.push({
    id: Date.now() + 1,
    message: `教师角色: ${isTeacher ? '✅ 是' : '❌ 否'}`,
    success: isTeacher
  })
  
  ElMessage.success('角色权限检查完成')
}
</script>

<style scoped>
.simple-permission-example {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.permission-section {
  margin-bottom: var(--spacing-8xl);
  padding-bottom: var(--text-2xl);
  border-bottom: var(--border-width-base) solid #ebeef5;
}

.permission-section:last-child {
  border-bottom: none;
}

.permission-section h3 {
  margin-bottom: var(--spacing-4xl);
  color: var(--text-primary);
}

.permission-section h4 {
  margin-bottom: var(--spacing-2xl);
  color: var(--text-regular);
}

.permission-list {
  list-style: none;
  padding: 0;
}

.permission-list li {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-base) 0;
}

.permission-list code {
  background-color: var(--bg-hover);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--radius-xs);
  color: var(--warning-color);
  font-weight: 500;
}

.results {
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-4xl);
  background-color: var(--bg-gray-light);
  border-radius: var(--radius-md);
}

.results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  margin-bottom: var(--spacing-sm);
}
</style>