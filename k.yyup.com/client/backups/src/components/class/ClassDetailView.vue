<template>
  <div class="class-detail">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">班级详情</span>
        </div>
      </template>

      <div v-loading="loading">
        <div v-if="classData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="班级名称">{{ classData.name }}</el-descriptions-item>
            <el-descriptions-item label="班级类型">{{ classData.type }}</el-descriptions-item>
            <el-descriptions-item label="班级状态">
              <el-tag :type="classData.status === '正常' ? 'success' : 'warning'">
                {{ classData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="班级人数">
              <el-progress
                :percentage="Math.floor((classData.currentCount / classData.capacity) * 100)"
                :format="() => `${classData.currentCount}/${classData.capacity}`"
                :status="getCapacityStatus(classData.currentCount, classData.capacity)"
              />
            </el-descriptions-item>
            <el-descriptions-item label="班主任">{{ classData.headTeacherName || '未指定' }}</el-descriptions-item>
            <el-descriptions-item label="教室">{{ classData.classroom || '未指定' }}</el-descriptions-item>
            <el-descriptions-item label="开班日期">{{ classData.startDate }}</el-descriptions-item>
            <el-descriptions-item label="年龄范围">{{ classData.ageRange }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 班级学生 -->
          <div class="section-title">班级学生</div>
          <el-table
            v-loading="loadingStudents"
            :data="students"
            border
            style="width: 100%"
          >
            <el-table-column label="姓名" prop="name" width="120" />
            <el-table-column label="性别" width="80">
              <template #default="{ row }">
                {{ row.gender === '男' ? '男' : '女' }}
              </template>
            </el-table-column>
            <el-table-column label="年龄" prop="age" width="80" />
            <el-table-column label="监护人" prop="guardianName" width="120" />
            <el-table-column label="联系电话" prop="guardianPhone" width="150" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewStudentDetail(row.id)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container" v-if="studentTotal > 0">
            <el-pagination
              v-model:current-page="studentQuery.page"
              v-model:page-size="studentQuery.pageSize"
              :total="studentTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
          
          <div class="section-actions">
            <el-button type="primary" @click="$emit('edit', classData.id)">编辑班级</el-button>
            <el-button @click="$emit('back')">返回列表</el-button>
          </div>
        </div>
        
        <el-empty v-else-if="!loading" description="未找到班级信息" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getClassDetail, getClassStudents } from '@/api/modules/class'

export default defineComponent({
  name: 'ClassDetailView',
  props: {
    classId: {
      type: String,
      required: true
    }
  },
  emits: ['edit', 'back', 'view-student'],
  setup(props, { emit }) {
    const loading = ref(false)
    const loadingStudents = ref(false)
    const classData = ref(null)
    const students = ref([])
    const studentTotal = ref(0)

    // 学生查询参数
    const studentQuery = reactive({
      page: 1,
      pageSize: 10,
      keyword: ''
    })

    // 获取班级详情
    const fetchClassDetail = async (id) => {
      loading.value = true
      try {
        const response = await getClassDetail(id)
        if (response.data) {
          classData.value = response.data
        }
      } catch (error) {
        console.error('获取班级详情失败:', error)
        ElMessage.error('获取班级详情失败')
      } finally {
        loading.value = false
      }
    }

    // 获取班级学生
    const fetchClassStudents = async (classId) => {
      loadingStudents.value = true
      try {
        const params = {
          page: studentQuery.page,
          pageSize: studentQuery.pageSize,
          keyword: studentQuery.keyword
        }
        const response = await getClassStudents(classId, params)
        if (response.items) {
          students.value = response.items
          studentTotal.value = response.total || 0
        }
      } catch (error) {
        console.error('获取班级学生失败:', error)
        ElMessage.error('获取班级学生失败')
      } finally {
        loadingStudents.value = false
      }
    }

    // 根据容量状态返回进度条样式
    const getCapacityStatus = (current, capacity) => {
      const percentage = (current / capacity) * 100
      if (percentage >= 90) return 'exception'
      if (percentage >= 70) return 'warning'
      return 'success'
    }

    // 分页大小变化
    const handleSizeChange = (size) => {
      studentQuery.pageSize = size
      fetchClassStudents(props.classId)
    }

    // 分页页码变化
    const handleCurrentChange = (page) => {
      studentQuery.page = page
      fetchClassStudents(props.classId)
    }

    // 查看学生详情
    const viewStudentDetail = (studentId) => {
      emit('view-student', studentId)
    }

    onMounted(() => {
      if (props.classId) {
        fetchClassDetail(props.classId)
        fetchClassStudents(props.classId)
      }
    })

    return {
      loading,
      loadingStudents,
      classData,
      students,
      studentTotal,
      studentQuery,
      getCapacityStatus,
      handleSizeChange,
      handleCurrentChange,
      viewStudentDetail
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.class-detail {
  max-width: 1000px;
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
}

.section-title {
  margin-top: var(--text-2xl);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-base);
  font-weight: bold;
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--border-width-base) solid #ebeef5;
}

.section-actions {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.pagination-container {
  margin-top: var(--spacing-4xl);
  display: flex;
  justify-content: flex-end;
}
</style> 