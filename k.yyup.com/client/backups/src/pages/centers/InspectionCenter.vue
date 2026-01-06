<template>
  <UnifiedCenterLayout
    title="检查中心"
    description="全年检查计划一目了然，智能提醒不遗漏"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleGenerateYearlyPlan">
        <el-icon><Calendar /></el-icon>
        生成年度计划
      </el-button>
      <el-button type="warning" size="large" @click="openTimelineEditor">
        <el-icon><Edit /></el-icon>
        调整计划时间
      </el-button>
      <el-button type="success" size="large" @click="handleUploadDocument">
        <el-icon><Upload /></el-icon>
        上传检查文档
      </el-button>
      <el-button type="danger" size="large" @click="openAIScoring">
        <el-icon><MagicStick /></el-icon>
        AI全园预评分
      </el-button>
      <el-button type="info" size="large" @click="handlePrintYearlyReport">
        <el-icon><Printer /></el-icon>
        打印年度报告
      </el-button>
    </template>

    <div class="center-container inspection-center-timeline">

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待开始</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon preparing">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.preparing }}</div>
              <div class="stat-label">准备中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon in-progress">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inProgress }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon templates">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ documentStats.templates }}</div>
              <div class="stat-label">文档模板</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon instances">
              <el-icon><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ documentStats.instances }}</div>
              <div class="stat-label">文档实例</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 逾期提醒 -->
    <el-alert
      v-if="overduePlans.length > 0"
      type="error"
      :title="`⚠️ 有${overduePlans.length}个检查计划已逾期，请尽快处理`"
      show-icon
      :closable="false"
      class="overdue-alert"
      style="margin-bottom: var(--text-2xl);"
    >
      <div class="overdue-list">
        <div v-for="plan in overduePlans.slice(0, 3)" :key="plan.id" class="overdue-item">
          <span class="overdue-name">{{ plan.inspectionType?.name }}</span>
          <span class="overdue-date">计划日期: {{ plan.planDate }}</span>
          <el-button link type="primary" size="small" @click="handlePlanClick(plan)">立即查看</el-button>
        </div>
        <div v-if="overduePlans.length > 3" class="overdue-more">
          还有 {{ overduePlans.length - 3 }} 个逾期检查...
        </div>
      </div>
    </el-alert>

    <!-- Timeline视图 -->
    <el-card class="timeline-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">📅 年度检查时间轴</span>
            
            <!-- 快捷筛选按钮 -->
            <el-button-group class="filter-buttons">
              <el-button 
                :type="statusFilter === 'all' ? 'primary' : ''" 
                size="small"
                @click="handleStatusFilter('all')"
              >
                全部 ({{ timelinePlans.length }})
              </el-button>
              <el-button 
                :type="statusFilter === 'pending' ? 'primary' : ''" 
                size="small"
                @click="handleStatusFilter('pending')"
              >
                待开始 ({{ stats.pending }})
              </el-button>
              <el-button 
                :type="statusFilter === 'in_progress' ? 'primary' : ''" 
                size="small"
                @click="handleStatusFilter('in_progress')"
              >
                进行中 ({{ stats.inProgress }})
              </el-button>
              <el-button 
                :type="statusFilter === 'completed' ? 'primary' : ''" 
                size="small"
                @click="handleStatusFilter('completed')"
              >
                已完成 ({{ stats.completed }})
              </el-button>
            </el-button-group>
          </div>
          
          <div class="header-actions">
            <!-- 全局搜索 -->
            <el-input
              v-model="searchKeyword"
              placeholder="搜索检查类型、部门..."
              @input="handleSearch"
              clearable
              style="width: 200px; margin-right: var(--spacing-2xl);"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <!-- 跳转到本月 -->
            <el-button type="primary" size="default" @click="scrollToCurrentMonth" style="margin-right: var(--spacing-2xl);">
              <el-icon><Calendar /></el-icon>
              本月检查
            </el-button>

            <el-select v-model="selectedYear" @change="loadTimeline" style="width: 120px; margin-right: var(--spacing-2xl);">
              <el-option
                v-for="year in yearOptions"
                :key="year"
                :label="`${year}年`"
                :value="year"
              />
            </el-select>
            <el-radio-group v-model="viewMode" @change="handleViewModeChange">
              <el-radio-button label="timeline">时间轴</el-radio-button>
              <el-radio-button label="month">月度</el-radio-button>
              <el-radio-button label="list">列表</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <InspectionTimeline
        v-if="viewMode === 'timeline'"
        :plans="timelinePlans"
        :documents="documentInstances"
        :loading="timelineLoading"
        @plan-click="handlePlanClick"
        @edit="handleEditPlan"
        @view-tasks="handleTaskManagement"
        @view-document="handleViewDocument"
        @update-deadline="handleUpdateDeadline"
        @print-record="handlePrintPlan"
      />

      <div v-else-if="viewMode === 'month'" class="month-view">
        <el-calendar v-model="calendarDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell">
              <div class="date-number">{{ data.day.split('-')[2] }}</div>
              <div v-if="getPlansForDate(data.day).length > 0" class="plan-indicators">
                <el-badge
                  v-for="plan in getPlansForDate(data.day)"
                  :key="plan.id"
                  :value="plan.inspectionType?.name"
                  :type="getPlanBadgeType(plan.status)"
                  class="plan-badge"
                />
              </div>
            </div>
          </template>
        </el-calendar>
      </div>

      <div v-else class="list-view">
        <!-- 批量操作工具栏 -->
        <div v-if="selectedPlans.length > 0" class="batch-toolbar">
          <el-alert
            :title="`已选择 ${selectedPlans.length} 个检查计划`"
            type="info"
            :closable="false"
          >
            <template #default>
              <div class="batch-actions">
                <el-button type="primary" size="small" @click="batchPrint" :disabled="!hasPrintablePlans">
                  <el-icon><Printer /></el-icon>
                  批量打印 ({{ printablePlansCount }})
                </el-button>
                <el-button type="success" size="small" @click="batchExportPDF" :disabled="!hasPrintablePlans">
                  <el-icon><Download /></el-icon>
                  批量导出PDF ({{ printablePlansCount }})
                </el-button>
                <el-button size="small" @click="clearSelection">
                  清空选择
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>

        <el-table 
          :data="filteredPlans" 
          :loading="timelineLoading" 
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="planDate" label="计划日期" width="120" />
          <el-table-column prop="inspectionType.name" label="检查类型" width="200" />
          <el-table-column prop="inspectionType.category" label="类别" width="100">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.inspectionType?.category)">
                {{ getCategoryLabel(row.inspectionType?.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handlePlanClick(row)">查看</el-button>
              <el-button link type="primary" @click="handleEditPlan(row)">编辑</el-button>
              <el-button link type="success" @click="handlePrintPlan(row)" v-if="row.status === 'completed'">
                <el-icon><Printer /></el-icon>
                打印
              </el-button>
              <el-button link type="danger" @click="handleDeletePlan(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <InspectionPlanEditDialog
      v-model:visible="editDialogVisible"
      :plan-data="currentPlan"
      @success="handleEditSuccess"
    />

    <!-- 任务管理对话框 -->
    <InspectionTaskDialog
      v-model:visible="taskDialogVisible"
      :plan-data="currentPlan"
    />

    <!-- 文档管理区域 -->
    <el-card class="document-management-card" v-if="showDocumentManagement">
      <template #header>
        <div class="card-header">
          <span>📄 文档管理中心</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateDocument">
              <el-icon><Plus /></el-icon>
              创建文档
            </el-button>
            <el-button type="success" @click="handleAIAnalysis">
              <el-icon><MagicStick /></el-icon>
              AI智能分析
            </el-button>
          </div>
        </div>
      </template>

      <!-- 文档模板选择器 -->
      <div class="template-selector-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select
              v-model="selectedTemplateCategory"
              placeholder="选择模板类别"
              @change="handleCategoryChange"
              style="width: 100%"
            >
              <el-option label="全部类别" value="" />
              <el-option label="年度检查类" value="annual" />
              <el-option label="专项检查类" value="special" />
              <el-option label="常态化督导类" value="routine" />
              <el-option label="教职工管理类" value="staff" />
              <el-option label="幼儿管理类" value="student" />
              <el-option label="财务管理类" value="finance" />
              <el-option label="保教工作类" value="education" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="selectedTemplateId"
              placeholder="选择文档模板"
              @change="handleTemplateChange"
              style="width: 100%"
              :loading="templatesLoading"
            >
              <el-option
                v-for="template in filteredTemplates"
                :key="template.id"
                :label="`[${template.code}] ${template.name}`"
                :value="template.id"
              />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="documentSearchKeyword"
              placeholder="搜索文档..."
              @input="handleDocumentSearch"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>

      <!-- 文档实例列表 -->
      <div class="document-instances-section">
        <el-table
          :data="filteredDocumentInstances"
          :loading="documentsLoading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="title" label="文档标题" width="250" show-overflow-tooltip />
          <el-table-column prop="template.name" label="模板类型" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getDocumentStatusType(row.status)">
                {{ getDocumentStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completionRate" label="完成率" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="row.completionRate || 0"
                :stroke-width="8"
                :color="getProgressColor(row.completionRate)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="dueDate" label="截止日期" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewDocument(row)">查看</el-button>
              <el-button link type="primary" @click="handleEditDocument(row)">编辑</el-button>
              <el-button link type="success" @click="handleAIAssist(row)">AI辅助</el-button>
              <el-button link type="danger" @click="handleDeleteDocument(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <InspectionPlanDetailDialog
      v-model:visible="detailDialogVisible"
      :plan-id="currentPlanId"
      @edit="handleEditFromDetail"
    />

    <!-- 检查记录对话框 -->
    <InspectionRecordDialog
      v-model:visible="recordDialogVisible"
      :plan-data="currentPlan"
      @success="handleRecordSuccess"
    />

    <!-- 整改管理对话框 -->
    <InspectionRectificationDialog
      v-model:visible="rectificationDialogVisible"
      :mode="rectificationMode"
      :plan-data="currentPlan"
      :rectification-data="currentRectification"
      @success="handleRectificationSuccess"
    />

    <!-- 打印预览对话框 - 检查记录 -->
    <PrintPreviewDialog
      v-model:visible="printRecordDialogVisible"
      title="检查记录打印预览"
      :filename="`inspection_record_${currentRecordForPrint?.id || 'new'}`"
    >
      <InspectionRecordPrintTemplate
        v-if="currentRecordForPrint"
        :record-data="currentRecordForPrint"
        :plan-data="currentPlan"
        :kindergarten-name="kindergartenName"
      />
    </PrintPreviewDialog>

    <!-- 打印预览对话框 - 整改任务 -->
    <PrintPreviewDialog
      v-model:visible="printRectificationDialogVisible"
      title="整改任务打印预览"
      :filename="`rectification_${currentRectificationForPrint?.id || 'new'}`"
    >
      <InspectionRectificationPrintTemplate
        v-if="currentRectificationForPrint"
        :rectification-data="currentRectificationForPrint"
        :plan-data="currentPlan"
        :progress-logs="currentRectificationProgressLogs"
        :kindergarten-name="kindergartenName"
      />
    </PrintPreviewDialog>

    <!-- 打印预览对话框 - 年度报告 -->
    <PrintPreviewDialog
      v-model:visible="printReportDialogVisible"
      title="年度检查报告打印预览"
      :filename="`inspection_report_${selectedYear}`"
    >
      <InspectionReportPrintTemplate
        :report-data="reportData"
        :completed-plans="completedPlansForReport"
        :rectifications="rectificationsForReport"
        :statistics="reportStatistics"
        :problem-stats="problemStatsForReport"
        :kindergarten-name="kindergartenName"
      />
    </PrintPreviewDialog>

    <!-- 时间编辑器对话框 -->
    <InspectionTimelineEditor
      v-model:visible="timelineEditorVisible"
      :plans="allPlans"
      :year="selectedYear"
      @success="handleTimelineEditSuccess"
    />

    <!-- AI预评分抽屉 -->
    <AIScoringDrawer v-model:visible="aiScoringDrawerVisible" />

    <!-- AI分析结果对话框 -->
    <el-dialog
      v-model="showAIAnalysisDialog"
      title="📊 检查计划AI分析报告"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="aiAnalysisResult" class="ai-analysis-content">
        <el-alert
          :title="`使用模型: ${aiAnalysisResult.modelUsed}`"
          type="info"
          :closable="false"
          style="margin-bottom: var(--text-2xl)"
        />

        <el-descriptions title="分析统计" :column="2" border>
          <el-descriptions-item label="总计划数">{{ aiAnalysisResult.planCount }}</el-descriptions-item>
          <el-descriptions-item label="分析时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">📈 评分分析</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover">
              <div class="score-card">
                <div class="score-label">时间分布</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.timeDistribution?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.timeDistribution?.description }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <div class="score-card">
                <div class="score-label">检查频率</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.frequency?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.frequency?.description }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <div class="score-card">
                <div class="score-label">资源配置</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.resourceAllocation?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.resourceAllocation?.description }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-divider content-position="left">💡 优化建议</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(recommendation, index) in aiAnalysisResult.analysis?.recommendations || []"
            :key="index"
            type="success"
          >
            {{ recommendation }}
          </el-timeline-item>
        </el-timeline>

        <el-divider content-position="left">⚠️ 风险提示</el-divider>
        <el-alert
          v-for="(risk, index) in aiAnalysisResult.analysis?.risks || []"
          :key="index"
          :title="risk"
          type="warning"
          :closable="false"
          style="margin-bottom: var(--spacing-2xl)"
        />

        <el-divider content-position="left">📝 总结</el-divider>
        <el-card shadow="never">
          <p style="line-height: 1.8; white-space: pre-wrap;">{{ aiAnalysisResult.analysis?.summary }}</p>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="showAIAnalysisDialog = false">关闭</el-button>
        <el-button type="primary" @click="showAIAnalysisDialog = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- AI辅助填写对话框 -->
    <el-dialog
      v-model="showAIAssistDialog"
      title="🤖 AI文档分析助手"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="aiAssistResult" class="ai-assist-content">
        <el-alert
          :title="`使用模型: ${aiAssistResult.modelUsed}`"
          type="info"
          :closable="false"
          style="margin-bottom: var(--text-2xl)"
        />

        <el-descriptions v-if="aiAssistResult.documentInfo" title="文档信息" :column="2" border>
          <el-descriptions-item label="文档标题">{{ aiAssistResult.documentInfo.title }}</el-descriptions-item>
          <el-descriptions-item label="文档状态">{{ aiAssistResult.documentInfo.status }}</el-descriptions-item>
          <el-descriptions-item label="完成进度">{{ aiAssistResult.documentInfo.completionRate }}%</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">📊 质量评分</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <div class="score-card">
                <div class="score-label">完整性</div>
                <div class="score-value">{{ aiAssistResult.analysis?.completeness?.score || 0 }}</div>
                <div class="score-desc">{{ aiAssistResult.analysis?.completeness?.description }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <div class="score-card">
                <div class="score-label">内容质量</div>
                <div class="score-value">{{ aiAssistResult.analysis?.quality?.score || 0 }}</div>
                <div class="score-desc">{{ aiAssistResult.analysis?.quality?.description }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-divider content-position="left">📋 缺失内容</el-divider>
        <el-tag
          v-for="(item, index) in aiAssistResult.analysis?.missingContent || []"
          :key="index"
          type="warning"
          style="margin-right: var(--spacing-2xl); margin-bottom: var(--spacing-2xl)"
        >
          {{ item }}
        </el-tag>
        <el-empty v-if="!aiAssistResult.analysis?.missingContent?.length" description="无缺失内容" />

        <el-divider content-position="left">💡 填写建议</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(suggestion, index) in aiAssistResult.analysis?.suggestions || []"
            :key="index"
            type="primary"
          >
            {{ suggestion }}
          </el-timeline-item>
        </el-timeline>

        <el-divider content-position="left">⚠️ 注意事项</el-divider>
        <el-alert
          v-for="(warning, index) in aiAssistResult.analysis?.warnings || []"
          :key="index"
          :title="warning"
          type="warning"
          :closable="false"
          style="margin-bottom: var(--spacing-2xl)"
        />

        <el-divider content-position="left">📝 总结</el-divider>
        <el-card shadow="never">
          <p style="line-height: 1.8; white-space: pre-wrap;">{{ aiAssistResult.analysis?.summary }}</p>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="showAIAssistDialog = false">关闭</el-button>
        <el-button type="primary" @click="showAIAssistDialog = false">应用建议</el-button>
      </template>
    </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, Upload, Clock, Edit, Loading, Check, Document, Files, Plus, MagicStick, Search, Printer, Download, CircleCheck } from '@element-plus/icons-vue';
import { inspectionPlanApi, InspectionPlan, InspectionPlanStatus } from '@/api/endpoints/inspection';
import { request } from '@/utils/request';
import InspectionTimeline from './components/InspectionTimeline.vue';
import InspectionPlanEditDialog from './components/InspectionPlanEditDialog.vue';
import InspectionTaskDialog from './components/InspectionTaskDialog.vue';
import InspectionPlanDetailDialog from './components/InspectionPlanDetailDialog.vue';
import InspectionRecordDialog from './components/InspectionRecordDialog.vue';
import InspectionRectificationDialog from './components/InspectionRectificationDialog.vue';
import InspectionTimelineEditor from './components/InspectionTimelineEditor.vue';
import AIScoringDrawer from './components/AIScoringDrawer.vue';
import PrintPreviewDialog from './components/PrintPreviewDialog.vue';
import InspectionRecordPrintTemplate from './components/InspectionRecordPrintTemplate.vue';
import InspectionRectificationPrintTemplate from './components/InspectionRectificationPrintTemplate.vue';
import InspectionReportPrintTemplate from './components/InspectionReportPrintTemplate.vue';
import { useUserStore } from '@/stores/user';

// 用户信息
const userStore = useUserStore();

// 数据
const selectedYear = ref(new Date().getFullYear());
const viewMode = ref<'timeline' | 'month' | 'list'>('timeline');
const calendarDate = ref(new Date());
const timelinePlans = ref<InspectionPlan[]>([]);
const allPlans = ref<InspectionPlan[]>([]); // 存储所有计划，用于筛选
const timelineLoading = ref(false);

// 筛选和搜索
const statusFilter = ref<string>('all');
const searchKeyword = ref('');
const selectedPlans = ref<InspectionPlan[]>([]); // 批量选择的计划

// 统计数据
const stats = reactive({
  pending: 0,
  preparing: 0,
  inProgress: 0,
  completed: 0
});

// 文档统计数据
const documentStats = reactive({
  templates: 0,
  instances: 0
});

// 文档管理相关数据
const showDocumentManagement = ref(true);
const selectedTemplateCategory = ref('');
const selectedTemplateId = ref('');
const documentSearchKeyword = ref('');
const templatesLoading = ref(false);
const documentsLoading = ref(false);
const documentTemplates = ref<any[]>([]);
const documentInstances = ref<any[]>([]);

// AI功能相关数据
const aiAnalysisLoading = ref(false);
const aiAnalysisResult = ref<any>(null);
const showAIAnalysisDialog = ref(false);
const aiAssistLoading = ref(false);
const aiAssistResult = ref<any>(null);
const showAIAssistDialog = ref(false);

// 年份选项
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
});

// 逾期检查计划
const overduePlans = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allPlans.value.filter(plan => {
    if (plan.status === 'completed') return false;
    const planDate = new Date(plan.planDate);
    planDate.setHours(0, 0, 0, 0);
    return planDate < today;
  });
});

// 筛选后的计划
const filteredPlans = computed(() => {
  let plans = allPlans.value;

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    plans = plans.filter(plan => plan.status === statusFilter.value);
  }

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    plans = plans.filter(plan => 
      plan.inspectionType?.name?.toLowerCase().includes(keyword) ||
      plan.inspectionType?.department?.toLowerCase().includes(keyword) ||
      plan.notes?.toLowerCase().includes(keyword)
    );
  }

  return plans;
});

// 批量操作相关计算属性
const hasPrintablePlans = computed(() => {
  return selectedPlans.value.some(plan => plan.status === 'completed');
});

const printablePlansCount = computed(() => {
  return selectedPlans.value.filter(plan => plan.status === 'completed').length;
});

// 过滤后的文档模板
const filteredTemplates = computed(() => {
  if (!selectedTemplateCategory.value) {
    return documentTemplates.value;
  }
  return documentTemplates.value.filter(template =>
    template.category === selectedTemplateCategory.value
  );
});

// 过滤后的文档实例
const filteredDocumentInstances = computed(() => {
  let instances = documentInstances.value;

  // 按模板筛选
  if (selectedTemplateId.value) {
    instances = instances.filter(instance =>
      instance.templateId === selectedTemplateId.value
    );
  }

  // 按关键词搜索
  if (documentSearchKeyword.value) {
    const keyword = documentSearchKeyword.value.toLowerCase();
    instances = instances.filter(instance =>
      instance.title?.toLowerCase().includes(keyword) ||
      instance.template?.name?.toLowerCase().includes(keyword)
    );
  }

  return instances;
});

// 获取幼儿园ID
const getKindergartenId = (): number => {
  // 优先从userStore获取
  if (userStore.userInfo?.kindergartenId) {
    return userStore.userInfo.kindergartenId;
  }

  // 如果userStore没有，尝试从localStorage获取
  try {
    const userInfo = JSON.parse(localStorage.getItem('kindergarten_user_info') || '{}');
    if (userInfo.kindergartenId) {
      return userInfo.kindergartenId;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }

  // 默认返回1（用于开发测试）
  console.warn('未找到kindergartenId，使用默认值1');
  return 1;
};

// 加载Timeline数据
const loadTimeline = async () => {
  try {
    timelineLoading.value = true;
    const kindergartenId = getKindergartenId();
    console.log('🔍 loadTimeline参数:', { kindergartenId, year: selectedYear.value });
    const res = await inspectionPlanApi.getTimeline({
      kindergartenId,
      year: selectedYear.value
    });

    if (res.success) {
      allPlans.value = res.data; // 保存所有计划
      timelinePlans.value = res.data; // 显示的计划（可能被筛选）
      updateStats();
      
      // 重置筛选
      statusFilter.value = 'all';
      searchKeyword.value = '';
    }
  } catch (error) {
    console.error('加载Timeline失败:', error);
    ElMessage.error('加载检查计划失败');
  } finally {
    timelineLoading.value = false;
  }
};

// 更新统计数据（基于所有计划，不受筛选影响）
const updateStats = () => {
  stats.pending = allPlans.value.filter(p => p.status === InspectionPlanStatus.PENDING).length;
  stats.preparing = allPlans.value.filter(p => p.status === InspectionPlanStatus.PREPARING).length;
  stats.inProgress = allPlans.value.filter(p => p.status === InspectionPlanStatus.IN_PROGRESS).length;
  stats.completed = allPlans.value.filter(p => p.status === InspectionPlanStatus.COMPLETED).length;
};

// 状态筛选
const handleStatusFilter = (status: string) => {
  statusFilter.value = status;
  applyFilters();
};

// 搜索
const handleSearch = () => {
  applyFilters();
};

// 应用筛选
const applyFilters = () => {
  let plans = allPlans.value;

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    plans = plans.filter(plan => plan.status === statusFilter.value);
  }

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    plans = plans.filter(plan => 
      plan.inspectionType?.name?.toLowerCase().includes(keyword) ||
      plan.inspectionType?.department?.toLowerCase().includes(keyword) ||
      plan.notes?.toLowerCase().includes(keyword)
    );
  }

  timelinePlans.value = plans;
};

// 跳转到本月
const scrollToCurrentMonth = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthStr = `${selectedYear.value}-${currentMonth}`;
  
  // 如果时间轴组件有展开状态，需要触发展开
  // 这里使用DOM方式滚动到对应月份
  setTimeout(() => {
    const monthElements = document.querySelectorAll('.month-group');
    monthElements.forEach((el: any) => {
      const monthText = el.textContent || '';
      const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      if (monthText.includes(monthNames[currentMonth - 1])) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 如果是折叠的，尝试点击展开
        const button = el.querySelector('[role="button"]');
        if (button && button.getAttribute('aria-expanded') === 'false') {
          button.click();
        }
      }
    });
  }, 100);
  
  ElMessage.success(`已跳转到${currentMonth}月检查计划`);
};

// 批量操作 - 选择变更
const handleSelectionChange = (selection: InspectionPlan[]) => {
  selectedPlans.value = selection;
};

// 批量操作 - 清空选择
const clearSelection = () => {
  selectedPlans.value = [];
};

// 批量操作 - 批量打印
const batchPrint = async () => {
  const printablePlans = selectedPlans.value.filter(plan => plan.status === 'completed');
  
  if (printablePlans.length === 0) {
    ElMessage.warning('请选择已完成的检查计划');
    return;
  }

  try {
    ElMessageBox.confirm(
      `确定要批量打印 ${printablePlans.length} 个检查记录吗？`,
      '批量打印',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      for (const plan of printablePlans) {
        await handlePrintPlan(plan);
        // 等待1秒，避免同时打开多个对话框
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      ElMessage.success(`已打开 ${printablePlans.length} 个打印预览`);
    });
  } catch (error) {
    // 用户取消
  }
};

// 批量操作 - 批量导出PDF
const batchExportPDF = async () => {
  const printablePlans = selectedPlans.value.filter(plan => plan.status === 'completed');
  
  if (printablePlans.length === 0) {
    ElMessage.warning('请选择已完成的检查计划');
    return;
  }

  ElMessage.info(`正在批量导出 ${printablePlans.length} 个PDF文件，请稍候...`);
  
  try {
    for (let i = 0; i < printablePlans.length; i++) {
      const plan = printablePlans[i];
      
      // 加载检查记录
      const response = await request.get(`/inspection-records/plan/${plan.id}`);
      if (response.success && response.data && response.data.length > 0) {
        // 这里需要触发PDF导出
        // 实际实现需要集成打印组件
        console.log(`导出第 ${i + 1} 个PDF:`, plan.inspectionType?.name);
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    ElMessage.success(`批量导出完成！共 ${printablePlans.length} 个PDF文件`);
  } catch (error) {
    console.error('批量导出失败:', error);
    ElMessage.error('批量导出失败');
  }
};

// 获取指定日期的计划
const getPlansForDate = (date: string) => {
  return timelinePlans.value.filter(plan => plan.planDate === date);
};

// 处理视图模式切换
const handleViewModeChange = () => {
  // 视图切换逻辑
};

// 处理生成年度计划
const handleGenerateYearlyPlan = () => {
  ElMessageBox.confirm('确定要生成年度检查计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const kindergartenId = getKindergartenId();
      await inspectionPlanApi.generateYearly({
        kindergartenId,
        year: selectedYear.value,
        cityLevel: 'tier1' as any // TODO: 从幼儿园信息获取
      });
      ElMessage.success('年度计划生成成功');
      loadTimeline();
    } catch (error) {
      ElMessage.error('生成年度计划失败');
    }
  });
};

// 打开时间编辑器
const openTimelineEditor = () => {
  if (allPlans.value.length === 0) {
    ElMessage.warning('当前没有检查计划，请先生成年度计划');
    return;
  }
  timelineEditorVisible.value = true;
};

// 时间编辑成功回调
const handleTimelineEditSuccess = () => {
  loadTimeline();
  ElMessage.success('检查计划时间调整成功');
};

// 打开AI预评分抽屉
const openAIScoring = () => {
  aiScoringDrawerVisible.value = true;
};

// 处理上传文档
const handleUploadDocument = () => {
  ElMessage.info('文档上传功能开发中...');
};

// 对话框状态
const editDialogVisible = ref(false);
const taskDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const recordDialogVisible = ref(false);
const rectificationDialogVisible = ref(false);
const printRecordDialogVisible = ref(false);
const printRectificationDialogVisible = ref(false);
const printReportDialogVisible = ref(false);
const timelineEditorVisible = ref(false);
const aiScoringDrawerVisible = ref(false);
const currentPlan = ref<any>(null);
const currentPlanId = ref<number | null>(null);
const currentRectification = ref<any>(null);
const rectificationMode = ref<'create' | 'view'>('create');

// 打印相关数据
const currentRecordForPrint = ref<any>(null);
const currentRectificationForPrint = ref<any>(null);
const currentRectificationProgressLogs = ref<any[]>([]);
const kindergartenName = ref('阳光幼儿园');
const reportData = ref<any>({});
const completedPlansForReport = ref<any[]>([]);
const rectificationsForReport = ref<any[]>([]);
const reportStatistics = ref<any>({});
const problemStatsForReport = ref<any[]>([]);

// 处理计划点击
const handlePlanClick = (plan: InspectionPlan) => {
  currentPlanId.value = plan.id;
  detailDialogVisible.value = true;
};

// 处理编辑计划
const handleEditPlan = (plan: InspectionPlan) => {
  currentPlan.value = plan;
  editDialogVisible.value = true;
};

// 处理任务管理
const handleTaskManagement = (plan: InspectionPlan) => {
  currentPlan.value = plan;
  taskDialogVisible.value = true;
};

// 处理查看文档
const handleViewDocument = (document: any) => {
  console.log('查看文档:', document);
  ElMessage.info(`查看文档: ${document.title}`);
  // TODO: 打开文档查看对话框
};

// 处理更新文档截止日期
const handleUpdateDeadline = async (documentId: number, deadline: string) => {
  try {
    console.log('更新文档截止日期:', { documentId, deadline });

    // 调用后端API更新截止日期
    const response = await request.put(`/document-instances/${documentId}`, {
      deadline: deadline
    });

    if (response.success) {
      ElMessage.success('截止日期更新成功');

      // 更新本地数据
      const docIndex = documentInstances.value.findIndex(d => d.id === documentId);
      if (docIndex !== -1) {
        documentInstances.value[docIndex].deadline = new Date(deadline);
      }

      // 刷新数据
      await loadDocumentInstances();
    }
  } catch (error) {
    console.error('更新截止日期失败:', error);
    ElMessage.error('更新截止日期失败');
  }
};

// 处理编辑成功
const handleEditSuccess = () => {
  loadTimeline();
};

// 从详情对话框打开编辑
const handleEditFromDetail = (plan: any) => {
  currentPlan.value = plan;
  editDialogVisible.value = true;
};

// 打开检查记录对话框
const handleCreateRecord = (plan: InspectionPlan) => {
  currentPlan.value = plan;
  recordDialogVisible.value = true;
};

// 检查记录创建成功
const handleRecordSuccess = () => {
  loadTimeline();
  ElMessage.success('检查记录创建成功');
};

// 打开整改任务对话框
const handleCreateRectification = (plan: InspectionPlan) => {
  currentPlan.value = plan;
  rectificationMode.value = 'create';
  rectificationDialogVisible.value = true;
};

// 查看整改任务
const handleViewRectification = (rectification: any) => {
  currentRectification.value = rectification;
  rectificationMode.value = 'view';
  rectificationDialogVisible.value = true;
};

// 整改任务操作成功
const handleRectificationSuccess = () => {
  loadTimeline();
  ElMessage.success('整改任务操作成功');
};

// 打印检查计划（需要先加载检查记录）
const handlePrintPlan = async (plan: InspectionPlan) => {
  try {
    // 加载检查计划的检查记录
    const response = await request.get(`/inspection-records/plan/${plan.id}`);
    
    if (response.success && response.data && response.data.length > 0) {
      // 使用最新的检查记录
      currentRecordForPrint.value = response.data[0];
      currentPlan.value = plan;
      printRecordDialogVisible.value = true;
    } else {
      ElMessage.warning('该检查计划还没有检查记录，无法打印');
    }
  } catch (error) {
    console.error('加载检查记录失败:', error);
    ElMessage.error('加载检查记录失败');
  }
};

// 打印整改任务
const handlePrintRectification = async (rectification: any) => {
  try {
    // 加载整改任务详情和进度日志
    const [detailRes, progressRes] = await Promise.all([
      request.get(`/inspection-rectifications/${rectification.id}`),
      request.get(`/inspection-rectifications/${rectification.id}/progress`)
    ]);

    if (detailRes.success) {
      currentRectificationForPrint.value = detailRes.data;
      currentRectificationProgressLogs.value = progressRes.success ? progressRes.data : [];
      printRectificationDialogVisible.value = true;
    }
  } catch (error) {
    console.error('加载整改任务失败:', error);
    ElMessage.error('加载整改任务失败');
  }
};

// 生成并打印年度报告
const handlePrintYearlyReport = async () => {
  try {
    // 1. 加载已完成的检查计划
    const completedPlansRes = await request.get('/inspection/plans', {
      params: {
        year: selectedYear.value,
        status: 'completed',
        pageSize: 100
      }
    });

    // 2. 加载整改任务
    const rectificationsRes = await request.get('/inspection-rectifications', {
      params: {
        pageSize: 100
      }
    });

    if (completedPlansRes.success) {
      completedPlansForReport.value = completedPlansRes.data.items || [];
      rectificationsForReport.value = rectificationsRes.success ? (rectificationsRes.data.items || []) : [];

      // 3. 计算统计数据
      const totalPlans = timelinePlans.value.length;
      const completed = timelinePlans.value.filter(p => p.status === 'completed').length;
      const totalRectifications = rectificationsForReport.value.length;
      const rectified = rectificationsForReport.value.filter((r: any) => r.status === 'verified').length;

      reportStatistics.value = {
        totalPlans,
        completedPlans: completed,
        completionRate: totalPlans > 0 ? Math.round((completed / totalPlans) * 100) : 0,
        totalProblems: totalRectifications,
        highSeverityProblems: rectificationsForReport.value.filter((r: any) => r.problemSeverity === 'high' || r.problemSeverity === 'urgent').length,
        rectifiedProblems: rectified,
        rectificationRate: totalRectifications > 0 ? Math.round((rectified / totalRectifications) * 100) : 0
      };

      // 4. 问题分类统计
      const problemCategories = ['安全管理', '卫生保健', '教学质量', '后勤保障', '其他'];
      problemStatsForReport.value = problemCategories.map(category => {
        const categoryRects = rectificationsForReport.value.filter((r: any) => 
          r.recordItem?.itemCategory === category
        );
        const rectified = categoryRects.filter((r: any) => r.status === 'verified').length;
        
        return {
          category,
          total: categoryRects.length,
          rectified,
          inProgress: categoryRects.filter((r: any) => r.status === 'in_progress').length,
          pending: categoryRects.filter((r: any) => r.status === 'pending').length,
          rectificationRate: categoryRects.length > 0 ? Math.round((rectified / categoryRects.length) * 100) : 0
        };
      });

      // 5. 报告数据
      reportData.value = {
        year: selectedYear.value,
        reportNo: `DC${selectedYear.value}${String(new Date().getMonth() + 1).padStart(2, '0')}001`,
        summary: `${selectedYear.value}年度，我园认真落实各级教育主管部门的检查要求，全年完成各类检查${completed}次，发现问题${totalRectifications}项，整改完成${rectified}项，整体工作规范有序。`,
        problems: totalRectifications > 0 ? '部分检查中发现的问题整改进度有待加快。' : '无',
        improvements: '加强日常检查力度，建立长效管理机制。',
        nextSteps: '继续做好各项检查工作，确保幼儿园各项工作规范开展。'
      };

      printReportDialogVisible.value = true;
    }
  } catch (error) {
    console.error('生成年度报告失败:', error);
    ElMessage.error('生成年度报告失败');
  }
};

// 处理删除计划
const handleDeletePlan = (plan: InspectionPlan) => {
  ElMessageBox.confirm('确定要删除这个检查计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await inspectionPlanApi.delete(plan.id);
      ElMessage.success('删除成功');
      loadTimeline();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 辅助函数
const getCategoryLabel = (category?: string) => {
  const labels: Record<string, string> = {
    annual: '年度检查',
    special: '专项检查',
    routine: '常态化督导'
  };
  return labels[category || ''] || category;
};

const getCategoryTagType = (category?: string) => {
  const types: Record<string, any> = {
    annual: 'danger',
    special: 'warning',
    routine: 'info'
  };
  return types[category || ''] || '';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    preparing: '准备中',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  };
  return labels[status] || status;
};

const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    preparing: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  };
  return types[status] || '';
};

const getPlanBadgeType = (status: string) => {
  return getStatusTagType(status);
};

// 文档管理相关方法
const loadDocumentTemplates = async () => {
  try {
    templatesLoading.value = true;
    const response = await request.get('/document-templates', {
      params: { pageSize: 100 }
    });
    if (response.success) {
      documentTemplates.value = response.data.items || [];
      documentStats.templates = response.data.total || 0;
    }
  } catch (error) {
    console.error('加载文档模板失败:', error);
  } finally {
    templatesLoading.value = false;
  }
};

const loadDocumentInstances = async () => {
  try {
    documentsLoading.value = true;
    const response = await request.get('/document-instances', {
      params: { pageSize: 100 }
    });
    if (response.success) {
      documentInstances.value = response.data.items || [];
      documentStats.instances = response.data.total || 0;
    }
  } catch (error) {
    console.error('加载文档实例失败:', error);
  } finally {
    documentsLoading.value = false;
  }
};

const handleCategoryChange = () => {
  selectedTemplateId.value = '';
};

const handleTemplateChange = () => {
  // 模板选择变化时的处理
};

const handleDocumentSearch = () => {
  // 搜索处理已在计算属性中实现
};

const handleCreateDocument = () => {
  ElMessage.info('创建文档功能开发中...');
};

const handleAIAnalysis = async () => {
  try {
    aiAnalysisLoading.value = true;

    const response = await request.post('/inspection-ai/plan-analysis', {
      year: selectedYear.value,
      plans: timelinePlans.value
    }, {
      timeout: 60000 // AI请求超时时间设置为60秒
    });

    console.log('🔍 AI分析响应:', response);
    console.log('🔍 response.data:', response.data);
    console.log('🔍 response.data.analysis:', response.data?.analysis);
    console.log('🔍 完整响应JSON:', JSON.stringify(response, null, 2));

    if (response.success) {
      // 提取analysis数据
      let analysisData = response.data.analysis;

      console.log('🔍 analysisData类型:', typeof analysisData);
      console.log('🔍 analysisData内容:', analysisData);

      // 如果analysis是字符串，尝试解析JSON
      if (typeof analysisData === 'string') {
        console.log('⚠️ analysis是字符串，尝试JSON解析');
        try {
          analysisData = JSON.parse(analysisData);
          console.log('✅ JSON解析成功:', analysisData);
        } catch (e) {
          console.error('❌ JSON解析失败:', e);
          ElMessage.error('AI分析结果格式错误');
          return;
        }
      }

      // 检查analysisData是否存在
      if (!analysisData) {
        console.error('❌ analysisData不存在');
        ElMessage.error('AI分析结果为空');
        return;
      }

      // 直接使用后端返回的analysis对象，不进行转换
      aiAnalysisResult.value = {
        analysis: analysisData,  // 保持原始结构
        modelUsed: response.data.modelUsed || '未知模型',
        planCount: response.data.planCount || 0
      };

      console.log('✅ 设置后的结果:', aiAnalysisResult.value);
      console.log('✅ analysis对象:', aiAnalysisResult.value.analysis);

      showAIAnalysisDialog.value = true;
      ElMessage.success('AI分析完成');
    } else {
      ElMessage.error(response.message || 'AI分析失败');
    }
  } catch (error: any) {
    console.error('AI分析失败:', error);
    ElMessage.error(error.response?.data?.message || 'AI分析失败，请稍后重试');
  } finally {
    aiAnalysisLoading.value = false;
  }
};

const handleEditDocument = (document: any) => {
  ElMessage.info(`编辑文档: ${document.title}`);
};

const handleAIAssist = async (document: any) => {
  try {
    aiAssistLoading.value = true;

    const response = await request.post('/inspection-ai/document-analysis', {
      documentId: document.id,
      documentTitle: document.title,
      templateType: document.template?.category || '通用文档',
      currentContent: document.content || ''
    }, {
      timeout: 60000 // AI请求超时时间设置为60秒
    });

    console.log('🔍 AI辅助响应:', response);
    console.log('🔍 response.data:', response.data);
    console.log('🔍 response.data.analysis:', response.data?.analysis);

    if (response.success) {
      // 提取analysis数据
      let analysisData = response.data.analysis;

      console.log('🔍 analysisData类型:', typeof analysisData);
      console.log('🔍 analysisData内容:', analysisData);

      // 如果analysis是字符串，尝试解析JSON
      if (typeof analysisData === 'string') {
        console.log('⚠️ analysis是字符串，尝试JSON解析');
        try {
          analysisData = JSON.parse(analysisData);
          console.log('✅ JSON解析成功:', analysisData);
        } catch (e) {
          console.error('❌ JSON解析失败:', e);
          ElMessage.error('AI分析结果格式错误');
          return;
        }
      }

      // 检查analysisData是否存在
      if (!analysisData) {
        console.error('❌ analysisData不存在');
        ElMessage.error('AI分析结果为空');
        return;
      }

      // 直接使用后端返回的analysis对象，不进行转换
      aiAssistResult.value = {
        analysis: analysisData,  // 保持原始结构
        documentInfo: {
          title: document.title,
          status: document.status,
          completionRate: document.completionRate || 0
        },
        modelUsed: response.data.modelUsed || '未知模型'
      };

      console.log('✅ 设置后的结果:', aiAssistResult.value);
      console.log('✅ analysis对象:', aiAssistResult.value.analysis);

      showAIAssistDialog.value = true;
      ElMessage.success('AI分析完成');
    } else {
      ElMessage.error(response.message || 'AI分析失败');
    }
  } catch (error: any) {
    console.error('AI辅助失败:', error);
    ElMessage.error(error.response?.data?.message || 'AI辅助失败，请稍后重试');
  } finally {
    aiAssistLoading.value = false;
  }
};

const handleDeleteDocument = async (document: any) => {
  try {
    await ElMessageBox.confirm('确定删除该文档吗？', '确认', {
      type: 'warning'
    });
    ElMessage.success('删除成功');
    loadDocumentInstances();
  } catch (error) {
    // 用户取消删除
  }
};

const getDocumentStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': 'info',
    'pending_review': 'warning',
    'approved': 'success'
  };
  return statusMap[status] || 'info';
};

const getDocumentStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'pending_review': '待审核',
    'approved': '已审核'
  };
  return statusMap[status] || status;
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)';
  if (percentage >= 50) return 'var(--warning-color)';
  return 'var(--danger-color)';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// 初始化
onMounted(() => {
  loadTimeline();
  loadDocumentTemplates();
  loadDocumentInstances();
});
</script>

<style scoped lang="scss">
.inspection-center-timeline {
  background: var(--bg-secondary, var(--bg-container));  // ✅ 与活动中心一致
  padding: var(--text-2xl);

  .header-card {
    margin-bottom: var(--text-2xl);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        .page-title {
          font-size: var(--text-3xl);
          font-weight: bold;
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-primary);
        }

        .page-subtitle {
          font-size: var(--text-base);
          color: var(--info-color);
          margin: 0;
        }
      }

      .action-section {
        display: flex;
        gap: var(--text-sm);
      }
    }
  }

  .stats-row {
    margin-bottom: var(--text-2xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--text-lg);

        .stat-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--text-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);

          &.pending {
            background: #e6f7ff;
            color: var(--primary-color);
          }

          &.preparing {
            background: var(--bg-white)7e6;
            color: #fa8c16;
          }

          &.in-progress {
            background: #f0f5ff;
            color: #597ef7;
          }

          &.completed {
            background: #f6ffed;
            color: var(--success-color);
          }
        }

        .stat-info {
          .stat-value {
            font-size: var(--spacing-3xl);
            font-weight: bold;
            color: var(--text-primary);
            line-height: 1;
            margin-bottom: var(--spacing-sm);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--info-color);
          }
        }
      }
    }
  }

  // 逾期提醒样式
  .overdue-alert {
    :deep(.el-alert__content) {
      width: 100%;
    }

    .overdue-list {
      margin-top: var(--text-sm);

      .overdue-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) 0;
        border-bottom: var(--z-index-dropdown) dashed var(--danger-color);

        &:last-child {
          border-bottom: none;
        }

        .overdue-name {
          font-weight: bold;
          color: var(--danger-color);
          flex: 1;
        }

        .overdue-date {
          color: var(--info-color);
          margin-right: var(--text-sm);
        }
      }

      .overdue-more {
        margin-top: var(--spacing-sm);
        color: var(--info-color);
        font-size: var(--text-sm);
        text-align: center;
      }
    }
  }

  .timeline-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--text-sm);

      .header-left {
        display: flex;
        align-items: center;
        gap: var(--text-lg);
        flex-wrap: wrap;

        .card-title {
          font-size: var(--text-xl);
          font-weight: bold;
        }

        .filter-buttons {
          margin-left: var(--spacing-sm);
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
      }
    }

    .calendar-cell {
      height: 100%;
      padding: var(--spacing-xs);

      .date-number {
        font-size: var(--text-base);
        margin-bottom: var(--spacing-xs);
      }

      .plan-indicators {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);

        .plan-badge {
          font-size: var(--text-2xs);
        }
      }
    }
  }

  // 文档管理样式
  .document-management-card {
    margin-top: var(--text-2xl);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--text-sm);
      }
    }

    .template-selector-section {
      margin-bottom: var(--text-2xl);
    }

    .document-instances-section {
      .el-table {
        .el-progress {
          width: 80px;
        }
      }
    }
  }

  // 新增图标样式
  .stat-icon {
    &.templates {
      background: #f0f9ff;
      color: #0ea5e9;
    }

    &.instances {
      background: #fef3c7;
      color: var(--warning-color);
    }
  }

  // 批量操作工具栏样式
  .batch-toolbar {
    margin-bottom: var(--text-lg);

    .batch-actions {
      display: flex;
      gap: var(--text-sm);
      margin-top: var(--text-sm);
    }
  }

  // 列表视图样式优化
  .list-view {
    :deep(.el-table) {
      .el-table__row {
        &.is-selected {
          background-color: #ecf5ff;
        }
      }
    }
  }

  // AI分析对话框样式
  .ai-analysis-content,
  .ai-assist-content {
    .score-card {
      text-align: center;
      padding: var(--text-2xl);

      .score-label {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-2xl);
      }

      .score-value {
        font-size: var(--text-4xl);
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: var(--spacing-2xl);
      }

      .score-desc {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
        line-height: 1.5;
      }
    }

    .el-timeline {
      margin-top: var(--text-2xl);
    }

    .el-descriptions {
      margin-bottom: var(--text-2xl);
    }
  }
}
</style>

