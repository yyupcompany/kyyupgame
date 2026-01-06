import { Request, Response } from 'express';
import { getSequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

/**
 * 数据库元数据控制器
 * 🎯 提供数据库表结构、索引、关联关系的查询API
 * 🔒 仅供AI工具内部调用，需要权限验证
 */
export class DatabaseMetadataController {
  /**
   * 获取所有数据库表列表
   * GET /api/database/tables
   */
  public async getAllTables(req: Request, res: Response): Promise<void> {
    try {
      const sequelize = getSequelize();
      const dbName = sequelize.getDatabaseName();

      console.log('📋 [数据库元数据] 查询所有表');

      // 查询所有表
      const query = `
        SELECT 
          TABLE_NAME as tableName,
          TABLE_COMMENT as tableComment,
          TABLE_ROWS as estimatedRows,
          CREATE_TIME as createTime,
          UPDATE_TIME as updateTime
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = :dbName
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `;

      const tables = await sequelize.query(query, {
        replacements: { dbName },
        type: QueryTypes.SELECT
      });

      console.log(`✅ [数据库元数据] 找到 ${tables.length} 个表`);

      res.json({
        success: true,
        data: {
          database: dbName,
          tableCount: tables.length,
          tables: tables
        },
        message: `成功获取 ${tables.length} 个数据表信息`
      });

    } catch (error) {
      console.error('❌ [数据库元数据] 查询表列表失败:', error);
      res.status(500).json({
        success: false,
        message: '查询数据库表列表失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取单个表的详细结构
   * GET /api/database/tables/:tableName
   */
  public async getTableStructure(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      const sequelize = getSequelize();
      const dbName = sequelize.getDatabaseName();

      console.log(`📋 [数据库元数据] 查询表结构: ${tableName}`);

      // 查询表的列信息
      const columnsQuery = `
        SELECT 
          COLUMN_NAME as columnName,
          DATA_TYPE as dataType,
          COLUMN_TYPE as columnType,
          IS_NULLABLE as isNullable,
          COLUMN_KEY as columnKey,
          COLUMN_DEFAULT as columnDefault,
          EXTRA as extra,
          COLUMN_COMMENT as columnComment,
          ORDINAL_POSITION as position
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = :dbName
          AND TABLE_NAME = :tableName
        ORDER BY ORDINAL_POSITION
      `;

      const columns = await sequelize.query(columnsQuery, {
        replacements: { dbName, tableName },
        type: QueryTypes.SELECT
      });

      if (columns.length === 0) {
        res.status(404).json({
          success: false,
          message: `表 ${tableName} 不存在`
        });
        return;
      }

      // 查询表的基本信息
      const tableInfoQuery = `
        SELECT 
          TABLE_NAME as tableName,
          TABLE_COMMENT as tableComment,
          TABLE_ROWS as estimatedRows,
          AVG_ROW_LENGTH as avgRowLength,
          DATA_LENGTH as dataLength,
          CREATE_TIME as createTime,
          UPDATE_TIME as updateTime
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = :dbName
          AND TABLE_NAME = :tableName
      `;

      const tableInfo = await sequelize.query(tableInfoQuery, {
        replacements: { dbName, tableName },
        type: QueryTypes.SELECT
      });

      console.log(`✅ [数据库元数据] 表 ${tableName} 有 ${columns.length} 个字段`);

      res.json({
        success: true,
        data: {
          table: tableInfo[0],
          columns: columns,
          columnCount: columns.length
        },
        message: `成功获取表 ${tableName} 的结构信息`
      });

    } catch (error) {
      console.error('❌ [数据库元数据] 查询表结构失败:', error);
      res.status(500).json({
        success: false,
        message: '查询表结构失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取表的索引信息
   * GET /api/database/tables/:tableName/indexes
   */
  public async getTableIndexes(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      const sequelize = getSequelize();
      const dbName = sequelize.getDatabaseName();

      console.log(`📋 [数据库元数据] 查询表索引: ${tableName}`);

      // 查询索引信息
      const indexesQuery = `
        SELECT 
          INDEX_NAME as indexName,
          COLUMN_NAME as columnName,
          NON_UNIQUE as nonUnique,
          SEQ_IN_INDEX as seqInIndex,
          INDEX_TYPE as indexType,
          COMMENT as comment
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = :dbName
          AND TABLE_NAME = :tableName
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `;

      const indexes = await sequelize.query(indexesQuery, {
        replacements: { dbName, tableName },
        type: QueryTypes.SELECT
      });

      // 按索引名称分组
      const groupedIndexes: any = {};
      (indexes as any[]).forEach((idx: any) => {
        if (!groupedIndexes[idx.indexName]) {
          groupedIndexes[idx.indexName] = {
            indexName: idx.indexName,
            unique: idx.nonUnique === 0,
            indexType: idx.indexType,
            columns: [],
            comment: idx.comment
          };
        }
        groupedIndexes[idx.indexName].columns.push(idx.columnName);
      });

      const indexList = Object.values(groupedIndexes);

      console.log(`✅ [数据库元数据] 表 ${tableName} 有 ${indexList.length} 个索引`);

      res.json({
        success: true,
        data: {
          tableName,
          indexCount: indexList.length,
          indexes: indexList
        },
        message: `成功获取表 ${tableName} 的索引信息`
      });

    } catch (error) {
      console.error('❌ [数据库元数据] 查询索引失败:', error);
      res.status(500).json({
        success: false,
        message: '查询表索引失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取表的关联关系（外键）
   * GET /api/database/tables/:tableName/relations
   */
  public async getTableRelations(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      const sequelize = getSequelize();
      const dbName = sequelize.getDatabaseName();

      console.log(`📋 [数据库元数据] 查询表关联: ${tableName}`);

      // 查询外键关系
      const relationsQuery = `
        SELECT 
          kcu.CONSTRAINT_NAME as constraintName,
          kcu.COLUMN_NAME as columnName,
          kcu.REFERENCED_TABLE_NAME as referencedTable,
          kcu.REFERENCED_COLUMN_NAME as referencedColumn,
          rc.UPDATE_RULE as updateRule,
          rc.DELETE_RULE as deleteRule
        FROM information_schema.KEY_COLUMN_USAGE kcu
        LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = :dbName
          AND kcu.TABLE_NAME = :tableName
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY kcu.ORDINAL_POSITION
      `;

      const relations = await sequelize.query(relationsQuery, {
        replacements: { dbName, tableName },
        type: QueryTypes.SELECT
      });

      console.log(`✅ [数据库元数据] 表 ${tableName} 有 ${relations.length} 个外键关联`);

      res.json({
        success: true,
        data: {
          tableName,
          relationCount: relations.length,
          relations: relations
        },
        message: `成功获取表 ${tableName} 的关联关系`
      });

    } catch (error) {
      console.error('❌ [数据库元数据] 查询关联关系失败:', error);
      res.status(500).json({
        success: false,
        message: '查询表关联关系失败',
        error: (error as Error).message
      });
    }
  }
}

export default new DatabaseMetadataController();

