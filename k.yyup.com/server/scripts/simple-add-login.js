// 简单的登录页面说明文档添加脚本
console.log('🚀 开始添加登录页面说明文档...');

// 模拟数据库操作
const loginPageData = {
  page_path: '/login',
  page_name: '用户登录',
  page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户登录页面，这是进入系统的安全入口。请使用您的账号和密码登录，系统支持多种用户角色（园长、教师、招生专员等），登录后您将根据权限访问相应的功能模块，开始您的智能招生管理之旅。',
  category: '认证页面',
  importance: 9,
  related_tables: ['users', 'user_sessions', 'login_logs'],
  context_prompt: '用户正在登录页面，准备进入系统。用户可能需要了解登录流程、忘记密码处理、账号权限说明等。请提供友好的登录指导。',
  is_active: true
};

const registerPageData = {
  page_path: '/register',
  page_name: '用户注册',
  page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户注册页面，这是创建新账户的地方。请填写准确的个人信息和联系方式，选择合适的用户角色，我们将为您创建专属账户，让您快速开始使用我们的智能招生管理功能。',
  category: '认证页面',
  importance: 8,
  related_tables: ['users', 'user_profiles', 'registration_logs'],
  context_prompt: '用户正在注册页面，准备创建新账户。用户可能需要了解注册流程、角色权限、信息填写要求等。请提供详细的注册指导。',
  is_active: true
};

console.log('📝 登录页面数据准备完成:');
console.log('  路径:', loginPageData.page_path);
console.log('  名称:', loginPageData.page_name);
console.log('  分类:', loginPageData.category);

console.log('📝 注册页面数据准备完成:');
console.log('  路径:', registerPageData.page_path);
console.log('  名称:', registerPageData.page_name);
console.log('  分类:', registerPageData.category);

console.log('✅ 页面说明文档数据准备完成！');
console.log('💡 请手动将这些数据添加到数据库中，或者运行完整的种子数据脚本。');

// 生成SQL语句
const generateSQL = (data) => {
  return `
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance, 
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '${data.page_path}',
  '${data.page_name}',
  '${data.page_description.replace(/'/g, "\\'")}',
  '${data.category}',
  ${data.importance},
  '${JSON.stringify(data.related_tables)}',
  '${data.context_prompt.replace(/'/g, "\\'")}',
  ${data.is_active ? 1 : 0},
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();
`;
};

console.log('\n📋 SQL语句:');
console.log('-- 登录页面');
console.log(generateSQL(loginPageData));
console.log('-- 注册页面');
console.log(generateSQL(registerPageData));
