/**
 * 数据库-路由对齐检查工具
 * 确保数据库表名、模型名、路由路径完全一致
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// 对齐报告接口
export interface AlignmentReport {
  aligned: AlignedItem[];
  misaligned: MisalignedItem[];
  totalTables: number;
  totalRoutes: number;
  alignmentScore: number; // 0-1之间的对齐分数
}

export interface AlignedItem {
  table: string;
  route: string;
  model?: string;
  status: 'ALIGNED';
}

export interface MisalignedItem {
  table: string;
  expectedRoute: string;
  actualRoute?: string;
  model?: string;
  status: 'MISSING_ROUTE' | 'MISNAMED_ROUTE' | 'MISSING_MODEL' | 'FIELD_MISMATCH';
  details?: string;
}

export interface FieldAlignmentReport {
  model: string;
  table: string;
  route: string;
  modelFields: string[];
  dbFields: string[];
  apiFields: string[];
  missingInAPI: string[];
  extraInAPI: string[];
  fieldMappings: Record<string, string>;
}

export interface FixReport {
  fixes: string[];
  totalFixed: number;
  errors: string[];
}

export class DatabaseRouteAlignmentChecker {
  private static routesDir = path.join(__dirname, '../routes');
  private static modelsDir = path.join(__dirname, '../models');

  /**
   * 获取数据库中所有表名
   */
  static async getDatabaseTables(): Promise<string[]> {
    try {
      const query = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `;
      
      const results = await sequelize.query(query, { 
        type: QueryTypes.SELECT 
      }) as Array<{ TABLE_NAME: string }>;
      
      return results.map(row => row.TABLE_NAME);
    } catch (error) {
      console.error('获取数据库表失败:', error);
      return [];
    }
  }

  /**
   * 获取所有注册的路由路径
   */
  static async getRegisteredRoutes(): Promise<Array<{ path: string, file: string, methods: string[] }>> {
    const routes: Array<{ path: string, file: string, methods: string[] }> = [];
    
    try {
      const routeFiles = await glob('**/*.routes.ts', { 
        cwd: this.routesDir,
        absolute: false 
      });

      for (const file of routeFiles) {
        const filePath = path.join(this.routesDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // 提取路由定义
        const routeMatches = content.match(/router\.(get|post|put|patch|delete|use)\s*\(\s*['"]([^'"]+)['"]/g);
        
        if (routeMatches) {
          const methods = new Set<string>();
          let basePath = '';
          
          // 从文件名推断基础路径
          const fileName = path.basename(file, '.routes.ts');
          if (fileName !== 'index') {
            basePath = `/${fileName.replace(/-/g, '-')}`;
          }
          
          routeMatches.forEach(match => {
            const [, method, routePath] = match.match(/router\.(get|post|put|patch|delete|use)\s*\(\s*['"]([^'"]+)['"]/) || [];
            if (method && routePath) {
              methods.add(method.toUpperCase());
            }
          });
          
          if (basePath) {
            routes.push({
              path: basePath,
              file,
              methods: Array.from(methods)
            });
          }
        }
      }
    } catch (error) {
      console.error('获取路由列表失败:', error);
    }
    
    return routes;
  }

  /**
   * 获取所有Sequelize模型
   */
  static async getSequelizeModels(): Promise<Array<{ name: string, file: string, tableName?: string }>> {
    const models: Array<{ name: string, file: string, tableName?: string }> = [];
    
    try {
      const modelFiles = await glob('**/*.model.ts', { 
        cwd: this.modelsDir,
        absolute: false 
      });

      for (const file of modelFiles) {
        const filePath = path.join(this.modelsDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // 提取模型类名
        const classMatch = content.match(/export\s+class\s+(\w+)\s+extends\s+Model/);
        const tableNameMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
        
        if (classMatch) {
          models.push({
            name: classMatch[1],
            file,
            tableName: tableNameMatch ? tableNameMatch[1] : undefined
          });
        }
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    }
    
    return models;
  }

  /**
   * 将表名转换为期望的路由路径
   */
  static tableToRoutePath(tableName: string): string {
    // 表名转换规则: snake_case -> kebab-case，且保持复数形式
    return `/${tableName.replace(/_/g, '-')}`;
  }

  /**
   * 将表名转换为期望的模型名
   */
  static tableToModelName(tableName: string): string {
    // 表名转换规则: snake_case -> PascalCase，转为单数形式
    return tableName
      .split('_')
      .map(word => {
        // 简单的复数转单数（可以后续完善）
        if (word.endsWith('s') && word.length > 3) {
          word = word.slice(0, -1);
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  /**
   * 将表名转换为期望的路由文件名
   */
  static tableToRouteFileName(tableName: string): string {
    // 表名转换规则: snake_case -> kebab-case.routes.ts
    return `${tableName.replace(/_/g, '-')}.routes.ts`;
  }

  /**
   * 检查表名与路由路径的对齐情况
   */
  static async checkTableRouteAlignment(): Promise<AlignmentReport> {
    console.log('🔍 开始检查数据库表与路由对齐情况...');
    
    const tables = await this.getDatabaseTables();
    const routes = await this.getRegisteredRoutes();
    const models = await this.getSequelizeModels();
    
    const aligned: AlignedItem[] = [];
    const misaligned: MisalignedItem[] = [];
    
    console.log(`📊 发现 ${tables.length} 个数据库表`);
    console.log(`📊 发现 ${routes.length} 个路由文件`);
    console.log(`📊 发现 ${models.length} 个模型文件`);
    
    for (const table of tables) {
      const expectedRoute = this.tableToRoutePath(table);
      const expectedModel = this.tableToModelName(table);
      const expectedRouteFile = this.tableToRouteFileName(table);
      
      // 检查路由是否存在
      const matchingRoute = routes.find(r => r.path === expectedRoute);
      const matchingModel = models.find(m => 
        m.name === expectedModel || 
        m.tableName === table
      );
      
      if (matchingRoute && matchingModel) {
        aligned.push({
          table,
          route: expectedRoute,
          model: expectedModel,
          status: 'ALIGNED'
        });
        console.log(`✅ ${table} -> ${expectedRoute} (已对齐)`);
      } else {
        let status: MisalignedItem['status'] = 'MISSING_ROUTE';
        let details = '';
        
        if (!matchingRoute) {
          status = 'MISSING_ROUTE';
          details = `缺少路由文件: ${expectedRouteFile}`;
        } else if (!matchingModel) {
          status = 'MISSING_MODEL';
          details = `缺少模型文件: ${expectedModel}.model.ts`;
        }
        
        misaligned.push({
          table,
          expectedRoute,
          actualRoute: matchingRoute?.path,
          model: expectedModel,
          status,
          details
        });
        console.log(`❌ ${table} -> ${expectedRoute} (${status}: ${details})`);
      }
    }
    
    // 检查是否有多余的路由（没有对应数据库表的）
    for (const route of routes) {
      const tableName = route.path.substring(1).replace(/-/g, '_');
      if (!tables.includes(tableName)) {
        // 检查是否是复数形式
        const singularTableName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
        if (!tables.includes(singularTableName)) {
          console.log(`⚠️ 路由 ${route.path} 没有对应的数据库表`);
        }
      }
    }
    
    const alignmentScore = aligned.length / tables.length;
    
    const report: AlignmentReport = {
      aligned,
      misaligned,
      totalTables: tables.length,
      totalRoutes: routes.length,
      alignmentScore
    };
    
    console.log(`\n📈 对齐分数: ${(alignmentScore * 100).toFixed(1)}% (${aligned.length}/${tables.length})`);
    
    return report;
  }

  /**
   * 检查特定模型的字段对齐情况
   */
  static async checkFieldAlignment(tableName: string): Promise<FieldAlignmentReport> {
    console.log(`🔍 检查表 ${tableName} 的字段对齐情况...`);
    
    try {
      // 获取数据库字段
      const dbFields = await this.getDatabaseFields(tableName);
      
      // 获取模型字段
      const modelName = this.tableToModelName(tableName);
      const modelFields = await this.getModelFields(modelName);
      
      // 获取API响应字段（通过示例API调用）
      const apiFields = await this.getAPIResponseFields(tableName);
      
      // 分析字段映射
      const { missingInAPI, extraInAPI, fieldMappings } = this.analyzeFieldMappings(
        dbFields, 
        modelFields, 
        apiFields
      );
      
      return {
        model: modelName,
        table: tableName,
        route: this.tableToRoutePath(tableName),
        modelFields,
        dbFields,
        apiFields,
        missingInAPI,
        extraInAPI,
        fieldMappings
      };
    } catch (error) {
      console.error(`检查字段对齐失败 (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * 获取数据库表的字段列表
   */
  private static async getDatabaseFields(tableName: string): Promise<string[]> {
    const query = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    
    const results = await sequelize.query(query, { 
      type: QueryTypes.SELECT,
      replacements: [tableName]
    }) as Array<{ COLUMN_NAME: string }>;
    
    return results.map(row => row.COLUMN_NAME);
  }

  /**
   * 获取模型的字段列表
   */
  private static async getModelFields(modelName: string): Promise<string[]> {
    try {
      const modelPath = path.join(this.modelsDir, `${modelName.toLowerCase()}.model.ts`);
      
      if (!fs.existsSync(modelPath)) {
        console.warn(`模型文件不存在: ${modelPath}`);
        return [];
      }
      
      const content = await fs.promises.readFile(modelPath, 'utf-8');
      
      // 简单的字段提取（可以后续完善）
      const fieldMatches = content.match(/(\w+):\s*DataTypes\./g);
      
      if (fieldMatches) {
        return fieldMatches.map(match => {
          const fieldName = match.split(':')[0].trim();
          return fieldName;
        });
      }
      
      return [];
    } catch (error) {
      console.error(`获取模型字段失败 (${modelName}):`, error);
      return [];
    }
  }

  /**
   * 获取API响应的字段列表（模拟）
   */
  private static async getAPIResponseFields(tableName: string): Promise<string[]> {
    // 这里应该是实际的API调用，暂时返回模拟数据
    // 后续可以集成实际的API测试
    
    const routePath = this.tableToRoutePath(tableName);
    console.log(`📡 模拟API调用: GET /api${routePath}`);
    
    // 模拟常见的API响应字段（camelCase格式）
    const commonFields = [
      'id', 'createdAt', 'updatedAt', 'deletedAt'
    ];
    
    // 根据表名推测可能的字段
    const tableSpecificFields: Record<string, string[]> = {
      'students': ['studentId', 'fullName', 'birthDate', 'enrollmentDate', 'classId'],
      'teachers': ['teacherId', 'fullName', 'position', 'department', 'hireDate'],
      'parents': ['parentId', 'fullName', 'phone', 'email', 'relationship'],
      'classes': ['classId', 'className', 'grade', 'capacity', 'teacherId'],
      'activities': ['activityId', 'title', 'description', 'startDate', 'endDate'],
    };
    
    const specificFields = tableSpecificFields[tableName] || [];
    
    return [...commonFields, ...specificFields];
  }

  /**
   * 分析字段映射关系
   */
  private static analyzeFieldMappings(
    dbFields: string[], 
    modelFields: string[], 
    apiFields: string[]
  ): {
    missingInAPI: string[];
    extraInAPI: string[];
    fieldMappings: Record<string, string>;
  } {
    const fieldMappings: Record<string, string> = {};
    const missingInAPI: string[] = [];
    const extraInAPI: string[] = [];
    
    // 标准字段映射规则
    const standardMappings: Record<string, string> = {
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'deleted_at': 'deletedAt',
    };
    
    // 检查数据库字段在API中的对应
    for (const dbField of dbFields) {
      let apiField = standardMappings[dbField];
      
      if (!apiField) {
        // 自动转换 snake_case -> camelCase
        apiField = dbField.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      }
      
      fieldMappings[dbField] = apiField;
      
      if (!apiFields.includes(apiField)) {
        missingInAPI.push(dbField);
      }
    }
    
    // 检查API中多余的字段
    for (const apiField of apiFields) {
      const hasMapping = Object.values(fieldMappings).includes(apiField);
      if (!hasMapping) {
        extraInAPI.push(apiField);
      }
    }
    
    return { missingInAPI, extraInAPI, fieldMappings };
  }

  /**
   * 自动修复对齐问题
   */
  static async autoFixAlignment(report: AlignmentReport): Promise<FixReport> {
    console.log('🔧 开始自动修复对齐问题...');
    
    const fixes: string[] = [];
    const errors: string[] = [];
    
    for (const issue of report.misaligned) {
      try {
        switch (issue.status) {
          case 'MISSING_ROUTE':
            await this.generateRouteFile(issue.table, issue.expectedRoute);
            fixes.push(`生成路由文件: ${this.tableToRouteFileName(issue.table)}`);
            break;
            
          case 'MISSING_MODEL':
            await this.generateModelFile(issue.table, issue.model!);
            fixes.push(`生成模型文件: ${issue.model}.model.ts`);
            break;
            
          default:
            console.log(`⚠️ 暂不支持自动修复: ${issue.status}`);
        }
      } catch (error) {
        const errorMsg = `修复失败 (${issue.table}): ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    console.log(`✅ 完成修复: ${fixes.length} 个问题已解决，${errors.length} 个问题失败`);
    
    return {
      fixes,
      totalFixed: fixes.length,
      errors
    };
  }

  /**
   * 生成标准路由文件
   */
  private static async generateRouteFile(tableName: string, routePath: string): Promise<void> {
    const fileName = this.tableToRouteFileName(tableName);
    const filePath = path.join(this.routesDir, fileName);
    const modelName = this.tableToModelName(tableName);
    
    const routeTemplate = `/**
 * ${tableName} 路由文件
 * 自动生成 - ${new Date().toISOString()}
 */

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ${modelName} } from '../models/${modelName.toLowerCase()}.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken);

/**
 * @swagger
 * /api${routePath}:
 *   get:
 *     summary: 获取${tableName}列表
 *     tags: [${modelName}]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', async (req, res) => {
  try {
    const list = await ${modelName}.findAll();
    return ApiResponse.success(res, { list }, '获取${tableName}列表成功');
  } catch (error) {
    console.error('获取${tableName}列表失败:', error);
    return ApiResponse.error(res, '获取${tableName}列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
 * @swagger
 * /api${routePath}:
 *   post:
 *     summary: 创建${tableName}
 *     tags: [${modelName}]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/', async (req, res) => {
  try {
    const item = await ${modelName}.create(req.body);
    return ApiResponse.success(res, item, '创建${tableName}成功');
  } catch (error) {
    console.error('创建${tableName}失败:', error);
    return ApiResponse.error(res, '创建${tableName}失败', 'INTERNAL_ERROR', 500);
  }
});

/**
 * @swagger
 * /api${routePath}/{id}:
 *   get:
 *     summary: 获取${tableName}详情
 *     tags: [${modelName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ${modelName}.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, '${tableName}不存在');
    }
    
    return ApiResponse.success(res, item, '获取${tableName}详情成功');
  } catch (error) {
    console.error('获取${tableName}详情失败:', error);
    return ApiResponse.error(res, '获取${tableName}详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
 * @swagger
 * /api${routePath}/{id}:
 *   put:
 *     summary: 更新${tableName}
 *     tags: [${modelName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await ${modelName}.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, '${tableName}不存在');
    }
    
    const updatedItem = await ${modelName}.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新${tableName}成功');
  } catch (error) {
    console.error('更新${tableName}失败:', error);
    return ApiResponse.error(res, '更新${tableName}失败', 'INTERNAL_ERROR', 500);
  }
});

/**
 * @swagger
 * /api${routePath}/{id}:
 *   delete:
 *     summary: 删除${tableName}
 *     tags: [${modelName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await ${modelName}.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, '${tableName}不存在');
    }
    
    return ApiResponse.success(res, null, '删除${tableName}成功');
  } catch (error) {
    console.error('删除${tableName}失败:', error);
    return ApiResponse.error(res, '删除${tableName}失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
`;

    await fs.promises.writeFile(filePath, routeTemplate, 'utf-8');
    console.log(`✅ 生成路由文件: ${fileName}`);
  }

  /**
   * 生成标准模型文件
   */
  private static async generateModelFile(tableName: string, modelName: string): Promise<void> {
    const fileName = `${modelName.toLowerCase()}.model.ts`;
    const filePath = path.join(this.modelsDir, fileName);
    
    // 获取数据库表结构来生成模型
    const fields = await this.getDatabaseFields(tableName);
    
    // 生成模型属性定义
    const fieldDefinitions = fields.map(field => {
      let dataType = 'DataTypes.STRING';
      
      // 根据字段名推测数据类型
      if (field === 'id' || field.endsWith('_id')) {
        dataType = 'DataTypes.INTEGER';
      } else if (field.includes('date') || field.includes('time')) {
        dataType = 'DataTypes.DATE';
      } else if (field === 'created_at' || field === 'updated_at' || field === 'deleted_at') {
        dataType = 'DataTypes.DATE';
      }
      
      return `  ${field}: {
    type: ${dataType},
    allowNull: ${field === 'id' ? 'false' : 'true'},${field === 'id' ? '\n    primaryKey: true,\n    autoIncrement: true,' : ''}
  },`;
    }).join('\n');
    
    const modelTemplate = `/**
 * ${modelName} 模型
 * 对应数据库表: ${tableName}
 * 自动生成 - ${new Date().toISOString()}
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ${modelName}Attributes {
${fields.map(field => `  ${field}: ${field === 'id' || field.endsWith('_id') ? 'number' : field.includes('date') || field.includes('time') ? 'Date' : 'string'};`).join('\n')}
}

// 定义创建时的可选属性
export interface ${modelName}CreationAttributes extends Optional<${modelName}Attributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class ${modelName} extends Model<${modelName}Attributes, ${modelName}CreationAttributes>
  implements ${modelName}Attributes {
${fields.map(field => `  public ${field}!: ${field === 'id' || field.endsWith('_id') ? 'number' : field.includes('date') || field.includes('time') ? 'Date' : 'string'};`).join('\n')}

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
${modelName}.init(
  {
${fieldDefinitions}
  },
  {
    sequelize,
    tableName: '${tableName}',
    modelName: '${modelName}',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ${modelName};
`;

    await fs.promises.writeFile(filePath, modelTemplate, 'utf-8');
    console.log(`✅ 生成模型文件: ${fileName}`);
  }

  /**
   * 生成对齐报告文件
   */
  static async generateAlignmentReport(report: AlignmentReport): Promise<string> {
    const reportPath = path.join(process.cwd(), 'alignment-report.json');
    
    const detailedReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      summary: {
        alignmentScore: `${(report.alignmentScore * 100).toFixed(1)}%`,
        alignedCount: report.aligned.length,
        misalignedCount: report.misaligned.length,
        totalTables: report.totalTables
      },
      recommendations: this.generateRecommendations(report)
    };
    
    await fs.promises.writeFile(reportPath, JSON.stringify(detailedReport, null, 2), 'utf-8');
    console.log(`📄 对齐报告已保存: ${reportPath}`);
    
    return reportPath;
  }

  /**
   * 生成修复建议
   */
  private static generateRecommendations(report: AlignmentReport): string[] {
    const recommendations: string[] = [];
    
    if (report.alignmentScore < 0.8) {
      recommendations.push('建议优先解决对齐问题，当前对齐率较低');
    }
    
    const missingRoutes = report.misaligned.filter(item => item.status === 'MISSING_ROUTE');
    if (missingRoutes.length > 0) {
      recommendations.push(`有 ${missingRoutes.length} 个表缺少对应的路由文件，建议使用自动生成功能`);
    }
    
    const missingModels = report.misaligned.filter(item => item.status === 'MISSING_MODEL');
    if (missingModels.length > 0) {
      recommendations.push(`有 ${missingModels.length} 个表缺少对应的模型文件，建议使用自动生成功能`);
    }
    
    if (report.alignmentScore > 0.9) {
      recommendations.push('对齐情况良好，可以开始使用CRUD工厂进行标准化');
    }
    
    return recommendations;
  }
}

export default DatabaseRouteAlignmentChecker;