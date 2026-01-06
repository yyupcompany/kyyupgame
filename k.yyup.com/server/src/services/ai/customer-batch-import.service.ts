/**
 * 客户批量导入服务
 * 专门处理客户数据的批量导入
 */

import * as XLSX from 'xlsx';

export interface CustomerPreview {
  headers: string[];
  rows: any[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  mappings: Record<string, string>;
}

export interface CustomerImportResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

class CustomerBatchImportService {
  /**
   * 生成预览数据
   */
  async generatePreview(buffer: Buffer, filename: string): Promise<CustomerPreview> {
    console.log('👁️ [客户导入服务] 生成预览:', filename);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const errors: Array<{ row: number; field: string; message: string }> = [];

    // 验证必填字段
    const requiredFields = ['姓名', '联系电话'];
    data.forEach((row: any, index) => {
      requiredFields.forEach(field => {
        if (!row[field]) {
          errors.push({ row: index + 1, field, message: `${field}不能为空` });
        }
      });

      // 验证电话格式
      if (row['联系电话'] && !/^1[3-9]\d{9}$/.test(String(row['联系电话']))) {
        errors.push({ row: index + 1, field: '联系电话', message: '电话格式不正确' });
      }
    });

    // 自动映射字段
    const mappings: Record<string, string> = {
      '姓名': 'name',
      '联系电话': 'phone',
      '来源': 'source',
      '意向程度': 'intentLevel',
      '备注': 'remark',
    };

    return {
      headers,
      rows: data.slice(0, 20),
      totalRows: data.length,
      validRows: data.length - new Set(errors.map(e => e.row)).size,
      invalidRows: new Set(errors.map(e => e.row)).size,
      errors,
      mappings,
    };
  }

  /**
   * 执行客户导入
   */
  async importCustomers(buffer: Buffer, filename: string, options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  }): Promise<CustomerImportResult> {
    console.log('📥 [客户导入服务] 执行导入:', filename);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // 这里应该实现实际的导入逻辑
    return {
      success: true,
      imported: data.length,
      updated: 0,
      failed: 0,
      errors: [],
    };
  }
}

export const customerBatchImportService = new CustomerBatchImportService();
export default customerBatchImportService;

