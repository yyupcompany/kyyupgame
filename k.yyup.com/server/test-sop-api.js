/**
 * SOP API 测试脚本
 * 测试模板CRUD和实例管理
 */
const http = require('http');

// 测试配置
const BASE_URL = 'http://localhost:3000';

// 发送HTTP请求
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  console.log('🚀 开始测试 SOP API...\n');

  try {
    // 1. 登录获取token
    console.log('1. 登录获取token...');
    const loginRes = await request('POST', '/api/auth/login', {
      phone: '13800138001',
      password: '123456'
    });
    
    if (!loginRes.data.success) {
      console.log('❌ 登录失败:', loginRes.data);
      return;
    }
    
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功，token:', token.substring(0, 30) + '...\n');

    // 2. 获取SOP模板列表
    console.log('2. 测试 GET /api/admin/sop-templates...');
    const listRes = await request('GET', '/api/admin/sop-templates', null, token);
    console.log('响应:', JSON.stringify(listRes.data, null, 2).substring(0, 500));
    console.log('✅ 获取模板列表成功\n');

    // 3. 创建新模板
    console.log('3. 测试 POST /api/admin/sop-templates...');
    const createRes = await request('POST', '/api/admin/sop-templates', {
      name: '测试SOP模板',
      type: 'sales',
      description: 'API测试创建的模板',
      color: '#FF5722'
    }, token);
    console.log('响应:', JSON.stringify(createRes.data, null, 2));
    
    if (createRes.data.success) {
      console.log('✅ 创建模板成功\n');
      const templateId = createRes.data.data.id;

      // 4. 获取模板详情
      console.log(`4. 测试 GET /api/admin/sop-templates/${templateId}...`);
      const detailRes = await request('GET', `/api/admin/sop-templates/${templateId}`, null, token);
      console.log('响应:', JSON.stringify(detailRes.data, null, 2).substring(0, 500));
      console.log('✅ 获取模板详情成功\n');

      // 5. 添加节点
      console.log(`5. 测试 POST /api/admin/sop-templates/${templateId}/nodes...`);
      const nodeRes = await request('POST', `/api/admin/sop-templates/${templateId}/nodes`, {
        nodeOrder: 1,
        nodeName: '测试节点1',
        nodeDescription: '这是一个测试节点',
        durationDays: 3
      }, token);
      console.log('响应:', JSON.stringify(nodeRes.data, null, 2));
      console.log('✅ 添加节点成功\n');

      // 6. 更新模板
      console.log(`6. 测试 PUT /api/admin/sop-templates/${templateId}...`);
      const updateRes = await request('PUT', `/api/admin/sop-templates/${templateId}`, {
        name: '更新后的SOP模板',
        description: '已更新的描述'
      }, token);
      console.log('响应:', JSON.stringify(updateRes.data, null, 2));
      console.log('✅ 更新模板成功\n');

      // 7. Teacher端 - 获取模板列表
      console.log('7. 测试 GET /api/teacher/sop/templates...');
      const teacherListRes = await request('GET', '/api/teacher/sop/templates', null, token);
      console.log('响应:', JSON.stringify(teacherListRes.data, null, 2).substring(0, 500));
      console.log('✅ Teacher获取模板列表成功\n');

      // 8. Teacher端 - 创建实例
      console.log('8. 测试 POST /api/teacher/sop/instances...');
      const instanceRes = await request('POST', '/api/teacher/sop/instances', {
        templateId: templateId,
        instanceName: '测试客户跟进',
        notes: 'API测试创建'
      }, token);
      console.log('响应:', JSON.stringify(instanceRes.data, null, 2).substring(0, 800));
      console.log('✅ Teacher创建实例成功\n');

      // 9. 删除测试模板
      console.log(`9. 测试 DELETE /api/admin/sop-templates/${templateId}...`);
      const deleteRes = await request('DELETE', `/api/admin/sop-templates/${templateId}`, null, token);
      console.log('响应:', JSON.stringify(deleteRes.data, null, 2));
      console.log('✅ 删除模板成功\n');
    } else {
      console.log('❌ 创建模板失败:', createRes.data);
    }

    console.log('\n🎉 所有API测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

main();
