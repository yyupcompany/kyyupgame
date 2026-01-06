/**
* 租户注册路由
* 处理租户注册相关的API路由
*/

import { Router } from 'express';
import { registerTenantCallback } from '../controllers/tenant-registration.controller';

const router = Router();

/**
* POST /api/tenant/register-callback
* 租户注册回调接口
* 接收来自统一租户系统的注册回调
*/
router.post('/register-callback', registerTenantCallback);

export default router;
