import type { SeedCourse } from "./types";

export const IELTS_COURSES: SeedCourse[] = [
  {
    slug: "ielts-writing",
    track: "IELTS",
    title: "IELTS Writing",
    subtitle: "Task 1 and Task 2, one paragraph at a time",
    description:
      "Writing is where most band scores stall. These lessons drill the structures examiners are trained to look for.",
    difficulty: "intermediate",
    subjects: ["humanities"],
    audiences: ["school", "university", "graduate"],
    goalSlugs: ["improve-ielts", "get-into-university"],
    accent: "sky",
    lessons: [
      {
        slug: "task2-introduction",
        title: "Task 2 — the introduction",
        objective: "Write a two-sentence introduction that states a clear position.",
        estMinutes: 7,
        theory:
          "A Task 2 introduction needs exactly two sentences, and it should take you under four minutes.\n\n**Sentence 1 — paraphrase the prompt.** Not copy. Change the nouns and the verbs, keep the meaning.\n\n**Sentence 2 — state your position.** Directly. Examiners mark you down for a position they have to guess at, so no \"this essay will discuss both sides\" without saying where you land.\n\nDo not write background sentences like \"In today's modern world, technology is everywhere.\" They score nothing and eat your time.",
        example:
          "Prompt: *Some people think governments should fund public transport rather than build new roads. Do you agree or disagree?*\n\n\"There is ongoing debate over whether public money is better spent expanding bus and rail networks or widening the road system. I strongly agree that investment should go to public transport, primarily because it moves more people for each unit of space and emissions.\"\n\nParaphrase, then position — with the reason previewed.",
        takeaway: "Two sentences: paraphrase, then commit to a position. No background filler.",
        questions: [
          {
            prompt: "How many sentences should a Task 2 introduction contain?",
            options: ["One", "Two", "Four to five", "As many as needed"],
            correctIndex: 1,
            explanation:
              "Two is the efficient standard: one paraphrase and one position statement. More sentences take time away from the body paragraphs, where most marks live.",
          },
          {
            prompt: "Which opening is strongest?",
            options: [
              "In today's modern world, education is very important for everyone.",
              "This essay will discuss both sides of the argument about school hours.",
              "Opinion is divided over whether the school day should be shortened. I believe it should, chiefly because concentration falls sharply after six hours.",
              "I will talk about shortening the school day in this essay.",
            ],
            correctIndex: 2,
            explanation:
              "It paraphrases the topic and states a clear position with a reason. The others are empty background, a statement of intent with no position, or too vague to score.",
          },
          {
            prompt: "Why is copying words directly from the prompt a problem?",
            options: [
              "It is against the exam rules",
              "Copied text does not count towards your word count or demonstrate vocabulary range",
              "It makes the essay too long",
              "Examiners cannot read it",
            ],
            correctIndex: 1,
            explanation:
              "Lexical resource is a scored criterion. Copied wording shows the examiner nothing about your own vocabulary, and copied stretches are discounted from the word count.",
          },
        ],
      },
      {
        slug: "task2-body",
        title: "Task 2 — body paragraphs",
        objective: "Build a body paragraph that develops one idea properly.",
        estMinutes: 8,
        theory:
          "One paragraph, one idea. Two well-developed paragraphs beat four thin ones every time.\n\nUse **PEEL**:\n\n• **Point** — the topic sentence, stating the idea.\n• **Explain** — why it is true. This is the sentence candidates skip, and it costs them the most.\n• **Example** — something specific. An invented but plausible example is fine.\n• **Link** — tie it back to your position.\n\nThe common failure is a paragraph that lists three ideas with one sentence each. Depth scores; breadth does not.",
        example:
          "**Point:** Public transport uses urban space far more efficiently than private cars.\n\n**Explain:** A single bus lane can carry several thousand passengers an hour, whereas the same width of road carries only a few hundred drivers, so widening roads tends to fill with traffic rather than relieve it.\n\n**Example:** Cities that added bus rapid transit corridors, such as Bogotá, moved substantially more commuters without acquiring new land.\n\n**Link:** For dense cities, then, transit investment addresses congestion at its cause.",
        takeaway: "One idea per paragraph, and never skip the Explain sentence.",
        questions: [
          {
            prompt: "Which part of PEEL do candidates most often omit?",
            options: ["Point", "Explain", "Example", "Link"],
            correctIndex: 1,
            explanation:
              "Most candidates state an idea and jump to an example. The 'Explain' sentence — the reasoning that connects them — is what raises the Task Response score.",
          },
          {
            prompt: "How many main ideas should one body paragraph develop?",
            options: ["One", "Two", "Three", "As many as fit"],
            correctIndex: 0,
            explanation:
              "One idea, developed fully. Listing several ideas shallowly reads as underdeveloped, which caps Task Response.",
          },
          {
            prompt: "Is it acceptable to invent a plausible example in Task 2?",
            options: [
              "No, examples must be verifiable",
              "Yes, examples are judged on relevance and clarity, not on being checkable",
              "Only if you say it is hypothetical",
              "Only for Task 1",
            ],
            correctIndex: 1,
            explanation:
              "IELTS does not fact-check. A specific, relevant, clearly explained example supports your point whether or not it is a real case study.",
          },
        ],
      },
      {
        slug: "task1-overview",
        title: "Task 1 — the overview sentence",
        objective: "Describe the big trend in a chart without listing every number.",
        estMinutes: 7,
        theory:
          "Every Academic Task 1 answer needs an overview, and leaving it out caps your Task Achievement score no matter how good the rest is.\n\nAn overview states the **largest pattern** — the highest and lowest values, the overall direction, or the main contrast. It contains no specific figures; those belong in the detail paragraphs.\n\nSpend a minute before writing asking one question: if someone could read only one sentence about this chart, what would they most need to know?",
        example:
          "A line graph shows coffee, tea and cocoa consumption over thirty years.\n\n❌ \"Coffee was 1.2 kg in 1990, 1.5 kg in 2000 and 2.1 kg in 2020.\" — that is detail, not an overview.\n\n✅ \"Overall, coffee consumption rose steadily across the period and overtook tea midway through, while cocoa remained the least consumed of the three throughout.\"\n\nDirection, the main crossover, and the consistent lowest — no figures.",
        takeaway: "The overview carries the pattern; the body carries the numbers.",
        questions: [
          {
            prompt: "What happens if you omit the overview in Academic Task 1?",
            options: [
              "Nothing, it is optional",
              "Your Task Achievement score is limited",
              "You lose one mark",
              "The essay is not marked",
            ],
            correctIndex: 1,
            explanation:
              "The overview is a required element of Task 1. Without it, the band descriptors cap Task Achievement regardless of how accurate your detail is.",
          },
          {
            prompt: "Which belongs in an overview?",
            options: [
              "Exact figures for each year",
              "The overall direction and the highest and lowest categories",
              "Your opinion on the data",
              "Reasons the trend occurred",
            ],
            correctIndex: 1,
            explanation:
              "An overview reports the broad shape. Exact figures go in the body, and opinion or causes are not asked for in Task 1 at all.",
          },
          {
            prompt: "Should Task 1 include your opinion about the data?",
            options: [
              "Yes, in the conclusion",
              "No — Task 1 is description only",
              "Only if the chart is about a social issue",
              "Yes, in the overview",
            ],
            correctIndex: 1,
            explanation:
              "Academic Task 1 asks you to report and compare what the visual shows. Opinion is Task 2's job and is off-task here.",
          },
        ],
      },
    ],
  },
  {
    slug: "ielts-reading",
    track: "IELTS",
    title: "IELTS Reading",
    subtitle: "Finish all three passages in time",
    description:
      "Reading is a time-management test as much as a comprehension one. These lessons cover the two techniques that save the most minutes.",
    difficulty: "intermediate",
    subjects: ["humanities"],
    audiences: ["school", "university", "graduate"],
    goalSlugs: ["improve-ielts"],
    accent: "cyan",
    lessons: [
      {
        slug: "true-false-notgiven",
        title: "True / False / Not Given",
        objective: "Tell a contradiction apart from an absence of information.",
        estMinutes: 9,
        theory:
          "This question type has exactly one difficulty, and it is the line between False and Not Given.\n\n• **True** — the passage states the claim, in different words.\n• **False** — the passage states the *opposite* of the claim.\n• **Not Given** — the passage does not address the claim either way.\n\nThe trap is your own knowledge. If a statement seems obviously true but the passage never says it, the answer is Not Given. Ask only: does the text contradict this, or is it silent?\n\nWatch absolute words in the statement — *all, never, only, always*. A passage saying \"most\" contradicts a statement saying \"all\", which makes it False.",
        example:
          "Passage: \"The museum opened in 1923 and was funded entirely by private donations.\"\n\n• *The museum opened before 1930.* → **True** (stated, reworded).\n• *The museum received government funding.* → **False** (\"entirely private\" contradicts it).\n• *The museum is the oldest in the city.* → **Not Given** (no comparison is made).",
        takeaway: "False means the text contradicts it. Not Given means the text is silent. Your own knowledge is irrelevant.",
        questions: [
          {
            prompt:
              "Passage: 'All twelve sites surveyed showed traces of copper.' Statement: 'Some sites showed no copper.'",
            options: ["True", "False", "Not Given", "Partially true"],
            correctIndex: 1,
            explanation:
              "'All twelve' directly contradicts 'some showed none', so the statement is False rather than Not Given.",
          },
          {
            prompt:
              "Passage: 'The technique was developed in Japan in the 1960s.' Statement: 'The technique is now used worldwide.'",
            options: ["True", "False", "Not Given", "False and True"],
            correctIndex: 2,
            explanation:
              "The passage says where and when it was developed but nothing about its spread. Plausible as it sounds, the text is silent, so Not Given.",
          },
          {
            prompt: "A statement uses 'never' but the passage says 'rarely'. The answer is:",
            options: ["True", "False", "Not Given", "Cannot be determined"],
            correctIndex: 1,
            explanation:
              "'Rarely' means it does happen sometimes, which contradicts 'never'. Absolute words in a statement are a reliable signal to check for exactly this mismatch.",
          },
        ],
      },
      {
        slug: "skim-and-scan",
        title: "Skimming and scanning",
        objective: "Locate an answer without reading the whole passage.",
        estMinutes: 8,
        theory:
          "You have about twenty minutes per passage and no time to read closely. Two different techniques do two different jobs.\n\n**Skimming** builds a map. Read the title, the first sentence of each paragraph and the last sentence of the passage — about ninety seconds. You now know roughly what lives where.\n\n**Scanning** finds a specific thing. Take a distinctive word from the question — a name, a number, a year, a technical term — and sweep the page for its shape without reading. Then read only the sentences around it.\n\nRead in full only once scanning has put you in the right place.",
        example:
          "Question: \"In which year did the programme expand to rural districts?\"\n\nDo not reread the passage. Scan for four-digit numbers. Three appear: 1994, 2003, 2011. Read only those sentences; one mentions rural districts. That is the answer, found in perhaps fifteen seconds.",
        takeaway: "Skim once to build the map, then scan for distinctive words. Close reading comes last.",
        questions: [
          {
            prompt: "What is the purpose of skimming?",
            options: [
              "To find one specific fact",
              "To build a rough map of where topics sit in the passage",
              "To check grammar",
              "To memorise the passage",
            ],
            correctIndex: 1,
            explanation:
              "Skimming gives you structure — which paragraph covers what — so that later questions send you straight to the right region.",
          },
          {
            prompt: "The most scannable feature in a question is usually:",
            options: [
              "A common verb like 'increase'",
              "A proper noun, number or technical term",
              "The word 'the'",
              "The question mark",
            ],
            correctIndex: 1,
            explanation:
              "Names, figures and technical terms have a distinctive visual shape and appear rarely, so your eye can find them without reading.",
          },
          {
            prompt: "Roughly how long should skimming a passage take?",
            options: ["About 90 seconds", "About 8 minutes", "About 15 minutes", "The full 20 minutes"],
            correctIndex: 0,
            explanation:
              "Skimming is a fast orientation pass — a minute and a half. Spending longer defeats the purpose and leaves no time for the questions.",
          },
        ],
      },
    ],
  },
  {
    slug: "ielts-speaking",
    track: "IELTS",
    title: "IELTS Speaking",
    subtitle: "Two minutes that decide a band",
    description:
      "Part 2's long turn is the most trainable part of the Speaking test. Learn the structure and the one-minute prep habit.",
    difficulty: "intermediate",
    subjects: ["humanities"],
    audiences: ["school", "university", "graduate"],
    goalSlugs: ["improve-ielts"],
    accent: "rose",
    lessons: [
      {
        slug: "part2-long-turn",
        title: "Part 2 — the long turn",
        objective: "Use the preparation minute to speak for the full two minutes.",
        estMinutes: 8,
        theory:
          "You get a card, one minute to prepare and up to two minutes to speak. Stopping early costs you Fluency marks, so the goal is to fill the time.\n\nUse the prep minute for **keywords, not sentences**. Writing sentences means you will read them aloud, which sounds flat and scores badly. Four or five nouns is enough.\n\nThe card's bullet points are your structure — cover each in order, then finish on the last bullet, which is usually \"explain why\". That is where you can speak longest, because reasons expand naturally in a way descriptions do not.\n\nIf you run dry, add a contrast: how it used to be, or how it compares to something else.",
        example:
          "Card: *Describe a skill you would like to learn. Say what it is, how you would learn it, and why you want it.*\n\nNotes: `woodworking – uncle's workshop – hands, not screen – evening class – patience`\n\nFive keywords, thirty seconds to write, and each one opens a sentence or two. The last bullet (why) takes the most time — screens all day, wanting something physical, the satisfaction of a finished object.",
        takeaway: "Keywords, not sentences. Follow the bullets. Spend the most time on 'why'.",
        questions: [
          {
            prompt: "What should you write during the one-minute preparation?",
            options: [
              "Full sentences to read aloud",
              "A few keywords",
              "Nothing — preparation wastes time",
              "A word-for-word script",
            ],
            correctIndex: 1,
            explanation:
              "Keywords prompt natural speech. Full sentences get read out, which flattens intonation and lowers the Fluency and Coherence score.",
          },
          {
            prompt: "Which bullet point usually deserves the most speaking time?",
            options: [
              "The first one",
              "Whichever is shortest",
              "The 'explain why' bullet",
              "They should be equal",
            ],
            correctIndex: 2,
            explanation:
              "Reasons expand naturally, so the 'why' bullet is where you can speak at length without repeating yourself — useful for filling the full two minutes.",
          },
          {
            prompt: "What happens if you stop speaking after 45 seconds?",
            options: [
              "Nothing, if what you said was accurate",
              "You lose marks on Fluency and Coherence",
              "The examiner restarts the task",
              "You get a new card",
            ],
            correctIndex: 1,
            explanation:
              "The long turn is partly a test of sustained speech. Stopping well short of two minutes limits what the examiner can assess and lowers the Fluency band.",
          },
        ],
      },
    ],
  },
];
