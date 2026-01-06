# PDF报告功能安装指南

## 📦 依赖安装

PDF报告生成功能需要安装 `pdfkit` 库。

### 安装命令

```bash
cd server
npm install pdfkit @types/pdfkit --save
```

### 依赖说明

- **pdfkit**: PDF生成库，用于创建PDF文档
- **@types/pdfkit**: TypeScript类型定义

---

## 🔧 中文字体支持（可选）

如果需要在PDF中显示中文，需要添加中文字体文件。

### 步骤1：下载中文字体

推荐使用开源字体：
- **思源黑体** (Source Han Sans)
- **文泉驿微米黑** (WenQuanYi Micro Hei)

下载地址：
- 思源黑体: https://github.com/adobe-fonts/source-han-sans/releases
- 文泉驿: http://wenq.org/wqy2/index.cgi?MicroHei

### 步骤2：放置字体文件

```bash
# 创建字体目录
mkdir -p server/assets/fonts

# 将字体文件复制到目录
cp SourceHanSansCN-Regular.otf server/assets/fonts/
```

### 步骤3：修改PDF服务

在 `server/src/services/ai/pdf-report.service.ts` 中取消注释字体配置：

```typescript
// 找到这一行（约第90行）
// doc.font('path/to/chinese-font.ttf');

// 修改为
doc.font(path.join(__dirname, '../../../assets/fonts/SourceHanSansCN-Regular.otf'));
```

---

## 📁 目录结构

安装完成后，目录结构如下：

```
server/
├── assets/
│   └── fonts/                    # 字体文件目录（可选）
│       └── SourceHanSansCN-Regular.otf
├── uploads/
│   └── reports/                  # PDF报告输出目录（自动创建）
│       ├── report_teacher_1_*.pdf
│       └── report_all_teachers_*.pdf
├── src/
│   ├── services/
│   │   └── ai/
│   │       ├── pdf-report.service.ts      # PDF生成服务
│   │       ├── followup-analysis.service.ts
│   │       └── smart-assign.service.ts
│   ├── controllers/
│   │   └── followup-analysis.controller.ts
│   └── routes/
│       └── followup-analysis.routes.ts
└── package.json
```

---

## 🧪 测试安装

### 1. 检查依赖安装

```bash
cd server
npm list pdfkit
```

应该看到类似输出：
```
kindergarten-server@1.0.0
└── pdfkit@0.13.0
```

### 2. 测试PDF生成

```bash
# 启动服务器
npm run dev

# 在另一个终端测试API
curl -X POST http://localhost:3000/api/followup/generate-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "teacherIds": [1, 2],
    "mergeAll": false,
    "includeAIAnalysis": true,
    "format": "detailed"
  }'
```

### 3. 检查生成的PDF

```bash
# 查看生成的PDF文件
ls -lh server/uploads/reports/

# 应该看到类似输出
-rw-r--r-- 1 user user 45K Jan  4 14:30 report_teacher_1_1704355800000.pdf
-rw-r--r-- 1 user user 42K Jan  4 14:30 report_teacher_2_1704355800000.pdf
```

---

## ⚠️ 常见问题

### Q1: 安装pdfkit失败

**错误信息**:
```
npm ERR! code ENOENT
npm ERR! syscall spawn git
```

**解决方案**:
```bash
# 清理npm缓存
npm cache clean --force

# 重新安装
npm install pdfkit @types/pdfkit --save
```

### Q2: PDF中文显示为方框

**原因**: 未配置中文字体

**解决方案**: 按照"中文字体支持"部分配置字体文件

### Q3: PDF生成失败

**错误信息**:
```
Error: ENOENT: no such file or directory, open 'uploads/reports/...'
```

**解决方案**:
```bash
# 手动创建目录
mkdir -p server/uploads/reports
```

### Q4: 内存不足

**错误信息**:
```
JavaScript heap out of memory
```

**解决方案**:
```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

---

## 📊 PDF报告内容

生成的PDF报告包含以下内容：

### 单个教师报告
1. **报告头部**
   - 教师姓名
   - 生成日期
   - 分析周期

2. **个人跟进数据概览**
   - 负责客户数
   - 跟进总次数
   - 平均跟进间隔
   - 转化率
   - 超期未跟进客户数
   - 状态评级
   - 团队排名

3. **AI诊断分析**
   - 整体评估
   - 优先跟进客户清单
   - 改进建议

4. **本月目标**
   - 跟进间隔目标
   - 转化率目标
   - 超期客户目标

5. **页脚**
   - 页码
   - 生成时间

### 合并报告
1. **封面页**
   - 报告标题
   - 教师人数
   - 生成日期

2. **整体统计页**
   - 总教师数
   - 平均跟进频率
   - 平均转化率
   - 超期未跟进客户数
   - 总跟进次数

3. **各教师详细页**
   - 每个教师一页
   - 内容同单个教师报告

---

## 🔄 升级和维护

### 更新pdfkit版本

```bash
cd server
npm update pdfkit @types/pdfkit
```

### 清理旧的PDF文件

```bash
# 删除30天前的PDF文件
find server/uploads/reports -name "*.pdf" -mtime +30 -delete
```

### 定期备份

建议定期备份生成的PDF报告：

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf pdf_reports_backup_$DATE.tar.gz server/uploads/reports/
```

---

## 📝 API文档

### 生成PDF报告

**端点**: `POST /api/followup/generate-pdf`

**请求参数**:
```json
{
  "teacherIds": [1, 2, 3],
  "mergeAll": false,
  "includeAIAnalysis": true,
  "format": "detailed"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "pdfUrls": [
      "/uploads/reports/report_teacher_1_1704355800000.pdf",
      "/uploads/reports/report_teacher_2_1704355800000.pdf"
    ]
  },
  "message": "PDF报告生成成功"
}
```

---

## 🎯 性能优化

### 1. 异步生成

对于大批量PDF生成，建议使用异步队列：

```typescript
// 使用Bull队列（需要Redis）
import Queue from 'bull';

const pdfQueue = new Queue('pdf-generation', {
  redis: { host: 'localhost', port: 6379 }
});

pdfQueue.process(async (job) => {
  const { teacherIds, options } = job.data;
  return await pdfReportService.generateFollowupReports(options);
});
```

### 2. 缓存策略

对于相同参数的PDF请求，可以缓存结果：

```typescript
// 检查是否已有缓存的PDF
const cacheKey = `pdf_${teacherIds.join('_')}_${Date.now()}`;
const cachedPdf = await redis.get(cacheKey);
if (cachedPdf) {
  return cachedPdf;
}
```

### 3. 压缩PDF

使用PDF压缩工具减小文件大小：

```bash
npm install pdf-lib --save
```

---

**文档版本**: v1.0  
**创建日期**: 2025-01-04  
**最后更新**: 2025-01-04

