# 活动工作流移动端预览功能说明

## 📱 功能概述

活动工作流完成后，会自动生成移动端分享链接和二维码，并弹出移动端预览窗口，模拟iPhone和Android手机的显示效果。

---

## 🎯 完整工作流步骤

### 步骤0: 生成活动方案（AI生成）
- AI根据用户需求生成完整的活动方案（Markdown格式）
- 包含活动基本信息、海报设计方案、营销推广方案
- 用户可以编辑方案内容
- 用户确认后进入后续步骤

### 步骤1: 创建活动记录（✅ API调用）
- **API端点**: `POST /api/activities`
- **调用方式**: 直接调用 `activityService.createActivity()`
- **必填字段**:
  - `kindergartenId`: 幼儿园ID
  - `title`: 活动标题
  - `activityType`: 活动类型（1-6）
  - `startTime`: 活动开始时间
  - `endTime`: 活动结束时间
  - `location`: 活动地点
  - `capacity`: 活动容量
  - `registrationStartTime`: 报名开始时间
  - `registrationEndTime`: 报名结束时间
- **返回结果**: 活动ID和活动详情

### 步骤2: 生成活动海报（⚠️ 待实现API调用）
- **API端点**: `POST /api/activity-poster/:activityId/poster/generate`
- **功能**: 使用AI生成活动海报
- **返回结果**: 海报ID和海报URL

### 步骤3: 配置营销策略（⚠️ 待实现API调用）
- **API端点**: `POST /api/marketing-campaigns`
- **功能**: 配置活动营销策略
- **返回结果**: 营销配置ID

### 步骤4: 生成手机海报（⚠️ 待实现API调用）
- **API端点**: `POST /api/activity-poster/:activityId/mobile-poster`
- **功能**: 生成适合手机分享的海报
- **返回结果**: 手机海报URL

### 步骤5: 创建分享素材并显示移动端预览（✅ 已实现）
- **功能**: 生成分享链接、二维码，并触发移动端预览
- **生成内容**:
  - 分享链接: `http://localhost:5173/mobile/activity/{activityId}`
  - 报名链接: `http://localhost:5173/mobile/activity/{activityId}/register`
  - 二维码: 使用第三方服务生成
- **触发事件**: `workflow_mobile_preview`

---

## 📱 移动端预览功能

### 预览窗口特性

#### iPhone 预览
- **外观**: 黑色边框，刘海屏设计
- **尺寸**: 375x667px
- **特征**:
  - 顶部刘海（notch）
  - 状态栏（时间、信号、WiFi、电池）
  - 底部Home指示器

#### Android 预览
- **外观**: 深灰色边框，前置摄像头
- **尺寸**: 360x640px
- **特征**:
  - 顶部摄像头
  - 状态栏（时间、信号、WiFi、电池）
  - 底部导航栏（返回、Home、多任务）

### 预览内容

预览窗口显示的内容包括：

1. **活动海报**（如果已生成）
2. **活动信息**:
   - 活动标题
   - 活动时间
   - 活动地点
   - 名额信息
   - 活动费用
3. **活动详情**（Markdown格式）
4. **报名按钮**
5. **二维码**（扫码查看活动详情）

### 交互功能

预览窗口提供以下操作：

1. **切换设备**: iPhone ↔ Android
2. **复制链接**: 复制分享链接到剪贴板
3. **下载二维码**: 下载二维码图片
4. **分享**: 使用浏览器原生分享功能（如果支持）

---

## 🔧 技术实现

### 前端组件

#### 1. MobilePhonePreview.vue
**路径**: `client/src/components/preview/MobilePhonePreview.vue`

**功能**: 移动端手机预览窗口

**Props**:
```typescript
interface Props {
  visible: boolean        // 是否显示预览窗口
  shareUrl?: string      // 分享链接
  qrCodeUrl?: string     // 二维码URL
}
```

**Events**:
```typescript
emit('update:visible', false)  // 关闭预览窗口
emit('close')                  // 关闭事件
```

**使用示例**:
```vue
<MobilePhonePreview
  :visible="showPreview"
  :shareUrl="shareUrl"
  :qrCodeUrl="qrCodeUrl"
  @update:visible="showPreview = $event"
>
  <ActivitySharePreview
    :activity="activity"
    :posterUrl="posterUrl"
    :qrCodeUrl="qrCodeUrl"
    @register="handleRegister"
  />
</MobilePhonePreview>
```

#### 2. ActivitySharePreview.vue
**路径**: `client/src/components/activity/ActivitySharePreview.vue`

**功能**: 活动分享页面内容

**Props**:
```typescript
interface Props {
  activity: Activity     // 活动信息
  posterUrl?: string     // 海报URL
  qrCodeUrl?: string     // 二维码URL
}
```

**Events**:
```typescript
emit('register')  // 用户点击报名按钮
```

### 后端实现

#### 工作流工具
**文件**: `server/src/services/ai/tools/workflow/activity-workflow/execute-activity-workflow.tool.ts`

**步骤1修改**:
```typescript
// ✅ 使用API调用创建活动
const { activityService } = await import('../../../../activity/activity.service');
const activity = await activityService.createActivity(activityData, creatorId);
```

**步骤5修改**:
```typescript
// 生成分享链接和二维码
const shareUrl = `${baseUrl}/mobile/activity/${activityId}`;
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

// 触发移动端预览事件
progressCallback('workflow_mobile_preview', {
  previewData: {
    activity: {...},
    posterUrl: posterUrl,
    shareUrl: shareUrl,
    qrCodeUrl: qrCodeUrl
  }
});
```

---

## 📊 事件流程

### 工作流事件序列

```
1. workflow_step_start (步骤0)
   ↓
2. workflow_user_confirmation_required (等待用户确认)
   ↓
3. [用户确认]
   ↓
4. workflow_step_start (步骤1)
   ↓
5. workflow_step_complete (步骤1)
   ↓
6. workflow_step_start (步骤2)
   ↓
7. workflow_step_complete (步骤2)
   ↓
8. workflow_step_start (步骤3)
   ↓
9. workflow_step_complete (步骤3)
   ↓
10. workflow_step_start (步骤4)
    ↓
11. workflow_step_complete (步骤4)
    ↓
12. workflow_step_start (步骤5)
    ↓
13. workflow_mobile_preview (🎉 显示移动端预览)
    ↓
14. workflow_step_complete (步骤5)
    ↓
15. workflow_complete (工作流完成)
```

### workflow_mobile_preview 事件数据

```typescript
{
  stepId: 'create_share_package',
  stepTitle: '创建分享素材',
  stepIndex: 5,
  totalSteps: 6,
  previewData: {
    activity: {
      id: number,
      title: string,
      startTime: string,
      endTime: string,
      location: string,
      capacity: number,
      registeredCount: number,
      fee: number,
      description: string
    },
    posterUrl: string,
    shareUrl: string,
    registrationUrl: string,
    qrCodeUrl: string
  }
}
```

---

## 🎨 样式说明

### 移动端预览窗口样式

```scss
.mobile-phone-preview-modal {
  // 全屏遮罩
  position: fixed;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  
  // 手机框架
  .phone-frame {
    border-radius: 36px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }
  
  // iPhone样式
  .iphone-frame {
    width: 375px;
    height: 667px;
    background: #000;
    border: 12px solid #1f1f1f;
  }
  
  // Android样式
  .android-frame {
    width: 360px;
    height: 640px;
    background: #2c2c2c;
    border: 10px solid #2c2c2c;
  }
}
```

---

## 🚀 使用流程

### 1. 用户发起活动创建请求

```
用户: "请帮我策划一个完整的亲子运动会活动方案"
```

### 2. AI生成活动方案

AI生成包含以下内容的Markdown方案：
- 活动基本信息
- 海报设计方案
- 营销推广方案

### 3. 用户确认方案

用户可以编辑方案内容，确认后工作流继续执行

### 4. 自动执行后续步骤

- 创建活动记录
- 生成活动海报
- 配置营销策略
- 生成手机海报
- 创建分享素材

### 5. 显示移动端预览

工作流完成后，自动弹出移动端预览窗口：
- 默认显示iPhone预览
- 可切换到Android预览
- 显示完整的活动分享页面
- 提供复制链接、下载二维码、分享等功能

---

## ✅ 完成标志

当用户看到移动端预览窗口时，表示整个活动工作流已经完成：

✅ 活动已创建  
✅ 海报已生成  
✅ 营销已配置  
✅ 分享链接已生成  
✅ 二维码已生成  
✅ 移动端预览已显示  

用户可以：
- 复制分享链接发送给家长
- 下载二维码用于线下宣传
- 使用浏览器分享功能分享活动

---

## 📝 待完成事项

### 步骤2-4的API调用实现

目前步骤2-4仍使用页面操作指令，需要改为API调用：

- [ ] 步骤2: 实现海报生成API调用
- [ ] 步骤3: 实现营销配置API调用
- [ ] 步骤4: 实现手机海报生成API调用

### 二维码生成服务

目前使用第三方服务生成二维码，建议：

- [ ] 实现内部二维码生成服务
- [ ] 支持自定义二维码样式
- [ ] 支持二维码中间添加Logo

### 移动端页面实现

需要实现真实的移动端活动详情页面：

- [ ] `/mobile/activity/:id` - 活动详情页
- [ ] `/mobile/activity/:id/register` - 活动报名页

---

## 🔗 相关文档

- [活动工作流API文档](./ACTIVITY_WORKFLOW_API.md)
- [移动端预览组件文档](./MOBILE_PREVIEW_COMPONENT.md)
- [活动分享功能文档](./ACTIVITY_SHARE_FEATURE.md)

