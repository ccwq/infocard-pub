# 2026-08-24 Content Refactor Spec

## Global constraints
- No universal Hero + stats + links template.
- Every required module must contain concrete facts, examples, commands, parameters, relationships, or boundaries.
- Preserve each card primary source and existing factual claims unless verified before changing.
- Do not add a new content category without user discussion.
- This is a local implementation worktree; no push from subagents.

## Card specs

### claude-video
- content_type: tool
- content_subtype: CLI / skill plugin
- required_modules: installation commands, first-use workflow, input/output example, core parameters, dependencies/environment, license
- add: one end-to-end video-to-answer flow and parameter table; keep source claims grounded.

### agency-agents-zh
- content_type: collection
- content_subtype: Agent / role collection
- required_modules: collection overview, taxonomy, representative roles with persona/workflow/deliverable, installation/use, scenario recommendations
- add: 4 representative role cards across departments and a scenario selector.

### hermes-self-evo
- content_type: collection
- content_subtype: Agent plugin ecosystem
- required_modules: plugin inventory, taxonomy, representative plugin capabilities, installation/use, scenario recommendations
- add: plugin comparison matrix, dependency/relationship map, choose-by-scenario flow.

### ai-crawler-ua
- content_type: method
- content_subtype: web collection / crawler technique
- required_modules: problem, principle, applicable scenarios, copyable steps/example, risks/boundaries
- add: request flow, legitimate-use boundary, failure modes, and safer alternatives.

### claude-vibe-squad
- content_type: framework
- content_subtype: local multi-agent orchestration framework
- required_modules: positioning, architecture/module relationship, supported model families/tools, quick start, core configuration, license
- add: architecture diagram-like flow, role routing example, model-family comparison.

### watermarks-remover
- content_type: tool
- content_subtype: CLI / media metadata processing
- required_modules: installation, first-use examples, core parameters, dependencies, license, use boundaries
- add: three-layer processing pipeline, before/after artifact types, metadata safety and provenance warning.

### less-ai-tone
- content_type: dataset
- content_subtype: text style dataset / training resource
- required_modules: scale, schema, real sample, format, access, license, use limits
- add: record schema table, representative sample pair, split/quality explanation, training/evaluation use.

### cad-1000-hours
- content_type: dataset
- content_subtype: GUI operation video dataset
- required_modules: scale, schema, real sample, format, access, license, use limits
- add: one workflow record, input/action/output structure, category distribution, agent training/evaluation use.

### deepseek-harness-studio
- content_type: framework
- content_subtype: desktop harness / agent workspace
- required_modules: positioning, architecture/module relationship, supported models/tools, quick start, core configuration, ecosystem, license
- add: desktop-to-model-to-tool flow, configuration example, task lifecycle, operational boundaries.
