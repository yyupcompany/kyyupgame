<template>
  <MobileSubPageLayout title="编辑文档" back-path="/mobile/centers/document-instance-list">
    <div class="document-edit-mobile">
      <van-loading v-if="loading" type="spinner" color="#1989fa" vertical>
        加载中...
      </van-loading>

      <div v-else class="edit-content">
        <!-- 文档信息 -->
        <van-cell-group inset class="info-section">
          <van-cell title="文档标题" :value="documentInfo.title" />
          <van-cell title="文档模板" :value="documentInfo.templateName" />
          <van-cell title="填写进度">
            <template #value>
              <div class="progress-cell">
                <span>{{ documentInfo.progress }}%</span>
                <van-progress :percentage="documentInfo.progress" :show-pivot="false" stroke-width="4" style="width: 80px; margin-left: 8px;" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 填写表单 -->
        <van-form @submit="onSubmit" ref="formRef">
          <!-- 基本信息部分 -->
          <van-cell-group inset title="基本信息" class="form-section">
            <van-field
              v-model="formData.childName"
              label="孩子姓名"
              placeholder="请输入孩子姓名"
              required
              :rules="[{ required: true, message: '请输入孩子姓名' }]"
            />
            <van-field
              v-model="formData.childGender"
              is-link
              readonly
              label="性别"
              placeholder="请选择性别"
              @click="showGenderPicker = true"
            />
            <van-field
              v-model="formData.birthDate"
              is-link
              readonly
              label="出生日期"
              placeholder="请选择出生日期"
              @click="showDatePicker = true"
            />
            <van-field
              v-model="formData.className"
              label="班级"
              placeholder="请输入班级"
            />
          </van-cell-group>

          <!-- 家长信息部分 -->
          <van-cell-group inset title="家长信息" class="form-section">
            <van-field
              v-model="formData.parentName"
              label="家长姓名"
              placeholder="请输入家长姓名"
              required
              :rules="[{ required: true, message: '请输入家长姓名' }]"
            />
            <van-field
              v-model="formData.parentPhone"
              type="tel"
              label="联系电话"
              placeholder="请输入联系电话"
              required
              :rules="[{ required: true, message: '请输入联系电话' }]"
            />
            <van-field
              v-model="formData.relation"
              is-link
              readonly
              label="与孩子关系"
              placeholder="请选择关系"
              @click="showRelationPicker = true"
            />
            <van-field
              v-model="formData.address"
              type="textarea"
              label="家庭住址"
              placeholder="请输入家庭住址"
              rows="2"
              autosize
            />
          </van-cell-group>

          <!-- 其他信息部分 -->
          <van-cell-group inset title="其他信息" class="form-section">
            <van-field
              v-model="formData.healthInfo"
              type="textarea"
              label="健康状况"
              placeholder="请填写孩子健康状况、过敏史等"
              rows="3"
              autosize
            />
            <van-field
              v-model="formData.emergencyContact"
              label="紧急联系人"
              placeholder="请输入紧急联系人"
            />
            <van-field
              v-model="formData.emergencyPhone"
              type="tel"
              label="紧急电话"
              placeholder="请输入紧急联系电话"
            />
            <van-field
              v-model="formData.notes"
              type="textarea"
              label="备注"
              placeholder="其他需要说明的信息"
              rows="2"
              autosize
            />
          </van-cell-group>

          <!-- 操作按钮 -->
          <div class="action-section">
            <van-button type="primary" block round native-type="submit">
              保存文档
            </van-button>
            <van-button block round class="action-btn" @click="handleSaveDraft">
              保存草稿
            </van-button>
            <van-button block round type="success" class="action-btn" @click="handleSubmit">
              提交审核
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 性别选择器 -->
      <van-popup v-model:show="showGenderPicker" position="bottom" round>
        <van-picker
          :columns="genderOptions"
          @confirm="onGenderConfirm"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom" round>
        <van-date-picker
          v-model="selectedDate"
          title="选择出生日期"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 关系选择器 -->
      <van-popup v-model:show="showRelationPicker" position="bottom" round>
        <van-picker
          :columns="relationOptions"
          @confirm="onRelationConfirm"
          @cancel="showRelationPicker = false"
        />
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const formRef = ref()

// 文档信息
const documentInfo = reactive({
  id: '',
  title: '学生信息登记表',
  templateName: '新生入学登记模板',
  progress: 45
})

// 表单数据
const formData = reactive({
  childName: '',
  childGender: '',
  birthDate: '',
  className: '',
  parentName: '',
  parentPhone: '',
  relation: '',
  address: '',
  healthInfo: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: ''
})

// 选择器状态
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showRelationPicker = ref(false)

// 选择器选项
const genderOptions = ['男', '女']
const relationOptions = ['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '其他']

// 日期选择器
const selectedDate = ref(['2020', '01', '01'])
const minDate = new Date(2015, 0, 1)
const maxDate = new Date()

// 模拟加载数据
const loadDocument = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟已有数据
    formData.childName = '张小明'
    formData.childGender = '男'
    formData.birthDate = '2020-05-15'
    formData.className = '小班一班'
    formData.parentName = '张三'
    formData.parentPhone = '13800138000'
    formData.relation = '父亲'
    loading.value = false
  }, 500)
}

// 性别确认
const onGenderConfirm = ({ selectedValues }: any) => {
  formData.childGender = selectedValues[0]
  showGenderPicker.value = false
}

// 日期确认
const onDateConfirm = ({ selectedValues }: any) => {
  formData.birthDate = selectedValues.join('-')
  showDatePicker.value = false
}

// 关系确认
const onRelationConfirm = ({ selectedValues }: any) => {
  formData.relation = selectedValues[0]
  showRelationPicker.value = false
}

// 提交表单
const onSubmit = () => {
  showSuccessToast('文档保存成功')
  setTimeout(() => {
    router.back()
  }, 1500)
}

// 保存草稿
const handleSaveDraft = () => {
  showToast('草稿已保存')
}

// 提交审核
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    showSuccessToast('已提交审核')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showToast('请填写必填信息')
  }
}

onMounted(() => {
  documentInfo.id = route.params.id as string || '1'
  loadDocument()
})
</script>

<style scoped lang="scss">
.document-edit-mobile {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.edit-content {
  padding: 12px 0;
}

.info-section {
  margin-bottom: 12px;

  .progress-cell {
    display: flex;
    align-items: center;
  }
}

.form-section {
  margin-bottom: 12px;
}

.action-section {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  margin-top: 0;
}

:deep(.van-cell-group__title) {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-left: 16px;
}

:deep(.van-field__label) {
  width: 90px;
}
</style>
