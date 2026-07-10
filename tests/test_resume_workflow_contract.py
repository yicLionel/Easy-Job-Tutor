from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_skill_defines_all_input_routes_and_final_fact_gate():
    skill = read("SKILL.md")
    for phrase in (
        "完整材料",
        "仅简历",
        "仅 JD",
        "材料不足",
        "造假请求",
        "多 JD",
        "confirmed",
        "pending_confirmation",
        "model_inference",
        "最终简历",
    ):
        assert phrase in skill


def test_templates_define_fact_ledger_review_and_multi_jd_contracts():
    ledger = read("templates/fact-ledger-template.md")
    review = read("templates/five-dimension-review-template.md")
    multi_jd = read("templates/multi-jd-difference-template.md")

    assert "来源" in ledger and "状态" in ledger and "证据" in ledger
    for dimension in ("JD 匹配", "ATS", "HR", "面试准备度", "可信度"):
        assert dimension in review
    for field in ("共用事实底稿", "版本差异", "核心缺口", "风险"):
        assert field in multi_jd


def test_final_delivery_rule_is_explicit_in_fact_ledger():
    ledger = read("templates/fact-ledger-template.md")
    assert "只有 `confirmed`" in ledger
    assert "PDF Builder" in ledger
