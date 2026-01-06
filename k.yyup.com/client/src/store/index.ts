import { createPinia } from 'pinia';
import { useChatStore } from './modules/chat';
import { useAIStore } from './modules/ai';
import { useAuthStore } from './modules/auth';

// 创建Pinia实例
const pinia = createPinia();

// 导出store实例
export default pinia;

/**
 * 创建一个类型安全的store钩子
 * 避免直接引用各模块的类型
 */
export const useStore = () => {
  // 使用类型断言处理所有的store
  return {
  chat: useChatStore(pinia),
    ai: useAIStore(pinia),
    auth: useAuthStore(pinia)
  } as {
    chat: ReturnType<typeof useChatStore>;
    ai: ReturnType<typeof useAIStore>;
    auth: ReturnType<typeof useAuthStore>;
  };
}; 