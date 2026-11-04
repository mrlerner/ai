// Footnotes for the pledge research pages. In the text, cite with <a class="fn" href="#n-key"></a>; list the note as
// <li id="n-key"> inside <ol class="fnlist">. Notes are numbered in order of first citation, the list is reordered to
// match, and each note gets links back to where it's cited. Notes nobody cites go last.
addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("ol.fnlist");
  if (!list) return;
  const order = [], refs = {};
  document.querySelectorAll("a.fn").forEach(a => {
    const key = a.getAttribute("href").slice(1);
    if (!document.getElementById(key)) { console.warn("missing note", key); return; }
    if (!refs[key]) { refs[key] = []; order.push(key); }
    const id = `r-${key}-${refs[key].length + 1}`;
    a.id = id;
    a.textContent = order.indexOf(key) + 1;
    a.setAttribute("aria-label", `Note ${order.indexOf(key) + 1}`);
    refs[key].push(id);
  });
  order.forEach(key => list.append(document.getElementById(key)));
  [...list.children].filter(li => !refs[li.id]).forEach(li => list.append(li));
  order.forEach(key => {
    const li = document.getElementById(key);
    refs[key].forEach((id, i) => {
      const back = document.createElement("a");
      back.className = "back";
      back.href = "#" + id;
      back.textContent = refs[key].length > 1 ? `↩${i + 1}` : "↩";
      back.setAttribute("aria-label", "Back to the text");
      li.append(" ", back);
    });
  });
});
