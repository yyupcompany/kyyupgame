<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑家长' : '新增家长'"
    width="800px"
    :close-on-click-modal="false"
    @closed="() => { formData.value = getDefaultFormData(); if (formRef.value && typeof formRef.value.clearValidate === 'function') formRef.value.clearValidate(); }"
  >
    <el-form 
      :model="formData" 
      :rules="formRules" 
      ref="formRef" 
      label-width="120px"
      class="parent-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="家长姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入家长姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="formData.gender" placeholder="选择性别" class="full-width">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="微信号" prop="wechat">
            <el-input v-model="formData.wechat" placeholder="请输入微信号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关系" prop="relationship">
            <el-select v-model="formData.relationship" placeholder="选择与孩子关系" class="full-width">
              <el-option label="父亲" value="父亲" />
              <el-option label="母亲" value="母亲" />
              <el-option label="祖父" value="祖父" />
              <el-option label="祖母" value="祖母" />
              <el-option label="外祖父" value="外祖父" />
              <el-option label="外祖母" value="外祖母" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职业" prop="occupation">
            <el-input v-model="formData.occupation" placeholder="请输入职业" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家长状态" prop="status">
            <el-select v-model="formData.status" placeholder="选择状态" class="full-width">
              <el-option label="潜在家长" value="潜在家长" />
              <el-option label="在读家长" value="在读家长" />
              <el-option label="毕业家长" value="毕业家长" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="家庭地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入家庭地址" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="紧急联系人" prop="emergencyContact">
            <el-input v-model="formData.emergencyContact" placeholder="请输入紧急联系人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="紧急联系电话" prop="emergencyPhone">
            <el-input v-model="formData.emergencyPhone" placeholder="请输入紧急联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注信息" prop="notes">
        <el-input 
          v-model="formData.notes" 
          type="textarea" 
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="注册日期" prop="registerDate">
            <el-date-picker
              v-model="formData.registerDate"
              type="date"
              placeholder="选择注册日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否主要联系人" prop="isPrimary">
            <el-switch v-model="formData.isPrimary" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// ===== 函数定义区域 - 必须在最顶部 =====

function getDefaultFormData(data?: any) {
  return {
    name: data?.name || '',
    gender: data?.gender || '',
    phone: data?.phone || '',
    wechat: data?.wechat || '',
    relationship: data?.relationship || '',
    occupation: data?.occupation || '',
    email: data?.email || '',
    status: data?.status || '潜在家长',
    address: data?.address || '',
    emergencyContact: data?.emergencyContact || '',
    emergencyPhone: data?.emergencyPhone || '',
    notes: data?.notes || '',
    registerDate: data?.registerDate || '',
    isPrimary: data?.isPrimary || false
  }
}

// resetForm函数 - 为了测试兼容性保留
const resetForm = () => {
  formData.value = getDefaultFormData()
  nextTick(() => {
    if (formRef.value && typeof formRef.value.clearValidate === 'function') {
      formRef.value.clearValidate()
    }
  })
}

function initFormData(data?: any) {
  if (!isComponentMounted.value) {
    console.log('ParentEditDialog: 组件未挂载，跳过initFormData')
    return
  }
  formData.value = getDefaultFormData(data)
  nextTick(() => {
    // 安全检查：确保clearValidate方法存在
    if (formRef.value && typeof formRef.value.clearValidate === 'function') {
      formRef.value.clearValidate()
    }
  })
}

// 处理保存
async function handleSave() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    // 发送保存事件
    emit('save', formData.value)

    // 关闭弹窗
    dialogVisible.value = false

    ElMessage.success(isEdit.value ? '家长信息更新成功' : '家长信息创建成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 处理取消
function handleCancel() {
  dialogVisible.value = false
}



// ===== 组件属性和响应式变量区域 =====

// 组件属性
interface Props {
  modelValue: boolean
  parentData?: any
}

const props = withDefaults(defineProps<Props>(), {})

// 组件事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}>()

// 表单引用
const formRef = ref<FormInstance>()
const saving = ref(false)

// 组件初始化状态
const isComponentMounted = ref(false)

// 表单数据
const formData = ref({
  name: '',
  gender: '',
  phone: '',
  wechat: '',
  relationship: '',
  occupation: '',
  email: '',
  status: '潜在家长',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  registerDate: '',
  isPrimary: false
})

// 定义所有函数在最顶部，避免任何提升问题


// 弹窗可见性
const dialogVisible = computed({
  get: () => {
    console.log('ParentEditDialog 弹窗状态 get:', props.modelValue)
    return props.modelValue
  },
  set: (value) => {
    console.log('ParentEditDialog 弹窗状态 set:', value)
    emit('update:modelValue', value)
  }
})

// 是否编辑模式
const isEdit = computed(() => !!props.parentData?.id)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择与孩子关系', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择家长状态', trigger: 'change' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  emergencyPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的紧急联系电话', trigger: 'blur' }
  ]
}



// 监听家长数据变化 - 添加immediate: false确保不会在初始化时立即执行
watch(() => props.parentData, (newData) => {
  if (isComponentMounted.value) {
    if (newData) {
      initFormData(newData)
    } else {
      // 直接重置表单，避免函数调用时机问题
      formData.value = getDefaultFormData()
      if (formRef.value && typeof formRef.value.clearValidate === 'function') {
        formRef.value.clearValidate()
      }
    }
  }
}, { immediate: false })

// 监听弹窗开启，初始化表单 - 添加immediate: false确保不会在初始化时立即执行
watch(() => props.modelValue, (isVisible) => {
  if (isVisible && isComponentMounted.value) {
    // 弹窗打开时初始化表单
    nextTick(() => {
      if (props.parentData) {
        initFormData(props.parentData)
      } else {
        // 直接重置表单，避免函数调用时机问题
        formData.value = getDefaultFormData()
        if (formRef.value && typeof formRef.value.clearValidate === 'function') {
          formRef.value.clearValidate()
        }
      }
    })
  }
}, { immediate: false })

// 组件挂载完成
onMounted(() => {
  console.log('ParentEditDialog: 组件挂载完成')
  isComponentMounted.value = true

  // 延迟初始化，确保DOM完全就绪
  nextTick(() => {
    console.log('ParentEditDialog: 开始初始化表单数据')
    if (props.parentData) {
      console.log('ParentEditDialog: 使用props数据初始化表单')
      initFormData(props.parentData)
    } else {
      console.log('ParentEditDialog: 重置表单为默认值')
      // 直接重置表单，避免函数调用时机问题
      formData.value = getDefaultFormData()
      if (formRef.value && typeof formRef.value.clearValidate === 'function') {
        formRef.value.clearValidate()
      }
    }
  })
})

// 暴露方法给测试使用
defineExpose({
  resetForm,
  formRef,
  formData
})

</script>

<style scoped>
.parent-form {
  padding: 0 var(--spacing-xl);
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: var(--spacing-xl);
}

.full-width {
  width: 100%;
}
</style>