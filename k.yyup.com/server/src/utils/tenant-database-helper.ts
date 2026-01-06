/**
 * 租户数据库辅助工具
 * 
 * 提供多租户共享连接池模式下的数据库操作辅助函数
 * 
 * @module utils/tenant-database-helper
 */


/**
 * 从请求中获取租户数据库名称
 * 
 * @param req Express请求对象
 * @returns 租户数据库名称（如 tenant_k001），默认返回 'kindergarten'
 */
export function getTenantDatabaseName(req): string {
  return (req as any).tenant?.databaseName || 'kindergarten';
}

/**
 * 从请求中获取租户代码
 * 
 * @param req Express请求对象
 * @returns 租户代码（如 k001），默认返回 undefined
 */
export function getTenantCode(req: Request): string | undefined {
  return (req as any).tenant?.code;
}

/**
 * 获取完整的表名（包含数据库名称前缀）
 * 
 * @param req Express请求对象
 * @param tableName 表名
 * @returns 完整表名（如 tenant_k001.users）
 */
export function getFullTableName(req: Request, tableName: string): string {
  const databaseName = getTenantDatabaseName(req);
  return `${databaseName}.${tableName}`;
}

/**
 * 构建带租户数据库前缀的SQL查询
 * 
 * @param req Express请求对象
 * @param sql SQL查询模板，使用 {db} 作为数据库名称占位符
 * @returns 替换后的SQL查询
 * 
 * @example
 * const sql = buildTenantQuery(req, 'SELECT * FROM {db}.users WHERE id = ?');
 * // 返回: 'SELECT * FROM tenant_k001.users WHERE id = ?'
 */
export function buildTenantQuery(req: Request, sql: string): string {
  const databaseName = getTenantDatabaseName(req);
  return sql.replace(/\{db\}/g, databaseName);
}

/**
 * 检查请求是否有有效的租户信息
 * 
 * @param req Express请求对象
 * @returns 是否有有效的租户信息
 */
export function hasTenantInfo(req: Request): boolean {
  return !!(req as any).tenant?.code && !!(req as any).tenant?.databaseName;
}

/**
 * 获取租户信息对象
 * 
 * @param req Express请求对象
 * @returns 租户信息对象
 */
export function getTenantInfo(req: Request): {
  code: string | undefined;
  databaseName: string;
  hasTenant: boolean;
} {
  return {
    code: getTenantCode(req),
    databaseName: getTenantDatabaseName(req),
    hasTenant: hasTenantInfo(req)
  };
}

export default {
  getTenantDatabaseName,
  getTenantCode,
  getFullTableName,
  buildTenantQuery,
  hasTenantInfo,
  getTenantInfo
};

