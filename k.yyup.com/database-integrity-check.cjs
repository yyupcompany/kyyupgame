// 数据库完整性检查和修复脚本
// 运行方式: node database-integrity-check.js

const mysql = require('mysql2/promise');
const fs = require('fs');

class DatabaseIntegrityChecker {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      user: config.user || 'root',
      password: config.password || '',
      database: config.database || 'kindergarten',
      port: config.port || 3306,
      ...config
    };
    
    this.connection = null;
    this.issues = [];
    this.fixes = [];
    this.checks = [];
    this.startTime = new Date();
  }

  // 连接数据库
  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log(`✅ 数据库连接成功: ${this.config.host}:${this.config.port}/${this.config.database}`);
      return true;
    } catch (error) {
      console.error(`❌ 数据库连接失败: ${error.message}`);
      return false;
    }
  }

  // 记录检查结果
  logCheck(checkName, status, message, data = null) {
    const result = {
      check: checkName,
      status, // PASS, FAIL, ERROR
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.checks.push(result);
    
    const statusEmoji = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '🔥'
    };
    
    console.log(`${statusEmoji[status]} [${checkName}] ${message}`);
    
    if (status === 'FAIL') {
      this.issues.push(result);
    }
    
    if (data && Object.keys(data).length > 0) {
      console.log(`   详情: ${JSON.stringify(data, null, 2)}`);
    }
  }

  // 记录修复操作
  logFix(fixName, status, message) {
    const fix = {
      fix: fixName,
      status,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.fixes.push(fix);
    console.log(`${status === 'SUCCESS' ? '✅' : '❌'} [修复] ${fixName}: ${message}`);
  }

  // 执行SQL查询
  async query(sql, params = []) {
    try {
      const [results] = await this.connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`SQL执行错误: ${error.message}`);
      console.error(`SQL: ${sql}`);
      throw error;
    }
  }

  // 检查表是否存在
  async checkTableExists(tableName) {
    try {
      const sql = `SELECT COUNT(*) as count FROM information_schema.tables 
                   WHERE table_schema = ? AND table_name = ?`;
      const results = await this.query(sql, [this.config.database, tableName]);
      return results[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  // 基础表结构检查
  async checkBasicTables() {
    console.log('\n🗄️ === 基础表结构检查 ===');
    
    const requiredTables = [
      'users',           // 用户表
      'roles',           // 角色表
      'permissions',     // 权限表
      'user_roles',      // 用户角色关联表
      'role_permissions',// 角色权限关联表
      'teachers',        // 教师表
      'students',        // 学生表
      'parents',         // 家长表
      'classes',         // 班级表
      'activities',      // 活动表
      'enrollment_plans',// 招生计划表
      'applications',    // 申请表
      'ai_conversations',// AI对话表
      'ai_messages',     // AI消息表
      'system_logs'      // 系统日志表
    ];

    for (const table of requiredTables) {
      const exists = await this.checkTableExists(table);
      if (exists) {
        this.logCheck(`TABLE_${table.toUpperCase()}`, 'PASS', `表 ${table} 存在`);
      } else {
        this.logCheck(`TABLE_${table.toUpperCase()}`, 'FAIL', `表 ${table} 不存在`);
      }
    }
  }

  // 用户和权限数据检查
  async checkUserPermissionData() {
    console.log('\n👤 === 用户和权限数据检查 ===');
    
    try {
      // 检查管理员用户
      const adminUsers = await this.query(
        "SELECT * FROM users WHERE username = 'admin' AND status = 'active'"
      );
      
      if (adminUsers.length > 0) {
        this.logCheck('ADMIN_USER', 'PASS', '管理员用户存在', {
          count: adminUsers.length,
          username: adminUsers[0].username,
          email: adminUsers[0].email
        });
      } else {
        this.logCheck('ADMIN_USER', 'FAIL', '管理员用户不存在或未激活');
      }

      // 检查基础角色
      const basicRoles = ['admin', 'principal', 'teacher', 'parent'];
      for (const roleName of basicRoles) {
        const roles = await this.query(
          "SELECT * FROM roles WHERE name = ?", [roleName]
        );
        
        if (roles.length > 0) {
          this.logCheck(`ROLE_${roleName.toUpperCase()}`, 'PASS', `角色 ${roleName} 存在`);
        } else {
          this.logCheck(`ROLE_${roleName.toUpperCase()}`, 'FAIL', `角色 ${roleName} 不存在`);
        }
      }

      // 检查权限数据
      const permissions = await this.query("SELECT COUNT(*) as count FROM permissions");
      if (permissions[0].count > 0) {
        this.logCheck('PERMISSIONS', 'PASS', `权限数据存在 (${permissions[0].count} 条)`);
      } else {
        this.logCheck('PERMISSIONS', 'FAIL', '权限数据为空');
      }

      // 检查用户角色关联
      const userRoles = await this.query(`
        SELECT ur.*, u.username, r.name as role_name 
        FROM user_roles ur 
        JOIN users u ON ur.user_id = u.id 
        JOIN roles r ON ur.role_id = r.id
        WHERE u.status = 'active'
      `);
      
      if (userRoles.length > 0) {
        this.logCheck('USER_ROLES', 'PASS', `用户角色关联正常 (${userRoles.length} 条)`, {
          sample: userRoles.slice(0, 3).map(ur => ({
            username: ur.username,
            role: ur.role_name
          }))
        });
      } else {
        this.logCheck('USER_ROLES', 'FAIL', '用户角色关联数据为空');
      }

    } catch (error) {
      this.logCheck('USER_PERMISSION_CHECK', 'ERROR', `检查异常: ${error.message}`);
    }
  }

  // 业务数据完整性检查
  async checkBusinessData() {
    console.log('\n🏫 === 业务数据完整性检查 ===');
    
    try {
      // 检查教师数据
      const teachers = await this.query("SELECT COUNT(*) as count FROM teachers WHERE status = 'active'");
      if (teachers[0].count >= 1) {
        this.logCheck('TEACHER_DATA', 'PASS', `活跃教师数据 (${teachers[0].count} 条)`);
      } else {
        this.logCheck('TEACHER_DATA', 'FAIL', '活跃教师数据不足');
      }

      // 检查学生数据
      const students = await this.query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
      if (students[0].count >= 1) {
        this.logCheck('STUDENT_DATA', 'PASS', `活跃学生数据 (${students[0].count} 条)`);
      } else {
        this.logCheck('STUDENT_DATA', 'FAIL', '活跃学生数据不足');
      }

      // 检查班级数据
      const classes = await this.query("SELECT COUNT(*) as count FROM classes WHERE status = 'active'");
      if (classes[0].count >= 1) {
        this.logCheck('CLASS_DATA', 'PASS', `活跃班级数据 (${classes[0].count} 条)`);
      } else {
        this.logCheck('CLASS_DATA', 'FAIL', '活跃班级数据不足');
      }

      // 检查家长数据
      const parents = await this.query("SELECT COUNT(*) as count FROM parents WHERE status = 'active'");
      if (parents[0].count >= 1) {
        this.logCheck('PARENT_DATA', 'PASS', `活跃家长数据 (${parents[0].count} 条)`);
      } else {
        this.logCheck('PARENT_DATA', 'FAIL', '活跃家长数据不足');
      }

      // 检查招生计划
      const enrollmentPlans = await this.query("SELECT COUNT(*) as count FROM enrollment_plans");
      if (enrollmentPlans[0].count >= 1) {
        this.logCheck('ENROLLMENT_PLANS', 'PASS', `招生计划数据 (${enrollmentPlans[0].count} 条)`);
      } else {
        this.logCheck('ENROLLMENT_PLANS', 'FAIL', '招生计划数据为空');
      }

      // 检查活动数据
      const activities = await this.query("SELECT COUNT(*) as count FROM activities");
      if (activities[0].count >= 1) {
        this.logCheck('ACTIVITY_DATA', 'PASS', `活动数据 (${activities[0].count} 条)`);
      } else {
        this.logCheck('ACTIVITY_DATA', 'FAIL', '活动数据为空');
      }

    } catch (error) {
      this.logCheck('BUSINESS_DATA_CHECK', 'ERROR', `检查异常: ${error.message}`);
    }
  }

  // 关联数据完整性检查
  async checkRelationalData() {
    console.log('\n🔗 === 关联数据完整性检查 ===');
    
    try {
      // 检查学生班级关联
      const studentClasses = await this.query(`
        SELECT s.name as student_name, c.name as class_name, s.class_id
        FROM students s 
        LEFT JOIN classes c ON s.class_id = c.id 
        WHERE s.status = 'active' AND s.class_id IS NOT NULL
      `);
      
      const studentsWithoutClass = await this.query(`
        SELECT COUNT(*) as count FROM students 
        WHERE status = 'active' AND (class_id IS NULL OR class_id = 0)
      `);
      
      if (studentsWithoutClass[0].count === 0) {
        this.logCheck('STUDENT_CLASS_RELATION', 'PASS', '所有活跃学生都有班级分配');
      } else {
        this.logCheck('STUDENT_CLASS_RELATION', 'FAIL', 
          `${studentsWithoutClass[0].count} 个学生没有班级分配`);
      }

      // 检查教师班级关联
      const teacherClasses = await this.query(`
        SELECT COUNT(*) as count FROM teacher_classes tc 
        JOIN teachers t ON tc.teacher_id = t.id 
        JOIN classes c ON tc.class_id = c.id
        WHERE t.status = 'active' AND c.status = 'active'
      `);
      
      if (teacherClasses[0].count > 0) {
        this.logCheck('TEACHER_CLASS_RELATION', 'PASS', 
          `教师班级关联正常 (${teacherClasses[0].count} 条)`);
      } else {
        this.logCheck('TEACHER_CLASS_RELATION', 'FAIL', '教师班级关联数据为空');
      }

      // 检查家长学生关联
      const parentStudents = await this.query(`
        SELECT COUNT(*) as count FROM parent_student_relations psr 
        JOIN parents p ON psr.parent_id = p.id 
        JOIN students s ON psr.student_id = s.id
        WHERE p.status = 'active' AND s.status = 'active'
      `);
      
      if (parentStudents[0].count > 0) {
        this.logCheck('PARENT_STUDENT_RELATION', 'PASS', 
          `家长学生关联正常 (${parentStudents[0].count} 条)`);
      } else {
        this.logCheck('PARENT_STUDENT_RELATION', 'FAIL', '家长学生关联数据为空');
      }

    } catch (error) {
      this.logCheck('RELATIONAL_DATA_CHECK', 'ERROR', `检查异常: ${error.message}`);
    }
  }

  // AI功能数据检查
  async checkAIData() {
    console.log('\n🤖 === AI功能数据检查 ===');
    
    try {
      // 检查AI模型配置
      const aiModels = await this.query("SELECT COUNT(*) as count FROM ai_model_configs WHERE status = 'active'");
      if (aiModels[0].count > 0) {
        this.logCheck('AI_MODELS', 'PASS', `AI模型配置 (${aiModels[0].count} 条)`);
      } else {
        this.logCheck('AI_MODELS', 'FAIL', 'AI模型配置为空');
      }

      // 检查AI对话数据
      const conversations = await this.query("SELECT COUNT(*) as count FROM ai_conversations");
      this.logCheck('AI_CONVERSATIONS', 'PASS', `AI对话记录 (${conversations[0].count} 条)`);

      // 检查AI消息数据
      const messages = await this.query("SELECT COUNT(*) as count FROM ai_messages");
      this.logCheck('AI_MESSAGES', 'PASS', `AI消息记录 (${messages[0].count} 条)`);

    } catch (error) {
      this.logCheck('AI_DATA_CHECK', 'ERROR', `检查异常: ${error.message}`);
    }
  }

  // 修复缺失的基础数据
  async fixMissingData() {
    console.log('\n🔧 === 开始修复缺失数据 ===');
    
    try {
      // 修复管理员用户
      await this.fixAdminUser();
      
      // 修复基础角色
      await this.fixBasicRoles();
      
      // 修复权限数据
      await this.fixBasicPermissions();
      
      // 修复用户角色关联
      await this.fixUserRoleRelations();
      
      // 修复基础业务数据
      await this.fixBasicBusinessData();
      
      // 修复AI模型配置
      await this.fixAIModelConfig();
      
    } catch (error) {
      console.error(`修复过程异常: ${error.message}`);
    }
  }

  // 修复管理员用户
  async fixAdminUser() {
    try {
      const adminExists = await this.query(
        "SELECT COUNT(*) as count FROM users WHERE username = 'admin'"
      );
      
      if (adminExists[0].count === 0) {
        const hashedPassword = '$2b$10$YFQNqPjQRJJqWzKJy5xv5OYOgRzZjYJKWGqXQQGzGzqGzqGzqGzqG'; // admin123
        
        await this.query(`
          INSERT INTO users (username, password, real_name, email, phone, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, ['admin', hashedPassword, '系统管理员', 'admin@school.com', '13800138000', 'active']);
        
        this.logFix('ADMIN_USER_CREATE', 'SUCCESS', '创建管理员用户成功');
      } else {
        this.logFix('ADMIN_USER_CREATE', 'SKIP', '管理员用户已存在，跳过创建');
      }
    } catch (error) {
      this.logFix('ADMIN_USER_CREATE', 'FAIL', `创建管理员用户失败: ${error.message}`);
    }
  }

  // 修复基础角色
  async fixBasicRoles() {
    const roles = [
      { name: 'admin', display_name: '系统管理员', description: '拥有所有权限的系统管理员' },
      { name: 'principal', display_name: '园长', description: '园长角色，管理园区事务' },
      { name: 'teacher', display_name: '教师', description: '教师角色，管理班级和学生' },
      { name: 'parent', display_name: '家长', description: '家长角色，查看孩子信息' }
    ];

    for (const role of roles) {
      try {
        const exists = await this.query(
          "SELECT COUNT(*) as count FROM roles WHERE name = ?", [role.name]
        );
        
        if (exists[0].count === 0) {
          await this.query(`
            INSERT INTO roles (name, display_name, description, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
          `, [role.name, role.display_name, role.description]);
          
          this.logFix(`ROLE_CREATE_${role.name.toUpperCase()}`, 'SUCCESS', 
            `创建角色 ${role.display_name} 成功`);
        } else {
          this.logFix(`ROLE_CREATE_${role.name.toUpperCase()}`, 'SKIP', 
            `角色 ${role.display_name} 已存在，跳过创建`);
        }
      } catch (error) {
        this.logFix(`ROLE_CREATE_${role.name.toUpperCase()}`, 'FAIL', 
          `创建角色 ${role.display_name} 失败: ${error.message}`);
      }
    }
  }

  // 修复基础权限
  async fixBasicPermissions() {
    const permissions = [
      { name: 'admin.*', resource: '/admin/*', action: '*', description: '管理员全部权限' },
      { name: 'user.read', resource: '/api/users', action: 'GET', description: '查看用户列表' },
      { name: 'user.write', resource: '/api/users', action: 'POST', description: '创建用户' },
      { name: 'teacher.read', resource: '/api/teachers', action: 'GET', description: '查看教师列表' },
      { name: 'student.read', resource: '/api/students', action: 'GET', description: '查看学生列表' },
      { name: 'dashboard.read', resource: '/api/dashboard', action: 'GET', description: '查看仪表盘' }
    ];

    for (const perm of permissions) {
      try {
        const exists = await this.query(
          "SELECT COUNT(*) as count FROM permissions WHERE name = ?", [perm.name]
        );
        
        if (exists[0].count === 0) {
          await this.query(`
            INSERT INTO permissions (name, resource, action, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
          `, [perm.name, perm.resource, perm.action, perm.description]);
          
          this.logFix(`PERMISSION_CREATE`, 'SUCCESS', `创建权限 ${perm.name} 成功`);
        }
      } catch (error) {
        this.logFix(`PERMISSION_CREATE`, 'FAIL', `创建权限 ${perm.name} 失败: ${error.message}`);
      }
    }
  }

  // 修复用户角色关联
  async fixUserRoleRelations() {
    try {
      // 为管理员用户分配admin角色
      const adminUser = await this.query("SELECT id FROM users WHERE username = 'admin'");
      const adminRole = await this.query("SELECT id FROM roles WHERE name = 'admin'");
      
      if (adminUser.length > 0 && adminRole.length > 0) {
        const relationExists = await this.query(
          "SELECT COUNT(*) as count FROM user_roles WHERE user_id = ? AND role_id = ?",
          [adminUser[0].id, adminRole[0].id]
        );
        
        if (relationExists[0].count === 0) {
          await this.query(
            "INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())",
            [adminUser[0].id, adminRole[0].id]
          );
          
          this.logFix('ADMIN_ROLE_RELATION', 'SUCCESS', '为管理员分配admin角色成功');
        } else {
          this.logFix('ADMIN_ROLE_RELATION', 'SKIP', '管理员已有admin角色，跳过分配');
        }
      }
    } catch (error) {
      this.logFix('ADMIN_ROLE_RELATION', 'FAIL', `分配管理员角色失败: ${error.message}`);
    }
  }

  // 修复基础业务数据
  async fixBasicBusinessData() {
    try {
      // 创建示例班级
      const classExists = await this.query("SELECT COUNT(*) as count FROM classes WHERE status = 'active'");
      if (classExists[0].count === 0) {
        const sampleClasses = [
          { name: '小班A', type: 'small', capacity: 20, age_range: '3-4' },
          { name: '中班B', type: 'medium', capacity: 25, age_range: '4-5' },
          { name: '大班C', type: 'large', capacity: 30, age_range: '5-6' }
        ];
        
        for (const cls of sampleClasses) {
          await this.query(`
            INSERT INTO classes (name, type, capacity, age_range, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
          `, [cls.name, cls.type, cls.capacity, cls.age_range]);
        }
        
        this.logFix('SAMPLE_CLASSES', 'SUCCESS', '创建示例班级成功');
      }

      // 创建示例教师
      const teacherExists = await this.query("SELECT COUNT(*) as count FROM teachers WHERE status = 'active'");
      if (teacherExists[0].count === 0) {
        await this.query(`
          INSERT INTO teachers (name, phone, email, subject, status, hire_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
        `, ['张老师', '13900139001', 'zhang@school.com', '语文']);
        
        this.logFix('SAMPLE_TEACHER', 'SUCCESS', '创建示例教师成功');
      }

      // 创建示例学生
      const studentExists = await this.query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
      if (studentExists[0].count === 0) {
        const firstClass = await this.query("SELECT id FROM classes WHERE status = 'active' LIMIT 1");
        if (firstClass.length > 0) {
          await this.query(`
            INSERT INTO students (name, gender, birth_date, class_id, parent_name, parent_phone, status, enroll_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
          `, ['小明', '男', '2018-03-15', firstClass[0].id, '明爸爸', '13800138001']);
          
          this.logFix('SAMPLE_STUDENT', 'SUCCESS', '创建示例学生成功');
        }
      }

    } catch (error) {
      this.logFix('BASIC_BUSINESS_DATA', 'FAIL', `创建基础业务数据失败: ${error.message}`);
    }
  }

  // 修复AI模型配置
  async fixAIModelConfig() {
    try {
      const modelExists = await this.query("SELECT COUNT(*) as count FROM ai_model_configs WHERE status = 'active'");
      if (modelExists[0].count === 0) {
        await this.query(`
          INSERT INTO ai_model_configs (name, provider, model_id, api_key, status, config, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'active', '{}', NOW(), NOW())
        `, ['默认模型', 'openai', 'gpt-3.5-turbo', 'your-api-key-here']);
        
        this.logFix('AI_MODEL_CONFIG', 'SUCCESS', '创建默认AI模型配置成功');
      }
    } catch (error) {
      this.logFix('AI_MODEL_CONFIG', 'FAIL', `创建AI模型配置失败: ${error.message}`);
    }
  }

  // 生成检查报告
  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    const errors = this.checks.filter(c => c.status === 'ERROR').length;
    const total = this.checks.length;
    
    const fixSucceeded = this.fixes.filter(f => f.status === 'SUCCESS').length;
    const fixFailed = this.fixes.filter(f => f.status === 'FAIL').length;
    const fixSkipped = this.fixes.filter(f => f.status === 'SKIP').length;

    return {
      summary: {
        title: '数据库完整性检查报告',
        database: `${this.config.host}:${this.config.port}/${this.config.database}`,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration / 1000)}秒`,
        checks: {
          total,
          passed,
          failed,
          errors,
          successRate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%'
        },
        fixes: {
          total: this.fixes.length,
          succeeded: fixSucceeded,
          failed: fixFailed,
          skipped: fixSkipped,
          successRate: this.fixes.length > 0 ? ((fixSucceeded / this.fixes.length) * 100).toFixed(2) + '%' : '0%'
        }
      },
      checks: this.checks,
      issues: this.issues,
      fixes: this.fixes,
      recommendations: this.getRecommendations()
    };
  }

  // 获取建议
  getRecommendations() {
    const recommendations = [];
    
    if (this.issues.length === 0) {
      recommendations.push({
        priority: 'INFO',
        category: '数据完整性',
        description: '数据库完整性检查全部通过',
        action: '可以进行API集成测试'
      });
    }
    
    const criticalIssues = this.issues.filter(i => 
      i.check.includes('ADMIN_USER') || 
      i.check.includes('ROLE_') || 
      i.check.includes('USER_ROLES')
    );
    
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: '认证系统',
        description: '认证相关数据缺失，会导致登录失败',
        action: '立即运行数据修复脚本'
      });
    }
    
    const businessIssues = this.issues.filter(i => 
      i.check.includes('TEACHER_DATA') || 
      i.check.includes('STUDENT_DATA') || 
      i.check.includes('CLASS_DATA')
    );
    
    if (businessIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: '业务数据',
        description: '核心业务数据不足，会影响功能测试',
        action: '添加必要的业务基础数据'
      });
    }
    
    return recommendations;
  }

  // 保存报告
  async saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-check-report-${timestamp}.json`;
    
    try {
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      console.log(`\n📄 数据库检查报告已保存: ${filename}`);
      return filename;
    } catch (error) {
      console.error('保存报告失败:', error.message);
      return null;
    }
  }

  // 关闭连接
  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 主执行函数
async function runDatabaseCheck(autoFix = true) {
  console.log('🔍 开始数据库完整性检查...\n');
  
  // 从环境变量或配置文件读取数据库配置
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kindergarten',
    port: process.env.DB_PORT || 3306
  };
  
  const checker = new DatabaseIntegrityChecker(dbConfig);
  
  try {
    // 连接数据库
    if (!(await checker.connect())) {
      console.error('❌ 无法连接数据库，检查结束');
      return null;
    }
    
    // 执行各项检查
    await checker.checkBasicTables();
    await checker.checkUserPermissionData();
    await checker.checkBusinessData();
    await checker.checkRelationalData();
    await checker.checkAIData();
    
    // 如果启用自动修复且发现问题
    if (autoFix && checker.issues.length > 0) {
      console.log(`\n发现 ${checker.issues.length} 个问题，开始自动修复...`);
      await checker.fixMissingData();
    }
    
    // 生成报告
    const report = checker.generateReport();
    
    // 输出摘要
    console.log(`\n🎯 检查完成！`);
    console.log(`检查项目: ${report.summary.checks.total}`);
    console.log(`通过: ${report.summary.checks.passed} (${report.summary.checks.successRate})`);
    console.log(`失败: ${report.summary.checks.failed}`);
    console.log(`异常: ${report.summary.checks.errors}`);
    
    if (report.summary.fixes.total > 0) {
      console.log(`\n修复操作: ${report.summary.fixes.total}`);
      console.log(`成功: ${report.summary.fixes.succeeded}`);
      console.log(`失败: ${report.summary.fixes.failed}`);
      console.log(`跳过: ${report.summary.fixes.skipped}`);
    }
    
    // 保存报告
    await checker.saveReport(report);
    
    // 关闭连接
    await checker.close();
    
    if (report.summary.checks.failed === 0 && report.summary.checks.errors === 0) {
      console.log('\n✅ 数据库完整性检查通过！可以进行API测试！');
    } else {
      console.log('\n⚠️ 数据库存在问题，建议先修复再进行API测试');
    }
    
    return report;
    
  } catch (error) {
    console.error('\n💥 检查过程异常:', error.message);
    await checker.close();
    return null;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const autoFix = process.argv.includes('--auto-fix') || process.argv.includes('-f');
  
  runDatabaseCheck(autoFix).then(report => {
    if (report) {
      process.exit(report.summary.checks.failed + report.summary.checks.errors === 0 ? 0 : 1);
    } else {
      process.exit(1);
    }
  }).catch(error => {
    console.error('数据库检查脚本异常:', error);
    process.exit(1);
  });
}

module.exports = DatabaseIntegrityChecker;