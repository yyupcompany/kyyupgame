<template>
  <van-action-sheet
    v-model:show="visible"
    title="选择您的角色"
    :closeable="false"
    :close-on-click-overlay="false"
    class="role-selection-sheet"
  >
    <div class="sheet-content">
      <!-- 欢迎信息 -->
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
        <template v-if="selectedRole === 'teacher' || selectedRole === 'parent'">
          <van-form ref="formRef" @submit="handleSubmit">
            <van-field
              v-model="formData.kindergartenName"
              is-link
              readonly
              label="幼儿园"
              placeholder="请选择幼儿园"
              :rules="[{ required: true, message: '请选择幼儿园' }]"
              @click="showKindergartenPicker = true"
            />
            <van-field
              v-model="formData.className"
              is-link
              readonly
              label="班级"
              placeholder="请选择班级"
              :rules="[{ required: true, message: '请选择班级' }]"
              :disabled="!formData.kindergartenId"
              @click="formData.kindergartenId && (showClassPicker = true)"
            />
            <template v-if="selectedRole === 'teacher'">
              <van-field v-model="formData.teacherTitle" label="职称" placeholder="如：主班教师" />
            </template>
            <template v-if="selectedRole === 'parent'">
              <van-field
                v-model="formData.childName"
                label="孩子姓名"
                placeholder="请输入孩子姓名"
                :rules="[{ required: true, message: '请输入孩子姓名' }]"
              />
              <van-field
                v-model="formData.childRelationName"
                is-link
                readonly
                label="与孩子关系"
                placeholder="请选择关系"
                @click="showRelationPicker = true"
              />
            </template>
          </van-form>
        </template>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button block plain @click="handleCancel">取消</van-button>
        <van-button block type="primary" :loading="loading" :disabled="!selectedRole" @click="handleSubmit">
          完成注册
        </van-button>
      </div>
    </div>

    <!-- 幼儿园选择器 -->
    <van-popup v-model:show="showKindergartenPicker" position="bottom" round>
      <van-picker
        :columns="kindergartenColumns"
        @confirm="onKindergartenConfirm"
        @cancel="showKindergartenPicker = false"
      />
    </van-popup>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom" round>
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 关系选择器 -->
    <van-popup v-model:show="showRelationPicker" position="bottom" round>
      <van-picker
        :columns="relationColumns"
        @confirm="onRelationConfirm"
        @cancel="showRelationPicker = false"
      />
    </van-popup>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { showToast } from 'vant'
import type { FormInstance } from 'vant'
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

// 选择器状态
const showKindergartenPicker = ref(false)
const showClassPicker = ref(false)
const showRelationPicker = ref(false)

// 数据
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
  kindergartenName: '',
  classId: null as number | null,
  className: '',
  teacherTitle: '',
  childName: '',
  childRelation: 'parent',
  childRelationName: ''
})

// 选择器列数据
const kindergartenColumns = computed(() =>
  kindergartens.value.map(k => ({ text: k.name, value: k.id }))
)

const classColumns = computed(() =>
  classes.value.map(c => ({ text: c.name, value: c.id }))
)

const relationColumns = [
  { text: '父亲', value: 'father' },
  { text: '母亲', value: 'mother' },
  { text: '爷爷', value: 'grandfather' },
  { text: '奶奶', value: 'grandmother' },
  { text: '其他', value: 'other' }
]

// 选择角色
const selectRole = (roleCode: string) => {
  selectedRole.value = roleCode
  formData.value = {
    kindergartenId: null,
    kindergartenName: '',
    classId: null,
    className: '',
    teacherTitle: '',
    childName: '',
    childRelation: 'parent',
    childRelationName: ''
  }
}

// 幼儿园选择确认
const onKindergartenConfirm = async ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.kindergartenId = selected.value
  formData.value.kindergartenName = selected.text
  formData.value.classId = null
  formData.value.className = ''
  showKindergartenPicker.value = false

  // 加载班级
  try {
    const res = await kindergartenApi.getKindergartenClasses(selected.value)
    classes.value = res.data?.items || res.data || []
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

// 班级选择确认
const onClassConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.classId = selected.value
  formData.value.className = selected.text
  showClassPicker.value = false
}

// 关系选择确认
const onRelationConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.childRelation = selected.value
  formData.value.childRelationName = selected.text
  showRelationPicker.value = false
}

// 加载幼儿园列表
const loadKindergartens = async () => {
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
    showToast('请选择角色')
    return
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

    showToast({ type: 'success', message: '注册成功！' })
    emit('success')
    visible.value = false
  } catch (error: any) {
    showToast({ type: 'fail', message: error.message || '注册失败' })
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadKindergartens()
})

// 监听显示状态
watch(visible, (val) => {
  if (val) {
    selectedRole.value = ''
    loadKindergartens()
  }
})
</script>

<style scoped lang="scss">
.role-selection-sheet {
  .sheet-content {
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 20px;

    .welcome-icon {
      font-size: 40px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 18px;
      color: #323233;
      margin-bottom: 6px;
    }

    p {
      color: #969799;
      font-size: 13px;
    }
  }

  .role-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;

    .role-card {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 2px solid #ebedf0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &.selected {
        border-color: #1989fa;
        background: #ecf5ff;
      }

      .role-icon {
        font-size: 32px;
        margin-right: 12px;
      }

      .role-info {
        flex: 1;

        h4 {
          font-size: 15px;
          color: #323233;
          margin-bottom: 4px;
        }

        p {
          font-size: 12px;
          color: #969799;
        }
      }

      .role-check {
        width: 22px;
        height: 22px;
        background: #1989fa;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
  }

  .role-form {
    background: #f7f8fa;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
}
</style>

