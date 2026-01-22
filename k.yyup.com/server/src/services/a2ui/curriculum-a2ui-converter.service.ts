/**
 * A2UI 课程转换服务
 * 将课程计划转换为A2UI组件树
 */

import { componentTreeService } from './component-tree.service';
import type { A2UIComponentNode } from './a2ui-message.service';

/**
 * 课程活动类型
 */
export interface CourseActivity {
  id: string;
  type: 'choice' | 'fill-blank' | 'drag-sort' | 'puzzle' | 'drawing' | 'matching' | 'image-sort' | 'video-quiz';
  title?: string;
  instruction?: string;
  question?: string;
  options?: Array<{ id: string; text: string; isCorrect?: boolean; feedback?: string }>;
  blanks?: Array<{ id: string; hint?: string; answer: string }>;
  items?: Array<{ id: string; text: string; imageUrl?: string }>;
  correctOrder?: string[];
  imageUrl?: string;
  imageSrc?: string;
  gridSize?: 2 | 3 | 4;
  timeLimit?: number;
  points?: number;
}

/**
 * 课程计划接口
 */
export interface CurriculumPlan {
  id: string;
  title: string;
  description?: string;
  objectives?: string[];
  ageGroup?: string;
  duration?: number; // 预计时长（分钟）
  media?: {
    images?: Array<{ url: string; description?: string }>;
    videos?: Array<{ url: string; title?: string }>;
    audios?: Array<{ url: string; title?: string }>;
  };
  activities?: CourseActivity[];
  slides?: Array<{
    type: 'image' | 'video' | 'text';
    content: string;
    title?: string;
  }>;
}

/**
 * 课程转换服务类
 */
export class CurriculumA2UIConverter {

  /**
   * 将课程计划转换为A2UI组件树
   */
  convertCurriculumToA2UI(plan: CurriculumPlan): A2UIComponentNode {
    const children: A2UIComponentNode[] = [];

    // 1. 课程标题和描述
    children.push(this.createCourseHeader(plan));

    // 2. 学习目标（如果有）
    if (plan.objectives && plan.objectives.length > 0) {
      children.push(this.createObjectivesSection(plan.objectives));
    }

    // 3. 课程媒体内容
    if (plan.media) {
      const mediaChildren = this.createMediaSection(plan.media);
      if (mediaChildren) {
        children.push(mediaChildren);
      }
    }

    // 4. 幻灯片内容（如果有）
    if (plan.slides && plan.slides.length > 0) {
      children.push(this.createSlidesSection(plan.slides));
    }

    // 5. 互动练习（核心）
    if (plan.activities && plan.activities.length > 0) {
      const activitySection = this.createActivitiesSection(plan.activities);
      children.push(activitySection);
    }

    // 6. 步骤指示器（如果有多个环节）
    const steps = this.generateCourseSteps(plan);
    if (steps.length > 1) {
      const stepIndicator = componentTreeService.createStepIndicator(steps, 0);
      children.unshift(stepIndicator);
    }

    // 7. 积分板
    const scoreBoard = componentTreeService.createScoreBoard('score-board', 0, {
      showTimer: true,
      timerValue: (plan.duration || 30) * 60
    });
    children.push(scoreBoard);

    // 组装页面容器
    return componentTreeService.createPageContainer(
      plan.title,
      `适合年龄：${plan.ageGroup || '3-6岁'}  |  预计时长：${plan.duration || 30}分钟`,
      children
    );
  }

  /**
   * 创建课程头部
   */
  private createCourseHeader(plan: CurriculumPlan): A2UIComponentNode {
    const children: A2UIComponentNode[] = [
      componentTreeService.createText('course-title', plan.title, {
        size: '24px',
        weight: 'bold',
        color: '#303133'
      })
    ];

    if (plan.description) {
      children.push(componentTreeService.createText('course-description', plan.description, {
        size: '16px',
        color: '#606266',
        lineHeight: '1.6'
      }));
    }

    return componentTreeService.createCard('course-header', '课程信息', children, {
      padding: '20px'
    });
  }

  /**
   * 创建学习目标部分
   */
  private createObjectivesSection(objectives: string[]): A2UIComponentNode {
    const objectiveNodes = objectives.map((obj, index) =>
      componentTreeService.createText(`objective-${index}`, `• ${obj}`, {
        size: '16px',
        color: '#409EFF'
      })
    );

    return componentTreeService.createCard('course-objectives', '学习目标', objectiveNodes, {
      padding: '16px'
    });
  }

  /**
   * 创建媒体内容部分
   */
  private createMediaSection(media: CurriculumPlan['media']): A2UIComponentNode | null {
    const children: A2UIComponentNode[] = [];

    // 图片
    if (media.images && media.images.length > 0) {
      if (media.images.length === 1) {
        children.push(
          componentTreeService.createImage(
            'media-image-0',
            media.images[0].url,
            media.images[0].description
          )
        );
      } else {
        children.push(
          componentTreeService.createImageCarousel('media-carousel', media.images.map((img, index) => ({
            id: `slide-${index}`,
            src: img.url,
            alt: img.description || `图片 ${index + 1}`
          })))
        );
      }
    }

    // 视频
    if (media.videos && media.videos.length > 0) {
      media.videos.forEach((video, index) => {
        children.push(
          componentTreeService.createVideoPlayer(`media-video-${index}`, video.url)
        );
      });
    }

    if (children.length === 0) {
      return null;
    }

    return componentTreeService.createCard('course-media', '课程资源', children, {
      padding: '16px'
    });
  }

  /**
   * 创建幻灯片部分
   */
  private createSlidesSection(slides: CurriculumPlan['slides']): A2UIComponentNode {
    const slideChildren: A2UIComponentNode[] = [];

    slides.forEach((slide, index) => {
      const slideNodes: A2UIComponentNode[] = [];

      if (slide.title) {
        slideNodes.push(
          componentTreeService.createText(`slide-title-${index}`, slide.title, {
            size: '20px',
            weight: 'bold'
          })
        );
      }

      switch (slide.type) {
        case 'image':
          slideNodes.push(
            componentTreeService.createImage(`slide-image-${index}`, slide.content)
          );
          break;
        case 'video':
          slideNodes.push(
            componentTreeService.createVideoPlayer(`slide-video-${index}`, slide.content)
          );
          break;
        case 'text':
          slideNodes.push(
            componentTreeService.createText(`slide-text-${index}`, slide.content, {
              size: '16px',
              lineHeight: '1.8'
            })
          );
          break;
      }

      slideChildren.push(
        componentTreeService.createCard(`slide-${index}`, '', slideNodes, {
          padding: '16px'
        })
      );
    });

    return componentTreeService.createCard('course-slides', '课程内容', slideChildren, {
      padding: '16px'
    });
  }

  /**
   * 创建互动活动部分
   */
  private createActivitiesSection(activities: CourseActivity[]): A2UIComponentNode {
    const activityNodes = activities.map((activity, index) =>
      this.convertActivityToComponent(`activity-${index}`, activity)
    );

    return componentTreeService.createCard('course-activities', '互动练习', activityNodes, {
      padding: '16px'
    });
  }

  /**
   * 将活动转换为A2UI组件
   */
  private convertActivityToComponent(id: string, activity: CourseActivity): A2UIComponentNode {
    const children: A2UIComponentNode[] = [];

    // 活动标题
    if (activity.title) {
      children.push(
        componentTreeService.createText(`${id}-title`, activity.title, {
          size: '18px',
          weight: 'bold'
        })
      );
    }

    // 活动说明
    if (activity.instruction) {
      children.push(
        componentTreeService.createText(`${id}-instruction`, activity.instruction, {
          size: '14px',
          color: '#909399'
        })
      );
    }

    // 根据活动类型生成对应组件
    switch (activity.type) {
      case 'choice':
        children.push(this.createChoiceActivity(id, activity));
        break;
      case 'fill-blank':
        children.push(this.createFillBlankActivity(id, activity));
        break;
      case 'drag-sort':
        children.push(this.createDragSortActivity(id, activity));
        break;
      case 'puzzle':
        children.push(this.createPuzzleActivity(id, activity));
        break;
      case 'drawing':
        children.push(this.createDrawingActivity(id, activity));
        break;
      case 'image-sort':
        children.push(this.createImageSortActivity(id, activity));
        break;
      case 'video-quiz':
        children.push(this.createVideoQuizActivity(id, activity));
        break;
      default:
        children.push(
          componentTreeService.createEmptyState(`${id}-empty`, '活动类型暂未支持')
        );
    }

    // 添加提交按钮（如果有互动内容）
    if (['choice', 'fill-blank', 'drag-sort'].includes(activity.type)) {
      children.push(
        componentTreeService.createButton(`${id}-submit`, '提交答案', 'primary', { block: true })
      );
    }

    return componentTreeService.createGroupContainer(id, children, {
      gap: 12
    });
  }

  /**
   * 创建选择题活动
   */
  private createChoiceActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    const questionId = `${id}-question`;
    const options = (activity.options || []).map((opt, index) => ({
      id: opt.id || `option-${index}`,
      content: opt.text,
      isCorrect: opt.isCorrect
    }));

    return componentTreeService.createChoiceQuestion(
      questionId,
      activity.question || '请选择正确答案',
      options,
      {
        timeLimit: activity.timeLimit,
        points: activity.points || 10
      }
    );
  }

  /**
   * 创建填空题活动
   */
  private createFillBlankActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    const blanks = (activity.blanks || []).map((blank, index) => ({
      id: blank.id || `blank-${index}`,
      placeholder: blank.hint,
      answer: blank.answer
    }));

    return componentTreeService.createFillBlankQuestion(
      `${id}-question`,
      activity.question || '请填写正确答案',
      blanks,
      { timeLimit: activity.timeLimit, points: activity.points || 10 }
    );
  }

  /**
   * 创建拖拽排序活动
   */
  private createDragSortActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    const items = (activity.items || []).map((item, index) => ({
      id: item.id || `item-${index}`,
      content: item.text
    }));

    return componentTreeService.createDragSort(
      `${id}-sort`,
      items,
      activity.correctOrder || items.map(i => i.id),
      { showFeedback: true }
    );
  }

  /**
   * 创建拼图活动
   */
  private createPuzzleActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    return componentTreeService.createPuzzleGame(
      `${id}-puzzle`,
      activity.imageSrc || activity.imageUrl || '',
      activity.gridSize || 3,
      { timeLimit: activity.timeLimit, successScore: activity.points }
    );
  }

  /**
   * 创建绘画活动
   */
  private createDrawingActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    return componentTreeService.createGroupContainer(`${id}-drawing`, [
      componentTreeService.createWhiteboard(`${id}-whiteboard`, 800, 400, {
        tools: ['pen', 'eraser', 'text'],
        defaultColor: '#000000'
      }),
      componentTreeService.createButton(`${id}-save`, '保存作品', 'primary'),
      componentTreeService.createButton(`${id}-clear`, '清除', 'secondary')
    ], { gap: 16 });
  }

  /**
   * 创建图片排序活动
   */
  private createImageSortActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    const items = (activity.items || []).map((item, index) => ({
      id: item.id || `item-${index}`,
      content: item.text,
      image: item.imageUrl
    }));

    return componentTreeService.createDragSort(
      `${id}-sort`,
      items,
      activity.correctOrder || items.map(i => i.id),
      { showFeedback: true }
    );
  }

  /**
   * 创建视频问答活动
   */
  private createVideoQuizActivity(id: string, activity: CourseActivity): A2UIComponentNode {
    const children: A2UIComponentNode[] = [];

    // 视频播放器
    if (activity.imageUrl) {
      children.push(
        componentTreeService.createVideoPlayer(`${id}-video`, activity.imageUrl)
      );
    }

    // 题目
    if (activity.options) {
      children.push(this.createChoiceActivity(id, activity));
    }

    return componentTreeService.createCard(id, activity.title || '视频问答', children, {
      padding: '16px'
    });
  }

  /**
   * 生成课程步骤
   */
  private generateCourseSteps(plan: CurriculumPlan): Array<{ id: string; title: string; description?: string }> {
    const steps: Array<{ id: string; title: string; description?: string }> = [];

    steps.push({ id: 'intro', title: '导入', description: '课程介绍' });

    if (plan.media && (plan.media.images?.length || plan.media.videos?.length)) {
      steps.push({ id: 'media', title: '资源', description: '课程资源' });
    }

    if (plan.slides && plan.slides.length > 0) {
      steps.push({ id: 'content', title: '内容', description: '课程内容' });
    }

    if (plan.activities && plan.activities.length > 0) {
      steps.push({ id: 'activity-0', title: '练习', description: '互动练习' });
    }

    steps.push({ id: 'summary', title: '总结', description: '课程回顾' });

    return steps;
  }

  /**
   * 转换为Surface Update消息
   */
  createSurfaceUpdate(plan: CurriculumPlan): A2UIComponentNode {
    return this.convertCurriculumToA2UI(plan);
  }
}

// 导出单例
export const curriculumA2UIConverter = new CurriculumA2UIConverter();
