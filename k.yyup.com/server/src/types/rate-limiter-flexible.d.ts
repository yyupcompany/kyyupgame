declare module 'rate-limiter-flexible' {
  export class RateLimiterMemory {
    constructor(options: any)
    consume(key: string, points?: number): Promise<any>
    get(key: string): Promise<{ remainingPoints?: number } | null>
  }
}
