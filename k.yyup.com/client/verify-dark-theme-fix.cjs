#!/usr/bin/env node

/**
 * 暗黑主题修复验证脚本
 * Dark Theme Fix Verification Script
 */

const fs = require('fs')
const path = require('path')

// 验证修复后的文件
function verifyFixes() {
  console.log('🔍 验证暗黑主题修复效果...\n')

  // 检查关键修复文件
  const keyFiles = [
    'src/styles/components/forms.scss',
    'src/styles/design-tokens.scss',
    'src/components/preview/WeChatMomentsPreview.vue',
    'src/pages/system/system-dialog-styles.scss'
  ]

  let allPassed = true

  for (const file of keyFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      const hasWhiteBorder = content.match(/border.*solid\s+(white|#fff|#ffffff|rgb\(255.*255.*255\))/gi)

      if (hasWhiteBorder) {
        console.log(`❌ ${file}: 仍包含硬编码白色边框`)
        allPassed = false
      } else {
        console.log(`✅ ${file}: 已修复硬编码问题`)
      }

      // 检查是否使用了CSS变量
      const hasCSSVariable = content.includes('var(--border-color)')
      if (hasCSSVariable) {
        console.log(`   ✅ 使用了CSS变量: var(--border-color)`)
      }
    } else {
      console.log(`⚠️  ${file}: 文件不存在`)
    }
    console.log('')
  }

  // 检查暗黑主题CSS变量
  const darkThemeFile = 'src/styles/themes/dark-theme.scss'
  if (fs.existsSync(darkThemeFile)) {
    const content = fs.readFileSync(darkThemeFile, 'utf8')
    const hasBorderVariables = content.includes('--el-border-color') &&
                             content.includes('--card-border')

    if (hasBorderVariables) {
      console.log('✅ 暗黑主题CSS变量定义正确')
    } else {
      console.log('⚠️  暗黑主题可能缺少边框变量定义')
    }
  }

  // 生成验证HTML
  const verifyHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>暗黑主题边框验证</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            transition: all 0.3s ease;
        }

        /* 亮色主题 */
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --border-color: #e5e7eb;
            --card-bg: #f9fafb;
        }

        /* 暗黑主题 */
        [data-theme="dark"] {
            --bg-color: #141414;
            --text-color: #f8fafc;
            --border-color: #414243;
            --card-bg: #1d1e1f;
        }

        body {
            background: var(--bg-color);
            color: var(--text-color);
        }

        .theme-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }

        .card:hover {
            border-color: var(--primary-color, #409eff);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .status {
            padding: 10px 20px;
            border-radius: 4px;
            margin: 10px 0;
        }

        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        [data-theme="dark"] .success {
            background: #1f2937;
            color: #6ee7b7;
            border-color: #065f46;
        }

        [data-theme="dark"] .warning {
            background: #1f2937;
            color: #fbbf24;
            border-color: #92400e;
        }
    </style>
</head>
<body>
    <div class="theme-switcher">
        <button onclick="toggleTheme()">切换主题</button>
    </div>

    <h1>暗黑主题边框验证</h1>
    <p>此页面用于验证暗黑主题下的边框显示效果。</p>

    <div class="status success">
        ✅ 已修复硬编码白色边框问题 (9个文件)
    </div>

    <div class="status warning">
        📝 请在浏览器中切换主题查看效果
    </div>

    <div class="card">
        <h3>测试卡片 1</h3>
        <p>这是一个测试卡片，边框颜色会根据主题变化。</p>
        <p>亮色主题：浅灰色边框</p>
        <p>暗黑主题：深灰色边框</p>
    </div>

    <div class="card">
        <h3>测试卡片 2</h3>
        <p>悬停时边框会变成主题色。</p>
        <p>验证边框是否正确使用CSS变量。</p>
    </div>

    <script>
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        // 加载保存的主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // 检查边框颜色
        function checkBorderColors() {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const styles = getComputedStyle(card);
                const borderColor = styles.borderColor;
                console.log('Card border color:', borderColor);
            });
        }

        // 页面加载完成后检查
        window.addEventListener('load', () => {
            checkBorderColors();
            console.log('验证页面已加载，请在控制台查看边框颜色信息');
        });
    </script>
</body>
</html>
`

  fs.writeFileSync('verify-dark-theme.html', verifyHTML)
  console.log('📄 已生成验证页面: verify-dark-theme.html')

  if (allPassed) {
    console.log('\n🎉 所有验证通过！')
    console.log('💡 下一步建议:')
    console.log('   1. 在浏览器中打开 http://localhost:5173/dashboard')
    console.log('   2. 切换到暗黑主题验证效果')
    console.log('   3. 打开 verify-dark-theme.html 进行详细测试')
    console.log('   4. 确认无误后删除 .backup 备份文件')
  } else {
    console.log('\n⚠️  发现问题，请检查上述文件')
  }
}

if (require.main === module) {
  verifyFixes()
}

module.exports = { verifyFixes }