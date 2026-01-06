<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`页面权限管理 - ${roleName}`"
    width="60%"
    @close="handleClose"
  >
    <div class="permission-container">
      <div class="permission-header">
        <el-alert
          title="页面权限说明"
          description="选择该角色可以访问的页面。管理员默认拥有所有页面权限。"
          type="info"
          show-icon
          :closable="false"
        />
      </div>
      
      <!-- 页面权限列表 -->
      <div class="permission-list" v-loading="loading">
        <el-checkbox-group v-model="selectedPageIds">
          <div class="permission-group" v-for="group in pageGroups" :key="group.name">
            <h4 class="group-title">{{ group.name }}</h4>
            <div class="permission-items">
              <el-checkbox 
                v-for="page in group.pages" 
                :key="page.id" 
                :label="page.id"
                class="permission-item"
              >
                <div class="permission-info">
                  <span class="permission-name">{{ page.name }}</span>
                  <span class="permission-code">{{ page.code }}</span>
                </div>
              </el-checkbox>
            </div>
          </div>
        </el-checkbox-group>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { usePermissions } from '../../composables/usePermissions'

interface Props {
  visible: boolean
  role: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { loading, rolePages, fetchRolePagePermissions, updateRolePages } = usePermissions()

// 对话框可见性
const dialogVisible = ref(props.visible)

// 选中的页面ID列表
const selectedPageIds = ref<number[]>([])

// 角色名称
const roleName = computed(() => props.role?.name || '')

// 页面分组
const pageGroups = ref([
  {
    name: '系统管理',
    pages: [
      { id: 1, name: '系统概览', code: 'system:dashboard:view' },
      { id: 2, name: '用户管理', code: 'system:user:manage' },
      { id: 3, name: '角色管理', code: 'system:role:manage' },
      { id: 4, name: '权限管理', code: 'system:permission:manage' },
      { id: 5, name: '系统设置', code: 'system:settings:manage' },
      { id: 6, name: '系统日志', code: 'system:log:view' },
      { id: 7, name: '数据备份', code: 'system:backup:manage' },
      { id: 8, name: '消息模板', code: 'system:message:manage' }
    ]
  },
  {
    name: '幼儿园管理',
    pages: [
      { id: 9, name: '幼儿园管理', code: 'kindergarten:manage' },
      { id: 10, name: '班级管理', code: 'class:manage' },
      { id: 11, name: '教师管理', code: 'teacher:manage' },
      { id: 12, name: '学生管理', code: 'student:manage' }
    ]
  },
  {
    name: '招生管理',
    pages: [
      { id: 13, name: '招生计划', code: 'enrollment:plan:manage' },
      { id: 14, name: '招生活动', code: 'activity:manage' },
      { id: 15, name: '营销管理', code: 'marketing:manage' }
    ]
  }
])

// 监听visible属性变化
watch(
  () => props.visible,
  (val: boolean) => {
    dialogVisible.value = val
    if (val && props.role) {
      loadRolePagePermissions()
    }
  }
)

// 监听dialogVisible变化
watch(
  dialogVisible,
  (val: boolean) => {
    emit('update:visible', val)
  }
)

// 加载角色页面权限
const loadRolePagePermissions = async () => {
  if (!props.role) return
  
  try {
    const result = await fetchRolePagePermissions(props.role.id)
    if (result) {
      selectedPageIds.value = result.pages.map(page => page.id)
    }
  } catch (error) {
    console.error('加载角色页面权限失败:', error)
  }
}

// 提交保存
const handleSubmit = async () => {
  if (!props.role) return
  
  try {
    const success = await updateRolePages(props.role.id, selectedPageIds.value)
    if (success) {
      emit('success')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('保存角色页面权限失败:', error)
  }
}

// 关闭对话框
const handleClose = () => {
  selectedPageIds.value = []
}
</script>

<style scoped>
.permission-container {
  max-height: 500px;
  overflow-y: auto;
}

.permission-header {
  margin-bottom: var(--text-2xl);
}

.permission-group {
  margin-bottom: var(--text-3xl);
}

.group-title {
  margin: 0 0 var(--text-sm) 0;
  padding: var(--spacing-sm) var(--text-sm);
  background-color: var(--bg-hover);
  border-left: var(--spacing-xs) solid var(--primary-color);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);

.permission-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--text-xs);
  padding: 0 var(--text-sm);
}

.permission-item {
  margin: 0;
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.permission-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.permission-code {
  font-size: var(--text-xs);
  color: var(--info-color);
  font-family: monospace;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-xs);
}
</style> 