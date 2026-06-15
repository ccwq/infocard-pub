# 图像分层全景调研报告
**主题：AI 图像分层生成与拆解工具全景图**
**调研时间：2026-06-14**
**发布渠道：信息卡 + 存档**

---

## 一、背景问题

当前主流 AI 生图模型（Stable Diffusion、Midjourney、DALL-E 等）输出的 JPEG/PNG，本质上是**扁平化光栅图像**——所有像素粘在一起，无法单独编辑其中一个元素。

专业设计工作流依赖 **PSD 格式**（保留图层、Alpha 通道、合成关系），需要的是：
- 独立的背景层、前景主体层、可编辑文本层
- 透明通道支持半透明区域（玻璃、烟雾、头发边缘）
- 图层可移动、缩放、替换、二次排版

---

## 二、五类分层方法全景

### A 类：AI 原生分层生成（生成即分层）

#### 1. Qwen-Image-Layered（阿里，2025-12）
- **定位**：首次在模型内实现 PS 级图层理解的开源模型
- **能力**：将任意图像分解为多个 **RGBA 图层**（3-8+ 层），智能填充被遮挡区域
- **特点**：自带透明通道，边缘清晰，支持递归分解实现无限精细化
- **技术**：基于 Qwen2.5-VL + diffusers，支持本地部署
- **开源**：Apache 2.0
- **安装**：
  ```bash
  pip install git+https://github.com/huggingface/diffusers
  pip install transformers>=4.51.3
  ```
- **代码示例**：
  ```python
  from diffusers import QwenImageLayeredPipeline
  pipeline = QwenImageLayeredPipeline.from_pretrained("Qwen/Qwen2.5-VL-Image-Layered")
  layers = pipeline分解(input_image, num_layers=5)
  ```

#### 2. OmniPSD（NUS + Lovart AI，2025-12）
- **定位**：arXiv:2512.09247，基于 Flux 生态的统一 Diffusion Transformer 框架
- **能力**：在一个模型内同时支持 **Text-to-PSD**（文生分层 PSD）和 **Image-to-PSD**（图拆分层 PSD）
- **技术细节**：
  - 空间注意力机制学习多图层空间关系
  - RGBA-VAE 重训练保留半透明区域边缘细节
  - 迭代上下文编辑逐步拆解前景与文本
- **输出**：真正可导入 Photoshop 的 `.psd` 文件，含透明 Alpha 通道
- **在线体验**：tool.lu/en_US/deck/Xr/detail

#### 3. Canva Magic Layers（2026-03）
- **定位**：Canva AI 功能更新，上传任意 AI 图像自动分解为可编辑格式
- **特点**：不需要在 Canva 内生成，任何 AI 图像均可导入后分层
- **能力**：文字可修改样式/颜色/字号/排版，图像可替换内容

---

### B 类：生成后拆解（已有图 → 分层图）

#### 4. Lovart AI（Web 工具，2025-11）
- **入口**：https://www.lovart.ai/zh/home → 新建项目 → 上传图片 → 图片 → 编辑元素
- **能力**：AI 自动分层，文字层可改样式颜色字号排版，图像层可改内容
- **特点**：纯 Web 操作，无需安装，无需 GPU

#### 5. Qwen-Image-Layered（同模型，逆向使用）
- 与 A1 同一模型，可对任意现有图像做分层拆解
- 支持 HuggingFace diffusers 本地部署

---

### C 类：背景移除 / 抠图（单层 → 前景分离）

#### 6. rembg（Python/CLI）
- **底层**：U-2-Net（CVPR 2020）
- **安装**：
  ```bash
  # CPU
  pip install rembg
  # GPU
  pip install rembg[gpu]
  ```
- **CLI 用法**：
  ```bash
  rembg i input.png output.png          # 单文件
  rembg p input/ output/               # 批处理
  ```
- **Python 用法**：
  ```python
  from rembg import remove
  with open("input.png","rb") as i, open("output.png","wb") as o:
      o.write(remove(i.read()))
  ```
- **服务模式**：`rembg s --host 0.0.0.0 --port 7000`

#### 7. RMBG-2.0（BRIA AI，2026）
- **定位**：高精度背景移除模型，精度/速度/显存/易用性四维优于 rembg
- **适合**：专业电商、人像、产品摄影背景分离
- **对比**：精度更高，但资源消耗更大

---

### D 类：提示词工程路线（AI 生图 → PSD）

#### 8. GPT Image 2 → PSD Prompt 方法
- **思路**：通过精细提示词引导模型输出多张独立图层图，再手动合成 PSD
- **核心提示词要点**：
  1. **独立图层**：每个元素单独存在图层，可隐藏/移动/缩放
  2. **背景处理**：保留内容本身，只去除多余白底
  3. **图层顺序**：前后层级必须正确，避免 PSD 打开错位
  4. **可编辑性**：文字、图表、装饰元素均可单独编辑
- **补充自检句**：
  > "请检查最终 PSD 预览是否尽量还原原图，避免出现图层偏移、尺寸变化、顺序错误、白底残留或元素误删。"
- **局限**：依赖模型对空间关系的理解，成功率不稳定

---

### E 类：传统工具与后处理

#### 9. psd-tools / psd-tools2（Python 库）
- **能力**：读写 PSD 文件，导出单图层为 PNG/JPEG
- **安装**：`pip install psd-tools`
- **用法**：
  ```bash
  psd-tools convert input.psd output.png
  psd-tools export_layer input.psd output_dir/
  ```

#### 10. Photoshop AI（Adobe Firefly）
- **能力**：
  - 生成式扩展（Generative Expand）
  - 生成式填充（局部重绘）
  - 图层感知的 AI 编辑
- **限制**：需 Creative Cloud 订阅，输出仍以扁平为主

#### 11. StartAI Photoshop 插件
- **能力**：文生图、局部重绘、线稿上色、产品精修
- **定位**：Windows 专用，免费，功能较基础

---

## 三、方法选型决策树

```
需要做什么？
├── 从文本生成带分层的可编辑 PSD
│   ├── OmniPSD（Text-to-PSD）✅
│   └── Qwen-Image-Layered（图层感生成）
│
├── 已有图像 → 分层拆解
│   ├── Web 操作，不想装任何东西
│   │   └── Lovart AI ✅
│   ├── 本地 Python，想精细控制
│   │   └── Qwen-Image-Layered ✅
│   └── 想直接出 PSD 文件
│       └── OmniPSD（Image-to-PSD）✅
│
├── 只需要去除背景（单层分离）
│   ├── 快速、轻量、批处理
│   │   └── rembg ✅
│   └── 高精度电商级
│       └── RMBG-2.0 ✅
│
└── 用 AI 生图工具 + 提示词工程
    └── GPT Image 2 + 精细 PSD Prompt ✅（不稳定）
```

---

## 四、关键坑点

1. **白底残留**：背景移除时模型常误删元素内部的白色内容，需要后处理蒙版修正
2. **半透明边缘**：玻璃/烟雾/头发边缘需要原生 RGBA 支持，rembg 类工具只做二值蒙版
3. **图层顺序漂移**：GPT Image 2 Prompt 方法图层顺序容易错位，需加自检句
4. **VAE 压缩失真**：传统 VAE 在处理半透明区域时会丢失边缘细节，OmniPSD 用 RGBA-VAE 解决这个问题
5. **显存门槛**：Qwen-Image-Layered 本地部署推荐 RTX 4090（24GB），OmniPSD 需要 Flux 生态 GPU 资源

---

## 五、工具对比矩阵

| 工具 | 类型 | PSD 输出 | RGBA | Web 可用 | 本地部署 | 开源 | 适用场景 |
|---|---|---|---|---|---|---|---|
| Qwen-Image-Layered | 原生分层 | 部分 | ✅ | ❌ | ✅ | ✅ | 精细图层拆解 |
| OmniPSD | 原生分层 | ✅ | ✅ | ✅ | ✅ | ✅ | 专业 PSD 工作流 |
| Lovart AI | Web 拆解 | ❌ | ✅ | ✅ | ❌ | ❌ | 快速分层编辑 |
| Canva Magic Layers | Web 拆解 | ❌ | ✅ | ✅ | ❌ | ❌ | Canva 生态用户 |
| rembg | 背景移除 | ❌ | 部分 | CLI | ✅ | ✅ | 批处理抠图 |
| RMBG-2.0 | 背景移除 | ❌ | 部分 | API | ✅ | ❌ | 高精度电商 |
| GPT Image 2 Prompt | 提示词工程 | ⚠️ | ⚠️ | API | ❌ | ❌ | 不稳定备选 |
| psd-tools | 后处理 | ✅ | ✅ | ❌ | ✅ | ✅ | PSD 读写导出 |

---

## 六、数据来源

- Qwen-Image-Layered：阿里通义实验室，2025-12-22 开源
- OmniPSD：arXiv:2512.09247，NUS + Lovart AI，2025-12
- Canva Magic Layers：Canva，2026-03
- Lovart AI：https://www.lovart.ai
- rembg：https://github.com/danielgatis/rembg
- RMBG-2.0：BRIA AI，2026
- GPT Image 2 PSD Prompt：社区实践，2026

---

*报告生成时间：2026-06-14 · darkgreen-style · Hermes Agent*