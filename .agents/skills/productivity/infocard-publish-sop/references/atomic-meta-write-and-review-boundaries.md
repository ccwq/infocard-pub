# Meta sidecar 原子写入与审查边界

## 适用范围

当发布流水线依据 bundle 创建或替换 `docs/*.meta.yaml` 时，不能依赖“先检查路径、再普通写文件”。在可写工作区中，父目录或目标可能在检查与写入之间被替换为符号链接；直接写最终文件还会在 write/fsync 失败后留下看似完整的半成品。

## 已验证实现模式

- Node 入口负责 bundle 验证、YAML 内容生成与结构化 CLI 输出。
- YAML 校验复用仓库构建链实际使用的解析器与 schema；本仓库为 `assets/home/vendor/js-yaml.min.js` + `FAILSAFE_SCHEMA`，不要维护简化 YAML parser。
- 写入交给 Linux/POSIX 描述符相对助手：
  1. 打开仓库根目录 fd。
  2. 用 `dir_fd` + `O_DIRECTORY | O_NOFOLLOW`逐级打开父目录。
  3. 在最终父目录内以 `O_CREAT | O_EXCL | O_NOFOLLOW`创建临时文件。
  4. 写完后 fsync 临时文件。
  5. create 模式通过同目录 hard-link 原子发布且不覆盖；replace 模式先以 `follow_symlinks=False`确认目标为普通文件，再 `os.replace`。
  6. fsync 父目录；任何异常都删除临时文件。
- create 模式不能直接写最终文件，否则 fsync 失败会留下阻塞重试的伪成品。

## 必测边界

- 目标文件是符号链接。
- 任一父目录组件是指向仓库外的符号链接。
- 检查后父目录路径名被交换，实际写入仍绑定已打开的目录 fd。
- write/fsync 后注入失败：最终文件不存在，临时文件无残留。
- create 不覆盖既有文件；replace 拒绝符号链接、目录、FIFO 等非普通文件。
- YAML：行尾注释、引号内 `#`、单引号转义、block array；机械字段重复键必须拒绝。

## 测试钩子安全

故障注入不能通过普通 CLI 会继承的环境变量执行破坏性目录重命名。若需要竞态钩子：

- 必须是显式 test-only 接口并有双重门禁；
- 必须在 `finally`恢复目录；
- 测试必须断言原目录仍存在且无 `.safe-meta-write-swapped`残留；
- 测试钩子不得削弱正常路径的 `O_NOFOLLOW`与 descriptor-relative 约束。

## 子智能体副作用边界

“不要 push”必须在子任务 goal/context 中重复写明，并要求返回前比较 `origin/main`。但子智能体自报不能作为证据；主线程必须用 Git 实际状态核验。若子智能体越权 push：立即报告事实与影响，不擅自 force-push、revert 或二次推送扩大副作用。

## 审查闭环

实现任务至少经过：

1. RED/GREEN 测试与本地 commit；
2. 独立规格审查；
3. 独立代码质量/安全审查；
4. 对审查发现进行最小修复并重新审查；
5. `npm test`、`npm run verify`、`git diff --check`和 Git 远端状态实证。
