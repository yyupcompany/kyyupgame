<template>
  <el-dialog
    v-model="visible"
    title="学生详情"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="student-detail-dialog">
      <!-- 学生基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">
            {{ studentData.name }}
          </el-descriptions-item>
          <el-descriptions-item label="学号">
            {{ studentData.studentId }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ studentData.gender }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ studentData.age }}岁
          </el-descriptions-item>
          <el-descriptions-item label="班级">
            {{ studentData.className }}
          </el-descriptions-item>
          <el-descriptions-item label="入学时间">
            {{ studentData.enrollmentDate }}
          </el-descriptions-item>
          <el-descriptions-item label="家长姓名">
            {{ studentData.parentName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ studentData.phone }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 学习记录 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>学习记录</span>
          </div>
        </template>
        
        <el-table :data="studentData.records" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="content" label="学习内容" />
          <el-table-column prop="score" label="评分" width="80">
            <template #default="{ row }">
              <el-rate v-model="row.score" disabled show-score />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 成长轨迹 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>成长轨迹</span>
          </div>
        </template>
        
        <div class="growth-chart">
          <div ref="chartContainer" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" @click="editStudent">编辑学生</el-button>
        <el-button type="success" @click="printReport">打印报告</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { User, Document, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface StudentRecord {
  date: string
  subject: string
  content: string
  score: number
}

interface StudentData {
  id: number
  name: string
  studentId: string
  gender: string
  age: number
  className: string
  enrollmentDate: string
  parentName: string
  phone: string
  records: StudentRecord[]
}

interface Props {
  modelValue: boolean
  studentId?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  studentId: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit-student': [id: number]
}>()

const chartContainer = ref<HTMLElement>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 模拟学生数据
const studentData = ref<StudentData>({
  id: props.studentId,
  name: '张小明',
  studentId: 'ST202301001',
  gender: '男',
  age: 5,
  className: '大班A班',
  enrollmentDate: '2023-09-01',
  parentName: '张伟',
  phone: '13800138001',
  records: [
    {
      date: '2024-01-15',
      subject: '语言',
      content: '学习儿歌《小星星》',
      score: 5
    },
    {
      date: '2024-01-16',
      subject: '数学',
      content: '认识数字1-10',
      score: 4
    },
    {
      date: '2024-01-17',
      subject: '美术',
      content: '画画《我的家》',
      score: 5
    },
    {
      date: '2024-01-18',
      subject: '体育',
      content: '跑步练习',
      score: 4
    }
  ]
})

const closeDialog = () => {
  visible.value = false
}

const editStudent = () => {
  emit('edit-student', studentData.value.id)
  closeDialog()
}

const printReport = () => {
  ElMessage.success('报告打印功能开发中...')
}

// 绘制成长轨迹图表
const drawChart = () => {
  if (!chartContainer.value) return
  
  // 模拟图表绘制
  chartContainer.value.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: var(--bg-hover); border-radius: var(--spacing-sm);">
      <div style="text-align: center;">
        <div style="font-size: var(--text-xl); color: var(--text-regular); margin-bottom: var(--spacing-2xl);">📈 成长轨迹图表</div>
        <div style="font-size: var(--text-base); color: var(--info-color);">语言能力：85% ↗</div>
        <div style="font-size: var(--text-base); color: var(--info-color);">数学能力：78% ↗</div>
        <div style="font-size: var(--text-base); color: var(--info-color);">社交能力：92% ↗</div>
        <div style="font-size: var(--text-base); color: var(--info-color);">运动能力：80% ↗</div>
      </div>
    </div>
  `
}

onMounted(() => {
  nextTick(() => {
    if (visible.value) {
      drawChart()
    }
  })
})
</script>

<style scoped>
.student-detail-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.info-card {
  margin-bottom: var(--text-2xl);
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.growth-chart {
  padding: var(--spacing-2xl) 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-table) {
  margin-top: var(--spacing-2xl);
}
</style>