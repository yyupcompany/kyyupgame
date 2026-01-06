# API 404错误修复总结

**问题**: 园长角色访问考勤中心时，所有API请求返回404错误

**测试时间**: 2025-10-11 20:50

---

## 🔍 问题分析

### 已完成的修复

1. ✅ **前端API调用参数修复**
   - 修改了 `client/src/api/modules/attendance-center.ts`
   - 将 `request.get(url, { params })` 改为 `request.get(url, params)`
   - 原因：`smartGetMethod` 的第二个参数是 `params`，不是 `{ params }`

2. ✅ **后端静态文件服务顺序修复**
   - 修改了 `server/src/index.ts`
   - 将静态文件服务移到API路由之后
   - 原因：静态文件服务在API路由之前会拦截所有请求

### 当前状态

- ✅ 前端参数传递正确：`kindergartenId: 1, date: 2025-10-11`
- ✅ 后端路由已注册：`router.use('/attendance-center', attendanceCenterRoutes)`
- ✅ 路由已挂载到 `/api`：`app.use('/api', routes)`
- ⚠️ API仍然返回404错误，返回HTML页面而不是JSON

### 错误详情

```
Error details: {code: NOT_FOUND, message: 请求的资源不存在, detail: <!DOCTYPE html>
<html lang="en">...
```

这说明后端返回的是HTML 404页面，而不是JSON响应。

---

## 🎯 下一步调查方向

### 1. 确认实际运行的服务器文件

- `npm run dev` 运行的是 `src/app.ts`
- 需要确认 `app.ts` 中的路由配置是否正确

### 2. 检查路由注册顺序

- 确认API路由在静态文件服务之前注册
- 确认没有其他中间件拦截API请求

### 3. 测试后端API端点

- 使用curl直接测试后端API
- 确认路由是否真的存在

### 4. 检查权限中间件

- 考勤中心路由要求 `principal` 或 `admin` 角色
- 确认token中的角色信息正确

---

## 📋 修复记录

### 修改1: `client/src/api/modules/attendance-center.ts`

**修改内容**: 修复所有API调用的参数传递方式

**修改前**:
```typescript
export function getOverview(params: {
  kindergartenId: number;
  date?: string;
}): Promise<ApiResponse<OverviewData>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.OVERVIEW, { params });
}
```

**修改后**:
```typescript
export function getOverview(params: {
  kindergartenId: number;
  date?: string;
}): Promise<ApiResponse<OverviewData>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.OVERVIEW, params);
}
```

**影响**: 修复了9个API调用函数

### 修改2: `server/src/index.ts`

**修改内容**: 将静态文件服务移到API路由之后

**修改位置**: 第258-262行和第442-477行

**修改前**:
```typescript
// 第258行：静态文件服务在API路由之前
app.use(express.static(clientDistPath, {...}));

// 第458行：API路由在静态文件服务之后
app.use('/api', routes);
```

**修改后**:
```typescript
// 第458行：API路由在前
app.use('/api', routes);

// 第464行：静态文件服务在后
app.use(express.static(clientDistPath, {...}));
```

---

## ⚠️ 待解决问题

1. **API仍然返回404错误**
   - 前端参数传递已修复
   - 后端路由顺序已修复
   - 但API仍然返回HTML 404页面

2. **可能的原因**
   - 实际运行的服务器文件不是 `index.ts`
   - 路由注册有问题
   - 权限中间件拦截了请求
   - 其他中间件拦截了请求

---

**最后更新**: 2025-10-11 20:50  
**状态**: 🔄 **进行中** - 前端修复完成，后端问题仍在调查

