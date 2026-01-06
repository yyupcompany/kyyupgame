import axios from 'axios';

const BASE_URL = 'http://k.yyup.cc';
const ACTIVITY_ID = 156;
const SHARER_ID = 121;

async function testPageAccess() {
  console.log('🚀 开始测试活动报名页面访问\n');
  console.log('=' .repeat(60));
  
  // 测试1: 不带分享者ID的访问
  console.log('\n📋 测试1: 访问报名页面（不带分享者ID）');
  console.log(`URL: ${BASE_URL}/activity/register/${ACTIVITY_ID}`);
  
  try {
    const response1 = await axios.get(`${BASE_URL}/activity/register/${ACTIVITY_ID}`, {
      maxRedirects: 0,
      validateStatus: (status) => status < 500
    });
    
    console.log(`✅ 状态码: ${response1.status}`);
    console.log(`✅ 页面可访问`);
  } catch (error) {
    if (error.response) {
      console.log(`⚠️ 状态码: ${error.response.status}`);
      if (error.response.status === 404) {
        console.log('❌ 页面不存在 - 可能路由未正确配置');
      } else if (error.response.status === 302 || error.response.status === 301) {
        console.log(`✅ 重定向到: ${error.response.headers.location}`);
      }
    } else {
      console.log('❌ 请求失败:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 测试2: 带分享者ID的访问
  console.log('\n📋 测试2: 访问报名页面（带分享者ID）');
  console.log(`URL: ${BASE_URL}/activity/register/${ACTIVITY_ID}?sharerId=${SHARER_ID}`);
  
  try {
    const response2 = await axios.get(
      `${BASE_URL}/activity/register/${ACTIVITY_ID}?sharerId=${SHARER_ID}`,
      {
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      }
    );
    
    console.log(`✅ 状态码: ${response2.status}`);
    console.log(`✅ 页面可访问`);
  } catch (error) {
    if (error.response) {
      console.log(`⚠️ 状态码: ${error.response.status}`);
      if (error.response.status === 404) {
        console.log('❌ 页面不存在 - 可能路由未正确配置');
      } else if (error.response.status === 302 || error.response.status === 301) {
        console.log(`✅ 重定向到: ${error.response.headers.location}`);
      }
    } else {
      console.log('❌ 请求失败:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 测试3: 检查前端服务状态
  console.log('\n📋 测试3: 检查前端服务状态');
  console.log(`URL: ${BASE_URL}`);
  
  try {
    const response3 = await axios.get(BASE_URL, {
      maxRedirects: 0,
      validateStatus: (status) => status < 500
    });
    
    console.log(`✅ 前端服务正常运行`);
    console.log(`✅ 状态码: ${response3.status}`);
  } catch (error) {
    if (error.response) {
      console.log(`⚠️ 状态码: ${error.response.status}`);
    } else {
      console.log('❌ 前端服务未运行:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 总结
  console.log('\n📊 测试总结:');
  console.log('  - 前端服务地址: http://k.yyup.cc (localhost:5173)');
  console.log('  - 报名页面路由: /activity/register/:id');
  console.log('  - 测试活动ID: 156');
  console.log('  - 测试分享者ID: 121');
  console.log('\n💡 提示:');
  console.log('  1. 确保前端服务已启动 (npm run dev)');
  console.log('  2. 确保路由已正确配置');
  console.log('  3. 在浏览器中手动访问测试链接');
  console.log('  4. 使用浏览器开发者工具检查控制台错误');
  
  console.log('\n✅ 测试完成！');
  console.log('=' .repeat(60));
}

// 运行测试
testPageAccess().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});

