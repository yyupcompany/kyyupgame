/*
 * 授权教师角色访问 AI 与 招生中心 所需权限
 * - 为 /api/ai/* 路由添加基础权限代码 '/ai'
 * - 为 AI 助手优化查询添加权限代码 'AI_ASSISTANT_OPTIMIZED_QUERY'
 * - 为招生中心聚合接口添加查看类权限：
 *   'enrollment:overview:view','enrollment:plans:view','enrollment:applications:view','enrollment:consultations:view'
 *
 * 通过调用本地后端 HTTP API 完成（必须已启动 server，端口3000）。
 */

const BASE_URL = 'http://localhost:3000/api';

async function main() {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  const requiredPermissions = [
    { code: '/ai', name: 'AI中心访问', type: 'menu', path: '/api/ai' },
    { code: 'AI_ASSISTANT_OPTIMIZED_QUERY', name: 'AI助手优化查询', type: 'button', path: '/api/ai-assistant-optimized/query' },
    { code: 'enrollment:overview:view', name: '招生中心-概览查看', type: 'button', path: '/api/enrollment-center/overview' },
    { code: 'enrollment:plans:view', name: '招生中心-计划查看', type: 'button', path: '/api/enrollment-center/plans' },
    { code: 'enrollment:applications:view', name: '招生中心-申请查看', type: 'button', path: '/api/enrollment-center/applications' },
    { code: 'enrollment:consultations:view', name: '招生中心-咨询查看', type: 'button', path: '/api/enrollment-center/consultations' },
  ];

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    return { ok: res.ok, status: res.status, data };
  };

  // 1) 登录管理员
  console.log('🔐 登录管理员...');
  const loginResp = await fetchJson(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username: adminUser, password: adminPass })
  });
  if (!loginResp.ok || !loginResp.data?.success) {
    throw new Error(`管理员登录失败: ${loginResp.status} ${JSON.stringify(loginResp.data)}`);
  }
  const token = loginResp.data?.data?.token || loginResp.data?.token;
  if (!token) throw new Error('未获取到token');
  const authHeader = { Authorization: `Bearer ${token}` };
  console.log('✅ 登录成功');

  // 2) 获取角色列表，定位 teacher 角色
  console.log('📋 获取角色列表...');
  const rolesResp = await fetchJson(`${BASE_URL}/roles?page=1&pageSize=100&search=teacher`, { headers: authHeader });
  if (!rolesResp.ok) throw new Error(`获取角色列表失败: ${rolesResp.status}`);
  const rolesItems = rolesResp.data?.data?.items || rolesResp.data?.items || rolesResp.data?.data || [];
  const teacherRole = (rolesItems || []).find(r => String(r.code || '').toLowerCase() === 'teacher' || String(r.name || '').toLowerCase() === 'teacher' || String(r.code || '').toLowerCase() === 'teac' );
  if (!teacherRole) {
    console.log('❌ 未找到teacher角色，尝试不带搜索获取全部...');
    const allRolesResp = await fetchJson(`${BASE_URL}/roles?page=1&pageSize=200`, { headers: authHeader });
    const allItems = allRolesResp.data?.data?.items || allRolesResp.data?.items || [];
    const t = allItems.find(r => String(r.code || '').toLowerCase() === 'teacher' || String(r.name || '').toLowerCase() === 'teacher');
    if (!t) throw new Error('未找到Teacher角色');
    teacherRole = t;
  }
  console.log(`✅ Teacher角色：id=${teacherRole.id}, code=${teacherRole.code}`);

  // 3) 拉取现有权限列表（分页大一些，一次拿全）
  console.log('📥 获取现有权限列表...');
  const permsResp = await fetchJson(`${BASE_URL}/system/permissions?page=1&pageSize=1000`, { headers: authHeader });
  if (!permsResp.ok) throw new Error(`获取权限列表失败: ${permsResp.status}`);
  const existingPerms = permsResp.data?.data?.items || permsResp.data?.items || [];
  const byCode = new Map(existingPerms.map(p => [p.code, p]));

  // 4) 如缺则创建权限
  const ensuredCodes = new Set();
  for (const p of requiredPermissions) {
    if (byCode.has(p.code)) {
      ensuredCodes.add(p.code);
      continue;
    }
    console.log(`➕ 创建权限: ${p.code}`);
    const createResp = await fetchJson(`${BASE_URL}/system/permissions`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        code: p.code,
        name: p.name,
        type: p.type || 'button',
        path: p.path || '/',
        component: p.component || null,
        icon: p.icon || null,
        sort: p.sort || 0,
      })
    });
    if (!createResp.ok || !createResp.data?.success) {
      // 如果已存在，忽略；否则抛错
      const msg = (createResp.data && (createResp.data.message || createResp.data.error)) || '';
      if (!msg.includes('已存在')) {
        throw new Error(`创建权限失败: ${p.code} -> ${JSON.stringify(createResp.data)}`);
      }
    }
    ensuredCodes.add(p.code);
  }

  // 5) 重新获取权限列表，拿到ID映射
  const permsResp2 = await fetchJson(`${BASE_URL}/system/permissions?page=1&pageSize=2000`, { headers: authHeader });
  const allPerms = permsResp2.data?.data?.items || permsResp2.data?.items || [];
  const idByCode = new Map(allPerms.map(p => [p.code, p.id]));

  const ensureIds = Array.from(ensuredCodes).map(c => idByCode.get(c)).filter(Boolean);
  if (ensureIds.length === 0) throw new Error('未解析到新权限ID');

  // 6) 获取Teacher当前页面权限（ID 列表）
  const rolePagesResp = await fetchJson(`${BASE_URL}/system/permissions/role/${teacherRole.id}`, { headers: authHeader });
  if (!rolePagesResp.ok) throw new Error(`获取角色权限失败: ${rolePagesResp.status}`);
  const currentPages = rolePagesResp.data?.data?.pages || rolePagesResp.data?.pages || [];
  const currentIds = new Set(currentPages.map(p => p.id));

  // 7) 合并ID并提交更新
  const finalIds = new Set([...currentIds, ...ensureIds]);
  const union = Array.from(finalIds);

  console.log('🛠️ 更新Teacher角色权限映射...');
  let updateOk = false;
  // 首选：系统权限控制器（整体覆盖式更新）
  try {
    const updateResp = await fetchJson(`${BASE_URL}/system/permissions/role/${teacherRole.id}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ permissionIds: union })
    });
    updateOk = !!(updateResp.ok && updateResp.data?.success);
    if (!updateOk) {
      console.warn('⚠️ /system/permissions/role/:id 更新失败，尝试使用 /role-permission 追加方式...');
    }
  } catch (e) {
    console.warn('⚠️ /system/permissions/role/:id 请求异常，尝试使用 /role-permission 追加方式...');
  }

  if (!updateOk) {
    // 备选：角色-权限追加接口（不会移除旧权限，仅追加缺失项）
    const assignResp = await fetchJson(`${BASE_URL}/role-permissions/roles/${teacherRole.id}/permissions`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ roleId: teacherRole.id, permissionIds: ensureIds, isInherit: 1 })
    });
    if (!assignResp.ok || !assignResp.data?.success) {
      throw new Error(`使用追加接口分配权限失败: ${JSON.stringify(assignResp.data)}`);
    }
  }

  console.log('✅ 完成：Teacher已具备AI与招生中心访问权限');
  console.log('   赋予的权限代码:', Array.from(ensuredCodes));
}

main().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});

