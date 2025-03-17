import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    autoImport({
      // 依赖自动加载
      imports: [
        'vue',
        {
          dayjs: [['default', 'dayjs']]
        }
      ],
      dirs: ['./src/composables'],
      dts: './types/auto-imports.d.ts'
    }),
    components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: './types/components.d.ts'
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  resolve: {
    // 路径别名
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.js', '.ts', '.vue']
  }
})
