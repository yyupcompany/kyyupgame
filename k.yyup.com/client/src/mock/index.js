/**
 * API模拟数据索引
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

export * from './activity';
export * from './application';
export * from './class';
export * from './dashboard';
export * from './enrollment-plan';
export * from './marketing';
export * from './notification';
export * from './principal';
export * from './student';
export * from './teacher';
export * from './user';

/**
 * 如何使用模拟数据:
 * 
 * 1. 导入模拟数据模块:
 * import * as apiMock from '@/mock';
 * 
 * 2. 在API调用处添加条件判断:
 * const useRealApi = process.env.NODE_ENV === 'production';
 * 
 * 3. 根据条件使用真实API或模拟数据:
 * const response = useRealApi 
 *   ? await realApiFunction(params) 
 *   : await apiMock.mockResponse('realApiFunction', params);
 */
