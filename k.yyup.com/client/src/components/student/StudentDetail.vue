<template>
  <div class="student-detail">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">学生详情</span>
        </div>
      </template>

      <div v-loading="loading">
        <div v-if="studentData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学生姓名">{{ studentData.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ studentData.gender === 'MALE' ? '男' : '女' }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ studentData.age }}岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ studentData.birthDate || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ studentData.currentClassName || '未分配' }}</el-descriptions-item>
            <el-descriptions-item label="入学日期">{{ studentData.enrollmentDate }}</el-descriptions-item>
            <el-descriptions-item label="监护人姓名">{{ studentData.guardian?.name || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="监护人电话">{{ studentData.guardian?.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item :span="2" label="家庭住址">{{ studentData.guardian?.address || '未设置' }}</el-descriptions-item>
            <el-descriptions-item :span="2" label="健康备注">{{ studentData.healthInfo?.medicalConditions || '无' }}</el-descriptions-item>
            <el-descriptions-item label="紧急联系人">{{ studentData.healthInfo?.emergencyContact?.name || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="studentData.status === 'ACTIVE' ? 'success' : 'warning'">
                {{ getStatusText(studentData.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 学生成长记录 -->
          <div class="section-title">成长记录</div>
          <div class="table-wrapper">
<el-table class="responsive-table"
            v-loading="loadingRecords"
            :data="growthRecords"
            border
            class="full-width"
          >
            <el-table-column label="日期" prop="recordDate" width="120" />
            <el-table-column label="记录内容" prop="content" />
            <el-table-column label="记录教师" prop="recordBy" width="120" />
            <el-table-column label="类型" prop="type" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type || '常规记录' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
</div>
          
          <div class="section-actions">
            <el-button type="primary" @click="$emit('edit', studentData.id)">编辑信息</el-button>
            <el-button @click="$emit('back')">返回列表</el-button>
          </div>
        </div>
        
        <el-empty v-else-if="!loading" description="未找到学生信息" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudentDetail, StudentStatus } from '@/api/modules/student'
import type { Student } from '@/api/modules/student'

interface GrowthRecord {
  id: string;
  studentId: string;
  content: string;
  recordDate: string;
  recordBy: string;
  type: string;
}

export default defineComponent({
  name: 'StudentDetail',
  props: {
    studentId: {
      type: String,
      required: true
    }
  },
  emits: ['edit', 'back'],
  setup(props) {
    const loading = ref(false)
    const loadingRecords = ref(false)
    const studentData = ref<Student | null>(null)
    const growthRecords = ref<GrowthRecord[]>([])

    // 获取学生详情
    const fetchStudentDetail = async (id: string) => {
      loading.value = true
      try {
        const response = await getStudentDetail(id)
        if (response.success || response.data) {
          studentData.value = response.data
        } else {
          ElMessage.error(response.message || '获取学生详情失败')
        }
      } catch (error) {
        console.error('获取学生详情失败:', error)
        ElMessage.error('获取学生详情失败')
      } finally {
        loading.value = false
      }
    }

    // 获取学生成长记录 (暂时使用模拟数据，等待后端API)
    const fetchGrowthRecords = async (id: string) => {
      loadingRecords.value = true
      try {
        // TODO: 替换为真实API调用
        const mockRecordsData = {
          success: true,
          message: "success",
          data: {
            items: [
              {
                id: "1",
                studentId: id,
                content: "学期期中表现良好，积极参与课堂活动",
                recordDate: "2023-04-15",
                recordBy: "李老师",
                type: "学习表现"
              },
              {
                id: "2",
                studentId: id,
                content: "美术课作品获得校内展览",
                recordDate: "2023-05-20",
                recordBy: "王老师",
                type: "特长发展"
              }
            ],
            total: 2
          }
        }
        
        growthRecords.value = mockRecordsData.data.items
      } catch (error) {
        console.error('获取学生成长记录失败:', error)
        ElMessage.error('获取学生成长记录失败')
      } finally {
        loadingRecords.value = false
      }
    }

    // 获取状态文本
    const getStatusText = (status: string) => {
      const statusMap = {
        [StudentStatus.ACTIVE]: '在读',
        [StudentStatus.GRADUATED]: '毕业',
        [StudentStatus.TRANSFERRED]: '转校',
        [StudentStatus.SUSPENDED]: '休学',
        [StudentStatus.INACTIVE]: '非活动'
      }
      return statusMap[status] || '未知'
    }

    onMounted(() => {
      if (props.studentId) {
        fetchStudentDetail(props.studentId)
        fetchGrowthRecords(props.studentId)
      }
    })

    return {
      loading,
      loadingRecords,
      studentData,
      growthRecords,
      getStatusText
    }
  }
})
</script>

<style scoped lang="scss">
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";
@use '@/styles/index.scss' as *;

.student-detail {
  max-width: 100%; max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--text-primary);
}

.section-title {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-base);
  font-weight: bold;
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
  color: var(--text-primary);
}

.section-actions {
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm);
}
.full-width {
  width: 100%;
}
</style> 