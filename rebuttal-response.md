# PhysFlow rebuttal：持续更新主稿

更新日期：2026-11-10。与 [HTML checklist](index.html) 配套维护；后续结果继续补入本文件。

- 已接入：作者确认的六模型 cost 表；PhysicEdit 的 PICABench 方法级结果；8uwk 的完整首轮回复草稿；基于 PICABench 原论文的训练与评测数据来源说明。
- 中文引用块为内部状态，提交时只复制英文回复及对应表格。论文修订和 OpenReview 提交另行完成。
- 其余英文模块沿用 11 月 6 日文字素材，仍按下方标注等待实验或核验。

> 进度更新（2026-11-12）：time-uniform 采用作者按相同数据集设置重跑的最新结果，Overall 55.05，与 change-uniform 56.32 相差 1.27 个百分点，已接入回复；共 10/16 项任务完成。作者确认 full 与新增对照使用同一版训练数据。PhysFlow（2509）结果已回填，Overall 54.12；中间视觉 token 数量与多 seed 结果仍待回填。16 个逐点回复另行对应到论文修改；回复点与任务项不是同一计数。

## 修改总览：给所有审稿人和 AC

> 2026-11-13：已按当前本地 LaTeX 的实际正文与附录核对总览，正文 8 项、附录 6 项。仅列已写入源码的修改；token 数量与重复运行实验未列为已完成。本次核对本地稿，不据旧目录日期或旧上传记录判断当前线上稿状态。

<!-- reply:overview:start -->
Dear Reviewers and ACs,

Thank you very much for the time and care you have devoted to reviewing our work. We sincerely appreciate your constructive comments and suggestions, which have helped us improve our previous manuscript. We have carefully considered every comment and suggestion and revised the paper accordingly, with the main changes marked in blue.

We summarize the main revisions below.

**In the main paper:**

1. Expanded the discussion of PhysicEdit, EndoCoT, and Monet to clarify their relationship with our method.
2. Added controlled comparisons to disentangle the benefits of PhysTrace and the PhysFlow framework, including image-pair fine-tuning on the same data.
3. Added PhysicEdit results on PICABench-Superficial, including a comparison using the same Qwen-Image-Edit-2509 backbone.
4. Added a terminal-only supervision experiment using the same latent structure and trainable modules.
5. Added an ablation comparing progressive compression with direct compression after explicit reasoning warm-up.
6. Added an ablation comparing time-uniform and change-uniform frame sampling under the same dataset settings.
7. Expanded analyses of latent roles, physical-domain information, intervention outcomes, and token-order sensitivity.
8. Added parameter-count and memory measurements alongside inference-latency comparisons.

**In the appendix:**

1. Clarified the sources and roles of PICA100K training data and PICABench evaluation examples.
2. Added details of the training controls and training budgets for the dataset and framework comparisons.
3. Added detailed experimental settings and procedures for the latent-representation analyses.
4. Added PhysicEdit results on ImgEdit-Bench.
5. Expanded the discussion of general editing performance, including the declines in Hybrid and Extract.
6. Clarified the interpretation of the qualitative RISEBench examples.

We provide detailed responses to each reviewer's comments below. Thank you very much again for your time and helpful suggestions.

Best regards,  
The Authors
<!-- reply:overview:end -->

## Reviewer 8uwk

### R1: PhysicEdit comparison

> 状态：方法级结果及 cost 已接入，首轮完整回复草稿已形成；尚未提交。对应 checklist：physicedit-score、physicedit-discussion。

<!-- reply:r1:start -->
Thank you very much for pointing out the missing discussion of PhysicEdit. We apologize for this omission and have added the discussion to Section 2.2, “Visual Transition Modeling for Image Editing,” in Related Work.

At inference, PhysicEdit combines an explicit textual reasoning trace with latent visual representations produced by learned transition queries. We find this design particularly compelling because it connects explicit physical constraints with video-derived transition priors without requiring intermediate-video generation. We share the motivation behind this design: textual explanations and visual trajectories provide complementary forms of intermediate reasoning, with text explaining physical principles and causal relationships, and visual trajectories describing how the scene changes.

Our specific focus, however, is to progressively internalize the text-to-visual reasoning process into an ordered latent plan:

1. Textual physical reasoning guides visual evolution through causal dependencies within the latent sequence. The planner first predicts textual latent states for high-level physical rules and causal dependencies, followed by low-level transition steps. These continuous textual states guide the generation of subsequent visual latents through causal dependencies within the latent sequence. Each visual latent also builds on preceding visual latents, linking physical reasoning to successive stages of visual evolution.

2. Visual supervision shapes the reasoning states. During planner training, downstream visual prediction and editing losses propagate through the continuous latent sequence to train earlier states. This encourages the text-derived states to retain information useful for the intended visual changes.

3. Our training curriculum progressively internalizes textual and visual reasoning. PhysicEdit trains transition queries against video-derived visual features while keeping its reasoning MLLM frozen. PhysFlow first trains the planner with explicit textual rationales and intermediate visual states. We then progressively replace high-level physical rationales, low-level transition descriptions, and successive intermediate visual blocks with latent tokens. Finally, we freeze the planner and adapt the image generator to the learned continuous latent sequence. By jointly internalizing textual physical reasoning and visual evolution, this curriculum equips PhysFlow with a unified latent reasoning process that guides image editing without decoding textual rationales or intermediate images at inference.

To provide empirical support for our latent reasoning design, we have expanded the representation analyses in Figure 7. Visualizations reveal role-dependent structure, while probing studies recover physical-domain information and reveal outcome-predictive information on several controlled intervention tasks. Token-order perturbations also show that editing performance is sensitive to the ordering of intermediate visual latents. Together, these analyses help explain the physical content and functional role of our compressed plan. The appendix provides detailed results and controls.

Following your helpful suggestion, we have also added an experimental comparison with PhysicEdit on PICABench-Superficial. We use Qwen2.5-VL-72B-Instruct for evaluation. With the same 2509 backbone, PhysFlow scores 54.12% versus 52.35% for PhysicEdit.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | 51.62 | 61.63 | 51.56 | 52.96 | 44.03 | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509) | 52.01 | 62.82 | 57.02 | 53.14 | 43.32 | 46.81 | 61.42 | 53.16 | 54.12 |
| PhysFlow (2511) | **54.45** | **65.19** | **58.52** | **57.99** | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

PhysFlow (2509) exceeds PhysicEdit by 1.77 points overall, with higher scores in seven categories and lower DFM. PhysFlow (2511) leads all eight. Latency (Table 5):

| Method | Latency (s) |
|---|---:|
| PhysicEdit | 52.19 |
| PhysFlow (Ours) | 49.39 |

We also include an ImgEdit-Bench comparison to assess general image editing (Table 6).

| Method | Add | Adjust | Extract | Replace | Remove | BackG | Style | Hybrid | Action | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | **4.31** | 4.17 | 2.34 | 4.45 | 4.44 | 4.03 | 4.74 | **3.36** | **4.85** | 4.05 |
| PhysFlow (Ours) | 4.26 | **4.33** | **3.91** | **4.66** | **4.66** | **4.25** | **4.85** | 3.26 | **4.85** | **4.39** |

PhysFlow achieves an overall score of 4.39, compared with 4.05 for PhysicEdit. It scores higher in six of nine categories, ties in Action, and scores lower in Add and Hybrid.

We sincerely appreciate your suggestion, which helped us present the relationship to PhysicEdit and the evidence for our latent representation more clearly.
<!-- reply:r1:end -->

## Reviewer 62MG

> 编辑说明：十个回复点采用固定编号 Response 1–Response 10，按 (1–3)、(4–7)、(8–10) 分为三条评论，每条不超过 5,000 字符。完整分组与实时字符计数见网页回复面板；表格空白不表示实验已完成。

### Response 1: Same-data image-pair fine-tuning baseline

<!-- reply:r2-sft-baseline:start -->
Dear Reviewer 62MG,

Thank you very much for your careful reading and detailed, constructive feedback. We sincerely appreciate your recognition of the motivation, the framework, and the empirical improvements. Your questions helped us clarify the method and strengthen the evidence. We address your concerns in ten responses below.

**Response 1: Same-data image-pair fine-tuning baseline**

Thank you for requesting this controlled comparison. We agree that the original backbone baseline alone could not distinguish gains from PhysTrace adaptation and latent reasoning. The no-reasoning configuration in Table 3 (first row, 54.26%) is the original Qwen-Image-Edit-2511 backbone without PhysTrace fine-tuning. Following your suggestion, we add image-pair SFT on the same PhysTrace source-target pairs:

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|PhysTrace image-pair SFT|**55.07**|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysFlow|54.45|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

PhysFlow exceeds same-data SFT by 1.20 points. Both use rank-512 generator LoRA and 537 generator updates. Our latent reasoning framework thus improves editing performance beyond same-data image-pair fine-tuning.
<!-- reply:r2-sft-baseline:end -->

### Response 2: Dataset effectiveness and training framework

> 状态：1 号 PICABench 结果已完成独立核验并接入回复；同数据 SFT 与 dataset-comparison 文字回应完成，RISE 由 15 号追加。2026-11-08 18:42 PST 快照：2 号训练完成、评测中；11 号结果待接入。

<!-- reply:sft-dataset:start -->
**Response 2: Dataset effectiveness and training framework**

Thank you for pointing out that the dataset comparisons also involve differences in supervision and training procedure. Following your suggestion, we have added a PhysTrace image-pair SFT baseline to assess dataset effectiveness under the same training strategy and the additional benefit of PhysFlow on the same training data.

All four configurations use Qwen-Image-Edit-2511. We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report gains in percentage points.

|Training data|Training strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|PICA100K|Image-pair SFT|**55.52**|60.30|57.69|53.04|41.46|45.91|59.13|52.12|53.38|
|PhysTrace|Image-pair SFT|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysicTran38K|PhysFlow|54.14|62.16|54.55|57.60|44.03|45.19|61.26|52.20|53.82|
|PhysTrace|PhysFlow|54.45|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

(a) PhysTrace improves SFT by 1.74 points over PICA100K with fewer examples and updates. (b) Under the same PhysFlow architecture and curriculum, PhysTrace gains 2.50 points over PhysicTran38K using fewer examples. (c) On identical PhysTrace pairs, PhysFlow exceeds SFT by 1.20 points with matched generator adaptation. Together, these comparisons and the compression ablation (Response 3) demonstrate the effectiveness of our PhysTrace dataset, our latent reasoning framework, and our progressive training curriculum.
<!-- reply:sft-dataset:end -->

### Response 3: Further ablations on frame sampling methods, visual token counts, and compression strategies

> time-uniform 采用作者提供的重跑结果：作者确认与 change-uniform 使用相同数据集设置，Overall 55.05 vs. 56.32，差 1.27 个百分点；完整类别数据见下表。固定四个中间状态，比较每状态 1、2、4 个视觉 token；token 消融已按作者结果回填：1-token 采用主表参考行 56.32，2/4-token 为 54.73/54.85；这是不同配置间比较，不单独隔离 token 数量影响；直接压缩已核验为 54.52，完整分项已填入，与论文渐进压缩模型 56.32 对比。

<!-- reply:sampling:start -->
**Response 3: Further ablations on frame sampling methods, visual token counts, and compression strategies**

Thank you for these helpful suggestions. We added three ablations (PICABench-Superficial accuracy, %).

(1) Frame sampling: Time-uniform samples can concentrate changes between few frames. Change-uniform captures richer dynamics (Figure 5(d), Appendix A.2). This comparison was missing. Following your suggestion, we compare both under the same PhysTrace settings.

|Sampling|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Time-uniform|53.72|63.06|**59.30**|57.64|43.29|46.21|62.35|53.65|55.05|
|Change-uniform|**54.45**|**65.19**|58.52|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

Change-uniform gains 1.27 points overall, supporting our sampling strategy (Appendix C.7).

(2) Visual token counts: We vary tokens per state (1/2/4), keeping four states, two textual tokens, and 16 final visual tokens.

|Tokens per state|Total intermediate tokens|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|1|4|**54.45**|**65.19**|**58.52**|**57.99**|**44.91**|47.31|**64.32**|**56.43**|**56.32**|
|2|8|52.10|64.28|57.61|56.16|42.61|46.08|62.94|53.92|54.73|
|4|16|52.65|64.41|56.93|56.16|41.83|**47.54**|63.40|52.84|54.85|

The 1-token row uses the main-paper reference. This comparison does not isolate token count. One token per state gives the highest observed overall accuracy (56.32%) with the fewest tokens.

(3) Compression strategy: After explicit warm-up, we replace text and visual blocks progressively or at once, keeping the same final latent layout.

|Compression strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Direct compression|52.84|63.83|55.68|56.31|42.54|46.85|62.40|53.96|54.52|
|Progressive compression (paper)|**54.45**|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

Progressive compression improves overall accuracy by 1.80 points.
<!-- reply:sampling:end -->

### Response 4: Physical information in the latent representations

> 2026-11-09：已同步最终 Figure 7 四联图。a：原角色聚类支持压缩后的角色组织；b：六领域线性探针平衡准确率 86.91%；c：十一项探索中的七项展示子集，统一报告配对准确率；Phase change 为固定读出器在 256 对／128 新家族上的独立确认，其余六项各 128 对／64 家族；d：保留 64 例编辑顺序干预。全部十一项、强对照、阴性结果和逐 token 对齐未成立的结论保留。v14 结果与对照快照、确认集审计。

> 6 号 H100 补充分析已完成，见 完整报告。validation212 拟合、test212 检索：共享线性读出 29.83% vs 位置原型 29.25%，配对增益 95% CI 为 −1.30 至 +2.36 pp。扩展判别式探索为 48.23% vs 位置 46.11%（+2.12 pp，名义 CI +0.24 至 +4.13 pp），但源图与终态控制为 48.00%/48.58%，对应配对优势未成立。现有证据仍不足以支持逐 token 的物理状态对应。分析完成不等于正面主张成立；所有历史结果保留。

> 6 号新增物理类别与亮度分析，见 报告与三组图件。原始 taxonomy 为六领域、26 细类，另有八类 PICA 标签。六领域平衡准确率 86.91% vs 源图加指令 76.28%（配对增益名义 CI +4.10 至 +17.90 pp）；同布局预训练对照为 85.94%，与 PhysFlow 的差异未确立。82 个照明测试视频的亮度变化读出 R²=0.370，指令 TF-IDF 为 0.365，预训练为 0.402。可主张压缩 latent 保留了可读出的物理类别与视觉变化信息；训练获得额外物理规律、逐状态对齐与因果物理作用仍缺证据。所有结果属于探索性后续分析。

<!-- reply:latent-representation:start -->
**Response 4: Physical information in the latent representations**

We appreciate your distinction between token-order sensitivity and evidence of physically meaningful representations. Figure 7 presents representation analyses and controlled interventions.

(a) Token-role structure. The original clustering visualization supports role-dependent representation structure after compression.

(b) Physical-domain linear probe. We probe six physical domains in PhysTrace's taxonomy of 26 subcategories: optics and lighting, rigid-body motion, deformation and fracture, fluid dynamics, state change, and environment and aerodynamics. We fit and cross-validate a linear probe on 212 PhysTrace videos and test on 212 independent videos. The six latent tokens yield 86.91% balanced accuracy (mean recall across the six domains). Uniform random guessing gives 1/6 = 16.67%. The same-layout pretrained control scores 85.94%, and the low-level text token scores 86.79%. These controls limit attribution to PhysFlow training.

(c) Physical-intervention prediction. We test visual latents on two instructions for the same source image. Removing a ball's supporting block should make it fall. Removing the other block should leave it at rest. Reference outcomes follow idealized physical rules in synthetic scenes.

We freeze PhysFlow and train a linear probe on its four intermediate visual tokens to predict intervention outcomes, selecting settings on validation data. Pair accuracy requires both outcomes to be predicted correctly. Figure 7(c) shows seven tasks:

|Task|Support|Torque|Buoyancy|Outflow|Absorption|Phase change|Shape recovery|
|---|---:|---:|---:|---:|---:|---:|---:|
|Pair accuracy (%)|99.22|100.00|99.22|96.09|99.22|100.00|91.41|

Phase change uses 128 fresh confirmation scene families with the validation-selected probe fixed. Shape recovery tests rubber versus clay.

Across the seven illustrated tasks, 91.41%–100% pair accuracy demonstrates that our visual latents encode useful information for predicting physical intervention outcomes (Appendix C.6).

(d) Visual-token perturbation. On 64 PICABench-Superficial inputs, eight per category, Qwen2.5-VL-72B-Instruct gives mean accuracies of 57.36% for the original condition, 55.64% for masking, and 53.94% for both reversal and shuffling. Perturbations occur after planning, with textual and final-visual conditioning fixed. Reversal and shuffling each reduce accuracy by 3.42 percentage points, supporting order sensitivity.

The four analyses show that (a) the latent space is organized by token role, (b) physical-domain information is linearly decodable, (c) linear probes accurately predict intervention outcomes from the visual latents on the illustrated tasks, and (d) visual-token order affects editing performance. Together, these results demonstrate that PhysFlow's compact latent plan encodes the structured, physically relevant information that our design aims to preserve.
<!-- reply:latent-representation:end -->

附件（v15）：[Overleaf 替换包 ZIP](attachments/physflow-latent-appendix.zip) · [LaTeX 片段](attachments/latent-representation-analysis.tex) · [四联图 PDF](attachments/latent-analysis-four.pdf) · [单页附录预览 PDF](attachments/latent-appendix-preview.pdf)。

### Response 5: Statistical uncertainty and repeated runs

> 训练种子 43/44/45/46 仍在运行，推理 seed 固定为 42；本轮移除训练 Pending 表格，诚恳说明算力及训练时间限制，完成训练与评测后跟进。推理 seeds 42/215/3407 采用作者于 2026-11-13 确认的 RISEBench 结果：Base 8.06/9.17/8.89，PhysFlow 9.44/11.39/9.17。按三次运行的样本标准差汇总为 8.71 ± 0.58 和 10.00 ± 1.21，平均提升 1.29 个百分点；不沿用另一组逐样本评分的 bootstrap 区间。

<!-- reply:statistics:start -->
**Response 5: Statistical uncertainty and repeated runs**

Thank you for highlighting seed stability.

We sincerely apologize that limited compute and lengthy training prevent us from providing repeated-training results in this response period. Training is ongoing. We will add the results in a follow-up response once training and evaluation are complete.

Inference seeds: 42, 215, and 3407, with model checkpoints fixed.

|Method|RISEBench mean ± SD (%)|
|---|---:|
|Qwen-Image-Edit-2511|8.71 ± 0.58|
|PhysFlow|10.00 ± 1.21|

PhysFlow outperforms the backbone on all three inference seeds, with a mean RISEBench gain of 1.29 percentage points.
<!-- reply:statistics:end -->

### Response 6: Multimodal-model evaluation and human evidence

> 状态：PICABench 的物理检查问题和参考答案，以及 17 人、100 对样本的 human study 提供评测与人工证据。困难案例和比较性失败分析单列为 Response 7。未声称逐样本人机一致率或对物理规律的完备验证。13 号实验安排与完成状态不变。

<!-- reply:physical-evaluation:start -->
**Response 6: Multimodal-model evaluation and human evidence**

Thank you very much for emphasizing objective physical correctness. We present the evaluation criteria alongside human evidence.

(1) PICABench specifies physical criteria through human-annotated regions and manually reviewed yes/no questions, such as whether object removal also removes its shadow. PICAEval uses a vision-language model (VLM) to inspect edited images and answer these questions, scoring exact agreement with predefined reference answers (PICABench, Section 3.3 and Appendix A.3).

(2) Our human study provides complementary evidence. We ask 17 participants to compare PhysFlow with five competing methods on 100 image-instruction pairs randomly sampled from PICABench and RISEBench. Their preference for PhysFlow's physical plausibility agrees with the overall benchmark trend.
<!-- reply:physical-evaluation:end -->

### Response 7: Difficult cases and failure analysis (Figures 3 and 6)

> 状态：依据正文 Figure 3（PICABench）和附录 Figure 6（RISEBench），归纳跨区域光学一致性、接触形变和随时间发生的表面变化；比较图示案例中的物理后果，结论限于定性证据。

<!-- reply:difficult-cases:start -->
**Response 7: Difficult cases and failure analysis (Figures 3 and 6)**

PICABench examples require optical consistency across regions and deformation at contact. RISEBench examples require changes to object surfaces over time. Several baselines follow the local edit but leave mismatched reflections, residual lighting, little deformation, or limited surface changes. PhysFlow depicts the corresponding optical, mechanical, and temporal changes more consistently in these examples, providing qualitative support for physical consistency.
<!-- reply:difficult-cases:end -->

### Response 8: Originality and positioning relative to closely related approaches

> 作者已确认本版：说明文字物理约束与视觉状态的联合内化动机，比较 Monet、EndoCoT 和 PhysicEdit，说明 PhysTrace 的作用；首次主张限定为 physics-aware image editing 中的联合内化。直接压缩消融仍待结果。

<!-- reply:r2-method-contribution:start -->
**Response 8: Originality and positioning relative to closely related approaches**

Thank you very much for carefully examining the originality of our work. We acknowledge the inspiration from prior work on progressive chain-of-thought internalization, continuous latent reasoning, and visual feature prediction.

(1) We learn the connection between physical explanations and visual evolution within the latent sequence. PhysicEdit retains explicit textual reasoning and trains transition queries with a frozen reasoning MLLM. In PhysFlow, textual latents guide subsequent visual latents through causal dependencies. During planner training, downstream visual losses and the image-generation loss through the frozen generator train the earlier reasoning states (Sections 3.3 and 3.4). Physical reasoning therefore guides visual evolution and is itself shaped by the transformation it must produce.

(2) Our curriculum changes both the representation and its supervision during compression. EndoCoT supervises recurrent thought states with intermediate image-generation losses and terminal textual grounding, then shifts optimization to the terminal step. Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning for textual answers. PhysFlow progressively replaces textual rationales and then ordered visual blocks with latent tokens. Each visual replacement removes that block's direct alignment loss, while downstream visual and editing supervision continues to train the compressed sequence (Section 3.4). The resulting compact plan carries both forms of process reasoning into image generation without decoding textual rationales or intermediate images.

(3) PhysTrace supplies the process supervision required for joint internalization. Its 11,448 synthetic trajectories pair hierarchical physical rationales, ordered intermediate visual states, and editing targets (Section 3.2). These aligned signals extend supervision beyond source-target pairs: they explain the physical principles, trace how the scene changes, and specify the intended outcome. PhysTrace thus trains the planner on how a physical edit unfolds, as well as what it should produce.

Together, PhysFlow turns complementary textual and visual process supervision into a unified, compact latent plan trained directly for image editing.
<!-- reply:r2-method-contribution:end -->

### Response 9: Training and evaluation data sources

> 状态：回复已完成并接入，按作者要求勾选 checklist 的 data-split 项。下段说明 PICA-100K 与 PICABench 的构建方式及用途。合稿核验备注：原稿最终版本与本轮 +899 补实验版本仍需分别对应实际训练清单、checkpoint 和检查记录；来源说明不等同于跨集近重复审计。

<!-- reply:data-split:start -->
**Response 9: Training and evaluation data sources**

Thank you for raising the question of training and evaluation data separation. We have clarified the construction sources and the respective roles of PICA-100K, PhysTrace, and PICABench in Section 3.2 and Appendix A.

PICA-100K provides training data, while PICABench provides a separately curated evaluation set of 900 editing examples. The PICABench authors collect evaluation images from licensed and public sources and construct PICA-100K from generated source images and synthetic videos. We start constructing our PhysTrace training dataset with PICA-100K image-instruction pairs.
<!-- reply:data-split:end -->

### Response 10: Parameter count, peak memory, and latency

> 状态：实验完成，已接入回复。对应 checklist：parameters-memory。全部数值采用作者本轮确认表格。

<!-- reply:cost:start -->
**Response 10: Parameter count, peak memory, and latency**

Thank you for suggesting parameter-count and peak-memory comparisons in addition to latency. We have added these measurements to Table 5 to give a fuller account of inference costs.

We count the parameters resident during inference, including reasoning modules, and report peak allocated GPU memory. Parameter counts and peak allocated memory describe the current implementations. The latency column reports separate timing measurements.

|Method|Params (B)|Memory (GiB)|Latency (s)|
|---|---:|---:|---:|
|Qwen-Image-Edit|28.85|58.06|44.34|
|PhysicEdit|29.00|56.25|52.19|
|Step1X-Edit|20.82|41.34|59.18|
|Qwen-Image-Edit + explicit reasoning|28.85|58.06|60.12|
|ChronoEdit|22.83|54.81|228.68|
|PhysFlow (Ours)|28.87|58.11|49.39|

PhysFlow retains nearly the same parameter count and peak memory as Qwen-Image-Edit (28.87B vs. 28.85B, 58.11 vs. 58.06 GiB), with only 11.4% latency overhead. Its parameter count is comparable to PhysicEdit's and higher than those of Step1X-Edit and ChronoEdit, yet its latency is lower than all three. At 49.39 seconds per edit, it is also faster than Qwen-Image-Edit with explicit reasoning (60.12 seconds). These results demonstrate the inference efficiency of our compact latent planning design.

Thank you again for the time and care you have devoted to our work. Your detailed feedback has helped us strengthen the experiments and explain the method and its evidence more clearly.
<!-- reply:cost:end -->

## Reviewer xuAm

### R3-Q1: Method contribution

> 状态：EndoCoT / Monet 的 discussion 已成稿并接入 HTML。1 号同数据 SFT 与 2 号终态监督结果已接入；2 号已补完整分项表并区分新跑结果与论文报告值，11 号直接压缩结果待接入。

<!-- reply:method-contribution:start -->
Dear Reviewer xuAm,

We sincerely thank you for the time and effort you devoted to reviewing our manuscript and for your detailed, constructive feedback. We especially appreciate your suggestions for additional experiments, direct method comparisons, and clearer explanations of our approach. Your comments have helped us recognize where the original manuscript needed fuller explanations and stronger evidence, and have guided us in improving its clarity and quality. We have carefully considered each of your concerns and respond point by point below.

**Response 1: Central contribution relative to EndoCoT and Monet**

Thank you for asking us to clarify the contribution. PhysFlow internalizes the connection between physical explanations and visual evolution into a latent plan for image editing. Textual rationales explain the physical rules and transition steps. Intermediate visual states supervise how those steps change the scene. Our curriculum progressively compresses both into a continuous plan that conditions image generation (Sections 3.3 and 3.4).

Relative to EndoCoT, our distinction lies in how explicit process supervision becomes a latent plan. EndoCoT trains recurrent thought states with intermediate image-generation losses and terminal textual grounding, then shifts optimization to the terminal step. EndoCoT, Section 4.2. PhysFlow first learns explicit textual rationales and visual trajectories, then progressively replaces their textual and visual blocks with latent tokens. Text-derived states precede and condition subsequent visual states, while downstream visual and editing losses train the compressed sequence. This curriculum teaches the planner to carry physical explanations forward into visual evolution as explicit reasoning disappears.

Relative to Monet, we train the latent plan through the image transformation it guides. Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning for textual answers. Monet, Section 3. PhysFlow jointly compresses textual rationales and visual trajectories, and propagates the image-generation loss through the generator to train the plan. The plan therefore receives supervision from both the physical process and the edited outcome. Responses 3 and 4 report the same-data SFT and terminal-only controls.
<!-- reply:method-contribution:end -->

### R3-Q2: Identity of the no-reasoning baseline and same-data source-target fine-tuning

> 状态：已接入 1 号 PICABench 同数据 SFT 结果；RISE 补测由 15 号追加。完整方法与 SFT 的生成器配置及更新数一致，总训练量不同。

<!-- reply:sft-baseline:start -->
We agree that a same-data fine-tuning baseline is needed to assess the benefit of our framework beyond dataset adaptation. The no-reasoning configuration in Table 3 (first row, 54.26%) is the original Qwen-Image-Edit-2511 backbone without PhysTrace fine-tuning. Following your suggestion, we have added an image-pair SFT baseline trained on the same PhysTrace source-target pairs. The table below reports PICABench-Superficial accuracy (%):

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|PhysTrace image-pair SFT|**55.07**|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysFlow|54.45|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

Image-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates.

These results demonstrate two distinct gains: PhysTrace fine-tuning improves the backbone, and PhysFlow's latent reasoning framework delivers a further improvement on the same training pairs.
<!-- reply:sft-baseline:end -->

### R3-Q3 / R2: Terminal-only supervision

> 2026-11-08 22:35 PST：2 号最终结果已独立核验，Overall 55.57；900 张与 4,112 QA 完整。该对照保留六个 recurrent latent tokens、16-token final visual block 和可训练模块，使用 planner 1,253 与 generator 537 更新。分项表对比本轮 55.57 与论文完整模型报告值 56.32；差 0.75 pp。实验与回复保持完成；作者已确认完整模型与本轮对照使用同一版训练数据；11 号直接压缩已完成核验，54.52；下表与论文主模型 56.32 比较，并非共用初始化的新配对复训。详见 最终结果记录及 独立核验。

<!-- reply:terminal-only:start -->
We appreciate your suggestion to evaluate terminal-only supervision under the same model structure. We retain the same recurrent latent tokens, final visual block, and trainable modules, but train using only terminal visual supervision and the generation loss. This control uses 1,253 planner updates and 537 generator updates. The table compares this new run with the full PhysFlow results reported in the paper.

Editing accuracy (%) on PICABench-Superficial.

| Training strategy | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Terminal-only supervision | 53.84 | 64.48 | 57.73 | **59.18** | 42.57 | 46.68 | 63.59 | 55.71 | 55.57 |
| Full PhysFlow | **54.45** | **65.19** | **58.52** | 57.99 | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

Full PhysFlow improves overall accuracy by 0.75 percentage points over terminal-only supervision. This comparison demonstrates the benefit of our training strategy: textual rationales and intermediate visual states provide process supervision that improves physical editing accuracy beyond terminal supervision alone.
<!-- reply:terminal-only:end -->


### R3-Q4: PhysicEdit comparison

> 状态：已针对 Reviewer 3 单独组织回复；PhysFlow（2509）结果已由作者提供并填入：Overall 54.12，同骨干超过 PhysicEdit 1.77 个百分点。

<!-- reply:r3-physicedit:start -->
We appreciate your comment that our comparison using PhysicTran38K does not constitute a direct comparison with PhysicEdit. The score of 53.82 in Tables 4 and 9 corresponds to PhysFlow trained on PhysicTran38K, rather than PhysicEdit itself.

To address this concern, we have added a direct comparison with PhysicEdit on PICABench-Superficial, evaluated with Qwen2.5-VL-72B-Instruct. The table includes PhysFlow with both Qwen-Image-Edit-2509 and Qwen-Image-Edit-2511.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | 51.62 | 61.63 | 51.56 | 52.96 | 44.03 | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509) | 52.01 | 62.82 | 57.02 | 53.14 | 43.32 | 46.81 | 61.42 | 53.16 | 54.12 |
| PhysFlow (2511) | **54.45** | **65.19** | **58.52** | **57.99** | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

With the same Qwen-Image-Edit-2509 backbone, PhysFlow achieves 54.12% versus 52.35% for PhysicEdit, a gain of 1.77 percentage points. It scores higher in seven of eight categories, with DFM lower (43.32% vs. 44.03%). PhysFlow (2511) reaches 56.32%, 2.20 points above PhysFlow (2509). PhysFlow's advantage over PhysicEdit thus persists with the same backbone.

Beyond this empirical comparison, we have also expanded the discussion in Section 2.2 to clarify the methodological differences. PhysicEdit learns latent visual transition priors from videos and combines them with explicit textual reasoning to guide image editing. PhysFlow couples textual physical reasoning with visual evolution in a continuous latent plan. Text-derived latent states guide subsequent visual transitions, while downstream visual supervision and editing losses train these text-derived latent states to retain information useful for image generation. Our progressive compression curriculum internalizes explicit physical rationales and intermediate visual states into this coupled reasoning process. The resulting plan connects physical explanations to their visual consequences and guides image editing without decoding textual rationales or intermediate images at inference.
<!-- reply:r3-physicedit:end -->

### R3: Further analysis of general editing performance

> 状态：回复及论文对应表述已完成并同步，checklist 已勾选。新增 Hybrid／Extract 任务要求与物理过程监督的区别，使用 “We interpret” 表明作者解释；Add 仅报告数值。候选案例与 Table 6 权重／逐样本评分尚未对应，不作为下降原因的证据。

<!-- reply:general-editing:start -->
We value your suggestion to examine the category-level results more closely and explore why some categories decline despite broadly maintained overall general editing performance. Table 6 reports an overall ImgEdit-Bench score of 4.39 for PhysFlow and 4.41 for Qwen-Image-Edit-2511. PhysFlow scores higher in six of nine categories, while the largest declines occur in Hybrid (3.76 to 3.26) and Extract (4.16 to 3.91).

We attribute the declines in Hybrid and Extract to task-dependent transfer from physical-process supervision. PhysTrace emphasizes causally connected state evolution within a physical process through textual rationales and intermediate visual states (Sections 3.2 to 3.4). Hybrid combines separately specified editing operations within one instruction, whereas Extract requires isolating a subject while preserving its identity and visual details. This difference in task focus may help explain why improvements in physical-process editing do not transfer uniformly to Hybrid and Extract.

We have revised Appendix C.1 to report these category-level declines alongside the improvements. The revised text describes broadly maintained overall performance while explicitly acknowledging the lower scores in Hybrid and Extract.
<!-- reply:general-editing:end -->

