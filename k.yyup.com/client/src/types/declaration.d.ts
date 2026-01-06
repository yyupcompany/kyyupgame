// 为marked库添加声明
declare module 'marked' {
  export function marked(markdown: string, options?: any): string;
}

// 为DOMPurify库添加声明
declare module 'dompurify' {
  export function sanitize(dirty: string): string;
} 