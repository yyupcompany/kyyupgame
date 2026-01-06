#!/usr/bin/env node

/**
 * 统一认证中心测试适配脚本
 * 批量更新测试用例以使用统一认证中心接口
 */

const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const TEST_FILES = [
  'client/tests/unit/api/endpoints/auth.test.ts',
  'client/tests/unit/api/endpoints.test.ts',
  'client/tests/unit/api/endpoints/index.test.ts',
  'client/tests/integration/user-chat-simulation.test.ts',
  'client/tests/integration/simple-api-integration.test.ts',
  'client/tests/integration/real-user-scenario.test.ts',
  'client/tests/integration/real-ai-model-integration.test.ts',
  'client/tests/integration/dashboard-api-alignment.test.ts',
  'client/tests/integration/direct-ai-model-test.test.ts',
  'client/tests/integration/ai-assistant-real-integration.test.ts',
  'client/tests/integration/ai-no-hardcode-integration.test.ts',
  'client/tests/integration/ai-assistant-real-api.test.ts',
  'client/tests/e2e/auth.e2e.test.ts',
  'client/tests/environment/production-consistency.test.ts',
  'client/tests/integration/performance-integration.test.ts',
  'client/tests/integration/multi-user-concurrent.test.ts',
  'client/tests/integration/user-workflow.test.ts',
  'client/tests/integration/real-backend.test.ts',
  'client/tests/e2e-api-integration/tests/api-only/api-connectivity.test.ts'
];

// 旧的接口和响应格式映射
const REPLACEMENTS = {
  // 旧接口 -> 新接口
  '/api/auth/login': '/api/auth/unified-login',

  // 旧响应字段 -> 新响应字段
  'loginResponse.data.data.token': 'loginResponse.data.data.accessToken',
  'loginResponse.data.token': 'loginResponse.data.accessToken',
  'loginResponse.data.refresh_token': 'loginResponse.data.data.refreshToken',
  'loginResponse.data.refreshToken': 'loginResponse.data.data.refreshToken',

  // 旧的测试凭据
  'admin': '13800138000',
  'admin123': '123456', // 假设统一认证中心密码
  'TEST_USERNAME || \'admin\'': 'TEST_USERNAME || \'13800138000\'',
  'TEST_PASSWORD || \'admin123\'': 'TEST_PASSWORD || \'123456\''
};

/**
 * 更新单个测试文件
 */
function updateTestFile(filePath) {
  try {
    console.log(`🔧 更新文件: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // 应用替换规则
    Object.entries(REPLACEMENTS).forEach(([oldText, newText]) => {
      const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]]/g, '\\$&'), 'g');
      if (content.includes(oldText)) {
        content = content.replace(regex, newText);
        updated = true;
        console.log(`  ✅ 替换: ${oldText} -> ${newText}`);
      }
    });

    // 添加统一认证导入（如果需要）
    if (!content.includes('unifiedLogin') && updated) {
      const authImport = `import { authApi } from '@/api/auth';`;
      const authImportRegex = /import.*auth.*from.*@\/api\/auth['"]/;

      if (authImportRegex.test(content)) {
        // 如果已经导入了auth，则不重复导入
        console.log(`  ℹ️  已存在auth导入，跳过添加`);
      } else {
        // 在适当位置添加auth导入
        const importPosition = content.indexOf('import');
        if (importPosition !== -1) {
          const lines = content.split('\n');
          let insertIndex = 0;

          // 找到最后一个import语句
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import')) {
              insertIndex = i;
            }
          }

          lines.splice(insertIndex + 1, 0, '');
          lines.splice(insertIndex + 1, 0, authImport);
          content = lines.join('\n');
          console.log(`  ✅ 添加统一认证导入`);
        }
      }
    }

    // 添加示例统一认证登录逻辑（如果需要）
    if (content.includes('/api/auth/unified-login') && !content.includes('unifiedLogin(')) {
      const unifiedLoginExample = `
// 示例：使用统一认证中心登录
const unifiedLoginData = {
  phone: '13800138000',
  password: '123456',
  tenantCode: 'kindergarten_001'
};
const unifiedLoginResponse = await authApi.unifiedLogin(unifiedLoginData);
`;

      if (content.includes('axios.post')) {
        const axioPostRegex = /axios\.post.*login.*TEST_CREDENTIALS/;
        if (axioPostRegex.test(content)) {
          content = content.replace(
            axioPostRegex,
            'authApi.unifiedLogin(unifiedLoginData)'
          );
          console.log(`  ✅ 替换登录调用`);
        }
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 文件更新完成`);
      return true;
    } else {
      console.log(`  ℹ️  文件无需更新`);
      return false;
    }

  } catch (error) {
    console.error(`❌ 更新文件失败 ${filePath}:`, error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始统一认证中心测试适配...\n');

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  TEST_FILES.forEach(filePath => {
    const fullPath = path.resolve(__dirname, '../../../', filePath);

    if (fileExists(fullPath)) {
      const updated = updateTestFile(fullPath);
      if (updated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
      skippedCount++;
    }
  });

  console.log(`\n📊 更新完成统计:`);
  console.log(`  ✅ 已更新: ${updatedCount} 个文件`);
  console.log(`  ⚠️  跳过: ${skippedCount} 个文件`);
  console.log(`  ❌ 错误: ${errorCount} 个文件`);

  if (updatedCount > 0) {
    console.log(`\n🎯 下一步建议:`);
    console.log(`   1. 更新测试凭据为统一认证中心的有效账号`);
    console.log(`  2. 运行测试验证修复效果`);
    console.log(`   3. 如有需要，手动调整特定的测试逻辑`);
  } else {
    console.log(`\nℹ️  所有文件都已适配统一认证中心或无需更新`);
  }

  console.log(`\n✨ 统一认证中心测试适配完成！`);
}

// 运行脚本
if (require.main === module) {
  main();
}