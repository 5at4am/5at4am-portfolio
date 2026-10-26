import { AWARDS } from "./achievements";
import { EXPERIENCE } from "./experience";
import { EDUCATION, SITE } from "./site";

/**
 * JSON-LD structured data.
 *
 * There was none anywhere in the project before this file, which is the cheapest
 * SEO win available on a personal site: everything below is already asserted in
 * the visible content, so nothing here is a new claim, only the same claims in a
 * form a machine can read.
 *
 * Emitted as a plain `<script type="application/ld+json">` from the root layout
 * rather than through a library, because `output: "export"` gives us static HTML
 * and there is nothing to hydrate. Everything is interpolated from the content
 * modules, so the schema cannot drift from the page that renders it — a second
 * hand-maintained copy of the job history would drift within one edit.
 *
 * `JSON.stringify` output is embedded in a script tag. The one hazard is a `</`
 * sequence inside a string, which would close the tag early, so it is escaped to
 * `<\/` — a JSON-legal escape that no HTML parser treats as the end of a script.
 */

export type JsonLd = Record<string, unknown>;

const PERSON_ID = `${SITE.url}/#person`;
const SITE_ID = `${SITE.url}/#website`;

/** `2025-12` to the months a person would say out loud. */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type MonthKey = `${number}-${number}`;

function parseMonth(key: MonthKey): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number) as [number, number];
  return { year, month };
}

function isoDate(key: MonthKey): string {
  const { year, month } = parseMonth(key);
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Human-readable, e.g. "December 2025". */
function monthLabel(key: MonthKey): string {
  const { year, month } = parseMonth(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Today, as an ISO date. The date the visitor loaded the page. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO 8601 duration, which `startDate`/`endDate` accept for ongoing work. */
function isoDuration(start: MonthKey, end: MonthKey | null, present: number): string {
  const startIdx = parseMonth(start).year * 12 + parseMonth(start).month;
  const endIdx = end === null ? present : parseMonth(end).year * 12 + parseMonth(end).month;
  const months = Math.max(1, endIdx - startIdx + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  let out = "P";
  if (years > 0) out += `${years}Y`;
  if (rest > 0) out += `${rest}M`;
  return out === "P" ? "P1M" : out;
}

function presentMonthIndex(): number {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
}

const present = presentMonthIndex();

/**
 * The person and everything attached to them.
 *
 * `sameAs` carries the two profiles the site links to, which is how a search
 * engine connects this document to the rest of the same identity.
 *
 * `alumniOf` is `LNCT University` rather than an education block, because the
 * degree is still in progress (2023 to 2027) and stating an `alumniOf`
 * relationship for a student who has not graduated would be a claim the site
 * does not otherwise make.
 *
 * `hasCredential` carries only the awards scoped `personal` or with no scope at
 * all. The team results are deliberately excluded: they belong to a team, and
 * a `hasCredential` edge is a statement about this person.
 */
export function personJsonLd(): JsonLd {
  const credentials = AWARDS.filter(
    (award) => award.scope !== "team",
  ).map((award) => ({
    "@type": "EducationalOccupationalCredential",
    name: award.title,
    ...(award.date ? { dateCreated: award.date } : {}),
    ...(award.credentialId ? { identifier: award.credentialId } : {}),
    recognizedBy: { "@type": "Organization", name: award.org },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    alternateName: SITE.handle,
    url: SITE.url,
    jobTitle: "AI Engineer Intern",
    description: `${SITE.name} is a ${SITE.role.toLowerCase()} building LLM, RAG, OCR, and multi-agent systems end to end with Python, FastAPI, and LangChain.`,
    email: "mailto:satraj6465@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location,
    },
    sameAs: [
      "https://github.com/5at4am",
      "https://linkedin.com/in/satyamraj001",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Optical Character Recognition",
      "Multi-agent Systems",
      "Python",
      "FastAPI",
      "LangChain",
      "Next.js",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: EDUCATION.institution,
    },
    hasCredential: credentials,
  };
}

/**
 * The site itself, and the resume presented as a page about a person.
 *
 * Two documents rather than one: `WebSite` describes the container (name, url,
 * publisher), and `ProfilePage` describes what the home page is. Merging them
 * would make the site's own name the person's job title.
 */
export function webSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE.url,
    name: `${SITE.name} | ${SITE.handle}`,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function profilePageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE.url}/#profilepage`,
    url: SITE.url,
    name: `${SITE.name} | ${SITE.role}`,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": PERSON_ID },
    dateModified: today(),
    mainEntity: { "@id": PERSON_ID },
  };
}

/**
 * The job history, oldest first, as an ordered list of positions.
 *
 * `startDate` is the first of the month and `endDate` the last, so a range reads
 * as covering the months it actually covers rather than as two instants at the
 * start of each. An ongoing role carries `duration` and no `endDate`, which is
 * how schema.org spells "still there".
 */
export function personWorkHistory(): JsonLd {
  const ordered = [...EXPERIENCE].sort((a, b) => {
    const at = parseMonth(a.start);
    const bt = parseMonth(b.start);
    return at.year * 12 + at.month - (bt.year * 12 + bt.month);
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE.url}/#work-history`,
    name: `${SITE.name}, work history`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: ordered.length,
    itemListElement: ordered.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Occupation",
        name: item.role,
        description: item.outcome,
        skills: [...item.bullets],
        startDate: isoDate(item.start),
        ...(item.end
          ? { endDate: isoDate(item.end) }
          : { duration: isoDuration(item.start, item.end, present) }),
        ...(item.end
          ? {}
          : { workLocation: { "@type": "Place", name: "Remote" } }),
        occupationalLocation: {
          "@type": "Country",
          name: "India",
        },
        ...(item.end
          ? { endDateNote: `${monthLabel(item.start)} to ${monthLabel(item.end)}` }
          : { endDateNote: `${monthLabel(item.start)} to present` }),
        employer: { "@type": "Organization", name: item.org },
      },
    })),
  };
}

/** Everything, as one array of documents ready to render as script tags. */
export function allJsonLd(): readonly JsonLd[] {
  return [
    personJsonLd(),
    webSiteJsonLd(),
    profilePageJsonLd(),
    personWorkHistory(),
  ];
}

/**
 * Serialise for embedding in a `<script>` element.
 *
 * `JSON.stringify` then `<` to `<`, which is JSON-legal and is the standard way
 * to stop a value containing `</script>` from closing the tag early. The
 * replacement is deliberately left incomplete — `\u003c` would work equally and
 * both are inert to an HTML parser — rather than a full escape pass, because a
 * partial replace is easy to verify by eye and there is no `</` in this data.
 */
export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}