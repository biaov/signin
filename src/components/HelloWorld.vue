<script setup lang="ts">
import { Octokit } from 'octokit'
import dayjs from 'dayjs'

const curDate = +dayjs()
const branchName = `feature/${curDate}/auto-pr`
const XGitHubApiVersion = '2022-11-28'
const owner = 'biaov'
const repo = 'signin'
const baseOption = {
  owner,
  repo,
  headers: {
    'X-GitHub-Api-Version': XGitHubApiVersion
  }
}
const content = `更新时间: ${dayjs().format('YYYY-MM-DD HH-mm-ss')}`

const startTask = async () => {
  const octokit = new Octokit({ auth: import.meta.env.VITE_TOKEN })

  try {
    /**
     * 获取 commit
     */
    const { data: commitsData } = await octokit.request(`GET /repos/${owner}/${repo}/commits`, baseOption)
    const { sha } = commitsData[0]

    /**
     * 创建分支
     */
    const { data: branchData } = await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
      ...baseOption,
      ref: `refs/heads/${branchName}`,
      sha
    })

    /**
     * 获取 tree
     */
    const { data: getTreeData } = await octokit.request(`GET /repos/${owner}/${repo}/git/trees/${branchData.object.sha}`, { ...baseOption, tree_sha: branchData.object.sha })

    /**
     * 创建 blob
     */
    const { data: blobData } = await octokit.request(`POST /repos/${owner}/${repo}/git/blobs`, { ...baseOption, encoding: 'utf-8', content })

    /**
     * 创建 tree
     */
    const { data: treeData } = await octokit.request(`POST /repos/${owner}/${repo}/git/trees`, {
      ...baseOption,
      base_tree: getTreeData.sha,
      tree: [{ path: 'automatic-daily-updates.txt', mode: '100644', type: 'blob', sha: blobData.sha }]
    })

    /**
     * 创建 commit
     */
    const { data: newCommitData } = await octokit.request(`POST /repos/${owner}/${repo}/git/commits`, {
      ...baseOption,
      message: content,
      author: { name: 'biaov', email: 'biaov@qq.com' },
      parents: [getTreeData.sha],
      tree: treeData.sha
    })

    /**
     * 更新分支
     */
    await octokit.request(`PATCH /repos/${owner}/${repo}/git/refs/heads/${branchName}`, { ...baseOption, sha: newCommitData.sha, ref: `heads/${branchName}`, force: true })

    /**
     * 创建 PR
     */
    const {
      data: { number }
    } = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
      ...baseOption,
      title: content,
      body: content,
      head: `biaov:${branchName}`,
      base: 'main'
    })

    /**
     * 合并 PR
     */
    await octokit.request(`PUT /repos/${owner}/${repo}/pulls/${number}/merge`, { ...baseOption, pull_number: number, commit_title: content, commit_message: content })
  } catch (error) {
    console.log(error, '--')
  }
}
</script>

<template>
  <div class="btn" @click="startTask">点击</div>
</template>

<style scoped lang="less">
.btn {
  @bg: #409eff;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 40px;
  line-height: 40px;
  margin: 100px auto;
  border-radius: 6px;
  background: @bg;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: darken(@bg, 20%);
  }
}
</style>
