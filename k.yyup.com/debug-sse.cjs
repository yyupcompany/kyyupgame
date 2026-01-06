const http = require('http');

// 先登录
const login = () => new Promise((resolve) => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(JSON.parse(data).data.token));
  });
  req.write(JSON.stringify({phone:'18611141131',password:'123456'}));
  req.end();
});

login().then(token => {
  // 发送SSE请求
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai/unified/stream-chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let count = 0;
    let toolCallEvent = null;
    res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          count++;
          const event = JSON.parse(line.slice(6));
          if (event.type === 'tool_call_start' && !toolCallEvent) {
            toolCallEvent = event;
            console.log('\n=== tool_call_start event ===');
            console.log(JSON.stringify(event, null, 2));
          }
          if (count === 1) {
            console.log('\n=== First event ===');
            console.log(JSON.stringify(event, null, 2));
          }
        }
      }
    });
    res.on('end', () => {
      console.log('\n=== Summary ===');
      console.log('Total events:', count);
      process.exit(0);
    });
  });
  req.write(JSON.stringify({
    message: '查询所有学生信息',
    context: { userId: '1', role: 'admin' }
  }));
  req.end();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
