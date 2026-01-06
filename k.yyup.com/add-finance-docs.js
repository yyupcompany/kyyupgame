import mysql from 'mysql2/promise';

async function addFinanceDocumentation() {
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });
    
    console.log('📊 正在添加财务中心AI助手说明文档...');
    
    // 财务中心说明文档
    const financeDocumentation = [
      {
        category: 'finance_center',
        title: '财务中心概览',
        content: `# 财务中心功能说明

## 页面概述
财务中心是幼儿园财务管理的核心页面，提供全面的财务管理功能。

## 主要功能模块

### 1. 概览标签页
- 总收入: 显示幼儿园总体收入情况
- 收费率: 展示学费缴费完成率
- 待收金额: 显示未收取的费用总额
- 逾期金额: 显示已逾期未缴费的金额

### 2. 收费管理标签页
- 快速收费: 快速为学生收费
- 新增收费: 创建新的收费项目
- 费用查询: 查看和管理学生缴费记录
- 收费状态管理: 跟踪缴费进度

### 3. 报表分析标签页
- 生成报表: 创建各类财务报表
- 导出报表: 将报表导出为Excel或PDF格式
- 报表类型: 支持收入报表、缴费统计、逾期分析等
- 统计周期: 可按日、周、月、年生成报表

### 4. 设置标签页
- 收费标准设置: 配置不同年级的收费标准
- 缴费周期设置: 设置缴费周期和提醒时间
- 财务参数配置: 其他财务相关参数设置

## AI助手可以协助的任务
1. 解释财务数据和指标含义
2. 帮助生成和分析财务报表
3. 提供收费管理最佳实践建议
4. 协助设置合理的收费标准
5. 分析缴费趋势和预测
6. 协助处理逾期费用问题`,
        metadata: JSON.stringify({
          page_url: '/centers/finance',
          functions: ['总收入统计', '收费管理', '报表生成', '财务设置'],
          user_roles: ['管理员', '园长', '财务人员'],
          data_sources: ['学生缴费记录', '收费标准', '财务报表'],
          keywords: ['财务', '收费', '缴费', '报表', '收入', '逾期']
        })
      },
      {
        category: 'finance_operations',
        title: '财务操作指南',
        content: `# 财务操作指南

## 常见操作流程

### 新增收费项目
1. 进入"收费管理"标签页
2. 点击"新增收费"按钮
3. 填写收费项目信息（费用名称、金额、适用对象等）
4. 设置缴费截止日期
5. 保存并发布收费通知

### 快速收费
1. 选择学生或班级
2. 选择收费项目
3. 确认收费金额
4. 选择收费方式（现金/转账/在线支付）
5. 确认收费并打印收据

### 生成财务报表
1. 进入"报表分析"标签页
2. 选择报表类型（收入报表/缴费统计/逾期分析）
3. 设置统计周期（开始日期和结束日期）
4. 选择筛选条件（班级、年级、收费项目等）
5. 点击"生成报表"
6. 可选择"导出报表"保存为文件

### 处理逾期费用
1. 在概览页面查看"逾期金额"统计
2. 进入"收费管理"查看逾期明细
3. 联系家长催缴费用
4. 记录催缴情况
5. 更新缴费状态

## 注意事项
- 所有财务操作都会有日志记录
- 重要财务数据建议定期备份
- 涉及退费需要审批流程
- 报表数据请妥善保管`,
        metadata: JSON.stringify({
          operation_types: ['收费', '退费', '报表生成', '数据导出'],
          approval_required: ['退费', '费用减免', '大额收费'],
          backup_frequency: '每日',
          security_level: '高'
        })
      },
      {
        category: 'finance_reports',
        title: '财务报表说明',
        content: `# 财务报表类型和说明

## 报表类型

### 1. 收入报表
- 内容: 显示指定时间段内的总收入情况
- 维度: 按时间、班级、收费项目分组统计
- 用途: 了解幼儿园收入趋势，制定财务规划

### 2. 缴费统计报表
- 内容: 统计学生缴费完成情况
- 维度: 按班级、学生、缴费状态统计
- 用途: 跟踪缴费进度，识别未缴费学生

### 3. 逾期分析报表
- 内容: 分析逾期费用的分布和趋势
- 维度: 按逾期时长、金额、班级统计
- 用途: 制定催缴策略，降低坏账风险

### 4. 费用明细报表
- 内容: 详细记录每笔收费的具体信息
- 维度: 按学生、时间、收费项目展示明细
- 用途: 财务审计，问题追溯

## 报表使用建议
- 每月生成收入报表进行财务分析
- 每周检查缴费统计，及时跟进未缴费情况
- 每季度分析逾期情况，优化收费策略
- 年度报表用于财务总结和规划制定`,
        metadata: JSON.stringify({
          report_types: ['收入报表', '缴费统计', '逾期分析', '费用明细'],
          export_formats: ['Excel', 'PDF', 'CSV'],
          update_frequency: '实时',
          retention_period: '5年'
        })
      },
      {
        category: 'finance_data_structure',
        title: '财务数据结构说明',
        content: `# 财务数据结构说明

## 统计卡片数据
财务中心页面包含4个主要统计指标：

### 总收入
- 统计范围: 所有已确认收费记录的总和
- 计算方式: SUM(收费金额) WHERE 状态='已收费'
- 更新频率: 实时更新
- 显示格式: 金额（元）

### 收费率
- 计算方式: (已收费学生数 / 总学生数) × 100%
- 统计周期: 当前学期
- 显示格式: 百分比
- 说明: 反映整体缴费完成情况

### 待收金额
- 统计范围: 所有未收费记录的金额总和
- 计算方式: SUM(应收金额) WHERE 状态='未收费'
- 包含内容: 学费、伙食费、活动费等
- 显示格式: 金额（元）

### 逾期金额
- 统计范围: 超过缴费截止日期仍未缴费的金额
- 计算方式: SUM(应收金额) WHERE 状态='未收费' AND 截止日期 < 当前日期
- 风险等级: 根据逾期时长标记颜色
- 显示格式: 金额（元）

## 功能标签页结构
1. 概览 - 财务数据总览和关键指标
2. 收费管理 - 日常收费操作和记录管理
3. 报表分析 - 各类财务报表生成和分析
4. 设置 - 收费标准和系统参数配置`,
        metadata: JSON.stringify({
          metrics: ['总收入', '收费率', '待收金额', '逾期金额'],
          tabs: ['概览', '收费管理', '报表分析', '设置'],
          data_tables: ['payment_records', 'fee_standards', 'student_fees'],
          calculation_rules: ['实时统计', '按学期计算', '逾期判定规则']
        })
      }
    ];
    
    // 插入文档到数据库
    for (const doc of financeDocumentation) {
      const query = `
        INSERT INTO ai_knowledge_base (category, title, content, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        content = VALUES(content),
        metadata = VALUES(metadata),
        updated_at = NOW()
      `;
      
      await connection.execute(query, [
        doc.category,
        doc.title,
        doc.content,
        doc.metadata
      ]);
      
      console.log(`✅ 已添加文档: ${doc.title}`);
    }
    
    // 查询确认
    const [rows] = await connection.execute(
      "SELECT id, category, title FROM ai_knowledge_base WHERE category LIKE 'finance%' ORDER BY created_at DESC"
    );
    
    console.log('\n📋 财务中心相关文档列表:');
    rows.forEach((row, index) => {
      console.log(`  ${index + 1}. [${row.category}] ${row.title} (ID: ${row.id})`);
    });
    
    await connection.end();
    console.log('\n🎉 财务中心AI助手说明文档添加完成！');
    
  } catch (error) {
    console.error('❌ 添加文档失败:', error.message);
    throw error;
  }
}

addFinanceDocumentation();