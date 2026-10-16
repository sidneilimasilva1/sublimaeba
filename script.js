(function(){let carregando=null;function igjs(){if(window.instgrm)return Promise.resolve();if(carregando)return carregando;carregando=new Promise((ok,erro)=>{const sc=document.createElement("script");sc.async=true;sc.src="https://www.instagram.com/embed.js";sc.onload=ok;sc.onerror=erro;document.body.appendChild(sc)});return carregando}document.querySelectorAll(".ig-item").forEach(it=>{const a=it.querySelector(".ig-fallback");a.addEventListener("click",e=>{if(navigator.onLine===false)return;e.preventDefault();a.querySelector(".ig-cta").textContent="Carregando…";igjs().then(()=>{const bq=document.createElement("blockquote");bq.className="instagram-media";bq.setAttribute("data-instgrm-permalink",it.dataset.url+"?utm_source=ig_embed");bq.setAttribute("data-instgrm-version","14");a.replaceWith(bq);window.instgrm.Embeds.process()}).catch(()=>{location.href=it.dataset.url})})})})();

/* WhatsApp:
   Para abrir diretamente o número da loja, preencha WHATSAPP_NUMBER
   com DDI + DDD + número, somente dígitos. Ex.: 5571999999999 */
const WHATSAPP_NUMBER = "557199593595";

function whatsappUrl(product, code, price){
  const priceText = (price === 'consulte' || price === '' || price == null)
    ? 'sob consulta'
    : `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  const msg = `Olá, Sublimaê! Quero pedir a ${product} (${code}). Vi no catálogo com valor ${priceText}. Gostaria de confirmar disponibilidade, tamanho, personalização e valor final.`;
  const encoded = encodeURIComponent(msg);
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
document.querySelectorAll('.btn-whatsapp').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.href = whatsappUrl(btn.dataset.product, btn.dataset.code, btn.dataset.price);
  });
});

const buttons=[...document.querySelectorAll('.filter')],cards=[...document.querySelectorAll('.card')],search=document.getElementById('search'),empty=document.getElementById('empty');let active='Todos';
function applyFilter(){const q=search.value.trim().toLowerCase();let shown=0;cards.forEach(card=>{const okCat=active==='Todos'||card.dataset.cat===active;const okText=!q||(card.dataset.title.toLowerCase().includes(q)||card.dataset.code.toLowerCase().includes(q)||card.dataset.cat.toLowerCase().includes(q));const show=okCat&&okText;card.style.display=show?'':'none';if(show)shown++});
empty.style.display=shown?'none':'block';if(shown)return;
const t=document.getElementById('emptyTitle'),p=document.getElementById('emptyText'),b=document.getElementById('emptyBtn');let msg;
if(q){t.textContent='Não encontramos "'+search.value.trim()+'"';p.textContent='Mas a gente personaliza quase tudo! Conte o que você procura que fazemos sob encomenda.';msg='Olá, Sublimaê! Procurei por "'+search.value.trim()+'" no catálogo e não encontrei. Vocês fazem?'}
else{t.textContent='Fazemos sob encomenda!';p.textContent='Ainda não temos fotos de '+active+' no catálogo, mas produzimos do seu jeito. Peça o seu pelo WhatsApp.';msg='Olá, Sublimaê! Tenho interesse em '+active+'. Gostaria de fazer um pedido sob encomenda.'}
b.href='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg)}
const totalRefs=document.getElementById('totalRefs');if(totalRefs)totalRefs.textContent=cards.length;
buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.filter;applyFilter()}));search.addEventListener('input',applyFilter);
function openLightbox(btn){const img=btn.querySelector('img'),modal=document.getElementById('modal'),modalImg=document.getElementById('modalImg');modalImg.src=img.src;modalImg.alt=img.alt;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeLightbox(){const modal=document.getElementById('modal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});

(function(){
const KEY='sublimae_pedido';let cart=[];
try{cart=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){cart=[]}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){try{localStorage.setItem(KEY,JSON.stringify(cart.map(i=>i.custom?Object.assign({},i,{custom:Object.assign({},i.custom,{preview:null})}):i)))}catch(e2){}}};
const brl=n=>'R$ '+n.toFixed(2).replace('.',',');
const $=id=>document.getElementById(id);
const fab=$('cartFab'),panel=$('cart'),overlay=$('cartOverlay'),list=$('cartItems');
const info={};
document.querySelectorAll('.card').forEach(card=>{
  const wa=card.querySelector('.btn-whatsapp');if(!wa)return;
  const code=wa.dataset.code||card.dataset.code;
  const priceEl=card.querySelector('.price');
  const n=parseFloat(wa.dataset.price);
  info[code]={code,name:wa.dataset.product||card.dataset.title,price:isNaN(n)?null:n,
    label:priceEl?priceEl.textContent.trim():'',img:(card.querySelector('.photo-btn img')||{}).src||''};
  const box=document.createElement('div');box.className='card-actions';
  wa.parentNode.insertBefore(box,wa);
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.dataset.code=code;
  add.addEventListener('click',()=>{addItem(code)});
  box.appendChild(add);box.appendChild(wa);
});
const P=i=>i.custom||info[i.code];
function addItem(code){const it=cart.find(i=>i.code===code);if(it)it.qty++;else cart.push({code,qty:1});save();render();fab.classList.remove('bump');void fab.offsetWidth;fab.classList.add('bump')}
function setQty(code,q){if(q<1)cart=cart.filter(i=>i.code!==code);else cart.find(i=>i.code===code).qty=q;save();render()}
function render(){
  cart=cart.filter(i=>P(i));
  const count=cart.reduce((a,i)=>a+i.qty,0);
  $('cartCount').textContent=count;fab.classList.toggle('show',count>0);
  document.querySelectorAll('.btn-add').forEach(b=>{const it=cart.find(i=>i.code===b.dataset.code);
    b.classList.toggle('added',!!it);b.textContent=it?'✓ No pedido ('+it.qty+')':'🛒 Adicionar ao pedido'});
  if(!cart.length){list.innerHTML='<p class="cart-empty">Seu pedido está vazio.<br/>Toque em “Adicionar ao pedido” nos produtos que quiser.</p>'}
  else{list.innerHTML='';cart.forEach(i=>{const p=P(i);const el=document.createElement('div');el.className='cart-item';
    el.innerHTML='<img alt=""/><div><strong></strong><small></small><div class="ci-price"></div><div class="ci-row"><div class="qty"><button type="button" aria-label="Diminuir">−</button><span></span><button type="button" aria-label="Aumentar">+</button></div><button class="ci-remove" type="button">Remover</button></div></div>';
    el.querySelector('img').src=p.img;el.querySelector('strong').textContent=p.name;el.querySelector('small').textContent=p.custom?'Montada por você':p.code;
    el.querySelector('.ci-price').textContent=p.label||'Sob consulta';el.querySelector('.qty span').textContent=i.qty;
    const [minus,plus]=el.querySelectorAll('.qty button');minus.onclick=()=>setQty(i.code,i.qty-1);plus.onclick=()=>setQty(i.code,i.qty+1);
    el.querySelector('.ci-remove').onclick=()=>setQty(i.code,0);
    if(p.details){const d=document.createElement('small');d.className='ci-details';d.textContent=p.details;el.querySelector('small').after(d)}
    if(p.preview){const a=document.createElement('button');a.type='button';a.className='ci-preview';a.textContent='📲 Salvar prévia';a.onclick=()=>window.sublimaeSharePreview&&window.sublimaeSharePreview(p.preview);el.querySelector('.ci-row').before(a)}
    list.appendChild(el)})}
  const priced=cart.filter(i=>P(i).price!=null),consult=cart.length-priced.length;
  $('cartTotal').textContent=brl(priced.reduce((a,i)=>a+P(i).price*i.qty,0));
  $('cartNote').textContent=(consult?'Itens sob consulta não entram no total. ':'')+'Valores de referência. O valor final é confirmado pelo WhatsApp conforme tamanho, arte e quantidade.';
  $('cartSend').disabled=!cart.length;
}
function open(){panel.classList.add('open');overlay.classList.add('open');panel.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function close(){panel.classList.remove('open');overlay.classList.remove('open');panel.setAttribute('aria-hidden','true');document.body.style.overflow=''}
fab.onclick=open;$('cartClose').onclick=close;overlay.onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
$('cartClear').onclick=()=>{if(confirm('Esvaziar o pedido?')){cart=[];save();render()}};
$('cartSend').onclick=()=>{if(!cart.length)return;
  const name=$('cartName').value.trim();
  let msg='Olá, Sublimaê!'+(name?' Aqui é '+name+'.':'')+' Quero fazer este pedido pelo catálogo:\n\n';
  cart.forEach(i=>{const p=P(i);msg+='• '+i.qty+'x '+p.name+(p.custom?'':' ('+p.code+')')+' - '+(p.price!=null?(p.label||brl(p.price)):'sob consulta')+(p.details?'\n   '+p.details:'')+'\n'});
  if(cart.some(i=>i.custom))msg+='\n📸 Montei a caneca no catálogo e vou enviar a prévia aqui em seguida.\n';
  msg+='\nTotal estimado: '+$('cartTotal').textContent+'\nGostaria de confirmar disponibilidade, personalização, prazo e valor final.';
  window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener')};
window.sublimaeCart={add(item){cart.push({code:item.code,qty:1,custom:Object.assign({custom:true},item)});save();render();fab.classList.remove('bump');void fab.offsetWidth;fab.classList.add('bump')},open:open};
render();
})();

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
