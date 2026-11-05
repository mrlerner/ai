// Shared site header. Every page includes this script right after <body>, so the header renders before the page does.
// To add a page, add it to SECTIONS; the first page in a section is where the section's top-level link goes.
// Sections marked footer: true are listed in the site footer instead of the top bar; footer sections marked hub: true list only their first page.
(() => {
  const SECTIONS = [
    { name: "The Pledge", pages: [{ name: "The pledge", href: "index.html" }] },
    { name: "The Problem", pages: [{ name: "The problem", href: "public-spaces.html" }] },
    // The map's own pill buttons switch between its tabs, so it needs no sub-nav.
    { name: "The Details", pages: [{ name: "The details", href: "details.html" }] },
    { name: "How to Help", pages: [{ name: "How to help", href: "help.html" }] },
    // Footer sections: useful background, but not part of the main argument. Their pages still get a sub-nav.
    { name: "Other cities", footer: true, hub: true, pages: [
      { name: "Learning from other cities", href: "other-cities.html" },
      { name: "Denver vs. Seattle", href: "denver-vs-seattle.html" },
      { name: "The Denver plan for Seattle", href: "denver-plan.html" },
    ] },
    { name: "Budget", footer: true, pages: [
      { name: "What Seattle spends", href: "budget.html" },
      { name: "What else it could buy", href: "spending-options.html" },
      { name: "Service levels", href: "service-levels.html" },
    ] },
    // One research brief per pledge item, reached from the Pledge Details tab (details.html#pledge) and the footer.
    // nosub: they link to each other at the bottom of each brief, so they get no sub-nav.
    { name: "Research briefs", footer: true, nosub: true, pages: [
      { name: "Keeping public places clear", href: "pledge-public-places.html" },
      { name: "Adding 1,000 rooms", href: "pledge-rooms.html" },
      { name: "Publishing the numbers", href: "pledge-numbers.html" },
    ] },
    // The Details page has no tab for this view; its #existing hash opens it.
    { name: "Existing villages", footer: true, pages: [{ name: "Villages and hotels open now", href: "details.html#existing" }] },
    { name: "Coalitions", footer: true, pages: [{ name: "Who could give the pledge weight", href: "coalitions.html" }] },
    { name: "Simulator", footer: true, pages: [{ name: "State of Emergency", href: "simulator.html" }] },
    { name: "Methodology", footer: true, pages: [{ name: "How we count", href: "methodology.html" }] },
  ];

  const CSS = `
.pp-site { --pp-bg: #ffffff; --pp-sub: #fbfaf7; --pp-fg: #1f2421; --pp-muted: #5d6660; --pp-line: #e2e0d8; --pp-chip: #efede6; --pp-accent: #2a6fb5;
  background: var(--pp-bg); border-bottom: 1px solid var(--pp-line); color: var(--pp-fg);
  font: 15px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; position: relative; z-index: 1001; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .pp-site { --pp-bg: #1b1f1c; --pp-sub: #161a17; --pp-fg: #e6e9e5; --pp-muted: #9aa49c; --pp-line: #2c332e; --pp-chip: #2a312c; --pp-accent: #7fb2ea; }
}
:root[data-theme="dark"] .pp-site { --pp-bg: #1b1f1c; --pp-sub: #161a17; --pp-fg: #e6e9e5; --pp-muted: #9aa49c; --pp-line: #2c332e; --pp-chip: #2a312c; --pp-accent: #7fb2ea; }
.pp-site, .pp-site * { box-sizing: border-box; margin: 0; }
.pp-site a { text-decoration: none; color: inherit; max-width: none; }
.pp-site a:focus-visible { outline: 2px solid var(--pp-accent); outline-offset: 2px; }
.pp-in { max-width: 1160px; margin: 0 auto; padding: 0 16px; display: flex; align-items: center; gap: 4px 20px; }
.pp-bar { min-height: 54px; justify-content: space-between; flex-wrap: wrap; }
.pp-brand { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 16px; letter-spacing: -.005em; white-space: nowrap; }
.pp-brand svg { flex: none; }
.pp-sections { display: flex; gap: 2px; }
.pp-sections a { padding: 6px 11px; border-radius: 7px; color: var(--pp-muted); font-weight: 600; white-space: nowrap; }
.pp-sections a:hover { color: var(--pp-fg); }
.pp-sections a.pp-on { color: var(--pp-fg); background: var(--pp-chip); }
.pp-sub { background: var(--pp-sub); border-top: 1px solid var(--pp-line); }
.pp-sub .pp-in { gap: 22px; overflow-x: auto; scrollbar-width: none; }
.pp-sub a { padding: 10px 0 8px; border-bottom: 2px solid transparent; color: var(--pp-muted); font-size: 14.5px; white-space: nowrap; }
.pp-sub a:hover { color: var(--pp-fg); }
.pp-sub a[aria-current="page"] { color: var(--pp-fg); border-bottom-color: var(--pp-accent); font-weight: 600; }
@media (max-width: 640px) {
  .pp-bar { padding-top: 10px; padding-bottom: 6px; }
  .pp-sections { width: calc(100% + 8px); margin-left: -8px; overflow-x: auto; scrollbar-width: none; }
  .pp-sections a { padding: 6px 8px; font-size: 14.5px; }
}
.pp-foot { border-top: 1px solid var(--pp-line); border-bottom: 0; background: var(--pp-sub); font-size: 14.5px; }
.pp-foot .pp-in { padding-top: 28px; padding-bottom: 36px; align-items: flex-start; flex-wrap: wrap; gap: 24px 48px; }
.pp-foot h2 { font-size: 12.5px; letter-spacing: .05em; text-transform: uppercase; color: var(--pp-muted); font-weight: 600; margin-bottom: 8px; border: 0; padding: 0; line-height: 1.4; }
.pp-foot ul { list-style: none; padding: 0; }
.pp-foot li { margin: 0 0 6px; padding: 0; }
.pp-foot a { color: var(--pp-fg); }
.pp-foot a:hover { color: var(--pp-accent); }
.pp-foot a[aria-current="page"] { font-weight: 600; }
@media print { .pp-site { display: none; } }`;

  // A tiny house with a door that locks: the room the pledge promises.
  const MARK = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect width="22" height="22" rx="5" fill="var(--pp-accent)"/>` +
    `<path d="M4.2 10.8L11 4.7l6.8 6.1" fill="none" stroke="var(--pp-bg)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M6 9.6L11 5.3l5 4.3v7.9H6z" fill="var(--pp-bg)"/><rect x="9.2" y="12" width="3.6" height="5.5" rx=".5" fill="var(--pp-accent)"/>` +
    `<circle cx="11" cy="14.3" r=".75" fill="var(--pp-bg)"/><path d="M10.6 14.6h.8l.25 1.5h-1.3z" fill="var(--pp-bg)"/></svg>`;

  // Which page this is: the file name, or index.html for a bare folder URL.
  const current = () => location.pathname.split("/").pop() || "index.html";

  const render = () => {
    const here = current();
    const section = SECTIONS.find(s => s.pages.some(p => p.href === here));
    const tops = SECTIONS.filter(s => !s.footer).map(s => `<a href="${s.pages[0].href}"${s === section ? ' class="pp-on"' : ""}>${s.name}</a>`).join("");
    const sub = section && !section.nosub && section.pages.length > 1
      ? `<nav class="pp-sub" aria-label="${section.name}"><div class="pp-in">` +
        section.pages.map(p => `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.name}</a>`).join("") +
        `</div></nav>`
      : "";
    return `<div class="pp-in pp-bar"><a class="pp-brand" href="index.html">${MARK}Fix Seattle's Public Places</a>` +
      `<nav class="pp-sections" aria-label="Site">${tops}</nav></div>${sub}`;
  };

  const renderFooter = () => {
    const here = current();
    const cols = SECTIONS.filter(s => s.footer).map(s => `<div><h2>${s.name}</h2><ul>` +
      (s.hub ? s.pages.slice(0, 1) : s.pages).map(p => `<li><a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.name}</a></li>`).join("") +
      `</ul></div>`).join("");
    return `<div class="pp-in">${cols}</div>`;
  };

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  const header = document.createElement("header");
  header.className = "pp-site";
  header.innerHTML = render();
  document.currentScript.before(header);
  // The footer lists the footer-only sections, at the end of the page.
  const footer = document.createElement("footer");
  footer.className = "pp-site pp-foot";
  footer.innerHTML = renderFooter();
  addEventListener("DOMContentLoaded", () => document.body.append(footer));
})();
