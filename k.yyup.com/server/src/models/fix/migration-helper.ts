/**
 * 模型迁移助手
 * 
 * 这个脚本帮助开发者在应用中找到并替换所有使用旧模型的地方
 * 
 * 使用方法: npx ts-node src/models/fix/migration-helper.ts
 */

import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';

// 定义需要替换的模型对
const MODEL_MAPPINGS = [
  {
    oldImport: "import { Todo } from '.*/models/dashboard.model';",
    newImport: "import {  TodoFix as Todo  } from '../models/index';",
    oldInitialize: "Todo.initialize(sequelize);",
    newInitialize: "TodoFix.initializeModel(sequelize);"
  },
  {
    oldImport: "import { Schedule } from '.*/models/dashboard.model';",
    newImport: "import {  ScheduleFix as Schedule  } from '../models/index';",
    oldInitialize: "Schedule.initialize(sequelize);",
    newInitialize: "ScheduleFix.initializeModel(sequelize);"
  },
  {
    oldImport: "import { Notification } from '.*/models/notification.model';",
    newImport: "import {  NotificationFix as Notification  } from '../models/index';",
    oldInitialize: "Notification.initialize(sequelize);",
    newInitialize: "NotificationFix.initializeModel(sequelize);"
  },
  {
    oldImport: "import { SystemLog } from '.*/models/system-log.model';",
    newImport: "import {  SystemLogFix as SystemLog  } from '../models/index';",
    oldInitialize: "SystemLog.initialize(sequelize);",
    newInitialize: "SystemLogFix.initializeModel(sequelize);"
  }
];

// 定义要扫描的目录
const DIRS_TO_SCAN = [
  path.join(__dirname, '../../controllers'),
  path.join(__dirname, '../../services'),
  path.join(__dirname, '../../scripts'),
  path.join(__dirname, '../../routes'),
];

// 文件扩展名过滤
const FILE_EXTENSIONS = ['.ts', '.js'];

/**
 * 扫描目录下的所有文件
 */
function scanFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fileList = scanFiles(filePath, fileList);
    } else if (FILE_EXTENSIONS.includes(path.extname(filePath))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 处理一个文件
 */
function processFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  MODEL_MAPPINGS.forEach(mapping => {
    const oldImportRegex = new RegExp(mapping.oldImport, 'g');
    const oldInitializeRegex = new RegExp(mapping.oldInitialize, 'g');

    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, mapping.newImport);
      changed = true;
    }

    if (oldInitializeRegex.test(content)) {
      content = content.replace(oldInitializeRegex, mapping.newInitialize);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`已更新文件: ${filePath}`);
  }

  return changed;
}

/**
 * 主函数
 */
function main() {
  let changedFiles = 0;
  let totalFiles = 0;

  for (const dir of DIRS_TO_SCAN) {
    if (!fs.existsSync(dir)) {
      console.warn(`目录不存在: ${dir}`);
      continue;
    }

    const files = scanFiles(dir);
    totalFiles += files.length;

    files.forEach(file => {
      if (processFile(file)) {
        changedFiles++;
      }
    });
  }

  console.log('\n迁移助手执行完毕');
  console.log(`处理文件总数: ${totalFiles}`);
  console.log(`已更新文件数: ${changedFiles}`);
  
  if (changedFiles > 0) {
    console.log('\n提示: 请确保重新编译并测试您的应用以确保所有更改正常工作');
  }
}

// 运行主函数
main(); 