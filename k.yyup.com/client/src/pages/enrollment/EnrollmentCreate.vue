<template>
  <div class="enrollment-create-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <UnifiedIcon name="Plus" />
          创建招生申请
        </h1>
        <p class="page-description">填写学生和家长信息，创建新的招生申请记录</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleCancel">
          <UnifiedIcon name="ArrowLeft" />
          返回列表
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading.submit">
          <UnifiedIcon name="Check" />
          提交申请
        </el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="enrollment-form"
      >
        <!-- 学生信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <span>学生信息</span>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="学生姓名" prop="studentName">
                <el-input
                  v-model="formData.studentName"
                  placeholder="请输入学生姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="formData.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthDate">
                <el-date-picker
                  v-model="formData.birthDate"
                  type="date"
                  placeholder="请选择出生日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年龄" prop="age">
                <el-input-number
                  v-model="formData.age"
                  :min="2"
                  :max="8"
                  placeholder="年龄"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="意向班级" prop="preferredClassId">
                <el-select
                  v-model="formData.preferredClassId"
                  placeholder="请选择意向班级"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="cls in classList"
                    :key="cls.id"
                    :label="cls.name"
                    :value="cls.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="招生计划" prop="planId">
                <el-select
                  v-model="formData.planId"
                  placeholder="请选择招生计划"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="plan in planList"
                    :key="plan.id"
                    :label="plan.title"
                    :value="plan.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 家长信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <span>家长信息</span>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="家长姓名" prop="parentName">
                <el-input
                  v-model="formData.parentName"
                  placeholder="请输入家长姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="parentPhone">
                <el-input
                  v-model="formData.parentPhone"
                  placeholder="请输入联系电话"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="与学生关系" prop="relationship">
                <el-select
                  v-model="formData.relationship"
                  placeholder="请选择关系"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="父亲" value="father" />
                  <el-option label="母亲" value="mother" />
                  <el-option label="爷爷" value="grandfather" />
                  <el-option label="奶奶" value="grandmother" />
                  <el-option label="外公" value="maternal_grandfather" />
                  <el-option label="外婆" value="maternal_grandmother" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="家庭地址" prop="address">
                <el-input
                  v-model="formData.address"
                  placeholder="请输入家庭地址"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 申请信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <span>申请信息</span>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="申请来源" prop="applicationSource">
                <el-select
                  v-model="formData.applicationSource"
                  placeholder="请选择申请来源"
                  style="width: 100%"
                >
                  <el-option label="官网申请" value="web" />
                  <el-option label="电话咨询" value="phone" />
                  <el-option label="现场咨询" value="onsite" />
                  <el-option label="朋友推荐" value="referral" />
                  <el-option label="其他渠道" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请日期" prop="applyDate">
                <el-date-picker
                  v-model="formData.applyDate"
                  type="date"
                  placeholder="请选择申请日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注信息" prop="notes">
            <el-input
              v-model="formData.notes"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息（选填）"
            />
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, Check, User, UserFilled, Document } from '@element-plus/icons-vue'
import { enrollmentApi } from '@/api/modules/enrollment'

// 路由
const router = useRouter()

// 表单引用
const formRef = ref()

// 加载状态
const loading = reactive({
  submit: false,
  data: false
})

// 表单数据
const formData = reactive({
  studentName: '',
  gender: 'male',
  birthDate: '',
  age: 3,
  preferredClassId: null,
  planId: null,
  parentName: '',
  parentPhone: '',
  relationship: '',
  address: '',
  applicationSource: 'web',
  applyDate: new Date().toISOString().split('T')[0],
  notes: ''
})

// 表单验证规则
const formRules = {
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 2, max: 8, message: '年龄必须在 2-8 岁之间', trigger: 'blur' }
  ],
  planId: [
    { required: true, message: '请选择招生计划', trigger: 'change' }
  ],
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  parentPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择与学生关系', trigger: 'change' }
  ],
  applicationSource: [
    { required: true, message: '请选择申请来源', trigger: 'change' }
  ],
  applyDate: [
    { required: true, message: '请选择申请日期', trigger: 'change' }
  ]
}

// 班级列表
const classList = ref([
  { id: 1, name: '小班A' },
  { id: 2, name: '小班B' },
  { id: 3, name: '中班A' },
  { id: 4, name: '中班B' },
  { id: 5, name: '大班A' },
  { id: 6, name: '大班B' }
])

// 招生计划列表
const planList = ref([
  { id: 1, title: '2025年春季招生计划' },
  { id: 2, title: '2025年秋季招生计划' },
  { id: 3, title: '2025年插班生招生计划' }
])

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.submit = true
    
    // 提交数据
    const response = await enrollmentApi.createApplication({
      studentName: formData.studentName,
      gender: formData.gender,
      birthDate: formData.birthDate,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      planId: formData.planId,
      preferredClassId: formData.preferredClassId,
      relationship: formData.relationship,
      address: formData.address,
      applicationSource: formData.applicationSource,
      applyDate: formData.applyDate,
      notes: formData.notes
    })
    
    if (response.success) {
      ElMessage.success('招生申请创建成功！')
      router.push('/enrollment')
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请检查表单信息')
  } finally {
    loading.submit = false
  }
}

// 取消操作
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消创建吗？未保存的数据将丢失。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }
    )
    router.push('/enrollment')
  } catch {
    // 用户取消
  }
}

// 页面初始化
onMounted(() => {
  // 可以在这里加载班级列表和招生计划列表
})
</script>

<style scoped lang="scss">
.enrollment-create-container {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-3xl);
  padding: var(--text-3xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

  .header-content {
    .page-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    .page-description {
      margin: 0;
      color: var(--text-regular);
      font-size: var(--text-base);
    }
  }

  .header-actions {
    display: flex;
    gap: var(--text-sm);
  }
}

.form-container {
  .enrollment-form {
    .form-section {
      margin-bottom: var(--text-3xl);
      border: var(--border-width-base) solid var(--border-color-light);

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

:deep(.el-card__header) {
  background: var(--bg-gray-light);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-regular);
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-md);
}

:deep(.el-textarea__inner) {
  border-radius: var(--radius-md);
}
</style>
