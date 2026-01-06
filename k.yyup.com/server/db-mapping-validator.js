/**
 * 数据库映射校验工具
 * 用于检查控制器与数据库模型映射的一致性
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 控制器文件列表
const controllerFiles = [
  'activity-checkin.controller.ts',
  'activity-evaluation.controller.ts',
  'activity-plan.controller.ts',
  'activity-registration.controller.ts',
  'admission-notification.controller.ts',
  'admission-result.controller.ts',
  'advertisement.controller.ts',
  'auth.controller.ts',
  'class.controller.ts',
  'dashboard.controller.ts',
  'enrollment-application.controller.ts',
  'enrollment-consultation.controller.ts',
  'enrollment-plan.controller.ts',
  'enrollment-quota.controller.ts',
  'enrollment-statistics.controller.ts',
  'kindergarten.controller.ts',
  'marketing-campaign.controller.ts',
  'notification.controller.ts',
  'parent.controller.ts',
  'performance-rule.controller.ts',
  'permission.controller.ts',
  'poster-generation.controller.ts',
  'poster-template.controller.ts',
  'poster-upload.controller.ts',
  'role-permission.controller.ts',
  'role.controller.ts',
  'student.controller.ts',
  'system-log.controller.ts',
  'teacher.controller.ts',
  'user-role.controller.ts',
  'user.controller.ts'
];

// 数据库表信息缓存
const dbTableInfo = {};

// 控制器分析结果
const analysisResults = {};

// 控制器目录
const controllersDir = path.join(__dirname, 'src/controllers');

// 检查数据库表结构
function getDatabaseTableSchema(tableName) {
  try {
    // 使用MySQL命令查询表结构
    const command = `mysql -u root -p123456 -h localhost -e "DESCRIBE kargerdensales.${tableName}" -s`;
    const result = execSync(command).toString();
    
    // 解析结果
    const lines = result.split('\n').filter(line => line.trim());
    const columns = lines.map(line => {
      const parts = line.split('\t');
      return {
        name: parts[0],
        type: parts[1],
        nullable: parts[2] === 'YES',
        key: parts[3],
        default: parts[4],
        extra: parts[5]
      };
    });
    
    return columns;
  } catch (error) {
    console.error(`获取表 ${tableName} 结构失败:`, error.message);
    return null;
  }
}

// 分析控制器文件
function analyzeControllerFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取SQL查询
    const sqlQueries = [];
    const sqlRegex = /sequelize\.query\(\s*`([^`]+)`/g;
    let match;
    
    while ((match = sqlRegex.exec(content)) !== null) {
      sqlQueries.push(match[1]);
    }
    
    // 提取表名
    const tableNames = new Set();
    const tableRegex = /FROM\s+(\w+)/gi;
    
    sqlQueries.forEach(query => {
      let tableMatch;
      while ((tableMatch = tableRegex.exec(query)) !== null) {
        tableNames.add(tableMatch[1]);
      }
    });
    
    // 提取插入和更新操作
    const insertRegex = /INSERT\s+INTO\s+(\w+)/gi;
    const updateRegex = /UPDATE\s+(\w+)/gi;
    
    sqlQueries.forEach(query => {
      let insertMatch;
      while ((insertMatch = insertRegex.exec(query)) !== null) {
        tableNames.add(insertMatch[1]);
      }
      
      let updateMatch;
      while ((updateMatch = updateRegex.exec(query)) !== null) {
        tableNames.add(updateMatch[1]);
      }
    });
    
    // 分析查询结果处理
    const resultHandling = {
      hasArrayCheck: content.includes('Array.isArray'),
      usesDestructuring: /const\s+\[\s*[\w\s,]+\]\s*=\s*await\s+sequelize\.query/.test(content),
      rawTypeChecks: /typeof\s+[\w.]+\s*===\s*['"]object['"]/.test(content),
      hasNullCheck: /[\w.]+\s*[!=]==\s*null/.test(content),
      hasMapOperation: /\.map\(/.test(content),
      hasReduceOperation: /\.reduce\(/.test(content),
      responseFormat: /ApiResponse\.success\(/.test(content) ? 'ApiResponse' : 'direct'
    };
    
    return {
      sqlQueries,
      tableNames: Array.from(tableNames),
      resultHandling
    };
  } catch (error) {
    console.error(`分析控制器文件 ${filePath} 失败:`, error.message);
    return null;
  }
}

// 检查查询结果处理的一致性
function checkResultHandlingConsistency(controllers) {
  const patterns = {};
  
  Object.entries(controllers).forEach(([name, data]) => {
    if (data && data.resultHandling) {
      const pattern = `${data.resultHandling.hasArrayCheck}-${data.resultHandling.usesDestructuring}-${data.resultHandling.rawTypeChecks}`;
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push(name);
    }
  });
  
  return patterns;
}

// 验证SQL查询中的字段与表结构的匹配
function validateSqlQueries(controller, queries) {
  const issues = [];
  
  queries.forEach((query, index) => {
    // 提取SELECT字段
    const selectRegex = /SELECT\s+(.+?)\s+FROM/i;
    const selectMatch = query.match(selectRegex);
    
    if (selectMatch) {
      const fieldsStr = selectMatch[1];
      if (fieldsStr === '*') {
        issues.push(`查询${index + 1}: 使用SELECT *，建议明确指定字段`);
        return;
      }
      
      // 分析字段
      const fields = fieldsStr.split(',').map(f => {
        const asMatch = f.trim().match(/(\S+)\s+as\s+(\S+)/i);
        if (asMatch) {
          return {
            original: asMatch[1].trim(),
            alias: asMatch[2].trim()
          };
        }
        return { original: f.trim(), alias: null };
      });
      
      // 检查下划线转驼峰是否一致
      fields.forEach(field => {
        if (field.alias && field.original.includes('_')) {
          const expectedCamelCase = field.original
            .split('_')
            .map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
          
          if (field.alias !== expectedCamelCase && !field.original.endsWith('_id')) {
            issues.push(`查询${index + 1}: 字段 ${field.original} 的别名 ${field.alias} 不符合驼峰命名规范`);
          }
        }
      });
    }
    
    // 检查JOIN语句
    if (/JOIN\s+(\w+)\s+(\w+)\s+ON/i.test(query)) {
      // 检查是否使用了别名，这有助于避免字段名冲突
      if (!/JOIN\s+(\w+)\s+AS\s+(\w+)\s+ON/i.test(query)) {
        issues.push(`查询${index + 1}: JOIN语句未使用AS关键字指定明确的表别名`);
      }
    }
    
    // 检查返回结果处理提示
    if (query.includes('LIMIT') && !query.includes('COUNT')) {
      issues.push(`查询${index + 1}: 分页查询需要确保处理数组结果，检查是否正确处理返回值类型`);
    }
  });
  
  return issues;
}

// 主函数：分析所有控制器
function analyzeAllControllers() {
  console.log('开始分析控制器与数据库映射...\n');
  
  controllerFiles.forEach(file => {
    const filePath = path.join(controllersDir, file);
    console.log(`分析控制器: ${file}`);
    
    if (fs.existsSync(filePath)) {
      const result = analyzeControllerFile(filePath);
      if (result) {
        analysisResults[file] = result;
        
        console.log(`  SQL查询数: ${result.sqlQueries.length}`);
        console.log(`  涉及表: ${result.tableNames.join(', ')}`);
        
        // 验证SQL查询
        const issues = validateSqlQueries(file, result.sqlQueries);
        if (issues.length > 0) {
          console.log('  潜在问题:');
          issues.forEach(issue => console.log(`    - ${issue}`));
        } else {
          console.log('  未发现潜在问题');
        }
        
        // 检查查询结果处理
        const handling = result.resultHandling;
        if (!handling.hasArrayCheck) {
          console.log('  警告: 未检测到数组类型检查 (Array.isArray)，可能导致数据类型处理错误');
        }
        
        console.log('');
      }
    } else {
      console.log(`  文件不存在`);
      console.log('');
    }
  });
  
  // 分析结果处理的一致性
  console.log('\n查询结果处理模式分析:');
  const patterns = checkResultHandlingConsistency(analysisResults);
  Object.entries(patterns).forEach(([pattern, controllers]) => {
    console.log(`  模式 ${pattern}: ${controllers.length} 个控制器`);
    
    if (controllers.length < 3) {
      console.log(`    控制器: ${controllers.join(', ')}`);
    } else {
      console.log(`    控制器: ${controllers.slice(0, 3).join(', ')}... (共${controllers.length}个)`);
    }
  });
  
  // 提出特别关注的控制器
  const criticalControllers = Object.entries(analysisResults)
    .filter(([name, data]) => {
      return data.sqlQueries.length > 0 && !data.resultHandling.hasArrayCheck;
    })
    .map(([name]) => name);
  
  if (criticalControllers.length > 0) {
    console.log('\n需要特别关注的控制器:');
    criticalControllers.forEach(name => console.log(`  - ${name}`));
  }
  
  console.log('\n分析完成');
}

// 执行分析
analyzeAllControllers(); 