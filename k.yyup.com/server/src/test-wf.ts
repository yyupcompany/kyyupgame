import executeActivityWorkflowTool from './services/ai/tools/workflow/activity-workflow/execute-activity-workflow.tool';

async function test() {
  console.log('=== 测试活动工作流 ===\n');
  
  const result = await executeActivityWorkflowTool.handler({
    userInput: '帮我创建一个六一儿童节亲子活动',
    confirmed: true
  });
  
  console.log('\n=== 结果 ===');
  console.log('成功:', result.success);
  console.log('状态:', result.status);
  
  if (result.data) {
    console.log('\n=== 生成资源 ===');
    console.log('活动ID:', result.data.activityId);
    console.log('海报URL:', result.data.posterUrl);
    console.log('手机海报:', result.data.mobilePosterUrls);
    console.log('二维码URL:', result.data.qrCodeUrl?.substring(0, 80) + '...');
  }
  
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
