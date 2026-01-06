/**
 * 客户池中心聚合API控制器
 * 提供客户池中心首页所需的所有数据，减少并发API请求提升性能
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';
import { logger } from '../../utils/logger';

export class CustomerPoolCenterController {
  /**
   * 客户池中心仪表板聚合API
   * 一次请求获取客户池中心首页所有数据
   */
  static async getDashboard(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;
      
      console.log('🏊 获取客户池中心仪表板数据', { userId, userRole });

      // 并行执行所有数据查询
      const [
        poolStatistics,
        customerPools,
        recentCustomers,
        conversionAnalysis,
        channelAnalysis
      ] = await Promise.all([
        // 1. 客户池统计数据
        CustomerPoolCenterController.getPoolStatistics(),
        
        // 2. 客户池列表数据
        CustomerPoolCenterController.getCustomerPools(),
        
        // 3. 最近客户数据
        CustomerPoolCenterController.getRecentCustomers(),
        
        // 4. 转化分析数据
        CustomerPoolCenterController.getConversionAnalysis(),
        
        // 5. 渠道分析数据
        CustomerPoolCenterController.getChannelAnalysis()
      ]);

      const responseTime = Date.now() - startTime;
      
      console.log(`✅ 客户池中心仪表板数据获取完成，耗时: ${responseTime}ms`);

      // 返回聚合数据
      ApiResponse.success(res, {
        poolStatistics,
        customerPools,
        recentCustomers,
        conversionAnalysis,
        channelAnalysis,
        meta: {
          userId,
          userRole,
          responseTime,
          dataCount: {
            pools: customerPools?.data?.length || 0,
            customers: recentCustomers?.length || 0,
            channels: channelAnalysis?.length || 0
          }
        }
      }, '客户池中心仪表板数据获取成功');

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ 客户池中心仪表板数据获取失败:', error);
      logger.error('客户池中心仪表板数据获取失败', { error, responseTime });
      
      ApiResponse.handleError(res, error, '客户池中心仪表板数据获取失败');
    }
  }

  /**
   * 获取客户池统计数据
   */
  private static async getPoolStatistics() {
    try {
      // 统计客户池数据
      const [totalCustomers] = await sequelize.query(`
        SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT });

      const [activeCustomers] = await sequelize.query(`
        SELECT COUNT(*) as total FROM customers 
        WHERE deleted_at IS NULL AND status = 'active'
      `, { type: QueryTypes.SELECT });

      const [potentialCustomers] = await sequelize.query(`
        SELECT COUNT(*) as total FROM customers 
        WHERE deleted_at IS NULL AND status = 'potential'
      `, { type: QueryTypes.SELECT });

      const [convertedCustomers] = await sequelize.query(`
        SELECT COUNT(*) as total FROM customers 
        WHERE deleted_at IS NULL AND status = 'converted'
      `, { type: QueryTypes.SELECT });

      const [conversionRate] = await sequelize.query(`
        SELECT 
          ROUND(
            COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(*), 0), 2
          ) as rate
        FROM customers WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT });

      return {
        totalCustomers: (totalCustomers as any)?.total || 0,
        activeCustomers: (activeCustomers as any)?.total || 0,
        potentialCustomers: (potentialCustomers as any)?.total || 0,
        convertedCustomers: (convertedCustomers as any)?.total || 0,
        conversionRate: (conversionRate as any)?.rate || 0
      };
    } catch (error) {
      console.warn('⚠️ 客户池统计数据查询失败，使用默认值:', error);
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        potentialCustomers: 0,
        convertedCustomers: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * 获取客户池列表数据
   */
  private static async getCustomerPools() {
    try {
      const pools = await sequelize.query(`
        SELECT 
          cp.id, cp.name, cp.description, cp.status,
          cp.created_at, cp.updated_at,
          COUNT(c.id) as customer_count
        FROM customer_pools cp
        LEFT JOIN customers c ON cp.id = c.pool_id AND c.deleted_at IS NULL
        WHERE cp.deleted_at IS NULL
        GROUP BY cp.id, cp.name, cp.description, cp.status, cp.created_at, cp.updated_at
        ORDER BY cp.created_at DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      return {
        data: pools || [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: pools?.length || 0
        }
      };
    } catch (error) {
      console.warn('⚠️ 客户池列表数据查询失败:', error);
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0 } };
    }
  }

  /**
   * 获取最近客户数据
   */
  private static async getRecentCustomers() {
    try {
      const customers = await sequelize.query(`
        SELECT 
          c.id, c.name, c.phone, c.email, c.status,
          c.source, c.created_at, c.updated_at,
          cp.name as pool_name
        FROM customers c
        LEFT JOIN customer_pools cp ON c.pool_id = cp.id
        WHERE c.deleted_at IS NULL
        ORDER BY c.created_at DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      return customers || [];
    } catch (error) {
      console.warn('⚠️ 最近客户数据查询失败:', error);
      return [];
    }
  }

  /**
   * 获取转化分析数据
   */
  private static async getConversionAnalysis() {
    try {
      const analysis = await sequelize.query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM customers 
        WHERE deleted_at IS NULL
        GROUP BY status
        ORDER BY count DESC
      `, { type: QueryTypes.SELECT });

      return analysis || [];
    } catch (error) {
      console.warn('⚠️ 转化分析数据查询失败:', error);
      return [];
    }
  }

  /**
   * 获取渠道分析数据
   */
  private static async getChannelAnalysis() {
    try {
      const channels = await sequelize.query(`
        SELECT 
          source as channel,
          COUNT(*) as customer_count,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,
          ROUND(
            COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(*), 0), 2
          ) as conversion_rate
        FROM customers 
        WHERE deleted_at IS NULL AND source IS NOT NULL
        GROUP BY source
        ORDER BY customer_count DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      return channels || [];
    } catch (error) {
      console.warn('⚠️ 渠道分析数据查询失败:', error);
      return [];
    }
  }
}