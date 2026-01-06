import type { Plugin } from 'vite'
import chalk from 'chalk'

export function accessLogPlugin(): Plugin {
  return {
    name: 'access-log',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const start = Date.now()
        
        // 记录原始的 end 方法
        const originalEnd = res.end
        
        // 重写 end 方法以捕获响应
        res.end = function(...args: any[]) {
          const duration = Date.now() - start
          const timestamp = new Date().toISOString()
          
          // 获取状态码
          const status = res.statusCode
          
          // 根据状态码设置颜色
          let statusColor = chalk.green
          if (status >= 400 && status < 500) {
            statusColor = chalk.yellow
          } else if (status >= 500) {
            statusColor = chalk.red
          }
          
          // 过滤掉 HMR 和静态资源请求（可选）
          const url = req.url || ''
          const isHMR = url.includes('/@vite') || url.includes('/__vite')
          const isNodeModules = url.includes('/node_modules/')
          
          // 只记录主要请求
          if (!isHMR && !isNodeModules) {
            console.log(
              `${chalk.gray(timestamp)} ${chalk.cyan(req.method?.padEnd(6))} ${statusColor(status)} ${chalk.white(url)} ${chalk.gray(`${duration}ms`)}`
            )
          }
          
          // 调用原始的 end 方法
          originalEnd.apply(res, args)
        }
        
        next()
      })
    }
  }
}