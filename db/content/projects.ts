import type { SeedCourse } from "./types";

export const PROJECT_COURSES: SeedCourse[] = [
  {
    slug: "project-building",
    track: "Projects",
    title: "Building Your First Project",
    subtitle: "From idea to something you can show someone",
    description:
      "A project is the single most useful thing in a portfolio, and the hardest to start. This course covers scoping, prototyping, testing and presenting.",
    difficulty: "beginner",
    subjects: ["cs", "engineering", "business", "design", "data-science"],
    audiences: ["school", "university", "graduate"],
    goalSlugs: ["build-portfolio", "get-into-university", "find-internship", "career-skills"],
    accent: "fuchsia",
    lessons: [
      {
        slug: "choosing-a-project",
        title: "Choosing a project you will finish",
        objective: "Pick a first project scoped to actually ship.",
        estMinutes: 7,
        theory:
          "The best project is not the most impressive one. It is the one you will finish, because an unfinished project is worth nothing in a portfolio and a finished small one is worth a lot.\n\nThree filters:\n\n**Can you make a rough version in a weekend?** If not, the scope is wrong for a first project. Cut it down until the answer is yes.\n\n**Do you personally want the thing to exist?** Motivation runs out around week two. Genuine interest is the only reliable fuel.\n\n**Can you show it in 30 seconds?** If explaining it takes five minutes, nobody at a fair, an interview or an admissions desk will get to the good part.\n\nOne working feature beats ten half-built ones. Always.",
        example:
          "❌ \"A social network for students\" — months of work, needs other users to be interesting at all, impossible to demo alone.\n\n✅ \"A tool that turns my class timetable into calendar reminders\" — a weekend, useful to you on day one, demoable in fifteen seconds.\n\nThe second is smaller and a much better portfolio piece, because it exists and it works.",
        takeaway: "Weekend-sized, personally wanted, demoable in 30 seconds.",
        questions: [
          {
            prompt: "What is the best test of a first project's scope?",
            options: [
              "It uses impressive technology",
              "A rough working version is possible in a weekend",
              "It would take a full year",
              "Nobody has built anything like it",
            ],
            correctIndex: 1,
            explanation:
              "A weekend-sized first version means you reach something working before motivation runs out — and you can then extend it as far as you like.",
          },
          {
            prompt: "One working feature versus ten half-built features:",
            options: [
              "Ten features look more impressive",
              "One working feature is worth more",
              "They are equivalent",
              "Depends on the deadline",
            ],
            correctIndex: 1,
            explanation:
              "Anyone evaluating the project will try it. One thing that works survives that; ten things that half-work do not.",
          },
          {
            prompt: "Why does 'can you demo it in 30 seconds' matter?",
            options: [
              "Competitions have 30-second limits",
              "Because judges, interviewers and admissions readers give you about that long before deciding to keep listening",
              "It keeps the code short",
              "It is a formal requirement",
            ],
            correctIndex: 1,
            explanation:
              "Attention is the constraint. A project that needs a long preamble never gets to show what it does.",
          },
        ],
      },
      {
        slug: "defining-the-problem",
        title: "Defining the problem",
        objective: "State the problem your project solves, for a specific person.",
        estMinutes: 7,
        theory:
          "Write the problem down before you build anything. If you cannot state it in one sentence, you do not have one yet — you have a technology you want to use.\n\nUse this frame:\n\n> **[Specific person]** needs to **[do something]** but **[obstacle]**, which means **[consequence]**.\n\nThe word doing the work is *specific*. \"Students\" is not a person. \"A Year 11 student revising for three exams in one week\" is, and it tells you what to build.\n\nAvoid solutions-in-disguise. \"People need an app for tracking habits\" is a solution wearing a problem's clothes. The problem underneath is that people forget which days they did the thing and lose the sense of a streak.",
        example:
          "❌ \"I want to build an app with AI.\"\n\n✅ \"A Year 11 student revising for three exams in one week needs to know what to study today, but their notes are spread across four subjects with no sense of which topics are weakest, which means they revise what feels comfortable instead of what they are failing.\"\n\nThe second tells you exactly what to build first: a way to mark topic confidence and sort by weakest.",
        takeaway: "One sentence: specific person, goal, obstacle, consequence. Not a technology you like.",
        questions: [
          {
            prompt: "Which is a problem statement rather than a solution in disguise?",
            options: [
              "We need a mobile app for the school",
              "A commuting student cannot tell when the next bus is actually coming, so they arrive 20 minutes early or miss it",
              "I want to use machine learning",
              "The school should have a better website",
            ],
            correctIndex: 1,
            explanation:
              "It names a specific person, their goal, the obstacle and the cost. The others name technologies or vague dissatisfaction with no diagnosis.",
          },
          {
            prompt: "Why must the person in a problem statement be specific?",
            options: [
              "To make the statement longer",
              "Because a specific person's needs tell you what to build; 'everyone' tells you nothing",
              "For privacy reasons",
              "To limit your market",
            ],
            correctIndex: 1,
            explanation:
              "Design decisions come from a concrete user's context. A generic audience gives you no basis for any decision.",
          },
          {
            prompt: "'People need a habit-tracking app' is:",
            options: [
              "A good problem statement",
              "A solution presented as a problem",
              "Too specific",
              "A research question",
            ],
            correctIndex: 1,
            explanation:
              "It names the app rather than the difficulty the app would address, which closes off better solutions before you have understood the problem.",
          },
        ],
      },
      {
        slug: "prototype-and-mvp",
        title: "Prototype vs MVP",
        objective: "Know which one to build, and build the right one first.",
        estMinutes: 8,
        theory:
          "These two get used interchangeably and they are not the same thing.\n\nA **prototype** answers a question for you. It can be paper, a clickable mockup, or code that only works if you type the input exactly right. It is disposable, and that is the point — it exists to test whether an idea makes sense before you invest in it.\n\nAn **MVP** is the smallest version a real person can actually use to get real value. It is not disposable, it is not broken, and it does one thing properly.\n\nBuild the prototype first, always. A day of paper sketching routinely saves a fortnight of building the wrong thing.\n\nThe usual mistake is confusing *minimum viable* with *minimum effort*. An MVP that crashes is not viable. Narrow scope, finished quality.",
        example:
          "Idea: a tool that recommends what to revise next.\n\n**Prototype (2 hours):** paper cards showing what the screen would say. Show five classmates. Three ask \"how does it know what I am weak at?\" — a question you had not answered. Cheap discovery.\n\n**MVP (a weekend):** you type in your topics and rate your confidence 1–5; it shows the lowest three. No accounts, no syncing, no AI. One thing, done properly, genuinely useful.",
        takeaway: "Prototype to test an idea, MVP to deliver value. Minimum viable, not minimum effort.",
        questions: [
          {
            prompt: "The purpose of a prototype is to:",
            options: [
              "Be your first release",
              "Answer a question about your idea cheaply",
              "Impress investors",
              "Replace the MVP",
            ],
            correctIndex: 1,
            explanation:
              "A prototype buys information. It is meant to be thrown away once it has told you whether the idea holds up.",
          },
          {
            prompt: "An MVP that crashes frequently is:",
            options: [
              "Acceptable, since it is minimal",
              "Not viable, and so not an MVP",
              "Fine for a portfolio",
              "Better than no MVP",
            ],
            correctIndex: 1,
            explanation:
              "The 'viable' half of the term means a real person can get real value from it. Minimal refers to scope, never to quality.",
          },
          {
            prompt: "What should you build first?",
            options: [
              "The MVP, to save time",
              "A prototype, to check the idea before investing",
              "The full product",
              "The marketing site",
            ],
            correctIndex: 1,
            explanation:
              "Prototypes are hours; MVPs are weekends or weeks. Testing the assumption first is what stops you spending the weeks on the wrong thing.",
          },
        ],
      },
      {
        slug: "user-research",
        title: "Talking to users",
        objective: "Run a five-person interview round without leading them.",
        estMinutes: 8,
        theory:
          "Five conversations of fifteen minutes will change your project more than a week of building. Most of the value arrives in the first three.\n\nThe rule that matters: **ask about their past, not your idea.**\n\n\"Would you use an app that reminded you to revise?\" produces a polite yes that means nothing. \"Walk me through how you decided what to revise last night\" produces facts.\n\nSo ask: what did you do, when did you last do it, what was annoying about it, what did you try instead. All about behaviour that already happened.\n\nAnd count the silences. When you describe your idea and someone says \"oh, interesting\" and changes the subject, that is data. Enthusiasm is cheap; specific frustration is the signal you want.",
        example:
          "❌ \"Do you think a revision planner would be useful?\" → \"Yeah, definitely.\" (Worthless. They are being kind.)\n\n✅ \"What did you revise last night, and how did you pick it?\" → \"Honestly I just redid the chemistry flashcards because they were open. I know I should do maths but I do not know where to start with it.\"\n\nThat one answer tells you the real problem is not scheduling — it is not knowing where to start in a weak subject. Which is a different product.",
        takeaway: "Ask what they did, not what they would do. Specific frustration beats enthusiasm.",
        questions: [
          {
            prompt: "Which question produces useful information?",
            options: [
              "Would you use this app?",
              "Do you like this idea?",
              "Walk me through the last time you tried to do this",
              "How much would you pay for it?",
            ],
            correctIndex: 2,
            explanation:
              "A recollection of actual behaviour is checkable and detailed. The others invite speculation or politeness about a hypothetical.",
          },
          {
            prompt: "Roughly how many interviews before the main patterns appear?",
            options: ["One", "About five", "Fifty", "Several hundred"],
            correctIndex: 1,
            explanation:
              "Five short conversations surface most of the big issues, with the first three doing most of the work. Large samples matter for measurement, not for discovering problems.",
          },
          {
            prompt: "Someone says 'interesting' about your idea and changes the subject. This is:",
            options: [
              "Positive validation",
              "Meaningless politeness",
              "A signal of weak interest worth noting",
              "A reason to build faster",
            ],
            correctIndex: 2,
            explanation:
              "Lack of engagement is real information. People who actually have the problem tend to interrupt with their own version of it.",
          },
        ],
      },
      {
        slug: "github-basics",
        title: "GitHub basics",
        objective: "Get a project online with a README anyone can follow.",
        estMinutes: 9,
        theory:
          "A project nobody can find or run does not count. GitHub is where you put it, and the README is the part that actually matters.\n\nThe workflow, in four commands:\n\n```\ngit init\ngit add .\ngit commit -m \"Initial commit\"\ngit push\n```\n\nCommit as you go, with messages that say what changed and why — \"fix login redirect\" rather than \"update\". A year later, and to anyone reviewing your repo, the history is part of the work.\n\nThen the README, which most people neglect and which is the first and often only thing a reviewer reads. It needs five things:\n\n1. What this is, in one sentence.\n2. A screenshot or a short recording.\n3. How to run it, as commands that work.\n4. What it does.\n5. What you would do next.\n\nA modest project with an excellent README reads as far more competent than an ambitious one with none.",
        example:
          "```markdown\n# Timetable to Calendar\n\nTurns a photo of a school timetable into calendar reminders.\n\n![screenshot](docs/screenshot.png)\n\n## Run it\n\n    npm install\n    npm run dev\n\n## How it works\n\nOCR extracts the grid, then each cell becomes a weekly\nrecurring event exported as .ics.\n\n## Next\n\nHandle two-week rotating timetables.\n```\n\nSix lines of prose and it answers every question a reviewer has.",
        takeaway: "Commit often with real messages. The README is the project's front door — give it a screenshot and working commands.",
        questions: [
          {
            prompt: "What is the most important file in a portfolio repository?",
            options: ["index.html", "The README", "package.json", ".gitignore"],
            correctIndex: 1,
            explanation:
              "The README is what a reviewer reads first and often all they read. It determines whether the rest of the repo gets looked at.",
          },
          {
            prompt: "Which commit message is best?",
            options: ["update", "stuff", "fix login redirect losing the return URL", "asdf"],
            correctIndex: 2,
            explanation:
              "It says what changed and what problem it addressed, which is what makes a history useful to a reviewer and to you later.",
          },
          {
            prompt: "A README should include:",
            options: [
              "Your full CV",
              "One-sentence description, screenshot, run instructions, and what is next",
              "Only the licence",
              "The entire source code",
            ],
            correctIndex: 1,
            explanation:
              "Those four answer a reviewer's questions in order: what is it, does it work, can I run it, and do you know where it is going.",
          },
        ],
        resources: [
          {
            title: "Git and GitHub for beginners",
            source: "GitHub Docs",
            url: "https://docs.github.com/en/get-started/start-your-journey/hello-world",
            durationMin: 15,
            topic: "Version control",
            difficulty: "beginner",
          },
        ],
      },
      {
        slug: "pitch-deck",
        title: "The pitch",
        objective: "Present a project in five slides without losing the room.",
        estMinutes: 8,
        theory:
          "Whether it is a competition, a class presentation or a grant application, the structure barely changes:\n\n1. **The problem** — one specific person, one specific difficulty.\n2. **The solution** — what you built, in one sentence.\n3. **Demo** — show it working. This is the slide that matters.\n4. **Why it works** — evidence. Users tested, results measured, something real.\n5. **What is next** — you have thought past today.\n\nStart with the problem, not with yourself. \"Hi, we are team seven and we are very excited\" spends your best attention on nothing.\n\nAnd demo the real thing. A live demo that stutters is more convincing than a flawless video, because everyone in the room knows the difference.\n\nOne message per slide. If a slide needs a paragraph, it is two slides.",
        example:
          "Weak opening: \"Hello, we are team seven. Our project is called StudyFlow. We used React and Node and a machine learning model...\"\n\nStrong opening: \"Last week I watched my sister spend two hours revising the subject she was already best at, because she did not know where to start with the one she was failing. She is not unusual — here is what we built.\"\n\nThe second earns the next ninety seconds. The first spends them.",
        takeaway: "Problem, solution, live demo, evidence, next. Open with the problem, never with your team name.",
        questions: [
          {
            prompt: "What should the first slide cover?",
            options: [
              "Your team introduction",
              "The technology stack",
              "The problem, concretely",
              "Your timeline",
            ],
            correctIndex: 2,
            explanation:
              "The problem is what makes the audience care about the solution. Team and stack details mean nothing before that context exists.",
          },
          {
            prompt: "A live demo that occasionally stutters versus a polished pre-recorded video:",
            options: [
              "The video is always safer and better",
              "The live demo is more convincing because it proves the thing actually works",
              "They are equivalent",
              "Neither should be shown",
            ],
            correctIndex: 1,
            explanation:
              "An audience knows a video can hide anything. Small live imperfections are a price worth paying for demonstrated reality.",
          },
          {
            prompt: "A slide that needs a full paragraph of text should be:",
            options: [
              "Read aloud word for word",
              "Split into two slides",
              "Left as it is",
              "Put in the appendix",
            ],
            correctIndex: 1,
            explanation:
              "One message per slide keeps the audience listening to you instead of reading ahead. A paragraph is a sign two ideas are sharing a slide.",
          },
        ],
      },
    ],
  },
];
