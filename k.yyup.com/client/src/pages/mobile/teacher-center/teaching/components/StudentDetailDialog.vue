<template>
  <van-popup
    v-model:show="dialogVisible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    round
  >
    <div class="mobile-student-detail" v-loading="loading">
      <!-- 头部 -->
      <div class="detail-header">
        <van-nav-bar
          title="学生详情"
          left-text="返回"
          left-arrow
          @click-left="handleClose"
        >
          <template #right>
            <van-icon name="edit" @click="handleEdit" />
          </template>
        </van-nav-bar>
      </div>

      <!-- 学生基本信息卡片 -->
      <div class="info-section" v-if="studentData">
        <van-cell-group inset title="基本信息">
          <van-cell title="姓名" :value="studentData.name || '--'" />
          <van-cell title="学号" :value="studentData.studentId || '--'" />
          <van-cell title="性别" :value="formatGender(studentData.gender)" />
          <van-cell title="出生日期" :value="studentData.birthDate || '--'" />
          <van-cell title="年龄" :value="calculateAge(studentData.birthDate) + '岁'" />
        </van-cell-group>

        <van-cell-group inset title="班级信息">
          <van-cell title="班级" :value="getClassName(studentData.classId)" />
          <van-cell title="入学时间" :value="studentData.enrollmentDate || '--'" />
        </van-cell-group>

        <van-cell-group inset title="家长信息">
          <van-cell title="家长姓名" :value="studentData.parentName || '--'" />
          <van-cell title="联系电话" :value="studentData.phone || '--'" />
          <van-cell title="与学生关系" :value="formatRelationship(studentData.relationship)" />
          <van-cell title="家庭地址" :value="studentData.address || '--'" />
        </van-cell-group>

        <van-cell-group inset title="其他信息">
          <van-cell title="健康状况">
            <template #value>
              <van-tag
                v-for="status in studentData.healthStatus"
                :key="status"
                type="success"
                size="medium"
                style="margin-right: 4px;"
              >
                {{ formatHealthStatus(status) }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="特殊说明" :value="studentData.notes || '无'" />
        </van-cell-group>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-else-if="!loading"
        description="暂无学生信息"
      />
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { personnelCenterApi } from '@/api/personnel-center'

interface Student {
  id?: number
  name?: string
  studentId?: string
  gender?: string
  birthDate?: string
  classId?: string
  enrollmentDate?: string
  parentName?: string
  phone?: string
  relationship?: string
  address?: string
  notes?: string
  healthStatus?: string[]
}

interface Props {
  modelValue: boolean
  studentData?: Student | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: [student: Student]
}>()

// 响应式数据
const loading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 班级名称映射
const getClassName = (classId?: string) => {
  const classMap: Record<string, string> = {
    '1': '小班A班',
    '2': '小班B班',
    '3': '中班A班',
    '4': '中班B班',
    '5': '大班A班',
    '6': '大班B班'
  }
  return classMap[classId || ''] || '--'
}

// 格式化性别
const formatGender = (gender?: string) => {
  return gender === 'male' ? '男' : gender === 'female' ? '女' : '--'
}

// 格式化关系
const formatRelationship = (relationship?: string) => {
  const relationMap: Record<string, string> = {
    'father': '父亲',
    'mother': '母亲',
    'grandfather': '爷爷',
    'grandmother': '奶奶',
    'other': '其他'
  }
  return relationMap[relationship || ''] || '--'
}

// 格式化健康状况
const formatHealthStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'healthy': '身体健康',
    'allergy': '有过敏史',
    'medication': '需要服药',
    'special_care': '需要特殊照顾'
  }
  return statusMap[status] || status
}

// 计算年龄
const calculateAge = (birthDate?: string) => {
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

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const handleEdit = () => {
  if (props.studentData) {
    emit('edit', { ...props.studentData })
  }
}

// 监听弹窗显示状态，加载详情数据
watch(() => props.modelValue, async (visible) => {
  if (visible && props.studentData?.id) {
    loading.value = true
    try {
      const response = await personnelCenterApi.getStudentDetail(String(props.studentData.id))
      if (response.success && response.data) {
        // 数据已经通过props传递，这里可以更新最新数据
        Object.assign(props.studentData, response.data)
      }
    } catch (error) {
      console.error('加载学生详情失败:', error)
      showToast('加载学生详情失败')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-student-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .detail-header {
    flex-shrink: 0;
    background: white;
    border-bottom: 1px solid #eee;
  }

  .info-section {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
  }

  :deep(.van-cell-group) {
    margin-bottom: 12px;
  }

  :deep(.van-cell-group__title) {
    font-weight: 600;
    color: var(--primary-color);
    padding: var(--spacing-md) 16px 8px;
  }
}
</style>
