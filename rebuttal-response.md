# PhysFlow rebuttal：持续更新主稿

更新日期：2026-11-08。与 [HTML checklist](index.html) 配套维护；后续结果继续补入本文件。

- 已接入：作者确认的六模型 cost 表；PhysicEdit 的 PICABench 方法级结果；8uwk 的完整首轮回复草稿；基于 PICABench 原论文的训练与评测数据来源说明。
- 中文引用块为内部状态，提交时只复制英文回复及对应表格。论文修订和 OpenReview 提交另行完成。
- 其余英文模块沿用 11 月 6 日文字素材，仍按下方标注等待实验或核验。

## Reviewer 8uwk

### R1: PhysicEdit comparison

> 状态：方法级结果及 cost 已接入，首轮完整回复草稿已形成；尚未提交。对应 checklist：physicedit-score、physicedit-discussion。

<!-- reply:r1:start -->
Thank you for highlighting PhysicEdit. We appreciate its use of video-derived transition priors to guide physical image editing without rendering intermediate videos at inference. We agree that our original discussion should have made this connection explicit, and we will expand the related-work discussion accordingly.

**Our contribution is the progressive internalization of textual and visual process supervision into a continuous latent plan.** PhysicEdit combines an explicit textual reasoning trace at inference with video-supervised transition queries. PhysFlow progressively compresses high-level physical rationales, low-level transition descriptions, and ordered intermediate visual blocks into six latent tokens. These tokens condition the image generator together with a separate 16-token final visual block. This design internalizes the textual reasoning as well as the visual process, so inference uses the compact latent plan without decoding a textual reasoning trace. We will clarify this distinction in Sections 2 and 3. [PhysicEdit, Section 3.3](https://arxiv.org/html/2602.21778v2#S3.SS3).

**The added method-level comparison reports 56.32 for PhysFlow and 52.35 for PhysicEdit.** We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report both backbones below. We report scores on a 0 to 100 scale and gains in percentage points.

| Method | Backbone | Overall | Gain over own backbone |
|---|---|---:|---:|
| Qwen-Image-Edit-2509 | Qwen-Image-Edit-2509 | 49.71 | N/A |
| PhysicEdit | Qwen-Image-Edit-2509 | 52.35 | +2.64 |
| Qwen-Image-Edit-2511 | Qwen-Image-Edit-2511 | 54.26 | N/A |
| **PhysFlow (Ours)** | Qwen-Image-Edit-2511 | **56.32** | **+2.06** |

PhysFlow achieves a 3.97-point higher overall score and higher scores in all eight categories. Both methods improve on their respective backbones. The different backbones make this a comparison of complete systems; isolating the contribution of each method requires a matched-backbone control. We also clarify that the existing 53.82 entry in Tables 4 and 9 refers to PhysFlow trained on PhysicTran38K; the new 52.35 entry evaluates PhysicEdit itself.

**PhysFlow also has lower latency in the reported cost comparison.**

| Method | Params (B) | Memory (GiB) | Latency (s) |
|---|---:|---:|---:|
| PhysicEdit | 29.00 | 56.25 | 52.19 |
| **PhysFlow (Ours)** | **28.87** | **58.11** | **49.39** |

The resource and timing measurements come from separate runs. In these reported results, PhysFlow takes 2.80 fewer seconds per edit, a 5.4% latency reduction, while using 1.86 GiB more peak memory. These measurements show a latency advantage with a memory trade-off. We will include the method-level results and cost comparison in the revised manuscript.
<!-- reply:r1:end -->

## Reviewer 62MG

### R2: Same-data adaptation and dataset attribution

> 状态：1 号 PICABench 结果已完成独立核验并接入回复；同数据 SFT 与 dataset-comparison 文字回应完成，RISE 由 15 号追加。2026-11-08 18:42 PST 快照：2 号训练完成、评测中；11 号结果待接入。

<!-- reply:sft-dataset:start -->
**The added PhysTrace image-pair SFT baseline enables three comparisons of dataset effectiveness and the full training framework.** All four configurations use Qwen-Image-Edit-2511. We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report gains in percentage points.

| Training data | Training strategy | Overall (%) |
|---|---|---:|
| PICA100K | Image-pair SFT | 53.38 |
| PhysTrace | Image-pair SFT | 55.12 |
| PhysicTran38K | PhysFlow | 53.82 |
| PhysTrace | PhysFlow | 56.32 |

**1. Dataset comparison under image-pair SFT: +1.74 points.** PhysTrace reaches 55.12, compared with 53.38 for PICA100K, using fewer training examples and generator updates. Both configurations use source-target image-pair supervision. This result supports the effectiveness of the PhysTrace image pairs even with direct generator fine-tuning.

**2. Dataset comparison within PhysFlow: +2.50 points.** PhysTrace reaches 56.32, compared with 53.82 for PhysicTran38K, while using the same PhysFlow architecture and curriculum. PhysTrace again achieves a higher score with fewer training examples. The 53.82 row denotes PhysFlow trained on PhysicTran38K. Together, these two comparisons support the usefulness of the smaller PhysTrace dataset under both training strategies.

**3. Framework comparison on the same PhysTrace pairs: +1.20 points.** PhysFlow reaches 56.32, compared with 55.12 for image-pair SFT. This comparison fixes the source-target pairs, rank-512 generator LoRA configuration, and 537 generator updates. It shows that the complete PhysFlow training framework improves on direct adaptation to the same image pairs.

**Training conditions.** Across datasets, PICA100K SFT uses 4,926 updates, PhysTrace SFT uses 537, and PhysFlow uses 4,632 on PhysicTran38K versus 1,790 on PhysTrace. PhysFlow adds planner capacity and training to the matched generator budget. These results therefore compare the reported data and framework configurations; the terminal-only and direct-compression controls address finer attribution to process supervision and the curriculum. We will organize Tables 4 and 9 and their discussion around these three comparisons.
<!-- reply:sft-dataset:end -->

### R2: Latent representation and supervision

> 6 号 H100 补充分析已完成，见 完整报告。validation212 拟合、test212 检索：共享线性读出 29.83% vs 位置原型 29.25%，配对增益 95% CI 为 −1.30 至 +2.36 pp。扩展判别式探索为 48.23% vs 位置 46.11%（+2.12 pp，名义 CI +0.24 至 +4.13 pp），但源图与终态控制为 48.00%/48.58%，对应配对优势未成立。现有证据仍不足以支持逐 token 的物理状态对应。分析完成不等于正面主张成立；所有历史结果保留。

> 6 号新增物理类别与亮度分析，见 报告与三组图件。原始 taxonomy 为六领域、26 细类，另有八类 PICA 标签。六领域平衡准确率 86.91% vs 源图加指令 76.28%（配对增益名义 CI +4.10 至 +17.90 pp）；同布局预训练对照为 85.94%，与 PhysFlow 的差异未确立。82 个照明测试视频的亮度变化读出 R²=0.370，指令 TF-IDF 为 0.365，预训练为 0.402。可主张压缩 latent 保留了可读出的物理类别与视觉变化信息；训练获得额外物理规律、逐状态对齐与因果物理作用仍缺证据。所有结果属于探索性后续分析。

The six latent thoughts form a learned conditioning sequence Z = [h, l, m₁, m₂, m₃, m₄] ∈ ℝ⁶ˣᵈ, where d is the planner's hidden dimension. The training design assigns h and l to high-level physical rationales and low-level transition descriptions, and assigns m₁ through m₄ to ordered intermediate visual states. The planner additionally predicts F ∈ ℝ¹⁶ˣᵈ, a final visual block. Thus, the additional conditioning consists of six reasoning tokens and 16 final-state tokens.

Section 3.4 specifies how these roles enter training. Stage I aligns each 16-token intermediate block with the corresponding frame encoding from a moving-average teacher. Stage II replaces each intermediate block with one latent token and removes that block's direct alignment loss. Later uncompressed blocks, the final visual block, and the generation objective provide the remaining supervision. After Stage II compresses all intermediate blocks, the final-block alignment and generation objectives supervise the planner. This training defines the intended roles of the latent positions, while their physical-state correspondence remains an empirical question.

The intervention in Appendix C.6 shows that the generator uses order-sensitive information in the intermediate tokens on the tested 64 examples. Establishing which physical variables or intermediate states those tokens encode requires representation-level evidence. We will scope the interpretation of Figure 7 to this observed order sensitivity and clarify that “causal” in the attention mechanism specifies the direction of information flow.

### R2: Sampling and compression

> 已有文字草稿。待 time-uniform、状态数及直接压缩对照结果。

Change-uniform sampling aims to distribute supervision across visible changes in a trajectory. Appendix A.2 combines normalized DINOv2, optical-flow, and pixel-change scores, then selects four intermediate frames that divide cumulative change into approximately equal intervals. This criterion gives more temporal sampling density to portions of a clip with larger measured changes. Its benefit over time-uniform sampling requires a comparison that fixes the videos, endpoints, state count, and training procedure.

We use four intermediate states as a fixed design choice, which yields four visual reasoning tokens after compression. The existing experiments evaluate this configuration. Selecting the best state count and establishing the benefit of progressive over direct compression require separate ablations. We will make these distinctions explicit when discussing the sampling rule and curriculum.

### R2: Statistical uncertainty and physical evaluation

> 已有文字草稿。待生成 seeds、配对 CI、训练 seeds，以及物理测量和失败案例。

We agree that the reported gains require careful interpretation. The main tables report increases of 2.06 percentage points on PICABench and 1.38 points on RISEBench over the backbone. These are point estimates under the reported evaluation settings. Their uncertainty across training runs and evaluation samples requires repeated runs and confidence intervals.

The alternative evaluators in Tables 7 and 8 assess sensitivity to the choice of multimodal judge, and the user study provides human preference evidence. These evaluations support conclusions about judged physical plausibility. Verification of measurable physical laws requires task-specific measurements, such as geometric consistency under known scene conditions. We will distinguish these forms of evidence and describe the physical interpretation of the benchmark scores accordingly.

### R2: Data separation

> 状态：回复已完成并接入，按作者要求勾选 checklist 的 data-split 项。下段说明 PICA-100K 与 PICABench 的构建方式及用途。合稿核验备注：原稿最终版本与本轮 +899 补实验版本仍需分别对应实际训练清单、checkpoint 和检查记录；来源说明不等同于跨集近重复审计。

<!-- reply:data-split:start -->
PICA-100K provides training data, while PICABench provides a separately curated evaluation set of 900 editing examples (Pu et al., [Sections 3.1 and 3.2](https://arxiv.org/html/2510.17681v3#S3.SS2), and [Section 3.4](https://arxiv.org/html/2510.17681v3#S3.SS4)). The authors collect PICABench evaluation images from licensed and public sources and construct PICA-100K from generated source images and synthetic videos. We start constructing our PhysTrace training dataset with PICA-100K image-instruction pairs (Section 3.2 of our manuscript). We will clarify these distinct data sources and their training and evaluation roles in Section 3.2 and Appendix A.
<!-- reply:data-split:end -->

### R2: Computation cost

> 状态：实验完成，已接入回复。对应 checklist：parameters-memory。全部数值采用作者本轮确认表格。

<!-- reply:cost:start -->
Thank you for this suggestion. We now report parameter counts and peak GPU memory alongside inference latency. We count the parameters resident during inference, including reasoning modules, and report peak allocated GPU memory. Parameter counts and peak allocated memory describe the current implementations; the latency column reports separate timing measurements.

| Method | Params (B) | Memory (GiB) | Latency (s) |
|---|---:|---:|---:|
| Qwen-Image-Edit | 28.85 | 58.06 | 44.34 |
| PhysicEdit | 29.00 | 56.25 | 52.19 |
| Step1X-Edit | 20.82 | 41.34 | 59.18 |
| Qwen-Image-Edit + explicit reasoning | 28.85 | 58.06 | 60.12 |
| ChronoEdit | 22.83 | 54.81 | 228.68 |
| **PhysFlow (Ours)** | **28.87** | **58.11** | **49.39** |

PhysFlow uses 28.87 billion parameters and 58.11 GiB peak memory, compared with 28.85 billion parameters and 58.06 GiB for Qwen-Image-Edit. Its latency increases from 44.34 to 49.39 seconds per edit, an 11.4% overhead. We will include this comparison in the revised efficiency table.
<!-- reply:cost:end -->

### R2: Method positioning

> EndoCoT / Monet 的讨论暂沿用下方 R3 方法定位模块；形成给 62MG 的最终回复时按其问题合并。

## Reviewer xuAm

### R3-Q1: Method contribution

> 状态：EndoCoT / Monet 的 discussion 已成稿并接入 HTML。1 号同数据 SFT 结果已接入；2 号终态监督评测中，11 号直接压缩结果待接入。

<!-- reply:method-contribution:start -->
**PhysFlow learns a compact plan from supervision of both the physical transformation and its outcome.** A target image specifies the desired result; physical rationales and intermediate visual states provide additional supervision about the transformation. Our contribution is a training curriculum that compresses these complementary signals into six latent tokens while retaining a separate 16-token final visual block. This allocates different representation budgets to the transformation and its endpoint, and gives the image generator access to both (Sections 3.3 and 3.4).

**Relative to EndoCoT, we change the representation and its supervision during compression.** EndoCoT establishes a closely related approach with recurrent thought states, intermediate image-generation supervision, and terminal textual grounding. Its terminal-consolidation stage retains recurrent thought updates while stopping gradient propagation through intermediate steps. It also avoids decoding intermediate images at inference, a property we share. [EndoCoT, Section 4.2](https://arxiv.org/html/2603.12252v1#S4.SS2). PhysFlow replaces high-level physical rationales, low-level transition descriptions, and then successive intermediate visual blocks with individual latent tokens. Each visual replacement removes that block's direct alignment loss; later uncompressed blocks, final-block alignment, and the flow-matching loss continue to train the compressed tokens. The curriculum therefore changes how the planner represents the process and receives supervision as it approaches the inference representation. At inference, the generator receives all six plan tokens together with the separate final visual block (Sections 3.3 and 3.4).

**Relative to Monet, we jointly internalize textual and visual process supervision for image generation.** Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning and further trains them with visual-latent policy optimization. Its latent embeddings support a model that produces textual answers. [Monet, Section 3](https://arxiv.org/html/2511.21395v2#S3). PhysFlow compresses both the textual rationales and the intermediate visual representations into a continuous plan before generating the edited image. During planner training, the flow-matching loss propagates through a frozen image generator to train the conditioning representations. We then freeze the planner and adapt the generator to these representations. This couples learning the plan to its use in image generation (Section 3.4).

**The same-data control now measures the gain beyond adaptation to the training pairs.** PhysFlow scores 56.32 on PICABench-Superficial, compared with 55.12 for image-pair SFT on the same PhysTrace pairs. Both use the same generator LoRA configuration and 537 generator updates; PhysFlow additionally trains its planner, for 1,790 total updates. Isolating the contribution of process supervision requires the same-architecture terminal-only control, whose evaluation is underway. The direct-compression control will test the progressive curriculum. We will clarify these design differences in Sections 2 and 3 and report each control alongside the claim it tests.
<!-- reply:method-contribution:end -->

### R3-Q2: Identity of the no-reasoning baseline

> 状态：已接入 1 号 PICABench 同数据 SFT 结果；RISE 补测由 15 号追加。完整方法与 SFT 的生成器配置及更新数一致，总训练量不同。

<!-- reply:sft-baseline:start -->
The 54.26 row in Table 3 reports the original Qwen-Image-Edit-2511 backbone. We will label it explicitly as “Original backbone” and state its training status in the caption. We have now added a baseline fine-tuned on the same PhysTrace source-target pairs:

| Configuration | PICABench-Superficial (%) |
|---|---:|
| Original Qwen-Image-Edit-2511 | 54.26 |
| PhysTrace image-pair SFT | 55.12 |
| Full PhysFlow | 56.32 |

Image-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates. PhysFlow also trains a planner, for 1,790 total updates, so this comparison includes additional capacity and training. The same-architecture terminal-only control addresses the contribution of process supervision; its evaluation is underway.
<!-- reply:sft-baseline:end -->

### R3-Q3: Terminal-only supervision

> 2026-11-08 18:42 PST：2 号 planner 的 7×179 步和生成器 537 步均完成，阶段 checkpoint 交接已核验；PICABench 已开始生成，八个 rank 合计至少 8/900 张，之后自动接 Qwen72B 与 consistency 评分。尚无最终分数，保持未完成；保留 latent tokens、final visual block 和可训练模块，仅使用终态视觉监督及生成损失。运行任务继续由实验对话监控。

### R3-Q4: PhysicEdit comparison

> 方法级数据已到位，复用 R1 的质量表、骨干说明和设计差异；给 xuAm 的最终独立回复待与 Q1–Q3 一起组织。

### R3: General-editing trade-offs

> 状态：基础回复已完成并接入 HTML，独立核对通过；论文修订尚未同步。39 例候选初查完成，6 例已核对三种训练后输出；Table 6 对应的 D3 / RL 版本及逐样本评分尚未确认。基础回复仅使用原表数值，不加入原因归因。

<!-- reply:general-editing:start -->
Thank you for pointing out the category-level declines. Table 6 reports an overall ImgEdit-Bench score of 4.39 for PhysFlow and 4.41 for Qwen-Image-Edit-2511. PhysFlow scores higher in six of nine categories, but Hybrid decreases from 3.76 to 3.26, Extract from 4.16 to 3.91, and Add from 4.45 to 4.26. The similar aggregate scores therefore coexist with larger declines in specific editing categories.

Our original statement that PhysFlow preserves general editing capabilities without compromise was too broad. We will revise Appendix C.1 to describe similar aggregate performance with category-dependent trade-offs and explicitly report the declines alongside the improvements. Table 6 establishes these performance differences; identifying their cause requires further analysis.
<!-- reply:general-editing:end -->

