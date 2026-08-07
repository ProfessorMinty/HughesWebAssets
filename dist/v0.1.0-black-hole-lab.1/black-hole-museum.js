const APP_VERSION = '0.1.0';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(label, className = '') {
  const node = el('button', className, label);
  node.type = 'button';
  return node;
}
function escapeText(value) { return String(value ?? ''); }

function assetMap(manifest) {
  return new Map((manifest.assets || []).map(item => [item.id, item]));
}

function evidenceBadge(text) {
  const badge = el('p', 'bhm-evidence-badge', text);
  badge.setAttribute('aria-label', 'Scientific media classification: ' + text);
  return badge;
}

function plaque(station) {
  const box = el('div', 'bhm-plaque');
  const head = el('div', 'bhm-plaque-head');
  head.append(el('span', 'bhm-station-number', station.number), el('p', 'bhm-kicker', station.kicker));
  box.append(head, el('h2', '', station.title), evidenceBadge(station.classification));
  box.append(el('p', 'bhm-child-line', station.child));
  const details = el('details', 'bhm-look-deeper');
  details.append(el('summary', '', 'Look deeper'), el('p', '', station.deeper));
  box.append(details);
  return box;
}

function mediaCard(asset, release) {
  const figure = el('figure', 'bhm-media-card');
  figure.dataset.assetId = asset.id;
  figure.dataset.kind = asset.kind;
  const frame = el('div', 'bhm-media-frame');
  const source = asset.localUrl || asset.stubUrl;
  if (asset.kind === 'video' && asset.localUrl) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    if (asset.posterUrl) video.poster = asset.posterUrl;
    const src = document.createElement('source');
    src.src = source;
    video.append(src);
    video.setAttribute('aria-label', asset.alt);
    frame.append(video);
  } else {
    const img = document.createElement('img');
    img.src = source;
    img.alt = asset.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1280;
    img.height = 720;
    img.addEventListener('error', () => {
      img.remove();
      frame.append(el('div', 'bhm-media-failure', 'Scientific media unavailable. The caption, classification, credit, and authoritative source remain below.'));
    }, { once: true });
    frame.append(img);
  }
  const figcaption = el('figcaption');
  figcaption.append(
    el('strong', '', asset.title),
    el('span', 'bhm-media-class', asset.classification),
    el('span', '', asset.caption),
    el('span', 'bhm-credit', 'Credit: ' + asset.credit)
  );
  const links = el('span', 'bhm-source-links');
  const sourceLink = document.createElement('a');
  sourceLink.href = asset.sourcePage;
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener noreferrer';
  sourceLink.textContent = 'Authoritative source';
  links.append(sourceLink);
  figcaption.append(links);
  if (asset.stub) {
    const notice = el('p', 'bhm-asset-notice',
      'Repository acquisition is not present in this offline evidence build. This honest placeholder prevents the source from being misrepresented.');
    frame.append(notice);
  }
  figure.append(frame, figcaption);
  return figure;
}

function createLensingStage() {
  const wrap = el('div', 'bhm-lensing-stage');
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 650;
  canvas.setAttribute('aria-label', 'Simplified diagram of background stars and bent light near an invisible center.');
  const paths = el('svg', 'bhm-lensing-paths');
  paths.setAttribute('viewBox', '0 0 1200 650');
  paths.innerHTML = `
    <path d="M70 150 C390 140 410 300 600 324 C790 348 810 510 1130 500"/>
    <path d="M70 500 C370 510 430 372 600 326 C770 280 830 140 1130 150"/>
    <circle cx="600" cy="325" r="72"/>
  `;
  wrap.append(canvas, paths, el('div', 'bhm-invisible-center'));
  const ctx = canvas.getContext('2d');
  const stars = Array.from({length: 115}, (_, i) => {
    const angle = (i * 2.3999632297) % (Math.PI * 2);
    const radius = 80 + ((i * 83) % 500);
    return {x:600 + Math.cos(angle)*radius, y:325 + Math.sin(angle)*radius*.55, r:1 + (i%4)*.45};
  });
  function draw(mode) {
    ctx.clearRect(0,0,1200,650);
    const bg = ctx.createRadialGradient(600,325,20,600,325,650);
    bg.addColorStop(0,'#02030a'); bg.addColorStop(1,'#07142d');
    ctx.fillStyle=bg; ctx.fillRect(0,0,1200,650);
    stars.forEach((s,i)=>{
      let x=s.x,y=s.y,stretch=1;
      if (mode !== 'quiet') {
        const dx=x-600, dy=y-325, d=Math.max(70,Math.hypot(dx,dy));
        const bend=Math.min(46,7600/(d*d));
        x += (-dy/d)*bend*(i%2?1:-1);
        y += (dx/d)*bend*(i%2?1:-1);
        stretch = d<230 ? 3.2 : 1;
      }
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(Math.atan2(y-325,x-600)+Math.PI/2);
      ctx.fillStyle=i%8===0?'#7ff4ff':'#ffffff';
      ctx.globalAlpha=.55+(i%5)*.09;
      ctx.beginPath(); ctx.ellipse(0,0,s.r*stretch,s.r,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }
  draw('quiet');
  wrap.draw = draw;
  return wrap;
}

function renderThreshold(station, context) {
  const section = chamber(station, 'threshold');
  const architecture = el('div','bhm-threshold-architecture');
  architecture.append(el('div','bhm-door-light'), el('div','bhm-distant-stars'));
  const card = plaque(station);
  const warning = el('p','bhm-prototype-warning',context.content.page.prototypeWarning);
  const recap = el('div','bhm-recap');
  context.content.recap.forEach(p => recap.append(el('p','',p)));
  const enter = button(station.interaction.label,'bhm-primary');
  enter.addEventListener('click',()=>document.getElementById('invisible-sky-atrium')?.scrollIntoView({behavior: motionBehavior(context)}));
  card.append(warning,recap,enter);
  architecture.append(card);
  section.append(architecture);
  return section;
}

function chamber(station, type=station.type) {
  const section=el('section','bhm-chamber bhm-'+type);
  section.id=station.id;
  section.dataset.station=station.number;
  section.tabIndex=-1;
  return section;
}

function motionBehavior(context) {
  return context.state.motionPaused || context.state.reducedMotion ? 'auto':'smooth';
}

function renderLensing(station, context) {
  const section=chamber(station);
  const grid=el('div','bhm-stage-grid');
  const stage=createLensingStage();
  const controls=el('div','bhm-state-controls');
  station.interaction.states.forEach((label,index)=>{
    const b=button(label,index===0?'is-active':'');
    b.setAttribute('aria-pressed',index===0?'true':'false');
    b.addEventListener('click',()=>{
      controls.querySelectorAll('button').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false')});
      b.classList.add('is-active');b.setAttribute('aria-pressed','true');
      const mode=index===0?'quiet':'bent';
      stage.draw(mode);
      stage.classList.toggle('show-paths',index===2);
    });
    controls.append(b);
  });
  const p=plaque(station);p.append(controls);
  grid.append(p,stage);section.append(grid);
  return section;
}

function renderEvidence(station, context) {
  const section=chamber(station);
  const grid=el('div','bhm-evidence-layout');
  const network=el('div','bhm-evidence-network');
  const center=el('div','bhm-evidence-center','Invisible mass');
  network.append(center);
  station.clues.forEach((clue,i)=>{
    const card=button('','bhm-clue bhm-clue-'+(i+1));
    card.setAttribute('aria-expanded','false');
    card.append(el('span','bhm-clue-symbol',clue.symbol),el('strong','',clue.title),el('span','bhm-clue-text',clue.text));
    card.addEventListener('click',()=>{
      const active=card.classList.toggle('is-open');
      card.setAttribute('aria-expanded',String(active));
    });
    network.append(card);
  });
  const reveal=button(station.interaction.label,'bhm-primary');
  reveal.addEventListener('click',()=>network.querySelectorAll('.bhm-clue').forEach(c=>{c.classList.add('is-open');c.setAttribute('aria-expanded','true')}));
  const p=plaque(station);p.append(reveal);
  grid.append(p,network);
  const a=context.assets.get('nasa-labeled-accretion');
  if(a) grid.append(mediaCard(a,context.release));
  section.append(grid);return section;
}

function renderOrbit(station, context) {
  const section=chamber(station);
  const layout=el('div','bhm-theater-layout');
  const p=plaque(station);
  const stage=el('div','bhm-orbit-stage');
  const a=context.assets.get('eso-star-orbits');
  if(a) stage.append(mediaCard(a,context.release));
  const svg=el('svg','bhm-orbit-overlay');
  svg.setAttribute('viewBox','0 0 1000 560');
  svg.innerHTML=`<ellipse cx="500" cy="280" rx="270" ry="120"/><circle cx="500" cy="280" r="9"/><circle class="bhm-orbit-star" cx="770" cy="280" r="13"/>`;
  stage.append(svg);
  const trace=button(station.interaction.label,'bhm-primary');
  trace.setAttribute('aria-pressed','false');
  trace.addEventListener('click',()=>{
    const on=stage.classList.toggle('is-traced');
    trace.setAttribute('aria-pressed',String(on));
  });
  p.append(trace);
  layout.append(p,stage);section.append(layout);return section;
}

function renderNetwork(station,context){
  const section=chamber(station);
  const layout=el('div','bhm-network-layout');
  const p=plaque(station);
  const stage=el('div','bhm-earth-stage');
  const earth=el('div','bhm-earth');
  const sites=[
    ['ALMA',25,72],['APEX',30,72],['LMT',36,42],['SMT',31,37],
    ['SMA',48,14],['JCMT',43,17],['SPT',86,50],['IRAM',24,53]
  ];
  sites.forEach(([name,top,left],i)=>{
    const b=button(name,'bhm-site');
    b.style.top=top+'%';b.style.left=left+'%';
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{b.classList.toggle('is-on');b.setAttribute('aria-pressed',String(b.classList.contains('is-on')));});
    earth.append(b);
  });
  stage.append(earth);
  const all=button(station.interaction.label,'bhm-primary');
  all.addEventListener('click',()=>earth.querySelectorAll('.bhm-site').forEach(b=>{b.classList.add('is-on');b.setAttribute('aria-pressed','true')}));
  p.append(all);
  layout.append(p,stage);
  const a=context.assets.get('eht-observatory-map'); if(a) layout.append(mediaCard(a,context.release));
  section.append(layout);return section;
}

function renderReconstruction(station,context){
  const section=chamber(station);
  const layout=el('div','bhm-reconstruction-layout');
  const p=plaque(station);
  const viewer=el('div','bhm-reconstruction-viewer');
  const states=[
    {name:'Measurements',cls:'measurements',text:'Timed radio measurements from many observatories.'},
    {name:'Possible reconstructions',cls:'possibilities',text:'Several image structures can fit the data.'},
    {name:'Published average',cls:'average',text:'A carefully evaluated average of compatible reconstructions.'}
  ];
  const visual=el('div','bhm-reconstruction-visual');
  function setState(i){
    visual.className='bhm-reconstruction-visual is-'+states[i].cls;
    visual.setAttribute('aria-label',states[i].text);
    controls.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('is-active',i===j);b.setAttribute('aria-pressed',String(i===j))});
  }
  const controls=el('div','bhm-state-controls');
  states.forEach((s,i)=>{const b=button(s.name);b.addEventListener('click',()=>setState(i));controls.append(b)});
  viewer.append(visual,controls);
  setState(0);
  const a=context.assets.get('sgr-a-reconstruction');
  layout.append(p,viewer);
  if(a) layout.append(mediaCard(a,context.release));
  section.append(layout);return section;
}

function renderRotunda(station,context){
  const section=chamber(station);
  const p=plaque(station);
  const rotunda=el('div','bhm-rotunda-stage');
  ['m87-observation','sgr-a-observation'].forEach(id=>{const a=context.assets.get(id);if(a)rotunda.append(mediaCard(a,context.release))});
  const controls=el('div','bhm-state-controls');
  station.interaction.states.forEach((s,i)=>{
    const b=button(s,i===0?'is-active':'');
    b.addEventListener('click',()=>{
      controls.querySelectorAll('button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');
      section.dataset.view=['separate','compare','context','scale'][i];
      if(i===2){const a=context.assets.get('m87-galaxy'); if(a && !rotunda.querySelector('[data-asset-id="m87-galaxy"]'))rotunda.append(mediaCard(a,context.release))}
      if(i===3){const a=context.assets.get('m87-sgr-scale'); if(a && !rotunda.querySelector('[data-asset-id="m87-sgr-scale"]'))rotunda.append(mediaCard(a,context.release))}
    });
    controls.append(b);
  });
  p.append(controls);section.append(p,rotunda,el('div','bhm-quiet-bench','A quiet place to look. Nothing moves here unless you ask it to.'));
  return section;
}

function renderLaboratory(station,context){
  const section=chamber(station);
  const layout=el('div','bhm-lab-layout');
  const p=plaque(station);
  const stage=el('div','bhm-accretion-stage');
  const visual=el('div','bhm-accretion-visual');
  visual.innerHTML=`<div class="bhm-disk bhm-disk-back"></div><div class="bhm-shadow"></div><div class="bhm-disk bhm-disk-front"></div><div class="bhm-photon-ring"></div><svg viewBox="0 0 800 500" class="bhm-photon-overlay"><path d="M40 110 C240 90 280 250 400 250 C520 250 560 410 760 390"/><path d="M40 390 C240 410 280 250 400 250 C520 250 560 90 760 110"/></svg>`;
  const controls=el('div','bhm-lab-controls');
  const range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.value='48';range.setAttribute('aria-label','Accretion-disk viewing angle');
  const output=el('output','', 'Slanted viewpoint');
  function apply(v){
    const n=Number(v);visual.style.setProperty('--angle',n+'deg');visual.dataset.angle=n<25?'above':n>75?'edge':'slanted';
    output.textContent=n<25?'Above viewpoint':n>75?'Edge-on viewpoint':'Slanted viewpoint';
  }
  range.addEventListener('input',e=>apply(e.target.value));
  controls.append(range,output);
  const presets=el('div','bhm-state-controls');
  const vals=[10,48,88];
  station.interaction.presets.forEach((label,i)=>{const b=button(label);b.addEventListener('click',()=>{range.value=vals[i];apply(vals[i])});presets.append(b)});
  const paths=button('Show photon paths');
  paths.setAttribute('aria-pressed','false');
  paths.addEventListener('click',()=>{const on=visual.classList.toggle('show-paths');paths.setAttribute('aria-pressed',String(on))});
  controls.append(presets,paths);
  stage.append(visual,controls);
  apply(48);
  layout.append(p,stage);
  const diagrams=el('div','bhm-lab-media');
  ['nasa-labeled-accretion','nasa-optics','nasa-edge-on','nasa-rotating'].forEach(id=>{const a=context.assets.get(id);if(a)diagrams.append(mediaCard(a,context.release))});
  layout.append(diagrams);section.append(layout);return section;
}

function renderAnatomy(station,context){
  const section=chamber(station);
  const layout=el('div','bhm-anatomy-layout');
  const p=plaque(station);
  const viewer=el('div','bhm-anatomy-viewer');
  const diagram=el('div','bhm-anatomy-diagram');
  diagram.innerHTML='<i class="layer emission"></i><i class="layer shadow"></i><i class="layer photon"></i><i class="layer horizon"></i>';
  const controls=el('div','bhm-anatomy-controls');
  station.layers.forEach((layer,i)=>{
    const b=button(layer.title);
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{
      diagram.dataset.layer=layer.id;
      controls.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));
      b.setAttribute('aria-pressed','true');
      desc.textContent=layer.text;
    });
    controls.append(b);
  });
  const desc=el('p','bhm-anatomy-description','Select a layer to inspect the model.');
  viewer.append(diagram,controls,desc);
  const myths=el('div','bhm-myth-wall');
  station.myths.forEach(item=>{
    const d=el('details','bhm-myth');
    d.append(el('summary','',item.claim),el('p','',item.knowledge));myths.append(d);
  });
  layout.append(p,viewer,myths);section.append(layout);return section;
}

function renderBoundary(station,context){
  const section=chamber(station);
  const p=plaque(station);
  const threshold=el('div','bhm-boundary-stage');
  const columns=el('div','bhm-known-unknown');
  const known=el('div','bhm-known');known.append(el('h3','','What scientists can investigate'));
  station.known.forEach(x=>known.append(el('p','',x)));
  const unknown=el('div','bhm-unknown');unknown.append(el('h3','','Questions still open'));
  station.unknown.forEach(x=>unknown.append(el('p','',x)));
  columns.append(known,el('div','bhm-boundary-line'),unknown);
  threshold.append(columns,el('blockquote','bhm-boundary-quote',station.child));
  const pullback=el('div','bhm-pullback');
  ['m87-observation','m87-galaxy','alma-antennas'].forEach(id=>{const a=context.assets.get(id);if(a)pullback.append(mediaCard(a,context.release))});
  section.append(p,threshold,pullback,el('p','bhm-closing-line',context.content.page.closingLine));
  return section;
}

function renderGeneric(station,context){
  const section=chamber(station);section.append(plaque(station));return section;
}

function renderStation(station,context){
  try{
    const map={threshold:renderThreshold,lensing:renderLensing,evidence:renderEvidence,orbit:renderOrbit,network:renderNetwork,reconstruction:renderReconstruction,rotunda:renderRotunda,laboratory:renderLaboratory,anatomy:renderAnatomy,boundary:renderBoundary};
    return (map[station.type]||renderGeneric)(station,context);
  }catch(error){
    console.error('[BHM] Station failed',station.id,error);
    const section=chamber(station);
    section.classList.add('bhm-station-failed');
    section.append(plaque(station),el('p','bhm-local-error','This exhibit’s enhanced display is unavailable. Its explanation remains readable.'));
    return section;
  }
}

function buildCredits(context){
  const section=el('section','bhm-credits');
  section.id='black-hole-credits';
  section.append(el('p','bhm-kicker','Media ledger'),el('h2','','Scientific media and credits'),el('p','',context.content.creditsIntro));
  const list=el('div','bhm-credit-list');
  context.assets.forEach(asset=>{
    const item=el('article','bhm-credit-item');
    item.append(el('h3','',asset.title),evidenceBadge(asset.classification),el('p','',asset.credit+' · '+asset.license));
    const a=document.createElement('a');a.href=asset.sourcePage;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open authoritative source';
    item.append(a);list.append(item);
  });
  section.append(list);return section;
}

function buildControls(context){
  const dock=el('aside','bhm-control-dock');
  dock.setAttribute('aria-label','Museum controls');
  const motion=button('Pause museum motion');
  motion.setAttribute('aria-pressed','false');
  motion.addEventListener('click',()=>{
    context.state.motionPaused=!context.state.motionPaused;
    context.shell.dataset.motion=context.state.motionPaused?'paused':'running';
    motion.textContent=context.state.motionPaused?'Resume museum motion':'Pause museum motion';
    motion.setAttribute('aria-pressed',String(context.state.motionPaused));
    context.shell.querySelectorAll('video').forEach(v=>{if(context.state.motionPaused)v.pause()});
  });
  const data=button('Use essential-content mode');
  data.setAttribute('aria-pressed','false');
  data.addEventListener('click',()=>{
    context.state.reducedData=!context.state.reducedData;
    context.shell.dataset.dataMode=context.state.reducedData?'essential':'standard';
    data.textContent=context.state.reducedData?'Use standard media mode':'Use essential-content mode';
    data.setAttribute('aria-pressed',String(context.state.reducedData));
  });
  const nav=document.createElement('select');
  nav.setAttribute('aria-label','Jump to exhibit station');
  nav.append(new Option('Jump to an exhibit',''));
  context.content.stations.forEach(s=>nav.append(new Option(s.number+' · '+s.title,s.id)));
  nav.addEventListener('change',()=>{document.getElementById(nav.value)?.scrollIntoView({behavior:motionBehavior(context)});nav.value=''});
  dock.append(motion,data,nav);
  if(context.experience.labControls?.profileSelector){
    const select=document.createElement('select');select.setAttribute('aria-label','Laboratory magic profile');
    Object.entries(context.experience.profiles).forEach(([id,p])=>select.append(new Option(id+' · '+p.name,id)));
    select.value=context.experience.defaultProfile;
    select.addEventListener('change',()=>{context.shell.dataset.magic=select.value;context.state.profile=select.value});
    dock.append(select);
  }
  return dock;
}

function buildDiagnostics(context){
  const details=el('details','bhm-diagnostics');
  const summary=el('summary','','Repository laboratory diagnostics');
  const dl=el('dl');
  const fields=[
    ['Page system','black-hole-museum'],
    ['Release',context.release.release],
    ['Commit',context.release.commit],
    ['Content version',context.content.contentVersion],
    ['Motion',context.state.reducedMotion?'system reduced':'standard'],
    ['Asset acquisition',context.assetManifest.retrievalStatus || 'unknown'],
    ['Renderer',APP_VERSION]
  ];
  fields.forEach(([k,v])=>{const row=el('div');row.append(el('dt','',k),el('dd','',v));dl.append(row)});
  details.append(summary,dl);return details;
}

function installWayfinding(context){
  if(!('IntersectionObserver'in window))return;
  const links=[...context.shell.querySelectorAll('.bhm-wayfinding a')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        links.forEach(a=>{const active=a.getAttribute('href')==='#'+entry.target.id;a.classList.toggle('is-active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});
        entry.target.classList.add('is-seen');
      }
    });
  },{rootMargin:'-35% 0px -50% 0px',threshold:.05});
  context.shell.querySelectorAll('.bhm-chamber').forEach(s=>observer.observe(s));
  context.cleanups.push(()=>observer.disconnect());
}

function installPointerDepth(context){
  if(context.state.reducedMotion)return;
  const handler=e=>{
    if(context.state.motionPaused)return;
    const x=(e.clientX/window.innerWidth-.5).toFixed(3);
    const y=(e.clientY/window.innerHeight-.5).toFixed(3);
    context.shell.style.setProperty('--pointer-x',x);
    context.shell.style.setProperty('--pointer-y',y);
  };
  window.addEventListener('pointermove',handler,{passive:true});
  context.cleanups.push(()=>window.removeEventListener('pointermove',handler));
}

export async function mountBlackHoleMuseum({mount,release,content,assets,experience}) {
  if(!mount) throw new Error('Mount is required.');
  if(content.schemaVersion!=='1.0'||!Array.isArray(content.stations)||content.stations.length!==10) throw new Error('Invalid black-hole content manifest.');
  if(assets.schemaVersion!=='1.0'||!Array.isArray(assets.assets)) throw new Error('Invalid asset manifest.');
  if(experience.schemaVersion!=='1.0') throw new Error('Invalid experience manifest.');

  const context={
    mount,release,content,assetManifest:assets,experience,
    assets:assetMap(assets),
    cleanups:[],
    state:{
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      reducedData:Boolean(navigator.connection?.saveData),
      motionPaused:false,
      profile:experience.defaultProfile
    }
  };

  const fragment=document.createDocumentFragment();
  const shell=el('div','bhm-museum');
  shell.dataset.magic=experience.defaultProfile;
  shell.dataset.motion=context.state.reducedMotion?'still':'running';
  shell.dataset.dataMode=context.state.reducedData?'essential':'standard';
  context.shell=shell;

  const skip=document.createElement('a');skip.className='bhm-skip';skip.href='#classroom-threshold';skip.textContent='Skip to the museum';
  const header=el('header','bhm-museum-header');
  header.append(el('p','bhm-eyebrow',content.page.eyebrow),el('h1','',content.page.title),el('p','bhm-supporting-line',content.page.supportingLine));
  const way=el('nav','bhm-wayfinding');way.setAttribute('aria-label','Black Hole Museum exhibits');
  content.stations.forEach(s=>{const a=document.createElement('a');a.href='#'+s.id;a.textContent=s.number;a.title=s.title;way.append(a)});
  const main=el('main','bhm-main');main.id='bhm-main';
  content.stations.forEach(station=>main.append(renderStation(station,context)));
  main.append(buildCredits(context));
  const footer=el('footer','bhm-footer');
  footer.append(el('p','',content.page.prototypeWarning),buildDiagnostics(context),el('p','bhm-build-marker','Release '+release.release+' · '+release.commit.slice(0,12)));
  shell.append(skip,header,way,buildControls(context),main,footer);
  fragment.append(shell);

  mount.replaceChildren(fragment);
  mount.classList.remove('hrv-native-fallback');
  mount.classList.add('bhm-mounted');
  installWayfinding(context);
  installPointerDepth(context);

  mount.__bhmDestroy=()=>{
    context.cleanups.splice(0).forEach(fn=>{try{fn()}catch{}});
    mount.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load()});
  };
}