/**
 * A2UI 组件树生成服务
 * 用于将课程数据转换为A2UI组件树
 */

import type {
  A2UIComponentNode,
  A2UISurfaceUpdate,
  A2UIMessage
} from './a2ui-message.service';
import { A2UIMessageType } from './a2ui-message.service';

/**
 * 组件属性接口
 */
interface ComponentProps {
  [key: string]: any;
}

/**
 * 组件树生成服务类
 */
export class ComponentTreeService {

  /**
   * 生成页面容器组件
   */
  createPageContainer(
    title: string,
    subtitle?: string,
    children: A2UIComponentNode[] = []
  ): A2UIComponentNode {
    return {
      type: 'page-container',
      id: 'page-container-main',
      props: {
        title,
        subtitle: subtitle || '',
        showBack: true,
        showFullscreen: true,
        padding: '20px'
      },
      children
    };
  }

  /**
   * 生成卡片组件
   */
  createCard(
    id: string,
    title: string,
    children: A2UIComponentNode[] = [],
    options: { bordered?: boolean; shadow?: 'never' | 'hover' | 'always'; padding?: string } = {}
  ): A2UIComponentNode {
    return {
      type: 'card',
      id,
      props: {
        title,
        bordered: options.bordered ?? true,
        shadow: options.shadow ?? 'hover',
        padding: options.padding ?? '16px'
      },
      children
    };
  }

  /**
   * 生成按钮组件
   */
  createButton(
    id: string,
    label: string,
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' = 'primary',
    options: { size?: 'small' | 'medium' | 'large'; icon?: string; block?: boolean; disabled?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'button',
      id,
      props: {
        label,
        variant,
        size: options.size || 'medium',
        icon: options.icon,
        block: options.block ?? false,
        disabled: options.disabled ?? false
      }
    };
  }

  /**
   * 生成图片组件
   */
  createImage(
    id: string,
    src: string,
    alt?: string,
    options: { width?: string | number; height?: string | number; fit?: 'cover' | 'contain' | 'fill' | 'none'; rounded?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'image',
      id,
      props: {
        src,
        alt: alt || '',
        width: options.width || '100%',
        height: options.height || 'auto',
        fit: options.fit || 'cover',
        rounded: options.rounded ?? true
      }
    };
  }

  /**
   * 生成图片轮播组件
   */
  createImageCarousel(
    id: string,
    images: Array<{ id: string; src: string; alt?: string; title?: string }>,
    options: { autoplay?: boolean; interval?: number; height?: string | number } = {}
  ): A2UIComponentNode {
    return {
      type: 'image-carousel',
      id,
      props: {
        images,
        autoplay: options.autoplay ?? true,
        interval: options.interval || 3000,
        height: options.height || '400px',
        indicatorPosition: 'inside',
        arrowPosition: 'hover'
      }
    };
  }

  /**
   * 生成视频播放器组件
   */
  createVideoPlayer(
    id: string,
    src: string,
    poster?: string,
    options: { autoplay?: boolean; controls?: boolean; width?: string | number; height?: string | number } = {}
  ): A2UIComponentNode {
    return {
      type: 'video-player',
      id,
      props: {
        src,
        poster: poster || '',
        autoplay: options.autoplay ?? false,
        controls: options.controls ?? true,
        width: options.width || '100%',
        height: options.height || '400px'
      }
    };
  }

  /**
   * 生成音频播放器组件
   */
  createAudioPlayer(
    id: string,
    src: string,
    options: { autoplay?: boolean; loop?: boolean; volume?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'audio-player',
      id,
      props: {
        src,
        autoplay: options.autoplay ?? false,
        loop: options.loop ?? false,
        volume: options.volume ?? 1,
        showProgress: true
      }
    };
  }

  /**
   * 生成文本组件
   */
  createText(
    id: string,
    content: string,
    options: { size?: string; color?: string; align?: 'left' | 'center' | 'right'; weight?: string; lineHeight?: string } = {}
  ): A2UIComponentNode {
    return {
      type: 'text',
      id,
      props: {
        content,
        size: options.size || '16px',
        color: options.color || '#333',
        align: options.align || 'left',
        weight: options.weight || 'normal',
        lineHeight: options.lineHeight
      }
    };
  }

  /**
   * 生成进度条组件
   */
  createProgress(
    id: string,
    percentage: number,
    options: { max?: number; showLabel?: boolean; color?: string; height?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'progress',
      id,
      props: {
        percentage,
        max: options.max || 100,
        showLabel: options.showLabel ?? true,
        color: options.color || '#409EFF',
        height: options.height || 8
      }
    };
  }

  /**
   * 生成计时器组件
   */
  createTimer(
    id: string,
    options: { startTime?: number; format?: 'seconds' | 'minutes' | 'minutes-seconds' | 'full'; autoStart?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'timer',
      id,
      props: {
        id,
        startTime: options.startTime || 0,
        format: options.format || 'minutes-seconds',
        autoStart: options.autoStart ?? false
      }
    };
  }

  /**
   * 生成倒计时组件
   */
  createCountdown(
    id: string,
    duration: number,
    options: { format?: 'seconds' | 'minutes-seconds' | 'full'; autoStart?: boolean; showProgress?: boolean; warningThreshold?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'countdown',
      id,
      props: {
        id,
        duration,
        format: options.format || 'minutes-seconds',
        autoStart: options.autoStart ?? false,
        showProgress: options.showProgress ?? true,
        warningThreshold: options.warningThreshold || 30
      }
    };
  }

  /**
   * 生成选择题组件
   */
  createChoiceQuestion(
    id: string,
    question: string,
    options: Array<{ id: string; content: string; isCorrect?: boolean }>,
    settings: { multiSelect?: boolean; shuffle?: boolean; timeLimit?: number; points?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'choice-question',
      id,
      props: {
        id,
        type: 'choice',
        title: question,
        options,
        multiSelect: settings.multiSelect ?? false,
        shuffleOptions: settings.shuffle ?? false,
        timeLimit: settings.timeLimit,
        points: settings.points || 10,
        showHint: true
      }
    };
  }

  /**
   * 生成填空题组件
   */
  createFillBlankQuestion(
    id: string,
    question: string,
    blanks: Array<{ id: string; placeholder?: string; answer: string }>,
    options: { timeLimit?: number; points?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'fill-blank-question',
      id,
      props: {
        id,
        type: 'fill-blank',
        title: question,
        blanks,
        timeLimit: options.timeLimit,
        points: options.points || 10,
        showHint: true
      }
    };
  }

  /**
   * 生成拖拽排序组件
   */
  createDragSort(
    id: string,
    items: Array<{ id: string; content: string }>,
    correctOrder: string[],
    options: { mode?: 'vertical' | 'horizontal'; showFeedback?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'drag-sort',
      id,
      props: {
        id,
        items,
        correctOrder,
        mode: options.mode || 'vertical',
        allowFeedback: options.showFeedback ?? true,
        showSuccessAnimation: true
      }
    };
  }

  /**
   * 生成拼图游戏组件
   */
  createPuzzleGame(
    id: string,
    imageSrc: string,
    gridSize: 2 | 3 | 4,
    options: { timeLimit?: number; showHint?: boolean; successScore?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'puzzle-game',
      id,
      props: {
        id,
        imageSrc,
        gridSize,
        timeLimit: options.timeLimit,
        showHint: options.showHint ?? true,
        successScore: options.successScore || 100
      }
    };
  }

  /**
   * 生成互动白板组件
   */
  createWhiteboard(
    id: string,
    width: number = 800,
    height: number = 600,
    options: { tools?: Array<'pen' | 'eraser' | 'text' | 'shape' | 'image'>; defaultColor?: string } = {}
  ): A2UIComponentNode {
    return {
      type: 'interactive-whiteboard',
      id,
      props: {
        id,
        width,
        height,
        tools: options.tools || ['pen', 'eraser', 'text', 'shape'],
        defaultColor: options.defaultColor || '#000000',
        defaultStrokeWidth: 3,
        allowUndo: true,
        allowRedo: true,
        allowClear: true,
        saveEnabled: true
      }
    };
  }

  /**
   * 生成星星评分组件
   */
  createStarRating(
    id: string,
    maxStars: number = 5,
    value: number = 0,
    options: { allowHalf?: boolean; readonly?: boolean; size?: 'small' | 'medium' | 'large' } = {}
  ): A2UIComponentNode {
    return {
      type: 'star-rating',
      id,
      props: {
        id,
        maxStars,
        value,
        allowHalf: options.allowHalf ?? true,
        readonly: options.readonly ?? false,
        size: options.size || 'medium',
        colors: { filled: '#F7BA2A', empty: '#C6D1DE' }
      }
    };
  }

  /**
   * 生成步骤指示器组件
   */
  createStepIndicator(
    steps: Array<{ id: string; title: string; description?: string }>,
    currentStep: number
  ): A2UIComponentNode {
    return {
      type: 'step-indicator',
      id: 'step-indicator-main',
      props: {
        steps,
        currentStep,
        direction: 'horizontal',
        showNumber: true
      }
    };
  }

  /**
   * 生成积分板组件
   */
  createScoreBoard(
    id: string,
    score: number,
    options: { timeBonus?: number; combo?: number; maxScore?: number; showTimer?: boolean; timerValue?: number } = {}
  ): A2UIComponentNode {
    return {
      type: 'score-board',
      id,
      props: {
        id,
        score,
        timeBonus: options.timeBonus || 0,
        combo: options.combo || 0,
        maxScore: options.maxScore || 100,
        showTimer: options.showTimer ?? false,
        timerValue: options.timerValue || 0
      }
    };
  }

  /**
   * 生成动画效果组件
   */
  createAnimation(
    id: string,
    type: 'fade-in' | 'slide-in' | 'zoom-in' | 'bounce' | 'pulse',
    duration: number = 500,
    child?: A2UIComponentNode
  ): A2UIComponentNode {
    return {
      type: 'animation',
      id,
      props: {
        type,
        duration,
        easing: 'ease-out',
        trigger: 'mount'
      },
      children: child ? [child] : undefined
    };
  }

  /**
   * 生成容器组组件
   */
  createGroupContainer(
    id: string,
    children: A2UIComponentNode[],
    options: { direction?: 'row' | 'column'; gap?: number; align?: 'start' | 'center' | 'end' | 'stretch' } = {}
  ): A2UIComponentNode {
    return {
      type: 'group-container',
      id,
      props: {
        direction: options.direction || 'column',
        gap: options.gap || 16,
        align: options.align || 'stretch'
      },
      children
    };
  }

  /**
   * 生成对话框组件
   */
  createDialog(
    id: string,
    title: string,
    children: A2UIComponentNode[],
    options: { visible?: boolean; width?: string; showClose?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'dialog',
      id,
      props: {
        title,
        visible: options.visible ?? false,
        width: options.width || '50%',
        showClose: options.showClose ?? true,
        closeOnClickModal: true
      },
      children
    };
  }

  /**
   * 生成加载指示器组件
   */
  createLoading(
    id: string,
    text: string = '加载中...',
    options: { size?: 'small' | 'medium' | 'large'; fullscreen?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'loading',
      id,
      props: {
        text,
        size: options.size || 'medium',
        fullscreen: options.fullscreen ?? false
      }
    };
  }

  /**
   * 生成空状态组件
   */
  createEmptyState(
    id: string,
    message: string,
    options: { description?: string; image?: string } = {}
  ): A2UIComponentNode {
    return {
      type: 'empty-state',
      id,
      props: {
        message,
        description: options.description,
        image: options.image
      }
    };
  }

  /**
   * 生成标签组件
   */
  createTag(
    id: string,
    label: string,
    type: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary'
  ): A2UIComponentNode {
    return {
      type: 'tag',
      id,
      props: {
        label,
        type,
        round: true
      }
    };
  }

  /**
   * 生成徽章组件
   */
  createBadge(
    id: string,
    value: number | string,
    options: { max?: number; type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'; isDot?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'badge',
      id,
      props: {
        value,
        max: options.max || 99,
        type: options.type || 'danger',
        isDot: options.isDot ?? false
      }
    };
  }

  /**
   * 生成富文本组件
   */
  createRichText(
    id: string,
    html: string,
    options: { maxHeight?: string | number; showExpand?: boolean } = {}
  ): A2UIComponentNode {
    return {
      type: 'rich-text',
      id,
      props: {
        html,
        maxHeight: options.maxHeight,
        showExpand: options.showExpand ?? true
      }
    };
  }

  /**
   * 生成条件渲染组件
   */
  createConditional(
    id: string,
    condition: boolean | string | number,
    children: A2UIComponentNode[]
  ): A2UIComponentNode {
    return {
      type: 'conditional',
      id,
      props: {
        condition
      },
      children
    };
  }

  /**
   * 生成列表迭代器组件
   */
  createListIterator(
    id: string,
    items: any[],
    itemTemplate: A2UIComponentNode
  ): A2UIComponentNode {
    return {
      type: 'list-iterator',
      id,
      props: {
        items,
        itemTemplate
      }
    };
  }

  /**
   * 生成题目基础组件
   */
  createQuestion(
    id: string,
    title: string,
    questionNumber?: string,
    options: { hint?: string; showSubmit?: boolean; submitText?: string } = {}
  ): A2UIComponentNode {
    return {
      type: 'question',
      id,
      props: {
        title,
        questionNumber,
        hint: options.hint,
        showHint: !!options.hint,
        showSubmit: options.showSubmit ?? true,
        submitText: options.submitText || '提交答案',
        canSubmit: false
      }
    };
  }

  /**
   * 🎵 生成音频元数据组件（用于TTS语音和音效配置）
   * 这是一个隐藏组件，用于存储音频配置信息
   */
  createAudioMeta(
    id: string,
    audioConfig: {
      url: string;
      text?: string;
      autoPlay?: boolean;
      delay?: number;
      volume?: number;
      loop?: boolean;
    }
  ): A2UIComponentNode {
    return {
      type: 'audio-meta',
      id,
      props: {
        audioUrl: audioConfig.url,
        audioText: audioConfig.text || '',
        autoPlay: audioConfig.autoPlay ?? false,
        playDelay: audioConfig.delay ?? 0,
        volume: audioConfig.volume ?? 1.0,
        loop: audioConfig.loop ?? false
      },
      audio: {
        ttsUrl: audioConfig.url,
        ttsText: audioConfig.text,
        autoPlay: audioConfig.autoPlay ?? false,
        playDelay: audioConfig.delay ?? 0,
        volume: audioConfig.volume ?? 1.0,
        loop: audioConfig.loop ?? false
      }
    };
  }
}

// 导出单例
export const componentTreeService = new ComponentTreeService();
