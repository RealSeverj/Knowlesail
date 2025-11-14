import eslint from '@eslint/js'
import globals from 'globals'
import eslintPluginVue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}']
  },
  {
    ignores: ['node_modules', 'dist', 'public']
  },

  /**
   * 配置全局变量
   */
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  /** js 推荐配置 */
  eslint.configs.recommended,
  /** vue 推荐配置 */
  ...eslintPluginVue.configs['flat/recommended'],
  /** prettier 推荐配置 */
  eslintPluginPrettierRecommended,

  {
    rules: {
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true, // 单引号
          semi: false, // 无分号
          printWidth: 100, // 每行宽度至多100字符
          trailingComma: 'none', // 不加对象|数组最后逗号
          endOfLine: 'auto' // 换行符号不限制（win mac 不一致）
        }
      ],
      'vue/multi-word-component-names': ['off'],
      'vue/no-setup-props-destructure': ['off'], // 关闭 props 解构的校验
      'no-unused-vars': ['off']
    }
  }
]
