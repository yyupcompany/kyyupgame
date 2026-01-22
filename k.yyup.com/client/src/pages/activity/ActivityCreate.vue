<template>
  <UnifiedCenterLayout
    :title="isEdit ? '编辑活动' : '创建活动'"
    :show-header="true"
    :show-actions="true"
  >
    <template #header-subtitle>
      按照步骤完成活动策划，包括基本信息、海报设计和营销配置
    </template>

    <template #header-actions>
      <el-button
        type="primary"
        :loading="aiPlanningLoading"
        @click="showAIPlanningDialog"
        :class="{ 'ai-planning-btn': true, 'ai-planning-active': aiFillingAnimation.isActive }"
      >
        <UnifiedIcon name="default" />
        {{ aiPlanningLoading ? 'AI策划中...' : aiFillingAnimation.isActive ? 'AI填表中...' : '🤖 AI智能策划' }}
      </el-button>
    </template>

    <template #content>

    <!-- 步骤导航 -->
    <div class="steps-container">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="基本信息" description="活动基础信息设置"></el-step>
        <el-step title="海报设计" description="选择模板并设计海报"></el-step>
        <el-step title="营销配置" description="设置团购、积攒等营销策略"></el-step>
        <el-step title="预览发布" description="预览效果并发布活动"></el-step>
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 第一步：基本信息 -->
      <div v-show="currentStep === 0" class="step-panel">
        <div class="step-header">
          <h3>📝 活动基本信息</h3>
          <p>请填写活动的基础信息，这些信息将用于生成海报和营销内容</p>

          <!-- 步骤进度提示 -->
          <div class="step-progress-tip">
            <el-alert
              title="第1步：完善活动基本信息"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>✅ 填写完整的活动信息后，点击"下一步"进入海报设计阶段</p>
                <p>💡 提示：活动标题、时间、地点是必填项，其他信息将帮助AI生成更精美的海报</p>
              </template>
            </el-alert>
          </div>
        </div>

        <el-form
          ref="formRef"
          :model="activityForm"
          :rules="formRules"
          label-width="120px"
          class="activity-form"
        >
          <el-form-item label="活动名称" prop="title">
            <el-input
              v-model="activityForm.title"
              placeholder="请输入活动名称，建议10-20字"
              maxlength="50"
              show-word-limit
              @focus="handleFormFieldFocus('title')"
            />
            <div class="form-tip">💡 好的活动名称应该简洁有力，突出活动亮点</div>
          </el-form-item>

          <el-form-item label="活动时间" prop="timeRange" required>
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleTimeRangeChange"
              style="width: 100%"
            />
            <div class="form-tip">⏰ 建议选择周末或节假日，提高参与度</div>
          </el-form-item>

          <el-form-item label="活动地点" prop="location">
            <el-input
              v-model="activityForm.location"
              placeholder="请输入详细的活动地点"
            />
            <div class="form-tip">📍 请提供准确的地址，方便家长导航</div>
          </el-form-item>

          <el-form-item label="活动类型" prop="activityType">
            <el-select v-model="activityForm.activityType" placeholder="请选择活动类型" style="width: 100%">
              <el-option
                v-for="option in activityTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
            <div class="form-tip">🎯 活动类型将影响海报模板的推荐</div>
          </el-form-item>

          <el-form-item label="关联招生计划" prop="planId">
            <el-select
              v-model="activityForm.planId"
              placeholder="请选择关联的招生计划（可选）"
              style="width: 100%"
              clearable
              filterable
            >
              <el-option
                v-for="plan in enrollmentPlans"
                :key="plan.id"
                :value="plan.id"
                :label="`${plan.title} (${plan.year}年${plan.semester === 1 ? '春季' : '秋季'})`"
              >
                <div class="plan-option">
                  <div class="plan-title">{{ plan.title }}</div>
                  <div class="plan-meta">
                    {{ plan.year }}年{{ plan.semester === 1 ? '春季' : '秋季' }} ·
                    目标{{ plan.target_count }}人 ·
                    已报名{{ plan.enrolled_count || 0 }}人
                  </div>
                </div>
              </el-option>
            </el-select>
            <div class="form-tip">🎯 关联招生计划后，活动将作为该计划的执行活动，有助于招生转化统计</div>
          </el-form-item>

          <el-form-item label="参与人数" prop="capacity">
            <el-input-number
              v-model="activityForm.capacity"
              :min="1"
              :max="500"
              placeholder="请输入参与人数"
              style="width: 100%"
            />
            <div class="form-tip">👥 建议根据场地大小合理设置人数上限</div>
          </el-form-item>

          <el-form-item label="活动费用" prop="fee">
            <el-input-number
              v-model="activityForm.fee"
              :min="0"
              :precision="2"
              placeholder="请输入活动费用（元）"
              style="width: 100%"
            />
            <div class="form-tip">💰 设置为0表示免费活动</div>
          </el-form-item>

          <el-form-item label="活动描述" prop="description">
            <el-input
              v-model="activityForm.description"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              placeholder="详细描述活动内容、亮点和收获..."
              maxlength="500"
              show-word-limit
              resize="vertical"
            />
            <div class="form-tip">📝 详细的描述有助于提高报名转化率</div>
          </el-form-item>

          <el-form-item label="活动议程" prop="agenda">
            <el-input
              v-model="activityForm.agenda"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
              placeholder="请输入活动的详细时间安排..."
              maxlength="1000"
              show-word-limit
              resize="vertical"
            />
            <div class="form-tip">📅 清晰的议程安排让家长更有参与信心</div>
          </el-form-item>

          <div class="form-row">
            <el-form-item label="需要审批" class="half-width">
              <el-switch
                v-model="activityForm.needsApproval"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>

            <el-form-item label="活动状态" prop="status" class="half-width">
              <el-select v-model="activityForm.status" placeholder="请选择活动状态">
                <el-option
                  v-for="option in activityStatusOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="activityForm.remark"
              type="textarea"
              :rows="2"
              placeholder="其他需要说明的信息..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 第二步：海报设计 -->
      <div v-show="currentStep === 1" class="step-panel">
        <div class="step-header">
          <h3>🎨 海报设计</h3>
          <p>选择合适的海报模板，并根据活动信息进行个性化设计</p>

          <!-- 步骤进度提示 -->
          <div class="step-progress-tip">
            <el-alert
              title="第2步：设计活动海报"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>✅ 选择喜欢的海报模板，AI将自动生成包含活动信息的海报</p>
                <p>🎨 可以调整主题色彩、字体样式等个性化设置</p>
                <p>➡️ 海报生成完成后，点击"下一步"进入营销配置</p>
              </template>
            </el-alert>
          </div>
        </div>

        <div class="poster-design-section">
          <!-- 海报模板选择 -->
          <div class="template-selection">
            <h4>选择海报模板</h4>
            <div class="template-grid">
              <div
                v-for="template in posterTemplates"
                :key="template.id"
                :class="['template-item', { active: selectedTemplate?.id === template.id }]"
                @click="selectTemplate(template)"
              >
                <img :src="template.preview" :alt="template.name" />
                <div class="template-info">
                  <span class="template-name">{{ template.name }}</span>
                  <span class="template-type">{{ template.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 海报预览和编辑 -->
          <div class="poster-preview" v-if="selectedTemplate">
            <h4>海报预览</h4>
            <div class="preview-container">
              <div class="poster-canvas">
                <img v-if="posterPreviewUrl" :src="posterPreviewUrl" alt="海报预览" />
                <div v-else class="preview-placeholder">
                  <UnifiedIcon name="default" />
                  <p>选择模板后将显示预览</p>
                </div>
              </div>

              <div class="poster-actions">
                <el-button @click="generatePoster" :loading="generatingPoster" type="primary">
                  <UnifiedIcon name="Refresh" />
                  生成海报
                </el-button>
                <el-button @click="editPoster" :disabled="!posterPreviewUrl">
                  <UnifiedIcon name="Edit" />
                  编辑海报
                </el-button>
                <el-button @click="editPosterInDialog" :disabled="!posterPreviewUrl">
                  <UnifiedIcon name="Edit" />
                  快速编辑
                </el-button>
                <el-button @click="downloadPoster" :disabled="!posterPreviewUrl">
                  <UnifiedIcon name="Download" />
                  下载海报
                </el-button>
              </div>
            </div>
          </div>

          <!-- 海报自定义选项 -->
          <div class="poster-customization" v-if="selectedTemplate">
            <h4>个性化设置</h4>
            <el-form label-width="100px">
              <el-form-item label="主题色彩">
                <el-color-picker v-model="posterConfig.primaryColor" />
              </el-form-item>
              <el-form-item label="字体样式">
                <el-select v-model="posterConfig.fontFamily">
                  <el-option label="默认字体" value="default" />
                  <el-option label="可爱字体" value="cute" />
                  <el-option label="正式字体" value="formal" />
                </el-select>
              </el-form-item>
              <el-form-item label="背景图片">
                <el-upload
                  class="background-uploader"
                  action="#"
                  :http-request="uploadBackground"
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                >
                  <el-button>
                    <UnifiedIcon name="Upload" />
                    上传背景
                  </el-button>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 第三步：营销配置 -->
      <div v-show="currentStep === 2" class="step-panel">
        <div class="step-header">
          <h3>🛒 营销配置</h3>
          <p>设置团购、积攒、优惠券等营销策略，提高活动参与度和转化率</p>

          <!-- 步骤进度提示 -->
          <div class="step-progress-tip">
            <el-alert
              title="第3步：配置营销策略"
              type="warning"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>🛒 可选择启用团购、积攒、优惠券、推荐奖励等营销功能</p>
                <p>💰 营销策略将帮助提高活动报名转化率和传播效果</p>
                <p>➡️ 配置完成后，点击"下一步"进入预览发布阶段</p>
              </template>
            </el-alert>
          </div>
        </div>

        <div class="marketing-config">
          <el-tabs v-model="activeMarketingTab" type="card">
            <!-- 团购设置 -->
            <el-tab-pane label="团购活动" name="group">
              <div class="marketing-panel">
                <el-switch
                  v-model="marketingConfig.groupBuy.enabled"
                  active-text="启用团购"
                  inactive-text="关闭团购"
                />

                <div v-if="marketingConfig.groupBuy.enabled" class="config-content">
                  <el-form label-width="120px">
                    <el-form-item label="团购人数">
                      <el-input-number
                        v-model="marketingConfig.groupBuy.minPeople"
                        :min="2"
                        :max="50"
                        placeholder="最少团购人数"
                      />
                      <span class="form-tip">满{{ marketingConfig.groupBuy.minPeople }}人即可享受团购价</span>
                    </el-form-item>

                    <el-form-item label="团购价格">
                      <el-input-number
                        v-model="marketingConfig.groupBuy.price"
                        :min="0"
                        :precision="2"
                        placeholder="团购优惠价格"
                      />
                      <span class="form-tip">原价：¥{{ activityForm.fee }}，团购价：¥{{ marketingConfig.groupBuy.price }}</span>
                    </el-form-item>

                    <el-form-item label="团购时限">
                      <el-date-picker
                        v-model="marketingConfig.groupBuy.deadline"
                        type="datetime"
                        placeholder="团购截止时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>

            <!-- 积攒设置 -->
            <el-tab-pane label="积攒活动" name="collect">
              <div class="marketing-panel">
                <el-switch
                  v-model="marketingConfig.collect.enabled"
                  active-text="启用积攒"
                  inactive-text="关闭积攒"
                />

                <div v-if="marketingConfig.collect.enabled" class="config-content">
                  <el-form label-width="120px">
                    <el-form-item label="积攒目标">
                      <el-input-number
                        v-model="marketingConfig.collect.target"
                        :min="10"
                        :max="1000"
                        placeholder="积攒目标人数"
                      />
                      <span class="form-tip">需要{{ marketingConfig.collect.target }}人积攒才能享受优惠</span>
                    </el-form-item>

                    <el-form-item label="积攒奖励">
                      <el-radio-group v-model="marketingConfig.collect.rewardType">
                        <el-radio label="discount">折扣优惠</el-radio>
                        <el-radio label="gift">赠送礼品</el-radio>
                        <el-radio label="free">免费参与</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="marketingConfig.collect.rewardType === 'discount'" label="折扣比例">
                      <el-slider
                        v-model="marketingConfig.collect.discountPercent"
                        :min="10"
                        :max="90"
                        show-stops
                        :step="10"
                      />
                      <span class="form-tip">{{ marketingConfig.collect.discountPercent }}折优惠</span>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>

            <!-- 优惠券设置 -->
            <el-tab-pane label="优惠券" name="coupon">
              <div class="marketing-panel">
                <el-switch
                  v-model="marketingConfig.coupon.enabled"
                  active-text="发放优惠券"
                  inactive-text="不发放优惠券"
                />

                <div v-if="marketingConfig.coupon.enabled" class="config-content">
                  <el-form label-width="120px">
                    <el-form-item label="优惠券类型">
                      <el-select v-model="marketingConfig.coupon.type">
                        <el-option label="满减券" value="reduce" />
                        <el-option label="折扣券" value="discount" />
                        <el-option label="免费券" value="free" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="发放数量">
                      <el-input-number
                        v-model="marketingConfig.coupon.quantity"
                        :min="1"
                        :max="1000"
                        placeholder="优惠券发放数量"
                      />
                    </el-form-item>

                    <el-form-item label="使用条件">
                      <el-input
                        v-model="marketingConfig.coupon.condition"
                        placeholder="如：满100元可用"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>

            <!-- 分销推广 -->
            <el-tab-pane label="分销推广" name="referral">
              <div class="marketing-panel">
                <el-switch
                  v-model="marketingConfig.referral.enabled"
                  active-text="启用分销"
                  inactive-text="关闭分销"
                />

                <div v-if="marketingConfig.referral.enabled" class="config-content">
                  <el-form label-width="120px">
                    <el-form-item label="推荐奖励">
                      <el-input-number
                        v-model="marketingConfig.referral.reward"
                        :min="0"
                        :precision="2"
                        placeholder="推荐成功奖励金额"
                      />
                      <span class="form-tip">每成功推荐一人奖励¥{{ marketingConfig.referral.reward }}</span>
                    </el-form-item>

                    <el-form-item label="推荐上限">
                      <el-input-number
                        v-model="marketingConfig.referral.maxRewards"
                        :min="1"
                        :max="100"
                        placeholder="单人最多获得奖励次数"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 第四步：预览发布 -->
      <div v-show="currentStep === 3" class="step-panel">
        <div class="step-header">
          <h3>👀 预览发布</h3>
          <p>最后检查活动信息，预览效果并选择发布渠道</p>

          <!-- 步骤进度提示 -->
          <div class="step-progress-tip">
            <el-alert
              title="第4步：预览并发布活动"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>👀 请仔细检查活动信息、海报效果和营销策略</p>
                <p>📱 选择合适的发布渠道（微信群、朋友圈、小红书等）</p>
                <p>🚀 确认无误后，点击"创建并发布活动"完成创建</p>
              </template>
            </el-alert>
          </div>
        </div>

        <div class="preview-publish">
          <!-- 活动信息预览 -->
          <div class="activity-preview">
            <h4>活动信息预览</h4>
            <div class="preview-card">
              <div class="preview-poster">
                <img v-if="posterPreviewUrl" :src="posterPreviewUrl" alt="活动海报" />
                <div v-else class="no-poster">暂无海报</div>
              </div>
              <div class="preview-info">
                <h5>{{ activityForm.title || '活动标题' }}</h5>
                <p><UnifiedIcon name="default" /> {{ formatTimeRange }}</p>
                <p><UnifiedIcon name="default" /> {{ activityForm.location || '活动地点' }}</p>
                <p><UnifiedIcon name="default" /> 限{{ activityForm.capacity || 0 }}人</p>
                <p><UnifiedIcon name="default" /> {{ activityForm.fee ? `¥${activityForm.fee}` : '免费' }}</p>
              </div>
            </div>
          </div>

          <!-- 营销策略预览 -->
          <div class="marketing-preview" v-if="hasMarketingConfig">
            <h4>营销策略</h4>
            <div class="marketing-tags">
              <el-tag v-if="marketingConfig.groupBuy.enabled" type="success">
                {{ marketingConfig.groupBuy.minPeople }}人团购 ¥{{ marketingConfig.groupBuy.price }}
              </el-tag>
              <el-tag v-if="marketingConfig.collect.enabled" type="warning">
                {{ marketingConfig.collect.target }}人积攒享优惠
              </el-tag>
              <el-tag v-if="marketingConfig.coupon.enabled" type="info">
                限量{{ marketingConfig.coupon.quantity }}张优惠券
              </el-tag>
              <el-tag v-if="marketingConfig.referral.enabled" type="danger">
                推荐奖励 ¥{{ marketingConfig.referral.reward }}
              </el-tag>
            </div>
          </div>

          <!-- 发布渠道选择 -->
          <div class="publish-channels">
            <h4>发布渠道</h4>
            <el-checkbox-group v-model="selectedChannels">
              <el-checkbox label="wechat">微信群</el-checkbox>
              <el-checkbox label="moments">朋友圈</el-checkbox>
              <el-checkbox label="xiaohongshu">小红书</el-checkbox>
              <el-checkbox label="website">官网</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤操作按钮 -->
    <div class="step-actions">
      <!-- 步骤完成状态提示 -->
      <div class="step-completion-status" v-if="currentStep < 3">
        <el-alert
          :title="getStepCompletionMessage()"
          :type="getStepCompletionType()"
          :closable="false"
          show-icon
          class="completion-alert"
        />
      </div>

      <div class="action-buttons">
        <el-button v-if="currentStep > 0" @click="prevStep" size="large">
          <UnifiedIcon name="ArrowLeft" />
          上一步
        </el-button>

        <el-button
          v-if="currentStep < 3"
          type="primary"
          @click="nextStep"
          size="large"
          :disabled="!canProceedToNext()"
        >
          {{ getNextStepButtonText() }}
          <UnifiedIcon name="ArrowRight" />
        </el-button>

        <el-button
          v-if="currentStep === 3"
          type="success"
          @click="submitForm"
          :loading="submitting"
          size="large"
        >
          <UnifiedIcon name="Check" />
          {{ isEdit ? '保存修改' : '创建并发布活动' }}
        </el-button>

        <el-button @click="goBack" size="large">取消</el-button>
      </div>
    </div>

    <!-- AI策划对话框 -->
    <el-dialog
      v-model="aiPlanningDialog.visible"
      title="🤖 AI智能策划助手"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="ai-planning-content">
        <div class="ai-intro">
          <p>AI助手将根据您的需求，智能生成完整的活动策划方案。请填写以下必要信息：</p>
        </div>

        <el-form
          ref="aiPlanningFormRef"
          :model="aiPlanningForm"
          :rules="aiPlanningRules"
          label-width="120px"
        >
          <el-form-item label="活动主题" prop="theme" required>
            <el-input
              v-model="aiPlanningForm.theme"
              placeholder="例如：春季亲子运动会、科学探索日、艺术创作节"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="目标年龄" prop="targetAge" required>
            <el-select v-model="aiPlanningForm.targetAge" placeholder="请选择目标年龄段">
              <el-option label="2-3岁（小班）" value="2-3岁" />
              <el-option label="3-4岁（中班）" value="3-4岁" />
              <el-option label="4-5岁（大班）" value="4-5岁" />
              <el-option label="5-6岁（学前班）" value="5-6岁" />
              <el-option label="混合年龄" value="混合年龄" />
            </el-select>
          </el-form-item>

          <el-form-item label="活动类型" prop="activityType" required>
            <el-select v-model="aiPlanningForm.activityType" placeholder="请选择活动类型">
              <el-option label="户外活动" value="户外活动" />
              <el-option label="室内活动" value="室内活动" />
              <el-option label="教育活动" value="教育活动" />
              <el-option label="娱乐活动" value="娱乐活动" />
              <el-option label="体育活动" value="体育活动" />
              <el-option label="艺术活动" value="艺术活动" />
              <el-option label="科学活动" value="科学活动" />
              <el-option label="节日庆典" value="节日庆典" />
            </el-select>
          </el-form-item>

          <el-form-item label="预期人数" prop="expectedParticipants" required>
            <el-input-number
              v-model="aiPlanningForm.expectedParticipants"
              :min="10"
              :max="200"
              placeholder="预期参与人数"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="活动时长" prop="duration" required>
            <el-select v-model="aiPlanningForm.duration" placeholder="请选择活动时长">
              <el-option label="1小时" value="60" />
              <el-option label="1.5小时" value="90" />
              <el-option label="2小时" value="120" />
              <el-option label="2.5小时" value="150" />
              <el-option label="3小时" value="180" />
              <el-option label="半天（4小时）" value="240" />
              <el-option label="全天（6-8小时）" value="480" />
            </el-select>
          </el-form-item>

          <el-form-item label="特殊要求" prop="specialRequirements">
            <el-input
              v-model="aiPlanningForm.specialRequirements"
              type="textarea"
              :rows="3"
              placeholder="例如：需要家长参与、注重安全性、预算控制在500元以内等"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="aiPlanningDialog.visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="startAIPlanning"
            :loading="aiPlanningLoading"
          >
            <UnifiedIcon name="default" />
            开始AI策划
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 海报编辑弹窗 -->
    <el-dialog
      v-model="posterEditDialog.visible"
      title="海报编辑器"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="poster-edit-dialog"
    >
      <div class="poster-editor-container">
        <iframe
          v-if="posterEditDialog.editorUrl"
          :src="posterEditDialog.editorUrl"
          class="poster-editor-iframe"
          frameborder="0"
        ></iframe>
        <div v-else class="loading-container">
          <UnifiedIcon name="default" />
          <p>正在加载海报编辑器...</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePosterEditDialog">关闭</el-button>
          <el-button type="primary" @click="savePosterEdit">保存并应用</el-button>
        </div>
      </template>
    </el-dialog>
    </template>

    <!-- AI帮助按钮 -->
    <!-- <PageHelpButton :help-content="activityCreateHelp" /> -->
  </UnifiedCenterLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  Plus, Picture, Refresh, Edit, Download, Upload, Clock,
  Location, User, Money, Star, Loading
} from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { autoImageApi } from '@/api/auto-image'

// 活动状态枚举（与后端对齐）
enum ActivityStatus {
  PLANNED = 0,        // 计划中
  REGISTRATION_OPEN = 1,  // 报名开放
  FULL = 2,           // 名额已满
  IN_PROGRESS = 3,    // 进行中
  FINISHED = 4,       // 已结束
  CANCELLED = 5       // 已取消
}

// 活动类型枚举（与后端对齐）
enum ActivityType {
  OUTDOOR = 1,        // 户外活动
  INDOOR = 2,         // 室内活动
  EDUCATIONAL = 3,    // 教育活动
  ENTERTAINMENT = 4,  // 娱乐活动
  SPORTS = 5,         // 体育活动
  ART = 6             // 艺术活动
}

// 活动表单接口（与后端API对齐）
interface ActivityForm {
  title: string;
  description: string;
  activityType: ActivityType;
  status: ActivityStatus;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  fee?: number;
  agenda?: string;
  registrationStartTime: string;
  registrationEndTime: string;
  needsApproval?: boolean;
  coverImage?: string;
  remark?: string;
  planId?: number; // 关联的招生计划ID
}

// 导入API模块和错误处理
import { get, post, put } from '@/utils/request'
import { ACTIVITY_ENDPOINTS, ACTIVITY_TEMPLATE_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 创建活动
const createActivity = async (data: ActivityForm): Promise<{ success: boolean, activityId?: string, message?: string }> => {
  try {
    const res = await post(ACTIVITY_ENDPOINTS.BASE, data)
    
    if (res.success) {
      return {
        success: true,
        activityId: res.data?.id?.toString(),
        message: res.message || '活动计划创建成功'
      }
    } else {
      const errorInfo = ErrorHandler.handle(new Error(res.message || '创建活动失败'), false)
      return {
        success: false,
        message: errorInfo.message
      }
    }
  } catch (error: any) {
    const errorInfo = ErrorHandler.handle(error, false)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

// 获取活动详情
const getActivityDetail = async (id: string): Promise<{ success: boolean, data?: ActivityForm, message?: string }> => {
  try {
    const res = await get(`${ACTIVITY_ENDPOINTS.BASE}/${id}`)
    
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data
      }
    } else {
      const errorInfo = ErrorHandler.handle(new Error(res.message || '获取活动详情失败'), false)
      return {
        success: false,
        message: errorInfo.message
      }
    }
  } catch (error: any) {
    const errorInfo = ErrorHandler.handle(error, false)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

// 更新活动
const updateActivity = async (id: string, data: ActivityForm): Promise<{ success: boolean, message?: string }> => {
  try {
    const res = await put(`${ACTIVITY_ENDPOINTS.BASE}/${id}`, data)
    
    if (res.success) {
      return {
        success: true,
        message: res.message || '活动更新成功'
      }
    } else {
      const errorInfo = ErrorHandler.handle(new Error(res.message || '更新活动失败'), false)
      return {
        success: false,
        message: errorInfo.message
      }
    }
  } catch (error: any) {
    const errorInfo = ErrorHandler.handle(error, false)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

export default defineComponent({
  name: 'ActivityCreate',
  components: {
    Plus, Picture, Refresh, Edit, Download, Upload, Clock, Location, User, Money, Star, Loading
  },
  props: {
    id: {
      type: [String, Number],
  default: ''
    },
    isEdit: {
      type: Boolean,
  default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const timeRange = ref<string[]>([])
    const loading = ref(false)
    const submitting = ref(false)

    // 步骤控制
    const currentStep = ref(0)

    // AI帮助内容 (已注释，暂不使用)
    /* const activityCreateHelp = {
      title: '活动创建使用指南',
      description: '通过4个步骤完成活动创建：基本信息、海报设计、营销配置、预览发布。支持AI智能策划，一键生成活动方案。',
      features: [
        '4步骤向导式创建流程',
        'AI智能策划活动方案',
        '海报模板选择和自定义设计',
        '营销配置（团购、积攒、优惠券）',
        '实时预览和一键发布'
      ],
      steps: [
        '步骤1：填写活动基本信息（标题、时间、地点等）',
        '步骤2：选择海报模板或AI生成海报',
        '步骤3：配置营销策略（可选）',
        '步骤4：预览效果并发布活动'
      ],
      tips: [
        '点击"AI智能策划"可自动生成活动方案',
        '海报会自动包含幼儿园基础信息',
        '营销配置可以提高活动参与度',
        '发布前建议先预览效果'
      ]
    } */

    // 海报相关
    const selectedTemplate = ref<any>(null)
    const posterPreviewUrl = ref('')
    const generatingPoster = ref(false)

    // 海报编辑弹窗
    const posterEditDialog = reactive({
      visible: false,
      editorUrl: ''
    })
    const posterConfig = reactive({
      primaryColor: 'var(--primary-color)',
      fontFamily: 'default',
      backgroundImage: ''
    })

    // 营销配置
    const activeMarketingTab = ref('group')
    const marketingConfig = reactive({
      groupBuy: {
        enabled: false,
        minPeople: 3,
        price: 0,
        deadline: ''
      },
      collect: {
        enabled: false,
        target: 50,
        rewardType: 'discount',
        discountPercent: 80
      },
      coupon: {
        enabled: false,
        type: 'reduce',
        quantity: 100,
        condition: ''
      },
      referral: {
        enabled: false,
        reward: 10,
        maxRewards: 5
      }
    })

    // 发布渠道
    const selectedChannels = ref(['wechat', 'website'])

    // AI策划相关
    const aiPlanningDialog = reactive({
      visible: false
    })

    const aiPlanningLoading = ref(false)
    const aiPlanningFormRef = ref<FormInstance>()

    const aiPlanningForm = reactive({
      theme: '',
      targetAge: '',
      activityType: '',
      expectedParticipants: 30,
      duration: '120',
      specialRequirements: ''
    })

    const aiPlanningRules = reactive<FormRules>({
      theme: [
        { required: true, message: '请输入活动主题', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      targetAge: [
        { required: true, message: '请选择目标年龄', trigger: 'change' }
      ],
      activityType: [
        { required: true, message: '请选择活动类型', trigger: 'change' }
      ],
      expectedParticipants: [
        { required: true, message: '请输入预期人数', trigger: 'blur' }
      ],
      duration: [
        { required: true, message: '请选择活动时长', trigger: 'change' }
      ]
    })

    // 页面感知功能
    const pageAwareness = reactive({
      isActive: false,
      message: '',
      suggestions: [] as string[],
      lastTriggeredField: '', // 记录最后触发的字段
      lastTriggeredTime: 0    // 记录最后触发的时间
    })

    // AI填表动画
    const aiFillingAnimation = reactive({
      isActive: false,
      currentAction: '',
      progress: 0
    })

    // 海报模板数据（使用在线占位图服务避免404错误）
    const posterTemplates = ref([
      {
        id: 1,
        name: '清新自然',
        category: '教育活动',
        preview: 'https://placehold.co/600x400/e8f5e8/ffffff/666666?text=清新自然'
      },
      {
        id: 2,
        name: '活力运动',
        category: '体育活动',
        preview: 'https://placehold.co/600x400/fceeb3/ffffff/666666?text=活力运动'
      },
      {
        id: 3,
        name: '艺术创意',
        category: '艺术活动',
        preview: 'https://placehold.co/600x400/f39c12/ffffff/666666?text=艺术创意'
      },
      {
        id: 4,
        name: '节日庆典',
        category: '节日活动',
        preview: 'https://placehold.co/600x400/e91e63/ffffff/666666?text=节日庆典'
      }
    ])
    
    // 检查是否处于编辑模式
    const isEditMode = computed(() => props.isEdit || (route.path && route.path.includes('/edit/')))
    const activityId = computed(() => props.id || route.params.id as string)

    // 计算属性
    const formatTimeRange = computed(() => {
      if (timeRange.value && timeRange.value.length === 2) {
        return `${timeRange.value[0]} 至 ${timeRange.value[1]}`
      }
      return '请选择活动时间'
    })

    const hasMarketingConfig = computed(() => {
      return marketingConfig.groupBuy.enabled ||
             marketingConfig.collect.enabled ||
             marketingConfig.coupon.enabled ||
             marketingConfig.referral.enabled
    })
    
    // 活动表单数据
    const activityForm = reactive<ActivityForm>({
      title: '',
      description: '',
      activityType: ActivityType.EDUCATIONAL,
      status: ActivityStatus.PLANNED,
      startTime: '',
      endTime: '',
      location: '',
      capacity: 0,
      fee: 0,
      agenda: '',
      registrationStartTime: '',
      registrationEndTime: '',
      needsApproval: false,
      coverImage: '',
      remark: '',
      planId: undefined // 关联的招生计划ID
    })

    // 招生计划数据
    const enrollmentPlans = ref<any[]>([])
    const loadingPlans = ref(false)
    
    // 活动类型选项
    const activityTypeOptions = [
      { label: '户外活动', value: ActivityType.OUTDOOR },
      { label: '室内活动', value: ActivityType.INDOOR },
      { label: '教育活动', value: ActivityType.EDUCATIONAL },
      { label: '娱乐活动', value: ActivityType.ENTERTAINMENT },
      { label: '体育活动', value: ActivityType.SPORTS },
      { label: '艺术活动', value: ActivityType.ART }
    ]
    
    // 活动状态选项
    const activityStatusOptions = [
      { label: '计划中', value: ActivityStatus.PLANNED },
      { label: '报名开放', value: ActivityStatus.REGISTRATION_OPEN },
      { label: '名额已满', value: ActivityStatus.FULL },
      { label: '进行中', value: ActivityStatus.IN_PROGRESS },
      { label: '已结束', value: ActivityStatus.FINISHED },
      { label: '已取消', value: ActivityStatus.CANCELLED }
    ]
    
    // 表单校验规则
    const formRules = reactive<FormRules>({
      title: [
        { required: true, message: '请输入活动标题', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      timeRange: [
        {
          required: true,
          message: '请选择活动时间',
          trigger: 'change',
          validator: (_rule: any, _value: any, callback: any) => {
            if (!timeRange.value || timeRange.value.length !== 2) {
              callback(new Error('请选择活动时间'))
            } else {
              callback()
            }
          }
        }
      ],
      description: [
        { required: true, message: '请输入活动描述', trigger: 'blur' }
      ],
      activityType: [
        { required: true, message: '请选择活动类型', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择活动状态', trigger: 'change' }
      ],
      capacity: [
        { required: true, message: '请输入参与人数', trigger: 'blur' },
        { type: 'number', min: 1, message: '参与人数必须大于0', trigger: 'blur' }
      ],
      location: [
        { required: true, message: '请输入活动地点', trigger: 'blur' }
      ],
      fee: [
        { type: 'number', min: 0, message: '费用不能为负数', trigger: 'blur' }
      ]
    })
    
    // 监听时间范围变化
    const handleTimeRangeChange = (val: string[]) => {
      if (val && val.length === 2) {
        activityForm.startTime = val[0]
        activityForm.endTime = val[1]
        // 默认设置报名时间为活动开始前一周到活动开始
        const startDate = new Date(val[0])
        const registrationStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        activityForm.registrationStartTime = registrationStart.toISOString().slice(0, 19).replace('T', ' ')
        activityForm.registrationEndTime = val[0]
      } else {
        activityForm.startTime = ''
        activityForm.endTime = ''
        activityForm.registrationStartTime = ''
        activityForm.registrationEndTime = ''
      }
      // 触发表单验证
      nextTick(() => {
        formRef.value?.validateField('timeRange')
      })
    }
    
    // 图片上传前校验
    const beforeImageUpload = (file: File) => {
      const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        ElMessage.error('上传图片只能是 JPG/PNG/GIF/WebP 格式!');
        return false;
      }
      
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!');
        return false;
      }
      
      return true;
    };

    // 步骤控制方法
    const nextStep = async () => {
      // 验证当前步骤
      if (currentStep.value === 0) {
        // 验证基本信息
        if (!formRef.value) return
        const valid = await formRef.value.validate().catch(() => false)
        if (!valid) {
          ElMessage.error('请正确填写基本信息')
          return
        }
      }

      if (currentStep.value < 3) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    // 检查是否可以进入下一步
    const canProceedToNext = () => {
      switch (currentStep.value) {
        case 0:
          // 基本信息步骤：检查必填字段
          return activityForm.title && activityForm.startTime && activityForm.endTime && activityForm.location
        case 1:
          // 海报设计步骤：可选，允许跳过
          return true
        case 2:
          // 营销配置步骤：可选，允许跳过
          return true
        default:
          return true
      }
    }

    // 获取下一步按钮文本
    const getNextStepButtonText = () => {
      switch (currentStep.value) {
        case 0:
          return canProceedToNext() ? '进入海报设计' : '请完善基本信息'
        case 1:
          return '进入营销配置'
        case 2:
          return '预览并发布'
        default:
          return '下一步'
      }
    }

    // 获取步骤完成状态消息
    const getStepCompletionMessage = () => {
      switch (currentStep.value) {
        case 0:
          if (canProceedToNext()) {
            return '✅ 基本信息已完善，可以进入下一步'
          } else {
            return '⚠️ 请完善活动标题、时间和地点等必填信息'
          }
        case 1:
          return posterPreviewUrl.value ? '✅ 海报已生成，可以进入下一步' : '💡 选择模板生成海报，或直接进入下一步'
        case 2:
          const hasMarketing = Object.values(marketingConfig).some((config: any) => config.enabled)
          return hasMarketing ? '✅ 营销策略已配置，可以进入预览' : '💡 可选择配置营销策略，或直接进入预览'
        default:
          return ''
      }
    }

    // 获取步骤完成状态类型
    const getStepCompletionType = () => {
      switch (currentStep.value) {
        case 0:
          return canProceedToNext() ? 'success' : 'warning'
        case 1:
          return posterPreviewUrl.value ? 'success' : 'info'
        case 2:
          const hasMarketing = Object.values(marketingConfig).some((config: any) => config.enabled)
          return hasMarketing ? 'success' : 'info'
        default:
          return 'info'
      }
    }

    // 海报相关方法
    const selectTemplate = (template: any) => {
      selectedTemplate.value = template
      // 自动生成海报预览
      generatePoster()
    }

    const generatePoster = async () => {
      if (!selectedTemplate.value) {
        ElMessage.warning('请先选择海报模板')
        return
      }

      generatingPoster.value = true
      try {
        // 构建海报描述文本
        const posterTitle = activityForm.title || '活动海报'
        let posterContent = `${activityForm.title || '精彩活动'}`

        if (activityForm.description) {
          posterContent += `：${activityForm.description}`
        }

        if (activityForm.location) {
          posterContent += `，地点：${activityForm.location}`
        }

        if (activityForm.startTime) {
          const startDate = new Date(activityForm.startTime)
          posterContent += `，时间：${startDate.toLocaleDateString()}`
        }

        if (activityForm.capacity) {
          posterContent += `，限${activityForm.capacity}人`
        }

        if (activityForm.fee !== undefined && activityForm.fee !== null) {
          posterContent += `，费用：${activityForm.fee === 0 ? '免费' : `${activityForm.fee}元`}`
        }

        console.log('🎨 开始生成海报...', { posterTitle, posterContent })

        // 调用AI文生图接口生成海报
        const response = await autoImageApi.generatePosterImage({
          posterTitle,
          posterContent
        })

        console.log('🎨 海报生成响应:', response)

        if (response.success && response.data && response.data.imageUrl) {
          posterPreviewUrl.value = response.data.imageUrl
          console.log('✅ 海报生成成功，URL:', posterPreviewUrl.value)
          ElMessage.success('海报生成成功！AI已为您创建了精美的活动海报')
        } else {
          console.error('❌ 海报生成失败:', response)
          ElMessage.error(response.message || '海报生成失败，请重试')
        }
      } catch (error) {
        console.error('❌ 生成海报失败:', error)
        ElMessage.error('海报生成失败，请检查网络连接后重试')
      } finally {
        generatingPoster.value = false
      }
    }

    const editPoster = () => {
      if (!posterPreviewUrl.value) {
        ElMessage.warning('请先生成海报')
        return
      }

      // 构建海报编辑器的参数
      const editorParams: Record<string, string> = {
        activityTitle: activityForm.title || '活动海报',
        activityDescription: activityForm.description || '',
        activityLocation: activityForm.location || '',
        activityStartTime: activityForm.startTime || '',
        activityEndTime: activityForm.endTime || '',
        activityCapacity: String(activityForm.capacity || 0),
        activityFee: String(activityForm.fee || 0),
        posterUrl: posterPreviewUrl.value,
        mode: 'edit'
      }

      // 打开海报编辑器页面
      const editorUrl = `/principal/poster-editor?${new URLSearchParams(editorParams).toString()}`

      // 在新窗口中打开海报编辑器
      const editorWindow = window.open(editorUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes')

      if (editorWindow) {
        ElMessage.success('正在打开海报编辑器...')

        // 监听编辑器窗口关闭事件，可以在这里处理编辑完成后的逻辑
        const checkClosed = setInterval(() => {
          if (editorWindow.closed) {
            clearInterval(checkClosed)
            console.log('海报编辑器已关闭')
            // 这里可以添加刷新海报预览的逻辑
          }
        }, 1000)
      } else {
        ElMessage.error('无法打开海报编辑器，请检查浏览器弹窗设置')
      }
    }

    // 在弹窗中编辑海报
    const editPosterInDialog = () => {
      if (!posterPreviewUrl.value) {
        ElMessage.warning('请先生成海报')
        return
      }

      // 构建海报编辑器的参数
      const editorParams: Record<string, string> = {
        activityTitle: activityForm.title || '活动海报',
        activityDescription: activityForm.description || '',
        activityLocation: activityForm.location || '',
        activityStartTime: activityForm.startTime || '',
        activityEndTime: activityForm.endTime || '',
        activityCapacity: String(activityForm.capacity || 0),
        activityFee: String(activityForm.fee || 0),
        posterUrl: posterPreviewUrl.value,
        mode: 'edit',
        embedded: 'true'
      }

      // 构建编辑器URL
      posterEditDialog.editorUrl = `/principal/poster-editor?${new URLSearchParams(editorParams).toString()}`
      posterEditDialog.visible = true

      ElMessage.success('正在加载海报编辑器...')
    }

    // 关闭海报编辑弹窗
    const closePosterEditDialog = () => {
      posterEditDialog.visible = false
      posterEditDialog.editorUrl = ''
    }

    // 保存海报编辑
    const savePosterEdit = () => {
      // 这里可以添加保存逻辑，比如从iframe获取编辑后的海报
      ElMessage.success('海报已保存')
      closePosterEditDialog()
    }

    const downloadPoster = () => {
      if (posterPreviewUrl.value) {
        const link = document.createElement('a')
        link.href = posterPreviewUrl.value
        link.download = `${activityForm.title || '活动'}_海报.jpg`
        link.click()
      }
    }

    const uploadBackground = async (options: any) => {
      const { file } = options
      try {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          if (e.target) {
            posterConfig.backgroundImage = e.target.result as string
            // 重新生成海报
            generatePoster()
          }
        }
      } catch (error) {
        console.error('上传背景失败', error)
        ElMessage.error('上传背景失败，请重试')
      }
    }

    // 图片上传处理
    const uploadImage = async (options: any) => {
      const { file } = options;

      try {
        // 这里应该是调用实际的上传API
        // 这里使用FileReader模拟上传并显示预览
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          if (e.target) {
            activityForm.coverImage = e.target.result as string;
          }
        };

        // 实际应用中，这里会返回服务器上传后的图片URL
        // const response = await uploadService.uploadImage(file);
        // activityForm.imageUrl = response.data.url;
      } catch (error) {
        console.error('上传图片失败', error);
        ElMessage.error('上传图片失败，请重试');
      }
    };
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return

      await formRef.value.validate(async (valid) => {
        if (!valid) {
          ElMessage.error('请正确填写所有必填项')
          currentStep.value = 0 // 回到第一步
          return
        }

        submitting.value = true
        try {
          // 准备提交数据，包含营销配置
          const submitData = {
            ...activityForm,
            kindergartenId: 1, // 默认幼儿园ID
            // 确保报名时间字段存在
            registrationStartTime: activityForm.registrationStartTime || activityForm.startTime || new Date().toISOString(),
            registrationEndTime: activityForm.registrationEndTime || activityForm.startTime || new Date().toISOString(),
            marketingConfig: marketingConfig,
            posterConfig: posterConfig,
            posterUrl: posterPreviewUrl.value || null,
            selectedTemplate: selectedTemplate.value?.id,
            publishChannels: selectedChannels.value
          }

          let result

          if (isEditMode.value) {
            // 编辑模式 - 更新活动
            result = await updateActivity(activityId.value as string, submitData)
            if (result.success) {
              ElMessage.success(result.message || '活动更新成功')

              // 如果有海报，发布到选定渠道
              if (posterPreviewUrl.value && selectedChannels.value.length > 0) {
                await publishToChannels()
              }

              router.push('/centers/activity')
            } else {
              ElMessage.error(result.message || '更新失败')
            }
          } else {
            // 创建模式 - 创建新活动
            result = await createActivity(submitData)
            if (result.success) {
              ElMessage.success(result.message || '活动创建成功')

              // 如果有海报，发布到选定渠道
              if (posterPreviewUrl.value && selectedChannels.value.length > 0) {
                await publishToChannels(result.activityId)
              }

              router.push('/centers/activity')
            } else {
              ElMessage.error(result.message || '创建失败')
            }
          }
        } catch (error) {
          const errorInfo = ErrorHandler.handle(error)
          ElMessage.error(errorInfo.message)
        } finally {
          submitting.value = false
        }
      })
    }

    // 发布到各个渠道
    const publishToChannels = async (providedActivityId?: string) => {
      try {
        const id = providedActivityId || activityId.value
        // 修复：使用正确的 activity-plans 发布接口
        const response = await post(`/activity-plans/${id}/publish`, {
          publishChannels: selectedChannels.value
        })

        if (response.success) {
          ElMessage.success('活动已发布到选定渠道')
        }
      } catch (error) {
        console.error('发布失败:', error)
        ElMessage.warning('活动创建成功，但发布到渠道时出现问题')
      }
    }
    
    // 重置表单
    const resetForm = () => {
      if (!formRef.value) return
      if (typeof formRef.value.resetFields === 'function') {
        formRef.value.resetFields()
      }
      timeRange.value = []
      activityForm.coverImage = ''
    }
    
    // 取消创建
    const goBack = () => {
      ElMessageBox.confirm(
        '确定要取消创建吗？所有已填写的内容将丢失',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
  type: 'warning'
        }
      ).then(() => {
        router.back()
      }).catch(() => {})
    }
    
    // 获取活动详情
    const fetchActivityDetail = async () => {
      if (!isEditMode.value || !activityId.value) return
      
      loading.value = true
      try {
        const result = await getActivityDetail(activityId.value as string)
        if (result.success && result.data) {
          // 填充表单数据
          const activityDetail = result.data
          Object.assign(activityForm, activityDetail)
          
          // 设置时间范围
          if (activityDetail.startTime && activityDetail.endTime) {
            timeRange.value = [activityDetail.startTime, activityDetail.endTime]
          }
          
          console.log('活动详情加载成功')
        } else {
          ElMessage.error(result.message || '获取活动详情失败')
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error)
        ElMessage.error(errorInfo.message)
      } finally {
        loading.value = false
      }
    }

    // 获取活动模板详情
    const fetchTemplateDetail = async (templateId: string | number) => {
      try {
        loading.value = true
        const response = await get(ACTIVITY_TEMPLATE_ENDPOINTS.GET_BY_ID(templateId))

        if (response.success && response.data) {
          const template = response.data

          // 使用模板数据预填表单
          console.log('🔍 模板详情:', template)

          // 使用模板基本信息填充表单
          if (template.name) {
            activityForm.title = template.name
          }

          if (template.description) {
            activityForm.description = template.description
          }

          // 处理模板数据
          if (template.templateData) {
            const templateData = typeof template.templateData === 'string'
              ? JSON.parse(template.templateData)
              : template.templateData

            console.log('🔍 模板数据:', templateData)

            // 预填基本信息
            if (templateData.title) activityForm.title = templateData.title
            if (templateData.description) activityForm.description = templateData.description
            if (templateData.capacity || templateData.maxParticipants) {
              activityForm.capacity = templateData.capacity || templateData.maxParticipants
            }
            if (templateData.location) activityForm.location = templateData.location
            if (templateData.fee) activityForm.fee = templateData.fee
            if (templateData.agenda) activityForm.agenda = templateData.agenda
            if (templateData.activityType) {
              // 映射活动类型
              const typeMapping: { [key: string]: ActivityType } = {
                'EDUCATIONAL': ActivityType.EDUCATIONAL,
                'SPORTS': ActivityType.SPORTS,
                'ART': ActivityType.ART,
                'INDOOR': ActivityType.INDOOR,
                'OUTDOOR': ActivityType.OUTDOOR,
                'ENTERTAINMENT': ActivityType.ENTERTAINMENT
              }
              activityForm.activityType = typeMapping[templateData.activityType] || ActivityType.EDUCATIONAL
            }

            ElMessage.success(`已加载模板"${template.name}"的数据`)
          } else {
            // 如果没有详细的模板数据，使用基本信息
            ElMessage.success(`已加载模板"${template.name}"`)
          }
        }
      } catch (error) {
        console.error('获取模板详情失败:', error)
        ElMessage.error('加载模板数据失败')
      } finally {
        loading.value = false
      }
    }

    // 加载招生计划列表
    const loadEnrollmentPlans = async () => {
      loadingPlans.value = true
      try {
        // 这里应该调用API获取招生计划列表
        // const response = await getEnrollmentPlans()
        // enrollmentPlans.value = response.data

        // 临时模拟数据，实际应该从API获取
        setTimeout(() => {
          enrollmentPlans.value = [
            {
              id: 1,
              title: '2025年春季招生计划',
              year: 2025,
              semester: 1,
              target_count: 120,
              enrolled_count: 85
            },
            {
              id: 2,
              title: '2025年秋季招生计划',
              year: 2025,
              semester: 2,
              target_count: 150,
              enrolled_count: 0
            },
            {
              id: 6,
              title: '2024年秋季招生计划',
              year: 2024,
              semester: 2,
              target_count: 100,
              enrolled_count: 78
            }
          ]
          loadingPlans.value = false
        }, 500)
      } catch (error) {
        console.error('加载招生计划失败:', error)
        ElMessage.error('加载招生计划失败')
        enrollmentPlans.value = []
        loadingPlans.value = false
      }
    }

    // 显示AI策划对话框
    const showAIPlanningDialog = () => {
      aiPlanningDialog.visible = true
    }

    // 开始AI策划
    const startAIPlanning = async () => {
      if (!aiPlanningFormRef.value) return

      const valid = await aiPlanningFormRef.value.validate().catch(() => false)
      if (!valid) {
        ElMessage.error('请正确填写所有必填项')
        return
      }

      aiPlanningLoading.value = true
      aiPlanningDialog.visible = false

      // 开始AI填表动画
      startAIFillingAnimation()

      try {
        // 模拟AI策划过程
        await simulateAIPlanning()
        ElMessage.success('AI策划完成！已自动填写表单')
      } catch (error) {
        console.error('AI策划失败:', error)
        ElMessage.error('AI策划失败，请重试')
      } finally {
        aiPlanningLoading.value = false
        stopAIFillingAnimation()
      }
    }

    // 模拟AI策划过程
    const simulateAIPlanning = async () => {
      const steps = [
        { action: '🧠 分析活动主题...', duration: 800 },
        { action: '📝 生成活动标题...', duration: 600 },
        { action: '📅 规划活动时间...', duration: 500 },
        { action: '📍 推荐活动地点...', duration: 700 },
        { action: '👥 计算参与人数...', duration: 400 },
        { action: '💰 估算活动费用...', duration: 600 },
        { action: '📋 编写活动描述...', duration: 900 },
        { action: '🎯 制定活动议程...', duration: 800 },
        { action: '✅ 完成策划方案...', duration: 500 }
      ]

      let totalProgress = 0
      const progressStep = 100 / steps.length

      for (const step of steps) {
        aiFillingAnimation.currentAction = step.action
        await new Promise(resolve => setTimeout(resolve, step.duration))
        totalProgress += progressStep
        aiFillingAnimation.progress = Math.min(totalProgress, 100)
      }

      // 填写表单数据
      fillFormWithAIData()

      // 触发表单验证以清除错误提示
      nextTick(() => {
        if (formRef.value) {
          if (typeof formRef.value.clearValidate === 'function') {
            formRef.value.clearValidate()
          }
          if (typeof formRef.value.validate === 'function') {
            formRef.value.validate()
          }
        }
      })
    }

    // 用AI数据填写表单
    const fillFormWithAIData = () => {
      const { theme, targetAge, activityType, expectedParticipants, duration, specialRequirements } = aiPlanningForm

      // 生成活动标题
      activityForm.title = `${theme} - ${targetAge}专场`

      // 设置活动类型
      const typeMapping: { [key: string]: number } = {
        '户外活动': ActivityType.OUTDOOR,
        '室内活动': ActivityType.INDOOR,
        '教育活动': ActivityType.EDUCATIONAL,
        '娱乐活动': ActivityType.ENTERTAINMENT,
        '体育活动': ActivityType.SPORTS,
        '艺术活动': ActivityType.ART,
        '科学活动': ActivityType.EDUCATIONAL,
        '节日庆典': ActivityType.ENTERTAINMENT
      }
      activityForm.activityType = typeMapping[activityType] || ActivityType.EDUCATIONAL

      // 设置参与人数
      activityForm.capacity = expectedParticipants

      // 设置活动费用（根据类型和人数智能估算）
      const baseFee = activityType.includes('户外') ? 50 : 30
      activityForm.fee = Math.round(baseFee + (expectedParticipants > 50 ? 20 : 0))

      // 生成活动描述
      activityForm.description = generateActivityDescription(theme, targetAge, activityType, specialRequirements)

      // 生成活动议程
      activityForm.agenda = generateActivityAgenda(duration, activityType)

      // 设置默认地点
      activityForm.location = activityType.includes('户外') ? '幼儿园户外活动场地' : '幼儿园多功能活动室'

      // 设置默认时间（下周六上午）
      const nextSaturday = new Date()
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7)
      nextSaturday.setHours(9, 0, 0, 0)

      const endTime = new Date(nextSaturday)
      endTime.setMinutes(endTime.getMinutes() + parseInt(duration))

      // 格式化为 YYYY-MM-DD HH:mm:ss 格式
      const formatDateTime = (date: Date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ')
      }

      timeRange.value = [
        formatDateTime(nextSaturday),
        formatDateTime(endTime)
      ]
      handleTimeRangeChange(timeRange.value)
    }

    // 生成活动描述
    const generateActivityDescription = (theme: string, targetAge: string, activityType: string, specialRequirements: string) => {
      const descriptions: Record<string, string> = {
        '户外活动': `本次${theme}将在户外进行，为${targetAge}的孩子们提供亲近自然、锻炼身体的机会。`,
        '室内活动': `本次${theme}在室内举行，为${targetAge}的孩子们创造安全舒适的学习环境。`,
        '教育活动': `通过${theme}，帮助${targetAge}的孩子们在游戏中学习，在体验中成长。`,
        '娱乐活动': `${theme}将为${targetAge}的孩子们带来欢乐时光，促进社交能力发展。`,
        '体育活动': `${theme}旨在提高${targetAge}孩子们的身体素质和运动技能。`,
        '艺术活动': `${theme}将激发${targetAge}孩子们的创造力和艺术天赋。`,
        '科学活动': `通过${theme}，培养${targetAge}孩子们的科学思维和探索精神。`,
        '节日庆典': `${theme}让${targetAge}的孩子们感受节日氛围，传承文化传统。`
      }

      let description = descriptions[activityType] || `精心策划的${theme}活动，适合${targetAge}的孩子参与。`

      if (specialRequirements) {
        description += `\n\n特别安排：${specialRequirements}`
      }

      description += '\n\n活动将确保安全第一，寓教于乐，让每个孩子都能收获满满的快乐和成长。'

      return description
    }

    // 生成活动议程
    const generateActivityAgenda = (duration: string, activityType: string) => {
      const durationMinutes = parseInt(duration)
      const agendas: { [key: string]: string[] } = {
        '户外活动': [
          '09:00-09:15 集合签到，安全说明',
          '09:15-09:45 热身运动，团队游戏',
          '09:45-10:30 主题活动体验',
          '10:30-10:45 休息时间，补充水分',
          '10:45-11:15 自由活动，拍照留念',
          '11:15-11:30 总结分享，颁发奖励'
        ],
        '室内活动': [
          '09:00-09:10 欢迎致辞，活动介绍',
          '09:10-09:30 破冰游戏，互相认识',
          '09:30-10:15 主题活动第一环节',
          '10:15-10:30 休息时间，小食分享',
          '10:30-11:00 主题活动第二环节',
          '11:00-11:30 作品展示，合影留念'
        ],
        '教育活动': [
          '09:00-09:15 开场问候，学习目标介绍',
          '09:15-09:45 知识讲解，互动问答',
          '09:45-10:15 实践操作，小组合作',
          '10:15-10:30 休息时间',
          '10:30-11:00 成果展示，经验分享',
          '11:00-11:30 总结回顾，布置作业'
        ]
      }

      let agenda = agendas[activityType] || agendas['室内活动']

      // 根据时长调整议程
      if (durationMinutes <= 90) {
        agenda = agenda.slice(0, 4)
      } else if (durationMinutes >= 240) {
        agenda.push('12:00-13:00 午餐时间')
        agenda.push('13:00-14:00 午休或自由活动')
        agenda.push('14:00-15:00 下午活动环节')
      }

      return agenda.join('\n')
    }

    // 获取当前季节 (已注释，暂不使用)
    /* const getSeason = () => {
      const month = new Date().getMonth() + 1
      if (month >= 3 && month <= 5) return 'spring'
      if (month >= 6 && month <= 8) return 'summer'
      if (month >= 9 && month <= 11) return 'autumn'
      return 'winter'
    } */

    // 激活页面感知 (已注释,暂不使用)
    /* const activatePageAwareness = () => {
      const currentTime = new Date()
      const hour = currentTime.getHours()
      const season = getSeason()

      pageAwareness.isActive = true

      // 根据时间和季节给出智能提示
      if (hour >= 9 && hour <= 11) {
        pageAwareness.message = '早上好！现在是策划活动的黄金时间，AI助手已准备就绪'
      } else if (hour >= 14 && hour <= 17) {
        pageAwareness.message = '下午好！检测到您正在创建活动，AI助手已准备就绪'
      } else {
        pageAwareness.message = '检测到您正在创建活动，AI助手已准备就绪'
      }

      // 根据季节给出建议
      const seasonalSuggestions = {
        spring: [
          '春季适合户外踏青、植物观察等自然主题活动',
          '可以考虑亲子种植、春游等活动形式',
          '注意春季天气变化，准备雨天备选方案'
        ],
        summer: [
          '夏季可安排水上游戏、户外运动等清凉活动',
          '建议选择早晨或傍晚时段，避免高温',
          '重点关注防晒和补水措施'
        ],
        autumn: [
          '秋季适合收获主题、手工制作等室内外结合活动',
          '可以利用落叶、果实等自然材料',
          '天气宜人，是举办大型活动的好时机'
        ],
        winter: [
          '冬季建议以室内活动为主，注重温暖和安全',
          '可以安排节日庆典、手工制作等活动',
          '如有户外活动，需特别注意保暖措施'
        ]
      }

      pageAwareness.suggestions = [
        '使用AI策划功能可以快速生成完整的活动方案',
        '建议先确定活动主题和目标人群',
        ...seasonalSuggestions[season],
        '注意活动安全性和教育意义的平衡'
      ]

      // 8秒后自动隐藏
      setTimeout(() => {
        pageAwareness.isActive = false
      }, 8000)
    } */

    // 关闭页面感知提示
    const closePageAwareness = () => {
      pageAwareness.isActive = false
      pageAwareness.message = ''
      pageAwareness.suggestions = []
    }

    // 开始AI填表动画
    const startAIFillingAnimation = () => {
      aiFillingAnimation.isActive = true
      aiFillingAnimation.currentAction = '🚀 AI策划启动中...'
      aiFillingAnimation.progress = 0
    }

    // 停止AI填表动画
    const stopAIFillingAnimation = () => {
      setTimeout(() => {
        aiFillingAnimation.isActive = false
        aiFillingAnimation.currentAction = ''
        aiFillingAnimation.progress = 0
      }, 1000)
    }

    // 处理表单字段焦点事件
    const handleFormFieldFocus = (fieldName: string) => {
      const currentTime = Date.now()

      // 如果是同一个字段且在5秒内重复触发，则忽略
      if (pageAwareness.lastTriggeredField === fieldName &&
          currentTime - pageAwareness.lastTriggeredTime < 5000) {
        return
      }

      const fieldTips: { [key: string]: { message: string; suggestions: string[] } } = {
        title: {
          message: '正在填写活动标题，AI助手建议您考虑以下要点',
          suggestions: [
            '标题应该简洁明了，突出活动特色',
            '可以包含年龄段信息，如"小班春游"',
            '避免使用过于复杂的词汇',
            '考虑加入时间或季节元素'
          ]
        },
        description: {
          message: '正在编写活动描述，AI助手为您提供写作建议',
          suggestions: [
            '描述活动的教育目标和意义',
            '说明活动的具体内容和流程',
            '强调安全措施和注意事项',
            '可以提及家长参与的环节'
          ]
        },
        location: {
          message: '正在选择活动地点，AI助手提醒您注意以下事项',
          suggestions: [
            '确保场地安全，适合幼儿活动',
            '考虑场地的容纳能力和设施',
            '户外活动需要备选室内场地',
            '确认场地的使用权限和费用'
          ]
        }
      }

      const tip = fieldTips[fieldName]
      if (tip) {
        pageAwareness.isActive = true
        pageAwareness.message = tip.message
        pageAwareness.suggestions = tip.suggestions
        pageAwareness.lastTriggeredField = fieldName
        pageAwareness.lastTriggeredTime = currentTime

        // 3秒后自动隐藏
        setTimeout(() => {
          pageAwareness.isActive = false
        }, 3000)
      }
    }

    // 初始化
    onMounted(() => {
      // 加载招生计划列表
      loadEnrollmentPlans()

      // 检查URL参数中是否有预设的招生计划ID
      const planId = route.query.planId
      if (planId) {
        activityForm.planId = Number(planId)
      }

      if (isEditMode.value) {
        fetchActivityDetail()
      } else {
        // 检查是否有模板参数
        const templateId = route.query.template
        if (templateId) {
          fetchTemplateDetail(templateId as string)
        }
      }
    })
    
    return {
      formRef,
      timeRange,
      activityForm,
      formRules,
      ActivityStatus,
      ActivityType,
      activityTypeOptions,
      activityStatusOptions,
      loading,
      submitting,

      // 招生计划相关
      enrollmentPlans,
      loadingPlans,

      // 步骤控制
      currentStep,
      nextStep,
      prevStep,
      canProceedToNext,
      getNextStepButtonText,
      getStepCompletionMessage,
      getStepCompletionType,

      // 海报相关
      selectedTemplate,
      posterTemplates,
      posterPreviewUrl,
      generatingPoster,
      posterConfig,
      posterEditDialog,
      selectTemplate,
      generatePoster,
      editPoster,
      editPosterInDialog,
      closePosterEditDialog,
      savePosterEdit,
      downloadPoster,
      uploadBackground,

      // 营销配置
      activeMarketingTab,
      marketingConfig,
      hasMarketingConfig,

      // 发布渠道
      selectedChannels,

      // 计算属性
      formatTimeRange,

      // 方法
      handleTimeRangeChange,
      beforeImageUpload,
      uploadImage,
      submitForm,
      resetForm,
      goBack,

      // AI策划相关
      aiPlanningDialog,
      aiPlanningLoading,
      aiPlanningFormRef,
      aiPlanningForm,
      aiPlanningRules,
      showAIPlanningDialog,
      startAIPlanning,

      // 页面感知
      pageAwareness,
      handleFormFieldFocus,
      closePageAwareness,

      // AI填表动画
      aiFillingAnimation
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.page-header {
  margin-bottom: var(--spacing-lg);
  background-color: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.page-header h1 {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 600;
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin: 0;
}

// 步骤导航样式
.steps-container {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

// 步骤内容样式
.step-content {
  min-height: 400px;
}

.step-panel {
  .step-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);

    h3 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-2xl);
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }
}

// 表单提示样式
.form-tip {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  line-height: 1.4;
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);

  .half-width {
    flex: 1;
  }
}

.activity-form {
  max-width: 100%; max-width: 800px;
  background-color: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin: 0 auto;
}

.avatar-uploader {
  width: 100%;
  max-width: 100%; max-width: 100%; max-width: 100%; max-width: 300px;
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  transition: all var(--transition-fast);
  background-color: var(--bg-page);
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.avatar-uploader-icon {
  font-size: var(--text-2xl);
  color: var(--text-muted);
  width: 100%;
  min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-page);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.avatar {
  width: 100%;
  max-width: 300px;
  min-height: 60px; height: auto;
  display: block;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.upload-tip {
  color: var(--text-muted);
  font-size: var(--text-xs);
  margin-top: var(--spacing-sm);
}

/* Form styles */
.activity-form :deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

.activity-form :deep(.el-input__inner),
.activity-form :deep(.el-textarea__inner),
.activity-form :deep(.el-select__wrapper) {
  background-color: var(--bg-page);
  border-color: var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-md);
}

.activity-form :deep(.el-input__inner:focus),
.activity-form :deep(.el-textarea__inner:focus),
.activity-form :deep(.el-select__wrapper:focus) {
  border-color: var(--primary-color);
  box-shadow: var(--focus-shadow);
}

/* Button styles */
.activity-form :deep(.el-button) {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all var(--transition-fast);
}

.activity-form :deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.activity-form :deep(.el-button--primary:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* Date picker styles */
.activity-form :deep(.el-date-editor) {
  width: 100%;
  background-color: var(--bg-page);
}

.activity-form :deep(.el-date-editor .el-input__inner) {
  background-color: var(--bg-page);
  color: var(--text-primary);
}

/* Upload hover effect */
.avatar-uploader:hover .avatar-uploader-icon {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

/* Form validation styles */
.activity-form :deep(.el-form-item__error) {
  color: var(--danger-color);
  font-size: var(--text-xs);
}

/* Select dropdown styles */
.activity-form :deep(.el-select-dropdown) {
  background-color: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.activity-form :deep(.el-select-dropdown__item) {
  color: var(--text-primary);
}

.activity-form :deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-hover);
}

.activity-form :deep(.el-select-dropdown__item.selected) {
  color: var(--primary-color);
  font-weight: 600;
  background-color: var(--primary-light-bg);
}

/* Card hover effect */
.activity-form {
  transition: all var(--transition-normal);
}

.activity-form:hover {
  box-shadow: var(--shadow-md);
}

/* Buttons group */
.activity-form :deep(.el-form-item:last-child .el-form-item__content) {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Responsive design */
@media (max-width: var(--breakpoint-md)) {
  .activity-create {
    padding: var(--spacing-md);
  }
  
  .page-header {
    padding: var(--spacing-md);
  }
  
  .page-header h1 {
    font-size: var(--text-xl);
  }
  
  .activity-form {
    padding: var(--spacing-lg);
  }
  
  .avatar-uploader,
  .avatar-uploader-icon,
  .avatar {
    width: 100%;
    max-width: 100%;
  }
  
  .activity-form :deep(.el-form-item__label) {
    font-size: var(--text-sm);
  }
  
  .activity-form :deep(.el-form-item:last-child .el-form-item__content) {
    flex-direction: column;
  }
  
  .activity-form :deep(.el-button) {
    width: 100%;
  }
}

/* Element Plus upload styles */
.activity-form :deep(.el-upload) {
  width: 100%;
}

.activity-form :deep(.el-upload-dragger) {
  background-color: var(--bg-page);
  border-color: var(--border-color);
  transition: all var(--transition-fast);
}

.activity-form :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

/* Element Plus form-item styles */
.activity-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

/* Word limit styles */
.activity-form :deep(.el-input__count) {
  background-color: transparent;
  color: var(--text-muted);
}

/* Textarea count styles */
.activity-form :deep(.el-textarea__inner) + .el-input__count {
  background-color: var(--bg-page);
  border-radius: var(--radius-sm);
  padding: 0 var(--spacing-xs);
}

.activity-form :deep(.el-form-item__content) {
  line-height: normal;
}

/* Element Plus textarea styles */
.activity-form :deep(.el-textarea__inner) {
  min-height: 60px;
  max-height: 300px;
  resize: vertical;
  padding: var(--spacing-sm);
  overflow-y: auto;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 活动描述和议程特殊样式 */
.activity-form :deep(.el-form-item:has([prop="description"]) .el-textarea__inner),
.activity-form :deep(.el-form-item:has([prop="agenda"]) .el-textarea__inner) {
  min-height: 120px;
  max-height: 400px;
}

/* Loading overlay */
.activity-form :deep(.el-loading-mask) {
  background-color: rgba(var(--bg-card-rgb), 0.9);
}

/* Icon styles */
.activity-form :deep(.el-icon) {
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.activity-form :deep(.el-button:hover .el-icon) {
  color: var(--text-primary);
}

/* Input prefix/suffix icons */
.activity-form :deep(.el-input__prefix),
.activity-form :deep(.el-input__suffix) {
  color: var(--text-muted);
}

/* Date picker icon styles */
.activity-form :deep(.el-date-editor .el-range-separator) {
  color: var(--text-muted);
  line-height: var(--spacing-3xl);
}

/* Form item required asterisk */
.activity-form :deep(.el-form-item__label-wrap > .el-form-item__label:before) {
  color: var(--danger-color);
  margin-right: var(--spacing-xs);
}

// 海报设计样式
.poster-design-section {
  .template-selection {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-lg);

      .template-item {
        border: 2px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        &.active {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }

        img {
          width: 100%;
          min-height: 60px; height: auto;
          object-fit: cover;
        }

        .template-info {
          padding: var(--spacing-md);

          .template-name {
            display: block;
            font-weight: 500;
            color: var(--text-primary);
          }

          .template-type {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .poster-preview {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .preview-container {
      display: flex;
      gap: var(--spacing-lg);

      .poster-canvas {
        flex: 1;
        max-width: 300px;
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;

        img {
          width: 100%;
          height: auto;
        }

        .preview-placeholder {
          min-height: 60px; height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);

          .el-icon {
            font-size: var(--text-5xl);
            margin-bottom: var(--spacing-md);
          }
        }
      }

      .poster-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: flex-start;
        max-width: 200px; width: 100%;

        .el-button {
          justify-content: flex-start;
          width: 100%;
          text-align: left;

          .el-icon {
            margin-right: var(--spacing-sm);
          }
        }
      }
    }
  }
}

// 海报编辑弹窗样式
.poster-edit-dialog {
  .el-dialog__body {
    padding: 0;
    height: 80vh;
  }

  .poster-editor-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .poster-editor-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60px; height: auto;
      color: var(--el-text-color-secondary);

      .el-icon {
        font-size: var(--text-5xl);
        margin-bottom: var(--text-lg);
      }

      p {
        margin: 0;
        font-size: var(--text-lg);
      }
    }
  }

  .poster-customization {
    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }
  }
}

// 营销配置样式
.marketing-config {
  .marketing-panel {
    padding: var(--spacing-lg);

    .config-content {
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: var(--border-width-base) solid var(--border-color);

      // 确保表单item有合适的宽度
      :deep(.el-form) {
        width: 100%;
        max-width: 100%; max-width: 600px; // 设置最大宽度，避免在大屏幕上过宽
      }

      // 确保表单控件有合适的宽度
      :deep(.el-form-item) {
        margin-bottom: var(--spacing-lg);
        
        .el-form-item__content {
          width: 100%;
        }
      }

      :deep(.el-input-number) {
        width: 100% !important;
        
        .el-input__wrapper {
          width: 100%;
        }
      }

      :deep(.el-select) {
        width: 100% !important;
      }

      :deep(.el-date-picker) {
        width: 100% !important;
      }

      :deep(.el-input) {
        width: 100%;
      }

      // 单选按钮组宽度
      :deep(.el-radio-group) {
        width: 100%;
        display: flex;
        gap: var(--spacing-md);
      }

      // 滑块宽度
      :deep(.el-slider) {
        width: 100%;
      }

      // 表单提示文字
      .form-tip {
        margin-top: var(--spacing-xs);
        display: block;
        width: 100%;
      }
    }
  }
}

// 预览发布样式
.preview-publish {
  .activity-preview {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .preview-card {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);

      .preview-poster {
        max-width: 150px; width: 100%;
        min-height: 60px; height: auto;
        border-radius: var(--radius-sm);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-poster {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-light);
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
      }

      .preview-info {
        flex: 1;

        h5 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--text-primary);
          font-size: var(--text-xl);
        }

        p {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .el-icon {
            color: var(--primary-color);
          }
        }
      }
    }
  }

  .marketing-preview {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .marketing-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
  }

  .publish-channels {
    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }
  }
}

// 步骤进度提示样式
.step-progress-tip {
  margin: var(--spacing-md) 0;

  .el-alert {
    border-radius: var(--text-sm);
    border: none;
    box-shadow: 0 2px var(--text-sm) var(--shadow-light);

    :deep(.el-alert__content) {
      p {
        margin: var(--spacing-xs) 0;
        line-height: 1.6;

        &:first-child {
          font-weight: 500;
        }
      }
    }
  }
}

// 步骤操作按钮样式
.step-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--border-color);

  .step-completion-status {
    margin-bottom: var(--spacing-lg);

    .completion-alert {
      border-radius: var(--text-sm);
      border: none;
      box-shadow: 0 2px var(--text-sm) var(--shadow-light);
    }
  }

  .action-buttons {
    text-align: center;

    .el-button {
      margin: 0 var(--spacing-sm);
      padding: var(--text-sm) var(--text-3xl);
      font-size: var(--text-lg);
      border-radius: var(--spacing-sm);

      .el-icon {
        margin-right: var(--spacing-lg);

        &:last-child {
          margin-right: 0;
          margin-left: var(--spacing-lg);
        }
      }

      &[type="primary"] {
        background: var(--gradient-purple);
        border: none;
        box-shadow: 0 var(--spacing-xs) 15px var(--glow-purple);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px var(--text-2xl) var(--glow-purple);
        }

        &:disabled {
          background: var(--text-placeholder);
          transform: none;
          box-shadow: none;
        }
      }

      &[type="success"] {
        background: var(--gradient-success);
        border: none;
        box-shadow: 0 var(--spacing-xs) 15px rgba(103, 194, 58, 0.4);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px var(--text-2xl) rgba(103, 194, 58, 0.6);
        }
      }
    }
  }
}

/* 招生计划选择器样式 */
.plan-option {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  .plan-title {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-md);
  }

  .plan-meta {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

/* Element Plus select option 样式增强 */
.activity-form :deep(.el-select-dropdown__item) {
  height: auto;
  padding: var(--spacing-sm) var(--spacing-md);
  line-height: normal;
}

/* 页面感知提示样式 */
.page-awareness-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-awareness-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-30);
  backdrop-filter: blur(2px);
}

.page-awareness-tip {
  position: relative;
  max-width: 100%; max-width: 500px;
  width: 90%;
  margin: 0;
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-medium);
  border-radius: var(--text-sm);
  overflow: hidden;
  animation: fadeInScale 0.3s ease-out;

  .el-alert {
    border-radius: var(--text-sm);
    border: none;
    box-shadow: none;
  }

  .awareness-content {
    p {
      margin: 0 0 10px 0;
    }

    .awareness-suggestions {
      ul {
        margin: var(--spacing-2xl) 0 0 0;
        padding-left: var(--text-2xl);

        li {
          margin: var(--spacing-base) 0;
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }
    }
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* AI填表动画样式 */
.ai-filling-animation {
  display: flex;
  align-items: center;
  gap: var(--text-2xl);
  padding: var(--text-2xl);
  background: var(--gradient-purple);
  border-radius: var(--text-sm);
  color: white;
  margin: var(--text-2xl) 0;
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--glow-purple);

  .ai-robot {
    display: flex;
    flex-direction: column;
    align-items: center;

    .robot-head {
      font-size: var(--spacing-3xl);
      animation: robotBounce 2s infinite;
    }

    .robot-body {
      margin-top: var(--spacing-sm);

      .typing-indicator {
        display: flex;
        gap: var(--spacing-xs);

        span {
          width: auto;
          min-height: 32px; height: auto;
          background: white;
          border-radius: var(--radius-full);
          animation: typingDots 1.5s infinite;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }

  .ai-status {
    flex: 1;

    p {
      margin: 0 0 10px 0;
      font-size: var(--text-lg);
      font-weight: 500;
    }
  }
}

/* AI策划对话框样式 */
.ai-planning-content {
  .ai-intro {
    background: linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%);
    padding: var(--text-lg);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-2xl);
    border-left: var(--spacing-xs) solid var(--primary-color);

    p {
      margin: 0;
      color: var(--text-primary);
      line-height: 1.6;
    }
  }
}

/* 动画定义 */
@keyframes robotBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes typingDots {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* AI策划按钮样式 */
.ai-planning-btn {
  background: var(--gradient-purple) !important;
  border: none !important;
  box-shadow: 0 var(--spacing-xs) 15px var(--glow-purple);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px var(--text-2xl) var(--glow-purple);
  }

  &.ai-planning-active {
    background: var(--gradient-danger) !important;
    animation: aiPlanningPulse 2s infinite;
  }
}

@keyframes aiPlanningPulse {
  0%, 100% {
    box-shadow: 0 var(--spacing-xs) 15px rgba(240, 147, 251, 0.4);
  }
  50% {
    box-shadow: 0 6px 25px rgba(240, 147, 251, 0.8);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .ai-filling-animation {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-4xl);

    .ai-robot .robot-head {
      font-size: var(--text-3xl);
    }
  }
}

.activity-form :deep(.el-select-dropdown__item.hover) {
  background-color: var(--background-color-secondary);
}
</style>