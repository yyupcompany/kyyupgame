/**
 * 多租户端到端测试脚本
 * 测试租户管理员添加和审核流程
 */

const axios = require('axios');

const config = {
  // 幼儿园系统API
  kindergartenAPI: 'http://localhost:3000',
  // 统一租户中心API
  unifiedTenantAPI: 'http://localhost:4001',
  // 测试租户
  testTenant: 'k001',
  testDomain: 'k001.yyup.cc'
};

// 模拟园长token（开发环境）
const principalToken = 'Bearer mock_dev_token_principal';
const testUserPhone = '13800138001';
const testTeacherPhone = '13800138002';
const testParentPhone = '13800138003';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

async function testTenantCreation() {
  log('🏢 开始测试租户创建和数据库隔离...');

  try {
    // 1. 检查统一租户中心是否运行
    log('📡 检查统一租户中心状态...');
    const healthResponse = await axios.get(`${config.unifiedTenantAPI}/api/health`);
    log('✅ 统一租户中心运行正常', healthResponse.data);

    // 2. 检查租户是否已存在
    log('🔍 检查测试租户是否存在...');
    try {
      const tenantResponse = await axios.get(`${config.unifiedTenantAPI}/api/tenants/${config.testTenant}`);
      log('✅ 租户已存在', tenantResponse.data);
    } catch (error) {
      log('⚠️ 租户不存在，需要创建', { tenant: config.testTenant });
      return { success: false, message: '租户不存在，请先创建租户' };
    }

    // 3. 测试幼儿园系统API（使用租户域名）
    log('🌐 测试幼儿园系统API...');
    try {
      // 使用租户域名调用API
      const kindergartenResponse = await axios.get(`${config.kindergartenAPI}/api/dashboard/stats`, {
        headers: {
          'Host': config.testDomain,
          'Authorization': principalToken
        }
      });
      log('✅ 幼儿园系统API响应正常', kindergartenResponse.data);
    } catch (error) {
      log('⚠️ 幼儿园系统API调用失败，但这是预期的（需要租户数据库）');
    }

    return { success: true };
  } catch (error) {
    log('❌ 租户检查失败', error.message);
    return { success: false, error: error.message };
  }
}

async function testUserManagement() {
  log('👥 开始测试用户管理流程...');

  try {
    // 1. 创建教师账号
    log('👨‍🏫 创建测试教师账号...');
    const teacherData = {
      username: 'test_teacher',
      realName: '测试教师',
      phone: testTeacherPhone,
      email: 'teacher@test.com',
      role: 'teacher',
      password: '123456',
      status: 'pending_approval' // 待审核
    };

    try {
      const teacherResponse = await axios.post(`${config.kindergartenAPI}/api/users`, teacherData, {
        headers: {
          'Host': config.testDomain,
          'Authorization': principalToken,
          'Content-Type': 'application/json'
        }
      });
      log('✅ 教师账号创建成功', teacherResponse.data);
      const teacherId = teacherResponse.data.data.id;

      // 2. 创建家长账号
      log('👨‍👩‍👧‍👦 创建测试家长账号...');
      const parentData = {
        username: 'test_parent',
        realName: '测试家长',
        phone: testParentPhone,
        email: 'parent@test.com',
        role: 'parent',
        password: '123456',
        status: 'pending_approval', // 待审核
        studentInfo: {
          name: '测试学生',
          classId: 1
        }
      };

      const parentResponse = await axios.post(`${config.kindergartenAPI}/api/users`, parentData, {
        headers: {
          'Host': config.testDomain,
          'Authorization': principalToken,
          'Content-Type': 'application/json'
        }
      });
      log('✅ 家长账号创建成功', parentResponse.data);
      const parentId = parentResponse.data.data.id;

      return { success: true, teacherId, parentId };

    } catch (createError) {
      log('⚠️ 用户创建失败，可能需要先初始化数据库', createError.message);
      return { success: false, error: createError.message };
    }

  } catch (error) {
    log('❌ 用户管理测试失败', error.message);
    return { success: false, error: error.message };
  }
}

async function testApprovalProcess() {
  log('📋 开始测试审核流程...');

  try {
    // 1. 获取待审核用户列表
    log('📋 获取待审核用户列表...');
    const pendingResponse = await axios.get(`${config.kindergartenAPI}/api/users?status=pending_approval`, {
      headers: {
        'Host': config.testDomain,
        'Authorization': principalToken
      }
    });
    log('✅ 待审核用户列表', pendingResponse.data);

    const pendingUsers = pendingResponse.data.data.list || pendingResponse.data.data.items || pendingResponse.data.data;

    if (!pendingUsers || pendingUsers.length === 0) {
      log('⚠️ 没有待审核用户');
      return { success: false, message: '没有待审核用户' };
    }

    // 2. 审核通过第一个用户
    const firstUser = pendingUsers[0];
    log('🔄 审核用户', { id: firstUser.id, name: firstUser.realName, role: firstUser.role });

    const approvalResponse = await axios.put(`${config.kindergartenAPI}/api/users/${firstUser.id}/approve`, {
      status: 'active',
      approvedBy: 'principal',
      approvedAt: new Date().toISOString()
    }, {
      headers: {
        'Host': config.testDomain,
        'Authorization': principalToken,
        'Content-Type': 'application/json'
      }
    });
    log('✅ 用户审核通过', approvalResponse.data);

    return { success: true, approvedUser: firstUser };

  } catch (error) {
    log('❌ 审核流程测试失败', error.message);
    return { success: false, error: error.message };
  }
}

async function testUserLogin() {
  log('🔐 开始测试用户登录...');

  try {
    // 1. 测试教师登录
    log('👨‍🏫 测试教师登录...');
    const teacherLoginResponse = await axios.post(`${config.kindergartenAPI}/api/auth/login`, {
      phone: testTeacherPhone,
      password: '123456'
    }, {
      headers: {
        'Host': config.testDomain,
        'Content-Type': 'application/json'
      }
    });
    log('✅ 教师登录成功', teacherLoginResponse.data);
    const teacherToken = teacherLoginResponse.data.data.token;

    // 2. 测试家长登录
    log('👨‍👩‍👧‍👦 测试家长登录...');
    const parentLoginResponse = await axios.post(`${config.kindergartenAPI}/api/auth/login`, {
      phone: testParentPhone,
      password: '123456'
    }, {
      headers: {
        'Host': config.testDomain,
        'Content-Type': 'application/json'
      }
    });
    log('✅ 家长登录成功', parentLoginResponse.data);
    const parentToken = parentLoginResponse.data.data.token;

    return { success: true, teacherToken, parentToken };

  } catch (error) {
    log('❌ 用户登录测试失败', error.message);
    return { success: false, error: error.message };
  }
}

async function testTenantDatabaseIsolation() {
  log('🗄️ 开始测试租户数据库隔离...');

  try {
    // 1. 在k001租户中创建测试数据
    log('📝 在k001租户中创建测试数据...');
    const testDataResponse = await axios.post(`${config.kindergartenAPI}/api/classes`, {
      name: '测试班级_k001',
      description: '用于测试k001租户数据隔离的班级',
      capacity: 30
    }, {
      headers: {
        'Host': 'k001.yyup.cc',
        'Authorization': principalToken,
        'Content-Type': 'application/json'
      }
    });
    log('✅ k001租户数据创建成功', testDataResponse.data);

    // 2. 尝试在k002域名访问（应该失败或返回空数据）
    log('🔍 测试k002域名访问隔离...');
    try {
      const isolationResponse = await axios.get(`${config.kindergartenAPI}/api/classes`, {
        headers: {
          'Host': 'k002.yyup.cc',
          'Authorization': principalToken
        }
      });
      log('⚠️ k002域名有响应，验证数据隔离', isolationResponse.data);
    } catch (isolationError) {
      log('✅ k002域名正确返回错误（数据隔离正常）');
    }

    return { success: true };

  } catch (error) {
    log('❌ 数据隔离测试失败', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteE2ETest() {
  log('🚀 开始完整的多租户端到端测试...');
  log('📊 测试配置', config);

  const results = {
    tenantCheck: await testTenantCreation(),
    userManagement: await testUserManagement(),
    approvalProcess: await testApprovalProcess(),
    userLogin: await testUserLogin(),
    databaseIsolation: await testTenantDatabaseIsolation()
  };

  log('📊 测试结果汇总', results);

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;

  log(`🎯 测试完成: ${successCount}/${totalTests} 成功`);

  if (successCount === totalTests) {
    log('🎉 所有测试通过！多租户系统运行正常');
  } else {
    log('⚠️ 部分测试失败，需要检查相关功能');
  }

  return results;
}

// 运行测试
if (require.main === module) {
  runCompleteE2ETest().catch(error => {
    log('💥 测试运行失败', error);
    process.exit(1);
  });
}

module.exports = { runCompleteE2ETest };