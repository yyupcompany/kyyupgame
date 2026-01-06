/**
 * Flash API 连通性测试
 *
 * 作用：
 * 1. 尝试调用 `generateFlashWithThink`，验证豆包 Flash 模型接口是否可用
 * 2. 输出响应耗时、返回内容摘要
 * 3. 捕获并打印 AggregateError / 超时等网络异常，便于定位“AI调用失败: AggregateError”问题
 *
 * 使用方式：
 *   npx ts-node test-flash-api-connectivity.ts
 */

import 'dotenv/config'
import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service'
import type { AiBridgeMessageRole } from './src/services/ai/bridge/ai-bridge.types'

async function testFlashConnectivity() {
  const start = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 [Flash测试] 开始调用 generateFlashWithThink')

  try {
    const response = await aiBridgeService.generateFlashWithThink({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园数据分析助手，请简洁回答用户问题。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: '请帮我统计幼儿园大班目前有多少名学生？'
        }
      ],
      temperature: 0.7,
      max_tokens: 256,
      think: true,
      stream: false
    })

    const duration = Date.now() - start
    const choice = response.choices?.[0]
    console.log('✅ [Flash测试] 调用成功')
    console.log(`⏱️  耗时: ${duration} ms`)
    console.log(`📄  finish_reason: ${choice?.finish_reason}`)
    console.log('🧠  reasoning_content 预览:', choice?.message?.reasoning_content?.slice(0, 200) || '(无)')
    console.log('💬  message.content 预览:', choice?.message?.content?.slice(0, 200) || '(无)')
  } catch (error: any) {
    const duration = Date.now() - start
    console.error('❌ [Flash测试] 调用失败')
    console.error(`⏱️  耗时: ${duration} ms`)
    console.error('错误类型:', error?.name)
    console.error('错误信息:', error?.message || error)

    if (error?.errors && Array.isArray(error.errors)) {
      console.error('子错误详情:')
      error.errors.forEach((subErr: any, idx: number) => {
        console.error(`  [${idx + 1}]`, subErr?.message || subErr)
      })
    }
  } finally {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    process.exit(0)
  }
}

void testFlashConnectivity()







