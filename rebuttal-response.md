# PhysFlow rebuttal：持续更新主稿

更新日期：2026-11-10。与 [HTML checklist](index.html) 配套维护；后续结果继续补入本文件。

- 已接入：作者确认的六模型 cost 表；PhysicEdit 的 PICABench 方法级结果；8uwk 的完整首轮回复草稿；基于 PICABench 原论文的训练与评测数据来源说明。
- 中文引用块为内部状态，提交时只复制英文回复及对应表格。论文修订和 OpenReview 提交另行完成。
- 其余英文模块沿用 11 月 6 日文字素材，仍按下方标注等待实验或核验。

> 进度更新（2026-11-10）：time-uniform 的 PICABench 评测已完成，Overall 54.16，已接入回复；共 10/16 项任务完成。作者确认 full 与新增对照使用同一版训练数据。K2/K6 状态数、直接压缩和多 seed 统计仍待结果。16 个逐点回复另行对应到论文修改；回复点与任务项不是同一计数。

## 修改总览：给所有审稿人和 AC

> 本地标蓝修订稿已完成编译与排版检查：正文 10 页，总计 22 页；尚未上传 Overleaf / OpenReview。下方为开场回复草稿，论文上传后再作为正式修改总览提交。正文、附录与图表编号已核对。未完成的新实验不列为已完成。

<!-- reply:overview:start -->
Dear Reviewers and ACs,

Thank you very much for the time and care you have devoted to reviewing our work. We sincerely appreciate your constructive comments and suggestions, which have helped us improve our previous manuscript. We have carefully considered every comment and suggestion and revised the paper accordingly, with the main changes marked in blue.

We summarize the main revisions below.

**In the main paper:**

1. Expanded the discussion of PhysicEdit, EndoCoT, and Monet to clarify their relationship with our method.
2. Clarified the roles of the latent tokens, their supervision during compression, and the separate final visual block.
3. Added experiments comparing PhysFlow with a direct fine-tuning baseline using the same PhysTrace source-target image pairs.
4. Added controlled experiments to better separate the benefits of dataset adaptation from those of structured latent reasoning.
5. Added experiments comparing PhysFlow with PhysicEdit on PICABench and evaluating computational costs.
6. Clarified the sources and roles of PICA-100K training data and the 900 PICABench evaluation examples.

**In the appendix:**

1. Added experiments with terminal-only supervision.
2. Added experiments comparing time-uniform and change-uniform frame sampling.
3. Expanded the latent-representation analysis with physical domain linear probes, controlled intervention tasks, and token-order perturbations, together with their controls and limitations.
4. Explained the ImgEdit-Bench results, including category-level declines and broadly maintained aggregate performance.
5. Addressed concerns about reliance on multimodal-model judgments by explaining how both model-based evaluations and our human study support improved physical plausibility.
6. Clarified the uncertainty of single-run results and the remaining questions about state count and the compression curriculum.

We provide detailed responses to each reviewer's comments below. Thank you very much again for your time and helpful suggestions.

Best regards,  
The Authors
<!-- reply:overview:end -->

## Reviewer 8uwk

### R1: PhysicEdit comparison

> 状态：方法级结果及 cost 已接入，首轮完整回复草稿已形成；尚未提交。对应 checklist：physicedit-score、physicedit-discussion。

<!-- reply:r1:start -->
Thank you for highlighting this closely related work. We appreciate [PhysicEdit’s contribution to physics-aware image editing](https://arxiv.org/html/2602.21778v2#S3.SS3), particularly its combination of explicit physical reasoning and video-supervised transition queries. This design uses video-derived transition priors to guide image editing without generating intermediate videos at inference. We share its motivation of using process information to improve physical image editing, and have expanded the related-work discussion to acknowledge this connection.

**Our focus is the progressive internalization of both textual reasoning and visual processes into a compact latent plan.** PhysicEdit combines an explicit textual reasoning trace with learned visual-transition queries. PhysFlow progressively compresses high-level physical rationales, low-level transition descriptions, and ordered intermediate visual blocks into six latent tokens. These tokens condition image generation together with a separate 16-token final visual block. At inference, PhysFlow generates the latent plan directly, without decoding a textual reasoning trace. We have clarified these differences in Sections 2 and 3.

**Following your suggestion, we have added an experimental comparison with PhysicEdit on PICABench-Superficial.** We use Qwen2.5-VL-72B-Instruct for evaluation. Our PhysFlow implementation uses Qwen-Image-Edit-2511.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | 51.62 | 61.63 | 51.56 | 52.96 | 44.03 | 45.89 | 57.64 | 53.07 | 52.35 |
| **PhysFlow (Ours)** | **54.45** | **65.19** | **58.52** | **57.99** | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

PhysFlow achieves an overall score of **56.32**, compared with **52.35** for PhysicEdit, with higher scores across all eight categories. We have incorporated these results into Table 1 and added a computational-cost comparison in Table 5.
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

**Training conditions.** Across datasets, PICA100K SFT uses 4,926 updates, PhysTrace SFT uses 537, and PhysFlow uses 4,632 on PhysicTran38K versus 1,790 on PhysTrace. PhysFlow adds planner capacity and training to the matched generator budget. These results compare the reported data and framework configurations. The terminal-only run scores 55.57, 0.75 points below the paper's reported full PhysFlow score of 56.32. We report this difference at the training-configuration level; the direct-compression control will address the curriculum separately. We organize Tables 4 and 9 and their discussion around these three comparisons.
<!-- reply:sft-dataset:end -->

### R2: Latent representation and supervision

> 2026-11-09：已同步最终 Figure 7 四联图。a：原角色聚类支持压缩后的角色组织；b：六领域线性探针平衡准确率 86.91%；c：十一项探索中的七项展示子集，统一报告配对准确率；Phase change 为固定读出器在 256 对／128 新家族上的独立确认，其余六项各 128 对／64 家族；d：保留 64 例编辑顺序干预。全部十一项、强对照、阴性结果和逐 token 对齐未成立的结论保留。v14 结果与对照快照、确认集审计。

> 6 号 H100 补充分析已完成，见 完整报告。validation212 拟合、test212 检索：共享线性读出 29.83% vs 位置原型 29.25%，配对增益 95% CI 为 −1.30 至 +2.36 pp。扩展判别式探索为 48.23% vs 位置 46.11%（+2.12 pp，名义 CI +0.24 至 +4.13 pp），但源图与终态控制为 48.00%/48.58%，对应配对优势未成立。现有证据仍不足以支持逐 token 的物理状态对应。分析完成不等于正面主张成立；所有历史结果保留。

> 6 号新增物理类别与亮度分析，见 报告与三组图件。原始 taxonomy 为六领域、26 细类，另有八类 PICA 标签。六领域平衡准确率 86.91% vs 源图加指令 76.28%（配对增益名义 CI +4.10 至 +17.90 pp）；同布局预训练对照为 85.94%，与 PhysFlow 的差异未确立。82 个照明测试视频的亮度变化读出 R²=0.370，指令 TF-IDF 为 0.365，预训练为 0.402。可主张压缩 latent 保留了可读出的物理类别与视觉变化信息；训练获得额外物理规律、逐状态对齐与因果物理作用仍缺证据。所有结果属于探索性后续分析。

<!-- reply:latent-definition:start -->
The six latent thoughts form a learned conditioning sequence Z = [h, l, m₁, m₂, m₃, m₄] ∈ ℝ⁶ˣᵈ, where d is the planner's hidden dimension. The training design assigns h and l to high-level physical rationales and low-level transition descriptions, and assigns m₁ through m₄ to ordered intermediate visual states. The planner additionally predicts F ∈ ℝ¹⁶ˣᵈ, a final visual block. Thus, the additional conditioning consists of six reasoning tokens and 16 final-state tokens.

Section 3.4 specifies how these roles enter training. Stage I aligns each 16-token intermediate block with the corresponding frame encoding from a moving-average teacher. Stage II replaces each intermediate block with one latent token and removes that block's direct alignment loss. Later uncompressed blocks, the final visual block, and the generation objective provide the remaining supervision. After Stage II compresses all intermediate blocks, the final-block alignment and generation objectives supervise the planner. This training defines the intended roles of the latent positions, while their physical-state correspondence remains an empirical question.
<!-- reply:latent-definition:end -->

<!-- reply:latent-representation:start -->
**The latent plan exposes physical-domain and conditional outcome information to linear probes; token order also affects editing.** The revised Figure 7 organizes these findings into panels (a) through (d).

**(a) Token-role structure.** The original clustering visualization supports role-dependent representation structure after compression.

**(b) Physical-domain linear probe.** We fit and cross-validate a linear probe on 212 PhysTrace videos and test on 212 independent videos. The two textual and four intermediate visual tokens yield 86.91% balanced accuracy across six domains, compared with 16.67% uniform chance. The same-layout pretrained control reaches 85.94%, and the low-level text token reaches 86.79%. These controls limit attribution of domain information to PhysFlow training.

**(c) Physical-intervention prediction.** We freeze PhysFlow and fit linear ridge readouts on its four intermediate visual tokens, choosing pooling and regularization on validation data. Each synthetic source image receives two intervention instructions with opposite reference outcomes. Idealized rules define the labels; source images can display material or temperature cues. Each task uses 128 training, 32 validation, and 64 initial-test scene families. Each family supplies two source images and two instructions per image.

Pair accuracy requires both outcomes for the same image to be correct. Randomly assigning the two opposite outcomes gives 50% chance; independent binary guesses give 25%. Panel (c) displays the following seven tasks:

| Task | Pair accuracy (%) | Test pairs / families | 95% CI (%) |
|---|---:|---:|---|
| Support | 99.22 | 128 / 64 | 97.66 to 100.00 |
| Torque | 100.00 | 128 / 64 | 100.00 to 100.00 |
| Buoyancy | 99.22 | 128 / 64 | 97.66 to 100.00 |
| Outflow | 96.09 | 128 / 64 | 92.19 to 99.22 |
| Absorption | 99.22 | 128 / 64 | 97.66 to 100.00 |
| Phase change (confirmation) | 100.00 | 256 / 128 | 100.00 to 100.00 |
| Shape recovery (rubber/clay) | 91.41 | 128 / 64 | 86.72 to 96.09 |

For phase change, the table uses independent confirmation on 128 fresh families with the validation-selected probe fixed and no retuning. Intervals use 5,000 family-bootstrap draws. Perfect empirical scores produce degenerate bootstrap intervals that describe the observed families; population accuracy remains uncertain.

The seven displayed tasks form an illustrative subset of eleven exploratory tasks. The other pair accuracies are collision 50.00%, magnetic poles 28.91%, spring direction 31.25%, and foam recovery 68.75%. We retain all results and controls. This exploratory selection provides illustrative evidence with limited coverage of physical phenomena. Several tasks also reach 100% with textual latent probes or source-image probes using separate weights for each intervention condition. On phase-change confirmation, this source control reaches 91.80%, the source-and-instruction prefix reaches 92.19%, and both textual latent probes reach 100%.

**(d) Visual-token perturbation.** On 64 PICABench-Superficial inputs, eight per category, Qwen2.5-VL-72B-Instruct gives mean accuracies of 57.36% for the original condition, 55.64% for masking, and 53.94% for both reversal and shuffling. Perturbations occur after planning, with textual and final-visual conditioning fixed. Reversal and shuffling each reduce accuracy by 3.42 percentage points, supporting order sensitivity.

Together, these results support physical-semantic and conditional-consequence readout alongside order-sensitive editing. The diagnostic scenes are synthetic. Token-to-frame temporal alignment, internal physical-law computation, and physical causal mediation through the generator require separate evidence.
<!-- reply:latent-representation:end -->

附件（v15）：[Overleaf 替换包 ZIP](attachments/physflow-latent-appendix.zip) · [LaTeX 片段](attachments/latent-representation-analysis.tex) · [四联图 PDF](attachments/latent-analysis-four.pdf) · [单页附录预览 PDF](attachments/latent-appendix-preview.pdf)。

### R2: Sampling and compression

> time-uniform 已完成 PICABench 全量评测：900 张、4,112 个问题，Overall 54.16；full 使用同一版训练数据，Overall 56.32。状态数 K2/K6 和直接压缩仍待结果。

<!-- reply:sampling:start -->
Change-uniform sampling aims to distribute supervision across visible changes in a trajectory. Appendix A.2 combines normalized DINOv2, optical-flow, and pixel-change scores, then selects four intermediate frames that divide cumulative change into approximately equal intervals. This criterion gives more temporal sampling density to portions of a clip with larger measured changes. We have added a time-uniform control using the same PhysTrace training dataset and four intermediate states, retaining progressive compression, 1,253 planner updates, and 537 generator updates. It scores 54.16% on PICABench-Superficial, compared with 56.32% for change-uniform sampling. This single-run comparison supports change-uniform sampling under the tested configuration.

We use four intermediate states as a fixed design choice, which yields four visual reasoning tokens after compression. The existing experiments evaluate this configuration. Selecting the best state count and establishing the benefit of progressive over direct compression require separate ablations. We clarify these distinctions in Appendix A.2 and report the sampling control in Appendix C.7.
<!-- reply:sampling:end -->

### R2: Statistical uncertainty

> 已有统计回复草稿。待生成 seeds、配对 CI 和训练 seeds；物理评测范围见下方独立回复。

<!-- reply:statistics:start -->
We agree that the reported gains require careful interpretation. The main tables report increases of 2.06 percentage points on PICABench and 1.38 points on RISEBench over the backbone. These are point estimates under the reported evaluation settings. Their uncertainty across training runs and evaluation samples requires repeated runs and confidence intervals.
<!-- reply:statistics:end -->

### R2: Physical evaluation and human evidence

> 状态：独立 discussion 已完成，已补充评测目的与人工证据。依据原稿 17 人、100 对随机样本的 user study 与定性案例，说明可比性、人工证据及评测边界；物理指标作为未来 benchmark 方向。未声称人机逐样本一致率、客观物理验证或新的物理测量已完成。13 号实验安排与完成状态不变。

<!-- reply:physical-evaluation:start -->
We thank the reviewer for this thoughtful observation and agree that vision-language model judgments alone do not establish objective physical correctness. The GPT-based evaluations in Tables 7 and 8 address potential evaluator-family bias, and we follow the [PICABench](https://arxiv.org/html/2510.17681v3#S4.SS1) and [RISEBench](https://arxiv.org/html/2504.02826v3#S2.SS2) scoring frameworks for comparable evaluation.

Our user study provides complementary human evidence: 17 participants evaluate 100 randomly sampled image-instruction pairs and favor PhysFlow over five competing methods in physical plausibility. Our case studies also examine visible physical consequences, such as updating reflections after object replacement and deforming a pillow under a dog's weight.

Together, these results support improved physical plausibility under model and human assessment. We clarify this scope and discuss physically grounded metrics as a valuable direction for future benchmarks in Appendix C.9.
<!-- reply:physical-evaluation:end -->

### R2: Data separation

> 状态：回复已完成并接入，按作者要求勾选 checklist 的 data-split 项。下段说明 PICA-100K 与 PICABench 的构建方式及用途。合稿核验备注：原稿最终版本与本轮 +899 补实验版本仍需分别对应实际训练清单、checkpoint 和检查记录；来源说明不等同于跨集近重复审计。

<!-- reply:data-split:start -->
PICA-100K provides training data, while PICABench provides a separately curated evaluation set of 900 editing examples (Pu et al., [Sections 3.1 and 3.2](https://arxiv.org/html/2510.17681v3#S3.SS2), and [Section 3.4](https://arxiv.org/html/2510.17681v3#S3.SS4)). The authors collect PICABench evaluation images from licensed and public sources and construct PICA-100K from generated source images and synthetic videos. We start constructing our PhysTrace training dataset with PICA-100K image-instruction pairs (Section 3.2 of our manuscript). We clarify these distinct data sources and their training and evaluation roles in Section 3.2 and Appendix A.
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

PhysFlow uses 28.87 billion parameters and 58.11 GiB peak memory, compared with 28.85 billion parameters and 58.06 GiB for Qwen-Image-Edit. Its latency increases from 44.34 to 49.39 seconds per edit, an 11.4% overhead. The revised efficiency table includes this comparison.
<!-- reply:cost:end -->

### R2: Method positioning

> EndoCoT / Monet 的讨论暂沿用下方 R3 方法定位模块；形成给 62MG 的最终回复时按其问题合并。

## Reviewer xuAm

### R3-Q1: Method contribution

> 状态：EndoCoT / Monet 的 discussion 已成稿并接入 HTML。1 号同数据 SFT 与 2 号终态监督结果已接入；2 号已补完整分项表并区分新跑结果与论文报告值，11 号直接压缩结果待接入。

<!-- reply:method-contribution:start -->
**PhysFlow learns a compact plan from supervision of both the physical transformation and its outcome.** A target image specifies the desired result; physical rationales and intermediate visual states provide additional supervision about the transformation. Our contribution is a training curriculum that compresses these complementary signals into six latent tokens while retaining a separate 16-token final visual block. This allocates different representation budgets to the transformation and its endpoint, and gives the image generator access to both (Sections 3.3 and 3.4).

**Relative to EndoCoT, we change the representation and its supervision during compression.** EndoCoT establishes a closely related approach with recurrent thought states, intermediate image-generation supervision, and terminal textual grounding. Its terminal-consolidation stage retains recurrent thought updates while stopping gradient propagation through intermediate steps. It also avoids decoding intermediate images at inference, a property we share. [EndoCoT, Section 4.2](https://arxiv.org/html/2603.12252v1#S4.SS2). PhysFlow replaces high-level physical rationales, low-level transition descriptions, and then successive intermediate visual blocks with individual latent tokens. Each visual replacement removes that block's direct alignment loss; later uncompressed blocks, final-block alignment, and the flow-matching loss continue to train the compressed tokens. The curriculum therefore changes how the planner represents the process and receives supervision as it approaches the inference representation. At inference, the generator receives all six plan tokens together with the separate final visual block (Sections 3.3 and 3.4).

**Relative to Monet, we jointly internalize textual and visual process supervision for image generation.** Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning and further trains them with visual-latent policy optimization. Its latent embeddings support a model that produces textual answers. [Monet, Section 3](https://arxiv.org/html/2511.21395v2#S3). PhysFlow compresses both the textual rationales and the intermediate visual representations into a continuous plan before generating the edited image. During planner training, the flow-matching loss propagates through a frozen image generator to train the conditioning representations. We then freeze the planner and adapt the generator to these representations. This couples learning the plan to its use in image generation (Section 3.4).

**The same-data control now measures the gain beyond adaptation to the training pairs.** PhysFlow scores 56.32 on PICABench-Superficial, compared with 55.12 for image-pair SFT on the same PhysTrace pairs. Both use the same generator LoRA configuration and 537 generator updates; PhysFlow additionally trains its planner, for 1,790 total updates. The terminal-only run scores 55.57, compared with 56.32 for full PhysFlow as reported in the paper. The 0.75-point difference compares training configurations; finer attribution to supervision and curriculum requires further controls. These comparisons report single-run point estimates. We clarify these design differences in Sections 2 and 3 and report each completed control alongside the claim it tests.
<!-- reply:method-contribution:end -->

### R3-Q2: Identity of the no-reasoning baseline

> 状态：已接入 1 号 PICABench 同数据 SFT 结果；RISE 补测由 15 号追加。完整方法与 SFT 的生成器配置及更新数一致，总训练量不同。

<!-- reply:sft-baseline:start -->
The 54.26 row in Table 3 reports the original Qwen-Image-Edit-2511 backbone. The revised caption explicitly identifies it as “Original backbone” and states that it has no PhysTrace fine-tuning. We have now added a baseline fine-tuned on the same PhysTrace source-target pairs:

| Configuration | PICABench-Superficial (%) |
|---|---:|
| Original Qwen-Image-Edit-2511 | 54.26 |
| PhysTrace image-pair SFT | 55.12 |
| Full PhysFlow | 56.32 |

Image-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates. PhysFlow also trains a planner, for 1,790 total updates, so this comparison includes additional capacity and training. Question 3 compares the terminal-only run with the full PhysFlow results reported in the paper, including the category breakdown and the scope of this training-configuration comparison.
<!-- reply:sft-baseline:end -->

### R3-Q3 / R2: Terminal-only supervision

> 2026-11-08 22:35 PST：2 号最终结果已独立核验，Overall 55.57；900 张与 4,112 QA 完整。该对照保留六个 recurrent latent tokens、16-token final visual block 和可训练模块，使用 planner 1,253 与 generator 537 更新。分项表对比本轮 55.57 与论文完整模型报告值 56.32；差 0.75 pp。实验与回复保持完成；作者已确认完整模型与本轮对照使用同一版训练数据；11 号直接压缩仍待结果。详见 最终结果记录及 独立核验。

<!-- reply:terminal-only:start -->
Following your suggestion, we retain the six recurrent latent tokens, the 16-token final visual block, and the trainable modules. We train the terminal-only control using terminal visual supervision and the generation loss, without textual or intermediate-frame supervision. This control uses 1,253 planner updates and 537 generator updates. The table compares this new run with the full PhysFlow results reported in the paper.

Editing accuracy (%) on PICABench-Superficial, evaluated with Qwen2.5-VL-72B-Instruct; higher is better.

| Training strategy | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Terminal-only supervision | 53.84 | 64.48 | 57.73 | **59.18** | 42.57 | 46.68 | 63.59 | 55.71 | 55.57 |
| Full PhysFlow | **54.45** | **65.19** | **58.52** | 57.99 | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

Full PhysFlow achieves 0.75 percentage points higher overall accuracy. Terminal-only scores higher on refraction (59.18 versus 57.99). These single-run scores compare training configurations as a whole; isolating contributions from individual supervision terms and the compression curriculum requires further controls.
<!-- reply:terminal-only:end -->

### R3-Q4: PhysicEdit comparison

> 方法级数据已到位，复用 R1 的质量表、骨干说明和设计差异；给 xuAm 的最终独立回复待与 Q1–Q3 一起组织。

### R3: General-editing trade-offs

> 状态：回复及论文对应表述已完成并同步，checklist 已勾选。新增 Hybrid／Extract 任务要求与物理过程监督的区别，使用 “We interpret” 表明作者解释；Add 仅报告数值。候选案例与 Table 6 权重／逐样本评分尚未对应，不作为下降原因的证据。

<!-- reply:general-editing:start -->
Thank you for pointing out the category-level declines. Table 6 reports an overall ImgEdit-Bench score of 4.39 for PhysFlow and 4.41 for Qwen-Image-Edit-2511. PhysFlow scores higher in six of nine categories, while the largest declines occur in Hybrid (3.76 to 3.26) and Extract (4.16 to 3.91), with a smaller decrease in Add (4.45 to 4.26).

We interpret the declines in Hybrid and Extract as task-dependent transfer from physical-process supervision. PhysTrace emphasizes causally connected state evolution within a physical process through textual rationales and intermediate visual states (Sections 3.2 to 3.4). Hybrid combines separately specified editing operations within one instruction, whereas Extract requires isolating a subject while preserving its identity and visual details. [ImgEdit, Sections 3.1 and 4.2](https://arxiv.org/html/2505.20275v1#S3.SS1).

We have revised Appendix C.1 to report these category-level declines alongside the improvements. The revised text describes similar aggregate performance with category-dependent trade-offs, replacing the original claim of general editing without compromise.
<!-- reply:general-editing:end -->

