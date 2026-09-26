import type { SeedCourse } from "./types";

/**
 * "How to start research" — the mini-course the spec describes, from "what even
 * is research" to presenting it. Written for someone with no lab, no mentor and
 * no idea where to begin, because that is who actually needs it.
 */

export const RESEARCH_COURSES: SeedCourse[] = [
  {
    slug: "research-fundamentals",
    track: "Research",
    title: "Research Fundamentals",
    subtitle: "From no experience to a real research question",
    description:
      "Ten short lessons that take you from not knowing what research is to having a question you could actually answer, and a plan for answering it.",
    difficulty: "beginner",
    subjects: ["physics", "biology", "engineering", "chemistry", "data-science", "social-sciences", "medicine"],
    audiences: ["school", "university"],
    goalSlugs: ["start-research", "get-into-university", "build-portfolio"],
    accent: "amber",
    lessons: [
      {
        slug: "what-is-research",
        title: "What research actually is",
        objective: "Tell research apart from a report.",
        estMinutes: 6,
        theory:
          "Most school projects are reports: you find out what is already known and write it down clearly. That is a useful skill, and it is not research.\n\nResearch produces something that was not in the sources you read. It answers a question nobody has answered in that exact form, even a very small one.\n\nThe scale can be tiny and it still counts. \"Does the local river's nitrate level change between weekdays and weekends?\" is real research if nobody has measured it. It has a question, a method, data and a conclusion that could have come out either way.\n\nThat last part matters most. If you already know what you will conclude, you are writing a report.",
        example:
          "**Report:** \"The effects of microplastics on marine life\" — summarising existing studies.\n\n**Research:** \"Microplastic counts in sediment at three points along one beach, sampled before and after the tourist season.\" — a question, your own data, and an answer that was genuinely unknown beforehand.\n\nThe second is far narrower. That is what makes it doable.",
        takeaway: "Research answers a question whose answer you do not already know.",
        questions: [
          {
            prompt: "What distinguishes research from a report?",
            options: [
              "Research is longer",
              "Research produces a finding that was not already in the sources",
              "Research requires a laboratory",
              "Research must be published",
            ],
            correctIndex: 1,
            explanation:
              "Novelty of the finding is the dividing line — not length, equipment or publication. A short study with original data is research; a long literature summary is not.",
          },
          {
            prompt: "You already know what your conclusion will be. This means:",
            options: [
              "Your research is well designed",
              "You are writing a report, not doing research",
              "You should collect data anyway",
              "You have a strong hypothesis",
            ],
            correctIndex: 1,
            explanation:
              "A genuine research question can come out more than one way. A predetermined conclusion means there is nothing to find out.",
          },
          {
            prompt: "Which is the most realistic first research project?",
            options: [
              "A cure for a disease",
              "Nitrate levels at three points on one local river over four weeks",
              "A complete theory of consciousness",
              "A review of everything written about climate change",
            ],
            correctIndex: 1,
            explanation:
              "It is narrow, measurable with accessible equipment, and finishable. The first two are far beyond a first project, and the last is a report.",
          },
        ],
      },
      {
        slug: "finding-a-problem",
        title: "Finding a problem worth studying",
        objective: "Generate candidate problems from your own surroundings.",
        estMinutes: 8,
        theory:
          "Nobody hands you a research problem. You notice one.\n\nThree places they reliably come from:\n\n**Friction you observe.** Something in your school, town or hobby that works badly. Why does it work badly? Is the cause measurable?\n\n**The 'future work' section.** Every paper ends by naming what it did not do. This is the most underused source of research ideas available to a beginner — the authors are literally listing open questions.\n\n**A local version of a known question.** A study measured something in one place. Nobody has measured it where you are. Same method, new data, genuine finding.\n\nThat third route is how most first research projects happen, and there is nothing second-rate about it.",
        example:
          "Observation: the bus outside school is always late in winter, never in summer.\n\nQuestions it suggests: does cold weather increase journey time on this route? Is the delay from the weather itself or from higher passenger numbers? Do boarding times rise when passengers wear heavy coats?\n\nThe third is oddly specific, measurable with a stopwatch, and almost certainly unstudied on that route. That is a real project.",
        takeaway: "Look for friction, read 'future work' sections, or localise a known question.",
        questions: [
          {
            prompt: "Where in a published paper do authors list open questions?",
            options: [
              "The abstract",
              "The methods section",
              "The future work or limitations section",
              "The references",
            ],
            correctIndex: 2,
            explanation:
              "Future work and limitations sections state plainly what the study did not resolve, which makes them the richest source of ready-made research questions.",
          },
          {
            prompt: "Repeating a known study's method in your own location is:",
            options: [
              "Plagiarism",
              "Legitimate research producing new data",
              "Only acceptable at university level",
              "Pointless, because the answer is known",
            ],
            correctIndex: 1,
            explanation:
              "The method is reused, but the data and finding are new. Replication in a new context is a standard and respected way to contribute.",
          },
          {
            prompt: "The best first source of research problems is:",
            options: [
              "Whatever topic sounds most impressive",
              "Something you have personally observed going wrong",
              "The most cited paper in a field",
              "A topic your friend is doing",
            ],
            correctIndex: 1,
            explanation:
              "Problems you have observed come with context, access and motivation — the three things that determine whether a first project gets finished.",
          },
        ],
      },
      {
        slug: "research-question",
        title: "Writing the research question",
        objective: "Turn a vague interest into one answerable question.",
        estMinutes: 8,
        theory:
          "A good research question is narrow enough to answer and specific enough that you know when you are done.\n\nCheck it against four things:\n\n• **Answerable** — could evidence settle it? \"Is art important?\" cannot be settled.\n• **Specific** — what exactly, measured how, where, among whom?\n• **Bounded** — could you finish it this term with what you have?\n• **Uncertain** — do you genuinely not know the answer?\n\nThe usual failure is being too broad. Narrowing feels like giving up ambition; it is the opposite. Narrow questions get answered, and answered questions become papers, applications and conversations with mentors.",
        example:
          "❌ \"How does social media affect teenagers?\" — unanswerable as stated, unbounded, thousands of papers already.\n\nNarrowing, step by step:\n\n→ How does social media affect teenagers' sleep?\n→ Does evening phone use affect sleep duration in teenagers?\n→ **Among 60 students at my school, is self-reported phone use after 22:00 associated with shorter sleep duration on school nights?**\n\nThe last one is answerable with a survey you could run in two weeks.",
        takeaway: "Answerable, specific, bounded, uncertain. Narrow until all four are true.",
        questions: [
          {
            prompt: "Which is the strongest research question?",
            options: [
              "Is technology good for education?",
              "How does the internet work?",
              "Among Year 10 students at one school, does using a spaced-repetition app for four weeks change vocabulary test scores?",
              "What is the future of artificial intelligence?",
            ],
            correctIndex: 2,
            explanation:
              "It names the population, the intervention, the timeframe and the measurement — so it can be answered and you know when it is finished. The others are unbounded or not empirical questions at all.",
          },
          {
            prompt: "A question you already know the answer to fails which test?",
            options: ["Answerable", "Specific", "Bounded", "Uncertain"],
            correctIndex: 3,
            explanation:
              "Uncertainty is what gives the project a point. Without it there is nothing to find out, however well-specified the question is.",
          },
          {
            prompt: "Narrowing a research question mainly:",
            options: [
              "Reduces how impressive it is",
              "Makes it possible to actually finish and answer",
              "Is only needed for school projects",
              "Means studying something unimportant",
            ],
            correctIndex: 1,
            explanation:
              "Narrow scope is what makes completion realistic. A finished narrow study is worth far more than an abandoned broad one.",
          },
        ],
      },
      {
        slug: "literature-search",
        title: "Searching the literature",
        objective: "Find out what is already known without paying for papers.",
        estMinutes: 9,
        theory:
          "Before collecting data, find out whether someone has already answered your question. This takes an afternoon and saves months.\n\nWhere to look, free:\n\n• **Google Scholar** — broadest coverage. Use the \"Cited by\" link to move forward in time from an older paper.\n• **PubMed** — anything biomedical.\n• **arXiv** — physics, maths, CS, often the newest work.\n• **DOAJ** — open-access journals across fields.\n\nTwo techniques do most of the work. **Citation chaining backwards**: take one relevant paper and read its reference list. **Citation chaining forwards**: use \"Cited by\" to find newer work building on it. A few rounds of this maps a small field surprisingly well.\n\nIf a paper is paywalled, email the corresponding author. Most send it. This is normal academic practice, not a favour.",
        example:
          "Searching *\"phone use\" sleep adolescents* on Google Scholar returns thousands of results. Filter to the last five years and read five abstracts.\n\nOne review looks central. Its reference list gives you the foundational studies (backwards). Its \"Cited by\" gives you this year's work (forwards).\n\nAfter two hours you know the standard measurement instruments, the typical sample sizes, and — crucially — that most studies use self-reported sleep, which is a limitation you could improve on.",
        takeaway: "Chain citations backwards and forwards from one good paper. Email authors for paywalled work.",
        questions: [
          {
            prompt: "What does the 'Cited by' link on Google Scholar give you?",
            options: [
              "The paper's own reference list",
              "Newer papers that cite this one",
              "The author's other work",
              "A free PDF",
            ],
            correctIndex: 1,
            explanation:
              "'Cited by' moves forward in time, showing later work built on that paper — the fastest way to find the current state of a small field.",
          },
          {
            prompt: "A paper you need is behind a paywall. The best free step is:",
            options: [
              "Give up and find another paper",
              "Email the corresponding author to request a copy",
              "Pay the publisher",
              "Cite it without reading it",
            ],
            correctIndex: 1,
            explanation:
              "Authors are routinely asked for copies of their own work and usually send them. Citing something unread is the one option that is actually wrong.",
          },
          {
            prompt: "Why search the literature before collecting data?",
            options: [
              "It is required for publication",
              "To check whether your question is already answered, and to learn the standard methods",
              "To increase your reference count",
              "To fill the introduction",
            ],
            correctIndex: 1,
            explanation:
              "You find out whether the question is still open and how others measured it — both of which change your design before it is too late to change.",
          },
        ],
      },
      {
        slug: "evaluating-sources",
        title: "Judging whether a source is solid",
        objective: "Assess a study's reliability past its headline.",
        estMinutes: 8,
        theory:
          "Not every published paper is sound, and not every unpublished thing is unsound. Judge the work, not the packaging.\n\nFour questions get you most of the way:\n\n**Who measured it, and could they lose from the answer?** Funding by an interested party is not automatic disqualification, but it changes how carefully you read.\n\n**How many, and who?** Twelve volunteers from one university is a different claim from four thousand people across a country.\n\n**Is it peer reviewed?** A preprint may be excellent but has not been checked. Say which you are citing.\n\n**Does the conclusion match the data?** This is the most common real problem. A study finding a correlation very often gets described — by its own authors — as showing a cause.",
        example:
          "Headline: \"Study shows breakfast improves exam results.\"\n\nThe study: 200 students, those who reported eating breakfast scored higher.\n\nWhat it actually shows: an association. Students who eat breakfast may also have more stable home routines, more sleep, or more money — any of which could drive the scores.\n\nThe finding is real. The causal claim in the headline is not supported by this design.",
        takeaway: "Check funding, sample, review status, and whether the conclusion outruns the data.",
        questions: [
          {
            prompt: "A study finds two things occur together and concludes one causes the other. This is:",
            options: [
              "Sound reasoning",
              "A conclusion that outruns the data",
              "Acceptable if the sample is large",
              "Only a problem in medicine",
            ],
            correctIndex: 1,
            explanation:
              "Observed association does not establish direction or rule out a third factor driving both. Large samples make the association more precise, not more causal.",
          },
          {
            prompt: "A preprint is:",
            options: [
              "Always unreliable",
              "A paper shared before peer review",
              "A rejected paper",
              "A summary of a paper",
            ],
            correctIndex: 1,
            explanation:
              "Preprints circulate before review. Many are excellent and later published unchanged, but you should note the status when citing one.",
          },
          {
            prompt: "Industry funding of a study means:",
            options: [
              "The study must be ignored",
              "The study is automatically valid",
              "Read it more carefully for design choices that favour the funder",
              "It cannot be peer reviewed",
            ],
            correctIndex: 2,
            explanation:
              "Funding is a reason for closer scrutiny of the design and the outcome measures, not grounds for dismissal on its own.",
          },
        ],
      },
      {
        slug: "methodology",
        title: "Designing the method",
        objective: "Write a method someone else could repeat exactly.",
        estMinutes: 9,
        theory:
          "The test of a method section: could a stranger reproduce your study from it alone? If they would have to guess at anything, it is incomplete.\n\nSpecify four things:\n\n• **Variables** — what you change, what you measure, what you hold constant.\n• **Procedure** — the steps, in order, with quantities and timings.\n• **Sample** — how many, selected how.\n• **Analysis** — what you will do with the numbers, decided *before* you collect them.\n\nThat last point prevents the most common error in beginner research: collecting data, then hunting through it for any pattern that looks interesting. Decide in advance what you are testing, and the answer means something.",
        example:
          "❌ \"We tested different amounts of light on plants and measured growth.\"\n\n✅ \"Thirty bean seedlings were assigned to three groups of ten. Each group received 6, 12 or 18 hours of light per day from identical 800-lumen LED lamps at 30 cm. All other conditions — 20 °C, 50 ml water daily, the same soil mix — were held constant. Stem height was measured in millimetres every 48 hours for 21 days. Mean final height was compared across groups.\"\n\nThe second can be repeated. The first cannot.",
        takeaway: "Variables, procedure, sample, analysis — and choose the analysis before collecting data.",
        questions: [
          {
            prompt: "The test of a good method section is:",
            options: [
              "It is written in formal language",
              "A stranger could reproduce the study from it alone",
              "It is under one page",
              "It cites many sources",
            ],
            correctIndex: 1,
            explanation:
              "Reproducibility is the purpose of the section. Anything a reader would have to guess at is a gap in the method.",
          },
          {
            prompt: "Why decide your analysis before collecting data?",
            options: [
              "It is faster",
              "So you are testing a stated prediction rather than hunting for any pattern that appears",
              "Journals require it",
              "It makes the data easier to collect",
            ],
            correctIndex: 1,
            explanation:
              "Searching collected data for whatever looks striking will find something by chance. Committing in advance is what makes a positive result meaningful.",
          },
          {
            prompt: "'Held constant' refers to:",
            options: [
              "The variable you measure",
              "The variable you change",
              "Conditions kept the same across groups so they cannot explain the difference",
              "The sample size",
            ],
            correctIndex: 2,
            explanation:
              "Controlled conditions rule out alternative explanations. If water or temperature varied with light level, you could not attribute growth differences to light.",
          },
        ],
      },
      {
        slug: "collecting-data",
        title: "Collecting data you can trust",
        objective: "Record data so it is still usable in three months.",
        estMinutes: 7,
        theory:
          "Data collection is mostly discipline. A few habits separate usable data from a folder you cannot interpret later.\n\n**Record raw values, never just summaries.** You can always compute an average later; you cannot recover the numbers it came from.\n\n**Timestamp everything**, and note the conditions — who measured, with what, in what circumstances.\n\n**Write down anomalies rather than dropping them.** The seedling the cat knocked over is a note, not a silent deletion.\n\n**Keep one raw file untouched** and do all cleaning in a copy. When an analysis looks wrong, you need to be able to go back.\n\nAnd decide before you start what a missing value means — not measured, or measured as zero. These are different, and mixing them silently corrupts an analysis.",
        example:
          "A usable spreadsheet has one row per observation:\n\n`plant_id, group, day, height_mm, measured_at, notes`\n`A1, 6h, 2, 41, 2026-03-04T09:12Z, `\n`A2, 6h, 2, 38, 2026-03-04T09:14Z, leaf damaged\n`\n\nOne row per measurement, raw values, timestamps, a notes column. This is still analysable next year. A sheet holding only three group averages is not.",
        takeaway: "Raw values, one row per observation, timestamps, notes — and never edit the original file.",
        questions: [
          {
            prompt: "Why record raw values rather than only averages?",
            options: [
              "Averages are harder to calculate",
              "You can always compute summaries from raw data, but never recover raw data from summaries",
              "Raw values look more professional",
              "Averages are not allowed in research",
            ],
            correctIndex: 1,
            explanation:
              "Summarising is one-directional. Keeping raw observations leaves every later analysis open to you; keeping only averages closes most of them.",
          },
          {
            prompt: "An unusual observation you cannot explain should be:",
            options: [
              "Deleted quietly",
              "Recorded with a note about the circumstances",
              "Replaced with the group average",
              "Rounded to fit the trend",
            ],
            correctIndex: 1,
            explanation:
              "Anomalies are data. Recording them with context lets you decide transparently later whether to exclude them, and say so.",
          },
          {
            prompt: "A blank cell in your data should mean:",
            options: [
              "Zero",
              "Whatever is convenient",
              "One thing you defined before collection started",
              "The average of nearby values",
            ],
            correctIndex: 2,
            explanation:
              "'Not measured' and 'measured as zero' are different facts. Deciding the convention up front keeps them from being silently conflated in analysis.",
          },
        ],
      },
      {
        slug: "analysis",
        title: "Analysing results honestly",
        objective: "Describe what your data shows, and what it does not.",
        estMinutes: 8,
        theory:
          "Start by looking at the data. Plot it before you calculate anything — a graph reveals in a second what a table of means hides.\n\nThen report three things together: the **central value** (mean or median), the **spread** (range or standard deviation), and the **sample size**. A mean without spread and n is close to meaningless; \"group A averaged 52 mm\" tells a reader far less than \"52 mm (range 44–61, n = 10)\".\n\nAnd separate two sentences that beginners merge. *What the data shows* is description. *What it might mean* is interpretation. Keep them in different sentences, and label the second as interpretation.\n\nA result that contradicts your hypothesis is a finding, not a failure. Report it plainly. Reviewers and admissions readers can tell the difference between a null result honestly reported and a weak result oversold — and they trust the first.",
        example:
          "❌ \"More light makes plants grow faster, as we predicted.\"\n\n✅ \"Mean final height was 52 mm (range 44–61) at 6 hours, 71 mm (range 62–80) at 12 hours and 69 mm (range 55–83) at 18 hours, with n = 10 per group.\n\nGrowth increased between 6 and 12 hours but not between 12 and 18, where the groups overlap substantially. This is consistent with a saturation point, though with ten plants per group and one trial we cannot distinguish that from variation between individual plants.\"",
        takeaway: "Plot first. Report centre, spread and n. Keep description and interpretation in separate sentences.",
        questions: [
          {
            prompt: "Reporting a mean without the spread or sample size is a problem because:",
            options: [
              "It is too short",
              "A reader cannot tell how reliable or variable the result is",
              "Means are less accurate than medians",
              "Journals prefer medians",
            ],
            correctIndex: 1,
            explanation:
              "Two studies with the same mean can support opposite conclusions depending on spread and n. Without them the number cannot be interpreted.",
          },
          {
            prompt: "Your results contradict your hypothesis. You should:",
            options: [
              "Repeat the experiment until it agrees",
              "Report the result plainly as a finding",
              "Leave that data out",
              "Change the hypothesis and not mention the original",
            ],
            correctIndex: 1,
            explanation:
              "A well-run study that disconfirms a prediction is a genuine contribution. The alternatives all involve misrepresenting what happened.",
          },
          {
            prompt: "What should you do before calculating statistics?",
            options: [
              "Write the conclusion",
              "Plot the data and look at it",
              "Remove outliers",
              "Round all values",
            ],
            correctIndex: 1,
            explanation:
              "A plot shows shape, clusters and errors that summary statistics conceal — including mistakes in the data itself.",
          },
        ],
      },
      {
        slug: "writing-it-up",
        title: "Writing it up",
        objective: "Structure a paper and write the abstract last.",
        estMinutes: 8,
        theory:
          "Research writing has a fixed structure, which is good news: you never have to invent the shape.\n\n**Abstract** — the whole study in 150–250 words. **Introduction** — what is known, what is missing, your question. **Methods** — what you did, reproducibly. **Results** — what you found, no interpretation. **Discussion** — what it means, limitations, what next. **References**.\n\nTwo rules save the most pain.\n\n**Write the abstract last.** It summarises a paper, so it cannot be written before the paper exists.\n\n**Keep interpretation out of Results.** Results says \"scores rose by 12 points\". Discussion says \"this suggests the intervention helped, though we cannot rule out practice effects\". Mixing them makes it impossible for a reader to separate your data from your reading of it.\n\nState limitations yourself. Every study has them, a reader will find them, and naming them first reads as competence rather than weakness.",
        example:
          "An abstract, in five sentences, one per element:\n\n\"Adolescent sleep duration has been linked to evening screen use, but most studies rely on self-report alone. *(context)* We asked whether phone use after 22:00 is associated with shorter school-night sleep among Year 10 students. *(question)* Sixty students recorded bedtime, wake time and phone use for fourteen days. *(method)* Students reporting use after 22:00 on more than half of nights slept 41 minutes less on average (n = 60, range 12–78 minutes). *(finding)* The association is consistent with displaced bedtime, though self-reported use may be underestimated and the design cannot establish direction. *(meaning and limits)*\"",
        takeaway: "Fixed structure, abstract last, no interpretation in Results, state your own limitations.",
        questions: [
          {
            prompt: "When should the abstract be written?",
            options: ["First, to plan the paper", "After the introduction", "Last", "It is optional"],
            correctIndex: 2,
            explanation:
              "An abstract condenses the finished paper, including the actual results and conclusions. Writing it first means summarising something that does not exist yet.",
          },
          {
            prompt: "Which sentence belongs in Results rather than Discussion?",
            options: [
              "This suggests the method is effective for younger students.",
              "Mean score rose from 54 to 66 points (n = 30).",
              "Future work should use a control group.",
              "The effect may be due to increased motivation.",
            ],
            correctIndex: 1,
            explanation:
              "Results reports measurements only. The other three interpret, recommend or speculate, all of which belong in the Discussion.",
          },
          {
            prompt: "Stating your study's limitations:",
            options: [
              "Weakens the paper and should be avoided",
              "Signals competence and pre-empts the reader's objections",
              "Is only needed if reviewers ask",
              "Should be hidden in the methods",
            ],
            correctIndex: 1,
            explanation:
              "Readers will identify the limitations regardless. Naming them shows you understand your own design and makes your stated conclusions more credible.",
          },
        ],
      },
      {
        slug: "presenting",
        title: "Presenting your research",
        objective: "Explain your work in three minutes to a non-specialist.",
        estMinutes: 7,
        theory:
          "You will explain your research far more often than anyone reads it — to a teacher, an interviewer, a competition judge, a prospective mentor. Three minutes, no jargon.\n\nA reliable four-beat structure:\n\n1. **The problem**, in one sentence a non-specialist understands.\n2. **What you did**, in two sentences.\n3. **What you found**, with one number.\n4. **Why it matters**, in one sentence.\n\nThat is about 150 words. Practise it out loud until it is comfortable, because reading it silently is not the same skill.\n\nFor a poster or slides, the rule is one idea per panel and the finding in the largest type on the page. Most beginner posters are dense walls of method — but the finding is what a passing judge needs to see from two metres away.",
        example:
          "\"Teenagers sleep less than they used to, and phones are the usual suspect — but most studies just ask people to estimate their own screen time. *(problem)*\n\nI had sixty students in my year log their bedtime, wake time and phone use every night for two weeks. *(what I did)*\n\nStudents on their phones after ten most nights slept about 41 minutes less. *(finding, one number)*\n\nForty minutes a night is most of an hour of lost sleep across a school week, and unlike most factors affecting teenage sleep, it is one a student can actually change. *(why it matters)*\"",
        takeaway: "Problem, method, one number, why it matters. Practise it out loud.",
        questions: [
          {
            prompt: "How many numbers should a three-minute explanation of your research include?",
            options: ["None", "One key finding", "All your results", "At least five"],
            correctIndex: 1,
            explanation:
              "One number is memorable and anchors the finding. A stream of figures in speech is impossible for a listener to hold.",
          },
          {
            prompt: "On a research poster, the largest text should be:",
            options: [
              "The title of your school",
              "The methods",
              "The main finding",
              "The reference list",
            ],
            correctIndex: 2,
            explanation:
              "Someone walking past reads one thing. Making it the finding is what earns the conversation where the method can be discussed.",
          },
          {
            prompt: "Why practise the explanation out loud?",
            options: [
              "To memorise it word for word",
              "Because speaking fluently is a different skill from reading silently",
              "It is required by competitions",
              "To time it exactly to three minutes",
            ],
            correctIndex: 1,
            explanation:
              "Sentences that read smoothly often stall when spoken. Saying it aloud is what surfaces the awkward transitions while you can still fix them.",
          },
        ],
      },
    ],
  },
];
