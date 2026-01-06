<template>
  <UnifiedCenterLayout
    title="话术中心"
    description="这里是话术模板的管理中心，您可以创建、编辑和管理各种场景的话术模板"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreateScript">
        <el-icon><Plus /></el-icon>
        新建话术
      </el-button>
    </template>

    <div class="center-container script-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 话术模板标签页 -->
        <el-tab-pane label="话术模板" name="templates">
          <div class="overview-content">
          <!-- 话术分类 -->
          <div class="script-categories">
            <h3 class="section-title">话术分类</h3>
            <div class="actions-grid-unified">
              <div
                v-for="category in scriptCategories"
                :key="category.key"
                class="module-item"
                @click="selectCategory(category)"
              >
                <div class="module-icon">{{ category.emoji || '📝' }}</div>
                <div class="module-content">
                  <h4>{{ category.title }}</h4>
                  <p>{{ category.description }}</p>
                  <span class="script-count">{{ category.count }}个话术</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 话术列表 -->
          <div class="script-list" v-if="selectedCategory">
            <div class="list-header">
              <h3>{{ selectedCategory.title }}话术</h3>
              <div class="header-actions">
                <span class="script-count">共 {{ totalScripts }} 条话术</span>
                <el-button size="small" @click="handleBackToCategories">返回分类</el-button>
              </div>
            </div>
            <div class="script-grid">
              <div 
                v-for="script in filteredScripts" 
                :key="script.id"
                class="script-card"
              >
                <div class="script-header">
                  <h4>{{ script.title }}</h4>
                  <div class="script-actions">
                    <el-button size="small" @click="editScript(script)">编辑</el-button>
                    <el-button size="small" @click="copyScript(script)">复制</el-button>
                  </div>
                </div>
                <div class="script-content">
                  <p>{{ script.content }}</p>
                </div>
                <div class="script-meta">
                  <span class="usage-count">使用 {{ script.usageCount }} 次</span>
                  <span class="update-time">{{ formatTime(script.updatedAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 分页器 -->
            <div class="pagination-container" v-if="totalPages > 1">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[3, 5, 10, 20]"
                :total="totalScripts"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
        </el-tab-pane>

        <!-- 使用统计标签页 -->
        <el-tab-pane label="使用统计" name="statistics">
          <div class="statistics-content">
          <!-- 统计概览 -->
          <div class="stats-overview">
            <h3 class="section-title">使用统计概览</h3>
            <div class="stats-grid-unified">
              <StatCard
                title="总话术数"
                :value="scriptStats.totalScripts"
                icon-name="document"
                type="primary"
                trend="up"
                :trend-text="`活跃话术`"
                clickable
                @click="handleStatClick('total')"
              />
              <StatCard
                title="总使用次数"
                :value="scriptStats.totalUsages"
                icon-name="trending-up"
                type="success"
                trend="up"
                :trend-text="`本月使用`"
                clickable
                @click="handleStatClick('usage')"
              />
              <StatCard
                title="热门话术"
                :value="scriptStats.popularCount"
                icon-name="star"
                type="warning"
                trend="stable"
                :trend-text="`使用>10次`"
                clickable
                @click="handleStatClick('popular')"
              />
              <StatCard
                title="平均评分"
                :value="scriptStats.averageRating"
                unit=""
                icon-name="check-circle"
                type="info"
                trend="up"
                :trend-text="`效果评分`"
                clickable
                @click="handleStatClick('rating')"
              />
            </div>
          </div>

          <!-- 使用趋势图表 -->
          <div class="charts-section">
            <div class="chart-container">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>使用趋势</h3>
                  <el-select v-model="statsTimeRange" size="small" style="width: 120px;">
                    <el-option label="最近7天" value="7" />
                    <el-option label="最近30天" value="30" />
                    <el-option label="最近90天" value="90" />
                  </el-select>
                </div>
                <div ref="usageTrendChart" style="height: 300px;"></div>
              </div>
            </div>

            <div class="chart-container">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>话术类型分布</h3>
                </div>
                <div ref="scriptTypeChart" style="height: 300px;"></div>
              </div>
            </div>
          </div>

          <!-- 热门话术排行 -->
          <div class="popular-scripts">
            <h3 class="section-title">热门话术排行</h3>
            <div class="popular-list">
              <div
                v-for="(script, index) in popularScripts"
                :key="script.id"
                class="popular-item"
              >
                <div class="rank">{{ index + 1 }}</div>
                <div class="script-info">
                  <h4>{{ script.title }}</h4>
                  <p>{{ script.category }}</p>
                </div>
                <div class="usage-info">
                  <div class="usage-count">{{ script.usageCount }}次</div>
                  <div class="rating">
                    <el-rate
                      v-model="script.rating"
                      disabled
                      size="small"
                      show-score
                    />
                  </div>
                </div>
                <div class="actions">
                  <el-button size="small" @click="viewScript(script)">查看</el-button>
                  <el-button size="small" @click="useScript(script)">使用</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 使用记录 -->
          <div class="usage-records">
            <h3 class="section-title">最近使用记录</h3>
            <el-table :data="recentUsages" style="width: 100%">
              <el-table-column prop="scriptTitle" label="话术标题" />
              <el-table-column prop="userName" label="使用者" />
              <el-table-column prop="usageContext" label="使用场景" />
              <el-table-column prop="effectiveRating" label="效果评分">
                <template #default="{ row }">
                  <el-rate v-model="row.effectiveRating" disabled size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="usageDate" label="使用时间">
                <template #default="{ row }">
                  {{ formatTime(row.usageDate) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        </el-tab-pane>

        <!-- 设置标签页 -->
        <el-tab-pane label="设置" name="settings">
          <div class="settings-content">
          <div class="section-header">
            <h3>话术中心设置</h3>
            <el-button @click="handleSaveSettings" :loading="settingsLoading" type="primary">
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>
          </div>

          <div class="settings-grid">
            <!-- 分类管理 -->
            <div class="settings-card">
              <div class="card-header">
                <h4>分类管理</h4>
                <el-button size="small" @click="showAddCategoryDialog = true">
                  <el-icon><Plus /></el-icon>
                  新增分类
                </el-button>
              </div>
              <div class="card-content">
                <div class="category-list">
                  <div
                    v-for="category in scriptCategories"
                    :key="category.key"
                    class="category-item"
                  >
                    <div class="category-info">
                      <div class="category-icon" :style="{ backgroundColor: category.color }">
                        <el-icon><component :is="category.icon" /></el-icon>
                      </div>
                      <div class="category-details">
                        <h5>{{ category.title }}</h5>
                        <p>{{ category.description }}</p>
                      </div>
                    </div>
                    <div class="category-actions">
                      <el-button size="small" @click="editCategory(category)">编辑</el-button>
                      <el-button size="small" type="danger" @click="deleteCategory(category)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 权限设置 -->
            <div class="settings-card">
              <div class="card-header">
                <h4>权限设置</h4>
              </div>
              <div class="card-content">
                <el-form :model="scriptSettings" label-width="120px">
                  <el-form-item label="创建话术权限">
                    <el-select v-model="scriptSettings.createPermission" multiple>
                      <el-option label="所有用户" value="all" />
                      <el-option label="管理员" value="admin" />
                      <el-option label="教师" value="teacher" />
                      <el-option label="招生人员" value="enrollment" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="编辑话术权限">
                    <el-select v-model="scriptSettings.editPermission" multiple>
                      <el-option label="创建者" value="creator" />
                      <el-option label="管理员" value="admin" />
                      <el-option label="同部门" value="department" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="删除话术权限">
                    <el-select v-model="scriptSettings.deletePermission" multiple>
                      <el-option label="创建者" value="creator" />
                      <el-option label="管理员" value="admin" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 使用设置 -->
            <div class="settings-card">
              <div class="card-header">
                <h4>使用设置</h4>
              </div>
              <div class="card-content">
                <el-form :model="scriptSettings" label-width="120px">
                  <el-form-item label="使用记录">
                    <el-switch v-model="scriptSettings.trackUsage" />
                    <span class="form-help">记录话术使用次数和效果</span>
                  </el-form-item>

                  <el-form-item label="效果评分">
                    <el-switch v-model="scriptSettings.enableRating" />
                    <span class="form-help">允许用户对话术效果进行评分</span>
                  </el-form-item>

                  <el-form-item label="使用反馈">
                    <el-switch v-model="scriptSettings.enableFeedback" />
                    <span class="form-help">收集用户使用反馈</span>
                  </el-form-item>

                  <el-form-item label="推荐算法">
                    <el-switch v-model="scriptSettings.enableRecommendation" />
                    <span class="form-help">基于使用历史推荐相关话术</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 导入导出 -->
            <div class="settings-card">
              <div class="card-header">
                <h4>导入导出</h4>
              </div>
              <div class="card-content">
                <div class="import-export-actions">
                  <div class="action-item">
                    <h5>导入话术</h5>
                    <p>支持从Excel、CSV文件批量导入话术</p>
                    <el-button @click="handleImportScripts">
                      <el-icon><Upload /></el-icon>
                      选择文件导入
                    </el-button>
                  </div>

                  <div class="action-item">
                    <h5>导出话术</h5>
                    <p>导出所有话术数据到Excel文件</p>
                    <el-button @click="handleExportScripts">
                      <el-icon><Download /></el-icon>
                      导出话术数据
                    </el-button>
                  </div>

                  <div class="action-item">
                    <h5>备份数据</h5>
                    <p>创建话术数据的完整备份</p>
                    <el-button @click="handleBackupData">
                      <el-icon><FolderOpened /></el-icon>
                      创建备份
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑话术对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑话术"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="话术标题" prop="title">
          <el-input
            v-model="editForm.title"
            placeholder="请输入话术标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="话术分类" prop="categoryKey">
          <el-select
            v-model="editForm.categoryKey"
            placeholder="请选择话术分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in scriptCategories"
              :key="category.key"
              :label="category.title"
              :value="category.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="话术内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入话术内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit" :loading="saving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Plus, ChatDotRound, Phone, User, School,
  TrendCharts, Setting, Document, Edit, CopyDocument,
  Star, SuccessFilled, Check, Upload, Download, FolderOpened
} from '@element-plus/icons-vue'
import StatCard from '@/components/centers/StatCard.vue'
import * as echarts from 'echarts'
import ScriptAPI from '@/api/modules/script'

const router = useRouter()

// 响应式数据
const activeTab = ref('templates')
const loading = ref(false)
const selectedCategory = ref(null)

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(3) // 设置为3条每页，方便看到分页效果

// 统计相关数据
const statsTimeRange = ref('30')
const usageTrendChart = ref()
const scriptTypeChart = ref()

// 设置相关数据
const settingsLoading = ref(false)
const showAddCategoryDialog = ref(false)

// 编辑相关数据
const editDialogVisible = ref(false)
const editFormRef = ref()
const saving = ref(false)
const editForm = reactive({
  id: null as number | null,
  title: '',
  categoryKey: '',
  content: ''
})

// 表单验证规则
const editFormRules = {
  title: [
    { required: true, message: '请输入话术标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryKey: [
    { required: true, message: '请选择话术分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入话术内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 标签页配置

// 话术分类 - 动态计算数量
const scriptCategories = computed(() => [
  {
    key: 'enrollment',
    title: '招生话术',
    description: '招生咨询、介绍、跟进等话术',
    icon: School,
    emoji: '🎓',
    color: 'var(--primary-color)',
    count: scripts.value.filter(s => s.categoryKey === 'enrollment').length,
    path: null // 暂时没有对应页面
  },
  {
    key: 'phone',
    title: '电话话术',
    description: '电话沟通、回访、邀约等话术',
    icon: Phone,
    emoji: '📞',
    color: 'var(--success-color)',
    count: scripts.value.filter(s => s.categoryKey === 'phone').length,
    path: null // 暂时没有对应页面
  },
  {
    key: 'reception',
    title: '接待话术',
    description: '家长接待、参观介绍等话术',
    icon: User,
    emoji: '👥',
    color: 'var(--warning-color)',
    count: scripts.value.filter(s => s.categoryKey === 'reception').length,
    path: null // 暂时没有对应页面
  },
  {
    key: 'followup',
    title: '跟进话术',
    description: '客户跟进、维护、转化等话术',
    icon: ChatDotRound,
    emoji: '🔄',
    color: 'var(--danger-color)',
    count: scripts.value.filter(s => s.categoryKey === 'followup').length,
    path: null // 暂时没有对应页面
  },
  {
    key: 'consultation',
    title: '咨询话术',
    description: '专业咨询、解答疑问等话术',
    icon: ChatDotRound,
    emoji: '🤔',
    color: 'var(--info-color)',
    count: scripts.value.filter(s => s.categoryKey === 'consultation').length,
    path: null // 暂时没有对应页面
  },
  {
    key: 'objection',
    title: '异议处理话术',
    description: '处理家长异议和顾虑的话术',
    icon: ChatDotRound,
    emoji: '⚠️',
    color: 'var(--danger-color)',
    count: scripts.value.filter(s => s.categoryKey === 'objection').length,
    path: null // 暂时没有对应页面
  }
])

// 话术数据
const scripts = ref([
  // 招生话术
  {
    id: 1,
    categoryKey: 'enrollment',
    title: '初次咨询开场白',
    content: '您好！欢迎咨询我们幼儿园。我是招生老师[姓名]，很高兴为您介绍我们的教育理念和特色。请问宝宝多大了呢？',
    usageCount: 89,
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 2,
    categoryKey: 'enrollment',
    title: '突出园所优势',
    content: '我们幼儿园最大的特色是采用蒙台梭利教学法，注重培养孩子的独立性和创造力。我们有15年的办学经验，获得过市级示范幼儿园称号。',
    usageCount: 76,
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 3,
    categoryKey: 'enrollment',
    title: '师资力量介绍',
    content: '我们的老师都是学前教育专业毕业，持有教师资格证。每个班配备2名主班老师和1名生活老师，师生比例1:6，确保每个孩子都能得到充分关注。',
    usageCount: 82,
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 4,
    categoryKey: 'enrollment',
    title: '安全保障说明',
    content: '孩子的安全是我们最重视的。园区有24小时监控系统，门禁卡管理，专业保安值守。食堂有食品安全许可证，每餐都有留样检测。',
    usageCount: 95,
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 5,
    categoryKey: 'enrollment',
    title: '课程体系介绍',
    content: '我们的课程涵盖五大领域：健康、语言、社会、科学、艺术。还有特色课程包括英语启蒙、思维训练、艺术创作等，全面促进孩子发展。',
    usageCount: 67,
    updatedAt: new Date('2024-01-17')
  },
  // 电话话术
  {
    id: 6,
    categoryKey: 'phone',
    title: '电话开场白',
    content: '您好，打扰您了！我是[幼儿园名称]的招生老师[姓名]。听说您家有小朋友要上幼儿园，我想向您介绍一下我们的幼儿园。现在方便聊几分钟吗？',
    usageCount: 154,
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 7,
    categoryKey: 'phone',
    title: '邀约参观话术',
    content: '光听我说可能不够直观，我建议您带孩子来我们园里看看，孩子的感受最重要。这周六上午您有时间吗？我可以亲自接待您。',
    usageCount: 128,
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 8,
    categoryKey: 'phone',
    title: '处理忙碌回复',
    content: '我理解您现在很忙，我就简单说两句。我们幼儿园这个月有开放日活动，您可以带孩子来体验，我把时间和地址发给您好吗？',
    usageCount: 87,
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 9,
    categoryKey: 'phone',
    title: '强调优势话术',
    content: '我们园最大的优势是小班化教学，每班只有25个孩子，配3个老师，确保每个孩子都能得到充分关注。这样的师生比例在我们区域是很少见的。',
    usageCount: 112,
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 10,
    categoryKey: 'phone',
    title: '价格敏感处理',
    content: '关于费用，我们的收费是很合理的，而且我们的投入主要在师资和教学设备上。好的教育是对孩子最好的投资，您说对吗？',
    usageCount: 93,
    updatedAt: new Date('2024-01-18')
  },
  // 接待话术
  {
    id: 11,
    categoryKey: 'reception',
    title: '热情接待开场',
    content: '欢迎来到我们幼儿园！我是招生老师[姓名]，很高兴见到您和小朋友。请先坐下喝杯水，我来为您详细介绍我们的幼儿园。',
    usageCount: 78,
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 12,
    categoryKey: 'reception',
    title: '引导参观路线',
    content: '我们先从教学楼开始参观，然后看看活动区域，最后到户外场地。这样您可以全面了解孩子在这里的学习和生活环境。',
    usageCount: 65,
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 13,
    categoryKey: 'reception',
    title: '教室环境介绍',
    content: '这是我们的教室，面积80平米，采光很好，通风良好。您看，这里有阅读角、建构区、美工区，孩子们可以根据兴趣选择活动。',
    usageCount: 71,
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 14,
    categoryKey: 'reception',
    title: '安全设施展示',
    content: '您看，我们的每个角落都做了安全防护，桌角都是圆弧设计，插座有保护盖，走廊有防滑条。孩子的安全是我们的首要考虑。',
    usageCount: 84,
    updatedAt: new Date('2024-01-20')
  },
  // 跟进话术
  {
    id: 15,
    categoryKey: 'followup',
    title: '首次跟进开场',
    content: '您好！我是[幼儿园名称]的招生老师，您前几天来我们园参观过。我想了解一下，您对我们幼儿园还有什么想进一步了解的吗？',
    usageCount: 96,
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 16,
    categoryKey: 'followup',
    title: '了解决策进展',
    content: '请问您和家人商量得怎么样了？对于入园的事情，您还有什么需要考虑的吗？我可以帮您分析一下。',
    usageCount: 73,
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 17,
    categoryKey: 'followup',
    title: '处理犹豫心理',
    content: '我理解您的犹豫，选择幼儿园确实是件大事。您主要担心哪个方面呢？是环境、师资还是其他方面？我们可以针对性地聊聊。',
    usageCount: 89,
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 18,
    categoryKey: 'followup',
    title: '时间紧迫提醒',
    content: '我需要提醒您，我们的入园名额确实比较紧张，现在已经有好几位家长交了定金。如果您有意向，建议尽快决定。',
    usageCount: 105,
    updatedAt: new Date('2024-01-22')
  },
  // 咨询话术
  {
    id: 19,
    categoryKey: 'consultation',
    title: '咨询接待礼仪',
    content: '您好，欢迎咨询我们幼儿园！请您坐下，我来为您倒杯茶。我是咨询老师[姓名]，有什么问题我都会详细为您解答。',
    usageCount: 58,
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 20,
    categoryKey: 'consultation',
    title: '了解咨询目的',
    content: '请问您今天主要想了解我们幼儿园的哪些方面？是教学理念、师资力量、还是收费标准？我可以针对性地为您介绍。',
    usageCount: 64,
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 21,
    categoryKey: 'consultation',
    title: '年龄段课程说明',
    content: '根据您孩子的年龄，我来介绍一下相应的课程。小班主要培养生活自理能力和社交能力，中班注重思维发展，大班会有升学准备课程。',
    usageCount: 72,
    updatedAt: new Date('2024-01-19')
  },
  // 异议处理话术
  {
    id: 22,
    categoryKey: 'objection',
    title: '学费太贵的处理',
    content: '我理解您对价格的关心，但请您想想，好的教育是对孩子最好的投资。我们的收费包含了专业师资、优质环境、营养配餐等，平均每天只要120元，您觉得值不值？',
    usageCount: 134,
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 23,
    categoryKey: 'objection',
    title: '师资水平质疑',
    content: '您的担心我很理解，师资确实是选择幼儿园的重要因素。我们的老师都是正规师范院校毕业，有教师资格证，平均教龄5年以上。要不您见见我们的班主任？',
    usageCount: 86,
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 24,
    categoryKey: 'objection',
    title: '环境安全担忧',
    content: '孩子的安全确实是第一位的，这个我完全理解。我们园区有24小时监控、门禁系统、专业保安，所有设施都经过安全检测。您可以实地看看我们的安全措施。',
    usageCount: 118,
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 25,
    categoryKey: 'objection',
    title: '孩子适应性担忧',
    content: '每个家长都会担心孩子的适应问题，这很正常。我们有专门的新生适应方案，老师会特别关注新孩子，还可以先试园体验。您觉得这样安排怎么样？',
    usageCount: 102,
    updatedAt: new Date('2024-01-21')
  }
])

// 话术统计数据
const scriptStats = reactive({
  totalScripts: 308,
  totalUsages: 5680,
  popularCount: 48,
  averageRating: 4.6
})

// 热门话术
const popularScripts = ref([
  {
    id: 6,
    title: '电话开场白',
    category: '电话话术',
    usageCount: 154,
    rating: 4.8
  },
  {
    id: 22,
    title: '学费太贵的处理',
    category: '异议处理话术',
    usageCount: 134,
    rating: 4.9
  },
  {
    id: 7,
    title: '邀约参观话术',
    category: '电话话术',
    usageCount: 128,
    rating: 4.7
  },
  {
    id: 24,
    title: '环境安全担忧',
    category: '异议处理话术',
    usageCount: 118,
    rating: 4.8
  },
  {
    id: 9,
    title: '强调优势话术',
    category: '电话话术',
    usageCount: 112,
    rating: 4.6
  },
  {
    id: 18,
    title: '时间紧迫提醒',
    category: '跟进话术',
    usageCount: 105,
    rating: 4.5
  },
  {
    id: 25,
    title: '孩子适应性担忧',
    category: '异议处理话术',
    usageCount: 102,
    rating: 4.7
  },
  {
    id: 15,
    title: '首次跟进开场',
    category: '跟进话术',
    usageCount: 96,
    rating: 4.4
  }
])

// 最近使用记录
const recentUsages = ref([
  {
    id: 1,
    scriptTitle: '电话开场白',
    userName: '张招生老师',
    usageContext: '首次电话咨询',
    effectiveRating: 5,
    usageDate: new Date('2024-01-22')
  },
  {
    id: 2,
    scriptTitle: '学费太贵的处理',
    userName: '李咨询老师',
    usageContext: '家长价格异议',
    effectiveRating: 5,
    usageDate: new Date('2024-01-22')
  },
  {
    id: 3,
    scriptTitle: '邀约参观话术',
    userName: '王招生老师',
    usageContext: '电话邀约',
    effectiveRating: 4,
    usageDate: new Date('2024-01-21')
  },
  {
    id: 4,
    scriptTitle: '环境安全担忧',
    userName: '陈接待老师',
    usageContext: '现场接待',
    effectiveRating: 5,
    usageDate: new Date('2024-01-21')
  },
  {
    id: 5,
    scriptTitle: '孩子适应性担忧',
    userName: '刘跟进老师',
    usageContext: '家长跟进',
    effectiveRating: 4,
    usageDate: new Date('2024-01-21')
  },
  {
    id: 6,
    scriptTitle: '强调优势话术',
    userName: '吴招生老师',
    usageContext: '电话咨询',
    effectiveRating: 5,
    usageDate: new Date('2024-01-20')
  },
  {
    id: 7,
    scriptTitle: '时间紧迫提醒',
    userName: '周跟进老师',
    usageContext: '客户跟进',
    effectiveRating: 4,
    usageDate: new Date('2024-01-20')
  },
  {
    id: 8,
    scriptTitle: '热情接待开场',
    userName: '马接待老师',
    usageContext: '现场接待',
    effectiveRating: 5,
    usageDate: new Date('2024-01-19')
  }
])

// 话术设置
const scriptSettings = reactive({
  // 权限设置
  createPermission: ['admin', 'teacher', 'enrollment'],
  editPermission: ['creator', 'admin'],
  deletePermission: ['creator', 'admin'],

  // 使用设置
  trackUsage: true,
  enableRating: true,
  enableFeedback: true,
  enableRecommendation: true
})

// 计算属性
const allFilteredScripts = computed(() => {
  if (!selectedCategory.value) return []
  return scripts.value.filter(script => script.categoryKey === selectedCategory.value.key)
})

const filteredScripts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allFilteredScripts.value.slice(start, end)
})

const totalScripts = computed(() => {
  return allFilteredScripts.value.length
})

const totalPages = computed(() => {
  return Math.ceil(totalScripts.value / pageSize.value)
})

// 方法
const handleTabChange = (tab: string) => {
  console.log('切换到标签页:', tab)
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

const handleCreateScript = async () => {
  try {
    // TODO: 实现话术创建功能
    ElMessage.info('话术创建功能开发中，敬请期待...')
  } catch (error) {
    ElMessage.error('创建话术失败')
  }
}

const selectCategory = (category: any) => {
  selectedCategory.value = category
  currentPage.value = 1 // 重置到第一页
  // TODO: 加载该分类下的话术
}

const editScript = (script: any) => {
  // 填充表单数据
  editForm.id = script.id
  editForm.title = script.title
  editForm.categoryKey = script.categoryKey
  editForm.content = script.content

  // 打开对话框
  editDialogVisible.value = true

  // 重置表单验证状态
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

const handleCancelEdit = () => {
  editDialogVisible.value = false
  // 重置表单
  editForm.id = null
  editForm.title = ''
  editForm.categoryKey = ''
  editForm.content = ''
}

const handleSaveEdit = async () => {
  // 验证表单
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    saving.value = true

    // 查找并更新话术
    const scriptIndex = scripts.value.findIndex(s => s.id === editForm.id)
    if (scriptIndex !== -1) {
      scripts.value[scriptIndex] = {
        ...scripts.value[scriptIndex],
        title: editForm.title,
        categoryKey: editForm.categoryKey,
        content: editForm.content,
        updatedAt: new Date()
      }

      ElMessage.success('话术编辑成功')
      editDialogVisible.value = false

      // 重置表单
      editForm.id = null
      editForm.title = ''
      editForm.categoryKey = ''
      editForm.content = ''
    } else {
      ElMessage.error('未找到要编辑的话术')
    }
  } catch (error) {
    console.error('编辑话术失败:', error)
    ElMessage.error('编辑话术失败，请重试')
  } finally {
    saving.value = false
  }
}

const copyScript = (script: any) => {
  navigator.clipboard.writeText(script.content)
  ElMessage.success('话术已复制到剪贴板')
}

// 分页相关方法
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const handleBackToCategories = () => {
  selectedCategory.value = null
  currentPage.value = 1
}

// 统计相关方法
const handleStatClick = (type: string) => {
  switch (type) {
    case 'total':
      ElMessage.info('查看所有话术')
      break
    case 'usage':
      ElMessage.info('查看使用统计')
      break
    case 'popular':
      ElMessage.info('查看热门话术')
      break
    case 'rating':
      ElMessage.info('查看评分详情')
      break
  }
}

const viewScript = (script: any) => {
  ElMessage.info(`查看话术：${script.title}`)
}

const useScript = async (script: any) => {
  try {
    // TODO: 调用API记录使用
    ElMessage.success(`使用话术：${script.title}`)
  } catch (error) {
    ElMessage.error('记录使用失败')
  }
}

// 设置相关方法
const handleSaveSettings = async () => {
  settingsLoading.value = true
  try {
    // TODO: 调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('设置保存成功')
  } finally {
    settingsLoading.value = false
  }
}

const editCategory = (category: any) => {
  ElMessage.info(`编辑分类：${category.title}`)
}

const deleteCategory = async (category: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${category.title}"吗？`, '确认删除', {
      type: 'warning'
    })
    ElMessage.success('分类删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleImportScripts = () => {
  ElMessage.info('导入话术功能开发中...')
}

const handleExportScripts = () => {
  ElMessage.info('导出话术功能开发中...')
}

const handleBackupData = () => {
  ElMessage.info('备份数据功能开发中...')
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initUsageTrendChart()
    initScriptTypeChart()
  })
}

const initUsageTrendChart = () => {
  if (!usageTrendChart.value) return

  const chart = echarts.init(usageTrendChart.value)
  const option = {
    title: {
      text: '使用趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 132, 101, 134, 90, 230],
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const initScriptTypeChart = () => {
  if (!scriptTypeChart.value) return

  const chart = echarts.init(scriptTypeChart.value)
  const option = {
    title: {
      text: '话术类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '招生话术' },
        { value: 735, name: '电话话术' },
        { value: 580, name: '接待话术' },
        { value: 484, name: '跟进话术' },
        { value: 300, name: '其他话术' }
      ]
    }]
  }
  chart.setOption(option)
}

const formatTime = (date: Date) => {
  return date.toLocaleDateString()
}

onMounted(() => {
  console.log('话术中心页面已加载')
  // 当切换到统计标签页时初始化图表
  if (activeTab.value === 'statistics') {
    initCharts()
  }
})
</script>

<style scoped lang="scss">
/* 话术中心根容器 - 完全参考活动中心的标准样式 */
.script-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--text-3xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  overflow-y: auto;
}

/* ScriptCenter uses global unified styles with necessary custom enhancements */

/* 话术列表容器 */
.script-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border: var(--border-width-base) solid var(--border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .script-count {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        font-weight: var(--font-medium);
      }
    }
  }

  .script-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    @media (max-width: var(--breakpoint-md)) {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .script-card {
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(var(--transform-hover-lift));
      box-shadow: var(--shadow-md);
      border-color: var(--border-focus);
    }

    .script-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);

      h4 {
        margin: 0;
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        flex: 1;
        margin-right: var(--spacing-md);
      }

      .script-actions {
        display: flex;
        gap: var(--spacing-xs);
        flex-shrink: 0;
      }
    }

    .script-content {
      margin-bottom: var(--spacing-md);

      p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
        font-size: var(--text-sm);
        background: var(--bg-light);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        border-left: var(--spacing-xs) solid var(--primary-color);
      }
    }

    .script-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-xs);
      color: var(--text-muted);

      .usage-count {
        font-weight: var(--font-medium);
        color: var(--success-color);
      }

      .update-time {
        color: var(--text-muted);
      }
    }
  }

  .pagination-container {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: center;
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border: var(--border-width-base) solid var(--border-color);

    :deep(.el-pagination) {
      --el-pagination-bg-color: transparent;
    }
  }
}

/* 移动端适配 */
@media (max-width: var(--breakpoint-md)) {
  .script-list {
    .script-card {
      .script-header {
        flex-direction: column;
        align-items: stretch;

        h4 {
          margin-right: 0;
          margin-bottom: var(--spacing-sm);
        }

        .script-actions {
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
