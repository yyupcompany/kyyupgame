/**
 * API对齐检测器
 * API Alignment Detector
 * 
 * 功能：
 * 1. 检测前端API调用与后端响应的对齐问题
 * 2. 验证数据转换函数的正确性
 * 3. 检查字段映射和数据类型匹配
 * 4. 提供自动修复建议
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class ApiAlignmentDetector {
  constructor() {
    this.baseUrl = 'http://k.yyup.cc';
    this.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbeyJpZCI6MSwibmFtZSI6Iua1i-WKnuWRmCIsImNvZGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzM3MDM2MjEzLCJleHAiOjE3MzcxMjI2MTN9.IzHzR2gQZdMnZRQ_zOZLCYNcHJGVkSgJZfvpNZdGgMo';
    
    // 需要检测的API端点
    this.apiEndpoints = [
      {
        name: 'users',
        endpoint: '/api/users',
        method: 'GET',
        expectedFields: ['id', 'username', 'realName', 'email', 'mobile', 'phone', 'status', 'createdAt', 'updatedAt'],
        frontendExpected: ['id', 'username', 'realName', 'email', 'mobile', 'status', 'createdAt', 'updatedAt'],
        transformFunction: 'transformUserData'
      },
      {
        name: 'roles',
        endpoint: '/api/roles',
        method: 'GET',
        expectedFields: ['id', 'name', 'code', 'description', 'status', 'createdAt', 'updatedAt'],
        frontendExpected: ['id', 'name', 'code', 'description', 'status', 'createdAt', 'updatedAt'],
        transformFunction: 'transformRoleData'
      },
      {
        name: 'students',
        endpoint: '/api/students',
        method: 'GET',
        expectedFields: ['id', 'name', 'gender', 'birthDate', 'birth_date', 'status', 'createdAt', 'created_at'],
        frontendExpected: ['id', 'name', 'gender', 'birthDate', 'status', 'createdAt'],
        transformFunction: 'transformStudentData'
      },
      {
        name: 'teachers',
        endpoint: '/api/teachers',
        method: 'GET',
        expectedFields: ['id', 'name', 'realName', 'real_name', 'phoneNumber', 'phone_number', 'email', 'status'],
        frontendExpected: ['id', 'name', 'realName', 'phoneNumber', 'email', 'status'],
        transformFunction: 'transformTeacherData'
      },
      {
        name: 'classes',
        endpoint: '/api/classes',
        method: 'GET',
        expectedFields: ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt'],
        frontendExpected: ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt'],
        transformFunction: 'transformClassData'
      },
      {
        name: 'activities',
        endpoint: '/api/activities',
        method: 'GET',
        expectedFields: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'createdAt'],
        frontendExpected: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'createdAt'],
        transformFunction: 'transformActivityData'
      },
      {
        name: 'permissions',
        endpoint: '/api/permissions',
        method: 'GET',
        expectedFields: ['id', 'name', 'code', 'type', 'parentId', 'parent_id', 'path', 'status'],
        frontendExpected: ['id', 'name', 'code', 'type', 'parentId', 'path', 'status'],
        transformFunction: 'transformPermissionData'
      },
      {
        name: 'menu',
        endpoint: '/api/auth/menu',
        method: 'GET',
        expectedFields: ['id', 'name', 'path', 'icon', 'type', 'children'],
        frontendExpected: ['id', 'name', 'path', 'icon', 'type', 'children'],
        transformFunction: 'convertMenuData'
      },
      {
        name: 'dashboard',
        endpoint: '/api/dashboard/stats',
        method: 'GET',
        expectedFields: ['totalUsers', 'totalStudents', 'totalTeachers', 'totalClasses'],
        frontendExpected: ['totalUsers', 'totalStudents', 'totalTeachers', 'totalClasses'],
        transformFunction: 'transformDashboardData'
      },
      {
        name: 'enrollment-plans',
        endpoint: '/api/enrollment-plans',
        method: 'GET',
        expectedFields: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'createdAt'],
        frontendExpected: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'createdAt'],
        transformFunction: 'transformEnrollmentPlanData'
      },
      {
        name: 'parent-students',
        endpoint: '/api/parent-students',
        method: 'GET',
        expectedFields: ['id', 'parentId', 'studentId', 'relationship', 'isEmergencyContact'],
        frontendExpected: ['id', 'parentId', 'studentId', 'relationship', 'isEmergencyContact'],
        transformFunction: 'transformParentStudentData'
      }
    ];
    
    this.detectionResults = [];
  }

  /**
   * 发送API请求（带重试机制）
   */
  async makeApiRequest(endpoint, method = 'GET', retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await this.makeApiRequestSingle(endpoint, method);
        
        // 如果是429错误，等待更长时间后重试
        if (result.statusCode === 429) {
          console.log(`⚠️ API频率限制，等待${5 * (i + 1)}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
          continue;
        }
        
        return result;
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.log(`⚠️ API请求失败，${2 * (i + 1)}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  }

  /**
   * 单次API请求
   */
  async makeApiRequestSingle(endpoint, method = 'GET') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'k.yyup.cc',
        port: 80,
        path: endpoint,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              data: result,
              headers: res.headers
            });
          } catch (error) {
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(15000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * 检测单个API端点
   */
  async detectApiEndpoint(apiConfig) {
    console.log(`🔍 检测API端点: ${apiConfig.name} (${apiConfig.endpoint})`);
    
    const result = {
      name: apiConfig.name,
      endpoint: apiConfig.endpoint,
      method: apiConfig.method,
      timestamp: new Date().toISOString(),
      status: 'pending',
      issues: [],
      suggestions: [],
      dataStructure: null,
      fieldMapping: {}
    };

    try {
      // 发送API请求
      const response = await this.makeApiRequest(apiConfig.endpoint, apiConfig.method);
      
      result.statusCode = response.statusCode;
      result.responseTime = Date.now();
      
      if (response.statusCode !== 200) {
        result.status = 'failed';
        result.issues.push({
          type: 'http-error',
          message: `API返回状态码: ${response.statusCode}`,
          severity: 'high'
        });
        return result;
      }

      // 分析响应数据结构
      const analysisResult = this.analyzeResponseStructure(response.data, apiConfig);
      result.dataStructure = analysisResult.structure;
      result.fieldMapping = analysisResult.fieldMapping;
      result.issues.push(...analysisResult.issues);
      result.suggestions.push(...analysisResult.suggestions);

      // 检查数据转换对齐
      const transformResult = this.checkDataTransform(response.data, apiConfig);
      result.issues.push(...transformResult.issues);
      result.suggestions.push(...transformResult.suggestions);

      // 检查CRUD操作完整性
      const crudResult = this.checkCRUDOperations(apiConfig);
      result.issues.push(...crudResult.issues);
      result.suggestions.push(...crudResult.suggestions);

      // 生成CRUD测试建议
      const crudTestSuggestions = this.generateCRUDTestSuggestions(apiConfig);
      result.suggestions.push(...crudTestSuggestions);

      result.status = result.issues.filter(i => i.severity === 'high').length > 0 ? 'failed' : 'success';

    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      result.issues.push({
        type: 'request-error',
        message: error.message,
        severity: 'high'
      });
    }

    return result;
  }

  /**
   * 分析响应数据结构
   */
  analyzeResponseStructure(responseData, apiConfig) {
    const result = {
      structure: {},
      fieldMapping: {},
      issues: [],
      suggestions: []
    };

    try {
      // 检查响应格式
      if (!responseData.success && !responseData.data) {
        result.issues.push({
          type: 'response-format',
          message: '响应格式不标准，缺少success或data字段',
          severity: 'high'
        });
        result.suggestions.push({
          type: 'response-format',
          message: '统一API响应格式为: {success: boolean, data: any, message?: string}'
        });
      }

      // 获取实际数据
      let actualData = responseData.data;
      
      // 处理分页数据
      if (actualData && actualData.items) {
        actualData = actualData.items;
      }

      // 处理数组数据
      if (Array.isArray(actualData) && actualData.length > 0) {
        actualData = actualData[0]; // 取第一个元素分析结构
      }

      if (!actualData || typeof actualData !== 'object') {
        result.issues.push({
          type: 'no-data',
          message: '响应中没有可分析的数据',
          severity: 'medium'
        });
        return result;
      }

      // 记录实际字段结构
      result.structure = this.getObjectStructure(actualData);

      // 检查字段对齐
      const fieldAlignment = this.checkFieldAlignment(actualData, apiConfig);
      result.fieldMapping = fieldAlignment.mapping;
      result.issues.push(...fieldAlignment.issues);
      result.suggestions.push(...fieldAlignment.suggestions);

    } catch (error) {
      result.issues.push({
        type: 'analysis-error',
        message: `数据结构分析失败: ${error.message}`,
        severity: 'high'
      });
    }

    return result;
  }

  /**
   * 获取对象结构
   */
  getObjectStructure(obj) {
    const structure = {};
    
    for (const [key, value] of Object.entries(obj)) {
      structure[key] = {
        type: Array.isArray(value) ? 'array' : typeof value,
        value: value,
        hasValue: value !== null && value !== undefined && value !== ''
      };
    }
    
    return structure;
  }

  /**
   * 检查字段对齐
   */
  checkFieldAlignment(actualData, apiConfig) {
    const result = {
      mapping: {},
      issues: [],
      suggestions: []
    };

    const actualFields = Object.keys(actualData);
    const expectedBackendFields = apiConfig.expectedFields || [];
    const expectedFrontendFields = apiConfig.frontendExpected || [];

    // 检查后端字段完整性
    const missingBackendFields = expectedBackendFields.filter(field => !actualFields.includes(field));
    const extraBackendFields = actualFields.filter(field => !expectedBackendFields.includes(field));

    if (missingBackendFields.length > 0) {
      result.issues.push({
        type: 'missing-backend-fields',
        message: `后端缺少字段: ${missingBackendFields.join(', ')}`,
        severity: 'high',
        fields: missingBackendFields
      });
    }

    if (extraBackendFields.length > 0) {
      result.suggestions.push({
        type: 'extra-backend-fields',
        message: `后端存在额外字段: ${extraBackendFields.join(', ')}`,
        fields: extraBackendFields
      });
    }

    // 检查字段映射
    const fieldMappingIssues = this.checkFieldMapping(actualData, apiConfig);
    result.mapping = fieldMappingIssues.mapping;
    result.issues.push(...fieldMappingIssues.issues);
    result.suggestions.push(...fieldMappingIssues.suggestions);

    return result;
  }

  /**
   * 检查字段映射
   */
  checkFieldMapping(actualData, apiConfig) {
    const result = {
      mapping: {},
      issues: [],
      suggestions: []
    };

    // 常见字段映射规则
    const commonMappings = {
      'real_name': 'realName',
      'phone_number': 'phoneNumber',
      'birth_date': 'birthDate',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'deleted_at': 'deletedAt',
      'parent_id': 'parentId',
      'is_system': 'isSystem',
      'last_login_time': 'lastLoginTime',
      'phone': 'mobile', // 特殊映射
      'work_experience': 'workExperience',
      'emergency_contact': 'emergencyContact',
      'emergency_phone': 'emergencyPhone',
      'employee_id': 'employeeId',
      'hire_date': 'hireDate',
      'student_no': 'studentNo',
      'kindergarten_id': 'kindergartenId',
      'enrollment_date': 'enrollmentDate',
      'graduation_date': 'graduationDate',
      'health_condition': 'healthCondition',
      'allergy_history': 'allergyHistory',
      'special_needs': 'specialNeeds',
      'photo_url': 'photoUrl'
    };

    // 检查实际数据中的字段映射
    Object.keys(actualData).forEach(backendField => {
      const frontendField = commonMappings[backendField];
      
      if (frontendField) {
        result.mapping[backendField] = frontendField;
        
        // 检查是否同时存在两个字段
        if (actualData[frontendField] !== undefined) {
          result.issues.push({
            type: 'duplicate-fields',
            message: `同时存在 ${backendField} 和 ${frontendField} 字段`,
            severity: 'medium',
            backendField,
            frontendField
          });
        }
      }
    });

    // 检查前端期望字段是否能够映射
    const frontendExpected = apiConfig.frontendExpected || [];
    frontendExpected.forEach(frontendField => {
      const backendField = Object.keys(commonMappings).find(
        key => commonMappings[key] === frontendField
      );
      
      if (backendField && !actualData[backendField] && !actualData[frontendField]) {
        result.issues.push({
          type: 'missing-mapped-field',
          message: `缺少映射字段: ${backendField} -> ${frontendField}`,
          severity: 'high',
          backendField,
          frontendField
        });
      }
    });

    return result;
  }

  /**
   * 检查数据转换对齐
   */
  checkDataTransform(responseData, apiConfig) {
    const result = {
      issues: [],
      suggestions: []
    };

    // 检查是否有对应的转换函数
    if (apiConfig.transformFunction) {
      result.suggestions.push({
        type: 'transform-function',
        message: `使用转换函数: ${apiConfig.transformFunction}`,
        function: apiConfig.transformFunction
      });

      // 检查转换函数是否处理了所有必要的字段映射
      const actualData = responseData.data;
      if (actualData && (Array.isArray(actualData) ? actualData.length > 0 : typeof actualData === 'object')) {
        const sampleData = Array.isArray(actualData) ? actualData[0] : actualData;
        
        // 检查下划线字段
        const underscoreFields = Object.keys(sampleData).filter(field => field.includes('_'));
        if (underscoreFields.length > 0) {
          result.suggestions.push({
            type: 'underscore-fields',
            message: `需要在${apiConfig.transformFunction}中处理下划线字段: ${underscoreFields.join(', ')}`,
            fields: underscoreFields
          });
        }
      }
    } else {
      result.issues.push({
        type: 'no-transform-function',
        message: '缺少数据转换函数',
        severity: 'medium'
      });
    }

    return result;
  }

  /**
   * 检查CRUD操作完整性
   */
  checkCRUDOperations(apiConfig) {
    const result = {
      issues: [],
      suggestions: []
    };

    // 基于API端点推断CRUD操作
    const endpoint = apiConfig.endpoint;
    const entityName = apiConfig.name;

    // 检查是否有对应的CRUD端点
    const expectedCRUDEndpoints = {
      'create': `POST ${endpoint}`,
      'read': `GET ${endpoint}`,
      'update': `PUT ${endpoint}/:id`,
      'delete': `DELETE ${endpoint}/:id`
    };

    // 检查当前端点类型
    const currentMethod = apiConfig.method;
    const currentEndpoint = apiConfig.endpoint;

    if (currentMethod === 'GET' && !currentEndpoint.includes('/:id')) {
      result.suggestions.push({
        type: 'crud-completeness',
        message: `${entityName}实体的读取操作正常，建议检查其他CRUD操作`,
        missingOperations: ['create', 'update', 'delete']
      });
    }

    return result;
  }

  /**
   * 生成CRUD测试建议
   */
  generateCRUDTestSuggestions(apiConfig) {
    const suggestions = [];
    const entityName = apiConfig.name;

    suggestions.push({
      type: 'crud-test',
      message: `${entityName}实体CRUD操作测试建议`,
      testCases: [
        {
          operation: 'create',
          description: `测试创建${entityName}`,
          method: 'POST',
          endpoint: apiConfig.endpoint,
          testData: this.generateTestData(apiConfig)
        },
        {
          operation: 'read',
          description: `测试读取${entityName}列表`,
          method: 'GET',
          endpoint: apiConfig.endpoint
        },
        {
          operation: 'update',
          description: `测试更新${entityName}`,
          method: 'PUT',
          endpoint: `${apiConfig.endpoint}/:id`,
          testData: this.generateTestData(apiConfig)
        },
        {
          operation: 'delete',
          description: `测试删除${entityName}`,
          method: 'DELETE',
          endpoint: `${apiConfig.endpoint}/:id`
        }
      ]
    });

    return suggestions;
  }

  /**
   * 生成测试数据
   */
  generateTestData(apiConfig) {
    const testData = {};
    const expectedFields = apiConfig.expectedFields || [];

    expectedFields.forEach(field => {
      // 根据字段名生成测试数据
      if (field === 'id') return; // ID通常自动生成
      
      if (field.includes('name') || field.includes('title')) {
        testData[field] = `测试${apiConfig.name}`;
      } else if (field.includes('email')) {
        testData[field] = 'test@example.com';
      } else if (field.includes('phone') || field.includes('mobile')) {
        testData[field] = '13800138000';
      } else if (field.includes('status')) {
        testData[field] = 'active';
      } else if (field.includes('description')) {
        testData[field] = `测试${apiConfig.name}描述`;
      } else if (field.includes('Date')) {
        testData[field] = new Date().toISOString();
      } else {
        testData[field] = `测试${field}`;
      }
    });

    return testData;
  }

  /**
   * 生成修复代码
   */
  generateFixCode(detectionResult) {
    const fixes = [];

    detectionResult.issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-mapped-field':
          fixes.push(this.generateFieldMappingFix(issue, detectionResult));
          break;
        case 'duplicate-fields':
          fixes.push(this.generateDuplicateFieldFix(issue));
          break;
        case 'underscore-fields':
          fixes.push(this.generateUnderscoreFieldFix(issue, detectionResult));
          break;
      }
    });

    return fixes;
  }

  /**
   * 生成字段映射修复代码
   */
  generateFieldMappingFix(issue, detectionResult) {
    const { backendField, frontendField } = issue;
    const transformFunction = detectionResult.name;
    
    return {
      type: 'field-mapping',
      description: `添加字段映射: ${backendField} -> ${frontendField}`,
      code: `
// 在 ${transformFunction} 函数中添加:
${frontendField}: backendData.${backendField} || backendData.${frontendField},

// 同时移除原字段:
${backendField}: undefined,
      `.trim()
    };
  }

  /**
   * 生成重复字段修复代码
   */
  generateDuplicateFieldFix(issue) {
    const { backendField, frontendField } = issue;
    
    return {
      type: 'duplicate-field',
      description: `处理重复字段: ${backendField} 和 ${frontendField}`,
      code: `
// 优先使用前端字段，后端字段作为备选:
${frontendField}: backendData.${frontendField} || backendData.${backendField},

// 移除后端字段:
${backendField}: undefined,
      `.trim()
    };
  }

  /**
   * 生成下划线字段修复代码
   */
  generateUnderscoreFieldFix(issue, detectionResult) {
    const fields = issue.fields;
    const transformFunction = detectionResult.name;
    
    const mappings = fields.map(field => {
      const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      return `${camelCase}: backendData.${field} || backendData.${camelCase},`;
    }).join('\\n');
    
    const removals = fields.map(field => `${field}: undefined,`).join('\\n');
    
    return {
      type: 'underscore-field',
      description: `处理下划线字段映射`,
      code: `
// 在 ${transformFunction} 函数中添加字段映射:
${mappings}

// 移除下划线字段:
${removals}
      `.trim()
    };
  }

  /**
   * 运行完整检测
   */
  async runFullDetection() {
    console.log('🚀 开始API对齐检测...');
    
    const results = {
      timestamp: new Date().toISOString(),
      totalEndpoints: this.apiEndpoints.length,
      results: [],
      summary: {
        success: 0,
        failed: 0,
        errors: 0,
        totalIssues: 0,
        criticalIssues: 0
      },
      fixes: []
    };

    for (const apiConfig of this.apiEndpoints) {
      try {
        const result = await this.detectApiEndpoint(apiConfig);
        results.results.push(result);
        
        // 统计
        if (result.status === 'success') results.summary.success++;
        else if (result.status === 'failed') results.summary.failed++;
        else if (result.status === 'error') results.summary.errors++;
        
        results.summary.totalIssues += result.issues.length;
        results.summary.criticalIssues += result.issues.filter(i => i.severity === 'high').length;
        
        // 生成修复代码
        const fixes = this.generateFixCode(result);
        results.fixes.push(...fixes);
        
        // 延迟避免API频率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ 检测 ${apiConfig.name} 失败:`, error.message);
        results.results.push({
          name: apiConfig.name,
          endpoint: apiConfig.endpoint,
          status: 'error',
          error: error.message,
          issues: [{
            type: 'detection-error',
            message: error.message,
            severity: 'high'
          }]
        });
        results.summary.errors++;
      }
    }

    // 保存结果
    await this.saveDetectionResults(results);
    
    // 输出摘要
    console.log('\\n📊 API对齐检测摘要:');
    console.log(`- 总端点数: ${results.totalEndpoints}`);
    console.log(`- 成功: ${results.summary.success}`);
    console.log(`- 失败: ${results.summary.failed}`);
    console.log(`- 错误: ${results.summary.errors}`);
    console.log(`- 总问题数: ${results.summary.totalIssues}`);
    console.log(`- 严重问题: ${results.summary.criticalIssues}`);
    console.log(`- 修复建议: ${results.fixes.length}`);

    return results;
  }

  /**
   * 保存检测结果
   */
  async saveDetectionResults(results) {
    const reportDir = '/home/devbox/project/client/tests/reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `api-alignment-report-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    // 确保目录存在
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 保存JSON报告
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));

    // 生成修复脚本
    const fixScript = this.generateFixScript(results);
    const fixFilepath = filepath.replace('.json', '-fixes.js');
    fs.writeFileSync(fixFilepath, fixScript);

    console.log(`📊 API对齐检测报告已保存:`);
    console.log(`- 报告: ${filepath}`);
    console.log(`- 修复脚本: ${fixFilepath}`);
  }

  /**
   * 生成修复脚本
   */
  generateFixScript(results) {
    const fixes = results.fixes;
    
    return `
/**
 * API对齐问题修复脚本
 * 生成时间: ${results.timestamp}
 * 
 * 使用方法:
 * 1. 复制下面的修复代码到对应的数据转换函数
 * 2. 测试修复后的效果
 * 3. 运行API对齐检测验证修复结果
 */

// ==================== 修复代码 ====================

${fixes.map((fix, index) => `
// 修复 ${index + 1}: ${fix.description}
${fix.code}
`).join('\\n')}

// ==================== 使用示例 ====================

/*
// 示例：更新用户数据转换函数
export const transformUserData = (backendData) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    realName: backendData.real_name || backendData.realName,
    mobile: backendData.phone || backendData.mobile,
    lastLoginTime: backendData.last_login_time || backendData.lastLoginTime,
    createdAt: backendData.created_at || backendData.createdAt,
    updatedAt: backendData.updated_at || backendData.updatedAt,
    
    // 移除下划线字段
    real_name: undefined,
    phone: undefined,
    last_login_time: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};
*/
    `.trim();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const detector = new ApiAlignmentDetector();
  
  detector.runFullDetection()
    .then(() => {
      console.log('✅ API对齐检测完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ API对齐检测失败:', error);
      process.exit(1);
    });
}

module.exports = ApiAlignmentDetector;