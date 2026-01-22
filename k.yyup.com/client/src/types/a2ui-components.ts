import type { A2UIComponentNode } from './a2ui-protocol'

/**
 * A2UI 组件类型定义
 * 教育互动课堂专用组件
 */

/**
 * 教育互动组件类型枚举
 */
export enum A2UIComponentType {
  /** 页面容器 */
  PAGE_CONTAINER = 'page-container',
  /** 卡片组件 */
  CARD = 'card',
  /** 按钮组件 */
  BUTTON = 'button',
  /** 图片展示 */
  IMAGE = 'image',
  /** 图片轮播 */
  IMAGE_CAROUSEL = 'image-carousel',
  /** 视频播放器 */
  VIDEO_PLAYER = 'video-player',
  /** 音频播放器 */
  AUDIO_PLAYER = 'audio-player',
  /** 文本展示 */
  TEXT = 'text',
  /** 富文本 */
  RICH_TEXT = 'rich-text',
  /** 进度条 */
  PROGRESS = 'progress',
  /** 计时器 */
  TIMER = 'timer',
  /** 倒计时 */
  COUNTDOWN = 'countdown',
  /** 题目/问答 */
  QUESTION = 'question',
  /** 选择题 */
  CHOICE_QUESTION = 'choice-question',
  /** 填空题 */
  FILL_BLANK_QUESTION = 'fill-blank-question',
  /** 拖拽排序 */
  DRAG_SORT = 'drag-sort',
  /** 拼图游戏 */
  PUZZLE_GAME = 'puzzle-game',
  /** 连线题 */
  CONNECT_LINE = 'connect-line',
  /** 涂鸦画板 */
  DRAWING_BOARD = 'drawing-board',
  /** 互动白板 */
  INTERACTIVE_WHITEBOARD = 'interactive-whiteboard',
  /** 星星评分 */
  STAR_RATING = 'star-rating',
  /** 点赞按钮 */
  LIKE_BUTTON = 'like-button',
  /** 标签/标记 */
  TAG = 'tag',
  /** 分页控制 */
  PAGINATION = 'pagination',
  /** 弹窗/对话框 */
  DIALOG = 'dialog',
  /** 步骤指示 */
  STEP_INDICATOR = 'step-indicator',
  /** 导航菜单 */
  NAVIGATION = 'navigation',
  /** 计时积分 */
  SCORE_BOARD = 'score-board',
  /** 奖励徽章 */
  BADGE = 'badge',
  /** 动画效果 */
  ANIMATION = 'animation',
  /** 场景切换 */
  SCENE_TRANSITION = 'scene-transition',
  /** 反馈面板 */
  FEEDBACK_PANEL = 'feedback-panel',
  /** 错误提示 */
  ERROR_TIP = 'error-tip',
  /** 加载指示器 */
  LOADING = 'loading',
  /** 空状态 */
  EMPTY_STATE = 'empty-state',
  /** 分组容器 */
  GROUP_CONTAINER = 'group-container',
  /** 条件渲染 */
  CONDITIONAL = 'conditional',
  /** 循环列表 */
  LIST_ITERATOR = 'list-iterator',
  /** 表单容器 */
  FORM_CONTAINER = 'form-container'
}

/**
 * 组件属性基类
 */
export interface A2UIComponentProps {
  /** 可见性 */
  visible?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 提示文字 */
  tooltip?: string;
  /** 点击事件 */
  onClick?: string;
}

/**
 * 页面容器属性
 */
export interface PageContainerProps extends A2UIComponentProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showFullscreen?: boolean;
  padding?: string;
  backgroundColor?: string;
}

/**
 * 按钮属性
 */
export interface ButtonProps extends A2UIComponentProps {
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text';
  size: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  block?: boolean;
  round?: boolean;
  circle?: boolean;
  confirm?: boolean;
  confirmMessage?: string;
}

/**
 * 图片展示属性
 */
export interface ImageProps extends A2UIComponentProps {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  rounded?: boolean;
  shadow?: boolean;
  preview?: boolean;
}

/**
 * 图片轮播属性
 */
export interface ImageCarouselProps extends A2UIComponentProps {
  images: Array<{
    id: string;
    src: string;
    alt?: string;
    title?: string;
    description?: string;
  }>;
  autoplay?: boolean;
  interval?: number;
  indicatorPosition?: 'inside' | 'outside' | 'none';
  arrowPosition?: 'always' | 'hover' | 'never';
  height?: string | number;
}

/**
 * 视频播放器属性
 */
export interface VideoPlayerProps extends A2UIComponentProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  playbackRate?: number;
}

/**
 * 音频播放器属性
 */
export interface AudioPlayerProps extends A2UIComponentProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
  showProgress?: boolean;
}

/**
 * 文本展示属性
 */
export interface TextProps extends A2UIComponentProps {
  content: string;
  size?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: string;
  lineHeight?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre-wrap';
}

/**
 * 富文本属性
 */
export interface RichTextProps extends A2UIComponentProps {
  html: string;
  maxHeight?: string | number;
  showExpand?: boolean;
}

/**
 * 进度条属性
 */
export interface ProgressProps extends A2UIComponentProps {
  percentage: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
  status?: 'success' | 'exception' | 'warning';
}

/**
 * 计时器属性
 */
export interface TimerProps extends A2UIComponentProps {
  id: string;
  startTime: number;
  format: 'seconds' | 'minutes' | 'minutes-seconds' | 'full';
  autoStart?: boolean;
  onComplete?: string;
}

/**
 * 倒计时属性
 */
export interface CountdownProps extends A2UIComponentProps {
  id: string;
  duration: number;
  format: 'seconds' | 'minutes-seconds' | 'full';
  autoStart?: boolean;
  showProgress?: boolean;
  onComplete?: string;
  warningThreshold?: number;
}

/**
 * 题目组件属性
 */
export interface QuestionProps extends A2UIComponentProps {
  id: string;
  type: 'choice' | 'fill-blank' | 'true-false' | 'matching' | 'ordering';
  title: string;
  description?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    src: string;
  };
  options?: Array<{
    id: string;
    content: string;
    isCorrect?: boolean;
    feedback?: string;
  }>;
  answer?: string | string[];
  points?: number;
  hint?: string;
  explanation?: string;
  timeLimit?: number;
}

/**
 * 选择题属性
 */
export interface ChoiceQuestionProps extends QuestionProps {
  type: 'choice';
  multiSelect?: boolean;
  shuffleOptions?: boolean;
}

/**
 * 填空题属性
 */
export interface FillBlankQuestionProps extends QuestionProps {
  type: 'fill-blank';
  blanks: Array<{
    id: string;
    placeholder?: string;
    answer: string;
    caseSensitive?: boolean;
  }>;
}

/**
 * 拖拽排序属性
 */
export interface DragSortProps extends A2UIComponentProps {
  id: string;
  items: Array<{
    id: string;
    content: string;
    image?: string;
  }>;
  correctOrder: string[];
  mode: 'vertical' | 'horizontal';
  allowFeedback?: boolean;
  showSuccessAnimation?: boolean;
}

/**
 * 拼图游戏属性
 */
export interface PuzzleGameProps extends A2UIComponentProps {
  id: string;
  imageSrc: string;
  gridSize: 2 | 3 | 4 | 5;
  timeLimit?: number;
  showHint?: boolean;
  successScore?: number;
}

/**
 * 互动白板属性
 */
export interface InteractiveWhiteboardProps extends A2UIComponentProps {
  id: string;
  width: number;
  height: number;
  tools: Array<'pen' | 'eraser' | 'text' | 'shape' | 'image'>;
  defaultColor?: string;
  defaultStrokeWidth?: number;
  allowUndo?: boolean;
  allowRedo?: boolean;
  allowClear?: boolean;
  saveEnabled?: boolean;
}

/**
 * 星星评分属性
 */
export interface StarRatingProps extends A2UIComponentProps {
  id: string;
  maxStars: number;
  value: number;
  allowHalf?: boolean;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  colors?: { filled: string; empty: string };
  onChange?: string;
}

/**
 * 步骤指示器属性
 */
export interface StepIndicatorProps extends A2UIComponentProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: string;
  }>;
  currentStep: number;
  direction?: 'horizontal' | 'vertical';
  showNumber?: boolean;
}

/**
 * 积分板属性
 */
export interface ScoreBoardProps extends A2UIComponentProps {
  id: string;
  score: number;
  timeBonus?: number;
  combo?: number;
  maxScore?: number;
  showTimer?: boolean;
  timerValue?: number;
}

/**
 * 动画效果属性
 */
export interface AnimationProps extends A2UIComponentProps {
  type: 'fade-in' | 'fade-out' | 'slide-in' | 'slide-out' | 'zoom-in' | 'zoom-out' | 'bounce' | 'shake' | 'pulse' | 'custom';
  duration: number;
  delay?: number;
  easing?: string;
  trigger?: 'mount' | 'visible' | 'event';
  customKeyframes?: string;
}

/**
 * 场景切换属性
 */
export interface SceneTransitionProps extends A2UIComponentProps {
  currentScene: string;
  nextScene?: string;
  transitionType: 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'flip' | 'cube';
  duration: number;
  onTransitionEnd?: string;
}

/**
 * 对话框属性
 */
export interface DialogProps extends A2UIComponentProps {
  title: string;
  visible: boolean;
  width?: string;
  showClose?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  destroyOnClose?: boolean;
}

/**
 * 加载指示器属性
 */
export interface LoadingProps extends A2UIComponentProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
}

/**
 * 空状态属性
 */
export interface EmptyStateProps extends A2UIComponentProps {
  message: string;
  description?: string;
  image?: string;
  actionLabel?: string;
}

/**
 * 分组容器属性
 */
export interface GroupContainerProps extends A2UIComponentProps {
  direction: 'row' | 'column';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

/**
 * 条件渲染属性
 */
export interface ConditionalProps extends A2UIComponentProps {
  condition: string;
  ifTrue?: A2UIComponentNode[];
  ifFalse?: A2UIComponentNode[];
}

/**
 * 列表迭代器属性
 */
export interface ListIteratorProps extends A2UIComponentProps {
  dataPath: string;
  itemKey: string;
  itemComponent: A2UIComponentNode;
}

/**
 * 卡片属性
 */
export interface CardProps extends A2UIComponentProps {
  title?: string;
  bordered?: boolean;
  shadow?: 'never' | 'hover' | 'always';
  padding?: string;
  bodyStyle?: Record<string, string>;
}

/**
 * 标签属性
 */
export interface TagProps extends A2UIComponentProps {
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  round?: boolean;
  closable?: boolean;
}

/**
 * 徽章属性
 */
export interface BadgeProps extends A2UIComponentProps {
  value: number | string;
  max?: number;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  isDot?: boolean;
  hidden?: boolean;
}

/**
 * 反馈面板属性
 */
export interface FeedbackPanelProps extends A2UIComponentProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  showDetails?: boolean;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
    action: string;
  }>;
}

/**
 * 错误提示属性
 */
export interface ErrorTipProps extends A2UIComponentProps {
  message: string;
  icon?: string;
  showClose?: boolean;
}

/**
 * 题目选项
 */
export interface QuestionOption {
  id: string;
  content: string;
  isCorrect?: boolean;
  feedback?: string;
  imageUrl?: string;
}

/**
 * 题目反馈
 */
export interface QuestionFeedback {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  score?: number;
  stars?: number;
}

/**
 * 题目结果
 */
export interface QuestionResult {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  score: number;
  timeSpent: number;
  feedback: QuestionFeedback;
}

/**
 * 拖拽项
 */
export interface DragSortItem {
  id: string;
  content: string;
  image?: string;
  disabled?: boolean;
}

/**
 * 拖拽结果
 */
export interface DragSortResult {
  itemOrder: string[];
  isCorrect: boolean;
  correctOrder: string[];
  score: number;
}

/**
 * 拼图结果
 */
export interface PuzzleResult {
  isComplete: boolean;
  moves: number;
  timeSpent: number;
  score: number;
  stars: number;
}

/**
 * 白板绘制项
 */
export interface WhiteboardAction {
  id: string;
  type: 'path' | 'text' | 'shape' | 'image' | 'eraser';
  data: any;
  timestamp: number;
}

/**
 * 白板保存结果
 */
export interface WhiteboardSaveResult {
  imageData: string;
  imageUrl?: string;
  actions: WhiteboardAction[];
}
