/**
 * 幻灯片课件组件导出
 * 
 * 这些组件用于创建1920x1080分辨率的幻灯片式课件，
 * 适合投影仪和大屏电视教学使用。
 */

// 主容器组件
export { default as A2UISlideshow } from './A2UISlideshow.vue';

// 单页幻灯片组件
export { default as A2UISlide } from './A2UISlide.vue';

// 导航组件
export { default as A2UISlideNavigation } from './A2UISlideNavigation.vue';

// 互动组件
export { default as A2UISlideChoice } from './A2UISlideChoice.vue';
export { default as A2UISlideDragSort } from './A2UISlideDragSort.vue';

// 类型定义
export interface SlideData {
  id: string;
  type: 'title' | 'content' | 'activity' | 'media' | 'summary';
  layout?: {
    template?: string;
    columns?: number;
  };
  components?: SlideComponent[];
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  audio?: {
    ttsText?: string;
    audioUrl?: string;
    autoPlay?: boolean;
  };
}

export interface SlideComponent {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface CurriculumConfig {
  ageGroup: 'small' | 'middle' | 'large';
  domain: string;
  duration: number;
  totalScore: number;
}

export interface CurriculumTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

export interface Curriculum {
  id: string;
  name: string;
  description?: string;
  originalPrompt?: string;
  editHistory?: EditHistoryItem[];
  config: CurriculumConfig;
  theme: CurriculumTheme;
  slides: SlideData[];
  media?: MediaResource[];
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    author: string;
  };
}

export interface EditHistoryItem {
  id: string;
  timestamp: Date;
  type: 'ai_edit' | 'manual_edit';
  prompt?: string;
  changes: string;
}

export interface MediaResource {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  description?: string;
}
