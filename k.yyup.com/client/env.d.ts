/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// xlsx 库类型声明
declare module 'xlsx' {
  export interface WorkSheet {
    [key: string]: any
  }
  export interface WorkBook {
    SheetNames: string[]
    Sheets: { [key: string]: WorkSheet }
  }
  export const utils: {
    aoa_to_sheet(data: any[][]): WorkSheet
    book_new(): WorkBook
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void
  }
  export function writeFile(wb: WorkBook, filename: string): void
}

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string
    readonly VITE_API_BASE_URL?: string
    readonly MODE: string
    readonly DEV: boolean
    readonly PROD: boolean
    readonly SSR: boolean
    [key: string]: string | boolean | undefined
  }
} 