import axios, { AxiosResponse } from 'axios';

// 真实的登录凭据 - 来自前端登录页面的快捷登录配置
export const TEST_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123' },
  principal: { username: 'principal', password: '123456' },
  teacher: { username: 'teacher', password: '123456' },
  parent: { username: 'parent', password: '123456' }
};

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      email: string;
      realName: string;
      role: string;
      isAdmin: boolean;
    };
  };
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

/**
 * 获取真实的认证token
 */
export async function getAuthToken(role: keyof typeof TEST_CREDENTIALS = 'admin'): Promise<string> {
  const credentials = TEST_CREDENTIALS[role];
  
  try {
    const response: AxiosResponse<LoginResponse> = await axios.post(
      'http://localhost:3000/api/auth/login',
      credentials,
      {
        timeout: 10000,
        validateStatus: () => true // 不要在4xx/5xx状态码时抛错
      }
    );

    if (response.status === 200 && response.data.success) {
      console.log(`✅ 成功获取 ${role} 用户的认证token`);
      return response.data.data.token;
    } else {
      console.error(`❌ 获取 ${role} 用户token失败:`, response.data);
      throw new Error(`Failed to get auth token for ${role}: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ 登录请求失败 (${role}):`, error);
    throw new Error(`Authentication failed for ${role}: ${error}`);
  }
}

/**
 * 获取带认证头的axios配置
 */
export async function getAuthHeaders(role: keyof typeof TEST_CREDENTIALS = 'admin') {
  const token = await getAuthToken(role);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 验证token是否有效
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000,
      validateStatus: () => true
    });
    
    return response.status === 200 && response.data.success;
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
}

/**
 * 创建带认证的API客户端
 */
export async function createAuthenticatedClient(role: keyof typeof TEST_CREDENTIALS = 'admin') {
  const headers = await getAuthHeaders(role);
  
  return axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    headers,
    validateStatus: () => true // 不要在4xx/5xx状态码时抛错
  });
}