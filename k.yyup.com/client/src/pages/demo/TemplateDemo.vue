<template>
  <div class="page-container">
    <h1 class="page-title">模板演示页面</h1>
    <p class="page-description">展示新的前端页面标准模板，支持主题切换和Layout包裹</p>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statData" :key="index">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon>
                <component :is="stat.icon"></component>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 搜索和操作工具栏 -->
    <div class="toolbar">
      <el-form :model="searchForm" class="search-form" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.keyword" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="请选择班级">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchStudents">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="primary" @click="showCreateDialog">新增学生</el-button>
        <el-button type="success" @click="exportStudents">导出Excel</el-button>
        <el-button @click="toggleSearch">{{ showSearchForm ? '隐藏搜索' : '显示搜索' }}</el-button>
      </div>
    </div>
    
    <!-- 学生表格 -->
    <el-card class="table-card">
      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="studentList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="学号" width="80" />
        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :size="32" :src="scope.row.avatar" />
              <span style="margin-left: var(--spacing-2xl);">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="parentName" label="家长姓名" min-width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollDate" label="入学时间" width="120">
          <template #default="scope">
            {{ formatTime(scope.row.enrollDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewStudent(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="editStudent(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteStudent(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 学生表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="formData.age" :min="2" :max="8" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属班级" prop="classId">
              <el-select v-model="formData.classId" placeholder="请选择班级">
                <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="家长姓名" prop="parentName">
              <el-input v-model="formData.parentName" placeholder="请输入家长姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="入学时间" prop="enrollDate">
          <el-date-picker
            v-model="formData.enrollDate"
            type="date"
            placeholder="请选择入学时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">在读</el-radio>
            <el-radio value="graduated">毕业</el-radio>
            <el-radio value="transferred">转学</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@/utils/dateFormat'
// API端点状态：✅ 无真API调用 - 使用模拟数据的演示页面
import { Document, Money, User, PieChart } from '@element-plus/icons-vue'

// 学生信息接口
export interface Student {
  id: number;
  name: string;
  gender: '男' | '女';
  age: number
  className: string
  classId: string
  parentName: string;
  phone: string;
  status: 'active' | 'graduated' | 'transferred'
  enrollDate: string;
  avatar: string
  remark?: string
}

// 统计数据接口
interface StatData {
  label: string;
  value: string;
  icon: string;
  type: string
}

// 表单数据接口
interface FormData {
  id?: number;
  name: string;
  gender: '男' | '女';
  age: number
  classId: string
  parentName: string;
  phone: string;
  status: 'active' | 'graduated' | 'transferred'
  enrollDate: string;
  remark: string
}

export default defineComponent({
  name: 'TemplateDemo',
  components: {
    Document, Money, User, PieChart
  },
  setup() {
    // 统计数据
    const statData = ref<StatData[]>([
      {
  label: '学生总数',
  value: '8',
  icon: 'User',
  type: 'primary'
      },
      {
  label: '在读学生',
  value: '6',
  icon: 'Document',
  type: 'success'
      },
      {
  label: '本月新增',
  value: '3',
  icon: 'PieChart',
  type: 'warning'
      },
      {
  label: '毕业学生',
  value: '1',
  icon: 'Money',
  type: 'info'
      }
    ])
    
    // 搜索表单
    const searchForm = ref({
      keyword: '',
      classId: '',
  status: '',
      dateRange: null as [string, string] | null
    })
    
    // 班级选项
    const classOptions = [
      { value: '', label: '全部班级' },
      { value: '1', label: '小班A' },
      { value: '2', label: '中班B' },
      { value: '3', label: '大班C' }
    ]
    
    // 状态选项
    const statusOptions = [
      { value: '', label: '全部状态' },
      { value: 'active', label: '在读' },
      { value: 'graduated', label: '毕业' },
      { value: 'transferred', label: '转学' }
    ]
    
    // 分页数据
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
  total: 0
    })
    
    // 表格相关
    const loading = ref(false)
    const studentList = ref<Student[]>([])
    const selectedStudents = ref<Student[]>([])
    const showSearchForm = ref(true)
    
    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const submitting = ref(false)
    const formRef = ref<any>(null)
    
    // 表单数据
    const formData = ref<FormData>({
      name: '',
  gender: '男',
  age: 3,
      classId: '',
      parentName: '',
  phone: '',
  status: 'active',
      enrollDate: '',
  remark: ''
    })
    
    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '请输入学生姓名', trigger: 'blur' },
        { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
      ],
  gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
  age: [
        { required: true, message: '请输入年龄', trigger: 'blur' }
      ],
      classId: [
        { required: true, message: '请选择班级', trigger: 'change' }
      ],
      parentName: [
        { required: true, message: '请输入家长姓名', trigger: 'blur' }
      ],
  phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      enrollDate: [
        { required: true, message: '请选择入学时间', trigger: 'change' }
      ]
    }
    
    // 虚拟数据
    const allStudents: Student[] = [
      {
        id: 1,
  name: '张小明',
  gender: '男',
  age: 5,
        className: '中班B',
        classId: '2',
        parentName: '张大华',
  phone: '13800138001',
  status: 'active',
        enrollDate: '2023-09-01',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 2,
  name: '李小红',
  gender: '女',
  age: 4,
        className: '小班A',
        classId: '1',
        parentName: '李建国',
  phone: '13900139002',
  status: 'active',
        enrollDate: '2024-03-15',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 3,
  name: '王大宝',
  gender: '男',
  age: 6,
        className: '大班C',
        classId: '3',
        parentName: '王富贵',
  phone: '13700137003',
  status: 'active',
        enrollDate: '2022-09-01',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 4,
  name: '刘美美',
  gender: '女',
  age: 5,
        className: '中班B',
        classId: '2',
        parentName: '刘德华',
  phone: '13600136004',
  status: 'graduated',
        enrollDate: '2023-09-01',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 5,
  name: '陈小虎',
  gender: '男',
  age: 4,
        className: '小班A',
        classId: '1',
        parentName: '陈建军',
  phone: '13500135005',
  status: 'active',
        enrollDate: '2024-02-20',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 6,
  name: '杨晓晓',
  gender: '女',
  age: 6,
        className: '大班C',
        classId: '3',
        parentName: '杨过',
  phone: '13400134006',
  status: 'transferred',
        enrollDate: '2022-09-01',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 7,
  name: '赵小龙',
  gender: '男',
  age: 5,
        className: '中班B',
        classId: '2',
        parentName: '赵子龙',
  phone: '13300133007',
  status: 'active',
        enrollDate: '2023-09-01',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      },
      {
        id: 8,
  name: '孙小花',
  gender: '女',
  age: 4,
        className: '小班A',
        classId: '1',
        parentName: '孙悟空',
  phone: '13200132008',
  status: 'active',
        enrollDate: '2024-01-10',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
    ]
    
    // 过滤数据
    const filterData = () => {
      let filtered = [...allStudents]
      
      if (searchForm.value.keyword) {
        filtered = filtered.filter(item => 
          item.name.includes(searchForm.value.keyword) ||
          item.parentName.includes(searchForm.value.keyword) ||
          item.phone.includes(searchForm.value.keyword)
        )
      }
      
      if (searchForm.value.classId) {
        filtered = filtered.filter(item => item.classId === searchForm.value.classId)
      }
      
      if (searchForm.value.status) {
        filtered = filtered.filter(item => item.status === searchForm.value.status)
      }
      
      if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
        const [startDate, endDate] = searchForm.value.dateRange
        filtered = filtered.filter(item => 
          item.enrollDate >= startDate && item.enrollDate <= endDate
        )
      }
      
      return filtered
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      
      try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const filtered = filterData()
        const startIndex = (pagination.value.currentPage - 1) * pagination.value.pageSize
        const endIndex = startIndex + pagination.value.pageSize
        
        studentList.value = filtered.slice(startIndex, endIndex)
        pagination.value.total = filtered.length
        
        ElMessage.success('数据加载成功')
      } catch (error) {
        console.error('获取数据失败:', error)
        ElMessage.error('获取数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索学生
    const searchStudents = () => {
      pagination.value.currentPage = 1
      loadData()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchForm.value = {
        keyword: '',
        classId: '',
  status: '',
        dateRange: null
      }
      searchStudents()
    }
    
    // 显示创建对话框
    const showCreateDialog = () => {
      dialogTitle.value = '新增学生'
      formData.value = {
        id: undefined,
  name: '',
  gender: '男',
  age: 3,
        classId: '',
        parentName: '',
  phone: '',
  status: 'active',
        enrollDate: '',
  remark: ''
      }
      dialogVisible.value = true
    }
    
    // 编辑学生
    const editStudent = (row: Student) => {
      dialogTitle.value = '编辑学生信息'
      formData.value = { 
        ...row,
  remark: row.remark || ''
      }
      dialogVisible.value = true
    }
    
    // 查看学生
    const viewStudent = (row: Student) => {
      ElMessage.info(`查看学生: ${row.name}`)
      console.log('查看学生详情:', row)
    }
    
    // 删除学生
    const deleteStudent = async (row: Student) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除学生 "${row.name}" 吗？`, 
          '删除确认', 
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
  type: 'warning'
          }
        )
        
        const index = allStudents.findIndex(item => item.id === row.id)
        if (index > -1) {
          allStudents.splice(index, 1)
        }
        
        ElMessage.success('删除成功')
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        submitting.value = true
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (formData.value.id) {
          // 更新
          const index = allStudents.findIndex(item => item.id === formData.value.id)
          if (index > -1) {
            Object.assign(allStudents[index], {
              ...formData.value,
              className: getClassName(formData.value.classId)
            })
          }
          ElMessage.success('更新成功')
        } else {
          // 新增
          const newStudent: Student = {
            ...formData.value,
  id: Date.now(),
            className: getClassName(formData.value.classId),
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
          allStudents.unshift(newStudent)
          ElMessage.success('新增成功')
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      } finally {
        submitting.value = false
      }
    }
    
    // 导出学生数据
    const exportStudents = () => {
      ElMessage.success('导出功能演示 - 实际项目中这里会下载Excel文件')
      console.log('导出数据:', studentList.value)
    }
    
    // 切换搜索表单显示
    const toggleSearch = () => {
      showSearchForm.value = !showSearchForm.value
      ElMessage.info(showSearchForm.value ? '显示搜索栏' : '隐藏搜索栏')
    }
    
    // 表格选择变化
    const handleSelectionChange = (selection: Student[]) => {
      selectedStudents.value = selection
    }
    
    // 分页大小变化
    const handleSizeChange = () => {
      loadData()
    }
    
    // 分页页码变化
    const handleCurrentChange = () => {
      loadData()
    }
    
    // 获取班级名称
    const getClassName = (classId: string) => {
      const classMap: Record<string, string> = {
        '1': '小班A',
        '2': '中班B',
        '3': '大班C'
      }
      return classMap[classId] || ''
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
      const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
        'active': 'success',
        'graduated': 'info',
        'transferred': 'warning'
      }
      return typeMap[status] || 'info'
    }
    
    // 获取状态标签文本
    const getStatusLabel = (status: string) => {
      const labelMap: Record<string, string> = {
        'active': '在读',
        'graduated': '毕业',
        'transferred': '转学'
      }
      return labelMap[status] || '未知'
    }
    
    // 格式化时间
    const formatTime = (dateStr: string | Date | null | undefined): string => {
      return formatDateTime(dateStr)
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadData()
    })
    
    return {
      // 数据
      statData,
      searchForm,
      classOptions,
      statusOptions,
      pagination,
      loading,
      studentList,
      selectedStudents,
      showSearchForm,
      dialogVisible,
      dialogTitle,
      submitting,
      formRef,
      formData,
      formRules,
      
      // 方法
      searchStudents,
      resetSearch,
      showCreateDialog,
      editStudent,
      viewStudent,
      deleteStudent,
      submitForm,
      exportStudents,
      toggleSearch,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      getStatusTagType,
      getStatusLabel,
      formatTime
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* API端点修复状态：✅ 演示页面无真API调用 - 使用mock数据 */

/* 页面标题 */
.page-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.page-description {
  margin: 0 0 var(--text-2xl) 0;
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: var(--text-2xl);
}

.stat-card {
  --el-card-bg-color: var(--el-bg-color);
  --el-card-border-color: var(--el-border-color-light);
}

.stat-card.primary {
  border-left: var(--spacing-xs) solid var(--el-color-primary);
}

.stat-card.success {
  border-left: var(--spacing-xs) solid var(--el-color-success);
}

.stat-card.warning {
  border-left: var(--spacing-xs) solid var(--el-color-warning);
}

.stat-card.info {
  border-left: var(--spacing-xs) solid var(--el-color-info);
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: var(--text-4xl);
  margin-right: var(--spacing-4xl);
  color: var(--el-color-primary);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-2xl);
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color);
  border-radius: var(--radius-md);
  box-shadow: var(--el-box-shadow-light);
}

.search-form {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: var(--text-xs);
  flex-shrink: 0;
  margin-left: var(--text-2xl);
}

/* 表格卡片 */
.table-card {
  --el-card-bg-color: var(--el-bg-color);
  --el-card-border-color: var(--el-border-color-light);
}

/* 学生信息展示 */
.student-info {
  display: flex;
  align-items: center;
}

/* 分页容器 */
.pagination-container {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: flex-end;
  padding: var(--text-base) 0 0 0;
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

/* 对话框 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-xs);
}

/* 暗黑主题适配 */
/* 移除template-demo-container的暗黑主题适配 */

[data-theme="dark"] .page-title {
  color: var(--el-text-color-primary);
}

[data-theme="dark"] .page-description {
  color: var(--el-text-color-regular);
}

[data-theme="dark"] .toolbar {
  background-color: var(--el-bg-color-page);
  border: var(--border-width-base) solid var(--el-border-color);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .toolbar {
    flex-direction: column;
    gap: var(--text-base);
    align-items: stretch;
  }
  
  .action-buttons {
    margin-left: 0;
    justify-content: flex-start;
  }
  
  .student-info {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-base);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-title {
    font-size: var(--spacing-lg);
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* Element Plus组件主题适配 */
:deep(.el-card) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color-light);
}

:deep(.el-table) {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

:deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
}

:deep(.el-input__inner) {
  background-color: var(--el-fill-color-blank);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}

:deep(.el-select .el-input__inner) {
  background-color: var(--el-fill-color-blank);
}

:deep(.el-textarea__inner) {
  background-color: var(--el-fill-color-blank);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}
</style>