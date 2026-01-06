/**
 * 审计家长端页面 - 检查是否使用了全局布局和设计令牌
 */

import * as fs from 'fs';
import * as path from 'path';

const parentCenterPath = path.join(__dirname, '../../../client/src/pages/parent-center');

interface PageAudit {
  file: string;
  hasUnifiedLayout: boolean;
  hasDesignTokens: boolean;
  hasGlobalStyles: boolean;
  issues: string[];
}

function auditPage(filePath: string): PageAudit {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.relative(parentCenterPath, filePath);
  
  const audit: PageAudit = {
    file: fileName,
    hasUnifiedLayout: false,
    hasDesignTokens: false,
    hasGlobalStyles: false,
    issues: []
  };

  // 检查是否使用了UnifiedCenterLayout
  if (content.includes('UnifiedCenterLayout')) {
    audit.hasUnifiedLayout = true;
  } else {
    audit.issues.push('❌ 未使用UnifiedCenterLayout全局布局');
  }

  // 检查是否使用了设计令牌
  if (content.includes('colorTokens') || 
      content.includes('sizeTokens') || 
      content.includes('DesignTokenManager') ||
      content.includes('--color-') ||
      content.includes('--size-') ||
      content.includes('var(--')) {
    audit.hasDesignTokens = true;
  } else {
    audit.issues.push('⚠️ 可能未使用设计令牌');
  }

  // 检查是否使用了全局样式
  if (content.includes('scoped') || content.includes('class=')) {
    audit.hasGlobalStyles = true;
  }

  // 检查是否有硬编码的颜色值
  if (content.match(/#[0-9a-fA-F]{6}|rgb\(|rgba\(/)) {
    audit.issues.push('⚠️ 检测到硬编码的颜色值，应使用设计令牌');
  }

  // 检查是否有硬编码的尺寸值
  if (content.match(/\d+px|width:\s*\d+|height:\s*\d+/)) {
    audit.issues.push('⚠️ 检测到硬编码的尺寸值，应使用设计令牌');
  }

  return audit;
}

function auditAllPages() {
  console.log('🔍 审计家长端页面...\n');

  const vueFiles: string[] = [];
  
  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.vue')) {
        vueFiles.push(filePath);
      }
    }
  }

  walkDir(parentCenterPath);

  console.log(`📊 找到 ${vueFiles.length} 个Vue文件\n`);

  const audits = vueFiles.map(file => auditPage(file));

  // 统计结果
  const withLayout = audits.filter(a => a.hasUnifiedLayout).length;
  const withTokens = audits.filter(a => a.hasDesignTokens).length;
  const withIssues = audits.filter(a => a.issues.length > 0).length;

  console.log('📈 审计结果统计:');
  console.log(`  ✅ 使用UnifiedLayout: ${withLayout}/${vueFiles.length}`);
  console.log(`  ✅ 使用设计令牌: ${withTokens}/${vueFiles.length}`);
  console.log(`  ⚠️ 有问题的页面: ${withIssues}/${vueFiles.length}\n`);

  // 显示详细结果
  console.log('📋 详细审计结果:\n');
  audits.forEach((audit, index) => {
    console.log(`${index + 1}. ${audit.file}`);
    if (audit.hasUnifiedLayout) {
      console.log('   ✅ 使用了UnifiedCenterLayout');
    }
    if (audit.hasDesignTokens) {
      console.log('   ✅ 使用了设计令牌');
    }
    if (audit.issues.length > 0) {
      audit.issues.forEach(issue => {
        console.log(`   ${issue}`);
      });
    }
    console.log('');
  });

  // 显示需要修复的页面
  const needsFix = audits.filter(a => a.issues.length > 0);
  if (needsFix.length > 0) {
    console.log(`\n🔧 需要修复的页面 (${needsFix.length}个):\n`);
    needsFix.forEach(audit => {
      console.log(`  - ${audit.file}`);
    });
  }

  console.log('\n✅ 审计完成');
}

auditAllPages();

