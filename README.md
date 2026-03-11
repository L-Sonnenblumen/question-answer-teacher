# Scholar Guard Front

答题系统前端项目

## 环境要求

- Node.js: v22.15.0 或更高版本
- pnpm: 10.15.1或更高版本
- 项目使用淘宝 NPM 镜像源：

```
https://registry.npmmirror.com
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm run dev
```

### 生产环境构建

```bash
pnpm run build
```

## 开发规范

### Git 提交规范

提交信息格式：`[type]: 提交说明`

type 类型说明：

| 类型       | 描述                                 |
| ---------- | ------------------------------------ |
| `feat`     | 添加新功能                           |
| `fix`      | 修复 bug                             |
| `docs`     | 修改文档                             |
| `style`    | 代码格式（不影响功能）               |
| `refactor` | 重构已有代码（非新增功能或修复 bug） |
| `perf`     | 提高性能的代码更改                   |
| `test`     | 添加或修改测试                       |
| `revert`   | 撤销以前的 commit                    |
| `chore`    | 对构建或辅助工具的更改               |
| `bugfix`   | 修复 bug                             |

示例：

```bash
git commit -m "feat: 新增用户登录功能"
git commit -m "fix: 修复登录页面样式问题"
git commit -m "docs: 更新 API 文档"
```

### 分支命名规范

| 分支类型  | 格式                  | 示例                            |
| --------- | --------------------- | ------------------------------- |
| 功能开发  | `feature/{功能名称}`  | `feature/user-login`            |
| 功能开发  | `feature/{功能名称}`  | `feature/search-bar`            |
| Bug 修复  | `bugfix/{bug描述}`    | `bugfix/fix-login-issue`        |
| Bug 修复  | `bugfix/{bug描述}`    | `bugfix/correct-typo-in-readme` |
| 热修复    | `hotfix/{问题描述}`   | `hotfix/crash-on-launch`        |
| 热修复    | `hotfix/{问题描述}`   | `hotfix/fix-api-error`          |
| 发布准备  | `release/{版本号}`    | `release/1.2.0`                 |
| 发布准备  | `release/{版本号}`    | `release/2.0.0`                 |
| 开发/测试 | `dev/{环境/测试名称}` | `dev/test-api-endpoints`        |
| 开发/测试 | `dev/{环境/测试名称}` | `dev/integration-test`          |

### 开发流程

1. **切换到master/dev分支**

   ```bash
   git checkout -b master/git checkout master
   ```

2. **同步远程分支**

   ```bash
   git fetch origin
   ```

3. **拉取远程分支最新代码**

   ```bash
   git pull origin master
   ```

4. **创建分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **开发完成后提交**

   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

6. **推送到远程**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request/Merge Request**

## 代码规范

### 代码风格

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循项目已有的代码风格

### 目录结构

```
scholar-guard-front/
├── src/                    # 源代码目录
├── public/                # 静态资源
├── package.json          # 项目配置
├── README.md            # 项目说明
└── ...                  # 其他配置文件
```

## 注意事项

1. 提交前请确保代码通过 ESLint 检查
2. 遵循约定的提交信息格式
3. 使用规范的分支命名
4. 保持代码简洁和可维护性

## 开发工具建议

- 推荐使用 VS Code 作为开发工具
- 安装 ESLint 和 Prettier 插件
- 配置编辑器自动保存时格式化

## 问题反馈

如有问题，请通过以下方式反馈：

1. 创建 Issue 描述问题
2. 提交 Pull Request 修复问题
3. 联系项目负责人

---

**提示**：开发时请确保遵循以上规范，以保持代码库的整洁和可维护性。

## 解决问题方法

1. 修复句尾lf问题 pnpm run lint --fix
2. 解决 import 顺序、未使用变量、空语句、尾随逗号、空格等全部自动修正 pnpm eslint src --ext .ts,.tsx
   --fix
