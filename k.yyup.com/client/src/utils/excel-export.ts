/**
 * Excel导出工具
 * 使用HTML表格转Excel的方式，兼容性好，无需额外依赖
 */

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  formatter?: (value: any) => string;
}

interface ExcelSheet {
  name: string;
  columns: ExcelColumn[];
  data: any[];
}

/**
 * 导出Excel文件（使用HTML表格方式）
 */
export function exportToExcel(sheets: ExcelSheet[], filename: string) {
  try {
    // 创建HTML表格
    let html = '<html><head><meta charset="utf-8">';
    html += '<style>';
    html += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
    html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
    html += 'th { background-color: #4CAF50; color: white; font-weight: bold; }';
    html += 'h2 { color: #333; margin-top: 20px; }';
    html += '</style>';
    html += '</head><body>';

    sheets.forEach(sheet => {
      html += `<h2>${sheet.name}</h2>`;
      html += createHTMLTable(sheet);
    });

    html += '</body></html>';

    // 创建Blob
    const blob = new Blob(['\ufeff' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8'
    });

    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);

    // 触发下载
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Excel导出失败:', error);
    return false;
  }
}

/**
 * 创建HTML表格
 */
function createHTMLTable(sheet: ExcelSheet): string {
  const { columns, data } = sheet;

  let table = '<table>';

  // 表头
  table += '<thead><tr>';
  columns.forEach(col => {
    table += `<th>${escapeHTML(col.header)}</th>`;
  });
  table += '</tr></thead>';

  // 数据行
  table += '<tbody>';
  data.forEach(row => {
    table += '<tr>';
    columns.forEach(col => {
      let value = row[col.key];

      // 使用formatter格式化值
      if (col.formatter && value !== undefined && value !== null) {
        value = col.formatter(value);
      }

      // 转换为字符串
      const strValue = value !== undefined && value !== null ? String(value) : '';

      table += `<td>${escapeHTML(strValue)}</td>`;
    });
    table += '</tr>';
  });
  table += '</tbody>';

  table += '</table>';

  return table;
}

/**
 * 转义HTML特殊字符
 */
function escapeHTML(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 导出用量统计Excel
 */
export function exportUsageToExcel(
  userUsageList: any[],
  dateRange: [Date, Date],
  filename?: string
) {
  const startDate = dateRange[0].toISOString().split('T')[0];
  const endDate = dateRange[1].toISOString().split('T')[0];
  
  const sheets: ExcelSheet[] = [
    {
      name: '用量统计',
      columns: [
        { header: '用户名', key: 'username' },
        { header: '真实姓名', key: 'realName' },
        { header: '邮箱', key: 'email' },
        { header: '调用次数', key: 'totalCalls', formatter: (v) => v.toLocaleString() },
        { header: 'Token数', key: 'totalTokens', formatter: (v) => v.toLocaleString() },
        { header: '总费用(元)', key: 'totalCost', formatter: (v) => v.toFixed(6) }
      ],
      data: userUsageList
    }
  ];
  
  const exportFilename = filename || `用量统计_${startDate}_${endDate}`;
  
  return exportToExcel(sheets, exportFilename);
}

