<template>
  <div class="basic-info-tab">
    <!-- 个人信息 -->
    <van-cell-group title="个人信息" inset>
      <van-cell title="姓名" :value="student.name" />
      <van-cell title="学号" :value="student.studentNo" />
      <van-cell title="性别" :value="student.gender === 'MALE' ? '男' : '女'" />
      <van-cell title="出生日期" :value="formatDate(student.birthDate)" />
      <van-cell title="年龄" :value="`${calculateAge(student.birthDate)}岁`" />
      <van-cell title="入学日期" :value="formatDate(student.enrollmentDate)" />
      <van-cell title="班级" :value="student.className || '未分班'" />
      <van-cell title="状态">
        <template #value>
          <van-tag :type="getStatusTagType(student.status)" size="small">
            {{ getStatusText(student.status) }}
          </van-tag>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 健康信息 -->
    <van-cell-group title="健康信息" inset>
      <van-cell title="过敏史" :value="student.allergyHistory || '无'" />
      <van-cell title="特殊需求" :value="student.specialNeeds || '无'" />
    </van-cell-group>

    <!-- 联系信息 -->
    <van-cell-group title="联系信息" inset>
      <van-cell title="家庭住址" :value="student.householdAddress || '未填写'" />
      <van-cell title="兴趣爱好" :value="student.interests || '无'" />
    </van-cell-group>

    <!-- 备注信息 -->
    <van-cell-group title="备注信息" inset v-if="student.remark">
      <van-cell>
        <template #title>
          <div class="remark-content">{{ student.remark }}</div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 统计信息 -->
    <van-cell-group title="统计信息" inset>
      <van-cell title="入学天数" :value="enrollmentDays" />
      <van-cell title="当前学期" :value="currentSemester" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Student } from '@/api/modules/student'

interface Props {
  student: Student
}

defineProps<Props>()

// 计算属性
const enrollmentDays = computed(() => {
  if (!props.student.enrollmentDate) return '0天'
  const enrollment = new Date(props.student.enrollmentDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - enrollment.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays}天`
})

const currentSemester = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (month >= 2 && month <= 7) {
    return `${year}年春季学期`
  } else if (month >= 8 && month <= 12) {
    return `${year}年秋季学期`
  } else {
    return `${year - 1}年秋季学期`
  }
})

// 工具函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'success',
    GRADUATED: 'info',
    TRANSFERRED: 'warning',
    SUSPENDED: 'danger'
  }
  return statusMap[status] || 'info'
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
</script>

<style lang="scss" scoped>
.basic-info-tab {
  padding: var(--spacing-md) 0;

  .van-cell-group {
    margin-bottom: 16px;
  }

  .remark-content {
    white-space: pre-wrap;
    line-height: 1.5;
    color: var(--van-text-color-2);
  }
}

:deep(.van-cell__title) {
  color: var(--van-text-color-2);
  font-weight: 400;
}

:deep(.van-cell__value) {
  color: var(--van-text-color);
  font-weight: 500;
}
</style>