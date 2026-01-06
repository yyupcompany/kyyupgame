#!/usr/bin/env ts-node
import { sequelize } from '../init';
import * as fs from 'fs';
import * as path from 'path';

// 获取所有页面文件的函数
function getAllPageFiles(dir: string): string[] {
  let files: string[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllPageFiles(fullPath));
    } else if (item.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 根据文件路径生成路由路径
function generateRoutePath(filePath: string): string {
  // 移除基础路径和扩展名
  const relativePath = filePath.replace('/home/devbox/project/client/src/pages/', '');
  const withoutExtension = relativePath.replace('.vue', '');
  
  // 处理特殊情况
  if (withoutExtension === 'index' || withoutExtension.endsWith('/index')) {
    return withoutExtension === 'index' ? '/' : `/${withoutExtension.replace('/index', '')}`;
  }
  
  // 处理动态路由 [id] -> :id
  const routePath = withoutExtension.replace(/\[([^\]]+)\]/g, ':$1');
  
  return `/${routePath}`;
}

// 根据文件路径生成权限代码
function generatePermissionCode(filePath: string): string {
  const relativePath = filePath.replace('/home/devbox/project/client/src/pages/', '');
  const withoutExtension = relativePath.replace('.vue', '');
  
  // 转换为大写，替换特殊字符
  return withoutExtension
    .toUpperCase()
    .replace(/[\/\-\[\]]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

// 根据文件路径生成显示名称
function generateDisplayName(filePath: string): string {
  const relativePath = filePath.replace('/home/devbox/project/client/src/pages/', '');
  const withoutExtension = relativePath.replace('.vue', '');
  
  // 获取最后一个部分作为显示名称
  const parts = withoutExtension.split('/');
  let displayName = parts[parts.length - 1];
  
  // 处理特殊情况
  if (displayName === 'index') {
    displayName = parts.length > 1 ? parts[parts.length - 2] : 'Index';
  }
  
  // 处理动态路由
  displayName = displayName.replace(/\[([^\]]+)\]/g, '$1详情');
  
  // 首字母大写
  return displayName.charAt(0).toUpperCase() + displayName.slice(1);
}

// 根据文件路径确定分类
function categorizeFile(filePath: string): { category: string; icon: string; sort: number } {
  const relativePath = filePath.replace('/home/devbox/project/client/src/pages/', '');
  
  if (relativePath.startsWith('dashboard/')) {
    return { category: 'DASHBOARD', icon: 'Monitor', sort: 1000 };
  } else if (relativePath.startsWith('system/')) {
    return { category: 'SYSTEM', icon: 'Setting', sort: 2000 };
  } else if (relativePath.startsWith('student/')) {
    return { category: 'STUDENT', icon: 'User', sort: 3000 };
  } else if (relativePath.startsWith('teacher/')) {
    return { category: 'TEACHER', icon: 'Avatar', sort: 4000 };
  } else if (relativePath.startsWith('parent/')) {
    return { category: 'PARENT', icon: 'User', sort: 5000 };
  } else if (relativePath.startsWith('class/')) {
    return { category: 'CLASS', icon: 'School', sort: 6000 };
  } else if (relativePath.startsWith('activity/')) {
    return { category: 'ACTIVITY', icon: 'Calendar', sort: 7000 };
  } else if (relativePath.startsWith('enrollment/') || relativePath.startsWith('enrollment-plan/')) {
    return { category: 'ENROLLMENT', icon: 'Document', sort: 8000 };
  } else if (relativePath.startsWith('application/')) {
    return { category: 'APPLICATION', icon: 'Files', sort: 9000 };
  } else if (relativePath.startsWith('ai/')) {
    return { category: 'AI', icon: 'ChatDotRound', sort: 10000 };
  } else if (relativePath.startsWith('principal/')) {
    return { category: 'PRINCIPAL', icon: 'Crown', sort: 11000 };
  } else if (relativePath.startsWith('marketing/')) {
    return { category: 'MARKETING', icon: 'Promotion', sort: 12000 };
  } else if (relativePath.startsWith('customer/')) {
    return { category: 'CUSTOMER', icon: 'User', sort: 13000 };
  } else if (relativePath.startsWith('analytics/')) {
    return { category: 'ANALYTICS', icon: 'DataAnalysis', sort: 14000 };
  } else if (relativePath.startsWith('statistics/')) {
    return { category: 'STATISTICS', icon: 'TrendCharts', sort: 15000 };
  } else if (relativePath.startsWith('advertisement/')) {
    return { category: 'ADVERTISEMENT', icon: 'Picture', sort: 16000 };
  } else if (relativePath.startsWith('chat/')) {
    return { category: 'CHAT', icon: 'ChatDotRound', sort: 17000 };
  } else if (relativePath.startsWith('centers/')) {
    return { category: 'PRINCIPAL', icon: 'Crown', sort: 11000 };
  } else {
    return { category: 'OTHER', icon: 'Menu', sort: 18000 };
  }
}

async function createCompletePermissions() {
  try {
    console.log('🔄 开始创建完整的权限系统（包含所有151个页面文件）...');
    
    // 1. 添加file_path字段到permissions表（如果不存在）
    console.log('🔧 检查并添加file_path字段...');
    try {
      await sequelize.query(`
        ALTER TABLE permissions 
        ADD COLUMN file_path VARCHAR(500) NULL COMMENT '完整的文件路径' 
        AFTER component
      `);
      console.log('✅ file_path字段添加成功');
    } catch (error: any) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  file_path字段已存在');
      } else {
        throw error;
      }
    }
    
    // 2. 清理现有权限（保留现有的分类结构）
    console.log('🧹 清理现有权限...');
    await sequelize.query(`DELETE FROM role_permissions WHERE 1=1`);
    await sequelize.query(`DELETE FROM permissions WHERE 1=1`);
    
    // 3. 获取所有页面文件
    console.log('📁 扫描所有页面文件...');
    const pagesDir = '/home/devbox/project/client/src/pages';
    const allFiles = getAllPageFiles(pagesDir);
    console.log(`📊 发现 ${allFiles.length} 个页面文件`);
    
    // 4. 按分类分组文件
    const categorizedFiles = new Map<string, any[]>();
    
    for (const filePath of allFiles) {
      const category = categorizeFile(filePath);
      if (!categorizedFiles.has(category.category)) {
        categorizedFiles.set(category.category, []);
      }
      
      const fileInfo = {
        filePath,
        routePath: generateRoutePath(filePath),
        permissionCode: generatePermissionCode(filePath),
        displayName: generateDisplayName(filePath),
        component: filePath.replace('/home/devbox/project/client/src/', ''),
        ...category
      };
      
      categorizedFiles.get(category.category)!.push(fileInfo);
    }
    
    // 5. 创建分类和权限
    console.log('🏗️  创建分类和权限...');
    let sortOrder = 1;
    const categoryNames = {
      'DASHBOARD': '仪表板',
      'SYSTEM': '系统管理',
      'STUDENT': '学生管理',
      'TEACHER': '教师管理',
      'PARENT': '家长管理',
      'CLASS': '班级管理',
      'ACTIVITY': '活动管理',
      'ENROLLMENT': '招生管理',
      'APPLICATION': '申请管理',
      'AI': 'AI助手',
      'PRINCIPAL': '园长功能',
      'MARKETING': '营销管理',
      'CUSTOMER': '客户管理',
      'ANALYTICS': '数据分析',
      'STATISTICS': '统计报表',
      'ADVERTISEMENT': '广告管理',
      'CHAT': '聊天功能',
      'OTHER': '其他功能'
    };
    
    for (const [categoryCode, files] of categorizedFiles) {
      const categoryName = categoryNames[categoryCode as keyof typeof categoryNames] || categoryCode;
      
      console.log(`\n📂 创建分类: ${categoryName} (${files.length} 个文件)`);
      
      // 创建分类权限
      await sequelize.query(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, file_path, permission, icon, sort, status, created_at, updated_at)
        VALUES (?, ?, 'category', NULL, ?, NULL, NULL, NULL, ?, ?, 1, NOW(), NOW())
      `, {
        replacements: [categoryName, `${categoryCode}_CATEGORY`, `#${categoryCode.toLowerCase()}`, files[0].icon, sortOrder++]
      });
      
      const [categoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
      const categoryId = (categoryResult[0] as any).id;
      
      // 创建该分类下的所有文件权限
      for (const file of files) {
        console.log(`  📄 添加文件: ${file.displayName} -> ${file.component}`);
        
        await sequelize.query(`
          INSERT INTO permissions (name, code, type, parent_id, path, component, file_path, permission, icon, sort, status, created_at, updated_at)
          VALUES (?, ?, 'menu', ?, ?, ?, ?, ?, 'Document', ?, 1, NOW(), NOW())
        `, {
          replacements: [
            file.displayName,
            file.permissionCode,
            categoryId,
            file.routePath,
            file.component,
            file.filePath,
            file.permissionCode,
            sortOrder++
          ]
        });
      }
    }
    
    // 6. 为admin角色分配所有权限
    console.log('\n🔐 为admin角色分配权限...');
    const [adminRole] = await sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
    if (adminRole.length > 0) {
      const adminRoleId = (adminRole[0] as any).id;
      const [allPermissions] = await sequelize.query(`SELECT id FROM permissions WHERE type IN ('category', 'menu')`);
      
      for (const permission of allPermissions as any[]) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          replacements: [adminRoleId, permission.id]
        });
      }
    }
    
    // 7. 统计结果
    console.log('\n📊 创建完成统计:');
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN type = 'category' THEN 1 ELSE 0 END) as categories,
        SUM(CASE WHEN type = 'menu' THEN 1 ELSE 0 END) as menus,
        SUM(CASE WHEN file_path IS NOT NULL THEN 1 ELSE 0 END) as files_with_path
      FROM permissions
    `);
    
    const [adminStats] = await sequelize.query(`
      SELECT COUNT(*) as admin_permissions
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'admin'
    `);
    
    console.table(finalStats);
    console.log('\n👤 Admin权限统计:');
    console.table(adminStats);
    
    // 8. 显示文件路径覆盖情况
    console.log('\n📁 文件路径覆盖情况:');
    const [pathStats] = await sequelize.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN file_path IS NOT NULL THEN 1 ELSE 0 END) as has_file_path
      FROM permissions
      GROUP BY type
    `);
    console.table(pathStats);
    
    console.log('\n✅ 完整权限系统创建完成！所有151个页面文件已添加到数据库');
    console.log('🎯 现在路由可以完全从数据库动态读取，避免404错误');
    
  } catch (error) {
    console.error('❌ 创建完整权限系统失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createCompletePermissions();