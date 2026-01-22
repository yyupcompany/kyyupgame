<template>
  <MobileCenterLayout title="studentData.name ? `${studentData.name}的详情` : '学生详情'" back-path="/mobile/centers">
    <div v-if="loading" class="loading-container">
      <van-loading size="24px">加载中...</van-loading>
    </div>

    <div v-else class="student-detail">
      <!-- 学生基本信息卡片 -->
      <van-card class="student-card">
        <template #thumb>
          <van-image
            :src="studentData.avatar || '/default-avatar.png'"
            width="60"
            height="60"
            round
            fit="cover"
          />
        </template>

        <template #title>
          <div class="student-title">
            <h3>{{ studentData.name }}</h3>
            <van-tag :type="getStatusTagType(studentData.status)" size="medium">
              {{ getStatusText(studentData.status) }}
            </van-tag>
          </div>
        </template>

        <template #desc>
          <div class="student-badges">
            <van-tag
              :type="getGenderTagType(studentData.gender)"
              size="medium"
            >
              {{ studentData.gender === 'MALE' ? '男' : '女' }}
            </van-tag>
            <van-tag type="primary" size="medium">
              {{ calculateAge(studentData.birthDate) }}岁
            </van-tag>
            <van-tag v-if="studentData.className" type="success" size="medium">
              {{ studentData.className }}
            </van-tag>
          </div>
        </template>

        <template #price>
          <div class="quick-info">
            <div class="info-item">
              <van-icon name="contact" size="14" />
              <span>学号: {{ studentData.studentNo }}</span>
            </div>
            <div class="info-item">
              <van-icon name="calendar-o" size="14" />
              <span>入学: {{ formatDate(studentData.enrollmentDate) }}</span>
            </div>
            <div v-if="studentData.guardian?.name" class="info-item">
              <van-icon name="friends" size="14" />
              <span>家长: {{ studentData.guardian.name }}</span>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="action-buttons">
            <van-button size="medium" type="primary" @click="editStudent">
              编辑信息
            </van-button>
            <van-button size="medium" type="success" @click="viewGrades">
              查看成绩
            </van-button>
            <van-button size="medium" type="info" @click="viewAttendance">
              考勤记录
            </van-button>
          </div>
        </template>
      </van-card>

      <!-- 详细信息选项卡 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="基本信息" name="basic">
          <BasicInfoTab :student="studentData" />
        </van-tab>

        <van-tab title="家长信息" name="parents">
          <ParentsInfoTab :student="studentData" />
        </van-tab>

        <van-tab title="学习成绩" name="grades">
          <GradesTab :student-id="studentId" />
        </van-tab>

        <van-tab title="考勤记录" name="attendance">
          <AttendanceTab :student-id="studentId" />
        </van-tab>

        <van-tab title="成长记录" name="growth">
          <GrowthTab :student-id="studentId" />
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import BasicInfoTab from './components/tabs/BasicInfoTab.vue'
import ParentsInfoTab from './components/tabs/ParentsInfoTab.vue'
import GradesTab from './components/tabs/GradesTab.vue'
import AttendanceTab from './components/tabs/AttendanceTab.vue'
import GrowthTab from './components/tabs/GrowthTab.vue'
import { studentApi } from '@/api/modules/student'
import type { Student } from '@/api/modules/student'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const activeTab = ref('basic')
const studentId = ref(route.params.id as string)
const studentData = reactive<Student>({
  id: '',
  name: '',
  studentNo: '',
  gender: '',
  birthDate: '',
  enrollmentDate: '',
  className: '',
  status: 'ACTIVE',
  avatar: '',
  householdAddress: '',
  allergyHistory: '',
  specialNeeds: '',
  interests: '',
  remark: '',
  guardian: null
})

// 加载学生详情
const loadStudentDetail = async () => {
  try {
    const response = await studentApi.getStudentById(studentId.value)
    if (response.success && response.data) {
      Object.assign(studentData, response.data)
    } else {
      showToast(response.message || '获取学生详情失败')
      router.back()
    }
  } catch (error) {
    console.error('获取学生详情失败:', error)
    showToast('获取学生详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 事件处理
const editStudent = () => {
  router.push(`/mobile/student/edit/${studentId.value}`)
}

const viewGrades = () => {
  activeTab.value = 'grades'
}

const viewAttendance = () => {
  activeTab.value = 'attendance'
}

// 工具函数
const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getGenderTagType = (gender: string): TagType => {
  return gender === 'MALE' ? 'primary' : 'danger'
}

const getStatusTagType = (status: string): TagType => {
  const statusMap: Record<string, TagType> = {
    ACTIVE: 'success',
    GRADUATED: 'default',
    TRANSFERRED: 'warning',
    SUSPENDED: 'danger'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: '在读',
    GRADUATED: '毕业',
    TRANSFERRED: '转校',
    SUSPENDED: '休学'
  }
  return statusMap[status] || status
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadStudentDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.student-detail {
  padding: 0;

  .student-card {
    margin: var(--spacing-md);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .student-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .student-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .quick-info {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);

      .van-button {
        flex: 1;
      }
    }
  }

  :deep(.van-tabs) {
    .van-tabs__content {
      padding: 0;
    }

    .van-tab__panel {
      min-height: 300px;
    }
  }
}

:deep(.van-card__thumb) {
  flex-shrink: 0;
}

:deep(.van-card__content) {
  flex: 1;
  min-width: 0;
}

:deep(.van-card__title) {
  width: 100%;
}
</style>