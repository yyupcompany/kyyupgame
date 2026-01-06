<template>
  <div class="page-container">
    <!-- 内部顶栏 -->
    <div class="standalone-header">
      <h1 class="page-title">招生海报模板</h1>
      <!-- 原有的工具栏可以放置在这里，或者保持在内容区 -->
    </div>

    <!-- 内部主要内容区 -->
    <div class="standalone-main-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板"
            clearable
            @clear="fetchTemplates"
            @input="handleSearch"
          >
            <template #prefix>
              <UnifiedIcon name="Search" />
            </template>
          </el-input>
        </div>
        
        <div class="filter-box">
          <el-select v-model="categoryFilter" placeholder="模板分类" clearable @change="handleFilterChange">
            <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        
        <div class="action-box">
          <el-button type="primary" @click="createTemplate">
            <UnifiedIcon name="Plus" />
            创建模板
          </el-button>
          <el-upload
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-button type="success">
              <UnifiedIcon name="Upload" />
              导入模板
            </el-button>
          </el-upload>
          <el-button type="warning" @click="showMarketingAnalysis">
            <UnifiedIcon name="default" />
            营销分析
          </el-button>
        </div>
      </div>
      
      <!-- 模板展示区 -->
      <div v-loading="loading" class="templates-wrapper">
        <el-empty v-if="templates.length === 0 && !loading" description="暂无模板数据" />
        
        <div class="template-grid" v-else>
          <div v-for="template in templates" :key="template.id" class="template-grid-item">
            <div class="template-card">
              <div class="template-preview" @click="previewTemplate(template)">
                <img :src="getImageUrl(template.thumbnail)" :alt="template.name" class="thumbnail"
                     width="200" height="280"
                     style="object-fit: cover; border-radius: var(--spacing-sm);"
                     loading="lazy"
                     @error="handleImageError" />
                <div class="template-mask">
                  <div class="mask-actions">
                    <el-button type="primary" circle size="small" @click.stop="editTemplate(template)">
                      <UnifiedIcon name="Edit" />
                    </el-button>
                    <el-button type="success" circle size="small" @click.stop="useTemplate(template)">
                      <UnifiedIcon name="default" />
                    </el-button>
                    <el-button type="info" circle size="small" @click.stop="copyTemplate(template)">
                      <UnifiedIcon name="default" />
                    </el-button>
                    <el-button type="danger" circle size="small" @click.stop="deleteTemplate(template)">
                      <UnifiedIcon name="Delete" />
                    </el-button>
                  </div>
                </div>
                <div class="template-usage" v-if="template.usageCount > 0">
                  <el-tag size="small">已使用 {{ template.usageCount }} 次</el-tag>
                </div>
              </div>
              
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-meta">
                  <el-tag size="small" :type="getCategoryType(template.category)">{{ getCategoryLabel(template.category) }}</el-tag>
                  <span class="update-time">{{ formatDate(template.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="templates.length > 0">
          <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 模板详情预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="模板预览"
      width="70%"
      :before-close="handleDialogClose"
    >
      <div class="preview-dialog-content" v-if="currentTemplate">
        <div class="preview-image">
          <img :src="currentTemplate.previewImage" :alt="currentTemplate.name" />
          
          <!-- 添加营销工具标签 -->
          <div v-if="currentTemplate.marketingTools && currentTemplate.marketingTools.length > 0" class="marketing-tools">
            <el-tag v-if="currentTemplate.marketingTools.includes('GROUP_BUY')" type="danger" effect="dark" size="small">
              <UnifiedIcon name="default" /> 团购
            </el-tag>
            <el-tag v-if="currentTemplate.marketingTools.includes('POINTS')" type="warning" effect="dark" size="small">
              <UnifiedIcon name="default" /> 积分
            </el-tag>
            <el-tag v-if="currentTemplate.marketingTools.includes('COUPON')" type="success" effect="dark" size="small">
              <UnifiedIcon name="default" /> 优惠券
            </el-tag>
            <el-tag v-if="currentTemplate.marketingTools.includes('LIMITED_TIME')" type="primary" effect="dark" size="small">
              <UnifiedIcon name="default" /> 限时
            </el-tag>
            <el-tag v-if="currentTemplate.marketingTools.includes('REFERRAL')" type="info" effect="dark" size="small">
              <UnifiedIcon name="default" /> 推荐奖励
            </el-tag>
          </div>
        </div>
        
        <div class="preview-info">
          <h3>{{ currentTemplate.name }}</h3>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="模板分类">
              {{ getCategoryLabel(currentTemplate.category) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(currentTemplate.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(currentTemplate.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="使用次数">
              {{ currentTemplate.usageCount }}
            </el-descriptions-item>
            <el-descriptions-item label="模板尺寸">
              {{ currentTemplate.width }} x {{ currentTemplate.height }}
            </el-descriptions-item>
            <el-descriptions-item label="模板描述">
              {{ currentTemplate.description || '暂无描述' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentTemplate.marketingTools && currentTemplate.marketingTools.length > 0" label="营销功能">
              <div class="marketing-features">
                <div v-if="currentTemplate.marketingTools.includes('GROUP_BUY')" class="feature-item">
                  <div class="feature-title">团购功能</div>
                  <div class="feature-detail">
                    {{ currentTemplate.groupBuySettings?.minUsers || 3 }}人成团，享{{ currentTemplate.groupBuySettings?.discount || 8.5 }}折优惠
                  </div>
                </div>
                
                <div v-if="currentTemplate.marketingTools.includes('POINTS')" class="feature-item">
                  <div class="feature-title">积分功能</div>
                  <div class="feature-detail">
                    消费送{{ currentTemplate.pointsSettings?.points || 10 }}%积分，折扣{{ currentTemplate.pointsSettings?.discount || 30 }}%
                  </div>
                </div>
                
                <div v-if="currentTemplate.marketingTools.includes('COUPON')" class="feature-item">
                  <div class="feature-title">优惠券</div>
                  <div class="feature-detail">
                    满{{ currentTemplate.customSettings?.coupon?.minAmount || 200 }}减{{ currentTemplate.customSettings?.coupon?.amount || 50 }}元
                  </div>
                </div>
                
                <div v-if="currentTemplate.marketingTools.includes('LIMITED_TIME')" class="feature-item">
                  <div class="feature-title">限时活动</div>
                  <div class="feature-detail" v-if="currentTemplate.customSettings?.limitedTime?.timeRange && currentTemplate.customSettings.limitedTime.timeRange.length === 2">
                    {{ formatDateTime(currentTemplate.customSettings.limitedTime.timeRange[0]) }} 至 
                    {{ formatDateTime(currentTemplate.customSettings.limitedTime.timeRange[1]) }}
                  </div>
                </div>
                
                <div v-if="currentTemplate.marketingTools.includes('REFERRAL')" class="feature-item">
                  <div class="feature-title">推荐奖励</div>
                  <div class="feature-detail">
                    推荐人奖励{{ currentTemplate.customSettings?.referral?.referrerReward || 30 }}元，新用户奖励{{ currentTemplate.customSettings?.referral?.newUserReward || 20 }}元
                  </div>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="useTemplate(currentTemplate)">使用模板</el-button>
          <el-button type="success" @click="shareTemplate(currentTemplate)">分享模板</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isCreating ? '创建模板' : '编辑模板'"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form
        :model="templateForm"
        :rules="templateRules"
        ref="templateFormRef"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        
        <el-form-item label="模板分类" prop="category">
          <el-select v-model="templateForm.category" placeholder="选择模板分类">
            <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模板尺寸">
          <el-row :gutter="10">
            <el-col :span="11">
              <el-input-number v-model="templateForm.width" :min="100" :step="10" controls-position="right" />
              <span class="unit">px</span>
            </el-col>
            <el-col :span="2" class="text-center">
              <span>x</span>
            </el-col>
            <el-col :span="11">
              <el-input-number v-model="templateForm.height" :min="100" :step="10" controls-position="right" />
              <span class="unit">px</span>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="缩略图" prop="thumbnail">
          <el-upload
            class="thumbnail-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleThumbnailSuccess"
            :before-upload="beforeUploadImage"
          >
            <img v-if="templateForm.thumbnail" :src="getImageUrl(templateForm.thumbnail)" class="uploaded-thumbnail" @error="handleImageError" />
            <UnifiedIcon name="Plus" />
          </el-upload>
        </el-form-item>
        
        <el-form-item label="预览图" prop="previewImage">
          <el-upload
            class="preview-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handlePreviewSuccess"
            :before-upload="beforeUploadImage"
          >
            <img v-if="templateForm.previewImage" :src="getImageUrl(templateForm.previewImage)" class="uploaded-preview" @error="handleImageError" />
            <UnifiedIcon name="Plus" />
          </el-upload>
        </el-form-item>
        
        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述（选填）"
          />
        </el-form-item>
        
        <!-- 添加营销工具设置 -->
        <el-form-item label="营销功能">
          <el-checkbox-group v-model="templateForm.marketingTools">
            <el-checkbox label="GROUP_BUY">团购功能</el-checkbox>
            <el-checkbox label="POINTS">积分功能</el-checkbox>
            <el-checkbox label="COUPON">优惠券</el-checkbox>
            <el-checkbox label="LIMITED_TIME">限时活动</el-checkbox>
            <el-checkbox label="REFERRAL">推荐奖励</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item v-if="templateForm.marketingTools && Array.isArray(templateForm.marketingTools) && templateForm.marketingTools.includes('GROUP_BUY') && templateForm.groupBuySettings" label="团购设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">最低人数</div>
                <el-input-number v-model="templateForm.groupBuySettings.minUsers" :min="2" :max="100" />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">折扣率</div>
                <el-input-number v-model="templateForm.groupBuySettings.discount" :min="1" :max="9.9" :step="0.1" />
                <span class="unit">折</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item v-if="templateForm.marketingTools && Array.isArray(templateForm.marketingTools) && templateForm.marketingTools.includes('POINTS') && templateForm.pointsSettings" label="积分设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">积分比例</div>
                <el-input-number v-model="templateForm.pointsSettings.points" :min="1" :max="100" />
                <span class="unit">%</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">折扣比例</div>
                <el-input-number v-model="templateForm.pointsSettings.discount" :min="1" :max="100" />
                <span class="unit">%</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item v-if="templateForm.marketingTools && Array.isArray(templateForm.marketingTools) && templateForm.marketingTools.includes('COUPON') && templateForm.customSettings.coupon" label="优惠券设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">面额</div>
                <el-input-number v-model="templateForm.customSettings.coupon.amount" :min="1" :max="1000" />
                <span class="unit">元</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">使用门槛</div>
                <el-input-number v-model="templateForm.customSettings.coupon.minAmount" :min="0" :max="10000" />
                <span class="unit">元</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item v-if="templateForm.marketingTools && Array.isArray(templateForm.marketingTools) && templateForm.marketingTools.includes('LIMITED_TIME') && templateForm.customSettings.limitedTime" label="限时设置">
          <el-date-picker
            v-model="templateForm.customSettings.limitedTime.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        
        <el-form-item v-if="templateForm.marketingTools && Array.isArray(templateForm.marketingTools) && templateForm.marketingTools.includes('REFERRAL') && templateForm.customSettings.referral" label="推荐奖励">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">推荐人</div>
                <el-input-number v-model="templateForm.customSettings.referral.referrerReward" :min="1" :max="1000" />
                <span class="unit">元</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item-wrapper">
                <div class="form-item-label" style="width: auto;">新用户</div>
                <el-input-number v-model="templateForm.customSettings.referral.newUserReward" :min="1" :max="1000" />
                <span class="unit">元</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTemplateForm">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 营销分析对话框 -->
    <el-dialog
      v-model="marketingDialogVisible"
      title="海报营销效果分析"
      width="80%"
      :before-close="handleDialogClose"
    >
      <div class="marketing-analysis-container">
        <!-- 营销数据统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(stat, index) in marketingStats" :key="index">
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
                  <div class="stat-trend" v-if="stat.trend">
                    <el-icon :color="stat.trend === 'up' ? 'var(--success-color)' : 'var(--danger-color)'">
                      <component :is="stat.trend === 'up' ? 'ArrowUp' : 'ArrowDown'"></component>
                    </el-icon>
                    <span :style="{color: stat.trend === 'up' ? 'var(--success-color)' : 'var(--danger-color)'}">{{ stat.trendValue }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 图表区域 -->
        <el-row :gutter="20" class="chart-row">
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>海报使用趋势</span>
                  <el-radio-group v-model="chartTimeRange" size="small">
                    <el-radio-button :value="'week'">周</el-radio-button>
                    <el-radio-button :value="'month'">月</el-radio-button>
                    <el-radio-button :value="'quarter'">季度</el-radio-button>
                  </el-radio-group>
                </div>
              </template>
              <div class="chart-container">
                <div class="chart-placeholder">海报使用趋势图表</div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>转化渠道分析</span>
                  <el-select v-model="channelType" size="small" placeholder="渠道类型">
                    <el-option label="所有渠道" value="all" />
                    <el-option label="社交媒体" value="social" />
                    <el-option label="线下活动" value="offline" />
                    <el-option label="学校推广" value="school" />
                  </el-select>
                </div>
              </template>
              <div class="chart-container">
                <div class="chart-placeholder">转化渠道分析图表</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 海报效果排名表格 -->
        <el-card class="detail-card">
          <template #header>
            <div class="detail-header">
              <span>海报效果排名</span>
              <div class="header-actions">
                <el-radio-group v-model="effectMetric" size="small">
                  <el-radio-button :value="'views'">浏览量</el-radio-button>
                  <el-radio-button :value="'shares'">分享量</el-radio-button>
                  <el-radio-button :value="'conversions'">转化量</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" @click="exportMarketingData">
                  <UnifiedIcon name="Download" />
                  导出数据
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="table-wrapper">
<el-table class="responsive-table" :data="posterEffectList" style="width: 100%" border>
            <el-table-column type="index" width="50" label="排名" />
            <el-table-column prop="name" label="海报名称" min-width="150" />
            <el-table-column prop="category" label="分类" min-width="100">
              <template #default="scope">
                <el-tag :type="getCategoryType(scope.row.category)">{{ getCategoryLabel(scope.row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="views" label="浏览量" min-width="100" sortable />
            <el-table-column prop="shares" label="分享量" min-width="100" sortable />
            <el-table-column prop="conversions" label="转化量" min-width="100" sortable />
            <el-table-column label="转化率" min-width="100" sortable>
              <template #default="scope">
                {{ calculateConversionRate(scope.row.conversions, scope.row.views) }}%
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" min-width="150">
              <template #default="scope">
                {{ formatDateTime(scope.row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewPosterDetail(scope.row)">
                  详情
                </el-button>
                <el-button type="success" size="small" @click="optimizePoster(scope.row)">
                  优化
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </el-card>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="marketingDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="generateMarketingReport">生成分析报告</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit, Delete, Plus, Upload, Document, Search, TrendCharts,
  Promotion, StarFilled, Ticket, Clock, Share, Download, CopyDocument
} from '@element-plus/icons-vue'

// 3. 统一API端点导入
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import { formatDateTime } from '../../utils/dateFormat'

// 4. 页面内部类型定义
// 定义类型的映射
type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

// 5. 导入图片处理工具
import { getImageUrl, handleImageError } from '@/utils/image'

// 定义PosterTemplate接口
interface PosterTemplate {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  usageCount: number;
  width: number;
  height: number;
  description: string | null;
  marketingTools: string[];
  groupBuySettings: {
    minUsers: number;
    discount: number;
  } | null;
  pointsSettings: {
    points: number;
    discount: number;
  } | null;
  customSettings: Record<string, any> | null;
}

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

// 定义与API一致的表单类型
interface TypeSafeCreatePosterTemplateRequest {
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  width: number;
  height: number;
  description: string;
  marketingTools: string[];
  groupBuySettings: {
    minUsers: number;
    discount: number;
  };
  pointsSettings: {
    points: number;
    discount: number;
  };
  customSettings: {
    coupon?: {
      amount: number;
      minAmount: number;
    };
    limitedTime?: {
      timeRange: string[];
    };
    referral?: {
      referrerReward: number;
      newUserReward: number;
    };
  };
}

// API 方法
const getPosterTemplates = async (params?: any): Promise<ApiResponse<{ templates: PosterTemplate[]; total: number }>> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATES, { params })
    return res
  } catch (error) {
    console.error('获取海报模板失败:', error)
    return {
      success: false,
  message: '获取海报模板失败'
    }
  }
}

const getPosterTemplate = async (id: number): Promise<ApiResponse<PosterTemplate>> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATE_BY_ID(id))
    return res
  } catch (error) {
    console.error('获取海报模板详情失败:', error)
    return {
      success: false,
  message: '获取海报模板详情失败'
    }
  }
}

const createPosterTemplate = async (data: any): Promise<ApiResponse<PosterTemplate>> => {
  try {
    const res: ApiResponse = await request.post(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATES, data)
    return res
  } catch (error) {
    console.error('创建海报模板失败:', error)
    return {
      success: false,
  message: '创建海报模板失败'
    }
  }
}

const updatePosterTemplate = async (id: number, data: any): Promise<ApiResponse<PosterTemplate>> => {
  try {
    const res: ApiResponse = await request.put(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATE_BY_ID(id), data)
    return res
  } catch (error) {
    console.error('更新海报模板失败:', error)
    return {
      success: false,
  message: '更新海报模板失败'
    }
  }
}

const deletePosterTemplate = async (id: number): Promise<ApiResponse<{ id: number }>> => {
  try {
    const res: ApiResponse = await request.delete(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATE_BY_ID(id))
    return res
  } catch (error) {
    console.error('删除海报模板失败:', error)
    return {
      success: false,
  message: '删除海报模板失败'
    }
  }
}

const router = useRouter();
const loading = ref(false)

// 模板列表数据
const templates = ref<PosterTemplate[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 搜索和过滤参数
const searchKeyword = ref('')
const categoryFilter = ref('')

// 当前选中的模板
const currentTemplate = ref<PosterTemplate | null>(null)

// 对话框状态
const previewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const isCreating = ref(false)

// 模板分类选项
const categories = ref([
  { value: 'enrollment', label: '招生宣传' },
  { value: 'activity', label: '活动推广' },
  { value: 'festival', label: '节日庆祝' },
  { value: 'notice', label: '通知公告' },
  { value: 'education', label: '教育教学' },
  { value: 'safety', label: '安全健康' }
])

// 获取分类数据
const fetchCategories = async () => {
  try {
    // 添加超时控制，5秒后自动放弃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('获取分类超时')), 5000)
    })

    const response = await Promise.race([
      request.get('/poster-templates/categories'),
      timeoutPromise
    ]) as any

    if (response.data && Array.isArray(response.data)) {
      // 转换API数据格式为前端需要的格式
      const apiCategories = response.data.map((cat: any) => ({
        value: cat.code,
        label: cat.name,
        children: cat.children ? cat.children.map((child: any) => ({
          value: child.code,
          label: child.name
        })) : []
      }))

      // 扁平化处理，包含父分类和子分类
      const flatCategories: any[] = []
      apiCategories.forEach((parent: any) => {
        flatCategories.push({ value: parent.value, label: parent.label })
        if (parent.children && parent.children.length > 0) {
          parent.children.forEach((child: any) => {
            flatCategories.push({ value: child.value, label: `${parent.label} - ${child.label}` })
          })
        }
      })

      categories.value = flatCategories
      console.log('✅ 分类数据加载成功:', categories.value)
    }
  } catch (error) {
    console.error('❌ 获取分类数据失败:', error)
    ElMessage.error('获取分类数据失败')
  }
}

// 模板表单
const templateForm = ref<TypeSafeCreatePosterTemplateRequest>({
  name: '',
  category: 'ENROLLMENT',
  thumbnail: '',
  previewImage: '',
  width: 750,
  height: 1334,
  description: '',
  marketingTools: [],
  groupBuySettings: {
    minUsers: 3,
  discount: 8.5
  },
  pointsSettings: {
    points: 10,
  discount: 30
  },
  customSettings: {
    coupon: {
      amount: 50,
      minAmount: 200
    },
    limitedTime: {
      timeRange: []
    },
  referral: {
      referrerReward: 30,
      newUserReward: 20
    }
  }
})

// 监听marketingTools变化，确保相关设置对象存在
watch(() => templateForm.value.marketingTools, (newTools) => {
  // 团购设置
  if (newTools && Array.isArray(newTools) && newTools.includes('GROUP_BUY') && !templateForm.value.groupBuySettings) {
    templateForm.value.groupBuySettings = {
      minUsers: 3,
  discount: 8.5
    };
  }
  
  // 积分设置
  if (newTools && Array.isArray(newTools) && newTools.includes('POINTS') && !templateForm.value.pointsSettings) {
    templateForm.value.pointsSettings = {
      points: 10,
  discount: 30
    };
  }
  
  // 确保customSettings存在
  if (!templateForm.value.customSettings) {
    templateForm.value.customSettings = {};
  }
  
  // 优惠券设置
  if (newTools && Array.isArray(newTools) && newTools.includes('COUPON')) {
    if (!templateForm.value.customSettings.coupon) {
      templateForm.value.customSettings.coupon = {
        amount: 50,
        minAmount: 200
      };
    }
  }
  
  // 限时设置
  if (newTools && Array.isArray(newTools) && newTools.includes('LIMITED_TIME')) {
    if (!templateForm.value.customSettings.limitedTime) {
      templateForm.value.customSettings.limitedTime = {
        timeRange: []
      };
    }
  }
  
  // 推荐奖励
  if (newTools && Array.isArray(newTools) && newTools.includes('REFERRAL')) {
    if (!templateForm.value.customSettings.referral) {
      templateForm.value.customSettings.referral = {
        referrerReward: 30,
        newUserReward: 20
      };
    }
  }
}, { deep: true });

// 表单验证规则
const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  thumbnail: [
    { required: true, message: '请上传缩略图', trigger: 'change' }
  ],
  previewImage: [
    { required: true, message: '请上传预览图', trigger: 'change' }
  ]
}

const templateFormRef = ref<any>(null)

// 上传URL
const uploadUrl = '/api/upload/poster-image'

// 获取模板列表
const fetchTemplates = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
  keyword: searchKeyword.value || undefined,
  category: categoryFilter.value || undefined
    }

    // 添加超时控制，10秒后自动放弃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('获取模板列表超时')), 10000)
    })

    const res = await Promise.race([
      getPosterTemplates(params),
      timeoutPromise
    ]) as any
    
    if (res.success) {
      // 处理后端返回的数据结构
      if (res.data && res.data.templates) {
        templates.value = res.data.templates;
        total.value = res.data.total;
      } else if (res.data && Array.isArray(res.data)) {
        // 如果返回的是直接数组
        templates.value = res.data;
        total.value = res.total || 0;
      } else {
        // 尝试从response本身获取数据
        const responseAny = res as any;
        if (responseAny.items && Array.isArray(responseAny.items)) {
          templates.value = responseAny.items;
          total.value = responseAny.total || responseAny.items.length || 0;
        } else {
          templates.value = [];
          total.value = 0;
        }
      }
    } else {
      ElMessage.error(res.message || '获取模板列表失败');
      templates.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取模板列表失败:', error);
    ElMessage.error('获取模板列表失败');
    templates.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchTemplates()
}

// 筛选处理
const handleFilterChange = () => {
  currentPage.value = 1
  fetchTemplates()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchTemplates()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchTemplates()
}

// 预览模板
const previewTemplate = (template: PosterTemplate) => {
  currentTemplate.value = template
  previewDialogVisible.value = true
}

// 编辑模板
const editTemplate = (template: PosterTemplate) => {
  router.push(`/principal/poster-editor/${template.id}`);
}

// 创建模板
const createTemplate = () => {
  router.push('/principal/poster-editor');
}

// 复制模板
const copyTemplate = async (template: PosterTemplate) => {
  try {
    loading.value = true;

    // 创建复制的模板数据
    const copyData = {
      name: `${template.name} - 副本`,
      category: template.category,
      thumbnail: template.thumbnail,
      previewImage: template.previewImage,
      width: template.width,
      height: template.height,
      description: template.description,
      marketingTools: template.marketingTools,
      groupBuySettings: template.groupBuySettings,
      pointsSettings: template.pointsSettings,
      customSettings: template.customSettings
    };

    const res = await createPosterTemplate(copyData);

    if (res.success) {
      ElMessage.success('模板复制成功');
      fetchTemplates();
    } else {
      ElMessage.error(res.message || '复制失败');
    }
  } catch (error) {
    console.error('复制模板失败:', error);
    ElMessage.error('复制模板失败');
  } finally {
    loading.value = false;
  }
}

// 删除模板
const deleteTemplate = async (template: PosterTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${template.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    );
    
    loading.value = true;
    const res = await deletePosterTemplate(template.id);
    
    if (res.success) {
      ElMessage.success('模板删除成功');
      fetchTemplates();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模板失败:', error);
      ElMessage.error('删除模板失败');
    }
  } finally {
    loading.value = false;
  }
}

// 使用模板
const useTemplate = (template: PosterTemplate | null) => {
  if (!template) return;
  router.push(`/principal/poster-generator/${template.id}`);
}

// 分享模板
const shareTemplate = (template: PosterTemplate | null) => {
  if (!template) return;
  ElMessage.info(`分享模板 "${template.name}" 功能开发中`);
  // 这里可以实现模板分享功能
}

// 营销分析
const showMarketingAnalysis = () => {
  router.push('/principal/marketing-analysis');
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 上传成功处理
const handleUploadSuccess = (response: ApiResponse<any>, file: File) => {
  if (response.success) {
    ElMessage.success('模板导入成功')
    fetchTemplates()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 对话框关闭处理
const handleDialogClose = () => {
  previewDialogVisible.value = false
  editDialogVisible.value = false
  currentTemplate.value = null
}

// 保存模板
const submitTemplateForm = () => {
  templateFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      loading.value = true
      
      // 将类型安全的表单数据转换为API所需的请求数据
      const apiRequestData = {
        name: templateForm.value.name,
  category: templateForm.value.category,
  thumbnail: templateForm.value.thumbnail,
        previewImage: templateForm.value.previewImage,
  width: templateForm.value.width,
  height: templateForm.value.height,
  description: templateForm.value.description || null,
        marketingTools: templateForm.value.marketingTools,
        // 根据marketingTools选择性添加设置
        groupBuySettings: templateForm.value.marketingTools.includes('GROUP_BUY') ? templateForm.value.groupBuySettings : null,
        pointsSettings: templateForm.value.marketingTools.includes('POINTS') ? templateForm.value.pointsSettings : null,
        customSettings: templateForm.value.customSettings || {}
      };
      
      if (isCreating.value) {
        // 创建新模板
        const res = await createPosterTemplate(apiRequestData)
        if (res.success) {
          ElMessage.success('模板创建成功')
          editDialogVisible.value = false
          fetchTemplates()
        } else {
          ElMessage.error(res.message || '创建失败')
        }
      } else if (currentTemplate.value) {
        // 更新现有模板
        const res = await updatePosterTemplate(currentTemplate.value.id, apiRequestData)
        if (res.success) {
          ElMessage.success('模板更新成功')
          editDialogVisible.value = false
          fetchTemplates()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      }
    } catch (error) {
      console.error('保存模板失败:', error)
      ElMessage.error('保存模板失败')
    } finally {
      loading.value = false
    }
  })
}

// 获取分类标签类型
const getCategoryType = (category: string): TagType => {
  const found = categories.value.find(c => c.value === category)
  return found ? 'info' : 'info' as TagType
}

// 获取分类标签文本
const getCategoryLabel = (category: string): string => {
  const found = categories.value.find(c => c.value === category)
  return found ? found.label : category
}

// 格式化日期
const formatDate = (date: string | Date): string => {
  return formatDateTime(date)
}

// 营销分析相关
const marketingDialogVisible = ref(false)
const chartTimeRange = ref('month')
const channelType = ref('all')
const effectMetric = ref('views')

// 营销统计数据
const marketingStats = ref([
  {
  label: '累计浏览量',
  value: '12,584',
  icon: 'eye',
  type: 'primary',
  trend: 'up',
    trendValue: '15%'
  },
  {
  label: '累计分享量',
  value: '3,682',
  icon: 'Share',
  type: 'success',
  trend: 'up',
    trendValue: '8%'
  },
  {
  label: '平均转化率',
  value: '5.8%',
  icon: 'TrendCharts',
  type: 'warning',
  trend: 'up',
    trendValue: '2.3%'
  },
  {
  label: '累计转化量',
  value: '731',
  icon: 'DataAnalysis',
  type: 'info',
  trend: 'up',
    trendValue: '12%'
  }
])

// 海报效果排名数据
const posterEffectList = ref([
  {
    id: 1,
  name: '春季招生模板',
  category: 'SEASON',
  views: 3250,
  shares: 980,
  conversions: 215,
    updateTime: '2023-03-15T14:30:00'
  },
  {
    id: 2,
  name: '暑期招生模板',
  category: 'SEASON',
  views: 2860,
  shares: 850,
  conversions: 176,
    updateTime: '2023-05-20T10:15:00'
  },
  {
    id: 3,
  name: '秋季入学模板',
  category: 'SEASON',
  views: 2150,
  shares: 620,
  conversions: 142,
    updateTime: '2023-08-05T16:45:00'
  },
  {
    id: 4,
  name: '艺术班招生',
  category: 'SPECIAL',
  views: 1850,
  shares: 540,
  conversions: 98,
    updateTime: '2023-04-12T11:20:00'
  },
  {
    id: 5,
  name: '科学实验班',
  category: 'SPECIAL',
  views: 1580,
  shares: 420,
  conversions: 65,
    updateTime: '2023-05-18T09:30:00'
  }
])

// 计算转化率
const calculateConversionRate = (conversions: number, views: number) => {
  if (!views) return '0.00'
  return ((conversions / views) * 100).toFixed(2)
}

// 生成营销分析报告
const generateMarketingReport = () => {
  ElMessage.success('营销分析报告已生成，即将下载')
  setTimeout(() => {
    marketingDialogVisible.value = false
  }, 1500)
}

// 查看海报详情
const viewPosterDetail = (poster: any) => {
  ElMessage.info(`查看海报详情：${poster.name}`)
}

// 优化海报
const optimizePoster = (poster: any) => {
  ElMessage.info(`优化海报：${poster.name}`)
}

// 图片上传相关函数
const beforeUploadImage = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 缩略图上传成功回调
const handleThumbnailSuccess = (res: any) => {
  if (res.success) {
    templateForm.value.thumbnail = res.data.url
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

// 预览图上传成功回调
const handlePreviewSuccess = (res: any) => {
  if (res.success) {
    templateForm.value.previewImage = res.data.url
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

// 导出营销数据
const exportMarketingData = () => {
  ElMessage.info('导出营销数据功能开发中')
}

onMounted(() => {
  fetchCategories()
  fetchTemplates()
})
</script>

<style>
@use '@/styles/index.scss' as *;

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--bg-secondary); /* 白色区域修复：使用主题背景色 */
  max-width: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.standalone-header {
  padding: var(--app-gap-sm) var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.standalone-main-content {
  flex: 1;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-secondary); /* 白色区域修复：使用主题背景色 */
}

.page-title {
  margin-bottom: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-orange); /* 硬编码修复：使用橙色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  flex-wrap: wrap;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  width: 100%;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.search-box {
  max-width: 240px; width: 100%;
}

.filter-box {
  max-width: 180px; width: 100%;
}

/* 按钮排版修复：工具栏按钮组 */
.action-box {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
}

.action-box .el-button {
  min-width: var(--spacing-5xl);
  height: var(--spacing-2xl);
  font-weight: 500;
}

.action-box .el-button .el-icon {
  margin-right: var(--app-gap-xs);
}

.action-box .el-button:hover {
  transform: translateY(var(--z-index-below));
  box-shadow: var(--shadow-sm);
}

.templates-wrapper {
  min-min-height: 60px; height: auto;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-secondary); /* 白色区域修复：使用主题背景色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  width: 100%;
  margin: 0 auto;
}

.template-grid-item {
  width: 100%;
}

.template-card {
  width: 100%;
  height: 100%;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  position: relative;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl); /* 硬编码修复：使用统一阴影变量 */
  border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.template-card:hover .template-mask {
  opacity: 1;
}

.template-preview {
  width: 100%;
  min-height: 60px; height: auto;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.template-card:hover .thumbnail {
  transform: scale(1.05);
}

.template-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--black-alpha-60);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

/* 按钮排版修复：模板卡片操作按钮 */
.mask-actions {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
}

.mask-actions .el-button {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-actions .el-button:hover {
  transform: scale(1.1);
}

.template-usage {
  position: absolute;
  top: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  right: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  z-index: var(--z-index-dropdown);
}

.template-info {
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-top: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.template-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.update-time {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */
  width: 100%;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

/* 白色区域修复：Element Plus组件主题化 */
:deep(.el-input) .el-input__wrapper {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input) .el-input__wrapper:hover {
  border-color: var(--border-light) !important;
}

:deep(.el-input) .el-input__wrapper.is-focus {
  border-color: var(--primary-color) !important;
}

:deep(.el-input) .el-input__inner {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input) .el-input__inner::placeholder {
  color: var(--text-muted) !important;
}

:deep(.el-select) .el-input__wrapper {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.el-button.el-button--primary:hover) {
  background: var(--primary-light) !important;
  border-color: var(--primary-light) !important;
}

:deep(.el-button.el-button--success) {
  background: var(--success-color) !important;
  border-color: var(--success-color) !important;
}

:deep(.el-button.el-button--success:hover) {
  background: var(--success-light) !important;
  border-color: var(--success-light) !important;
}

:deep(.el-button.el-button--warning) {
  background: var(--warning-color) !important;
  border-color: var(--warning-color) !important;
}

:deep(.el-button.el-button--warning:hover) {
  background: var(--warning-light) !important;
  border-color: var(--warning-light) !important;
}

:deep(.el-button.el-button--danger) {
  background: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

:deep(.el-button.el-button--danger:hover) {
  background: var(--danger-light) !important;
  border-color: var(--danger-light) !important;
}

:deep(.el-tag.el-tag--primary) {
  background: var(--primary-light-9) !important;
  color: var(--primary-color) !important;
  border-color: var(--primary-light-8) !important;
}

:deep(.el-tag.el-tag--success) {
  background: var(--success-light-9) !important;
  color: var(--success-color) !important;
  border-color: var(--success-light-8) !important;
}

:deep(.el-tag.el-tag--warning) {
  background: var(--warning-light-9) !important;
  color: var(--warning-color) !important;
  border-color: var(--warning-light-8) !important;
}

:deep(.el-tag.el-tag--danger) {
  background: var(--danger-light-9) !important;
  color: var(--danger-color) !important;
  border-color: var(--danger-light-8) !important;
}

:deep(.el-tag.el-tag--info) {
  background: var(--info-light-9) !important;
  color: var(--info-color) !important;
  border-color: var(--info-light-8) !important;
}

:deep(.el-pagination) .el-pagination__total,
:deep(.el-pagination) .el-pagination__jump {
  color: var(--text-primary) !important;
}

:deep(.el-pagination) .el-pager li {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-pagination) .el-pager li:hover {
  color: var(--primary-color) !important;
}

:deep(.el-pagination) .el-pager li.is-active {
  background: var(--primary-color) !important;
  color: var(--bg-card) !important;
}

:deep(.el-pagination) .btn-prev,
:deep(.el-pagination) .btn-next {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-pagination) .btn-prev:hover,
:deep(.el-pagination) .btn-next:hover {
  color: var(--primary-color) !important;
}

:deep(.el-empty) .el-empty__description {
  color: var(--text-secondary) !important;
}

:deep(.el-empty) .el-empty__image svg {
  fill: var(--text-muted) !important;
}

:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-dialog) .el-dialog__header {
  background: var(--bg-tertiary) !important;
  border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
}

:deep(.el-dialog) .el-dialog__header .el-dialog__title {
  color: var(--text-primary) !important;
}

:deep(.el-dialog) .el-dialog__body {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-descriptions) .el-descriptions__body .el-descriptions__table {
  border-color: var(--border-color) !important;
}

:deep(.el-descriptions) .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
  border-color: var(--border-color) !important;
}

:deep(.el-descriptions) .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell.el-descriptions-item__label {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  font-weight: 600;
}

:deep(.el-descriptions) .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell.el-descriptions-item__content {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .standalone-header {
    padding: var(--app-gap-xs) var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .standalone-main-content {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--text-xl);
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .search-box,
  .filter-box {
    width: 100%;
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .action-box {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .action-box .el-button {
    flex: 1;
    min-width: auto;
    max-max-width: 120px; width: 100%;
  }
  
  .templates-wrapper {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .template-preview {
    min-height: 60px; height: auto;
  }
  
  .template-info {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .template-name {
    font-size: var(--text-base);
  }
  
  .pagination-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .standalone-header {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .standalone-main-content {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-title {
    font-size: var(--text-lg);
  }
  
  .toolbar {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .templates-wrapper {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .template-preview {
    min-height: 60px; height: auto;
  }
  
  .template-name {
    font-size: var(--text-sm);
  }
  
  .mask-actions {
    gap: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .mask-actions .el-button {
    width: var(--spacing-2xl);
    height: var(--spacing-2xl);
  }
}

@media (min-width: 992px) {
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (min-width: var(--breakpoint-xl)) {
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (min-width: 1600px) {
  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

.filter-section {
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-60);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(var(--spacing-xs));
}

.modal-content {
  width: 80%;
  max-width: 100%; max-width: 600px;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-xl); /* 硬编码修复：使用统一阴影变量 */
  overflow: hidden;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

/* 特殊样式：页面标题增强效果 */
.page-title {
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -var(--spacing-xs);
  left: 50%;
  transform: translateX(-50%);
  width: var(--spacing-3xl);
  height: var(--spacing-xs);
  background: var(--gradient-orange);
  border-radius: var(--radius-sm);
}

/* 特殊样式：模板卡片增强效果 */
.template-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-orange);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: var(--z-index-below);
}

.template-card:hover::before {
  opacity: 0.05;
}
</style> 