<script setup lang="ts">
import { Octokit } from 'octokit'
import { Buffer } from 'buffer'
import { useDeleteWorkflow, useCliMergeBranch, usePreMerge } from './hooks'

defineOptions({
  name: 'GithubApi'
})

const owner = 'biaov'
const repo = 'signin'

const startTask = async () => {
  const github = new Octokit({ auth: import.meta.env.VITE_TOKEN })

  try {
    const option = { owner, repo }
    // usePreMerge(github, option) // 创建合并分支
    // useDeleteWorkflow(github, option) // 删除工作流
    useCliMergeBranch(github, option) // 自动创建合并分支
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
