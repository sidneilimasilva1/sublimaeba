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
