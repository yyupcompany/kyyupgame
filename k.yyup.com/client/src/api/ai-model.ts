/**
 * AI模型管理API
 * 提供与AI模型管理系统交互的API函数
 */
import request from '../utils/request';
import { AI_ENDPOINTS } from './endpoints';

// 解构request实例中的方法
const { get, post, put, del } = request;

/**
 * 获取模型列表
 * @returns 模型列表
 */
export const getModels = async () => {
  try {
    const response = await get(AI_ENDPOINTS.MODELS);
    return response.data;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

/**
 * 获取模型计费信息
 * @param modelId 模型ID
 * @returns 计费信息
 */
export const getModelBilling = async (modelId: number) => {
  try {
    const response = await get(AI_ENDPOINTS.MODEL_BILLING(modelId));
    return response.data;
  } catch (error) {
    console.error('获取模型计费信息失败:', error);
    throw error;
  }
};

/**
 * 创建模型
 * @param modelData 模型数据
 * @returns 创建的模型
 */
export const createModel = async (modelData: {
  name: string;
  displayName: string;
  provider: string;
  modelType: string;
  apiVersion: string;
  endpointUrl: string;
  apiKey?: string;
  modelParameters?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
}) => {
  try {
    const response = await post(AI_ENDPOINTS.MODELS, modelData);
    return response.data;
  } catch (error) {
    console.error('创建模型失败:', error);
    throw error;
  }
};

/**
 * 更新模型
 * @param modelId 模型ID
 * @param modelData 更新数据
 * @returns 更新后的模型
 */
export const updateModel = async (modelId: number, modelData: {
  name?: string;
  displayName?: string;
  provider?: string;
  modelType?: string;
  apiVersion?: string;
  endpointUrl?: string;
  apiKey?: string;
  modelParameters?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
}) => {
  try {
    const response = await put(AI_ENDPOINTS.MODEL_BY_ID(modelId), modelData);
    return response.data;
  } catch (error) {
    console.error('更新模型失败:', error);
    throw error;
  }
};

/**
 * 删除模型
 * @param modelId 模型ID
 * @returns 操作结果
 */
export const deleteModel = async (modelId: number) => {
  try {
    const response = await del(AI_ENDPOINTS.MODEL_BY_ID(modelId));
    return response.data;
  } catch (error) {
    console.error('删除模型失败:', error);
    throw error;
  }
};

/**
 * 设置默认模型
 * @param modelId 模型ID
 * @returns 操作结果
 */
export const setDefaultModel = async (modelId: number) => {
  try {
    const response = await post(AI_ENDPOINTS.MODEL_DEFAULT, { modelId });
    return response.data;
  } catch (error) {
    console.error('设置默认模型失败:', error);
    throw error;
  }
};

/**
 * 切换模型状态
 * @param modelId 模型ID
 * @param isActive 是否激活
 * @returns 操作结果
 */
export const toggleModelStatus = async (modelId: number, isActive: boolean) => {
  try {
    const response = await put(AI_ENDPOINTS.MODEL_BY_ID(modelId), { isActive });
    return response.data;
  } catch (error) {
    console.error('切换模型状态失败:', error);
    throw error;
  }
}; 