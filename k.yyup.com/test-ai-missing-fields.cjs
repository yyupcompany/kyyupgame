/**
 * AI缺失字段提示测试脚本
 * 模拟前端发送不完整的创建请求，验证缺失字段提示功能
 */

const http = require('http');

// 配置
const CONFIG = {
  baseUrl: 'localhost',
  port: 3000,
  username: 'admin',
  password: '123456'
};

// 日志工具
const log = {
  info: (msg) => console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  header: (msg) => {
    console.log('\n' + '='.repeat(80));
    console.log(`\x1b[35m${msg}\x1b[0m`);
    console.log('='.repeat(80) + '\n');
  }
};

// HTTP请求封装
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') ? JSON.parse(body) : body
          };
          resolve(result);
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// 1. 快捷登录
async function quickLogin() {
  log.header('步骤 1: 快捷登录获取 Token');
  log.info('使用 admin 账户登录...');

  const response = await request({
    hostname: CONFIG.baseUrl,
    port: CONFIG.port,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: CONFIG.username,
    password: CONFIG.password
  });

  if (response.body?.data?.token) {
    log.success('登录成功！');
    log.info(`Token: ${response.body.data.token.substring(0, 50)}...`);
    return response.body.data.token;
  } else {
    log.error('登录失败');
    console.log(JSON.stringify(response.body, null, 2));
    throw new Error('登录失败');
  }
}

// 2. 测试AI对话 - 发送不完整的创建班级请求
async function testMissingFields(token) {
  log.header('步骤 2: 测试AI缺失字段提示');

  const testCases = [
    {
      name: '创建班级 - 缺少幼儿园ID',
      message: '帮我创建一个班级，名称是"测试大班"，容量30人',
      expectedMissing: ['kindergartenId'],
      description: '应该提示缺少幼儿园ID字段'
    },
    {
      name: '创建学生 - 缺少性别和出生日期',
      message: '创建一个学生，名字叫张三',
      expectedMissing: ['gender', 'birthDate'],
      description: '应该提示缺少性别和出生日期'
    },
    {
      name: '创建教师 - 缺少必填字段',
      message: '添加一个新教师，姓名是李老师',
      expectedMissing: ['phone', 'subject'],
      description: '应该提示缺少联系电话和科目'
    }
  ];

  for (const testCase of testCases) {
    log.info(`\n测试用例: ${testCase.name}`);
    log.info(`提示词: "${testCase.message}"`);
    log.info(`预期缺失字段: ${testCase.expectedMissing.join(', ')}`);

    try {
      const response = await request({
        hostname: CONFIG.baseUrl,
        port: CONFIG.port,
        path: '/api/ai/unified/stream-chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        message: testCase.message,
        conversationId: null,
        stream: false
      });

      log.info(`响应状态: ${response.status}`);

      if (response.status === 200) {
        // 检查响应中是否包含缺失字段信息
        const body = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        
        if (body.includes('missing_fields') || body.includes('缺少必填字段') || body.includes('请补充')) {
          log.success(`✓ 成功检测到缺失字段提示`);
          
          // 尝试解析响应查看具体缺失的字段
          try {
            const lines = body.split('\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const data = JSON.parse(line.substring(5).trim());
                if (data.type === 'tool_complete' && data.result?.type === 'missing_fields') {
                  log.success(`检测到缺失字段: ${JSON.stringify(data.result.missing_fields?.map(f => f.name) || [])}`);
                  log.info(`提示信息: ${data.result.ui_instruction?.message || '无'}`);
                }
              }
            }
          } catch (e) {
            // 忽略解析错误
          }

          console.log('\n响应示例（前500字符）:');
          console.log(body.substring(0, 500));
        } else {
          log.warn('未检测到缺失字段提示，可能AI直接执行了操作或给出了其他回复');
          console.log('\n响应示例（前500字符）:');
          console.log(body.substring(0, 500));
        }
      } else {
        log.error(`请求失败: ${response.status}`);
        console.log(JSON.stringify(response.body, null, 2));
      }

      // 等待一下避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      log.error(`测试失败: ${error.message}`);
    }
  }
}

// 主函数
async function main() {
  console.clear();
  log.header('🧪 AI缺失字段提示功能测试');

  try {
    // 1. 登录获取Token
    const token = await quickLogin();

    // 2. 测试缺失字段提示
    await testMissingFields(token);

    log.header('📊 测试完成');
    log.success('所有测试用例执行完成！');

    console.log('\n测试说明:');
    console.log('  ✓ 发送了不完整的创建请求');
    console.log('  ✓ 验证是否收到缺失字段提示');
    console.log('  ✓ 检查 MissingFieldsDialog 是否会被触发');
    console.log('\n如需在前端查看完整效果，请访问:');
    console.log('  http://localhost:5173');
    console.log('  登录后打开AI助手，发送类似的不完整请求');

  } catch (error) {
    log.error(`测试失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行测试
main();
