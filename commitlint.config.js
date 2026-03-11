export default {
  // 继承默认的 Angular 提交规范
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提交类型必须是以下其中之一
    'type-enum': [
      2, // 2 代表错误级别 (error)
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 Bug
        'docs', // 文档修改
        'style', // 代码格式修改（不影响逻辑）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖修改
        'ci', // CI 配置文件修改
        'chore', // 杂项工作
        'revert', // 回滚
      ],
    ],
    // subject (提交说明) 不能为空
    'subject-empty': [2, 'never'],
    // type (提交类型) 不能为空
    'type-empty': [2, 'never'],
  },
};
