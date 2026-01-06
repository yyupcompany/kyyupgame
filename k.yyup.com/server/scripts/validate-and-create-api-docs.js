#!/usr/bin/env node

/**
 * API文档验证和自动创建脚本
 *
 * 功能：
 * 1. 验证Swagger文档是否已创建
 * 2. 检查API文档覆盖率和质量
 * 3. 如果缺失，自动生成基础的API文档
 * 4. 集成到服务启动流程中
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 API文档验证和创建工具启动...');

// 配置
const CONFIG = {
  swaggerPath: path.join(__dirname, '../swagger.json'),
  routesDir: path.join(__dirname, '../src/routes'),
  minCoverage: 80, // 最低覆盖率要求
  timeout: 10000, // HTTP请求超时时间
  retryAttempts: 3 // 重试次数
};

// 颜色输出
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`
};

function log(message, color = 'white') {
  console.log(colors[color](`[API文档工具] ${message}`));
}

function error(message) {
  console.error(colors.red(`[错误] ${message}`));
}

function success(message) {
  console.log(colors.green(`[成功] ${message}`));
}

function warn(message) {
  console.log(colors.yellow(`[警告] ${message}`));
}

// 检查Swagger文档是否存在
function checkSwaggerExists() {
  log('检查Swagger文档文件...', 'blue');

  if (!fs.existsSync(CONFIG.swaggerPath)) {
    warn('swagger.json文件不存在');
    return false;
  }

  try {
    const swaggerContent = fs.readFileSync(CONFIG.swaggerPath, 'utf8');
    const swagger = JSON.parse(swaggerContent);

    if (!swagger.openapi && !swagger.swagger) {
      warn('swagger.json格式无效');
      return false;
    }

    if (!swagger.paths || Object.keys(swagger.paths).length === 0) {
      warn('swagger.json中没有API路径定义');
      return false;
    }

    const pathCount = Object.keys(swagger.paths).length;
    success(`swagger.json已存在，包含${pathCount}个API路径`);
    return true;

  } catch (err) {
    error(`swagger.json解析失败: ${err.message}`);
    return false;
  }
}

// 扫描路由文件
function scanRouteFiles() {
  log('扫描路由文件...', 'blue');

  const routeFiles = [];

  function scanDirectory(dir, basePath = '') {
    if (!fs.existsSync(dir)) {
      warn(`目录不存在: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relativePath = path.join(basePath, file);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath, relativePath);
        } else if (file.endsWith('.routes.ts')) {
          routeFiles.push({
            file: relativePath,
            path: fullPath
          });
        }
      } catch (err) {
        warn(`跳过文件 ${file}: ${err.message}`);
      }
    }
  }

  scanDirectory(CONFIG.routesDir);

  log(`发现${routeFiles.length}个路由文件`, 'cyan');
  return routeFiles;
}

// 分析路由文件中的Swagger注释
function analyzeSwaggerComments(routeFiles) {
  log('分析Swagger注释覆盖率...', 'blue');

  const swaggerCommentRegex = /\/\*\*[\s\S]*?@swagger[\s\S]*?\*\//g;
  const routeDefinitionRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;

  let totalFiles = routeFiles.length;
  let filesWithSwagger = 0;
  let totalSwaggerComments = 0;
  let totalRouteDefinitions = 0;

  const fileAnalysis = [];

  for (const { file, path: filePath } of routeFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      const swaggerComments = (content.match(swaggerCommentRegex) || []).length;
      const routeDefinitions = (content.match(routeDefinitionRegex) || []).length;

      totalSwaggerComments += swaggerComments;
      totalRouteDefinitions += routeDefinitions;

      const hasSwagger = swaggerComments > 0;
      if (hasSwagger) {
        filesWithSwagger++;
      }

      fileAnalysis.push({
        file,
        hasSwagger,
        swaggerComments,
        routeDefinitions,
        coverage: routeDefinitions > 0 ? (swaggerComments / routeDefinitions) * 100 : 0
      });

    } catch (err) {
      warn(`分析文件 ${file} 失败: ${err.message}`);
    }
  }

  const coverageRate = totalFiles > 0 ? (filesWithSwagger / totalFiles) * 100 : 0;

  log(`分析完成: ${filesWithSwagger}/${totalFiles} 文件有Swagger注释 (${coverageRate.toFixed(1)}%)`, 'cyan');
  log(`总计: ${totalSwaggerComments} 个Swagger注释, ${totalRouteDefinitions} 个路由定义`, 'cyan');

  return {
    totalFiles,
    filesWithSwagger,
    totalSwaggerComments,
    totalRouteDefinitions,
    coverageRate,
    fileAnalysis
  };
}

// 检查API文档端点可用性
async function checkApiDocsEndpoint() {
  log('检查API文档端点可用性...', 'blue');

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api-docs',
      method: 'GET',
      timeout: CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        success('/api-docs端点可用');
        resolve(true);
      } else {
        warn(`/api-docs端点响应异常: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      warn(`/api-docs端点检查失败: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      warn('/api-docs端点检查超时');
      resolve(false);
    });

    req.end();
  });
}

// 生成基础的Swagger文档结构
function generateBasicSwagger() {
  log('生成基础Swagger文档结构...', 'magenta');

  const basicSwagger = {
    openapi: '3.0.0',
    info: {
      title: '幼儿园管理系统API',
      version: '1.0.0',
      description: '幼儿园管理系统的RESTful API文档',
      contact: {
        name: 'API支持',
        email: 'support@kindergarten.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      }
    ],
    tags: [
      {
        name: '认证管理',
        description: '用户认证相关接口'
      },
      {
        name: '用户管理',
        description: '用户管理相关接口'
      },
      {
        name: '学生管理',
        description: '学生管理相关接口'
      },
      {
        name: '教师管理',
        description: '教师管理相关接口'
      },
      {
        name: '班级管理',
        description: '班级管理相关接口'
      },
      {
        name: '活动管理',
        description: '活动管理相关接口'
      },
      {
        name: 'AI助手',
        description: 'AI助手相关接口'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: '操作成功'
            },
            data: {
              type: 'object'
            },
            code: {
              type: 'number',
              example: 0
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: '操作失败'
            },
            code: {
              type: 'number',
              example: 500
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: '未授权访问',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        BadRequest: {
          description: '请求参数错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: '资源不存在',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    },
    paths: {}
  };

  try {
    fs.writeFileSync(CONFIG.swaggerPath, JSON.stringify(basicSwagger, null, 2));
    success('基础Swagger文档结构已生成');
    return true;
  } catch (err) {
    error(`生成Swagger文档失败: ${err.message}`);
    return false;
  }
}

// 生成验证报告
function generateReport(swaggerExists, analysis, endpointAvailable) {
  log('生成验证报告...', 'blue');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      swaggerExists,
      endpointAvailable,
      totalFiles: analysis.totalFiles,
      filesWithSwagger: analysis.filesWithSwagger,
      coverageRate: analysis.coverageRate,
      totalSwaggerComments: analysis.totalSwaggerComments,
      totalRouteDefinitions: analysis.totalRouteDefinitions
    },
    fileAnalysis: analysis.fileAnalysis,
    recommendations: []
  };

  // 生成建议
  if (!swaggerExists) {
    report.recommendations.push('创建基础的swagger.json文件');
  }

  if (!endpointAvailable) {
    report.recommendations.push('检查后端服务是否正常运行');
  }

  if (analysis.coverageRate < CONFIG.minCoverage) {
    report.recommendations.push(`提高Swagger注释覆盖率至${CONFIG.minCoverage}%以上`);
  }

  if (analysis.filesWithSwagger < analysis.totalFiles) {
    report.recommendations.push('为缺少Swagger注释的路由文件添加文档');
  }

  // 保存报告
  const reportPath = path.join(__dirname, '../api-docs-validation-report.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`验证报告已保存: ${reportPath}`, 'cyan');
  } catch (err) {
    error(`保存报告失败: ${err.message}`);
  }

  return report;
}

// 主执行函数
async function main() {
  console.log('\n==========================================');
  console.log('     API文档验证和自动创建工具');
  console.log('==========================================\n');

  try {
    // 1. 检查Swagger文件是否存在
    const swaggerExists = checkSwaggerExists();

    // 2. 扫描和分析路由文件
    const routeFiles = scanRouteFiles();
    const analysis = analyzeSwaggerComments(routeFiles);

    // 3. 检查API文档端点
    const endpointAvailable = await checkApiDocsEndpoint();

    // 4. 生成验证报告
    const report = generateReport(swaggerExists, analysis, endpointAvailable);

    // 5. 显示结果
    console.log('\n📊 验证结果汇总');
    console.log('==========================================');
    console.log(`Swagger文件: ${swaggerExists ? colors.green('✅ 存在') : colors.red('❌ 不存在')}`);
    console.log(`API文档端点: ${endpointAvailable ? colors.green('✅ 可用') : colors.red('❌ 不可用')}`);
    console.log(`文件覆盖率: ${colors.cyan(`${analysis.coverageRate.toFixed(1)}%`)} (${analysis.filesWithSwagger}/${analysis.totalFiles})`);
    console.log(`Swagger注释: ${colors.magenta(`${analysis.totalSwaggerComments}个`)}`);

    // 6. 显示建议
    if (report.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // 7. 自动创建基础文档（如果需要）
    if (!swaggerExists && !endpointAvailable) {
      log('\n🔧 尝试自动创建基础Swagger文档...', 'yellow');
      const created = generateBasicSwagger();
      if (created) {
        success('基础Swagger文档创建成功');
      }
    }

    // 8. 返回结果状态
    const isHealthy = swaggerExists && endpointAvailable && analysis.coverageRate >= CONFIG.minCoverage;

    console.log('\n==========================================');
    if (isHealthy) {
      console.log(colors.green('🎉 API文档验证通过！'));
      process.exit(0);
    } else {
      console.log(colors.yellow('⚠️ API文档需要改进'));
      process.exit(1);
    }

  } catch (err) {
    error(`验证过程发生错误: ${err.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  checkSwaggerExists,
  scanRouteFiles,
  analyzeSwaggerComments,
  checkApiDocsEndpoint,
  generateBasicSwagger,
  generateReport,
  main
};