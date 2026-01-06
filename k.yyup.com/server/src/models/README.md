# 模型关联使用文档

## 关于模型关联中的别名问题

在使用Sequelize进行模型关联时，我们需要特别注意别名（alias）的使用。如果在不同的关联中使用了相同的别名，会导致Sequelize抛出错误：

```
AssociationError [SequelizeAssociationError]: You have used the alias XXX in two separate associations. Aliased associations must have unique aliases.
```

## 已知的别名冲突案例

我们在项目中遇到了一个典型的别名冲突问题：

1. 在`Permission`模型的自关联中，我们使用了`parent`作为父权限的别名
2. 同时系统中存在`Parent`模型（家长模型）

当Sequelize尝试解析关联时，会将这两个别名混淆，导致错误。

## 解决方案

我们通过以下方式解决了这个问题：

1. 在`Permission`模型的自关联中，将别名从`parent`改为`parentPermission`
2. 相应地，将子权限的别名从`children`改为`childrenPermissions`

```typescript
// 修改前（会导致冲突）
Permission.belongsTo(Permission, { as: 'parent', foreignKey: 'parentId' });
Permission.hasMany(Permission, { as: 'children', foreignKey: 'parentId' });

// 修改后（避免冲突）
Permission.belongsTo(Permission, { as: 'parentPermission', foreignKey: 'parentId' });
Permission.hasMany(Permission, { as: 'childrenPermissions', foreignKey: 'parentId' });
```

## 别名命名规范

为避免类似问题，请遵循以下命名规范：

1. **避免使用模型名称作为别名**：不要使用与现有模型名称相同或相似的别名
2. **使用描述性名称**：别名应该清晰描述关联的性质和目的
3. **采用驼峰命名法**：多个单词组成的别名使用驼峰命名法，如`headTeacher`
4. **自关联使用明确的前缀/后缀**：如`parentPermission`和`childrenPermissions`

## 别名使用示例

```typescript
// 查询权限及其父权限
const permission = await Permission.findOne({
  where: { id: 1 },
  include: [{ model: Permission, as: 'parentPermission' }]
});

// 查询权限及其子权限
const permission = await Permission.findOne({
  where: { id: 1 },
  include: [{ model: Permission, as: 'childrenPermissions' }]
});
```

## 添加新的关联

当添加新的关联时，请确保：

1. 检查现有别名，避免重复
2. 遵循命名规范
3. 更新模型关联文档
4. 在测试中验证关联是否正常工作

更详细的模型关联别名请参考`别名映射.md`文档。

## 模型开发进度

- [x] 基础模型
  - [x] 用户模型（User）
  - [x] 角色模型（Role）
  - [x] 权限模型（Permission）
  - [x] 用户角色关联模型（UserRole）
  - [x] 角色权限关联模型（RolePermission）

- [x] 幼儿园基础信息模型
  - [x] 幼儿园模型（Kindergarten）
  - [x] 班级模型（Class）
  - [x] 教师模型（Teacher）
  - [x] 学生模型（Student）
  - [x] 家长模型（Parent）
  - [x] 班级教师关联模型（ClassTeacher）

- [x] 招生管理相关模型
  - [x] 招生计划模型（EnrollmentPlan）
  - [x] 招生任务模型（EnrollmentTask）
  - [x] 活动模型（Activity）
  - [x] 活动报名模型（ActivityRegistration）
  - [x] 活动评价模型（ActivityEvaluation）

- [x] 营销组件相关模型
  - [x] 优惠券模型（Coupon）
  - [x] 营销活动模型（MarketingCampaign）
  - [x] 渠道跟踪模型（ChannelTracking）
  - [x] 广告投放模型（Advertisement）
  - [x] 转化跟踪模型（ConversionTracking）

- [ ] 系统功能相关模型
  - [ ] 系统配置模型（SystemConfig）
  - [ ] 操作日志模型（OperationLog）
  - [ ] 消息模板模型（MessageTemplate）
  - [ ] 消息记录模型（MessageRecord）
  - [ ] 文件存储模型（FileStorage）

## 代码质量与类型安全

为确保代码质量和类型安全，我们采用了以下措施：

1. 严格的TypeScript配置：
   - 启用`strict: true`
   - 启用`noImplicitAny: true`
   - 启用`strictNullChecks: true`

2. 清晰的类型定义：
   - 使用接口定义模型属性（如`UserAttributes`）
   - 使用`Optional<T>`处理可选属性
   - 模型类实现接口确保类型完整性

3. 标准化的模型开发模式：
   - 一致的模型结构（属性接口、创建属性接口、模型类、初始化）
   - 统一的关联创建方式（`createAssociation`函数）
   - 按功能模块分组导出模型

这种严格的类型定义和标准化开发模式显著减少了开发过程中的类型错误，提高了代码质量和可维护性。

## 模型关联

模型关联关系集中在`associations.ts`文件中管理，使用`createAssociation`函数创建关联并自动验证别名。所有关联详情可参考`别名映射.md`文件。 