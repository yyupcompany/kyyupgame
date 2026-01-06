<template>
  <el-dialog
    v-model="visible"
    title="选择您的角色"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="role-selection-modal"
  >
    <div class="modal-content">
      <div class="welcome-section">
        <div class="welcome-icon">👋</div>
        <h3>欢迎来到 {{ tenantName }}</h3>
        <p>您的账号尚未在本园所注册，请选择您的角色完成注册</p>
      </div>

      <!-- 角色选择卡片 -->
      <div class="role-cards">
        <div
          v-for="role in availableRoles"
          :key="role.code"
          class="role-card"
          :class="{ selected: selectedRole === role.code }"
          @click="selectRole(role.code)"
        >
          <div class="role-icon">{{ role.icon }}</div>
          <div class="role-info">
            <h4>{{ role.name }}</h4>
            <p>{{ role.description }}</p>
          </div>
          <div class="role-check" v-if="selectedRole === role.code">✓</div>
        </div>
      </div>

      <!-- 角色相关表单 -->
      <div v-if="selectedRole" class="role-form">
        <!-- 教师/家长需要选择幼儿园和班级 -->
        <template v-if="selectedRole === 'teacher' || selectedRole === 'parent'">
          <el-form :model="formData" label-width="100px" :rules="formRules" ref="formRef">
            <el-form-item label="幼儿园" prop="kindergartenId">
              <el-select v-model="formData.kindergartenId" placeholder="请选择幼儿园" @change="onKindergartenChange">
                <el-option
                  v-for="k in kindergartens"
                  :key="k.id"
                  :label="k.name"
                  :value="k.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="班级" prop="classId">
              <el-select v-model="formData.classId" placeholder="请选择班级" :disabled="!formData.kindergartenId">
                <el-option
                  v-for="c in classes"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
            <!-- 教师特有字段 -->
            <template v-if="selectedRole === 'teacher'">
              <el-form-item label="职称">
                <el-input v-model="formData.teacherTitle" placeholder="如：主班教师、配班教师" />
              </el-form-item>
            </template>
            <!-- 家长特有字段 -->
            <template v-if="selectedRole === 'parent'">
              <el-form-item label="孩子姓名" prop="childName">
                <el-input v-model="formData.childName" placeholder="请输入孩子姓名" />
              </el-form-item>
              <el-form-item label="与孩子关系">
                <el-select v-model="formData.childRelation" placeholder="请选择关系">
                  <el-option label="父亲" value="father" />
                  <el-option label="母亲" value="mother" />
                  <el-option label="爷爷" value="grandfather" />
                  <el-option label="奶奶" value="grandmother" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading" :disabled="!selectedRole">
          完成注册
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'
import { kindergartenApi } from '@/api/modules/kindergarten'

const props = defineProps<{
  modelValue: boolean
  tenantName: string
  availableRolesCodes?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const selectedRole = ref<string>('')
const kindergartens = ref<any[]>([])
const classes = ref<any[]>([])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const availableRoles = computed(() => {
  const allRoles = [
    { code: 'principal', name: '园长', icon: '👨‍💼', description: '管理园所的全部事务' },
    { code: 'teacher', name: '教师', icon: '👩‍🏫', description: '负责班级教学和管理' },
    { code: 'parent', name: '家长', icon: '👨‍👩‍👧', description: '查看孩子的成长记录' }
  ]
  const codes = props.availableRolesCodes || ['principal', 'teacher', 'parent']
  return allRoles.filter(r => codes.includes(r.code))
})

const formData = ref({
  kindergartenId: null as number | null,
  classId: null as number | null,
  teacherTitle: '',
  childName: '',
  childRelation: 'parent'
})

const formRules: FormRules = {
  kindergartenId: [{ required: true, message: '请选择幼儿园', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  childName: [{ required: true, message: '请输入孩子姓名', trigger: 'blur' }]
}

// 选择角色
const selectRole = (roleCode: string) => {
  selectedRole.value = roleCode
  // 重置表单
  formData.value = {
    kindergartenId: null,
    classId: null,
    teacherTitle: '',
    childName: '',
    childRelation: 'parent'
  }
  
  // 选择角色后才加载幼儿园列表
  if (roleCode === 'teacher' || roleCode === 'parent') {
    loadKindergartens()
  }
}

// 幼儿园变化时加载班级
const onKindergartenChange = async (kindergartenId: number) => {
  formData.value.classId = null
  classes.value = []
  if (kindergartenId) {
    try {
      const res = await kindergartenApi.getKindergartenClasses(kindergartenId)
      classes.value = res.data?.items || res.data || []
    } catch (error) {
      console.error('加载班级失败:', error)
    }
  }
}

// 加载幼儿园列表
const loadKindergartens = async () => {
  // 检查是否已登录，未登录时不请求数据
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('未登录，跳过加载幼儿园列表')
    return
  }
  
  try {
    const res = await kindergartenApi.getKindergartenList()
    kindergartens.value = res.data?.items || res.data || []
  } catch (error) {
    console.error('加载幼儿园失败:', error)
  }
}

// 取消
const handleCancel = () => {
  authStore.cancelRegistration()
  emit('cancel')
  visible.value = false
}

// 提交注册
const handleSubmit = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请选择角色')
    return
  }

  // 验证表单
  if (selectedRole.value === 'teacher' || selectedRole.value === 'parent') {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
  }

  loading.value = true
  try {
    await authStore.completeRegistration({
      role: selectedRole.value,
      kindergartenId: formData.value.kindergartenId || undefined,
      classId: formData.value.classId || undefined,
      teacherTitle: formData.value.teacherTitle || undefined,
      childName: formData.value.childName || undefined,
      childRelation: formData.value.childRelation || undefined
    })

    emit('success')
    visible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 初始化
// 移除onMounted自动加载，避免登录页循环请求
// onMounted(() => {
//   loadKindergartens()
// })

// 监听显示状态
watch(visible, (val) => {
  if (val) {
    selectedRole.value = ''
    // 移除自动加载，由用户手动选择角色后再加载
    // loadKindergartens()
  }
})
</script>

<style scoped lang="scss">
.role-selection-modal {
  .modal-content {
    padding: 0 20px;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 30px;

    .welcome-icon {
      font-size: var(--text-5xl);
      margin-bottom: 10px;
    }

    h3 {
      font-size: var(--text-xl);
      color: #303133;
      margin-bottom: 8px;
    }

    p {
      color: #909399;
      font-size: var(--text-sm);
    }
  }

  .role-cards {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: 24px;

    .role-card {
      flex: 1;
      padding: var(--spacing-lg);
      border: 2px solid #e4e7ed;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      &.selected {
        border-color: #409eff;
        background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
      }

      .role-icon {
        font-size: var(--text-4xl);
        margin-bottom: 12px;
      }

      .role-info {
        h4 {
          font-size: var(--text-base);
          color: #303133;
          margin-bottom: 6px;
        }

        p {
          font-size: var(--text-xs);
          color: #909399;
          line-height: 1.4;
        }
      }

      .role-check {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: #409eff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-sm);
      }
    }
  }

  .role-form {
    background: #f5f7fa;
    padding: var(--spacing-lg);
    border-radius: 8px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
  }
}
</style>

