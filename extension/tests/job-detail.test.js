import test from "node:test";
import assert from "node:assert/strict";
import { chooseDetailCandidate, formatJobText } from "../src/adapters/job-detail.js";

test("prefers the BOSS detail pane over the left-hand job list", () => {
  const leftList = { selector: ".job-card-list", text: "通用 Java 开发 15-30K 外企德科数字 上海·浦东新区" };
  const detailPane = { selector: ".job-detail-box", text: `高级java开发 15-30K·16薪
上海 3-5年 本科
深圳某大型ICT通信与智能终端公司
职位描述
Java SQL Server Spring
岗位要求：
1、统招本科以上学历，3年以上相关工作经验；
2、熟悉 Java、Spring、MyBatis、Kafka。
岗位职责：
1、负责后端服务的设计、开发和维护；
2、参与性能优化与技术文档编写。` };
  const selected = chooseDetailCandidate([leftList, detailPane]);
  const job = formatJobText({ detailText: selected.text, sourceUrl: "https://www.zhipin.com/web/geek/job" });
  assert.equal(selected, detailPane);
  assert.equal(job.title, "高级java开发");
  assert.equal(job.salary, "15-30K·16薪");
  assert.equal(job.location, "上海");
  assert.equal(job.company, "深圳某大型ICT通信与智能终端公司");
  assert.match(job.requirements.join("\n"), /统招本科以上学历/);
  assert.match(job.responsibilities, /负责后端服务的设计/);
  assert.match(job.rawText, /岗位职责：/);
  assert.doesNotMatch(job.rawText, /外企德科数字/);
});

test("prefers a job-sec-text detail pane over a longer two-column wrapper", () => {
  const detailText = `高级java开发 15-30K·16薪
职位描述
岗位要求：
熟悉 Java 与 Spring
岗位职责：
负责后端服务开发`;
  const wrapper = { selector: "div.job-box", text: `左侧职位一 外企德科数字\n左侧职位二 某500强上市公司\n${detailText}` };
  const detailPane = { selector: ".job-sec-text", text: detailText };
  assert.equal(chooseDetailCandidate([wrapper, detailPane]), detailPane);
});

test("extracts requirements and responsibilities when section content starts on the heading line", () => {
  const job = formatJobText({
    detailText: `后端开发工程师 20-35K
北京 3-5年 本科
职位描述
岗位要求：熟悉 Java、MySQL 和分布式系统
岗位职责：负责核心交易服务设计与开发
公司信息
示例科技有限公司`,
  });
  assert.match(job.requirements.join("\n"), /熟悉 Java、MySQL/);
  assert.match(job.responsibilities, /核心交易服务设计与开发/);
});

test("keeps only the seven confirmed JD fields and stops before recruiter and footer content", () => {
  const job = formatJobText({
    detailText: `高级java开发
15-30K·16薪
上海
3-5年
本科
深圳某大型ICT通信与智能终端公司
职位描述
Java
不接受居家办公
SQL Server
Spring
岗位要求：
1、统招本科以上学历，3年以上相关工作经验；
2、JAVA基础扎实，充分理解面向对象，熟悉io、nio、多线程、设计模式、通信协议等基础技术；熟悉JVM 工作原理并掌握常见性能调优方法；
3、熟悉Spring、Springmvc、Mybatis、Hibernate等常用开发框架及特征，熟悉常用中间件Tomcat、Mq、Kafka等；
4、熟悉单元测试用例开发；熟悉软件技术文档的编写；
5、具备良好的文档编制习惯和代码书写规范。
岗位职责：
1、负责SaaS软件等产品特性的系统设计、核心开发与交付及运维，构建软件工程能力；
2、主导或参与客户原始需求分析、系统设计等，能够与团队融洽协作，高质量完成核心交付；
3、主导或参与系统核心模块的技术竞争力构建，跟踪分析业界发展趋势并完成竞争力分析；
4、负责相关子系统及业务流程的优化，研发过程持续改进。
王先生
在线
科锐国际 · 猎头顾问
去App
与BOSS随时沟通
查看更多信息
求职工具
升级VIP
热门职位
上海BOSS直聘招聘`,
  });

  assert.equal(job.rawText, `岗位名称：高级java开发

薪资：15-30K·16薪

工作地点：上海

公司：深圳某大型ICT通信与智能终端公司

标签：Java、不接受居家办公、SQL Server、Spring

岗位要求：
1、统招本科以上学历，3年以上相关工作经验；
2、JAVA基础扎实，充分理解面向对象，熟悉io、nio、多线程、设计模式、通信协议等基础技术；熟悉JVM 工作原理并掌握常见性能调优方法；
3、熟悉Spring、Springmvc、Mybatis、Hibernate等常用开发框架及特征，熟悉常用中间件Tomcat、Mq、Kafka等；
4、熟悉单元测试用例开发；熟悉软件技术文档的编写；
5、具备良好的文档编制习惯和代码书写规范。

岗位职责：
1、负责SaaS软件等产品特性的系统设计、核心开发与交付及运维，构建软件工程能力；
2、主导或参与客户原始需求分析、系统设计等，能够与团队融洽协作，高质量完成核心交付；
3、主导或参与系统核心模块的技术竞争力构建，跟踪分析业界发展趋势并完成竞争力分析；
4、负责相关子系统及业务流程的优化，研发过程持续改进。`);
});
