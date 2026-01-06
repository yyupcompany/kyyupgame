import { directResponseService } from '../services/ai/direct-response.service';

async function testDirectResponse() {
  try {
    console.log('🧪 测试直接响应服务...');
    
    // 测试学生总数查询
    const result = await directResponseService.executeDirectAction('count_students', '学生总数');
    
    console.log('📊 直接响应结果:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 结果分析:');
    console.log('- success:', result.success);
    console.log('- response:', result.response);
    console.log('- data:', result.data);
    console.log('- tokensUsed:', result.tokensUsed);
    console.log('- processingTime:', result.processingTime);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testDirectResponse();
