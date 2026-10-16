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
