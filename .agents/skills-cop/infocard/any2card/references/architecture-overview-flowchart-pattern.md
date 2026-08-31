# Architecture Overview Flowchart Pattern

This note captures a reusable pattern for sections titled **Architecture Overview / 架构总览 / Architecture** in infocards.

## When to use
Use a flowchart when the section is describing a system or workflow with 3+ stages, especially for agent/tool/product cards.

## What to prefer
- Layout: **left-to-right flow** for 4 stages when space permits.
- Nodes: short, Chinese-first labels; keep English product/model names only as anchors.
- Connectors: visible arrows between nodes; avoid list-only presentation when the section claims to be an architecture overview.
- Boundary note: add one compact note box under the flowchart to state scope / non-goals.

## Good pattern
- `本机执行 → 事件桥接 → 手机操作 → 续接上下文`
- Put the flowchart inside the architecture section as the visual centerpiece.
- Keep body text below the chart short; let the diagram do the structural work.

## Pitfall
If the section reads like a numbered explanation with separate cards but no arrows, it is not a flowchart yet, even if the steps are technically ordered.
