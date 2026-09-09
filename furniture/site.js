// Shared renderer for the furniture list (index.html) and the per-item pages.
const IMG = id => `images/${id}.jpg`;
const VID = id => `videos/${id}.mp4`;
const PAGE = it => `${it.id}.html`;

function cardHTML(it, {link}){
  const thumbs = it.photos.map((p,i)=>`<img src="${IMG(p)}" data-src="${IMG(p)}" class="${i===0?'on':''}" alt="">`).join('')
    + it.videos.map(v=>`<div class="vid" data-video="${VID(v)}">▶ VIDEO</div>`).join('');
  const title = link ? `<a class="itemlink" href="${PAGE(it)}">${it.name}</a>` : it.name;
  return `
    <div class="gallery">
      <div class="stage"><img class="main" src="${IMG(it.photos[0])}" alt="${it.name}"></div>
      <div class="thumbs">${thumbs}</div>
    </div>
    <div class="info">
      <p class="eyebrow">${it.eyebrow}</p>
      <h2>${title}</h2>
      <p class="brand">${it.brand}</p>
      <div class="desc">${it.desc.map(p=>`<p>${p}</p>`).join('')}</div>
      <dl><dt>2019 purchase price</dt><dd>${it.price} <span class="pnote">· ${it.priceNote}</span></dd>${it.specs.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      <div class="tags">${it.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      ${it.note?`<div class="note">${it.note}</div>`:''}
    </div>`;
}

function mountCard(container, it, opts){
  const sec = document.createElement('section');
  sec.className = 'item'; sec.id = it.id;
  sec.innerHTML = cardHTML(it, opts);
  container.appendChild(sec);

  const stage = sec.querySelector('.stage');
  const tEls = [...sec.querySelectorAll('.thumbs > *')];
  tEls.forEach(t => t.addEventListener('click', () => {
    tEls.forEach(x=>x.classList.remove('on')); t.classList.add('on');
    if (t.dataset.video){
      stage.innerHTML = `<video controls autoplay muted playsinline src="${t.dataset.video}"></video>`;
    } else {
      stage.innerHTML = `<img class="main" src="${t.dataset.src}" alt="${it.name}">`;
    }
  }));
  stage.addEventListener('click', e => {
    if (e.target.tagName === 'IMG'){ openLb(e.target.src); }
  });
}


function render(){
  const main = document.getElementById('items');
  const only = main.dataset.item;
  const items = only ? ITEMS.filter(it => it.id === only) : ITEMS;

  const sum = document.getElementById('summaryBody');
  if (sum) items.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><a href="${PAGE(it)}">${it.name}</a></td><td>${it.brand.split(' · ')[0]}</td><td class="num">${it.price}</td>`;
    sum.appendChild(tr);
  });

  items.forEach(it => mountCard(main, it, {link: !only}));
}

const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
function openLb(src){ lbImg.src = src; lb.classList.add('open'); }
lb.addEventListener('click', ()=>lb.classList.remove('open'));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') lb.classList.remove('open'); });
render();
