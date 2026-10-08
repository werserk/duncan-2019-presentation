# Duncan 2019: slides 6–10

## Authority, continuity and scope

User accepted retained21core+7optional outline and now requests design, speaker scripts and implementation of next5slides. Scope: main6–10; preserve polished1–5andoptional3a. No addedoptional7a/9a, realrevealinteraction, remaining11–21, remote/publicdelivery orcommit. Use installed presentation-narrative/presentation-design/html-slide-builder with establishedCoal/no-gradient preference. Userauthorizesdesign+implementation together, so no additional brainstormapproval ceremony.

Currentmap work/slides-v4-record.md. SourceHTML/CSS canonical; buildpackagesofflineHTMLandexportsallnotes. Viewer core/optionalroute andprogressderivedfrompages; newtotal10required/11physical. Existinghardcoded5/6inbuild/checks must become derived/explicitnewcontract rather than misleadingstatus. TOC should derivefrommainpageIDs/folios atbuildtime. Threeoriginalfiguremodal targets need sameeventpath; oldFigure1controlsretainbehavior.

Source: work/article.txt Results Fig2/3, MethodsPart1/2; scientific-source-findings.md matchedperformance/uncertainty; originals sources/Fig2.png,figure-3.png. Avoid network/imageediting: originals shown by CSScrops; completeoriginals available inlocaldialog.

## Narrative and composition

6 — «Один PGS — сопоставимые сравнения» (~1.5–2min). Diagram uses same geneticweights/scoring forEuropean andothergroup within eachpublication. 26publications is scale; onepublication cancontributemorethanonecomparison. Fourheldconditions: genotypingchip, variantweights, scoringalgorithm, phenotype-measurementmethods. Screen shows sharedmodel→twotargetgroups, compactconditions, meaning. Voice connects previousrepresentation result to measuringprediction, explains whyconditions matter, and why26isnot26points. DoesnotclaimallmodelsEuropean-only or that allpopulationdifferencesexceptancestryarecontrolled.

7 — «Одно сравнение: 0,4% против 3,2%» (~2min). RealMethods schizophrenia/Purcell2009 example. Twofigurevalues: African0.4%,European3.2% explainedvariance; normalize0.4/3.2×100=12.5%. ConceptualQ=100×EnonEUR/EEUR with E=metricinthegivenmatchedcomparison;100%means equalmetric. Shortcontext: heterogeneousR²/β/log(OR)/AUC acrossstudies, matchedmetricwithinpair. Explain meaning, notpercentcorrectdiagnoses orcommonloss. Do not claimclassicalordinaryR²formulaisexactmeasureforbinaryschizophrenia. Numericalexampleismaincontentfrompaper, syntheticR²appendixnotimplemented.

8 — «Как различается предсказательная способность?» (~2.5min). OriginalFig2top-rightmedianplot visiblylarge(left~620×380CSScrop); rightthreeexactreportedmediansAFR42,SAS60,EAS95withfullnames. Originalplot includesLatino/Hispanic&Americas without inventingexactmedian. Show100%equalperformance meaning and lowerrelativeAFRcentralresult. Voice explains oneforestplotrow/within-studycomparison, heterogeneity/dispersion, originalpointsize significance(notN),noSEbecausemanypaperslackinformation. Full1771×1838forestplotview accessibleviaFig2button; reserve includes56visuallycountedcomparisons, metriclimitsandmixeddiscoverysampleexceptions. Screen labels mediansofrelativepredictionmetrics, not42%accuracy/probability/R². Originalcaptioncitationretained.

9 — «Размер снижения и статистическая оценка» (~1.5min). Twoanswers:median42%meaning versusauthorreportedAFRt=-5.97,df24,p3.7e-6. Explicit42%median/t-testseparateassessment; tinterpretationnegativeeffectconsistentwithmeanbelow100 butexactauthorcall/vectornotavailable, nofulltestreproductionclaim. Explainpunderhypothesisandassumptions, notprobabilityhypothesisfalse. SAS/EASdeclinenotsignificantdoesnotestablishequality. Screenminimalvalues,meaning; reserve includesconsistentone-sampleinterpretationanduncertaininputs. No syntheticttestappendiximplemented.

10 — «Настройки расчёта меняют распределения PGS» (~1.5min). FirstbriefviewofFig3ownexperiment. Fixedpeople1000Genomes+UKBiobankheightGWASweights; onlyvariantinclusionthresholdchanged betweenALLreference,r²=.2toprowfirstcolumns ina/b. CSScroporiginalpanels, fiveoriginalpopulationcolorslegend. LeftgenomewidesignificantpT<5e-8/rightfullsetpT≤1. xPGS/yDensity; axisrangesnotnumericmatchedorclaimofabsolutePGSshiftacrosssettings. Voice explaincurvesandthresholdmeaningminimally,comparevisibleforms,concludePGSdistributionsdependonchoices;performancecannotbereadfromdistributionalone. Transitions11datadesignand12methoddefs; nofullFig3resultanalysisduplicates14. OriginalcompleteFig3dialogavailable.

## Speaker states and source limits

Eachslidewrittenasopeningand3–4meaningfulclickgroupsplusready-to-saytransition; preserveexistingstaticall-visibleviewer. Reserveparatefrommainvoice. Stategroupseachintroduceobjectsbeforeformula/claimandgivepurpose. No narratorproductionmetadataoncanvas beyondsupportingcitation/metricconditionneededforinterpretation.

Importantlimits: metrics normalizedwithinpublication andpooledheterogeneously; percentageofmetricnotcommonaccuracy. Negative/over100ratiospossible. 26publications; noinventedcount. AFRmedian42separatefromtestofmean. One-samplettestconsistentwithdf24/25AFRpoints, notverifiedimplementation. Exactnormalization/SEreproductionnotavailable. Fig3onlyheightUKBweights; genotypepopulationandLDreferencepopulationare differentconcepts. 1000G2577Resultsversus1940Methodsambiguitykeptforlaterdesignnotes, not silentlyresolved.

## Implementation and verification

Archiveallsources/build/tests/outputs beforemutations. Add5mainarticlesandscopedstyles; retainotherarticleblocksbyte-identical. Generalizebuildnoteheading/status/TOCfromcanonicalpages. Parameterizefiguremodalroutingminimallyinnotes.js withdata-figuretarget, nativeescape/focusreturnpreserved. Keepprintedoriginalmodalhidden andall11slidesvisible. Updateexistingchecksfor10core/11physical andnewmodalpaths; add targetedcandidatechecks forpublishednumbers, exactexample12.5,sourcecropselection,geometry/notes/light/dark/narrow/offline/history/progress/optionalroute. Exportstatic11pagePDF, inspectfiveactualPDFpages aswellasscreens. Reviewcompletecandidateindependentlyagainstplan+sources, recordspecificsubjects/verdicts, recoveranyfoundissues.

Patternrecord: priorpolishfoundoverflowfromstackedparagraphs. Probeallnewsubstantiveblocksforcanvasbounds beforedelivery, no reducingrequiredmeaningtosqueeze. Allscientificnumberssinglecanonicalsourceinslidecontent/authorcitations; no duplicatednumericconstantinthetesttreatedasauthorinput.

## Verified migration and review amendments

CanonicalGitcheckout is work/duncan-2019-presentation, cleanbase dacbc14 branchpolish/consistency. Nowcontent/slides-6-10. work/slides is anexistingalias, outerbuild isdeliverywrapper. Canonicaldocs/ARCHITECTURE.md andGLOSSARY.md supersedeoldmap forcurrentstate; honorshared44pxheaders48/48originand terminology«полигенная оценка»/«качество предсказания». NewreporteddataJSON keepsrepeatednewscientificvalues canonical; builderresolveslabels/notes. OriginalsFigure2/3 copiedfromretainedsourcebytes; noimageediting.

IndependentINTENTION reviewer /root/narrative_fidelity_review PASS, withamendments: row-levelFig2discussiononlyafterexplicitopeningfullfigureorreserve; mean-vs100ttestinterpretationdescribedasconsistentnotreproduced; currentmap/README/checks updated. Latestsourceplotfractionsandforestdetails retainedinreserveuntilvisible. Sourcehistoryarchive before-slides-6-10-dacbc14.

## Repository handoff after user steering

The user's latest message makes the GitHub repository and a separate content branch the collaboration surface. Save the reviewed block as one content commit on content/slides-6-10; use the configured private remote for the branch handoff. Main/other branches are not merged or rewritten. Keep the independent candidate receipt distinct from intention and record actual publication outcome. This supersedes the original no-commit execution assumption above.
