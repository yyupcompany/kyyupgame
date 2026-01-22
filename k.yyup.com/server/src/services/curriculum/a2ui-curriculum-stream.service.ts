/**
 * A2UI 课程流式生成服务
 * 实现"搭积木"式实时渲染 - 分段发送A2UI组件
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { unifiedTenantAIClient } from '../unified-tenant-ai-client.service';
import { componentTreeService } from '../a2ui/component-tree.service';
import { curriculumA2UIConverter } from '../a2ui/curriculum-a2ui-converter.service';
import type { A2UIComponentNode } from '../a2ui/a2ui-message.service';
import redisService from '../redis.service';
import { curriculumAudioService } from '../audio/curriculum-audio.service';

/**
 * A2UI课程活动接口
 */
export interface A2UIActivity {
  id: string;
  type: 'choice' | 'fill-blank' | 'drag-sort' | 'puzzle' | 'drawing';
  title: string;
  instruction?: string;
  question?: string;
  options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
  items?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  imageSrc?: string;
  gridSize?: 2 | 3 | 4;
  timeLimit?: number;
  points?: number;
}

/**
 * A2UI课程规划接口
 */
export interface A2UICurriculumPlan {
  title: string;
  description: string;
  domain: string;
  ageGroup: string;
  duration: number;
  objectives: string[];
  style: string;
  colorScheme: string;
  images: Array<{ id: string; description: string; prompt: string }>;
  activities: A2UIActivity[];
}

/**
 * SSE组件消息类型
 */
export interface SSEComponentMessage {
  type: 'component' | 'progress' | 'thinking' | 'complete' | 'error' | 'image_ready';
  action?: 'append' | 'update' | 'replace';
  targetId?: string;
  component?: A2UIComponentNode;
  content?: string;
  message?: string;
  imageUrl?: string;
  imageId?: string;
  timestamp?: string;
}

/**
 * 🎨 媒体生成选项接口
 */
export interface MediaGenerationOptions {
  enableImage?: boolean;      // 是否生成图片（默认true）
  enableVoice?: boolean;      // 是否启用语音（默认true）
  enableSoundEffect?: boolean; // 是否启用音效（默认true）
  isDemo?: boolean;           // 是否是demo模式（true=本地AIBridge，false=统一认证）
}

/**
 * A2UI课程流式生成服务
 */
class A2UICurriculumStreamService {
  private readonly THINK_MODEL = 'doubao-seed-1-6-thinking-250615';
  private readonly IMAGE_MODEL = 'doubao-seedream-4-5-251128';

  /**
   * 流式生成A2UI课程（搭积木模式）
   * 分段发送组件给前端实时渲染
   * 
   * @param userPrompt 用户提示词
   * @param domain 课程领域
   * @param ageGroup 年龄段
   * @param taskId 任务ID
   * @param sendComponent SSE发送函数
   * @param mediaOptions 媒体生成选项（图片/语音/音效）
   */
  async generateCurriculumStream(
    userPrompt: string,
    domain: string,
    ageGroup: string,
    taskId: string,
    sendComponent: (msg: SSEComponentMessage) => void,
    mediaOptions: MediaGenerationOptions = {}
  ): Promise<{ plan: A2UICurriculumPlan; images: any[]; audioAssets?: any }> {
    // 🎨 解析媒体选项，设置默认值
    const {
      enableImage = true,
      enableVoice = true,
      enableSoundEffect = true,
      isDemo = true  // 默认demo模式使用本地AIBridge
    } = mediaOptions;

    console.log(`🧱 [A2UI搭积木] 开始流式生成课程，taskId: ${taskId}`);
    console.log(`🎨 [A2UI搭积木] 媒体选项: 图片=${enableImage}, 语音=${enableVoice}, 音效=${enableSoundEffect}`);

    try {
      // 1. 发送页面容器（骨架）
      await this.sendPageSkeleton(sendComponent);

      // 2. 生成课程规划（同时流式输出思考过程）
      sendComponent({
        type: 'progress',
        message: '🤔 AI正在分析课程需求...'
      });

      const plan = await this.generateCurriculumPlan(userPrompt, domain, ageGroup, taskId, sendComponent);

      // 🎵 2.5. 生成课程音频（欢迎语、介绍语、活动语音）- 根据选项控制
      let audioAssets: {
        welcomeAudio: { url: string; text: string };
        introAudio: { url: string; text: string };
        activityAudios: Map<string, { url: string; text: string }>;
      } = {
        welcomeAudio: { url: '', text: '' },
        introAudio: { url: '', text: '' },
        activityAudios: new Map()
      };

      // 🔧 安全检查：确保plan字段存在
      const planTitle = plan?.title || '未命名课程';
      const planDescription = plan?.description || '';
      const planActivities = plan?.activities || [];
      const planObjectives = plan?.objectives || [];
      const planImages = plan?.images || [];
      
      console.log(`📋 [A2UI搭积木] 课程规划: 标题=${planTitle}, 活动数=${planActivities.length}, 目标数=${planObjectives.length}, 图片数=${planImages.length}`);

      if (enableVoice) {
        sendComponent({
          type: 'progress',
          message: '🎵 正在生成课程语音...'
        });

        audioAssets = await this.generateCourseAudioWithProgress(
          planTitle,
          planDescription,
          planActivities,
          taskId,
          sendComponent,
          enableSoundEffect  // 传递音效选项
        );
      } else {
        sendComponent({
          type: 'progress',
          message: '⏭️ 跳过语音生成（已禁用）'
        });
      }

      // 3. 发送课程标题卡片（包含欢迎语音元数据）
      await this.sendTitleCard(plan, enableVoice ? audioAssets : undefined, sendComponent);

      // 4. 发送学习目标
      await this.sendObjectivesCard(planObjectives, sendComponent);

      // 5. 并行生成图片，每生成一张就发送 - 根据选项控制
      let images: any[] = [];
      if (enableImage && planImages.length > 0) {
        images = await this.generateAndSendImages(planImages, taskId, sendComponent, isDemo);
      } else {
        sendComponent({
          type: 'progress',
          message: enableImage ? '⏭️ 无需生成图片（无图片需求）' : '⏭️ 跳过图片生成（已禁用）'
        });
      }

      // 6. 发送活动组件（包含活动语音）
      // 使用已经安全提取的 planActivities
      console.log(`📋 [A2UI搭积木] 准备发送 ${planActivities.length} 个活动组件`);
      
      for (let i = 0; i < planActivities.length; i++) {
        const activity = planActivities[i];
        if (!activity) {
          console.warn(`⚠️ [A2UI搭积木] 活动 ${i} 为空，跳过`);
          continue;
        }
        const activityAudio = enableVoice 
          ? audioAssets.activityAudios.get(`${activity.id}`)
          : undefined;
        await this.sendActivityComponent(
          activity,
          i,
          sendComponent,
          activityAudio
        );
      }

      // 7. 发送积分板（根据音效选项控制）
      await this.sendScoreBoard(plan.duration, sendComponent, enableSoundEffect);

      // 8. 发送完成信号
      sendComponent({
        type: 'complete',
        message: '🎉 课程生成完成！'
      });

      console.log('📦 [A2UI搭积木] 准备返回结果:', {
        planTitle: plan?.title,
        planActivities: plan?.activities?.length,
        planObjectives: plan?.objectives?.length,
        imagesCount: images?.length
      });

      // 🔧 修复：返回前确保所有数组字段都有效，防止 undefined.length 错误
      if (!plan || typeof plan !== 'object') {
        throw new Error('课程规划生成失败：plan对象无效');
      }
      if (!Array.isArray(plan.activities)) {
        console.warn('⚠️ [A2UI搭积木] plan.activities 不是数组，设置为空数组');
        plan.activities = [];
      }
      if (!Array.isArray(plan.objectives)) {
        console.warn('⚠️ [A2UI搭积木] plan.objectives 不是数组，设置为空数组');
        plan.objectives = [];
      }
      if (!Array.isArray(plan.images)) {
        console.warn('⚠️ [A2UI搭积木] plan.images 不是数组，设置为空数组');
        plan.images = [];
      }

      return { plan, images, audioAssets };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [A2UI搭积木] 生成失败:`, error);
      sendComponent({
        type: 'error',
        message: `[服务层错误] 生成失败: ${errorMsg}`
      });
      throw error;
    }
  }

  /**
   * 发送页面骨架
   */
  private async sendPageSkeleton(sendComponent: (msg: SSEComponentMessage) => void): Promise<void> {
    const pageContainer = componentTreeService.createPageContainer(
      '加载中...',
      '课程正在生成',
      []
    );

    sendComponent({
      type: 'component',
      action: 'replace',
      targetId: 'root',
      component: pageContainer
    });

    // 小延迟让前端有渲染时间
    await this.delay(100);
  }

  /**
   * 发送课程标题卡片（包含欢迎语音元数据）
   */
  private async sendTitleCard(
    plan: A2UICurriculumPlan,
    audioAssets?: {
      welcomeAudio: { url: string; text: string };
      introAudio: { url: string; text: string };
    },
    sendComponent?: (msg: SSEComponentMessage) => void
  ): Promise<void> {
    const titleChildren: A2UIComponentNode[] = [
      componentTreeService.createText('course-title-text', plan.title, {
        size: '28px',
        weight: 'bold',
        color: '#303133'
      }),
      componentTreeService.createText('course-desc-text', plan.description, {
        size: '16px',
        color: '#606266'
      }),
      componentTreeService.createGroupContainer('course-tags', [
        componentTreeService.createTag('tag-domain', `📚 ${this.getDomainLabel(plan.domain)}`, 'primary'),
        componentTreeService.createTag('tag-age', `👶 ${plan.ageGroup}`, 'success'),
        componentTreeService.createTag('tag-duration', `⏱️ ${plan.duration}分钟`, 'info')
      ], { direction: 'row', gap: 8 })
    ];

    // 🎵 添加音频元数据到标题卡片
    if (audioAssets?.welcomeAudio?.url) {
      titleChildren.unshift(
        componentTreeService.createAudioMeta('welcome-audio-meta', {
          url: audioAssets.welcomeAudio.url,
          text: audioAssets.welcomeAudio.text,
          autoPlay: true,
          delay: 1000,
          volume: 1.0
        })
      );
    }

    const titleCard = componentTreeService.createCard('course-header', '', titleChildren, {
      padding: '24px'
    });

    // 先更新页面标题
    const pageContainer = componentTreeService.createPageContainer(
      plan.title,
      `${this.getDomainLabel(plan.domain)} | ${plan.ageGroup} | ${plan.duration}分钟`,
      [titleCard]
    );

    if (sendComponent) {
      sendComponent({
        type: 'component',
        action: 'replace',
        targetId: 'root',
        component: pageContainer
      });

      sendComponent({
        type: 'progress',
        message: '✅ 课程信息已加载'
      });
    }

    await this.delay(200);
  }

  /**
   * 发送学习目标卡片
   */
  private async sendObjectivesCard(objectives: string[], sendComponent: (msg: SSEComponentMessage) => void): Promise<void> {
    const objectiveNodes = objectives.map((obj, index) =>
      componentTreeService.createText(`objective-${index}`, `${index + 1}. ${obj}`, {
        size: '15px',
        color: '#409EFF'
      })
    );

    const objectivesCard = componentTreeService.createCard('course-objectives', '🎯 学习目标', objectiveNodes, {
      padding: '20px'
    });

    sendComponent({
      type: 'component',
      action: 'append',
      targetId: 'page-container-main',
      component: objectivesCard
    });

    sendComponent({
      type: 'progress',
      message: '✅ 学习目标已加载'
    });

    await this.delay(200);
  }

  /**
   * 生成并发送图片
   * @param imagePrompts 图片提示词数组
   * @param taskId 任务ID
   * @param sendComponent SSE发送函数
   * @param isDemo 是否demo模式（true=本地AIBridge，false=统一认证）
   */
  private async generateAndSendImages(
    imagePrompts: Array<{ id: string; description: string; prompt: string }>,
    taskId: string,
    sendComponent: (msg: SSEComponentMessage) => void,
    isDemo: boolean = true
  ): Promise<any[]> {
    if (!imagePrompts || imagePrompts.length === 0) {
      return [];
    }

    sendComponent({
      type: 'progress',
      message: `🖼️ 正在生成 ${imagePrompts.length} 张课程图片...`
    });

    // 先发送图片轮播占位
    const placeholderImages = imagePrompts.map((img, index) => ({
      id: img.id,
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f5f7fa" width="100%25" height="100%25"/%3E%3Ctext fill="%23909399" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片生成中...%3C/text%3E%3C/svg%3E',
      alt: img.description
    }));

    const carouselPlaceholder = componentTreeService.createImageCarousel('media-carousel', placeholderImages, {
      autoplay: false,
      height: '350px'
    });

    const mediaCard = componentTreeService.createCard('course-media', '🖼️ 课程资源', [carouselPlaceholder], {
      padding: '16px'
    });

    sendComponent({
      type: 'component',
      action: 'append',
      targetId: 'page-container-main',
      component: mediaCard
    });

    // 并行生成图片
    const results: any[] = [];
    console.log(`🎨 [A2UI搭积木] 图片生成模式: ${isDemo ? 'Demo(本地AIBridge)' : '租户(统一认证)'}`);
    
    const imageGenPromises = imagePrompts.map(async (imgPrompt, index) => {
      try {
        console.log(`🖼️ [A2UI搭积木] 生成第 ${index + 1} 张图片: ${imgPrompt.description}`);
        
        let response: any;
        
        if (isDemo) {
          // Demo模式：使用本地AI Bridge
          console.log(`🏠 [A2UI搭积木] 使用本地AIBridge生成图片...`);
          const localResponse = await unifiedAIBridge.generateImage({
            model: this.IMAGE_MODEL,
            prompt: imgPrompt.prompt,
            n: 1,
            size: '1920x1920',
            quality: 'standard'
          });
          response = {
            success: localResponse.success,
            data: localResponse.data ? {
              images: localResponse.data.images || [],
              usage: localResponse.data.usage,
              responseTime: localResponse.data.responseTime || 0
            } : undefined,
            error: localResponse.error
          };
        } else {
          // 租户模式：使用统一认证AI服务
          console.log(`🌐 [A2UI搭积木] 使用统一认证生成图片...`);
          response = await unifiedTenantAIClient.imageGenerate({
            model: this.IMAGE_MODEL,
            prompt: imgPrompt.prompt,
            n: 1,
            size: '1920x1920',
            quality: 'standard',
            logo_info: { add_logo: false }
          });
        }

        if (response.success && response.data?.images?.[0]) {
          const imageUrl = response.data.images[0].url;
          console.log(`✅ [A2UI搭积木] 第 ${index + 1} 张图片生成成功: ${imageUrl.substring(0, 80)}...`);
          
          // 发送图片就绪消息
          sendComponent({
            type: 'image_ready',
            imageId: imgPrompt.id,
            imageUrl: imageUrl,
            message: `第 ${index + 1} 张图片已生成`
          });

          results.push({
            id: imgPrompt.id,
            description: imgPrompt.description,
            url: imageUrl,
            order: index
          });
        } else {
          console.error(`❌ [A2UI搭积木] 图片生成返回失败:`, response.error || '未知错误');
        }
      } catch (err) {
        console.error(`❌ [A2UI搭积木] 图片生成失败 (${imgPrompt.id}):`, err);
      }
    });

    await Promise.all(imageGenPromises);

    // 更新轮播为真实图片
    if (results.length > 0) {
      const realImages = results.map(img => ({
        id: img.id,
        src: img.url,
        alt: img.description
      }));

      const carousel = componentTreeService.createImageCarousel('media-carousel', realImages, {
        autoplay: true,
        interval: 4000,
        height: '350px'
      });

      const updatedMediaCard = componentTreeService.createCard('course-media', '🖼️ 课程资源', [carousel], {
        padding: '16px'
      });

      sendComponent({
        type: 'component',
        action: 'update',
        targetId: 'course-media',
        component: updatedMediaCard
      });

      sendComponent({
        type: 'progress',
        message: `✅ ${results.length} 张图片生成完成`
      });
    }

    return results;
  }

  /**
   * 发送活动组件（包含活动语音）
   */
  private async sendActivityComponent(
    activity: A2UIActivity,
    index: number,
    sendComponent: (msg: SSEComponentMessage) => void,
    audioData?: { url: string; text: string }
  ): Promise<void> {
    let activityComponent: A2UIComponentNode;
    const activityId = `activity-${index}`;

    // 根据活动类型创建组件
    switch (activity.type) {
      case 'choice':
        const options = (activity.options || []).map((opt, i) => ({
          id: opt.id || `opt-${i}`,
          content: opt.text,
          isCorrect: opt.isCorrect
        }));
        activityComponent = componentTreeService.createChoiceQuestion(
          activityId,
          activity.question || activity.title,
          options,
          { timeLimit: activity.timeLimit, points: activity.points || 10 }
        );
        break;

      case 'drag-sort':
        const items = (activity.items || []).map((item, i) => ({
          id: item.id || `item-${i}`,
          content: item.text
        }));
        activityComponent = componentTreeService.createDragSort(
          activityId,
          items,
          activity.correctOrder || items.map(i => i.id),
          { showFeedback: true }
        );
        break;

      case 'puzzle':
        activityComponent = componentTreeService.createPuzzleGame(
          activityId,
          activity.imageSrc || '',
          activity.gridSize || 3,
          { timeLimit: activity.timeLimit, successScore: activity.points }
        );
        break;

      case 'drawing':
        activityComponent = componentTreeService.createGroupContainer(activityId, [
          componentTreeService.createWhiteboard(`${activityId}-whiteboard`, 800, 400, {
            tools: ['pen', 'eraser', 'text'],
            defaultColor: '#000000'
          }),
          componentTreeService.createButton(`${activityId}-save`, '💾 保存作品', 'primary'),
          componentTreeService.createButton(`${activityId}-clear`, '🗑️ 清除', 'secondary')
        ], { gap: 16 });
        break;

      default:
        activityComponent = componentTreeService.createText(activityId, `活动: ${activity.title}`, {});
    }

    // 准备活动卡片子元素
    const cardChildren: A2UIComponentNode[] = [
      activity.instruction ? componentTreeService.createText(`${activityId}-instruction`, activity.instruction, {
        size: '14px',
        color: '#909399'
      }) : null,
      activityComponent,
      componentTreeService.createButton(`${activityId}-submit`, '提交答案', 'primary', { block: true })
    ].filter(Boolean) as A2UIComponentNode[];

    // 🎵 如果有活动语音，添加音频元数据
    if (audioData?.url) {
      cardChildren.unshift(
        componentTreeService.createAudioMeta(`${activityId}-audio-meta`, {
          url: audioData.url,
          text: audioData.text,
          autoPlay: false, // 活动语音不自动播放，由用户触发
          delay: 0,
          volume: 1.0
        })
      );
    }

    // 包装成卡片（包含音频元数据）
    const activityCard = componentTreeService.createCard(
      `${activityId}-card`,
      `📝 ${activity.title}`,
      cardChildren,
      { padding: '20px' }
    );

    // 🎵 为卡片添加音频配置（用于前端处理）
    if (audioData?.url) {
      activityCard.audio = {
        ttsUrl: audioData.url,
        ttsText: audioData.text,
        clickEffect: 'click'
      };
    }

    sendComponent({
      type: 'component',
      action: 'append',
      targetId: 'page-container-main',
      component: activityCard
    });

    sendComponent({
      type: 'progress',
      message: `✅ 活动 "${activity.title}" 已加载`
    });

    await this.delay(300);
  }

  /**
   * 发送积分板
   * @param duration 课程时长（分钟）
   * @param sendComponent SSE发送函数
   * @param enableSoundEffect 是否启用音效
   */
  private async sendScoreBoard(
    duration: number, 
    sendComponent: (msg: SSEComponentMessage) => void,
    enableSoundEffect: boolean = true
  ): Promise<void> {
    const scoreBoard = componentTreeService.createScoreBoard('score-board', 0, {
      showTimer: true,
      timerValue: duration * 60,
      maxScore: 100
    });

    // 🔔 如果启用音效，为积分板添加音效配置
    if (enableSoundEffect) {
      (scoreBoard as any).audio = {
        correctEffect: 'correct',   // 答对音效
        wrongEffect: 'wrong',       // 答错音效
        clickEffect: 'click',       // 点击音效
        completeEffect: 'complete'  // 完成音效
      };
    }

    sendComponent({
      type: 'component',
      action: 'append',
      targetId: 'page-container-main',
      component: scoreBoard
    });

    await this.delay(100);
  }

  /**
   * 生成课程规划
   */
  private async generateCurriculumPlan(
    userPrompt: string,
    domain: string,
    ageGroup: string,
    taskId: string,
    sendComponent: (msg: SSEComponentMessage) => void
  ): Promise<A2UICurriculumPlan> {
    const systemPrompt = this.buildPlanningPrompt(userPrompt, domain, ageGroup);

    const stream = await unifiedAIBridge.streamChat({
      model: this.THINK_MODEL,
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 12000  // 增加token限制，确保完整JSON生成
    });

    let fullContent = '';
    let thinkingContent = '';
    let isCollectingThinking = false;

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.trim() || line.trim() === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              const delta = data.choices?.[0]?.delta;
              const content = delta?.content || delta?.reasoning_content || '';
              const isReasoning = delta?.reasoning_content !== undefined;

              if (content) {
                // 检测思考过程标记（只使用标准thinking标签）
                if (content.includes('<thinking>')) {
                  isCollectingThinking = true;
                }

                // 如果是推理内容，只添加到thinkingContent，不添加到fullContent
                if (isCollectingThinking || isReasoning) {
                  thinkingContent += content;
                  // 流式发送思考内容
                  sendComponent({
                    type: 'thinking',
                    content: content
                  });
                } else {
                  // 只有非思考内容才添加到fullContent用于JSON解析
                  fullContent += content;
                }

                // 检测思考过程结束标记（只使用标准thinking标签）
                if (content.includes('</thinking>')) {
                  isCollectingThinking = false;
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      });

      stream.on('end', async () => {
        try {
          // 提取JSON
          console.log('📝 [A2UI搭积木] AI响应内容总长度:', fullContent.length);
          console.log('📝 [A2UI搭积木] AI响应内容前500字符:', fullContent.substring(0, 500), '...');
          
          let jsonStr = fullContent;
          const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          
          // 🔧 JSON完整性检查：检测括号是否匹配
          const openBraces = (jsonStr.match(/\{/g) || []).length;
          const closeBraces = (jsonStr.match(/\}/g) || []).length;
          const openBrackets = (jsonStr.match(/\[/g) || []).length;
          const closeBrackets = (jsonStr.match(/\]/g) || []).length;
          
          console.log('🔍 [A2UI搭积木] JSON括号检查: { = ' + openBraces + ', } = ' + closeBraces + ', [ = ' + openBrackets + ', ] = ' + closeBrackets);
          
          // 如果JSON不完整，尝试修复
          if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
            console.warn('⚠️ [A2UI搭积木] JSON不完整，尝试修复截断JSON');
            // 添加缺少的右括号
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              jsonStr += ']';
            }
            for (let i = 0; i < openBraces - closeBraces; i++) {
              jsonStr += '}';
            }
            console.log('🔧 [A2UI搭积木] 修复后JSON末尾:', jsonStr.substring(Math.max(0, jsonStr.length - 100)));
          }
          
          if (!jsonStr || jsonStr.trim() === '') {
            throw new Error('无法从AI响应中提取JSON，响应内容：' + fullContent.substring(0, 300));
          }

          // 尝试修复和解析JSON
          const plan = this.parseAndFixJSON(jsonStr) as A2UICurriculumPlan;
          
          // 验证必需字段
          this.validatePlan(plan);

          // 保存思考过程
          if (thinkingContent) {
            await redisService.set(`curriculum:thinking:${taskId}`, thinkingContent, 3600);
          }

          console.log(`✅ [A2UI搭积木] 课程规划生成完成: ${plan.title}`);
          resolve(plan);
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });
  }

  /**
   * 构建规划提示词（升级版 - 支持1920x1080幻灯片课件）
   */
  private buildPlanningPrompt(userPrompt: string, domain: string, ageGroup: string): string {
    // 年龄段映射
    const ageGroupMapping: Record<string, string> = {
      '3-4': 'small',
      '3-4岁': 'small',
      '小班': 'small',
      '4-5': 'middle',
      '4-5岁': 'middle',
      '中班': 'middle',
      '5-6': 'large',
      '5-6岁': 'large',
      '大班': 'large'
    };
    
    const normalizedAgeGroup = ageGroupMapping[ageGroup] || 'middle';
    const ageLabels: Record<string, string> = {
      small: '小班(3-4岁)',
      middle: '中班(4-5岁)',
      large: '大班(5-6岁)'
    };
    const ageLabel = ageLabels[normalizedAgeGroup] || '中班(4-5岁)';
    
    // 年龄段特定要求
    const ageSpecificRequirements: Record<string, string> = {
      small: `【小班(3-4岁)适配要求】
- 文字要极其简单，每句不超过10个字
- 选项最多2个，最好用图片表示
- 问题要非常直接明确
- 互动以识别、指认为主`,
      middle: `【中班(4-5岁)适配要求】
- 文字简洁，每句不超过15个字
- 选项2-3个，图文结合
- 问题可以稍复杂，但要明确
- 互动可包含简单排序`,
      large: `【大班(5-6岁)适配要求】
- 文字可以稍长，每句不超过20个字
- 选项2-4个，可以纯文字
- 问题可以有一定思考性
- 互动包含选择、排序、简单判断`
    };

    return `你是专业的幼儿园互动课件设计师，专门为${ageLabel}设计适合投影仪/大屏电视的教学课件。

【课件规格】
- 尺寸：1920 × 1080 像素（16:9比例），适配投影仪和大屏电视
- 展示方式：分页式幻灯片，不滚动，通过上/下页按钮切换
- 目标用户：幼儿园教师和${ageLabel}幼儿

【字体规范】
- 课程标题：72px，超粗体
- 页面标题：56px，粗体
- 活动标题：44px，半粗体
- 正文内容：36px，常规，行高1.8
- 提示文字：28px

${ageSpecificRequirements[normalizedAgeGroup]}

用户需求：${userPrompt}
课程领域：${domain}

请生成JSON格式的课件规划，必须严格遵循以下结构：

{
  "title": "课程标题（简洁有趣，适合${ageLabel}）",
  "description": "课程描述（一句话说明）",
  "domain": "${domain}",
  "ageGroup": "${ageGroup || '4-5岁'}",
  "duration": 15,
  "objectives": [
    "学习目标1（具体可测量）",
    "学习目标2",
    "学习目标3"
  ],
  "style": "卡通可爱、色彩鲜艳",
  "colorScheme": "紫色渐变主题",
  "images": [
    {
      "id": "img_1",
      "description": "图片用途描述",
      "prompt": "详细的图片生成提示词，卡通可爱风格，色彩鲜艳，适合幼儿，高清，无文字"
    }
  ],
  "activities": [
    {
      "id": "act_1",
      "type": "choice",
      "title": "选择题标题",
      "instruction": "简洁的活动说明（将自动生成语音）",
      "question": "问题内容？",
      "options": [
        { "id": "opt_1", "text": "选项A", "isCorrect": true },
        { "id": "opt_2", "text": "选项B", "isCorrect": false },
        { "id": "opt_3", "text": "选项C", "isCorrect": false }
      ],
      "points": 10
    },
    {
      "id": "act_2",
      "type": "drag-sort",
      "title": "排序活动标题",
      "instruction": "按正确顺序排列",
      "items": [
        { "id": "item_1", "text": "步骤1" },
        { "id": "item_2", "text": "步骤2" },
        { "id": "item_3", "text": "步骤3" }
      ],
      "correctOrder": ["item_1", "item_2", "item_3"],
      "points": 15
    }
  ]
}

【活动类型说明】
- choice: 选择题（必须有question和options，options包含id/text/isCorrect）
- drag-sort: 拖拽排序（必须有items和correctOrder）
- puzzle: 拼图游戏（需要imageSrc和gridSize）
- drawing: 绘画活动

【重要规则】
1. 必须返回纯JSON，不要有任何额外文字或markdown标记
2. 必须包含2-4个activities，至少包含1个choice和1个drag-sort
3. 至少包含2张images，图片prompt要详细
4. 活动的instruction字段用于生成语音，使用儿童友好的语言
5. 每个选择题options至少2个，最多4个
6. 所有文字内容适合${ageLabel}理解水平`;
  }

  /**
   * 验证生成的课程计划是否有效
   */
  private validatePlan(plan: A2UICurriculumPlan): void {
    console.log('🔍 [A2UI搭积木] 验证课程计划:', JSON.stringify(plan, null, 2).substring(0, 500));
    
    if (!plan.title) {
      throw new Error('课程计划缺少title字段');
    }
    if (!plan.description) {
      plan.description = plan.title; // 使用标题作为默认描述
    }
    if (!plan.objectives || !Array.isArray(plan.objectives)) {
      plan.objectives = ['学习新知识', '培养兴趣'];
    }
    if (!plan.activities || !Array.isArray(plan.activities)) {
      console.warn('⚠️ [A2UI搭积木] 课程计划缺少activities字段，添加默认活动');
      plan.activities = [
        {
          id: 'act_default_1',
          type: 'choice',
          title: '认识游戏',
          instruction: '请选择正确的答案',
          question: '你学到了什么？',
          options: [
            { id: 'opt_1', text: '很多知识', isCorrect: true },
            { id: 'opt_2', text: '不确定', isCorrect: false }
          ],
          points: 10
        }
      ];
    }
    if (!plan.images || !Array.isArray(plan.images)) {
      plan.images = [];
    }
    if (!plan.duration) {
      plan.duration = 15;
    }
    
    // 确保每个活动有必需字段
    plan.activities.forEach((activity, index) => {
      if (!activity.id) activity.id = `act_${index + 1}`;
      if (!activity.type) activity.type = 'choice';
      if (!activity.title) activity.title = `活动 ${index + 1}`;
      if (!activity.instruction) activity.instruction = activity.title;
      if (!activity.points) activity.points = 10;
    });
    
    console.log(`✅ [A2UI搭积木] 计划验证通过: ${plan.activities?.length ?? 0}个活动, ${plan.images?.length ?? 0}张图片`);
  }

  /**
   * 获取领域标签
   */
  private getDomainLabel(domain: string): string {
    const labels: Record<string, string> = {
      health: '健康领域',
      language: '语言领域',
      social: '社会领域',
      science: '科学领域',
      art: '艺术领域'
    };
    return labels[domain] || domain;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 解析并修复AI生成的JSON
   * 处理常见的格式问题：单引号、转义字符、不完整JSON等
   */
  private parseAndFixJSON(jsonStr: string): any {
    console.log('🔧 [JSON修复] 输入长度:', jsonStr.length);
    console.log('🔧 [JSON修复] 原始JSON前500字符:', jsonStr.substring(0, 500));
    console.log('🔧 [JSON修复] 原始JSON后500字符:', jsonStr.substring(Math.max(0, jsonStr.length - 500)));
    
    // 第一次尝试：直接解析
    try {
      const result = JSON.parse(jsonStr);
      console.log('✅ [JSON修复] 第一次解析成功');
      return result;
    } catch (e1: any) {
      console.log('🔧 [JSON修复] 第一次解析失败:', e1.message);
    }

    // 第二次尝试：移除markdown代码块标记
    try {
      let fixed = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      fixed = fixed.trim();
      const result = JSON.parse(fixed);
      console.log('✅ [JSON修复] 第二次解析成功');
      return result;
    } catch (e2: any) {
      console.log('🔧 [JSON修复] 第二次解析失败:', e2.message);
    }

    // 第三次尝试：清理和修复JSON
    try {
      let fixed = jsonStr;
      
      // 移除markdown标记
      fixed = fixed.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // 移除BOM和有问题的控制字符
      fixed = fixed.replace(/^\uFEFF/, '');
      // 保留换行、回车、制表符
      fixed = fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      // 处理换行符在字符串中的问题（将字符串内的换行符转为\n）
      fixed = this.fixNewlinesInStrings(fixed);
      
      fixed = fixed.trim();
      console.log('🔧 [JSON修复] 第三次尝试，清理后长度:', fixed.length);
      
      const result = JSON.parse(fixed);
      console.log('✅ [JSON修复] 第三次解析成功');
      return result;
    } catch (e3: any) {
      console.log('🔧 [JSON修复] 第三次解析失败:', e3.message);
    }

    // 第四次尝试：手动修复属性名和值
    try {
      let fixed = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // 🔧 增强修复：更全面的属性名修复
      // 1. 修复没有双引号的英文属性名（支持换行后的属性名）
      fixed = fixed.replace(/([{,]\s*\n?\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // 2. 修复中文属性名（AI可能生成中文key）
      fixed = fixed.replace(/([{,]\s*\n?\s*)([\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_]*)\s*:/g, '$1"$2":');
      
      // 3. 修复单引号包裹的属性名
      fixed = fixed.replace(/([{,]\s*\n?\s*)'([^']+)'\s*:/g, '$1"$2":');
      
      // 修复单引号的字符串值（在JSON中应该用双引号）
      // 这个更复杂，需要小心处理
      fixed = this.replaceSingleQuotes(fixed);
      
      // 移除尾部逗号
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // 🔧 修复注释（AI可能添加注释）
      fixed = fixed.replace(/\/\/[^\n]*/g, ''); // 移除单行注释
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行注释
      
      // 🔧 修复多余的逗号（连续逗号）
      fixed = fixed.replace(/,\s*,/g, ',');
      
      // 尝试补全不完整的JSON
      fixed = this.completeJSON(fixed);
      
      console.log('🔧 [JSON修复] 第四次尝试，修复后长度:', fixed.length);
      console.log('🔧 [JSON修复] 修复后前300字符:', fixed.substring(0, 300));
      
      const result = JSON.parse(fixed);
      console.log('✅ [JSON修复] 第四次解析成功');
      return result;
    } catch (e4: any) {
      console.log('🔧 [JSON修复] 第四次解析失败:', e4.message);
      // 输出更详细的错误位置信息
      const match = e4.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const contextStart = Math.max(0, pos - 50);
        const contextEnd = Math.min(jsonStr.length, pos + 50);
        console.log('🔧 [JSON修复] 错误位置前后内容:', jsonStr.substring(contextStart, contextEnd));
      }
    }

    // 第五次尝试：提取第一个完整的JSON对象
    try {
      const extracted = this.extractFirstJSONObject(jsonStr);
      if (extracted) {
        console.log('🔧 [JSON修复] 提取到JSON对象，长度:', extracted.length);
        const result = JSON.parse(extracted);
        console.log('✅ [JSON修复] 第五次解析成功');
        return result;
      }
    } catch (e5: any) {
      console.log('🔧 [JSON修复] 第五次解析失败:', e5.message);
    }

    // 第六次尝试：更激进的修复策略 - 逐行修复属性名
    try {
      let fixed = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // 逐行处理，修复每一行的属性名
      const lines = fixed.split('\n');
      const fixedLines = lines.map(line => {
        // 匹配任何冒号前的非引号包裹的内容作为属性名
        // 改进：匹配行首可能有空格的属性名
        return line.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm, (match, spaces, propName) => {
          return `${spaces}"${propName}":`;
        });
      });
      fixed = fixedLines.join('\n');
      
      // 再次修复单引号值
      fixed = this.replaceSingleQuotes(fixed);
      
      // 移除尾部逗号
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // 补全JSON
      fixed = this.completeJSON(fixed);
      
      console.log('🔧 [JSON修复] 第六次尝试，修复后长度:', fixed.length);
      
      const result = JSON.parse(fixed);
      console.log('✅ [JSON修复] 第六次解析成功');
      return result;
    } catch (e6: any) {
      console.log('🔧 [JSON修复] 第六次解析失败:', e6.message);
    }

    // 🔧 第七次尝试：使用正则逐字符修复属性名 - 最强修复策略
    try {
      let fixed = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // 使用更精确的方法：找到所有 : 前面未被引号包裹的属性名
      fixed = this.fixAllPropertyNames(fixed);
      
      // 移除注释
      fixed = fixed.replace(/\/\/[^\n]*/g, '');
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // 移除尾部逗号
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // 补全JSON
      fixed = this.completeJSON(fixed);
      
      console.log('🔧 [JSON修复] 第七次尝试，修复后长度:', fixed.length);
      console.log('🔧 [JSON修复] 第七次修复后前500字符:', fixed.substring(0, 500));
      
      const result = JSON.parse(fixed);
      console.log('✅ [JSON修复] 第七次解析成功');
      return result;
    } catch (e7: any) {
      console.log('🔧 [JSON修复] 第七次解析失败:', e7.message);
      // 输出详细错误位置
      const match = e7.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const contextStart = Math.max(0, pos - 100);
        const contextEnd = Math.min(jsonStr.length, pos + 100);
        console.log('🔧 [JSON修复] 第七次错误位置上下文:', jsonStr.substring(contextStart, contextEnd));
      }
    }

    // 最后输出详细错误信息
    console.error('❌ [JSON修复] 所有尝试都失败');
    console.error('❌ [JSON修复] 原始字符串前1000字符:', jsonStr.substring(0, 1000));
    console.error('❌ [JSON修复] 原始字符串后500字符:', jsonStr.substring(Math.max(0, jsonStr.length - 500)));
    throw new Error(`无法解析AI生成的JSON: ${jsonStr.substring(0, 500)}...`);
  }

  /**
   * 🔧 修复所有未被引号包裹的属性名
   * 这是最强的修复策略，通过状态机精确识别属性名位置
   */
  private fixAllPropertyNames(str: string): string {
    let result = '';
    let inString = false;
    let escape = false;
    let i = 0;
    
    while (i < str.length) {
      const char = str[i];
      
      // 处理转义
      if (escape) {
        result += char;
        escape = false;
        i++;
        continue;
      }
      
      if (char === '\\' && inString) {
        result += char;
        escape = true;
        i++;
        continue;
      }
      
      // 切换字符串状态
      if (char === '"' && !escape) {
        inString = !inString;
        result += char;
        i++;
        continue;
      }
      
      // 如果在字符串内部，直接复制
      if (inString) {
        result += char;
        i++;
        continue;
      }
      
      // 检查是否是属性名的开始位置（{或,后面）
      if (char === '{' || char === ',') {
        result += char;
        i++;
        
        // 跳过空白字符
        let whitespace = '';
        while (i < str.length && /[\s\n\r\t]/.test(str[i])) {
          whitespace += str[i];
          i++;
        }
        result += whitespace;
        
        // 检查下一个字符是否是未加引号的属性名
        if (i < str.length && str[i] !== '"' && str[i] !== '}' && str[i] !== ']') {
          // 收集属性名
          let propName = '';
          while (i < str.length && /[a-zA-Z0-9_\u4e00-\u9fa5]/.test(str[i])) {
            propName += str[i];
            i++;
          }
          
          // 跳过属性名和冒号之间的空白
          while (i < str.length && /[\s\n\r\t]/.test(str[i])) {
            i++;
          }
          
          // 如果下一个字符是冒号，说明这是属性名，需要加引号
          if (i < str.length && str[i] === ':') {
            result += '"' + propName + '"';
          } else {
            // 不是属性名，原样输出
            result += propName;
          }
        }
        continue;
      }
      
      result += char;
      i++;
    }
    
    return result;
  }

  /**
   * 修复字符串中的换行符
   */
  private fixNewlinesInStrings(str: string): string {
    let result = '';
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (escape) {
        result += char;
        escape = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escape = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }
      
      if (inString && (char === '\n' || char === '\r')) {
        // 在字符串内部的换行符替换为转义序列
        result += char === '\n' ? '\\n' : '\\r';
      } else {
        result += char;
      }
    }
    
    return result;
  }

  /**
   * 将单引号字符串值替换为双引号
   */
  private replaceSingleQuotes(str: string): string {
    // 简单的状态机来处理单引号到双引号的转换
    let result = '';
    let inDoubleQuote = false;
    let inSingleQuote = false;
    let escape = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (escape) {
        result += char;
        escape = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escape = true;
        continue;
      }
      
      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        result += char;
        continue;
      }
      
      if (char === "'" && !inDoubleQuote) {
        // 单引号替换为双引号
        inSingleQuote = !inSingleQuote;
        result += '"';
        continue;
      }
      
      result += char;
    }
    
    return result;
  }

  /**
   * 补全不完整的JSON
   */
  private completeJSON(str: string): string {
    const openBraces = (str.match(/\{/g) || []).length;
    const closeBraces = (str.match(/\}/g) || []).length;
    const openBrackets = (str.match(/\[/g) || []).length;
    const closeBrackets = (str.match(/\]/g) || []).length;
    
    let result = str;
    
    // 补全方括号
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      result += ']';
    }
    
    // 补全花括号
    for (let i = 0; i < openBraces - closeBraces; i++) {
      result += '}';
    }
    
    return result;
  }

  /**
   * 提取第一个完整的JSON对象
   */
  private extractFirstJSONObject(str: string): string | null {
    let depth = 0;
    let start = -1;
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (escape) {
        escape = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        escape = true;
        continue;
      }
      
      if (char === '"' && !escape) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            return str.substring(start, i + 1);
          }
        }
      }
    }
    
    return null;
  }

  /**
   * 🎵 生成课程音频（带进度反馈）
   * @param title 课程标题
   * @param description 课程描述
   * @param activities 活动列表
   * @param taskId 任务ID
   * @param sendComponent SSE发送函数
   * @param enableSoundEffect 是否启用音效
   */
  private async generateCourseAudioWithProgress(
    title: string,
    description: string,
    activities: A2UIActivity[],
    taskId: string,
    sendComponent: (msg: SSEComponentMessage) => void,
    enableSoundEffect: boolean = true
  ): Promise<{
    welcomeAudio: { url: string; text: string };
    introAudio: { url: string; text: string };
    activityAudios: Map<string, { url: string; text: string }>;
  }> {
    try {
      // 准备活动音频请求
      const activityRequests = activities.map(act => ({
        activityId: act.id,
        title: act.title,
        instruction: act.instruction,
        question: act.question
      }));

      // 调用音频服务（根据音效选项配置）
      const result = await curriculumAudioService.generateCourseAudio(
        title,
        description,
        activityRequests,
        {
          voice: 'nova',
          speed: 0.9,
          autoPlayWelcome: true,
          enableClickEffects: enableSoundEffect,       // 🔔 根据选项控制点击音效
          enableTransitionEffects: enableSoundEffect   // 🔔 根据选项控制过渡音效
        },
        taskId
      );

      const audioInfo = enableSoundEffect 
        ? `✅ 课程语音和音效已生成（${result.totalDuration}秒）`
        : `✅ 课程语音已生成（${result.totalDuration}秒，音效已禁用）`;

      sendComponent({
        type: 'progress',
        message: audioInfo
      });

      return {
        welcomeAudio: result.welcomeAudio,
        introAudio: result.introAudio,
        activityAudios: result.activityAudios
      };

    } catch (error) {
      console.error(`❌ [A2UI搭积木] 音频生成失败:`, error);
      // 返回空音频，让流程继续
      return {
        welcomeAudio: { url: '', text: '' },
        introAudio: { url: '', text: '' },
        activityAudios: new Map()
      };
    }
  }
}

export const a2uiCurriculumStreamService = new A2UICurriculumStreamService();
