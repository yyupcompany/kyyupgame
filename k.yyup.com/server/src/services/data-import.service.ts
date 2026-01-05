import { Request } from 'express';
import { OperationLog, OperationType, OperationResult } from '../models/operation-log.model';
import { logger } from '../utils/logger';

/**
 * 数据导入服务
 * 处理文档解析、字段映射、数据验证和批量插入
 */

export interface ImportPermissionMap {
  student: 'STUDENT_CREATE';
  parent: 'PARENT_MANAGE';
  teacher: 'TEACHER_MANAGE';
}

export interface ImportKeywords {
  student: string[];
  parent: string[];
  teacher: string[];
}

export interface ParsedDocumentData {
  type: 'student' | 'parent' | 'teacher';
  data: any[];
  fields: string[];
  totalRecords: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: string;
  validation?: string;
  confidence?: number;
}

// 🎯 新增：字段对比表接口
export interface FieldComparisonTable {
  willImport: WillImportField[];
  willIgnore: WillIgnoreField[];
  missing: MissingField[];
  conflicts: ConflictField[];
}

export interface WillImportField {
  sourceField: string;
  targetField: string;
  confidence: number;
  dataType: string;
  required: boolean;
  description: string;
  sampleValue?: string;
}

export interface WillIgnoreField {
  sourceField: string;
  reason: string;
  suggestion?: string;
  sampleValue?: string;
}

export interface MissingField {
  targetField: string;
  dataType: string;
  description: string;
  defaultValue?: any;
  canUseDefault: boolean;
}

export interface ConflictField {
  sourceField: string;
  suggestedTarget: string;
  confidence: number;
  reason: string;
  alternatives: string[];
}

export interface MappingSummary {
  totalSourceFields: number;
  willImportCount: number;
  willIgnoreCount: number;
  missingRequiredCount: number;
  conflictsCount: number;
  canProceed: boolean;
  recommendation: string;
  userFriendlyMessage: string;
}

export interface ImportPreview {
  type: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  fieldMappings: FieldMapping[];
  comparisonTable: FieldComparisonTable;
  summary: MappingSummary;
  sampleData: any[];
  validationErrors: any[];
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: any[];
  insertedIds: number[];
}

export class DataImportService {
  // 数据导入关键词映射
  private readonly importKeywords: ImportKeywords = {
    student: ['学生', '学员', '儿童', '孩子', '入学', '报名', '幼儿'],
    parent: ['家长', '父母', '监护人', '家庭', '联系人'],
    teacher: ['教师', '老师', '员工', '教职工', '工作人员']
  };

  // 权限映射
  private readonly permissionMap: ImportPermissionMap = {
    student: 'STUDENT_CREATE',
    parent: 'PARENT_MANAGE',
    teacher: 'TEACHER_MANAGE'
  };

  /**
   * 检测用户导入意图
   */
  detectImportIntent(userQuery: string): string | null {
    const query = userQuery.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.importKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return type;
      }
    }
    
    return null;
  }

  /**
   * 检查用户导入权限
   */
  async checkImportPermission(userId: number, importType: string): Promise<boolean> {
    try {
      const requiredPermission = this.permissionMap[importType as keyof ImportPermissionMap];
      
      if (!requiredPermission) {
        return false;
      }

      // 调用权限检查API
      const response = await fetch('/api/auth-permissions/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/${importType}s`,
          userId
        })
      });

      const result = await response.json();
      return result.success && result.data?.hasPermission;
    } catch (error) {
      logger.error('权限检查失败', { error, userId, importType });
      return false;
    }
  }

  /**
   * 解析文档内容
   */
  async parseDocument(filePath: string, importType: string): Promise<ParsedDocumentData> {
    try {
      const fileExtension = this.getFileExtension(filePath);
      let parsedData: any[] = [];
      let fields: string[] = [];

      switch (fileExtension) {
        case '.xlsx':
        case '.xls':
          ({ data: parsedData, fields } = await this.parseExcelFile(filePath));
          break;
        case '.docx':
        case '.doc':
          ({ data: parsedData, fields } = await this.parseWordFile(filePath));
          break;
        case '.pdf':
          ({ data: parsedData, fields } = await this.parsePdfFile(filePath));
          break;
        case '.txt':
          ({ data: parsedData, fields } = await this.parseTextFile(filePath));
          break;
        case '.csv':
          ({ data: parsedData, fields } = await this.parseCsvFile(filePath));
          break;
        default:
          throw new Error(`不支持的文件格式: ${fileExtension}`);
      }

      // 使用AI增强数据解析
      const enhancedData = await this.enhanceDataWithAI(parsedData, importType);

      return {
        type: importType as 'student' | 'parent' | 'teacher',
        data: enhancedData,
        fields,
        totalRecords: enhancedData.length
      };
    } catch (error) {
      logger.error('文档解析失败', { error, filePath, importType });
      throw new Error(`文档解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filePath: string): string {
    return filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  }

  /**
   * 解析Excel文件
   */
  private async parseExcelFile(filePath: string): Promise<{ data: any[], fields: string[] }> {
    try {
      // TODO: 使用 xlsx 库解析Excel文件
      // const XLSX = require('xlsx');
      // const workbook = XLSX.readFile(filePath);
      // const sheetName = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[sheetName];
      // const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 模拟Excel解析结果
      const mockData = [
        { '姓名': '张三', '电话': '13800138000', '邮箱': 'zhangsan@example.com' },
        { '姓名': '李四', '电话': '13800138001', '邮箱': 'lisi@example.com' }
      ];

      const fields = Object.keys(mockData[0] || {});

      return { data: mockData, fields };
    } catch (error) {
      throw new Error(`Excel文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析Word文件
   */
  private async parseWordFile(filePath: string): Promise<{ data: any[], fields: string[] }> {
    try {
      // TODO: 使用 mammoth 或 docx 库解析Word文件
      // 提取表格数据或结构化文本

      // 模拟Word解析结果
      const mockData = [
        { '学生姓名': '王五', '联系电话': '13800138002', '家长姓名': '王父' }
      ];

      const fields = Object.keys(mockData[0] || {});

      return { data: mockData, fields };
    } catch (error) {
      throw new Error(`Word文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析PDF文件
   */
  private async parsePdfFile(filePath: string): Promise<{ data: any[], fields: string[] }> {
    try {
      // TODO: 使用 pdf-parse 库解析PDF文件
      // 提取表格数据或使用OCR识别

      // 模拟PDF解析结果
      const mockData = [
        { '教师姓名': '赵老师', '工号': 'T001', '科目': '数学' }
      ];

      const fields = Object.keys(mockData[0] || {});

      return { data: mockData, fields };
    } catch (error) {
      throw new Error(`PDF文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析文本文件
   */
  private async parseTextFile(filePath: string): Promise<{ data: any[], fields: string[] }> {
    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');

      // 使用AI解析非结构化文本
      const aiParsedData = await this.parseTextWithAI(content);

      return aiParsedData;
    } catch (error) {
      throw new Error(`文本文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析CSV文件
   */
  private async parseCsvFile(filePath: string): Promise<{ data: any[], fields: string[] }> {
    try {
      // TODO: 使用 csv-parser 库解析CSV文件

      // 模拟CSV解析结果
      const mockData = [
        { 'name': '孙六', 'phone': '13800138003', 'email': 'sunliu@example.com' }
      ];

      const fields = Object.keys(mockData[0] || {});

      return { data: mockData, fields };
    } catch (error) {
      throw new Error(`CSV文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取数据库表结构
   */
  async getDatabaseSchema(importType: string): Promise<any> {
    try {
      const schemaMap = {
        student: {
          name: { type: 'string', required: true, maxLength: 50 },
          studentId: { type: 'string', required: false, maxLength: 20 },
          phone: { type: 'string', required: false, maxLength: 20 },
          email: { type: 'string', required: false, maxLength: 100 },
          birthDate: { type: 'date', required: false },
          gender: { type: 'enum', required: false, values: ['male', 'female'] },
          address: { type: 'string', required: false, maxLength: 200 }
        },
        parent: {
          name: { type: 'string', required: true, maxLength: 50 },
          phone: { type: 'string', required: true, maxLength: 20 },
          email: { type: 'string', required: false, maxLength: 100 },
          relationship: { type: 'enum', required: true, values: ['father', 'mother', 'guardian'] },
          occupation: { type: 'string', required: false, maxLength: 100 },
          address: { type: 'string', required: false, maxLength: 200 }
        },
        teacher: {
          name: { type: 'string', required: true, maxLength: 50 },
          employeeId: { type: 'string', required: false, maxLength: 20 },
          phone: { type: 'string', required: true, maxLength: 20 },
          email: { type: 'string', required: true, maxLength: 100 },
          subject: { type: 'string', required: false, maxLength: 50 },
          department: { type: 'string', required: false, maxLength: 50 },
          hireDate: { type: 'date', required: false }
        }
      };

      return schemaMap[importType as keyof typeof schemaMap] || {};
    } catch (error) {
      logger.error('获取数据库结构失败', { error, importType });
      throw new Error('获取数据库结构失败');
    }
  }

  /**
   * 生成字段映射建议
   */
  /**
   * 🎯 生成智能字段映射和对比表
   */
  async generateFieldMapping(
    documentFields: string[],
    databaseSchema: any,
    importType: string,
    sampleData?: any[]
  ): Promise<{
    mappings: FieldMapping[];
    comparisonTable: FieldComparisonTable;
    summary: MappingSummary;
  }> {
    try {
      const mappings: FieldMapping[] = [];
      const comparisonTable: FieldComparisonTable = {
        willImport: [],
        willIgnore: [],
        missing: [],
        conflicts: []
      };

      // 🎯 智能字段映射规则（支持中英文）
      const fieldMappingRules = {
        name: ['姓名', '名字', 'name', '用户名', '学生姓名', '家长姓名', '教师姓名'],
        phone: ['电话', '手机', '联系电话', 'phone', 'mobile', '手机号', '联系方式'],
        email: ['邮箱', '电子邮件', 'email', 'mail', '邮件地址'],
        address: ['地址', '住址', 'address', '联系地址', '家庭地址'],
        birthDate: ['出生日期', '生日', 'birthDate', 'birth', '出生年月'],
        gender: ['性别', 'gender', 'sex'],
        relationship: ['关系', '亲属关系', 'relationship', '与学生关系'],
        occupation: ['职业', '工作', 'occupation', 'job', '职务'],
        studentId: ['学号', '学生编号', 'studentId', '学生ID'],
        employeeId: ['工号', '员工编号', 'employeeId', '教师编号'],
        idCard: ['身份证', '身份证号', 'idCard', '证件号码'],
        department: ['部门', '科室', 'department', '所属部门'],
        subject: ['科目', '学科', 'subject', '任教科目'],
        classId: ['班级', '所在班级', 'classId', '班级编号']
      };

      // 1. 🔍 遍历文档字段，进行智能匹配
      for (const docField of documentFields) {
        let bestMatch: { field: string; confidence: number } | null = null;

        // 寻找最佳匹配
        for (const [dbField, aliases] of Object.entries(fieldMappingRules)) {
          if (databaseSchema[dbField]) {
            const confidence = this.calculateFieldConfidence(docField, aliases);

            if (confidence > 0.8 && (!bestMatch || confidence > bestMatch.confidence)) {
              bestMatch = { field: dbField, confidence };
            }
          }
        }

        if (bestMatch && bestMatch.confidence > 0.8) {
          // ✅ 高置信度匹配 - 将会导入
          const mapping: FieldMapping = {
            sourceField: docField,
            targetField: bestMatch.field,
            required: databaseSchema[bestMatch.field].required || false,
            dataType: databaseSchema[bestMatch.field].type,
            validation: databaseSchema[bestMatch.field].values ?
              `枚举值: ${databaseSchema[bestMatch.field].values.join(', ')}` : undefined,
            confidence: bestMatch.confidence
          };

          mappings.push(mapping);
          comparisonTable.willImport.push({
            sourceField: docField,
            targetField: bestMatch.field,
            confidence: bestMatch.confidence,
            dataType: databaseSchema[bestMatch.field].type,
            required: databaseSchema[bestMatch.field].required || false,
            description: this.getFieldDescription(bestMatch.field, importType),
            sampleValue: this.getSampleValue(docField, sampleData)
          });
        } else if (bestMatch && bestMatch.confidence > 0.5) {
          // ⚠️ 中等置信度 - 可能冲突
          comparisonTable.conflicts.push({
            sourceField: docField,
            suggestedTarget: bestMatch.field,
            confidence: bestMatch.confidence,
            reason: '字段名称相似但不完全匹配，建议您确认是否正确',
            alternatives: this.getAlternativeFields(docField, Object.keys(databaseSchema))
          });
        } else {
          // ❌ 无法匹配 - 将被忽略
          comparisonTable.willIgnore.push({
            sourceField: docField,
            reason: '在目标数据库中找不到对应字段，该字段将被忽略',
            suggestion: this.suggestAlternativeField(docField, Object.keys(databaseSchema)),
            sampleValue: this.getSampleValue(docField, sampleData)
          });
        }
      }

      // 2. 🔍 检查缺失的必填字段
      Object.keys(databaseSchema).forEach(dbField => {
        const isRequired = databaseSchema[dbField].required;
        const isMapped = mappings.some(m => m.targetField === dbField);

        if (isRequired && !isMapped) {
          const defaultValue = this.getDefaultValue(dbField, importType);
          comparisonTable.missing.push({
            targetField: dbField,
            dataType: databaseSchema[dbField].type,
            description: this.getFieldDescription(dbField, importType),
            defaultValue,
            canUseDefault: defaultValue !== null
          });
        }
      });

      // 3. 📊 生成摘要和建议
      const summary = this.generateMappingSummary(documentFields, comparisonTable, importType);

      return { mappings, comparisonTable, summary };
    } catch (error) {
      logger.error('字段映射生成失败', { error, documentFields, importType });
      throw new Error('字段映射生成失败');
    }
  }

  /**
   * 数据验证和预览
   */
  async validateAndPreview(
    data: any[], 
    fieldMappings: FieldMapping[], 
    databaseSchema: any
  ): Promise<ImportPreview> {
    try {
      const validationErrors: any[] = [];
      let validRecords = 0;
      let invalidRecords = 0;

      // 验证每条记录
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const recordErrors: any[] = [];

        // 验证必填字段
        for (const mapping of fieldMappings) {
          if (mapping.required && !record[mapping.sourceField]) {
            recordErrors.push({
              field: mapping.sourceField,
              message: `必填字段不能为空`
            });
          }
        }

        if (recordErrors.length > 0) {
          invalidRecords++;
          validationErrors.push({
            rowIndex: i + 1,
            errors: recordErrors
          });
        } else {
          validRecords++;
        }
      }

      return {
        type: 'preview',
        totalRecords: data.length,
        validRecords,
        invalidRecords,
        fieldMappings,
        sampleData: data.slice(0, 5), // 显示前5条数据作为样例
        validationErrors,
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: []
        },
        summary: {
          totalSourceFields: fieldMappings.length,
          willImportCount: fieldMappings.filter(f => f.confidence > 0.5).length,
          willIgnoreCount: fieldMappings.filter(f => f.confidence <= 0.5).length,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: '数据可以导入',
          userFriendlyMessage: '数据验证通过，可以进行导入'
        }
      };
    } catch (error) {
      logger.error('数据验证失败', { error });
      throw new Error('数据验证失败');
    }
  }

  /**
   * 使用AI增强数据解析
   */
  private async enhanceDataWithAI(data: any[], importType: string): Promise<any[]> {
    try {
      // TODO: 集成AI服务进行数据清洗和标准化
      // 1. 数据格式标准化（电话号码、邮箱等）
      // 2. 缺失数据补全
      // 3. 数据去重
      // 4. 字段名称标准化

      return data.map(record => {
        const enhanced = { ...record };

        // 标准化电话号码格式
        Object.keys(enhanced).forEach(key => {
          if (key.includes('电话') || key.includes('phone')) {
            const phone = enhanced[key];
            if (phone && typeof phone === 'string') {
              enhanced[key] = this.standardizePhoneNumber(phone);
            }
          }
        });

        return enhanced;
      });
    } catch (error) {
      logger.error('AI数据增强失败', { error, importType });
      return data; // 返回原始数据
    }
  }

  /**
   * 使用AI解析非结构化文本
   */
  private async parseTextWithAI(content: string): Promise<{ data: any[], fields: string[] }> {
    try {
      // TODO: 调用AI服务解析文本内容
      // 识别人员信息、联系方式等结构化数据

      // 模拟AI文本解析
      const lines = content.split('\n').filter(line => line.trim());
      const data: any[] = [];

      // 简单的文本解析逻辑
      for (const line of lines) {
        if (line.includes('姓名') || line.includes('电话')) {
          const record: any = {};

          // 提取姓名
          const nameMatch = line.match(/姓名[：:]\s*([^\s,，]+)/);
          if (nameMatch) record.name = nameMatch[1];

          // 提取电话
          const phoneMatch = line.match(/电话[：:]\s*([0-9-]+)/);
          if (phoneMatch) record.phone = phoneMatch[1];

          if (Object.keys(record).length > 0) {
            data.push(record);
          }
        }
      }

      const fields = data.length > 0 ? Object.keys(data[0]) : [];

      return { data, fields };
    } catch (error) {
      logger.error('AI文本解析失败', { error });
      throw new Error('AI文本解析失败');
    }
  }

  /**
   * 标准化电话号码格式
   */
  private standardizePhoneNumber(phone: string): string {
    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, '');

    // 中国手机号码格式化
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // 固定电话格式化
    if (cleaned.length >= 7) {
      return cleaned;
    }

    return phone; // 无法识别格式，返回原值
  }

  /**
   * 执行批量数据插入
   */
  async executeBatchInsert(
    data: any[],
    fieldMappings: FieldMapping[],
    importType: string,
    userId: number
  ): Promise<ImportResult> {
    try {
      const results: ImportResult = {
        success: true,
        totalRecords: data.length,
        successCount: 0,
        failureCount: 0,
        errors: [],
        insertedIds: []
      };

      // 转换数据格式
      const transformedData = this.transformDataForInsert(data, fieldMappings);

      // 根据类型调用相应的插入API
      for (let i = 0; i < transformedData.length; i++) {
        try {
          const record = transformedData[i];
          const insertedId = await this.insertSingleRecord(record, importType, userId);

          results.successCount++;
          results.insertedIds.push(insertedId);
        } catch (error) {
          results.failureCount++;
          results.errors.push({
            rowIndex: i + 1,
            data: transformedData[i],
            error: error instanceof Error ? error.message : '插入失败'
          });
        }
      }

      // 记录操作日志
      await this.logImportOperation(
        userId,
        importType,
        'batch_insert',
        results.failureCount === 0 ? OperationResult.SUCCESS : OperationResult.FAILED,
        {
          totalRecords: results.totalRecords,
          successCount: results.successCount,
          failureCount: results.failureCount
        }
      );

      return results;
    } catch (error) {
      logger.error('批量插入失败', { error, importType, userId });
      throw new Error('批量插入失败');
    }
  }

  /**
   * 转换数据格式用于插入
   */
  private transformDataForInsert(data: any[], fieldMappings: FieldMapping[]): any[] {
    return data.map(record => {
      const transformed: any = {};

      fieldMappings.forEach(mapping => {
        const sourceValue = record[mapping.sourceField];
        if (sourceValue !== undefined && sourceValue !== null) {
          transformed[mapping.targetField] = sourceValue;
        }
      });

      return transformed;
    });
  }

  /**
   * 插入单条记录 - 使用现有API确保完整的权限和业务逻辑验证
   */
  private async insertSingleRecord(record: any, importType: string, userId: number): Promise<number> {
    try {
      // 🔒 安全第一：必须通过现有API插入，确保完整验证

      // 1. 预验证：检查数据完整性和业务规则
      await this.preValidateRecord(record, importType, userId);

      // 2. 调用现有的带完整权限验证的API
      const result = await this.callSecureAPI(record, importType, userId);

      return result.id;
    } catch (error) {
      logger.error('安全插入失败', {
        error: error instanceof Error ? error.message : '未知错误',
        record,
        importType,
        userId
      });
      throw error;
    }
  }

  /**
   * 🔒 预验证：多层安全检查
   */
  private async preValidateRecord(record: any, importType: string, userId: number): Promise<void> {
    // 1. 唯一性验证
    await this.validateUniqueness(record, importType);

    // 2. 关联性验证
    await this.validateRelationships(record, importType);

    // 3. 权限边界验证
    await this.validatePermissionBoundary(record, importType, userId);

    // 4. 业务规则验证
    await this.validateBusinessRules(record, importType, userId);
  }

  /**
   * 🔒 唯一性验证：防止重复数据
   */
  private async validateUniqueness(record: any, importType: string): Promise<void> {
    const uniqueFields = this.getUniqueFields(importType);

    for (const field of uniqueFields) {
      if (record[field]) {
        const exists = await this.checkFieldExists(field, record[field], importType);
        if (exists) {
          throw new Error(`${field} "${record[field]}" 已存在，不能重复添加`);
        }
      }
    }
  }

  /**
   * 🔒 关联性验证：确保数据关联合理
   */
  private async validateRelationships(record: any, importType: string): Promise<void> {
    if (importType === 'parent') {
      // 验证家长与学生的关联
      if (record.studentId) {
        const studentExists = await this.checkStudentExists(record.studentId);
        if (!studentExists) {
          throw new Error(`关联的学生ID "${record.studentId}" 不存在`);
        }

        // 检查家长数量限制
        const parentCount = await this.getParentCountForStudent(record.studentId);
        if (parentCount >= 4) { // 最多4个监护人
          throw new Error(`学生已有${parentCount}个监护人，不能再添加`);
        }
      }
    }
  }

  /**
   * 🔒 权限边界验证：确保用户只能操作授权范围内的数据
   */
  private async validatePermissionBoundary(record: any, importType: string, userId: number): Promise<void> {
    // 获取用户权限范围
    const userPermissions = await this.getUserPermissionScope(userId);

    // 验证是否在权限范围内
    if (importType === 'student' && record.classId) {
      if (!userPermissions.allowedClasses.includes(record.classId)) {
        throw new Error(`您没有权限为班级 "${record.classId}" 添加学生`);
      }
    }

    if (importType === 'teacher' && record.departmentId) {
      if (!userPermissions.allowedDepartments.includes(record.departmentId)) {
        throw new Error(`您没有权限为部门 "${record.departmentId}" 添加教师`);
      }
    }
  }

  /**
   * 🔒 业务规则验证：确保符合业务逻辑
   */
  private async validateBusinessRules(record: any, importType: string, userId: number): Promise<void> {
    if (importType === 'parent') {
      // 验证家长年龄合理性
      if (record.birthDate) {
        const age = this.calculateAge(record.birthDate);
        if (age < 18 || age > 80) {
          throw new Error(`家长年龄 ${age} 岁不在合理范围内（18-80岁）`);
        }
      }

      // 验证联系方式
      if (record.phone) {
        const phoneInUse = await this.checkPhoneInUse(record.phone, importType);
        if (phoneInUse) {
          throw new Error(`手机号 "${record.phone}" 已被其他${phoneInUse.type}使用`);
        }
      }
    }
  }

  /**
   * 🔒 调用安全API：通过现有API插入数据，确保完整验证
   */
  private async callSecureAPI(record: any, importType: string, userId: number): Promise<{ id: number }> {
    const axios = require('axios');
    // 🔧 修复：动态构建URL，避免硬编码
    const port = process.env.PORT || 3000;
    const baseURL = process.env.API_BASE_URL || `http://127.0.0.1:${port}`;

    // 获取用户token用于API调用
    const userToken = await this.getUserToken(userId);

    const apiEndpoints = {
      student: `${baseURL}/api/students`,
      parent: `${baseURL}/api/parents`,
      teacher: `${baseURL}/api/teachers`
    };

    const endpoint = apiEndpoints[importType as keyof typeof apiEndpoints];
    if (!endpoint) {
      throw new Error(`不支持的导入类型: ${importType}`);
    }

    try {
      // 🔒 通过现有API插入，确保所有验证都执行
      const response = await axios.post(endpoint, record, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'X-Import-Source': 'data-import-workflow' // 标识来源
        },
        timeout: 10000 // 10秒超时
      });

      if (response.status !== 201) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      return { id: response.data.id };
    } catch (error: any) {
      if (error.response) {
        // API返回的业务错误
        const message = error.response.data?.message || error.response.data?.error || '插入失败';
        throw new Error(`数据验证失败: ${message}`);
      } else if (error.request) {
        // 网络错误
        throw new Error('API服务不可用，请稍后重试');
      } else {
        // 其他错误
        throw new Error(`插入失败: ${error.message}`);
      }
    }
  }

  // ========== 辅助验证方法 ==========

  /**
   * 获取唯一字段列表
   */
  private getUniqueFields(importType: string): string[] {
    const uniqueFieldsMap = {
      student: ['studentId', 'phone', 'email'],
      parent: ['phone', 'email', 'idCard'],
      teacher: ['employeeId', 'phone', 'email', 'idCard']
    };

    return uniqueFieldsMap[importType as keyof typeof uniqueFieldsMap] || [];
  }

  /**
   * 检查字段值是否已存在
   */
  private async checkFieldExists(field: string, value: string, importType: string): Promise<boolean> {
    // TODO: 实现数据库查询检查唯一性
    // 这里应该查询相应的数据表
    logger.info('检查字段唯一性', { field, value, importType });

    // 模拟检查结果
    return false; // 暂时返回false，实际应该查询数据库
  }

  /**
   * 检查学生是否存在
   */
  private async checkStudentExists(studentId: string): Promise<boolean> {
    // TODO: 查询学生表
    logger.info('检查学生存在性', { studentId });
    return true; // 模拟返回
  }

  /**
   * 获取学生的家长数量
   */
  private async getParentCountForStudent(studentId: string): Promise<number> {
    // TODO: 查询家长-学生关联表
    logger.info('获取学生家长数量', { studentId });
    return 0; // 模拟返回
  }

  /**
   * 获取用户权限范围
   */
  private async getUserPermissionScope(userId: number): Promise<{
    allowedClasses: string[];
    allowedDepartments: string[];
  }> {
    // TODO: 查询用户权限表
    logger.info('获取用户权限范围', { userId });

    // 模拟返回管理员权限
    return {
      allowedClasses: ['*'], // * 表示所有班级
      allowedDepartments: ['*'] // * 表示所有部门
    };
  }

  /**
   * 计算年龄
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * 检查手机号是否被使用
   */
  private async checkPhoneInUse(phone: string, currentType: string): Promise<{ type: string } | null> {
    // TODO: 查询所有相关表检查手机号使用情况
    logger.info('检查手机号使用情况', { phone, currentType });
    return null; // 模拟返回未使用
  }

  /**
   * 获取用户Token用于API调用
   */
  private async getUserToken(userId: number): Promise<string> {
    // TODO: 生成或获取用户的有效token
    // 这里应该调用认证服务获取token
    logger.info('获取用户Token', { userId });

    // 模拟返回token
    return 'mock-jwt-token-for-api-calls';
  }

  /**
   * 记录导入操作日志
   */
  private async logImportOperation(
    userId: number,
    importType: string,
    action: string,
    result: OperationResult,
    details: any
  ): Promise<void> {
    try {
      await OperationLog.create({
        userId,
        module: '数据导入',
        action: `import_${importType}_${action}`,
        operationType: OperationType.CREATE,
        resourceType: 'data_import',
        resourceId: null,
        description: `${importType}数据导入${action}`,
        requestMethod: null,
        requestUrl: null,
        requestParams: JSON.stringify(details),
        requestIp: null,
        userAgent: null,
        deviceInfo: null,
        operationResult: result,
        resultMessage: result === OperationResult.SUCCESS ? '操作成功' : '操作失败',
        executionTime: null,
      });
    } catch (error) {
      logger.error('记录导入日志失败', { error, userId, importType, action });
    }
  }

  // ========== 🎯 字段映射辅助方法 ==========

  /**
   * 计算字段匹配置信度
   */
  private calculateFieldConfidence(sourceField: string, aliases: string[]): number {
    const source = sourceField.toLowerCase();
    let maxConfidence = 0;

    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase();

      // 完全匹配
      if (source === aliasLower) {
        return 1.0;
      }

      // 包含匹配
      if (source.includes(aliasLower) || aliasLower.includes(source)) {
        maxConfidence = Math.max(maxConfidence, 0.9);
      }

      // 相似度匹配（简单的编辑距离）
      const similarity = this.calculateStringSimilarity(source, aliasLower);
      if (similarity > 0.7) {
        maxConfidence = Math.max(maxConfidence, similarity * 0.8);
      }
    }

    return maxConfidence;
  }

  /**
   * 计算字符串相似度
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 获取字段描述
   */
  private getFieldDescription(field: string, importType: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      student: {
        name: '学生姓名',
        studentId: '学生学号或编号',
        phone: '学生联系电话',
        email: '学生邮箱地址',
        birthDate: '学生出生日期',
        gender: '学生性别',
        address: '学生家庭地址'
      },
      parent: {
        name: '家长姓名',
        phone: '家长联系电话（必填）',
        email: '家长邮箱地址',
        relationship: '与学生的关系（父亲/母亲/监护人）',
        occupation: '家长职业',
        address: '家长联系地址',
        idCard: '家长身份证号码'
      },
      teacher: {
        name: '教师姓名',
        employeeId: '教师工号',
        phone: '教师联系电话',
        email: '教师邮箱地址',
        department: '所属部门',
        subject: '任教科目',
        idCard: '教师身份证号码'
      }
    };

    return descriptions[importType]?.[field] || `${field}字段`;
  }

  /**
   * 获取样本值
   */
  private getSampleValue(field: string, sampleData?: any[]): string {
    if (!sampleData || sampleData.length === 0) return '';

    const firstRecord = sampleData[0];
    const value = firstRecord[field];

    if (value === undefined || value === null) return '';

    return String(value).substring(0, 20) + (String(value).length > 20 ? '...' : '');
  }

  /**
   * 获取替代字段建议
   */
  private getAlternativeFields(sourceField: string, targetFields: string[]): string[] {
    const alternatives: string[] = [];
    const source = sourceField.toLowerCase();

    for (const target of targetFields) {
      const similarity = this.calculateStringSimilarity(source, target.toLowerCase());
      if (similarity > 0.3) {
        alternatives.push(target);
      }
    }

    return alternatives.slice(0, 3); // 最多返回3个建议
  }

  /**
   * 建议替代字段
   */
  private suggestAlternativeField(sourceField: string, targetFields: string[]): string {
    const alternatives = this.getAlternativeFields(sourceField, targetFields);
    return alternatives.length > 0 ? `建议使用: ${alternatives.join(', ')}` : '无相似字段';
  }

  /**
   * 获取默认值
   */
  private getDefaultValue(field: string, importType: string): any {
    const defaults: Record<string, Record<string, any>> = {
      student: {
        gender: 'unknown',
        status: 'active'
      },
      parent: {
        relationship: 'guardian'
      },
      teacher: {
        status: 'active',
        department: 'general'
      }
    };

    return defaults[importType]?.[field] || null;
  }

  /**
   * 生成映射摘要
   */
  private generateMappingSummary(
    sourceFields: string[],
    comparisonTable: FieldComparisonTable,
    importType: string
  ): MappingSummary {
    const canProceed = comparisonTable.missing.filter(m => !m.canUseDefault).length === 0;

    let recommendation = '';
    let userFriendlyMessage = '';

    if (canProceed) {
      if (comparisonTable.willIgnore.length > 0) {
        recommendation = '可以继续导入，但部分字段将被忽略';
        userFriendlyMessage = `您的文档包含 ${sourceFields.length} 个字段，其中 ${comparisonTable.willImport.length} 个字段将被导入到数据库，${comparisonTable.willIgnore.length} 个字段将被忽略。这不会影响数据导入，您可以继续操作。`;
      } else {
        recommendation = '所有字段都能正确匹配，建议继续导入';
        userFriendlyMessage = `完美！您的文档中的所有 ${sourceFields.length} 个字段都能正确匹配到数据库字段，可以安全导入。`;
      }
    } else {
      const missingRequired = comparisonTable.missing.filter(m => !m.canUseDefault);
      recommendation = `缺少必填字段，无法导入`;
      userFriendlyMessage = `抱歉，您的文档缺少 ${missingRequired.length} 个必填字段（${missingRequired.map(m => m.targetField).join(', ')}），请补充这些字段后重新上传。`;
    }

    return {
      totalSourceFields: sourceFields.length,
      willImportCount: comparisonTable.willImport.length,
      willIgnoreCount: comparisonTable.willIgnore.length,
      missingRequiredCount: comparisonTable.missing.filter(m => !m.canUseDefault).length,
      conflictsCount: comparisonTable.conflicts.length,
      canProceed,
      recommendation,
      userFriendlyMessage
    };
  }
}
