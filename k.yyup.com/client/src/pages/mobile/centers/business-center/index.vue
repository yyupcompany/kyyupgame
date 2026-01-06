<template>
  <MobileMainLayout
    title="招商中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
    @back="handleBack"
  >
    <!-- 头部操作按钮 -->
    <template #header-extra>
      <van-icon name="add-o" size="20" @click="handleQuickAdd" />
    </template>

    <div class="business-center-mobile">
      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="stat in statsData"
            :key="stat.key"
            class="stat-card"
            @click="handleStatClick(stat.key)"
          >
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend">
                <van-tag :type="stat.trendType" size="small">{{ stat.trend }}</van-tag>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 招生进度条区域 -->
      <div class="enrollment-progress-section">
        <div class="progress-header">
          <h4>招生进度总览</h4>
          <div class="progress-stats">
            <span>目标: {{ enrollmentTarget > 0 ? enrollmentTarget + '人' : '未设置' }}</span>
            <span>已招: {{ enrollmentCurrent }}人</span>
            <span>完成率: {{ enrollmentPercentage }}%</span>
          </div>
        </div>

        <div class="progress-container">
          <van-progress
            :percentage="enrollmentPercentage"
            stroke-width="8"
            :show-text="false"
            color="#1989fa"
          />
          <div class="progress-milestones">
            <div
              v-for="milestone in enrollmentMilestones"
              :key="milestone.id"
              class="milestone"
              :style="{ left: milestone.position + '%' }"
            >
              <div class="milestone-marker"></div>
              <div class="milestone-label">{{ milestone.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <!-- 业务流程标签页 -->
        <van-tab title="业务流程" name="timeline">
          <div class="tab-content">
            <!-- 业务流程时间线 -->
            <div class="timeline-section">
              <div class="timeline-header">
                <h3>业务流程中心</h3>
                <p>全流程业务管理与监控</p>
              </div>

              <div class="timeline-container" v-loading="loading">
                <div
                  v-for="(item, index) in timelineItems"
                  :key="item.id"
                  class="timeline-item"
                  :class="{
                    'active': selectedItem?.id === item.id,
                    'completed': item.status === 'completed',
                    'in-progress': item.status === 'in-progress',
                    'pending': item.status === 'pending'
                  }"
                  @click="selectTimelineItem(item)"
                >
                  <div class="timeline-marker">
                    <div class="timeline-dot">
                      <van-icon :name="convertIconName(item.icon)" size="16" />
                    </div>
                    <div class="timeline-line" v-if="index < timelineItems.length - 1"></div>
                  </div>

                  <div class="timeline-content">
                    <div class="timeline-title">{{ item.title }}</div>
                    <div class="timeline-description">{{ item.description }}</div>
                    <div class="timeline-meta">
                      <van-tag
                        :type="getStatusTagType(item.status)"
                        size="small"
                        class="timeline-status"
                      >
                        {{ getStatusText(item.status) }}
                      </van-tag>
                      <span class="timeline-progress">{{ item.progress }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 选中项目的详细信息 -->
            <div v-if="selectedItem" class="detail-section">
              <div class="detail-header">
                <div class="detail-title">
                  <van-icon :name="convertIconName(selectedItem.icon)" size="24" />
                  <h4>{{ selectedItem.title }}</h4>
                  <van-button type="primary" size="small" @click="handleEditAction()">
                    <van-icon name="edit" size="14" />
                    编辑
                  </van-button>
                </div>
              </div>

              <div class="detail-body">
                <!-- 基础信息 -->
                <div class="detail-section-item">
                  <h5>基础信息</h5>
                  <van-cell-group>
                    <van-cell title="状态" :value="getStatusText(selectedItem.status)" />
                    <van-cell title="负责人" :value="selectedItem.assignee || '未分配'" />
                    <van-cell title="截止时间" :value="selectedItem.deadline || '无限制'" />
                    <van-cell title="进度" :value="selectedItem.progress + '%'" />
                  </van-cell-group>
                </div>

                <!-- 详细描述 -->
                <div class="detail-section-item">
                  <h5>详细描述</h5>
                  <div class="detail-description">{{ selectedItem.detailDescription }}</div>
                </div>

                <!-- 关键指标 -->
                <div class="detail-section-item" v-if="selectedItem.metrics">
                  <h5>关键指标</h5>
                  <van-grid :column-num="3" :gutter="8">
                    <van-grid-item
                      v-for="metric in selectedItem.metrics"
                      :key="metric.key"
                      class="metric-card"
                    >
                      <div class="metric-value">{{ metric.value }}</div>
                      <div class="metric-label">{{ metric.label }}</div>
                    </van-grid-item>
                  </van-grid>
                </div>

                <!-- 快捷操作区域 -->
                <div class="detail-section-item quick-actions-section">
                  <h5>快捷操作</h5>
                  <div class="quick-actions-grid">
                    <van-button
                      v-for="action in getQuickActions(selectedItem.title)"
                      :key="action.key"
                      :type="action.type || 'primary'"
                      size="small"
                      @click="handleQuickAction(action)"
                      class="quick-action-btn"
                    >
                      <van-icon :name="convertIconName(action.lucideIcon)" size="16" />
                      {{ action.label }}
                    </van-button>
                  </div>
                  <div class="quick-actions-tip">
                    <van-icon name="info-o" size="14" />
                    <span>在此快速创建数据，无需跳转到其他页面</span>
                  </div>
                </div>

                <!-- 操作历史 -->
                <div class="detail-section-item">
                  <h5>最近操作</h5>
                  <div class="operation-list">
                    <div
                      v-for="operation in selectedItem.recentOperations || []"
                      :key="operation.id"
                      class="operation-item"
                    >
                      <div class="operation-time">{{ operation.time }}</div>
                      <div class="operation-content">{{ operation.content }}</div>
                      <div class="operation-user">{{ operation.user }}</div>
                    </div>
                    <div v-if="!selectedItem.recentOperations?.length" class="no-operations">
                      暂无操作记录
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 未选中项目时的占位符 -->
            <div v-else class="detail-placeholder">
              <div class="placeholder-content">
                <van-icon name="arrow" size="48" />
                <h4>选择业务流程</h4>
                <p>点击上方的业务流程，查看详细信息和操作选项</p>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 业务统计标签页 -->
        <van-tab title="业务统计" name="statistics">
          <div class="tab-content">
            <!-- 招商统计卡片 -->
            <div class="business-stats-section">
              <h3>招商业务统计</h3>
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="business-stat-card">
                    <div class="stat-icon">
                      <van-icon name="friends-o" color="#1989fa" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ businessStats.partnersCount }}</div>
                      <div class="stat-text">合作伙伴</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="business-stat-card">
                    <div class="stat-icon">
                      <van-icon name="calendar-o" color="#07c160" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ businessStats.activeCampaigns }}</div>
                      <div class="stat-text">进行中活动</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="business-stat-card">
                    <div class="stat-icon">
                      <van-icon name="chart-trending-o" color="#ff6034" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ businessStats.conversionRate }}%</div>
                      <div class="stat-text">转化率</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="business-stat-card">
                    <div class="stat-icon">
                      <van-icon name="gold-coin-o" color="#ff976a" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ businessStats.totalRevenue }}万</div>
                      <div class="stat-text">总收入</div>
                    </div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 渠道分析 -->
            <div class="channel-analysis-section">
              <h3>渠道分析</h3>
              <div class="channel-list">
                <div
                  v-for="channel in channelData"
                  :key="channel.id"
                  class="channel-card"
                >
                  <div class="channel-header">
                    <div class="channel-icon">
                      <van-icon :name="channel.icon" size="20" />
                    </div>
                    <div class="channel-info">
                      <h4>{{ channel.name }}</h4>
                      <p>{{ channel.description }}</p>
                    </div>
                    <van-tag :type="channel.performanceType" size="small">
                      {{ channel.performance }}
                    </van-tag>
                  </div>
                  <div class="channel-metrics">
                    <div class="metric-item">
                      <span class="label">访问量</span>
                      <span class="value">{{ channel.visits }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="label">转化数</span>
                      <span class="value">{{ channel.conversions }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="label">转化率</span>
                      <span class="value">{{ channel.conversionRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 漏斗分析 -->
            <div class="funnel-analysis-section">
              <h3>转化漏斗</h3>
              <div class="funnel-steps">
                <div
                  v-for="(step, index) in funnelSteps"
                  :key="step.name"
                  class="funnel-step"
                  :style="{ width: step.width + '%' }"
                >
                  <div class="step-header">
                    <span class="step-name">{{ step.name }}</span>
                    <span class="step-count">{{ step.count }}</span>
                  </div>
                  <div class="step-bar" :style="{ backgroundColor: step.color }"></div>
                  <div class="step-rate">{{ step.rate }}%</div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 合作伙伴标签页 -->
        <van-tab title="合作伙伴" name="partners">
          <div class="tab-content">
            <!-- 合作伙伴统计 -->
            <div class="partners-stats-section">
              <van-grid :column-num="3" :gutter="8">
                <van-grid-item>
                  <div class="partner-stat-item">
                    <div class="stat-number">{{ partnerStats.total }}</div>
                    <div class="stat-text">总数</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="partner-stat-item">
                    <div class="stat-number">{{ partnerStats.active }}</div>
                    <div class="stat-text">活跃</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="partner-stat-item">
                    <div class="stat-number">{{ partnerStats.new }}</div>
                    <div class="stat-text">新增</div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions-section">
              <van-button
                type="primary"
                icon="plus"
                block
                @click="handleAddPartner"
              >
                添加合作伙伴
              </van-button>
            </div>

            <!-- 合作伙伴列表 -->
            <div class="partners-list-section">
              <van-list
                v-model:loading="partnersLoading"
                :finished="partnersFinished"
                finished-text="没有更多了"
                @load="loadPartners"
              >
                <div
                  v-for="partner in partnersList"
                  :key="partner.id"
                  class="partner-card"
                  @click="viewPartnerDetail(partner)"
                >
                  <div class="partner-header">
                    <div class="partner-avatar">
                      <van-image
                        :src="partner.logo || '/default-avatar.png'"
                        fit="cover"
                        round
                        width="40"
                        height="40"
                      />
                    </div>
                    <div class="partner-info">
                      <h4>{{ partner.name }}</h4>
                      <p>{{ partner.type }}</p>
                    </div>
                    <van-tag :type="getPartnerStatusType(partner.status)" size="small">
                      {{ getPartnerStatusText(partner.status) }}
                    </van-tag>
                  </div>
                  <div class="partner-metrics">
                    <div class="metric">
                      <span class="label">合作项目:</span>
                      <span class="value">{{ partner.projectCount }}个</span>
                    </div>
                    <div class="metric">
                      <span class="label">总收入:</span>
                      <span class="value">{{ partner.revenue }}万</span>
                    </div>
                  </div>
                  <div class="partner-actions">
                    <van-button size="mini" @click.stop="editPartner(partner)">
                      编辑
                    </van-button>
                    <van-button size="mini" type="primary" @click.stop="contactPartner(partner)">
                      联系
                    </van-button>
                  </div>
                </div>
              </van-list>
            </div>
          </div>
        </van-tab>

        <!-- 合同管理标签页 -->
        <van-tab title="合同管理" name="contracts">
          <div class="tab-content">
            <!-- 合同统计 -->
            <div class="contracts-stats-section">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="contract-stat-card total">
                    <div class="stat-icon">
                      <van-icon name="description" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ contractStats.total }}</div>
                      <div class="stat-text">总合同数</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="contract-stat-card active">
                    <div class="stat-icon">
                      <van-icon name="checked" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ contractStats.active }}</div>
                      <div class="stat-text">生效中</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="contract-stat-card pending">
                    <div class="stat-icon">
                      <van-icon name="clock-o" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ contractStats.pending }}</div>
                      <div class="stat-text">待审批</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="contract-stat-card expired">
                    <div class="stat-icon">
                      <van-icon name="warning-o" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ contractStats.expired }}</div>
                      <div class="stat-text">已过期</div>
                    </div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions-section">
              <van-button
                type="primary"
                icon="plus"
                block
                @click="handleCreateContract"
              >
                创建新合同
              </van-button>
            </div>

            <!-- 合同列表 -->
            <div class="contracts-list-section">
              <van-list
                v-model:loading="contractsLoading"
                :finished="contractsFinished"
                finished-text="没有更多了"
                @load="loadContracts"
              >
                <div
                  v-for="contract in contractsList"
                  :key="contract.id"
                  class="contract-card"
                  @click="viewContractDetail(contract)"
                >
                  <div class="contract-header">
                    <div class="contract-title">
                      <h4>{{ contract.title }}</h4>
                      <van-tag :type="getContractStatusType(contract.status)" size="small">
                        {{ getContractStatusText(contract.status) }}
                      </van-tag>
                    </div>
                    <div class="contract-partner">
                      <span class="label">合作方:</span>
                      <span class="value">{{ contract.partnerName }}</span>
                    </div>
                  </div>
                  <div class="contract-details">
                    <div class="detail-item">
                      <span class="label">合同金额:</span>
                      <span class="value amount">{{ contract.amount }}万元</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">开始日期:</span>
                      <span class="value">{{ formatDate(contract.startDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">结束日期:</span>
                      <span class="value">{{ formatDate(contract.endDate) }}</span>
                    </div>
                  </div>
                  <div class="contract-actions">
                    <van-button size="mini" @click.stop="editContract(contract)">
                      编辑
                    </van-button>
                    <van-button size="mini" type="primary" @click.stop="viewContract(contract)">
                      查看
                    </van-button>
                  </div>
                </div>
              </van-list>
            </div>
          </div>
        </van-tab>

        <!-- 跟进管理标签页 -->
        <van-tab title="跟进管理" name="followup">
          <div class="tab-content">
            <!-- 跟进统计 -->
            <div class="followup-stats-section">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="followup-stat-card">
                    <div class="stat-icon">
                      <van-icon name="phone-o" color="#1989fa" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ followupStats.todayCalls }}</div>
                      <div class="stat-text">今日跟进</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="followup-stat-card">
                    <div class="stat-icon">
                      <van-icon name="clock-o" color="#ff6034" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ followupStats.pendingTasks }}</div>
                      <div class="stat-text">待处理</div>
                    </div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions-section">
              <van-button
                type="primary"
                icon="plus"
                block
                @click="handleAddFollowup"
              >
                添加跟进记录
              </van-button>
            </div>

            <!-- 今日跟进任务 -->
            <div class="today-tasks-section">
              <h3>今日跟进任务</h3>
              <van-list
                v-model:loading="followupLoading"
                :finished="followupFinished"
                finished-text="没有更多了"
                @load="loadFollowupTasks"
              >
                <div
                  v-for="task in followupTasks"
                  :key="task.id"
                  class="followup-task-card"
                  @click="handleFollowupTask(task)"
                >
                  <div class="task-header">
                    <div class="task-priority">
                      <van-tag :type="getPriorityType(task.priority)" size="small">
                        {{ getPriorityText(task.priority) }}
                      </van-tag>
                    </div>
                    <div class="task-time">{{ task.time }}</div>
                  </div>
                  <div class="task-content">
                    <h4>{{ task.contactName }} - {{ task.companyName }}</h4>
                    <p>{{ task.description }}</p>
                  </div>
                  <div class="task-actions">
                    <van-button size="mini" @click.stop="completeTask(task)">
                      完成
                    </van-button>
                    <van-button size="mini" type="primary" @click.stop="postponeTask(task)">
                      延期
                    </van-button>
                  </div>
                </div>
              </van-list>
            </div>
          </div>
        </van-tab>

        <!-- 机会挖掘标签页 -->
        <van-tab title="机会挖掘" name="opportunities">
          <div class="tab-content">
            <!-- 机会统计 -->
            <div class="opportunities-stats-section">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="opportunity-stat-card">
                    <div class="stat-icon">
                      <van-icon name="gem-o" color="#1989fa" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ opportunityStats.total }}</div>
                      <div class="stat-text">总机会数</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="opportunity-stat-card">
                    <div class="stat-icon">
                      <van-icon name="fire" color="#ff6034" size="24" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ opportunityStats.hot }}</div>
                      <div class="stat-text">热门机会</div>
                    </div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- AI推荐机会 -->
            <div class="ai-opportunities-section">
              <h3>
                <van-icon name="bulb-o" />
                AI推荐机会
              </h3>
              <div class="opportunities-list">
                <div
                  v-for="opportunity in aiOpportunities"
                  :key="opportunity.id"
                  class="opportunity-card"
                  @click="viewOpportunityDetail(opportunity)"
                >
                  <div class="opportunity-header">
                    <div class="opportunity-title">
                      <h4>{{ opportunity.title }}</h4>
                      <van-tag :type="getOpportunityType(opportunity.type)" size="small">
                        {{ opportunity.type }}
                      </van-tag>
                    </div>
                    <div class="opportunity-score">
                      <span class="label">匹配度:</span>
                      <span class="value">{{ opportunity.score }}%</span>
                    </div>
                  </div>
                  <div class="opportunity-description">
                    {{ opportunity.description }}
                  </div>
                  <div class="opportunity-metrics">
                    <div class="metric">
                      <span class="label">预计收入:</span>
                      <span class="value">{{ opportunity.estimatedRevenue }}万</span>
                    </div>
                    <div class="metric">
                      <span class="label">成功概率:</span>
                      <span class="value">{{ opportunity.successRate }}%</span>
                    </div>
                  </div>
                  <div class="opportunity-actions">
                    <van-button size="mini" @click.stop="pursueOpportunity(opportunity)">
                      跟进
                    </van-button>
                    <van-button size="mini" type="primary" @click.stop="analyzeOpportunity(opportunity)">
                      分析
                    </van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 快捷表单弹出层 -->
    <van-popup
      v-model:show="quickActionVisible"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="quick-action-popup">
        <div class="popup-header">
          <h3>{{ quickActionTitle }}</h3>
          <van-icon name="cross" @click="quickActionVisible = false" />
        </div>
        <div class="popup-content">
          <!-- 快捷表单内容将在这里动态渲染 -->
          <div v-if="quickActionFields.length > 0">
            <van-form @submit="handleQuickSubmit">
              <van-field
                v-for="field in quickActionFields"
                :key="field.prop"
                v-model="quickFormData[field.prop]"
                :name="field.prop"
                :label="field.label"
                :type="field.type"
                :placeholder="field.placeholder"
                :required="field.required"
                :rules="getValidationRules(field)"
              />
              <div class="form-actions">
                <van-button @click="quickActionVisible = false">取消</van-button>
                <van-button type="primary" native-type="submit">提交</van-button>
              </div>
            </van-form>
          </div>
          <div v-else class="loading-placeholder">
            <van-loading size="24px" vertical>加载中...</van-loading>
          </div>
        </div>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { BusinessCenterService, type TimelineItem, type EnrollmentProgress } from '@/api/modules/business-center'
import { request } from '@/utils/request'
import {
  ENROLLMENT_PLAN_ENDPOINTS,
  ENROLLMENT_CONSULTATION_ENDPOINTS,
  ENROLLMENT_APPLICATION_ENDPOINTS
} from '@/api/endpoints/enrollment'
import { ACTIVITY_ENDPOINTS, ACTIVITY_REGISTRATION_ENDPOINTS } from '@/api/endpoints/activity'
import { USER_ENDPOINTS } from '@/api/endpoints/user'
import { useUserStore } from '@/stores/user'

// 路由
const router = useRouter()

// 当前活跃标签页
const activeTab = ref('timeline')

// 加载状态
const loading = ref(false)
const partnersLoading = ref(false)
const contractsLoading = ref(false)
const followupLoading = ref(false)

// 列表加载完成状态
const partnersFinished = ref(false)
const contractsFinished = ref(false)
const followupFinished = ref(false)

// 图标名称转换函数
const convertIconName = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'Calendar': 'calendar-o',
    'FileText': 'description',
    'Image': 'photo-o',
    'Send': 'send',
    'Users': 'friends',
    'Eye': 'eye-o',
    'Share2': 'share-o',
    'CheckCircle': 'success',
    'Star': 'star',
    'Award': 'medal',
    'TrendingUp': 'chart-trending-o',
    'BarChart': 'bar-chart-o',
    'Plus': 'plus',
    'Sparkles': 'fire',
    'Palette': 'brush-o',
    'DollarSign': 'gold-coin',
    'FileCode': 'description',
    'DocumentCopy': 'description',
    'Settings': 'setting-o',
    'Bell': 'bell',
    'Edit': 'edit',
    'FileQuestion': 'question',
    'MessageSquare': 'comment-o',
    'Download': 'download',
    'ArrowRight': 'arrow',
    'Home': 'home-o',
    'Dashboard': 'chart-trending-o',
    'Phone': 'phone-o',
    'Mail': 'envelope-o',
    'User': 'user-o',
    'Search': 'search',
    'Menu': 'wap-nav',
    'X': 'cross',
    'Check': 'success',
    'Minus': 'minus',
    'ChevronDown': 'arrow-down',
    'ChevronUp': 'arrow-up',
    'ChevronLeft': 'arrow-left',
    'ChevronRight': 'arrow',
    'MousePointer': 'pointer',
    'Zap': 'flash',
    'Info': 'info-o'
  }
  return iconMap[iconName] || 'grid'
}

// 选中的时间线项目
const selectedItem = ref<TimelineItem | null>(null)

// 招生数据
const enrollmentTarget = ref(0)
const enrollmentCurrent = ref(0)
const enrollmentPercentage = computed(() => {
  if (enrollmentTarget.value === 0) {
    return 0
  }
  const percentage = Math.round((enrollmentCurrent.value / enrollmentTarget.value) * 100)
  return Math.min(100, Math.max(0, percentage))
})

// 招生里程碑
const enrollmentMilestones = ref([
  { id: '1', label: '25%', position: 25, target: 125 },
  { id: '2', label: '50%', position: 50, target: 250 },
  { id: '3', label: '75%', position: 75, target: 375 },
  { id: '4', label: '100%', position: 100, target: 500 }
])

// 时间线数据
const timelineItems = ref<TimelineItem[]>([])

// 统计数据
const statsData = computed(() => [
  {
    key: 'enrollment',
    label: '招生进度',
    value: `${enrollmentPercentage.value}%`,
    icon: 'friends',
    color: '#1989fa',
    trend: enrollmentTarget.value > 0 ? `${enrollmentCurrent.value}/${enrollmentTarget.value}` : '未设置目标',
    trendType: 'primary'
  },
  {
    key: 'partners',
    label: '合作伙伴',
    value: businessStats.value.partnersCount,
    icon: 'friends',
    color: '#07c160',
    trend: `活跃 ${businessStats.value.activePartners}`,
    trendType: 'success'
  },
  {
    key: 'campaigns',
    label: '营销活动',
    value: businessStats.value.activeCampaigns,
    icon: 'bullhorn-o',
    color: '#ff6034',
    trend: `总 ${businessStats.value.totalCampaigns}`,
    trendType: 'warning'
  },
  {
    key: 'revenue',
    label: '业务收入',
    value: `${businessStats.value.totalRevenue}万`,
    icon: 'gold-coin',
    color: '#ff976a',
    trend: `+${businessStats.value.revenueGrowth}%`,
    trendType: 'success'
  }
])

// 业务统计数据
const businessStats = ref({
  partnersCount: 15,
  activePartners: 12,
  activeCampaigns: 8,
  totalCampaigns: 25,
  totalRevenue: 128.5,
  revenueGrowth: 15.3,
  conversionRate: 12.8
})

// 渠道数据
const channelData = ref([
  {
    id: 1,
    name: '线上推广',
    description: '通过线上广告和社交媒体推广',
    icon: 'chart-trending-o',
    performance: '优秀',
    performanceType: 'success',
    visits: 1250,
    conversions: 158,
    conversionRate: 12.6
  },
  {
    id: 2,
    name: '社区活动',
    description: '社区和校园推广活动',
    icon: 'friends-o',
    performance: '良好',
    performanceType: 'primary',
    visits: 890,
    conversions: 124,
    conversionRate: 13.9
  },
  {
    id: 3,
    name: '口碑推荐',
    description: '家长和合作伙伴推荐',
    icon: 'chat-o',
    performance: '优秀',
    performanceType: 'success',
    visits: 420,
    conversions: 98,
    conversionRate: 23.3
  }
])

// 转化漏斗数据
const funnelSteps = ref([
  { name: '访问', count: 1250, rate: 100, width: 100, color: '#1989fa' },
  { name: '咨询', count: 380, rate: 30.4, width: 80, color: '#07c160' },
  { name: '申请', count: 186, rate: 48.9, width: 60, color: '#ff6034' },
  { name: '录取', count: 128, rate: 68.8, width: 40, color: '#ff976a' }
])

// 合作伙伴统计数据
const partnerStats = ref({
  total: 15,
  active: 12,
  new: 3
})

// 合作伙伴列表
const partnersList = ref([
  {
    id: 1,
    name: '阳光教育集团',
    type: '教育培训',
    status: 'active',
    projectCount: 3,
    revenue: 45.8,
    logo: '/partner-logo-1.png'
  },
  {
    id: 2,
    name: '快乐童年幼儿园',
    type: '幼教机构',
    status: 'pending',
    projectCount: 1,
    revenue: 12.5,
    logo: '/partner-logo-2.png'
  }
])

// 合同统计数据
const contractStats = ref({
  total: 25,
  active: 18,
  pending: 4,
  expired: 3
})

// 合同列表
const contractsList = ref([
  {
    id: 1,
    title: '阳光教育集团合作协议',
    partnerName: '阳光教育集团',
    status: 'active',
    amount: 45.8,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    id: 2,
    title: '快乐童年合作协议',
    partnerName: '快乐童年幼儿园',
    status: 'pending',
    amount: 12.5,
    startDate: '2024-03-01',
    endDate: '2025-02-28'
  }
])

// 跟进统计数据
const followupStats = ref({
  todayCalls: 8,
  pendingTasks: 15
})

// 跟进任务列表
const followupTasks = ref([
  {
    id: 1,
    contactName: '张总',
    companyName: '阳光教育集团',
    description: '讨论新学期合作细节，确认推广计划',
    priority: 'high',
    time: '14:00',
    status: 'pending'
  },
  {
    id: 2,
    contactName: '李园长',
    companyName: '快乐童年幼儿园',
    description: '跟进合作协议审批进度',
    priority: 'medium',
    time: '16:30',
    status: 'pending'
  }
])

// 机会统计数据
const opportunityStats = ref({
  total: 28,
  hot: 6
})

// AI推荐机会
const aiOpportunities = ref([
  {
    id: 1,
    title: '与新城区小学合作机会',
    type: '教育合作',
    score: 85,
    description: '新城区计划新建3所小学，需要学前教育配套服务',
    estimatedRevenue: 120.5,
    successRate: 75
  },
  {
    id: 2,
    title: '企业托育服务合作',
    type: '企业服务',
    score: 78,
    description: '科技园区多家企业有员工托育需求',
    estimatedRevenue: 68.8,
    successRate: 68
  }
])

// 快捷操作相关
const quickActionVisible = ref(false)
const quickActionTitle = ref('')
const quickActionFields = ref<any[]>([])
const quickFormData = ref<any>({})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取状态标签类型
const getStatusTagType = (status?: string) => {
  const typeMap: Record<string, string> = {
    'completed': 'success',
    'in-progress': 'warning',
    'pending': 'info'
  }
  return typeMap[status || ''] || 'info'
}

// 选择时间线项目
const selectTimelineItem = (item: TimelineItem) => {
  selectedItem.value = item
}

// 处理返回
const handleBack = () => {
  router.back()
}

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

// 处理统计卡片点击
const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'enrollment':
      activeTab.value = 'timeline'
      break
    case 'partners':
      activeTab.value = 'partners'
      break
    case 'campaigns':
      Toast('查看营销活动详情')
      break
    case 'revenue':
      Toast('查看收入统计详情')
      break
    default:
      Toast(`查看${statType}详情`)
  }
}

// 处理快速添加
const handleQuickAdd = () => {
  const actionMap: Record<string, any> = {
    timeline: () => {
      Toast('在业务流程页面添加新流程')
    },
    partners: () => handleAddPartner(),
    contracts: () => handleCreateContract(),
    followup: () => handleAddFollowup(),
    opportunities: () => Toast('挖掘新的商业机会')
  }

  const handler = actionMap[activeTab.value]
  if (handler) handler()
}

// 处理编辑操作
const handleEditAction = () => {
  if (!selectedItem.value) return
  Toast(`编辑 ${selectedItem.value.title}`)
}

// 快捷操作配置
interface QuickAction {
  key: string
  label: string
  lucideIcon: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  route?: string
  action?: string
}

// 获取快捷操作列表
const getQuickActions = (centerTitle: string): QuickAction[] => {
  const actionsMap: Record<string, QuickAction[]> = {
    '基础中心': [
      { key: 'add-kindergarten', label: '新建幼儿园', lucideIcon: 'Building2', type: 'primary', route: '/system/settings' }
    ],
    '人员基础信息': [
      { key: 'add-teacher', label: '新建教师', lucideIcon: 'UserPlus', type: 'primary', action: 'create-teacher' },
      { key: 'add-student', label: '新建学生', lucideIcon: 'GraduationCap', type: 'success', action: 'create-student' }
    ],
    '招生计划': [
      { key: 'add-plan', label: '新建招生计划', lucideIcon: 'FileText', type: 'primary', action: 'create-enrollment-plan' },
      { key: 'add-consultation', label: '新建咨询记录', lucideIcon: 'MessageSquare', type: 'success', action: 'create-consultation' }
    ],
    '活动计划': [
      { key: 'add-activity', label: '新建活动', lucideIcon: 'Calendar', type: 'primary', action: 'create-activity' }
    ]
  }
  return actionsMap[centerTitle] || []
}

// 处理快捷操作
const handleQuickAction = async (action: QuickAction) => {
  if (action.route) {
    router.push(action.route)
    Toast(`正在跳转到 ${action.label}`)
    return
  }

  if (action.action) {
    quickActionTitle.value = action.label
    quickActionFields.value = getFormFieldsForAction(action.action)
    quickActionVisible.value = true
  }
}

// 根据操作类型获取表单字段配置
const getFormFieldsForAction = (actionType: string) => {
  const fieldsMap: Record<string, any[]> = {
    'create-enrollment-plan': [
      { prop: 'title', label: '计划名称', type: 'text', placeholder: '请输入计划名称', required: true },
      { prop: 'targetCount', label: '招生目标', type: 'number', placeholder: '请输入招生目标人数', required: true },
      { prop: 'startDate', label: '开始日期', type: 'date', placeholder: '请选择开始日期', required: true },
      { prop: 'endDate', label: '结束日期', type: 'date', placeholder: '请选择结束日期', required: true }
    ],
    'create-teacher': [
      { prop: 'realName', label: '教师姓名', type: 'text', placeholder: '请输入教师姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true },
      { prop: 'position', label: '职位', type: 'select', placeholder: '请选择职位', required: true }
    ],
    'create-student': [
      { prop: 'name', label: '学生姓名', type: 'text', placeholder: '请输入学生姓名', required: true },
      { prop: 'birthDate', label: '出生日期', type: 'date', placeholder: '请选择出生日期', required: true }
    ],
    'create-activity': [
      { prop: 'title', label: '活动名称', type: 'text', placeholder: '请输入活动名称', required: true },
      { prop: 'startTime', label: '开始时间', type: 'datetime', placeholder: '请选择开始时间', required: true },
      { prop: 'location', label: '活动地点', type: 'text', placeholder: '请输入活动地点', required: true }
    ]
  }
  return fieldsMap[actionType] || []
}

// 获取表单验证规则
const getValidationRules = (field: any) => {
  const rules: any[] = []
  if (field.required) {
    rules.push({ required: true, message: `请输入${field.label}` })
  }
  if (field.type === 'number') {
    rules.push({ pattern: /^\d+$/, message: '请输入有效数字' })
  }
  if (field.prop === 'phone') {
    rules.push({ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' })
  }
  return rules
}

// 处理快捷表单提交
const handleQuickSubmit = async () => {
  try {
    Toast.success('提交成功')
    quickActionVisible.value = false
    quickFormData.value = {}
    // 刷新数据
    await loadBusinessCenterData()
  } catch (error) {
    Toast.fail('提交失败，请重试')
  }
}

// 合作伙伴相关方法
const handleAddPartner = () => {
  quickActionTitle.value = '添加合作伙伴'
  quickActionFields.value = [
    { prop: 'name', label: '合作伙伴名称', type: 'text', placeholder: '请输入合作伙伴名称', required: true },
    { prop: 'type', label: '合作类型', type: 'select', placeholder: '请选择合作类型', required: true },
    { prop: 'contactPerson', label: '联系人', type: 'text', placeholder: '请输入联系人姓名', required: true },
    { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true }
  ]
  quickActionVisible.value = true
}

const getPartnerStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'pending': 'warning',
    'inactive': 'default'
  }
  return typeMap[status] || 'default'
}

const getPartnerStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '活跃',
    'pending': '待审核',
    'inactive': '未活跃'
  }
  return textMap[status] || status
}

const viewPartnerDetail = (partner: any) => {
  Toast(`查看 ${partner.name} 详情`)
}

const editPartner = (partner: any) => {
  Toast(`编辑 ${partner.name}`)
}

const contactPartner = (partner: any) => {
  Toast(`联系 ${partner.name}`)
}

const loadPartners = () => {
  // 模拟加载更多合作伙伴
  partnersLoading.value = false
  partnersFinished.value = true
}

// 合同相关方法
const handleCreateContract = () => {
  quickActionTitle.value = '创建新合同'
  quickActionFields.value = [
    { prop: 'title', label: '合同标题', type: 'text', placeholder: '请输入合同标题', required: true },
    { prop: 'partnerName', label: '合作方', type: 'text', placeholder: '请输入合作方名称', required: true },
    { prop: 'amount', label: '合同金额', type: 'number', placeholder: '请输入合同金额（万元）', required: true },
    { prop: 'startDate', label: '开始日期', type: 'date', placeholder: '请选择开始日期', required: true },
    { prop: 'endDate', label: '结束日期', type: 'date', placeholder: '请选择结束日期', required: true }
  ]
  quickActionVisible.value = true
}

const getContractStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'pending': 'warning',
    'expired': 'danger'
  }
  return typeMap[status] || 'default'
}

const getContractStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '生效中',
    'pending': '待审批',
    'expired': '已过期'
  }
  return textMap[status] || status
}

const viewContractDetail = (contract: any) => {
  Toast(`查看合同详情: ${contract.title}`)
}

const editContract = (contract: any) => {
  Toast(`编辑合同: ${contract.title}`)
}

const viewContract = (contract: any) => {
  Toast(`查看合同内容: ${contract.title}`)
}

const loadContracts = () => {
  // 模拟加载更多合同
  contractsLoading.value = false
  contractsFinished.value = true
}

// 跟进相关方法
const handleAddFollowup = () => {
  quickActionTitle.value = '添加跟进记录'
  quickActionFields.value = [
    { prop: 'contactName', label: '联系人', type: 'text', placeholder: '请输入联系人姓名', required: true },
    { prop: 'companyName', label: '公司名称', type: 'text', placeholder: '请输入公司名称', required: true },
    { prop: 'description', label: '跟进内容', type: 'textarea', placeholder: '请输入跟进内容', required: true },
    { prop: 'nextTime', label: '下次跟进时间', type: 'datetime', placeholder: '请选择下次跟进时间', required: true }
  ]
  quickActionVisible.value = true
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'primary'
  }
  return typeMap[priority] || 'primary'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || priority
}

const handleFollowupTask = (task: any) => {
  Toast(`查看跟进任务: ${task.contactName}`)
}

const completeTask = (task: any) => {
  Dialog.confirm({
    title: '确认完成',
    message: `确定要完成与 ${task.contactName} 的跟进任务吗？`,
  }).then(() => {
    Toast.success('任务已完成')
    // 从列表中移除任务
    const index = followupTasks.value.findIndex(t => t.id === task.id)
    if (index > -1) {
      followupTasks.value.splice(index, 1)
    }
  })
}

const postponeTask = (task: any) => {
  Toast(`延期任务: ${task.contactName}`)
}

const loadFollowupTasks = () => {
  // 模拟加载更多跟进任务
  followupLoading.value = false
  followupFinished.value = true
}

// 机会相关方法
const getOpportunityType = (type: string) => {
  const typeMap: Record<string, string> = {
    '教育合作': 'primary',
    '企业服务': 'success',
    '政府项目': 'warning',
    '投资机会': 'danger'
  }
  return typeMap[type] || 'primary'
}

const viewOpportunityDetail = (opportunity: any) => {
  Toast(`查看机会详情: ${opportunity.title}`)
}

const pursueOpportunity = (opportunity: any) => {
  Toast(`跟进机会: ${opportunity.title}`)
}

const analyzeOpportunity = (opportunity: any) => {
  Toast(`AI分析机会: ${opportunity.title}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 加载业务中心数据
const loadBusinessCenterData = async () => {
  try {
    loading.value = true
    console.log('🏢 开始加载业务中心数据...')

    // 并行获取所有数据
    const [timelineData, enrollmentProgressData] = await Promise.all([
      BusinessCenterService.getTimeline(),
      BusinessCenterService.getEnrollmentProgress()
    ])

    // 更新时间线数据
    timelineItems.value = timelineData
    console.log('📋 时间线数据加载完成:', timelineData.length, '个项目')

    // 更新招生进度数据
    enrollmentTarget.value = enrollmentProgressData.target
    enrollmentCurrent.value = enrollmentProgressData.current
    enrollmentMilestones.value = enrollmentProgressData.milestones
    console.log('🎯 招生进度数据加载完成:', enrollmentProgressData)

    // 默认选中第一个进行中的项目
    const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
    if (inProgressItem) {
      selectedItem.value = inProgressItem
    } else if (timelineItems.value.length > 0) {
      selectedItem.value = timelineItems.value[0]
    }

    Toast.success('业务中心数据加载成功')
  } catch (error) {
    console.error('❌ 加载业务中心数据失败:', error)
    Toast.fail('加载业务中心数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadBusinessCenterData()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.business-center-mobile {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: var(--van-tabbar-height);

  .stats-section {
    padding: var(--spacing-md);
    background: var(--card-bg);
    margin-bottom: 8px;

    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: var(--spacing-md);
      text-align: center;

      .stat-content {
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          color: #323233;
          margin: var(--spacing-sm) 0;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
          margin-bottom: 4px;
        }

        .stat-trend {
          margin-top: 4px;
        }
      }
    }
  }

  .enrollment-progress-section {
    background: var(--card-bg);
    padding: var(--spacing-md);
    margin-bottom: 8px;

    .progress-header {
      margin-bottom: 16px;

      h4 {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin: 0 0 8px 0;
      }

      .progress-stats {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-xs);
        color: #969799;

        span {
          padding: var(--spacing-xs) 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }
      }
    }

    .progress-container {
      position: relative;

      .progress-milestones {
        position: relative;
        height: 30px;
        margin-top: 12px;

        .milestone {
          position: absolute;
          transform: translateX(-50%);
          text-align: center;

          .milestone-marker {
            width: 8px;
            height: 8px;
            background: #1989fa;
            border-radius: 50%;
            margin: 0 auto 6px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .milestone-label {
            font-size: 10px;
            color: #969799;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .tab-content {
    padding: var(--spacing-md);
    min-height: calc(100vh - 200px);
  }

  // 时间线样式
  .timeline-section {
    margin-bottom: 24px;

    .timeline-header {
      margin-bottom: 16px;

      h3 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: #323233;
        margin: 0 0 4px 0;
      }

      p {
        font-size: var(--text-sm);
        color: #969799;
        margin: 0;
      }
    }

    .timeline-container {
      .timeline-item {
        display: flex;
        margin-bottom: 16px;
        cursor: pointer;

        &.active {
          .timeline-content {
            background: #e8f4ff;
            border-color: #1989fa;
          }
        }

        .timeline-marker {
          margin-right: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;

          .timeline-dot {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
            color: #666;
            z-index: 2;
          }

          .timeline-line {
            width: 2px;
            height: 40px;
            background: #e0e0e0;
            margin-top: 8px;
          }
        }

        .timeline-content {
          flex: 1;
          padding: var(--spacing-md);
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: var(--app-bg-color);

          .timeline-title {
            font-weight: 600;
            color: #323233;
            margin-bottom: 4px;
          }

          .timeline-description {
            font-size: var(--text-sm);
            color: #969799;
            margin-bottom: 8px;
          }

          .timeline-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .timeline-progress {
              font-size: var(--text-xs);
              color: #969799;
            }
          }
        }
      }
    }
  }

  // 详情区域样式
  .detail-section {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .detail-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;

      .detail-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        h4 {
          flex: 1;
          font-size: var(--text-base);
          font-weight: 600;
          color: #323233;
          margin: 0;
        }
      }
    }

    .detail-body {
      .detail-section-item {
        margin-bottom: 20px;

        h5 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin: 0 0 12px 0;
        }

        .detail-description {
          font-size: var(--text-sm);
          color: #646566;
          line-height: 1.5;
        }

        .metric-card {
          text-align: center;
          padding: var(--spacing-md);

          .metric-value {
            font-size: var(--text-lg);
            font-weight: bold;
            color: #1989fa;
            margin-bottom: 4px;
          }

          .metric-label {
            font-size: var(--text-xs);
            color: #969799;
          }
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
          margin-bottom: 12px;

          .quick-action-btn {
            width: 100%;
            height: auto;
            padding: var(--spacing-sm);
            font-size: var(--text-sm);
          }
        }

        .quick-actions-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: var(--spacing-sm) 12px;
          background: #f0f9ff;
          border-radius: 4px;
          font-size: var(--text-xs);
          color: #646566;
        }
      }
    }
  }

  .detail-placeholder {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-xl);
    text-align: center;
    color: #969799;

    .placeholder-content {
      h4 {
        font-size: var(--text-base);
        color: #646566;
        margin: var(--spacing-md) 0 8px 0;
      }

      p {
        font-size: var(--text-sm);
        margin: 0;
      }
    }
  }

  // 业务统计样式
  .business-stats-section {
    margin-bottom: 24px;

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px 0;
    }

    .business-stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-icon {
        margin-right: 12px;
      }

      .stat-info {
        .stat-number {
          font-size: var(--text-xl);
          font-weight: bold;
          color: #323233;
          margin-bottom: 2px;
        }

        .stat-text {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  // 渠道分析样式
  .channel-analysis-section {
    margin-bottom: 24px;

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px 0;
    }

    .channel-list {
      .channel-card {
        background: var(--card-bg);
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .channel-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .channel-icon {
            margin-right: 12px;
          }

          .channel-info {
            flex: 1;

            h4 {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #323233;
              margin: 0 0 2px 0;
            }

            p {
              font-size: var(--text-xs);
              color: #969799;
              margin: 0;
            }
          }
        }

        .channel-metrics {
          display: flex;
          justify-content: space-between;

          .metric-item {
            text-align: center;

            .label {
              display: block;
              font-size: 11px;
              color: #969799;
              margin-bottom: 2px;
            }

            .value {
              font-size: var(--text-sm);
              font-weight: 500;
              color: #323233;
            }
          }
        }
      }
    }
  }

  // 漏斗分析样式
  .funnel-analysis-section {
    margin-bottom: 24px;

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px 0;
    }

    .funnel-steps {
      .funnel-step {
        margin-bottom: 8px;

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .step-name {
            font-size: var(--text-sm);
            font-weight: 500;
            color: #323233;
          }

          .step-count {
            font-size: var(--text-sm);
            color: #646566;
          }
        }

        .step-bar {
          height: 8px;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .step-rate {
          text-align: right;
          font-size: 11px;
          color: #969799;
        }
      }
    }
  }

  // 合作伙伴样式
  .partners-stats-section {
    margin-bottom: 16px;

    .partner-stat-item {
      text-align: center;
      padding: var(--spacing-md);

      .stat-number {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #323233;
        margin-bottom: 4px;
      }

      .stat-text {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }

  .quick-actions-section {
    margin-bottom: 16px;
  }

  .partners-list-section {
    .partner-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .partner-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .partner-avatar {
          margin-right: 12px;
        }

        .partner-info {
          flex: 1;

          h4 {
            font-size: var(--text-sm);
            font-weight: 600;
            color: #323233;
            margin: 0 0 2px 0;
          }

          p {
            font-size: var(--text-xs);
            color: #969799;
            margin: 0;
          }
        }
      }

      .partner-metrics {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        .metric {
          .label {
            font-size: var(--text-xs);
            color: #969799;
          }

          .value {
            font-size: var(--text-sm);
            font-weight: 500;
            color: #323233;
          }
        }
      }

      .partner-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  // 合同管理样式
  .contracts-stats-section {
    margin-bottom: 16px;

    .contract-stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: 8px;
      color: white;

      &.total {
        background: linear-gradient(135deg, #1989fa, #1677ff);
      }

      &.active {
        background: linear-gradient(135deg, #07c160, #06ad56);
      }

      &.pending {
        background: linear-gradient(135deg, #ff976a, #ff8a4d);
      }

      &.expired {
        background: linear-gradient(135deg, #ee0a24, #d60a1f);
      }

      .stat-icon {
        margin-right: 12px;
        color: white;
      }

      .stat-info {
        .stat-number {
          font-size: var(--text-xl);
          font-weight: bold;
          margin-bottom: 2px;
        }

        .stat-text {
          font-size: var(--text-xs);
          opacity: 0.9;
        }
      }
    }
  }

  .contracts-list-section {
    .contract-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .contract-header {
        margin-bottom: 12px;

        .contract-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          h4 {
            font-size: var(--text-sm);
            font-weight: 600;
            color: #323233;
            margin: 0;
          }
        }

        .contract-partner {
          .label {
            font-size: var(--text-xs);
            color: #969799;
          }

          .value {
            font-size: var(--text-sm);
            color: #323233;
          }
        }
      }

      .contract-details {
        margin-bottom: 12px;

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;

          .label {
            font-size: var(--text-xs);
            color: #969799;
          }

          .value {
            font-size: var(--text-sm);
            color: #323233;

            &.amount {
              font-weight: 600;
              color: #07c160;
            }
          }
        }
      }

      .contract-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  // 跟进管理样式
  .followup-stats-section {
    margin-bottom: 16px;

    .followup-stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-icon {
        margin-right: 12px;
      }

      .stat-info {
        .stat-number {
          font-size: var(--text-xl);
          font-weight: bold;
          color: #323233;
          margin-bottom: 2px;
        }

        .stat-text {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .today-tasks-section {
    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px 0;
    }

    .followup-task-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .task-time {
          font-size: var(--text-xs);
          color: #969799;
        }
      }

      .task-content {
        margin-bottom: 12px;

        h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin: 0 0 4px 0;
        }

        p {
          font-size: var(--text-sm);
          color: #646566;
          margin: 0;
          line-height: 1.4;
        }
      }

      .task-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  // 机会挖掘样式
  .opportunities-stats-section {
    margin-bottom: 16px;

    .opportunity-stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-icon {
        margin-right: 12px;
      }

      .stat-info {
        .stat-number {
          font-size: var(--text-xl);
          font-weight: bold;
          color: #323233;
          margin-bottom: 2px;
        }

        .stat-text {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .ai-opportunities-section {
    h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px 0;
    }

    .opportunities-list {
      .opportunity-card {
        background: var(--card-bg);
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .opportunity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .opportunity-title {
            flex: 1;

            h4 {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #323233;
              margin: 0 0 4px 0;
            }
          }

          .opportunity-score {
            .label {
              font-size: 11px;
              color: #969799;
            }

            .value {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #07c160;
            }
          }
        }

        .opportunity-description {
          font-size: var(--text-sm);
          color: #646566;
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .opportunity-metrics {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;

          .metric {
            .label {
              font-size: var(--text-xs);
              color: #969799;
            }

            .value {
              font-size: var(--text-sm);
              font-weight: 500;
              color: #323233;
            }
          }
        }

        .opportunity-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }

  // 快捷操作弹出层样式
  .quick-action-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid #e0e0e0;

      h3 {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin: 0;
      }
    }

    .popup-content {
      flex: 1;
      padding: var(--spacing-md);
      overflow-y: auto;

      .form-actions {
        display: flex;
        gap: var(--spacing-md);
        margin-top: 20px;

        .van-button {
          flex: 1;
        }
      }

      .loading-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #969799;
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .business-center-mobile {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>