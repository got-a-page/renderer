/** Page templates: person and product for launch, plus the unclaimed-name page. */

import { esc, safeUrl, FOOTER } from "./html.js";

export interface IndexEntry {
  type: string;
  title: string;
  tagline: string | null;
  avatar: string | null;
  theme: string;
  links: Array<{ label: string; url: string }>;
  sections: Array<{ heading: string; text?: string }>;
  product: {
    launchDate?: string;
    cta?: { label: string; url: string };
    features?: string[];
    screenshots?: string[];
  } | null;
  owner: string;
}

function linkList(links: IndexEntry["links"]): string {
  const items = links
    .map((l) => {
      const url = safeUrl(l.url);
      return url ? `<li><a href="${esc(url)}" rel="me noopener">${esc(l.label)}</a></li>` : "";
    })
    .filter(Boolean)
    .join("");
  return items ? `<ul class="links">${items}</ul>` : "";
}

function sections(list: IndexEntry["sections"]): string {
  return list
    .map((s) => `<section><h2>${esc(s.heading)}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ""}</section>`)
    .join("");
}

export function personPage(entry: IndexEntry, themeCss: string, url: string): string {
  const avatar = safeUrl(entry.avatar);
  const body = `
<article class="card">
  ${avatar ? `<img class="avatar" src="${esc(avatar)}" alt="Portrait of ${esc(entry.title)}" width="96" height="96">` : ""}
  <h1>${esc(entry.title)}</h1>
  ${entry.tagline ? `<p class="tagline">${esc(entry.tagline)}</p>` : ""}
  ${linkList(entry.links)}
  ${sections(entry.sections)}
</article>
${FOOTER}`;
  return bodyTemplate({
    title: entry.title,
    description: entry.tagline ?? `${entry.title} on got-a.page`,
    url,
    image: avatar,
    themeCss,
    body,
  });
}

export function productPage(entry: IndexEntry, themeCss: string, url: string): string {
  const p = entry.product ?? {};
  const ctaUrl = p.cta ? safeUrl(p.cta.url) : null;
  const shots = (p.screenshots ?? [])
    .map(safeUrl)
    .filter((s): s is string => s !== null)
    .slice(0, 4);
  const body = `
<article class="card">
  <h1>${esc(entry.title)}</h1>
  ${entry.tagline ? `<p class="tagline">${esc(entry.tagline)}</p>` : ""}
  ${p.launchDate ? `<p class="meta">Launched ${esc(p.launchDate)}</p>` : ""}
  ${ctaUrl && p.cta ? `<a class="cta" href="${esc(ctaUrl)}" rel="noopener">${esc(p.cta.label)}</a>` : ""}
  ${
    (p.features ?? []).length
      ? `<ul class="features">${(p.features ?? []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
      : ""
  }
  ${sections(entry.sections)}
  ${shots.map((s, i) => `<img src="${esc(s)}" alt="${esc(entry.title)} screenshot ${i + 1}" loading="lazy">`).join("")}
  ${linkList(entry.links)}
</article>
${FOOTER}`;
  return bodyTemplate({
    title: entry.title,
    description: entry.tagline ?? `${entry.title} - launched on got-a.page`,
    url,
    image: shots[0] ?? safeUrl(entry.avatar),
    themeCss,
    body,
  });
}

/** The growth loop: every unclaimed name invites its future owner. */
export function unclaimedPage(name: string, themeCss: string, url: string): string {
  const body = `
<article class="card" style="text-align:center">
  <h1>${esc(name)}.got-a.page is unclaimed</h1>
  <p class="tagline">This little corner of the web is waiting for its person.<br>
  Maybe that's you?</p>
  <a class="cta" href="https://got-a.page/claim">Claim it free - about a minute</a>
  <p class="meta">Just claimed this name? It goes live within a few minutes of the PR merging - check back shortly.</p>
  <p class="meta">No hosting needed. No cost. Just a name and a small JSON file.</p>
</article>
${FOOTER}`;
  return bodyTemplate({
    title: `${name}.got-a.page is unclaimed`,
    description: `Claim ${name}.got-a.page free - a page for your profile, product, project or community.`,
    url,
    image: null,
    themeCss,
    body,
  });
}

export function errorPage(themeCss: string): string {
  const body = `
<article class="card" style="text-align:center">
  <h1>Well, this is awkward</h1>
  <p class="tagline">Something went wrong on our side. Try again in a moment.</p>
  <a class="cta" href="https://got-a.page">Back to got-a.page</a>
</article>
${FOOTER}`;
  return bodyTemplate({
    title: "Something went wrong - got-a.page",
    description: "A temporary hiccup on got-a.page.",
    url: "https://got-a.page",
    image: null,
    themeCss,
    body,
  });
}

// Local import indirection so templates don't repeat the layout call.
import { layout, type LayoutOptions } from "./html.js";
function bodyTemplate(o: LayoutOptions): string {
  return layout(o);
}
