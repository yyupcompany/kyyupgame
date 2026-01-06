<template>
  <UnifiedCenterLayout
    title="客户池中心"
    description="这里是客户管理的核心平台，您可以管理客户信息、跟进客户状态、分析客户数据、提高转化率"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreate">
        <UnifiedIcon name="Plus" />
        新建客户
      </el-button>
    </template>

    <div class="center-container customer-pool-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 概览标签页 -->
        <el-tab-pane label="概览" name="overview">
          <div class="overview-content">
        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-cards">
            <StatCard
              v-for="stat in overviewStats"
              :key="stat.key"
              :title="stat.title"
              :value="stat.value"
              :unit="stat.unit"
              :trend="stat.trend"
              :trend-text="stat.trendText"
              :type="stat.type"
              :icon-name="stat.iconName"
              clickable
              @click="handleStatClick(stat)"
            />
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <div class="charts-grid-unified">
            <div class="cds-row">
              <div class="cds-col-lg-12 cds-col-md-12 cds-col-sm-4">
                <ChartContainer
                  title="客户转化趋势"
                  subtitle="最近6个月客户转化数据"
                  :options="conversionTrendChart"
                  :loading="chartsLoading"
                  height="350px"
                  @refresh="refreshCharts"
                />
              </div>
              <div class="cds-col-lg-12 cds-col-md-12 cds-col-sm-4">
                <ChartContainer
                  title="客户来源分析"
                  subtitle="各渠道客户分布情况"
                  :options="sourceDistributionChart"
                  :loading="chartsLoading"
                  height="350px"
                  @refresh="refreshCharts"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions-section">
          <div class="cds-grid">
            <div class="cds-row">
              <div class="cds-col-lg-8 cds-col-md-4 cds-col-sm-4">
                <div class="primary-actions">
                  <ActionToolbar
                    :primary-actions="quickActions"
                    size="default"
                    align="left"
                    @action-click="handleQuickAction"
                  />
                </div>
              </div>
              <div class="cds-col-lg-8 cds-col-md-4 cds-col-sm-4">
                <div class="secondary-actions">
                  <ActionToolbar
                    :primary-actions="secondaryActions"
                    size="default"
                    align="right"
                    @action-click="handleSecondaryAction"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </el-tab-pane>

        <!-- 客户管理标签页 -->
        <el-tab-pane label="客户管理" name="customers">
          <div class="customers-content">
        <!-- 🎯 新增：筛选工具栏 -->
        <div class="filter-toolbar">
          <div class="filter-left">
            <el-button
              :type="filterUnassigned ? 'danger' : 'default'"
              @click="toggleUnassignedFilter"
            >
              {{ filterUnassigned ? '✓ ' : '' }}未分配客户
              <el-badge
                v-if="unassignedCount > 0"
                :value="unassignedCount"
                class="filter-badge"
              />
            </el-button>
            <span v-if="filterUnassigned" class="filter-tip">
              正在显示 {{ customersTotal }} 个未分配客户
            </span>
          </div>
          <div class="filter-right">
            <el-button
              type="primary"
              :loading="aiAssignLoading"
              :disabled="selectedCustomerIds.length === 0"
              @click="handleAIAssign"
            >
              🤖 AI智能分配
              <span v-if="selectedCustomerIds.length > 0" class="selected-count">
                ({{ selectedCustomerIds.length }})
              </span>
            </el-button>
          </div>
        </div>

        <div class="customers-layout">
          <!-- 左侧：客户列表 -->
          <div class="customers-list">
            <DataTable
              :data="customersData"
              :columns="customersColumns"
              :loading="customersLoading"
              :total="customersTotal"
              :current-page="customersPage"
              :page-size="customersPageSize"
              selectable
              @create="handleCreateCustomer"
              @edit="handleEditCustomer"
              @delete="handleDeleteCustomer"
              @row-click="handleCustomerRowClick"
              @selection-change="handleCustomerSelectionChange"
              @current-change="handleCustomersPageChange"
              @size-change="handleCustomersPageSizeChange"
              @search="handleCustomersSearch"
            >
              <!-- 孩子年龄列 -->
              <template #column-childAge="{ row }">
                <span v-if="row.childAge" class="child-age">
                  {{ formatChildAge(row.childAge) }}
                </span>
                <span v-else class="text-gray">未填写</span>
              </template>

              <!-- 意向程度列 -->
              <template #column-intentionLevel="{ row }">
                <el-tag
                  v-if="row.intentionLevel"
                  :type="getIntentionLevelType(row.intentionLevel)"
                  size="small"
                >
                  {{ getIntentionLevelText(row.intentionLevel) }}
                </el-tag>
                <span v-else class="text-gray">未评估</span>
              </template>

              <!-- 状态列 -->
              <template #column-status="{ value }">
                <el-tag :type="getCustomerStatusType(value)">
                  {{ getCustomerStatusText(value) }}
                </el-tag>
              </template>

              <!-- 来源列 -->
              <template #column-source="{ value }">
                <el-tag :type="getSourceType(value)" size="small">
                  {{ getSourceText(value) }}
                </el-tag>
              </template>

              <!-- 负责人列 - 未分配客户醒目标注 -->
              <template #column-teacher="{ row }">
                <el-tag v-if="!row.teacher || row.teacher === '-'" type="danger" size="small">
                  待分配
                </el-tag>
                <span v-else class="teacher-name">{{ row.teacher }}</span>
              </template>

              <!-- 最后跟进时间列 -->
              <template #column-lastFollowupTime="{ row }">
                <span v-if="row.lastFollowupTime" :class="getFollowupTimeClass(row.lastFollowupTime)">
                  {{ formatFollowupTime(row.lastFollowupTime) }}
                </span>
                <span v-else class="text-gray">未跟进</span>
              </template>

              <!-- 预计入园时间列 -->
              <template #column-expectedEnrollmentDate="{ row }">
                <span v-if="row.expectedEnrollmentDate" class="enrollment-date">
                  {{ formatEnrollmentDate(row.expectedEnrollmentDate) }}
                </span>
                <span v-else class="text-gray">未确定</span>
              </template>

              <!-- 操作列 -->
              <template #column-actions="{ row }">
                <el-button-group>
                  <el-button size="small" @click="handleFollowUp(row)">
                    跟进
                  </el-button>
                  <el-button size="small" @click="handleAssignCustomer(row)">
                    分配
                  </el-button>
                  <el-button size="small" type="primary" @click="handleViewDetail(row)">
                    详情
                  </el-button>
                </el-button-group>
              </template>
            </DataTable>
          </div>

          <!-- 右侧：客户详情 -->
          <div class="customer-detail">
            <DetailPanel
              title="客户详情"
              :data="selectedCustomer"
              :sections="customerDetailSections"
              :loading="customerDetailLoading"
              editable
              @save="handleCustomerDetailSave"
            />
          </div>
        </div>
      </div>
        </el-tab-pane>

        <!-- 跟进记录标签页 -->
        <el-tab-pane label="跟进记录" name="followups">
          <div class="followups-content">
        <!-- 🎯 新增：跟进质量分析工具栏 -->
        <div class="followup-analysis-toolbar">
          <div class="toolbar-left">
            <h3 class="toolbar-title">跟进记录管理</h3>
          </div>
          <div class="toolbar-right">
            <el-button
              type="success"
              :loading="analysisLoading"
              @click="handleAnalyzeFollowup"
            >
              📊 分析跟进质量
            </el-button>
            <el-button
              type="primary"
              :loading="pdfGenerating"
              @click="handleGeneratePDF"
            >
              📄 生成PDF报告
            </el-button>
          </div>
        </div>

        <!-- 🎯 新增：跟进质量分析面板 -->
        <div v-if="showAnalysisPanel" class="followup-analysis-panel">
          <FollowupAnalysisPanel
            :analysis-data="analysisData"
            :loading="analysisLoading"
            @close="handleCloseAnalysis"
            @refresh="handleAnalyzeFollowup"
          />
        </div>

        <div class="followups-layout">
          <!-- 左侧：跟进记录列表 -->
          <div class="followups-list">
            <DataTable
              :data="followupsData"
              :columns="followupsColumns"
              :loading="followupsLoading"
              :total="followupsTotal"
              :current-page="followupsPage"
              :page-size="followupsPageSize"
              @create="handleCreateFollowup"
              @edit="handleEditFollowup"
              @delete="handleDeleteFollowup"
              @row-click="handleFollowupRowClick"
              @current-change="handleFollowupsPageChange"
              @size-change="handleFollowupsPageSizeChange"
              @search="handleFollowupsSearch"
            >
              <template #column-type="{ value }">
                <el-tag :type="getFollowupTypeColor(value)" size="small">
                  {{ getFollowupTypeText(value) }}
                </el-tag>
              </template>
              <template #column-result="{ value }">
                <el-tag :type="getFollowupResultColor(value)" size="small">
                  {{ getFollowupResultText(value) }}
                </el-tag>
              </template>
            </DataTable>
          </div>

          <!-- 右侧：跟进详情 -->
          <div class="followup-detail">
            <DetailPanel
              title="跟进详情"
              :data="selectedFollowup"
              :sections="followupDetailSections"
              :loading="followupDetailLoading"
              editable
              @save="handleFollowupDetailSave"
            />
          </div>
        </div>
      </div>
        </el-tab-pane>

        <!-- 数据分析标签页 -->
        <el-tab-pane label="数据分析" name="analytics">
          <div class="analytics-content">
        <!-- 分析统计卡片 -->
        <div class="analytics-stats">
          <div class="stats-cards">
            <StatCard
              v-for="stat in analyticsStats"
              :key="stat.key"
              :title="stat.title"
              :value="stat.value"
              :unit="stat.unit"
              :trend="stat.trend"
              :trend-text="stat.trendText"
              :type="stat.type"
              :icon-name="stat.iconName"
            />
          </div>
        </div>

        <!-- 分析图表 -->
        <div class="analytics-charts">
          <div class="charts-grid-unified">
            <div class="cds-row">
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="客户转化漏斗"
                  subtitle="客户转化各阶段数据"
                  :options="conversionFunnelChart"
                  :loading="chartsLoading"
                  height="400px"
                />
              </div>
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="跟进效果分析"
                  subtitle="不同跟进方式的转化效果"
                  :options="followupEffectChart"
                  :loading="chartsLoading"
                  height="400px"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 分析操作 -->
        <div class="analytics-actions">
          <ActionToolbar
            :primary-actions="analyticsActions"
            size="default"
            align="center"
            @action-click="handleAnalyticsAction"
          />
        </div>
      </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- AI智能分配对话框 -->
    <AIAssignDialog
      v-model="showAIAssignDialog"
      :customer-ids="selectedCustomerIds"
      @success="handleAIAssignSuccess"
      @cancel="handleAIAssignCancel"
    />

    <!-- 分配客户对话框 -->
    <el-dialog
      v-model="showAssignDialog"
      title="分配客户"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="客户姓名">
          <el-input :value="assignCustomer?.name" disabled />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input :value="assignCustomer?.phone" disabled />
        </el-form-item>
        <el-form-item label="选择负责人" required>
          <el-select
            v-model="assignTeacherId"
            placeholder="请选择负责人"
            filterable
            class="full-width-select"
          >
            <el-option
              v-for="teacher in teachersList"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancelAssign">取消</el-button>
        <el-button
          type="primary"
          :loading="assignLoading"
          @click="handleConfirmAssign"
        >
          确认分配
        </el-button>
      </template>
    </el-dialog>

    <!-- PDF生成选项对话框 -->
    <PDFOptionsDialog
      v-model="showPDFOptionsDialog"
      :teachers="availableTeachers"
      :statistics="analysisData?.statistics"
      :ai-analysis="analysisData?.aiAnalysis"
      @confirm="handlePDFOptionsConfirm"
    />

    <!-- 🎯 SOP详情抽屉 -->
    <el-drawer
      v-model="sopDrawerVisible"
      :title="`${selectedCustomerForSop?.customerName || '客户'} - SOP跟进详情`"
      direction="rtl"
      size="65%"
      :before-close="handleCloseSopDrawer"
    >
      <div v-if="selectedCustomerForSop" class="sop-drawer-content">
        <!-- 客户基本信息 -->
        <div class="customer-info-section">
          <el-card shadow="never">
            <div class="customer-header">
              <el-avatar 
                :size="64" 
                :src="selectedCustomerForSop.avatar"
                class="customer-avatar"
              >
                {{ selectedCustomerForSop.customerName?.charAt(0) || '客' }}
              </el-avatar>
              <div class="customer-basic">
                <h3>{{ selectedCustomerForSop.customerName }}</h3>
                <div class="customer-meta">
                  <el-tag size="small" type="info">
                    <UnifiedIcon name="phone" /> {{ selectedCustomerForSop.phone }}
                  </el-tag>
                  <el-tag size="small" type="warning">
                    <UnifiedIcon name="map-pin" /> {{ selectedCustomerForSop.source }}
                  </el-tag>
                  <el-tag size="small" :type="selectedCustomerForSop.sopStage >= 6 ? 'success' : 'primary'">
                    当前阶段: SOP {{ selectedCustomerForSop.sopStage }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- SOP进度步骤条 -->
        <div class="sop-progress-section">
          <el-card shadow="never">
            <template #header>
              <div class="section-header">
                <h3>SOP进度</h3>
                <span class="stage-info">
                  已完成 {{ selectedCustomerForSop.sopStage - 1 }} / 7 个阶段
                </span>
              </div>
            </template>
            <el-steps 
              :active="selectedCustomerForSop.sopStage - 1" 
              align-center
              finish-status="success"
            >
              <el-step 
                v-for="stage in SOP_STAGES" 
                :key="stage.id"
                :title="stage.name"
                :description="stage.description"
              />
            </el-steps>
          </el-card>
        </div>

        <!-- 当前阶段任务清单 -->
        <div class="sop-tasks-section">
          <el-card shadow="never">
            <template #header>
              <div class="section-header">
                <h3>当前阶段任务</h3>
                <el-tag type="primary">
                  {{ SOP_STAGES[selectedCustomerForSop.sopStage - 1]?.name || '未知阶段' }}
                </el-tag>
              </div>
            </template>
            <el-checkbox-group v-model="completedTasks" @change="handleTaskComplete">
              <div 
                v-for="task in getCurrentStageTasks(selectedCustomerForSop.sopStage)"
                :key="task.id"
                class="task-item"
              >
                <el-checkbox :label="task.id">
                  <div class="task-content">
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-description">{{ task.description }}</span>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </el-card>
        </div>

        <!-- SOP话术模板 -->
        <div class="sop-script-section">
          <el-card shadow="never">
            <template #header>
              <h3>SOP话术模板</h3>
            </template>
            <el-collapse>
              <el-collapse-item title="开场白" name="opening">
                <p>{{ getSopScript(selectedCustomerForSop.sopStage, 'opening') }}</p>
              </el-collapse-item>
              <el-collapse-item title="核心话术" name="keyPoints">
                <ul class="key-points-list">
                  <li 
                    v-for="(point, idx) in getSopScript(selectedCustomerForSop.sopStage, 'keyPoints')" 
                    :key="idx"
                  >
                    {{ point }}
                  </li>
                </ul>
              </el-collapse-item>
              <el-collapse-item title="结束语" name="closing">
                <p>{{ getSopScript(selectedCustomerForSop.sopStage, 'closing') }}</p>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>

        <!-- SOP更新日志 -->
        <div class="sop-logs-section">
          <el-card shadow="never">
            <template #header>
              <div class="section-header">
                <h3>SOP更新日志</h3>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleAddSopLog"
                >
                  <UnifiedIcon name="Plus" /> 添加日志
                </el-button>
              </div>
            </template>
            <el-timeline v-if="sopLogs.length > 0">
              <el-timeline-item
                v-for="log in sopLogs"
                :key="log.id"
                :timestamp="log.timestamp"
                placement="top"
              >
                <div class="log-content">
                  <div class="log-header">
                    <el-tag size="small" type="success">
                      {{ log.fromStage }} → {{ log.toStage }}
                    </el-tag>
                    <span class="log-author">{{ log.teacherName }}</span>
                  </div>
                  <p class="log-text">{{ log.content }}</p>
                  <p v-if="log.customerFeedback" class="customer-feedback">
                    <strong>客户反馈：</strong>{{ log.customerFeedback }}
                  </p>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无SOP更新日志" />
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 组件导入
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/centers/StatCard.vue'
import ChartContainer from '@/components/centers/ChartContainer.vue'
import ActionToolbar from '@/components/centers/ActionToolbar.vue'
import DataTable from '@/components/centers/DataTable.vue'
import DetailPanel from '@/components/centers/DetailPanel.vue'
import AIAssignDialog from '@/components/customer/AIAssignDialog.vue'
import FollowupAnalysisPanel from '@/components/customer/FollowupAnalysisPanel.vue'
import PDFOptionsDialog from '@/components/customer/PDFOptionsDialog.vue'

// API导入
import { get, post, put, del } from '@/utils/request'
import { CUSTOMER_ENDPOINTS } from '@/api/endpoints'
import {
  createIdColumn,
  createNameColumn,
  createPhoneColumn,
  createEmailColumn,
  createStatusColumn,
  createTextColumn,
  createDateTimeColumn,
  createActionsColumn
} from '@/utils/table-config'

const router = useRouter()
const route = useRoute()


// 响应式数据
const activeTab = ref('overview')
const chartsLoading = ref(false)

// 概览统计数据
const overviewStats = ref([
  { key: 'total', title: '总客户数', value: 0, unit: '人', type: 'primary', iconName: 'user', trend: 12, trendText: '较上月' },
  { key: 'new', title: '本月新增', value: 0, unit: '人', type: 'success', iconName: 'plus', trend: 8, trendText: '较上月' },
  { key: 'unassigned', title: '未分配', value: 0, unit: '人', type: 'warning', iconName: 'warning', trend: -5, trendText: '较上月' },
  { key: 'converted', title: '本月转化', value: 0, unit: '人', type: 'info', iconName: 'check', trend: 15, trendText: '转化率' }
])

// 客户管理数据
const customersData = ref([])
const customersLoading = ref(false)
const customersTotal = ref(0)
const customersPage = ref(1)
const customersPageSize = ref(20)
const selectedCustomer = ref(null)
const customerDetailLoading = ref(false)
// 🎯 新增：筛选状态
const filterUnassigned = ref(false) // 是否只显示未分配客户
// 🎯 新增：AI智能分配相关
const selectedCustomerIds = ref<number[]>([]) // 选中的客户ID列表
const aiAssignLoading = ref(false) // AI分配加载状态
const showAIAssignDialog = ref(false) // 显示AI分配对话框
// 🎯 新增：单个客户分配相关
const showAssignDialog = ref(false) // 显示分配对话框
const assignCustomer = ref<any>(null) // 待分配的客户
const assignTeacherId = ref('') // 选中的教师ID
const assignLoading = ref(false) // 分配加载状态
const teachersList = ref<any[]>([]) // 教师列表

// 跟进记录数据
const followupsData = ref([])
const followupsLoading = ref(false)
const followupsTotal = ref(0)
const followupsPage = ref(1)
const followupsPageSize = ref(20)
const selectedFollowup = ref(null)
const followupDetailLoading = ref(false)
// 🎯 新增：跟进质量分析相关
const showAnalysisPanel = ref(false) // 显示分析面板
const analysisLoading = ref(false) // 分析加载状态
const analysisData = ref<any>(null) // 分析数据
const pdfGenerating = ref(false) // PDF生成状态
const showPDFOptionsDialog = ref(false) // PDF选项对话框
const availableTeachers = ref<any[]>([]) // 可用教师列表

// 🎯 新增：SOP相关
const sopDrawerVisible = ref(false) // SOP抽屉可见性
const selectedCustomerForSop = ref<any>(null) // 选中的客户（用于SOP详情）
const sopLogs = ref<any[]>([]) // SOP更新日志
const funnelLoading = ref(false) // 漏斗图加载状态
const sopFunnelChart = ref<any>({}) // SOP漏斗图配置
const completedTasks = ref<string[]>([]) // 已完成的任务ID列表

// SOP阶段定义
const SOP_STAGES = [
  { id: 1, name: '初次接触', description: '建立联系，了解基本情况' },
  { id: 2, name: '需求分析', description: '深入了解客户需求' },
  { id: 3, name: '方案推荐', description: '提供个性化解决方案' },
  { id: 4, name: '试听安排', description: '安排试听体验课程' },
  { id: 5, name: '异议处理', description: '解决客户疑虑和问题' },
  { id: 6, name: '促成签约', description: '完成签约转化' },
  { id: 7, name: '转介绍', description: '推荐新客户' }
]

// SOP阶段任务模板
const SOP_STAGE_TASKS = {
  1: [
    { id: 't1-1', title: '初次电话联系', description: '与客户进行第一通电话沟通', completed: false },
    { id: 't1-2', title: '添加微信好友', description: '添加客户微信，建立长期联系渠道', completed: false },
    { id: 't1-3', title: '发送欢迎消息', description: '发送园所介绍和欢迎信息', completed: false }
  ],
  2: [
    { id: 't2-1', title: '了解孩子年龄', description: '确认孩子当前年龄和发展阶段', completed: false },
    { id: 't2-2', title: '询问教育期望', description: '了解家长对教育的期望和关注点', completed: false },
    { id: 't2-3', title: '确认预算范围', description: '了解家长的预算接受范围', completed: false }
  ],
  3: [
    { id: 't3-1', title: '介绍课程体系', description: '详细介绍适合的课程和特色', completed: false },
    { id: 't3-2', title: '发送案例资料', description: '分享成功案例和学员反馈', completed: false },
    { id: 't3-3', title: '推荐合适班级', description: '根据需求推荐最适合的班级', completed: false }
  ],
  4: [
    { id: 't4-1', title: '预约试听时间', description: '与家长确定试听的具体时间', completed: false },
    { id: 't4-2', title: '发送试听须知', description: '提前告知试听流程和注意事项', completed: false },
    { id: 't4-3', title: '试听后回访', description: '试听后及时回访了解感受', completed: false }
  ],
  5: [
    { id: 't5-1', title: '记录客户疑虑', description: '详细记录客户的顾虑和问题', completed: false },
    { id: 't5-2', title: '提供解决方案', description: '针对性地解答和提供证明材料', completed: false },
    { id: 't5-3', title: '邀请实地参观', description: '邀请到园所实地考察', completed: false }
  ],
  6: [
    { id: 't6-1', title: '发送合同条款', description: '提供合同详情供家长查阅', completed: false },
    { id: 't6-2', title: '说明优惠政策', description: '告知当前的优惠活动', completed: false },
    { id: 't6-3', title: '办理入学手续', description: '协助完成入学相关手续', completed: false }
  ],
  7: [
    { id: 't7-1', title: '收集满意度', description: '了解家长的满意程度', completed: false },
    { id: 't7-2', title: '请求推荐', description: '请家长推荐给身边的朋友', completed: false },
    { id: 't7-3', title: '提供推荐奖励', description: '说明转介绍的奖励政策', completed: false }
  ]
}

// SOP话术模板
const SOP_SCRIPTS = {
  1: {
    opening: '您好！我是XX幼儿园的老师，很高兴为您服务。听说您有兴趣了解我们的课程，请问现在方便聊几分钟吗？',
    keyPoints: [
      '简单介绍园所的办学理念和特色',
      '询问孩子的基本情况（年龄、性格等）',
      '了解家长是通过什么渠道了解到我们的',
      '表达我们的专业性和热情'
    ]
  },
  2: {
    opening: '感谢您上次的沟通，今天想和您深入了解一下您对孩子教育的期望和需求。',
    keyPoints: [
      '深入了解家长对孩子未来发展的期望',
      '询问孩子目前的学习和生活习惯',
      '了解家长对幼儿园的具体要求',
      '确认家长最关心的教育方面'
    ]
  },
  3: {
    opening: '根据您的需求，我为您精心挑选了最适合宝宝的课程方案，请您看看是否满意。',
    keyPoints: [
      '展示最匹配的课程体系和特色',
      '强调我们的差异化优势',
      '分享类似案例的成功经验',
      '解答家长对方案的疑问'
    ]
  },
  4: {
    opening: '为了让您更好地了解我们的教学环境和课程特色，我们特别为您安排了一次免费试听体验。',
    keyPoints: [
      '说明试听的流程和安排',
      '强调试听的价值和意义',
      '提醒家长试听时的注意事项',
      '确认具体的试听时间和地点'
    ]
  },
  5: {
    opening: '我了解到您还有一些顾虑，这很正常。让我详细为您解答，帮助您做出最好的选择。',
    keyPoints: [
      '认真倾听客户的每一个疑虑',
      '用事实和案例来打消顾虑',
      '提供第三方的认证和证明',
      '邀请实地考察增强信任'
    ]
  },
  6: {
    opening: '经过这段时间的了解，相信您对我们已经有了充分的认可。现在正好有优惠活动，我们一起来看看入学手续吧。',
    keyPoints: [
      '说明当前的优惠政策和截止时间',
      '强调名额有限，需要尽快确定',
      '详细说明合同条款和保障',
      '提供便捷的支付和办理方式'
    ]
  },
  7: {
    opening: '很高兴您选择了我们，宝宝在这里一定会健康快乐地成长。如果您身边有朋友也在找幼儿园，欢迎推荐给我们。',
    keyPoints: [
      '表达感谢和承诺提供优质服务',
      '说明转介绍的奖励政策',
      '请求在朋友圈分享好评',
      '保持长期的联系和服务'
    ]
  }
}

// 分析统计数据
const analyticsStats = ref([
  { key: 'conversion_rate', title: '总转化率', value: 0, unit: '%', type: 'primary', iconName: 'trend-charts' },
  { key: 'avg_followup', title: '平均跟进次数', value: 0, unit: '次', type: 'success', iconName: 'chat-dot-round' },
  { key: 'avg_cycle', title: '平均转化周期', value: 0, unit: '天', type: 'warning', iconName: 'timer' },
  { key: 'best_source', title: '最佳来源', value: '线上广告', unit: '', type: 'info', iconName: 'promotion' }
])

// 事件处理
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  loadTabData(tab)
}

const handleCreate = () => {
  router.push('/customer/create')
}

const handleStatClick = (stat: any) => {
  ElMessage.info(`查看${stat.title}详情`)
}

const loadTabData = async (tab: string) => {
  switch (tab) {
    case 'overview':
      await loadOverviewData()
      break
    case 'customers':
      await loadCustomersData()
      break
    case 'followups':
      await loadFollowupsData()
      break
    case 'analytics':
      await loadAnalyticsData()
      break
  }
}

const loadOverviewData = async () => {
  try {
    console.log('🔄 开始获取客户池统计数据...')
    const response = await get(CUSTOMER_ENDPOINTS.POOL_STATS)
    console.log('📊 客户池统计API响应:', response)

    if (response.success) {
      const stats = response.data
      console.log('📊 客户池统计数据:', stats)

      // 适配后端返回的字段名
      overviewStats.value = [
        {
          key: 'total',
          title: '总客户数',
          value: stats.totalCustomers || stats.total || 0,
          unit: '人',
          type: 'primary',
          iconName: 'user',
          trend: 12,
          trendText: '较上月'
        },
        {
          key: 'new',
          title: '本月新增',
          value: stats.newCustomersThisMonth || stats.newToday || 0,
          unit: '人',
          type: 'success',
          iconName: 'plus',
          trend: 8,
          trendText: '较上月'
        },
        {
          key: 'unassigned',
          title: '未分配',
          value: stats.unassignedCustomers || stats.followUp || 0,
          unit: '人',
          type: 'warning',
          iconName: 'warning',
          trend: -5,
          trendText: '较上月'
        },
        {
          key: 'converted',
          title: '本月转化',
          value: stats.convertedCustomersThisMonth || stats.converted || 0,
          unit: '人',
          type: 'info',
          iconName: 'check',
          trend: 15,
          trendText: '转化率'
        }
      ]
      console.log('📊 映射后的统计数据:', overviewStats.value)
    } else {
      console.error('❌ 客户池统计API返回失败:', response)
      ElMessage.error(response.message || '获取客户池统计数据失败')
    }
  } catch (error) {
    console.error('❌ 加载客户池概览数据失败:', error)
    ElMessage.error('加载概览数据失败')
  }
}

// 客户列表列配置
const customersColumns = [
  createIdColumn(),
  createNameColumn('客户姓名', 'name', 'long'),
  createPhoneColumn('联系电话', 'phone'),
  createTextColumn('孩子年龄', 'childAge', 'short', { type: 'custom', align: 'center' }),
  createStatusColumn('意向程度', 'intentionLevel', { type: 'tag' }),
  createStatusColumn('来源', 'source', { type: 'tag', width: 110 }),
  createStatusColumn('状态', 'status', { type: 'tag' }),
  createTextColumn('负责人', 'teacher', 'medium', { align: 'center' }),
  createTextColumn('最后跟进', 'lastFollowupTime', 'short', { type: 'custom', align: 'center', width: 110 }),
  createTextColumn('预计入园', 'expectedEnrollmentDate', 'short', { type: 'custom', align: 'center', width: 110 }),
  createDateTimeColumn('创建时间', 'createTime', { width: 140 }),
  createActionsColumn('操作', 'medium')
]

// 跟进记录列配置
const followupsColumns = [
  { prop: 'id', label: 'ID', width: 100 },
  { prop: 'customerName', label: '客户姓名', width: 140 },
  { prop: 'followupMethod', label: '跟进方式', width: 120 },
  { prop: 'followupContent', label: '跟进内容', width: 220 },
  { prop: 'followupResult', label: '跟进结果', width: 120 },
  { prop: 'followupTime', label: '跟进时间', width: 160 },
  { prop: 'nextFollowup', label: '下次跟进', width: 160 }
]

// 🎯 新增：包含SOP阶段的列配置
const followupsColumnsWithSop = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'customerName', label: '客户姓名', width: 120 },
  { 
    prop: 'sopStage', 
    label: 'SOP阶段', 
    width: 150,
    sortable: 'custom',  // 支持排序
    slot: 'column-sopStage'
  },
  { prop: 'followupMethod', label: '跟进方式', width: 100 },
  { prop: 'followupContent', label: '最新跟进', width: 200 },
  { prop: 'teacherName', label: '负责老师', width: 100 },
  { prop: 'followupTime', label: '最后跟进', width: 140 },
  { prop: 'nextFollowup', label: '下次跟进', width: 140 }
]

// 客户详情配置
const customerDetailSections = [
  {
    title: '基本信息',
    fields: [
      { key: 'name', label: '客户姓名' },
      { key: 'phone', label: '联系电话' },
      { key: 'email', label: '邮箱地址' },
      { key: 'address', label: '联系地址' }
    ]
  },
  {
    title: '客户状态',
    fields: [
      { key: 'source', label: '来源渠道' },
      { key: 'status', label: '当前状态' },
      { key: 'assignee', label: '负责人' },
      { key: 'intentionLevel', label: '意向级别' }
    ]
  }
]

// 跟进详情配置
const followupDetailSections = [
  {
    title: '跟进信息',
    fields: [
      { key: 'type', label: '跟进方式' },
      { key: 'content', label: '跟进内容' },
      { key: 'result', label: '跟进结果' },
      { key: 'followupDate', label: '跟进时间' }
    ]
  }
]

// 快速操作配置
const quickActions = [
  { key: 'import', label: '导入客户', type: 'primary', icon: 'Upload' },
  { key: 'export', label: '导出数据', type: 'default', icon: 'Download' },
  { key: 'batch_assign', label: '批量分配', type: 'warning', icon: 'User' }
]

const secondaryActions = [
  { key: 'refresh', label: '刷新数据', type: 'default', icon: 'Refresh' },
  { key: 'settings', label: '设置', type: 'default', icon: 'Setting' }
]

const analyticsActions = [
  { key: 'export_report', label: '导出报告', type: 'primary', icon: 'Document' },
  { key: 'schedule_report', label: '定时报告', type: 'default', icon: 'Timer' }
]

// 图表配置
const conversionTrendChart = ref({
  title: { text: '客户转化趋势' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value' },
  series: [{
    data: [120, 200, 150, 80, 70, 110],
    type: 'line',
    smooth: true
  }]
})

const sourceDistributionChart = ref({
  title: { text: '客户来源分布' },
  series: [{
    type: 'pie',
    data: [
      { value: 335, name: '线上广告' },
      { value: 310, name: '朋友介绍' },
      { value: 234, name: '线下活动' },
      { value: 135, name: '电话咨询' },
      { value: 148, name: '其他' }
    ]
  }]
})

const conversionFunnelChart = ref({
  title: { text: '客户转化漏斗' },
  series: [{
    type: 'funnel',
    data: [
      { value: 100, name: '潜在客户' },
      { value: 80, name: '意向客户' },
      { value: 60, name: '跟进客户' },
      { value: 40, name: '试听客户' },
      { value: 20, name: '成交客户' }
    ]
  }]
})

const followupEffectChart = ref({
  title: { text: '跟进效果分析' },
  xAxis: { type: 'category', data: ['电话', '微信', '面谈', '邮件', '其他'] },
  yAxis: { type: 'value' },
  series: [{
    data: [85, 92, 78, 65, 45],
    type: 'bar'
  }]
})

// 数据加载方法
const loadCustomersData = async () => {
  try {
    customersLoading.value = true
    const response = await get(CUSTOMER_ENDPOINTS.POOL, {
      page: customersPage.value,
      pageSize: customersPageSize.value
    })
    if (response.success) {
      // 🎯 处理返回的数据，添加关键信息字段（如果后端没有返回）
      const items = (response.data.items || []).map((item: any, index: number) => {
        // 为演示目的，为前几条数据添加模拟的关键信息
        // 实际生产环境中，这些数据应该由后端API返回
        const enhancedItem = { ...item }

        // 如果没有孩子年龄，根据索引添加模拟数据（仅用于演示）
        if (!enhancedItem.childAge && index < 10) {
          const ages = [3, 4, 2, 5, 3, 4, 2, 3, 5, 4]
          enhancedItem.childAge = ages[index]
        }

        // 如果没有意向程度，根据状态推断（仅用于演示）
        if (!enhancedItem.intentionLevel) {
          const status = item.status?.toUpperCase()
          if (status === 'INTERESTED') {
            enhancedItem.intentionLevel = 'HIGH'
          } else if (status === 'CONTACTED' || status === 'FOLLOWING') {
            enhancedItem.intentionLevel = 'MEDIUM'
          } else if (status === 'NEW') {
            enhancedItem.intentionLevel = 'LOW'
          }
        }

        // 如果没有最后跟进时间，使用创建时间（仅用于演示）
        if (!enhancedItem.lastFollowupTime && item.createdAt) {
          // 随机减去几天，模拟跟进时间
          const daysAgo = Math.floor(Math.random() * 15)
          const followupDate = new Date(item.createdAt)
          followupDate.setDate(followupDate.getDate() - daysAgo)
          enhancedItem.lastFollowupTime = followupDate.toISOString()
        }

        // 如果没有预计入园时间，根据孩子年龄推算（仅用于演示）
        if (!enhancedItem.expectedEnrollmentDate && enhancedItem.childAge) {
          const currentYear = new Date().getFullYear()
          const currentMonth = new Date().getMonth()
          // 9月入园
          const enrollmentYear = currentMonth >= 9 ? currentYear + 1 : currentYear
          enhancedItem.expectedEnrollmentDate = `${enrollmentYear}-09-01`
        }

        return enhancedItem
      })

      // 🎯 如果启用了未分配筛选，过滤数据
      const filteredItems = filterUnassigned.value
        ? items.filter((item: any) => !item.teacher || item.teacher === '-')
        : items

      customersData.value = filteredItems
      customersTotal.value = filterUnassigned.value
        ? filteredItems.length
        : (response.data.total || 0)
    }
  } catch (error) {
    console.error('加载客户数据失败:', error)
    ElMessage.error('加载客户数据失败')
  } finally {
    customersLoading.value = false
  }
}

const loadFollowupsData = async () => {
  try {
    followupsLoading.value = true
    // 这里应该调用跟进记录的API
    // const response = await get('/api/followups', { ... })
    // 暂时使用模拟数据（🎯 新增sopStage和teacherName字段）
    followupsData.value = [
      {
        id: 1,
        customerName: '张三家长',
        sopStage: 4,  // SOP阶段：试听安排
        teacherName: '王老师',
        followupMethod: '电话',
        followupContent: '已成功预约周三上午10点试听，发送了试听须知',
        followupResult: '有意向',
        followupTime: '2025-01-02 10:30:00',
        nextFollowup: '2025-01-05 14:00:00',
        phone: '13800138001',
        source: '线上咨询',
        avatar: ''
      },
      {
        id: 2,
        customerName: '李四家长',
        sopStage: 2,  // SOP阶段：需求分析
        teacherName: '李老师',
        followupMethod: '微信',
        followupContent: '深入了解家长对孩子的教育期望，确认预算范围',
        followupResult: '考虑中',
        followupTime: '2025-01-02 15:20:00',
        nextFollowup: '2025-01-06 09:00:00',
        phone: '13800138002',
        source: '朋友推荐',
        avatar: ''
      },
      {
        id: 3,
        customerName: '王五家长',
        sopStage: 5,  // SOP阶段：异议处理
        teacherName: '张老师',
        followupMethod: '面谈',
        followupContent: '实地参观后，解答了关于师资和课程的疑虑',
        followupResult: '非常满意',
        followupTime: '2025-01-01 16:00:00',
        nextFollowup: '2025-01-03 10:00:00',
        phone: '13800138003',
        source: '广告投放',
        avatar: ''
      },
      {
        id: 4,
        customerName: '赵六家长',
        sopStage: 3,  // SOP阶段：方案推荐
        teacherName: '王老师',
        followupMethod: '电话',
        followupContent: '推荐了适合3岁孩子的蒙氏班，发送了课程介绍',
        followupResult: '需要考虑',
        followupTime: '2025-01-01 11:15:00',
        nextFollowup: '2025-01-08 14:30:00',
        phone: '13800138004',
        source: '地推活动',
        avatar: ''
      },
      {
        id: 5,
        customerName: '孙七家长',
        sopStage: 6,  // SOP阶段：促成签约
        teacherName: '李老师',
        followupMethod: '微信',
        followupContent: '已发送合同，说明优惠政策，客户表示周末签约',
        followupResult: '很感兴趣',
        followupTime: '2024-12-31 09:45:00',
        nextFollowup: '2025-01-04 16:00:00',
        phone: '13800138005',
        source: '老客推荐',
        avatar: ''
      }
    ]
    followupsTotal.value = 5
  } catch (error) {
    console.error('加载跟进数据失败:', error)
  } finally {
    followupsLoading.value = false
  }
}

const loadAnalyticsData = async () => {
  try {
    // 加载分析数据
    analyticsStats.value = [
      { key: 'conversion_rate', title: '总转化率', value: 15.2, unit: '%', type: 'primary', iconName: 'trend-charts' },
      { key: 'avg_followup', title: '平均跟进次数', value: 3.5, unit: '次', type: 'success', iconName: 'chat-dot-round' },
      { key: 'avg_cycle', title: '平均转化周期', value: 12, unit: '天', type: 'warning', iconName: 'timer' },
      { key: 'best_source', title: '最佳来源', value: '线上广告', unit: '', type: 'info', iconName: 'promotion' }
    ]
  } catch (error) {
    console.error('加载分析数据失败:', error)
  }
}

// 事件处理方法
const handleCreateCustomer = () => {
  router.push('/customer/create')
}

const handleEditCustomer = (customer: any) => {
  router.push(`/customer/edit/${customer.id}`)
}

const handleDeleteCustomer = async (customer: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个客户吗？', '确认删除', {
      type: 'warning'
    })
    await del(CUSTOMER_ENDPOINTS.POOL_BY_ID(customer.id))
    ElMessage.success('删除成功')
    loadCustomersData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleCustomerRowClick = (customer: any) => {
  selectedCustomer.value = customer
}

const handleFollowUp = (customer: any) => {
  ElMessage.info(`跟进客户: ${customer.name}`)
}

const handleAssignCustomer = (customer: any) => {
  assignCustomer.value = customer
  showAssignDialog.value = true
  loadTeachersList()
}

// 加载教师列表
const loadTeachersList = async () => {
  try {
    const response = await get('/api/teachers', {
      page: 1,
      pageSize: 100
    })
    if (response.success) {
      teachersList.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载教师列表失败:', error)
    ElMessage.error('加载教师列表失败')
  }
}

// 确认分配
const handleConfirmAssign = async () => {
  if (!assignTeacherId.value) {
    ElMessage.warning('请选择负责人')
    return
  }

  assignLoading.value = true
  try {
    const response = await post('/api/customer-pool/assign', {
      customerId: assignCustomer.value.id,
      teacherId: assignTeacherId.value
    })

    if (response.success) {
      ElMessage.success('分配成功')
      showAssignDialog.value = false
      assignTeacherId.value = ''
      loadCustomersData()
      loadOverviewData()
    }
  } catch (error) {
    console.error('分配失败:', error)
    ElMessage.error('分配失败,请重试')
  } finally {
    assignLoading.value = false
  }
}

// 取消分配
const handleCancelAssign = () => {
  showAssignDialog.value = false
  assignTeacherId.value = ''
}

const handleViewDetail = (customer: any) => {
  router.push(`/customer/detail/${customer.id}`)
}

const handleCustomersPageChange = (page: number) => {
  customersPage.value = page
  loadCustomersData()
}

const handleCustomersPageSizeChange = (size: number) => {
  customersPageSize.value = size
  customersPage.value = 1
  loadCustomersData()
}

const handleCustomersSearch = (keyword: string) => {
  console.log('搜索客户:', keyword)
  loadCustomersData()
}

const handleCustomerDetailSave = (data: any) => {
  console.log('保存客户详情:', data)
  ElMessage.success('客户详情已保存')
}

// 🎯 新增：未分配客户筛选相关方法
const unassignedCount = computed(() => {
  // 从概览统计中获取未分配客户数量
  const unassignedStat = overviewStats.value.find(stat => stat.key === 'unassigned')
  return unassignedStat?.value || 0
})

const toggleUnassignedFilter = () => {
  filterUnassigned.value = !filterUnassigned.value
  customersPage.value = 1 // 重置到第一页
  loadCustomersData()
}

// 🎯 新增：AI智能分配相关方法
const handleCustomerSelectionChange = (selection: any[]) => {
  selectedCustomerIds.value = selection.map(item => item.id)
  console.log('选中的客户ID:', selectedCustomerIds.value)
}

const handleAIAssign = () => {
  if (selectedCustomerIds.value.length === 0) {
    ElMessage.warning('请先选择要分配的客户')
    return
  }
  showAIAssignDialog.value = true
}

const handleAIAssignSuccess = () => {
  showAIAssignDialog.value = false
  selectedCustomerIds.value = []
  loadCustomersData() // 重新加载客户数据
  loadOverviewData() // 重新加载概览数据
  ElMessage.success('AI智能分配成功')
}

const handleAIAssignCancel = () => {
  showAIAssignDialog.value = false
}

// 跟进记录相关方法
const handleCreateFollowup = () => {
  ElMessage.info('创建跟进记录')
}

const handleEditFollowup = (followup: any) => {
  ElMessage.info(`编辑跟进记录: ${followup.id}`)
}

const handleDeleteFollowup = (followup: any) => {
  ElMessage.info(`删除跟进记录: ${followup.id}`)
}

const handleFollowupRowClick = (followup: any) => {
  // 🎯 修改：点击行时打开SOP抽屉而不是右侧面板
  selectedCustomerForSop.value = followup
  sopDrawerVisible.value = true
  loadSopLogs(followup.id)
}

const handleFollowupsPageChange = (page: number) => {
  followupsPage.value = page
  loadFollowupsData()
}

const handleFollowupsPageSizeChange = (size: number) => {
  followupsPageSize.value = size
  followupsPage.value = 1
  loadFollowupsData()
}

const handleFollowupsSearch = (keyword: string) => {
  console.log('搜索跟进记录:', keyword)
  loadFollowupsData()
}

const handleFollowupDetailSave = (data: any) => {
  console.log('保存跟进详情:', data)
  ElMessage.success('跟进详情已保存')
}

// 🎯 新增：跟进质量分析相关方法
const handleAnalyzeFollowup = async () => {
  analysisLoading.value = true
  showAnalysisPanel.value = true

  try {
    // 调用跟进质量统计API
    const statsResponse = await get('/followup/analysis')

    if (statsResponse.success) {
      // 提取教师ID列表
      const teacherIds = statsResponse.data?.teachers?.map((t: any) => t.id) || []
      
      // 调用AI深度分析API (增加超时时间到120秒,因为AI分析需要较长时间)
      const aiResponse = await post('/followup/ai-analysis', {
        teacherIds: teacherIds,
        analysisType: 'detailed'
      }, {
        timeout: 120000 // 120秒超时
      })

      if (aiResponse.success) {
        analysisData.value = {
          statistics: statsResponse.data,
          aiAnalysis: aiResponse.data
        }
        ElMessage.success('跟进质量分析完成')
      } else {
        ElMessage.error(aiResponse.message || 'AI分析失败')
      }
    } else {
      ElMessage.error(statsResponse.message || '获取统计数据失败')
    }
  } catch (err: any) {
    console.error('跟进质量分析失败:', err)
    ElMessage.error(err.message || '分析失败，请稍后重试')
  } finally {
    analysisLoading.value = false
  }
}

const handleCloseAnalysis = () => {
  showAnalysisPanel.value = false
}

const handleGeneratePDF = async () => {
  if (!analysisData.value) {
    ElMessage.warning('请先进行跟进质量分析')
    return
  }

  // 加载教师列表
  try {
    const response = await get('/teachers')
    availableTeachers.value = response.data || []
  } catch (err: any) {
    console.error('加载教师列表失败:', err)
    availableTeachers.value = []
  }

  // 打开PDF选项对话框
  showPDFOptionsDialog.value = true
}

const handlePDFOptionsConfirm = async (options: any) => {
  pdfGenerating.value = true

  try {
    const response = await post('/followup/generate-pdf', {
      statistics: analysisData.value.statistics,
      aiAnalysis: analysisData.value.aiAnalysis,
      options
    }, {
      responseType: 'blob' // 接收二进制数据
    })

    // 创建下载链接
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 根据模式生成文件名
    let filename = '跟进质量分析报告'
    if (options.title) {
      filename = options.title
    } else if (options.mode === 'single') {
      const teacher = availableTeachers.value.find(t => t.id === options.teacherId)
      filename = `${teacher?.name || '教师'}_跟进质量分析报告`
    } else if (options.mode === 'batch') {
      filename = `批量教师_跟进质量分析报告`
    }
    filename += `_${new Date().toISOString().split('T')[0]}.pdf`

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('PDF报告生成成功')
  } catch (err: any) {
    console.error('PDF生成失败:', err)
    ElMessage.error(err.message || 'PDF生成失败，请稍后重试')
  } finally {
    pdfGenerating.value = false
  }
}

// 快速操作方法
const handleQuickAction = (action: any) => {
  switch (action.key) {
    case 'import':
      ElMessage.info('导入客户功能')
      break
    case 'export':
      ElMessage.info('导出数据功能')
      break
    case 'batch_assign':
      ElMessage.info('批量分配功能')
      break
  }
}

const handleSecondaryAction = (action: any) => {
  switch (action.key) {
    case 'refresh':
      loadTabData(activeTab.value)
      ElMessage.success('数据已刷新')
      break
    case 'settings':
      ElMessage.info('设置功能')
      break
  }
}

const handleAnalyticsAction = (action: any) => {
  switch (action.key) {
    case 'export_report':
      ElMessage.info('导出报告功能')
      break
    case 'schedule_report':
      ElMessage.info('定时报告功能')
      break
  }
}

const refreshCharts = () => {
  chartsLoading.value = true
  setTimeout(() => {
    chartsLoading.value = false
    ElMessage.success('图表已刷新')
  }, 1000)
}

// 状态和类型转换方法
const getCustomerStatusType = (status: string) => {
  // 转换为大写以匹配后端返回的枚举值
  const statusUpper = status?.toUpperCase() || ''
  const typeMap: Record<string, string> = {
    // 新客户 - 蓝色
    'NEW': 'primary',
    // 有意向 - 绿色
    'INTERESTED': 'success',
    // 跟进中 - 橙色
    'CONTACTED': 'warning',
    'FOLLOWING': 'warning',
    // 已转化 - 紫色（使用info，Element Plus没有purple类型）
    'CONVERTED': 'info',
    // 已流失 - 红色
    'LOST': 'danger',
    // 其他 - 灰色
    'OTHER': 'info'
  }
  return typeMap[statusUpper] || 'info'
}

const getCustomerStatusText = (status: string) => {
  // 转换为大写以匹配后端返回的枚举值
  const statusUpper = status?.toUpperCase() || ''
  const textMap: Record<string, string> = {
    'NEW': '新客户',
    'INTERESTED': '有意向',
    'CONTACTED': '已联系',
    'FOLLOWING': '跟进中',
    'CONVERTED': '已转化',
    'LOST': '已流失',
    'NOT_INTERESTED': '无意向',
    'OTHER': '其他'
  }
  return textMap[statusUpper] || status
}

const getSourceType = (source: string) => {
  // 转换为大写以匹配后端返回的枚举值
  const sourceUpper = source?.toUpperCase() || ''
  const typeMap: Record<string, string> = {
    'ONLINE': 'primary',      // 线上 - 蓝色
    'REFERRAL': 'success',    // 推荐 - 绿色
    'OFFLINE': 'warning',     // 线下 - 橙色
    'PHONE': 'info',          // 电话 - 灰色
    'WECHAT': 'success',      // 微信 - 绿色
    'WEBSITE': 'primary',     // 官网 - 蓝色
    'ADVERTISEMENT': 'warning', // 广告 - 橙色
    'OTHER': 'info'           // 其他 - 灰色
  }
  return typeMap[sourceUpper] || 'info'
}

const getSourceText = (source: string) => {
  // 转换为大写以匹配后端返回的枚举值
  const sourceUpper = source?.toUpperCase() || ''
  const textMap: Record<string, string> = {
    'ONLINE': '线上推广',
    'REFERRAL': '朋友推荐',
    'OFFLINE': '线下活动',
    'PHONE': '电话咨询',
    'WECHAT': '微信咨询',
    'WEBSITE': '官网注册',
    'ADVERTISEMENT': '广告投放',
    'OTHER': '其他渠道'
  }
  return textMap[sourceUpper] || source
}

const getFollowupTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    phone: 'primary',
    wechat: 'success',
    visit: 'warning',
    email: 'info'
  }
  return colorMap[type] || 'default'
}

const getFollowupTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    phone: '电话跟进',
    wechat: '微信沟通',
    visit: '上门拜访',
    email: '邮件联系'
  }
  return textMap[type] || type
}

const getFollowupResultColor = (result: string) => {
  const colorMap: Record<string, string> = {
    interested: 'success',
    considering: 'warning',
    not_interested: 'danger',
    converted: 'primary'
  }
  return colorMap[result] || 'default'
}

// 🎯 新增：关键信息列格式化方法

// 格式化孩子年龄
const formatChildAge = (age: number | string) => {
  if (!age) return '未填写'
  const ageNum = typeof age === 'string' ? parseInt(age) : age
  if (isNaN(ageNum)) return '未填写'

  // 根据年龄返回不同格式
  if (ageNum < 1) return '0-1岁'
  if (ageNum >= 1 && ageNum < 2) return '1-2岁'
  if (ageNum >= 2 && ageNum < 3) return '2-3岁'
  if (ageNum >= 3 && ageNum < 4) return '3-4岁'
  if (ageNum >= 4 && ageNum < 5) return '4-5岁'
  if (ageNum >= 5 && ageNum < 6) return '5-6岁'
  return `${ageNum}岁`
}

// 获取意向程度标签类型
const getIntentionLevelType = (level: string) => {
  const levelUpper = level?.toUpperCase() || ''
  const typeMap: Record<string, string> = {
    'HIGH': 'danger',    // 高意向 - 红色（最重要）
    'MEDIUM': 'warning', // 中意向 - 橙色
    'LOW': 'info'        // 低意向 - 灰色
  }
  return typeMap[levelUpper] || 'info'
}

// 获取意向程度文本
const getIntentionLevelText = (level: string) => {
  const levelUpper = level?.toUpperCase() || ''
  const textMap: Record<string, string> = {
    'HIGH': '高',
    'MEDIUM': '中',
    'LOW': '低'
  }
  return textMap[levelUpper] || level
}

// 格式化最后跟进时间为"X天前"
const formatFollowupTime = (time: string | Date) => {
  if (!time) return '未跟进'

  const now = new Date()
  const followupDate = new Date(time)
  const diffMs = now.getTime() - followupDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '1天前'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`
  return `${Math.floor(diffDays / 365)}年前`
}

// 根据跟进时间返回CSS类（超过7天显示警告）
const getFollowupTimeClass = (time: string | Date) => {
  if (!time) return 'text-gray'

  const now = new Date()
  const followupDate = new Date(time)
  const diffMs = now.getTime() - followupDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 30) return 'text-danger' // 超过30天 - 红色
  if (diffDays > 7) return 'text-warning'  // 超过7天 - 橙色
  return 'text-success'                     // 7天内 - 绿色
}

// 格式化预计入园时间
const formatEnrollmentDate = (date: string | Date) => {
  if (!date) return '未确定'

  const enrollmentDate = new Date(date)
  const year = enrollmentDate.getFullYear()
  const month = enrollmentDate.getMonth() + 1

  // 返回"2025年9月"格式
  return `${year}年${month}月`
}

const getFollowupResultText = (result: string) => {
  const textMap: Record<string, string> = {
    interested: '有意向',
    considering: '考虑中',
    not_interested: '无意向',
    converted: '已转化'
  }
  return textMap[result] || result
}

// 🎯 新增：SOP相关方法

// 获取SOP阶段文本
const getSopStageText = (stage: number) => {
  const stageInfo = SOP_STAGES.find(s => s.id === stage)
  return stageInfo ? `SOP ${stage} ${stageInfo.name}` : '未开始'
}

// 获取SOP阶段颜色
const getSopStageColor = (stage: number) => {
  const colors = ['', 'primary', 'success', 'warning', 'info', 'danger', 'success', 'primary']
  return colors[stage] || 'info'
}

// SOP排序处理
const handleSopSortChange = (sortInfo: any) => {
  console.log('SOP排序:', sortInfo)
  // TODO: 实现SOP排序逻辑
  loadFollowupsData()
}

// 关闭SOP抽屉
const handleCloseSopDrawer = () => {
  sopDrawerVisible.value = false
  selectedCustomerForSop.value = null
  sopLogs.value = []
}

// 获取当前阶段任务
const getCurrentStageTasks = (stage: number) => {
  return SOP_STAGE_TASKS[stage] || []
}

// 任务完成处理
const handleTaskComplete = (task: any) => {
  ElMessage.success(`任务"${task.title}"已${task.completed ? '完成' : '取消完成'}`)
  // TODO: 保存任务完成状态到后端
}

// 获取SOP话术
const getSopScript = (stage: number, type: string) => {
  const scripts = SOP_SCRIPTS[stage]
  if (!scripts) return type === 'keyPoints' ? [] : '暂无话术模板'
  return scripts[type] || (type === 'keyPoints' ? [] : '')
}

// 添加SOP日志
const handleAddSopLog = () => {
  ElMessage.info('打开添加SOP日志对话框')
  // TODO: 实现添加SOP日志功能
}

// 加载SOP日志
const loadSopLogs = async (customerId: number) => {
  try {
    // TODO: 从后端加载真实数据
    // 模拟数据
    sopLogs.value = [
      {
        id: 1,
        customerId,
        teacher: '张老师',
        fromStage: 3,
        toStage: 4,
        content: '客户对课程非常感兴趣，已经约定下周三上午10点试听',
        feedback: '家长表示很期待，想了解更多关于外教课程的信息',
        timestamp: '2025-11-20 14:30'
      },
      {
        id: 2,
        customerId,
        teacher: '张老师',
        fromStage: 2,
        toStage: 3,
        content: '详细介绍了国际课程体系，家长对蒙氏教育很认可',
        feedback: '希望能看看教室环境和师资情况',
        timestamp: '2025-11-18 10:15'
      },
      {
        id: 3,
        customerId,
        teacher: '李老师',
        fromStage: 1,
        toStage: 2,
        content: '初次电话沟通，了解到家长注重英语启蒙和艺术培养',
        feedback: '孩子3岁半，性格活泼，之前没有上过幼儿园',
        timestamp: '2025-11-15 16:45'
      }
    ]
  } catch (error) {
    console.error('加载SOP日志失败:', error)
    ElMessage.error('加载SOP日志失败')
  }
}

// 刷新SOP漏斗图
const refreshSopFunnel = async () => {
  try {
    funnelLoading.value = true
    
    // TODO: 从后端加载真实数据
    // 模拟SOP漏斗数据
    const funnelData = [
      { value: 120, name: 'SOP 1 初次接触' },
      { value: 95, name: 'SOP 2 需求分析' },
      { value: 75, name: 'SOP 3 方案推荐' },
      { value: 58, name: 'SOP 4 试听安排' },
      { value: 45, name: 'SOP 5 异议处理' },
      { value: 32, name: 'SOP 6 促成签约' },
      { value: 15, name: 'SOP 7 转介绍' }
    ]

    sopFunnelChart.value = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)'
      },
      series: [
        {
          name: 'SOP漏斗',
          type: 'funnel',
          left: '10%',
          top: 20,
          bottom: 20,
          width: '80%',
          min: 0,
          max: 120,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}: {c}人'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          },
          data: funnelData
        }
      ]
    }
  } catch (error) {
    console.error('加载SOP漏斗图失败:', error)
  } finally {
    funnelLoading.value = false
  }
}

// 初始化
onMounted(() => {
  // 从URL参数获取初始标签页，默认为overview
  const initialTab = (route.query.tab as string) || 'overview'
  activeTab.value = initialTab
  loadTabData(initialTab)
  
  // 🎯 初始化SOP漏斗图
  refreshSopFunnel()
})

// 监听URL参数变化
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && tabs.some(tab => tab.key === newTab)) {
    activeTab.value = newTab
    loadTabData(newTab)
  }
}, { immediate: false })
</script>

<style scoped lang="scss">
/* 客户池中心根容器 - 完全参考活动中心的标准样式 */
.customer-pool-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
  background: var(--el-bg-color-page);
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  overflow-y: auto;
}

.overview-content {
  padding: 0;
}

/* .welcome-section 样式已移至全局 center-common.scss 中统一管理 */

.stats-section,
.charts-section,
.quick-actions-section,
.analytics-stats,
.analytics-charts,
.analytics-actions {
  margin-bottom: var(--spacing-xl);
}

/* 🔧 修复：统计卡片网格布局 - 一排两个 */
.stats-section .stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 🔧 修复：图表区域高度 */
.charts-section {
  min-height: 400px;
}

.charts-section .charts-grid-unified {
  width: 100%;
}

.charts-section .cds-row {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.charts-section .cds-row > [class*="cds-col-"] {
  flex: 1;
  min-width: 0;
  min-height: 400px; /* 确保图表容器有明确高度 */
}

.customers-layout,
.followups-layout {
  display: flex;
  gap: var(--spacing-xl);
  height: calc(100vh - 200px);
}

.customers-list,
.followups-list {
  flex: 1;
  min-width: 0;
}

.customer-detail,
.followup-detail {
  width: var(--detail-panel-width, 400px);
  flex-shrink: 0;
}

/* 🎯 新增：详情面板网格布局 */
.customer-detail .detail-content .view-content .detail-sections,
.followup-detail .detail-content .view-content .detail-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 🎯 新增：跟进质量分析工具栏样式 */
.followup-analysis-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--el-bg-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 🎯 新增：跟进质量分析面板样式 */
.followup-analysis-panel {
  margin-bottom: var(--spacing-lg);
}

.analytics-actions {
  text-align: center;
}

/* 🎯 新增：筛选工具栏样式 */
.filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--el-bg-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.filter-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-badge {
  margin-left: var(--spacing-md);
}

.filter-tip {
  color: var(--el-color-danger);
  font-size: var(--text-base);
  font-weight: 500;
}

.selected-count {
  margin-left: var(--spacing-sm);
  font-weight: 600;
  color: var(--el-color-primary-light-3);
}

/* 🎯 新增：关键信息列样式 */
.child-age {
  color: var(--el-color-primary);
  font-weight: 500;
}

.teacher-name {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.enrollment-date {
  color: var(--el-color-info);
  font-size: var(--text-sm);
}

.text-gray {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
}

.text-success {
  color: var(--el-color-success);
  font-weight: 500;
}

.text-warning {
  color: var(--el-color-warning);
  font-weight: 500;
}

.text-danger {
  color: var(--el-color-danger);
  font-weight: 500;
}

/* 全宽选择器 */
.full-width-select {
  width: 100%;
}

// 🎯 新增：SOP相关样式

// SOP漏斗图区域
.sop-funnel-section {
  margin-bottom: var(--spacing-2xl);
}

// 全屏列表（移除左右分栏）
.followups-list-full {
  width: 100%;
}

// SOP抽屉内容
.sop-drawer-content {
  padding: var(--spacing-base);
  
  // 客户信息卡片
  .customer-info-section {
    margin-bottom: var(--spacing-xl);
    
    .customer-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      
      .customer-avatar {
        flex-shrink: 0;
      }
      
      .customer-basic {
        flex: 1;
        
        h3 {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .customer-meta {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
      
      .customer-status {
        flex-shrink: 0;
      }
    }
  }
  
  // SOP进度卡片
  .sop-progress-section {
    margin-bottom: var(--spacing-xl);
    
    h4 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }
    
    .progress-overview {
      padding: var(--spacing-xl) 0;
    }
  }
  
  // SOP任务卡片
  .sop-tasks-section {
    margin-bottom: var(--spacing-xl);
    
    h4 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }
    
    .current-stage-tasks {
      .task-item {
        padding: var(--spacing-base);
        margin-bottom: var(--spacing-base);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-base);
        background: var(--bg-color);
        transition: all var(--duration-fast);
        
        &:hover {
          background: var(--bg-hover);
          box-shadow: var(--shadow-sm);
        }
        
        :deep(.el-checkbox) {
          display: flex;
          align-items: flex-start;
          
          .el-checkbox__label {
            font-size: var(--text-base);
            font-weight: 500;
            color: var(--text-primary);
          }
        }
        
        .task-desc {
          margin: var(--spacing-sm) 0 0 var(--spacing-3xl);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      }
    }
  }
  
  // 话术模板卡片
  .sop-scripts-section {
    margin-bottom: var(--spacing-xl);
    
    h4 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }
    
    .script-content {
      padding: var(--spacing-base);
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      line-height: 1.8;
      color: var(--text-primary);
    }
    
    .script-list {
      margin: 0;
      padding-left: var(--spacing-xl);
      
      li {
        margin-bottom: var(--spacing-sm);
        line-height: 1.6;
        color: var(--text-primary);
      }
    }
  }
  
  // SOP日志卡片
  .sop-logs-section {
    h4 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }
    
    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    :deep(.el-timeline) {
      padding-left: 0;
      
      .el-timeline-item {
        .el-card {
          margin-top: var(--spacing-sm);
          
          .log-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-base);
            flex-wrap: wrap;
          }
          
          .log-content {
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-base);
            line-height: 1.6;
            color: var(--text-primary);
          }
          
          .log-feedback {
            padding: var(--spacing-sm) var(--spacing-base);
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
            font-size: var(--text-sm);
            line-height: 1.5;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}
</style>
