import type { SeedCourse } from "./types";

export const CAREER_COURSES: SeedCourse[] = [
  {
    slug: "applications-and-cv",
    track: "Career",
    title: "Applications & CV",
    subtitle: "The documents that decide whether you get read",
    description:
      "A CV, a cover message and an outreach email. Short lessons on the three documents that stand between you and an internship or a programme.",
    difficulty: "beginner",
    subjects: ["business", "cs", "engineering", "economics"],
    audiences: ["university", "graduate", "school"],
    goalSlugs: ["find-internship", "career-skills", "build-portfolio"],
    accent: "teal",
    lessons: [
      {
        slug: "cv-bullets",
        title: "Writing CV bullets that land",
        objective: "Turn a duty into an accomplishment with a number in it.",
        estMinutes: 8,
        theory:
          "A CV bullet has one job: show an outcome. Most bullets describe duties instead, and duties are forgettable.\n\nUse **action verb + what you did + measurable result**.\n\n\"Responsible for social media\" is a duty. \"Grew the society's Instagram from 200 to 1,400 followers in four months by posting member interviews weekly\" is an accomplishment — same work, completely different signal.\n\nYou almost always have numbers, even when it feels like you do not: how many people, how often, how long, how much faster, what percentage. If a number genuinely does not exist, use scope: how many subjects, what size team, what audience.\n\nAnd cut \"responsible for\", \"helped with\" and \"participated in\" everywhere they appear. They shrink whatever follows them.",
        example:
          "Before → After:\n\n• \"Helped organise school science fair\" → \"Coordinated a 40-project science fair for 300 attendees, recruiting 12 volunteer judges\"\n\n• \"Did a research project\" → \"Ran a 14-day sleep and screen-time study with 60 participants; wrote up the 41-minute association as a 6-page report\"\n\n• \"Learned Python\" → \"Built three Python tools, including a timetable-to-calendar converter now used by 20 classmates\"\n\nThe work did not change. The evidence did.",
        takeaway: "Action verb, what you did, a number. Delete 'responsible for' and 'helped with'.",
        questions: [
          {
            prompt: "Which bullet is strongest?",
            options: [
              "Responsible for the school newspaper",
              "Helped with writing articles",
              "Edited a monthly school newspaper, growing readership from 150 to 600 across one year",
              "Participated in journalism activities",
            ],
            correctIndex: 2,
            explanation:
              "It opens with an action verb and carries a measured outcome. The others describe duties or involvement with no result attached.",
          },
          {
            prompt: "You have no numbers for an activity. The best alternative is:",
            options: [
              "Invent a plausible number",
              "Use scope — team size, audience, duration, how many subjects",
              "Leave the bullet vague",
              "Omit the activity",
            ],
            correctIndex: 1,
            explanation:
              "Scope is honest and still concrete. Inventing figures is a serious integrity problem and is often checked at interview.",
          },
          {
            prompt: "Why cut phrases like 'responsible for'?",
            options: [
              "They are too informal",
              "They describe a duty rather than a result, and weaken what follows",
              "They are grammatically incorrect",
              "They take too much space",
            ],
            correctIndex: 1,
            explanation:
              "Being responsible for something says nothing about whether it went well. Leading with the action and the outcome does.",
          },
        ],
      },
      {
        slug: "cold-outreach",
        title: "Emailing someone you do not know",
        objective: "Write a cold email a busy professor or engineer will answer.",
        estMinutes: 8,
        theory:
          "Cold emails work far more often than people expect. They fail for predictable reasons: too long, too vague, and asking for too much.\n\nFive sentences, maximum:\n\n1. **Who you are** — one line.\n2. **Specific evidence you know their work** — name the paper, the project, the talk. This is the sentence that decides whether they keep reading.\n3. **What you want** — one concrete, small thing.\n4. **Why you** — one relevant thing you have actually done.\n5. **An easy exit** — make saying no simple.\n\nAsk small. \"Can I be your research student for the summer\" is a large request from a stranger. \"Could I ask two questions about your method by email\" is small, and it is how the larger thing starts.\n\nNever send the same email to twenty people. One genuinely specific email beats twenty generic ones, and the generic ones are obvious.",
        example:
          "> Subject: Question about your 2024 river nitrate study\n>\n> Dear Dr Okonkwo,\n>\n> I am a Year 11 student in Almaty working on a water-quality project. I read your 2024 paper on weekday–weekend nitrate variation in the Vistula and was struck that the weekend effect held even in the low-flow months.\n>\n> I am setting up a similar sampling schedule on a small river here and wanted to ask two short questions about how you handled sampling after rainfall.\n>\n> Last term I ran a 14-day water-clarity study at three points on this river, so I have some sampling experience, though nothing at your scale.\n>\n> If you do not have time, I completely understand — thank you for the paper either way.\n\nSpecific, small, and easy to decline. That is why it gets answered.",
        takeaway: "Five sentences. Prove you read their work. Ask for something small. Make no easy.",
        questions: [
          {
            prompt: "Which sentence most determines whether a cold email gets read?",
            options: [
              "The introduction of yourself",
              "Specific evidence that you know their actual work",
              "The sign-off",
              "The subject line length",
            ],
            correctIndex: 1,
            explanation:
              "A specific reference proves the email was written for them rather than mass-sent, which is the main thing that separates it from spam.",
          },
          {
            prompt: "What size request works best in a first cold email?",
            options: [
              "A summer research position",
              "Co-authorship on a paper",
              "Two specific questions by email",
              "A long video call",
            ],
            correctIndex: 2,
            explanation:
              "Small asks are cheap to grant, and granting one starts the relationship from which bigger opportunities follow.",
          },
          {
            prompt: "Sending one email to twenty researchers at once is:",
            options: [
              "Efficient and recommended",
              "Less effective than one specific email, and usually obvious to the recipient",
              "Fine if you change the name",
              "The standard approach",
            ],
            correctIndex: 1,
            explanation:
              "Generic emails read as generic. Researchers receive many and answer the ones that show real engagement with their work.",
          },
        ],
      },
      {
        slug: "interview-basics",
        title: "Answering 'tell me about a time when'",
        objective: "Structure a behavioural answer so it does not wander.",
        estMinutes: 8,
        theory:
          "Behavioural questions — \"tell me about a time you disagreed with someone\", \"describe a problem you solved\" — are the bulk of most interviews, and they are entirely preparable.\n\nUse **STAR**:\n\n• **Situation** — one sentence of context.\n• **Task** — what you specifically had to do.\n• **Action** — what you did. This should be most of your answer.\n• **Result** — how it turned out, with a number if there is one.\n\nTwo habits cost candidates the most. Spending a minute on Situation and ten seconds on Action — the interviewer wants to know what *you* did. And saying \"we\" throughout, which makes your own contribution invisible.\n\nPrepare four stories, not twenty. One where you led something, one where something failed, one where you disagreed with someone, one where you learned something fast. Nearly every behavioural question maps onto one of those four.",
        example:
          "\"Tell me about a time a project went wrong.\"\n\n**S:** \"Our robotics team's arm kept failing the week before regionals.\"\n**T:** \"I had built the gripper, so diagnosing it was mine.\"\n**A:** \"I logged every failure instead of guessing — 14 attempts over two evenings — and found it only failed on the third consecutive lift, which pointed at heat rather than the code we had all assumed. I added a delay between lifts and reprinted the mount in a stiffer material.\"\n**R:** \"It completed 40 lifts without failing at regionals. We placed fourth, and I now log before I theorise.\"\n\nThe Action section is the longest, it is all first person, and the result has a number.",
        takeaway: "STAR, with Action longest. Say 'I'. Prepare four stories, not twenty.",
        questions: [
          {
            prompt: "Which part of a STAR answer should be longest?",
            options: ["Situation", "Task", "Action", "Result"],
            correctIndex: 2,
            explanation:
              "The interviewer is assessing what you personally did. Context is setup; your actions are the evidence they are listening for.",
          },
          {
            prompt: "Saying 'we' throughout a behavioural answer:",
            options: [
              "Shows you are a team player",
              "Makes your own contribution invisible",
              "Is required for group projects",
              "Is more honest",
            ],
            correctIndex: 1,
            explanation:
              "Credit the team once, then describe your own actions in the first person — otherwise the interviewer cannot tell what you did.",
          },
          {
            prompt: "How many prepared stories cover most behavioural questions?",
            options: ["One", "About four", "Twenty", "One per company"],
            correctIndex: 1,
            explanation:
              "Leadership, failure, conflict and fast learning cover the great majority of questions, and four stories can be reshaped to fit each framing.",
          },
        ],
      },
    ],
  },
];
