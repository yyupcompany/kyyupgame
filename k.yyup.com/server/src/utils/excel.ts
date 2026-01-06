import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import * as tmp from 'tmp';
import * as fs from 'fs';

/**
 * 创建Excel文件
 * @param sheetName 工作表名称
 * @param headers 表头定义
 * @param rows 数据行
 * @returns Excel文件Buffer
 */
export async function createExcelFile(
  sheetName: string,
  headers: Array<{ header: string; key: string; width: number }>,
  rows: Array<Record<string, any>>
): Promise<Buffer> {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook();
  
  // 添加工作表
  const worksheet = workbook.addWorksheet(sheetName);
  
  // 设置表头
  worksheet.columns = headers;
  
  // 添加数据行
  worksheet.addRows(rows);
  
  // 设置表头样式
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // 设置所有单元格的边框
  worksheet.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  // 导出为Buffer
  const tmpFile = tmp.fileSync();
  await workbook.xlsx.writeFile(tmpFile.name);
  const buffer = fs.readFileSync(tmpFile.name);
  tmpFile.removeCallback();
  return buffer;
}