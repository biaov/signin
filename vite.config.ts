import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import tailwindcss from 'tailwindcss'
import { resolve } from 'path'
import { tailwindcssConfig } from './scripts/tailwindcss'

export default defineConfig({
  plugins: [
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
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindcssConfig())]
    }
  },
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
