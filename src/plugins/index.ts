import type { App } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/style/tailwindcss.css'
import '@/style/result.less'

export const install = (app: App) => {
  app.use(Antd)
}
