# Fact Ledger Template

Use this ledger before rewriting. Every row must point to a user-provided source or an explicit user confirmation.

| 事实 | 来源 | 证据 | 状态 | 可进入最终简历 |
| --- | --- | --- | --- | --- |
|  |  |  | `confirmed` / `pending_confirmation` / `model_inference` | 是 / 否 |

## 状态规则

- `confirmed`: 用户已提供或明确确认，且有可解释的证据；可以进入最终简历、ATS 纯文本版和 PDF Builder 输入。
- `pending_confirmation`: 可能真实但仍缺少用户确认；只能进入诊断和追问，不能进入最终交付。
- `model_inference`: 模型根据上下文推断但用户未确认；只能作为内部审查提示，不能进入最终交付。

只有 `confirmed` 事实可以进入最终简历。生成 PDF 前，再检查传给 PDF Builder 的 JSON 是否只包含 `confirmed` 内容；不要把状态标签本身写进最终简历。

## 待补充事实

列出会改变 JD 匹配、贡献边界、数字可信度或面试回答的关键问题：

1. 
2. 
3. 
