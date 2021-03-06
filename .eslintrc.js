module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 0,
    'max-len': [1, 140, 4],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  settings: {
    'import/core-modules': [
      'electron'
    ]
  }
};
