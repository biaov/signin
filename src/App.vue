<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import GithubApi from './components/github-api.vue'

dayjs.locale(zhCN.locale)
</script>

<template>
  <a-config-provider :locale="zhCN">
    <div class="wrap">
      <GithubApi />
    </div>
  </a-config-provider>
</template>

<style lang="less" scoped>
.wrap {
  padding: 100px;
}
</style>
