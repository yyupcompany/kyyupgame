<template>
  <el-dialog
    v-model="visible"
    title="创建营销活动"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="活动名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入营销活动名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="活动类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择活动类型"
          class="full-width"
        >
          <el-option label="招生推广" value="enrollment" />
          <el-option label="品牌宣传" value="branding" />
          <el-option label="优惠促销" value="promotion" />
          <el-option label="开放日活动" value="open-day" />
          <el-option label="节日活动" value="holiday" />
          <el-option label="线上推广" value="online" />
        </el-select>
      </el-form-item>

      <el-form-item label="活动时间" prop="dateRange">
        <el-date-picker
          v-model="form.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="full-width"
        />
      </el-form-item>

      <el-form-item label="目标受众" prop="targetAudience">
        <el-checkbox-group v-model="form.targetAudience">
          <el-checkbox value="prospective">潜在家长</el-checkbox>
          <el-checkbox value="current">在校家长</el-checkbox>
          <el-checkbox value="alumni">毕业生家长</el-checkbox>
          <el-checkbox value="community">社区居民</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="推广渠道" prop="channels">
        <el-checkbox-group v-model="form.channels">
          <el-checkbox label="wechat">微信朋友圈</el-checkbox>
          <el-checkbox label="xiaohongshu">小红书</el-checkbox>
          <el-checkbox label="douyin">抖音</el-checkbox>
          <el-checkbox label="baidu">百度推广</el-checkbox>
          <el-checkbox label="offline">线下传单</el-checkbox>
          <el-checkbox label="community">社区合作</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="预算金额" prop="budget">
        <el-input-number
          v-model="form.budget"
          :min="0"
          :max="1000000"
          :step="100"
          placeholder="请输入预算金额"
          class="budget-input"
        />
        <span class="unit-label">元</span>
      </el-form-item>

      <el-form-item label="优惠内容" prop="discount">
        <el-input
          v-model="form.discount"
          placeholder="例如：报名立减500元，赠送书包文具"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="活动目标" prop="goals">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input-number
              v-model="form.goals.participants"
              :min="0"
              placeholder="目标参与人数"
              class="full-width"
            />
            <div class="goal-label">目标参与人数</div>
          </el-col>
          <el-col :span="8">
            <el-input-number
              v-model="form.goals.conversion"
              :min="0"
              :max="100"
              placeholder="目标转化率"
              class="full-width"
            />
            <div class="goal-label">目标转化率(%)</div>
          </el-col>
          <el-col :span="8">
            <el-input-number
              v-model="form.goals.enrollment"
              :min="0"
              placeholder="目标招生数"
              class="full-width"
            />
            <div class="goal-label">目标招生数</div>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="活动描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入活动详细描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="立即发布" prop="publishNow">
        <el-switch
          v-model="form.publishNow"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ form.publishNow ? '创建并发布' : '保存草稿' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  type: '',
  dateRange: [] as string[],
  targetAudience: [] as string[],
  channels: [] as string[],
  budget: 0,
  discount: '',
  goals: {
    participants: 0,
    conversion: 0,
    enrollment: 0
  },
  description: '',
  publishNow: false
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (value && value.length === 2) {
          const start = new Date(value[0])
          const end = new Date(value[1])
          if (start >= end) {
            callback(new Error('结束时间必须大于开始时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  targetAudience: [
    { required: true, message: '请选择目标受众', trigger: 'change', type: 'array', min: 1 }
  ],
  channels: [
    { required: true, message: '请选择推广渠道', trigger: 'change', type: 'array', min: 1 }
  ],
  budget: [
    { required: true, message: '请输入预算金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '预算金额不能小于0', trigger: 'blur' }
  ]
}

// 监听props变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 重置表单
const resetForm = () => {
  form.name = ''
  form.type = ''
  form.dateRange = []
  form.targetAudience = []
  form.channels = []
  form.budget = 0
  form.discount = ''
  form.goals = {
    participants: 0,
    conversion: 0,
    enrollment: 0
  }
  form.description = ''
  form.publishNow = false
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleClose = () => {
  resetForm()
}

// 取消
const handleCancel = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const status = form.publishNow ? '已发布' : '草稿'
        ElMessage.success(`营销活动${form.publishNow ? '创建并发布' : '保存'}成功`)
        
        emit('success', { 
          ...form,
          status,
          createTime: new Date().toISOString()
        })
        
        visible.value = false
        resetForm()
      } catch (error) {
        ElMessage.error('创建失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-lg);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

:deep(.el-checkbox) {
  margin-right: 0;
}

.full-width {
  width: 100%;
}

.budget-input {
  max-width: 200px;
  width: 100%;
}

.unit-label {
  margin-left: var(--spacing-lg);
  color: var(--text-regular);
}

.goal-label {
  text-align: center;
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--text-xs);
}
</style>