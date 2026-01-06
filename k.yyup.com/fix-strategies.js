/**
 * 幼儿园管理系统自动修复策略
 * 
 * 本文件定义了各种问题的检测规则和修复策略
 * 支持404错误、控制台错误、UI问题等的自动检测和修复
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 修复策略配置
 */
const STRATEGIES = {
  // 404错误修复策略
  missing_components: {
    priority: 'critical',
    autoFix: true,
    detector: 'detect404Errors',
    fixer: 'fixMissingComponent',
    description: '检测并创建缺失的Vue组件',
    examples: [
      'Component not found: AnalyticsCenter.vue',
      'Failed to resolve component: TaskCenter',
      '404 - Page not found'
    ]
  },

  // 控制台错误修复策略
  console_errors: {
    priority: 'high',
    autoFix: false,
    detector: 'detectConsoleErrors',
    fixer: 'suggestConsoleErrorFix',
    description: '检测JavaScript控制台错误并提供修复建议',
    examples: [
      'TypeError: Cannot read property of undefined',
      'ReferenceError: Variable is not defined',
      'Vue warn: Failed to resolve component'
    ]
  },

  // 网络错误修复策略
  network_errors: {
    priority: 'medium',
    autoFix: false,
    detector: 'detectNetworkErrors',
    fixer: 'suggestNetworkErrorFix',
    description: '检测API请求失败并提供修复建议',
    examples: [
      '404 - API endpoint not found',
      '500 - Internal server error',
      'Network request timeout'
    ]
  },

  // UI问题修复策略
  ui_issues: {
    priority: 'low',
    autoFix: false,
    detector: 'detectUIIssues',
    fixer: 'suggestUIFix',
    description: '检测UI交互问题并提供修复建议',
    examples: [
      'Button not clickable',
      'Form validation errors',
      'Missing navigation elements'
    ]
  }
};

/**
 * 组件模板配置
 */
const COMPONENT_TEMPLATES = {
  // 标准中心页面模板
  center: {
    name: 'CenterPageTemplate',
    description: '标准中心页面模板，包含完整的CRUD功能',
    features: [
      'Element Plus UI组件',
      '数据表格展示',
      'CRUD操作按钮',
      '分页功能',
      '搜索过滤',
      '响应式布局'
    ]
  },

  // 管理页面模板
  management: {
    name: 'ManagementPageTemplate',
    description: '管理页面模板，适用于各种数据管理场景',
    features: [
      '左侧导航菜单',
      '数据表格',
      '批量操作',
      '权限控制'
    ]
  },

  // 分析页面模板
  analytics: {
    name: 'AnalyticsPageTemplate',
    description: '数据分析页面模板，包含图表和统计功能',
    features: [
      'ECharts图表集成',
      '数据可视化',
      '导出功能',
      '实时刷新'
    ]
  }
};

/**
 * 问题检测器类
 */
class ProblemDetector {
  /**
   * 检测404错误
   */
  static async detect404Errors(testResult, pageContent) {
    const errors = [];

    // 检查页面标题是否包含404
    if (pageContent?.title?.includes('404') || pageContent?.title?.includes('Not Found')) {
      errors.push({
        type: '404',
        severity: 'critical',
        message: 'Page returns 404 Not Found',
        location: 'page_title',
        autoFixable: true
      });
    }

    // 检查是否有组件加载失败的错误
    if (testResult?.errors?.length > 0) {
      testResult.errors.forEach(error => {
        if (error.message.includes('Component not found') || 
            error.message.includes('Failed to resolve component')) {
          errors.push({
            type: '404',
            severity: 'critical',
            message: error.message,
            location: 'component_loading',
            autoFixable: true
          });
        }
      });
    }

    // 检查路由是否正确匹配
    if (pageContent?.url && !pageContent.url.includes(testResult.path)) {
      errors.push({
        type: '404',
        severity: 'high',
        message: `URL mismatch: expected ${testResult.path}, got ${pageContent.url}`,
        location: 'routing',
        autoFixable: false
      });
    }

    return errors;
  }

  /**
   * 检测控制台错误
   */
  static async detectConsoleErrors(testResult, consoleLogs) {
    const errors = [];

    if (!consoleLogs || !Array.isArray(consoleLogs)) {
      return errors;
    }

    consoleLogs.forEach((log, index) => {
      if (log.type === 'error') {
        let severity = 'medium';
        let autoFixable = false;

        // 判断错误严重程度
        if (log.text.includes('TypeError') || log.text.includes('ReferenceError')) {
          severity = 'high';
        } else if (log.text.includes('Vue warn')) {
          severity = 'medium';
          autoFixable = true;
        }

        errors.push({
          type: 'console',
          severity: severity,
          message: log.text,
          location: `console_log_${index}`,
          autoFixable: autoFixable,
          timestamp: log.timestamp
        });
      }
    });

    return errors;
  }

  /**
   * 检测网络错误
   */
  static async detectNetworkErrors(testResult, networkRequests) {
    const errors = [];

    if (!networkRequests || !Array.isArray(networkRequests)) {
      return errors;
    }

    networkRequests.forEach((request, index) => {
      if (request.status >= 400) {
        let severity = 'medium';
        
        if (request.status >= 500) {
          severity = 'high';
        } else if (request.status === 404) {
          severity = 'medium';
        }

        errors.push({
          type: 'network',
          severity: severity,
          message: `${request.method} ${request.url} - ${request.status} ${request.statusText}`,
          location: `request_${index}`,
          autoFixable: false,
          url: request.url,
          status: request.status
        });
      }
    });

    return errors;
  }

  /**
   * 检测UI问题
   */
  static async detectUIIssues(testResult, uiElements) {
    const errors = [];

    if (!uiElements || !Array.isArray(uiElements)) {
      return errors;
    }

    // 检查预期元素是否存在
    const expectedElements = testResult.expectedElements || [];
    expectedElements.forEach(selector => {
      const found = uiElements.some(element => element.selector === selector);
      if (!found) {
        errors.push({
          type: 'ui',
          severity: 'medium',
          message: `Expected element not found: ${selector}`,
          location: 'ui_elements',
          autoFixable: false,
          selector: selector
        });
      }
    });

    // 检查按钮是否可点击
    uiElements.filter(el => el.type === 'button').forEach((button, index) => {
      if (!button.clickable) {
        errors.push({
          type: 'ui',
          severity: 'low',
          message: `Button not clickable: ${button.text || button.selector}`,
          location: `button_${index}`,
          autoFixable: true,
          selector: button.selector
        });
      }
    });

    return errors;
  }
}

/**
 * 自动修复器类
 */
class AutoFixer {
  /**
   * 修复缺失组件
   */
  static async fixMissingComponent(error, centerConfig, projectPath) {
    const componentName = centerConfig.component;
    const componentPath = path.join(projectPath, 'client/src/pages/centers', `${componentName}.vue`);

    try {
      // 检查组件是否已存在
      await fs.access(componentPath);
      return {
        success: false,
        reason: 'Component already exists',
        path: componentPath
      };
    } catch (e) {
      // 组件不存在，创建新组件
      const template = this.generateCenterComponentTemplate(componentName, centerConfig);
      
      await fs.writeFile(componentPath, template, 'utf8');
      
      return {
        success: true,
        action: 'created',
        path: componentPath,
        description: `Created missing component: ${componentName}`,
        template: 'center'
      };
    }
  }

  /**
   * 生成中心组件模板
   */
  static generateCenterComponentTemplate(componentName, centerConfig) {
    const className = componentName.toLowerCase().replace(/center$/, '');
    
    return `<template>
  <div class="center-container ${className}-center">
    <!-- 页面头部 -->
    <div class="center-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="center-title">
            <el-icon class="title-icon">
              ${this.getIconByCategory(centerConfig.category)}
            </el-icon>
            ${centerConfig.name}
          </h1>
          <p class="center-description">
            ${centerConfig.description}
          </p>
        </div>
        
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建
          </el-button>
          <el-button :icon="Refresh" @click="handleRefresh">
            刷新
          </el-button>
          <el-button :icon="Download" @click="handleExport">
            导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快速统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in statistics" :key="stat.key">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="stat.trend">
                <el-icon v-if="stat.trend === 'up'"><ArrowUp /></el-icon>
                <el-icon v-if="stat.trend === 'down'"><ArrowDown /></el-icon>
                {{ stat.change }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能标签页 -->
    <div class="content-section">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <!-- 数据列表标签页 -->
        <el-tab-pane label="数据管理" name="data">
          <div class="data-management">
            <!-- 搜索和筛选 -->
            <div class="filter-section">
              <el-form :model="filterForm" :inline="true">
                <el-form-item label="搜索">
                  <el-input
                    v-model="filterForm.keyword"
                    placeholder="请输入关键词"
                    :prefix-icon="Search"
                    @input="handleSearch"
                  />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="filterForm.status" placeholder="选择状态">
                    <el-option label="全部" value="" />
                    <el-option label="正常" value="1" />
                    <el-option label="禁用" value="0" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="loadData">搜索</el-button>
                  <el-button @click="resetFilter">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 数据表格 -->
            <div class="table-section">
              <el-table 
                :data="tableData" 
                style="width: 100%"
                v-loading="loading"
                element-loading-text="数据加载中..."
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="名称" min-width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column prop="updateTime" label="更新时间" width="180" />
                <el-table-column label="操作" width="250" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" @click="handleView(row)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 批量操作 -->
              <div class="batch-actions" v-if="selectedItems.length > 0">
                <span>已选择 {{ selectedItems.length }} 项</span>
                <el-button size="small" @click="handleBatchDelete">批量删除</el-button>
                <el-button size="small" @click="handleBatchExport">批量导出</el-button>
              </div>

              <!-- 分页 -->
              <div class="pagination-section">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="pagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 统计分析标签页 -->
        <el-tab-pane label="统计分析" name="analytics">
          <div class="analytics-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card title="趋势图表">
                  <div id="trendChart" style="width: 100%; height: 300px;"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card title="分布图表">
                  <div id="distributionChart" style="width: 100%; height: 300px;"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 系统设置标签页 -->
        <el-tab-pane label="设置" name="settings">
          <div class="settings-section">
            <el-form :model="settingsForm" label-width="120px">
              <el-form-item label="页面标题">
                <el-input v-model="settingsForm.pageTitle" />
              </el-form-item>
              <el-form-item label="每页显示">
                <el-select v-model="settingsForm.pageSize">
                  <el-option label="10条" :value="10" />
                  <el-option label="20条" :value="20" />
                  <el-option label="50条" :value="50" />
                </el-select>
              </el-form-item>
              <el-form-item label="自动刷新">
                <el-switch v-model="settingsForm.autoRefresh" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
                <el-button @click="resetSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="currentItem" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="currentItem.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentItem.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentItem.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Refresh, Download, Search, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const activeTab = ref('data')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const tableData = ref([])
const selectedItems = ref([])

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = ref([
  { key: 'total', label: '总计', value: 0, change: '0%', trend: 'up' },
  { key: 'active', label: '活跃', value: 0, change: '0%', trend: 'up' },
  { key: 'pending', label: '待处理', value: 0, change: '0%', trend: 'down' },
  { key: 'completed', label: '已完成', value: 0, change: '0%', trend: 'up' }
])

// 当前编辑项
const currentItem = reactive({
  id: null,
  name: '',
  description: '',
  status: 1
})

// 设置表单
const settingsForm = reactive({
  pageTitle: '${centerConfig.name}',
  pageSize: 20,
  autoRefresh: false
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const handleCreate = () => {
  dialogTitle.value = '新建'
  Object.assign(currentItem, {
    id: null,
    name: '',
    description: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑'
  Object.assign(currentItem, row)
  dialogVisible.value = true
}

const handleView = (row: any) => {
  ElMessage.info(\`查看详情: \${row.name}\`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      \`确定要删除 "\${row.name}" 吗？\`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟删除操作
    ElMessage.success('删除成功')
    loadData()
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      \`确定要删除选中的 \${selectedItems.value.length} 项吗？\`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    ElMessage.success(\`成功删除 \${selectedItems.value.length} 项\`)
    selectedItems.value = []
    loadData()
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleBatchExport = () => {
  ElMessage.success(\`开始导出 \${selectedItems.value.length} 项数据\`)
}

const handleSave = async () => {
  // 这里应该调用实际的API
  ElMessage.success(currentItem.id ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadData()
}

const handleDialogClose = () => {
  // 重置表单
}

const handleRefresh = () => {
  loadData()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const resetFilter = () => {
  Object.assign(filterForm, {
    keyword: '',
    status: ''
  })
  loadData()
}

const handleSelectionChange = (selection: any[]) => {
  selectedItems.value = selection
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'analytics') {
    nextTick(() => {
      initCharts()
    })
  }
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadData()
}

const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'success',
    0: 'info',
    [-1]: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '正常',
    0: '禁用',
    [-1]: '删除'
  }
  return statusMap[status] || '未知'
}

const saveSettings = () => {
  ElMessage.success('设置保存成功')
}

const resetSettings = () => {
  Object.assign(settingsForm, {
    pageTitle: '${centerConfig.name}',
    pageSize: 20,
    autoRefresh: false
  })
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = Array.from({ length: pagination.pageSize }, (_, index) => {
      const id = (pagination.currentPage - 1) * pagination.pageSize + index + 1
      return {
        id,
        name: \`项目 \${id}\`,
        description: \`这是项目 \${id} 的描述信息\`,
        status: Math.random() > 0.5 ? 1 : 0,
        createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleString(),
        updateTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
      }
    })
    
    tableData.value = mockData
    pagination.total = 100 // 模拟总数
    
    // 更新统计数据
    statistics.value[0].value = pagination.total
    statistics.value[1].value = Math.floor(pagination.total * 0.7)
    statistics.value[2].value = Math.floor(pagination.total * 0.2)
    statistics.value[3].value = Math.floor(pagination.total * 0.1)
    
    ElMessage.success('数据加载完成')
  } catch (error) {
    ElMessage.error('数据加载失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 趋势图表
  const trendChart = echarts.init(document.getElementById('trendChart'))
  trendChart.setOption({
    title: {
      text: '数据趋势'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110],
      type: 'line',
      smooth: true
    }]
  })
  
  // 分布图表
  const distributionChart = echarts.init(document.getElementById('distributionChart'))
  distributionChart.setOption({
    title: {
      text: '状态分布'
    },
    series: [{
      name: '状态分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 70, name: '正常' },
        { value: 20, name: '待处理' },
        { value: 10, name: '异常' }
      ]
    }]
  })
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.center-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);

  .center-header {
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .title-section {
        .center-title {
          display: flex;
          align-items: center;
          font-size: 24px;
          color: #303133;
          margin: 0 0 8px 0;

          .title-icon {
            margin-right: 12px;
            font-size: 28px;
            color: #409eff;
          }
        }

        .center-description {
          color: #606266;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        text-align: center;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .content-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .filter-section {
      padding: 20px 20px 0 20px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 20px;
    }

    .table-section {
      padding: 0 20px 20px 20px;

      .batch-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 4px;
        margin: 16px 0;
      }

      .pagination-section {
        margin-top: 20px;
        text-align: right;
      }
    }

    .analytics-section,
    .settings-section {
      padding: 20px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .center-container {
    padding: 16px;

    .center-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }
    }

    .stats-section {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }
  }
}

// ${className}中心特定样式
.${className}-center {
  // 可以在这里添加特定于此中心的样式
  .center-title .title-icon {
    color: ${this.getColorByCategory(centerConfig.category)};
  }
}
</style>
`;
  }

  /**
   * 根据分类获取图标
   */
  static getIconByCategory(category) {
    const iconMap = {
      'core': '<Monitor />',
      'business': '<Management />',
      'management': '<User />',
      'marketing': '<Promotion />',
      'intelligence': '<DataAnalysis />',
      'system': '<Setting />',
      'crm': '<UserFilled />',
      'productivity': '<List />',
      'analytics': '<TrendCharts />',
      'default': '<Document />'
    };
    
    return iconMap[category] || iconMap.default;
  }

  /**
   * 根据分类获取颜色
   */
  static getColorByCategory(category) {
    const colorMap = {
      'core': '#409eff',
      'business': '#67c23a',
      'management': '#e6a23c',
      'marketing': '#f56c6c',
      'intelligence': '#9c27b0',
      'system': '#606266',
      'crm': '#ff9800',
      'productivity': '#4caf50',
      'analytics': '#2196f3',
      'default': '#909399'
    };
    
    return colorMap[category] || colorMap.default;
  }

  /**
   * 为控制台错误提供修复建议
   */
  static async suggestConsoleErrorFix(error, centerConfig) {
    const suggestions = [];

    if (error.message.includes('Cannot read property') && error.message.includes('undefined')) {
      suggestions.push({
        type: 'code',
        priority: 'high',
        description: '空值引用错误',
        solution: '添加空值检查',
        code: `// 修复前
const value = object.property.subProperty;

// 修复后
const value = object?.property?.subProperty || defaultValue;`,
        files: ['*.vue', '*.js', '*.ts']
      });
    }

    if (error.message.includes('ReferenceError') && error.message.includes('is not defined')) {
      const variable = error.message.match(/'(\w+)' is not defined/)?.[1];
      suggestions.push({
        type: 'import',
        priority: 'high',
        description: `变量 ${variable} 未定义`,
        solution: '检查变量导入和声明',
        code: `// 确保正确导入
import { ${variable} } from 'appropriate-module'

// 或者在组件中声明
const ${variable} = ref() // 或 reactive()`,
        files: ['*.vue']
      });
    }

    if (error.message.includes('Vue warn: Failed to resolve component')) {
      const component = error.message.match(/Failed to resolve component: (\w+)/)?.[1];
      suggestions.push({
        type: 'component',
        priority: 'medium',
        description: `组件 ${component} 未找到`,
        solution: '检查组件导入和注册',
        code: `// 确保组件正确导入
import ${component} from '@/components/${component}.vue'

// 在 components 选项中注册
export default {
  components: {
    ${component}
  }
}`,
        files: ['*.vue']
      });
    }

    return suggestions;
  }

  /**
   * 为网络错误提供修复建议
   */
  static async suggestNetworkErrorFix(error, centerConfig) {
    const suggestions = [];

    if (error.status === 404) {
      suggestions.push({
        type: 'api',
        priority: 'medium',
        description: 'API端点不存在',
        solution: '检查API路径和后端路由配置',
        code: `// 检查API端点是否正确
const apiUrl = '/api/${centerConfig.id}';

// 确保后端路由已定义
router.get('${error.url.replace('http://localhost:3000', '')}', (req, res) => {
  // API处理逻辑
});`,
        files: ['server/routes/*.js', 'client/src/api/*.js']
      });
    }

    if (error.status >= 500) {
      suggestions.push({
        type: 'server',
        priority: 'high',
        description: '服务器内部错误',
        solution: '检查后端代码和数据库连接',
        code: `// 添加错误处理
try {
  const result = await api.getData();
  return result;
} catch (error) {
  console.error('API Error:', error);
  throw new Error('服务暂时不可用');
}`,
        files: ['server/**/*.js', 'client/src/utils/request.js']
      });
    }

    if (error.message.includes('timeout')) {
      suggestions.push({
        type: 'network',
        priority: 'low',
        description: '网络请求超时',
        solution: '增加超时时间或优化API性能',
        code: `// 增加超时配置
axios.defaults.timeout = 30000;

// 或在特定请求中设置
const response = await axios.get(url, {
  timeout: 30000
});`,
        files: ['client/src/utils/request.js']
      });
    }

    return suggestions;
  }

  /**
   * 为UI问题提供修复建议
   */
  static async suggestUIFix(error, centerConfig) {
    const suggestions = [];

    if (error.message.includes('Button not clickable')) {
      suggestions.push({
        type: 'ui',
        priority: 'low',
        description: '按钮无法点击',
        solution: '检查按钮事件绑定和CSS样式',
        code: `<!-- 确保事件正确绑定 -->
<el-button @click="handleClick">点击</el-button>

<!-- 检查CSS是否阻止了点击 -->
.button-container {
  pointer-events: none; /* 移除此属性 */
}`,
        files: ['*.vue', '*.css', '*.scss']
      });
    }

    if (error.message.includes('Expected element not found')) {
      const selector = error.selector;
      suggestions.push({
        type: 'template',
        priority: 'medium',
        description: `缺少预期元素: ${selector}`,
        solution: '在模板中添加缺少的元素',
        code: `<!-- 添加缺少的元素 -->
<div class="${selector.replace('.', '')}">
  <!-- 元素内容 -->
</div>`,
        files: ['*.vue']
      });
    }

    return suggestions;
  }
}

/**
 * 修复策略执行器
 */
class StrategyExecutor {
  /**
   * 执行所有适用的修复策略
   */
  static async executeStrategies(testResult, context) {
    const allFixes = [];

    for (const [strategyName, strategy] of Object.entries(STRATEGIES)) {
      try {
        const detector = ProblemDetector[strategy.detector];
        const fixer = AutoFixer[strategy.fixer];

        if (!detector || !fixer) {
          console.warn(`Strategy ${strategyName} has missing detector or fixer`);
          continue;
        }

        // 执行检测
        const problems = await detector(testResult, context);
        
        // 对每个问题执行修复
        for (const problem of problems) {
          if (strategy.autoFix && problem.autoFixable) {
            const fix = await fixer(problem, testResult, context.projectPath);
            if (fix) {
              allFixes.push({
                strategy: strategyName,
                problem: problem,
                fix: fix,
                priority: strategy.priority
              });
            }
          } else {
            // 提供修复建议
            const suggestions = await fixer(problem, testResult);
            allFixes.push({
              strategy: strategyName,
              problem: problem,
              suggestions: suggestions,
              priority: strategy.priority
            });
          }
        }
      } catch (error) {
        console.error(`Error executing strategy ${strategyName}:`, error);
      }
    }

    // 按优先级排序
    return allFixes.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 生成修复报告
   */
  static generateFixReport(fixes) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: fixes.length,
        autoFixed: fixes.filter(f => f.fix && f.fix.success).length,
        suggestions: fixes.filter(f => f.suggestions).length
      },
      fixes: fixes,
      recommendations: this.generateRecommendations(fixes)
    };

    return report;
  }

  /**
   * 生成修复建议
   */
  static generateRecommendations(fixes) {
    const recommendations = [];

    // 按问题类型分组统计
    const problemTypes = {};
    fixes.forEach(fix => {
      const type = fix.problem.type;
      if (!problemTypes[type]) {
        problemTypes[type] = [];
      }
      problemTypes[type].push(fix);
    });

    // 为每种问题类型生成建议
    Object.entries(problemTypes).forEach(([type, typeFixes]) => {
      const count = typeFixes.length;
      const strategy = STRATEGIES[Object.keys(STRATEGIES).find(s => 
        STRATEGIES[s].detector.includes(type)
      )];

      if (strategy) {
        recommendations.push({
          type: type,
          count: count,
          priority: strategy.priority,
          description: strategy.description,
          suggestion: count > 1 
            ? `发现 ${count} 个${strategy.description}问题，建议批量处理`
            : `发现 1 个${strategy.description}问题，建议优先处理`
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

module.exports = {
  STRATEGIES,
  COMPONENT_TEMPLATES,
  ProblemDetector,
  AutoFixer,
  StrategyExecutor
};