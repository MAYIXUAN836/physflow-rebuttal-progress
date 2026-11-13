# PhysFlow rebuttal：持续更新主稿

更新日期：2026-11-10。与 [HTML checklist](index.html) 配套维护；后续结果继续补入本文件。

- 已接入：作者确认的六模型 cost 表；PhysicEdit 的 PICABench 方法级结果；8uwk 的完整首轮回复草稿；基于 PICABench 原论文的训练与评测数据来源说明。
- 中文引用块为内部状态，提交时只复制英文回复及对应表格。论文修订和 OpenReview 提交另行完成。
- 其余英文模块沿用 11 月 6 日文字素材，仍按下方标注等待实验或核验。

> 进度更新（2026-11-12）：time-uniform 采用作者按相同数据集设置重跑的最新结果，Overall 55.09，与 change-uniform 56.32 相差 1.23 个百分点，已接入回复；共 10/16 项任务完成。作者确认 full 与新增对照使用同一版训练数据。中间视觉 token 数量、直接压缩、2509 骨干对照与多 seed 结果已预留回复表格，待回填。16 个逐点回复另行对应到论文修改；回复点与任务项不是同一计数。

## 修改总览：给所有审稿人和 AC

> 本地标蓝修订稿已完成编译与排版检查：正文 10 页，总计 22 页；尚未上传 Overleaf / OpenReview。下方为开场回复草稿，论文上传后再作为正式修改总览提交。正文、附录与图表编号已核对。未完成的新实验不列为已完成。

<!-- reply:overview:start -->
Dear Reviewers and ACs,

Thank you very much for the time and care you have devoted to reviewing our work. We sincerely appreciate your constructive comments and suggestions, which have helped us improve our previous manuscript. We have carefully considered every comment and suggestion and revised the paper accordingly, with the main changes marked in blue.

We summarize the main revisions below.

**In the main paper:**

1. Expanded the discussion of PhysicEdit, EndoCoT, and Monet to clarify their relationship with our method.
2. Added experiments comparing PhysFlow with a direct fine-tuning baseline using the same PhysTrace source-target image pairs.
3. Added controlled experiments to better separate the benefits of dataset adaptation from those of structured latent reasoning.
4. Added experiments comparing PhysFlow with PhysicEdit on PICABench and evaluating computational costs.
5. Clarified the sources and roles of PICA-100K training data and the 900 PICABench evaluation examples to address concerns about potential overlap between training and evaluation data.

**In the appendix:**

1. Added experiments with terminal-only supervision.
2. Added experiments comparing time-uniform and change-uniform frame sampling.
3. Added ablations comparing the choice of four intermediate visual states with alternative token counts.
4. Added ablations comparing the proposed progressive compression sequence with direct compression strategies.
5. Expanded the latent-representation analysis with physical domain linear probes, controlled intervention tasks, and token-order perturbations, together with their controls and limitations.
6. Explained the ImgEdit-Bench results, including category-level declines and broadly maintained aggregate performance.
7. Addressed concerns about reliance on multimodal-model judgments by explaining how both model-based evaluations and our human study support improved physical plausibility.
8. Clarified the uncertainty of single-run results.

We provide detailed responses to each reviewer's comments below. Thank you very much again for your time and helpful suggestions.

Best regards,  
The Authors
<!-- reply:overview:end -->

## Reviewer 8uwk

### R1: PhysicEdit comparison

> 状态：方法级结果及 cost 已接入，首轮完整回复草稿已形成；尚未提交。对应 checklist：physicedit-score、physicedit-discussion。

<!-- reply:r1:start -->
Thank you very much for pointing out the missing discussion of PhysicEdit. We apologize for this omission and have added the discussion to Section 2.2, “Visual Transition Modeling for Image Editing,” in Related Work.

At inference, [PhysicEdit](https://arxiv.org/html/2602.21778v2#S3.SS3) combines an explicit textual reasoning trace with latent visual representations produced by learned transition queries. We find this design particularly compelling because it connects explicit physical constraints with video-derived transition priors without requiring intermediate-video generation. We share the motivation behind this design: textual explanations and visual trajectories provide complementary forms of intermediate reasoning, with text explaining physical principles and causal relationships, and visual trajectories describing how the scene changes.

**Our specific focus, however, is to progressively internalize the text-to-visual reasoning process into an ordered latent plan:**

1. **Textual physical reasoning guides visual evolution through causal dependencies within the latent sequence.** The planner first predicts textual latent states for high-level physical rules and causal dependencies, followed by low-level transition steps. These continuous textual states guide the generation of subsequent visual latents through causal dependencies within the latent sequence. Each visual latent also builds on preceding visual latents, linking physical reasoning to successive stages of visual evolution.

2. **Visual supervision shapes the reasoning states.** During planner training, downstream visual prediction and editing losses propagate through the continuous latent sequence to train earlier states. This encourages the text-derived states to retain information useful for the intended visual changes.

3. **Our training curriculum progressively internalizes textual and visual reasoning.** PhysicEdit trains transition queries against video-derived visual features while keeping its reasoning MLLM frozen. PhysFlow first trains the planner with explicit textual rationales and intermediate visual states. We then progressively replace high-level physical rationales, low-level transition descriptions, and successive intermediate visual blocks with latent tokens. Finally, we freeze the planner and adapt the image generator to the learned continuous latent sequence. By jointly internalizing textual physical reasoning and visual evolution, this curriculum equips PhysFlow with a unified latent reasoning process that guides image editing without decoding textual rationales or intermediate images at inference.

**To provide empirical support for our latent reasoning design, we have expanded the representation analyses in Figure 7.** Visualizations reveal role-dependent structure, while probing studies recover physical-domain information and reveal outcome-predictive information on several controlled intervention tasks. Token-order perturbations also show that editing performance is sensitive to the ordering of intermediate visual latents. Together, these analyses help explain the physical content and functional role of our compressed plan; the appendix provides detailed results and controls.

**Following your helpful suggestion, we have also added an experimental comparison with PhysicEdit on PICABench-Superficial.** We use Qwen2.5-VL-72B-Instruct for evaluation. The reported PhysFlow results use Qwen-Image-Edit-2511; results with Qwen-Image-Edit-2509 are pending.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | 51.62 | 61.63 | 51.56 | 52.96 | 44.03 | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509; pending) | | | | | | | | | |
| **PhysFlow (2511)** | **54.45** | **65.19** | **58.52** | **57.99** | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

PhysFlow (2511) scores higher across all eight categories (Table 1). We also compare inference latency in Table 5:

| Method | Latency (s) |
|---|---:|
| PhysicEdit | 52.19 |
| PhysFlow (Ours) | 49.39 |

**We also include an ImgEdit-Bench comparison to assess general image editing (Table 6).**

| Method | Add | Adjust | Extract | Replace | Remove | BackG | Style | Hybrid | Action | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | **4.31** | 4.17 | 2.34 | 4.45 | 4.44 | 4.03 | 4.74 | **3.36** | **4.85** | 4.05 |
| **PhysFlow (Ours)** | 4.26 | **4.33** | **3.91** | **4.66** | **4.66** | **4.25** | **4.85** | 3.26 | **4.85** | **4.39** |

PhysFlow achieves an overall score of **4.39**, compared with **4.05** for PhysicEdit. It scores higher in six of nine categories, ties in Action, and scores lower in Add and Hybrid.

We sincerely appreciate your suggestion, which helped us present the relationship to PhysicEdit and the evidence for our latent representation more clearly.
<!-- reply:r1:end -->

## Reviewer 62MG

> 编辑说明：十个回复点采用固定编号 Response 1–Response 10，按 (1–3)、(4–5)、(6–8)、(9–10) 分为四条评论，每条不超过 5,000 字符。完整分组与实时字符计数见网页回复面板；表格空白不表示实验已完成。

### Response 1: Same-data image-pair fine-tuning baseline

<!-- reply:r2-sft-baseline:start -->
Dear Reviewer 62MG,

Thank you very much for your careful reading and detailed, constructive feedback. We sincerely appreciate your recognition of the motivation, the framework, and the empirical improvements. Your questions have helped us identify where the original manuscript needed clearer explanations and stronger supporting evidence. We have carefully considered every concern and suggestion. We organize our response into ten points below, covering your concerns and questions.

**Response 1: Same-data image-pair fine-tuning baseline**

Thank you for requesting this controlled comparison. We agree that the original backbone baseline alone could not distinguish gains from PhysTrace adaptation and latent reasoning.

Table 3's 54.26 row is the original Qwen-Image-Edit-2511 backbone with no PhysTrace fine-tuning; we clarify this in the caption. We add image-pair SFT on the same PhysTrace source-target pairs:

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|PhysTrace image-pair SFT|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysFlow|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

PhysFlow exceeds same-data SFT by 1.20 points. Both use rank-512 generator LoRA and 537 generator updates.
<!-- reply:r2-sft-baseline:end -->

### Response 2: Dataset effectiveness and training framework

> 状态：1 号 PICABench 结果已完成独立核验并接入回复；同数据 SFT 与 dataset-comparison 文字回应完成，RISE 由 15 号追加。2026-11-08 18:42 PST 快照：2 号训练完成、评测中；11 号结果待接入。

<!-- reply:sft-dataset:start -->
**Response 2: Dataset effectiveness and training framework**

Thank you for pointing out that the dataset comparisons also involve differences in supervision and training procedure.

All four configurations use Qwen-Image-Edit-2511. We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report gains in percentage points.

|Training data|Training strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|PICA100K|Image-pair SFT|55.52|60.30|57.69|53.04|41.46|45.91|59.13|52.12|53.38|
|PhysTrace|Image-pair SFT|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysicTran38K|PhysFlow|54.14|62.16|54.55|57.60|44.03|45.19|61.26|52.20|53.82|
|PhysTrace|PhysFlow|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

(a) Image-pair SFT: +1.74 points. PhysTrace outperforms PICA100K with fewer examples and generator updates.

(b) PhysFlow training: +2.50 points. PhysTrace outperforms PhysicTran38K with the same architecture and curriculum, again using fewer examples. The 53.82 row is PhysFlow trained on PhysicTran38K, not PhysicEdit.

(c) Same-data framework comparison: +1.20 points. PhysFlow outperforms image-pair SFT on identical PhysTrace pairs with matched generator LoRA and 537 generator updates (Response 1).

Training conditions (Tables 4 and 9). PICA100K SFT uses 4,926 updates versus 537 for PhysTrace SFT; PhysFlow uses 4,632 on PhysicTran38K versus 1,790 on PhysTrace. These comparisons support PhysTrace's usefulness under both strategies but do not isolate dataset quality from training procedure or budget. PhysFlow also adds planner capacity and training.
<!-- reply:sft-dataset:end -->

### Response 3: Frame sampling, state count, and compression

> time-uniform 采用作者提供的重跑结果：作者确认与 change-uniform 使用相同数据集设置，Overall 55.09 vs. 56.32，差 1.23 个百分点；完整类别数据见下表。固定四个中间状态，比较每状态 1、2、4 个视觉 token；token 消融结果先留空；直接压缩已核验为 54.52，完整分项已填入，与论文渐进压缩模型 56.32 对比。

<!-- reply:sampling:start -->
**Response 3: Frame sampling, token count, and compression**

Thank you for identifying these missing ablations. We have added a time-uniform sampling comparison.

Change-uniform sampling selects four frames at equal cumulative visual-change intervals using normalized DINOv2, optical-flow, and pixel-change scores (Appendix A.2). We compare time-uniform sampling under the same PhysTrace settings on PICABench-Superficial:

|Sampling|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Time-uniform|53.72|63.06|59.30|58.24|43.29|46.21|62.35|53.65|55.09|
|Change-uniform|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

Change-uniform improves Overall by 1.23 points, winning six categories; time-uniform wins reflection and refraction. This single-run result supports change-uniform sampling under the tested configuration (Appendix C.7).

Draft: intermediate visual-token count (results pending).

We fix four intermediate states and compare 1, 2, or 4 tokens per state, retaining two textual tokens and a separate 16-token final visual block.

PICABench-Superficial accuracy (%):

|Tokens per state|Total intermediate tokens|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|1 (default)|4||||||||||
|2|8||||||||||
|4|16||||||||||

[Result summary to be added.]

Progressive versus direct compression.

Both use two textual and four intermediate latent tokens plus a 16-token final visual block. The progressive row is the paper's full model.

PICABench-Superficial accuracy (%):

|Compression strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Direct compression|52.84|63.83|55.68|56.31|42.54|46.85|62.40|53.96|54.52|
|Progressive compression (paper)|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

The reported progressive model scores 1.80 points higher; these are single-run results.
<!-- reply:sampling:end -->

### Response 4: Latent-token roles and supervision

<!-- reply:latent-definition:start -->
**Response 4: Latent-token roles and supervision**

Thank you for asking how the intermediate visual tokens relate to physical state transitions. We first clarify their intended roles and supervision; Response 5 then presents the representation analyses and controlled interventions.

The six-token sequence Z = [h, l, m₁, m₂, m₃, m₄] assigns h and l to high-level physical rationales and low-level transition descriptions, and m₁ through m₄ to ordered intermediate visual states. A separate final visual block F contains 16 tokens.

In Stage I, each 16-token intermediate block aligns with its frame encoding from a moving-average teacher. Stage II replaces these blocks sequentially with single latent tokens and removes each replaced block's direct alignment loss. Later uncompressed blocks, final-block alignment, and the flow-matching loss supervise the compressed states. After all replacements, final-block alignment and flow matching remain (Section 3.4). These objectives define intended roles; physical-state correspondence requires empirical evidence.
<!-- reply:latent-definition:end -->

### Response 5: Physical information in the latent representations

> 2026-11-09：已同步最终 Figure 7 四联图。a：原角色聚类支持压缩后的角色组织；b：六领域线性探针平衡准确率 86.91%；c：十一项探索中的七项展示子集，统一报告配对准确率；Phase change 为固定读出器在 256 对／128 新家族上的独立确认，其余六项各 128 对／64 家族；d：保留 64 例编辑顺序干预。全部十一项、强对照、阴性结果和逐 token 对齐未成立的结论保留。v14 结果与对照快照、确认集审计。

> 6 号 H100 补充分析已完成，见 完整报告。validation212 拟合、test212 检索：共享线性读出 29.83% vs 位置原型 29.25%，配对增益 95% CI 为 −1.30 至 +2.36 pp。扩展判别式探索为 48.23% vs 位置 46.11%（+2.12 pp，名义 CI +0.24 至 +4.13 pp），但源图与终态控制为 48.00%/48.58%，对应配对优势未成立。现有证据仍不足以支持逐 token 的物理状态对应。分析完成不等于正面主张成立；所有历史结果保留。

> 6 号新增物理类别与亮度分析，见 报告与三组图件。原始 taxonomy 为六领域、26 细类，另有八类 PICA 标签。六领域平衡准确率 86.91% vs 源图加指令 76.28%（配对增益名义 CI +4.10 至 +17.90 pp）；同布局预训练对照为 85.94%，与 PhysFlow 的差异未确立。82 个照明测试视频的亮度变化读出 R²=0.370，指令 TF-IDF 为 0.365，预训练为 0.402。可主张压缩 latent 保留了可读出的物理类别与视觉变化信息；训练获得额外物理规律、逐状态对齐与因果物理作用仍缺证据。所有结果属于探索性后续分析。

<!-- reply:latent-representation:start -->
**Response 5: Physical information in the latent representations**

We appreciate your careful distinction between sensitivity to token order and evidence of physically meaningful representations. Following your suggestion, we have expanded Figure 7 with representation analyses and controlled intervention tasks.

(a) Token-role structure. The original clustering visualization supports role-dependent representation structure after compression.

(b) Physical-domain linear probe. We fit and cross-validate on 212 PhysTrace videos and test on 212 independent videos. The six latent tokens yield 86.91% balanced accuracy across six domains (16.67% chance), versus 85.94% for the same-layout pretrained control and 86.79% for the low-level text token. These controls limit attribution to PhysFlow training.

(c) Physical-intervention prediction. We freeze PhysFlow and fit linear ridge readouts on its four intermediate visual tokens, choosing pooling and regularization on validation data. Each synthetic source image receives two intervention instructions with opposite reference outcomes. Idealized rules define the labels; source images can display material or temperature cues. Each task uses 128 training, 32 validation, and 64 initial-test scene families. Each family supplies two source images and two instructions per image.

Pair accuracy requires both outcomes for the same image to be correct. Randomly assigning the two opposite outcomes gives 50% chance; independent binary guesses give 25%. Panel (c) displays the following seven tasks:

|Task|Pair accuracy (%)|Test pairs / families|95% CI (%)|
|---|---:|---:|---|
|Support|99.22|128 / 64|97.66 to 100.00|
|Torque|100.00|128 / 64|100.00 to 100.00|
|Buoyancy|99.22|128 / 64|97.66 to 100.00|
|Outflow|96.09|128 / 64|92.19 to 99.22|
|Absorption|99.22|128 / 64|97.66 to 100.00|
|Phase change (confirmation)|100.00|256 / 128|100.00 to 100.00|
|Shape recovery (rubber/clay)|91.41|128 / 64|86.72 to 96.09|

Phase change uses 128 fresh confirmation families with the validation-selected probe fixed. Intervals use 5,000 family-bootstrap draws; perfect empirical scores yield degenerate intervals, leaving population accuracy uncertain.

The seven displayed tasks form an illustrative subset of eleven exploratory tasks. The other pair accuracies are collision 50.00%, magnetic poles 28.91%, spring direction 31.25%, and foam recovery 68.75%. We retain all results and controls. This exploratory selection provides illustrative evidence with limited coverage of physical phenomena. Several tasks also reach 100% with textual latent probes or source-image probes using separate weights for each intervention condition. On phase-change confirmation, this source control reaches 91.80%, the source-and-instruction prefix reaches 92.19%, and both textual latent probes reach 100%.

(d) Visual-token perturbation. On 64 PICABench-Superficial inputs, eight per category, Qwen2.5-VL-72B-Instruct gives mean accuracies of 57.36% for the original condition, 55.64% for masking, and 53.94% for both reversal and shuffling. Perturbations occur after planning, with textual and final-visual conditioning fixed. Reversal and shuffling each reduce accuracy by 3.42 percentage points, supporting order sensitivity.

These results support physical-semantic and conditional-consequence readout and order-sensitive editing. The diagnostic scenes are synthetic; token-to-frame alignment, internal physical-law computation, and causal mediation through the generator remain unestablished.
<!-- reply:latent-representation:end -->

附件（v15）：[Overleaf 替换包 ZIP](attachments/physflow-latent-appendix.zip) · [LaTeX 片段](attachments/latent-representation-analysis.tex) · [四联图 PDF](attachments/latent-analysis-four.pdf) · [单页附录预览 PDF](attachments/latent-appendix-preview.pdf)。

### Response 6: Statistical uncertainty and repeated runs

> 已有统计回复草稿。待生成 seeds、配对 CI 和训练 seeds；物理评测范围见下方独立回复。

<!-- reply:statistics:start -->
**Response 6: Statistical uncertainty and repeated runs**

Thank you for emphasizing the need to quantify uncertainty, particularly for the modest absolute gains on RISEBench.

The main tables report increases of 2.06 percentage points on PICABench and 1.38 points on RISEBench over the backbone. These are point estimates under the reported evaluation settings. Their uncertainty across training runs and evaluation samples requires repeated runs and confidence intervals.

Draft: repeated training seeds (results pending).

Training seed IDs, number of completed runs, and fixed evaluation settings: [to be filled].

|Method|Training runs|PICABench mean ± SD (%)|RISEBench mean ± SD (%)|
|---|---:|---:|---:|
|PhysTrace image-pair SFT||||
|Full PhysFlow||||

Draft: paired statistical comparison (results pending).

Seed type, comparison baseline, and confidence-interval procedure: [to be filled].

|Benchmark|Paired difference (pp)|95% confidence interval|
|---|---:|---|
|PICABench-Superficial|||
|RISEBench|||

[Result summary to be added.]
<!-- reply:statistics:end -->

### Response 7: Multimodal-model evaluation and human evidence

> 状态：按作者确认的两点组织：PICABench 预设物理检查问题和参考答案，VLM 检查可见结果；17 人、100 对样本的 human study 从整体结果提供支持。未声称逐样本人机一致率或对物理规律的完备验证。13 号实验安排与完成状态不变。

<!-- reply:physical-evaluation:start -->
**Response 7: Multimodal-model evaluation and human evidence**

Thank you very much for raising this concern about objective physical correctness. We appreciate your emphasis on the physical basis of our evaluation.

(1) PICABench specifies physical criteria for each editing example. Its PICAEval protocol uses human-annotated regions and manually reviewed yes/no questions about physical consequences, such as whether object removal also removes its shadow. A vision-language model (VLM) answers these questions by inspecting the edited image, and accuracy measures exact agreement with predefined reference answers. Thus, the benchmark's task design and annotations specify the physical requirements, while the VLM checks their visible consequences ([PICABench, Section 3.3 and Appendix A.3](https://arxiv.org/html/2510.17681v3#S3.SS3)).

(2) Our human study provides complementary evidence. We ask 17 participants to compare PhysFlow with five competing methods on 100 image-instruction pairs randomly sampled from PICABench and RISEBench. Participants favor PhysFlow in physical plausibility. This overall trend is consistent with our benchmark findings and provides human support for improved physical plausibility.
<!-- reply:physical-evaluation:end -->

### Response 8: Originality and positioning relative to closely related approaches

> 作者已确认本版：说明文字物理约束与视觉状态的联合内化动机，比较 Monet、EndoCoT 和 PhysicEdit，说明 PhysTrace 的作用；首次主张限定为 physics-aware image editing 中的联合内化。直接压缩消融仍待结果。

<!-- reply:r2-method-contribution:start -->
**Response 8: Originality and positioning relative to closely related approaches**

Thank you very much for carefully examining the originality of our work. We acknowledge the inspiration from prior work on progressive chain-of-thought internalization, continuous latent reasoning, and visual feature prediction. PhysFlow contributes a joint internalization framework that turns textual physical reasoning and visual state transitions into a continuous latent plan for image editing. We clarify its motivation and methodological distinctions below.

(1) Textual physical reasoning guides visual evolution. Textual rationales describe physical relations and causal dependencies; intermediate visual states describe their consequences. PhysFlow progressively internalizes both into a continuous latent sequence in which textual latents guide subsequent visual latents before image generation (Sections 3.3 and 3.4).

(2) Our internalization procedure differs from the closely related approaches. [Monet](https://arxiv.org/html/2511.21395v2#S3) retains text-latent interleaved reasoning for textual answers. [EndoCoT](https://arxiv.org/html/2603.12252v1#S4.SS2) iteratively refines latent states and uses textual reasoning to align the terminal state. PhysFlow progressively replaces both explicit textual rationales and ordered intermediate visual blocks with latent tokens. As each intermediate visual block becomes a latent token, we remove its direct alignment loss and continue training through downstream visual and image-generation objectives. This curriculum teaches the planner to use compressed textual and visual information together. [PhysicEdit](https://arxiv.org/html/2602.21778v1#S3.SS3) retains explicit textual reasoning and updates its transition queries exclusively through its visual transition loss. In PhysFlow, the final-image generation loss also propagates through the frozen generator into the planner during internalization, directly training the latent plan for its use in editing (Section 3.4).

(3) PhysTrace supplies process supervision. Its 11,448 synthetic trajectories pair hierarchical physical rationales, ordered intermediate visual states, and editing targets for this curriculum (Section 3.2).

To our knowledge, PhysFlow is the first framework to jointly internalize textual physical reasoning and intermediate visual state transitions into a unified continuous latent plan for physics-aware image editing.
<!-- reply:r2-method-contribution:end -->

### Response 9: Training and evaluation data sources

> 状态：回复已完成并接入，按作者要求勾选 checklist 的 data-split 项。下段说明 PICA-100K 与 PICABench 的构建方式及用途。合稿核验备注：原稿最终版本与本轮 +899 补实验版本仍需分别对应实际训练清单、checkpoint 和检查记录；来源说明不等同于跨集近重复审计。

<!-- reply:data-split:start -->
**Response 9: Training and evaluation data sources**

Thank you for raising the question of training and evaluation data separation. We have clarified the construction sources and the respective roles of PICA-100K, PhysTrace, and PICABench in Section 3.2 and Appendix A.

PICA-100K provides training data, while PICABench provides a separately curated evaluation set of 900 editing examples (Pu et al., [Sections 3.1 and 3.2](https://arxiv.org/html/2510.17681v3#S3.SS2), and [Section 3.4](https://arxiv.org/html/2510.17681v3#S3.SS4)). The authors collect PICABench evaluation images from licensed and public sources and construct PICA-100K from generated source images and synthetic videos. We start constructing our PhysTrace training dataset with PICA-100K image-instruction pairs (Section 3.2 of our manuscript).
<!-- reply:data-split:end -->

### Response 10: Parameter count, peak memory, and latency

> 状态：实验完成，已接入回复。对应 checklist：parameters-memory。全部数值采用作者本轮确认表格。

<!-- reply:cost:start -->
**Response 10: Parameter count, peak memory, and latency**

Thank you for suggesting parameter-count and peak-memory comparisons in addition to latency. We have added these measurements to Table 5 to give a fuller account of inference costs.

We count the parameters resident during inference, including reasoning modules, and report peak allocated GPU memory. Parameter counts and peak allocated memory describe the current implementations; the latency column reports separate timing measurements.

|Method|Params (B)|Memory (GiB)|Latency (s)|
|---|---:|---:|---:|
|Qwen-Image-Edit|28.85|58.06|44.34|
|PhysicEdit|29.00|56.25|52.19|
|Step1X-Edit|20.82|41.34|59.18|
|Qwen-Image-Edit + explicit reasoning|28.85|58.06|60.12|
|ChronoEdit|22.83|54.81|228.68|
|PhysFlow (Ours)|28.87|58.11|49.39|

PhysFlow uses 28.87 billion parameters and 58.11 GiB peak memory, compared with 28.85 billion parameters and 58.06 GiB for Qwen-Image-Edit. Its latency increases from 44.34 to 49.39 seconds per edit, an 11.4% overhead. The revised efficiency table includes this comparison.

Thank you again for the time and care you have devoted to our work. Your detailed feedback has helped us strengthen the experiments and explain the method and its evidence more clearly.
<!-- reply:cost:end -->

## Reviewer xuAm

### R3-Q1: Method contribution

> 状态：EndoCoT / Monet 的 discussion 已成稿并接入 HTML。1 号同数据 SFT 与 2 号终态监督结果已接入；2 号已补完整分项表并区分新跑结果与论文报告值，11 号直接压缩结果待接入。

<!-- reply:method-contribution:start -->
Thank you for asking us to clarify the contribution. PhysFlow internalizes the connection between physical explanations and visual evolution into a latent plan for image editing. Textual rationales explain the physical rules and transition steps; intermediate visual states supervise how those steps change the scene. Our curriculum progressively compresses both into a continuous plan that conditions image generation (Sections 3.3 and 3.4).

Relative to EndoCoT, our distinction lies in how explicit process supervision becomes a latent plan. EndoCoT trains recurrent thought states with intermediate image-generation losses and terminal textual grounding, then shifts optimization to the terminal step. [EndoCoT, Section 4.2](https://arxiv.org/html/2603.12252v1#S4.SS2). PhysFlow first learns explicit textual rationales and visual trajectories, then progressively replaces their textual and visual blocks with latent tokens. Text-derived states precede and condition subsequent visual states, while downstream visual and editing losses train the compressed sequence. This curriculum teaches the planner to carry physical explanations forward into visual evolution as explicit reasoning disappears.

Relative to Monet, we train the latent plan through the image transformation it guides. Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning for textual answers. [Monet, Section 3](https://arxiv.org/html/2511.21395v2#S3). PhysFlow jointly compresses textual rationales and visual trajectories, and propagates the image-generation loss through the generator to train the plan. The plan therefore receives supervision from both the physical process and the edited outcome. Responses 3 and 4 report the same-data SFT and terminal-only controls.
<!-- reply:method-contribution:end -->

### R3-Q2: Identity of the no-reasoning baseline and same-data source-target fine-tuning

> 状态：已接入 1 号 PICABench 同数据 SFT 结果；RISE 补测由 15 号追加。完整方法与 SFT 的生成器配置及更新数一致，总训练量不同。

<!-- reply:sft-baseline:start -->
The 54.26 row in Table 3 reports the original Qwen-Image-Edit-2511 backbone. The revised caption explicitly identifies it as “Original backbone” and states that it has no PhysTrace fine-tuning. We have now added a baseline fine-tuned on the same PhysTrace source-target pairs. The table reports PICABench-Superficial accuracy (%):

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|PhysTrace image-pair SFT|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|PhysFlow|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

Image-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates.

Together, these results support PhysTrace as an effective training dataset and show that PhysFlow's latent reasoning framework provides additional gains beyond fine-tuning on the same source-target pairs.
<!-- reply:sft-baseline:end -->

### R3-Q3 / R2: Terminal-only supervision

> 2026-11-08 22:35 PST：2 号最终结果已独立核验，Overall 55.57；900 张与 4,112 QA 完整。该对照保留六个 recurrent latent tokens、16-token final visual block 和可训练模块，使用 planner 1,253 与 generator 537 更新。分项表对比本轮 55.57 与论文完整模型报告值 56.32；差 0.75 pp。实验与回复保持完成；作者已确认完整模型与本轮对照使用同一版训练数据；11 号直接压缩已完成核验，54.52；下表与论文主模型 56.32 比较，并非共用初始化的新配对复训。详见 最终结果记录及 独立核验。

<!-- reply:terminal-only:start -->
Following your suggestion, we retain the same recurrent latent tokens, final visual block, and trainable modules, but train using only terminal visual supervision and the generation loss. This control uses 1,253 planner updates and 537 generator updates. The table compares this new run with the full PhysFlow results reported in the paper.

Editing accuracy (%) on PICABench-Superficial, evaluated with Qwen2.5-VL-72B-Instruct; higher is better.

| Training strategy | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Terminal-only supervision | 53.84 | 64.48 | 57.73 | 59.18 | 42.57 | 46.68 | 63.59 | 55.71 | 55.57 |
| Full PhysFlow | 54.45 | 65.19 | 58.52 | 57.99 | 44.91 | 47.31 | 64.32 | 56.43 | 56.32 |

Full PhysFlow achieves 0.75 percentage points higher overall accuracy. Terminal-only scores higher on refraction (59.18 versus 57.99). These single-run scores compare training configurations as a whole; isolating contributions from individual supervision terms and the compression curriculum requires further controls.

Progressive versus direct compression.

Both use two textual and four intermediate latent tokens plus a 16-token final visual block. The progressive row is the paper's full model.

PICABench-Superficial accuracy (%):

|Compression strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Direct compression|52.84|63.83|55.68|56.31|42.54|46.85|62.40|53.96|54.52|
|Progressive compression (paper)|54.45|65.19|58.52|57.99|44.91|47.31|64.32|56.43|56.32|

The reported progressive model scores 1.80 points higher; these are single-run results.
<!-- reply:terminal-only:end -->

### R3-Q4: PhysicEdit comparison

> 状态：已针对 Reviewer 3 单独组织回复；PhysFlow（2509）正在运行，结果与比较结论待补。

<!-- reply:r3-physicedit:start -->
Thank you for pointing out that our comparison using PhysicTran38K does not constitute a direct comparison with PhysicEdit. The score of 53.82 in Tables 4 and 9 corresponds to PhysFlow trained on PhysicTran38K, rather than PhysicEdit itself. We agree that this dataset comparison alone does not establish an advantage over PhysicEdit.

To address this concern, we have added a direct comparison with PhysicEdit on PICABench-Superficial, evaluated with Qwen2.5-VL-72B-Instruct. The table includes our results with Qwen-Image-Edit-2511.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit | 51.62 | 61.63 | 51.56 | 52.96 | 44.03 | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509; pending) | | | | | | | | | |
| PhysFlow (2511) | 54.45 | 65.19 | 58.52 | 57.99 | 44.91 | 47.31 | 64.32 | 56.43 | 56.32 |

Beyond this empirical comparison, we have also expanded the discussion in Section 2.2 to clarify the methodological differences. PhysicEdit learns latent visual transition priors from videos and combines them with explicit textual reasoning to guide image editing. PhysFlow couples textual physical reasoning with visual evolution in a continuous latent plan. Text-derived latent states guide subsequent visual transitions, while downstream visual supervision and editing losses train these text-derived latent states to retain information useful for image generation. Our progressive compression curriculum internalizes explicit physical rationales and intermediate visual states into this coupled reasoning process. The resulting plan connects physical explanations to their visual consequences and guides image editing without decoding textual rationales or intermediate images at inference.
<!-- reply:r3-physicedit:end -->

### R3: Further analysis of general editing performance

> 状态：回复及论文对应表述已完成并同步，checklist 已勾选。新增 Hybrid／Extract 任务要求与物理过程监督的区别，使用 “We interpret” 表明作者解释；Add 仅报告数值。候选案例与 Table 6 权重／逐样本评分尚未对应，不作为下降原因的证据。

<!-- reply:general-editing:start -->
Thank you for encouraging us to examine the category-level results more closely and explore why some categories decline despite broadly maintained overall general editing performance. Table 6 reports an overall ImgEdit-Bench score of 4.39 for PhysFlow and 4.41 for Qwen-Image-Edit-2511. PhysFlow scores higher in six of nine categories, while the largest declines occur in Hybrid (3.76 to 3.26) and Extract (4.16 to 3.91), with a smaller decrease in Add (4.45 to 4.26).

We interpret the declines in Hybrid and Extract as task-dependent transfer from physical-process supervision. PhysTrace emphasizes causally connected state evolution within a physical process through textual rationales and intermediate visual states (Sections 3.2 to 3.4). Hybrid combines separately specified editing operations within one instruction, whereas Extract requires isolating a subject while preserving its identity and visual details. This difference in task focus may help explain why improvements in physical-process editing do not transfer uniformly to Hybrid and Extract.

We have revised Appendix C.1 to report these category-level declines alongside the improvements. The revised text describes broadly maintained overall performance while explicitly acknowledging the lower scores in Hybrid, Extract, and Add.
<!-- reply:general-editing:end -->

