import type { Config } from 'tailwindcss'

export const getTheme = () => ({
  white: '#fff',
  primary: '#409eff',
  success: '#67c23a',
  info: '#909399',
  warning: '#e6a23c',
  danger: '#f56c6c'
})

/**
 * tailwindcss 配置
 */
export const tailwindcssConfig = (): Config => {
  const spacing = {}
  const zIndex = {}

  for (let i = 0; i < 1000; i++) {
    spacing[i] = `${i}px`
    i < 10 && (zIndex[i] = i)
  }

  return {
    content: ['./src/**/*.vue', './src/**/*.js', './*.html'],
    theme: {
      spacing,
      extend: {
        fontSize: ({ theme }) => theme('spacing'),
        zIndex,
        colors: getTheme()
      }
    },
    corePlugins: {
      preflight: false
    }
  }
}
