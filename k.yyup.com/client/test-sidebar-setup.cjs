// 快速验证侧边栏测试系统是否正常工作
const { execSync } = require('child_process');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                    侧边栏测试系统验证                         ║
║                   Sidebar Test System Check                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

const checks = [
  {
    name: 'Node.js版本检查',
    check: () => {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      return majorVersion >= 18;
    },
    details: () => `当前版本: ${process.version} (需要 >= 18.0.0)`
  },
  {
    name: '测试脚本存在性检查',
    check: () => {
      const scripts = [
        './test-centers-comprehensive.cjs',
        './test-teacher-center.cjs',
        './test-parent-center.cjs',
        './run-sidebar-tests.cjs',
        './sidebar-test-manager.cjs'
      ];
      return scripts.every(script => fs.existsSync(script));
    },
    details: () => '所有核心测试脚本都存在'
  },
  {
    name: 'Playwright依赖检查',
    check: () => {
      try {
        execSync('npx playwright --version', { stdio: 'pipe' });
        return true;
      } catch (error) {
        return false;
      }
    },
    details: () => 'Playwright已安装并可执行'
  },
  {
    name: '输出目录权限检查',
    check: () => {
      try {
        const testDir = './test-results/verify-test';
        if (!fs.existsSync('./test-results')) {
          fs.mkdirSync('./test-results', { recursive: true });
        }
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(`${testDir}/test.txt`, 'test');
        fs.rmSync(testDir, { recursive: true, force: true });
        return true;
      } catch (error) {
        return false;
      }
    },
    details: () => '可以创建和写入test-results目录'
  },
  {
    name: '服务器连接检查',
    check: () => {
      return new Promise((resolve) => {
        try {
          const http = require('http');
          const checkServer = (port, name) => {
            return new Promise((portResolve) => {
              const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/',
                method: 'HEAD',
                timeout: 3000
              }, (res) => {
                portResolve(res.statusCode < 500);
              });

              req.on('error', () => portResolve(false));
              req.on('timeout', () => portResolve(false));
              req.end();
            });
          };

          Promise.all([
            checkServer(5173, 'frontend'),
            checkServer(3000, 'backend')
          ]).then(([frontend, backend]) => {
            resolve(frontend || backend); // 至少一个服务运行
          });
        } catch (error) {
          resolve(false);
        }
      });
    },
    details: () => '至少有一个服务器在运行 (前端5173或后端3000)'
  },
  {
    name: 'package.json脚本检查',
    check: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const scripts = [
          'test:sidebar',
          'test:sidebar:centers',
          'test:sidebar:teacher',
          'test:sidebar:parent'
        ];
        return scripts.every(script => packageJson.scripts[script]);
      } catch (error) {
        return false;
      }
    },
    details: () => '所有侧边栏测试脚本已添加到package.json'
  }
];

async function runChecks() {
  let passed = 0;
  let total = checks.length;

  for (const check of checks) {
    process.stdout.write(`\n🔍 检查: ${check.name}... `);

    try {
      const result = await check.check();
      if (result) {
        colorLog('green', '✅ 通过');
        console.log(`   ${check.details()}`);
        passed++;
      } else {
        colorLog('red', '❌ 失败');
        console.log(`   ${check.details()}`);
      }
    } catch (error) {
      colorLog('red', '❌ 错误');
      console.log(`   检查失败: ${error.message}`);
    }
  }

  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

  if (passed === total) {
    colorLog('green', `\n🎉 所有检查通过! (${passed}/${total})`);
    colorLog('green', '✅ 侧边栏测试系统已准备就绪\n');

    colorLog('cyan', '🚀 现在可以运行测试:');
    colorLog('white', '  npm run test:sidebar           # 运行所有测试');
    colorLog('white', '  npm run test:sidebar:centers   # 只测试centers目录');
    colorLog('white', '  npm run test:sidebar:teacher   # 只测试teacher-center');
    colorLog('white', '  npm run test:sidebar:parent    # 只测试parent-center');
    colorLog('white', '  npm run test:sidebar:help      # 查看帮助信息\n');

  } else {
    colorLog('red', `\n⚠️ 部分检查未通过 (${passed}/${total})`);
    colorLog('yellow', '\n🛠️  请检查以下问题:');

    if (passed === 0) {
      colorLog('yellow', '  • Node.js版本 - 需要v18或更高版本');
      colorLog('yellow', '  • 依赖安装 - 运行 npm install');
      colorLog('yellow', '  • 服务器启动 - 启动开发服务器');
    }

    colorLog('yellow', '\n📋 完成以下步骤后再运行测试:');
    colorLog('white', '  1. 确保Node.js版本 >= 18.0.0');
    colorLog('white', '  2. 运行 npm install 安装依赖');
    colorLog('white', '  3. 启动开发服务器: npm run start:all');
    colorLog('white', '  4. 重新运行此验证脚本\n');
  }

  colorLog('cyan', '📚 更多信息请查看: README-SIDEBAR-TESTS.md');
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

  process.exit(passed === total ? 0 : 1);
}

// 运行检查
runChecks().catch(error => {
  colorLog('red', `\n❌ 验证过程出错: ${error.message}`);
  process.exit(1);
});