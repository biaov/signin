<script setup lang="ts">
import { Octokit } from 'octokit'
import dayjs from 'dayjs'
import { Buffer } from 'buffer'

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
const option = { owner, repo }
const content = `更新时间: ${dayjs().format('YYYY-MM-DD HH-mm-ss')}`

const startTask = async () => {
  const github = new Octokit({ auth: import.meta.env.VITE_TOKEN })

  try {
    const { data: readmeCont } = await github.rest.repos.getContent({ ...baseOption, ref: 'main', path: 'README.md' })
    const newReadmeCont = Buffer.from((readmeCont as Record<string, any>).content, 'base64')
      .toString()
      .replace(/(?<=签到\+)\d+/, value => `${+value + 1}`)
    const { data } = await github.rest.repos.getCommit({ ...baseOption, ref: 'main' })
    const curDate = +new Date()
    const branchName = `feature/${curDate}/auto-create`
    const baseRef = 'main'
    const context = { sha: data.sha }

    const { data: branchData } = await github.rest.git.createRef({ ...option, ref: `refs/heads/${branchName}`, sha: context.sha })
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

    const { data: newCommitData } = await github.rest.git.createCommit({
      ...option,
      message: content,
      author: { name: 'biaov', email: 'biaov@qq.com' },
      tree: treeData.sha,
      parents: [getTreeData.sha]
    })

    await github.rest.git.updateRef({ ...option, ref: `heads/${branchName}`, sha: newCommitData.sha, force: true })

    const {
      data: { number }
    } = await github.rest.pulls.create({ ...option, title: `自动创建分支${branchName}`, head: `biaov:${branchName}`, base: baseRef, body: `自动创建分支${branchName}` })

    await github.rest.pulls.merge({ ...option, pull_number: number })
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
