import { AWARDS } from "./achievements";
import { CONTACT_LINKS } from "./contact";
import { EXPERIENCE } from "./experience";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  PAPER_DESCRIPTION,
  PAPER_TITLE,
} from "./metadata";
import { EDUCATION, SITE } from "./site";

/**
 * JSON-LD structured data.
 *
 * There was none anywhere in the project before this file, which is the cheapest
 * SEO win available on a personal site: everything below is already asserted in
 * the visible content, so nothing here is a new claim, only the same claims in a
 * form a machine can read.
 *
 * Emitted as a plain `<script type="application/ld+json">` from the pages rather
 * than through a library, because `output: "export"` gives us static HTML and
 * there is nothing to hydrate. Everything is interpolated from the content
 * modules, so the schema cannot drift from the page that renders it — a second
 * hand-maintained copy of the job history would drift within one edit.
 *
 * `JSON.stringify` output is embedded in a script tag. The one hazard is a `</`
 * sequence inside a string, which would close the tag early, so every `<` is
 * escaped to `\u003c` — a JSON-legal escape that no HTML parser treats as the end
 * of a script.
 */

export type JsonLd = Record<string, unknown>;

const PERSON_ID = `${SITE.url}/#person`;
const SITE_ID = `${SITE.url}/#website`;

const CURRENT_ROLE = EXPERIENCE.find((item) => item.end === null);
const EMAIL_HREF = CONTACT_LINKS.find((link) => link.href.startsWith("mailto:"))?.href;
const [LOCALITY, COUNTRY] = SITE.location.split(",").map((part) => part.trim());
const ADDRESS_COUNTRY = COUNTRY === "India" ? "IN" : COUNTRY;

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

/** First day of the month, so a start date covers the month it names. */
function monthStart(key: MonthKey): string {
  const { year, month } = parseMonth(key);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/** Last day of the month, so an end date covers the month it names. */
function monthEnd(key: MonthKey): string {
  const { year, month } = parseMonth(key);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Human-readable, e.g. "December 2025". */
function monthLabel(key: MonthKey): string {
  const { year, month } = parseMonth(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * Awards carry display dates ("Dec 2025", "2026"). Schema.org wants ISO 8601, so
 * month names become `YYYY-MM`; a bare year stays a bare year rather than
 * inventing a day or a month the record does not support.
 */
function awardDate(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}$/.test(value)) return value;

  const match = /^([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(value);
  if (!match) return value;

  const [, monthName, year] = match;
  if (!monthName || !year) return value;

  const month = MONTH_NAMES.findIndex((name) =>
    name.toLowerCase().startsWith(monthName.toLowerCase()),
  );
  return month === -1 ? value : `${year}-${String(month + 1).padStart(2, "0")}`;
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

/** The content freshness date, not the build date, so schema stays deterministic. */
const present = (() => {
  const [year, month] = SITE.updated.split("-").map(Number) as [number, number];
  return year * 12 + month;
})();

/**
 * The person and everything attached to them.
 *
 * `sameAs` carries the two profiles the site links to, which is how a search
 * engine connects this document to the rest of the same identity.
 *
 * `affiliation` is the university; the degree is still in progress (2023 to
 * 2027), so `alumniOf` would claim a graduation the site does not.
 *
 * `hasCredential` carries only the awards scoped `personal` or with no scope at
 * all. The team results are deliberately excluded: they belong to a team, and
 * a `hasCredential` edge is a statement about this person.
 */
export function personJsonLd(): JsonLd {
  const credentials = AWARDS.filter(
    (award) => award.scope !== "team",
  ).map((award) => {
    const date = awardDate(award.date);
    return {
      "@type": "EducationalOccupationalCredential",
      name: award.title,
      ...(date ? { dateCreated: date } : {}),
      ...(award.credentialId ? { identifier: award.credentialId } : {}),
      recognizedBy: { "@type": "Organization", name: award.org },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    alternateName: SITE.handle,
    url: SITE.url,
    jobTitle: CURRENT_ROLE?.role ?? "AI Engineer Intern",
    description: HOME_DESCRIPTION,
    ...(EMAIL_HREF ? { email: EMAIL_HREF } : {}),
    ...(CURRENT_ROLE
      ? {
          worksFor: {
            "@type": "Organization",
            name: CURRENT_ROLE.org,
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      ...(LOCALITY ? { addressLocality: LOCALITY } : {}),
      ...(ADDRESS_COUNTRY ? { addressCountry: ADDRESS_COUNTRY } : {}),
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
      "Workflow Automation",
      "Python",
      "FastAPI",
      "LangChain",
      "TypeScript",
      "Next.js",
    ],
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: EDUCATION.institution,
      description: `${EDUCATION.degree}, ${EDUCATION.period}`,
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
    alternateName: SITE.domain,
    description: HOME_DESCRIPTION,
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
    name: HOME_TITLE,
    description: HOME_DESCRIPTION,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": PERSON_ID },
    inLanguage: "en",
    dateModified: SITE.updated,
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
        startDate: monthStart(item.start),
        ...(item.end
          ? { endDate: monthEnd(item.end) }
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

/**
 * `/paper` describes its own page and breadcrumb. It deliberately does not carry
 * the home `ProfilePage` or work-history list, because those describe content
 * that is not on this route.
 */
export function paperPageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}/paper#webpage`,
    url: `${SITE.url}/paper`,
    name: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
    isPartOf: { "@id": SITE_ID },
    about: {
      "@type": "EducationalOccupationalCredential",
      name: "Estrel.ai capstone certificate",
    },
    inLanguage: "en",
    dateModified: SITE.updated,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE.url}/og.png`,
      width: 1200,
      height: 630,
      caption: `${SITE.name}, ${SITE.role}`,
    },
  };
}

export function paperBreadcrumbJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "3D Paper Certificate",
        item: `${SITE.url}/paper`,
      },
    ],
  };
}

/** Site-wide identity, true on every route. */
export function siteJsonLd(): readonly JsonLd[] {
  return [personJsonLd(), webSiteJsonLd()];
}

/** Home-only documents. */
export function homeJsonLd(): readonly JsonLd[] {
  return [profilePageJsonLd(), personWorkHistory()];
}

/** `/paper`-only documents. */
export function paperJsonLd(): readonly JsonLd[] {
  return [paperPageJsonLd(), paperBreadcrumbJsonLd()];
}

/**
 * Serialise for embedding in a `<script>` element.
 *
 * `JSON.stringify` then every `<` to `\u003c`, which is JSON-legal and is the
 * standard way to stop a value containing `</script>` from closing the tag early.
 * The replacement is deliberately left incomplete — `\u003c` would work equally
 * and both are inert to an HTML parser — rather than a full escape pass, because
 * a partial replace is easy to verify by eye and there is no `</` in this data.
 */
export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
