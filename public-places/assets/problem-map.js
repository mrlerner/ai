// The encampment and open-air drug zone map. The Problem page and the Maps page both draw it and its Look at buttons from
// this file, with the data in assets/problem-data.js (written by encampments/build_problem.py), so the two pages can't drift
// apart. Load Leaflet, then problem-data.js, then this file. Each page makes its own Leaflet map and hands it to problemMap();
// problemMap.data holds the counts and helpers the pages use for their own headlines and tables.
// When a change here changes how the pages call it, bump the ?v= on its script tags so browsers don't pair a new page with an old copy.
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
  const SHORT = { schools: "school or child care zone", playgrounds: "playground zone", business: "busy sidewalk zone" };

  const P = D.places;
  const camps = P.filter(p => p.camp), drugs = P.filter(p => p.drug);
  const campsIn = camps.filter(p => p.k), drugsIn = drugs.filter(p => p.k);
  const span = `${monthOf(D.start)} through ${monthOf(D.end)} ${D.end.slice(0, 4)}`;

  const CSS = `
:root { --camp: #2a78d6; --drug: #eb6834; --key-fill: #2f9e44; }
@media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) { --camp: #3987e5; --drug: #d95926; --key-fill: #4cc35f; } }
:root[data-theme="dark"] { --camp: #3987e5; --drug: #d95926; --key-fill: #4cc35f; }
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
.pm-keysw { width: 14px; height: 12px; border-radius: 3px; background: color-mix(in srgb, var(--key-fill) 30%, transparent); border: 1px solid var(--key-fill); }
.pm-tnav { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; margin-bottom: 12px; }
.pm-tnav button, .pm-step button, .pm-nlist button { font: inherit; font-size: 14px; color: var(--fg); background: var(--chip); border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; cursor: pointer; }
.pm-tnav button, .pm-step button { font-weight: 600; }
.pm-tnav button:last-child { justify-self: end; }
.pm-tnav button:disabled, .pm-step button:disabled { opacity: .35; cursor: default; }
.pm-tnav span { color: var(--muted); font-size: 13.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pm-step { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 4px; display: flex; gap: 4px; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,.2); font-variant-numeric: tabular-nums; }
.pm-step span { font-size: 13px; color: var(--muted); padding: 0 6px; min-width: 64px; text-align: center; }
.pm-step button { padding: 5px 10px; }
.pm-nlist { display: grid; gap: 6px; margin: 12px 0; }
.pm-nlist button { text-align: left; }
.pm-nlist .tags { display: inline-flex; margin: 0 0 0 6px; vertical-align: 1px; }
.pm-nlist .sub { margin: 2px 0 0; font-size: 13px; }
.pm-back { font: inherit; font-size: 14px; margin-top: 12px; background: none; border: 0; padding: 0; color: var(--camp); cursor: pointer; }
.leaflet-tooltip.pm-pin { background: var(--fg); color: var(--bg); border: 0; border-radius: 6px; font-weight: 600; font-size: 13px; padding: 3px 8px; box-shadow: none; }
.leaflet-tooltip.pm-pin::before { display: none; }`;
  // The Look at buttons that step through public places one at a time: [key in D.near, button, what one of them is].
  // The parks are the playgrounds the count uses, most of them named for the park they're in.
  const STOPS = [["schools", "Schools", "school"], ["playgrounds", "Parks", "playground"]];
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
      L.polygon(toLatLngs(l.geom), { color: css("--key-fill"), weight: 0.6, fillColor: css("--key-fill"), fillOpacity: 0.25, interactive: false }).addTo(keys);
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

    // ---------- stepping through schools and parks with an encampment or drug zone ----------
    // Next and Previous sit in the panel and on the map, so on a phone the map alone is enough to step through.
    const Step = L.Control.extend({ options: { position: "topright" }, onAdd() {
      const el = L.DomUtil.create("div", "pm-step");
      L.DomEvent.disableClickPropagation(el);
      return el;
    } });
    const stopLayer = L.layerGroup(), stepper = new Step();
    let stop = null, stopButtons = null, fitAll = () => {};  // stop: { k, i }, which kind is being stepped through and which one
    function pickStop(k, i) {
      stop = { k, i };
      drawStop();
      // The school or park and every encampment and drug zone counted for it, with room around them.
      const s = D.near[k][i];
      map.flyToBounds([[s.lat, s.lng], ...s.p.map(j => [P[j].lat, P[j].lng])], { padding: [60, 60], maxZoom: 16, duration: 0.6 });
    }
    const stepStop = d => { if (stop && D.near[stop.k][stop.i + d]) pickStop(stop.k, stop.i + d); };
    function leaveStop() {
      if (!stop) return;
      stop = null;
      drawStop();
      if (on) select(null, false);
    }
    function drawStop() {
      stopLayer.clearLayers();
      stopButtons?.querySelectorAll("[data-stop]").forEach(b => b.setAttribute("aria-pressed", stop?.k === b.dataset.stop));
      if (!stop) { map.removeLayer(stopLayer); if (stepper._map) stepper.remove(); return; }
      const list = D.near[stop.k], s = list[stop.i], n = list.length, one = STOPS.find(([k]) => k === stop.k)[2];
      const places = s.p.map(j => P[j]);
      stopLayer.addTo(map);
      L.circleMarker([s.lat, s.lng], { radius: 7, color: css("--bg"), weight: 2, fillColor: css("--fg"), fillOpacity: 1, interactive: false })
        .bindTooltip(s.n, { permanent: true, direction: "right", offset: [8, 0], className: "pm-pin" }).addTo(stopLayer);
      if (!stepper._map) stepper.addTo(map);
      stepper.getContainer().innerHTML = `<button aria-label="Previous ${one}" ${stop.i ? "" : "disabled"}>‹</button><span>${stop.i + 1} of ${n}</span>` +
        `<button aria-label="Next ${one}" ${stop.i < n - 1 ? "" : "disabled"}>›</button>`;
      const [prev, next] = stepper.getContainer().querySelectorAll("button");
      prev.onclick = () => stepStop(-1); next.onclick = () => stepStop(1);
      const nc = places.filter(p => p.camp).length, nd = places.filter(p => p.drug).length;
      const what = [nc && plural(nc, "encampment"), nd && plural(nd, "open-air drug zone")].filter(Boolean).join(" and ");
      panel.innerHTML = `
        <div class="pm-tnav"><button data-d="-1" ${stop.i ? "" : "disabled"}>← Previous</button><span>${stop.i + 1} of ${n}</span>
          <button data-d="1" ${stop.i < n - 1 ? "" : "disabled"}>Next →</button></div>
        <h3>${s.n}</h3>
        <div class="sub">${one[0].toUpperCase() + one.slice(1)}. ${what} within 300 feet, ${span}. Tap one to see what was reported there.</div>
        <div class="pm-nlist">${places.map((p, i) => `<button data-i="${i}"><b>${p.name}</b><span class="tags">${p.camp ? `<span class="pm-tag camp">Encampment</span>` : ""}${p.drug ? `<span class="pm-tag drug">Drug zone</span>` : ""}</span>
          <div class="sub">${[p.camp && plural(p.reports, "encampment report"), p.drug && plural(p.calls + p.od, "drug or overdose call")].filter(Boolean).join(", ")}</div></button>`).join("")}</div>
        <button class="pm-back" data-all>← Whole city</button>`;
      panel.querySelectorAll(".pm-tnav button").forEach(b => b.onclick = () => stepStop(+b.dataset.d));
      panel.querySelector("[data-all]").onclick = () => { leaveStop(); fitAll(); };
      panel.querySelectorAll(".pm-nlist button").forEach(b => b.onclick = () => {
        const { k, i } = stop;
        select(places[+b.dataset.i], true);
        panel.insertAdjacentHTML("afterbegin", `<button class="pm-back" data-back style="margin:0 0 10px">← ${s.n}</button>`);
        panel.querySelector("[data-back]").onclick = () => pickStop(k, i);
      });
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
        leaveStop();
      },
      show,
      select,
      drawPanel,
      fitCity: () => map.fitBounds(cityBounds, { padding: [10, 10] }),
      // The Look at buttons: Schools and Parks step through them one at a time, then the whole city and the busiest areas.
      // fit shows the whole city. The arrow keys step and Escape goes back to the whole city while the map is on.
      lookAt(el, fit) {
        fitAll = fit;
        stopButtons = el;
        el.insertAdjacentHTML("beforeend", [
          ...STOPS.map(([k, name]) => `<button class="chip" data-stop="${k}" aria-pressed="false">${name}</button>`),
          ...[["Whole city"], ...D.views].map(([name], i) => `<button class="chip" data-v="${i}">${name}</button>`),
        ].join(" "));
        el.querySelectorAll("[data-stop]").forEach(b => b.onclick = () => pickStop(b.dataset.stop, 0));
        el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => {
          leaveStop();
          const v = D.views[+b.dataset.v - 1];
          if (v) map.setView([v[2], v[1]], v[3]); else fitAll();
        });
        addEventListener("keydown", e => {
          if (!stop || !on || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
          if (e.key === "ArrowRight") { e.preventDefault(); stepStop(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); stepStop(-1); }
          if (e.key === "Escape") { leaveStop(); fitAll(); }
        });
      },
    };
  };
  window.problemMap.data = { D, P, camps, drugs, campsIn, drugsIn, span, SHORT, fmt, pct, day, monthOf, plural };
})();
