<script setup lang="ts">
import { Octokit } from 'octokit'
import dayjs from 'dayjs'
import { ref } from 'vue'

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
    // const as = await github.auth('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')
    // console.log(as, '--as')
    // await github.request('GET /orgs/biaov/actions/secrets', {
    //   org: 'biaov'
    // })
    return
    const { data } = await github.rest.repos.getCommit({ ...baseOption, ref: 'main' })
    const curDate = +new Date()
    const branchName = `feature/${curDate}/auto-create`
    const baseRef = 'main'
    const content = `更新时间戳: ${curDate}`
    const context = { sha: data.sha }

    const { data: branchData } = await github.rest.git.createRef({ ...option, ref: `refs/heads/${branchName}`, sha: context.sha })

    const { data: getTreeData } = await github.rest.git.getTree({ ...option, tree_sha: branchData.object.sha })

    const { data: blobData } = await github.rest.git.createBlob({ ...option, content })

    const { data: treeData } = await github.rest.git.createTree({
      ...option,
      base_tree: getTreeData.sha,
      tree: [{ path: 'automatic-daily-updates.txt', mode: '100644', type: 'blob', sha: blobData.sha }]
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

    // const { data } = await octokit.request(`GET /repos/${owner}/${repo}/commits`, baseOption)
    // console.log(data, '--res')
    /**
     * 获取 commit
     */
    // const { data: commitsData } = await octokit.request(`GET /repos/${owner}/${repo}/commits`, baseOption)
    // const { sha } = commitsData[0]

    // const data = await octokit.rest.git.createRef({ ...baseOption, ref: `refs/heads/${branchName}`, sha: sha })
    // console.log(data, '--data')

    // /**
    //  * 创建分支
    //  */
    // const { data: branchData } = await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
    //   ...baseOption,
    //   ref: `refs/heads/${branchName}`,
    //   sha
    // })

    // /**
    //  * 获取 tree
    //  */
    // const { data: getTreeData } = await octokit.request(`GET /repos/${owner}/${repo}/git/trees/${branchData.object.sha}`, { ...baseOption, tree_sha: branchData.object.sha })

    // /**
    //  * 创建 blob
    //  */
    // const { data: blobData } = await octokit.request(`POST /repos/${owner}/${repo}/git/blobs`, { ...baseOption, encoding: 'utf-8', content })

    // /**
    //  * 创建 tree
    //  */
    // const { data: treeData } = await octokit.request(`POST /repos/${owner}/${repo}/git/trees`, {
    //   ...baseOption,
    //   base_tree: getTreeData.sha,
    //   tree: [{ path: 'automatic-daily-updates.txt', mode: '100644', type: 'blob', sha: blobData.sha }]
    // })

    // /**
    //  * 创建 commit
    //  */
    // const { data: newCommitData } = await octokit.request(`POST /repos/${owner}/${repo}/git/commits`, {
    //   ...baseOption,
    //   message: content,
    //   author: { name: 'biaov', email: 'biaov@qq.com' },
    //   parents: [getTreeData.sha],
    //   tree: treeData.sha
    // })

    // /**
    //  * 更新分支
    //  */
    // await octokit.request(`PATCH /repos/${owner}/${repo}/git/refs/heads/${branchName}`, { ...baseOption, sha: newCommitData.sha, ref: `heads/${branchName}`, force: true })

    // /**
    //  * 创建 PR
    //  */
    // const {
    //   data: { number }
    // } = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
    //   ...baseOption,
    //   title: content,
    //   body: content,
    //   head: `biaov:${branchName}`,
    //   base: 'main'
    // })

    // /**
    //  * 合并 PR
    //  */
    // await octokit.request(`PUT /repos/${owner}/${repo}/pulls/${number}/merge`, { ...baseOption, pull_number: number, commit_title: content, commit_message: content })
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
