module.exports = {
  extends: "eslint:recommended",
  env: {
    commonjs: true,
    es6: true,
    node: true,
    "jest/globals": true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  globals: {
    fetch: true,
  },
  rules: {},
  plugins: ["jest"],
};
