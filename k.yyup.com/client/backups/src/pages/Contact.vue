<template>
  <div class="contact-container">
    <!-- 页面头部 -->
    <div class="contact-header">
      <div class="header-content">
        <div class="page-title">
          <h1>联系我们</h1>
          <p>我们随时为您提供专业的服务和支持</p>
        </div>
        <div class="header-image">
          <el-icon :size="120" color="var(--primary-color)"><Service /></el-icon>
        </div>
      </div>
    </div>

    <!-- 联系方式 -->
    <div class="contact-methods">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-card class="contact-card" shadow="hover">
            <div class="contact-item">
              <div class="contact-icon phone">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="contact-content">
                <h3>电话咨询</h3>
                <p class="contact-value">400-123-4567</p>
                <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
                <el-button type="primary" @click="handleCall">立即拨打</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="contact-card" shadow="hover">
            <div class="contact-item">
              <div class="contact-icon email">
                <el-icon><Message /></el-icon>
              </div>
              <div class="contact-content">
                <h3>邮箱联系</h3>
                <p class="contact-value">contact@kindergarten.com</p>
                <p class="contact-desc">我们会在24小时内回复您的邮件</p>
                <el-button type="primary" @click="handleEmail">发送邮件</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="contact-card" shadow="hover">
            <div class="contact-item">
              <div class="contact-icon chat">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="contact-content">
                <h3>在线客服</h3>
                <p class="contact-value">即时响应</p>
                <p class="contact-desc">专业客服团队为您服务</p>
                <el-button type="primary" @click="handleChat">开始对话</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 联系表单 -->
    <div class="contact-form-section">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><EditPen /></el-icon>
            <span>留言咨询</span>
          </div>
        </template>
        
        <div class="form-container">
          <div class="form-description">
            <h3>有任何问题？请告诉我们</h3>
            <p>填写下面的表单，我们的专业团队会尽快与您联系。</p>
          </div>
          
          <el-form
            ref="contactFormRef"
            :model="contactForm"
            :rules="contactRules"
            label-width="100px"
            class="contact-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input
                    v-model="contactForm.name"
                    placeholder="请输入您的姓名"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input
                    v-model="contactForm.phone"
                    placeholder="请输入您的手机号码"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="contactForm.email"
                    placeholder="请输入您的邮箱地址"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="咨询类型" prop="type">
                  <el-select
                    v-model="contactForm.type"
                    placeholder="请选择咨询类型"
                    style="width: 100%"
                  >
                    <el-option label="招生咨询" value="enrollment" />
                    <el-option label="课程咨询" value="course" />
                    <el-option label="费用咨询" value="fee" />
                    <el-option label="技术支持" value="support" />
                    <el-option label="投诉建议" value="complaint" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="主题" prop="subject">
              <el-input
                v-model="contactForm.subject"
                placeholder="请输入咨询主题"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="详细内容" prop="message">
              <el-input
                v-model="contactForm.message"
                type="textarea"
                :rows="6"
                placeholder="请详细描述您的问题或需求，我们会根据您的描述提供更准确的帮助"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                @click="handleSubmit"
                :loading="submitting"
              >
                提交咨询
              </el-button>
              <el-button size="large" @click="handleReset">
                重置表单
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 地址信息 -->
    <div class="address-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon><Location /></el-icon>
                <span>园区地址</span>
              </div>
            </template>
            
            <div class="address-list">
              <div class="address-item">
                <h4>总园区</h4>
                <p><el-icon><Location /></el-icon> 北京市朝阳区幸福街123号</p>
                <p><el-icon><Phone /></el-icon> 010-12345678</p>
                <p><el-icon><Clock /></el-icon> 周一至周五 7:30-18:00</p>
              </div>
              
              <div class="address-item">
                <h4>分园区A</h4>
                <p><el-icon><Location /></el-icon> 北京市海淀区快乐路456号</p>
                <p><el-icon><Phone /></el-icon> 010-87654321</p>
                <p><el-icon><Clock /></el-icon> 周一至周五 7:30-18:00</p>
              </div>
              
              <div class="address-item">
                <h4>分园区B</h4>
                <p><el-icon><Location /></el-icon> 北京市西城区童趣巷789号</p>
                <p><el-icon><Phone /></el-icon> 010-11223344</p>
                <p><el-icon><Clock /></el-icon> 周一至周五 7:30-18:00</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon><MapLocation /></el-icon>
                <span>交通指南</span>
              </div>
            </template>
            
            <div class="traffic-info">
              <div class="traffic-item">
                <h4><el-icon><CaretRight /></el-icon> 公交路线</h4>
                <p>乘坐1路、15路、32路公交车至幸福街站下车，步行3分钟即到</p>
              </div>
              
              <div class="traffic-item">
                <h4><el-icon><CaretRight /></el-icon> 地铁路线</h4>
                <p>地铁2号线至幸福站A出口，步行8分钟即到</p>
              </div>
              
              <div class="traffic-item">
                <h4><el-icon><CaretRight /></el-icon> 自驾路线</h4>
                <p>导航至"幸福街123号"，园区提供免费停车位</p>
              </div>
              
              <div class="traffic-item">
                <h4><el-icon><CaretRight /></el-icon> 周边标志</h4>
                <p>幸福商场对面，蓝色建筑，门口有明显的幼儿园标识</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 常见问题 -->
    <div class="faq-section">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><QuestionFilled /></el-icon>
            <span>常见问题</span>
          </div>
        </template>
        
        <el-collapse v-model="activeFaq">
          <el-collapse-item
            v-for="faq in faqs"
            :key="faq.id"
            :title="faq.question"
            :name="faq.id"
          >
            <div class="faq-answer">
              {{ faq.answer }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import {
  Service, Phone, Message, ChatDotRound, EditPen, Location,
  MapLocation, QuestionFilled, Clock, CaretRight
} from '@element-plus/icons-vue'
import { post } from '@/utils/request'

// 响应式数据
const submitting = ref(false)
const activeFaq = ref(['1'])
const contactFormRef = ref<InstanceType<typeof ElForm>>()

// 联系表单
const contactForm = reactive({
  name: '',
  phone: '',
  email: '',
  type: '',
  subject: '',
  message: ''
})

// 表单验证规则
const contactRules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择咨询类型', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入咨询主题', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入详细内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要10个字符', trigger: 'blur' }
  ]
}

// 常见问题
const faqs = ref([
  {
    id: '1',
    question: '如何报名入园？',
    answer: '您可以通过电话咨询、在线预约或直接到园区参观的方式进行报名。我们会安排专业老师为您详细介绍入园流程和相关要求。'
  },
  {
    id: '2',
    question: '学费是多少？',
    answer: '学费根据不同年龄段和班级类型有所不同，具体费用请联系我们的招生老师，我们会根据您的需求提供详细的收费标准。'
  },
  {
    id: '3',
    question: '园区的师资力量如何？',
    answer: '我们拥有一支专业的教师团队，所有老师均具备幼儿教育相关学历和资质证书，定期参加专业培训，确保教学质量。'
  },
  {
    id: '4',
    question: '可以参观园区吗？',
    answer: '当然可以！我们欢迎家长预约参观园区。请提前电话预约，我们会安排专门时间为您介绍园区环境、教学设施和课程安排。'
  },
  {
    id: '5',
    question: '园区的安全措施如何？',
    answer: '园区配备完善的安全设施，包括监控系统、门禁系统、专业保安等。同时制定了严格的安全管理制度，确保孩子们的安全。'
  }
])

// 方法
const handleCall = () => {
  ElMessage.success('正在为您转接电话...')
  // 这里可以实现拨打电话的功能
}

const handleEmail = () => {
  const email = 'contact@kindergarten.com'
  const subject = '幼儿园咨询'
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`
  window.open(mailtoLink)
}

const handleChat = () => {
  ElMessage.info('在线客服功能开发中，请稍后再试或通过其他方式联系我们')
  // 这里可以集成在线客服系统
}

const handleSubmit = async () => {
  if (!contactFormRef.value) return
  
  try {
    await contactFormRef.value.validate()
    submitting.value = true
    
    // 提交联系表单
    const response = await post('/api/contact/submit', contactForm)
    
    if (response.success) {
      ElMessage.success('咨询提交成功！我们会尽快与您联系')
      handleReset()
    } else {
      ElMessage.error(response.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('提交联系表单失败:', error)
    ElMessage.error('提交失败，请检查网络连接后重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  Object.assign(contactForm, {
    name: '',
    phone: '',
    email: '',
    type: '',
    subject: '',
    message: ''
  })
  contactFormRef.value?.clearValidate()
}
</script>

<style lang="scss">
.contact-container {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.contact-header {
  margin-bottom: var(--spacing-10xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-10xl) 0;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-sm);
    padding: var(--spacing-10xl);
    
    .page-title {
      h1 {
        font-size: var(--spacing-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-sm) 0;
      }
      
      p {
        font-size: var(--text-xl);
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-image {
      opacity: 0.8;
    }
  }
}

.contact-methods {
  margin-bottom: var(--spacing-10xl);
  
  .contact-card {
    height: 100%;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-var(--spacing-xs));
    }
    
    .contact-item {
      text-align: center;
      padding: var(--text-2xl);
      
      .contact-icon {
        width: var(--avatar-size); height: var(--avatar-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--text-2xl);
        font-size: var(--spacing-3xl);
        
        &.phone {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.email {
          background: #fef3c7;
          color: var(--warning-color);
        }
        
        &.chat {
          background: #f0f9ff;
          color: var(--primary-color);
        }
      }
      
      .contact-content {
        h3 {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .contact-value {
          font-size: var(--text-xl);
          font-weight: 500;
          color: var(--primary-color);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .contact-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--text-2xl) 0;
        }
      }
    }
  }
}

.contact-form-section {
  margin-bottom: var(--spacing-10xl);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .form-container {
    display: flex;
    gap: var(--spacing-5xl);
    
    .form-description {
      flex: 0 0 300px;
      
      h3 {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-sm) 0;
      }
      
      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        line-height: 1.6;
      }
    }
    
    .contact-form {
      flex: 1;
    }
  }
}

.address-section {
  margin-bottom: var(--spacing-10xl);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .address-list {
    .address-item {
      margin-bottom: var(--text-3xl);
      padding: var(--text-lg);
      background: #f9fafb;
      border-radius: var(--spacing-sm);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-sm) 0;
      }
      
      p {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin: var(--spacing-sm) 0;
        
        .el-icon {
          color: var(--text-tertiary);
        }
      }
    }
  }
  
  .traffic-info {
    .traffic-item {
      margin-bottom: var(--text-2xl);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h4 {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
        padding-left: var(--text-3xl);
      }
    }
  }
}

.faq-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .faq-answer {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.6;
    padding: var(--text-lg) 0;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .contact-container {
    padding: var(--text-lg);
  }
  
  .contact-header .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--text-2xl);
    
    .page-title h1 {
      font-size: var(--text-3xl);
    }
    
    .page-title p {
      font-size: var(--text-lg);
    }
  }
  
  .contact-methods {
    .el-col {
      margin-bottom: var(--text-2xl);
    }
  }
  
  .form-container {
    flex-direction: column;
    gap: var(--text-2xl);
    
    .form-description {
      flex: none;
    }
  }
  
  .address-section {
    .el-col {
      margin-bottom: var(--text-2xl);
    }
  }
}
</style>
