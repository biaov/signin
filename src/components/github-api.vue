<script setup lang="ts">
import { Octokit } from 'octokit'
import { message } from 'ant-design-vue'
import { useTransformOptions, useWorkflow, useRepos, useHandles } from './hooks'

defineOptions({
  name: 'GithubApi'
})

!import.meta.env.VITE_GITHUB_TOKEN && message.error('请在 .env 文件中配置 VITE_GITHUB_TOKEN')
!import.meta.env.VITE_DEFAULT_OWNER && message.error('请在 .env 文件中配置 VITE_DEFAULT_OWNER')

const formState = ref({ owner: 'biaov', repo: 'signin' })
const onFormStateValidator = () => {
  if (Object.values(formState.value).some(item => !item)) {
    message.error('请填写完整')
    return false
  } else {
    return true
  }
}

const github = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN })
const [ownerOptions] = useTransformOptions([import.meta.env.VITE_DEFAULT_OWNER])
const [repOptions] = useRepos({ github, formState })
const { handleBiz } = useHandles({ github, formState, onFormStateValidator })
const { loading, tableData, loadTableData, handleRemove, handleBatchRemove } = useWorkflow({ github, formState, onFormStateValidator })
const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH-mm-ss')
</script>

<template>
  <a-card title="工作流列表" justify="center">
    <a-row justify="center" class="w-500">
      <a-col span="24">
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-form-item label="作者" required>
            <a-select v-model:value="formState.owner" :options="ownerOptions" placeholder="请选择作者名" disabled />
          </a-form-item>
          <a-form-item label="仓库名" required>
            <a-select v-model:value="formState.repo" :options="repOptions" allow-clear placeholder="请选择仓库名" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 19, offset: 5 }">
            <a-space>
              <a-button type="primary" @click="loadTableData">查询</a-button>
              <a-button type="primary" danger @click="handleBatchRemove">删除工作流</a-button>
              <a-button type="primary" @click="handleBiz('create')">创建合并分支</a-button>
              <a-button type="primary" @click="handleBiz('merge')">合并分支</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <a-table :data-source="tableData" :loading="loading" row-key="id" :scroll="{ x: 980 }">
      <a-table-column title="编码" data-index="id" :width="120" />
      <a-table-column title="工作流名称" data-index="name" :min-width="200" />
      <a-table-column title="触发事件" data-index="event" :width="120" />
      <a-table-column title="页面地址" :width="120">
        <template #="{ record }">
          <a-button type="link" :href="record.html_url" target="_blank">页面地址</a-button>
        </template>
      </a-table-column>
      <a-table-column title="执行人" :width="120">
        <template #="{ record }">
          <a-button type="link" :href="record.actor.html_url" target="_blank">
            {{ record.actor.login }}
          </a-button>
        </template>
      </a-table-column>
      <a-table-column title="创建时间" :width="180">
        <template #="{ record }">
          {{ formatDate(record.created_at) }}
        </template>
      </a-table-column>
      <a-table-column title="操作" :width="120">
        <template #="{ record }">
          <a-button type="link" danger @click="handleRemove(record)">删除</a-button>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>
