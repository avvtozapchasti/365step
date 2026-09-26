/**
 * Roadmap templates, one per goal.
 *
 * Each entry is a twelve-month arc of milestones, and each task can point at a
 * real course or lesson (`ref`) so a roadmap task is clickable rather than
 * decorative. `subjectTask` slots are filled at generation time with the user's
 * own interests, which is what stops two users with the same goal getting an
 * identical plan.
 */

export interface TemplateTask {
  title: string;
  kind: "learn" | "practice" | "build" | "apply" | "action";
  /** 'course:sat-math' | 'lesson:sat-reading/transitions' | 'opportunity' */
  ref?: string;
  /** Replaced with the user's top interest, e.g. "Find {subject} competitions". */
  subjectSlot?: boolean;
}

export interface TemplateMilestone {
  title: string;
  focus: string;
  tasks: TemplateTask[];
}

const GET_INTO_UNIVERSITY: TemplateMilestone[] = [
  {
    title: "Foundation",
    focus: "Know where you are and where you are aiming.",
    tasks: [
      { title: "Write down 8 target universities with their requirements", kind: "action" },
      { title: "Take a diagnostic SAT to find your starting score", kind: "practice" },
      { title: "Learn how SAT Reading questions are built", kind: "learn", ref: "course:sat-reading" },
      { title: "List what your {subject} application needs to show", kind: "action", subjectSlot: true },
    ],
  },
  {
    title: "SAT core",
    focus: "Build the habits that move a score.",
    tasks: [
      { title: "Work through SAT Math fundamentals", kind: "learn", ref: "course:sat-math" },
      { title: "Learn transitions and evidence questions", kind: "learn", ref: "lesson:sat-reading/transitions" },
      { title: "Practise 10 questions a day, four days a week", kind: "practice" },
    ],
  },
  {
    title: "Writing & grammar",
    focus: "The rules the Writing section repeats.",
    tasks: [
      { title: "Learn the grammar rules the SAT tests", kind: "learn", ref: "course:sat-writing" },
      { title: "Take a timed section and log which rules you missed", kind: "practice" },
      { title: "Draft your personal statement opening paragraph", kind: "build" },
    ],
  },
  {
    title: "Portfolio",
    focus: "Start the thing you will be talking about in interviews.",
    tasks: [
      { title: "Choose a project you can finish", kind: "learn", ref: "lesson:project-building/choosing-a-project" },
      { title: "Write the problem statement for your {subject} project", kind: "build", subjectSlot: true },
      { title: "Build a rough prototype", kind: "build", ref: "lesson:project-building/prototype-and-mvp" },
      { title: "Put it on GitHub with a real README", kind: "build", ref: "lesson:project-building/github-basics" },
    ],
  },
  {
    title: "Research",
    focus: "Move from consuming knowledge to producing it.",
    tasks: [
      { title: "Learn what counts as research", kind: "learn", ref: "lesson:research-fundamentals/what-is-research" },
      { title: "Find one {subject} problem worth studying", kind: "build", subjectSlot: true },
      { title: "Write a research question that passes all four tests", kind: "build", ref: "lesson:research-fundamentals/research-question" },
      { title: "Email one researcher about their work", kind: "apply", ref: "lesson:applications-and-cv/cold-outreach" },
    ],
  },
  {
    title: "Opportunity mapping",
    focus: "Find the programmes that fit you, before their deadlines do.",
    tasks: [
      { title: "Save 5 opportunities that match your profile", kind: "apply", ref: "opportunity" },
      { title: "Check eligibility on each one you saved", kind: "apply" },
      { title: "Put every deadline on your calendar", kind: "action" },
    ],
  },
  {
    title: "Score push",
    focus: "Convert practice into a real score.",
    tasks: [
      { title: "Two full timed practice tests", kind: "practice" },
      { title: "Review every wrong answer by category", kind: "practice" },
      { title: "Register for your test date", kind: "apply" },
    ],
  },
  {
    title: "Summer programme applications",
    focus: "The applications that need the longest lead time.",
    tasks: [
      { title: "Shortlist 3 summer or research programmes", kind: "apply", ref: "opportunity" },
      { title: "Turn your activities into CV bullets with numbers", kind: "build", ref: "lesson:applications-and-cv/cv-bullets" },
      { title: "Ask two teachers for recommendations", kind: "apply" },
      { title: "Submit your first application", kind: "apply" },
    ],
  },
  {
    title: "Project depth",
    focus: "Take the project from working to interesting.",
    tasks: [
      { title: "Interview 5 people who would use your project", kind: "build", ref: "lesson:project-building/user-research" },
      { title: "Ship the improvement they all asked for", kind: "build" },
      { title: "Write up what you learned in 300 words", kind: "build" },
    ],
  },
  {
    title: "Essays",
    focus: "The part of the application only you can write.",
    tasks: [
      { title: "List the 5 things your application must communicate", kind: "action" },
      { title: "Draft the main essay", kind: "build" },
      { title: "Get feedback from two people and rewrite", kind: "build" },
    ],
  },
  {
    title: "Applications",
    focus: "Submit, properly and early.",
    tasks: [
      { title: "Finalise your university list with reach, match and safety", kind: "action" },
      { title: "Complete every application form", kind: "apply" },
      { title: "Submit at least a week before each deadline", kind: "apply" },
    ],
  },
  {
    title: "Interviews & next",
    focus: "Land it, and set up what comes after.",
    tasks: [
      { title: "Prepare four STAR stories", kind: "learn", ref: "lesson:applications-and-cv/interview-basics" },
      { title: "Practise your project explanation out loud", kind: "practice", ref: "lesson:research-fundamentals/presenting" },
      { title: "Plan your next 365 days", kind: "action" },
    ],
  },
];

const IMPROVE_SAT: TemplateMilestone[] = [
  {
    title: "Diagnostic",
    focus: "Find out exactly where the points are leaking.",
    tasks: [
      { title: "Take a full timed diagnostic test", kind: "practice" },
      { title: "Categorise every wrong answer by topic", kind: "action" },
      { title: "Set a target score and a test date", kind: "action" },
    ],
  },
  {
    title: "Reading foundations",
    focus: "The repeatable moves in Reading.",
    tasks: [
      { title: "Transition words", kind: "learn", ref: "lesson:sat-reading/transitions" },
      { title: "Main idea questions", kind: "learn", ref: "lesson:sat-reading/main-idea" },
      { title: "10 Reading questions a day", kind: "practice" },
    ],
  },
  {
    title: "Grammar rules",
    focus: "A short list of rules, tested over and over.",
    tasks: [
      { title: "Comma splices and run-ons", kind: "learn", ref: "lesson:sat-writing/comma-splices" },
      { title: "Subject–verb agreement", kind: "learn", ref: "lesson:sat-writing/subject-verb-agreement" },
      { title: "Misplaced modifiers", kind: "learn", ref: "lesson:sat-writing/modifiers" },
    ],
  },
  {
    title: "Algebra",
    focus: "The maths that shows up most.",
    tasks: [
      { title: "Linear equations in context", kind: "learn", ref: "lesson:sat-math/linear-equations" },
      { title: "Systems of equations", kind: "learn", ref: "lesson:sat-math/systems" },
      { title: "Timed 15-question algebra set", kind: "practice" },
    ],
  },
  {
    title: "Advanced maths",
    focus: "Quadratics, rates and the harder half.",
    tasks: [
      { title: "Quadratic functions", kind: "learn", ref: "lesson:sat-math/quadratics" },
      { title: "Ratios, rates and percent change", kind: "learn", ref: "lesson:sat-math/ratios-percent" },
      { title: "Redo every question you got wrong last month", kind: "practice" },
    ],
  },
  {
    title: "Evidence & vocabulary",
    focus: "The question types that separate high scores.",
    tasks: [
      { title: "Command of evidence", kind: "learn", ref: "lesson:sat-reading/command-of-evidence" },
      { title: "Words in context", kind: "learn", ref: "lesson:sat-reading/words-in-context" },
      { title: "Full Reading section, timed", kind: "practice" },
    ],
  },
  {
    title: "Timing",
    focus: "Knowing it is not the same as finishing it.",
    tasks: [
      { title: "Two full timed practice tests", kind: "practice" },
      { title: "Work out your per-question pace", kind: "action" },
      { title: "Practise skipping and returning deliberately", kind: "practice" },
    ],
  },
  {
    title: "Weak spots",
    focus: "Attack what the data says, not what feels comfortable.",
    tasks: [
      { title: "Rank your topics by error rate", kind: "action" },
      { title: "Spend two weeks on the worst two only", kind: "practice" },
      { title: "Retest those topics", kind: "practice" },
    ],
  },
  {
    title: "Test readiness",
    focus: "Everything except the content.",
    tasks: [
      { title: "Register and confirm your test centre", kind: "apply" },
      { title: "Do one full test at real start time", kind: "practice" },
      { title: "Plan the week before the test", kind: "action" },
    ],
  },
  {
    title: "Test month",
    focus: "Taper, do not cram.",
    tasks: [
      { title: "Light daily review only", kind: "practice" },
      { title: "One final timed section", kind: "practice" },
      { title: "Sit the test", kind: "apply" },
    ],
  },
  {
    title: "Beyond the score",
    focus: "A score is a key, not a destination.",
    tasks: [
      { title: "Find scholarships your score qualifies you for", kind: "apply", ref: "opportunity" },
      { title: "Save 3 programmes with score requirements you now meet", kind: "apply", ref: "opportunity" },
      { title: "Start a portfolio project", kind: "build", ref: "course:project-building" },
    ],
  },
  {
    title: "Next goal",
    focus: "Point the habit at something new.",
    tasks: [
      { title: "Review what worked in your study habit", kind: "action" },
      { title: "Choose your next 365-day goal", kind: "action" },
      { title: "Set up the first week of it", kind: "action" },
    ],
  },
];

const IMPROVE_IELTS: TemplateMilestone[] = [
  {
    title: "Baseline",
    focus: "Find your real band, not your hoped-for one.",
    tasks: [
      { title: "Take a full practice test under time", kind: "practice" },
      { title: "Identify your weakest of the four skills", kind: "action" },
      { title: "Set your target band and test date", kind: "action" },
    ],
  },
  {
    title: "Writing Task 2",
    focus: "Where most bands stall.",
    tasks: [
      { title: "The two-sentence introduction", kind: "learn", ref: "lesson:ielts-writing/task2-introduction" },
      { title: "Body paragraphs with PEEL", kind: "learn", ref: "lesson:ielts-writing/task2-body" },
      { title: "Write one Task 2 essay a week", kind: "practice" },
    ],
  },
  {
    title: "Writing Task 1",
    focus: "Describe data without listing it.",
    tasks: [
      { title: "The overview sentence", kind: "learn", ref: "lesson:ielts-writing/task1-overview" },
      { title: "Write three overviews from three charts", kind: "practice" },
      { title: "Time yourself to 20 minutes", kind: "practice" },
    ],
  },
  {
    title: "Reading speed",
    focus: "Finish all three passages.",
    tasks: [
      { title: "Skimming and scanning", kind: "learn", ref: "lesson:ielts-reading/skim-and-scan" },
      { title: "True / False / Not Given", kind: "learn", ref: "lesson:ielts-reading/true-false-notgiven" },
      { title: "One full Reading section a week, timed", kind: "practice" },
    ],
  },
  {
    title: "Speaking fluency",
    focus: "Fill the two minutes.",
    tasks: [
      { title: "The Part 2 long turn", kind: "learn", ref: "lesson:ielts-speaking/part2-long-turn" },
      { title: "Record yourself on five cards", kind: "practice" },
      { title: "Find a speaking partner or tutor", kind: "action" },
    ],
  },
  {
    title: "Listening",
    focus: "Accuracy under one hearing.",
    tasks: [
      { title: "One full Listening section a week", kind: "practice" },
      { title: "Shadow a podcast for ten minutes a day", kind: "practice" },
      { title: "Log the spellings you keep getting wrong", kind: "action" },
    ],
  },
  {
    title: "Vocabulary",
    focus: "Range, used accurately.",
    tasks: [
      { title: "Build a topic vocabulary list for 8 common themes", kind: "build" },
      { title: "Use ten new words in written answers", kind: "practice" },
      { title: "Review with spaced repetition", kind: "practice" },
    ],
  },
  {
    title: "Mock test",
    focus: "The whole thing, in one sitting.",
    tasks: [
      { title: "Full mock under exam conditions", kind: "practice" },
      { title: "Get your writing marked by someone qualified", kind: "action" },
      { title: "Compare to your target and adjust", kind: "action" },
    ],
  },
  {
    title: "Weak skill push",
    focus: "Four weeks on the lowest band only.",
    tasks: [
      { title: "Daily practice in your weakest skill", kind: "practice" },
      { title: "Get specific feedback on it", kind: "action" },
      { title: "Retest that skill alone", kind: "practice" },
    ],
  },
  {
    title: "Registration",
    focus: "Book it — the deadline creates the discipline.",
    tasks: [
      { title: "Register for your test date", kind: "apply" },
      { title: "Add the deadline to your dashboard", kind: "action" },
      { title: "Plan the final four weeks", kind: "action" },
    ],
  },
  {
    title: "Test month",
    focus: "Consolidate, taper, sit it.",
    tasks: [
      { title: "Two final full mocks", kind: "practice" },
      { title: "Light review the last three days", kind: "practice" },
      { title: "Sit the test", kind: "apply" },
    ],
  },
  {
    title: "Using the band",
    focus: "The score exists to unlock something.",
    tasks: [
      { title: "Find programmes your band now qualifies you for", kind: "apply", ref: "opportunity" },
      { title: "Save 3 of them with their deadlines", kind: "apply", ref: "opportunity" },
      { title: "Start the strongest application", kind: "apply" },
    ],
  },
];

const START_RESEARCH: TemplateMilestone[] = [
  {
    title: "What research is",
    focus: "Tell research apart from a report.",
    tasks: [
      { title: "What research actually is", kind: "learn", ref: "lesson:research-fundamentals/what-is-research" },
      { title: "Read one paper in {subject} end to end", kind: "learn", subjectSlot: true },
      { title: "Write down three things you do not understand about it", kind: "action" },
    ],
  },
  {
    title: "Finding a problem",
    focus: "Nobody hands you a research problem.",
    tasks: [
      { title: "Finding a problem worth studying", kind: "learn", ref: "lesson:research-fundamentals/finding-a-problem" },
      { title: "List 10 things that annoy you in {subject}", kind: "build", subjectSlot: true },
      { title: "Read the 'future work' section of three papers", kind: "learn" },
    ],
  },
  {
    title: "The question",
    focus: "One question, narrow enough to answer.",
    tasks: [
      { title: "Writing the research question", kind: "learn", ref: "lesson:research-fundamentals/research-question" },
      { title: "Draft five candidate questions", kind: "build" },
      { title: "Narrow the best one until it passes all four tests", kind: "build" },
    ],
  },
  {
    title: "Literature",
    focus: "Find out what is already known.",
    tasks: [
      { title: "Searching the literature", kind: "learn", ref: "lesson:research-fundamentals/literature-search" },
      { title: "Build a reading list of 15 papers", kind: "build" },
      { title: "Judging whether a source is solid", kind: "learn", ref: "lesson:research-fundamentals/evaluating-sources" },
    ],
  },
  {
    title: "Method",
    focus: "Write something a stranger could repeat.",
    tasks: [
      { title: "Designing the method", kind: "learn", ref: "lesson:research-fundamentals/methodology" },
      { title: "Write your full method section", kind: "build" },
      { title: "Have someone else try to follow it", kind: "action" },
    ],
  },
  {
    title: "Finding a mentor",
    focus: "The step most people skip and most need.",
    tasks: [
      { title: "Emailing someone you do not know", kind: "learn", ref: "lesson:applications-and-cv/cold-outreach" },
      { title: "Make a list of 15 researchers in {subject}", kind: "build", subjectSlot: true },
      { title: "Send five specific emails", kind: "apply" },
    ],
  },
  {
    title: "Data collection",
    focus: "Discipline, mostly.",
    tasks: [
      { title: "Collecting data you can trust", kind: "learn", ref: "lesson:research-fundamentals/collecting-data" },
      { title: "Set up your data file before collecting anything", kind: "build" },
      { title: "Run a pilot on a small sample", kind: "build" },
    ],
  },
  {
    title: "Full collection",
    focus: "The unglamorous middle.",
    tasks: [
      { title: "Collect your full dataset", kind: "build" },
      { title: "Log anomalies as you go", kind: "action" },
      { title: "Back up the raw file weekly", kind: "action" },
    ],
  },
  {
    title: "Analysis",
    focus: "Describe what you found, honestly.",
    tasks: [
      { title: "Analysing results honestly", kind: "learn", ref: "lesson:research-fundamentals/analysis" },
      { title: "Plot your data before calculating anything", kind: "build" },
      { title: "Write your results with centre, spread and n", kind: "build" },
    ],
  },
  {
    title: "Writing up",
    focus: "The structure is fixed, which helps.",
    tasks: [
      { title: "Writing it up", kind: "learn", ref: "lesson:research-fundamentals/writing-it-up" },
      { title: "Draft the full paper, abstract last", kind: "build" },
      { title: "Write your own limitations section", kind: "build" },
    ],
  },
  {
    title: "Presenting",
    focus: "You will explain it far more often than anyone reads it.",
    tasks: [
      { title: "Presenting your research", kind: "learn", ref: "lesson:research-fundamentals/presenting" },
      { title: "Build a poster with the finding in the largest type", kind: "build" },
      { title: "Practise the three-minute version out loud", kind: "practice" },
    ],
  },
  {
    title: "Getting it out there",
    focus: "Research that nobody sees is half-finished.",
    tasks: [
      { title: "Find fairs and competitions that accept your work", kind: "apply", ref: "opportunity" },
      { title: "Submit to at least one", kind: "apply" },
      { title: "Choose your next research question", kind: "action" },
    ],
  },
];

const BUILD_PORTFOLIO: TemplateMilestone[] = [
  {
    title: "Scope",
    focus: "Pick something you will actually finish.",
    tasks: [
      { title: "Choosing a project you will finish", kind: "learn", ref: "lesson:project-building/choosing-a-project" },
      { title: "List 10 ideas, then cut to one", kind: "action" },
      { title: "Check it is demoable in 30 seconds", kind: "action" },
    ],
  },
  {
    title: "The problem",
    focus: "One sentence, one specific person.",
    tasks: [
      { title: "Defining the problem", kind: "learn", ref: "lesson:project-building/defining-the-problem" },
      { title: "Write your problem statement", kind: "build" },
      { title: "Show it to three people and rewrite it", kind: "action" },
    ],
  },
  {
    title: "Prototype",
    focus: "Cheap answers before expensive building.",
    tasks: [
      { title: "Prototype vs MVP", kind: "learn", ref: "lesson:project-building/prototype-and-mvp" },
      { title: "Build a paper or clickable prototype", kind: "build" },
      { title: "Test it on five people", kind: "build" },
    ],
  },
  {
    title: "Talk to users",
    focus: "Fifteen minutes each, five people.",
    tasks: [
      { title: "Talking to users", kind: "learn", ref: "lesson:project-building/user-research" },
      { title: "Run five interviews about past behaviour", kind: "build" },
      { title: "Write down the one thing they all said", kind: "action" },
    ],
  },
  {
    title: "Build the MVP",
    focus: "One feature, done properly.",
    tasks: [
      { title: "Build the single core feature", kind: "build" },
      { title: "Use it yourself for a week", kind: "practice" },
      { title: "Fix the three things that annoyed you", kind: "build" },
    ],
  },
  {
    title: "Ship it",
    focus: "Public, running, with a front door.",
    tasks: [
      { title: "GitHub basics", kind: "learn", ref: "lesson:project-building/github-basics" },
      { title: "Write a README with a screenshot", kind: "build" },
      { title: "Deploy it somewhere with a link", kind: "build" },
    ],
  },
  {
    title: "First users",
    focus: "Ten real people using it.",
    tasks: [
      { title: "Get it in front of ten people", kind: "apply" },
      { title: "Collect what breaks", kind: "action" },
      { title: "Fix the top two", kind: "build" },
    ],
  },
  {
    title: "Project two",
    focus: "The second one is faster.",
    tasks: [
      { title: "Choose a second project in {subject}", kind: "action", subjectSlot: true },
      { title: "Build it in half the time", kind: "build" },
      { title: "Document it as you go, not after", kind: "build" },
    ],
  },
  {
    title: "Present it",
    focus: "Five slides, live demo.",
    tasks: [
      { title: "The pitch", kind: "learn", ref: "lesson:project-building/pitch-deck" },
      { title: "Build five slides for your strongest project", kind: "build" },
      { title: "Present it to someone and get feedback", kind: "practice" },
    ],
  },
  {
    title: "Portfolio page",
    focus: "One place that holds everything.",
    tasks: [
      { title: "Turn each project into CV bullets with numbers", kind: "build", ref: "lesson:applications-and-cv/cv-bullets" },
      { title: "Build a single page linking all projects", kind: "build" },
      { title: "Write the one-sentence description of each", kind: "build" },
    ],
  },
  {
    title: "Use it",
    focus: "A portfolio exists to open doors.",
    tasks: [
      { title: "Find opportunities that ask for a portfolio", kind: "apply", ref: "opportunity" },
      { title: "Apply to three of them", kind: "apply" },
      { title: "Enter one competition", kind: "apply" },
    ],
  },
  {
    title: "Project three",
    focus: "Depth now, not breadth.",
    tasks: [
      { title: "Pick the project worth going deep on", kind: "action" },
      { title: "Spend the month improving one thing", kind: "build" },
      { title: "Write about what you learned", kind: "build" },
    ],
  },
];

const FIND_INTERNSHIP: TemplateMilestone[] = [
  {
    title: "Target list",
    focus: "Know what you are aiming at.",
    tasks: [
      { title: "List 25 companies or labs you would want", kind: "action" },
      { title: "Note what each one screens for", kind: "action" },
      { title: "Find their application windows", kind: "apply", ref: "opportunity" },
    ],
  },
  {
    title: "CV",
    focus: "The document that decides whether you get read.",
    tasks: [
      { title: "Writing CV bullets that land", kind: "learn", ref: "lesson:applications-and-cv/cv-bullets" },
      { title: "Rewrite every bullet with a number", kind: "build" },
      { title: "Get it reviewed by someone in the industry", kind: "action" },
    ],
  },
  {
    title: "Portfolio gap",
    focus: "Build the evidence your CV is missing.",
    tasks: [
      { title: "Choosing a project you will finish", kind: "learn", ref: "lesson:project-building/choosing-a-project" },
      { title: "Build one {subject} project this month", kind: "build", subjectSlot: true },
      { title: "Put it on GitHub with a real README", kind: "build", ref: "lesson:project-building/github-basics" },
    ],
  },
  {
    title: "Outreach",
    focus: "Most roles are not on a job board.",
    tasks: [
      { title: "Emailing someone you do not know", kind: "learn", ref: "lesson:applications-and-cv/cold-outreach" },
      { title: "Send ten specific emails", kind: "apply" },
      { title: "Follow up once after a week", kind: "apply" },
    ],
  },
  {
    title: "Applications",
    focus: "Volume, but not generic volume.",
    tasks: [
      { title: "Apply to 15 roles with tailored first lines", kind: "apply" },
      { title: "Track every application and its status", kind: "action" },
      { title: "Save the deadlines that are still open", kind: "apply", ref: "opportunity" },
    ],
  },
  {
    title: "Technical prep",
    focus: "The screen before the interview.",
    tasks: [
      { title: "Practise the core problems for your field", kind: "practice" },
      { title: "Do one timed technical exercise a week", kind: "practice" },
      { title: "Learn to think out loud while solving", kind: "practice" },
    ],
  },
  {
    title: "Behavioural prep",
    focus: "Four stories cover almost everything.",
    tasks: [
      { title: "Answering 'tell me about a time when'", kind: "learn", ref: "lesson:applications-and-cv/interview-basics" },
      { title: "Write four STAR stories", kind: "build" },
      { title: "Practise them out loud with someone", kind: "practice" },
    ],
  },
  {
    title: "Interviews",
    focus: "Convert screens into offers.",
    tasks: [
      { title: "Do a mock interview", kind: "practice" },
      { title: "Prepare three questions to ask them", kind: "action" },
      { title: "Debrief after each real interview", kind: "action" },
    ],
  },
  {
    title: "Second wave",
    focus: "Most people stop too early.",
    tasks: [
      { title: "Apply to 15 more, including smaller companies", kind: "apply" },
      { title: "Revisit the roles you were rejected from", kind: "action" },
      { title: "Ask for feedback where you got far", kind: "action" },
    ],
  },
  {
    title: "Credentials",
    focus: "Close the gap the rejections pointed at.",
    tasks: [
      { title: "Pick one certification that matters in your field", kind: "apply", ref: "opportunity" },
      { title: "Complete it", kind: "learn" },
      { title: "Add it to your CV and profile", kind: "build" },
    ],
  },
  {
    title: "Offer stage",
    focus: "Decide well, not just gratefully.",
    tasks: [
      { title: "Compare offers on learning, mentor and scope", kind: "action" },
      { title: "Ask about the team and the project specifically", kind: "action" },
      { title: "Accept, and thank everyone who helped", kind: "action" },
    ],
  },
  {
    title: "Make it count",
    focus: "The internship is the start, not the prize.",
    tasks: [
      { title: "Set three goals for the internship itself", kind: "action" },
      { title: "Plan what you want to have built by the end", kind: "action" },
      { title: "Choose your next 365-day goal", kind: "action" },
    ],
  },
];

const WIN_COMPETITIONS: TemplateMilestone[] = [
  {
    title: "Find the contests",
    focus: "You cannot win what you have not entered.",
    tasks: [
      { title: "Find every {subject} competition open to you", kind: "apply", ref: "opportunity", subjectSlot: true },
      { title: "Save the five that fit best", kind: "apply", ref: "opportunity" },
      { title: "Work out the qualification route for each", kind: "action" },
    ],
  },
  {
    title: "Problem solving base",
    focus: "Fundamentals before tricks.",
    tasks: [
      { title: "Build the core skills for your contest", kind: "learn", ref: "course:sat-math" },
      { title: "Solve five problems a day", kind: "practice" },
      { title: "Keep a log of every problem you could not solve", kind: "action" },
    ],
  },
  {
    title: "Past papers",
    focus: "The single highest-return activity.",
    tasks: [
      { title: "Work through three years of past papers", kind: "practice" },
      { title: "Categorise the problem types that recur", kind: "action" },
      { title: "Redo every problem you failed, a week later", kind: "practice" },
    ],
  },
  {
    title: "Timed conditions",
    focus: "Speed is a separate skill from ability.",
    tasks: [
      { title: "One full timed paper a week", kind: "practice" },
      { title: "Learn when to abandon a problem", kind: "practice" },
      { title: "Track your score trend", kind: "action" },
    ],
  },
  {
    title: "Weak areas",
    focus: "Go where you are uncomfortable.",
    tasks: [
      { title: "Rank topics by your error rate", kind: "action" },
      { title: "Two weeks on your worst topic only", kind: "practice" },
      { title: "Retest it", kind: "practice" },
    ],
  },
  {
    title: "Qualifier",
    focus: "The first real gate.",
    tasks: [
      { title: "Register for the qualifying round", kind: "apply" },
      { title: "Two full mocks before it", kind: "practice" },
      { title: "Sit the qualifier", kind: "apply" },
    ],
  },
  {
    title: "Team or project contest",
    focus: "A second route, with different odds.",
    tasks: [
      { title: "Find a team or project-based competition", kind: "apply", ref: "opportunity" },
      { title: "Form a team or define a project", kind: "build" },
      { title: "Build the first version", kind: "build" },
    ],
  },
  {
    title: "Advanced problems",
    focus: "Past the level of the qualifier.",
    tasks: [
      { title: "Work on problems above your current level", kind: "practice" },
      { title: "Find a training group or online community", kind: "action" },
      { title: "Teach one topic to someone else", kind: "practice" },
    ],
  },
  {
    title: "Submission quality",
    focus: "Good work, badly presented, loses.",
    tasks: [
      { title: "The pitch", kind: "learn", ref: "lesson:project-building/pitch-deck" },
      { title: "Prepare your submission properly", kind: "build" },
      { title: "Get it critiqued before you send it", kind: "action" },
    ],
  },
  {
    title: "Main round",
    focus: "Everything has pointed here.",
    tasks: [
      { title: "Taper your practice the final week", kind: "practice" },
      { title: "Compete", kind: "apply" },
      { title: "Write down what surprised you", kind: "action" },
    ],
  },
  {
    title: "Convert the result",
    focus: "A placement is currency.",
    tasks: [
      { title: "Add the result to your CV with numbers", kind: "build", ref: "lesson:applications-and-cv/cv-bullets" },
      { title: "Find programmes that value contest results", kind: "apply", ref: "opportunity" },
      { title: "Apply to two of them", kind: "apply" },
    ],
  },
  {
    title: "Next season",
    focus: "Compound it.",
    tasks: [
      { title: "Pick the next competition tier up", kind: "action" },
      { title: "Plan the training for it", kind: "action" },
      { title: "Mentor someone starting out", kind: "action" },
    ],
  },
];

const CAREER_SKILLS: TemplateMilestone[] = [
  {
    title: "Audit",
    focus: "Know the gap before you fill it.",
    tasks: [
      { title: "List the skills 10 target job ads ask for", kind: "action" },
      { title: "Rate yourself honestly on each", kind: "action" },
      { title: "Pick the three worth closing first", kind: "action" },
    ],
  },
  {
    title: "CV",
    focus: "Make what you already have legible.",
    tasks: [
      { title: "Writing CV bullets that land", kind: "learn", ref: "lesson:applications-and-cv/cv-bullets" },
      { title: "Rewrite your CV with outcomes and numbers", kind: "build" },
      { title: "Get it reviewed", kind: "action" },
    ],
  },
  {
    title: "Core skill one",
    focus: "Depth in the thing that matters most.",
    tasks: [
      { title: "Work through a course in your first gap skill", kind: "learn" },
      { title: "Apply it to something real", kind: "build" },
      { title: "Document what you built", kind: "build" },
    ],
  },
  {
    title: "Communication",
    focus: "The skill that multiplies the others.",
    tasks: [
      { title: "Presenting your work", kind: "learn", ref: "lesson:research-fundamentals/presenting" },
      { title: "Present something to a group", kind: "practice" },
      { title: "Write a clear one-page summary of a complex thing", kind: "build" },
    ],
  },
  {
    title: "Portfolio",
    focus: "Evidence over claims.",
    tasks: [
      { title: "Choosing a project you will finish", kind: "learn", ref: "lesson:project-building/choosing-a-project" },
      { title: "Build one project that uses your new skill", kind: "build" },
      { title: "Publish it with a README", kind: "build", ref: "lesson:project-building/github-basics" },
    ],
  },
  {
    title: "Network",
    focus: "Specific people, not 'networking'.",
    tasks: [
      { title: "Emailing someone you do not know", kind: "learn", ref: "lesson:applications-and-cv/cold-outreach" },
      { title: "Have five conversations with people doing your target job", kind: "apply" },
      { title: "Ask each what they wish they had learned earlier", kind: "action" },
    ],
  },
  {
    title: "Credential",
    focus: "A verifiable marker, where it counts.",
    tasks: [
      { title: "Choose a certification that is actually respected", kind: "apply", ref: "opportunity" },
      { title: "Study for it", kind: "learn" },
      { title: "Pass it", kind: "apply" },
    ],
  },
  {
    title: "Interview skill",
    focus: "Preparable, so prepare it.",
    tasks: [
      { title: "Answering 'tell me about a time when'", kind: "learn", ref: "lesson:applications-and-cv/interview-basics" },
      { title: "Write four STAR stories", kind: "build" },
      { title: "Do two mock interviews", kind: "practice" },
    ],
  },
  {
    title: "Core skill two",
    focus: "The second gap.",
    tasks: [
      { title: "Work through your second gap skill", kind: "learn" },
      { title: "Use it in a second project", kind: "build" },
      { title: "Get feedback from someone senior", kind: "action" },
    ],
  },
  {
    title: "Visibility",
    focus: "Be findable.",
    tasks: [
      { title: "Write publicly about one thing you learned", kind: "build" },
      { title: "Build a single page that holds your work", kind: "build" },
      { title: "Make your profile match your CV", kind: "action" },
    ],
  },
  {
    title: "Apply",
    focus: "Test the market.",
    tasks: [
      { title: "Find roles and programmes that fit now", kind: "apply", ref: "opportunity" },
      { title: "Apply to ten", kind: "apply" },
      { title: "Track and debrief each one", kind: "action" },
    ],
  },
  {
    title: "Consolidate",
    focus: "Turn a year into a story.",
    tasks: [
      { title: "Write the narrative connecting your year", kind: "build" },
      { title: "Update every document with it", kind: "build" },
      { title: "Choose the next 365 days", kind: "action" },
    ],
  },
];

export const ROADMAP_TEMPLATES: Record<string, TemplateMilestone[]> = {
  "get-into-university": GET_INTO_UNIVERSITY,
  "improve-sat": IMPROVE_SAT,
  "improve-ielts": IMPROVE_IELTS,
  "start-research": START_RESEARCH,
  "build-portfolio": BUILD_PORTFOLIO,
  "find-internship": FIND_INTERNSHIP,
  "win-competitions": WIN_COMPETITIONS,
  "career-skills": CAREER_SKILLS,
};

export function templateFor(goalSlug: string): TemplateMilestone[] {
  return ROADMAP_TEMPLATES[goalSlug] ?? BUILD_PORTFOLIO;
}
