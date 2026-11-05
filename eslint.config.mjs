import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'src/assets/libs/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser }
  },
  { rules: { 'vue/multi-word-component-names': 'off' } },
  {
    files: ['*.mjs'],
    languageOptions: { globals: globals.node }
  }
]
