> Исторический журнал исследования источников. Пути к ранним reading-guide и supplementary-файлам относятся к исходной папке Codex; её расположение указано в [PROVENANCE](PROVENANCE.md). Текущие исходники презентации — по [карте проекта](ARCHITECTURE.md).

# Scientific source verification for Duncan et al. (2019)

Checked 2026-10-07. Read-only investigation; main article from `work/article.html` and `work/article.txt`, full extracted supplementary PDF text, visual review of supplementary pages 7–8 and main Figure 2; full workbook cell contents/formulas inspected. Sources below are publication's own supplementary files or official NHGRI/PLINK definitions. No source code of the paper's analyses was available or reconstructed as fact.

## Sources acquired

Base article: https://www.nature.com/articles/s41467-019-11112-0

- Supplementary Information, 8-page PDF: https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-019-11112-0/MediaObjects/41467_2019_11112_MOESM1_ESM.pdf
  - Local: work/sources/MOESM1_ESM.pdf and MOESM1_ESM.txt
- Supplementary Dataset 2: https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-019-11112-0/MediaObjects/41467_2019_11112_MOESM3_ESM.xlsx
  - Local: work/sources/MOESM3_ESM.xlsx; complete inspected cells/formulas/caches in MOESM3_inspected.json.
- Description of Additional Supplementary Files: https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-019-11112-0/MediaObjects/41467_2019_11112_MOESM5_ESM.docx
  - Local: work/sources/MOESM5_ESM.docx
- Main Figure 2: https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41467-019-11112-0/MediaObjects/41467_2019_11112_Fig2_HTML.png
  - Local: work/sources/Fig2.png

All four downloaded HTTP200. The web-reader could not open the main article (Nature authentication redirect), but the previously acquired HTML and direct supplementary downloads were usable. Alternative legacy CDN DNS did not resolve; no source data obtained from it.

## Matched performance: 26 papers, comparisons, metrics, significance

Checked main Methods Part1 and Figure2 caption/results, Dataset2 and the figure visually.

- Inclusion requirements for a matched analysis: same genotyping chip, same variant weights, same score-construction algorithm, same phenotype-measurement methods between ancestry groups within a publication.
- 26 is the number of publications meeting inclusion criteria, not the number of effect-size comparisons or observations in every ancestry group.
- Supplementary Data2 has one sheet `MAIN`, dimension A1:T72. Row3 contains labels. Rows4–36 contain 33 cohort records, representing 26 unique paper titles. Extra records: Vassos2016 (3), Lencz2014 (3), Hoffmann2017 BP (2), Hoffmann2015 prostate (3). Rows39–72 contain cohort abbreviations. T is empty; data principally A:S.
- Actual columns: first author, year, paper title, phenotype, training sample, discovery ancestry composition, training N, test cohort, ancestry-specific test Ns (European/African/Hispanic-SouthAsia-EastAsia-Native-Arab-Ashkenazi), reported total, actual total, percent reported total.
- **Dataset2 does not contain effect sizes, normalized ratios, their standard errors, the t-test inputs or code.** Description DOCX simply labels it 26studies meeting Figure2 inclusion. Its title does not imply reproducibility of the performance analysis.
- Main Figure2 visually contains 12 Latino/Hispanic&Americas rows, 15 EastAsian rows, 4 SouthAsian rows and **25 African ancestry rows**, total56 plotted comparisons. This is a visual count, not a count extracted from an author data table. A publication can contribute multiple ancestry comparisons/cohort comparisons.
- Figure includes effect-size labels r², Beta, OR, AUC. Main Methods prefer explained variance, else use beta regression coefficients, OR or AUC as available. Normalize within study by dividing non-European effect size by matched European effect size and multiply100. OR converted to log(OR) before taking ratio. No claim in Methods that AUC was adjusted by subtracting0.5.
- Purcell2009 example: 0.4% explained variance African vs3.2% European -> (0.004/0.032)*100=12.5%. This is concrete article example.
- Article reports median African normalized performance42%, SouthAsian60%, EastAsian95%. 42% is a **median of normalized heterogeneous effect-size metrics**, not42% probability, not42% explained variance and not necessarily42% of accuracy in a common prediction-loss sense.
- Authors report African t=-5.97,df24,p3.7e-6. R and t-tests are mentioned but exact call/vector/alternative/statistical-unit handling is absent in examined materials. df24 is consistent with a one-sample t-test on25 ratios against1 (or100) and corroborated by25 visual AFR comparisons; it is not sufficient evidence of the exact implemented test. Teach t=(mean ratio-1)/(s/sqrt25),df24 as an **interpretation consistent with reported result**, not verified source code. A t-test would test a mean, not directly the median42%.
- Computation of two-sided t-tail using reported rounded t=-5.97 anddf24 gives 3.6683329757920075e-6 (numerical Simpson integration of cos(theta)^23 after angle substitution,20k intervals), consistent with reported rounded3.7e-6. This verifies p-vs-t arithmetic only, **does not reproduce t or median from raw data**.
- Figure2 includes an EastAsian off-scale4.8 ratio and an African negative -0.7 (Dauriz2015 Beta), demonstrating normalized effect sizes can exceed100% or become negative. Ratio is not bounded0–100.
- Point size encodes significance of individual non-European analyses, not sample size or CI. Authors omit SE because many studies lacked information. Figure's title calls it forest plot, but it does not have the usual CI whiskers.
- Some training sets in Dataset2 are mixed; Kiryluk2012 and Fan2016 list EastAsian discovery. Do not state every compared score was trained on100% European people. Article's predominant-European narrative must not erase exceptions.
- An extra limitation: different phenotypes/cohorts from some overlapping studies are not established independent by a label 'matched'; article says minimal sample overlap, but a detailed independence treatment for reported t-test is not available.

## N2577 vsN1940

Checked Methods Part2, main Fig3 Results, supplementary Table1 (page8).

- Downloaded genotype N2577, used for main distribution/PCA discussions (Results explicitly cite2577).
- SupplementTable1 groups sum: EAS523, SAS494, AFR691, EUR514, AMR355 =2577.
- Seven exclusions: PUR105, BEB86, PJL96, MSL85 (missing height phenotype); ASW66 and ACB96 (mixed country ancestry and admixed1000G group); CEU103 (no single European country of origin).
- Excluded total637;2577-637=1940, corroborating table. Retained EAS523,SAS312,AFR444,EUR411,AMR250. Retains19 of26 named populations.
- Main Methods sentence says scores constructed for N1940, but then exclusion rationale explicitly concerns correlations of height scores with height phenotype. This creates an editorial ambiguity relative to Results N2577. Safest teaching: distributions/PCA reported on2577; height-phenotype comparison uses1940 individuals from19 populations, with aggregation at population level. Do not silently rewrite the Methods sentence or assert a verified implementation path.
- Table maps three Chinese populations toChina, GIH/ITU toIndia, ESN/YRI toNigeria, with15 unique countries among19 retained populations. This mapping makes phenotype values repeat across some population points.

## Figure4 height phenotype source contradiction

Checked main Methods Part2, Fig4 caption and paragraph immediately following figure.

- Methods says country-average male/female heights downloaded from precompiled https://en.wikipedia.org/wiki/List_of_average_human_height_worldwide and then sex averages combined. Paragraph after Fig4 also explicitly calls y-axis average heights for countries of origin of1000G populations.
- Fig4 caption additionally says average heights on y-axis 'are from a different height GWAS' than x-axis. **This contradicts the explicit Methods/source account.** The source examined does not resolve this wording.
- Treat y-axis as country-average proxy from Wikipedia as specified Methods, flag inconsistent caption as source inconsistency. Do not invent a separate phenotype GWAS or pretend individual1000G heights measured.
- X-axis plots population-level score summaries; country-level phenotypes make this an ecological comparison. N1940 is not1940 independent height observations for a Pearson test. Correlation can be across19 population aggregates and includes shared country-height values.
- EastAsian heightGWAS available only genome-wide-significant variants; lack of remaining two plots is data availability, not failed significance.

## Supplementary PDF contents and limits

- p2 SuppFig1: analogous distribution sensitivity using GIANTheight weights.
- p3 SuppFig2: PGCPTSD, p<1e-4 vsallvariants; also has old embedded/mislabeled header 'Figure3' but bottom caption Figure2. Avoid relying on embedded caption numbering without bottom caption.
- p4 SuppFig3:20PCs association with5major groups and26subpopulations, Cohen'sd color.
- p5 SuppFig4: correlations between PCs and scores at p-thresholds for GIANTheight, UKBheight, GIANTBMI, PGCschizophrenia; abs correlation intensity, significance asterisks, blue signals opposite direction. Caption refers to Supplemental Table3, while downloadable separate Data3 is correlations; PDF has onlyTable1.
- p6 SuppFig5: PC1 vsgenome-wide-significant scores. Printed r:GIANTheight0.138,p3.41e-12; UKBheight0.168,p2.09e-17; BMI-0.288,p4.01e-49; schizophrenia0.554,p2.67e-202. Beware embedded upper heading 'Figure6' but bottom captionFigure5.
- p7 SuppFig6 PRISMA-like flowchart:1225database+1manual(Purcell2009)→1226fulltexts;493excluded noPGS→733;707excluded unmatched→26. Author explains Purcell missing due keyword mismatch.
- p8 SuppTable1 shows exclusions/numbers above.
- Supplement does not disclose performance t-test exact inputs; no raw matched effect-size table in examined Dataset2.

## Primary official definitions, limited supplementary sources

Official NHGRI GWAS glossary: https://www.genome.gov/genetics-glossary/Genome-Wide-Association-Studies-GWAS
- Checked current page: GWAS identifies statistically associated genomic variants with disease/traits; association is not causality. Suitable support for GWAS refresher.
Official NHGRI SNP glossary: https://www.genome.gov/genetics-glossary/Single-Nucleotide-Polymorphisms-SNPs
- Checked definition: variant at a single DNA base position. Suitable support for SNP refresher.
PLINK1.9 clumping docs: https://www.cog-genomics.org/plink/1.9/postproc#clump
- Checked: clump is LD/p-value based; index variants greedily ordered by lowest p; physical window and LD threshold; r² uses ML haplotype-frequency estimates. Article explicitly overrides defaults using500kb,r²0.2/0.05/0.01,p1/p2=1. Smaller r² removes more correlated candidates, conditional on locus/window; not the same as generic pruning indifferent to p-values.
PLINK1.9 scoring docs: https://www.cog-genomics.org/plink/1.9/score
- Checked: default scores averages of valid per-allele scores, modifier sum returns sums; mean imputation by default. Paper does not print score flags or sum/mean normalization. Educational weighted-sum formula expresses score concept, not verified exact PLINK scale. Do not claim the authors necessarily used sum output.

## Outstanding gaps

Cannot reproduce paper's effect-size extraction, median/t inputs, exact R t-test, within-publication covariance handling, exact PGS normalization/missingness behavior, or full pipeline. No code discovered in supplied article/supplement links. No additional primary study papers consulted to reconstruct missing56comparison values. Broader sources/reproducibility would be a new bounded investigation. All disagreements above are presented as source ambiguities rather than evidence the substantive result is false.

## Follow-up: Figure1 category discrepancy and Figure4c sign (verified)

Additional primary file downloaded HTTP200,359437bytes:
https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41467-019-11112-0/MediaObjects/41467_2019_11112_MOESM2_ESM.xlsx
Local work/sources/MOESM2_ESM.xlsx. Full nonempty cells preserved in MOESM2-Main-table.json (read-only extraction).

- Dataset1 has one sheet `Main table`. Declared styled range A1:XEG735 massively exceeds actual populated6columns. Inspection of all nonempty cells finds only A:F,4405nonempty cells. Columns: Study#,firstauthor,publicationyear,title,otherauthors,In/Out for effectsizeanalysis. There are **no ancestry category columns or category counts** to reconstruct Fig1 independently.
- Rows3–735 have733studyIDs, distinct and contiguous1–733. Thus Dataset1 corroborates total733studies, but **cannot resolve Figure1 ancestry-count contradiction**.
- F3:F735 has29`In` and704`Out`, while main text+Dataset2 claim26matchedpapers. This is another un-reconciled flag/count discrepancy. Dataset1 includes flagged Vilhjálmsson2015, LookAHEAD2015, Hoffmann2014glaucoma absent Dataset2; no reason for later exclusion given in these files. Avoid promoting29flagged records to final included study count.
- Independent visual inspection of original Figure1 PNG confirms legend counts: European459,Asian140,Combined140,African15,Latino&nativeAmerican9,MiddleEastern4. Sum767. Article caption and Dataset1 identify N733. European459/733=62.6194%, incompatible with reported67%. No justified correction of459 or140 or67 is available. Preserve reported67% as authors' statement, explicitly note that displayed legend does not reconcile and downloadable Data1 cannot adjudicate it.
- Independent visual inspection of Figure4 PNG confirms panelc printed **r=+0.11,p=.643**. Main Results explicitly calls point estimate negative and writes **r=-.11,p=.643**. Data2 unrelated; supplementaryPDF includes neither country-height/score raw values for this comparison nor corrected r. Do not silently choose sign. Say weak, statistically nonsignificant association, and explicitly disclose sign discrepancy adjacent to image/text; nonsignificance and magnitude coincide.
- Images: work/sources/Fig1.png and Fig4.png downloaded200 from original article media source, full paths analogous to Fig2 above. Main Fig4 has19populationlabels, consistent with7exclusions from26.

The initial Data1 inspection attempted iterating every column using the styled max_column, producing an unhelpful long empty-column output; task-owned reader process terminated and rerun over actual nonempty cells. The corrected inspection is complete for cell data and preserves its source. No files were edited in source workbook, no omissions treated as evidence.
