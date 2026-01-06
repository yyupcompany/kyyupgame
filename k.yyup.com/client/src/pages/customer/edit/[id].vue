<template>
  <div class="customer-edit">
    <div class="page-header">
      <h1>编辑客户</h1>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </div>
    </div>

    <div class="form-container" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <div class="form-section">
          <h3>基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入客户姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入电子邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户来源" prop="source">
                <el-select v-model="form.source" placeholder="请选择客户来源">
                  <el-option label="线上广告" value="online" />
                  <el-option label="朋友介绍" value="referral" />
                  <el-option label="线下活动" value="offline" />
                  <el-option label="电话咨询" value="phone" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择客户状态">
                  <el-option label="新客户" value="new" />
                  <el-option label="跟进中" value="following" />
                  <el-option label="已转化" value="converted" />
                  <el-option label="已流失" value="lost" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责教师" prop="teacherId">
                <el-select v-model="form.teacherId" placeholder="请选择负责教师" clearable>
                  <el-option 
                    v-for="teacher in teachers" 
                    :key="teacher.id" 
                    :label="teacher.name" 
                    :value="teacher.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注信息" prop="remark">
            <el-input 
              v-model="form.remark" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入备注信息" 
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { get, put } from '@/utils/request'
import { CUSTOMER_ENDPOINTS, TEACHER_ENDPOINTS } from '@/api/endpoints'

const router = useRouter()
const route = useRoute()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(true)
const submitting = ref(false)
const teachers = ref([])
const customerId = route.params.id as string

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  email: '',
  source: '',
  status: 'new',
  teacherId: null,
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择客户来源', trigger: 'change' }
  ]
}

// 加载客户详情
const loadCustomerDetail = async () => {
  try {
    const response = await get(CUSTOMER_ENDPOINTS.POOL_BY_ID(customerId))
    if (response.success) {
      const data = response.data
      Object.assign(form, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        status: data.status,
        teacherId: data.teacherId,
        remark: data.remark
      })
    } else {
      ElMessage.error('客户不存在或已被删除')
      router.back()
    }
  } catch (error) {
    console.error('加载客户详情失败:', error)
    ElMessage.error('加载客户详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    const response = await get(TEACHER_ENDPOINTS.LIST)
    if (response.success) {
      teachers.value = response.data.map((teacher: any) => ({
        id: teacher.id,
        name: teacher.name || teacher.username || `教师${teacher.id}`
      }))
    }
  } catch (error) {
    console.error('加载教师列表失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const response = await put(CUSTOMER_ENDPOINTS.POOL_BY_ID(customerId), form)
    
    if (response.success) {
      ElMessage.success('客户更新成功')
      router.push('/centers/customer-pool?tab=customers')
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error: any) {
    console.error('更新客户失败:', error)
    ElMessage.error('更新失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadTeachers(),
    loadCustomerDetail()
  ])
})
</script>

<style scoped>
.customer-edit {
  padding: var(--text-2xl);
  background-color: var(--bg-secondary);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding: 0 var(--text-2xl);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: var(--text-sm);
}

.form-container {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.form-section {
  margin-bottom: var(--text-2xl);
}

.form-section h3 {
  margin: 0 0 var(--text-2xl) 0;
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-primary);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
  padding-bottom: var(--spacing-2xl);
}

.el-form-item {
  margin-bottom: var(--text-2xl);
}
</style>