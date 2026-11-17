# PhysFlow Rebuttal · 1116

## General Response

### Block 1

Dear Reviewers and Area Chairs,

Thank you very much for the time and care you have devoted to reviewing our work. We sincerely appreciate your constructive comments and suggestions, which have helped us improve our manuscript. We have carefully considered every comment and suggestion and revised the paper accordingly, with the main changes marked in blue.

We summarize the main revisions below.

**In the main paper:**

1. Expanded the discussion of PhysicEdit, EndoCoT, and Monet to clarify how our PhysFlow differs from these approaches.

2. Added PhysicEdit and Qwen-Image-Edit-2509 results on PICABench-Superficial.

3. Added ablation studies comparing full textual and visual process supervision with terminal-only visual supervision, progressive compression with direct compression, and change-uniform sampling with time-uniform sampling.

4. Added parameter-count and memory measurements alongside inference-latency comparisons.

**In the appendix:**

1. Clarified the sources and roles of PICA100K training data and PICABench evaluation examples.

2. Added comparisons to evaluate the contributions of the PhysTrace dataset and the PhysFlow framework, including image-pair fine-tuning on the same PhysTrace data.

3. Added PhysicEdit and Qwen-Image-Edit-2509 results on ImgEdit-Bench.

4. Expanded the discussion of general editing performance, including the declines in Hybrid and Extract.

5. Added an ablation on the number of visual tokens per intermediate state.

6. Added representation analyses including token-role visualization and physical intervention.

We provide detailed responses to each reviewer's comments below. Thank you very much again for your time and helpful suggestions.

Best regards,  
The Authors

## Reviewer 8uwk

### Block 1

**Comparison with PhysicEdit**

Thank you very much for pointing out the missing discussion of PhysicEdit.

As suggested, we have included a discussion of PhysicEdit in Section 2.2, “Latent Reasoning”, and Summary in Related Work.

Although both our proposed PhysFlow and PhysicEdit leverage textual explanations and visual trajectories to enhance the physical understanding of image editing models, they differ fundamentally in their underlying mechanisms, as detailed below.

**1. Our textual reasoning representation is different.**
PhysicEdit generates textual reasoning traces in the ***explicit semantic space*** of the MLLM, while separately modeling visual representations in the latent space.
In contrast, our PhysFlow jointly performs textual and visual reasoning within a ***unified latent space***. This formulation allows latent textual reasoning to guide visual-state prediction ***without generating explicit reasoning text at inference***.

**2. Our visual reasoning explicitly models temporal dependencies.**
PhysicEdit ***jointly computes a set of transition-query representations***, whereas PhysFlow ***autoregressively predicts successive visual-state representations*** conditioned on preceding latent textual explanations and visual states.
This causal formulation explicitly captures the temporal dependencies underlying physical transitions.

**3. Learning unified latent reasoning requires a non-trivial training strategy.**
PhysicEdit trains its transition queries through ***feature alignment with projected DINOv2 and VAE features*** extracted from intermediate video frames.
In contrast, our PhysFlow adopts a ***progressive training curriculum***.
It first supervises the prediction of all textual explanations and intermediate and final visual states using ground-truth text tokens and visual features extracted by the MLLM's visual encoder, respectively.
It then progressively replaces the reasoning blocks for textual explanations and intermediate visual transitions with model-generated predictions, one at a time.
Each replaced block receives indirect supervision through the original prediction loss applied to subsequent unreplaced positions, jointly with the diffusion loss. 
This stage encourages the model to learn causal dependencies across successive multimodal reasoning steps.
Finally, the image generator is adapted to the learned latent representations using the diffusion loss.

We have added a quantitative comparison with PhysicEdit on PICABench-Superficial and ImgEdit-Bench in Table 1 and 5, respectively.
Using the same Qwen-Image-Edit-2509 backbone, our PhysFlow achieves an overall score of 54.12% on PICABench-Superficial, outperforming PhysicEdit (52.35%) by 1.77%, with higher scores in seven out of eight categories.
Moreover, our PhysFlow achieves an overall score of 4.31 on ImgEdit-Bench, compared with 4.05 for PhysicEdit, indicating stronger generalization to general image editing tasks.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit (2509) | 51.62 | 61.63 | 51.56 | 52.96 | **44.03** | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509) | **52.01** | **62.82** | **57.02** | **53.14** | 43.32 | **46.81** | **61.42** | **53.16** | **54.12** |

&nbsp;

| Method | Add | Adjust | Extract | Replace | Remove | BackG | Style | Hybrid | Action | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit (2509) | 4.31 | 4.17 | 2.34 | 4.45 | 4.44 | 4.03 | 4.74 | 3.36 | **4.85** | 4.05 |
| PhysFlow (2509) | **4.45** | **4.25** | **3.54** | **4.69** | **4.48** | **4.21** | **4.77** | **3.38** | 4.82 | **4.31** |

We have also added a comparison of inference latency between our PhysFlow and PhysicEdit in Table 4.

| Method | Latency (s) |
|---|---:|
| PhysicEdit | 52.19 |
| PhysFlow (Ours) | 49.39 |

## Reviewer 62MG

### Block 1

Thank you very much for your careful reading and detailed, constructive feedback.
We sincerely appreciate your recognition of our motivation, framework, and empirical improvements. We address your questions and concerns in the following ten responses.

---
**1. Isolating the effect of additional supervision in training dataset PhysTrace.**

Following your suggestion, we train a non-reasoning image editor on PhysTrace without reasoning annotations, using the same generator backbone (Qwen-Image-Edit-2511) and a comparable optimization budget to our PhysFlow.
We refer to this baseline as Qwen-Image-Edit-2511 + PhysTrace (w/o Reasoning) and report its results in Table 8.

As shown, the new baseline outperforms the original backbone by 0.86 percentage points.
Furthermore, our latent reasoning framework further improves the overall score from 55.12% to 56.32% over this non-reasoning baseline, demonstrating the effectiveness of our proposed approach.
Particularly, under the same source-target image pair setting, training on our curated PhysTrace achieves higher overall performance than training on PICA100K (i.e., Qwen-Image-Edit-2511 + PICA100K (w/o Reasoning)), highlighting the benefits of its superior data quality for training efficiency.

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|+ PhysTrace (w/o Reasoning)|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|+ PICA100K (w/o Reasoning)|**55.52**|60.30|57.69|53.04|41.46|45.91|59.13|52.12|53.38|
|PhysFlow|54.45|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

---

**2. Comparison between change-uniform and time-uniform sampling.**

As suggested, we have compared our proposed change-uniform frame sampling strategy with conventional temporal-uniform sampling on PICABench-Superficial.
The results are reported in Table 3(d).
As shown, our change-uniform strategy improves the overall score by 1.27 points over temporal-uniform sampling.
This improvement can be attributed to its ability to capture richer transition dynamics, whereas temporal-uniform sampling may concentrate substantial visual changes between only a few consecutive sampled frames.

|Sampling|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Temporal-uniform|53.72|63.06|**59.30**|57.64|43.29|46.21|62.35|53.65|55.05|
|Change-uniform|**54.45**|**65.19**|58.52|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

---

**3. Ablation study on progressive compression with different token counts.**

As suggested, we evaluate our proposed progressive compression mechanism using different numbers of tokens per intermediate visual state (1, 2, and 4). The results are reported in Table 9 of Appendix C.7.
As shown, using a single token per intermediate visual state achieves the highest overall accuracy (56.32%), and is adopted as the default setting in our paper.

|Tokens per state|Total intermediate tokens|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|1|4|**54.45**|**65.19**|**58.52**|**57.99**|**44.91**|47.31|**64.32**|**56.43**|**56.32**|
|2|8|52.10|64.28|57.61|56.16|42.61|46.08|62.94|53.92|54.73|
|4|16|52.65|64.41|56.93|56.16|41.83|**47.54**|63.40|52.84|54.85|

---

**4. Comparison between progressive and direct compression.**

As suggested, we additionally compare our proposed progressive compression mechanism with a direct compression strategy that replaces all textual and visual reasoning blocks with latent tokens in a single step.
The results are added to Table 3(c).
As shown, our progressive compression improves the overall accuracy by 1.80 points over direct compression.
This improvement suggests that progressively compressing reasoning blocks allows the model to gradually distill multimodal reasoning information into compact latent representations, while preserving the causal dependencies across successive reasoning steps. In contrast, directly compressing all reasoning blocks at once may lead to greater information loss and more challenging optimization.

|Compression strategy|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Direct compression|52.84|63.83|55.68|56.31|42.54|46.85|62.40|53.96|54.52|
|Progressive compression (paper)|**54.45**|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

### Block 2

**5. Additional representation analysis and controlled interventions for better interpretability.**

We thank the reviewer for highlighting the importance of analyzing the learned latent representations for better interpretability.
As suggested, we conducted two additional analyses in Appendix C.8 of the revised manuscript: (a) Token-role visualization, and (b) Physical intervention analysis.

**(a) Token-role visualization.**
We visualize latent tokens from PhysTrace test cases across four reasoning roles: high-level textual reasoning, low-level textual reasoning, intermediate visual states, and the final visual state (Figure 7(a)).
For each input, we average hidden states within each role and normalize the resulting vectors to fit a shared PCA basis.
We then normalize individual token vectors and project them onto the first two principal components using the same PCA basis.
As shown in Figure 7(a), the compressed tokens form a well-structured latent space, with distinct clusters corresponding to different reasoning roles.

**(b) Physical intervention analysis.**
We investigate whether intermediate visual latents encode the physical consequences of different interventions, with results reported in Figure 7(b).
We construct synthetic scenes across seven tasks (support, torque, buoyancy, outflow, absorption, phase change, and shape recovery), each with two instructions yielding opposite outcomes under idealized physical rules.
For each input, we extract four intermediate visual tokens from frozen PhysFlow and train a task-specific linear ridge probe on their averaged features to predict binary outcomes.
For each task, we use 128/32/64 disjoint scene families for training/validation/testing.
A pair is considered correct only if both intervention outcomes are predicted correctly.
As shown in Figure 7(b), the overall pair accuracy across the seven tasks reaches 97.88%, indicating that the learned visual latents encode discriminative information about the physical consequences of different interventions.

We have added the detailed experimental settings and controls to Appendix C.8.

---

**6. Repeated-run variance on PICABench-Superficial and RISEBench.**

As suggested, we separately report the mean ± standard deviation (SD) across training and inference seeds.

We repeat PhysFlow training with three different seeds while fixing the inference seed at 42. PhysFlow achieves 56.22 ± 0.37% on PICABench-Superficial and 10.07 ± 1.21% on RISEBench, with mean gains of 1.96 and 2.01 percentage points over the original backbone, respectively.

| Method | PICABench-Superficial Mean (%) | SD (%) | RISEBench Mean (%) | SD (%) |
|---|---:|---:|---:|---:|
| PhysFlow | 56.22 | 0.37 | 10.07 | 1.21 |

We also evaluate fixed checkpoints using three different seeds.
PhysFlow outperforms the original backbone on both PICABench-Superficial and RISEBench, with a mean improvement of 1.92 and 1.29 percentage points, respectively.

| Method | PICABench-Superficial Mean (%) | SD (%) | RISEBench Mean (%) | SD (%) |
|---|---:|---:|---:|---:|
| Qwen-Image-Edit-2511 | 54.41 | 0.34 | 8.71 | 0.58 |
| PhysFlow | 56.33 | 0.40 | 10.00 | 0.96 |

---

**7. Evaluation Using an MLLM as a Judge for Physical Consistency.**

MLLM-as-a-judge evaluation is widely adopted in image generation and editing benchmarks.
Our evaluation of physical consistency goes beyond general assessments of editing quality.
Specifically, PICABench employs fine-grained, sample-specific physical criteria defined by human-annotated questions and reference answers, such as whether removing an object also removes its shadow.
PICAEval uses an MLLM to answer these questions based on the edited images and evaluates the agreement with the reference answers (PICABench, Section 3.3 and Appendix A.3).

Moreover, our human study provides complementary evidence. We ask 17 participants to compare PhysFlow with five competing methods on 100 image-instruction pairs randomly sampled from PICABench and RISEBench. The human preferences for PhysFlow in terms of physical plausibility are consistent with the overall benchmark results.

We agree that evaluating explicit, measurable physical constraints is a valuable direction for more rigorous assessment of physical consistency, which we leave for future work on evaluation methodology.

### Block 3

**8. Originality and positioning relative to closely related approaches.**



We acknowledge that the ideas of progressive CoT internalization, continuous latent reasoning, and visual feature prediction have been explored in prior work (Section 2.3).
However, effectively adapting these techniques to physics-aware image editing and achieving substantial performance improvements is non-trivial.
The key contributions of our PhysFlow are summarized as follows.

**(a) Our framework internalizes both textual and visual reasoning into a unified latent space.**
Existing latent reasoning methods, such as Coconut, CODI, and SIM-CoT, internalize textual reasoning without explicitly modeling the corresponding visual states.
Methods such as LVR, Monet, and PhysicEdit combine explicit textual reasoning with visual latent representations for textual answer generation (LVR and Monet) or image editing (PhysicEdit).
In contrast, our PhysFlow internalizes both textual explanations and visual-state transitions into a unified multimodal latent space, enabling joint textual and visual reasoning without generating explicit reasoning text at inference.



**(b) Internalizing multimodal reasoning for image editing requires a non-trivial training strategy.**
Existing methods learn latent representations through feature alignment or distillation (CODI, PhysicEdit, and Monet) or diffusion-based supervision of visual states (EndoCoT).
In contrast, our PhysFlow introduces a progressive compression mechanism tailored to physics-aware image editing, jointly internalizing textual explanations and visual-state transitions by replacing their reasoning blocks with compact latent tokens, one block at a time.
These latent tokens receive indirect supervision from text prediction and visual alignment losses on subsequent uncompressed reasoning blocks, together with the diffusion loss for the final edited image, coupling multimodal reasoning compression with the image editing objective.

**(c) We curated a high-quality dataset enabling larger performance gains with less training data.**
Most existing image editing datasets, such as PICA100K, provide only source–target image pairs without intermediate visual supervision.
Although PhysicTran38K introduces video trajectories, we observe physical inconsistencies in videos generated by its Wan2.2 backbone.
To provide physically grounded process supervision, we use Cosmos 3 Super to generate transition trajectories, filter them for instruction compliance and physical consistency, and annotate them with hierarchical textual reasoning and change-uniformly sampled intermediate frames.
Our experiments show that PhysFlow trained on PhysTrace achieves larger performance gains with fewer training examples than PhysicEdit trained on PhysicTran38K, supporting more data-efficient training.

---

**9. Data overlap checks between PhysTrace and PICABench.**

We thank the reviewer for raising the question of training and evaluation data separation.
PICA-100K provides the training data, while PICABench consists of a separately curated evaluation set of 900 image editing examples.
As described in Section 3.2 and Appendix A, we construct PhysTrace using image-instruction pairs from PICA-100K, rather than PICABench, ensuring that no PICABench evaluation examples are directly included in our training data.

---

**10. Parameter-count and peak-memory comparison.**

As suggested, we have added these measurements to Table 4 to provide a more comprehensive assessment of inference costs.

As shown, PhysFlow maintains nearly the same parameter count and peak memory usage as Qwen-Image-Edit (28.87B vs. 28.85B parameters and 58.11 vs. 58.06 GiB), with only an 11.4% increase in inference latency.
Despite having a parameter count comparable to PhysicEdit and larger than those of Step1X-Edit and ChronoEdit, PhysFlow achieves lower inference latency than all three methods.
Moreover, PhysFlow requires only 49.39 seconds per edit, compared with 60.12 seconds for Qwen-Image-Edit with explicit reasoning.
These results highlight the inference efficiency of our compact latent planning design.

|Method|Params (B)|Memory (GiB)|Latency (s)|
|---|---:|---:|---:|
|Qwen-Image-Edit|28.85|58.06|44.34|
|PhysicEdit|29.00|56.25|52.19|
|Step1X-Edit|20.82|41.34|59.18|
|Qwen-Image-Edit + explicit reasoning|28.85|58.06|60.12|
|ChronoEdit|22.83|54.81|228.68|
|PhysFlow (Ours)|28.87|58.11|49.39|

## Reviewer xuAm

### Block 1

We sincerely thank you for the time and effort you devoted to reviewing our manuscript and for your detailed, constructive feedback.
We appreciate your recognition of our coherent framework, the complementary evaluations supporting our improvements, and our inference efficiency.

We have carefully considered each of your concerns and respond point by point below.

---

**1. Central contribution relative to EndoCoT and Monet.**

As suggested, we clarify the key contributions of our PhysFlow relative to EndoCoT and Monet.

**1.1 Comparison with EndoCoT.**

**(a) Our latent representations receive richer process supervision.**
EndoCoT learns latent tokens for intermediate states through the diffusion loss, with the alignment loss applied only at the final state.
In contrast, our PhysFlow progressively replaces explicit reasoning blocks with compact latent tokens, one block at a time.
Specifically, these latent tokens receive indirect supervision from text prediction and visual alignment losses on subsequent uncompressed reasoning blocks, together with the diffusion loss computed only on the final edited image. 
This provides richer supervision for learning compact and informative latent representations.

**(b) Our diffusion supervision targets only the final edited image.**
During its initial training stage, EndoCoT learns latent tokens through diffusion losses computed on the corresponding intermediate and final images, with the alignment loss applied only at the final reasoning state.
In contrast, PhysFlow supervises intermediate states in feature space and applies the diffusion loss only to the final edited image, reducing the diffusion computation required for intermediate-state supervision.

**1.2 Comparison with Monet.**

**(a) Our textual and visual reasoning share a unified latent space.**
Monet solely distills visual evidence into latent embeddings while retaining explicit textual reasoning.
In contrast, our PhysFlow jointly encodes textual physical explanations and visual trajectories within a unified multimodal latent space, without generating explicit reasoning text at inference.

**(b) Internalizing multimodal reasoning requires a non-trivial training strategy.**
Monet adopts a three-stage supervised fine-tuning strategy: it first adapts the MLLM to interleaved textual-visual reasoning, then generates latent embedding targets in the second stage to supervise latent predictions in the third stage.
In contrast, our PhysFlow employs a progressive compression mechanism without requiring a separate stage to generate latent embedding targets.
Instead, the compressed latent tokens receive indirect supervision from text prediction and visual alignment losses on subsequent uncompressed reasoning blocks, together with the diffusion loss, to learn compact latent representations.

**(c) Our framework targets reasoning-to-editing rather than reasoning-to-reasoning.**
Monet primarily focuses on enhancing the visual reasoning capabilities of MLLMs by reasoning over visual evidence directly within the latent visual space (reasoning-to-reasoning).
In contrast, our PhysFlow aims to transfer physical knowledge from MLLMs into physics-aware image editing by explicitly modeling causal visual state transitions in the latent reasoning process (reasoning-to-editing).

We have added a discussion of these two related works in Section 2.3.

### Block 2

**2. Comparison with PhysicEdit.**

Thank you very much for pointing out the missing discussion of PhysicEdit.

As suggested, we have included a discussion of PhysicEdit in Section 2.2, “Latent Reasoning”, and Summary in Related Work.

Although both our proposed PhysFlow and PhysicEdit leverage textual explanations and visual trajectories to enhance the physical understanding of image editing models, they differ fundamentally in their underlying mechanisms, as detailed below.

**1. Our textual reasoning representation is different.**
PhysicEdit generates textual reasoning traces in the ***explicit semantic space*** of the MLLM, while separately modeling visual representations in the latent space.
In contrast, our PhysFlow jointly performs textual and visual reasoning within a ***unified latent space***. This formulation allows latent textual reasoning to guide visual-state prediction ***without generating explicit reasoning text at inference***.

**2. Our visual reasoning explicitly models temporal dependencies.**
PhysicEdit ***jointly computes a set of transition-query representations***, whereas PhysFlow ***autoregressively predicts successive visual-state representations*** conditioned on preceding latent textual explanations and visual states.
This causal formulation explicitly captures the temporal dependencies underlying physical transitions.

**3. Learning unified latent reasoning requires a non-trivial training strategy.**
PhysicEdit trains its transition queries through ***feature alignment with projected DINOv2 and VAE features*** extracted from intermediate video frames.
In contrast, our PhysFlow adopts a ***progressive training curriculum***.
It first supervises the prediction of all textual explanations and intermediate and final visual states using ground-truth text tokens and visual features extracted by the MLLM's visual encoder, respectively.
It then progressively replaces the reasoning blocks for textual explanations and intermediate visual transitions with model-generated predictions, one at a time.
Each replaced block receives indirect supervision through the original prediction loss applied to subsequent unreplaced positions, jointly with the diffusion loss. 
This stage encourages the model to learn causal dependencies across successive multimodal reasoning steps.
Finally, the image generator is adapted to the learned latent representations using the diffusion loss.

We have added a quantitative comparison with PhysicEdit on PICABench-Superficial and ImgEdit-Bench in Table 1 and 5, respectively.
Using the same Qwen-Image-Edit-2509 backbone, our PhysFlow achieves an overall score of 54.12% on PICABench-Superficial, outperforming PhysicEdit (52.35%) by 1.77%, with higher scores in seven out of eight categories.
Moreover, our PhysFlow achieves an overall score of 4.31 on ImgEdit-Bench, compared with 4.05 for PhysicEdit, indicating stronger generalization to general image editing tasks.

| Method | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit (2509) | 51.62 | 61.63 | 51.56 | 52.96 | **44.03** | 45.89 | 57.64 | 53.07 | 52.35 |
| PhysFlow (2509) | **52.01** | **62.82** | **57.02** | **53.14** | 43.32 | **46.81** | **61.42** | **53.16** | **54.12** |

&nbsp;

| Method | Add | Adjust | Extract | Replace | Remove | BackG | Style | Hybrid | Action | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PhysicEdit (2509) | 4.31 | 4.17 | 2.34 | 4.45 | 4.44 | 4.03 | 4.74 | 3.36 | **4.85** | 4.05 |
| PhysFlow (2509) | **4.45** | **4.25** | **3.54** | **4.69** | **4.48** | **4.21** | **4.77** | **3.38** | 4.82 | **4.31** |

We have also added a comparison of inference latency between our PhysFlow and PhysicEdit in Table 4.

| Method | Latency (s) |
|---|---:|
| PhysicEdit | 52.19 |
| PhysFlow (Ours) | 49.39 |

### Block 3

**3. Non-reasoning baseline trained on the same PhysTrace source–target image pairs.**

Following your suggestion, we train a non-reasoning image editor on PhysTrace without reasoning annotations, using the same generator backbone (Qwen-Image-Edit-2511) and a comparable optimization budget to our PhysFlow.
We refer to this baseline as Qwen-Image-Edit-2511 + PhysTrace (w/o Reasoning) and report its results in Table 8.

As shown, the new baseline outperforms the original backbone by 0.86 percentage points.
Under the same source-target image pair training setting, our curated PhysTrace achieves higher overall performance than PICA100K (i.e., Qwen-Image-Edit-2511 + PICA100K (w/o Reasoning)), highlighting its superior data quality and contribution to training efficiency.
Furthermore, our latent reasoning framework further improves the overall score from 55.12% to 56.32% over this non-reasoning baseline, demonstrating the effectiveness of our proposed approach.

|Configuration|LP|LSE|RFL|RFR|DFM|CSL|GST|LST|Overall (%)|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|Qwen-Image-Edit-2511|53.29|62.98|56.78|57.66|44.16|45.99|59.37|55.34|54.26|
|+ PhysTrace (w/o Reasoning)|55.07|65.16|57.96|56.67|42.71|45.30|63.23|53.81|55.12|
|+ PICA100K (w/o Reasoning)|**55.52**|60.30|57.69|53.04|41.46|45.91|59.13|52.12|53.38|
|PhysFlow|54.45|**65.19**|**58.52**|**57.99**|**44.91**|**47.31**|**64.32**|**56.43**|**56.32**|

---

**4. Progressive compression curriculum with terminal supervision alone.**

As suggested, we train our PhysFlow with textual reasoning trajectories while providing visual supervision only for the terminal state.
The results are reported in Table 3(b).
As shown, PhysFlow improves overall accuracy by 0.75 percentage points over terminal-only supervision, demonstrating the benefits of modeling dense, causal visual transitions for improved physical consistency.

| Training strategy | LP | LSE | RFL | RFR | DFM | CSL | GST | LST | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Terminal-only supervision | 53.84 | 64.48 | 57.73 | **59.18** | 42.57 | 46.68 | 63.59 | 55.71 | 55.57 |
| Full PhysFlow | **54.45** | **65.19** | **58.52** | 57.99 | **44.91** | **47.31** | **64.32** | **56.43** | **56.32** |

---

**5. Additional analysis of general editing performance.**

We value your suggestion to further investigate the category-level results more closely, particularly the declines in Hybrid and Extract despite the largely preserved overall performance on general image editing tasks.

We attribute these declines to the differences between physical-process editing and the specific requirements of these categories.
Specifically, Hybrid involves combining multiple editing operations within a single instruction, while Extract requires isolating a subject while preserving its identity and visual details.
In contrast, PhysTrace focuses on modeling causally connected state transitions for individual physical editing operations, guided by textual rationales and intermediate visual states (Sections 3.2–3.4).
This mismatch in task focus may contribute to the observed performance degradation in Hybrid and Extract following physics-aware fine-tuning.
We further observe that PhysicEdit and ChronoEdit, two other physics-aware editing methods, also exhibit relatively lower scores in Hybrid and Extract compared with other general editing categories in Table 5.
We have included this analysis in Appendix C.1.
