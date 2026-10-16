(function(){
/* ===== Selos dos cards: edite aqui (codigo: tipo). Tipos: novo, lancamento, mais ===== */
const SELOS={'CAN-020':'lancamento','CAN-055':'novo','CAN-056':'novo','CAN-057':'novo','CAN-058':'novo','CAN-059':'novo','CAN-060':'novo','AZU-008':'novo','ECO-001':'novo','ECO-002':'novo','CAM-001':'novo','TOA-002':'novo'};
const NOMES={novo:'Novo',lancamento:'Lançamento',mais:'Mais pedido'};
const cards=[...document.querySelectorAll('.card')],grid=document.getElementById('grid');
cards.forEach(c=>{const t=SELOS[c.dataset.code];const ph=c.querySelector('.photo-btn');if(!t||!ph)return;
  const r=document.createElement('span');r.className='ribbon '+t;r.textContent=NOMES[t];ph.appendChild(r)});

/* ===== Data de hoje (?data=2026-12-05 na URL para testar) ===== */
let hoje=new Date();try{const q=new URLSearchParams(location.search).get('data');if(q)hoje=new Date(q+'T12:00:00')}catch(e){}
hoje.setHours(12,0,0,0);
const ano=hoje.getFullYear();
const domingo=(a,m,n)=>{const d=new Date(a,m,1,12);let c=0;while(true){if(d.getDay()===0&&++c===n)return d;d.setDate(d.getDate()+1)}};
const datas=a=>[
  {nome:'Dia das Mães',d:domingo(a,4,2),filtro:'Datas & presentes',emoji:'💐'},
  {nome:'Dia dos Namorados',d:new Date(a,5,12,12),filtro:'Datas & presentes',emoji:'❤️'},
  {nome:'Dia dos Pais',d:domingo(a,7,2),filtro:'Datas & presentes',emoji:'👔'},
  {nome:'Dia das Crianças',d:new Date(a,9,12,12),filtro:'Datas & presentes',emoji:'🧸'},
  {nome:'Dia dos Professores',d:new Date(a,9,15,12),filtro:'Profissões',emoji:'🍎'},
  {nome:'Natal',d:new Date(a,11,25,12),filtro:'Coleção Natal',emoji:'🎄'}];
const prox=[...datas(ano),...datas(ano+1)].map(x=>Object.assign(x,{dias:Math.round((x.d-hoje)/864e5)})).filter(x=>x.dias>=0).sort((a,b)=>a.dias-b.dias)[0];
const natal=hoje.getMonth()===11&&hoje.getDate()<=25||hoje.getMonth()===10&&hoje.getDate()>=15;
const irPara=f=>{const b=[...document.querySelectorAll('.filter')].find(x=>x.dataset.filter===f);if(b){b.click();document.getElementById('grid').scrollIntoView({behavior:'smooth',block:'start'})}};
const ban=document.getElementById('dateBanner');
if(prox&&ban&&prox.dias<=75){
  const txt=prox.dias===0?'Hoje é '+prox.nome+'!':prox.dias===1?'Amanhã é '+prox.nome+'!':'Faltam '+prox.dias+' dias para o '+prox.nome;
  ban.innerHTML='<div><strong></strong><small></small></div><button type="button"></button>';
  ban.querySelector('strong').textContent=prox.emoji+' '+txt;
  ban.querySelector('small').textContent=prox.dias<=1?'Ainda dá tempo de surpreender: fale com a gente.':'Peça com antecedência e garanta seu presente personalizado a tempo.';
  ban.querySelector('button').textContent='Ver presentes';ban.querySelector('button').onclick=()=>irPara(prox.filtro);ban.style.display='flex'}

/* ===== Visual de Natal (15/11 a 25/12): Coleção Natal vai para o topo ===== */
if(natal){document.body.classList.add('natal');
  cards.filter(c=>c.dataset.cat==='Coleção Natal'||/natal/i.test(c.dataset.title)).reverse().forEach(c=>grid.prepend(c));
  const fb=[...document.querySelectorAll('.filter')].find(x=>x.dataset.filter==='Coleção Natal');if(fb)fb.parentNode.insertBefore(fb,fb.parentNode.children[1]);}

/* ===== Destaques em bolinhas ===== */
const st=document.getElementById('stories');
const CURTO={'Torcedores & esportes':'Esportes','Coleções & Campanhas':'Campanhas','Datas & presentes':'Datas','Coleção Espiritismo':'Espiritismo','Coleção Natal':'Natal','Personalizadas':'Personalizadas'};
const EMO={'Coleção Natal':'🎄','Coleção Espiritismo':'🕊️','Religiosas':'🙏','Torcedores & esportes':'⚽','Presentes':'🎁','Azulejos':'🖼️'};
[...document.querySelectorAll('.filter')].forEach(b=>{const f=b.dataset.filter;if(f==='Todos')return;
  const c=[...document.querySelectorAll('.card')].find(x=>x.dataset.cat===f);const im=c&&c.querySelector('.photo-btn img');
  const s=document.createElement('button');s.type='button';s.className='story';s.dataset.filter=f;
  s.innerHTML='<span class="story-ring"></span><span class="story-label"></span>';
  if(im){const i=document.createElement('img');i.alt='';i.loading='lazy';i.src=im.src;s.firstChild.appendChild(i)}
  else{const e=document.createElement('span');e.className='story-emoji';e.textContent=EMO[f]||'✨';s.firstChild.appendChild(e)}
  s.querySelector('.story-label').textContent=CURTO[f]||f;s.onclick=()=>irPara(f);st.appendChild(s)});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{st.querySelectorAll('.story').forEach(x=>x.classList.toggle('on',x.dataset.filter===b.dataset.filter))}));

/* ===== Ver grande ===== */
const vt=document.getElementById('viewToggle');
const setBig=on=>{grid.classList.toggle('big',on);vt.classList.toggle('on',on);vt.setAttribute('aria-pressed',on);vt.textContent=on?'⊟ Ver menor':'⊞ Ver grande';try{localStorage.setItem('sublimae_big',on?'1':'')}catch(e){}};
vt.onclick=()=>setBig(!grid.classList.contains('big'));
try{if(localStorage.getItem('sublimae_big'))setBig(true)}catch(e){}
})();
