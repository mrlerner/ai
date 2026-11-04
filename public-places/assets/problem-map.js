// The encampment and open-air drug zone map. The Public spaces page and the Maps page both draw it from this file, with
// the data in assets/problem-data.js (written by encampments/build_problem.py), so the two pages can't drift apart.
// Load Leaflet, then problem-data.js, then this file. Each page makes its own Leaflet map and hands it to problemMap();
// problemMap.data holds the counts and helpers the pages use for their own headlines and tables.
(() => {
  const D = window.PROBLEM;
  const FIND_IT = "https://www.seattle.gov/customer-service-bureau/find-it-fix-it-mobile-app";
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fmt = n => n.toLocaleString("en-US");
  const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "–";
  const day = d => new Date(d + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const monthOf = d => new Date(d + "T12:00").toLocaleDateString("en-US", { month: "long" });
  const plural = (n, one, many = one + "s") => `${fmt(n)} ${n === 1 ? one : many}`;
  // Short names for the kinds of public place, for tooltips and the panel.
  const SHORT = { schools: "school or child care zone", playgrounds: "playground zone", business: "business district" };

  const P = D.places;
  const camps = P.filter(p => p.camp), drugs = P.filter(p => p.drug);
  const campsIn = camps.filter(p => p.k), drugsIn = drugs.filter(p => p.k);
  const span = `${monthOf(D.start)} through ${monthOf(D.end)} ${D.end.slice(0, 4)}`;

  const CSS = `
:root { --camp: #2a78d6; --drug: #eb6834; --key-fill: #7a8a7a; }
@media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) { --camp: #3987e5; --drug: #d95926; --key-fill: #9fb09f; } }
:root[data-theme="dark"] { --camp: #3987e5; --drug: #d95926; --key-fill: #9fb09f; }
.pm-panel h3 { margin: 0 0 4px; font-size: 18px; line-height: 1.3; }
.pm-panel .sub { color: var(--muted); font-size: 14px; margin-bottom: 10px; }
.pm-panel dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; margin: 10px 0; }
.pm-panel dt { color: var(--muted); }
.pm-panel dd { margin: 0; font-variant-numeric: tabular-nums; }
.pm-panel .tags { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0 8px; }
.pm-tag { font-size: 12.5px; font-weight: 600; border-radius: 999px; padding: 2px 9px; color: #fff; }
.pm-tag.camp { background: var(--camp); }
.pm-tag.drug { background: var(--drug); }
.pm-tag.out { background: var(--chip); color: var(--muted); border: 1px solid var(--line); }
.pm-panel a.primary { display: block; text-align: center; text-decoration: none; border-radius: 8px; padding: 8px 12px; margin-top: 14px; background: var(--fg); color: var(--bg); }
.pm-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; color: var(--muted); margin-top: 8px; }
.pm-legend i { display: inline-block; vertical-align: -2px; margin-right: 6px; }
.pm-dot { width: 12px; height: 12px; border-radius: 50%; }
.pm-keysw { width: 14px; height: 12px; border-radius: 3px; background: color-mix(in srgb, var(--key-fill) 30%, transparent); border: 1px solid var(--key-fill); }`;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const tipFor = p => {
    const lines = [`<b>${p.name}</b>`];
    if (p.drug) lines.push(`${plural(p.calls, "resident drug call")}, ${plural(p.od, "overdose call")}`);
    if (p.camp) lines.push(plural(p.reports, "encampment report"));
    lines.push(p.k ? `In a ${SHORT[p.k]}${p.near ? `: ${p.near}` : ""}` : "Not in a protected public place");
    return lines.join("<br>");
  };
  const rCamp = p => 2.5 + Math.sqrt(p.reports) * 0.6;
  const rDrug = p => 5 + Math.sqrt(p.calls + p.od) * 1.4;
  const toLatLngs = g => (g.type === "Polygon" ? [g.coordinates] : g.coordinates).map(poly => poly.map(r => r.map(([x, y]) => [y, x])));

  // panel and legend are elements the map writes into; onSelect is called with the place picked (or null).
  // show says which dots to draw: { camp, drug }. The map stays off until add() puts it on the Leaflet map.
  window.problemMap = (map, { panel, legend, onSelect = () => {} }) => {
    panel.classList.add("pm-panel");
    legend.classList.add("pm-legend");
    const keys = L.layerGroup(), dots = L.layerGroup(), markers = new Map();
    D.layers.forEach(l => {
      L.polygon(toLatLngs(l.geom), { color: css("--key-fill"), weight: 0.6, fillColor: css("--key-fill"), fillOpacity: 0.2, interactive: false }).addTo(keys);
    });
    const show = { camp: true, drug: true };
    let selected = null, on = false;

    function drawMap() {
      dots.clearLayers();
      markers.clear();
      // Encampments first, then drug zones on top; within each, biggest first so small dots stay clickable.
      const layers = [
        ...P.filter(p => show.camp && p.camp && !(show.drug && p.drug)).sort((a, b) => b.reports - a.reports).map(p => [p, "camp"]),
        ...P.filter(p => show.drug && p.drug).sort((a, b) => (b.calls + b.od) - (a.calls + a.od)).map(p => [p, "drug"]),
      ];
      layers.forEach(([p, kind]) => {
        const inside = !!p.k, sel = p === selected;
        const mk = L.circleMarker([p.lat, p.lng], {
          radius: kind === "drug" ? rDrug(p) : rCamp(p),
          color: sel ? css("--ring") : css("--bg"), weight: sel ? 3 : kind === "drug" ? 1.5 : 0.8, opacity: inside ? 1 : 0.5,
          fillColor: css(kind === "drug" ? "--drug" : "--camp"), fillOpacity: inside ? 0.85 : 0.3,
        });
        mk.bindTooltip(tipFor(p), { className: "tip", direction: "top" });
        mk.on("click", () => select(p, false));
        mk.addTo(dots);
        markers.set(p, mk);
      });
      const faded = show.camp ? "--camp" : "--drug";
      legend.innerHTML = [
        show.camp && `<span><i class="pm-dot" style="background:var(--camp)"></i>Encampment: ${D.rules.camp_min}+ reports on ${D.rules.camp_days}+ days</span>`,
        show.drug && `<span><i class="pm-dot" style="background:var(--drug)"></i>Drug zone: ${D.rules.drug_min}+ drug or overdose calls on ${D.rules.drug_days}+ days</span>`,
        (show.camp || show.drug) && `<span>Bigger dot, more reports or calls</span>`,
        (show.camp || show.drug) && `<span><i class="pm-dot" style="background:var(${faded});opacity:.35"></i>Faded: outside the public places</span>`,
        `<span><i class="pm-keysw"></i>Public places the pledge protects</span>`,
      ].filter(Boolean).join("");
    }

    function drawPanel() {
      const p = selected;
      if (!p) {
        const what = [show.camp && "blue dots are encampments", show.drug && "orange dots are open-air drug zones"].filter(Boolean).join(" and ");
        panel.innerHTML = `<h3>Pick a dot</h3>
          <div class="sub">${what ? what[0].toUpperCase() + what.slice(1) + ", " + span + ". Tap one to see what was reported there." : "Turn on encampments or drug zones to see them on the map."}</div>
          <dl>
            ${show.camp ? `<dt>Encampments</dt><dd>${fmt(camps.length)} (${fmt(campsIn.length)} in public places)</dd>` : ""}
            ${show.drug ? `<dt>Drug zones</dt><dd>${fmt(drugs.length)} (${fmt(drugsIn.length)} in public places)</dd>` : ""}
            ${show.camp ? `<dt>Reports</dt><dd>${fmt(D.totals.reports)}</dd>` : ""}
            ${show.drug ? `<dt>Drug calls</dt><dd>${fmt(D.totals.calls)}</dd><dt>Overdose calls</dt><dd>${fmt(D.totals.overdoses)}</dd>` : ""}
          </dl>`;
        return;
      }
      panel.innerHTML = `<h3>${p.name}</h3>
        <div class="sub">${[p.hood, `District ${p.d}`].filter(Boolean).join(" · ")}</div>
        <div class="tags">${p.camp ? `<span class="pm-tag camp">Encampment</span>` : ""}${p.drug ? `<span class="pm-tag drug">Drug zone</span>` : ""}${p.k ? "" : `<span class="pm-tag out">Outside public places</span>`}</div>
        <div class="sub" style="color:var(--fg)">${p.k ? `In a ${SHORT[p.k]}${p.near ? `: <b>${p.near}</b>` : ""}` : "Not in a protected public place"}</div>
        <dl>
          <dt>Encampment reports</dt><dd>${fmt(p.reports)}${p.reports ? ` on ${plural(p.cdays, "day")}` : ""}</dd>
          <dt>Saw tents</dt><dd>${fmt(p.tents)}</dd>
          <dt>Resident drug calls</dt><dd>${fmt(p.calls)}</dd>
          <dt>Overdose calls</dt><dd>${fmt(p.od)}</dd>
          ${p.calls + p.od ? `<dt>Days with a call</dt><dd>${fmt(p.ddays)}</dd>` : ""}
        </dl>
        <div class="sub">${span}. The dot sits in the middle of the reports and calls, never at one of them.</div>
        <a class="primary" href="${FIND_IT}" target="_blank" rel="noopener">Report an encampment in Find It, Fix It ↗</a>`;
    }

    function select(p, pan) {
      selected = p;
      drawMap(); drawPanel();
      onSelect(p);
      const mk = markers.get(p);
      if (mk && pan) map.setView(mk.getLatLng(), Math.max(map.getZoom(), 16));
      if (mk) mk.openTooltip();
    }

    const cityBounds = L.latLngBounds(P.map(p => [p.lat, p.lng]));
    return {
      // Put the map on with the given dots, or change which dots show.
      add(kinds = show) {
        Object.assign(show, kinds);
        if (!on) { keys.addTo(map); dots.addTo(map); on = true; }
        drawMap(); drawPanel();
      },
      remove() {
        if (!on) return;
        map.removeLayer(keys); map.removeLayer(dots);
        on = false; selected = null;
      },
      show,
      select,
      drawPanel,
      fitCity: () => map.fitBounds(cityBounds, { padding: [10, 10] }),
      // Buttons that jump to the busiest areas, plus one for the whole city.
      views(el, fitAll) {
        el.insertAdjacentHTML("beforeend", [["Whole city"], ...D.views].map(([name], i) => `<button class="chip" data-v="${i}">${name}</button>`).join(" "));
        el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => {
          const v = D.views[+b.dataset.v - 1];
          if (v) map.setView([v[2], v[1]], v[3]); else fitAll();
        });
      },
    };
  };
  window.problemMap.data = { D, P, camps, drugs, campsIn, drugsIn, span, SHORT, fmt, pct, day, monthOf, plural };
})();
