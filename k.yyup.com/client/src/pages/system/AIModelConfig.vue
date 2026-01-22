<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">AI模型配置</h1>
      <p class="page-description">管理系统AI模型配置，包括模型参数、API密钥、性能监控等</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalModels }}</div>
                <div class="stat-label">总模型数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <UnifiedIcon name="Check" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeModels }}</div>
                <div class="stat-label">启用模型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon requests">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats.totalRequests) }}</div>
                <div class="stat-label">总请求数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon cost">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatCost(stats.totalCost) }}</div>
                <div class="stat-label">总费用</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索模型名称、提供商"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.provider" placeholder="提供商" clearable>
              <el-option label="全部提供商" value="" />
              <el-option label="OpenAI" value="openai" />
              <el-option label="Claude" value="claude" />
              <el-option label="百度文心" value="baidu" />
              <el-option label="阿里通义" value="alibaba" />
              <el-option label="腾讯混元" value="tencent" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.type" placeholder="模型类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="文本生成" value="text" />
              <el-option label="图像生成" value="image" />
              <el-option label="语音识别" value="speech" />
              <el-option label="翻译" value="translation" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <div class="search-actions">
              <el-button type="primary" @click="handleSearch">
                <UnifiedIcon name="Search" />
                搜索
              </el-button>
              <el-button @click="handleReset">
                <UnifiedIcon name="Refresh" />
                重置
              </el-button>
            </div>
          </el-col>
        </el-row>
        
        <!-- 操作按钮区域 -->
        <el-row :gutter="20" class="action-row">
          <el-col :span="24">
            <div class="action-buttons">
              <el-button type="success" @click="handleCreate">
                <UnifiedIcon name="Plus" />
                新增模型
              </el-button>
              <el-button type="warning" @click="handleBatchTest" :disabled="selectedModels.length === 0">
                批量测试 ({{ selectedModels.length }})
              </el-button>
              <el-button type="danger" @click="handleBatchDelete" :disabled="selectedModels.length === 0">
                批量删除 ({{ selectedModels.length }})
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">模型列表</div>
        <div class="table-actions">
          <span class="selected-info" v-if="selectedModels.length > 0">
            已选择 {{ selectedModels.length }} 个模型
          </span>
        </div>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="displayName" label="模型名称" min-width="150">
          <template #default="{ row }">
            {{ row.displayName || row.modelName || row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="提供商" width="120">
          <template #default="{ row }">
            <el-tag :type="getProviderTagType(row.provider)">
              {{ getProviderLabel(row.provider) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.capabilities)" size="small">
              {{ getTypeLabel(row.capabilities) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.modelStatus)" size="small">
              {{ getStatusLabel(row.modelStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestCount" label="请求数" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.requestCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" width="100">
          <template #default="{ row }">
            ¥{{ formatCost(row.cost) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastUsed" label="最后使用" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.lastUsed) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="table-actions-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                <UnifiedIcon name="eye" />
                查看
              </el-button>
              <el-button type="success" size="small" @click="handleTest(row)">
                <UnifiedIcon name="default" />
                测试
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                <UnifiedIcon name="Delete" />
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑模型对话框 -->
    <el-dialog
      v-model="modelDialogVisible"
      :title="isViewMode ? '查看模型' : (isEdit ? '编辑模型' : '新增模型')"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="modelForm" 
        :rules="modelRules" 
        ref="modelFormRef" 
        label-width="120px"
        :disabled="isViewMode"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="模型名称" prop="name">
                  <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示名称" prop="displayName">
                  <el-input v-model="modelForm.displayName" placeholder="请输入显示名称" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="模型版本" prop="version">
                  <el-input v-model="modelForm.version" placeholder="请输入模型版本" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="上下文窗口">
                  <el-input-number
                    v-model="modelForm.contextWindow"
                    :min="1"
                    :max="128000"
                    placeholder="上下文窗口大小"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="提供商" prop="provider">
                  <el-select v-model="modelForm.provider" placeholder="选择提供商" style="width: 100%">
                    <el-option label="OpenAI" value="openai" />
                    <el-option label="Anthropic" value="anthropic" />
                    <el-option label="Google" value="google" />
                    <el-option label="百度文心" value="baidu" />
                    <el-option label="阿里通义" value="alibaba" />
                    <el-option label="腾讯混元" value="tencent" />
                    <el-option label="本地模型" value="local" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模型类型" prop="type">
                  <el-select v-model="modelForm.type" placeholder="选择模型类型" style="width: 100%">
                    <el-option label="文本生成" value="text" />
                    <el-option label="图像生成" value="image" />
                    <el-option label="语音识别" value="speech" />
                    <el-option label="翻译" value="translation" />
                    <el-option label="多模态" value="multimodal" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="API端点" prop="endpoint">
              <el-input v-model="modelForm.endpoint" placeholder="请输入API端点URL" />
            </el-form-item>

            <el-form-item label="模型描述">
              <el-input
                v-model="modelForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入模型描述"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="认证配置" name="auth">
            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="modelForm.apiKey"
                type="password"
                placeholder="请输入API密钥"
                show-password
              />
            </el-form-item>

            <el-form-item label="组织ID">
              <el-input v-model="modelForm.organizationId" placeholder="请输入组织ID（可选）" />
            </el-form-item>

            <el-form-item label="认证方式" prop="authType">
              <el-radio-group v-model="modelForm.authType">
                <el-radio label="bearer">Bearer Token</el-radio>
                <el-radio label="apikey">API Key</el-radio>
                <el-radio label="oauth">OAuth 2.0</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="参数配置" name="params">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最大Token数">
                  <el-input-number
                    v-model="modelForm.maxTokens"
                    :min="1"
                    :max="32000"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="温度参数">
                  <el-input-number
                    v-model="modelForm.temperature"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Top P">
                  <el-input-number
                    v-model="modelForm.topP"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="频率惩罚">
                  <el-input-number
                    v-model="modelForm.frequencyPenalty"
                    :min="-2"
                    :max="2"
                    :step="0.1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="超时时间(秒)">
                  <el-input-number
                    v-model="modelForm.timeout"
                    :min="1"
                    :max="300"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="重试次数">
                  <el-input-number
                    v-model="modelForm.retryCount"
                    :min="0"
                    :max="5"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="限制配置" name="limits">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="每分钟请求限制">
                  <el-input-number
                    v-model="modelForm.rateLimit"
                    :min="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="每日费用限制">
                  <el-input-number
                    v-model="modelForm.dailyCostLimit"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="状态">
              <el-radio-group v-model="modelForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="计费配置" name="billing">
            <div class="billing-config">
              <el-alert
                title="计费配置说明"
                type="info"
                :closable="false"
                style="margin-bottom: var(--text-2xl)"
              >
                <template #default>
                  <p>设置此模型的计费价格，用于统计和计算使用费用。价格以美元为单位。</p>
                  <p>• 输入Token价格：处理用户输入内容的费用</p>
                  <p>• 输出Token价格：生成AI回复内容的费用</p>
                  <p>• 每百万Token价格：便于快速设置常见的计费标准</p>
                </template>
              </el-alert>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="输入Token价格">
                    <el-input-number
                      v-model="modelForm.inputTokenPrice"
                      :min="0"
                      :precision="6"
                      :step="0.000001"
                      style="width: 100%"
                      placeholder="每个输入Token的价格（美元）"
                    />
                    <div class="form-item-tip">每个输入Token的价格（美元）</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="输出Token价格">
                    <el-input-number
                      v-model="modelForm.outputTokenPrice"
                      :min="0"
                      :precision="6"
                      :step="0.000001"
                      style="width: 100%"
                      placeholder="每个输出Token的价格（美元）"
                    />
                    <div class="form-item-tip">每个输出Token的价格（美元）</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="每百万输入Token价格">
                    <el-input-number
                      v-model="modelForm.inputPricePerMillion"
                      :min="0"
                      :precision="2"
                      style="width: 100%"
                      placeholder="每百万输入Token的价格（美元）"
                      @change="onInputPricePerMillionChange"
                    />
                    <div class="form-item-tip">每百万输入Token的价格（美元）</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="每百万输出Token价格">
                    <el-input-number
                      v-model="modelForm.outputPricePerMillion"
                      :min="0"
                      :precision="2"
                      style="width: 100%"
                      placeholder="每百万输出Token的价格（美元）"
                      @change="onOutputPricePerMillionChange"
                    />
                    <div class="form-item-tip">每百万输出Token的价格（美元）</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="计费类型">
                    <el-select v-model="modelForm.billingType" placeholder="选择计费类型" style="width: 100%">
                      <el-option label="按Token计费" value="token" />
                      <el-option label="按调用次数计费" value="call" />
                      <el-option label="按时间计费" value="time" />
                      <el-option label="固定费用" value="fixed" />
                    </el-select>
                    <div class="form-item-tip">选择此模型的计费方式</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="货币单位">
                    <el-select v-model="modelForm.currency" placeholder="选择货币单位" style="width: 100%">
                      <el-option label="美元 (USD)" value="USD" />
                      <el-option label="人民币 (CNY)" value="CNY" />
                      <el-option label="欧元 (EUR)" value="EUR" />
                    </el-select>
                    <div class="form-item-tip">计费使用的货币单位</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="计费备注">
                <el-input
                  v-model="modelForm.billingNotes"
                  type="textarea"
                  :rows="3"
                  placeholder="可以添加关于此模型计费的备注信息..."
                />
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      
      <template #footer>
        <el-button @click="modelDialogVisible = false">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        <el-button 
          v-if="!isViewMode"
          type="primary" 
          :loading="submitting" 
          @click="handleSaveModel"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 模型测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="模型测试"
      width="700px"
    >
      <div v-if="testModel" class="model-test">
        <div class="test-header">
          <div class="model-info">
            <span class="model-name">{{ testModel.name }}</span>
            <el-tag :type="getProviderTagType(testModel.provider)" size="small">
              {{ getProviderLabel(testModel.provider) }}
            </el-tag>
          </div>
        </div>
        
        <el-form :model="testForm" label-width="100px">
          <el-form-item label="测试内容">
            <el-input
              v-model="testForm.prompt"
              type="textarea"
              :rows="4"
              placeholder="请输入测试内容"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="testing" @click="handleRunTest">
              <UnifiedIcon name="default" />
              运行测试
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="testResult" class="test-result">
          <div class="result-header">
            <span class="result-title">测试结果</span>
            <el-tag :type="testResult.success ? 'success' : 'danger'" size="small">
              {{ testResult.success ? '成功' : '失败' }}
            </el-tag>
          </div>
          
          <div class="result-content">
            <div v-if="testResult.success" class="success-result">
              <div class="result-section">
                <div class="section-title">响应内容</div>
                <div class="section-content">{{ testResult.response }}</div>
              </div>
              
              <div class="result-metrics">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="metric-item">
                      <div class="metric-label">响应时间</div>
                      <div class="metric-value">{{ testResult.responseTime }}ms</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="metric-item">
                      <div class="metric-label">Token消耗</div>
                      <div class="metric-value">{{ testResult.tokensUsed }}</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="metric-item">
                      <div class="metric-label">费用</div>
                      <div class="metric-value">¥{{ formatCost(testResult.cost || 0) }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
            
            <div v-else class="error-result">
              <div class="error-message">{{ testResult.error }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { 
  Cpu, Check, DataLine, Money, Search, Refresh, Plus, View, 
  VideoPlay, Edit, Delete
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '@/utils/request'
import { formatDateTime } from '../../utils/dateFormat'
// 添加真实API调用
import { 
  getAIModels,
  getAIModelStats,
  createAIModel,
  updateAIModel,
  deleteAIModel,
  updateAIModelStatus,
  testAIModel,
  batchTestAIModels,
  batchDeleteAIModels
} from '@/api/modules/system'

// 4. 页面内部类型定义
interface AIModel {
  id?: string;
  name: string
  modelName?: string
  displayName?: string;
  provider: string;
  type: string
  capabilities?: string[];
  version: string;
  endpoint: string
  apiEndpoint?: string
  apiKey: string
  organizationId?: string
  authType: string
  maxTokens: number
  contextWindow?: number;
  temperature: number
  topP: number
  frequencyPenalty: number;
  timeout: number
  retryCount: number
  rateLimit: number
  dailyCostLimit: number;
  status: number
  isActive?: boolean
  isDefault?: boolean
  modelStatus?: string
  requestCount?: number
  cost?: number
  lastUsed?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  // 计费配置字段
  inputTokenPrice?: number;
  outputTokenPrice?: number;
  inputPricePerMillion?: number;
  outputPricePerMillion?: number;
  billingType?: string;
  currency?: string;
  billingNotes?: string;
}

interface ModelStats {
  totalModels: number
  activeModels: number
  totalRequests: number
  totalCost: number
}

interface SearchForm {
  keyword: string;
  provider: string;
  type: string;
  status: string
}

interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

interface TestForm {
  prompt: string
}

interface TestResult {
  success: boolean
  response?: string
  responseTime?: number
  tokensUsed?: number
  cost?: number
  error?: string
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string
  items?: T[]
  total?: number
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const testing = ref(false)

// 统计数据
const stats = ref<ModelStats>({
  totalModels: 0,
  activeModels: 0,
  totalRequests: 0,
  totalCost: 0
})

// 表格数据
const tableData = ref<AIModel[]>([])
const selectedModels = ref<AIModel[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  provider: '',
  type: '',
  status: ''
})

// 分页
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框状态
const modelDialogVisible = ref(false)
const testDialogVisible = ref(false)
const isEdit = ref(false)
const isViewMode = ref(false)
const activeTab = ref('basic')

// 表单数据
const modelFormRef = ref<any>(null)
const modelForm = ref<AIModel>({
  name: '',
  displayName: '',
  provider: '',
  type: '',
  version: 'v1',
  endpoint: '',
  apiKey: '',
  organizationId: '',
  authType: 'bearer',
  maxTokens: 2048,
  contextWindow: 4096,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  timeout: 30,
  retryCount: 3,
  rateLimit: 60,
  dailyCostLimit: 100,
  status: 1,
  // 计费配置默认值
  inputTokenPrice: 0,
  outputTokenPrice: 0,
  inputPricePerMillion: 0,
  outputPricePerMillion: 0,
  billingType: 'token',
  currency: 'USD',
  billingNotes: ''
})

// 表单验证规则
const modelRules: FormRules<AIModel> = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  provider: [
    { required: true, message: '请选择提供商', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  endpoint: [
    { required: true, message: '请输入API端点', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

// 测试相关
const testModel = ref<AIModel | null>(null)
const testForm = ref<TestForm>({
  prompt: ''
})
const testResult = ref<TestResult | null>(null)

// API调用函数
const fetchStats = async () => {
  try {
    const response = await getAIModelStats()
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    }
    
    if (searchForm.value.keyword) params.keyword = searchForm.value.keyword
    if (searchForm.value.provider) params.provider = searchForm.value.provider
    if (searchForm.value.type) params.type = searchForm.value.type
    if (searchForm.value.status) params.status = searchForm.value.status
    
    const response = await getAIModels(params)
    
    if (response.success && response.data) {
      tableData.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
    ElMessage.error('获取模型列表失败')
  } finally {
    loading.value = false
  }
}

// 价格转换方法
const onInputPricePerMillionChange = (value: number) => {
  if (value !== null && value !== undefined) {
    modelForm.value.inputTokenPrice = value / 1000000
  }
}

const onOutputPricePerMillionChange = (value: number) => {
  if (value !== null && value !== undefined) {
    modelForm.value.outputTokenPrice = value / 1000000
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
  provider: '',
  type: '',
  status: ''
  }
  pagination.value.currentPage = 1
  fetchData()
}

// 新增模型
const handleCreate = () => {
  isEdit.value = false
  isViewMode.value = false
  activeTab.value = 'basic'
  modelForm.value = {
    name: '',
    displayName: '',
  provider: '',
  type: '',
  version: 'v1',
  endpoint: '',
    apiKey: '',
    organizationId: '',
    authType: 'bearer',
    maxTokens: 2048,
    contextWindow: 4096,
  temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
  timeout: 30,
    retryCount: 3,
    rateLimit: 60,
    dailyCostLimit: 100,
  status: 1,
    // 计费配置默认值
    inputTokenPrice: 0,
    outputTokenPrice: 0,
    inputPricePerMillion: 0,
    outputPricePerMillion: 0,
    billingType: 'token',
    currency: 'USD',
    billingNotes: ''
  }
  modelDialogVisible.value = true
}

// 编辑模型
const handleEdit = (row: AIModel) => {
  isEdit.value = true
  isViewMode.value = false
  activeTab.value = 'basic'
  
  // 确保所有字段都有正确的默认值，修复字段映射
  modelForm.value = {
    ...row,
  name: row.modelName || row.name || '', // 修复：使用modelName字段
    displayName: row.displayName || row.modelName || row.name || '',
  type: Array.isArray(row.capabilities) ? row.capabilities[0] : row.type || 'text', // 修复：处理capabilities数组;
  endpoint: row.apiEndpoint || row.endpoint || '', // 修复：使用apiEndpoint字段
    apiKey: row.apiKey || '',
  status: row.isActive ? 1 : 0, // 修复：转换布尔值为数字
    contextWindow: row.contextWindow || row.maxTokens || 4096,
  version: row.version || 'v1',
    maxTokens: row.maxTokens || 2048,
  temperature: row.temperature || 0.7,
    topP: row.topP || 1,
    frequencyPenalty: row.frequencyPenalty || 0,
  timeout: row.timeout || 30,
    retryCount: row.retryCount || 3,
    rateLimit: row.rateLimit || 60,
    dailyCostLimit: row.dailyCostLimit || 100,
    authType: row.authType || 'bearer',
    organizationId: row.organizationId || '',
  description: row.description || ''
  }
  
  modelDialogVisible.value = true
}

// 查看模型
const handleView = (row: AIModel) => {
  // 由于没有详情页面，改为在编辑对话框中以只读模式显示
  isEdit.value = true
  activeTab.value = 'basic'
  
  // 填充表单数据，修复字段映射
  modelForm.value = {
    ...row,
  name: row.modelName || row.name || '', // 修复：使用modelName字段
    displayName: row.displayName || row.modelName || row.name || '',
  type: Array.isArray(row.capabilities) ? row.capabilities[0] : row.type || 'text', // 修复：处理capabilities数组;
  endpoint: row.apiEndpoint || row.endpoint || '', // 修复：使用apiEndpoint字段
    apiKey: row.apiKey || '',
  status: row.isActive ? 1 : 0, // 修复：转换布尔值为数字
    contextWindow: row.contextWindow || row.maxTokens || 4096,
  version: row.version || 'v1',
    maxTokens: row.maxTokens || 2048,
  temperature: row.temperature || 0.7,
    topP: row.topP || 1,
    frequencyPenalty: row.frequencyPenalty || 0,
  timeout: row.timeout || 30,
    retryCount: row.retryCount || 3,
    rateLimit: row.rateLimit || 60,
    dailyCostLimit: row.dailyCostLimit || 100,
    authType: row.authType || 'bearer',
    organizationId: row.organizationId || '',
  description: row.description || ''
  }
  
  // 设置为查看模式
  isViewMode.value = true
  modelDialogVisible.value = true
}

// 测试模型
const handleTest = async (row: AIModel) => {
  testModel.value = row
  testForm.value = {
    prompt: '你好，请介绍一下你自己。'
  }
  testResult.value = null
  testDialogVisible.value = true
}

// 运行测试
const handleRunTest = async () => {
  if (!testModel.value) return
  
  try {
    testing.value = true
    testResult.value = null
    
    const response = await testAIModel(testModel.value.id!, {
      message: testForm.value.prompt || '你好，这是一个测试消息'
    })
    
    if (response.success) {
      testResult.value = {
        success: true,
        response: response.data.response || '测试成功',
        responseTime: response.data.responseTime,
        tokensUsed: response.data.tokensUsed,
        cost: response.data.cost
      }
    } else {
      testResult.value = {
        success: false,
        error: response.message || '未知错误'
      }
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      error: error.message || '网络错误'
    }
  } finally {
    testing.value = false
  }
}

const handleStatusChange = async (row: any) => {
  try {
    // 将布尔值转换为后端期望的数字格式
    const statusValue = row.isActive ? 1 : 0
    
    const response = await updateAIModelStatus(row.id, statusValue)
    
    if (response.success) {
      ElMessage.success('状态更新成功')
      
      // 立即更新本地数据
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].isActive = row.isActive
        tableData.value[index].updatedAt = new Date().toISOString()
        console.log('状态本地数据已更新')
      }
      
      // 后台刷新统计数据
      setTimeout(() => {
        fetchStats()
      }, 300)
    } else {
      // 恢复原状态
      row.isActive = !row.isActive
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error: any) {
    // 恢复原状态
    row.isActive = !row.isActive
    ElMessage.error('状态更新失败: ' + (error.message || '网络错误'))
  }
}

// 删除模型
const handleDelete = async (row: AIModel) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模型吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await deleteAIModel(row.id!)
    
    if (response.success) {
      ElMessage.success('删除成功')
      fetchData()
      fetchStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '网络错误'))
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: AIModel[]) => {
  selectedModels.value = selection
}

// 批量测试
const handleBatchTest = async () => {
  try {
    await ElMessageBox.confirm('确定要批量测试选中的模型吗？', '确认批量测试', {
      type: 'warning'
    })
    
    const ids = selectedModels.value.map(model => model.id!)
    const response = await batchTestAIModels(ids)
    
    if (response.success) {
      ElMessage.success('批量测试已启动')
      fetchData()
    } else {
      ElMessage.error(response.message || '批量测试失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量测试失败: ' + (error.message || '网络错误'))
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要批量删除选中的模型吗？此操作不可恢复！', '确认批量删除', {
      type: 'warning'
    })
    
    const ids = selectedModels.value.map(model => model.id!)
    const response = await batchDeleteAIModels(ids)
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      fetchData()
      fetchStats()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败: ' + (error.message || '网络错误'))
    }
  }
}

const handleSaveModel = async () => {
  if (!modelFormRef.value) return
  
  try {
    // 表单验证
    const valid = await modelFormRef.value.validate().catch((errors: any) => {
      console.log('表单验证失败:', errors)
      // 提取第一个错误信息
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          ElMessage.error(firstError[0].message || '表单验证失败')
        } else {
          ElMessage.error('请检查表单输入')
        }
      } else {
        ElMessage.error('表单验证失败')
      }
      return false
    })
    
    if (!valid) return
    
    submitting.value = true
    
    const modelData = {
      name: modelForm.value.name,
      modelName: modelForm.value.name,
      displayName: modelForm.value.displayName || modelForm.value.name,
      provider: modelForm.value.provider,
      version: modelForm.value.version,
      type: modelForm.value.type,
      capabilities: [modelForm.value.type],
      endpoint: modelForm.value.endpoint,
      apiEndpoint: modelForm.value.endpoint,
      apiKey: modelForm.value.apiKey,
      organizationId: modelForm.value.organizationId,
      authType: modelForm.value.authType,
      maxTokens: modelForm.value.maxTokens,
      contextWindow: modelForm.value.contextWindow || modelForm.value.maxTokens,
      temperature: modelForm.value.temperature,
      topP: modelForm.value.topP,
      frequencyPenalty: modelForm.value.frequencyPenalty,
      timeout: modelForm.value.timeout,
      retryCount: modelForm.value.retryCount,
      rateLimit: modelForm.value.rateLimit,
      dailyCostLimit: modelForm.value.dailyCostLimit,
      status: modelForm.value.status,
      isActive: modelForm.value.status === 1,
      isDefault: false,
      description: modelForm.value.description,
      // 计费配置数据
      inputTokenPrice: modelForm.value.inputTokenPrice,
      outputTokenPrice: modelForm.value.outputTokenPrice,
      billingType: modelForm.value.billingType,
      currency: modelForm.value.currency,
      billingNotes: modelForm.value.billingNotes
    }
    
    let response
    if (isEdit.value) {
      response = await updateAIModel(modelForm.value.id!, modelData)
    } else {
      response = await createAIModel(modelData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      modelDialogVisible.value = false
      
      // 如果是编辑模式，直接更新本地数据以获得即时反馈
      if (isEdit.value && modelForm.value.id) {
        const updatedModel = {
          ...modelForm.value,
          modelName: modelForm.value.name,
          displayName: modelForm.value.displayName || modelForm.value.name,
          capabilities: [modelForm.value.type],
          apiEndpoint: modelForm.value.endpoint,
          isActive: modelForm.value.status === 1,
          updatedAt: new Date().toISOString()
        }
        
        // 更新表格中的对应行
        const index = tableData.value.findIndex(item => item.id === modelForm.value.id)
        if (index !== -1) {
          tableData.value[index] = { ...tableData.value[index], ...updatedModel }
          console.log('本地数据已更新')
        }
      }
      
      // 后台刷新数据，确保数据一致性
      setTimeout(async () => {
        await fetchData()
        await fetchStats()
        console.log('后台数据刷新完成')
      }, 500)
      
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  fetchData()
}

// 获取提供商标签类型
const getProviderTagType = (provider: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    openai: 'primary',
  anthropic: 'success',
  google: 'warning',
  baidu: 'info',
  alibaba: 'info',
  tencent: 'info',
  azure: 'info',
  local: 'danger'
  }
  return typeMap[provider] || 'info'
}

const getProviderLabel = (provider: string) => {
  const labelMap: Record<string, string> = {
    openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  baidu: '百度文心',
  alibaba: '阿里通义',
  tencent: '腾讯混元',
  azure: 'Azure',
  local: '本地模型'
  }
  return labelMap[provider] || provider
}

const getTypeTagType = (capabilities: string[] | string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  // 处理数组类型的capabilities
  let type = ''
  if (Array.isArray(capabilities)) {
    type = capabilities[0] || ''
  } else {
    type = capabilities || ''
  }
  
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    text: 'primary',
  image: 'success',
  speech: 'warning',
  translation: 'info',
  multimodal: 'danger'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (capabilities: string[] | string): string => {
  // 处理数组类型的capabilities
  let type = ''
  if (Array.isArray(capabilities)) {
    type = capabilities[0] || ''
  } else {
    type = capabilities || ''
  }
  
  const labelMap: Record<string, string> = {
    text: '文本生成',
  image: '图像生成',
  speech: '语音识别',
  translation: '翻译',
  multimodal: '多模态'
  }
  return labelMap[type] || type || '未知'
}

const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    inactive: 'info',
    warning: 'warning',
    error: 'danger',
    unknown: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '正常',
    inactive: '离线',
    warning: '警告',
    error: '错误',
  unknown: '未知'
  }
  return labelMap[status] || '未知'
}

const formatNumber = (num: number | undefined | null): string => {
  // 安全检查：处理 undefined、null 和非数字值
  if (num === undefined || num === null || typeof num !== 'number' || isNaN(num)) {
    return '0'
  }
  
  // 格式化数字
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  // 确保 num 是有效数字后再调用 toString
  return String(num)
}

const formatCost = (cost: number | undefined): string => {
  if (typeof cost !== 'number') return '0.00'
  return cost.toFixed(2)
}

// 页面初始化
onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：var(--spacing-sm) → var(--app-gap-sm) */
}

.page-description {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.stat-card {
  border: none;
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用全局阴影变量 */
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(var(--transform-hover-lift));
    box-shadow: var(--shadow-md);
    background: var(--bg-hover) !important; /* 白色区域修复：悬停背景色 */
  }
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-md); /* 硬编码修复：var(--spacing-sm) → var(--radius-md) */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap); /* 硬编码修复：var(--text-lg) → var(--app-gap) */
  font-size: var(--text-2xl);
  color: white;

/* 硬编码修复：使用全局渐变变量 */
.stat-icon.total {
  background: var(--gradient-purple);
}

.stat-icon.active {
  background: var(--gradient-blue);
}

.stat-icon.requests {
  background: var(--gradient-green);
}

.stat-icon.cost {
  background: var(--gradient-orange);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-top: var(--spacing-xs);
}

.search-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：添加主题边框 */
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
}

.search-form {
  padding: var(--app-gap-sm) 0; /* 硬编码修复：10px → var(--spacing-sm) */
}

/* 按钮排版修复：搜索操作按钮 */
.search-actions {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
}

/* 按钮排版修复：操作按钮区域 */
.action-row {
  margin-top: var(--app-gap);
  padding-top: var(--app-gap);
  border-top: var(--z-index-dropdown) solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
  flex-wrap: wrap;
}

.table-card {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：添加主题边框 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用全局阴影变量 */
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
  
  /* 白色区域修复：表格完全主题化 */
  :deep(.el-table) {
    background: transparent;
    
    .el-table__header-wrapper {
      background: var(--bg-tertiary);
    }
    
    .el-table__body-wrapper {
      background: transparent;
    }
    
    tr {
      background: transparent !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
    }
    
    th {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
    }
    
    td {
      background: transparent !important;
      color: var(--text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
    }
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：var(--text-lg) → var(--spacing-sm) */
}

.table-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

/* 按钮排版修复：表格操作按钮 */
.table-actions-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  align-items: center;
  
  .el-button {
    margin: 0;
    min-width: 4var(--spacing-sm);
    
    &.el-button--small {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--text-xs);
    }
  }
}

/* 选中信息样式 */
.selected-info {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: var(--app-gap-sm); /* 硬编码修复：var(--text-2xl) → var(--spacing-sm) */
  display: flex;
  justify-content: center;
  
  /* 白色区域修复：分页组件主题化 */
  :deep(.el-pagination) {
    .el-pager li {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: var(--border-width-base) solid var(--border-color);
      
      &:hover {
        background: var(--bg-hover);
      }
      
      &.is-active {
        background: var(--primary-color);
        color: white;
      }
    }
    
    .btn-prev,
    .btn-next {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: var(--border-width-base) solid var(--border-color);
      
      &:hover {
        background: var(--bg-hover);
      }
    }
    
    .el-select .el-input__wrapper {
      background: var(--bg-tertiary);
      border-color: var(--border-color);
    }
  }
}

.model-test {
  padding: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.test-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
  padding-bottom: var(--spacing-4xl);
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.model-info {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm); /* 硬编码修复：10px → var(--spacing-sm) */
}

.model-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

.test-result {
  margin-top: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-sm); /* 硬编码修复：var(--spacing-xs) → var(--radius-sm) */
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.result-header {
  padding: var(--app-gap-sm) 15px; /* 硬编码修复：10px → var(--spacing-sm) */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景色 */
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  display: flex;
  justify-content: space-between;
  align-items: center;

.result-title {
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

.result-content {
  padding: var(--spacing-4xl);
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景色 */
}

.result-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.section-title {
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：10px → var(--spacing-sm) */
}

.section-content {
  padding: var(--app-gap-sm); /* 硬编码修复：10px → var(--spacing-sm) */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景色 */
  border-radius: var(--radius-sm); /* 硬编码修复：var(--spacing-xs) → var(--radius-sm) */
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */

.result-metrics {
  border-top: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  padding-top: var(--spacing-4xl);
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-bottom: var(--spacing-base);
}

.metric-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

.error-result {
  color: var(--danger-color); /* 白色区域修复：使用主题危险色 */
}

.error-message {
  padding: var(--app-gap-sm); /* 硬编码修复：10px → var(--spacing-sm) */
  background: var(--danger-light); /* 白色区域修复：使用主题危险浅色 */
  border-radius: var(--radius-sm); /* 硬编码修复：var(--spacing-xs) → var(--radius-sm) */
  border: var(--border-width-base) solid var(--danger-color); /* 白色区域修复：使用主题危险色边框 */
  color: var(--danger-color); /* 白色区域修复：使用主题危险色文字 */

/* 白色区域修复：对话框主题化 */
:deep(.el-dialog) {
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  
  .el-dialog__header {
    background: var(--bg-tertiary);
    border-bottom: var(--z-index-dropdown) solid var(--border-color);
    
    .el-dialog__title {
      color: var(--text-primary);
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card);
    color: var(--text-primary);
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary);
    border-top: var(--z-index-dropdown) solid var(--border-color);
  }
}

/* 白色区域修复：表单控件主题化 */
:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    
    &:hover {
      border-color: var(--border-light);
    }
    
    &.is-focus {
      border-color: var(--primary-color);
    }
  }
  
  .el-input__inner {
    background: transparent;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-muted);
    }
    
    &:hover {
      border-color: var(--border-light);
    }
    
    &:focus {
      border-color: var(--primary-color);
    }
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
  }
}

:deep(.el-button) {
  &.el-button--default {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--border-light);
    }
  }
}

:deep(.el-radio-group) {
  .el-radio {
    .el-radio__label {
      color: var(--text-primary);
    }
  }
}

:deep(.el-tabs) {
  .el-tabs__header {
    background: var(--bg-tertiary);
    border-bottom: var(--z-index-dropdown) solid var(--border-color);
  }
  
  .el-tabs__nav-wrap {
    background: transparent;
  }
  
  .el-tabs__item {
    color: var(--text-secondary);
    
    &.is-active {
      color: var(--primary-color);
    }
    
    &:hover {
      color: var(--text-primary);
    }
  }
  
  .el-tabs__content {
    background: var(--bg-card);
    color: var(--text-primary);
  }
}

/* 计费配置样式 */
.billing-config {
  padding: var(--app-gap-sm) 0;

  .el-alert {
    margin-bottom: var(--app-gap);

    :deep(.el-alert__content) {
      background: transparent;
      color: var(--text-primary);
    }
  }

  .el-form-item {
    margin-bottom: var(--app-gap);
  }

  .form-item-tip {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
    line-height: 1.4;
  }

  .el-input-number {
    width: 100%;
  }

  .el-select {
    width: 100%;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .ai-model-config-page {
    padding: var(--app-gap-sm); /* 移动端使用更小的间距 */
  }
  
  .stats-cards {
    .el-col {
      margin-bottom: var(--app-gap-sm); /* 从var(--text-lg)减少到var(--spacing-sm) */
    }
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap-sm); /* 从var(--text-lg)减少到var(--spacing-sm) */
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: var(--app-gap-sm);
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .table-actions-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
    
    .el-button {
      width: 100%;
      min-width: auto;
    }
  }
}
}
}
}
}
</style> 