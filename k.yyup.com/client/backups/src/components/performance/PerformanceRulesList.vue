<template>
  <div class="performance-rules-list">
    <div class="toolbar">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="规则类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
            <el-option
              v-for="item in calculationMethodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.isActive" placeholder="全部状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRules">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreateRule">
          <el-icon><Plus /></el-icon>
          新增规则
        </el-button>
      </div>
    </div>
    
    <el-table
      v-loading="loading"
      :data="rules"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="规则名称" min-width="150">
        <template #default="scope">
          <div class="rule-name">
            <span>{{ scope.row.name }}</span>
            <el-tag 
              size="small" 
              :type="scope.row.isActive ? 'success' : 'info'"
              class="status-tag"
            >
              {{ scope.row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="calculationMethod" label="计算方法" min-width="120">
        <template #default="scope">
          <el-tag :type="getCalculationMethodTagType(scope.row.calculationMethod)">
            {{ getCalculationMethodLabel(scope.row.calculationMethod) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="targetValue" label="目标值" min-width="100">
        <template #default="scope">
          {{ scope.row.targetValue }}
        </template>
      </el-table-column>
      
      <el-table-column prop="bonusAmount" label="奖金金额" min-width="100">
        <template #default="scope">
          ¥{{ scope.row.bonusAmount }}
        </template>
      </el-table-column>
      
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      
      <el-table-column prop="updatedAt" label="更新时间" min-width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="handleEditRule(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            :type="scope.row.isActive ? 'warning' : 'success'" 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.isActive ? '禁用' : '启用' }}
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDeleteRule(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { formatDateTime } from '../../utils/dateFormat'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import type { PerformanceRule, PerformanceRuleType } from '../../api/modules/principal'

export default defineComponent({
  name: 'PerformanceRulesList',
  components: {
    Plus
  },
  emits: ['create', 'edit'],
  setup(props: any, { emit }: any) {
    const loading = ref(false)
    const rules = ref<PerformanceRule[]>([])
    
    const filterForm = ref({
      type: undefined as PerformanceRuleType | undefined,
      isActive: undefined as boolean | undefined
    })
    
    const calculationMethodOptions = [
      { value: 'ENROLLMENT_COUNT', label: '招生数量' },
      { value: 'TRIAL_CONVERSION', label: '体验课转化' },
      { value: 'ORDER_COUNT', label: '采单数量' },
      { value: 'PRE_REGISTRATION', label: '预报名转化' }
    ]
    
    // 加载规则列表
    const loadRules = async () => {
      loading.value = true
      try {
        const params = {
          type: filterForm.value.type,
          isActive: filterForm.value.isActive
        }
        
        const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_RULES, { params })
        if (res.success && res.data) {
          rules.value = res.data
        }
      } catch (error) {
        console.error('加载绩效规则失败:', error)
        ElMessage.error('加载绩效规则失败')
      } finally {
        loading.value = false
      }
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.value.type = undefined
      filterForm.value.isActive = undefined
      loadRules()
    }
    
    // 获取计算方法标签
    const getCalculationMethodLabel = (method: string) => {
      const option = calculationMethodOptions.find(item => item.value === method)
      return option ? option.label : method
    }
    
    // 获取计算方法标签样式
    const getCalculationMethodTagType = (method: string) => {
      const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
        'ENROLLMENT_COUNT': 'primary',
        'TRIAL_CONVERSION': 'success',
        'ORDER_COUNT': 'warning',
        'PRE_REGISTRATION': 'info'
      }
      return typeMap[method] || 'info'
    }
    
    // 创建规则
    const handleCreateRule = () => {
      emit('create')
    }
    
    // 编辑规则
    const handleEditRule = (rule: PerformanceRule) => {
      emit('edit', rule)
    }
    
    // 切换规则状态
    const handleToggleStatus = async (rule: PerformanceRule) => {
      const action = rule.isActive ? '禁用' : '启用'
      
      try {
        await ElMessageBox.confirm(`确定要${action}该绩效规则吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        loading.value = true
        const res: ApiResponse = await request.put(PRINCIPAL_ENDPOINTS.PERFORMANCE_RULE_STATUS(rule.id), { isActive: !rule.isActive })
        
        if (res.success) {
          ElMessage.success(res.message || `${action}成功`)
          // 更新本地数据
          const index = rules.value.findIndex(r => r.id === rule.id)
          if (index !== -1) {
            rules.value[index].isActive = !rule.isActive
          }
        } else {
          ElMessage.error(res.message || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`${action}绩效规则失败:`, error)
          ElMessage.error(`${action}绩效规则失败`)
        }
      } finally {
        loading.value = false
      }
    }
    
    // 删除规则
    const handleDeleteRule = async (rule: PerformanceRule) => {
      try {
        await ElMessageBox.confirm('删除后无法恢复，确定要删除该绩效规则吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        loading.value = true
        const res: ApiResponse = await request.delete(PRINCIPAL_ENDPOINTS.PERFORMANCE_RULE_DELETE(rule.id))
        
        if (res.success) {
          ElMessage.success(res.message || '删除成功')
          // 从列表中移除
          rules.value = rules.value.filter(r => r.id !== rule.id)
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除绩效规则失败:', error)
          ElMessage.error('删除绩效规则失败')
        }
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadRules()
    })
    
    return {
      loading,
      rules,
      filterForm,
      calculationMethodOptions,
      loadRules,
      resetFilter,
      getCalculationMethodLabel,
      getCalculationMethodTagType,
      handleCreateRule,
      handleEditRule,
      handleToggleStatus,
      handleDeleteRule,
      formatDateTime
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.performance-rules-list {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
    flex-wrap: wrap;
    
    .filter-form {
      margin-bottom: var(--spacing-2xl);
    }
    
    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-2xl);
    }
  }
  
  .rule-name {
    display: flex;
    align-items: center;
    
    .status-tag {
      margin-left: var(--spacing-sm);
    }
  }
}
</style> 