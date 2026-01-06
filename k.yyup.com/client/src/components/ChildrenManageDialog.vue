<template>
  <el-dialog
    v-model="visible"
    title="孩子管理"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="parent" class="children-manage">
      <div class="parent-info">
        <h3>家长信息</h3>
        <p><strong>姓名：</strong>{{ parent.name }}</p>
        <p><strong>电话：</strong>{{ parent.phone }}</p>
      </div>

      <div class="children-section">
        <div class="section-header">
          <h3>关联的孩子</h3>
          <el-button type="primary" @click="handleAddChild">
            <UnifiedIcon name="Plus" />
            添加孩子
          </el-button>
        </div>

        <div class="data-table-container">
          <div class="table-wrapper">
            <el-table :data="childrenList" stripe>
            <el-table-column label="孩子姓名" prop="name" width="120" />
            <el-table-column label="性别" prop="gender" width="80">
              <template #default="{ row }">
                <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'" size="small">
                  {{ row.gender === 'MALE' ? '男' : '女' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="年龄" prop="age" width="80" />
            <el-table-column label="关系" prop="relationship" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getRelationshipText(row.relationship) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属班级" prop="className" width="120" />
            <el-table-column label="状态" prop="status" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="editChild(row)">编辑</el-button>
                <el-button link type="danger" @click="removeChild(row)">移除</el-button>
              </template>
            </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 孩子编辑对话框 -->
    <el-dialog
      v-model="childDialogVisible"
      :title="editingChild ? '编辑孩子信息' : '添加孩子'"
      width="500px"
      append-to-body
    >
      <el-form :model="childForm" :rules="childRules" ref="childFormRef" label-width="100px">
        <el-form-item label="孩子姓名" prop="name">
          <el-input v-model="childForm.name" placeholder="请输入孩子姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="childForm.gender" placeholder="选择性别" class="full-width">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="childForm.birthDate"
            type="date"
            placeholder="选择出生日期"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="关系" prop="relationship">
          <el-select v-model="childForm.relationship" placeholder="选择关系" class="full-width">
            <el-option label="父子" value="father" />
            <el-option label="母子" value="mother" />
            <el-option label="爷孙" value="grandfather" />
            <el-option label="奶孙" value="grandmother" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="childDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="childSaving" @click="saveChild">
            {{ editingChild ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">关闭</el-button>
        <el-button type="primary" @click="handleSave">保存更改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface Parent {
  id: number | string
  name: string
  phone: string
}

interface Child {
  id?: string
  name: string
  gender: 'MALE' | 'FEMALE'
  age?: number
  birthDate: string
  relationship: string
  className?: string
  status: string
}

interface Props {
  modelValue: boolean
  parent?: Parent | null
  children?: Child[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: { parentId: string | number; children: Child[] }): void
}

const props = withDefaults(defineProps<Props>(), {
  parent: null,
  children: () => []
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const childrenList = ref<Child[]>([])
const childDialogVisible = ref(false)
const childSaving = ref(false)
const editingChild = ref<Child | null>(null)
const childFormRef = ref<FormInstance>()

const childForm = ref({
  name: '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
  birthDate: '',
  relationship: 'father'
})

const childRules = {
  name: [
    { required: true, message: '请输入孩子姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  relationship: [
    { required: true, message: '请选择关系', trigger: 'change' }
  ]
}

// 监听children变化
watch(() => props.children, (newChildren) => {
  childrenList.value = [...(newChildren || [])]
}, { immediate: true })

const getRelationshipText = (relationship: string) => {
  const map: Record<string, string> = {
    father: '父子',
    mother: '母子',
    grandfather: '爷孙',
    grandmother: '奶孙',
    other: '其他'
  }
  return map[relationship] || relationship
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    graduated: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '在读',
    inactive: '暂停',
    graduated: '毕业'
  }
  return map[status] || status
}

const handleAddChild = () => {
  editingChild.value = null
  childForm.value = {
    name: '',
    gender: 'MALE',
    birthDate: '',
    relationship: 'father'
  }
  childDialogVisible.value = true
}

const editChild = (child: Child) => {
  editingChild.value = child
  childForm.value = {
    name: child.name,
    gender: child.gender,
    birthDate: child.birthDate,
    relationship: child.relationship
  }
  childDialogVisible.value = true
}

const saveChild = async () => {
  if (!childFormRef.value) return
  
  try {
    await childFormRef.value.validate()
    childSaving.value = true
    
    const childData: Child = {
      ...childForm.value,
      age: calculateAge(childForm.value.birthDate),
      status: 'active'
    }
    
    if (editingChild.value) {
      // 更新现有孩子
      const index = childrenList.value.findIndex(c => c.id === editingChild.value!.id)
      if (index > -1) {
        childrenList.value[index] = { ...editingChild.value, ...childData }
      }
    } else {
      // 添加新孩子
      childData.id = `child_${Date.now()}`
      childrenList.value.push(childData)
    }
    
    childDialogVisible.value = false
    ElMessage.success(editingChild.value ? '孩子信息更新成功' : '孩子添加成功')
  } catch (error) {
    console.error('保存孩子信息失败:', error)
  } finally {
    childSaving.value = false
  }
}

const removeChild = async (child: Child) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除孩子 ${child.name} 吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = childrenList.value.findIndex(c => c.id === child.id)
    if (index > -1) {
      childrenList.value.splice(index, 1)
      ElMessage.success('孩子移除成功')
    }
  } catch (error) {
    // 用户取消操作
  }
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const handleCancel = () => {
  visible.value = false
}

const handleSave = () => {
  if (props.parent) {
    emit('save', {
      parentId: props.parent.id,
      children: childrenList.value
    })
  }
}
</script>

<style scoped>
.children-manage {
  padding: var(--spacing-lg) 0;
}

.parent-info {
  margin-bottom: var(--spacing-8xl);
  padding: var(--spacing-4xl);
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
}

.parent-info h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--el-text-color-primary);
}

.parent-info p {
  margin: var(--spacing-base) 0;
  color: var(--el-text-color-regular);
}

.children-section {
  margin-top: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.section-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
.full-width {
  width: 100%;
}
</style>