import { ROLE_TABLE_PERMISSIONS, getTablePermission, checkTablePermission } from '../config/role-table-permissions';

// 数据库表结构元信息 - 用于智能SQL生成
// 🔒 安全说明：此文件已废弃，请使用 role-table-permissions.ts 中的严格权限配置
export const DATABASE_SCHEMA = {
  // 根据用户角色提供相关表结构
  admin: {
    tables: {
      activities: {
        description: '活动表',
        fields: {
          id: 'int - 活动ID',
          title: 'varchar - 活动标题',
          type: 'tinyint - 活动类型(1:教育 2:娱乐 3:文体 4:社交 5:节日 6:科学)',
          description: 'text - 活动描述',
          start_time: 'datetime - 开始时间',
          end_time: 'datetime - 结束时间',
          location: 'varchar - 活动地点',
          max_participants: 'int - 最大参与人数',
          current_participants: 'int - 当前报名人数',
          fee: 'decimal - 活动费用',
          status: 'enum("draft","published","ongoing","completed","cancelled") - 活动状态',
          satisfaction_score: 'decimal - 满意度评分(1-5)',
          budget: 'decimal - 活动预算',
          user_id: 'int - 创建者ID',
          created_at: 'timestamp - 创建时间',
          updated_at: 'timestamp - 更新时间'
        },
        relationships: [
          'activity_registrations - 通过activity_id关联',
          'activity_evaluations - 通过activity_id关联',
          'users - 通过user_id关联创建者'
        ]
      },
      
      activity_registrations: {
        description: '活动报名表',
        fields: {
          id: 'int - 报名ID',
          activity_id: 'int - 活动ID',
          user_id: 'int - 用户ID',
          student_id: 'int - 学生ID',
          status: 'enum("pending","confirmed","cancelled") - 报名状态',
          registration_time: 'timestamp - 报名时间',
          payment_status: 'enum("unpaid","paid","refunded") - 支付状态',
          notes: 'text - 备注信息'
        }
      },
      
      students: {
        description: '学生信息表',
        fields: {
          id: 'int - 学生ID',
          name: 'varchar - 学生姓名',
          gender: 'enum("male","female") - 性别',
          birth_date: 'date - 出生日期',
          enrollment_date: 'date - 入学日期',
          class_id: 'int - 班级ID',
          parent_id: 'int - 家长ID',
          status: 'enum("active","inactive","graduated") - 学籍状态',
          health_info: 'text - 健康信息',
          special_needs: 'text - 特殊需求',
          created_at: 'timestamp - 创建时间'
        }
      },
      
      classes: {
        description: '班级信息表',
        fields: {
          id: 'int - 班级ID',
          name: 'varchar - 班级名称',
          grade_level: 'varchar - 年级水平',
          teacher_id: 'int - 主班教师ID',
          max_students: 'int - 最大学生数',
          current_students: 'int - 当前学生数',
          classroom: 'varchar - 教室位置',
          status: 'enum("active","inactive") - 班级状态',
          created_at: 'timestamp - 创建时间'
        }
      },
      
      teachers: {
        description: '教师信息表',
        fields: {
          id: 'int - 教师ID',
          user_id: 'int - 用户ID',
          name: 'varchar - 教师姓名',
          qualification: 'varchar - 资格证书',
          experience_years: 'int - 工作年限',
          specialty: 'varchar - 专业特长',
          phone: 'varchar - 联系电话',
          email: 'varchar - 邮箱',
          hire_date: 'date - 入职日期',
          status: 'enum("active","inactive","on_leave") - 工作状态'
        }
      },
      
      enrollment_applications: {
        description: '招生申请表',
        fields: {
          id: 'int - 申请ID',
          student_name: 'varchar - 学生姓名',
          student_birth_date: 'date - 学生出生日期',
          parent_name: 'varchar - 家长姓名',
          parent_phone: 'varchar - 家长电话',
          parent_email: 'varchar - 家长邮箱',
          preferred_class: 'varchar - 希望班级',
          application_date: 'timestamp - 申请时间',
          status: 'enum("submitted","reviewed","interviewed","accepted","rejected") - 申请状态',
          interview_date: 'datetime - 面试时间',
          notes: 'text - 备注信息'
        }
      },
      
      marketing_campaigns: {
        description: '营销活动表',
        fields: {
          id: 'int - 营销活动ID',
          name: 'varchar - 活动名称',
          type: 'varchar - 活动类型',
          start_date: 'date - 开始日期',
          end_date: 'date - 结束日期',
          budget: 'decimal - 预算',
          target_audience: 'varchar - 目标受众',
          channels: 'json - 推广渠道',
          status: 'enum("planning","active","paused","completed") - 状态',
          reach: 'int - 触达人数',
          conversions: 'int - 转化数量',
          cost_per_conversion: 'decimal - 单次转化成本'
        }
      }
    }
  },
  
  teacher: {
    tables: {
      // 教师角色主要关注学生、班级、活动相关表
      students: 'admin.tables.students',
      classes: 'admin.tables.classes', 
      activities: 'admin.tables.activities',
      activity_registrations: 'admin.tables.activity_registrations',
      activity_evaluations: {
        description: '活动评估表',
        fields: {
          id: 'int - 评估ID',
          activity_id: 'int - 活动ID',
          student_id: 'int - 学生ID',
          evaluation_score: 'decimal - 评估分数',
          teacher_comments: 'text - 教师评语',
          skills_assessment: 'json - 技能评估',
          improvement_areas: 'text - 改进建议',
          created_at: 'timestamp - 评估时间'
        }
      }
    }
  },
  
  parent: {
    tables: {
      // 家长角色主要关注自己孩子相关的数据
      students: {
        description: '学生信息（限制为自己的孩子）',
        fields: 'admin.tables.students.fields',
        restrictions: 'WHERE parent_id = {current_user_parent_id}'
      },
      activities: 'admin.tables.activities',
      activity_registrations: {
        description: '活动报名（限制为自己孩子的报名）',
        fields: 'admin.tables.activity_registrations.fields',
        restrictions: 'WHERE user_id = {current_user_id}'
      }
    }
  }
};

// 根据用户角色获取相关的数据库schema
// 🔒 使用严格的权限配置
export function getDatabaseSchemaForRole(userRole: string): any {
  const role = userRole.toLowerCase();
  let rolePermissions = ROLE_TABLE_PERMISSIONS[role];

  if (!rolePermissions) {
    console.warn(`[Schema] 未知角色: ${userRole}，返回空schema`);
    return { tables: {} };
  }

  // 🔄 admin角色使用principal的配置
  if (role === 'admin' && rolePermissions.allowedTables.length === 0) {
    rolePermissions = ROLE_TABLE_PERMISSIONS['principal'];
    console.log(`[Schema] admin角色使用principal配置`);
  }

  // 🔒 只返回角色明确允许的表
  const tables: any = {};

  for (const tablePermission of rolePermissions.allowedTables) {
    tables[tablePermission.tableName] = {
      description: tablePermission.description,
      allowedFields: tablePermission.allowedFields,
      requiredConditions: tablePermission.requiredConditions || [],
      forbiddenFields: tablePermission.forbiddenFields || []
    };
  }

  return {
    roleName: rolePermissions.roleName,
    description: rolePermissions.description,
    tables: tables,
    forbiddenTables: rolePermissions.forbiddenTables
  };
}

// 生成schema描述文本，用于发送给AI模型
// 🔒 使用严格的权限配置生成schema描述
export function generateSchemaDescription(userRole: string): string {
  const schema = getDatabaseSchemaForRole(userRole);

  let description = `🔒 数据库表结构信息 (用户角色: ${userRole})\n`;
  description += `角色描述: ${schema.description}\n\n`;

  // 🔒 明确列出允许访问的表
  description += `✅ 允许访问的表:\n`;

  for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
    const table = tableInfo as any;

    description += `\n表名: ${tableName}\n`;
    description += `描述: ${table.description}\n`;

    // 🔒 只列出允许查询的字段
    if (table.allowedFields && table.allowedFields.length > 0) {
      description += `允许查询的字段: ${table.allowedFields.join(', ')}\n`;
    }

    // 🔒 列出禁止查询的字段
    if (table.forbiddenFields && table.forbiddenFields.length > 0) {
      description += `❌ 禁止查询的字段: ${table.forbiddenFields.join(', ')}\n`;
    }

    // 🔒 列出必须添加的WHERE条件
    if (table.requiredConditions && table.requiredConditions.length > 0) {
      description += `🔒 必须添加的WHERE条件:\n`;
      table.requiredConditions.forEach((condition: string) => {
        description += `  - ${condition}\n`;
      });
    }
  }

  // 🔒 明确列出禁止访问的表
  if (schema.forbiddenTables && schema.forbiddenTables.length > 0) {
    description += `\n❌ 禁止访问的表:\n`;
    schema.forbiddenTables.forEach((tableName: string) => {
      description += `  - ${tableName}\n`;
    });
  }

  description += `
🔒 严格的查询要求:
1. ✅ 只能生成SELECT查询语句
2. ✅ 只能查询上述"允许访问的表"中列出的表
3. ✅ 只能查询"允许查询的字段"中列出的字段
4. ❌ 绝对禁止查询"禁止查询的字段"
5. ❌ 绝对禁止查询"禁止访问的表"
6. 🔒 必须添加所有"必须添加的WHERE条件"
7. ✅ 添加LIMIT限制返回结果数量（最多100条）
8. ✅ 使用合适的JOIN操作获取关联数据
9. ✅ 添加合理的WHERE条件和排序
10. ✅ 包含必要的聚合计算(COUNT, AVG, SUM等)

⚠️  安全警告:
- 任何违反上述权限规则的SQL查询都将被拒绝执行
- 不要尝试访问未授权的表或字段
- 必须严格遵守角色的数据访问范围
`;

  return description;
}