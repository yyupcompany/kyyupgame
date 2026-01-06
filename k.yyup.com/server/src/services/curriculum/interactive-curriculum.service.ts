/**
 * 互动多媒体课程生成服务
 * 使用两阶段提示词生成 + 并行处理
 * 通过统一AI Bridge自动路由：
 * - 流式对话：自动路由到本地 AI Bridge（支持 SSE）
 * - 图片生成：自动路由到统一认证（租户环境，集中管理和计费）
 * - 视频生成：使用本地 AI Bridge（统一认证暂不支持）
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { unifiedTenantAIClient } from '../unified-tenant-ai-client.service';
import { AiBridgeMessage } from '../ai/bridge/ai-bridge.types';
import redisService from '../redis.service';

export interface CourseAnalysis {
  title: string;
  domain: string;
  ageGroup: string;
  objectives: string[];
  style: string;
  colorScheme: string;
  interactionStyle: string;
}

export interface ImagePrompt {
  id: string;
  description: string;
  detailedPrompt: string;
}

export interface VideoPrompt {
  script: string;
  detailedPrompt: string;
  style: string;
  duration: number;
  scenes: string[];
}

export interface CodeSpec {
  layout: string;
  interactiveElements: string[];
  detailedPrompt: string;
}

export interface CurriculumPlan {
  courseAnalysis: CourseAnalysis;
  imagePrompts: ImagePrompt[];
  videoPrompt: VideoPrompt;
  codeSpec: CodeSpec;
  thinkingProcess?: string; // AI 思考过程
}

class InteractiveCurriculumService {
  // 🔧 修复：使用数据库中实际存在的模型名称
  private readonly THINK_MODEL = 'doubao-seed-1-6-thinking-250615';
  private readonly IMAGE_MODEL = 'doubao-seedream-4-5-251128';  // 从数据库查询
  private readonly VIDEO_MODEL = 'doubao-seed-1-6-thinking-250615';  // 暂时使用文本模型代替

  /**
   * 第一阶段：深度分析 + 提示词规划（非流式版本，兼容旧代码）
   * 使用 Think 1.6 进行深度思考，生成完整的课程规划和优化的提示词
   * @param userPrompt 用户输入的课程需求
   */
  async analyzeAndPlanPrompts(userPrompt: string): Promise<CurriculumPlan> {
    console.log('🤔 [互动课程] 第一阶段：深度分析和提示词规划（非流式）');
    // 调用流式版本，但不传递SSE回调
    return this.analyzeAndPlanPromptsStream(userPrompt, '', undefined);
  }

  /**
   * 第一阶段：深度分析 + 提示词规划（流式版本）
   * 使用 Think 1.6 进行深度思考，生成完整的课程规划和优化的提示词
   * @param userPrompt 用户输入的课程需求
   * @param taskId 任务ID，用于SSE推送
   * @param sseCallback SSE回调函数，用于实时推送思考过程
   */
  async analyzeAndPlanPromptsStream(
    userPrompt: string,
    taskId: string,
    sseCallback?: (data: { type: string; content?: string; message?: string }) => void
  ): Promise<CurriculumPlan> {
    console.log('🤔 [互动课程] 第一阶段：深度分析和提示词规划（流式）');

    const systemPrompt = `你是幼儿园课程设计专家和AI提示词工程师。

用户需求：${userPrompt}

请进行深度分析，返回JSON格式的完整课程规划。

**重要规则**：
1. 必须返回纯JSON格式，不要包含任何注释、说明或特殊标记
2. 所有字符串值必须是有效的JSON字符串，不要使用尖括号<>或其他特殊标记
3. 不要在JSON字段值中添加括号注释，如"暖色系（主色：红色）"是错误的，应该写成"暖色系，主色为红色"
4. 确保JSON格式完全符合标准，可以被JSON.parse()直接解析

返回格式示例：
{
  "courseAnalysis": {
    "title": "小兔子大冒险",
    "domain": "science",
    "ageGroup": "4-5岁",
    "objectives": [
      "能准确识别小兔子的核心外形特征",
      "了解小兔子的基本生活习性",
      "通过点击互动游戏激发对小兔子的兴趣"
    ],
    "style": "卡通可爱风格，Q版萌系，线条圆润",
    "colorScheme": "暖色系pastel组合，主色为粉白和米白，辅助色为浅蓝、草绿、橙色",
    "interactionStyle": "轻量级点击交互，单指点击触发动画和音效"
  },
  "imagePrompts": [
    {
      "id": "img_1",
      "description": "小兔子全身特写图",
      "detailedPrompt": "一只可爱的卡通小兔子，Q版萌系风格，粉白色毛发，长长的耳朵，红色眼睛，短尾巴，站在绿色草地上，背景是浅蓝色天空，色彩鲜艳柔和，适合4-5岁幼儿观看"
    },
    {
      "id": "img_2",
      "description": "小兔子吃胡萝卜图",
      "detailedPrompt": "卡通小兔子开心地抱着橙色胡萝卜，Q版可爱风格，粉白色毛发，红色眼睛闪闪发光，绿色草地背景，暖色系配色，线条圆润无尖锐棱角"
    },
    {
      "id": "img_3",
      "description": "小兔子跳跃图",
      "detailedPrompt": "卡通小兔子蹦蹦跳跳的动作，Q版萌系，粉白色毛发，长耳朵飞扬，短尾巴翘起，浅蓝色天空背景，草绿色草地，色彩鲜艳活泼"
    }
  ],
  "videoPrompt": {
    "script": "场景1：小兔子出现并挥手打招呼。场景2：小兔子展示长耳朵和短尾巴。场景3：小兔子吃胡萝卜并蹦蹦跳跳",
    "detailedPrompt": "卡通风格动画，Q版可爱小兔子，粉白色毛发，红色眼睛，动作流畅可爱，背景为草地和蓝天，色彩鲜艳柔和，节奏轻快活泼，适合幼儿观看",
    "style": "卡通Q版动画",
    "duration": 30,
    "scenes": ["小兔子出场", "展示特征", "互动游戏"]
  },
  "codeSpec": {
    "layout": "上方标题区域，中间图片展示区域采用轮播方式，下方互动按钮区域，点击小兔子图片触发跳跃动画",
    "interactiveElements": [
      "点击小兔子触发跳跃动画",
      "点击胡萝卜触发吃东西动画",
      "左右箭头切换图片"
    ],
    "detailedPrompt": "使用HTML5和CSS3创建响应式布局，顶部显示课程标题，中间区域使用flexbox布局展示图片轮播，底部按钮区域使用grid布局，点击交互使用JavaScript实现CSS动画，色彩方案采用暖色系pastel配色，字体使用圆润可爱的儿童字体，所有元素圆角处理，适合触摸屏操作"
  }
}

重要：
1. 确保返回的是纯JSON格式，不要有任何额外的文字说明
2. 所有字符串值不要使用尖括号或括号注释
3. 确保所有提示词风格一致、相互协调、色彩方案统一`;

    try {
      // 使用流式API
      const stream = await unifiedAIBridge.streamChat({
        model: this.THINK_MODEL,
        messages: [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      });

      let fullContent = '';
      let thinkingProcess = '';
      let isCollectingThinking = false;

      // 处理流式响应
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n');

          for (const line of lines) {
            if (!line.trim() || line.trim() === 'data: [DONE]') continue;

            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                // 🔧 修复：处理豆包深度思考模型的reasoning_content字段
                const delta = data.choices?.[0]?.delta;
                const content = delta?.content || delta?.reasoning_content || '';

                if (content) {
                  fullContent += content;

                  // 检测思考过程的开始和结束标签
                  if (content.includes('<think>') || content.includes('<thinking>')) {
                    isCollectingThinking = true;
                  }

                  // 如果正在收集思考过程，实时推送
                  if (isCollectingThinking) {
                    thinkingProcess += content;

                    // 实时通过SSE推送思考过程
                    if (sseCallback) {
                      sseCallback({
                        type: 'thinking',
                        content: content
                      });
                    }

                    // 检测思考过程结束
                    if (content.includes('</think>') || content.includes('</thinking>')) {
                      isCollectingThinking = false;
                      console.log('🧠 [互动课程] 思考过程收集完成，长度:', thinkingProcess.length);
                    }
                  }
                }
              } catch (e) {
                console.error('❌ [互动课程] 解析流式数据失败:', e);
              }
            }
          }
        });

        stream.on('end', async () => {
          try {
            console.log('📝 [互动课程] AI 流式响应完成，总长度:', fullContent.length);

            // 提取思考过程
            if (!thinkingProcess) {
              // 尝试从完整内容中提取
              let thinkingMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
              if (thinkingMatch) {
                thinkingProcess = thinkingMatch[1].trim();
              } else {
                thinkingMatch = fullContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
                if (thinkingMatch) {
                  thinkingProcess = thinkingMatch[1].trim();
                }
              }
            }

            // 解析 JSON
            const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('无法从 AI 响应中提取 JSON');
            }

            const plan = JSON.parse(jsonMatch[0]) as CurriculumPlan;

            // 如果没有捕获到思考过程，使用 courseAnalysis 作为思考过程
            if (!thinkingProcess && plan.courseAnalysis) {
              console.log('💡 [互动课程] 使用 courseAnalysis 作为思考过程');
              thinkingProcess = this.formatCourseAnalysisAsThinking(plan.courseAnalysis);

              // 推送格式化的思考过程
              if (sseCallback) {
                sseCallback({
                  type: 'thinking',
                  content: thinkingProcess
                });
              }
            }

            if (!thinkingProcess) {
              console.warn('⚠️ [互动课程] 未能捕获 Think 思考过程');
            }

            plan.thinkingProcess = thinkingProcess;

            // 保存思考过程到Redis
            if (thinkingProcess) {
              await this.saveThinkingProcess(taskId, thinkingProcess);
              console.log('💭 [互动课程] Think 思考过程已保存到Redis');
            }

            // 发送完成信号
            if (sseCallback) {
              sseCallback({
                type: 'complete',
                message: 'Think 思考过程已完成'
              });
            }

            console.log('✅ [互动课程] 课程规划生成成功');
            resolve(plan);
          } catch (error) {
            console.error('❌ [互动课程] 处理流式响应失败:', error);
            reject(error);
          }
        });

        stream.on('error', (error: Error) => {
          console.error('❌ [互动课程] 流式请求失败:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ [互动课程] 深度分析失败:', error);
      throw new Error('课程分析失败');
    }
  }

  /**
   * 第二阶段：并行生成资源
   * 同时生成代码、图片、视频
   */
  async generateAssets(plan: CurriculumPlan, taskId: string) {
    console.log('⚡ [互动课程] 第二阶段：并行生成资源');

    try {
      // 更新进度
      await this.updateProgress(taskId, 10, '准备生成资源...');

      // 并行执行两个任务（暂时不生成视频）
      const [code, images] = await Promise.all([
        this.generateCode(plan.codeSpec.detailedPrompt, taskId),
        this.generateImages(plan.imagePrompts, taskId)
      ]);

      await this.updateProgress(taskId, 100, '资源生成完成');

      // 视频暂时返回空对象
      const video = { url: '', duration: 0, script: '' };

      return { code, images, video, plan };
    } catch (error) {
      console.error('❌ [互动课程] 资源生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成代码
   */
  private async generateCode(prompt: string, taskId: string): Promise<any> {
    console.log('💻 [互动课程] 生成代码...');
    await this.updateProgress(taskId, 20, '生成 HTML/CSS/JS 代码...');

    try {
      const response = await unifiedAIBridge.chat({
        model: this.THINK_MODEL,
        messages: [
          {
            role: 'system' as const,
            content: `你是专业的前端开发工程师。根据提示词生成完整的HTML/CSS/JavaScript代码。

**重要规则**：
1. 必须返回纯JSON格式，不要使用Markdown代码块
2. 不要使用反引号(\`)包裹代码，使用转义的双引号
3. 代码中的换行使用\\n，引号使用\\"
4. 确保JSON格式完全符合标准，可以被JSON.parse()直接解析

返回格式示例：
{
  "htmlCode": "<!DOCTYPE html>\\n<html>\\n<head>\\n  <title>课程</title>\\n</head>\\n<body>\\n  <h1>标题</h1>\\n</body>\\n</html>",
  "cssCode": "body {\\n  margin: 0;\\n  padding: 0;\\n}",
  "jsCode": "console.log(\\"Hello\\");"
}

重要：
1. 所有代码必须是单行字符串，使用\\n表示换行
2. 代码中的双引号必须转义为\\"
3. 不要使用反引号或其他特殊标记`
          },
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = response.choices?.[0]?.message?.content || '';
      console.log('📝 [代码生成] AI响应内容长度:', content.length);

      // 尝试提取JSON（可能包含在Markdown代码块中）
      let jsonStr = content;

      // 移除可能的Markdown代码块标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // 尝试找到第一个 { 和最后一个 }
      const startIdx = jsonStr.indexOf('{');
      if (startIdx === -1) {
        console.error('❌ [代码生成] 无法找到JSON对象');
        console.error('响应内容:', content.substring(0, 500));
        throw new Error('无法解析代码生成响应：未找到JSON对象');
      }

      // 找到匹配的右括号
      let braceCount = 0;
      let endIdx = -1;
      for (let i = startIdx; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') braceCount++;
        else if (jsonStr[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (endIdx === -1) {
        endIdx = jsonStr.lastIndexOf('}');
        if (endIdx === -1) {
          throw new Error('无法找到JSON结束符');
        }
      }

      const jsonContent = jsonStr.substring(startIdx, endIdx + 1);
      console.log('📋 [代码生成] 提取的JSON长度:', jsonContent.length);

      try {
        const result = JSON.parse(jsonContent);
        console.log('✅ [代码生成] JSON解析成功');
        await this.updateProgress(taskId, 40, '代码生成完成');
        return result;
      } catch (parseError: any) {
        console.error('❌ [代码生成] JSON解析失败:', parseError.message);
        console.error('尝试解析的内容:', jsonContent.substring(0, 500));
        throw new Error(`JSON解析失败: ${parseError.message}`);
      }
    } catch (error) {
      console.error('❌ [互动课程] 代码生成失败:', error);
      throw error;
    }
  }



  /**
   * 生成图片
   * 🔧 通过统一认证系统调用AI服务
   */
  private async generateImages(imagePrompts: ImagePrompt[], taskId: string): Promise<any[]> {
    console.log('🖼️ [互动课程] 生成图片（通过统一认证系统）...');
    await this.updateProgress(taskId, 30, '生成课程图片...');

    try {
      const images = await Promise.all(
        imagePrompts.map(async (prompt, index) => {
          console.log(`🖼️ [互动课程] 生成第 ${index + 1} 张图片`);

          const response = await unifiedTenantAIClient.imageGenerate({
            model: this.IMAGE_MODEL,
            prompt: prompt.detailedPrompt,
            n: 1,
            size: '1920x1920',  // 3,686,400像素，满足豆包最小要求
            quality: 'standard',
            // 🔧 不添加logo水印，避免"AI生成"字样
            logo_info: {
              add_logo: false
            }
          });

          if (!response.success || !response.data?.images?.[0]) {
            throw new Error(response.error || '图片生成失败');
          }

          return {
            id: prompt.id,
            description: prompt.description,
            url: response.data.images[0].url || '',
            order: index
          };
        })
      );

      await this.updateProgress(taskId, 60, '图片生成完成');
      return images;
    } catch (error) {
      console.error('❌ [互动课程] 图片生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成视频
   */
  private async generateVideo(prompt: string, taskId: string): Promise<any> {
    console.log('🎬 [互动课程] 生成视频...');
    await this.updateProgress(taskId, 70, '生成课程视频...');

    try {
      // 注意：视频生成可能需要较长时间
      const response = await unifiedAIBridge.processVideo({
        model: this.VIDEO_MODEL,
        prompt: prompt,
        duration: 30,
        size: '1280x720'
      });

      await this.updateProgress(taskId, 90, '视频生成完成');
      return {
        url: response.data?.[0]?.url || '',
        duration: 30,
        script: prompt
      };
    } catch (error) {
      console.error('❌ [互动课程] 视频生成失败:', error);
      // 视频生成失败不中断流程，返回空对象
      return { url: '', duration: 0, script: prompt };
    }
  }

  /**
   * 初始化进度
   */
  async initializeProgress(taskId: string): Promise<void> {
    try {
      await redisService.set(
        `curriculum:progress:${taskId}`,
        JSON.stringify({ progress: 0, stage: '分析课程需求...', timestamp: Date.now() }),
        3600 // 1小时过期
      );
      console.log(`✅ [互动课程] 进度已初始化: ${taskId}`);
    } catch (error) {
      console.error('❌ [互动课程] 初始化进度失败:', error);
    }
  }

  /**
   * 更新进度（公开方法，用于错误处理）
   */
  async updateProgress(taskId: string, progress: number, stage: string): Promise<void> {
    try {
      await redisService.set(
        `curriculum:progress:${taskId}`,
        JSON.stringify({ progress, stage, timestamp: Date.now() }),
        3600 // 1小时过期
      );
      console.log(`📊 [互动课程] 进度已更新: ${taskId} - ${progress}% - ${stage}`);
    } catch (error) {
      console.error('❌ [互动课程] 更新进度失败:', error);
    }
  }

  /**
   * 获取进度
   */
  async getProgress(taskId: string): Promise<any> {
    try {
      const data = await redisService.get(`curriculum:progress:${taskId}`);
      if (!data) {
        return { progress: 0, stage: '准备中...' };
      }
      // redisService.get() 已经解析了JSON，直接返回
      return data;
    } catch (error) {
      console.error('❌ [互动课程] 获取进度失败:', error);
      return { progress: 0, stage: '获取进度失败' };
    }
  }

  /**
   * 保存 Think 的思考过程
   */
  async saveThinkingProcess(taskId: string, thinkingProcess: string): Promise<void> {
    try {
      await redisService.set(
        `curriculum:thinking:${taskId}`,
        thinkingProcess,
        3600 // 1小时过期
      );
      console.log(`✅ [互动课程] Think 思考过程已保存: ${taskId}`);
    } catch (error) {
      console.error('❌ [互动课程] 保存 Think 思考过程失败:', error);
    }
  }

  /**
   * 获取 Think 的思考过程
   */
  async getThinkingProcess(taskId: string): Promise<string> {
    try {
      const data = await redisService.get(`curriculum:thinking:${taskId}`);
      return data || '';
    } catch (error) {
      console.error('❌ [互动课程] 获取 Think 思考过程失败:', error);
      return '';
    }
  }

  /**
   * 将 courseAnalysis 格式化为思考过程文本
   */
  private formatCourseAnalysisAsThinking(courseAnalysis: any): string {
    const lines: string[] = [];

    lines.push('# 🎯 课程分析与设计思路\n');

    if (courseAnalysis.title) {
      lines.push(`## 📚 课程标题\n${courseAnalysis.title}\n`);
    }

    if (courseAnalysis.domain) {
      lines.push(`## 🏷️ 课程领域\n${courseAnalysis.domain}\n`);
    }

    if (courseAnalysis.ageGroup) {
      lines.push(`## 👶 适用年龄\n${courseAnalysis.ageGroup}\n`);
    }

    if (courseAnalysis.objectives && courseAnalysis.objectives.length > 0) {
      lines.push('## 🎯 教学目标\n');
      courseAnalysis.objectives.forEach((obj: string, index: number) => {
        lines.push(`${index + 1}. ${obj}`);
      });
      lines.push('');
    }

    if (courseAnalysis.style) {
      lines.push(`## 🎨 视觉风格\n${courseAnalysis.style}\n`);
    }

    if (courseAnalysis.colorScheme) {
      lines.push(`## 🌈 色彩方案\n${courseAnalysis.colorScheme}\n`);
    }

    if (courseAnalysis.interactionStyle) {
      lines.push(`## 🖱️ 交互方式\n${courseAnalysis.interactionStyle}\n`);
    }

    return lines.join('\n');
  }
}

export const interactiveCurriculumService = new InteractiveCurriculumService();

