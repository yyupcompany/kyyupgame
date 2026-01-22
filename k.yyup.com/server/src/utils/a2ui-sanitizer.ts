/**
 * A2UI 输入验证和过滤工具
 * 提供服务器端的安全验证和净化功能
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// 创建JSDOM实例用于服务器端HTML净化
const window = new JSDOM('').window;
const domPurify = DOMPurify(window as any);

/**
 * 允许的组件类型白名单
 */
export const ALLOWED_COMPONENT_TYPES = [
  'page-container', 'card', 'button', 'image', 'image-carousel',
  'video-player', 'audio-player', 'text', 'rich-text', 'progress',
  'timer', 'countdown', 'question', 'choice-question', 'fill-blank-question',
  'drag-sort', 'puzzle-game', 'interactive-whiteboard', 'star-rating',
  'step-indicator', 'score-board', 'animation', 'dialog', 'loading',
  'empty-state', 'group-container', 'conditional', 'list-iterator',
  'tag', 'badge', 'feedback-panel', 'error-tip', 'form-container',
  'like-button', 'pagination', 'navigation', 'connect-line', 'drawing-board',
  'scene-transition'
] as const;

export type AllowedComponentType = typeof ALLOWED_COMPONENT_TYPES[number];

/**
 * 每个组件类型允许的属性
 */
const COMPONENT_ALLOWED_PROPS: Record<string, string[]> = {
  'text': ['content', 'size', 'color', 'align', 'weight', 'lineHeight', 'whiteSpace'],
  'image': ['src', 'alt', 'width', 'height', 'fit', 'rounded', 'shadow', 'preview'],
  'button': ['label', 'variant', 'size', 'icon', 'block', 'disabled', 'round', 'circle', 'confirm', 'confirmMessage'],
  'card': ['title', 'bordered', 'shadow', 'padding', 'bodyStyle'],
  'video-player': ['src', 'poster', 'autoplay', 'controls', 'loop', 'muted', 'width', 'height', 'playbackRate'],
  'audio-player': ['src', 'autoplay', 'loop', 'volume', 'showProgress'],
  'choice-question': ['title', 'description', 'media', 'options', 'points', 'hint', 'explanation', 'timeLimit', 'multiSelect', 'shuffleOptions'],
  'fill-blank-question': ['title', 'description', 'media', 'blanks', 'points', 'hint', 'explanation', 'timeLimit'],
  'drag-sort': ['items', 'correctOrder', 'mode', 'allowFeedback', 'showSuccessAnimation'],
  'puzzle-game': ['imageSrc', 'gridSize', 'timeLimit', 'showHint', 'successScore'],
  'interactive-whiteboard': ['width', 'height', 'tools', 'defaultColor', 'defaultStrokeWidth', 'allowUndo', 'allowRedo', 'allowClear', 'saveEnabled'],
  'star-rating': ['maxStars', 'value', 'allowHalf', 'readonly', 'size', 'colors'],
  'step-indicator': ['steps', 'currentStep', 'direction', 'showNumber'],
  'score-board': ['score', 'timeBonus', 'combo', 'maxScore', 'showTimer', 'timerValue'],
  'animation': ['type', 'duration', 'delay', 'easing', 'trigger', 'customKeyframes'],
  'dialog': ['title', 'visible', 'width', 'showClose', 'closeOnClickModal', 'closeOnPressEscape', 'destroyOnClose'],
  'loading': ['text', 'size', 'fullscreen'],
  'empty-state': ['message', 'description', 'image', 'actionLabel'],
  'group-container': ['direction', 'gap', 'align', 'justify'],
  'tag': ['label', 'type', 'size', 'round', 'closable'],
  'badge': ['value', 'max', 'type', 'isDot', 'hidden'],
  'feedback-panel': ['type', 'title', 'message', 'showDetails', 'actions'],
  'error-tip': ['message', 'icon', 'showClose'],
  'progress': ['percentage', 'max', 'showLabel', 'color', 'height', 'status'],
  'timer': ['startTime', 'format', 'autoStart', 'onComplete'],
  'countdown': ['duration', 'format', 'autoStart', 'showProgress', 'onComplete', 'warningThreshold'],
  'page-container': ['title', 'subtitle', 'showBack', 'showFullscreen', 'padding', 'backgroundColor'],
  'rich-text': ['html', 'maxHeight', 'showExpand'],
  'list-iterator': ['dataPath', 'itemKey'],
  'conditional': ['condition']
};

/**
 * 通用的安全属性
 */
const GENERAL_ALLOWED_PROPS = ['visible', 'disabled', 'loading', 'tooltip', 'onClick', 'className', 'style', 'id'];

/**
 * 验证组件类型是否在白名单中
 */
export function validateComponentType(type: string): type is AllowedComponentType {
  return ALLOWED_COMPONENT_TYPES.includes(type as AllowedComponentType);
}

/**
 * 验证和净化组件属性
 */
export function sanitizeComponentProps(
  type: string,
  props: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  // 获取允许的属性列表
  const allowedProps = COMPONENT_ALLOWED_PROPS[type] || [];
  const allAllowed = [...allowedProps, ...GENERAL_ALLOWED_PROPS];

  for (const [key, value] of Object.entries(props)) {
    // 只保留允许的属性
    if (allAllowed.includes(key)) {
      sanitized[key] = sanitizeValue(key, value, type);
    }
  }

  return sanitized;
}

/**
 * 净化单个值
 */
function sanitizeValue(key: string, value: any, componentType: string): any {
  // 处理null和undefined
  if (value === null || value === undefined) {
    return undefined;
  }

  // 字符串类型：防止XSS
  if (typeof value === 'string') {
    // 文本内容属性 - 完全移除HTML
    if (['content', 'title', 'label', 'description', 'message', 'text', 'hint', 'explanation'].includes(key)) {
      return domPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      }).trim();
    }

    // URL属性 - 验证格式
    if (key === 'src' || key === 'href' || key === 'poster' || key === 'imageSrc' || key === 'url') {
      return sanitizeUrl(value);
    }

    // 样式属性
    if (key === 'style' || key.endsWith('Style')) {
      return sanitizeStyle(value);
    }

    // 通用字符串 - 转义HTML实体
    return escapeHtml(value);
  }

  // 数组类型：验证每个元素
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return sanitizeComponentProps(componentType, item);
      }
      return sanitizeValue(`${key}[${index}]`, item, componentType);
    });
  }

  // 对象类型：递归净化
  if (typeof value === 'object' && value !== null) {
    // 特殊处理media对象
    if (key === 'media') {
      return sanitizeMediaObject(value);
    }
    // 特殊处理options数组
    if (key === 'options') {
      return sanitizeOptionsArray(value);
    }
    // 特殊处理blanks数组
    if (key === 'blanks') {
      return sanitizeBlanksArray(value);
    }
    // 特殊处理items数组
    if (key === 'items') {
      return sanitizeItemsArray(value);
    }
    // 特殊处理steps数组
    if (key === 'steps') {
      return sanitizeStepsArray(value);
    }
    // 特殊处理actions数组
    if (key === 'actions') {
      return sanitizeActionsArray(value);
    }
    // 特殊处理colors对象
    if (key === 'colors') {
      return sanitizeColorsObject(value);
    }

    return sanitizeComponentProps(componentType, value);
  }

  // 基本类型：直接返回
  return value;
}

/**
 * 净化URL
 */
function sanitizeUrl(url: string): string {
  // 移除潜在的危险协议
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  for (const protocol of dangerousProtocols) {
    if (url.toLowerCase().startsWith(protocol)) {
      console.warn(`[A2UI Sanitizer] 危险的URL协议: ${protocol}`);
      return '';
    }
  }

  // 允许的协议
  const allowedProtocols = ['https:', 'http:', '/', '#'];

  for (const protocol of allowedProtocols) {
    if (url.startsWith(protocol)) {
      return url;
    }
  }

  // 如果是相对路径，添加安全的相对路径检查
  if (!url.startsWith('//') && !url.startsWith('data:')) {
    return url;
  }

  console.warn(`[A2UI Sanitizer] 无效的URL: ${url}`);
  return '';
}

/**
 * 净化CSS样式
 */
function sanitizeStyle(style: string | Record<string, string>): string | Record<string, string> {
  // 字符串样式
  if (typeof style === 'string') {
    // 移除危险的CSS函数和属性
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript\s*:/gi,
      /behavior\s*:/gi,
      /-moz-binding\s*:/gi,
      /@import/gi,
      /url\s*\(/gi
    ];

    let sanitized = style;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, (match) => {
        console.warn(`[A2UI Sanitizer] 发现危险CSS: ${match}`);
        return '[removed]';
      });
    }

    return sanitized;
  }

  // 对象样式
  const sanitized: Record<string, string> = {};
  const allowedProperties = [
    'width', 'height', 'margin', 'padding', 'border', 'border-radius',
    'background', 'background-color', 'color', 'font-size', 'font-weight',
    'text-align', 'line-height', 'opacity', 'display', 'flex', 'flex-direction',
    'justify-content', 'align-items', 'gap', 'overflow', 'position', 'top',
    'left', 'right', 'bottom', 'z-index', 'box-shadow', 'transition',
    'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'border-radius', 'border-color', 'border-width', 'border-style'
  ];

  const dangerousValues = ['expression(', 'javascript:', 'behavior:', '-moz-binding('];

  for (const [key, value] of Object.entries(style)) {
    if (allowedProperties.includes(key)) {
      let safeValue = value;
      for (const danger of dangerousValues) {
        if (safeValue.includes(danger)) {
          console.warn(`[A2UI Sanitizer] 发现危险CSS值: ${danger}`);
          safeValue = '';
          break;
        }
      }
      sanitized[key] = safeValue;
    }
  }

  return sanitized;
}

/**
 * 净化media对象
 */
function sanitizeMediaObject(media: any): { type: string; src: string } | undefined {
  if (!media || typeof media !== 'object') {
    return undefined;
  }

  const sanitized: any = {};

  if (media.type && ['image', 'video', 'audio'].includes(media.type)) {
    sanitized.type = media.type;
  }

  if (media.src && typeof media.src === 'string') {
    sanitized.src = sanitizeUrl(media.src);
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * 净化选项数组
 */
function sanitizeOptionsArray(options: any[]): Array<{ id: string; content: string; isCorrect?: boolean; feedback?: string }> {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((opt, index) => {
    const sanitized: any = {};

    if (opt.id && typeof opt.id === 'string') {
      sanitized.id = opt.id;
    } else {
      sanitized.id = `option-${index}`;
    }

    if (opt.content && typeof opt.content === 'string') {
      sanitized.content = escapeHtml(opt.content);
    }

    if (typeof opt.isCorrect === 'boolean') {
      sanitized.isCorrect = opt.isCorrect;
    }

    if (opt.feedback && typeof opt.feedback === 'string') {
      sanitized.feedback = escapeHtml(opt.feedback);
    }

    return sanitized;
  });
}

/**
 * 净化填空数组
 */
function sanitizeBlanksArray(blanks: any[]): Array<{ id: string; placeholder?: string; answer: string; caseSensitive?: boolean }> {
  if (!Array.isArray(blanks)) {
    return [];
  }

  return blanks.map((blank, index) => {
    const sanitized: any = {};

    if (blank.id && typeof blank.id === 'string') {
      sanitized.id = blank.id;
    } else {
      sanitized.id = `blank-${index}`;
    }

    if (blank.placeholder && typeof blank.placeholder === 'string') {
      sanitized.placeholder = escapeHtml(blank.placeholder);
    }

    if (blank.answer && typeof blank.answer === 'string') {
      sanitized.answer = escapeHtml(blank.answer);
    }

    if (typeof blank.caseSensitive === 'boolean') {
      sanitized.caseSensitive = blank.caseSensitive;
    }

    return sanitized;
  });
}

/**
 * 净化拖拽项数组
 */
function sanitizeItemsArray(items: any[]): Array<{ id: string; content: string; image?: string }> {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const sanitized: any = {};

    if (item.id && typeof item.id === 'string') {
      sanitized.id = item.id;
    } else {
      sanitized.id = `item-${index}`;
    }

    if (item.content && typeof item.content === 'string') {
      sanitized.content = escapeHtml(item.content);
    }

    if (item.image && typeof item.image === 'string') {
      sanitized.image = sanitizeUrl(item.image);
    }

    return sanitized;
  });
}

/**
 * 净化步骤数组
 */
function sanitizeStepsArray(steps: any[]): Array<{ id: string; title: string; description?: string; icon?: string }> {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step, index) => {
    const sanitized: any = {};

    if (step.id && typeof step.id === 'string') {
      sanitized.id = step.id;
    } else {
      sanitized.id = `step-${index}`;
    }

    if (step.title && typeof step.title === 'string') {
      sanitized.title = escapeHtml(step.title);
    }

    if (step.description && typeof step.description === 'string') {
      sanitized.description = escapeHtml(step.description);
    }

    if (step.icon && typeof step.icon === 'string') {
      sanitized.icon = escapeHtml(step.icon);
    }

    return sanitized;
  });
}

/**
 * 净化操作数组
 */
function sanitizeActionsArray(actions: any[]): Array<{ label: string; variant: string; action: string }> {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions.map((action, index) => {
    const sanitized: any = {};

    if (action.label && typeof action.label === 'string') {
      sanitized.label = escapeHtml(action.label);
    }

    if (action.variant && ['primary', 'secondary'].includes(action.variant)) {
      sanitized.variant = action.variant;
    }

    if (action.action && typeof action.action === 'string') {
      sanitized.action = escapeHtml(action.action);
    }

    return sanitized;
  });
}

/**
 * 净化颜色对象
 */
function sanitizeColorsObject(colors: any): { filled: string; empty: string } | undefined {
  if (!colors || typeof colors !== 'object') {
    return undefined;
  }

  const sanitized: any = {};

  if (colors.filled && typeof colors.filled === 'string' && colors.filled.startsWith('#')) {
    sanitized.filled = colors.filled;
  }

  if (colors.empty && typeof colors.empty === 'string' && colors.empty.startsWith('#')) {
    sanitized.empty = colors.empty;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * HTML实体转义
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#47;',
    '`': '&#96;',
    '=': '&#61;'
  };

  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * 验证组件树
 */
export function validateComponentTree(node: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function validate(currentNode: any, path: string) {
    if (!currentNode) {
      errors.push(`${path}: 节点为空`);
      return;
    }

    if (!currentNode.type) {
      errors.push(`${path}: 缺少type属性`);
      return;
    }

    if (!validateComponentType(currentNode.type)) {
      errors.push(`${path}: 无效的组件类型: ${currentNode.type}`);
    }

    if (!currentNode.id) {
      errors.push(`${path}: 缺少id属性`);
    }

    // 验证和净化属性
    if (currentNode.props) {
      currentNode.props = sanitizeComponentProps(currentNode.type, currentNode.props);
    }

    // 递归验证子节点
    if (currentNode.children && Array.isArray(currentNode.children)) {
      currentNode.children.forEach((child: any, index: number) => {
        validate(child, `${path}.children[${index}]`);
      });
    }
  }

  validate(node, 'root');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证事件负载
 */
export function sanitizeEventPayload(payload: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'answer' || key === 'text' || key === 'content' || key === 'userInput') {
      // 用户输入的文本内容
      sanitized[key] = typeof value === 'string'
        ? domPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
        : value;
    } else if (key === 'imageData' || key.startsWith('image')) {
      // 图片数据 - 验证base64格式
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        sanitized[key] = value;
      }
    } else if (key === 'order' || key === 'correctOrder') {
      // 数组类型的顺序
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item, index) =>
          typeof item === 'string' ? escapeHtml(item) : item
        );
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeEventPayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 验证会话ID
 */
export function validateSessionId(sessionId: string): boolean {
  // 验证UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

/**
 * 验证消息ID
 */
export function validateMessageId(messageId: string): boolean {
  // 消息ID可以是UUID或时间戳+随机数
  if (!messageId || typeof messageId !== 'string') {
    return false;
  }
  return messageId.length >= 8 && messageId.length <= 128;
}

/**
 * 创建安全错误响应
 */
export function createSecurityError(code: string, message: string, originalMessageId?: string): object {
  return {
    success: false,
    error: {
      code,
      message: `[安全拒绝] ${message}`,
      originalMessageId
    }
  };
}
