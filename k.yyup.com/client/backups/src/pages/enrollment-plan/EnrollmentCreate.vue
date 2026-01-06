<template>
  <div class="enrollment-create-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="icon-user-plus"></i>
        创建招生申请
      </h1>
      <p class="page-description">填写学生基本信息，创建新的招生申请</p>
    </div>

    <div class="form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="enrollment-form"
      >
        <el-card class="form-section">
          <template #header>
            <span class="section-title">学生基本信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学生姓名" prop="studentName">
                <el-input
                  v-model="form.studentName"
                  placeholder="请输入学生姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthDate">
                <el-date-picker
                  v-model="form.birthDate"
                  type="date"
                  placeholder="请选择出生日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCard">
                <el-input
                  v-model="form.idCard"
                  placeholder="请输入身份证号"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请班级" prop="classType">
                <el-select
                  v-model="form.classType"
                  placeholder="请选择申请班级"
                  style="width: 100%"
                >
                  <el-option label="小班" value="small" />
                  <el-option label="中班" value="medium" />
                  <el-option label="大班" value="large" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="入学时间" prop="enrollmentDate">
                <el-date-picker
                  v-model="form.enrollmentDate"
                  type="date"
                  placeholder="请选择入学时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="form-section">
          <template #header>
            <span class="section-title">家长信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="家长姓名" prop="parentName">
                <el-input
                  v-model="form.parentName"
                  placeholder="请输入家长姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入联系电话"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="关系" prop="relationship">
                <el-select
                  v-model="form.relationship"
                  placeholder="请选择与学生关系"
                  style="width: 100%"
                >
                  <el-option label="父亲" value="father" />
                  <el-option label="母亲" value="mother" />
                  <el-option label="爷爷" value="grandfather" />
                  <el-option label="奶奶" value="grandmother" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱地址"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="家庭地址" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              :rows="3"
              placeholder="请输入家庭地址"
            />
          </el-form-item>
        </el-card>

        <el-card class="form-section">
          <template #header>
            <span class="section-title">其他信息</span>
          </template>
          
          <el-form-item label="特殊需求" prop="specialNeeds">
            <el-input
              v-model="form.specialNeeds"
              type="textarea"
              :rows="3"
              placeholder="请描述学生的特殊需求（如过敏、疾病等）"
            />
          </el-form-item>

          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="3"
              placeholder="其他需要说明的信息"
            />
          </el-form-item>
        </el-card>

        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            提交申请
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const form = reactive({
  studentName: '',
  gender: '',
  birthDate: '',
  idCard: '',
  classType: '',
  enrollmentDate: '',
  parentName: '',
  phone: '',
  relationship: '',
  email: '',
  address: '',
  specialNeeds: '',
  remarks: ''
})

// 表单验证规则
const rules: FormRules = {
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  classType: [
    { required: true, message: '请选择申请班级', trigger: 'change' }
  ],
  enrollmentDate: [
    { required: true, message: '请选择入学时间', trigger: 'change' }
  ],
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择与学生关系', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 这里应该调用API提交数据
    // await api.createEnrollment(form)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('招生申请创建成功！')
    
    // 询问是否继续创建
    const result = await ElMessageBox.confirm(
      '申请已成功创建，是否继续创建新的申请？',
      '创建成功',
      {
        confirmButtonText: '继续创建',
        cancelButtonText: '返回列表',
        type: 'success'
      }
    )
    
    if (result === 'confirm') {
      resetForm()
    } else {
      router.push('/application')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('创建失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.enrollment-create-container {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--text-3xl);
  text-align: center;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--text-sm);
}

.page-title .icon-user-plus {
  font-size: var(--spacing-3xl);
  color: var(--primary-color);
}

.page-description {
  font-size: var(--text-lg);
  color: var(--text-regular);
  margin: 0;
}

.form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.enrollment-form {
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.form-section {
  margin-bottom: var(--text-2xl);
  border: none;
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: #2c3e50;
}

.form-actions {
  text-align: center;
  padding: var(--spacing-8xl) 0;
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
}

.form-actions .el-button {
  min-width: 120px;
  height: var(--button-height-lg);
  font-size: var(--text-lg);
}

:deep(.el-card__header) {
  background: var(--bg-gray-light);
  border-bottom: var(--border-width-base) solid #e9ecef;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-input__inner) {
  border-radius: var(--radius-md);
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  border-radius: var(--radius-md);
}
</style>
