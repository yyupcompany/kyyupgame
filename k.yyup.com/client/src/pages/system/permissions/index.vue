<template>
  <div class="permissions-page">
    <div class="page-header">
      <h1>权限管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreate">
          <UnifiedIcon name="Plus" />
          新增
        </el-button>
      </div>
    </div>
    
    <div class="page-content">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" class="search-form">
          <el-form-item label="搜索">
            <el-input
              v-model="searchQuery"
              placeholder="请输入关键词"
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 数据表格 -->
      <div class="table-section">
        <div class="table-wrapper">
<el-table class="responsive-table full-width-table"
          :data="tableData"
          :loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission
} from '@/api/modules/permission'

// 数据状态
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedRows = ref([])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentId = ref(null)

// 表单数据
const form = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref()

// 获取数据列表
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getPermissionList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value
    })
    
    if (response.success) {
      tableData.value = response.data.items || response.data || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchData()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增权限管理'
  isEdit.value = false
  Object.assign(form, { name: '', description: '' })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑权限管理'
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  // 可以导航到详情页面或显示详情对话框
  console.log('查看:', row)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '此操作将永久删除该记录, 是否继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deletePermission(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const response = isEdit.value
      ? await updatePermission(currentId.value, form)
      : await createPermission(form)
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 选择改变
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

// 组件挂载
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.search-input {
  max-width: 200px; width: 100%;
}

.full-width-table {
  width: 100%;
}

.permissions-page {
  padding: var(--spacing-lg);
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);

    h1 {
      margin: 0;
      font-size: var(--text-2xl);
      color: var(--text-primary);
    }
  }
  
  .page-content {
    .search-section {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--bg-secondary);
      border-radius: var(--spacing-xs);

      .search-form {
        margin: 0;
      }
    }

    .table-section {
      margin-bottom: var(--spacing-xl);
    }

    .pagination-section {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-xl);
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }
}
</style>