import { defineStore } from 'pinia';
import { authApi } from '../../api/auth';
import router from '../../router';
import { ElMessage } from 'element-plus';

// 导入统一认证相关的类型
import type {
  UnifiedLoginResponse,
  GetUserTenantsResponse,
  BindTenantResponse,
  UnifiedLoginRequest
} from '../../api/auth';

/**
 * 用户信息
 */
interface User {
  id: string | number;
  username: string;
  email?: string;
  realName?: string;
  phone?: string;
  role?: string;
  roles?: Array<{
    id: string | number;
    name: string;
    code: string;
  }>;
  permissions?: string[];
  status?: number;
}

/**
 * 租户信息
 */
interface Tenant {
  tenantCode: string;
  tenantName: string;
  domain: string;
  hasAccount: boolean;
  role?: string;
  lastLoginAt?: string;
  loginCount: number;
  status: 'active' | 'suspended' | 'deleted';
}

/**
 * 待注册用户信息（用于 needsRegistration 场景）
 */
interface PendingRegistration {
  globalUserId: string;
  phone: string;
  realName?: string;
  tenantCode: string;
  tenantName: string;
  availableRoles: string[];
  token?: string;
}

/**
 * 认证状态
 */
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // 统一认证相关状态
  isUnifiedAuth: boolean;
  globalUserId?: string;
  currentTenant?: Tenant;
  availableTenants: Tenant[];
  requiresTenantSelection: boolean;
  requiresTenantBinding: boolean;

  // 需要注册状态（用户在统一认证存在但未绑定当前租户）
  needsRegistration: boolean;
  pendingRegistration?: PendingRegistration;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('kindergarten_token'),
    refreshToken: localStorage.getItem('kindergarten_refresh_token'),
    isAuthenticated: !!localStorage.getItem('kindergarten_token'),
    loading: false,
    error: null,

    // 统一认证相关状态
    isUnifiedAuth: !!localStorage.getItem('unified_auth_mode'),
    globalUserId: localStorage.getItem('global_user_id') || undefined,
    currentTenant: localStorage.getItem('current_tenant') ? JSON.parse(localStorage.getItem('current_tenant')!) : undefined,
    availableTenants: localStorage.getItem('available_tenants') ? JSON.parse(localStorage.getItem('available_tenants')!) : [],
    requiresTenantSelection: false,
    requiresTenantBinding: false,

    // 需要注册状态
    needsRegistration: false,
    pendingRegistration: undefined
  }),

  getters: {
    userRole(state): string {
      // 优先使用roles数组中的第一个角色
      if (state.user?.roles && state.user.roles.length > 0) {
        return state.user.roles[0].code || state.user.roles[0].name;
      }
      return state.user?.role || '';
    },
    
    userPermissions(state): string[] {
      return state.user?.permissions || [];
    },
    
    hasPermission: (state) => (permission: string): boolean => {
      return state.user?.permissions?.includes(permission) || false;
    },
    
    hasAnyPermission: (state) => (permissions: string[]): boolean => {
      if (!state.user?.permissions) return false;
      return permissions.some(permission => state.user!.permissions!.includes(permission));
    },

    hasRole: (state) => (roleCode: string): boolean => {
      if (state.user?.roles) {
        return state.user.roles.some(role => role.code === roleCode);
      }
      return state.user?.role === roleCode;
    }
  },

  actions: {
    /**
     * 统一认证登录（手机号）
     */
    async unifiedLogin(phone: string, password: string, tenantCode?: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authApi.unifiedLogin({ phone, password, tenantCode });

        if (response.success && response.data) {
          const { token, user, tenantInfo, globalUserId, requiresTenantSelection, requiresTenantBinding, tenants } = response.data;

          // 存储基础认证信息
          this.token = token || '';
          this.user = user;
          this.isAuthenticated = true;
          this.isUnifiedAuth = true;
          this.globalUserId = globalUserId;

          // 处理租户信息
          if (tenantInfo) {
            this.currentTenant = {
              tenantCode: tenantInfo.tenantCode,
              tenantName: tenantInfo.tenantName,
              domain: tenantInfo.domain,
              hasAccount: true,
              status: 'active',
              loginCount: 1
            };
          }

          // 处理租户选择需求
          this.requiresTenantSelection = requiresTenantSelection || false;
          this.requiresTenantBinding = requiresTenantBinding || false;

          if (tenants) {
            this.availableTenants = tenants;
          }

          // 保存到本地存储
          if (token) {
            localStorage.setItem('kindergarten_token', token);
          }
          localStorage.setItem('unified_auth_mode', 'true');
          if (globalUserId) {
            localStorage.setItem('global_user_id', globalUserId);
          }
          if (this.currentTenant) {
            localStorage.setItem('current_tenant', JSON.stringify(this.currentTenant));
          }
          if (tenants) {
            localStorage.setItem('available_tenants', JSON.stringify(tenants));
          }

          // 成功提示
          const welcomeMessage = response.message || `欢迎，${user.username}！`;
          ElMessage.success(welcomeMessage);

          return response;
        } else {
          throw new Error(response.message || '统一认证登录失败');
        }
      } catch (error: any) {
        this.error = error.message || '统一认证登录失败';
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        this.isUnifiedAuth = false;
        this.globalUserId = undefined;
        this.currentTenant = undefined;

        // 清除本地存储
        localStorage.removeItem('kindergarten_token');
        localStorage.removeItem('unified_auth_mode');
        localStorage.removeItem('global_user_id');
        localStorage.removeItem('current_tenant');
        localStorage.removeItem('available_tenants');

        // 错误提示
        ElMessage.error(this.error || '操作失败');

        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 灵活登录（支持用户名或手机号）
     */
    async flexibleLogin(identifier: string, password: string, tenantCode?: string) {
      this.loading = true;
      this.error = null;

      try {
        // 判断输入的是手机号还是用户名
        const isPhone = /^1[3-9]\d{9}$/.test(identifier);

        let response;
        if (isPhone) {
          // 手机号登录使用统一认证
          response = await authApi.unifiedLogin({ phone: identifier, password, tenantCode });
        } else {
          // 用户名登录使用传统认证
          response = await authApi.login({ username: identifier, password });
        }

        if (isPhone) {
          // 处理统一认证响应
          return await this.handleUnifiedAuthResponse(response);
        } else {
          // 处理传统认证响应
          return await this.handleTraditionalAuthResponse(response);
        }
      } catch (error: any) {
        this.error = error.message || '登录失败';
        ElMessage.error(this.error || '操作失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 处理统一认证响应
     */
    async handleUnifiedAuthResponse(response: any) {
      if (response.success && response.data) {
        const {
          token, user, tenantInfo, globalUserId,
          requiresTenantSelection, requiresTenantBinding, tenants,
          needsRegistration, phone, realName, tenantCode, tenantName, availableRoles
        } = response.data;

        // ========== 处理需要注册的情况 ==========
        if (needsRegistration) {
          console.log('[Auth Store] 用户需要注册到当前租户', {
            globalUserId,
            tenantCode,
            tenantName
          });

          this.needsRegistration = true;
          this.pendingRegistration = {
            globalUserId,
            phone: phone || '',
            realName: realName || '',
            tenantCode: tenantCode || '',
            tenantName: tenantName || '',
            availableRoles: availableRoles || ['principal', 'teacher', 'parent'],
            token
          };
          this.globalUserId = globalUserId;

          // 保存到 sessionStorage（临时存储，刷新后清除）
          sessionStorage.setItem('pending_registration', JSON.stringify(this.pendingRegistration));

          // 不设置 isAuthenticated，因为用户还未完成注册
          this.isAuthenticated = false;

          return response;
        }

        // ========== 正常登录流程 ==========
        this.needsRegistration = false;
        this.pendingRegistration = undefined;
        sessionStorage.removeItem('pending_registration');

        this.token = token || '';
        this.user = user;
        this.isAuthenticated = true;
        this.isUnifiedAuth = true;
        this.globalUserId = globalUserId;

        if (tenantInfo) {
          this.currentTenant = {
            tenantCode: tenantInfo.tenantCode,
            tenantName: tenantInfo.tenantName,
            domain: tenantInfo.domain,
            hasAccount: true,
            status: 'active',
            loginCount: 1
          };
        }

        this.requiresTenantSelection = requiresTenantSelection || false;
        this.requiresTenantBinding = requiresTenantBinding || false;

        if (tenants) {
          this.availableTenants = tenants;
        }

        // 保存到本地存储
        if (token) localStorage.setItem('kindergarten_token', token);
        localStorage.setItem('unified_auth_mode', 'true');
        if (globalUserId) localStorage.setItem('global_user_id', globalUserId);
        if (this.currentTenant) localStorage.setItem('current_tenant', JSON.stringify(this.currentTenant));
        if (tenants) localStorage.setItem('available_tenants', JSON.stringify(tenants));

        ElMessage.success(response.message || '登录成功');
        return response;
      } else {
        throw new Error(response.message || '统一认证登录失败');
      }
    },

    /**
     * 处理传统认证响应
     */
    async handleTraditionalAuthResponse(response: any) {
      this.token = response.token;
      this.refreshToken = response.refreshToken || null;
      this.user = response.user;
      this.isAuthenticated = true;
      this.isUnifiedAuth = false;

      localStorage.setItem('kindergarten_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('kindergarten_refresh_token', response.refreshToken);
      }
      localStorage.removeItem('unified_auth_mode');

      ElMessage.success(response.message || `欢迎，${response.user.username}！`);
      return response;
    },

    /**
     * 获取用户租户列表
     */
    async getUserTenants(phone: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authApi.getUserTenants({ phone, password });

        if (response.success && response.data) {
          this.availableTenants = response.data.tenants;
          this.globalUserId = response.data.globalUserId;

          localStorage.setItem('available_tenants', JSON.stringify(this.availableTenants));
          if (this.globalUserId) {
            localStorage.setItem('global_user_id', this.globalUserId);
          }

          return response;
        } else {
          throw new Error(response.message || '获取租户列表失败');
        }
      } catch (error: any) {
        this.error = error.message || '获取租户列表失败';
        ElMessage.error(this.error || '操作失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 绑定用户到租户
     */
    async bindUserToTenant(tenantCode: string, role?: string, permissions?: string[]) {
      this.loading = true;
      this.error = null;

      try {
        if (!this.globalUserId) {
          throw new Error('用户未登录，无法绑定租户');
        }

        const response = await authApi.bindUserToTenant({
          globalUserId: this.globalUserId,
          tenantCode,
          role,
          permissions
        });

        if (response.success) {
          ElMessage.success('租户绑定成功');
          return response;
        } else {
          throw new Error(response.message || '租户绑定失败');
        }
      } catch (error: any) {
        this.error = error.message || '租户绑定失败';
        ElMessage.error(this.error || '操作失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 选择租户
     */
    selectTenant(tenant: Tenant) {
      this.currentTenant = tenant;
      this.requiresTenantSelection = false;

      localStorage.setItem('current_tenant', JSON.stringify(tenant));
      localStorage.removeItem('available_tenants');

      ElMessage.success(`已切换到租户：${tenant.tenantName}`);
    },

    /**
     * 用户登录
     */
    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authApi.login({ username, password });
        
        // 存储令牌和用户信息
        this.token = response.token;
        this.refreshToken = response.refreshToken || null;
        this.user = response.user;
        this.isAuthenticated = true;
        
        // 保存令牌到本地存储
        localStorage.setItem('kindergarten_token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('kindergarten_refresh_token', response.refreshToken);
        }
        
        // 成功提示
        const welcomeMessage = response.message || `欢迎，${response.user.username}！`;
        ElMessage.success(welcomeMessage);
        
        return response;
      } catch (error: any) {
        this.error = error.message || '登录失败，请检查用户名和密码';
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        
        // 清除本地存储
        localStorage.removeItem('kindergarten_token');
        localStorage.removeItem('kindergarten_refresh_token');
        
        // 错误提示
        ElMessage.error(this.error || '操作失败');
        
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 用户登出
     */
    async logout() {
      this.loading = true;
      
      try {
        // 调用登出API
        await authApi.logout();
      } catch (error) {
        console.error('登出API调用失败:', error);
      } finally {
        // 无论API是否成功，都清除本地状态
        this.clearAuthState();
        this.loading = false;
        
        // 返回登录页
        router.push('/login');
        
        ElMessage.success('您已成功登出');
      }
    },
    
    /**
     * 检查认证状态
     */
    async checkAuth(): Promise<boolean> {
      // 如果没有令牌，则认为未认证
      if (!this.token) {
        this.isAuthenticated = false;
        return false;
      }
      
      this.loading = true;
      
      try {
        // 验证令牌
        const isValid = await authApi.verifyToken();
        
        if (!isValid) {
          // 令牌无效，尝试刷新令牌
          if (this.refreshToken) {
            try {
              await this.refreshAuthToken();
              return true;
            } catch (refreshError) {
              console.error('刷新令牌失败:', refreshError);
              this.clearAuthState();
              return false;
            }
          } else {
            this.clearAuthState();
            return false;
          }
        }
        
        // 获取用户信息
        if (!this.user) {
          try {
            const userData = await authApi.getCurrentUser();
            this.user = userData;
          } catch (userError) {
            console.error('获取用户信息失败:', userError);
            // 用户信息获取失败不影响认证状态
          }
        }
        
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('认证检查失败:', error);
        this.clearAuthState();
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新认证令牌
     */
    async refreshAuthToken() {
      try {
        const response = await authApi.refreshToken(this.refreshToken!);
        
        // 更新令牌
        this.token = response.token;
        this.refreshToken = response.refreshToken || null;
        this.isAuthenticated = true;
        
        // 保存到本地存储
        localStorage.setItem('kindergarten_token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('kindergarten_refresh_token', response.refreshToken);
        }
        
        return true;
      } catch (error) {
        console.error('刷新令牌失败:', error);
        this.clearAuthState();
        throw error;
      }
    },

    /**
     * 清除认证状态
     */
    clearAuthState() {
      // 清除状态
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;

      // 清除统一认证状态
      this.isUnifiedAuth = false;
      this.globalUserId = undefined;
      this.currentTenant = undefined;
      this.availableTenants = [];
      this.requiresTenantSelection = false;
      this.requiresTenantBinding = false;

      // 清除注册状态
      this.needsRegistration = false;
      this.pendingRegistration = undefined;

      // 清除本地存储
      localStorage.removeItem('kindergarten_token');
      localStorage.removeItem('kindergarten_refresh_token');
      localStorage.removeItem('unified_auth_mode');
      localStorage.removeItem('global_user_id');
      localStorage.removeItem('current_tenant');
      localStorage.removeItem('available_tenants');
      sessionStorage.removeItem('pending_registration');
    },

    /**
     * 更新用户信息
     */
    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    /**
     * 完成注册绑定（用于 needsRegistration 场景）
     * @param registrationData 注册数据
     */
    async completeRegistration(registrationData: {
      role: string;
      kindergartenId?: number;
      classId?: number;
      teacherTitle?: string;
      teachingSubjects?: string[];
      childName?: string;
      childRelation?: string;
    }) {
      this.loading = true;
      this.error = null;

      try {
        if (!this.pendingRegistration) {
          throw new Error('没有待完成的注册信息');
        }

        const { globalUserId, phone, realName, tenantCode, token } = this.pendingRegistration;

        // 调用绑定租户接口
        const response = await authApi.bindUserToTenant({
          globalUserId,
          tenantCode,
          role: registrationData.role,
          phone,
          realName,
          kindergartenId: registrationData.kindergartenId,
          classId: registrationData.classId,
          teacherTitle: registrationData.teacherTitle,
          teachingSubjects: registrationData.teachingSubjects,
          childName: registrationData.childName,
          childRelation: registrationData.childRelation,
          token
        });

        if (response.success && response.data) {
          // 注册成功，更新状态
          this.needsRegistration = false;
          this.pendingRegistration = undefined;
          sessionStorage.removeItem('pending_registration');

          // 设置认证状态
          this.token = response.data.token;
          this.user = response.data.user;
          this.isAuthenticated = true;
          this.isUnifiedAuth = true;
          this.globalUserId = globalUserId;

          if (response.data.tenantInfo) {
            this.currentTenant = {
              tenantCode: response.data.tenantInfo.tenantCode,
              tenantName: response.data.tenantInfo.tenantName,
              domain: '',
              hasAccount: true,
              status: 'active',
              loginCount: 1
            };
          }

          // 保存到本地存储
          if (response.data.token) {
            localStorage.setItem('kindergarten_token', response.data.token);
          }
          localStorage.setItem('unified_auth_mode', 'true');
          localStorage.setItem('global_user_id', globalUserId);
          if (this.currentTenant) {
            localStorage.setItem('current_tenant', JSON.stringify(this.currentTenant));
          }

          ElMessage.success(response.message || '注册成功！');
          return response;
        } else {
          throw new Error(response.message || '注册失败');
        }
      } catch (error: any) {
        this.error = error.message || '注册失败';
        ElMessage.error(this.error || '操作失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 取消注册流程
     */
    cancelRegistration() {
      this.needsRegistration = false;
      this.pendingRegistration = undefined;
      this.globalUserId = undefined;
      sessionStorage.removeItem('pending_registration');
    }
  }
});