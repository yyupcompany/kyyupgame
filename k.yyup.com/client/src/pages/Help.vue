<template>
  <div class="help-container">
    <!-- 页面头部 -->
    <div class="help-header">
      <div class="header-content">
        <div class="page-title">
          <h1>帮助中心</h1>
          <p>为您提供系统使用指南和常见问题解答</p>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帮助内容..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <UnifiedIcon name="Search" />
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 快速导航 -->
    <div class="quick-nav">
      <el-card shadow="never">
        <div class="nav-title">
          <h3>快速导航</h3>
        </div>
        <div class="nav-grid">
          <div
            v-for="item in quickNavItems"
            :key="item.id"
            class="nav-item"
            @click="scrollToSection(item.target)"
          >
            <div class="nav-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="nav-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 帮助内容 -->
    <div class="help-content">
      <!-- 新手指南 -->
      <div id="getting-started" class="help-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <h3>新手指南</h3>
            </div>
          </template>
          
          <div class="guide-steps">
            <el-steps :active="activeStep" direction="vertical">
              <el-step title="账户注册与登录" description="创建账户并首次登录系统">
                <template #icon>
                  <UnifiedIcon name="default" />
                </template>
              </el-step>
              <el-step title="基本信息设置" description="完善个人资料和系统偏好设置">
                <template #icon>
                  <UnifiedIcon name="default" />
                </template>
              </el-step>
              <el-step title="功能模块介绍" description="了解各个功能模块的作用和使用方法">
                <template #icon>
                  <UnifiedIcon name="default" />
                </template>
              </el-step>
              <el-step title="开始使用" description="根据角色权限开始使用相应功能">
                <template #icon>
                  <UnifiedIcon name="Check" />
                </template>
              </el-step>
            </el-steps>
          </div>
          
          <div class="guide-actions">
            <el-button type="primary" @click="startGuide">开始新手引导</el-button>
            <el-button @click="skipGuide">跳过引导</el-button>
          </div>
        </el-card>
      </div>

      <!-- 功能介绍 -->
      <div id="features" class="help-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <h3>功能介绍</h3>
            </div>
          </template>
          
          <el-collapse v-model="activeFeatures" accordion>
            <el-collapse-item
              v-for="feature in features"
              :key="feature.name"
              :title="feature.title"
              :name="feature.name"
            >
              <div class="feature-content">
                <p>{{ feature.description }}</p>
                <div class="feature-details">
                  <h5>主要功能：</h5>
                  <ul>
                    <li v-for="func in feature.functions" :key="func">{{ func }}</li>
                  </ul>
                </div>
                <div class="feature-actions">
                  <el-button size="small" type="primary" @click="goToFeature(feature.path)">
                    立即体验
                  </el-button>
                  <el-button size="small" @click="viewDemo(feature.name)">
                    查看演示
                  </el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>

      <!-- 常见问题 -->
      <div id="faq" class="help-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <h3>常见问题</h3>
            </div>
          </template>
          
          <el-collapse v-model="activeFAQ">
            <el-collapse-item
              v-for="faq in faqs"
              :key="faq.id"
              :title="faq.question"
              :name="faq.id"
            >
              <div class="faq-content">
                <div v-html="faq.answer"></div>
                <div class="faq-actions">
                  <el-button size="small" text @click="markHelpful(faq.id)">
                    <UnifiedIcon name="default" />
                    有帮助 ({{ faq.helpful || 0 }})
                  </el-button>
                  <el-button size="small" text @click="reportIssue(faq.id)">
                    <UnifiedIcon name="default" />
                    反馈问题
                  </el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>

      <!-- 联系支持 -->
      <div id="contact" class="help-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <UnifiedIcon name="default" />
              <h3>联系支持</h3>
            </div>
          </template>
          
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="contact-content">
                <h4>在线客服</h4>
                <p>工作时间：周一至周五 9:00-18:00</p>
                <el-button type="primary" size="small" @click="openChat">开始对话</el-button>
              </div>
            </div>
            
            <div class="contact-item">
              <div class="contact-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="contact-content">
                <h4>电话支持</h4>
                <p>400-123-4567</p>
                <el-button size="small" @click="callSupport">拨打电话</el-button>
              </div>
            </div>
            
            <div class="contact-item">
              <div class="contact-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="contact-content">
                <h4>提交工单</h4>
                <p>详细描述您遇到的问题</p>
                <el-button size="small" @click="createTicket">创建工单</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 反馈对话框 -->
    <el-dialog v-model="feedbackVisible" title="问题反馈" width="500px">
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="问题类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择问题类型">
            <el-option label="功能问题" value="function" />
            <el-option label="界面问题" value="ui" />
            <el-option label="性能问题" value="performance" />
            <el-option label="其他问题" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述">
          <el-input
            v-model="feedbackForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您遇到的问题"
          />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" placeholder="邮箱或电话（可选）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedbackVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search, User, Setting, Menu, Check, Grid, QuestionFilled,
  Star, Warning, Service, Message, Phone, ChatDotRound
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const activeStep = ref(0)
const activeFeatures = ref('')
const activeFAQ = ref('')
const feedbackVisible = ref(false)

// 快速导航项
const quickNavItems = [
  {
    id: 1,
    title: '新手指南',
    description: '快速上手系统使用',
    icon: 'User',
    target: 'getting-started'
  },
  {
    id: 2,
    title: '功能介绍',
    description: '了解各模块功能',
    icon: 'Grid',
    target: 'features'
  },
  {
    id: 3,
    title: '常见问题',
    description: '查看问题解答',
    icon: 'QuestionFilled',
    target: 'faq'
  },
  {
    id: 4,
    title: '联系支持',
    description: '获取技术支持',
    icon: 'Service',
    target: 'contact'
  }
]

// 功能介绍
const features = [
  {
    name: 'enrollment',
    title: '招生管理',
    description: '全面的招生流程管理，从计划制定到学生入学的完整解决方案',
    functions: [
      '招生计划制定与管理',
      '名额分配与控制',
      '申请审核与处理',
      '招生数据统计分析'
    ],
    path: '/enrollment-plan'
  },
  {
    name: 'student',
    title: '学生管理',
    description: '学生信息管理、成长记录、学习评估等功能',
    functions: [
      '学生档案管理',
      '成长记录跟踪',
      '学习评估分析',
      '家校沟通平台'
    ],
    path: '/student'
  },
  {
    name: 'teacher',
    title: '教师管理',
    description: '教师信息管理、绩效评估、专业发展等功能',
    functions: [
      '教师档案管理',
      '绩效考核评估',
      '专业发展规划',
      '工作量统计分析'
    ],
    path: '/teacher'
  },
  {
    name: 'class',
    title: '班级管理',
    description: '班级组织管理、课程安排、活动组织等功能',
    functions: [
      '班级信息管理',
      '课程安排规划',
      '活动组织管理',
      '班级数据分析'
    ],
    path: '/class'
  }
]

// 常见问题
const faqs = [
  {
    id: 'faq1',
    question: '如何重置密码？',
    answer: '<p>您可以通过以下步骤重置密码：</p><ol><li>在登录页面点击"忘记密码"</li><li>输入您的邮箱地址</li><li>查收邮件并点击重置链接</li><li>设置新密码</li></ol>',
    helpful: 15
  },
  {
    id: 'faq2',
    question: '如何添加新学生？',
    answer: '<p>添加新学生的步骤：</p><ol><li>进入"学生管理"模块</li><li>点击"添加学生"按钮</li><li>填写学生基本信息</li><li>上传相关证件照片</li><li>保存并提交审核</li></ol>',
    helpful: 23
  },
  {
    id: 'faq3',
    question: '系统支持哪些浏览器？',
    answer: '<p>系统支持以下浏览器：</p><ul><li>Chrome 80+</li><li>Firefox 75+</li><li>Safari 13+</li><li>Edge 80+</li></ul><p>建议使用最新版本的浏览器以获得最佳体验。</p>',
    helpful: 8
  },
  {
    id: 'faq4',
    question: '如何导出数据？',
    answer: '<p>数据导出功能：</p><ol><li>在相应的数据列表页面</li><li>点击"导出"按钮</li><li>选择导出格式（Excel/PDF）</li><li>选择导出字段</li><li>确认导出</li></ol>',
    helpful: 12
  }
]

// 反馈表单
const feedbackForm = reactive({
  type: '',
  description: '',
  contact: ''
})

// 方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  // 这里可以实现搜索功能
  ElMessage.info(`搜索功能开发中：${searchKeyword.value}`)
}

const scrollToSection = (target: string) => {
  const element = document.getElementById(target)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const startGuide = () => {
  ElMessage.success('新手引导功能开发中')
}

const skipGuide = () => {
  ElMessage.info('已跳过新手引导')
}

const goToFeature = (path: string) => {
  router.push(path)
}

const viewDemo = (featureName: string) => {
  ElMessage.info(`${featureName} 演示功能开发中`)
}

const markHelpful = (faqId: string) => {
  const faq = faqs.find(f => f.id === faqId)
  if (faq) {
    faq.helpful = (faq.helpful || 0) + 1
    ElMessage.success('感谢您的反馈！')
  }
}

const reportIssue = (faqId: string) => {
  feedbackVisible.value = true
  feedbackForm.description = `关于FAQ "${faqId}" 的问题反馈：`
}

const openChat = () => {
  ElMessage.info('在线客服功能开发中')
}

const callSupport = () => {
  ElMessage.info('正在为您转接电话支持...')
}

const createTicket = () => {
  feedbackVisible.value = true
  feedbackForm.type = 'other'
}

const submitFeedback = () => {
  if (!feedbackForm.description.trim()) {
    ElMessage.warning('请描述您遇到的问题')
    return
  }
  
  // 这里可以提交反馈到后端
  ElMessage.success('反馈提交成功，我们会尽快处理')
  feedbackVisible.value = false
  
  // 重置表单
  Object.assign(feedbackForm, {
    type: '',
    description: '',
    contact: ''
  })
}

// 生命周期
onMounted(() => {
  // 检查URL参数，如果有特定的section参数，自动滚动到对应位置
  const urlParams = new URLSearchParams(window.location.search)
  const section = urlParams.get('section')
  if (section) {
    setTimeout(() => {
      scrollToSection(section)
    }, 500)
  }
})
</script>

<style scoped lang="scss">
.help-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.help-header {
  margin-bottom: var(--spacing-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-3xl);
    
    .page-title {
      flex: 1;
      
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        font-size: var(--text-lg);
        margin: 0;
      }
    }
    
    .search-box {
      flex: 0 0 400px;
    }
  }
}

.quick-nav {
  margin-bottom: var(--spacing-3xl);
  
  .nav-title {
    margin-bottom: var(--text-2xl);
    
    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-lg);
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--text-lg);
    padding: var(--text-lg);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--primary-color);
      background: var(--text-primary-light);
      transform: translateY(var(--transform-hover-lift));
    }
    
    .nav-icon {
      flex-shrink: 0;
      width: var(--icon-size); height: var(--icon-size);
      background: #dbeafe;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }
    
    .nav-content {
      flex: 1;
      
      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
      }
      
      p {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.help-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
}

.guide-steps {
  margin-bottom: var(--text-3xl);
}

.guide-actions {
  display: flex;
  gap: var(--text-sm);
  justify-content: center;
}

.feature-content {
  .feature-details {
    margin: var(--text-lg) 0;
    
    h5 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--color-gray-700);
      margin: 0 0 var(--spacing-sm) 0;
    }
    
    ul {
      margin: 0;
      padding-left: var(--text-2xl);
      
      li {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
    }
  }
  
  .feature-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--text-lg);
  }
}

.faq-content {
  .faq-actions {
    display: flex;
    gap: var(--text-lg);
    margin-top: var(--text-lg);
    padding-top: var(--text-lg);
    border-top: var(--z-index-dropdown) solid #f3f4f6;
  }
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-3xl);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  
  .contact-icon {
    flex-shrink: 0;
    width: var(--icon-size); height: var(--icon-size);
    background: #f0f9ff;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0ea5e9;
  }
  
  .contact-content {
    flex: 1;
    
    h4 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }
    
    p {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin: 0 0 var(--text-sm) 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

@media (max-width: var(--breakpoint-md)) {
  .help-container {
    padding: var(--text-lg);
  }
  
  .help-header .header-content {
    flex-direction: column;
    gap: var(--text-2xl);
    
    .search-box {
      flex: 1;
      width: 100%;
    }
  }
  
  .nav-grid {
    grid-template-columns: 1fr !important;
  }
  
  .contact-grid {
    grid-template-columns: 1fr !important;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
