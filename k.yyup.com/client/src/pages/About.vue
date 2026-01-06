<template>
  <div class="about-container">
    <!-- 页面头部 -->
    <div class="about-header">
      <div class="header-content">
        <div class="page-title">
          <h1>关于我们</h1>
          <p>专业的幼儿园招生管理系统，为您提供全方位的教育服务</p>
        </div>
        <div class="header-image">
          <UnifiedIcon name="default" />
        </div>
      </div>
    </div>

    <!-- 公司介绍 -->
    <div class="company-intro">
      <el-card shadow="hover">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h2>公司简介</h2>
          </div>
        </template>
        
        <div class="intro-content">
          <p class="intro-text">
            我们是一家专注于幼儿教育信息化的科技公司，致力于为幼儿园提供专业、高效、智能的招生管理解决方案。
            通过先进的技术手段和丰富的行业经验，我们帮助幼儿园实现招生流程的数字化转型，提升管理效率，
            为孩子们创造更好的教育环境。
          </p>
          
          <div class="company-stats">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">服务幼儿园</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">10万+</div>
              <div class="stat-label">管理学生</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5年+</div>
              <div class="stat-label">行业经验</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">98%</div>
              <div class="stat-label">客户满意度</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 核心价值 -->
    <div class="core-values">
      <h2 class="section-title">
        <UnifiedIcon name="default" />
        核心价值
      </h2>
      
      <el-row :gutter="24">
        <el-col :span="8" v-for="value in coreValues" :key="value.id">
          <el-card class="value-card" shadow="hover">
            <div class="value-content">
              <div class="value-icon" :class="value.iconClass">
                <UnifiedIcon name="default" />
              </div>
              <h3>{{ value.title }}</h3>
              <p>{{ value.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 产品特色 -->
    <div class="product-features">
      <h2 class="section-title">
        <UnifiedIcon name="default" />
        产品特色
      </h2>
      
      <div class="features-grid">
        <div class="feature-item" v-for="feature in productFeatures" :key="feature.id">
          <div class="feature-icon" :class="feature.iconClass">
            <UnifiedIcon name="default" />
          </div>
          <div class="feature-content">
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
            <ul class="feature-points">
              <li v-for="point in feature.points" :key="point">{{ point }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 团队介绍 -->
    <div class="team-section">
      <h2 class="section-title">
        <UnifiedIcon name="default" />
        团队介绍
      </h2>
      
      <el-row :gutter="24">
        <el-col :span="8" v-for="member in teamMembers" :key="member.id">
          <el-card class="team-card" shadow="hover">
            <div class="team-member">
              <div class="member-avatar">
                <el-avatar :size="80" :src="member.avatar">
                  <UnifiedIcon name="default" />
                </el-avatar>
              </div>
              <div class="member-info">
                <h4>{{ member.name }}</h4>
                <p class="member-position">{{ member.position }}</p>
                <p class="member-description">{{ member.description }}</p>
                <div class="member-skills">
                  <el-tag v-for="skill in member.skills" :key="skill" size="small" type="info">
                    {{ skill }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 发展历程 -->
    <div class="timeline-section">
      <h2 class="section-title">
        <UnifiedIcon name="default" />
        发展历程
      </h2>
      
      <el-timeline>
        <el-timeline-item
          v-for="milestone in milestones"
          :key="milestone.id"
          :timestamp="milestone.date"
          :type="milestone.type"
          size="large"
        >
          <div class="milestone-content">
            <h4>{{ milestone.title }}</h4>
            <p>{{ milestone.description }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 联系我们 -->
    <div class="contact-section">
      <h2 class="section-title">
        <UnifiedIcon name="default" />
        联系我们
      </h2>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card shadow="hover">
            <div class="contact-info">
              <div class="contact-item">
                <UnifiedIcon name="default" />
                <span>地址：北京市朝阳区科技园区创新大厦A座15层</span>
              </div>
              <div class="contact-item">
                <UnifiedIcon name="default" />
                <span>电话：400-123-4567</span>
              </div>
              <div class="contact-item">
                <UnifiedIcon name="default" />
                <span>邮箱：contact@kindergarten-system.com</span>
              </div>
              <div class="contact-item">
                <UnifiedIcon name="default" />
                <span>网站：www.kindergarten-system.com</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <h3>快速联系</h3>
            </template>
            
            <el-form :model="contactForm" label-width="80px">
              <el-form-item label="姓名">
                <el-input v-model="contactForm.name" placeholder="请输入您的姓名" />
              </el-form-item>
              
              <el-form-item label="电话">
                <el-input v-model="contactForm.phone" placeholder="请输入您的联系电话" />
              </el-form-item>
              
              <el-form-item label="邮箱">
                <el-input v-model="contactForm.email" placeholder="请输入您的邮箱" />
              </el-form-item>
              
              <el-form-item label="留言">
                <el-input
                  v-model="contactForm.message"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您的留言内容"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitContact" :loading="submitting">
                  提交留言
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  School, OfficeBuilding, Star, Trophy, UserFilled, Clock, Message,
  Location, Phone, Link, User, TrendCharts, Shield, Cpu, Setting
} from '@element-plus/icons-vue'

// 响应式数据
const submitting = ref(false)

// 联系表单
const contactForm = reactive({
  name: '',
  phone: '',
  email: '',
  message: ''
})

// 核心价值
const coreValues = ref([
  {
    id: 1,
    title: '专业专注',
    description: '专注幼儿教育信息化领域，深度理解行业需求，提供专业的解决方案',
    icon: 'star',
    iconClass: 'professional'
  },
  {
    id: 2,
    title: '创新驱动',
    description: '持续技术创新，运用AI、大数据等前沿技术，提升产品竞争力',
    icon: 'Cpu',
    iconClass: 'innovation'
  },
  {
    id: 3,
    title: '服务至上',
    description: '以客户为中心，提供7×24小时技术支持，确保系统稳定运行',
    icon: 'security',
    iconClass: 'service'
  }
])

// 产品特色
const productFeatures = ref([
  {
    id: 1,
    title: '智能招生管理',
    description: '全流程数字化招生管理，提升招生效率',
    icon: 'TrendCharts',
    iconClass: 'smart',
    points: ['AI智能分析', '自动化流程', '数据可视化', '移动端支持']
  },
  {
    id: 2,
    title: '安全可靠',
    description: '企业级安全保障，数据加密存储',
    icon: 'security',
    iconClass: 'secure',
    points: ['数据加密', '权限控制', '备份恢复', '安全审计']
  },
  {
    id: 3,
    title: '易用高效',
    description: '简洁直观的操作界面，快速上手',
    icon: 'Setting',
    iconClass: 'efficient',
    points: ['界面友好', '操作简单', '响应快速', '功能完善']
  }
])

// 团队成员
const teamMembers = ref([
  {
    id: 1,
    name: '张总',
    position: '创始人 & CEO',
    description: '10年教育行业经验，致力于推动教育信息化发展',
    avatar: '',
    skills: ['战略规划', '团队管理', '教育行业']
  },
  {
    id: 2,
    name: '李总',
    position: '技术总监',
    description: '资深技术专家，专注于系统架构和技术创新',
    avatar: '',
    skills: ['系统架构', '技术管理', '人工智能']
  },
  {
    id: 3,
    name: '王总',
    position: '产品总监',
    description: '丰富的产品设计经验，深度理解用户需求',
    avatar: '',
    skills: ['产品设计', '用户体验', '需求分析']
  }
])

// 发展历程
const milestones = ref([
  {
    id: 1,
    date: '2024年',
    title: '产品升级',
    description: '推出AI智能分析功能，系统性能大幅提升',
    type: 'primary'
  },
  {
    id: 2,
    date: '2023年',
    title: '市场拓展',
    description: '服务幼儿园突破500家，用户满意度达98%',
    type: 'success'
  },
  {
    id: 3,
    date: '2022年',
    title: '技术突破',
    description: '完成系统重构，采用微服务架构，支持大规模并发',
    type: 'warning'
  },
  {
    id: 4,
    date: '2021年',
    title: '产品发布',
    description: '正式发布幼儿园招生管理系统1.0版本',
    type: 'info'
  },
  {
    id: 5,
    date: '2020年',
    title: '公司成立',
    description: '公司正式成立，开始专注幼儿教育信息化领域',
    type: 'danger'
  }
])

// 方法
const submitContact = async () => {
  if (!contactForm.name.trim()) {
    ElMessage.warning('请输入您的姓名')
    return
  }
  
  if (!contactForm.phone.trim()) {
    ElMessage.warning('请输入您的联系电话')
    return
  }
  
  if (!contactForm.message.trim()) {
    ElMessage.warning('请输入留言内容')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('留言提交成功，我们会尽快与您联系！')
    resetForm()
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(contactForm, {
    name: '',
    phone: '',
    email: '',
    message: ''
  })
}
</script>

<style lang="scss">
.about-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.about-header {
  margin-bottom: var(--spacing-10xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-10xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-lg);
    
    .page-title {
      h1 {
        font-size: var(--text-4xl);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 var(--text-lg) 0;
      }
      
      p {
        font-size: var(--text-xl);
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }
    
    .header-image {
      opacity: 0.8;
    }
  }
}

.company-intro {
  margin-bottom: var(--spacing-10xl);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    
    h2 {
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .intro-content {
    .intro-text {
      font-size: var(--text-lg);
      line-height: 1.8;
      color: var(--color-gray-700);
      margin-bottom: var(--spacing-3xl);
    }
    
    .company-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--text-3xl);
      
      .stat-item {
        text-align: center;
        padding: var(--text-3xl);
        background: var(--text-primary-light);
        border-radius: var(--text-sm);
        
        .stat-number {
          font-size: var(--spacing-3xl);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--spacing-sm);
        }
        
        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }
  }
}

.core-values, .product-features, .team-section, .timeline-section, .contact-section {
  margin-bottom: var(--spacing-10xl);
  
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--text-3xl);
  }
}

.value-card {
  height: 100%;
  
  .value-content {
    text-align: center;
    padding: var(--text-3xl);
    
    .value-icon {
      margin-bottom: var(--text-lg);
      
      &.professional {
        color: var(--warning-color);
      }
      
      &.innovation {
        color: var(--primary-color);
      }
      
      &.service {
        color: var(--success-color);
      }
    }
    
    h3 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--text-sm);
    }
    
    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--text-3xl);
  
  .feature-item {
    display: flex;
    gap: var(--text-2xl);
    padding: var(--text-3xl);
    background: var(--bg-color);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--text-sm);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      transform: translateY(var(--transform-hover-lift));
    }
    
    .feature-icon {
      flex-shrink: 0;
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.smart {
        background: #dbeafe;
        color: var(--primary-color);
      }
      
      &.secure {
        background: #d1fae5;
        color: var(--success-color);
      }
      
      &.efficient {
        background: #fef3c7;
        color: var(--warning-color);
      }
    }
    
    .feature-content {
      flex: 1;
      
      h4 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      p {
        color: var(--text-secondary);
        margin-bottom: var(--text-sm);
        line-height: 1.6;
      }
      
      .feature-points {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
        
        li {
          font-size: var(--text-base);
          color: var(--color-gray-700);
          position: relative;
          padding-left: var(--text-lg);
          
          &::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--success-color);
            font-weight: 600;
          }
        }
      }
    }
  }
}

.team-card {
  height: 100%;
  
  .team-member {
    text-align: center;
    
    .member-avatar {
      margin-bottom: var(--text-lg);
    }
    
    .member-info {
      h4 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }
      
      .member-position {
        color: var(--primary-color);
        font-weight: 500;
        margin-bottom: var(--text-sm);
      }
      
      .member-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--text-lg);
      }
      
      .member-skills {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        justify-content: center;
      }
    }
  }
}

.milestone-content {
  h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    margin-bottom: var(--text-lg);
    font-size: var(--text-lg);
    color: var(--color-gray-700);
    
    .el-icon {
      color: var(--primary-color);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .about-container {
    padding: var(--text-lg);
  }
  
  .about-header .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--text-3xl);
  }
  
  .company-stats {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .features-grid .feature-item {
    flex-direction: column;
    text-align: center;
  }
  
  .feature-points {
    grid-template-columns: 1fr !important;
  }
}
</style>
