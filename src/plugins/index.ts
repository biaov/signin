import type { App } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'tailwindcss/tailwind.css'
import '@/style/result.less'

export const install = (app: App) => {
  app.use(Antd)
}
