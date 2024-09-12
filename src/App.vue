<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'

dayjs.locale(zhCN.locale)
</script>

<template>
  <a-config-provider :locale="zhCN">
    <div class="p-50 bg-gray-100 min-h-screen">
      <github-api />
    </div>
  </a-config-provider>
</template>
