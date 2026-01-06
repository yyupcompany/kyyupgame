/**
 * Mock Server 启动脚本
 * 在 4000 端口上运行 Mock Server，用于测试 API
 */

import app from './mock-server';

const PORT = process.env.MOCK_PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Mock Server 运行在 http://localhost:${PORT}`);
});



