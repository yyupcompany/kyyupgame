/**
 * Token存储抽象层
 *
 * 提供统一的Token存储接口，支持多种存储方式
 * - localStorage: 默认方式，保持现有行为
 * - cookie: 使用httpOnly cookie（需要后端配合）
 * - memory: 内存存储（仅开发调试）
 */

/**
 * Token存储类型
 */
export type TokenStorageType = 'localStorage' | 'cookie' | 'memory';

/**
 * 获取当前存储类型
 * 默认使用 localStorage，确保向后兼容
 */
function getStorageType(): TokenStorageType {
  const storageType = import.meta.env.VITE_TOKEN_STORAGE as TokenStorageType;

  // 验证存储类型是否有效
  if (storageType === 'cookie' || storageType === 'memory') {
    return storageType;
  }

  // 默认使用 localStorage
  return 'localStorage';
}

/**
 * Token存储接口
 */
export interface ITokenStorage {
  getToken(): string | null;
  getRefreshToken(): string | null;
  setToken(token: string): void;
  setRefreshToken(refreshToken: string): void;
  removeToken(): void;
  removeRefreshToken(): void;
}

/**
 * localStorage 实现（默认，保持现有方式）
 */
class LocalStorageTokenStorage implements ITokenStorage {
  getToken(): string | null {
    // 支持多个token键名，保持向后兼容
    return localStorage.getItem('kindergarten_token') ||
           localStorage.getItem('token') ||
           localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('kindergarten_refresh_token') ||
           localStorage.getItem('refreshToken');
  }

  setToken(token: string): void {
    localStorage.setItem('kindergarten_token', token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('kindergarten_refresh_token', refreshToken);
  }

  removeToken(): void {
    localStorage.removeItem('kindergarten_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  }

  removeRefreshToken(): void {
    localStorage.removeItem('kindergarten_refresh_token');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Cookie 实现（可选，需要后端配合）
 *
 * 注意：前端设置的cookie无法设置httpOnly标志
 * 真正安全的cookie需要由后端设置
 */
class CookieTokenStorage implements ITokenStorage {
  getToken(): string | null {
    // 从cookie读取
    const match = document.cookie.match(/kindergarten_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  getRefreshToken(): string | null {
    const match = document.cookie.match(/kindergarten_refresh_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  setToken(token: string): void {
    // Cookie应该由后端设置，这里只是备用
    // 如果前端设置，无法设置httpOnly，安全性有限
    const isSecure = import.meta.env.PROD && window.location.protocol === 'https:';
    document.cookie = `kindergarten_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }

  setRefreshToken(refreshToken: string): void {
    const isSecure = import.meta.env.PROD && window.location.protocol === 'https:';
    document.cookie = `kindergarten_refresh_token=${encodeURIComponent(refreshToken)}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }

  removeToken(): void {
    document.cookie = 'kindergarten_token=; path=/; max-age=0';
    document.cookie = 'kindergarten_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  removeRefreshToken(): void {
    document.cookie = 'kindergarten_refresh_token=; path=/; max-age=0';
    document.cookie = 'kindergarten_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * 内存存储实现（仅用于开发调试）
 * 刷新页面后token会丢失
 */
class MemoryTokenStorage implements ITokenStorage {
  private token: string | null = null;
  private refreshToken: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setToken(token: string): void {
    this.token = token;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  removeToken(): void {
    this.token = null;
  }

  removeRefreshToken(): void {
    this.refreshToken = null;
  }
}

/**
 * 获取Token存储实例
 */
function getTokenStorage(): ITokenStorage {
  const type = getStorageType();

  switch (type) {
    case 'cookie':
      if (import.meta.env.DEV) {
        console.log('🍪 使用Cookie存储Token（需要后端httpOnly配合）');
      }
      return new CookieTokenStorage();
    case 'memory':
      if (import.meta.env.DEV) {
        console.log('💾 使用内存存储Token（仅开发调试，刷新后丢失）');
      }
      return new MemoryTokenStorage();
    case 'localStorage':
    default:
      if (import.meta.env.DEV) {
        console.log('💾 使用localStorage存储Token（默认）');
      }
      return new LocalStorageTokenStorage();
  }
}

/**
 * Token存储单例
 */
export const tokenStorage = getTokenStorage();

/**
 * 导出存储类型枚举
 */
export const TokenStorageType = {
  LOCAL_STORAGE: 'localStorage',
  COOKIE: 'cookie',
  MEMORY: 'memory'
} as const;

/**
 * 获取当前存储类型（供外部检查）
 */
export function getCurrentStorageType(): TokenStorageType {
  return getStorageType();
}

/**
 * 检查是否使用安全存储（cookie需要后端httpOnly配合才算真正安全）
 */
export function isSecureStorage(): boolean {
  const type = getStorageType();
  // 只有后端设置的httpOnly cookie才算真正安全
  return type === 'cookie';
}

/**
 * 导出默认实现
 */
export default tokenStorage;
