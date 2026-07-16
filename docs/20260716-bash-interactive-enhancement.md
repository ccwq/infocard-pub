# Bash 交互增强实战：fzf + zoxide + ble.sh

面向日常开发者的 Bash 交互增强方案：不迁移 Shell，保留既有 alias、脚本和 Bash 兼容性，用 fzf、zoxide 与 ble.sh 分别改善历史搜索、目录跳转和命令行编辑。

## 三件工具

- **fzf**：`Ctrl-R` 模糊检索历史命令，选中后回填到命令行再修改。
- **zoxide**：`z <关键词>` 按访问频率和新近度跳转目录；`zi <关键词>` 交互选择。
- **ble.sh**：输入语法高亮、菜单补全和更好的 Bash 行编辑体验。

## Ubuntu / Debian 安装

```bash
sudo apt-get update
sudo apt-get install -y fzf zoxide gawk
git clone --depth=1 https://github.com/akinomyoga/ble.sh.git ~/.local/src/blesh
make -C ~/.local/src/blesh install PREFIX="$HOME/.local"
```

## ~/.bashrc 配置

```bash
if command -v fzf >/dev/null 2>&1; then
  source <(fzf --bash)
fi
if command -v zoxide >/dev/null 2>&1; then
  eval "$(zoxide init bash)"
fi
if [[ $- == *i* && -r "$HOME/.local/share/blesh/ble.sh" ]]; then
  source "$HOME/.local/share/blesh/ble.sh" --noattach
  ble-attach
fi
```

新开终端或执行 `source ~/.bashrc` 后生效。最小方案只使用 fzf + zoxide；ble.sh 是输入高亮与补全体验的可选增强。

- 信息卡：https://ccwq.github.io/infocard-pub/docs/20260716-bash-interactive-enhancement.html
- 来源：https://github.com/junegunn/fzf 、https://github.com/ajeetdsouza/zoxide 、https://github.com/akinomyoga/ble.sh
