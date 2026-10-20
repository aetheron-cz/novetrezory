(()=>{
const P=window.PRODUCTS;
const $=(s,r=document)=>r.querySelector(s);
const nf=n=>Number(n).toLocaleString('cs-CZ');
const d1=n=>String(n).replace('.',',');
const dim=a=>a?a.map(d1).join(' × '):'—';
const IC={
  arrow:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  x:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l10 10M13 3 3 13"/></svg>'
};
const inStock=p=>p.a==='skladem';
const avText=p=>({skladem:'Skladem','na dotaz':'Dostupnost na dotaz','nelze objednat':'Nelze objednat'}[p.a]||'Dodání '+p.a);

const state={price:0,stock:false,h:'',cls:'',cat:'',sort:''};
const PRICES=[10,20,30,40,50,60,100];
const ORDER=['0.BT','I.BT','II.BT','III.BT','IV.BT','V.BT','VI.BT','S1','S2','B VDMA','15 RU'];
const classes=ORDER.filter(c=>P.some(p=>p.c.includes(c)));
const cats=[...new Set(P.map(p=>p.k))].sort((a,b)=>P.filter(p=>p.k===b).length-P.filter(p=>p.k===a).length);

const root=$('#shop');
root.innerHTML=`
<div class="head">
  <h2>Bazarové trezory<small id="cnt"></small></h2>
  <div class="tools">
    <button class="fbtn" id="fopen">Filtry</button>
    <select class="sel" id="sort" aria-label="Řazení">
      <option value="">Řazení: výchozí</option>
      <option value="pa">Cena – od nejnižší</option>
      <option value="pd">Cena – od nejvyšší</option>
      <option value="ha">Výška – od nejnižší</option>
      <option value="hd">Výška – od nejvyšší</option>
      <option value="wa">Hmotnost – od nejnižší</option>
      <option value="wd">Hmotnost – od nejvyšší</option>
      <option value="n">Název A–Z</option>
    </select>
  </div>
</div>
<div class="layout">
  <aside class="filters" id="filters">
    <button class="fclose" id="fclose" aria-label="Zavřít">×</button>
    <div class="f"><span class="t">Maximální cena</span>
      <div class="chips" id="fprice"></div></div>
    <label class="tog"><span>Pouze skladem</span><input type="checkbox" id="fstock"><span class="sw"></span></label>
    <div class="f num"><label class="t" for="fh">Maximální vnější výška</label>
      <input type="number" id="fh" min="0" inputmode="numeric" placeholder="bez omezení"><span style="top:auto;bottom:11px;transform:none">cm</span></div>
    <div class="f"><label class="t" for="fcls">Bezpečnostní třída</label>
      <select class="sel" id="fcls"><option value="">Bez omezení</option>${classes.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <div class="f"><label class="t" for="fcat">Kategorie</label>
      <select class="sel" id="fcat"><option value="">Všechny</option>${cats.map(c=>`<option value="${c}">${c} (${P.filter(p=>p.k===c).length})</option>`).join('')}</select></div>
    <button class="reset" id="reset">Zrušit filtry</button>
  </aside>
  <div class="grid" id="grid"></div>
</div>`;

$('#fprice').innerHTML=['<button class="chip on" data-v="0">Vše</button>',...PRICES.map(v=>`<button class="chip" data-v="${v}">${v} tis.</button>`)].join('');

function list(){
  let r=P.filter(p=>
    (!state.price||p.p<=state.price*1000)&&
    (!state.stock||inStock(p))&&
    (!state.h||(p.e&&p.e[0]<=state.h))&&
    (!state.cls||p.c.includes(state.cls))&&
    (!state.cat||p.k===state.cat));
  const s=state.sort;
  if(s){
    const key={p:p=>p.p,h:p=>p.e?p.e[0]:1e9,w:p=>p.w??1e9}[s[0]];
    if(s==='n') r.sort((a,b)=>a.n.localeCompare(b.n,'cs'));
    else r.sort((a,b)=>(key(a)-key(b))*(s[1]==='d'?-1:1));
  }
  return r;
}

function tile(p){
  return `<button class="tile" data-id="${p.id}">
    <div class="ph"><img src="${p.im[0]}" alt="${p.n.replace(/"/g,'&quot;')}" loading="lazy">
      <span class="stock ${inStock(p)?'in':''}">${avText(p)}</span>
      ${p.c[0]?`<span class="cls">${p.c[0]}</span>`:''}</div>
    <div class="bd"><h3>${p.n}</h3>
      <dl class="spec">
        <div class="lg">V × Š × H</div>
        <div><dt>Vnější</dt><dd>${dim(p.e)}<em>cm</em></dd></div>
        <div><dt>Vnitřní</dt><dd>${dim(p.i)}<em>cm</em></dd></div>
        <div><dt>Hmotnost</dt><dd>${p.w?nf(p.w):'—'}<em>kg</em></dd></div>
      </dl>
      <div class="foot2"><div class="price"><b>${nf(p.p)} Kč</b><small>bez DPH</small></div><span class="go">${IC.arrow}</span></div>
    </div></button>`;
}

function render(){
  const r=list();
  $('#grid').innerHTML=r.length?r.map(tile).join(''):'<div class="empty">Žádný trezor neodpovídá filtrům.</div>';
  $('#cnt').textContent=r.length+' '+(r.length===1?'trezor':r.length<5&&r.length>1?'trezory':'trezorů');
  const on=state.price||state.stock||state.h||state.cls||state.cat;
  $('#reset').classList.toggle('on',!!on);
}

/* filter wiring */
$('#fprice').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;state.price=+b.dataset.v;
  document.querySelectorAll('#fprice .chip').forEach(c=>c.classList.toggle('on',c===b));render()};
$('#fstock').onchange=e=>{state.stock=e.target.checked;render()};
$('#fh').oninput=e=>{state.h=+e.target.value||'';render()};
$('#fcls').onchange=e=>{state.cls=e.target.value;render()};
$('#fcat').onchange=e=>{state.cat=e.target.value;render()};
$('#sort').onchange=e=>{state.sort=e.target.value;render()};
$('#reset').onclick=()=>{Object.assign(state,{price:0,stock:false,h:'',cls:'',cat:''});
  $('#fstock').checked=false;$('#fh').value='';$('#fcls').value='';$('#fcat').value='';
  document.querySelectorAll('#fprice .chip').forEach((c,i)=>c.classList.toggle('on',i===0));render()};
$('#fopen').onclick=()=>$('#filters').classList.add('on');
$('#fclose').onclick=()=>$('#filters').classList.remove('on');

/* modal */
const mod=document.createElement('div');mod.className='mod';document.body.append(mod);
const toast=document.createElement('div');toast.className='toast';document.body.append(toast);
let cart=0;
function say(t){toast.textContent=t;toast.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove('on'),2200)}
function row(k,v){return v?`<div><dt>${k}</dt><dd>${v}</dd></div>`:''}
function open(id,push=true){
  const p=P.find(x=>x.id===id);if(!p)return;
  const x=p.x||{};
  mod.innerHTML=`<div class="bk"></div><article class="sheet" role="dialog" aria-modal="true" aria-label="${p.n.replace(/"/g,'&quot;')}">
    <button class="x" aria-label="Zavřít">${IC.x}</button>
    <div class="gal"><div class="big"><img id="mainimg" src="${p.im[0]}" alt=""></div>
      ${p.im.length>1?`<div class="thumbs">${p.im.map((s,i)=>`<button class="${i?'':'on'}" data-s="${s}"><img src="${s}" alt=""></button>`).join('')}</div>`:''}</div>
    <div class="info"><h2>${p.n}</h2>
      <div class="pr"><b>${nf(p.p)} Kč</b><span>bez DPH · ${nf(p.pv)} Kč s DPH</span></div>
      <div class="av ${inStock(p)?'in':''}"><i></i>${avText(p)}</div>
      <dl class="spec">
        <div class="lg">V × Š × H</div>
        ${row('Vnější rozměry',dim(p.e)+'<em> cm</em>')}${row('Vnitřní rozměry',dim(p.i)+'<em> cm</em>')}
        ${row('Hmotnost',p.w?nf(p.w)+'<em> kg</em>':'')}${row('Vnitřní objem',x.objem)}
        ${row('Bezpečnostní třída',p.c.join(', '))}${row('Klíčový zámek',x.zamek)}${row('Kombinační zámek',x.komb)}
        ${row('Police',x.police)}${row('Vnitřní schránka',x.schranka)}${row('Kotvení',x.kotveni)}${row('Stupeň utajení NBÚ',x.nbu)}
      </dl>
      <p class="d">${p.d}</p>
      <div class="acts"><button class="btn p" data-buy>Do košíku</button><a class="btn s" href="tel:+420602960278">Zavolat 602 960 278</a></div>
    </div></article>`;
  mod.classList.add('on');document.body.style.overflow='hidden';
  if(push)history.replaceState(null,'','#'+id);
}
function close(){mod.classList.remove('on');document.body.style.overflow='';history.replaceState(null,'',location.pathname+location.search)}
mod.onclick=e=>{
  if(e.target.closest('.x')||e.target.classList.contains('bk'))return close();
  const t=e.target.closest('.thumbs button');
  if(t){$('#mainimg').src=t.dataset.s;mod.querySelectorAll('.thumbs button').forEach(b=>b.classList.toggle('on',b===t))}
  if(e.target.closest('[data-buy]')){cart++;document.querySelectorAll('.cart b').forEach(b=>{b.textContent=cart;b.dataset.n=cart});say('Přidáno do košíku')}
};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(mod.classList.contains('on'))close();else $('#filters').classList.remove('on')}});
$('#grid').onclick=e=>{const t=e.target.closest('.tile');if(t)open(t.dataset.id)};

const picks=$('#picks');
if(picks){
  picks.innerHTML=['2098','2344','2378','923'].map(id=>P.find(p=>p.id===id)).map(tile).join('');
  picks.onclick=e=>{const t=e.target.closest('.tile');if(t)open(t.dataset.id)};
}
render();
if(location.hash.length>1)open(location.hash.slice(1),false);

/* header + hero */
const top=$('.top');
const hero=$('.hero');
if(top){
  const solid=()=>top.classList.toggle('solid',!hero||scrollY>innerHeight-90);
  addEventListener('scroll',solid,{passive:true});solid();
}
if(hero){
  const safe=$('.safe');
  let busy=false;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const go=()=>$('#shop').scrollIntoView({behavior:'smooth'});
  safe.onclick=()=>{
    if(busy)return;
    if(safe.classList.contains('open')){safe.classList.remove('open');return}
    busy=true;safe.classList.add('open');
    setTimeout(()=>{go();busy=false},reduce?0:550);
  };
  $('#enter')?.addEventListener('click',go);
}
})();

/* ochrana: kopírování, obrazky, vlozeni do cizího rámu */
(()=>{
  console.log('%cNávrh © 2026 Aetheron','font:600 14px sans-serif;color:#ff7b00');
  console.log('Ukázka návrhu. Kopírování kódu, grafiky a obsahu bez písemného souhlasu je zakázáno.');
  const stop=e=>e.preventDefault();
  document.addEventListener('contextmenu',e=>{if(e.target.closest('img,.ph,.gal'))stop(e)},true);
  document.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG')stop(e)},true);
  document.addEventListener('keydown',e=>{
    const m=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
    if(e.key==='F12'||(m&&['s','u'].includes(k))||(m&&e.shiftKey&&['i','j','c'].includes(k)))stop(e);
  },true);
  document.addEventListener('copy',e=>{
    const t=String(getSelection());
    if(t.length>=120){e.clipboardData.setData('text/plain',t+'\n\n© Aetheron – ukázka návrhu, kopírování zakázáno.');e.preventDefault()}
  });
  if(top!==self&&location.protocol!=='file:'){
    try{if(top.location.hostname!==location.hostname)top.location=location.href}catch(_){top.location=location.href}
  }
})();
