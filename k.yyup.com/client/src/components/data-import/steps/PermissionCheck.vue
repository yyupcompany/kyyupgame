<template>
  <div class="permission-check">
    <div class="check-header">
      <UnifiedIcon name="default" />
      <h4>数据导入权限验证</h4>
    </div>

    <div class="check-content">
      <p class="description">
        请选择您要导入的数据类型，系统将验证您是否具有相应的导入权限。
      </p>

      <el-form :model="form" label-width="120px" class="permission-form">
        <el-form-item label="导入类型" required>
          <el-select 
            v-model="form.importType" 
            placeholder="请选择导入类型"
            class="full-width"
            @change="handleTypeChange"
          >
            <el-option
              v-for="type in importTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
              :disabled="!type.available"
            >
              <div class="option-content">
                <span>{{ type.label }}</span>
                <el-tag 
                  v-if="!type.available" 
                  size="small" 
                  type="warning"
                >
                  无权限
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.importType">
          <el-button 
            type="primary" 
            @click="checkPermission"
            :loading="checking"
            :disabled="!form.importType"
          >
            <UnifiedIcon name="default" />
            验证权限
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 权限检查结果 -->
      <div v-if="checkResult" class="check-result">
        <el-alert
          :title="checkResult.message"
          :type="checkResult.success ? 'success' : 'error'"
          :show-icon="true"
          :closable="false"
        >
          <template #default>
            <div class="result-details">
              <p><strong>导入类型:</strong> {{ getTypeLabel(form.importType) }}</p>
              <p><strong>所需权限:</strong> {{ getRequiredPermission(form.importType) }}</p>
              <p><strong>验证状态:</strong> 
                <el-tag :type="checkResult.success ? 'success' : 'danger'">
                  {{ checkResult.success ? '通过' : '失败' }}
                </el-tag>
              </p>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 权限说明 -->
      <div class="permission-info">
        <h5>权限说明</h5>
        <ul>
          <li><strong>学生数据导入:</strong> 需要 STUDENT_CREATE 权限</li>
          <li><strong>家长数据导入:</strong> 需要 PARENT_MANAGE 权限</li>
          <li><strong>教师数据导入:</strong> 需要 TEACHER_MANAGE 权限</li>
        </ul>
        <p class="info-note">
          <UnifiedIcon name="default" />
          如果您没有相应权限，请联系系统管理员进行授权。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Shield, InfoFilled } from '@element-plus/icons-vue'
import { dataImportApi } from '@/api/data-import'

// Emits
const emit = defineEmits<{
  'permission-checked': [data: { importType: string; hasPermission: boolean }]
  error: [message: string]
}>()

// 响应式数据
const checking = ref(false)
const checkResult = ref<any>(null)

const form = ref({
  importType: ''
})

const importTypes = ref([
  { value: 'student', label: '学生数据', available: true },
  { value: 'parent', label: '家长数据', available: true },
  { value: 'teacher', label: '教师数据', available: true }
])

// 方法
const handleTypeChange = () => {
  checkResult.value = null
}

const checkPermission = async () => {
  if (!form.value.importType) {
    ElMessage.warning('请先选择导入类型')
    return
  }

  checking.value = true
  checkResult.value = null

  try {
    const response = await dataImportApi.checkPermission({
      importType: form.value.importType
    })

    if (response.success) {
      checkResult.value = {
        success: response.data.hasPermission,
        message: response.data.hasPermission ? '权限验证通过，可以进行数据导入' : '权限验证失败，无法进行数据导入'
      }

      // 发送权限检查结果
      emit('permission-checked', {
        importType: form.value.importType,
        hasPermission: response.data.hasPermission
      })
    } else {
      throw new Error(response.message || '权限检查失败')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '权限检查失败'
    checkResult.value = {
      success: false,
      message
    }
    emit('error', message)
  } finally {
    checking.value = false
  }
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    student: '学生数据',
    parent: '家长数据',
    teacher: '教师数据'
  }
  return typeMap[type] || type
}

const getRequiredPermission = (type: string) => {
  const permissionMap: Record<string, string> = {
    student: 'STUDENT_CREATE',
    parent: 'PARENT_MANAGE',
    teacher: 'TEACHER_MANAGE'
  }
  return permissionMap[type] || 'UNKNOWN'
}

// 获取支持的导入类型
const loadSupportedTypes = async () => {
  try {
    const response = await dataImportApi.getSupportedTypes()
    if (response.success) {
      importTypes.value = response.data.allTypes.map((type: any) => ({
        value: type.type,
        label: type.displayName,
        available: type.hasPermission
      }))
    }
  } catch (error) {
    console.error('获取支持的导入类型失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadSupportedTypes()
})
</script>

<style scoped>
.permission-check {
  text-align: center;
}

.check-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.header-icon {
  font-size: var(--text-3xl);
  color: var(--primary-color);
}

.check-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.check-content {
  max-width: 100%; max-width: 600px;
  margin: 0 auto;
  text-align: left;
}

.description {
  color: var(--text-regular);
  margin-bottom: var(--spacing-8xl);
  text-align: center;
}

.permission-form {
  margin-bottom: var(--spacing-8xl);
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.check-result {
  margin: var(--spacing-8xl) 0;
}

.result-details p {
  margin: var(--spacing-sm) 0;
  color: var(--text-regular);
}

.permission-info {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-8xl);
}

.permission-info h5 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
}

.permission-info ul {
  margin: var(--spacing-4xl) 0;
  padding-left: var(--spacing-xl);
}

.permission-info li {
  margin: var(--spacing-sm) 0;
  color: var(--text-regular);
}

.info-note {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-2xl);
  background: #e6f7ff;
  border-radius: var(--spacing-xs);
  color: var(--primary-color);
  font-size: var(--text-base);
}
.full-width {
  width: 100%;
}
</style>
