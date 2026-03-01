import { ReportData } from './types';

export const reportData: ReportData = {
  meta: {
    generated: "2026-01-24T23:22:32",
    professor: "Yue Li",
    student: "Fangze Qiu",
    overallScore: 4.5
  },
  professorProfile: {
    name: "Yue Li",
    title: "Assistant Professor / Lab Director",
    lab: "HER Lab (Human-Centered Extended Reality)",
    institution: "Xi’an Jiaotong-Liverpool University (XJTLU)",
    imageInitials: "YL",
    focusAreas: [
      "Cultural Heritage",
      "Extended Reality (XR)",
      "Education Technology",
      "LLM Agents in VR"
    ],
    keyVenues: ["CHI", "ISMAR", "TVCG", "IEEE VR", "IJHCI"],
    mentorshipStyle: "Project-based, hands-on, active with student competitions & undergraduates.",
    currentStatus: "Active publication record (2025); PhD hiring status unclear/generic.",
    keyReads: [
      {
        title: "The Effects of LLM-Empowered Chatbots on User Experience in Virtual Museums",
        year: "2024/2025",
        citation: "Recent Work",
        type: "Must Read"
      },
      {
        title: "MagicMap: Interactive XR for Education",
        year: "Recent",
        citation: "System Paper",
        type: "System"
      },
      {
        title: "Interactive Visualization of Sport Climbing Data",
        year: "2023",
        citation: "INTERACT 2023",
        type: "Co-Authored"
      }
    ]
  },
  executiveSnapshot: {
    title: "Executive Snapshot",
    content: [
      { text: "Strong publication activity through 2025 in HCI/XR and VR venues.", type: "positive" },
      { text: "Clear research focus on Cultural Heritage, Education, and Extended Reality (XR).", type: "positive" },
      { text: "Active engagement with undergraduate and master students via competitions.", type: "positive" },
      { text: "PhD hiring status unclear; generic recruitment message for students.", type: "warning" },
      { text: "Team composition and alumni outcomes are currently missing/unknown.", type: "warning" }
    ]
  },
  fitDimensions: [
    { category: "Topic Alignment", score: 5, description: "Direct co-authorship + tight domain overlap (XR, Museums, Heritage)." },
    { category: "Methods", score: 5, description: "Strong match in prototyping, user studies, and quantitative analysis." },
    { category: "Skills Readiness", score: 4, description: "Solid coding/UX portfolio; VR modeling may need ramp-up." },
    { category: "Mentorship", score: 3, description: "Likely hands-on project-based, but advising norms are unclear." },
    { category: "Breadth", score: 4, description: "Good breadth match within interactive tech/XR." },
    { category: "Recruitment", score: 2, description: "Open collaboration channel, but no specific PhD openings listed." },
    { category: "Lab Culture", score: 3, description: "Collaborative/Project-driven, but team size/norms unknown." },
    { category: "Pipeline", score: 1, description: "Alumni outcomes completely missing; career path unclear." }
  ],
  fitMatrix: {
    thrive: [
      "XR/HCI-focused students interested in museums/education.",
      "Builders of interactive VR/AR prototypes with user study skills.",
      "Quantitative HCI/VR modelers (gaze/steering/performance).",
      "Collaboration-savvy students comfortable with multi-author projects."
    ],
    struggle: [
      "Students seeking pure theory with minimal prototyping.",
      "Students focused on non-XR domains.",
      "Students needing highly structured/explicit application processes.",
      "Students requiring guaranteed PhD funding clarity upfront."
    ]
  },
  flags: {
    green: [
      "Active 2025 publications in top venues (TVCG, VR, IJHCI).",
      "Clear thematic focus on Cultural Heritage & Education.",
      "Direct prior co-authorship (INTERACT 2023).",
      "Evidence of student engagement (Competitions, UG/Master projects)."
    ],
    yellow: [
      "PhD hiring details not specified; generic email invite.",
      "Funding sources listed without current dates.",
      "Team composition and advising bandwidth unknown.",
      "Website freshness unclear (no recent news updates)."
    ],
    red: [
      "Alumni outcomes not available (pipeline risk).",
      "Application requirements/deadlines not defined."
    ]
  },
  actionPlan: {
    gaps: [
      "Openings/funding timeline unknown.",
      "Advising cadence and authorship expectations unknown.",
      "XR equipment/resources access details missing.",
      "Method emphasis balance (Qual vs Quant/Modeling) unspecified.",
      "Specific role type and start timing (Post-MA) unclear."
    ],
    verification: [
      "Ask PI: What PhD openings do you expect in the next 6–12 months?",
      "Ask PI: What funding sources are currently active?",
      "Ask PI: How many researchers are in HER Lab now?",
      "Verify: Alumni outcomes and placement pipeline.",
      "Verify: Access to XR equipment and research infrastructure."
    ]
  },
  emailKit: [
    {
      label: "Short & Direct (Recommended)",
      subject: "Exploring XR museum guides: LLM agents + data viz (Qiu -> HER Lab)",
      body: `Dear Prof. Li,

I’m Fangze Qiu (INTERACT’23 co-author with you on sport climbing visualization). Your recent work on “LLM-Empowered Chatbots… in Virtual Museums” and “MagicMap” aligns with my LLM agent development (Discord + RAG/LoRA) and XR/UX evaluation experience.

May I propose a small pilot on LLM-driven museum guides with an evaluation/visualization pipeline? Are you currently open to collaboration or PhD/RA roles? If so, could we schedule a 20–30 min call?

I’ve attached my CV; portfolio: http://www.innoqiu.cn.

Best regards,
Fangze Qiu
fangze.qiu@outlook.com`
    },
    {
      label: "Standard / Formal",
      subject: "Inquiry: collaboration/PhD with HER Lab on LLM museum guides",
      body: `Dear Prof. Li,

I’m Fangze Qiu; we co-authored “Interactive Visualization of Sport Climbing Data” (INTERACT 2023). I’m reaching out per your note to email for collaboration.

Your recent directions in XR for museums/education—especially “The Effects of LLM-Empowered Chatbots...” and “MagicMap”—align closely with my background:
1. LLM-powered Discord agents (RAG/LoRA, persona control).
2. Mixed-methods UX research with quantitative validation (e.g., D-IFSC), plus Unity/VR experience.

I’d like to propose a scoped pilot: an LLM museum guide integrated with a user study and data visualization analytics. Would you be open to a short call to discuss fit, available roles (PhD/RA/collab), and timelines?

I’ve attached my CV; portfolio: http://www.innoqiu.cn.

Thank you for your consideration.

Best regards,
Fangze Qiu
fangze.qiu@outlook.com`
    }
  ]
};