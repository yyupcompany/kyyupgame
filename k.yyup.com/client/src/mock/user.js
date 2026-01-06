/**
 * user 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * login 的模拟数据
 */
export const loginMock = {};

/**
 * logout 的模拟数据
 */
export const logoutMock = {};

/**
 * getUserInfo 的模拟数据
 */
export const getUserInfoMock = {
  success: true,
  code: 200,
  data: {
    items: [
      {
        id: '1',
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@kindergarten.com',
        mobile: '13800138000',
        status: 'active',
        roles: [{ id: '1', name: '管理员', code: 'admin' }],
        lastLoginTime: '2025-07-04 20:00:00',
        remark: '超级管理员',
        avatar: '/avatar/admin.png',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: '2',
        username: 'principal_1',
        realName: '李园长',
        email: 'principal@kindergarten.com',
        mobile: '13800138001',
        status: 'active',
        roles: [{ id: '2', name: '园长', code: 'principal' }],
        lastLoginTime: '2025-07-04 19:30:00',
        remark: '主要负责园区管理',
        avatar: '/avatar/principal.png',
        createTime: '2024-01-15 09:00:00'
      },
      {
        id: '3',
        username: 'test_teacher',
        realName: '张老师',
        email: 'teacher@kindergarten.com',
        mobile: '13800138002',
        status: 'active',
        roles: [{ id: '3', name: '教师', code: 'teacher' }],
        lastLoginTime: '2025-07-04 18:45:00',
        remark: '大班数学老师',
        avatar: '/avatar/teacher.png',
        createTime: '2024-02-01 08:30:00'
      },
      {
        id: '4',
        username: 'test_parent',
        realName: '王女士',
        email: 'parent@example.com',
        mobile: '13800138003',
        status: 'active',
        roles: [{ id: '4', name: '家长', code: 'parent' }],
        lastLoginTime: '2025-07-04 17:20:00',
        remark: '小明的妈妈',
        avatar: '/avatar/parent.png',
        createTime: '2024-03-10 16:00:00'
      },
      {
        id: '5',
        username: 'teacher_wang',
        realName: '王老师',
        email: 'wang@kindergarten.com',
        mobile: '13800138004',
        status: 'active',
        roles: [{ id: '3', name: '教师', code: 'teacher' }],
        lastLoginTime: '2025-07-04 16:30:00',
        remark: '中班语文老师',
        avatar: '/avatar/teacher2.png',
        createTime: '2024-02-15 09:15:00'
      },
      {
        id: '6',
        username: 'nurse_li',
        realName: '李护士',
        email: 'nurse@kindergarten.com',
        mobile: '13800138005',
        status: 'active',
        roles: [{ id: '5', name: '保健医', code: 'nurse' }],
        lastLoginTime: '2025-07-04 15:45:00',
        remark: '负责学生健康管理',
        avatar: '/avatar/nurse.png',
        createTime: '2024-01-20 14:00:00'
      }
    ],
    total: 6
  },
  message: '获取用户列表成功'
};

/**
 * changePassword 的模拟数据
 */
export const changePasswordMock = {};

/**
 * updateUserInfo 的模拟数据
 */
export const updateUserInfoMock = {};

/**
 * uploadAvatar 的模拟数据
 */
export const uploadAvatarMock = {};

/**
 * 模拟API响应
 * @param {string} apiName - API名称
 * @param {any} params - API参数
 * @returns {Promise<any>} 模拟响应
 */
export const mockResponse = (apiName, params = {}) => {
  // 模拟网络延迟
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 300) + 100; // 100-400ms延迟
    setTimeout(() => {
      switch (apiName) {
        case 'login':
          resolve(loginMock);
          break;
        case 'logout':
          resolve(logoutMock);
          break;
        case 'getUserInfo':
          resolve(getUserInfoMock);
          break;
        case 'changePassword':
          resolve(changePasswordMock);
          break;
        case 'updateUserInfo':
          resolve(updateUserInfoMock);
          break;
        case 'uploadAvatar':
          resolve(uploadAvatarMock);
          break;
        default:
          resolve({
            code: 404,
            message: `未找到API: ${apiName}`,
            data: null
          });
      }
    }, delay);
  });
};
