import fetch from 'node-fetch';

async function testParentCenterPages() {
  console.log('开始检测家长中心页面404错误...\n');

  // 家长中心所有页面路由（基于侧边栏组件）
  const parentCenterRoutes = [
    '/parent-center/dashboard',
    '/parent-center/children',
    '/parent-center/child-growth',
    '/parent-center/assessment',
    '/parent-center/games',
    '/parent-center/ai-assistant',
    '/parent-center/activities',
    '/parent-center/communication',
    '/parent-center/photo-album',
    '/parent-center/kindergarten-rewards',
    '/parent-center/notifications'
  ];

  const results = [];

  for (const route of parentCenterRoutes) {
    const url = `http://localhost:5173${route}`;
    console.log(`检测页面: ${route}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        timeout: 5000
      });

      const text = await response.text();
      const is404 = response.status === 404 ||
                   text.includes('404') ||
                   text.includes('Not Found') ||
                   text.includes('This page could not be found');

      // 检查是否有实际内容（不仅仅是404页面）
      const hasContent = text.length > 1000 && !is404;

      results.push({
        route,
        url,
        status: response.status,
        is404,
        hasContent,
        contentLength: text.length
      });

      console.log(`  状态: ${response.status}, 404: ${is404}, 内容长度: ${text.length}`);

    } catch (error) {
      results.push({
        route,
        url,
        status: 'ERROR',
        is404: true,
        hasContent: false,
        contentLength: 0,
        error: error.message
      });

      console.log(`  加载失败: ${error.message}`);
    }
  }

  return results;
}

// 运行测试
testParentCenterPages().catch(console.error);