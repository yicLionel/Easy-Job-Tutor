# Role Knowledge Base

This template captures the JD-driven skill checklist (岗位技能知识库) used to judge a
resume against a target role and build the gap/diagnosis and learning-plan outputs.
It is a companion to `templates/job-analysis-template.md` and
`templates/learning-path-template.md`.

Use it whenever the user gives a target role. Match each resume line / bullet to skills
under each role, weight gaps by `importance`, and drive the "查漏补缺 → 学习路线 → 面试辅导"
flow from the resulting gap list. It follows the same fact rules as the rest of the skill:
**a skill counts as evidence only if confirmed by someone/something's source text — never
because a keyword merely appears in a skills list.**

## 1. Dimension taxonomy（维度）

Every skill belongs to one of four dimensions, and carries an importance weight:

| 维度 | 含义 |
| :--- | :--- |
| 核心技能 | 岗位硬技能（必备 / 加分） |
| 项目经验 | 是否有相关落地 / 项目 / 作品经历 |
| 教育背景 | 专业 / 学历相关性 |
| 综合素养 | 软技能（沟通、协作、学习、拆解） |

- `importance` 1–5：**5 = 必备**，4 = 高相关，3 = 中等，2 = 低，1 = 加分/锦上添花。
- 匹配度按 `importance` 加权汇总；差距按 `importance` 降序输出，P4–P5 优先补齐。
- 简历原文命中关键词 = `confirmed`；部分命中 = `pending_confirmation`；
  仅出现在技能列表、无经历/动作上下文 = `uncertain`，**不计入已覆盖**；
  命中否定表达（如“没有 Python 经验”）= `not_found`。
- 未在简历找到相关关键词但重要性高 = `model_inference`，只能进入诊断/追问，**不能进最终简历**。

## 2. Supported roles（岗位）

| role_id | 岗位 | 一句话定位 |
| :--- | :--- | :--- |
| `ai_product` | AI 产品 | 面向 AI 产品的需求洞察、LLM 应用认知与 0-1 落地能力 |
| `ai_agent` | AI Agent 开发 | 面向 LLM / Agent 的工程实现能力：RAG、MCP、多智能体与工程落地 |
| `ai_ops` | AI 运营 | 用 AI 工具提效的内容、用户增长与社群运营能力 |

如果用户没有明确岗位，用 JD 文本自动识别：统计每个岗位知识库中关键词在 JD 里的命中数，
取命中最多者；完全不命中时回退到 `ai_product` 并提示低置信。

### ai_product · AI 产品
- **核心技能**：需求分析(5)、LLM 应用认知(5)、AI 原生产品设计(5)、用户研究(4)、PRD 撰写(4)、
  数据分析(4)、Agent 产品认知(4)、AI PM 方法论(4)、产品原型(3)、竞品分析(3)、机器学习基础(3)、
  商业化思维(3)、产品增长(3)、A/B 测试(2)、AI 伦理与合规(2)
- **项目经验**：0-1 产品经验(4)、AI 产品落地(4)、跨团队协作(3)、项目管理(3)
- **教育背景**：计算机/相关专业(2)、学历背景(1)
- **综合素养**：沟通表达(3)、逻辑思维(3)、快速学习(2)

### ai_agent · AI Agent 开发
- **核心技能**：Python(5)、RAG 检索增强(5)、大模型 API(5)、Agent 架构(5)、LangChain/LangGraph(4)、
  MCP 协议(4)、向量数据库(4)、提示工程(4)、后端开发(4)、评估与可观测(4)、模型微调(3)、
  部署/推理优化(3)、多模态能力(3)、AI 安全与护栏(3)、数据处理/ETL(3)、测试与工程规范(3)、
  前端/TS 基础(2)、前端基础(2)
- **项目经验**：Agent 项目经验(5)、全栈交付(4)、开源贡献(2)
- **教育背景**：计算机/AI 相关(3)、算法基础(3)
- **综合素养**：工程规范(3)、问题排查(3)、技术沟通(2)

### ai_ops · AI 运营
- **核心技能**：内容运营(5)、AI 工具应用(5)、用户增长(4)、社群/私域运营(4)、数据分析(4)、
  活动策划(3)、Prompt 工程(3)、自动化工作流(3)、渠道投放(3)、用户研究(3)、AI 搜索 / SEO 优化(3)、
  用户分层 / CRM(3)、品牌 / 公关(2)
- **项目经验**：0-1 运营经验(4)、活动落地(4)、内容生产(4)、电商 / 直播运营(3)
- **教育背景**：市场/传媒/商科相关(2)、数据/商科(2)
- **综合素养**：文案写作(4)、沟通协调(3)、创意与审美(2)

## 3. Keyword & evidence matching（关键词 + 证据匹配）

For each target role, expand every skill into a keyword set (Chinese + English synonyms,
abbreviations, related terms). Judge a skill's status by **boundary-aware, context-aware**
keyword hits, not bare substring matches — see the "Evidence rules" section below.

- 拉丁短关键词（≤3 字符，如 `ai`、`py`）用单词边界，避免误伤邮箱/URL。
- 命中优先级：`存在动作/项目上下文`（负责/开发/搭建/上线/主导……）> `仅技能清单` > `否定句` > `未出现`。
- 逐技能输出：状态、简历原文证据（整行，截断 240 字）、命中关键词。

## 4. Evidence rules（否定 / 上下文 / 事实状态）

> 这是副项目 `evidence.py` 沉淀后回填到本 Skill 的核心原则，务必遵守：

1. **否定表达不是正向证据**。简历出现“没有使用 / 不熟悉 / 从未 / `no experience` / `never` /
   `not familiar`”等，该技能判定 `not_found`，绝不能因为关键词出现就算已覆盖。
2. **技能清单 ≠ 已覆盖**。只有“Skills: Python、RAG、Agent”而无动作/项目上下文，判定 `uncertain`，
   不计入匹配合格，也不要写进最终简历。
3. **动作/项目上下文才计为已覆盖**（`evidenced`）：如“项目经验：使用 Python 开发 FastAPI 服务并部署上线”。
4. 证据与技能在**同一语境/子句**内才算；跨句、`但是/然而` 转折后不被前句命中覆盖。
5. 状态映射：`evidenced` → 事实台账 `confirmed`；`uncertain` → `pending_confirmation`；
   `not_found` → `model_inference`（只进诊断/追问）。

## 5. Learning resources（默认兜底）

- 中文兜底：在 B 站 / 掘金搜索对应关键词（`https://search.bilibili.com/all?keyword=`）。
- 英文兜底：Google / YouTube 搜索（`https://www.google.com/search?q=`）。
- 每个 skill 应尽量给出 1 个精选资源（文档 / 书 / 课程 / 官方站）与一句“learn”学习动作。
- 产出学习路线时，把 gap 按 `importance` 分派到四阶段（见 `learning-path-template.md`）。
