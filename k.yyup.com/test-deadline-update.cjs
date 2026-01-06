/**
 * 回归测试脚本：文档截止日期更新功能
 * 
 * 测试目标：验证最后一次提交的修复是否正常工作
 * 提交ID: 16ade3148bf6b8fbe8297f253252b980bd6a592f
 * 
 * 测试内容：
 * 1. 文档截止日期内联编辑
 * 2. 数据库持久化验证
 * 3. 其他文档字段更新（确保未受影响）
 */

const axios = require('axios');
const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3000';
const DB_CONFIG = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 测试结果收集
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// 辅助函数：登录获取token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ 登录成功');
      return response.data.data.token;
    } else {
      throw new Error('登录失败：未获取到token');
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    throw error;
  }
}

// 辅助函数：获取文档实例列表
async function getDocumentInstances(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/document-instances`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('API响应:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      // 处理不同的响应格式
      let data = response.data.data;

      // 如果data是对象且包含items数组
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        console.log(`✅ 获取文档实例列表成功，共 ${data.items.length} 条`);
        return data.items;
      }
      // 如果data直接是数组
      else if (Array.isArray(data)) {
        console.log(`✅ 获取文档实例列表成功，共 ${data.length} 条`);
        return data;
      }
      // 如果data是单个对象，包装成数组
      else if (data && typeof data === 'object') {
        console.log(`✅ 获取文档实例成功，共 1 条`);
        return [data];
      }
      else {
        throw new Error('API返回的数据格式不正确');
      }
    } else {
      throw new Error('获取文档实例列表失败');
    }
  } catch (error) {
    console.error('❌ 获取文档实例列表失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    throw error;
  }
}

// 测试1: 文档截止日期更新
async function testDeadlineUpdate(token, documentId) {
  console.log('\n📋 测试1: 文档截止日期更新');
  console.log('=' .repeat(60));
  
  const newDeadline = '2025-10-20';
  
  try {
    // 1. 更新截止日期
    const response = await axios.put(
      `${API_BASE_URL}/api/document-instances/${documentId}`,
      { deadline: newDeadline },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.data.success) {
      throw new Error(`API返回失败: ${response.data.error?.message || '未知错误'}`);
    }
    
    console.log('✅ API调用成功');

    // 2. 验证API响应中的deadline
    const updatedData = response.data.data;
    const apiDeadline = updatedData.deadline;
    const apiDeadlineStr = apiDeadline
      ? (apiDeadline instanceof Date ? apiDeadline.toISOString().split('T')[0] : apiDeadline.split('T')[0])
      : null;

    if (apiDeadlineStr !== newDeadline) {
      throw new Error(`API响应中的deadline不正确: 期望 ${newDeadline}, 实际 ${apiDeadlineStr}`);
    }

    console.log('✅ API响应验证通过');
    console.log(`   API返回的deadline: ${apiDeadline}`);
    
    // 3. 从数据库直接查询验证
    const connection = await mysql.createConnection(DB_CONFIG);
    const [rows] = await connection.execute(
      'SELECT deadline, updated_at FROM document_instances WHERE id = ?',
      [documentId]
    );
    await connection.end();
    
    if (rows.length === 0) {
      throw new Error('数据库中未找到该文档实例');
    }
    
    const dbDeadline = rows[0].deadline;
    const dbDeadlineStr = dbDeadline instanceof Date 
      ? dbDeadline.toISOString().split('T')[0] 
      : dbDeadline;
    
    if (dbDeadlineStr !== newDeadline) {
      throw new Error(`数据库中的deadline不正确: 期望 ${newDeadline}, 实际 ${dbDeadlineStr}`);
    }
    
    console.log('✅ 数据库持久化验证通过');
    console.log(`   数据库中的deadline: ${dbDeadlineStr}`);
    console.log(`   updated_at: ${rows[0].updated_at}`);
    
    testResults.passed.push('测试1: 文档截止日期更新');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    testResults.failed.push(`测试1: 文档截止日期更新 - ${error.message}`);
    return false;
  }
}

// 测试2: 其他字段更新（确保未受影响）
async function testOtherFieldsUpdate(token, documentId) {
  console.log('\n📋 测试2: 其他文档字段更新');
  console.log('=' .repeat(60));
  
  try {
    // 更新title和completionRate
    const updateData = {
      title: '测试文档标题更新',
      completionRate: 75
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/api/document-instances/${documentId}`,
      updateData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.data.success) {
      throw new Error(`API返回失败: ${response.data.error?.message || '未知错误'}`);
    }
    
    const updatedData = response.data.data;
    
    if (updatedData.title !== updateData.title) {
      throw new Error(`title更新失败: 期望 ${updateData.title}, 实际 ${updatedData.title}`);
    }
    
    if (updatedData.completionRate !== updateData.completionRate) {
      throw new Error(`completionRate更新失败: 期望 ${updateData.completionRate}, 实际 ${updatedData.completionRate}`);
    }
    
    console.log('✅ 其他字段更新验证通过');
    console.log(`   title: ${updatedData.title}`);
    console.log(`   completionRate: ${updatedData.completionRate}`);
    
    testResults.passed.push('测试2: 其他文档字段更新');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    testResults.failed.push(`测试2: 其他文档字段更新 - ${error.message}`);
    return false;
  }
}

// 测试3: 边界情况测试
async function testEdgeCases(token, documentId) {
  console.log('\n📋 测试3: 边界情况测试');
  console.log('=' .repeat(60));
  
  try {
    // 测试deadline为null的情况
    const response = await axios.put(
      `${API_BASE_URL}/api/document-instances/${documentId}`,
      { deadline: null },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.data.success) {
      throw new Error(`API返回失败: ${response.data.error?.message || '未知错误'}`);
    }
    
    console.log('✅ deadline设置为null测试通过');
    
    testResults.passed.push('测试3: 边界情况测试');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    testResults.failed.push(`测试3: 边界情况测试 - ${error.message}`);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('\n🧪 开始回归测试');
  console.log('=' .repeat(60));
  console.log('提交ID: 16ade3148bf6b8fbe8297f253252b980bd6a592f');
  console.log('测试目标: 文档截止日期更新功能');
  console.log('=' .repeat(60));
  
  try {
    // 1. 登录
    const token = await login();
    
    // 2. 获取文档实例列表
    const documents = await getDocumentInstances(token);
    
    if (documents.length === 0) {
      console.warn('⚠️  警告: 数据库中没有文档实例，无法进行测试');
      testResults.warnings.push('数据库中没有文档实例');
      return;
    }
    
    // 使用第一个文档实例进行测试
    const testDocumentId = documents[0].id;
    console.log(`\n📄 使用文档实例ID: ${testDocumentId} 进行测试`);
    console.log(`   文档标题: ${documents[0].title}`);
    console.log(`   当前截止日期: ${documents[0].deadline || '未设置'}`);
    
    // 3. 执行测试
    await testDeadlineUpdate(token, testDocumentId);
    await testOtherFieldsUpdate(token, testDocumentId);
    await testEdgeCases(token, testDocumentId);
    
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
    testResults.failed.push(`测试执行失败: ${error.message}`);
  } finally {
    // 打印测试结果
    printTestResults();
  }
}

// 打印测试结果
function printTestResults() {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 测试结果汇总');
  console.log('=' .repeat(60));
  
  console.log(`\n✅ 通过: ${testResults.passed.length} 项`);
  testResults.passed.forEach(test => console.log(`   - ${test}`));
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ 失败: ${testResults.failed.length} 项`);
    testResults.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  警告: ${testResults.warnings.length} 项`);
    testResults.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  const totalTests = testResults.passed.length + testResults.failed.length;
  const passRate = totalTests > 0 ? (testResults.passed.length / totalTests * 100).toFixed(2) : 0;
  
  console.log(`\n📈 通过率: ${passRate}%`);
  console.log('=' .repeat(60));
  
  // 退出码
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// 运行测试
runTests();

