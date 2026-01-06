# API接口文档

## 📋 概览

- **总API数量**: 1611
- **需要认证**: 1344 (83.4%)
- **公开接口**: 267
- **分类数量**: 3

## 🔐 认证说明

大部分API接口需要在请求头中包含JWT Token：

```http
Authorization: Bearer <your-jwt-token>
```

## 📂 接口分类


### root


#### GET /

**文件**: `SequelizeMeta.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activities-backup-1751799168.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activities-backup-1751799168.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activities-backup-1751799168.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activities-backup-1751799168.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activities-backup-1751799168.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `activities.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activities.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activities.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activities.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activities.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activities.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/publish

**文件**: `activities.routes.ts`

**描述**: put /:id/publish

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/share

**文件**: `activities.routes.ts`

**描述**: post /:id/share

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/share-hierarchy

**文件**: `activities.routes.ts`

**描述**: get /:id/share-hierarchy

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/status

**文件**: `activities.routes.ts`

**描述**: put /:id/status

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/registrations

**文件**: `activities.routes.ts`

**描述**: get /:id/registrations

**认证**: ✅ 需要

**权限**: ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_VIEW, ACTIVITY_CREATE, ACTIVITY_UPDATE, ACTIVITY_MANAGE, ACTIVITY_UPDATE, ACTIVITY_UPDATE, ACTIVITY_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /registration/:id

**文件**: `activity-checkin.routes.ts`

**描述**: post /registration/:id

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch

**文件**: `activity-checkin.routes.ts`

**描述**: post /batch

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:activityId/phone

**文件**: `activity-checkin.routes.ts`

**描述**: post /:activityId/phone

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:activityId/stats

**文件**: `activity-checkin.routes.ts`

**描述**: get /:activityId/stats

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:activityId/export

**文件**: `activity-checkin.routes.ts`

**描述**: get /:activityId/export

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-activity/:activityId

**文件**: `activity-checkin.routes.ts`

**描述**: get /by-activity/:activityId

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-checkin.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-checkin.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-checkin.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-checkin.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-checkin.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE, ACTIVITY_CHECKIN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-activity/:activityId

**文件**: `activity-evaluation.routes.ts`

**描述**: get /by-activity/:activityId

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-rating/:rating

**文件**: `activity-evaluation.routes.ts`

**描述**: get /by-rating/:rating

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/:activityId

**文件**: `activity-evaluation.routes.ts`

**描述**: get /statistics/:activityId

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-evaluation.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-evaluation.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-evaluation.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-evaluation.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-evaluation.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/reply

**文件**: `activity-evaluation.routes.ts`

**描述**: post /:id/reply

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activity/:activityId/statistics

**文件**: `activity-evaluation.routes.ts`

**描述**: get /activity/:activityId/statistics

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /satisfaction-report

**文件**: `activity-evaluation.routes.ts`

**描述**: get /satisfaction-report

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-evaluations.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `activity-evaluations.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-evaluations.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-evaluations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-evaluations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-evaluations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-plan.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-plan.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-category/:category

**文件**: `activity-plan.routes.ts`

**描述**: get /by-category/:category

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-date/:date

**文件**: `activity-plan.routes.ts`

**描述**: get /by-date/:date

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/publish

**文件**: `activity-plan.routes.ts`

**描述**: post /:id/publish

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-plan.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-plan.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-plan.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/status

**文件**: `activity-plan.routes.ts`

**描述**: put /:id/status

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/cancel

**文件**: `activity-plan.routes.ts`

**描述**: post /:id/cancel

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/statistics

**文件**: `activity-plan.routes.ts`

**描述**: get /:id/statistics

**认证**: ✅ 需要

**权限**: ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE, ACTIVITY_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-plans.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-plans.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-plans.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-plans.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-plans.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `activity-plans.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:activityId/poster/generate

**文件**: `activity-poster.routes.ts`

**描述**: post /:activityId/poster/generate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:activityId/posters

**文件**: `activity-poster.routes.ts`

**描述**: get /:activityId/posters

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:activityId/poster/preview

**文件**: `activity-poster.routes.ts`

**描述**: get /:activityId/poster/preview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:activityId/publish

**文件**: `activity-poster.routes.ts`

**描述**: post /:activityId/publish

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:activityId/share

**文件**: `activity-poster.routes.ts`

**描述**: post /:activityId/share

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:activityId/share/stats

**文件**: `activity-poster.routes.ts`

**描述**: get /:activityId/share/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate

**文件**: `activity-registration-page.routes.ts`

**描述**: post /generate

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:pageId

**文件**: `activity-registration-page.routes.ts`

**描述**: get /:pageId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:pageId/submit

**文件**: `activity-registration-page.routes.ts`

**描述**: post /:pageId/submit

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:pageId/stats

**文件**: `activity-registration-page.routes.ts`

**描述**: get /:pageId/stats

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-registration.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-registration.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-activity/:activityId

**文件**: `activity-registration.routes.ts`

**描述**: get /by-activity/:activityId

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-student/:studentId

**文件**: `activity-registration.routes.ts`

**描述**: get /by-student/:studentId

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-status/:status

**文件**: `activity-registration.routes.ts`

**描述**: get /by-status/:status

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-confirm

**文件**: `activity-registration.routes.ts`

**描述**: post /batch-confirm

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-registration.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/payment

**文件**: `activity-registration.routes.ts`

**描述**: get /:id/payment

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/payment

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/payment

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-registration.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-registration.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/review

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/review

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/cancel

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/cancel

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/check-in

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/check-in

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/absent

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/absent

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/feedback

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/feedback

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/convert

**文件**: `activity-registration.routes.ts`

**描述**: post /:id/convert

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activity/:activityId/stats

**文件**: `activity-registration.routes.ts`

**描述**: get /activity/:activityId/stats

**认证**: ✅ 需要

**权限**: ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE, ACTIVITY_REGISTRATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-registrations.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-registrations.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-registrations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-registrations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-registrations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `activity-template.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `activity-template.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `activity-template.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `activity-template.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `activity-template.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/use

**文件**: `activity-template.routes.ts`

**描述**: post /:id/use

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /system-info

**文件**: `admin.routes.ts`

**描述**: get /system-info

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /logs

**文件**: `admin.routes.ts`

**描述**: get /logs

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /environment

**文件**: `admin.routes.ts`

**描述**: get /environment

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /environment

**文件**: `admin.routes.ts`

**描述**: post /environment

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /db-monitor/public-stats

**文件**: `admin.routes.ts`

**描述**: get /db-monitor/public-stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /db-monitor/metrics

**文件**: `admin.routes.ts`

**描述**: get /db-monitor/metrics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /db-monitor/tables

**文件**: `admin.routes.ts`

**描述**: get /db-monitor/tables

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /db-monitor/indexes

**文件**: `admin.routes.ts`

**描述**: get /db-monitor/indexes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /db-monitor/queries

**文件**: `admin.routes.ts`

**描述**: get /db-monitor/queries

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /refresh-permission-cache

**文件**: `admin.routes.ts`

**描述**: post /refresh-permission-cache

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permission-cache-status

**文件**: `admin.routes.ts`

**描述**: get /permission-cache-status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permission-change-history

**文件**: `admin.routes.ts`

**描述**: get /permission-change-history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /force-refresh-cache

**文件**: `admin.routes.ts`

**描述**: post /force-refresh-cache

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /permission-change-history

**文件**: `admin.routes.ts`

**描述**: delete /permission-change-history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /warmup-cache

**文件**: `admin.routes.ts`

**描述**: post /warmup-cache

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /start-permission-watcher

**文件**: `admin.routes.ts`

**描述**: post /start-permission-watcher

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `admission-notification.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `admission-notification.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-result/:resultId

**文件**: `admission-notification.routes.ts`

**描述**: get /by-result/:resultId

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-parent/:parentId

**文件**: `admission-notification.routes.ts`

**描述**: get /by-parent/:parentId

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `admission-notification.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `admission-notification.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `admission-notification.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/send

**文件**: `admission-notification.routes.ts`

**描述**: post /:id/send

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/resend

**文件**: `admission-notification.routes.ts`

**描述**: post /:id/resend

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/delivered

**文件**: `admission-notification.routes.ts`

**描述**: put /:id/delivered

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/read

**文件**: `admission-notification.routes.ts`

**描述**: put /:id/read

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/response

**文件**: `admission-notification.routes.ts`

**描述**: post /:id/response

**认证**: ✅ 需要

**权限**: ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE, ADMISSION_NOTIFICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `admission-notifications.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `admission-notifications.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `admission-notifications.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `admission-notifications.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `admission-notifications.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `admission-result.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `admission-result.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-application/:applicationId

**文件**: `admission-result.routes.ts`

**描述**: get /by-application/:applicationId

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-class/:classId

**文件**: `admission-result.routes.ts`

**描述**: get /by-class/:classId

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `admission-result.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `admission-result.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `admission-result.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `admission-result.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE, ADMISSION_RESULT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `admission-results.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `admission-results.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `admission-results.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `admission-results.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `admission-results.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `advertisement.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-type/:type

**文件**: `advertisement.routes.ts`

**描述**: get /by-type/:type

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-status/:status

**文件**: `advertisement.routes.ts`

**描述**: get /by-status/:status

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `advertisement.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `advertisement.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/statistics

**文件**: `advertisement.routes.ts`

**描述**: get /:id/statistics

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/pause

**文件**: `advertisement.routes.ts`

**描述**: post /:id/pause

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/resume

**文件**: `advertisement.routes.ts`

**描述**: post /:id/resume

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `advertisement.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `advertisement.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `advertisement.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE, ADVERTISEMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `advertisements.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `advertisements.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `advertisements.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `advertisements.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `advertisements.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /enrollment-trends

**文件**: `ai-analysis.routes.ts`

**描述**: post /enrollment-trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /activity-effectiveness

**文件**: `ai-analysis.routes.ts`

**描述**: post /activity-effectiveness

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /performance-prediction

**文件**: `ai-analysis.routes.ts`

**描述**: post /performance-prediction

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /risk-assessment

**文件**: `ai-analysis.routes.ts`

**描述**: post /risk-assessment

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `ai-analysis.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `ai-analysis.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/export

**文件**: `ai-analysis.routes.ts`

**描述**: post /:id/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `ai-analysis.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /models/status

**文件**: `ai-analysis.routes.ts`

**描述**: get /models/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /query

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: post /query

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /test-direct

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: post /test-direct

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /test-route

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: post /test-route

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /keywords

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: get /keywords

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `ai-assistant-optimized.routes.ts`

**描述**: get /health

**认证**: ✅ 需要

**权限**: AI_ASSISTANT_OPTIMIZED_QUERY, AI_ASSISTANT_OPTIMIZED_PERFORMANCE, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_TEST, AI_ASSISTANT_OPTIMIZED_CONFIG, AI_ASSISTANT_OPTIMIZED_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `ai-cache.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `ai-cache.routes.ts`

**描述**: get /health

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /tool/:toolName

**文件**: `ai-cache.routes.ts`

**描述**: delete /tool/:toolName

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /all

**文件**: `ai-cache.routes.ts`

**描述**: delete /all

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /reset-stats

**文件**: `ai-cache.routes.ts`

**描述**: post /reset-stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /warmup

**文件**: `ai-cache.routes.ts`

**描述**: post /warmup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate

**文件**: `ai-curriculum.routes.ts`

**描述**: post /generate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-stream

**文件**: `ai-curriculum.routes.ts`

**描述**: post /generate-stream

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /save

**文件**: `ai-curriculum.routes.ts`

**描述**: post /save

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-page/:pagePath

**文件**: `ai-knowledge.routes.ts`

**描述**: get /by-page/:pagePath

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `ai-knowledge.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /category/:category

**文件**: `ai-knowledge.routes.ts`

**描述**: get /category/:category

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /system-status

**文件**: `ai-performance.routes.ts`

**描述**: get /system-status

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /models

**文件**: `ai-performance.routes.ts`

**描述**: get /models

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /logs

**文件**: `ai-performance.routes.ts`

**描述**: get /logs

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /alerts

**文件**: `ai-performance.routes.ts`

**描述**: get /alerts

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /refresh

**文件**: `ai-performance.routes.ts`

**描述**: post /refresh

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /export

**文件**: `ai-performance.routes.ts`

**描述**: get /export

**认证**: ✅ 需要

**权限**: ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor, ai-performance-monitor

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /update-doubao-params

**文件**: `ai-query.routes.ts`

**描述**: post /update-doubao-params

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /chat

**文件**: `ai-query.routes.ts`

**描述**: post /chat

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `ai-query.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /execute

**文件**: `ai-query.routes.ts`

**描述**: post /execute

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `ai-query.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /feedback

**文件**: `ai-query.routes.ts`

**描述**: post /feedback

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /templates

**文件**: `ai-query.routes.ts`

**描述**: get /templates

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /suggestions

**文件**: `ai-query.routes.ts`

**描述**: get /suggestions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `ai-query.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `ai-query.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/re-execute

**文件**: `ai-query.routes.ts`

**描述**: post /:id/re-execute

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/export

**文件**: `ai-query.routes.ts`

**描述**: get /:id/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cache/cleanup

**文件**: `ai-query.routes.ts`

**描述**: post /cache/cleanup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /check-availability

**文件**: `ai-scoring.routes.ts`

**描述**: get /check-availability

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /analyze

**文件**: `ai-scoring.routes.ts`

**描述**: post /analyze

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /record-time

**文件**: `ai-scoring.routes.ts`

**描述**: post /record-time

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `ai-scoring.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `ai-shortcuts.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user

**文件**: `ai-shortcuts.routes.ts`

**描述**: get /user

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `ai-shortcuts.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/config

**文件**: `ai-shortcuts.routes.ts`

**描述**: get /:id/config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `ai-shortcuts.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `ai-shortcuts.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `ai-shortcuts.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch/delete

**文件**: `ai-shortcuts.routes.ts`

**描述**: post /batch/delete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /sort

**文件**: `ai-shortcuts.routes.ts`

**描述**: put /sort

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /smart-assign

**文件**: `ai-smart-assign.routes.ts`

**描述**: post /smart-assign

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-assign

**文件**: `ai-smart-assign.routes.ts`

**描述**: post /batch-assign

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teacher-capacity

**文件**: `ai-smart-assign.routes.ts`

**描述**: get /teacher-capacity

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `ai-stats.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recent-tasks

**文件**: `ai-stats.routes.ts`

**描述**: get /recent-tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /models

**文件**: `ai-stats.routes.ts`

**描述**: get /models

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /analysis-history

**文件**: `ai-stats.routes.ts`

**描述**: get /analysis-history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `api-list.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:module

**文件**: `api-list.routes.ts`

**描述**: get /:module

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `api.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /version

**文件**: `api.routes.ts`

**描述**: get /version

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `api.routes.ts`

**描述**: get /health

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /configs

**文件**: `assessment-admin.routes.ts`

**描述**: get /configs

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /configs

**文件**: `assessment-admin.routes.ts`

**描述**: post /configs

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /configs/:id

**文件**: `assessment-admin.routes.ts`

**描述**: put /configs/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /questions

**文件**: `assessment-admin.routes.ts`

**描述**: get /questions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /questions

**文件**: `assessment-admin.routes.ts`

**描述**: post /questions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /questions/:id

**文件**: `assessment-admin.routes.ts`

**描述**: put /questions/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /questions/:id

**文件**: `assessment-admin.routes.ts`

**描述**: delete /questions/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `assessment-admin.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /physical-items

**文件**: `assessment-admin.routes.ts`

**描述**: get /physical-items

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /physical-items

**文件**: `assessment-admin.routes.ts`

**描述**: post /physical-items

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /physical-items/:id

**文件**: `assessment-admin.routes.ts`

**描述**: put /physical-items/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /physical-items/:id

**文件**: `assessment-admin.routes.ts`

**描述**: delete /physical-items/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-image

**文件**: `assessment-admin.routes.ts`

**描述**: post /generate-image

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /share

**文件**: `assessment-share.routes.ts`

**描述**: post /share

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /scan

**文件**: `assessment-share.routes.ts`

**描述**: post /scan

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/:recordId

**文件**: `assessment-share.routes.ts`

**描述**: get /stats/:recordId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /rewards

**文件**: `assessment-share.routes.ts`

**描述**: get /rewards

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /start

**文件**: `assessment.routes.ts`

**描述**: post /start

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /questions

**文件**: `assessment.routes.ts`

**描述**: get /questions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /answer

**文件**: `assessment.routes.ts`

**描述**: post /answer

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:recordId/complete

**文件**: `assessment.routes.ts`

**描述**: post /:recordId/complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /record/:recordId

**文件**: `assessment.routes.ts`

**描述**: get /record/:recordId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /report/:recordId

**文件**: `assessment.routes.ts`

**描述**: get /report/:recordId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-records

**文件**: `assessment.routes.ts`

**描述**: get /my-records

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /growth-trajectory

**文件**: `assessment.routes.ts`

**描述**: get /growth-trajectory

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `attendance-center.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/daily

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/daily

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/weekly

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/weekly

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/monthly

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/monthly

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/quarterly

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/quarterly

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/yearly

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/yearly

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/by-class

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/by-class

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/by-age

**文件**: `attendance-center.routes.ts`

**描述**: get /statistics/by-age

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /records

**文件**: `attendance-center.routes.ts`

**描述**: get /records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /records/:id

**文件**: `attendance-center.routes.ts`

**描述**: put /records/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /records/:id

**文件**: `attendance-center.routes.ts`

**描述**: delete /records/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /records/reset

**文件**: `attendance-center.routes.ts`

**描述**: post /records/reset

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /abnormal

**文件**: `attendance-center.routes.ts`

**描述**: get /abnormal

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `attendance-center.routes.ts`

**描述**: get /health

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /export

**文件**: `attendance-center.routes.ts`

**描述**: post /export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /import

**文件**: `attendance-center.routes.ts`

**描述**: post /import

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permissions

**文件**: `auth-permissions.routes.ts`

**描述**: get /permissions

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /menu

**文件**: `auth-permissions.routes.ts`

**描述**: get /menu

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-permission

**文件**: `auth-permissions.routes.ts`

**描述**: post /check-permission

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /roles

**文件**: `auth-permissions.routes.ts`

**描述**: get /roles

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /login

**文件**: `auth.routes.ts`

**描述**: post /login

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /logout

**文件**: `auth.routes.ts`

**描述**: post /logout

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /register

**文件**: `auth.routes.ts`

**描述**: post /register

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /refresh-token

**文件**: `auth.routes.ts`

**描述**: post /refresh-token

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /verify-token

**文件**: `auth.routes.ts`

**描述**: get /verify-token

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /verify

**文件**: `auth.routes.ts`

**描述**: get /verify

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /me

**文件**: `auth.routes.ts`

**描述**: get /me

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /profile

**文件**: `auth.routes.ts`

**描述**: get /profile

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /menu

**文件**: `auth.routes.ts`

**描述**: get /menu

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /roles

**文件**: `auth.routes.ts`

**描述**: get /roles

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate

**文件**: `auto-image.routes.ts`

**描述**: post /generate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /activity

**文件**: `auto-image.routes.ts`

**描述**: post /activity

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /poster

**文件**: `auto-image.routes.ts`

**描述**: post /poster

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /template

**文件**: `auto-image.routes.ts`

**描述**: post /template

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch

**文件**: `auto-image.routes.ts`

**描述**: post /batch

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /status

**文件**: `auto-image.routes.ts`

**描述**: get /status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `base.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `base.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `base.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `base.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `base.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /preview

**文件**: `batch-import.routes.ts`

**描述**: post /preview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customer-preview

**文件**: `batch-import.routes.ts`

**描述**: post /customer-preview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /execute

**文件**: `batch-import.routes.ts`

**描述**: post /execute

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /template/:entityType

**文件**: `batch-import.routes.ts`

**描述**: get /template/:entityType

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `business-center.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /timeline

**文件**: `business-center.routes.ts`

**描述**: get /timeline

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-progress

**文件**: `business-center.routes.ts`

**描述**: get /enrollment-progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `business-center.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `business-center.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching-integration

**文件**: `business-center.routes.ts`

**描述**: get /teaching-integration

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `call-center.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /call/make

**文件**: `call-center.routes.ts`

**描述**: post /call/make

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /call/:callId/status

**文件**: `call-center.routes.ts`

**描述**: get /call/:callId/status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /call/hangup

**文件**: `call-center.routes.ts`

**描述**: post /call/hangup

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /calls/active

**文件**: `call-center.routes.ts`

**描述**: get /calls/active

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /calls/active

**文件**: `call-center.routes.ts`

**描述**: get /calls/active

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /calls/history

**文件**: `call-center.routes.ts`

**描述**: get /calls/history

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /calls/statistics

**文件**: `call-center.routes.ts`

**描述**: get /calls/statistics

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /call/:callId/recording/start

**文件**: `call-center.routes.ts`

**描述**: post /call/:callId/recording/start

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /call/:callId/recording/stop

**文件**: `call-center.routes.ts`

**描述**: post /call/:callId/recording/stop

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recordings

**文件**: `call-center.routes.ts`

**描述**: get /recordings

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recordings/:id

**文件**: `call-center.routes.ts`

**描述**: get /recordings/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /recordings/:id

**文件**: `call-center.routes.ts`

**描述**: delete /recordings/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recordings/:id/download

**文件**: `call-center.routes.ts`

**描述**: get /recordings/:id/download

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recordings/:id/transcript

**文件**: `call-center.routes.ts`

**描述**: get /recordings/:id/transcript

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /recordings/:id/transcript

**文件**: `call-center.routes.ts`

**描述**: put /recordings/:id/transcript

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /recordings/:id/transcribe

**文件**: `call-center.routes.ts`

**描述**: post /recordings/:id/transcribe

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/analyze/:callId

**文件**: `call-center.routes.ts`

**描述**: post /ai/analyze/:callId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/batch-analyze

**文件**: `call-center.routes.ts`

**描述**: post /ai/batch-analyze

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/synthesize

**文件**: `call-center.routes.ts`

**描述**: post /ai/synthesize

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /ai/synthesize/:taskId/status

**文件**: `call-center.routes.ts`

**描述**: get /ai/synthesize/:taskId/status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/tts/test

**文件**: `call-center.routes.ts`

**描述**: post /ai/tts/test

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /ai/tts/voices

**文件**: `call-center.routes.ts`

**描述**: get /ai/tts/voices

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/generate-script

**文件**: `call-center.routes.ts`

**描述**: post /ai/generate-script

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/speech-to-text

**文件**: `call-center.routes.ts`

**描述**: post /ai/speech-to-text

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/check-compliance

**文件**: `call-center.routes.ts`

**描述**: post /ai/check-compliance

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/transcribe/:callId/start

**文件**: `call-center.routes.ts`

**描述**: post /ai/transcribe/:callId/start

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/transcribe/:callId/stop

**文件**: `call-center.routes.ts`

**描述**: post /ai/transcribe/:callId/stop

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /ai/transcribe/:callId/result

**文件**: `call-center.routes.ts`

**描述**: get /ai/transcribe/:callId/result

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /ai/sentiment/:callId

**文件**: `call-center.routes.ts`

**描述**: get /ai/sentiment/:callId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/generate-response/:callId

**文件**: `call-center.routes.ts`

**描述**: post /ai/generate-response/:callId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /extensions

**文件**: `call-center.routes.ts`

**描述**: get /extensions

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /extensions/:id

**文件**: `call-center.routes.ts`

**描述**: get /extensions/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /extensions/:id/status

**文件**: `call-center.routes.ts`

**描述**: put /extensions/:id/status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /extensions/:id/reset

**文件**: `call-center.routes.ts`

**描述**: post /extensions/:id/reset

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /contacts

**文件**: `call-center.routes.ts`

**描述**: get /contacts

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /contacts

**文件**: `call-center.routes.ts`

**描述**: post /contacts

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /contacts/:id

**文件**: `call-center.routes.ts`

**描述**: put /contacts/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /contacts/:id

**文件**: `call-center.routes.ts`

**描述**: delete /contacts/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /contacts/search

**文件**: `call-center.routes.ts`

**描述**: get /contacts/search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /realtime/status

**文件**: `call-center.routes.ts`

**描述**: get /realtime/status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `change-log.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `change-log.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `change-log.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `change-log.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `change-log.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `channel-tracking.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `channel-tracking.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `channel-tracking.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `channel-tracking.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `channel-tracking.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `channel-tracking.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE, CHANNEL_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `channel-trackings.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `channel-trackings.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `channel-trackings.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `channel-trackings.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `channel-trackings.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `channels.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `channels.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `channels.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `channels.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `channels.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `chat.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /sessions

**文件**: `chat.routes.ts`

**描述**: get /sessions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /sessions

**文件**: `chat.routes.ts`

**描述**: post /sessions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /messages

**文件**: `chat.routes.ts`

**描述**: post /messages

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /sessions/:sessionId/messages

**文件**: `chat.routes.ts`

**描述**: get /sessions/:sessionId/messages

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `class.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `class.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `class.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `class.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `class.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `class.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `class.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/students

**文件**: `class.routes.ts`

**描述**: get /:id/students

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/students

**文件**: `class.routes.ts`

**描述**: post /:id/students

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id/students/:studentId

**文件**: `class.routes.ts`

**描述**: delete /:id/students/:studentId

**认证**: ✅ 需要

**权限**: CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE, CLASS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `classes.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `classes.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `classes.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `classes.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `classes.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-channel/:channelId

**文件**: `conversion-tracking.routes.ts`

**描述**: get /by-channel/:channelId

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `conversion-tracking.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `conversion-tracking.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `conversion-tracking.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `conversion-tracking.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `conversion-tracking.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /report

**文件**: `conversion-tracking.routes.ts`

**描述**: get /report

**认证**: ✅ 需要

**权限**: CONVERSION_TRACKING_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `conversion-trackings.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `conversion-trackings.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `conversion-trackings.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `conversion-trackings.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `conversion-trackings.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `coupons.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `coupons.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `coupons.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `coupons.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `coupons.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /teacher/customer-applications

**文件**: `customer-applications.routes.ts`

**描述**: post /teacher/customer-applications

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teacher/customer-applications

**文件**: `customer-applications.routes.ts`

**描述**: get /teacher/customer-applications

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /principal/customer-applications

**文件**: `customer-applications.routes.ts`

**描述**: get /principal/customer-applications

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /principal/customer-applications/:id/review

**文件**: `customer-applications.routes.ts`

**描述**: post /principal/customer-applications/:id/review

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /principal/customer-applications/batch-review

**文件**: `customer-applications.routes.ts`

**描述**: post /principal/customer-applications/batch-review

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `customer-applications.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customer-applications/:id

**文件**: `customer-applications.routes.ts`

**描述**: get /customer-applications/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /records

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: post /records

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /records/:id

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: put /records/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customers/:customerId/timeline

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: get /customers/:customerId/timeline

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stages

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: get /stages

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /records/:followRecordId/ai-suggestions

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: get /records/:followRecordId/ai-suggestions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /records/:followRecordId/complete

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: post /records/:followRecordId/complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /records/:followRecordId/skip

**文件**: `customer-follow-enhanced.routes.ts`

**描述**: post /records/:followRecordId/skip

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `customer-pool.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `customer-pool.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `customer-pool.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `customer-pool.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `customer-pool.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `customer-pool.routes.ts`

**描述**: get /list

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /assign

**文件**: `customer-pool.routes.ts`

**描述**: post /assign

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-assign

**文件**: `customer-pool.routes.ts`

**描述**: post /batch-assign

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /export

**文件**: `customer-pool.routes.ts`

**描述**: get /export

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-source/:source

**文件**: `customer-pool.routes.ts`

**描述**: get /by-source/:source

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-status/:status

**文件**: `customer-pool.routes.ts`

**描述**: get /by-status/:status

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/follow-ups

**文件**: `customer-pool.routes.ts`

**描述**: get /:id/follow-ups

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `customer-pool.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /import

**文件**: `customer-pool.routes.ts`

**描述**: post /import

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/follow-up

**文件**: `customer-pool.routes.ts`

**描述**: post /:id/follow-up

**认证**: ✅ 需要

**权限**: CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE, CUSTOMER_POOL_CENTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `customers.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `customers.routes.ts`

**描述**: get /list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `dashboard.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `dashboard.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /real-time/system-status

**文件**: `dashboard.routes.ts`

**描述**: get /real-time/system-status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `dashboard.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /todos

**文件**: `dashboard.routes.ts`

**描述**: get /todos

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /schedule-data

**文件**: `dashboard.routes.ts`

**描述**: get /schedule-data

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /schedules

**文件**: `dashboard.routes.ts`

**描述**: get /schedules

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /principal/stats

**文件**: `dashboard.routes.ts`

**描述**: get /principal/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /principal/customer-pool/stats

**文件**: `dashboard.routes.ts`

**描述**: get /principal/customer-pool/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /principal/customer-pool/list

**文件**: `dashboard.routes.ts`

**描述**: get /principal/customer-pool/list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /notices/stats

**文件**: `dashboard.routes.ts`

**描述**: get /notices/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /notices/important

**文件**: `dashboard.routes.ts`

**描述**: get /notices/important

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /notices/:id/read

**文件**: `dashboard.routes.ts`

**描述**: post /notices/:id/read

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /notices/mark-all-read

**文件**: `dashboard.routes.ts`

**描述**: post /notices/mark-all-read

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /notices/:id

**文件**: `dashboard.routes.ts`

**描述**: delete /notices/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /schedule

**文件**: `dashboard.routes.ts`

**描述**: get /schedule

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-trend

**文件**: `dashboard.routes.ts`

**描述**: get /enrollment-trend

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes

**文件**: `dashboard.routes.ts`

**描述**: get /classes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /todos

**文件**: `dashboard.routes.ts`

**描述**: post /todos

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /todos/:id/status

**文件**: `dashboard.routes.ts`

**描述**: patch /todos/:id/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /todos/:id

**文件**: `dashboard.routes.ts`

**描述**: delete /todos/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-trends

**文件**: `dashboard.routes.ts`

**描述**: get /enrollment-trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channel-analysis

**文件**: `dashboard.routes.ts`

**描述**: get /channel-analysis

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /conversion-funnel

**文件**: `dashboard.routes.ts`

**描述**: get /conversion-funnel

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activities

**文件**: `dashboard.routes.ts`

**描述**: get /activities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /class-create

**文件**: `dashboard.routes.ts`

**描述**: get /class-create

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /class-detail/:id?

**文件**: `dashboard.routes.ts`

**描述**: get /class-detail/:id?

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /class-list

**文件**: `dashboard.routes.ts`

**描述**: get /class-list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /custom-layout

**文件**: `dashboard.routes.ts`

**描述**: get /custom-layout

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /data-statistics

**文件**: `dashboard.routes.ts`

**描述**: get /data-statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /charts

**文件**: `dashboard.routes.ts`

**描述**: get /charts

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /kindergarten

**文件**: `dashboard.routes.ts`

**描述**: get /kindergarten

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /campus-overview

**文件**: `dashboard.routes.ts`

**描述**: get /campus-overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/table

**文件**: `dashboard.routes.ts`

**描述**: get /statistics/table

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/enrollment-trends

**文件**: `dashboard.routes.ts`

**描述**: get /statistics/enrollment-trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/activity-data

**文件**: `dashboard.routes.ts`

**描述**: get /statistics/activity-data

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /cache/stats

**文件**: `dashboard.routes.ts`

**描述**: get /cache/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cache/clear

**文件**: `dashboard.routes.ts`

**描述**: post /cache/clear

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-permission

**文件**: `data-import.routes.ts`

**描述**: post /check-permission

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /parse

**文件**: `data-import.routes.ts`

**描述**: post /parse

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /schema/:type

**文件**: `data-import.routes.ts`

**描述**: get /schema/:type

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /mapping

**文件**: `data-import.routes.ts`

**描述**: post /mapping

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /preview

**文件**: `data-import.routes.ts`

**描述**: post /preview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /execute

**文件**: `data-import.routes.ts`

**描述**: post /execute

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `data-import.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /supported-types

**文件**: `data-import.routes.ts`

**描述**: get /supported-types

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tables

**文件**: `database-metadata.routes.ts`

**描述**: get /tables

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tables/:tableName

**文件**: `database-metadata.routes.ts`

**描述**: get /tables/:tableName

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tables/:tableName/indexes

**文件**: `database-metadata.routes.ts`

**描述**: get /tables/:tableName/indexes

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tables/:tableName/relations

**文件**: `database-metadata.routes.ts`

**描述**: get /tables/:tableName/relations

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permissions

**文件**: `document-import.routes.ts`

**描述**: get /permissions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /formats

**文件**: `document-import.routes.ts`

**描述**: get /formats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /preview

**文件**: `document-import.routes.ts`

**描述**: post /preview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /import

**文件**: `document-import.routes.ts`

**描述**: post /import

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `document-import.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-delete

**文件**: `document-instance.routes.ts`

**描述**: post /batch-delete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/export

**文件**: `document-instance.routes.ts`

**描述**: get /:id/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/assign

**文件**: `document-instance.routes.ts`

**描述**: post /:id/assign

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/submit

**文件**: `document-instance.routes.ts`

**描述**: post /:id/submit

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/review

**文件**: `document-instance.routes.ts`

**描述**: post /:id/review

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/comments

**文件**: `document-instance.routes.ts`

**描述**: get /:id/comments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/comments

**文件**: `document-instance.routes.ts`

**描述**: post /:id/comments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/versions

**文件**: `document-instance.routes.ts`

**描述**: get /:id/versions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/versions

**文件**: `document-instance.routes.ts`

**描述**: post /:id/versions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `document-instance.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `document-instance.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `document-instance.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `document-instance.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `document-instance.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `document-statistics.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trends

**文件**: `document-statistics.routes.ts`

**描述**: get /trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /template-ranking

**文件**: `document-statistics.routes.ts`

**描述**: get /template-ranking

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /completion-rate

**文件**: `document-statistics.routes.ts`

**描述**: get /completion-rate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user-stats

**文件**: `document-statistics.routes.ts`

**描述**: get /user-stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /export

**文件**: `document-statistics.routes.ts`

**描述**: get /export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /categories

**文件**: `document-template.routes.ts`

**描述**: get /categories

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recommend

**文件**: `document-template.routes.ts`

**描述**: get /recommend

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /search

**文件**: `document-template.routes.ts`

**描述**: get /search

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `document-template.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `document-template.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /ai-status

**文件**: `enrollment-ai.routes.ts`

**描述**: get /ai-status

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trends

**文件**: `enrollment-ai.routes.ts`

**描述**: get /trends

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/smart-planning

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/smart-planning

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/forecast

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/forecast

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/strategy

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/strategy

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/optimization

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/optimization

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/simulation

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/simulation

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/evaluation

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/evaluation

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plan/:id/ai-history

**文件**: `enrollment-ai.routes.ts`

**描述**: get /plan/:id/ai-history

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan/:id/batch-analysis

**文件**: `enrollment-ai.routes.ts`

**描述**: post /plan/:id/batch-analysis

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plan/:id/export-ai-report

**文件**: `enrollment-ai.routes.ts`

**描述**: get /plan/:id/export-ai-report

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-application.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-application.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-application.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-application.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-application.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-plan/:planId

**文件**: `enrollment-application.routes.ts`

**描述**: get /by-plan/:planId

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-status/:status

**文件**: `enrollment-application.routes.ts`

**描述**: get /by-status/:status

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/documents

**文件**: `enrollment-application.routes.ts`

**描述**: post /:id/documents

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/documents

**文件**: `enrollment-application.routes.ts`

**描述**: get /:id/documents

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/interview

**文件**: `enrollment-application.routes.ts`

**描述**: post /:id/interview

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/review

**文件**: `enrollment-application.routes.ts`

**描述**: put /:id/review

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id/status

**文件**: `enrollment-application.routes.ts`

**描述**: patch /:id/status

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/review

**文件**: `enrollment-application.routes.ts`

**描述**: post /:id/review

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:applicationId/materials

**文件**: `enrollment-application.routes.ts`

**描述**: get /:applicationId/materials

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:applicationId/materials

**文件**: `enrollment-application.routes.ts`

**描述**: post /:applicationId/materials

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /materials/:materialId

**文件**: `enrollment-application.routes.ts`

**描述**: delete /materials/:materialId

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /materials/:materialId/verify

**文件**: `enrollment-application.routes.ts`

**描述**: post /materials/:materialId/verify

**认证**: ✅ 需要

**权限**: ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE, ENROLLMENT_APPLICATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-applications.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-applications.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-applications.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-applications.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-applications.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `enrollment-center.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans

**文件**: `enrollment-center.routes.ts`

**描述**: get /plans

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plans

**文件**: `enrollment-center.routes.ts`

**描述**: post /plans

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans/:id

**文件**: `enrollment-center.routes.ts`

**描述**: get /plans/:id

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /plans/:id

**文件**: `enrollment-center.routes.ts`

**描述**: put /plans/:id

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /plans/:id

**文件**: `enrollment-center.routes.ts`

**描述**: delete /plans/:id

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /applications

**文件**: `enrollment-center.routes.ts`

**描述**: get /applications

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /applications/:id

**文件**: `enrollment-center.routes.ts`

**描述**: get /applications/:id

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /applications/:id/status

**文件**: `enrollment-center.routes.ts`

**描述**: put /applications/:id/status

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /consultations

**文件**: `enrollment-center.routes.ts`

**描述**: get /consultations

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /consultations/statistics

**文件**: `enrollment-center.routes.ts`

**描述**: get /consultations/statistics

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /analytics/trends

**文件**: `enrollment-center.routes.ts`

**描述**: get /analytics/trends

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/predict

**文件**: `enrollment-center.routes.ts`

**描述**: post /ai/predict

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai/strategy

**文件**: `enrollment-center.routes.ts`

**描述**: post /ai/strategy

**认证**: ✅ 需要

**权限**: enrollment:overview:view, enrollment:plans:view, enrollment:plans:create, enrollment:plans:view, enrollment:plans:update, enrollment:plans:delete, enrollment:applications:view, enrollment:applications:view, enrollment:applications:approve, enrollment:consultations:view, enrollment:consultations:view, enrollment:analytics:view, enrollment:ai:use, enrollment:ai:use

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-consultation.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-consultation.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `enrollment-consultation.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /followups

**文件**: `enrollment-consultation.routes.ts`

**描述**: post /followups

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /followups

**文件**: `enrollment-consultation.routes.ts`

**描述**: get /followups

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /followups/:id

**文件**: `enrollment-consultation.routes.ts`

**描述**: get /followups/:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-consultation.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-consultation.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-consultation.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE, ENROLLMENT_CONSULTATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-consultations.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-consultations.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-consultations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-consultations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-consultations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /test

**文件**: `enrollment-finance.routes.ts`

**描述**: get /test

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /linkages

**文件**: `enrollment-finance.routes.ts`

**描述**: get /linkages

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `enrollment-finance.routes.ts`

**描述**: get /stats

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `enrollment-finance.routes.ts`

**描述**: get /statistics

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /fee-package-templates

**文件**: `enrollment-finance.routes.ts`

**描述**: get /fee-package-templates

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /fee-templates

**文件**: `enrollment-finance.routes.ts`

**描述**: get /fee-templates

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /process/:id

**文件**: `enrollment-finance.routes.ts`

**描述**: get /process/:id

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /confirm-payment

**文件**: `enrollment-finance.routes.ts`

**描述**: post /confirm-payment

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /send-payment-reminder

**文件**: `enrollment-finance.routes.ts`

**描述**: post /send-payment-reminder

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-bill

**文件**: `enrollment-finance.routes.ts`

**描述**: post /generate-bill

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-generate-bills

**文件**: `enrollment-finance.routes.ts`

**描述**: post /batch-generate-bills

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /config

**文件**: `enrollment-finance.routes.ts`

**描述**: get /config

**认证**: ❌ 不需要

**权限**: FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW, FINANCE_ENROLLMENT_LINKAGE_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-interview.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-interview.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `enrollment-interview.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-interview.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-interview.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-interview.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE, ENROLLMENT_INTERVIEW_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-interviews.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-interviews.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-interviews.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-interviews.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-interviews.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-plan.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-plan.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `enrollment-plan.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /analytics

**文件**: `enrollment-plan.routes.ts`

**描述**: get /analytics

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-plan.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-plan.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-plan.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/classes

**文件**: `enrollment-plan.routes.ts`

**描述**: post /:id/classes

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/assignees

**文件**: `enrollment-plan.routes.ts`

**描述**: post /:id/assignees

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/statistics

**文件**: `enrollment-plan.routes.ts`

**描述**: get /:id/statistics

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/trackings

**文件**: `enrollment-plan.routes.ts`

**描述**: get /:id/trackings

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/trackings

**文件**: `enrollment-plan.routes.ts`

**描述**: post /:id/trackings

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/status

**文件**: `enrollment-plan.routes.ts`

**描述**: put /:id/status

**认证**: ✅ 需要

**权限**: ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE, ENROLLMENT_PLAN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-plans.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-plans.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-plans.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-plans.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-plans.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-quota.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-quota.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-plan/:planId

**文件**: `enrollment-quota.routes.ts`

**描述**: get /by-plan/:planId

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-class/:classId

**文件**: `enrollment-quota.routes.ts`

**描述**: get /by-class/:classId

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-quota.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-quota.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-quota.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /allocate

**文件**: `enrollment-quota.routes.ts`

**描述**: post /allocate

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/:planId

**文件**: `enrollment-quota.routes.ts`

**描述**: get /statistics/:planId

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-adjust

**文件**: `enrollment-quota.routes.ts`

**描述**: post /batch-adjust

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id/adjust

**文件**: `enrollment-quota.routes.ts`

**描述**: patch /:id/adjust

**认证**: ✅ 需要

**权限**: ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE, ENROLLMENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-quotas.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-quotas.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-quotas.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-quotas.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-quotas.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trend

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /trend

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channel

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /channel

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /plans

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /channels

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activities

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /activities

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /conversions

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /conversions

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /performance

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /performance

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trends

**文件**: `enrollment-statistics.routes.ts`

**描述**: get /trends

**认证**: ✅ 需要

**权限**: ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE, ENROLLMENT_STATISTICS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment-tasks.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `enrollment-tasks.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment-tasks.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `enrollment-tasks.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment-tasks.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `enrollment.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `enrollment.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `enrollment.routes.ts`

**描述**: get /list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `enrollment.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /follow

**文件**: `enrollment.routes.ts`

**描述**: post /follow

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `enrollment.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `enterprise-dashboard.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /critical

**文件**: `errors.routes.ts`

**描述**: post /critical

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /report

**文件**: `errors.routes.ts`

**描述**: post /report

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `errors.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `errors.routes.ts`

**描述**: get /health

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `example.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `example.routes.ts`

**描述**: get /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `example.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /popular/:entityType

**文件**: `field-template.routes.ts`

**描述**: get /popular/:entityType

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recent

**文件**: `field-template.routes.ts`

**描述**: get /recent

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `field-template.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `field-template.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `field-template.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/apply

**文件**: `field-template.routes.ts`

**描述**: post /:id/apply

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `field-template.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `field-template.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `files.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload

**文件**: `files.routes.ts`

**描述**: post /upload

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload-multiple

**文件**: `files.routes.ts`

**描述**: post /upload-multiple

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `files.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /storage-info

**文件**: `files.routes.ts`

**描述**: get /storage-info

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cleanup-temp

**文件**: `files.routes.ts`

**描述**: post /cleanup-temp

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /download/:id

**文件**: `files.routes.ts`

**描述**: get /download/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `files.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `files.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `files.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `finance.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /today-payments

**文件**: `finance.routes.ts`

**描述**: get /today-payments

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /fee-package-templates

**文件**: `finance.routes.ts`

**描述**: get /fee-package-templates

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /fee-items

**文件**: `finance.routes.ts`

**描述**: get /fee-items

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /payment-records

**文件**: `finance.routes.ts`

**描述**: get /payment-records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /reports

**文件**: `finance.routes.ts`

**描述**: get /reports

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-finance

**文件**: `finance.routes.ts`

**描述**: get /enrollment-finance

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /analysis

**文件**: `followup-analysis.routes.ts`

**描述**: get /analysis

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /ai-analysis

**文件**: `followup-analysis.routes.ts`

**描述**: post /ai-analysis

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-pdf

**文件**: `followup-analysis.routes.ts`

**描述**: post /generate-pdf

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `game.routes.ts`

**描述**: get /list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:gameKey

**文件**: `game.routes.ts`

**描述**: get /:gameKey

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:gameKey/levels

**文件**: `game.routes.ts`

**描述**: get /:gameKey/levels

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /record

**文件**: `game.routes.ts`

**描述**: post /record

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /settings/user

**文件**: `game.routes.ts`

**描述**: get /settings/user

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /settings/user

**文件**: `game.routes.ts`

**描述**: put /settings/user

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics/user

**文件**: `game.routes.ts`

**描述**: get /statistics/user

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:gameKey/leaderboard

**文件**: `game.routes.ts`

**描述**: get /:gameKey/leaderboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `group.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my

**文件**: `group.routes.ts`

**描述**: get /my

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `group.routes.ts`

**描述**: get /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `group.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `group.routes.ts`

**描述**: put /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `group.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:groupId/users

**文件**: `group.routes.ts`

**描述**: get /:groupId/users

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:groupId/users

**文件**: `group.routes.ts`

**描述**: post /:groupId/users

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:groupId/users/:userId

**文件**: `group.routes.ts`

**描述**: put /:groupId/users/:userId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:groupId/users/:userId

**文件**: `group.routes.ts`

**描述**: delete /:groupId/users/:userId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/statistics

**文件**: `group.routes.ts`

**描述**: get /:id/statistics

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/activities

**文件**: `group.routes.ts`

**描述**: get /:id/activities

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/enrollment

**文件**: `group.routes.ts`

**描述**: get /:id/enrollment

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /check-upgrade

**文件**: `group.routes.ts`

**描述**: get /check-upgrade

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upgrade

**文件**: `group.routes.ts`

**描述**: post /upgrade

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/add-kindergarten

**文件**: `group.routes.ts`

**描述**: post /:id/add-kindergarten

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/remove-kindergarten

**文件**: `group.routes.ts`

**描述**: post /:id/remove-kindergarten

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /document-analysis

**文件**: `inspection-ai.routes.ts`

**描述**: post /document-analysis

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plan-analysis

**文件**: `inspection-ai.routes.ts`

**描述**: post /plan-analysis

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `inspection-record.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `inspection-record.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plan/:planId

**文件**: `inspection-record.routes.ts`

**描述**: get /plan/:planId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `inspection-record.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `inspection-record.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `inspection-record.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `inspection-rectification.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `inspection-rectification.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plan/:planId

**文件**: `inspection-rectification.routes.ts`

**描述**: get /plan/:planId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `inspection-rectification.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `inspection-rectification.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/complete

**文件**: `inspection-rectification.routes.ts`

**描述**: post /:id/complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/verify

**文件**: `inspection-rectification.routes.ts`

**描述**: post /:id/verify

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/progress

**文件**: `inspection-rectification.routes.ts`

**描述**: post /:id/progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/progress

**文件**: `inspection-rectification.routes.ts`

**描述**: get /:id/progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `inspection-rectification.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /types

**文件**: `inspection.routes.ts`

**描述**: get /types

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /types/active

**文件**: `inspection.routes.ts`

**描述**: get /types/active

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /types/:id

**文件**: `inspection.routes.ts`

**描述**: get /types/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /types

**文件**: `inspection.routes.ts`

**描述**: post /types

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /types/:id

**文件**: `inspection.routes.ts`

**描述**: put /types/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /types/:id

**文件**: `inspection.routes.ts`

**描述**: delete /types/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /types/batch-delete

**文件**: `inspection.routes.ts`

**描述**: post /types/batch-delete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans

**文件**: `inspection.routes.ts`

**描述**: get /plans

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans/timeline

**文件**: `inspection.routes.ts`

**描述**: get /plans/timeline

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans/:id

**文件**: `inspection.routes.ts`

**描述**: get /plans/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plans

**文件**: `inspection.routes.ts`

**描述**: post /plans

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plans/generate-yearly

**文件**: `inspection.routes.ts`

**描述**: post /plans/generate-yearly

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /plans/:id

**文件**: `inspection.routes.ts`

**描述**: put /plans/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /plans/:id

**文件**: `inspection.routes.ts`

**描述**: delete /plans/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /plans/:id/tasks

**文件**: `inspection.routes.ts`

**描述**: get /plans/:id/tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /plans/:id/tasks

**文件**: `inspection.routes.ts`

**描述**: post /plans/:id/tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /plans/:id/tasks/:taskId

**文件**: `inspection.routes.ts`

**描述**: put /plans/:id/tasks/:taskId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /plans/:id/tasks/:taskId

**文件**: `inspection.routes.ts`

**描述**: delete /plans/:id/tasks/:taskId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate

**文件**: `interactive-curriculum.routes.ts`

**描述**: post /generate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /progress/:taskId

**文件**: `interactive-curriculum.routes.ts`

**描述**: get /progress/:taskId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /thinking/:taskId

**文件**: `interactive-curriculum.routes.ts`

**描述**: get /thinking/:taskId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-stream

**文件**: `interactive-curriculum.routes.ts`

**描述**: post /generate-stream

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /thinking-stream/:taskId

**文件**: `interactive-curriculum.routes.ts`

**描述**: get /thinking-stream/:taskId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `interactive-curriculum.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/save

**文件**: `interactive-curriculum.routes.ts`

**描述**: post /:id/save

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /basic-info

**文件**: `kindergarten-basic-info.routes.ts`

**描述**: get /basic-info

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /basic-info

**文件**: `kindergarten-basic-info.routes.ts`

**描述**: put /basic-info

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload-image

**文件**: `kindergarten-basic-info.routes.ts`

**描述**: post /upload-image

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload-images

**文件**: `kindergarten-basic-info.routes.ts`

**描述**: post /upload-images

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /completeness

**文件**: `kindergarten-completeness.routes.ts`

**描述**: get /completeness

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /missing-fields

**文件**: `kindergarten-completeness.routes.ts`

**描述**: get /missing-fields

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /base-info/batch

**文件**: `kindergarten-completeness.routes.ts`

**描述**: put /base-info/batch

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /calculate-completeness

**文件**: `kindergarten-completeness.routes.ts`

**描述**: post /calculate-completeness

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /field-config

**文件**: `kindergarten-completeness.routes.ts`

**描述**: get /field-config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `kindergarten.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `kindergarten.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `kindergarten.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `kindergarten.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `kindergarten.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE, KINDERGARTEN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `kindergartens.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `kindergartens.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `kindergartens.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `kindergartens.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `kindergartens.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `like-collect-config.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `like-collect-config.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `like-collect-config.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `like-collect-config.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `like-collect-config.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `like-collect-records.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `like-collect-records.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `like-collect-records.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `like-collect-records.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `like-collect-records.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-type/:type

**文件**: `marketing-campaign.routes.ts`

**描述**: get /by-type/:type

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-status/:status

**文件**: `marketing-campaign.routes.ts`

**描述**: get /by-status/:status

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/roi

**文件**: `marketing-campaign.routes.ts`

**描述**: get /:id/roi

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/performance

**文件**: `marketing-campaign.routes.ts`

**描述**: get /:id/performance

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/launch

**文件**: `marketing-campaign.routes.ts`

**描述**: post /:id/launch

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/pause

**文件**: `marketing-campaign.routes.ts`

**描述**: post /:id/pause

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `marketing-campaign.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `marketing-campaign.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `marketing-campaign.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `marketing-campaign.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `marketing-campaign.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/rules

**文件**: `marketing-campaign.routes.ts`

**描述**: put /:id/rules

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/:kindergartenId

**文件**: `marketing-campaign.routes.ts`

**描述**: get /stats/:kindergartenId

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/launch

**文件**: `marketing-campaign.routes.ts`

**描述**: put /:id/launch

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/pause

**文件**: `marketing-campaign.routes.ts`

**描述**: put /:id/pause

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/end

**文件**: `marketing-campaign.routes.ts`

**描述**: put /:id/end

**认证**: ✅ 需要

**权限**: MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE, MARKETING_CAMPAIGN_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `marketing-campaigns.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `marketing-campaigns.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `marketing-campaigns.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `marketing-campaigns.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `marketing-campaigns.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `marketing-campaigns.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `marketing-center.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /campaigns/recent

**文件**: `marketing-center.routes.ts`

**描述**: get /campaigns/recent

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels

**文件**: `marketing-center.routes.ts`

**描述**: get /channels

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels

**文件**: `marketing.routes.ts`

**描述**: get /channels

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels/tags

**文件**: `marketing.routes.ts`

**描述**: get /channels/tags

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /channels

**文件**: `marketing.routes.ts`

**描述**: post /channels

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /channels/:id

**文件**: `marketing.routes.ts`

**描述**: put /channels/:id

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /channels/:id

**文件**: `marketing.routes.ts`

**描述**: delete /channels/:id

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels/:id/contacts

**文件**: `marketing.routes.ts`

**描述**: get /channels/:id/contacts

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /channels/:id/contacts

**文件**: `marketing.routes.ts`

**描述**: post /channels/:id/contacts

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /channels/:id/contacts/:contactId

**文件**: `marketing.routes.ts`

**描述**: delete /channels/:id/contacts/:contactId

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels/:id/tags

**文件**: `marketing.routes.ts`

**描述**: get /channels/:id/tags

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /channels/:id/tags

**文件**: `marketing.routes.ts`

**描述**: post /channels/:id/tags

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /channels/:id/tags/:tagId

**文件**: `marketing.routes.ts`

**描述**: delete /channels/:id/tags/:tagId

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /channels/:id/metrics

**文件**: `marketing.routes.ts`

**描述**: get /channels/:id/metrics

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals

**文件**: `marketing.routes.ts`

**描述**: get /referrals

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals/stats

**文件**: `marketing.routes.ts`

**描述**: get /referrals/stats

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals/graph

**文件**: `marketing.routes.ts`

**描述**: get /referrals/graph

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals/my-codes

**文件**: `marketing.routes.ts`

**描述**: get /referrals/my-codes

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /referrals/generate

**文件**: `marketing.routes.ts`

**描述**: post /referrals/generate

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals/poster-templates

**文件**: `marketing.routes.ts`

**描述**: get /referrals/poster-templates

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /referrals/generate-poster

**文件**: `marketing.routes.ts`

**描述**: post /referrals/generate-poster

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /referrals/:code/stats

**文件**: `marketing.routes.ts`

**描述**: get /referrals/:code/stats

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /referrals/:code/track

**文件**: `marketing.routes.ts`

**描述**: post /referrals/:code/track

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/conversions

**文件**: `marketing.routes.ts`

**描述**: get /stats/conversions

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/funnel

**文件**: `marketing.routes.ts`

**描述**: get /stats/funnel

**认证**: ✅ 需要

**权限**: MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE, MARKETING_CHANNELS_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recent-creations

**文件**: `media-center.routes.ts`

**描述**: get /recent-creations

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `media-center.routes.ts`

**描述**: get /history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `media-center.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /content

**文件**: `media-center.routes.ts`

**描述**: post /content

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /content/:id

**文件**: `media-center.routes.ts`

**描述**: get /content/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /content/:id

**文件**: `media-center.routes.ts`

**描述**: put /content/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /content/:id

**文件**: `media-center.routes.ts`

**描述**: delete /content/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `message-templates.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `message-templates.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `message-templates.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `message-templates.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `message-templates.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /activity-poster-tables

**文件**: `migration.routes.ts`

**描述**: post /activity-poster-tables

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /fix-ai-memories

**文件**: `migration.routes.ts`

**描述**: post /fix-ai-memories

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /status

**文件**: `migration.routes.ts`

**描述**: get /status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /rollback

**文件**: `migration.routes.ts`

**描述**: post /rollback

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `notification-center.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `notification-center.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:notificationId/readers

**文件**: `notification-center.routes.ts`

**描述**: get /:notificationId/readers

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:notificationId/export

**文件**: `notification-center.routes.ts`

**描述**: post /:notificationId/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `notification-center.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `notifications.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /unread/count

**文件**: `notifications.routes.ts`

**描述**: get /unread/count

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /unread-count

**文件**: `notifications.routes.ts`

**描述**: get /unread-count

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /mark-all-read

**文件**: `notifications.routes.ts`

**描述**: patch /mark-all-read

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-read

**文件**: `notifications.routes.ts`

**描述**: post /batch-read

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `notifications.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `notifications.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `notifications.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id/read

**文件**: `notifications.routes.ts`

**描述**: patch /:id/read

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `notifications.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `operation-logs.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `operation-logs.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `operation-logs.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `operation-logs.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /cleanup

**文件**: `operation-logs.routes.ts`

**描述**: delete /cleanup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /default

**文件**: `organization-status.routes.ts`

**描述**: get /default

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:kindergartenId

**文件**: `organization-status.routes.ts`

**描述**: get /:kindergartenId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:kindergartenId/refresh

**文件**: `organization-status.routes.ts`

**描述**: post /:kindergartenId/refresh

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:kindergartenId/ai-format

**文件**: `organization-status.routes.ts`

**描述**: get /:kindergartenId/ai-format

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `page-guide-section.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `page-guide-section.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `page-guide-section.routes.ts`

**描述**: put /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `page-guide-section.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-path/:pagePath

**文件**: `page-guide.routes.ts`

**描述**: get /by-path/:pagePath

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `page-guide.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `page-guide.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `page-guide.routes.ts`

**描述**: put /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `page-guide.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /create-marketing-guides

**文件**: `page-guide.routes.ts`

**描述**: post /create-marketing-guides

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /create-remaining-pages

**文件**: `page-guide.routes.ts`

**描述**: post /create-remaining-pages

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /page-actions

**文件**: `page-permissions.routes.ts`

**描述**: get /page-actions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-check

**文件**: `page-permissions.routes.ts`

**描述**: post /batch-check

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /answer

**文件**: `parent-assistant.routes.ts`

**描述**: post /answer

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /quick-questions

**文件**: `parent-assistant.routes.ts`

**描述**: get /quick-questions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `parent-student-relation.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `parent-student-relation.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /parents/:id/students

**文件**: `parent-student-relation.routes.ts`

**描述**: get /parents/:id/students

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /parents/:id/students

**文件**: `parent-student-relation.routes.ts`

**描述**: post /parents/:id/students

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /parents/:parentId/students/:studentId

**文件**: `parent-student-relation.routes.ts`

**描述**: delete /parents/:parentId/students/:studentId

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students/:id/parents

**文件**: `parent-student-relation.routes.ts`

**描述**: get /students/:id/parents

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `parent-student-relations.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `parent-student-relations.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `parent-student-relations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `parent-student-relations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `parent-student-relations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `parent.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `parent.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `parent.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `parent.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `parent.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/students

**文件**: `parent.routes.ts`

**描述**: get /:id/students

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/students

**文件**: `parent.routes.ts`

**描述**: post /:id/students

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:parentId/students/:studentId

**文件**: `parent.routes.ts`

**描述**: delete /:parentId/students/:studentId

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/children

**文件**: `parent.routes.ts`

**描述**: get /:id/children

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/communications

**文件**: `parent.routes.ts`

**描述**: get /:id/communications

**认证**: ✅ 需要

**权限**: PARENT_MANAGE, PARENT_LIST, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE, PARENT_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `parents.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `parents.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `parents.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `parents.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `parents.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-evaluation.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-evaluation.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-evaluation.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `performance-evaluation.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `performance-evaluation.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-evaluations.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-evaluations.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-evaluations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `performance-evaluations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `performance-evaluations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE, PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-report.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-report.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-report.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/export

**文件**: `performance-report.routes.ts`

**描述**: get /:id/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `performance-report.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-reports.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-reports.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-reports.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/download

**文件**: `performance-reports.routes.ts`

**描述**: get /:id/download

**认证**: ✅ 需要

**权限**: PERFORMANCE_RULE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-rule.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-rule.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-rule.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance-rules.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `performance-rules.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `performance-rules.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `performance-rules.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `performance-rules.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `performance.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /metrics

**文件**: `performance.routes.ts`

**描述**: get /metrics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /database

**文件**: `performance.routes.ts`

**描述**: get /database

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /api-stats

**文件**: `performance.routes.ts`

**描述**: get /api-stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /errors

**文件**: `performance.routes.ts`

**描述**: get /errors

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `permission.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `permission.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-pages

**文件**: `permission.routes.ts`

**描述**: get /my-pages

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `permission.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `permission.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `permission.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /check/:pagePath

**文件**: `permission.routes.ts`

**描述**: get /check/:pagePath

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-page

**文件**: `permission.routes.ts`

**描述**: post /check-page

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /role/:roleId

**文件**: `permission.routes.ts`

**描述**: get /role/:roleId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /role/:roleId

**文件**: `permission.routes.ts`

**描述**: put /role/:roleId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `permissions-backup.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `permissions-backup.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `permissions-backup.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `permissions-backup.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `permissions-backup.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dynamic-routes

**文件**: `permissions.routes.ts`

**描述**: get /dynamic-routes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user-permissions

**文件**: `permissions.routes.ts`

**描述**: get /user-permissions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-permission

**文件**: `permissions.routes.ts`

**描述**: post /check-permission

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /all-routes

**文件**: `permissions.routes.ts`

**描述**: get /all-routes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `personal-posters.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `personal-posters.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `personal-posters.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `personal-posters.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `personal-posters.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `personnel-center.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /distribution

**文件**: `personnel-center.routes.ts`

**描述**: get /distribution

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trend

**文件**: `personnel-center.routes.ts`

**描述**: get /trend

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `personnel-center.routes.ts`

**描述**: get /statistics

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students

**文件**: `personnel-center.routes.ts`

**描述**: get /students

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /students

**文件**: `personnel-center.routes.ts`

**描述**: post /students

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students/:id

**文件**: `personnel-center.routes.ts`

**描述**: get /students/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /students/:id

**文件**: `personnel-center.routes.ts`

**描述**: put /students/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /students/:id

**文件**: `personnel-center.routes.ts`

**描述**: delete /students/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /students/batch

**文件**: `personnel-center.routes.ts`

**描述**: put /students/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /students/batch

**文件**: `personnel-center.routes.ts`

**描述**: delete /students/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students/export

**文件**: `personnel-center.routes.ts`

**描述**: get /students/export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /parents

**文件**: `personnel-center.routes.ts`

**描述**: get /parents

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /parents

**文件**: `personnel-center.routes.ts`

**描述**: post /parents

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /parents/:id

**文件**: `personnel-center.routes.ts`

**描述**: get /parents/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /parents/:id

**文件**: `personnel-center.routes.ts`

**描述**: put /parents/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /parents/:id

**文件**: `personnel-center.routes.ts`

**描述**: delete /parents/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /parents/batch

**文件**: `personnel-center.routes.ts`

**描述**: put /parents/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /parents/batch

**文件**: `personnel-center.routes.ts`

**描述**: delete /parents/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /parents/export

**文件**: `personnel-center.routes.ts`

**描述**: get /parents/export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teachers

**文件**: `personnel-center.routes.ts`

**描述**: get /teachers

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /teachers

**文件**: `personnel-center.routes.ts`

**描述**: post /teachers

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teachers/:id

**文件**: `personnel-center.routes.ts`

**描述**: get /teachers/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /teachers/:id

**文件**: `personnel-center.routes.ts`

**描述**: put /teachers/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /teachers/:id

**文件**: `personnel-center.routes.ts`

**描述**: delete /teachers/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /teachers/batch

**文件**: `personnel-center.routes.ts`

**描述**: put /teachers/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /teachers/batch

**文件**: `personnel-center.routes.ts`

**描述**: delete /teachers/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teachers/export

**文件**: `personnel-center.routes.ts`

**描述**: get /teachers/export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes

**文件**: `personnel-center.routes.ts`

**描述**: get /classes

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /classes

**文件**: `personnel-center.routes.ts`

**描述**: post /classes

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes/:id

**文件**: `personnel-center.routes.ts`

**描述**: get /classes/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /classes/:id

**文件**: `personnel-center.routes.ts`

**描述**: put /classes/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /classes/:id

**文件**: `personnel-center.routes.ts`

**描述**: delete /classes/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /classes/batch

**文件**: `personnel-center.routes.ts`

**描述**: put /classes/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /classes/batch

**文件**: `personnel-center.routes.ts`

**描述**: delete /classes/batch

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes/export

**文件**: `personnel-center.routes.ts`

**描述**: get /classes/export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /students/:studentId/assign-class

**文件**: `personnel-center.routes.ts`

**描述**: post /students/:studentId/assign-class

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /teachers/:teacherId/assign-class

**文件**: `personnel-center.routes.ts`

**描述**: post /teachers/:teacherId/assign-class

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /parents/:parentId/add-child

**文件**: `personnel-center.routes.ts`

**描述**: post /parents/:parentId/add-child

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /search

**文件**: `personnel-center.routes.ts`

**描述**: get /search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students/search

**文件**: `personnel-center.routes.ts`

**描述**: get /students/search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /parents/search

**文件**: `personnel-center.routes.ts`

**描述**: get /parents/search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teachers/search

**文件**: `personnel-center.routes.ts`

**描述**: get /teachers/search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes/search

**文件**: `personnel-center.routes.ts`

**描述**: get /classes/search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `poster-generation.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate

**文件**: `poster-generation.routes.ts`

**描述**: post /generate

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `poster-generation.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `poster-generation.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `poster-generation.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `poster-generation.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/preview

**文件**: `poster-generation.routes.ts`

**描述**: get /:id/preview

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/download

**文件**: `poster-generation.routes.ts`

**描述**: get /:id/download

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/share

**文件**: `poster-generation.routes.ts`

**描述**: post /:id/share

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/stats

**文件**: `poster-generation.routes.ts`

**描述**: get /:id/stats

**认证**: ✅ 需要

**权限**: POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE, POSTER_GENERATION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `poster-generations.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `poster-generations.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `poster-generations.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `poster-generations.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `poster-generations.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `poster-template.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `poster-template.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `poster-template.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `poster-template.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `poster-template.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/preview

**文件**: `poster-template.routes.ts`

**描述**: get /:id/preview

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/elements

**文件**: `poster-template.routes.ts`

**描述**: post /:id/elements

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/elements/:elementId

**文件**: `poster-template.routes.ts`

**描述**: put /:id/elements/:elementId

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id/elements/:elementId

**文件**: `poster-template.routes.ts`

**描述**: delete /:id/elements/:elementId

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /categories

**文件**: `poster-template.routes.ts`

**描述**: get /categories

**认证**: ✅ 需要

**权限**: POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE, POSTER_TEMPLATE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `poster-templates.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `poster-templates.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /categories

**文件**: `poster-templates.routes.ts`

**描述**: get /categories

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /categories/:parentId/children

**文件**: `poster-templates.routes.ts`

**描述**: get /categories/:parentId/children

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /categories/code/:code

**文件**: `poster-templates.routes.ts`

**描述**: get /categories/code/:code

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `poster-templates.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `poster-templates.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `poster-templates.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload

**文件**: `poster-upload.routes.ts`

**描述**: post /upload

**认证**: ✅ 需要

**权限**: PRINCIPAL_POSTER_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `principal-performance.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `principal-performance.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /rankings

**文件**: `principal-performance.routes.ts`

**描述**: get /rankings

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /details

**文件**: `principal-performance.routes.ts`

**描述**: get /details

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /export

**文件**: `principal-performance.routes.ts`

**描述**: get /export

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /goals

**文件**: `principal-performance.routes.ts`

**描述**: get /goals

**认证**: ✅ 需要

**权限**: PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE, PRINCIPAL_PERFORMANCE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `principal.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /campus/overview

**文件**: `principal.routes.ts`

**描述**: get /campus/overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /approvals

**文件**: `principal.routes.ts`

**描述**: get /approvals

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /approvals/:id/:action

**文件**: `principal.routes.ts`

**描述**: post /approvals/:id/:action

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /notices/important

**文件**: `principal.routes.ts`

**描述**: get /notices/important

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /notices

**文件**: `principal.routes.ts`

**描述**: post /notices

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /schedule

**文件**: `principal.routes.ts`

**描述**: get /schedule

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /schedule

**文件**: `principal.routes.ts`

**描述**: post /schedule

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment/trend

**文件**: `principal.routes.ts`

**描述**: get /enrollment/trend

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customer-pool/stats

**文件**: `principal.routes.ts`

**描述**: get /customer-pool/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customer-pool/list

**文件**: `principal.routes.ts`

**描述**: get /customer-pool/list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /performance/stats

**文件**: `principal.routes.ts`

**描述**: get /performance/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /performance/rankings

**文件**: `principal.routes.ts`

**描述**: get /performance/rankings

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /performance/details

**文件**: `principal.routes.ts`

**描述**: get /performance/details

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customer-pool/:id

**文件**: `principal.routes.ts`

**描述**: get /customer-pool/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customer-pool/assign

**文件**: `principal.routes.ts`

**描述**: post /customer-pool/assign

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customer-pool/batch-assign

**文件**: `principal.routes.ts`

**描述**: post /customer-pool/batch-assign

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /customer-pool/:id

**文件**: `principal.routes.ts`

**描述**: delete /customer-pool/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customer-pool/:id/follow-up

**文件**: `principal.routes.ts`

**描述**: post /customer-pool/:id/follow-up

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activities

**文件**: `principal.routes.ts`

**描述**: get /activities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /poster-templates

**文件**: `principal.routes.ts`

**描述**: get /poster-templates

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `progress.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:sessionId/status

**文件**: `progress.routes.ts`

**描述**: get /:sessionId/status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /simulate

**文件**: `progress.routes.ts`

**描述**: post /simulate

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `quick-query-groups.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `quick-query-groups.routes.ts`

**描述**: get /overview

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:groupId

**文件**: `quick-query-groups.routes.ts`

**描述**: get /:groupId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /search

**文件**: `quick-query-groups.routes.ts`

**描述**: get /search

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /category/:category

**文件**: `quick-query-groups.routes.ts`

**描述**: get /category/:category

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `referral-codes.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `referral-codes.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `referral-codes.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `referral-codes.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `referral-codes.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `referral-relationships.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `referral-relationships.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `referral-relationships.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `referral-relationships.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `referral-relationships.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `referral-rewards.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `referral-rewards.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `referral-rewards.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `referral-rewards.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `referral-rewards.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `referral-statistics.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `referral-statistics.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `referral-statistics.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `referral-statistics.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `referral-statistics.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-code

**文件**: `referral.routes.ts`

**描述**: get /my-code

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-stats

**文件**: `referral.routes.ts`

**描述**: get /my-stats

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-records

**文件**: `referral.routes.ts`

**描述**: get /my-records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-poster

**文件**: `referral.routes.ts`

**描述**: post /generate-poster

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /track-visit

**文件**: `referral.routes.ts`

**描述**: post /track-visit

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /track-conversion

**文件**: `referral.routes.ts`

**描述**: post /track-conversion

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /reminder-logs

**文件**: `reminder-log.routes.ts`

**描述**: get /reminder-logs

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /reminder-logs/stats

**文件**: `reminder-log.routes.ts`

**描述**: get /reminder-logs/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /reminder-logs/:id

**文件**: `reminder-log.routes.ts`

**描述**: get /reminder-logs/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /reminder-logs

**文件**: `reminder-log.routes.ts`

**描述**: post /reminder-logs

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /reminder-logs/:id/status

**文件**: `reminder-log.routes.ts`

**描述**: put /reminder-logs/:id/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `role-permission.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `role-permission.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `role-permission.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `role-permission.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-role/:roleId

**文件**: `role-permission.routes.ts`

**描述**: get /by-role/:roleId

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `role-permission.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /roles/:roleId/permissions

**文件**: `role-permission.routes.ts`

**描述**: post /roles/:roleId/permissions

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /roles/:roleId/permissions

**文件**: `role-permission.routes.ts`

**描述**: delete /roles/:roleId/permissions

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /roles/:roleId/permissions

**文件**: `role-permission.routes.ts`

**描述**: get /roles/:roleId/permissions

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permissions/:permissionId/inheritance

**文件**: `role-permission.routes.ts`

**描述**: get /permissions/:permissionId/inheritance

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /roles/:roleId/permission-history

**文件**: `role-permission.routes.ts`

**描述**: get /roles/:roleId/permission-history

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-conflicts

**文件**: `role-permission.routes.ts`

**描述**: post /check-conflicts

**认证**: ✅ 需要

**权限**: ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE, ROLE_PERMISSION_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `role-permissions.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `role-permissions.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `role-permissions.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `role-permissions.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `role-permissions.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-roles

**文件**: `role.routes.ts`

**描述**: get /my-roles

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /check/:roleCode

**文件**: `role.routes.ts`

**描述**: get /check/:roleCode

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `role.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `role.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `role.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `role.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `role.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE, ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `roles-backup.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `roles-backup.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `roles-backup.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `roles-backup.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `roles-backup.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `roles.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `roles.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `roles.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `roles.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `roles.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `schedules.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `schedules.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `schedules.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /calendar/:year/:month

**文件**: `schedules.routes.ts`

**描述**: get /calendar/:year/:month

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `schedules.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `schedules.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `schedules.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `schedules.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `script-category.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `script-category.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /init-default

**文件**: `script-category.routes.ts`

**描述**: post /init-default

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /sort

**文件**: `script-category.routes.ts`

**描述**: put /sort

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `script-category.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `script-category.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `script-category.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `script-category.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /match

**文件**: `script-template.routes.ts`

**描述**: post /match

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `script-template.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `script-template.routes.ts`

**描述**: get /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `script-template.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `script-template.routes.ts`

**描述**: put /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `script-template.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch/delete

**文件**: `script-template.routes.ts`

**描述**: post /batch/delete

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/category

**文件**: `script-template.routes.ts`

**描述**: get /stats/category

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `script.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `script.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `script.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `script.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `script.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `script.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/use

**文件**: `script.routes.ts`

**描述**: post /:id/use

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `security.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /threats

**文件**: `security.routes.ts`

**描述**: get /threats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /threats/:id/handle

**文件**: `security.routes.ts`

**描述**: post /threats/:id/handle

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /scan

**文件**: `security.routes.ts`

**描述**: post /scan

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /vulnerabilities

**文件**: `security.routes.ts`

**描述**: get /vulnerabilities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recommendations

**文件**: `security.routes.ts`

**描述**: get /recommendations

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /recommendations/generate

**文件**: `security.routes.ts`

**描述**: post /recommendations/generate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /config

**文件**: `security.routes.ts`

**描述**: get /config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /config

**文件**: `security.routes.ts`

**描述**: put /config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `sequelize-meta.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `sequelize-meta.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `sequelize-meta.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:name

**文件**: `sequelize-meta.routes.ts`

**描述**: put /:name

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:name

**文件**: `sequelize-meta.routes.ts`

**描述**: delete /:name

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my

**文件**: `session.routes.ts`

**描述**: get /my

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /online

**文件**: `session.routes.ts`

**描述**: get /online

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `session.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /kickout/:userId

**文件**: `session.routes.ts`

**描述**: post /kickout/:userId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /kickout-others

**文件**: `session.routes.ts`

**描述**: post /kickout-others

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:token

**文件**: `session.routes.ts`

**描述**: delete /:token

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /activity

**文件**: `session.routes.ts`

**描述**: put /activity

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /business-center-permissions

**文件**: `setup-permissions.routes.ts`

**描述**: post /business-center-permissions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /fix-business-center-paths

**文件**: `setup-permissions.routes.ts`

**描述**: post /fix-business-center-paths

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /assign-role-permissions

**文件**: `setup-permissions.routes.ts`

**描述**: post /assign-role-permissions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check

**文件**: `simple-permissions.routes.ts`

**描述**: post /check

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-check

**文件**: `simple-permissions.routes.ts`

**描述**: post /batch-check

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /retrieve

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /retrieve

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /conversation

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /conversation

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /core/:userId?

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /core/:userId?

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /core/:userId?

**文件**: `six-dimension-memory.routes.ts`

**描述**: put /core/:userId?

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /episodic

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /episodic

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /episodic

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /episodic

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /semantic/search

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /semantic/search

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /semantic

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /semantic

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /semantic/:conceptId/related

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /semantic/:conceptId/related

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /procedural/:procedureName

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /procedural/:procedureName

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /procedural

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /procedural

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /resource/search

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /resource/search

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /resource

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /resource

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /resource/:resourceId/access

**文件**: `six-dimension-memory.routes.ts`

**描述**: put /resource/:resourceId/access

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /knowledge/search

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /knowledge/search

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /knowledge

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /knowledge

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /knowledge/:entryId/validate

**文件**: `six-dimension-memory.routes.ts`

**描述**: put /knowledge/:entryId/validate

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /context

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /context

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /compress

**文件**: `six-dimension-memory.routes.ts`

**描述**: post /compress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `six-dimension-memory.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-poster

**文件**: `smart-promotion.routes.ts`

**描述**: post /generate-poster

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /generate-content

**文件**: `smart-promotion.routes.ts`

**描述**: post /generate-content

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /social-media-content

**文件**: `smart-promotion.routes.ts`

**描述**: post /social-media-content

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /complete-poster

**文件**: `smart-promotion.routes.ts`

**描述**: post /complete-poster

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /calculate-reward

**文件**: `smart-promotion.routes.ts`

**描述**: post /calculate-reward

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /personalized-incentive

**文件**: `smart-promotion.routes.ts`

**描述**: post /personalized-incentive

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /viral-spread

**文件**: `smart-promotion.routes.ts`

**描述**: post /viral-spread

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /optimize-strategy

**文件**: `smart-promotion.routes.ts`

**描述**: post /optimize-strategy

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `smart-promotion.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `statistics-adapter.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment

**文件**: `statistics-adapter.routes.ts`

**描述**: get /enrollment

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students

**文件**: `statistics-adapter.routes.ts`

**描述**: get /students

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /revenue

**文件**: `statistics-adapter.routes.ts`

**描述**: get /revenue

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activities

**文件**: `statistics-adapter.routes.ts`

**描述**: get /activities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /regions

**文件**: `statistics-adapter.routes.ts`

**描述**: get /regions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `statistics.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /users

**文件**: `statistics.routes.ts`

**描述**: get /users

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment

**文件**: `statistics.routes.ts`

**描述**: get /enrollment

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activities

**文件**: `statistics.routes.ts`

**描述**: get /activities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /finance

**文件**: `statistics.routes.ts`

**描述**: get /finance

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /financial

**文件**: `statistics.routes.ts`

**描述**: get /financial

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /regions

**文件**: `statistics.routes.ts`

**描述**: get /regions

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /trends

**文件**: `statistics.routes.ts`

**描述**: get /trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /export

**文件**: `statistics.routes.ts`

**描述**: get /export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /export

**文件**: `statistics.routes.ts`

**描述**: post /export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `statistics.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-trend

**文件**: `statistics.routes.ts`

**描述**: get /enrollment-trend

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /class-distribution

**文件**: `statistics.routes.ts`

**描述**: get /class-distribution

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /revenue

**文件**: `statistics.routes.ts`

**描述**: get /revenue

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students

**文件**: `statistics.routes.ts`

**描述**: get /students

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `statistics.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-class

**文件**: `student.routes.ts`

**描述**: get /by-class

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /search

**文件**: `student.routes.ts`

**描述**: get /search

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /available

**文件**: `student.routes.ts`

**描述**: get /available

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `student.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `student.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `student.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /status

**文件**: `student.routes.ts`

**描述**: put /status

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /assign-class

**文件**: `student.routes.ts`

**描述**: post /assign-class

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /add-to-class

**文件**: `student.routes.ts`

**描述**: post /add-to-class

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id/remove-from-class

**文件**: `student.routes.ts`

**描述**: delete /:id/remove-from-class

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /batch-assign-class

**文件**: `student.routes.ts`

**描述**: post /batch-assign-class

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `student.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `student.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `student.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/parents

**文件**: `student.routes.ts`

**描述**: get /:id/parents

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/growth-records

**文件**: `student.routes.ts`

**描述**: get /:id/growth-records

**认证**: ✅ 需要

**权限**: STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_MANAGE, STUDENT_UPDATE, STUDENT_VIEW, STUDENT_UPDATE, STUDENT_MANAGE, STUDENT_VIEW, STUDENT_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `students.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `students.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `students.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `students.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `students.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `system-ai-models.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `system-ai-models.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id/status

**文件**: `system-ai-models.routes.ts`

**描述**: put /:id/status

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `system-ai-models.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `system-ai-models.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `system-ai-models.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `system-ai-models.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: AI_MODEL_VIEW, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_VIEW, AI_MODEL_MANAGE, AI_MODEL_MANAGE, AI_MODEL_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `system-backup.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /database

**文件**: `system-backup.routes.ts`

**描述**: post /database

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /download/:filename

**文件**: `system-backup.routes.ts`

**描述**: get /download/:filename

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /restore

**文件**: `system-backup.routes.ts`

**描述**: post /restore

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:filename

**文件**: `system-backup.routes.ts`

**描述**: delete /:filename

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /validate/:filename

**文件**: `system-backup.routes.ts`

**描述**: post /validate/:filename

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cleanup

**文件**: `system-backup.routes.ts`

**描述**: post /cleanup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `system-backup.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /config

**文件**: `system-backup.routes.ts`

**描述**: get /config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /auto-settings

**文件**: `system-backup.routes.ts`

**描述**: get /auto-settings

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /auto-settings

**文件**: `system-backup.routes.ts`

**描述**: put /auto-settings

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `system-configs.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `system-configs.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `system-configs.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `system-configs.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `system-configs.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `system-logs.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `system-logs.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `system-logs.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `system-logs.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cleanup

**文件**: `system-logs.routes.ts`

**描述**: post /cleanup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /system

**文件**: `system-logs.routes.ts`

**描述**: get /system

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /operations

**文件**: `system-logs.routes.ts`

**描述**: get /operations

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /system/cleanup

**文件**: `system-logs.routes.ts`

**描述**: delete /system/cleanup

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `system-logs.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `system.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /health

**文件**: `system.routes.ts`

**描述**: get /health

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /docs

**文件**: `system.routes.ts`

**描述**: get /docs

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /info

**文件**: `system.routes.ts`

**描述**: get /info

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `system.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /detail-info

**文件**: `system.routes.ts`

**描述**: get /detail-info

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /test/database

**文件**: `system.routes.ts`

**描述**: get /test/database

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /test/email

**文件**: `system.routes.ts`

**描述**: get /test/email

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /test/email

**文件**: `system.routes.ts`

**描述**: post /test/email

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /test/sms

**文件**: `system.routes.ts`

**描述**: post /test/sms

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload

**文件**: `system.routes.ts`

**描述**: post /upload

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /cache/clear

**文件**: `system.routes.ts`

**描述**: delete /cache/clear

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cache/clear

**文件**: `system.routes.ts`

**描述**: post /cache/clear

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /version

**文件**: `system.routes.ts`

**描述**: get /version

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /logs

**文件**: `system.routes.ts`

**描述**: get /logs

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /configs

**文件**: `system.routes.ts`

**描述**: get /configs

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /configs

**文件**: `system.routes.ts`

**描述**: post /configs

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /configs/:id

**文件**: `system.routes.ts`

**描述**: put /configs/:id

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /users

**文件**: `system.routes.ts`

**描述**: get /users

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /users

**文件**: `system.routes.ts`

**描述**: post /users

**认证**: ✅ 需要

**权限**: SYSTEM_LOG_VIEW, SYSTEM_CONFIG_MANAGE, SYSTEM_CONFIG_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tasks/:taskId/attachments

**文件**: `task-attachments.routes.ts`

**描述**: get /tasks/:taskId/attachments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /tasks/:taskId/attachments

**文件**: `task-attachments.routes.ts`

**描述**: post /tasks/:taskId/attachments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /tasks/:taskId/attachments/batch

**文件**: `task-attachments.routes.ts`

**描述**: post /tasks/:taskId/attachments/batch

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /tasks/:taskId/attachments/:attachmentId

**文件**: `task-attachments.routes.ts`

**描述**: delete /tasks/:taskId/attachments/:attachmentId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tasks/:taskId/attachments/:attachmentId/download

**文件**: `task-attachments.routes.ts`

**描述**: get /tasks/:taskId/attachments/:attachmentId/download

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /inspection-tasks/:taskId/comments

**文件**: `task-comment.routes.ts`

**描述**: get /inspection-tasks/:taskId/comments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /inspection-tasks/:taskId/comments

**文件**: `task-comment.routes.ts`

**描述**: post /inspection-tasks/:taskId/comments

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /task-comments/:commentId

**文件**: `task-comment.routes.ts`

**描述**: delete /task-comments/:commentId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /test

**文件**: `task.routes.ts`

**描述**: get /test

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `task.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `task.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `task.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `task.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `task.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `task.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /classes

**文件**: `teacher-attendance.routes.ts`

**描述**: get /classes

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /students/:classId

**文件**: `teacher-attendance.routes.ts`

**描述**: get /students/:classId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /records

**文件**: `teacher-attendance.routes.ts`

**描述**: get /records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /records

**文件**: `teacher-attendance.routes.ts`

**描述**: post /records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /records/:id

**文件**: `teacher-attendance.routes.ts`

**描述**: put /records/:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `teacher-attendance.routes.ts`

**描述**: get /statistics

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /export

**文件**: `teacher-attendance.routes.ts`

**描述**: post /export

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /save

**文件**: `teacher-center-creative-curriculum.routes.ts`

**描述**: post /save

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `teacher-center-creative-curriculum.routes.ts`

**描述**: get /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `teacher-center-creative-curriculum.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `teacher-center-creative-curriculum.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-in

**文件**: `teacher-checkin.routes.ts`

**描述**: post /check-in

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /check-out

**文件**: `teacher-checkin.routes.ts`

**描述**: post /check-out

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /today

**文件**: `teacher-checkin.routes.ts`

**描述**: get /today

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /month

**文件**: `teacher-checkin.routes.ts`

**描述**: get /month

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /leave

**文件**: `teacher-checkin.routes.ts`

**描述**: post /leave

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `teacher-checkin.routes.ts`

**描述**: get /statistics

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /history

**文件**: `teacher-checkin.routes.ts`

**描述**: get /history

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /approve

**文件**: `teacher-checkin.routes.ts`

**描述**: post /approve

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `teacher-customers.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /conversion-funnel

**文件**: `teacher-customers.routes.ts`

**描述**: get /conversion-funnel

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `teacher-customers.routes.ts`

**描述**: get /list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:customerId/follow

**文件**: `teacher-customers.routes.ts`

**描述**: post /:customerId/follow

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:customerId/status

**文件**: `teacher-customers.routes.ts`

**描述**: put /:customerId/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:customerId/follow-records

**文件**: `teacher-customers.routes.ts`

**描述**: get /:customerId/follow-records

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activity-statistics

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /activity-statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activity-checkin-overview

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /activity-checkin-overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /today-tasks

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /today-tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /today-courses

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /today-courses

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /recent-notifications

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /recent-notifications

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /tasks/:taskId/status

**文件**: `teacher-dashboard.routes.ts`

**描述**: put /tasks/:taskId/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /clock-in

**文件**: `teacher-dashboard.routes.ts`

**描述**: post /clock-in

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tasks/stats

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /tasks/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /tasks

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /tasks

**文件**: `teacher-dashboard.routes.ts`

**描述**: post /tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /tasks/:id

**文件**: `teacher-dashboard.routes.ts`

**描述**: put /tasks/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /tasks/batch-complete

**文件**: `teacher-dashboard.routes.ts`

**描述**: post /tasks/batch-complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /tasks/batch-delete

**文件**: `teacher-dashboard.routes.ts`

**描述**: delete /tasks/batch-delete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/stats

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/classes

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/classes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/classes/:id

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/classes/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/progress

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/records

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/records

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /teaching/records

**文件**: `teacher-dashboard.routes.ts`

**描述**: post /teaching/records

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/students

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/students

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /teaching/students/:id

**文件**: `teacher-dashboard.routes.ts`

**描述**: get /teaching/students/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /teaching/progress/:id

**文件**: `teacher-dashboard.routes.ts`

**描述**: put /teaching/progress/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stages

**文件**: `teacher-sop.routes.ts`

**描述**: get /stages

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stages/:id

**文件**: `teacher-sop.routes.ts`

**描述**: get /stages/:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stages/:id/tasks

**文件**: `teacher-sop.routes.ts`

**描述**: get /stages/:id/tasks

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customers/:customerId/progress

**文件**: `teacher-sop.routes.ts`

**描述**: get /customers/:customerId/progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /customers/:customerId/progress

**文件**: `teacher-sop.routes.ts`

**描述**: put /customers/:customerId/progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/tasks/:taskId/complete

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/tasks/:taskId/complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/progress/advance

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/progress/advance

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /customers/:customerId/conversations

**文件**: `teacher-sop.routes.ts`

**描述**: get /customers/:customerId/conversations

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/conversations

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/conversations

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/conversations/batch

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/conversations/batch

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/screenshots/upload

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/screenshots/upload

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/screenshots/:screenshotId/analyze

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/screenshots/:screenshotId/analyze

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/ai-suggestions/task

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/ai-suggestions/task

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /customers/:customerId/ai-suggestions/global

**文件**: `teacher-sop.routes.ts`

**描述**: post /customers/:customerId/ai-suggestions/global

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /search

**文件**: `teacher.routes.ts`

**描述**: get /search

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-user/:userId

**文件**: `teacher.routes.ts`

**描述**: get /by-user/:userId

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `teacher.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `teacher.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `teacher.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `teacher.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `teacher.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `teacher.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/classes

**文件**: `teacher.routes.ts`

**描述**: get /:id/classes

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id/stats

**文件**: `teacher.routes.ts`

**描述**: get /:id/stats

**认证**: ✅ 需要

**权限**: TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_VIEW, TEACHER_MANAGE, TEACHER_UPDATE, TEACHER_MANAGE, TEACHER_VIEW, TEACHER_VIEW

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `teachers.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `teachers.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `teachers.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `teachers.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `teachers.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /course-progress

**文件**: `teaching-center.routes.ts`

**描述**: get /course-progress

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /class-progress/:classId/:coursePlanId

**文件**: `teaching-center.routes.ts`

**描述**: get /class-progress/:classId/:coursePlanId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /confirm-completion/:progressId

**文件**: `teaching-center.routes.ts`

**描述**: put /confirm-completion/:progressId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /outdoor-training

**文件**: `teaching-center.routes.ts`

**描述**: get /outdoor-training

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /outdoor-training/class/:classId

**文件**: `teaching-center.routes.ts`

**描述**: get /outdoor-training/class/:classId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /outdoor-training

**文件**: `teaching-center.routes.ts`

**描述**: post /outdoor-training

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /external-display

**文件**: `teaching-center.routes.ts`

**描述**: get /external-display

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /external-display/class/:classId

**文件**: `teaching-center.routes.ts`

**描述**: get /external-display/class/:classId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /external-display

**文件**: `teaching-center.routes.ts`

**描述**: post /external-display

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /championship

**文件**: `teaching-center.routes.ts`

**描述**: get /championship

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /championship/:championshipId

**文件**: `teaching-center.routes.ts`

**描述**: get /championship/:championshipId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /championship

**文件**: `teaching-center.routes.ts`

**描述**: post /championship

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /championship/:championshipId/status

**文件**: `teaching-center.routes.ts`

**描述**: put /championship/:championshipId/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /media

**文件**: `teaching-center.routes.ts`

**描述**: post /media

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /media

**文件**: `teaching-center.routes.ts`

**描述**: get /media

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /description

**文件**: `text-polish.routes.ts`

**描述**: post /description

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `text-to-speech.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /voices

**文件**: `text-to-speech.routes.ts`

**描述**: get /voices

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /config

**文件**: `text-to-speech.routes.ts`

**描述**: get /config

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `todos.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my

**文件**: `todos.routes.ts`

**描述**: get /my

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /statistics

**文件**: `todos.routes.ts`

**描述**: get /statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `todos.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `todos.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `todos.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `todos.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id/complete

**文件**: `todos.routes.ts`

**描述**: patch /:id/complete

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `todos.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `token-blacklist.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `token-blacklist.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `token-blacklist.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `token-blacklist.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `token-blacklist.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `unified-statistics.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /comparison

**文件**: `unified-statistics.routes.ts`

**描述**: get /comparison

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `unified-statistics.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /overview

**文件**: `usage-center.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /users

**文件**: `usage-center.routes.ts`

**描述**: get /users

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user/:userId/detail

**文件**: `usage-center.routes.ts`

**描述**: get /user/:userId/detail

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /my-usage

**文件**: `usage-center.routes.ts`

**描述**: get /my-usage

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user/:userId

**文件**: `usage-quota.routes.ts`

**描述**: get /user/:userId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /user/:userId

**文件**: `usage-quota.routes.ts`

**描述**: put /user/:userId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /warnings

**文件**: `usage-quota.routes.ts`

**描述**: get /warnings

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /profile

**文件**: `user-profile.routes.ts`

**描述**: get /profile

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /profile

**文件**: `user-profile.routes.ts`

**描述**: put /profile

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /change-password

**文件**: `user-profile.routes.ts`

**描述**: post /change-password

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /upload-avatar

**文件**: `user-profile.routes.ts`

**描述**: post /upload-avatar

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `user-role.routes.ts`

**描述**: get /

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `user-role.routes.ts`

**描述**: post /

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `user-role.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `user-role.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /by-user/:userId

**文件**: `user-role.routes.ts`

**描述**: get /by-user/:userId

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `user-role.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /users/:userId/roles

**文件**: `user-role.routes.ts`

**描述**: post /users/:userId/roles

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /users/:userId/roles

**文件**: `user-role.routes.ts`

**描述**: delete /users/:userId/roles

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /users/:userId/roles

**文件**: `user-role.routes.ts`

**描述**: get /users/:userId/roles

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /users/:userId/primary-role

**文件**: `user-role.routes.ts`

**描述**: put /users/:userId/primary-role

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /users/:userId/roles/:roleId/validity

**文件**: `user-role.routes.ts`

**描述**: put /users/:userId/roles/:roleId/validity

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /users/:userId/role-history

**文件**: `user-role.routes.ts`

**描述**: get /users/:userId/role-history

**认证**: ✅ 需要

**权限**: USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE, USER_ROLE_MANAGE

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `user-roles.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `user-roles.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `user-roles.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `user-roles.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `user-roles.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `user.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `user.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /me

**文件**: `user.routes.ts`

**描述**: get /me

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /profile

**文件**: `user.routes.ts`

**描述**: get /profile

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id/status

**文件**: `user.routes.ts`

**描述**: patch /:id/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/change-password

**文件**: `user.routes.ts`

**描述**: post /:id/change-password

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `user.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `user.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `user.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `users.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `users.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `users.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `users.routes.ts`

**描述**: put /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `users.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects

**文件**: `video-creation.routes.ts`

**描述**: post /projects

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/script

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/script

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/audio

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/audio

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /projects/:projectId

**文件**: `video-creation.routes.ts`

**描述**: get /projects/:projectId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /projects

**文件**: `video-creation.routes.ts`

**描述**: get /projects

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /projects/:projectId

**文件**: `video-creation.routes.ts`

**描述**: delete /projects/:projectId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/scenes

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/scenes

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/merge

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/merge

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /projects/:projectId/status

**文件**: `video-creation.routes.ts`

**描述**: get /projects/:projectId/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /unfinished

**文件**: `video-creation.routes.ts`

**描述**: get /unfinished

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/notified

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/notified

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /projects/:projectId/check-video-status

**文件**: `video-creation.routes.ts`

**描述**: post /projects/:projectId/check-video-status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `voice-config.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `voice-config.routes.ts`

**描述**: get /stats

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /active

**文件**: `voice-config.routes.ts`

**描述**: get /active

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `voice-config.routes.ts`

**描述**: get /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `voice-config.routes.ts`

**描述**: post /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:id

**文件**: `voice-config.routes.ts`

**描述**: put /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `voice-config.routes.ts`

**描述**: delete /:id

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/toggle

**文件**: `voice-config.routes.ts`

**描述**: post /:id/toggle

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/test

**文件**: `voice-config.routes.ts`

**描述**: post /:id/test

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:id/validate

**文件**: `voice-config.routes.ts`

**描述**: post /:id/validate

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---



### ai


#### GET /overview

**文件**: `analytics.routes.ts`

**描述**: get /overview

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /models/distribution

**文件**: `analytics.routes.ts`

**描述**: get /models/distribution

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /activity/trend

**文件**: `analytics.routes.ts`

**描述**: get /activity/trend

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /user/:userId

**文件**: `analytics.routes.ts`

**描述**: get /user/:userId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /content

**文件**: `analytics.routes.ts`

**描述**: get /content

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /report

**文件**: `analytics.routes.ts`

**描述**: post /report

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `analytics.routes.ts`

**描述**: get /dashboard

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /predictive-analytics

**文件**: `analytics.routes.ts`

**描述**: get /predictive-analytics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /predictive-analytics/refresh

**文件**: `analytics.routes.ts`

**描述**: post /predictive-analytics/refresh

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /predictive-analytics/export

**文件**: `analytics.routes.ts`

**描述**: post /predictive-analytics/export

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /map-user

**文件**: `auth.routes.ts`

**描述**: post /map-user

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /permissions

**文件**: `auth.routes.ts`

**描述**: get /permissions

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `conversation.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `conversation.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:id

**文件**: `conversation.routes.ts`

**描述**: get /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:id

**文件**: `conversation.routes.ts`

**描述**: patch /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:id

**文件**: `conversation.routes.ts`

**描述**: delete /:id

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `feedback.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /execute

**文件**: `function-tools.routes.ts`

**描述**: post /execute

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /available-tools

**文件**: `function-tools.routes.ts`

**描述**: get /available-tools

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /execute-single

**文件**: `function-tools.routes.ts`

**描述**: post /execute-single

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /query/past-activities

**文件**: `function-tools.routes.ts`

**描述**: post /query/past-activities

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /query/activity-statistics

**文件**: `function-tools.routes.ts`

**描述**: post /query/activity-statistics

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /query/enrollment-history

**文件**: `function-tools.routes.ts`

**描述**: post /query/enrollment-history

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /query/business-trends

**文件**: `function-tools.routes.ts`

**描述**: post /query/business-trends

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /smart-chat

**文件**: `function-tools.routes.ts`

**描述**: post /smart-chat

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /thinking-sse

**文件**: `function-tools.routes.ts`

**描述**: post /thinking-sse

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `message.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `message.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PATCH /:messageId/metadata

**文件**: `message.routes.ts`

**描述**: patch /:messageId/metadata

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### DELETE /:messageId

**文件**: `message.routes.ts`

**描述**: delete /:messageId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `model-management.routes.ts`

**描述**: get /

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:modelId

**文件**: `model-management.routes.ts`

**描述**: get /:modelId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats/:modelId

**文件**: `model-management.routes.ts`

**描述**: get /stats/:modelId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /preferences/user/:userId/model/:modelId

**文件**: `model-management.routes.ts`

**描述**: put /preferences/user/:userId/model/:modelId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `model.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /default

**文件**: `model.routes.ts`

**描述**: get /default

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /

**文件**: `model.routes.ts`

**描述**: post /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:modelId/billing

**文件**: `model.routes.ts`

**描述**: get /:modelId/billing

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /

**文件**: `quota.routes.ts`

**描述**: get /

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /usage

**文件**: `quota.routes.ts`

**描述**: get /usage

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /list

**文件**: `smart-expert.routes.ts`

**描述**: get /list

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /call

**文件**: `smart-expert.routes.ts`

**描述**: post /call

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /smart-chat

**文件**: `smart-expert.routes.ts`

**描述**: post /smart-chat

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /start

**文件**: `smart-expert.routes.ts`

**描述**: post /start

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /thinking-stream/:sessionId

**文件**: `smart-expert.routes.ts`

**描述**: get /thinking-stream/:sessionId

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /continue

**文件**: `smart-expert.routes.ts`

**描述**: post /continue

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:sessionId/status

**文件**: `smart-expert.routes.ts`

**描述**: get /:sessionId/status

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:sessionId/end

**文件**: `smart-expert.routes.ts`

**描述**: post /:sessionId/end

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stats

**文件**: `token-monitor.routes.ts`

**描述**: get /stats

**认证**: ✅ 需要

**权限**: admin

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /performance

**文件**: `token-monitor.routes.ts`

**描述**: get /performance

**认证**: ✅ 需要

**权限**: admin

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /alerts

**文件**: `token-monitor.routes.ts`

**描述**: get /alerts

**认证**: ✅ 需要

**权限**: admin

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /suggestions

**文件**: `token-monitor.routes.ts`

**描述**: get /suggestions

**认证**: ✅ 需要

**权限**: admin

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /reset

**文件**: `token-monitor.routes.ts`

**描述**: post /reset

**认证**: ✅ 需要

**权限**: admin

**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stream/:sessionId

**文件**: `unified-intelligence.routes.ts`

**描述**: get /stream/:sessionId

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /unified-chat-stream

**文件**: `unified-intelligence.routes.ts`

**描述**: post /unified-chat-stream

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /unified-chat-direct

**文件**: `unified-intelligence.routes.ts`

**描述**: post /unified-chat-direct

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /unified-chat

**文件**: `unified-intelligence.routes.ts`

**描述**: post /unified-chat

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /status

**文件**: `unified-intelligence.routes.ts`

**描述**: get /status

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /analyze

**文件**: `unified-intelligence.routes.ts`

**描述**: post /analyze

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /direct-chat

**文件**: `unified-intelligence.routes.ts`

**描述**: post /direct-chat

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /direct-chat-sse

**文件**: `unified-intelligence.routes.ts`

**描述**: post /direct-chat-sse

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /capabilities

**文件**: `unified-intelligence.routes.ts`

**描述**: get /capabilities

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /unified-intelligence

**文件**: `unified-intelligence.routes.ts`

**描述**: post /unified-intelligence

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /stream-chat

**文件**: `unified-stream.routes.ts`

**描述**: post /stream-chat

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /stream-chat-single

**文件**: `unified-stream.routes.ts`

**描述**: post /stream-chat-single

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /stream-health

**文件**: `unified-stream.routes.ts`

**描述**: get /stream-health

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:userId/permissions

**文件**: `user.routes.ts`

**描述**: get /:userId/permissions

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /:userId/permissions

**文件**: `user.routes.ts`

**描述**: post /:userId/permissions

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /:userId/settings

**文件**: `user.routes.ts`

**描述**: get /:userId/settings

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### PUT /:userId/settings

**文件**: `user.routes.ts`

**描述**: put /:userId/settings

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /text-to-video

**文件**: `video.routes.ts`

**描述**: post /text-to-video

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /image-to-video

**文件**: `video.routes.ts`

**描述**: post /image-to-video

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /models

**文件**: `video.routes.ts`

**描述**: get /models

**认证**: ✅ 需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---



### centers


#### GET /timeline

**文件**: `activity-center.routes.ts`

**描述**: get /timeline

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `activity-center.routes.ts`

**描述**: get /dashboard

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /cache/stats

**文件**: `activity-center.routes.ts`

**描述**: get /cache/stats

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### POST /cache/clear

**文件**: `activity-center.routes.ts`

**描述**: post /cache/clear

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /dashboard

**文件**: `customer-pool-center.routes.ts`

**描述**: get /dashboard

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /fee-items

**文件**: `finance-center.routes.ts`

**描述**: get /fee-items

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /payment-records

**文件**: `finance-center.routes.ts`

**描述**: get /payment-records

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /reports

**文件**: `finance-center.routes.ts`

**描述**: get /reports

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---


#### GET /enrollment-finance

**文件**: `finance-center.routes.ts`

**描述**: get /enrollment-finance

**认证**: ❌ 不需要



**参数**:
- 无参数

**响应**:
- `200`: 成功响应 (object)
- `400`: 请求参数错误 (object)
- `401`: 未授权访问 (object)
- `500`: 服务器内部错误 (object)

---



## 📊 统计信息

| 分类 | API数量 | 认证比例 |
|------|---------|----------|
| root | 1528 | 84.4% |
| ai | 74 | 73.0% |
| centers | 9 | 0.0% |

## 🔧 开发指南

### 1. 添加新API

1. 在对应的路由文件中添加新的路由定义
2. 添加Swagger注释文档
3. 实现认证和权限检查（如需要）
4. 编写相应的控制器和服务

### 2. API版本控制

- 当前API版本: v1
- 版本控制通过URL路径实现 (如: `/api/v1/users`)
- 向后兼容性保证

### 3. 错误处理

所有API响应都遵循统一格式：

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "code": 0
}
```

### 4. 分页

列表接口支持分页参数：

- `page`: 页码 (从1开始)
- `limit`: 每页数量 (默认20，最大100)

响应格式：
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 🧪 测试

可以使用以下工具测试API：

1. **Swagger UI**: http://localhost:3000/api-docs
2. **Postman**: 导入API文档集合
3. **curl**: 命令行测试

### curl示例

```bash
# 获取用户列表
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/users

# 创建用户
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"张三","email":"zhangsan@example.com"}' \
     http://localhost:3000/api/users
```

---

*文档生成时间: 2025/11/13 04:01:38*
*脚本版本: 1.0.0*
