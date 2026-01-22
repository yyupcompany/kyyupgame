<template>
  <MobileSubPageLayout title="编辑孩子信息" back-path="/mobile/parent-center">
    <div class="edit-child-container" v-loading="loading">
      <!-- 头像上传 -->
      <div class="avatar-section">
        <div class="avatar-upload" @click="handleAvatarClick">
          <van-image
            :src="formData.avatar || defaultAvatar"
            width="80"
            height="80"
            round
            class="avatar-image"
          >
            <template #error>
              <div class="avatar-placeholder">{{ formData.name?.charAt(0) || '孩' }}</div>
            </template>
          </van-image>
          <div class="avatar-overlay">
            <van-icon name="photograph" size="24" color="white" />
          </div>
        </div>
        <p class="avatar-tip">点击上传头像</p>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleAvatarChange"
        />
      </div>

      <!-- 基本信息表单 -->
      <van-form @submit="handleSubmit">
        <van-cell-group inset title="基本信息">
          <van-field
            v-model="formData.name"
            name="name"
            label="姓名"
            placeholder="请输入孩子姓名"
            :rules="[{ required: true, message: '请输入孩子姓名' }]"
            left-icon="contact"
          />

          <van-field
            v-model="formData.gender"
            name="gender"
            label="性别"
            placeholder="请选择性别"
            :rules="[{ required: true, message: '请选择性别' }]"
            left-icon="friends"
            readonly
            is-link
            @click="showGenderPicker = true"
          />

          <van-field
            v-model="formData.birthday"
            name="birthday"
            label="出生日期"
            placeholder="请选择出生日期"
            :rules="[{ required: true, message: '请选择出生日期' }]"
            left-icon="calendar"
            readonly
            is-link
            @click="showBirthdayPicker = true"
          />

          <van-field
            v-model="ageText"
            name="age"
            label="年龄"
            placeholder="系统自动计算"
            left-icon="label-o"
            readonly
          />
        </van-cell-group>

        <van-cell-group inset title="学校信息">
          <van-field
            v-model="formData.className"
            name="className"
            label="班级"
            placeholder="请选择班级"
            :rules="[{ required: true, message: '请选择班级' }]"
            left-icon="school"
            readonly
            is-link
            @click="showClassPicker = true"
          />

          <van-field
            v-model="formData.enrollmentDate"
            name="enrollmentDate"
            label="入园时间"
            placeholder="请选择入园时间"
            :rules="[{ required: true, message: '请选择入园时间' }]"
            left-icon="clock-o"
            readonly
            is-link
            @click="showEnrollmentDatePicker = true"
          />
        </van-cell-group>

        <van-cell-group inset title="健康信息">
          <van-field
            v-model="formData.bloodType"
            name="bloodType"
            label="血型"
            placeholder="请选择血型"
            left-icon="medal"
            readonly
            is-link
            @click="showBloodTypePicker = true"
          />

          <van-field
            v-model="formData.allergies"
            name="allergies"
            label="过敏史"
            placeholder="请输入过敏信息，如无请填'无'"
            left-icon="warning"
            type="textarea"
            rows="2"
            autosize
          />

          <van-field
            v-model="formData.medicalHistory"
            name="medicalHistory"
            label="病史"
            placeholder="请输入病史信息，如无请填'无'"
            left-icon="notes-o"
            type="textarea"
            rows="2"
            autosize
          />
        </van-cell-group>

        <van-cell-group inset title="紧急联系人">
          <van-field
            v-model="formData.emergencyContact"
            name="emergencyContact"
            label="联系人"
            placeholder="请输入紧急联系人姓名"
            left-icon="contact"
            :rules="[{ required: true, message: '请输入紧急联系人姓名' }]"
          />

          <van-field
            v-model="formData.emergencyPhone"
            name="emergencyPhone"
            label="联系电话"
            placeholder="请输入紧急联系电话"
            left-icon="phone"
            :rules="[
              { required: true, message: '请输入紧急联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]]"
          />

          <van-field
            v-model="formData.emergencyRelation"
            name="emergencyRelation"
            label="关系"
            placeholder="请选择与孩子的关系"
            left-icon="friends"
            readonly
            is-link
            @click="showRelationPicker = true"
          />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <van-button
            type="default"
            size="large"
            @click="handleCancel"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            native-type="submit"
            :loading="submitting"
          >
            保存
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 性别选择器 -->
    <van-picker
      v-model:show="showGenderPicker"
      :columns="genderColumns"
      @confirm="onGenderConfirm"
      @cancel="showGenderPicker = false"
    />

    <!-- 班级选择器 -->
    <van-picker
      v-model:show="showClassPicker"
      :columns="classColumns"
      @confirm="onClassConfirm"
      @cancel="showClassPicker = false"
    />

    <!-- 血型选择器 -->
    <van-picker
      v-model:show="showBloodTypePicker"
      :columns="bloodTypeColumns"
      @confirm="onBloodTypeConfirm"
      @cancel="showBloodTypePicker = false"
    />

    <!-- 关系选择器 -->
    <van-picker
      v-model:show="showRelationPicker"
      :columns="relationColumns"
      @confirm="onRelationConfirm"
      @cancel="showRelationPicker = false"
    />

    <!-- 出生日期选择器 -->
    <van-date-picker
      v-model="showBirthdayPicker"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="onBirthdayConfirm"
      @cancel="showBirthdayPicker = false"
    />

    <!-- 入园时间选择器 -->
    <van-date-picker
      v-model="showEnrollmentDatePicker"
      :min-date="enrollmentMinDate"
      :max-date="enrollmentMaxDate"
      @confirm="onEnrollmentDateConfirm"
      @cancel="showEnrollmentDatePicker = false"
    />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

interface ChildFormData {
  id?: number
  name: string
  gender: string
  birthday: string
  age: number
  className: string
  enrollmentDate: string
  avatar?: string
  bloodType: string
  allergies: string
  medicalHistory: string
  emergencyContact: string
  emergencyPhone: string
  emergencyRelation: string
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const avatarInput = ref<HTMLInputElement>()

// 表单数据
const formData = ref<ChildFormData>({
  name: '',
  gender: '',
  birthday: '',
  age: 0,
  className: '',
  enrollmentDate: '',
  avatar: '',
  bloodType: '',
  allergies: '无',
  medicalHistory: '无',
  emergencyContact: '',
  emergencyPhone: '',
  emergencyRelation: ''
})

// 选择器显示状态
const showGenderPicker = ref(false)
const showClassPicker = ref(false)
const showBloodTypePicker = ref(false)
const showRelationPicker = ref(false)
const showBirthdayPicker = ref(false)
const showEnrollmentDatePicker = ref(false)

// 选择器选项
const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

const classColumns = [
  { text: '小班-花朵', value: '小班-花朵' },
  { text: '小班-星星', value: '小班-星星' },
  { text: '小班-月亮', value: '小班-月亮' },
  { text: '中班-阳光', value: '中班-阳光' },
  { text: '中班-彩虹', value: '中班-彩虹' },
  { text: '中班-蓝天', value: '中班-蓝天' },
  { text: '大班-智慧', value: '大班-智慧' },
  { text: '大班-勇敢', value: '大班-勇敢' },
  { text: '大班-梦想', value: '大班-梦想' }
]

const bloodTypeColumns = [
  { text: 'A型', value: 'A' },
  { text: 'B型', value: 'B' },
  { text: 'O型', value: 'O' },
  { text: 'AB型', value: 'AB' },
  { text: '未知', value: '未知' }
]

const relationColumns = [
  { text: '父亲', value: '父亲' },
  { text: '母亲', value: '母亲' },
  { text: '爷爷', value: '爷爷' },
  { text: '奶奶', value: '奶奶' },
  { text: '外公', value: '外公' },
  { text: '外婆', value: '外婆' },
  { text: '其他', value: '其他' }
]

// 日期选择器配置
const minDate = new Date(2010, 0, 1)
const maxDate = new Date(2020, 11, 31)
const enrollmentMinDate = new Date(2015, 0, 1)
const enrollmentMaxDate = new Date()

// 默认头像
const defaultAvatar = '/src/assets/logo.png'

// 计算年龄
const ageText = computed(() => {
  if (!formData.value.birthday) return ''
  const birthday = new Date(formData.value.birthday)
  const today = new Date()
  const age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    return `${age - 1}岁`
  }
  return `${age}岁`
})

// 监听出生日期变化，自动计算年龄
const updateAge = () => {
  if (formData.value.birthday) {
    const birthday = new Date(formData.value.birthday)
    const today = new Date()
    let age = today.getFullYear() - birthday.getFullYear()
    const monthDiff = today.getMonth() - birthday.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--
    }

    formData.value.age = age
  }
}

// 处理头像点击
const handleAvatarClick = () => {
  avatarInput.value?.click()
}

// 处理头像选择
const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('头像大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.avatar = e.target?.result as string
      showToast('头像上传成功')
    }
    reader.readAsDataURL(file)
  }
}

// 选择器确认事件
const onGenderConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.gender = selectedValues[0]
  showGenderPicker.value = false
}

const onClassConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.className = selectedValues[0]
  showClassPicker.value = false
}

const onBloodTypeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.bloodType = selectedValues[0]
  showBloodTypePicker.value = false
}

const onRelationConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.emergencyRelation = selectedValues[0]
  showRelationPicker.value = false
}

const onBirthdayConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  const [year, month, day] = selectedValues
  formData.value.birthday = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  updateAge()
  showBirthdayPicker.value = false
}

const onEnrollmentDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  const [year, month, day] = selectedValues
  formData.value.enrollmentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  showEnrollmentDatePicker.value = false
}

// 获取孩子详情
const fetchChildDetail = async (id: number) => {
  loading.value = true
  try {
    const response: ApiResponse = await request.get(STUDENT_ENDPOINTS.GET_BY_ID(id))

    if (response.success && response.data) {
      const childData = response.data
      formData.value = {
        ...formData.value,
        id: childData.id,
        name: childData.name || '',
        gender: childData.gender || '',
        birthday: childData.birthday || '',
        age: childData.age || 0,
        className: childData.className || '',
        enrollmentDate: childData.enrollmentDate || '',
        avatar: childData.avatar || '',
        bloodType: childData.bloodType || '',
        allergies: childData.allergies || '无',
        medicalHistory: childData.medicalHistory || '无',
        emergencyContact: childData.emergencyContact || '',
        emergencyPhone: childData.emergencyPhone || '',
        emergencyRelation: childData.emergencyRelation || ''
      }
    } else {
      showToast(response.message || '获取孩子信息失败')
      router.back()
    }
  } catch (error) {
    console.error('获取孩子详情失败:', error)
    showToast('获取孩子信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    const submitData = {
      ...formData.value,
      parentId: userStore.userInfo?.id
    }

    let response: ApiResponse

    if (formData.value.id) {
      // 编辑孩子
      response = await request.put(STUDENT_ENDPOINTS.GET_BY_ID(formData.value.id), submitData)
    } else {
      // 添加孩子
      response = await request.post(STUDENT_ENDPOINTS.BASE, submitData)
    }

    if (response.success) {
      showToast(formData.value.id ? '修改成功' : '添加成功')
      router.back()
    } else {
      showToast(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    submitting.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  const childId = route.params.id as string
  if (childId && childId !== 'add') {
    fetchChildDetail(parseInt(childId))
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
@import "@/styles/design-tokens.scss";

.edit-child-container {
  padding: 0 0 20px 0;
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
}

// 头像上传区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) 16px;
  background: var(--card-bg);
  margin-bottom: var(--spacing-md);

  .avatar-upload {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }

    .avatar-image {
      border: 3px solid var(--van-primary-color);
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: var(--text-2xl);
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--van-primary-color);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }
  }

  .avatar-tip {
    margin: var(--spacing-sm) 0 0 0;
    font-size: var(--text-sm);
    color: var(--van-text-color-2);
  }
}

// 表单样式
.van-cell-group {
  margin-bottom: var(--spacing-md);
}

// 操作按钮
.form-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: 0 16px;
  margin-top: var(--spacing-xl);

  .van-button {
    flex: 1;
    height: 44px;
    border-radius: var(--spacing-2xl);
    font-weight: 600;
  }
}

// 响应式调整
@media (max-width: 375px) {
  .form-actions {
    flex-direction: column;

    .van-button {
      height: 48px;
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .avatar-section {
    background: var(--van-background-color);
  }
}
</style>