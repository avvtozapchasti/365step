import type { SeedCourse } from "./types";

/**
 * SAT tracks. These are the fullest courses in the seed because the primary
 * demo journey (school student -> university admissions) runs through them.
 *
 * Every lesson follows the same contract: a short explanation, one worked
 * example, then questions with real feedback. Nothing here should take longer
 * than the estimate on the card.
 */

export const SAT_COURSES: SeedCourse[] = [
  {
    slug: "sat-reading",
    track: "SAT",
    title: "SAT Reading",
    subtitle: "Read for structure, not for every word",
    description:
      "The Reading section rewards a small number of repeatable moves. This course teaches them one at a time, in eight-minute lessons.",
    difficulty: "beginner",
    subjects: ["humanities", "social-sciences"],
    audiences: ["school"],
    goalSlugs: ["improve-sat", "get-into-university"],
    accent: "indigo",
    lessons: [
      {
        slug: "transitions",
        title: "Transition words",
        objective: "Pick the transition that matches the logic between two sentences.",
        estMinutes: 8,
        theory:
          "Transition questions are never about which word sounds nicer. They test one thing: the logical relationship between the sentence before the blank and the sentence after it.\n\nCover the answer choices and read both sentences. Then name the relationship in your own words — does the second sentence agree, contradict, give an example, or draw a conclusion? Only then look at the options.\n\nFour families cover almost every question:\n\n• **Agreement / addition** — furthermore, moreover, in addition, similarly\n• **Contrast** — however, nevertheless, by contrast, on the other hand\n• **Cause and effect** — therefore, consequently, as a result, thus\n• **Example** — for instance, for example, specifically",
        example:
          "\"Coral reefs cover less than one percent of the ocean floor. ______, they support roughly a quarter of all marine species.\"\n\nThe first sentence says reefs are tiny. The second says they support an enormous amount of life. Tiny versus enormous is a contrast, so the answer is **However** — not *Therefore*, which would claim the small area causes the biodiversity.",
        takeaway: "Name the relationship before you read the choices. The word is then almost forced.",
        questions: [
          {
            prompt:
              "\"The new battery holds charge for twice as long as the previous model. ______, it costs nearly three times as much to manufacture.\"",
            options: ["Therefore", "However", "For example", "Similarly"],
            correctIndex: 1,
            explanation:
              "The first sentence is an advantage, the second a drawback. That is a contrast, so 'However' fits. 'Therefore' would wrongly claim the longer charge causes the higher cost.",
          },
          {
            prompt:
              "\"Ravens can solve puzzles that require several steps in the correct order. ______, one bird learned to drop stones into a tube to raise a floating reward.\"",
            options: ["Nevertheless", "By contrast", "For instance", "Consequently"],
            correctIndex: 2,
            explanation:
              "The second sentence is a specific case of the general claim in the first. That signals an example, so 'For instance' is right.",
          },
          {
            prompt:
              "\"Rain had not fallen in the valley for eleven months. ______, the reservoir dropped below a quarter of its capacity.\"",
            options: ["As a result", "However", "In addition", "Specifically"],
            correctIndex: 0,
            explanation:
              "The drought causes the reservoir to fall — a cause-and-effect link, so 'As a result' is correct.",
          },
          {
            prompt: "What should you do first on a transition question?",
            options: [
              "Read all four options and pick the most formal word",
              "Cover the options and name the relationship between the two sentences",
              "Look for the longest answer choice",
              "Choose the word that appears earlier in the passage",
            ],
            correctIndex: 1,
            explanation:
              "Naming the relationship first stops the answer choices from steering you. Once you know it is a contrast, only one option usually survives.",
          },
        ],
        resources: [
          {
            title: "Transitions on the SAT Reading and Writing section",
            source: "Khan Academy",
            url: "https://www.khanacademy.org/test-prep/v2-sat-math",
            durationMin: 9,
            topic: "Transitions",
            difficulty: "beginner",
          },
        ],
      },
      {
        slug: "main-idea",
        title: "Main idea questions",
        objective: "Find the claim a passage is built around, not the topic it mentions.",
        estMinutes: 9,
        theory:
          "A main idea is a claim, not a subject. \"Bees\" is a topic. \"Urban beekeeping improves pollination more than rural beekeeping does\" is a main idea.\n\nWrong answers on these questions fail in three predictable ways. They are **too narrow** (true, but only about one paragraph), **too broad** (a claim the passage never commits to), or **half right** (the correct topic attached to the wrong opinion).\n\nBefore looking at the choices, finish this sentence in your head: \"This passage argues that ___.\" Then eliminate anything that does not match the whole passage.",
        example:
          "A passage spends three paragraphs describing how libraries added internet terminals, then one paragraph noting that lending figures rose afterwards.\n\n• *Libraries have existed for centuries* — too broad, and not the argument.\n• *Internet terminals are expensive to maintain* — too narrow, and it is a detail.\n• *Adding internet access helped libraries stay relevant* — matches the whole passage. This is the main idea.",
        takeaway: "Say the claim out loud before reading the options. Then eliminate narrow, broad and half-right.",
        questions: [
          {
            prompt:
              "A passage describes four cities that cut traffic deaths after lowering speed limits, then notes the same pattern in three more. What is the main idea?",
            options: [
              "Speed limits vary widely between cities",
              "Lowering urban speed limits reduces traffic deaths",
              "One city reduced deaths by 18 percent",
              "Traffic engineering is a complex field",
            ],
            correctIndex: 1,
            explanation:
              "Every example supports the same claim. The specific 18 percent figure is a detail (too narrow), and 'traffic engineering is complex' is a claim the passage never makes (too broad).",
          },
          {
            prompt: "An answer choice that is true of only the final paragraph is most likely:",
            options: ["Too broad", "Too narrow", "Half right", "Correct"],
            correctIndex: 1,
            explanation:
              "A main idea has to cover the whole passage. Something true of one paragraph only is the classic too-narrow trap.",
          },
          {
            prompt:
              "A passage praises a scientist's persistence but criticises her conclusions. Which answer is 'half right'?",
            options: [
              "The scientist was persistent and her conclusions were sound",
              "The scientist was persistent though her conclusions were flawed",
              "Persistence matters more than accuracy in science",
              "The scientist worked in the nineteenth century",
            ],
            correctIndex: 0,
            explanation:
              "It gets the subject and the praise right but reverses the passage's judgement on the conclusions — the correct topic with the wrong opinion attached.",
          },
        ],
      },
      {
        slug: "command-of-evidence",
        title: "Command of evidence",
        objective: "Choose the quotation that actually proves the claim in the question.",
        estMinutes: 10,
        theory:
          "Evidence questions give you a claim and four quotations. Only one *supports* the claim; the others are merely *related* to it.\n\nThe habit that fixes these: turn the claim into a test. Ask \"what would I need to see to believe this?\" — then check each quotation against that test.\n\nA quotation that mentions the same topic is not evidence. A quotation that describes the opposite case is not evidence. You need the one that, if true, makes the claim more likely.",
        example:
          "Claim: *the new irrigation method saved water.*\n\nA test for this claim needs a water-use comparison.\n\n• \"Farmers described the method as straightforward to install.\" — about ease, not water.\n• \"Fields using the method consumed 31 percent less water than neighbouring fields.\" — exactly the comparison. **This is the evidence.**\n• \"The method was developed over six years.\" — about history.\n• \"Yields remained unchanged.\" — about output, not water use.",
        takeaway: "Turn the claim into a test, then find the quotation that passes it.",
        questions: [
          {
            prompt:
              "Claim: 'The tutoring programme improved students' writing.' Which finding best supports it?",
            options: [
              "Students said they enjoyed the sessions",
              "Attendance at the sessions was high",
              "Essay scores rose by an average of 12 points after the programme",
              "The programme ran for two semesters",
            ],
            correctIndex: 2,
            explanation:
              "Only a measured change in writing quality tests the claim. Enjoyment, attendance and duration are all related to the programme without showing that writing improved.",
          },
          {
            prompt:
              "Claim: 'Wolves changed the river's course.' Which quotation would count as evidence?",
            options: [
              "'Wolves returned to the park in 1995.'",
              "'With fewer elk grazing the banks, willow roots stabilised the soil and the channel narrowed.'",
              "'Visitors reported hearing wolves at night.'",
              "'The park covers nearly nine thousand square kilometres.'",
            ],
            correctIndex: 1,
            explanation:
              "It traces the chain from wolves to the river's shape. The others establish that wolves were present, which is not the same as showing they changed the river.",
          },
          {
            prompt: "A quotation on the same topic as the claim but with no bearing on whether it is true is:",
            options: [
              "Strong evidence",
              "Related but not evidence",
              "Counter-evidence",
              "Always the correct answer",
            ],
            correctIndex: 1,
            explanation:
              "Topic overlap is the most common trap in this question type. Evidence has to move the claim's likelihood, not just share its subject.",
          },
        ],
      },
      {
        slug: "words-in-context",
        title: "Words in context",
        objective: "Use the sentence, not your dictionary memory, to choose a word.",
        estMinutes: 7,
        theory:
          "These questions are not vocabulary tests. The tested words are usually common; what varies is which of their several meanings the sentence needs.\n\nThe move is always the same. Read the sentence with the word blanked out and put in your own word. Then choose the option closest to yours.\n\nIf you skip the prediction step, all four options start to sound plausible — that feeling is the signal that you skipped it.",
        example:
          "\"The committee's report was ______: it ran to nine hundred pages and addressed every objection raised.\"\n\nPredict first: *thorough*. Now the options — *exhaustive* matches. *Exhausting* describes the reader, not the report. *Lengthy* captures the page count but misses \"addressed every objection\". *Definitive* claims authority the sentence does not.",
        takeaway: "Blank the word, predict your own, then match. Never pick from the options cold.",
        questions: [
          {
            prompt:
              "\"Her argument was ______: each step followed from the one before with no gaps.\" Best fit?",
            options: ["rigorous", "lengthy", "passionate", "controversial"],
            correctIndex: 0,
            explanation:
              "The clue after the colon is about logical tightness, which is exactly what 'rigorous' means. Length, passion and controversy are not mentioned.",
          },
          {
            prompt:
              "\"The drought ______ an already fragile food supply.\" Best fit?",
            options: ["revealed", "aggravated", "replaced", "postponed"],
            correctIndex: 1,
            explanation:
              "'Already fragile' tells you the supply was weak and the drought made it worse. 'Aggravated' means made worse; 'revealed' would mean it only exposed an existing state.",
          },
          {
            prompt: "What is the first step on a words-in-context question?",
            options: [
              "Pick the most advanced-sounding word",
              "Blank the word out and predict your own before reading the options",
              "Choose the word you have seen most often on tests",
              "Look up the word's primary dictionary definition",
            ],
            correctIndex: 1,
            explanation:
              "Predicting first anchors you to the sentence's meaning, so you are comparing options to your prediction rather than to each other.",
          },
        ],
      },
    ],
  },
  {
    slug: "sat-writing",
    track: "SAT",
    title: "SAT Writing & Language",
    subtitle: "A handful of grammar rules, tested over and over",
    description:
      "The Writing section reuses a short list of rules. Learn to spot each one's signature and the section becomes predictable.",
    difficulty: "beginner",
    subjects: ["humanities"],
    audiences: ["school"],
    goalSlugs: ["improve-sat", "get-into-university"],
    accent: "violet",
    lessons: [
      {
        slug: "comma-splices",
        title: "Comma splices and run-ons",
        objective: "Join two complete sentences correctly.",
        estMinutes: 8,
        theory:
          "A comma cannot join two complete sentences. That single fact is worth several points per test.\n\nFirst check whether each side of the punctuation could stand alone. If both can, a bare comma is wrong, and you have four legal fixes:\n\n• a period\n• a semicolon\n• a comma **plus** a coordinating conjunction (and, but, or, so, yet, for, nor)\n• a colon, when the second half explains the first\n\nNote what is *not* on the list: however, therefore, moreover. Those are adverbs, not conjunctions, so \"it rained, however we played\" is still a splice.",
        example:
          "❌ \"The samples arrived late, the experiment was delayed.\"\n\nBoth halves are complete sentences, so the comma is illegal. Any of these work:\n\n✅ \"The samples arrived late. The experiment was delayed.\"\n✅ \"The samples arrived late; the experiment was delayed.\"\n✅ \"The samples arrived late, so the experiment was delayed.\"\n✅ \"The samples arrived late: the experiment was delayed.\"",
        takeaway: "Two complete sentences need more than a comma. 'However' is not a fix.",
        questions: [
          {
            prompt: "Which version is correct?",
            options: [
              "The bridge closed for repairs, traffic backed up for miles.",
              "The bridge closed for repairs, however traffic backed up for miles.",
              "The bridge closed for repairs, and traffic backed up for miles.",
              "The bridge closed for repairs traffic backed up for miles.",
            ],
            correctIndex: 2,
            explanation:
              "A comma plus the coordinating conjunction 'and' legally joins two complete sentences. Option 1 is a splice, option 2 uses an adverb rather than a conjunction, and option 4 is a run-on.",
          },
          {
            prompt: "\"The results were surprising ______ nobody had predicted a negative correlation.\"",
            options: [", however", "; indeed,", ", and however", " however"],
            correctIndex: 1,
            explanation:
              "A semicolon can join the two complete sentences, and 'indeed' then works as an adverb inside the second one. '; ' is doing the joining, not the adverb.",
          },
          {
            prompt: "Why is 'therefore' unable to fix a comma splice?",
            options: [
              "It is too formal for the SAT",
              "It is an adverb, not a coordinating conjunction",
              "It can only start a paragraph",
              "It must always follow a colon",
            ],
            correctIndex: 1,
            explanation:
              "Only the seven coordinating conjunctions can join two sentences after a comma. 'Therefore', 'however' and 'moreover' are adverbs, so they leave the splice in place.",
          },
        ],
      },
      {
        slug: "subject-verb-agreement",
        title: "Subject–verb agreement",
        objective: "Match the verb to its real subject, past the words in between.",
        estMinutes: 7,
        theory:
          "The test rarely puts the subject next to the verb. It buries a prepositional phrase between them and hopes you agree with the nearest noun.\n\nSo cross out everything between the subject and the verb, then read what is left. \"The **box** of old letters **was** heavy\" — not *were*, because *letters* is inside a prepositional phrase and cannot be the subject.\n\nTwo patterns to memorise. *Each, every, either, neither, one* are singular, however plural the phrase after them sounds. And in \"there is / there are\", the subject comes *after* the verb.",
        example:
          "\"The collection of rare manuscripts, gathered over four decades by two librarians, ______ now available online.\"\n\nCross out the middle: *The collection ... is now available online.* The subject is **collection**, singular, so the answer is **is**.",
        takeaway: "Cross out the phrases in between, then read subject and verb side by side.",
        questions: [
          {
            prompt: "\"The list of required documents ______ posted on the website.\"",
            options: ["are", "is", "were", "have been"],
            correctIndex: 1,
            explanation:
              "The subject is 'list' (singular); 'of required documents' is a prepositional phrase. Singular subject takes 'is'.",
          },
          {
            prompt: "\"Neither of the two proposals ______ the budget requirement.\"",
            options: ["meet", "meets", "have met", "are meeting"],
            correctIndex: 1,
            explanation:
              "'Neither' is singular, so it takes 'meets' — even though 'two proposals' sits right before the verb.",
          },
          {
            prompt: "\"There ______ several reasons for the delay.\"",
            options: ["is", "was", "are", "has been"],
            correctIndex: 2,
            explanation:
              "In 'there is / there are', the subject follows the verb. Here it is 'several reasons', which is plural, so 'are' is correct.",
          },
        ],
      },
      {
        slug: "modifiers",
        title: "Misplaced modifiers",
        objective: "Put the describing phrase next to the thing it describes.",
        estMinutes: 7,
        theory:
          "A modifier attaches to whatever it sits beside. Put it beside the wrong noun and the sentence says something you did not mean.\n\nWhen a sentence opens with a descriptive phrase followed by a comma, the noun immediately after that comma must be the thing being described. That is the whole rule.\n\n\"Walking to school, the rain soaked my jacket\" claims the rain was walking. Either change the noun after the comma, or make the opening phrase a full clause: \"While I was walking to school, the rain soaked my jacket.\"",
        example:
          "❌ \"Built in 1890, the historian described the bridge as revolutionary.\"\n\nThe historian was not built in 1890. Fix by putting the bridge right after the comma:\n\n✅ \"Built in 1890, the bridge was described by the historian as revolutionary.\"",
        takeaway: "Opening phrase plus comma: the next noun must be what the phrase describes.",
        questions: [
          {
            prompt: "Which sentence is correct?",
            options: [
              "Covered in dust, I found the old telescope in the attic.",
              "Covered in dust, the old telescope sat in the attic.",
              "Covered in dust, the attic held the old telescope.",
              "Covered in dust, finding the telescope took an hour.",
            ],
            correctIndex: 1,
            explanation:
              "The telescope is what was covered in dust, so it must follow the comma. The other versions attach the phrase to 'I', 'the attic' and 'finding'.",
          },
          {
            prompt: "\"Having studied for weeks, ______\"",
            options: [
              "the exam felt manageable to Priya.",
              "Priya found the exam manageable.",
              "it was clear the exam would be manageable.",
              "the material had been covered thoroughly.",
            ],
            correctIndex: 1,
            explanation:
              "Priya did the studying, so her name has to come directly after the comma. In the other options the exam, 'it', or the material would be doing the studying.",
          },
          {
            prompt: "A modifier attaches to:",
            options: [
              "The noun closest to it",
              "The subject of the previous sentence",
              "The verb of the main clause",
              "Whichever noun the writer intended",
            ],
            correctIndex: 0,
            explanation:
              "Proximity is what grammar goes on, not intention. That is why moving the phrase is the fix.",
          },
        ],
      },
    ],
  },
  {
    slug: "sat-math",
    track: "SAT",
    title: "SAT Math",
    subtitle: "The algebra that actually shows up",
    description:
      "Linear relationships, quadratics, systems and rates make up most of the Math section. Each lesson is one technique plus practice.",
    difficulty: "beginner",
    subjects: ["math", "engineering", "physics"],
    audiences: ["school"],
    goalSlugs: ["improve-sat", "get-into-university"],
    accent: "emerald",
    lessons: [
      {
        slug: "linear-equations",
        title: "Linear equations in context",
        objective: "Translate a word problem into y = mx + b and read it back.",
        estMinutes: 9,
        theory:
          "Most linear word problems hand you the two pieces of y = mx + b in plain language.\n\n**b** is the starting amount — what is true before anything happens. **m** is the rate — what changes per unit, and it is negative when the quantity falls.\n\nThe questions that look hardest usually just ask you to interpret one of these in context: \"what does 34 represent in the equation?\" Answer by asking what happens when the variable is zero (that is b) or what changes per step (that is m).",
        example:
          "A pool holds 400 litres and drains 15 litres per minute.\n\nStarting amount: b = 400. Rate: the volume falls, so m = −15.\n\nV = 400 − 15t\n\nEmpty means V = 0, so 15t = 400 and t ≈ 26.7 minutes.",
        takeaway: "b is where you start, m is what changes per unit. Negative m means falling.",
        questions: [
          {
            prompt:
              "A phone plan costs $12 per month plus $0.05 per text. Which equation gives the monthly cost C for t texts?",
            options: ["C = 0.05t − 12", "C = 12t + 0.05", "C = 12 + 0.05t", "C = 12.05t"],
            correctIndex: 2,
            explanation:
              "$12 is the fixed starting amount (b) and $0.05 is the rate per text (m), giving C = 12 + 0.05t.",
          },
          {
            prompt:
              "In W = 68 − 0.4d, where W is weight in kg after d days of a programme, what does 0.4 represent?",
            options: [
              "The starting weight",
              "The kilograms lost per day",
              "The total kilograms lost",
              "The number of days in the programme",
            ],
            correctIndex: 1,
            explanation:
              "0.4 multiplies d, so it is the rate of change: 0.4 kg per day. The minus sign tells you it is a loss, and 68 is the starting weight.",
          },
          {
            prompt: "A line passes through (0, 7) and (4, 19). What is its slope?",
            options: ["3", "4", "7", "12"],
            correctIndex: 0,
            explanation:
              "Slope = (19 − 7) / (4 − 0) = 12 / 4 = 3.",
          },
        ],
        resources: [
          {
            title: "Linear equations, word problems and interpretation",
            source: "Khan Academy",
            url: "https://www.khanacademy.org/test-prep/v2-sat-math",
            durationMin: 11,
            topic: "Algebra",
            difficulty: "beginner",
          },
        ],
      },
      {
        slug: "quadratics",
        title: "Quadratic functions",
        objective: "Read a parabola's roots, vertex and direction from its form.",
        estMinutes: 10,
        theory:
          "Each form of a quadratic shows you one thing for free. Pick the form that matches the question instead of converting by reflex.\n\n• **Factored** y = a(x − p)(x − q) → the roots are p and q.\n• **Vertex** y = a(x − h)² + k → the vertex is (h, k), so this is the form for maximum and minimum questions.\n• **Standard** y = ax² + bx + c → c is the y-intercept, and the axis of symmetry is x = −b / 2a.\n\nThe sign of a tells you the direction: positive opens upward (the vertex is a minimum), negative opens downward (a maximum).",
        example:
          "A ball's height is h = −5t² + 20t.\n\nFactor: h = −5t(t − 4), so it is at ground level at t = 0 and t = 4.\n\nThe vertex sits midway between the roots, at t = 2. Then h = −5(4) + 40 = 20.\n\nHighest point: 20 metres at 2 seconds. Because a is negative, that vertex is a maximum.",
        takeaway: "Factored gives roots, vertex form gives the max or min, and the sign of a gives direction.",
        questions: [
          {
            prompt: "What are the roots of y = 2(x − 3)(x + 5)?",
            options: ["3 and 5", "3 and −5", "−3 and 5", "6 and −10"],
            correctIndex: 1,
            explanation:
              "Each factor is zero when x equals the value that cancels it: x − 3 = 0 gives 3, and x + 5 = 0 gives −5.",
          },
          {
            prompt: "For y = −3(x − 2)² + 11, what is the maximum value?",
            options: ["2", "3", "11", "−3"],
            correctIndex: 2,
            explanation:
              "This is vertex form with vertex (2, 11). Because a = −3 is negative the parabola opens downward, so 11 is a maximum.",
          },
          {
            prompt: "In y = x² − 6x + 4, where is the axis of symmetry?",
            options: ["x = −6", "x = 3", "x = 4", "x = 6"],
            correctIndex: 1,
            explanation:
              "The axis of symmetry is x = −b / 2a = −(−6) / (2 · 1) = 3.",
          },
        ],
      },
      {
        slug: "systems",
        title: "Systems of equations",
        objective: "Choose substitution or elimination, and know what 'no solution' looks like.",
        estMinutes: 9,
        theory:
          "Use **substitution** when one variable is already isolated, or costs one step to isolate. Use **elimination** when the coefficients line up, or can be made to.\n\nThe trickier SAT questions ask about how *many* solutions there are rather than what they are:\n\n• Same slope, different intercept → parallel lines → **no solution**.\n• Same slope, same intercept → the same line → **infinitely many**.\n• Different slopes → exactly one.\n\nSo when a question asks for the value of a constant that makes a system have no solution, set the slopes equal.",
        example:
          "3x + 2y = 12 and 6x + ky = 30 have no solution for which k?\n\nWrite both as slopes: y = −(3/2)x + 6 and y = −(6/k)x + 30/k.\n\nNo solution needs equal slopes: 3/2 = 6/k, so k = 4.\n\nCheck the intercepts differ: 30/4 = 7.5 ≠ 6. They do, so the lines are parallel and there is genuinely no solution.",
        takeaway: "Counting solutions is a question about slopes, not about solving.",
        questions: [
          {
            prompt: "Solve: y = 2x − 1 and 3x + y = 9.",
            options: ["(2, 3)", "(3, 5)", "(1, 1)", "(4, 7)"],
            correctIndex: 0,
            explanation:
              "Substitute: 3x + (2x − 1) = 9, so 5x = 10 and x = 2. Then y = 2(2) − 1 = 3.",
          },
          {
            prompt: "For which value of c does 4x − 2y = 6 and 2x − y = c have infinitely many solutions?",
            options: ["1", "3", "6", "12"],
            correctIndex: 1,
            explanation:
              "Halving the first equation gives 2x − y = 3, so the two are the same line when c = 3, which means infinitely many solutions.",
          },
          {
            prompt: "Two linear equations have the same slope but different y-intercepts. How many solutions?",
            options: ["Exactly one", "None", "Infinitely many", "Two"],
            correctIndex: 1,
            explanation:
              "Equal slopes with different intercepts are parallel lines. Parallel lines never meet, so there is no solution.",
          },
        ],
      },
      {
        slug: "ratios-percent",
        title: "Ratios, rates and percent change",
        objective: "Handle percent increase, decrease and reversal without guessing.",
        estMinutes: 8,
        theory:
          "Turn every percent into a multiplier and the arithmetic stops being error-prone.\n\nUp 20% → × 1.20. Down 20% → × 0.80. Successive changes multiply, which is why a 20% rise followed by a 20% fall does not return you to the start: 1.20 × 0.80 = 0.96, so you end 4% down.\n\nReversal questions — \"after a 25% discount the price is $60, what was the original?\" — are division, not subtraction. Original × 0.75 = 60, so the original is 60 / 0.75 = $80.",
        example:
          "A population of 5,000 grows 8% in year one and falls 5% in year two.\n\n5000 × 1.08 × 0.95 = 5000 × 1.026 = 5,130.\n\nNet change: up 2.6%, not up 3%.",
        takeaway: "Percent up is ×(1 + r), percent down is ×(1 − r), and reversing means dividing.",
        questions: [
          {
            prompt: "After a 30% discount an item costs $84. What was the original price?",
            options: ["$109.20", "$114", "$120", "$126"],
            correctIndex: 2,
            explanation:
              "Paying 70% of the original: 0.70 × original = 84, so original = 84 / 0.70 = $120.",
          },
          {
            prompt: "A value rises 10% then falls 10%. What is the net change?",
            options: ["No change", "Down 1%", "Up 1%", "Down 10%"],
            correctIndex: 1,
            explanation:
              "1.10 × 0.90 = 0.99, which is a 1% decrease. The fall applies to a larger number than the rise did.",
          },
          {
            prompt: "A recipe uses flour and sugar in a 5:2 ratio. With 350 g of flour, how much sugar?",
            options: ["70 g", "120 g", "140 g", "175 g"],
            correctIndex: 2,
            explanation:
              "350 / 5 = 70 g per part, and sugar is 2 parts, so 2 × 70 = 140 g.",
          },
        ],
      },
    ],
  },
];
