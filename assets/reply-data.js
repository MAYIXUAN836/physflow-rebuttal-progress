window.PHYSFLOW_REPLIES = {
  "schemaVersion": 1,
  "characterLimit": 5000,
  "limitVerifiedForVenue": false,
  "limitSource": "https://docs.openreview.net/reference/default-forms/default-comment-form",
  "authorGuide": "https://iclr.cc/Conferences/2027/AuthorGuidelines",
  "reviewSnapshot": "作者提供的评审原文（2026-11-06 版本）",
  "reviewers": [
    {
      "code": "8uwk",
      "name": "Reviewer 1",
      "url": "https://openreview.net/revisions?id=BRyx8ILvaP",
      "original": "Official Reviewby Reviewer 8uwk24 Oct 2026, 22:02 (modified: 06 Nov 2026, 04:21)Everyone[Revisions](https://openreview.net/revisions?id=BRyx8ILvaP)\nPaper Summary:\nThis paper proposes using additional supervision from text and video to train a compact latent planner to improve the physical understanding of current image editing models. This paper also curates a new dataset of synthetic transformation trajectories with reasoning annotations and intermediate frames. The proposed method improves performance on both PICABench and RISEBench without degrading general editing performance too much.\nPresentation: 3: Clear and easy to follow.\nInformativeness: 2: I learned something interesting or useful.\nSoundness: 2: I have minor or fixable concerns about the paper’s soundness.\nCritical Strengths:\n- I like the motivation behind using both textual explanation and visual trajectory since they are complementary. Text is good at representing \"why it will change,\" while visual state is good at representing \"what the change looks like\". Besides, this paper considers the latency at deployment and only brings about 11% increase at inference time.\n- The experiments are very comprehensive. This paper presents not only the main comparison on PICABench and RISEBench, but also multiple ablations to validate the effectiveness of each design choice.\nCritical Weaknesses:\n- The main issue is that the core idea of this paper, i.e., curating synthetic video trajectory and textual explanation and encoding them into an implicit visual representation to improve the physical understanding of image editing models, is highly similar to the PhysicEdit [1] paper. However, this paper doesn't include any discussion about the similarity of the high-level idea or comparisons between these papers.\n[1] Zhao, Liangbing, et al. \"From Statics to Dynamics: Physics-Aware Image Editing with Latent Transition Priors.\" arXiv preprint arXiv:2602.21778 (2026).\nQuestions For Authors:\n- Please refer to the weakness section.\nFlag For Ethics Review: No\nRating: 2: Weak rejection\nConfidence: 4: I have substantial direct research experience on this topic.",
      "items": [
        {
          "id": "physicedit",
          "title": "与 PhysicEdit 的区别和方法级比较",
          "subject": "Relationship to PhysicEdit and method-level comparison",
          "comments": [
            {
              "label": "Weakness 1",
              "text": "- The main issue is that the core idea of this paper, i.e., curating synthetic video trajectory and textual explanation and encoding them into an implicit visual representation to improve the physical understanding of image editing models, is highly similar to the PhysicEdit [1] paper. However, this paper doesn't include any discussion about the similarity of the high-level idea or comparisons between these papers.\n[1] Zhao, Liangbing, et al. \"From Statics to Dynamics: Physics-Aware Image Editing with Latent Transition Priors.\" arXiv preprint arXiv:2602.21778 (2026)."
            }
          ],
          "analysis": "先认可 PhysicEdit 的共同动机，再强调将层次化文本与有序视觉过程压缩为连续 latent plan 的训练设计。补入 56.32 vs. 52.35 和效率结果，同时注明 2511/2509 骨干差异；53.82 是 PhysFlow 换数据集的成绩。延迟较低不代表显存也更低。",
          "source": {
            "block": "r1"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "Thank you for highlighting PhysicEdit. We appreciate its use of video-derived transition priors to guide physical image editing without rendering intermediate videos at inference. We agree that our original discussion should have made this connection explicit, and we will expand the related-work discussion accordingly.\n\n**Our contribution is the progressive internalization of textual and visual process supervision into a continuous latent plan.** PhysicEdit combines an explicit textual reasoning trace at inference with video-supervised transition queries. PhysFlow progressively compresses high-level physical rationales, low-level transition descriptions, and ordered intermediate visual blocks into six latent tokens. These tokens condition the image generator together with a separate 16-token final visual block. This design internalizes the textual reasoning as well as the visual process, so inference uses the compact latent plan without decoding a textual reasoning trace. We will clarify this distinction in Sections 2 and 3. [PhysicEdit, Section 3.3](https://arxiv.org/html/2602.21778v2#S3.SS3).\n\n**The added method-level comparison reports 56.32 for PhysFlow and 52.35 for PhysicEdit.** We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report both backbones below. We report scores on a 0 to 100 scale and gains in percentage points.\n\n| Method | Backbone | Overall | Gain over own backbone |\n|---|---|---:|---:|\n| Qwen-Image-Edit-2509 | Qwen-Image-Edit-2509 | 49.71 | N/A |\n| PhysicEdit | Qwen-Image-Edit-2509 | 52.35 | +2.64 |\n| Qwen-Image-Edit-2511 | Qwen-Image-Edit-2511 | 54.26 | N/A |\n| **PhysFlow (Ours)** | Qwen-Image-Edit-2511 | **56.32** | **+2.06** |\n\nPhysFlow achieves a 3.97-point higher overall score and higher scores in all eight categories. Both methods improve on their respective backbones. The different backbones make this a comparison of complete systems; isolating the contribution of each method requires a matched-backbone control. We also clarify that the existing 53.82 entry in Tables 4 and 9 refers to PhysFlow trained on PhysicTran38K; the new 52.35 entry evaluates PhysicEdit itself.\n\n**PhysFlow also has lower latency in the reported cost comparison.**\n\n| Method | Params (B) | Memory (GiB) | Latency (s) |\n|---|---:|---:|---:|\n| PhysicEdit | 29.00 | 56.25 | 52.19 |\n| **PhysFlow (Ours)** | **28.87** | **58.11** | **49.39** |\n\nThe resource and timing measurements come from separate runs. In these reported results, PhysFlow takes 2.80 fewer seconds per edit, a 5.4% latency reduction, while using 1.86 GiB more peak memory. These measurements show a latency advantage with a memory trade-off. We will include the method-level results and cost comparison in the revised manuscript.",
          "revision": "2effe5300e1aa996"
        }
      ]
    },
    {
      "code": "62MG",
      "name": "Reviewer 2",
      "url": "https://openreview.net/revisions?id=knee2i7IIY",
      "original": "Official Reviewby Reviewer 62MG19 Oct 2026, 09:33 (modified: 06 Nov 2026, 04:21)Everyone[Revisions](https://openreview.net/revisions?id=knee2i7IIY)\nPaper Summary:\nThis paper presents PhysFlow, a physics-aware image editing framework that integrates high-level physical reasoning, low-level transformation planning, and intermediate visual evolution into a compact sequence of continuous latent thoughts. The framework adopts a three-stage training curriculum to progressively internalize explicit textual and visual reasoning into six latent tokens, which subsequently guide a pretrained image generator. The authors additionally construct PhysTrace, a dataset of 11,448 synthetic physical transformation trajectories with hierarchical reasoning annotations and intermediate visual states.\n\nThe paper addresses a meaningful problem and presents a coherent technical framework. Experiments on PICABench and RISEBench demonstrate consistent improvements over the Qwen-Image-Edit-2511 backbone, with relatively modest inference overhead. However, the central methodological contribution is not yet fully isolated from improvements attributable to additional training data, generator adaptation, and training procedures. Stronger controlled experiments and more direct validation of the proposed physical reasoning mechanism would substantially strengthen the paper.\nPresentation: 2: Generally understandable, but requires substantial effort in places.\nInformativeness: 2: I learned something interesting or useful.\nSoundness: 2: I have minor or fixable concerns about the paper’s soundness.\nCritical Strengths:\nWell-motivated research problem. The paper identifies meaningful limitations of text-only reasoning and video-based intermediate-state generation for physics-aware image editing. The proposed continuous representation provides a plausible approach to combining causal planning with visual transformation information while reducing inference overhead.\n\nCoherent framework and training curriculum. The three-stage procedure connecting explicit supervision, progressive internalization, and generator adaptation is clearly described (Sections 3.3–3.4; Figure 2). PhysTrace also provides structured textual and visual supervision across multiple physical domains (Section 3.2; Appendix A).\n\nConsistent empirical improvements. PhysFlow improves PICABench-Superficial accuracy from 54.26% to 56.32% and RISEBench accuracy from 8.06% to 9.44% relative to its backbone (Tables 1–2). Component ablations, alternative evaluators, and qualitative comparisons provide additional support for the method (Table 3; Appendix Tables 7–8; Figures 3 and 6). The inference latency increases by only approximately 11.4% relative to the backbone, while remaining lower than the reported explicit-reasoning and video-based alternatives (Table 5).\nCritical Weaknesses:\n1. Insufficient isolation of the contribution of latent reasoning.\nThe proposed method simultaneously introduces continuous latent reasoning, a curated PhysTrace dataset, a three-stage training curriculum, and additional generator adaptation using rank-512 LoRA (Sections 3.2–3.4; Appendix B). Although Table 3 evaluates textual and visual reasoning components separately, it does not clearly establish whether the improvements persist against a non-reasoning editor trained on exactly the same PhysTrace data with identical generator adaptation, optimization budget, and trainable capacity.\n\nThis comparison is essential for distinguishing the contribution of continuous latent physical reasoning from gains obtained through additional supervision, higher-quality training data, or generator fine-tuning.\n\nFurthermore, the dataset comparison in Table 4 and Appendix Table 9 does not fully isolate dataset quality. In particular, PICA100K-SFT uses a different supervision and training procedure, while the trajectory-based comparison uses different numbers of optimization steps. The results support the usefulness of PhysTrace but do not conclusively establish the independent contribution of its proposed supervision design.\n2. Limited validation of the proposed reasoning mechanism.\nThe core claim is that continuous latent thoughts internalize physically meaningful causal dependencies and intermediate visual evolution. However, several important aspects of this mechanism remain insufficiently validated.\n\nFirst, the change-uniform frame sampling strategy is motivated in Appendix A.2 but is not quantitatively compared with ordinary temporal-uniform sampling. Second, the choice of four intermediate visual states and the proposed progressive compression sequence are not systematically ablated against alternative token counts or direct compression strategies.\n\nAppendix Figure 7 provides a useful intervention study. Reversing or shuffling the intermediate visual tokens decreases physical-question accuracy by approximately 3.42 percentage points on 64 examples. Nevertheless, this result primarily demonstrates that the model is sensitive to the ordering of its learned representations. It does not establish that the latent tokens encode physically meaningful intermediate states or that their ordering corresponds to valid physical evolution.\n\nAdditional representation-level analyses and controlled interventions would provide stronger evidence for the proposed interpretation.\n3. Relatively modest performance gains and limited statistical validation.\nAlthough PhysFlow consistently improves upon its backbone, the absolute gains remain relatively modest. For example, RISEBench accuracy increases from 8.06% to 9.44% (Table 2), corresponding to approximately five additional successful examples out of roughly 360, as inferred from the reported category-level results.\n\nThe paper does not report repeated-run variance or confidence intervals for its main benchmark comparisons. Therefore, the robustness of these improvements across training seeds and evaluation samples remains unclear.\n\nMoreover, the central claims concern physical consistency, yet the main evaluations largely rely on multimodal-model judgments. The additional GPT-based evaluations in Appendix Tables 7–8 help address possible Qwen-family evaluator bias, but they do not independently establish objective physical correctness.\n\nEvaluations targeting measurable physical constraints, together with difficult cases and failure analysis, would provide stronger support for the claimed improvements in physical reasoning.\n4. Originality and positioning relative to closely related approaches.\nThe integration of textual and visual latent reasoning for image editing is interesting. Nevertheless, several underlying mechanisms, including progressive CoT internalization, continuous latent reasoning, and visual feature prediction, have already been explored in related work (Section 2.3).\nQuestions For Authors:\nCan the authors provide a controlled baseline using identical PhysTrace data, generator LoRA configuration, and training budget, but without continuous latent reasoning? How much of the reported improvement remains attributable specifically to the latent reasoning mechanism?\n\nCan the authors provide stronger evidence that the learned intermediate visual tokens represent physically meaningful state transitions? For example, can their representations be aligned with actual intermediate states or evaluated under controlled physical interventions?\n\nCan the authors clarify how PhysTrace samples are separated from the PICABench evaluation examples, including any source-image or near-duplicate overlap checks? Can they also provide a parameter-count and peak-memory comparison to complement the latency measurements?\nFlag For Ethics Review: No\nRating: 3: Weak acceptance\nConfidence: 3: I am familiar with this topic and its relevant literature.",
      "items": [
        {
          "id": "same-data",
          "title": "同数据 SFT：收益是否超出数据适配？",
          "subject": "Same-data image-pair SFT baseline",
          "comments": [
            {
              "label": "Question 1",
              "text": "Can the authors provide a controlled baseline using identical PhysTrace data, generator LoRA configuration, and training budget, but without continuous latent reasoning? How much of the reported improvement remains attributable specifically to the latent reasoning mechanism?"
            }
          ],
          "analysis": "原 54.26 是未适配的骨干，新补同 PhysTrace 图像对 SFT 为 55.12，完整方法为 56.32。生成器 LoRA 与 537 次更新一致，但完整方法增加 planner 容量与训练；不能声称已匹配总算力和容量并隔离单一机制。",
          "source": {
            "block": "sft-baseline",
            "drop": [
              " Question 3 compares the terminal-only run with the full PhysFlow results reported in the paper, including the category breakdown and the scope of this training-configuration comparison."
            ]
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "The 54.26 row in Table 3 reports the original Qwen-Image-Edit-2511 backbone. We will label it explicitly as “Original backbone” and state its training status in the caption. We have now added a baseline fine-tuned on the same PhysTrace source-target pairs:\n\n| Configuration | PICABench-Superficial (%) |\n|---|---:|\n| Original Qwen-Image-Edit-2511 | 54.26 |\n| PhysTrace image-pair SFT | 55.12 |\n| Full PhysFlow | 56.32 |\n\nImage-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates. PhysFlow also trains a planner, for 1,790 total updates, so this comparison includes additional capacity and training.",
          "revision": "b9832c8f86729e28"
        },
        {
          "id": "dataset",
          "title": "三组比较：区分数据与训练框架",
          "subject": "Dataset effectiveness and training framework",
          "comments": [
            {
              "label": "Weakness 1",
              "text": "Insufficient isolation of the contribution of latent reasoning.\nThe proposed method simultaneously introduces continuous latent reasoning, a curated PhysTrace dataset, a three-stage training curriculum, and additional generator adaptation using rank-512 LoRA (Sections 3.2–3.4; Appendix B). Although Table 3 evaluates textual and visual reasoning components separately, it does not clearly establish whether the improvements persist against a non-reasoning editor trained on exactly the same PhysTrace data with identical generator adaptation, optimization budget, and trainable capacity.\n\nThis comparison is essential for distinguishing the contribution of continuous latent physical reasoning from gains obtained through additional supervision, higher-quality training data, or generator fine-tuning.\n\nFurthermore, the dataset comparison in Table 4 and Appendix Table 9 does not fully isolate dataset quality. In particular, PICA100K-SFT uses a different supervision and training procedure, while the trajectory-based comparison uses different numbers of optimization steps. The results support the usefulness of PhysTrace but do not conclusively establish the independent contribution of its proposed supervision design."
            }
          ],
          "analysis": "同为 SFT 换数据 +1.74；同为 PhysFlow 换数据 +2.50；同一 PhysTrace 上完整框架相对 SFT +1.20。前两组支持数据有效性，第三组支持框架收益；跨数据集的训练预算差异仍需保留。",
          "source": {
            "block": "sft-dataset"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "**The added PhysTrace image-pair SFT baseline enables three comparisons of dataset effectiveness and the full training framework.** All four configurations use Qwen-Image-Edit-2511. We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report gains in percentage points.\n\n| Training data | Training strategy | Overall (%) |\n|---|---|---:|\n| PICA100K | Image-pair SFT | 53.38 |\n| PhysTrace | Image-pair SFT | 55.12 |\n| PhysicTran38K | PhysFlow | 53.82 |\n| PhysTrace | PhysFlow | 56.32 |\n\n**1. Dataset comparison under image-pair SFT: +1.74 points.** PhysTrace reaches 55.12, compared with 53.38 for PICA100K, using fewer training examples and generator updates. Both configurations use source-target image-pair supervision. This result supports the effectiveness of the PhysTrace image pairs even with direct generator fine-tuning.\n\n**2. Dataset comparison within PhysFlow: +2.50 points.** PhysTrace reaches 56.32, compared with 53.82 for PhysicTran38K, while using the same PhysFlow architecture and curriculum. PhysTrace again achieves a higher score with fewer training examples. The 53.82 row denotes PhysFlow trained on PhysicTran38K. Together, these two comparisons support the usefulness of the smaller PhysTrace dataset under both training strategies.\n\n**3. Framework comparison on the same PhysTrace pairs: +1.20 points.** PhysFlow reaches 56.32, compared with 55.12 for image-pair SFT. This comparison fixes the source-target pairs, rank-512 generator LoRA configuration, and 537 generator updates. It shows that the complete PhysFlow training framework improves on direct adaptation to the same image pairs.\n\n**Training conditions.** Across datasets, PICA100K SFT uses 4,926 updates, PhysTrace SFT uses 537, and PhysFlow uses 4,632 on PhysicTran38K versus 1,790 on PhysTrace. PhysFlow adds planner capacity and training to the matched generator budget. These results compare the reported data and framework configurations. The terminal-only run scores 55.57, 0.75 points below the paper's reported full PhysFlow score of 56.32. We report this difference at the training-configuration level; the direct-compression control will address the curriculum separately. We will organize Tables 4 and 9 and their discussion around these three comparisons.",
          "revision": "f90a93306d9f7cd5"
        },
        {
          "id": "sampling",
          "title": "抽帧、状态数量与直接压缩消融",
          "subject": "Sampling, state count, and compression curriculum",
          "comments": [
            {
              "label": "Weakness 2 · sampling / compression",
              "text": "First, the change-uniform frame sampling strategy is motivated in Appendix A.2 but is not quantitatively compared with ordinary temporal-uniform sampling. Second, the choice of four intermediate visual states and the proposed progressive compression sequence are not systematically ablated against alternative token counts or direct compression strategies."
            }
          ],
          "analysis": "先解释 change-uniform 的动机，以及四个状态只是当前配置。time-uniform 和 K2 在训，K8 待执行，直接压缩暂无结果。新 K2/K8 与复用 K4 存在数据版本差异，拿到结果后也不能称为严格只改变帧数的消融。",
          "source": {
            "section": "R2: Sampling and compression"
          },
          "status": "待补实验结果",
          "pending": true,
          "markdown": "Change-uniform sampling aims to distribute supervision across visible changes in a trajectory. Appendix A.2 combines normalized DINOv2, optical-flow, and pixel-change scores, then selects four intermediate frames that divide cumulative change into approximately equal intervals. This criterion gives more temporal sampling density to portions of a clip with larger measured changes. Its benefit over time-uniform sampling requires a comparison that fixes the videos, endpoints, state count, and training procedure.\n\nWe use four intermediate states as a fixed design choice, which yields four visual reasoning tokens after compression. The existing experiments evaluate this configuration. Selecting the best state count and establishing the benefit of progressive over direct compression require separate ablations. We will make these distinctions explicit when discussing the sampling rule and curriculum.",
          "revision": "0ced54e59005f1d8"
        },
        {
          "id": "latent-definition",
          "title": "六个 latent token 如何定义和监督？",
          "subject": "Latent representation and supervision",
          "comments": [
            {
              "label": "Question 2",
              "text": "Can the authors provide stronger evidence that the learned intermediate visual tokens represent physically meaningful state transitions? For example, can their representations be aligned with actual intermediate states or evaluated under controlled physical interventions?"
            }
          ],
          "analysis": "先定义 2 个文本 token、4 个中间视觉 token 和独立 16-token 终态块，再说明压缩时哪些直接监督被移除。设计角色是训练意图；是否包含物理后果信息由下一点的分析回答。",
          "source": {
            "section": "R2: Latent representation and supervision",
            "before": "latent-representation"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "The six latent thoughts form a learned conditioning sequence Z = [h, l, m₁, m₂, m₃, m₄] ∈ ℝ⁶ˣᵈ, where d is the planner's hidden dimension. The training design assigns h and l to high-level physical rationales and low-level transition descriptions, and assigns m₁ through m₄ to ordered intermediate visual states. The planner additionally predicts F ∈ ℝ¹⁶ˣᵈ, a final visual block. Thus, the additional conditioning consists of six reasoning tokens and 16 final-state tokens.\n\nSection 3.4 specifies how these roles enter training. Stage I aligns each 16-token intermediate block with the corresponding frame encoding from a moving-average teacher. Stage II replaces each intermediate block with one latent token and removes that block's direct alignment loss. Later uncompressed blocks, the final visual block, and the generation objective provide the remaining supervision. After Stage II compresses all intermediate blocks, the final-block alignment and generation objectives supervise the planner. This training defines the intended roles of the latent positions, while their physical-state correspondence remains an empirical question.",
          "revision": "fc0e159c39aa80b2"
        },
        {
          "id": "latent-analysis",
          "title": "物理表征：四组证据分别支持什么？",
          "subject": "Physical semantics, controlled outcomes, and token order",
          "comments": [
            {
              "label": "Weakness 2 · representation evidence",
              "text": "Appendix Figure 7 provides a useful intervention study. Reversing or shuffling the intermediate visual tokens decreases physical-question accuracy by approximately 3.42 percentage points on 64 examples. Nevertheless, this result primarily demonstrates that the model is sensitive to the ordering of its learned representations. It does not establish that the latent tokens encode physically meaningful intermediate states or that their ordering corresponds to valid physical evolution.\n\nAdditional representation-level analyses and controlled interventions would provide stronger evidence for the proposed interpretation."
            }
          ],
          "analysis": "按角色组织、六领域读出、受控后果读出、顺序扰动展开。保留 86.91%、七项展示结果和关键对照，也保留其余四项探索及确认集范围。可支持语义与条件后果可读出，不能等同于逐 token 状态对齐或已证明内部物理推演。",
          "source": {
            "block": "latent-representation"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "**The latent plan exposes physical-domain and conditional outcome information to linear probes; token order also affects editing.** The revised Figure 7 organizes these findings into panels (a) through (d).\n\n**(a) Token-role structure.** The original clustering visualization supports role-dependent representation structure after compression.\n\n**(b) Physical-domain linear probe.** We fit and cross-validate a linear probe on 212 PhysTrace videos and test on 212 independent videos. The two textual and four intermediate visual tokens yield 86.91% balanced accuracy across six domains, compared with 16.67% uniform chance. The same-layout pretrained control reaches 85.94%, and the low-level text token reaches 86.79%. These controls limit attribution of domain information to PhysFlow training.\n\n**(c) Physical-intervention prediction.** We freeze PhysFlow and fit linear ridge readouts on its four intermediate visual tokens, choosing pooling and regularization on validation data. Each synthetic source image receives two intervention instructions with opposite reference outcomes. Idealized rules define the labels; source images can display material or temperature cues. Each task uses 128 training, 32 validation, and 64 initial-test scene families. Each family supplies two source images and two instructions per image.\n\nPair accuracy requires both outcomes for the same image to be correct. Randomly assigning the two opposite outcomes gives 50% chance; independent binary guesses give 25%. Panel (c) displays the following seven tasks:\n\n| Task | Pair accuracy (%) | Test pairs / families | 95% CI (%) |\n|---|---:|---:|---|\n| Support | 99.22 | 128 / 64 | 97.66 to 100.00 |\n| Torque | 100.00 | 128 / 64 | 100.00 to 100.00 |\n| Buoyancy | 99.22 | 128 / 64 | 97.66 to 100.00 |\n| Outflow | 96.09 | 128 / 64 | 92.19 to 99.22 |\n| Absorption | 99.22 | 128 / 64 | 97.66 to 100.00 |\n| Phase change (confirmation) | 100.00 | 256 / 128 | 100.00 to 100.00 |\n| Shape recovery (rubber/clay) | 91.41 | 128 / 64 | 86.72 to 96.09 |\n\nFor phase change, the table uses independent confirmation on 128 fresh families with the validation-selected probe fixed and no retuning. Intervals use 5,000 family-bootstrap draws. Perfect empirical scores produce degenerate bootstrap intervals that describe the observed families; population accuracy remains uncertain.\n\nThe seven displayed tasks form an illustrative subset of eleven exploratory tasks. The other pair accuracies are collision 50.00%, magnetic poles 28.91%, spring direction 31.25%, and foam recovery 68.75%. We retain all results and controls. This exploratory selection provides illustrative evidence with limited coverage of physical phenomena. Several tasks also reach 100% with textual latent probes or source-image probes using separate weights for each intervention condition. On phase-change confirmation, this source control reaches 91.80%, the source-and-instruction prefix reaches 92.19%, and both textual latent probes reach 100%.\n\n**(d) Visual-token perturbation.** On 64 PICABench-Superficial inputs, eight per category, Qwen2.5-VL-72B-Instruct gives mean accuracies of 57.36% for the original condition, 55.64% for masking, and 53.94% for both reversal and shuffling. Perturbations occur after planning, with textual and final-visual conditioning fixed. Reversal and shuffling each reduce accuracy by 3.42 percentage points, supporting order sensitivity.\n\nTogether, these results support physical-semantic and conditional-consequence readout alongside order-sensitive editing. The diagnostic scenes are synthetic. Token-to-frame temporal alignment, internal physical-law computation, and physical causal mediation through the generator require separate evidence.",
          "revision": "cd94be6beb2cb0bf"
        },
        {
          "id": "statistics",
          "title": "提升是否稳定：训练 seeds 与置信区间",
          "subject": "Statistical uncertainty and repeated runs",
          "comments": [
            {
              "label": "Weakness 3 · statistical validation",
              "text": "Although PhysFlow consistently improves upon its backbone, the absolute gains remain relatively modest. For example, RISEBench accuracy increases from 8.06% to 9.44% (Table 2), corresponding to approximately five additional successful examples out of roughly 360, as inferred from the reported category-level results.\n\nThe paper does not report repeated-run variance or confidence intervals for its main benchmark comparisons. Therefore, the robustness of these improvements across training seeds and evaluation samples remains unclear."
            }
          ],
          "analysis": "主表是单次结果，尚不能回答跨训练随机性的稳定性。4 号改变推理 seed，12 号才是重复训练，两者不能替代。均值、标准差及配对置信区间须等实际产物齐全后填写。",
          "source": {
            "section": "R2: Statistical uncertainty"
          },
          "status": "待补统计结果",
          "pending": true,
          "markdown": "We agree that the reported gains require careful interpretation. The main tables report increases of 2.06 percentage points on PICABench and 1.38 points on RISEBench over the backbone. These are point estimates under the reported evaluation settings. Their uncertainty across training runs and evaluation samples requires repeated runs and confidence intervals.",
          "revision": "50b9564db1ed6e82"
        },
        {
          "id": "physical-evaluation",
          "title": "模型评分与客观物理正确性的边界",
          "subject": "Physical evaluation and human evidence",
          "comments": [
            {
              "label": "Weakness 3 · physical correctness",
              "text": "Moreover, the central claims concern physical consistency, yet the main evaluations largely rely on multimodal-model judgments. The additional GPT-based evaluations in Appendix Tables 7–8 help address possible Qwen-family evaluator bias, but they do not independently establish objective physical correctness.\n\nEvaluations targeting measurable physical constraints, together with difficult cases and failure analysis, would provide stronger support for the claimed improvements in physical reasoning."
            }
          ],
          "analysis": "承认更换评审模型不能独立验证物理定律。补充已有 17 人、100 对样本的人工评价及案例。文字回复已完成；新的几何测量是备选补充，当前回复将客观指标作为未来方向，不宣称已有测量结果。",
          "source": {
            "block": "physical-evaluation"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "We thank the reviewer for this thoughtful observation and agree that vision-language model judgments alone do not establish objective physical correctness. The GPT-based evaluations in Tables 7 and 8 address potential evaluator-family bias, and we follow the [PICABench](https://arxiv.org/html/2510.17681v3#S4.SS1) and [RISEBench](https://arxiv.org/html/2504.02826v3#S2.SS2) scoring frameworks for comparable evaluation.\n\nOur user study provides complementary human evidence: 17 participants evaluate 100 randomly sampled image-instruction pairs and favor PhysFlow over five competing methods in physical plausibility. Our case studies also examine visible physical consequences, such as updating reflections after object replacement and deforming a pillow under a dog's weight.\n\nTogether, these results support improved physical plausibility under model and human assessment. We will clarify this scope and discuss physically grounded metrics as a valuable direction for future benchmarks.",
          "revision": "befc0a8b110ed675"
        },
        {
          "id": "positioning",
          "title": "相对 EndoCoT／Monet 的方法贡献",
          "subject": "Positioning relative to EndoCoT and Monet",
          "comments": [
            {
              "label": "Weakness 4",
              "text": "Originality and positioning relative to closely related approaches.\nThe integration of textual and visual latent reasoning for image editing is interesting. Nevertheless, several underlying mechanisms, including progressive CoT internalization, continuous latent reasoning, and visual feature prediction, have already been explored in related work (Section 2.3)."
            }
          ],
          "analysis": "承认 recurrent latent、视觉监督等共享机制，突出过程与终态的表示预算、监督随压缩变化、文本与视觉共同内化。SFT 与终态对照支持训练配置层面的比较；直接压缩尚未完成，课程独立收益仍待证据。",
          "source": {
            "block": "method-contribution"
          },
          "status": "讨论已成稿 · 消融待补",
          "pending": false,
          "markdown": "**PhysFlow learns a compact plan from supervision of both the physical transformation and its outcome.** A target image specifies the desired result; physical rationales and intermediate visual states provide additional supervision about the transformation. Our contribution is a training curriculum that compresses these complementary signals into six latent tokens while retaining a separate 16-token final visual block. This allocates different representation budgets to the transformation and its endpoint, and gives the image generator access to both (Sections 3.3 and 3.4).\n\n**Relative to EndoCoT, we change the representation and its supervision during compression.** EndoCoT establishes a closely related approach with recurrent thought states, intermediate image-generation supervision, and terminal textual grounding. Its terminal-consolidation stage retains recurrent thought updates while stopping gradient propagation through intermediate steps. It also avoids decoding intermediate images at inference, a property we share. [EndoCoT, Section 4.2](https://arxiv.org/html/2603.12252v1#S4.SS2). PhysFlow replaces high-level physical rationales, low-level transition descriptions, and then successive intermediate visual blocks with individual latent tokens. Each visual replacement removes that block's direct alignment loss; later uncompressed blocks, final-block alignment, and the flow-matching loss continue to train the compressed tokens. The curriculum therefore changes how the planner represents the process and receives supervision as it approaches the inference representation. At inference, the generator receives all six plan tokens together with the separate final visual block (Sections 3.3 and 3.4).\n\n**Relative to Monet, we jointly internalize textual and visual process supervision for image generation.** Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning and further trains them with visual-latent policy optimization. Its latent embeddings support a model that produces textual answers. [Monet, Section 3](https://arxiv.org/html/2511.21395v2#S3). PhysFlow compresses both the textual rationales and the intermediate visual representations into a continuous plan before generating the edited image. During planner training, the flow-matching loss propagates through a frozen image generator to train the conditioning representations. We then freeze the planner and adapt the generator to these representations. This couples learning the plan to its use in image generation (Section 3.4).\n\n**The same-data control now measures the gain beyond adaptation to the training pairs.** PhysFlow scores 56.32 on PICABench-Superficial, compared with 55.12 for image-pair SFT on the same PhysTrace pairs. Both use the same generator LoRA configuration and 537 generator updates; PhysFlow additionally trains its planner, for 1,790 total updates. The terminal-only run scores 55.57, compared with 56.32 for full PhysFlow as reported in the paper. The 0.75-point difference compares training configurations; finer attribution to supervision and curriculum requires further controls. These comparisons report single-run point estimates. We will clarify these design differences in Sections 2 and 3 and report each control alongside the claim it tests.",
          "revision": "8a9142333fd1349d"
        },
        {
          "id": "data-split",
          "title": "训练来源、划分与评测重叠",
          "subject": "Training and evaluation data separation",
          "comments": [
            {
              "label": "Question 3 · data separation",
              "text": "Can the authors clarify how PhysTrace samples are separated from the PICABench evaluation examples, including any source-image or near-duplicate overlap checks?"
            }
          ],
          "analysis": "解释 PICA-100K 训练数据与 PICABench 900 例评测集的构建来源。来源不同不等于已完成近重复审计；最终权重和本轮补实验权重仍需分别对应清单与检查记录，候选数不是确认重叠数。",
          "source": {
            "block": "data-split"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "PICA-100K provides training data, while PICABench provides a separately curated evaluation set of 900 editing examples (Pu et al., [Sections 3.1 and 3.2](https://arxiv.org/html/2510.17681v3#S3.SS2), and [Section 3.4](https://arxiv.org/html/2510.17681v3#S3.SS4)). The authors collect PICABench evaluation images from licensed and public sources and construct PICA-100K from generated source images and synthetic videos. We start constructing our PhysTrace training dataset with PICA-100K image-instruction pairs (Section 3.2 of our manuscript). We will clarify these distinct data sources and their training and evaluation roles in Section 3.2 and Appendix A.",
          "revision": "af2b48ab24bac9bb"
        },
        {
          "id": "cost",
          "title": "参数、显存与推理成本",
          "subject": "Parameter count, peak memory, and latency",
          "comments": [
            {
              "label": "Question 3 · computation cost",
              "text": "Can they also provide a parameter-count and peak-memory comparison to complement the latency measurements?"
            }
          ],
          "analysis": "使用作者确认的六模型表，PhysicEdit 保留 52.19 秒。说明参数、显存及延迟口径；PhysFlow 对自身骨干增加约 11.4% 延迟。不同方法的延迟比较不等于所有资源消耗都更低。",
          "source": {
            "block": "cost"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "Thank you for this suggestion. We now report parameter counts and peak GPU memory alongside inference latency. We count the parameters resident during inference, including reasoning modules, and report peak allocated GPU memory. Parameter counts and peak allocated memory describe the current implementations; the latency column reports separate timing measurements.\n\n| Method | Params (B) | Memory (GiB) | Latency (s) |\n|---|---:|---:|---:|\n| Qwen-Image-Edit | 28.85 | 58.06 | 44.34 |\n| PhysicEdit | 29.00 | 56.25 | 52.19 |\n| Step1X-Edit | 20.82 | 41.34 | 59.18 |\n| Qwen-Image-Edit + explicit reasoning | 28.85 | 58.06 | 60.12 |\n| ChronoEdit | 22.83 | 54.81 | 228.68 |\n| **PhysFlow (Ours)** | **28.87** | **58.11** | **49.39** |\n\nPhysFlow uses 28.87 billion parameters and 58.11 GiB peak memory, compared with 28.85 billion parameters and 58.06 GiB for Qwen-Image-Edit. Its latency increases from 44.34 to 49.39 seconds per edit, an 11.4% overhead. We will include this comparison in the revised efficiency table.",
          "revision": "8c42e5c250c34787"
        }
      ]
    },
    {
      "code": "xuAm",
      "name": "Reviewer 3",
      "url": "https://openreview.net/revisions?id=XpuVjp7OCM",
      "original": "Official Reviewby Reviewer xuAm17 Oct 2026, 08:52 (modified: 06 Nov 2026, 04:21)Everyone[Revisions](https://openreview.net/revisions?id=XpuVjp7OCM)\nPaper Summary:\nPhysFlow is a framework for physics-aware image editing that compresses textual reasoning and intermediate visual states into continuous latent representations. Built on Qwen-Image-Edit-2511, it uses a three-stage curriculum to learn explicit trajectories, progressively compress them, and adapt the image generator. The paper also introduces PhysTrace, a dataset of 11,448 annotated video trajectories. Experiments on PICABench and RISEBench report improvements over the backbone with modest additional inference cost, supported by automated evaluation and a user study.\nPresentation: 2: Generally understandable, but requires substantial effort in places.\nInformativeness: 2: I learned something interesting or useful.\nSoundness: 1: I have significant concerns about the paper’s soundness that do not appear easy to address.\nCritical Strengths:\n1. The paper presents a coherent framework for incorporating physical transformation processes into image editing.\n2. The reported improvements are supported by complementary evaluation methods.\n3. The framework achieves a useful balance between editing quality and inference cost.\nCritical Weaknesses:\n1. The incremental methodological contribution over existing latent reasoning approaches is not sufficiently established. Monet already explores visually informed latent reasoning and distillation, and is acknowledged in the paper. More directly, EndoCoT uses the same Qwen-Image-Edit-2511 backbone, recurrent hidden-state updates, and intermediate visual supervision, while avoiding intermediate image decoding at inference. Therefore, guiding image generation through continuous latent reasoning without rendering intermediate images does not, by itself, clearly distinguish PhysFlow.\n2. The experimental comparison does not adequately cover a closely related method for physics-aware image editing. PhysicEdit learns latent transition priors from videos for physical image editing without requiring intermediate video generation at inference. This directly relates to PhysFlow’s motivation concerning visual dynamics and computational efficiency. However, the paper primarily uses this work as the source of PhysicTran38K and does not provide a method-level comparison. In particular, the score of 53.82 in Tables 4 and 9 corresponds to PhysFlow trained on PhysicTran38K, rather than PhysicEdit itself. This dataset comparison therefore does not establish an advantage over the existing approach.\n3. The ablations do not sufficiently separate the benefits of dataset adaptation from those of structured latent reasoning. The no-reasoning configuration in Table 3 scores 54.26, matching the original backbone, and is described as the base model. The paper does not clearly report a direct fine-tuning baseline trained on the same PhysTrace source–target pairs with comparable generator adaptation and training budget. PICA100K-SFT cannot substitute for this control because it uses different data. Furthermore, the textual, visual, and joint reasoning ablations support the complementarity of the two modalities, but do not establish whether the progressive compression curriculum is more effective than learning latent conditioning with terminal supervision alone.\n4. The claim that general editing capabilities are preserved is stronger than the category-level results support. Although the overall ImgEdit-Bench score decreases only slightly, from 4.41 to 4.39, some categories show larger declines: Hybrid drops from 3.76 to 3.26, and Extract from 4.16 to 3.91. These results support broadly maintained aggregate performance, but not an unqualified claim of improvement without compromising general editing capabilities. This is a secondary limitation that calls for a more precise discussion of the trade-offs.\nQuestions For Authors:\n1. What is the central methodological contribution relative to EndoCoT and Monet?\n2. Was the no-reasoning configuration in Table 3 adapted using the same PhysTrace training data?\n3. How does performance change when the same recurrent latent tokens, final visual block, and trainable modules are retained, but training uses only terminal visual supervision and the generation loss?\n4. Could you provide a method-level comparison with PhysicEdit under a consistent evaluation protocol, explicitly accounting for backbone differences?\nFlag For Ethics Review: No\nRating: 2: Weak rejection\nConfidence: 4: I have substantial direct research experience on this topic.",
      "items": [
        {
          "id": "positioning",
          "title": "相对 EndoCoT 和 Monet 的核心贡献",
          "subject": "Central contribution relative to EndoCoT and Monet",
          "comments": [
            {
              "label": "Weakness 1",
              "text": "The incremental methodological contribution over existing latent reasoning approaches is not sufficiently established. Monet already explores visually informed latent reasoning and distillation, and is acknowledged in the paper. More directly, EndoCoT uses the same Qwen-Image-Edit-2511 backbone, recurrent hidden-state updates, and intermediate visual supervision, while avoiding intermediate image decoding at inference. Therefore, guiding image generation through continuous latent reasoning without rendering intermediate images does not, by itself, clearly distinguish PhysFlow."
            },
            {
              "label": "Question 1",
              "text": "What is the central methodological contribution relative to EndoCoT and Monet?"
            }
          ],
          "analysis": "回应审稿人指出的共有设计，再说明表示、监督和压缩课程的差异。不要把“无中间图像解码”单独当 novelty。已有同数据 SFT 与终态对照作为支持；直接压缩的独立贡献仍不能提前下结论。",
          "source": {
            "block": "method-contribution"
          },
          "status": "讨论已成稿 · 消融待补",
          "pending": false,
          "markdown": "**PhysFlow learns a compact plan from supervision of both the physical transformation and its outcome.** A target image specifies the desired result; physical rationales and intermediate visual states provide additional supervision about the transformation. Our contribution is a training curriculum that compresses these complementary signals into six latent tokens while retaining a separate 16-token final visual block. This allocates different representation budgets to the transformation and its endpoint, and gives the image generator access to both (Sections 3.3 and 3.4).\n\n**Relative to EndoCoT, we change the representation and its supervision during compression.** EndoCoT establishes a closely related approach with recurrent thought states, intermediate image-generation supervision, and terminal textual grounding. Its terminal-consolidation stage retains recurrent thought updates while stopping gradient propagation through intermediate steps. It also avoids decoding intermediate images at inference, a property we share. [EndoCoT, Section 4.2](https://arxiv.org/html/2603.12252v1#S4.SS2). PhysFlow replaces high-level physical rationales, low-level transition descriptions, and then successive intermediate visual blocks with individual latent tokens. Each visual replacement removes that block's direct alignment loss; later uncompressed blocks, final-block alignment, and the flow-matching loss continue to train the compressed tokens. The curriculum therefore changes how the planner represents the process and receives supervision as it approaches the inference representation. At inference, the generator receives all six plan tokens together with the separate final visual block (Sections 3.3 and 3.4).\n\n**Relative to Monet, we jointly internalize textual and visual process supervision for image generation.** Monet distills auxiliary visual information into latent embeddings within text-latent interleaved reasoning and further trains them with visual-latent policy optimization. Its latent embeddings support a model that produces textual answers. [Monet, Section 3](https://arxiv.org/html/2511.21395v2#S3). PhysFlow compresses both the textual rationales and the intermediate visual representations into a continuous plan before generating the edited image. During planner training, the flow-matching loss propagates through a frozen image generator to train the conditioning representations. We then freeze the planner and adapt the generator to these representations. This couples learning the plan to its use in image generation (Section 3.4).\n\n**The same-data control now measures the gain beyond adaptation to the training pairs.** PhysFlow scores 56.32 on PICABench-Superficial, compared with 55.12 for image-pair SFT on the same PhysTrace pairs. Both use the same generator LoRA configuration and 537 generator updates; PhysFlow additionally trains its planner, for 1,790 total updates. The terminal-only run scores 55.57, compared with 56.32 for full PhysFlow as reported in the paper. The 0.75-point difference compares training configurations; finer attribution to supervision and curriculum requires further controls. These comparisons report single-run point estimates. We will clarify these design differences in Sections 2 and 3 and report each control alongside the claim it tests.",
          "revision": "8a9142333fd1349d"
        },
        {
          "id": "physicedit",
          "title": "补 PhysicEdit 的方法级比较",
          "subject": "PhysicEdit method-level comparison",
          "comments": [
            {
              "label": "Weakness 2",
              "text": "The experimental comparison does not adequately cover a closely related method for physics-aware image editing. PhysicEdit learns latent transition priors from videos for physical image editing without requiring intermediate video generation at inference. This directly relates to PhysFlow’s motivation concerning visual dynamics and computational efficiency. However, the paper primarily uses this work as the source of PhysicTran38K and does not provide a method-level comparison. In particular, the score of 53.82 in Tables 4 and 9 corresponds to PhysFlow trained on PhysicTran38K, rather than PhysicEdit itself. This dataset comparison therefore does not establish an advantage over the existing approach."
            },
            {
              "label": "Question 4",
              "text": "Could you provide a method-level comparison with PhysicEdit under a consistent evaluation protocol, explicitly accounting for backbone differences?"
            }
          ],
          "analysis": "明确 53.82 的行身份，补入 PhysicEdit 本身 52.35 并交代双方骨干。与 R1 共用核对后的数据和讨论；完整系统的 3.97 分差不能解释成匹配骨干下的方法增益。",
          "source": {
            "block": "r1"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "Thank you for highlighting PhysicEdit. We appreciate its use of video-derived transition priors to guide physical image editing without rendering intermediate videos at inference. We agree that our original discussion should have made this connection explicit, and we will expand the related-work discussion accordingly.\n\n**Our contribution is the progressive internalization of textual and visual process supervision into a continuous latent plan.** PhysicEdit combines an explicit textual reasoning trace at inference with video-supervised transition queries. PhysFlow progressively compresses high-level physical rationales, low-level transition descriptions, and ordered intermediate visual blocks into six latent tokens. These tokens condition the image generator together with a separate 16-token final visual block. This design internalizes the textual reasoning as well as the visual process, so inference uses the compact latent plan without decoding a textual reasoning trace. We will clarify this distinction in Sections 2 and 3. [PhysicEdit, Section 3.3](https://arxiv.org/html/2602.21778v2#S3.SS3).\n\n**The added method-level comparison reports 56.32 for PhysFlow and 52.35 for PhysicEdit.** We evaluate PICABench-Superficial with Qwen2.5-VL-72B-Instruct and report both backbones below. We report scores on a 0 to 100 scale and gains in percentage points.\n\n| Method | Backbone | Overall | Gain over own backbone |\n|---|---|---:|---:|\n| Qwen-Image-Edit-2509 | Qwen-Image-Edit-2509 | 49.71 | N/A |\n| PhysicEdit | Qwen-Image-Edit-2509 | 52.35 | +2.64 |\n| Qwen-Image-Edit-2511 | Qwen-Image-Edit-2511 | 54.26 | N/A |\n| **PhysFlow (Ours)** | Qwen-Image-Edit-2511 | **56.32** | **+2.06** |\n\nPhysFlow achieves a 3.97-point higher overall score and higher scores in all eight categories. Both methods improve on their respective backbones. The different backbones make this a comparison of complete systems; isolating the contribution of each method requires a matched-backbone control. We also clarify that the existing 53.82 entry in Tables 4 and 9 refers to PhysFlow trained on PhysicTran38K; the new 52.35 entry evaluates PhysicEdit itself.\n\n**PhysFlow also has lower latency in the reported cost comparison.**\n\n| Method | Params (B) | Memory (GiB) | Latency (s) |\n|---|---:|---:|---:|\n| PhysicEdit | 29.00 | 56.25 | 52.19 |\n| **PhysFlow (Ours)** | **28.87** | **58.11** | **49.39** |\n\nThe resource and timing measurements come from separate runs. In these reported results, PhysFlow takes 2.80 fewer seconds per edit, a 5.4% latency reduction, while using 1.86 GiB more peak memory. These measurements show a latency advantage with a memory trade-off. We will include the method-level results and cost comparison in the revised manuscript.",
          "revision": "2effe5300e1aa996"
        },
        {
          "id": "same-data",
          "title": "Table 3 的 no-reasoning 到底是什么？",
          "subject": "Identity of the no-reasoning baseline",
          "comments": [
            {
              "label": "Weakness 3 · data adaptation",
              "text": "The ablations do not sufficiently separate the benefits of dataset adaptation from those of structured latent reasoning. The no-reasoning configuration in Table 3 scores 54.26, matching the original backbone, and is described as the base model. The paper does not clearly report a direct fine-tuning baseline trained on the same PhysTrace source–target pairs with comparable generator adaptation and training budget. PICA100K-SFT cannot substitute for this control because it uses different data."
            },
            {
              "label": "Question 2",
              "text": "Was the no-reasoning configuration in Table 3 adapted using the same PhysTrace training data?"
            }
          ],
          "analysis": "直接说明 54.26 对应原始骨干，补同数据 SFT 55.12，避免把 PICA100K-SFT 当同数据控制。完整方法高 1.20 分，但总训练预算和 planner 容量仍有差异。",
          "source": {
            "block": "sft-baseline"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "The 54.26 row in Table 3 reports the original Qwen-Image-Edit-2511 backbone. We will label it explicitly as “Original backbone” and state its training status in the caption. We have now added a baseline fine-tuned on the same PhysTrace source-target pairs:\n\n| Configuration | PICABench-Superficial (%) |\n|---|---:|\n| Original Qwen-Image-Edit-2511 | 54.26 |\n| PhysTrace image-pair SFT | 55.12 |\n| Full PhysFlow | 56.32 |\n\nImage-pair SFT improves on the original backbone by 0.86 points, and PhysFlow exceeds this adapted baseline by 1.20 points. Both use the same rank-512 generator LoRA configuration and 537 generator updates. PhysFlow also trains a planner, for 1,790 total updates, so this comparison includes additional capacity and training. Question 3 compares the terminal-only run with the full PhysFlow results reported in the paper, including the category breakdown and the scope of this training-configuration comparison.",
          "revision": "a055bc1b0328da17"
        },
        {
          "id": "terminal",
          "title": "同结构只用终态监督，表现如何？",
          "subject": "Terminal-only supervision with the same structure",
          "comments": [
            {
              "label": "Weakness 3 · terminal supervision",
              "text": "Furthermore, the textual, visual, and joint reasoning ablations support the complementarity of the two modalities, but do not establish whether the progressive compression curriculum is more effective than learning latent conditioning with terminal supervision alone."
            },
            {
              "label": "Question 3",
              "text": "How does performance change when the same recurrent latent tokens, final visual block, and trainable modules are retained, but training uses only terminal visual supervision and the generation loss?"
            }
          ],
          "analysis": "保留六个 recurrent tokens、16-token 终态块和可训练模块，使用终态视觉监督与生成损失。列出新跑 55.57 与论文报告值 56.32 的分项表。0.75 是配置差异，不能单独归因于课程；折射项终态对照更高。",
          "source": {
            "block": "terminal-only"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "Following your suggestion, we retain the six recurrent latent tokens, the 16-token final visual block, and the trainable modules. We train the terminal-only control using terminal visual supervision and the generation loss, without textual or intermediate-frame supervision. This control uses 1,253 planner updates and 537 generator updates. The table compares this new run with the full PhysFlow results reported in the paper.\n\nEditing accuracy (%) on PICABench-Superficial, evaluated with Qwen2.5-VL-72B-Instruct; higher is better.\n\n| Training strategy | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n| Terminal-only supervision | 53.84 | 64.48 | 57.73 | **59.18** | 42.57 | 46.68 | 63.59 | 55.71 | 55.57 |\n| Full PhysFlow | **54.45** | **65.19** | **58.52** | 57.99 | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |\n\nFull PhysFlow achieves 0.75 percentage points higher overall accuracy. Terminal-only scores higher on refraction (59.18 versus 57.99). These single-run scores compare training configurations as a whole; isolating contributions from individual supervision terms and the compression curriculum requires further controls.",
          "revision": "3b2b9300339daf31"
        },
        {
          "id": "general-editing",
          "title": "一般编辑能力：总体保持与类别权衡",
          "subject": "General editing performance and category trade-offs",
          "comments": [
            {
              "label": "Weakness 4",
              "text": "The claim that general editing capabilities are preserved is stronger than the category-level results support. Although the overall ImgEdit-Bench score decreases only slightly, from 4.41 to 4.39, some categories show larger declines: Hybrid drops from 3.76 to 3.26, and Extract from 4.16 to 3.91. These results support broadly maintained aggregate performance, but not an unqualified claim of improvement without compromising general editing capabilities. This is a secondary limitation that calls for a more precise discussion of the trade-offs."
            }
          ],
          "analysis": "先说总体 4.39 vs. 4.41、六类提高，再报告 Hybrid／Extract／Add 的下降。用 “We interpret” 区分作者解释与因果验证：多操作协调和保持身份的主体提取，与单一物理过程内的状态演化不同。",
          "source": {
            "block": "general-editing"
          },
          "status": "回复已成稿",
          "pending": false,
          "markdown": "Thank you for pointing out the category-level declines. Table 6 reports an overall ImgEdit-Bench score of 4.39 for PhysFlow and 4.41 for Qwen-Image-Edit-2511. PhysFlow scores higher in six of nine categories, while the largest declines occur in Hybrid (3.76 to 3.26) and Extract (4.16 to 3.91), with a smaller decrease in Add (4.45 to 4.26).\n\nWe interpret the declines in Hybrid and Extract as task-dependent transfer from physical-process supervision. PhysTrace emphasizes causally connected state evolution within a physical process through textual rationales and intermediate visual states (Sections 3.2 to 3.4). Hybrid combines separately specified editing operations within one instruction, whereas Extract requires isolating a subject while preserving its identity and visual details. [ImgEdit, Sections 3.1 and 4.2](https://arxiv.org/html/2505.20275v1#S3.SS1).\n\nWe have revised Appendix C.1 to report these category-level declines alongside the improvements. The revised text describes similar aggregate performance with category-dependent trade-offs, replacing the original claim of general editing without compromise.",
          "revision": "22e858e3876e8752"
        }
      ]
    }
  ]
};
