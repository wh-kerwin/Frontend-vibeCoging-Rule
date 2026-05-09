import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    rules: {
      // Enforce consistent import style for types.
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Prefer `const` assertions for read-only refs.
      'prefer-const': 'error',
      // Vue-specific: require emits declaration.
      'vue/define-emits-declaration': 'error',
      // Vue-specific: require props declaration.
      'vue/define-props-declaration': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
)
