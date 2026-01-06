import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export interface CrudApi<T> {
  list: (params?: any) => Promise<{ success: boolean; data: { items: T[]; total: number }; message?: string }>
  create: (data: Partial<T>) => Promise<{ success: boolean; data?: T; message?: string }>
  update: (id: string | number, data: Partial<T>) => Promise<{ success: boolean; data?: T; message?: string }>
  delete: (id: string | number) => Promise<{ success: boolean; message?: string }>
}

export interface CrudOptions {
  pageSize?: number
  showMessage?: boolean
}

export function useCrudOperations<T extends { id?: string | number }>(
  api: CrudApi<T>,
  options: CrudOptions = {}
) {
  const {
    pageSize = 10,
    showMessage = true
  } = options

  // 响应式状态
  const loading = ref(false)
  const submitting = ref(false)
  const items = ref<T[]>([])
  const total = ref(0)
  const searchParams = ref<any>({})
  
  // 分页状态
  const pagination = reactive({
    currentPage: 1,
    pageSize,
    total: 0
  })

  // 加载列表数据
  const loadItems = async (params?: any) => {
    try {
      loading.value = true
      console.log('📡 [useCrudOperations] 开始加载数据...', {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        params
      })
      
      const response = await api.list({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...params
      })
      
      console.log('📥 [useCrudOperations] API响应:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        itemsLength: response.data?.items?.length || 0,
        total: response.data?.total,
        rawItems: response.data?.items, // ✨ 添加：查看原始items数据
        itemsType: Array.isArray(response.data?.items) ? 'Array' : typeof response.data?.items
      })
      
      if (response.success && response.data) {
        const itemsData = response.data.items || []
        console.log('🔍 [useCrudOperations] 准备赋值 items:', {
          itemsData,
          isArray: Array.isArray(itemsData),
          length: itemsData.length
        })
        items.value = itemsData
        total.value = response.data.total || 0
        pagination.total = response.data.total || 0
        console.log('✅ [useCrudOperations] 数据加载成功:', {
          itemsCount: items.value.length,
          total: total.value,
          firstItem: items.value[0] // ✨ 添加：查看第一条数据
        })
      } else {
        console.warn('⚠️ [useCrudOperations] API返回失败或无数据:', response.message)
        if (showMessage) {
          ElMessage.error(response.message || '加载数据失败')
        }
      }
    } catch (error) {
      console.error('❌ [useCrudOperations] 加载数据异常:', error)
      if (showMessage) {
        ElMessage.error('加载数据失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createItem = async (data: Partial<T>) => {
    try {
      submitting.value = true
      const response = await api.create(data)
      
      if (response.success) {
        if (showMessage) {
          ElMessage.success('创建成功')
        }
        await loadItems()
        return response.data
      } else {
        if (showMessage) {
          ElMessage.error(response.message || '创建失败')
        }
        return null
      }
    } catch (error) {
      console.error('创建失败:', error)
      if (showMessage) {
        ElMessage.error('创建失败')
      }
      return null
    } finally {
      submitting.value = false
    }
  }

  // 更新项目
  const updateItem = async (id: string | number, data: Partial<T>) => {
    try {
      submitting.value = true
      const response = await api.update(id, data)
      
      if (response.success) {
        if (showMessage) {
          ElMessage.success('更新成功')
        }
        await loadItems()
        return response.data
      } else {
        if (showMessage) {
          ElMessage.error(response.message || '更新失败')
        }
        return null
      }
    } catch (error) {
      console.error('更新失败:', error)
      if (showMessage) {
        ElMessage.error('更新失败')
      }
      return null
    } finally {
      submitting.value = false
    }
  }

  // 删除项目
  const deleteItem = async (id: string | number) => {
    try {
      submitting.value = true
      const response = await api.delete(id)
      
      if (response.success) {
        if (showMessage) {
          ElMessage.success('删除成功')
        }
        await loadItems()
        return true
      } else {
        if (showMessage) {
          ElMessage.error(response.message || '删除失败')
        }
        return false
      }
    } catch (error) {
      console.error('删除失败:', error)
      if (showMessage) {
        ElMessage.error('删除失败')
      }
      return false
    } finally {
      submitting.value = false
    }
  }

  // 分页处理
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadItems()
  }

  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadItems()
  }

  // 刷新数据
  const refresh = () => {
    loadItems()
  }

  // 搜索功能
  const search = async (params: any) => {
    searchParams.value = { ...params }
    pagination.currentPage = 1
    await loadItems(params)
  }

  // 重置搜索
  const resetSearch = async () => {
    searchParams.value = {}
    pagination.currentPage = 1
    await loadItems()
  }

  // 分页处理 - 重新定义，带上搜索参数
  const handlePageChange = (page: number) => {
    pagination.currentPage = page
    loadItems(searchParams.value)
  }

  return {
    // 状态
    loading,
    submitting,
    items,
    total,
    pagination,
    searchParams,
    
    // 方法
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    handleSizeChange,
    handleCurrentChange,
    handlePageChange,
    search,
    resetSearch,
    refresh
  }
}