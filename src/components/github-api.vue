<script setup lang="ts">
import { ref, createVNode } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { Octokit } from 'octokit'
import { useDeleteWorkflow, useCliMergeBranch, usePreMerge, useTransformOptions } from './hooks'

defineOptions({
  name: 'GithubApi'
})

const formState = ref({ owner: 'biaov', repo: 'signin' })
const github = new Octokit({ auth: import.meta.env.VITE_TOKEN })

const [ownerOptions, repOptions] = useTransformOptions(['biaov'], ['signin'])

const handleBiz = async (type: string) => {
  const hideLoading = message.loading('执行中...', 0)
  try {
    switch (type) {
      case 'create':
        await useCliMergeBranch(github, formState.value)
        break
      case 'delete':
        await useDeleteWorkflow(github, formState.value)
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
</script>

<template>
  <a-row justify="center" class="w-500">
    <a-col span="24">
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="作者" required>
          <a-select v-model:value="formState.owner" :options="ownerOptions" placeholder="请选择作者名" disabled />
        </a-form-item>
        <a-form-item label="仓库名" required>
          <a-select v-model:value="formState.repo" :options="repOptions" placeholder="请选择仓库名" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 19, offset: 5 }">
          <a-space>
            <a-button type="primary" @click="handleBiz('create')">创建合并分支</a-button>
            <a-button type="primary" danger @click="handleBiz('delete')">删除工作流</a-button>
            <a-button type="primary" @click="handleBiz('merge')">合并分支</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-col>
  </a-row>
</template>

<style scoped lang="less">
.w-fill {
  width: 100%;
}
.w-500 {
  width: 500px;
}
</style>
