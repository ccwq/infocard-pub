# Claude Code Thinking Skills：39 个技能分别擅长什么

- 发布时间：2026-06-01 05:53:36 CST
- 来源：<https://github.com/tjboudreaux/cc-thinking-skills>
- 结论：这不是一份零散 prompt 集合，而是一套给 Claude Code 用的思维框架库；真正的入口是 `thinking-model-router`。

## 这个仓库是什么

它收录了 39 个思维技能，覆盖决策、认知、系统、排障、估算、产品和元技能。最实用的读法不是逐个背名字，而是先把它分成“怎么判断、怎么分析、怎么排障、怎么估算、怎么选入口”五层。

## 先怎么用

1. **不确定从哪开始**：先用 `thinking-model-router`。
2. **知道问题类型，但不知道方法**：用 `thinking-model-selection`。
3. **一个模型不够用**：用 `thinking-model-combination` 把几个框架拼起来。
4. **要做严肃决策**：优先看 `first-principles`、`pre-mortem`、`bayesian`、`inversion`。
5. **要查根因或做系统排障**：优先看 `systems`、`five-whys-plus`、`scientific-method`、`red-team`。

## Start Here / Meta Skills

- **thinking-model-router**（Model Router）：Route to the right mental model based on your domain and problem type. The single entry point for all thinking skills.
- **thinking-model-selection**（Model Selection）：Choose the right mental model for the problem at hand. Use when facing new problems, when current approaches fail, or when you need to match tool to context.
- **thinking-model-combination**（Model Combination）：Combine multiple mental models for richer analysis. Use for complex problems requiring multiple lenses, high-stakes decisions, or when single models leave blind spots.

## Decision Making & Analysis

- **thinking-first-principles**（First Principles Reasoning）：Break complex problems into fundamental truths by questioning assumptions and rebuilding from irreducible components. Use for innovation, challenging status quo, or when conventional solutions fail.
- **thinking-second-order**（Second-Order Thinking）：Think beyond immediate consequences to second and third-order effects. Use for strategic decisions, policy changes, and avoiding unintended consequences.
- **thinking-inversion**（Inversion Thinking）：Approach problems backward by identifying paths to failure, then systematically avoiding them. Use for risk identification, planning, and avoiding obvious mistakes.
- **thinking-pre-mortem**（Pre-Mortem Analysis）：Imagine a project has failed and work backward to identify why. Use at project kickoffs, before major decisions, or when optimism may be obscuring risks.
- **thinking-kepner-tregoe**（Kepner-Tregoe Rational Process）：Systematic rational process for complex problem analysis, decision making, and risk assessment. Use for high-stakes engineering decisions, root cause analysis beyond 5 Whys, and multi-factor evaluations requiring structured criteria.
- **thinking-reversibility**（Reversibility Thinking）：Classify decisions by reversibility and match decision process to decision type. Use for technology choices, architecture decisions, process changes, and hiring decisions.
- **thinking-regret-minimization**（Regret Minimization Framework）：Project to your future self and ask what you would regret not doing. Use for career decisions, strategic pivots, risk-taking choices, and life-changing decisions.
- **thinking-opportunity-cost**（Opportunity Cost Thinking）：Evaluate decisions by what you give up, not just what you gain. Use for resource allocation, prioritization, build vs. buy choices, and technical debt evaluation.

## Cognitive & Behavioral

- **thinking-bayesian**（Bayesian Reasoning）：Update beliefs systematically based on new evidence using probabilistic reasoning. Use when estimating probabilities, learning from data, or making decisions under uncertainty.
- **thinking-debiasing**（Cognitive Debiasing）：Systematic checklist to identify and counteract cognitive biases in decision-making. Use before major decisions, when evaluating recommendations, or when stakes are high.
- **thinking-dual-process**（Dual-Process Thinking）：Apply Kahneman's Dual-Process Theory to recognize when to trust intuition vs engage deliberate analysis. Use for high-stakes decisions, error-prone contexts, or when balancing speed vs accuracy.
- **thinking-bounded-rationality**（Bounded Rationality and Satisficing）：Apply Herbert Simon's Bounded Rationality and satisficing to make good-enough decisions under real-world constraints. Use for design decisions under time pressure, recognizing cognitive limits, and setting appropriate stopping criteria.
- **thinking-socratic**（Socratic Questioning）：Systematic questioning framework to deepen understanding, challenge assumptions, and uncover hidden beliefs. Use for requirements gathering, debugging, coaching, and critical analysis.
- **thinking-probabilistic**（Probabilistic Thinking）：Express confidence in ranges, update predictions with new information, and track calibration over time. Use for project estimation, risk assessment, and decision making under uncertainty.
- **thinking-steel-manning**（Steel-Manning）：Argue against the strongest version of opposing positions, not the weakest. Use for design reviews, evaluating alternatives, conflict resolution, and decision validation.

## Systems & Strategy

- **thinking-systems**（Systems Thinking）：Analyze problems as interconnected systems with feedback loops, emergent behavior, and non-linear effects. Use for debugging complex systems, architecture decisions, and understanding unexpected behavior.
- **thinking-feedback-loops**（Feedback Loop Analysis）：Analyze systems using Donella Meadows' feedback loop framework to identify reinforcing loops, balancing loops, delays, and leverage points. Use for organizational dynamics, product growth design, debugging runaway or oscillating systems, and finding high-impact interventions.
- **thinking-archetypes**（Systems Archetypes）：Recognize Senge's Systems Archetypes to diagnose recurring organizational and technical problems, identify why fixes keep failing, and design interventions that address root structure.
- **thinking-ooda**（OODA Loop）：Rapid decision-making loop for dynamic situations. Use for incident response, competitive scenarios, time-sensitive decisions, and situations requiring quick adaptation.
- **thinking-leverage-points**（Leverage Points）：Identify where small changes can have large effects using Donella Meadows' hierarchy of system intervention points. Use for strategic decisions, system optimization, and choosing where to focus engineering effort.
- **thinking-theory-of-constraints**（Theory of Constraints）：Identify and manage the bottleneck; improvements elsewhere don't matter until the constraint is addressed. Use for performance optimization, process improvement, and resource allocation.
- **thinking-cynefin**（Cynefin Framework）：Classify problems by complexity domain (clear, complicated, complex, chaotic) and match approach to domain. Use for choosing methodologies, problem framing, and process design.

## Problem Solving & Innovation

- **thinking-occams-razor**（Occam's Razor (Parsimony Principle)）：Apply parsimony principle to prefer simpler explanations with fewer assumptions. Use for hypothesis selection in debugging, architecture decisions, and choosing between competing approaches.
- **thinking-map-territory**（Map-Territory Thinking）：Recognize limits of mental models and diagrams. Use when models diverge from reality, debugging expectation mismatches, or questioning abstraction accuracy.
- **thinking-circle-of-competence**（Circle of Competence）：Know the boundaries of your expertise and operate within them. Use when evaluating opportunities, making decisions outside your domain, or assessing when to defer to experts.
- **thinking-triz**（TRIZ Thinking）：Apply TRIZ (Theory of Inventive Problem Solving) methodology to resolve technical contradictions and find innovative solutions. Use for engineering design, breaking through impossible constraints, and systematic innovation.
- **thinking-five-whys-plus**（Five Whys Plus）：Enhanced root cause analysis with explicit bias guards and stopping criteria. Use for incident post-mortems, bug investigations, and process failures where standard 5 Whys might mislead.
- **thinking-scientific-method**（Scientific Method）：Hypothesis → Prediction → Test → Revise with explicit falsification. Use for debugging, feature experimentation, performance investigation, and A/B testing design.
- **thinking-thought-experiment**（Thought Experiments）：Test ideas through hypothetical scenarios when empirical testing is impractical. Use for architecture evaluation, edge case analysis, ethics considerations, and strategy development.

## Estimation & Risk

- **thinking-fermi-estimation**（Fermi Estimation）：Make order-of-magnitude estimates for unknown quantities by decomposing into known or estimable factors. Use for capacity planning, cost estimation, market sizing, and technical feasibility assessment.
- **thinking-margin-of-safety**（Margin of Safety）：Build in buffers for unknown unknowns and don't optimize to the edge. Use for capacity planning, deadline estimation, architecture design, and risk management.
- **thinking-lindy-effect**（The Lindy Effect）：For non-perishable things, future life expectancy is proportional to current age. Use for technology selection, evaluating frameworks/libraries, and predicting tool longevity.
- **thinking-via-negativa**（Via Negativa）：Improve by removal rather than addition. Focus on what to stop doing, eliminate the negative, and subtract complexity. Use for system simplification, process improvement, and feature prioritization.
- **thinking-red-team**（Red Team Thinking）：Deliberately attack your own plans, systems, and assumptions to find weaknesses before adversaries or reality does. Use for security review, architecture validation, plan stress-testing, and pre-launch preparation.

## Product & Innovation

- **thinking-jobs-to-be-done**（Jobs to Be Done）：Understand what "job" users hire your product to do, focusing on progress users seek rather than features. Use for product development, feature prioritization, user research, and market positioning.
- **thinking-effectuation**（Effectuation）：Start with means, not goals; co-create with partners; leverage contingencies. Use for startup strategy, innovation projects, and uncertain/novel domains where planning is unreliable.
