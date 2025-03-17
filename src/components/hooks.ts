import { createVNode } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { Buffer } from 'buffer'
import type { Octokit } from 'octokit'
import type { Option, USEWorkflowOption, TableDataItem, SelectOption } from './types'

/**
 * 自动化创建并合并分支
 */
export const useCliMergeBranch = async (github: Octokit, option: Option) => {
  const author = { name: 'biaov', email: 'biaov@qq.com' }
  const covering = (num: number) => `${num < 10 ? 0 : ''}${num}`
  const curDate = new Date()
  const curDateFormat = `${covering(curDate.getFullYear())}-${covering(curDate.getMonth() + 1)}-${covering(curDate.getDate())} ${covering(curDate.getHours())}:${covering(
    curDate.getMinutes()
  )}:${covering(curDate.getSeconds())}`
  const content = `更新时间: ${curDateFormat}`
  const branchName = `feature/${+curDate}/auto-create`
  const baseRef = 'main'
  const { data: readmeCont } = await github.rest.repos.getContent({ ...option, ref: 'main', path: 'README.md' })
  const newReadmeCont = Buffer.from((readmeCont as Record<string, any>).content, 'base64')
    .toString()
    .replace(/(?<=签到\+)\d+/, value => `${+value + 1}`)
  const { data: commitData } = await github.rest.repos.getCommit({ ...option, ref: 'main' })
  const { data: branchData } = await github.rest.git.createRef({ ...option, ref: `refs/heads/${branchName}`, sha: commitData.sha })
  const { data: getTreeData } = await github.rest.git.getTree({ ...option, tree_sha: branchData.object.sha })
  const { data: blobData } = await github.rest.git.createBlob({ ...option, content })
  const { data: readmeBlobData } = await github.rest.git.createBlob({ ...option, content: newReadmeCont })
  const { data: treeData } = await github.rest.git.createTree({
    ...option,
    base_tree: getTreeData.sha,
    tree: [
      { path: 'automatic-daily-updates.txt', sha: blobData.sha },
      { path: 'README.md', sha: readmeBlobData.sha }
    ].map(item => ({ ...item, mode: '100644', type: 'blob' }))
  })
  const { data: newCommitData } = await github.rest.git.createCommit({ ...option, message: content, author, tree: treeData.sha, parents: [getTreeData.sha] })
  await github.rest.git.updateRef({ ...option, ref: `heads/${branchName}`, sha: newCommitData.sha, force: true })
  const { data: prData } = await github.rest.pulls.create({ ...option, title: `自动创建分支${branchName}`, head: `biaov:${branchName}`, base: baseRef, body: `自动创建分支${branchName}` })
  await github.rest.pulls.merge({ ...option, pull_number: prData.number })
}

/**
 * 自动合并分支
 */
export const usePreMerge = async (github: Octokit, option: Option) => {
  const { data: branchData } = await github.rest.repos.listBranches({ ...option })
  branchData.forEach(async ({ name }) => {
    if (name.includes('pre-merge/')) {
      const { data: prData } = await github.rest.pulls.create({ ...option, title: `自动创建 PR`, head: `biaov:${name}`, base: 'main', body: `自动创建 PR` })
      await github.rest.pulls.merge({ ...option, pull_number: prData.number })
    }
  })
}

/**
 * 转换选项
 */
export const useTransformOptions = (...options: string[][]) => options.map(arg => arg.map(value => ({ label: value, value })))

/**
 * repos 数据
 */
export const useRepos = ({ github, formState }: Pick<USEWorkflowOption, 'github' | 'formState'>) => {
  const options = ref<SelectOption[]>([])
  const loadOptions = async () => {
    const { data } = await github.rest.repos.listForUser({ type: 'owner', sort: 'created', direction: 'desc', username: formState.value.owner })
    options.value = data.map(({ name }) => ({ label: name, value: name }))
  }
  loadOptions()
  return [options, loadOptions]
}

/**
 * 处理方法
 */
export const useHandles = ({ github, formState, onFormStateValidator }: USEWorkflowOption) => {
  const handleBiz = async (type: string) => {
    if (!onFormStateValidator()) return
    const hideLoading = message.loading('执行中...', 0)
    try {
      switch (type) {
        case 'create':
          await useCliMergeBranch(github, formState.value)
          break
        case 'merge':
          await usePreMerge(github, formState.value)
          break
      }
      message.success('操作成功')
    } catch (error) {
      Modal.confirm({
        title: '错误提示',
        content: createVNode('div', { style: 'color:#f81d22;' }, `失败原因：${JSON.stringify(error)}`)
      })
    }
    hideLoading()
  }
  return { handleBiz }
}

/**
 * 工作流
 */
export const useWorkflow = ({ github, formState, onFormStateValidator }: USEWorkflowOption) => {
  const tableData = ref<TableDataItem[]>([])
  const loading = ref(false)
  const loadTableData = async () => {
    if (!onFormStateValidator()) return
    loading.value = true
    const { data } = await github.rest.actions.listWorkflowRunsForRepo({ ...formState.value })
    tableData.value = data.workflow_runs as TableDataItem[]
    loading.value = false
  }
  const removeItem = (item: TableDataItem) => {
    console.log({ ...formState.value, run_id: item.id })
    return github.rest.actions.deleteWorkflowRun({ ...formState.value, run_id: item.id })
  }

  const handleRemove = async (item: TableDataItem) => {
    if (!onFormStateValidator()) return
    const index = tableData.value.findIndex(it => it.id == item.id)
    loading.value = true
    await removeItem(item)
    // tableData.value.splice(index, 1)
    // loading.value = false
    // message.success('删除成功')
  }

  const handleBatchRemove = async () => {
    if (!onFormStateValidator()) return
    loading.value = true
    github.rest.actions.deleteWorkflowRunLogs()
    await Promise.all(tableData.value.map(removeItem))
    loading.value = false
    tableData.value = []
  }

  return { loading, tableData, loadTableData, handleRemove, handleBatchRemove }
}
