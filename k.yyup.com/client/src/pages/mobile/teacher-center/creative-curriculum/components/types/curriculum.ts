/**
 * 创意课程生成器 - 类型定义 (移动端优化版本)
 */

// 五大领域课程类型
export enum CurriculumDomain {
  HEALTH = 'health',           // 健康领域
  LANGUAGE = 'language',       // 语言领域
  SOCIAL = 'social',           // 社会领域
  SCIENCE = 'science',         // 科学领域
  ART = 'art'                  // 艺术领域
}

// 移动端优化的课程领域显示配置
export const DOMAIN_CONFIG = {
  [CurriculumDomain.HEALTH]: {
    label: '健康',
    color: '#67C23A',
    icon: '🏃',
    description: '关注幼儿身体健康、运动能力和卫生习惯'
  },
  [CurriculumDomain.LANGUAGE]: {
    label: '语言',
    color: '#409EFF',
    icon: '📖',
    description: '关注幼儿语言表达、理解和沟通能力'
  },
  [CurriculumDomain.SOCIAL]: {
    label: '社会',
    color: '#E6A23C',
    icon: '👥',
    description: '关注幼儿社交能力、情感发展和人际关系'
  },
  [CurriculumDomain.SCIENCE]: {
    label: '科学',
    color: '#F56C6C',
    icon: '🔬',
    description: '关注幼儿科学探索、观察和实验能力'
  },
  [CurriculumDomain.ART]: {
    label: '艺术',
    color: '#909399',
    icon: '🎨',
    description: '关注幼儿创意表达、审美和艺术欣赏能力'
  }
};

// 学期类型
export enum Semester {
  SPRING = 'spring',           // 春季学期
  FALL = 'fall'                // 秋季学期
}

// 课程难度等级（移动端简化版本）
export enum DifficultyLevel {
  EASY = 'easy',               // 简单
  MEDIUM = 'medium',           // 中等
  HARD = 'hard'                // 困难
}

// 移动端难度等级配置
export const DIFFICULTY_CONFIG = {
  [DifficultyLevel.EASY]: {
    label: '简单',
    color: '#67C23A',
    level: 1,
    description: '适合3-4岁幼儿'
  },
  [DifficultyLevel.MEDIUM]: {
    label: '中等',
    color: '#E6A23C',
    level: 2,
    description: '适合4-5岁幼儿'
  },
  [DifficultyLevel.HARD]: {
    label: '困难',
    color: '#F56C6C',
    level: 3,
    description: '适合5-6岁幼儿'
  }
};

// 课程对象接口
export interface Curriculum {
  id?: string
  name: string                 // 课程名称
  description: string          // 课程描述
  domain: CurriculumDomain     // 所属领域
  semester: Semester            // 学期
  ageGroup: string             // 年龄段（如：3-4岁）
  duration: number             // 课程时长（分钟）
  difficulty: DifficultyLevel  // 难度等级
  objectives: string[]         // 学习目标
  materials: string[]          // 所需材料
  htmlCode: string             // HTML 代码
  cssCode: string              // CSS 代码
  jsCode: string               // JavaScript 代码
  thumbnail?: string           // 缩略图
  createdAt?: Date
  updatedAt?: Date
  teacherId?: number
  isMobileOptimized?: boolean  // 移动端优化标识
  deviceSupport?: string[]     // 支持的设备类型
}

// 移动端课程表项目
export interface ScheduleItem {
  id?: string
  curriculumId?: string        // 关联的课程ID
  curriculumName?: string      // 课程名称（用于显示）
  dayOfWeek: number            // 0-6 (周一-周日)
  startTime: string            // HH:mm 格式
  endTime: string              // HH:mm 格式
  classroom?: string           // 教室
  notes?: string               // 备注
  isMobileReminder?: boolean   // 移动端提醒设置
}

// 课程表
export interface CurriculumSchedule {
  id?: string
  name: string                 // 课程表名称
  semester: Semester
  year: number                 // 学年
  ageGroup: string             // 年龄段
  items: ScheduleItem[]        // 课程表项目
  createdAt?: Date
  updatedAt?: Date
  teacherId?: number
  hasMobileNotifications?: boolean  // 移动端通知设置
}

// 课程模板
export interface CurriculumTemplate {
  id: string
  name: string
  domain: CurriculumDomain
  description: string
  ageGroup: string
  htmlTemplate: string
  cssTemplate: string
  jsTemplate: string
  objectives: string[]
  materials: string[]
  thumbnail?: string
  isMobileOptimized?: boolean  // 移动端优化标识
  previewImages?: string[]     // 预览图片
}

// 编辑器状态
export interface EditorState {
  htmlCode: string
  cssCode: string
  jsCode: string
  activeTab: 'html' | 'css' | 'js' | 'preview'
  isMobileFullscreen?: boolean // 移动端全屏模式
}

// 预览数据
export interface PreviewData {
  html: string
  css: string
  js: string
  viewport?: {                // 移动端视口配置
    width: number
    height: number
    device: 'mobile' | 'tablet' | 'desktop'
  }
}

// 移动端AI生成状态
export interface MobileAIGenerationState {
  isGenerating: boolean
  progress: number
  stage: string
  thinking?: string
  error?: string
  networkStatus?: {
    isOnline: boolean
    connectionType: string
    isSlowConnection: boolean
  }
}

// 移动端设备信息
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  userAgent: string
  screenWidth: number
  screenHeight: number
  touchSupport: boolean
  orientation: 'portrait' | 'landscape'
}

// 移动端交互事件
export interface MobileInteractionEvent {
  type: 'tap' | 'swipe' | 'pinch' | 'longpress'
  target: string
  coordinates: { x: number; y: number }
  timestamp: number
  data?: any
}

// 课程统计卡片数据（移动端优化）
export interface CurriculumStatCardData {
  title: string
  value: number | string
  icon: string
  color: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  subtitle?: string
  isCompact?: boolean         // 移动端紧凑模式
}

// 移动端代码编辑器配置
export interface MobileCodeEditorConfig {
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  tabSize: number
  wordWrap: boolean
  lineNumbers: boolean
  minimap: boolean            // 移动端通常关闭
  autoComplete: boolean
  touchOptimized: boolean
  syntaxHighlighting: boolean
}

// 图片轮播配置（移动端）
export interface MobileImageCarouselConfig {
  autoplay: boolean
  interval: number
  showIndicators: boolean
  showNavigation: boolean
  swipeThreshold: number
  zoomEnabled: boolean
  fullscreenSupported: boolean
}

// 视频播放器配置（移动端）
export interface MobileVideoPlayerConfig {
  autoplay: boolean
  controls: boolean
  loop: boolean
  muted: boolean
  fullscreen: boolean
  pictureInPicture: boolean
  playbackRate: number[]
  qualityOptions: string[]
}

// 进度面板数据（移动端）
export interface ProgressPanelData {
  title: string
  progress: number
  totalSteps: number
  currentStep: number
  steps: {
    title: string
    completed: boolean
    description?: string
  }[]
  estimatedTime?: number
  isCompact?: boolean
}

// 模板选择器配置
export interface TemplateSelectorConfig {
  domain?: CurriculumDomain
  ageGroup?: string
  difficulty?: DifficultyLevel
  searchQuery?: string
  sortBy: 'name' | 'created' | 'popularity' | 'difficulty'
  sortOrder: 'asc' | 'desc'
  pageSize: number
  currentPage: number
  filters: {
    isMobileOptimized?: boolean
    hasPreview?: boolean
    recentlyUsed?: boolean
  }
}

// 键盘快捷键配置（移动端适配）
export interface KeyboardShortcutsConfig {
  enabled: boolean
  shortcuts: {
    action: string
    keys: string[]
    description: string
    category: 'editor' | 'preview' | 'navigation' | 'general'
  }[]
  showHelp: boolean
  touchGestures: {
    action: string
    gesture: string
    description: string
  }[]
}

// 打字代码显示配置
export interface TypingCodeDisplayConfig {
  typingSpeed: number          // 字符/秒
  showLineNumbers: boolean
  highlightCurrentLine: boolean
  autoScroll: boolean
  showCursor: boolean
  cursorStyle: 'block' | 'line' | 'underline'
  syntaxHighlighting: boolean
  fontSize: number
  fontFamily: string
}

// 导出所有配置的联合类型
export type MobileCurriculumConfig = {
  domain?: CurriculumDomain
  difficulty?: DifficultyLevel
  editor?: MobileCodeEditorConfig
  carousel?: MobileImageCarouselConfig
  video?: MobileVideoPlayerConfig
  progress?: ProgressPanelData
  shortcuts?: KeyboardShortcutsConfig
  typing?: TypingCodeDisplayConfig
  device?: DeviceInfo
};

// 响应式断点配置
export const BREAKPOINTS = {
  mobile: {
    max: 768,
    columns: 1,
    spacing: 'compact'
  },
  tablet: {
    min: 768,
    max: 1024,
    columns: 2,
    spacing: 'normal'
  },
  desktop: {
    min: 1024,
    columns: 3,
    spacing: 'comfortable'
  }
};

// 移动端主题配置
export const MOBILE_THEME = {
  colors: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.1)'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

// 工具函数：获取设备信息
export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      userAgent: 'Server',
      screenWidth: 1024,
      screenHeight: 768,
      touchSupport: false,
      orientation: 'landscape'
    };
  }

  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const touchSupport = 'ontouchstart' in window;
  const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) && screenWidth <= 768;
  const isTablet = /iPad|Android/i.test(userAgent) && screenWidth > 768 && screenWidth <= 1024;

  return {
    isMobile,
    isTablet,
    userAgent,
    screenWidth,
    screenHeight,
    touchSupport,
    orientation
  };
};

// 工具函数：是否为移动设备
export const isMobileDevice = (): boolean => {
  return getDeviceInfo().isMobile;
};

// 工具函数：获取响应式样式类
export const getResponsiveClass = (baseClass: string, deviceInfo?: DeviceInfo): string => {
  const info = deviceInfo || getDeviceInfo();

  if (info.isMobile) {
    return `${baseClass} mobile`;
  } else if (info.isTablet) {
    return `${baseClass} tablet`;
  } else {
    return `${baseClass} desktop`;
  }
};