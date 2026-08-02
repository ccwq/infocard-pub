# AirLLM：4GB显存跑2.8万亿参数模型

> 来源：黑白之道（华盟网原创）《4GB显存运行2.8万亿参数K3模型：AirLLM实现大模型"平民化"推理》，作者 Blake Chen
> 项目主页：https://github.com/lyogavin/airllm

## 一句话

AirLLM 不把模型变小，而是改变模型的加载方式——分层推理让显存需求取决于单层参数大小而非模型总参数量，2.8万亿参数的 Kimi K3 单卡 3.72GB 即可推理。

## 核心机制

1. **分层权重拆分**：HuggingFace 格式模型按层拆为独立权重文件写入缓存
2. **动态按需加载**：第 N 层算完即释放，第 N+1 层从磁盘加载，任意时刻显存只保留一层参数
3. **按专家加载（MoE）**：每次只把 token 路由到的专家调入显存；稀疏激活使单次推理调用参数仅占总量的极小部分
4. **预取机制（v2.5）**：当前层计算时异步预加载下一层，I/O 与计算重叠，实测约 10% 速度提升
5. **块级量化（可选）**：4bit/8bit 压缩存储阶段权重而非激活值，几乎不损失精度

## 显存对照（无量化）

| 模型 | 总参数量 | 显存需求 | 架构 |
|------|---------|---------|------|
| Kimi K3 | 2.8万亿 | 3.72GB | MoE |
| DeepSeek-V3 | 6710亿 | ~12GB | MoE |
| Llama 3.1 405B | 4050亿 | ~8GB | Dense |
| Qwen3-235B | 2350亿 | ~3GB | MoE |
| Llama 3 70B | 700亿 | ~4GB | Dense |
| Qwen3-30B | 300亿 | ~1-3GB | MoE |

对比基线：Llama 3.1 405B 全精度需 >800GB 显存，INT4 量化也需 60-80GB。

## Kimi K3 专项

- `pip install compressed-tensors flash-attn`（K3 强制要求 Flash Attention）
- flash-attn 仅 CUDA 12 预编译 wheel，CUDA 13 需源码编译
- transformers 5.x 无法加载 K3 remote code，需 4.56.x
- RTX 6000 Ada（48GB）实测 VRAM 稳定 3.72GB，比参数量为其千分之一的 Llama 3 8B 还低

## 代码

```python
from airllm import AutoModel
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")
# model = AutoModel.from_pretrained("moonshotai/Kimi-K3")
# model = AutoModel.from_pretrained("deepseek-ai/DeepSeek-V3")
```

覆盖架构：Llama、Qwen、DeepSeek、Mistral、Phi、Gemma、ChatGLM、Baichuan、InternLM 等。

## 安全启示

1. **本地化推理价值**：数据敏感行业无需上传第三方 API 即可获得强大推理，私有化门槛降低、泄露风险减少
2. **威胁检测新战场**：恶意软件可能利用本地大模型自动化生成钓鱼邮件/恶意代码/社会工程攻击，需为 AI-Assisted Attack 做准备

## 边界

本地推理解决显存与隐私，但速度、吞吐与并发仍受磁盘 I/O 约束；生产环境需按场景权衡本地 vs 云端。
