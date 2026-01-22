export type RoleCode = 'admin' | 'principal' | 'teacher' | 'parent'

export type IssueType =
  | 'BlankScreen'
  | 'ConsoleError'
  | 'PageError'
  | 'RequestFailed'
  | 'BadResponse'
  | 'NavigationRedirectedToLogin'
  | 'Timeout'

export interface CollectedIssue {
  role: RoleCode
  type: IssueType
  url: string
  route?: string
  title?: string
  message: string
  details?: Record<string, unknown>
  ts: string
}


