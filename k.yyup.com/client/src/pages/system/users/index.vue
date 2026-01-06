<template>
  <UnifiedCenterLayout
    title="用户管理"
    :show-header="true"
    :show-actions="true"
    @create="handleCreate"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreate">
        <UnifiedIcon name="Plus" />
        新增用户
      </el-button>
    </template>

    <template #content>

    <!-- 搜索过滤区域 -->
    <div class="filter-card">
      <div class="card-body">
        <el-form :inline="true" class="filter-form">
          <div class="filter-group">
            <el-form-item label="搜索">
              <el-input
                v-model="searchQuery"
                placeholder="请输入关键词"
                @keyup.enter="handleSearch"
                class="search-input"
              />
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </el-form>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-card">
      <div class="table-content">
        <div class="table-header">
          <div class="table-title">用户列表</div>
        </div>
        <div class="table-body">
          <div class="table-wrapper">
<el-table class="responsive-table full-width-table"
            :data="tableData"
            :loading="loading"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="姓名" width="100" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="mobile" label="手机号" width="130" />
            <el-table-column label="角色" width="120">
              <template #default="{ row }">
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  size="small"
                  class="role-tag"
                >
                  {{ role.name }}
                </el-tag>
                <span v-if="!row.roles || row.roles.length === 0" class="text-gray-400">未分配</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'active' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    type="primary"
                    link
                    @click="handleEdit(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    :type="row.status === 'active' ? 'warning' : 'success'"
                    link
                    @click="handleToggleStatus(row)"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    link
                    @click="handleDelete(row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 分页 -->
        <div class="data-footer">
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>
    </template>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '@/api/modules/system'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

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
  username: '',
  password: '',
  realName: '',
  email: '',
  mobile: '',
  status: 'active'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 表单引用
const formRef = ref()

// 获取数据列表
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getUsers({
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
  dialogTitle.value = '新增用户'
  isEdit.value = false
  Object.assign(form, {
    username: '',
    password: '',
    realName: '',
    email: '',
    mobile: '',
    status: 'active'
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (row: any) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const statusText = newStatus === 'active' ? '启用' : '禁用'

  ElMessageBox.confirm(
    `确定要${statusText}用户 "${row.realName || row.username}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await updateUser(row.id, { status: newStatus })
      if (response.success) {
        ElMessage.success(`${statusText}成功`)
        fetchData()
      } else {
        ElMessage.error(response.message || `${statusText}失败`)
      }
    } catch (error) {
      console.error(`${statusText}失败:`, error)
      ElMessage.error(`${statusText}失败`)
    }
  })
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
      const response = await deleteUser(row.id)
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
      ? await updateUsers(currentId.value, form)
      : await createUsers(form)
    
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
@use '@/styles/index.scss' as *;

/* 使用全局布局样式，只需要少量自定义样式 */
.search-input {
  max-width: 200px; width: 100%;
}

.full-width-table {
  width: 100%;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;

  .el-button {
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

/* 角色标签样式 */
.role-tag {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

/* 状态标签样式 */
.el-tag {
  font-size: var(--text-sm);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>