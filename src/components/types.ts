import type { Ref } from 'vue'
import type { Octokit } from 'octokit'

/**
 * 选择框配置项
 */
export interface SelectOption {
  label: string
  value: string
}
/**
 * 所有者
 */
export interface Option {
  owner: string
  repo: string
}

/**
 * useWorkflow option
 */
export interface USEWorkflowOption {
  github: Octokit
  formState: Ref<Option>
  onFormStateValidator: () => boolean
}

/**
 * 表格数据项
 */
export interface TableDataItem {
  id: number
  name: string
  event: string
  html_url: string
  created_at: string
  actor: {
    login: string
    html_url: string
  }
}
