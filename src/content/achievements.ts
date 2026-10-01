import type { Award } from "./types";

/**
 * Awards, hackathon results, and certifications, strongest first. Rendered by
 * both the home resume and the GitHub-style profile page.
 *
 * Two rules govern what is allowed in this file.
 *
 * **Rank comes from selectivity, then relevance.** A national hackathon placing
 * you against thousands of teams outranks any course certificate, because it is
 * a competitive result that a third party can verify. Within the certificates,
 * a specialisation beats a foundation course, and a vendor credential beats an
 * unbranded one.
 *
 * **Team results are worded as team results.** Where a public post or index
 * page only establishes that a team won, that is what the page says. Two
 * recognitions from the WiiZ challenge, the Highest Workflow Creation award and
 * the Most Active Participation award, are left out entirely: the available
 * evidence is the team leader's own post about his awards, so attributing them
 * to you would be a claim the record does not support. Add them with `scope:
 * "personal"` once your own certificate names you. The same rule excludes the
 * Capgemini Top 10 Side Quest prize, which was the leader's individual result.
 *
 * A handful of credentials previously listed here (an Oracle Cloud AI
 * Foundations associate credential, a CII/NCVET applied ML foundation course,
 * a gold Cloud Computing Engineering certificate, Google Cloud GenAI through
 * EduSkills, and a Salesforce Developer virtual internship) are absent because
 * they did not appear in the public profile audit. They are believed to be
 * real and belong here once their issuer and date are confirmed.
 */
export const AWARDS: readonly Award[] = [
  {
    title: "Top 100 Finalist, Agentic AI Buildathon 2026",
    org: "Team Pentos, Capgemini Exceller",
    date: "2026",
    scope: "team",
  },
  {
    title: "Best Capstone Project, Enterprise Contract Intelligence and Risk Analyzer",
    org: "WiiZ x ESTREL.AI Agentic AI Program",
    scope: "team",
  },
  {
    title: "Certificate Program in Artificial Intelligence and Machine Learning, Gold (70% and above)",
    org: "Aligned to IT-ITeS Sector Skills Council, NASSCOM competency standards",
    scope: "personal",
  },
  {
    title: "Machine Learning and Pattern Recognition, Deep Learning with Python, TensorFlow and Keras, and Neural Networks and Deep Learning",
    org: "Samatrix Consulting Private Limited",
    date: "Dec 2025",
    scope: "personal",
  },
  {
    title: "R Programming, Data Analysis using Python, and Probability Modelling using Python",
    org: "Samatrix Consulting Private Limited",
    date: "Apr 2025",
    scope: "personal",
  },
  {
    title: "Introduction to Modern AI",
    org: "Cisco",
    date: "Jan 2025",
    scope: "personal",
  },
  {
    title: "Free Java Certification Course",
    org: "DataFlair",
    date: "Nov 2024",
    scope: "personal",
    credentialId: "187305",
  },
  {
    title: "Certificate of Participation, Agentic AI Program",
    org: "WiiZ x ESTREL.AI",
    scope: "team",
  },
];
