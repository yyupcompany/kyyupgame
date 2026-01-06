#!/usr/bin/env ts-node

/**
 * 数据库-路由对齐检查命令行工具
 * 使用方法：
 * npm run check:alignment
 * npm run check:alignment -- --fix
 * npm run check:alignment -- --table students
 */

import { DatabaseRouteAlignmentChecker } from '../tools/database-route-alignment-checker';

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const tableFilter = args.find(arg => arg.startsWith('--table='))?.split('=')[1];

  console.log('🚀 数据库-路由对齐检查工具');
  console.log('='.repeat(50));

  try {
    if (tableFilter) {
      // 检查特定表的字段对齐
      console.log(`🎯 检查表: ${tableFilter}`);
      const fieldReport = await DatabaseRouteAlignmentChecker.checkFieldAlignment(tableFilter);
      
      console.log('\n📊 字段对齐报告:');
      console.log(`数据库字段 (${fieldReport.dbFields.length}个):`, fieldReport.dbFields.join(', '));
      console.log(`模型字段 (${fieldReport.modelFields.length}个):`, fieldReport.modelFields.join(', '));
      console.log(`API字段 (${fieldReport.apiFields.length}个):`, fieldReport.apiFields.join(', '));
      
      if (fieldReport.missingInAPI.length > 0) {
        console.log(`❌ API中缺少的字段:`, fieldReport.missingInAPI.join(', '));
      }
      
      if (fieldReport.extraInAPI.length > 0) {
        console.log(`⚠️ API中多余的字段:`, fieldReport.extraInAPI.join(', '));
      }
      
      console.log('\n🗺️ 字段映射关系:');
      Object.entries(fieldReport.fieldMappings).forEach(([dbField, apiField]) => {
        console.log(`  ${dbField} -> ${apiField}`);
      });
      
    } else {
      // 检查所有表的对齐情况
      const report = await DatabaseRouteAlignmentChecker.checkTableRouteAlignment();
      
      console.log('\n📊 对齐情况统计:');
      console.log(`总表数: ${report.totalTables}`);
      console.log(`已对齐: ${report.aligned.length}`);
      console.log(`未对齐: ${report.misaligned.length}`);
      console.log(`对齐分数: ${(report.alignmentScore * 100).toFixed(1)}%`);
      
      if (report.misaligned.length > 0) {
        console.log('\n❌ 未对齐的表:');
        report.misaligned.forEach(item => {
          console.log(`  ${item.table} -> ${item.expectedRoute} (${item.status})`);
          if (item.details) {
            console.log(`    ${item.details}`);
          }
        });
      }
      
      if (report.aligned.length > 0) {
        console.log('\n✅ 已对齐的表:');
        report.aligned.slice(0, 10).forEach(item => {
          console.log(`  ${item.table} -> ${item.route}`);
        });
        if (report.aligned.length > 10) {
          console.log(`  ... 还有 ${report.aligned.length - 10} 个已对齐`);
        }
      }
      
      // 生成报告文件
      await DatabaseRouteAlignmentChecker.generateAlignmentReport(report);
      
      // 自动修复
      if (shouldFix && report.misaligned.length > 0) {
        console.log('\n🔧 开始自动修复...');
        const fixReport = await DatabaseRouteAlignmentChecker.autoFixAlignment(report);
        
        console.log(`✅ 修复完成: ${fixReport.totalFixed} 个问题已解决`);
        if (fixReport.errors.length > 0) {
          console.log(`❌ 修复失败: ${fixReport.errors.length} 个问题`);
          fixReport.errors.forEach(error => console.log(`  ${error}`));
        }
        
        // 重新检查
        console.log('\n🔄 重新检查对齐情况...');
        const newReport = await DatabaseRouteAlignmentChecker.checkTableRouteAlignment();
        console.log(`新的对齐分数: ${(newReport.alignmentScore * 100).toFixed(1)}%`);
      }
    }
    
    console.log('\n✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default main;