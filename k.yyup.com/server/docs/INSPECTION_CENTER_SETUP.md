# 检查中心基础信息扩展 - 安装指南

## 📋 概述

本次更新为检查中心功能扩展了幼儿园基础信息表，新增47个字段，用于支持文档模板的自动填充和智能分析功能。

## 🎯 更新内容

### 1. 数据库扩展

**新增字段**: 47个
**分类**:
- 证照信息（6个）
- 办园条件（4个）
- 设施设备（5个）
- 人员配置（9个）
- 财务信息（6个）
- 安全管理（5个）
- 行政信息（4个）
- 其他信息（6个）
- 完善度标记（2个）

### 2. 新增服务

- **KindergartenCompletenessService**: 信息完整度计算服务
- **KindergartenCompletenessController**: 完整度API控制器

### 3. 新增API

```
GET  /api/kindergarten/completeness          - 获取信息完整度
GET  /api/kindergarten/missing-fields        - 获取缺失字段列表
PUT  /api/kindergarten/base-info/batch       - 批量更新基础信息
POST /api/kindergarten/calculate-completeness - 计算完整度
GET  /api/kindergarten/field-config          - 获取字段配置
```

## 🚀 安装步骤

### 方式1: 使用安装脚本（推荐）

```bash
cd server
chmod +x scripts/setup-inspection-center.sh
bash scripts/setup-inspection-center.sh
```

### 方式2: 手动安装

#### 步骤1: 安装依赖

```bash
cd server
npm install
```

#### 步骤2: 编译TypeScript

```bash
npm run build
```

#### 步骤3: 运行数据库迁移

```bash
npx sequelize-cli db:migrate
```

#### 步骤4: 验证迁移

```bash
# 登录MySQL
mysql -u root -p

# 切换数据库
USE kindergarten_management;

# 查看表结构
DESCRIBE kindergartens;

# 检查新字段
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'kindergartens' 
AND COLUMN_NAME IN ('license_number', 'info_completeness');
```

## 📊 验证安装

### 1. 启动服务器

```bash
npm run dev
```

### 2. 测试API

```bash
# 获取信息完整度
curl -X GET http://localhost:3000/api/kindergarten/completeness \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取缺失字段
curl -X GET http://localhost:3000/api/kindergarten/missing-fields \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取字段配置
curl -X GET http://localhost:3000/api/kindergarten/field-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 预期响应

**获取信息完整度**:
```json
{
  "success": true,
  "data": {
    "score": 45,
    "level": "incomplete",
    "levelDescription": "信息不完整",
    "missingRequired": ["licenseNumber", "licenseIssueDate", ...],
    "missingRequiredLabels": ["办学许可证号", "许可证发证日期", ...],
    "canUseAdvancedFeatures": false,
    "message": "请完善3个必填字段后使用高级功能。"
  }
}
```

## 🔧 配置说明

### 字段优先级

#### 必填字段（15个）- 60分
解锁高级功能的前提条件：
- 基础信息：name, type, level, address, phone, principal, establishedDate
- 证照信息：licenseNumber, licenseIssueDate, licenseExpiryDate
- 规模信息：area, buildingArea, classCount, teacherCount, studentCount
- 人员配置：principalQualification, qualifiedTeacherCount
- 行政信息：cityLevel, educationBureau

#### 推荐字段（10个）- 30分
提升服务质量：
- outdoorArea, classroomCount, activityRoomCount
- tuitionFee, mealFee
- fireControlCertified, foodLicenseNumber
- supervisorName, supervisorPhone
- currentGrade

#### 可选字段（22个）- 10分
完善信息

### 完整度等级

| 分数 | 等级 | 说明 | 可用功能 |
|------|------|------|---------|
| 0-49 | incomplete | 信息不完整 | 仅基础功能 |
| 50-69 | basic | 基础信息完整 | 基础+部分自动填充 |
| 70-89 | good | 信息较完整 | 标准服务 |
| 90-100 | excellent | 信息完整 | 全部高级服务 |

## 📝 使用示例

### 批量更新基础信息

```typescript
// 前端代码示例
const updateBaseInfo = async () => {
  const response = await fetch('/api/kindergarten/base-info/batch', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      licenseNumber: '京教许字[2020]001号',
      licenseIssueDate: '2020-01-01',
      licenseExpiryDate: '2025-12-31',
      principalQualification: '园长证123456',
      cityLevel: 'tier1',
      educationBureau: '北京市朝阳区教育局'
    })
  });
  
  const data = await response.json();
  console.log('更新结果:', data);
};
```

### 检查完整度

```typescript
const checkCompleteness = async () => {
  const response = await fetch('/api/kindergarten/completeness', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!data.data.canUseAdvancedFeatures) {
    alert(`请完善以下必填字段：${data.data.missingRequiredLabels.join('、')}`);
  }
};
```

## 🐛 故障排除

### 问题1: 迁移失败

**错误**: `ERROR: Table 'kindergartens' doesn't exist`

**解决**:
```bash
# 检查数据库连接
mysql -u root -p -e "SHOW DATABASES;"

# 确认数据库存在
mysql -u root -p -e "USE kindergarten_management; SHOW TABLES;"

# 如果表不存在，运行所有迁移
npx sequelize-cli db:migrate
```

### 问题2: 字段已存在

**错误**: `ERROR: Duplicate column name 'license_number'`

**解决**:
```bash
# 回滚迁移
npx sequelize-cli db:migrate:undo

# 重新运行
npx sequelize-cli db:migrate
```

### 问题3: API返回401

**错误**: `Unauthorized`

**解决**:
- 检查JWT Token是否有效
- 确认用户已登录
- 检查authMiddleware配置

### 问题4: 完整度计算不准确

**解决**:
```bash
# 手动触发重新计算
curl -X POST http://localhost:3000/api/kindergarten/calculate-completeness \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 相关文档

- [系统集成方案](../../docs/检查中心文档模板库/系统集成方案.md)
- [基础信息完善方案](../../docs/检查中心文档模板库/基础信息完善方案.md)
- [完整开发计划V2](../../docs/检查中心文档模板库/完整开发计划-V2.md)

## 🔄 回滚

如需回滚此次更新：

```bash
# 回滚数据库迁移
npx sequelize-cli db:migrate:undo

# 确认回滚成功
mysql -u root -p -e "
USE kindergarten_management;
DESCRIBE kindergartens;
" | grep license_number

# 如果没有输出，说明回滚成功
```

## ✅ 下一步

1. 启动服务器测试API
2. 开发前端界面（Week 0.3）
3. 继续阶段1开发（Week 1-2）

---

**版本**: v1.0  
**创建日期**: 2025-10-09  
**状态**: ✅ 已完成

