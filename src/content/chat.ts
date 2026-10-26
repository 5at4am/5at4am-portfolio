import { AWARDS } from "./achievements";
import { CONTACT_LINKS } from "./contact";
import { EXPERIENCE } from "./experience";
import { NAV_SECTIONS } from "./navigation";
import { PAPER_CREDIT } from "./paper";
import { PROJECTS } from "./projects";
import { ABOUT, AVAILABILITY, EDUCATION, HERO, PRELOADER_WORDS, SITE } from "./site";
import { TECH_STACK_GROUPS } from "./tech-stack";

/**
 * The knowledge base behind the "ask Satyam anything" popup, as data plus pure
 * functions. There is no backend, no API key and no model behind this file: the
 * site is a static export, so every answer here is assembled by string-matching
 * the copy the rest of `src/content` already publishes.
 *
 * ── WHY A RETRIEVER AND NOT AN ASSISTANT ───────────────────────────────
 * The one thing this component must never do is imply that a language model is
 * answering. A chat bubble that says "let me think" and then quotes something
 * the site never claimed is worse than no chat at all, because the visitor
 * cannot tell the difference. So the contract is:
 *
 *   - every answer is a verbatim restatement of content that is already
 *     published on the page, and
 *   - anything the content does not support returns an honest refusal that
 *     names what the thing CAN answer and links to the real sections.
 *
 * Everything below is deterministic: the same question always produces the same
 * answer, and no answer can contain a fact that is not in the source modules.
 */

/** One answer: a paragraph, plus optional links to where it came from. */
export type ChatAnswer = {
  text: string;
  links?: { label: string; href: string }[];
};

/**
 * Questions offered as chips before anything has been typed. Every one of them
 * is answerable from the content modules, which is the point: a suggestion the
 * retriever cannot answer would teach the visitor to distrust the whole panel.
 */
export const CHAT_SUGGESTIONS: readonly { label: string; query: string }[] = [
  { label: "Your best project?", query: "What is your best project?" },
  { label: "Your tech stack", query: "What is your tech stack?" },
  { label: "Internships", query: "Tell me about your internship" },
  { label: "Hiring you?", query: "Are you looking for a job?" },
  { label: "What you can build", query: "What can you build?" },
  { label: "Achievements", query: "What are your achievements?" },
  { label: "How to reach you", query: "How can I contact you?" },
  { label: "Your projects", query: "What projects do you have?" },
];

/* ─────────────────────────────── the corpus ─────────────────────────────── */

type CorpusEntry = {
  /** Stable id. Intent rules address entries by this, never by array index. */
  id: string;
  /**
   * Matched at double weight. The title is the part a reader would use to
   * *name* the thing ("CoalSutra", "tech stack"), so a hit here is a much
   * stronger signal than the same word appearing in a body paragraph.
   */
  title: string;
  /**
   * Extra surface forms that only ever help retrieval. Never rendered, so
   * nothing here can put a claim on the page that the content does not make.
   */
  keywords?: string;
  text: string;
  links?: ChatAnswer["links"];
  /**
   * Multiplier on this entry's TOKEN score only, never on intent bonuses.
   *
   * It exists for one collision. The projects index has to name all eight
   * projects to be worth reading, so it necessarily contains every project's
   * name: "tell me about the CoalSutra project" put five shared tokens in the
   * index and three in the CoalSutra entry, and a list of everything is a bad
   * answer to a question about one thing. A named project is the most specific
   * answer this corpus can give, so it gets to say so.
   *
   * Default 1, which is right for the section-level entries: they are the
   * broadest statements in the corpus and should not need a handicap.
   */
  specificity?: number;
};

/**
 * Internal section link, resolved through `NAV_SECTIONS` so a renamed section
 * cannot silently produce a dead anchor here.
 */
function sectionLink(id: string, label?: string): { label: string; href: string } {
  return {
    label: label ?? NAV_SECTIONS.find((section) => section.id === id)?.label ?? id,
    href: `/#${id}`,
  };
}

/** The three real channels, lifted from the one definition of them. */
const CHANNEL_LINKS: ChatAnswer["links"] = CONTACT_LINKS.map((link) => ({
  label: link.short ?? link.label,
  href: link.href,
}));

const ABOUT_TEXT = [ABOUT.lead, ...ABOUT.focus.map((paragraph) => paragraph.text)].join(" ");

const EXPERIENCE_TEXT = EXPERIENCE.map((role) =>
  [
    `${role.role} at ${role.org} (${role.meta}).`,
    `Outcome: ${role.outcome}.`,
    role.bullets.join(" "),
  ].join(" "),
).join(" ");

const SKILLS_TEXT = [
  "Tech stack and skills, grouped by relevance to AI engineering:",
  ...TECH_STACK_GROUPS.map(
    (group) => `${group.label}: ${group.items.map((item) => item.name).join(", ")}.`,
  ),
  `Primary working stack: ${ABOUT.stack.join(", ")}.`,
].join(" ");

const AWARDS_TEXT = AWARDS.map((award) =>
  [
    award.scope === "team" ? "Team award" : "Award",
    `${award.title}${award.date ? `, ${award.date}` : ""}, ${award.org}.`,
  ].join(" "),
).join(" ");

const EDUCATION_TEXT = [
  `${EDUCATION.degree} at ${EDUCATION.institution}, ${EDUCATION.period}.`,
  `${EDUCATION.score}.`,
  "Final year undergraduate, specialising in AI and ML.",
].join(" ");

const LANGUAGES_TEXT = [
  `The full-screen intro greets you in ${PRELOADER_WORDS.length} languages:`,
  `${PRELOADER_WORDS.join(", ")}.`,
  "Each greeting is shown in its own script, with the language change as the point of the animation.",
].join(" ");

const LOCATION_TEXT = [
  `${SITE.name} is based in ${SITE.location}.`,
  `Published at ${SITE.domain}, under the handle ${SITE.handle}.`,
].join(" ");

const PAPER_TEXT = [
  `${PAPER_CREDIT.text} ${PAPER_CREDIT.label}`,
  "It is a standalone page rather than a section, and it is a browser-side 3D document, not an image of one.",
].join(" ");

const PROJECTS_INDEX_TEXT = [
  `${PROJECTS.length} projects, ordered by engineering substance rather than by stars:`,
  ...PROJECTS.map(
    (project, index) => `${index + 1}. ${project.name}: ${project.tagline}.`,
  ),
].join(" ");

const PROJECT_ENTRIES: CorpusEntry[] = PROJECTS.map((project, index) => ({
  id: `project:${index}`,
  title: project.name,
  keywords: project.stack.join(" "),
  specificity: 2,
  text: [
    `${project.name}: ${project.tagline}.`,
    project.bullets.join(" "),
    `Stack: ${project.stack.join(", ")}.`,
  ].join(" "),
  links: [...project.links, sectionLink("projects", "All projects")],
}));

/**
 * The order below is the tie-breaker, not a preference list. `answerQuestion`
 * keeps the FIRST entry to reach a score, so position encodes how specific an
 * entry is, and a narrow answer has to be able to out-rank a broad one.
 *
 * That is why the projects index sits at the very end: "tell me about the
 * CoalSutra project" puts one shared token in the index and three in the
 * CoalSutra entry, and an index that won that tie would answer a question about
 * one project with a list of all eight. Being last costs the index nothing,
 * because "what projects do you have" reaches it on its own intent bonus with
 * every project entry at zero.
 */
const CORPUS: readonly CorpusEntry[] = [
  {
    id: "availability",
    title: "Role, availability and hiring",
    keywords: "career hiring recruiter graduate fresher fulltime open to work 2027",
    text: [
      `${SITE.name} is ${SITE.role}.`,
      HERO.tagline,
      HERO.subline,
      AVAILABILITY.statement,
      `Based in ${SITE.location}.`,
    ].join(" "),
    links: [sectionLink("contact", "Contact"), sectionLink("about", "About")],
  },
  {
    id: "about",
    title: "About Satyam",
    keywords: "name who identity introduction bio background yourself",
    text: `${ABOUT_TEXT} ${HERO.tagline}`,
    links: [sectionLink("about")],
  },
  {
    id: "experience",
    title: "Internships and work experience",
    keywords: "company companies role positions dates results outcomes",
    text: EXPERIENCE_TEXT,
    links: [sectionLink("experience")],
  },
  {
    id: "education",
    title: "Education and degree",
    keywords: "university college cgpa grade coursework study",
    text: EDUCATION_TEXT,
    links: [sectionLink("about", "About and education")],
  },
  {
    id: "skills",
    title: "Tech stack and skills",
    keywords: "technologies tools frameworks libraries programming proficiency",
    text: SKILLS_TEXT,
    links: [sectionLink("skills")],
  },
  {
    id: "achievements",
    title: "Awards, hackathons and certifications",
    keywords: "achievement prize recognition credential result",
    text: AWARDS_TEXT,
    links: [sectionLink("achievements")],
  },
  {
    id: "contact",
    title: "Contact, email and socials",
    keywords: "reach message dm get in touch talk",
    text: [
      "Satyam can be reached on three channels:",
      CONTACT_LINKS.map((link) => `${link.short ?? link.label} at ${link.label}`).join(", "),
      `. ${AVAILABILITY.statementWithChannel}`,
    ].join(" "),
    links: [...(CHANNEL_LINKS ?? []), sectionLink("contact", "Contact section")],
  },
  {
    id: "languages",
    title: "Languages",
    keywords: "multilingual bilingual native",
    text: LANGUAGES_TEXT,
    links: [sectionLink("about")],
  },
  {
    id: "location",
    title: "Location",
    keywords: "based city country address",
    text: LOCATION_TEXT,
    links: [{ label: SITE.domain, href: SITE.url }],
  },
  {
    id: "paper",
    title: "3D paper page",
    keywords: "shader threejs webgl experiment",
    text: PAPER_TEXT,
    links: [
      { label: "Open /paper", href: "/paper" },
      { label: "ThreeUI source", href: PAPER_CREDIT.href },
    ],
  },
  {
    /* After the career entries, deliberately, and with a title that avoids the
       word "build". "What did you build at Estrel.ai?" scores identically on
       this entry and on the experience one; a title hit on "build" would hand
       it the tie-break, and the internship is the more specific answer to a
       question that names the company. */
    id: "capabilities",
    title: "Capabilities and scope",
    keywords: "capability skill shipping production end to end",
    text: [
      "Satyam builds AI systems end to end: FastAPI services, LangChain and LangGraph pipelines,",
      "retrieval augmented generation over real documents, and the frontend to put them in front of people.",
      ABOUT_TEXT,
    ].join(" "),
    links: [sectionLink("projects"), sectionLink("skills")],
  },
  ...PROJECT_ENTRIES,
  {
    id: "projects",
    title: "All projects",
    keywords: "portfolio repositories repos codebase shipped list everything",
    text: PROJECTS_INDEX_TEXT,
    links: [
      sectionLink("projects"),
      ...(CHANNEL_LINKS ?? []).filter((link) => link.label === "GitHub"),
    ],
  },
];

/* ──────────────────────────────── the intents ───────────────────────────── */

type Intent = {
  /** Entry the bonus lands on. */
  target: string;
  /**
   * Added once, however many of the intent's words the query contains, so a
   * question stuffed with synonyms cannot out-shout the token score. Chosen to
   * sit above a plausible token score so an intent can win a tie, which is what
   * makes "internship" (two owners) decidable.
   */
  weight: number;
  /**
   * Matched against the RAW tokens, before stemming. That is the whole reason
   * raw tokens are kept around: "projects" is the plural and means "show me the
   * list", "project" is the singular and means "one of them", and the stemmer
   * would have folded them into the same word.
   */
  words: readonly string[];
};

const INTENTS: readonly Intent[] = [
  {
    target: "availability",
    weight: 3,
    words: [
      "job", "jobs", "hire", "hiring", "available", "availability", "looking",
      "open", "opportunity", "opportunities", "recruiter", "recruiting",
      "employer", "fulltime", "cv", "resume", "graduating",
    ],
  },
  /* Split across the two owners of "internship" so a recruiter asking "are you
     hiring" and a visitor asking "tell me about your internship" both land
     right. The recruiter's version carries a second, stronger intent word
     ("hire", "job", "looking") and the visitor's does not, so the shared noun
     does not have to decide it on its own. */
  { target: "availability", weight: 2, words: ["internship", "internships"] },
  {
    target: "experience",
    weight: 3,
    words: [
      "experience", "intern", "interns", "interning", "internship", "internships",
      /* NOT "work" or "worked". "Are you looking for work?" is a hiring
         question, and "work" is the word that gives it away. "What work have
         you done?" still reaches this entry on its title alone. */
      "role", "roles", "company", "companies", "estrel", "estrella",
    ],
  },
  {
    target: "contact",
    weight: 3,
    words: [
      "contact", "email", "mail", "reach", "linkedin", "github", "message",
      "dm", "connect", "call",
    ],
  },
  {
    target: "skills",
    weight: 2,
    words: [
      "stack", "tech", "technology", "technologies", "skill", "skills",
      "framework", "frameworks", "language", "languages", "programming",
      "library", "libraries", "tool", "tools",
    ],
  },
  {
    target: "languages",
    weight: 3,
    words: [
      "speak", "speaks", "spoke", "spoken", "fluent", "fluency", "tongue",
      "multilingual", "bilingual",
    ],
  },
  {
    target: "achievements",
    weight: 2,
    words: [
      "achievement", "achievements", "award", "awards", "certification",
      "certifications", "certificate", "certificates", "hackathon", "prize",
      "recognition", "credential", "credentials",
    ],
  },
  {
    target: "education",
    weight: 2,
    words: [
      "education", "degree", "university", "college", "school", "cgpa",
      "grade", "btech", "b.tech", "study", "studied", "studies", "course",
    ],
  },
  {
    target: "project:0",
    weight: 3,
    words: [
      "best", "favorite", "favourite", "top", "flagship", "strongest", "proud",
      "headline", "main", "star",
    ],
  },
  { target: "projects", weight: 2, words: ["projects", "repos", "repositories", "codebase"] },
  {
    target: "capabilities",
    weight: 2,
    words: ["build", "builds", "built", "make", "made", "create", "capable", "capability"],
  },
  { target: "about", weight: 2, words: ["name", "who", "identity", "introduce", "introduction"] },
  {
    target: "location",
    weight: 2,
    words: ["based", "location", "live", "lives", "city", "india", "bhopal", "situated"],
  },
  { target: "paper", weight: 2, words: ["paper", "3d", "three", "shader", "shaders", "webgl"] },
];

/* ────────────────────────────── the fallback ────────────────────────────── */

const FALLBACK: ChatAnswer = {
  text: [
    "That one is not in the portfolio content, so there is no honest answer to give.",
    "This reads the text already published on this site and can answer questions about",
    "the role and availability, the internships, the projects, the tech stack, the",
    "education, the awards, the languages in the intro, and how to get in touch.",
    "Try one of the suggestions, or read the section yourself.",
  ].join(" "),
  links: [
    sectionLink("about"),
    sectionLink("projects"),
    sectionLink("skills"),
    sectionLink("contact"),
  ],
};

/* ──────────────────────────────── the matcher ───────────────────────────── */

/**
 * Words that carry no retrieval signal. The list is deliberately short: every
 * entry here is a word a real question is made of, and a long stopword list
 * starts eating content terms. "language" is in the intent rules instead of
 * here, because which meaning wins depends on the rest of the question.
 */
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "am", "be", "been", "being",
  "do", "does", "did", "done", "can", "could", "will", "would", "should",
  "shall", "may", "might", "must", "you", "your", "yours", "me", "my", "mine",
  "i", "we", "our", "of", "in", "on", "at", "to", "for", "from", "with",
  "and", "or", "but", "so", "if", "then", "than", "as", "by", "that", "this",
  "these", "those", "it", "its", "what", "which", "who", "whom", "whose",
  "how", "when", "where", "why", "tell", "about", "please", "have", "has",
  "had", "there", "here", "any", "some", "much", "many", "get", "got", "just",
  "also", "very", "really", "like", "want", "need", "know", "tell",
  /*
   * Words that describe the page rather than its subject. "site", "page",
   * "portfolio" and "website" appear throughout the copy, so scoring them made
   * "how do I hack your site" a match on the languages entry (whose text said
   * "the intro on this site") and turned a nonsense question into a confident
   * wrong answer. They are exactly the kind of high-frequency, zero-signal word a
   * stopword list exists for.
   */
  "site", "sites", "page", "pages", "website", "websites", "portfolio",
]);

/**
 * Stemming-lite: enough suffix stripping that "projects" and "project" collide.
 *
 * Deliberately not Porter or Snowball. Those exist to trade precision for
 * recall across corpora orders of magnitude larger than this one, and the
 * failure mode of over-stemming (a real content word mangled into a non-word)
 * is expensive here, because the whole index is eight projects and every one of
 * them is a real project someone might ask about by name. Five mechanical rules
 * plus a short list of the irregulars this content actually uses gets the same
 * practical recall in a twentieth of the code, and every rule can be read at a
 * glance.
 */
const IRREGULAR_STEMS: Record<string, string> = {
  /* Past tenses whose stem the suffix rules get wrong. "built" strips to
     "buil", which matches nothing, and the corpus is full of "built". */
  built: "build",
  made: "make",
  won: "win",
  wrote: "write",
  shipped: "ship",
  deployed: "deploy",
  learned: "learn",
  based: "base",
  /* The two forms of the noun, so a question about the internship lands on the
     experience entry rather than the availability one. */
  internship: "intern",
  internships: "intern",
};

function stem(raw: string): string {
  const lower = raw.toLowerCase();
  const irregular = IRREGULAR_STEMS[lower];
  if (irregular) return irregular;
  /* Short tokens are left alone. "gas" -> "ga" and "bus" -> "bu" are not roots. */
  if (lower.length <= 3) return lower;

  const candidates: string[] = [];
  if (lower.endsWith("ies")) candidates.push(`${lower.slice(0, -3)}y`);
  if (lower.endsWith("ing")) candidates.push(lower.slice(0, -3));
  if (lower.endsWith("ed")) candidates.push(lower.slice(0, -2));
  if (lower.endsWith("es")) candidates.push(lower.slice(0, -2));
  if (lower.endsWith("s")) candidates.push(lower.slice(0, -1));

  /* A root shorter than three letters is nearly always a mangling rather than
     a root ("uses" -> "us"), so the unstripped token wins. */
  return candidates.find((candidate) => candidate.length >= 3) ?? lower;
}

/**
 * Split on anything that is not a letter, digit or the two characters that
 * appear inside technology names. Splitting on dots and slashes as well as
 * spaces matters more than it looks: it is the difference between the corpus
 * holding "linkedin.com" and the query "linkedin" ever meeting, and the
 * difference between "8.34" surviving as one token or becoming "8" and "34".
 */
function rawTokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9+#]+/g) ?? [];
}

function significantStems(tokens: Iterable<string>): Set<string> {
  const stems = new Set<string>();
  for (const token of tokens) {
    if (STOPWORDS.has(token)) continue;
    stems.add(stem(token));
  }
  return stems;
}

const TITLE_WEIGHT = 2;
const BODY_WEIGHT = 1;

/**
 * Below this, the honest answer is the fallback.
 *
 * A plain "does the token appear" score cannot set this threshold, because the
 * two kinds of match are worth wildly different amounts and a fixed cutoff either
 * admits accidental matches or rejects good ones. "what did you do at wiiz"
 * reduces to exactly one significant token, and as a flat body hit that scored 1
 * against a threshold of 2, so a question naming a real internship was refused
 * while a vague one was answered.
 *
 * So tokens are weighted by how rare they are across the corpus (see
 * `buildIdf`). "Wiiz" appears in one entry and carries a large weight; "project"
 * appears in ten and carries almost none. The threshold is then a statement about
 * evidential weight rather than a count, and a single distinctive match clears it
 * while a single common one does not.
 */
const MIN_SCORE = 1.15;

/**
 * Inverse document frequency over the prepared corpus.
 *
 * `log(N / df)`, floored so a term present in every entry contributes a little
 * rather than exactly nothing: "langchain" appearing in several project entries is
 * weak evidence on its own, but it is not zero evidence, and dropping it entirely
 * makes a legitimate multi-word query score lower than a garbage one.
 */
function buildIdf(prepared: typeof PREPARED): Map<string, number> {
  const total = prepared.length;
  const frequency = new Map<string, number>();
  for (const entry of prepared) {
    // Counted over title AND body, because rarity is a property of the token, not
    // of which field it was found in.
    const seen = new Set([...entry.titleStems, ...entry.bodyStems]);
    for (const stem of seen) {
      frequency.set(stem, (frequency.get(stem) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [stem, df] of frequency) {
    idf.set(stem, Math.max(0.2, Math.log(total / df)));
  }
  return idf;
}

const PREPARED: readonly {
  entry: CorpusEntry;
  titleStems: Set<string>;
  bodyStems: Set<string>;
}[] = CORPUS.map((entry) => ({
  entry,
  titleStems: significantStems(rawTokens(entry.title)),
  bodyStems: significantStems(
    rawTokens(`${entry.title} ${entry.keywords ?? ""} ${entry.text}`),
  ),
}));

const IDF = buildIdf(PREPARED);

function scoreEntry(
  prepared: (typeof PREPARED)[number],
  queryStems: ReadonlySet<string>,
): { score: number; titleHits: number } {
  let score = 0;
  let titleHits = 0;
  for (const queryStem of queryStems) {
    // The title is what a reader would use to NAME the thing, so a hit there is
    // still worth more than the same word buried in a paragraph, but not so much
    // more that a common word in a title outranks a rare one in the body.
    const weight = IDF.get(queryStem) ?? 1;
    if (prepared.titleStems.has(queryStem)) {
      score += weight * TITLE_WEIGHT;
      titleHits += 1;
    } else if (prepared.bodyStems.has(queryStem)) {
      score += weight * BODY_WEIGHT;
    }
  }
  return { score, titleHits };
}

/**
 * The whole "assistant". Deterministic, local, and incapable of saying anything
 * the content modules do not already publish.
 *
 * Order of operations:
 *
 *  1. Normalise (lower-case, split, strip stopwords) the query into a set of
 *     stemmed significant tokens. Case, punctuation and word order stop
 *     mattering; nothing else does.
 *  2. Score every corpus entry by distinct significant tokens it shares with
 *     the query, weighting a title hit at 2x a body hit, and scaling each token by
 *     how rare it is across the corpus (see `buildIdf`).
 *  3. Add intent bonuses. These exist because the common questions are the ones
 *     with the *least* lexical overlap: "are you hiring" shares the word "you"
 *     with nothing, and "how do I reach you" never says the word "contact".
 *     Two intents may claim the same word (see "internship"), so the bonuses
 *     accumulate onto their own targets and the token score breaks the tie.
 *  4. Return the top entry if it clears `MIN_SCORE`, otherwise the fallback.
 */
export function answerQuestion(question: string): ChatAnswer {
  const raw = rawTokens(question);
  const queryStems = significantStems(raw);

  const scores = new Map<string, number>();
  const titleHitsById = new Map<string, number>();
  for (const prepared of PREPARED) {
    const { score, titleHits } = scoreEntry(prepared, queryStems);
    scores.set(prepared.entry.id, score * (prepared.entry.specificity ?? 1));
    titleHitsById.set(prepared.entry.id, titleHits);
  }
  /*
   * Intent bonuses are compared against an IDF-weighted token score, so they are
   * expressed on the same scale rather than as bare integers.
   *
   * This matters more than it looks. The bonuses were originally flat 2s and 3s,
   * tuned against a token score where every hit was worth exactly 1 or 2. Once
   * tokens were scaled by rarity, a query for a very common word scored LESS than
   * those fixed numbers, and an intent bonus overrode it: "What is your best
   * project?" carries a weight-3 intent for "best", which pointed at the top
   * project, but the word "project" was too common to add anything, so the
   * experience entry won on an unrelated body hit instead.
   *
   * `INTENT_SCALE` is the typical size of a one-token IDF-weighted match, so the
   * bonuses keep their original meaning ("worth about two matches") while living
   * in the same units as the score they compete with.
   */
  const INTENT_SCALE = 2;
  for (const intent of INTENTS) {
    const matched = intent.words.some((word) => raw.includes(word));
    if (!matched) continue;
    scores.set(
      intent.target,
      (scores.get(intent.target) ?? 0) + intent.weight * INTENT_SCALE,
    );
  }

  let best: CorpusEntry | null = null;
  let bestScore = 0;
  let bestTitleHits = 0;
  for (const prepared of PREPARED) {
    const score = scores.get(prepared.entry.id) ?? 0;
    const titleHits = titleHitsById.get(prepared.entry.id) ?? 0;
    /* Two criteria, in order: total score, then how much of it came from
       titles, then position in `CORPUS`.

       The middle one is not decoration. A bare "project" puts the same single
       token in the projects index's TITLE and in the body of whichever project
       happens to say the word "projects" in a bullet, both scoring 2, and
       without it the answer is whichever of those happened to be authored
       first. Preferring the title hit picks the entry that is actually about
       projects. Position only breaks what is still a genuine tie, and
       `CORPUS` is ordered so that is somewhere sensible. */
    const better =
      score > bestScore || (score === bestScore && titleHits > bestTitleHits);
    if (better) {
      best = prepared.entry;
      bestScore = score;
      bestTitleHits = titleHits;
    }
  }

  if (!best || bestScore < MIN_SCORE) return FALLBACK;
  return best.links ? { text: best.text, links: best.links } : { text: best.text };
}
