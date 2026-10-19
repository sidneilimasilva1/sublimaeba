/* Sublimaê: cadastro do cliente + painel de admin.
   Os produtos novos/editados ficam em produtos.json e as fotos em fotos/, gravados no GitHub
   pela chave do dono (guardada em admin.json, cifrada com a senha do admin).
   Este arquivo aplica essas mudanças nos cards e só depois carrega o script.js do catálogo. */
(function(){
const API='https://api.github.com';
const NOMES_SELO={novo:'Novo',lancamento:'Lançamento',mais:'Mais pedido'};
const store=s=>({get(k){try{return JSON.parse(s.getItem(k))}catch(e){return null}},set(k,v){try{s.setItem(k,JSON.stringify(v));return true}catch(e){return false}},del(k){try{s.removeItem(k)}catch(e){}}});
const LS=store(window.localStorage),SS=store(window.sessionStorage);
const $=id=>document.getElementById(id);
const brl=n=>'R$ '+Number(n).toFixed(2).replace('.',',');
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const normal=d=>({atualizado:d&&d.atualizado||0,categorias:d&&d.categorias||[],produtos:d&&d.produtos||{},removidos:d&&d.removidos||[]});
let dados=normal(null),sess=SS.get('sublimae_admin');

/* ---------- fotos recém-enviadas (o site leva ~1 min para publicar) ---------- */
const tmpFotos=()=>{const t=LS.get('sublimae_fotos_tmp')||{},agora=Date.now();Object.keys(t).forEach(k=>{if(agora-t[k].t>72e5)delete t[k]});return t};
const fotoSrc=f=>{const t=tmpFotos()[f];return t?t.d:f};
function guardarFotoTmp(path,d){const t=tmpFotos();t[path]={d,t:Date.now()};if(!LS.set('sublimae_fotos_tmp',t))LS.set('sublimae_fotos_tmp',{[path]:{d,t:Date.now()}})}

/* ---------- cards ---------- */
function precoTela(p){return p.precoTexto||(p.preco==='consulte'||p.preco===''||p.preco==null?'Sob consulta':brl(p.preco))}
function novoCard(code){
  const a=el('article','card');a.dataset.code=code;
  a.innerHTML='<button class="photo-btn" onclick="openLightbox(this)" type="button"><img loading="lazy" alt=""/><span class="zoom">+</span></button><div class="card-body"><span class="badge"></span><h3></h3><div class="product-meta"><span class="product-code"></span><strong class="price"></strong></div><p class="product-desc"></p><a class="btn-whatsapp" href="#" rel="noopener" target="_blank">💬 Pedir pelo WhatsApp</a></div>';
  return a}
function preencher(card,code,p){
  const q=s=>card.querySelector(s),wa=q('.btn-whatsapp');
  if(p.titulo!=null){card.dataset.title=p.titulo;q('h3').textContent=p.titulo;wa.dataset.product=p.titulo;q('.photo-btn').setAttribute('aria-label','Ampliar '+p.titulo);q('.photo-btn img').alt=p.titulo+' — '+code}
  if(p.cat!=null){card.dataset.cat=p.cat;q('.badge').textContent=p.cat}
  if(p.preco!=null){const v=p.preco==='consulte'?'consulte':String(p.preco);card.dataset.price=v;wa.dataset.price=v;q('.price').textContent=precoTela(p)}
  if(p.desc!=null)q('.product-desc').textContent=p.desc;
  if(p.foto)q('.photo-btn img').src=fotoSrc(p.foto);
  q('.product-code').textContent=code;wa.dataset.code=code;card.dataset.code=code}
const cardDe=code=>[...document.querySelectorAll('#grid .card')].find(c=>c.dataset.code===code);
function aplicar(){
  const filtros=document.querySelector('.filters');
  dados.categorias.forEach(c=>{if(filtros&&![...filtros.children].some(b=>b.dataset.filter===c)){const b=el('button','filter',c);b.dataset.filter=c;filtros.appendChild(b)}});
  dados.removidos.forEach(c=>{const k=cardDe(c);if(k)k.remove()});
  const grid=$('grid');
  Object.keys(dados.produtos).sort((a,b)=>(dados.produtos[a].criado||0)-(dados.produtos[b].criado||0)).forEach(code=>{
    let k=cardDe(code);if(!k){k=novoCard(code);grid.prepend(k)}preencher(k,code,dados.produtos[code])})}
function ajustarSelos(){Object.keys(dados.produtos).forEach(code=>{const p=dados.produtos[code],k=cardDe(code);if(!k||!('selo' in p))return;
  k.querySelectorAll('.ribbon').forEach(r=>r.remove());if(p.selo){const r=el('span','ribbon '+p.selo,NOMES_SELO[p.selo]);k.querySelector('.photo-btn').appendChild(r)}})}

/* ---------- início ---------- */
async function lerSite(nome){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),4000);
  const r=await fetch(nome+'?v='+Date.now(),{cache:'no-store',signal:c.signal});clearTimeout(t);if(r.ok)return await r.json()}catch(e){}return null}
async function iniciar(){
  const remoto=await lerSite('produtos.json'),pend=LS.get('sublimae_pendente');
  if(pend&&(!remoto||(remoto.atualizado||0)<pend.atualizado))dados=normal(pend);
  else{if(pend)LS.del('sublimae_pendente');if(remoto)dados=normal(remoto)}
  try{aplicar()}catch(e){console.error(e)}
  const s=document.createElement('script');s.src='script.js';s.onload=s.onerror=depois;document.body.appendChild(s)}
function depois(){
  try{ajustarSelos()}catch(e){}
  montarConta();
  if(sess)entrarAdmin();
  const t=SS.get('sublimae_toast');if(t){SS.del('sublimae_toast');aviso(t)}
  const y=SS.get('sublimae_scroll');if(y!=null){SS.del('sublimae_scroll');setTimeout(()=>scrollTo(0,y),60)}}

/* ---------- janelas ---------- */
let caixa;
function janela(titulo){fechar();const o=el('div','pm-overlay');caixa=el('div','pm-box');const x=el('button','pm-x','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;
  caixa.append(x,el('h2',null,titulo));o.appendChild(caixa);o.addEventListener('click',e=>{if(e.target===o)fechar()});document.body.appendChild(o);document.body.style.overflow='hidden';return caixa}
function fechar(){const o=document.querySelector('.pm-overlay');if(o){o.remove();document.body.style.overflow=''}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')fechar()});
function campo(rotulo,tipo,valor,extra){const l=el('label','pm-field');l.appendChild(el('span',null,rotulo));
  const i=tipo==='textarea'?el('textarea'):el('input');if(tipo!=='textarea')i.type=tipo||'text';if(valor!=null)i.value=valor;Object.assign(i,extra||{});l.appendChild(i);caixa.appendChild(l);return i}
function botao(txt,cls,fn){const b=el('button','pm-btn '+(cls||''),txt);b.type='button';b.onclick=fn;caixa.appendChild(b);return b}
function msg(){let m=caixa.querySelector('.pm-msg');if(!m){m=el('p','pm-msg');caixa.appendChild(m)}return m}
const falha=t=>{const m=msg();m.className='pm-msg erro';m.textContent=t};
const info=t=>{const m=msg();m.className='pm-msg';m.textContent=t};
function aviso(t){document.querySelectorAll('.pm-toast').forEach(x=>x.remove());const a=el('div','pm-toast',t);document.body.appendChild(a);setTimeout(()=>a.classList.add('show'),20);setTimeout(()=>{a.classList.remove('show');setTimeout(()=>a.remove(),400)},5200)}

/* ---------- conta do cliente ---------- */
function montarConta(){
  const hero=document.querySelector('.hero');if(!hero||$('userBtn'))return;
  const b=el('button','user-btn');b.id='userBtn';b.type='button';b.setAttribute('aria-label','Minha conta');b.onclick=()=>sess?painelAdmin():telaCliente();hero.appendChild(b);
  atualizarConta()}
function atualizarConta(){const c=LS.get('sublimae_cliente'),b=$('userBtn');if(!b)return;
  b.innerHTML='';if(sess){b.textContent='⚙️';b.classList.add('on')}else if(c&&c.nome){b.textContent=c.nome.trim()[0].toUpperCase();b.classList.add('on')}
  else{b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/></svg>';b.classList.remove('on')}
  const n=$('cartName');if(n&&c&&c.nome&&!n.value)n.value=c.nome}
function telaCliente(){
  const c=LS.get('sublimae_cliente')||{};
  janela(c.nome?'Olá, '+c.nome.split(' ')[0]+'!':'Seu cadastro');
  caixa.appendChild(el('p','pm-sub','Seu nome já vai junto no pedido pelo WhatsApp. Fica salvo só neste celular.'));
  const nome=campo('Seu nome','text',c.nome||'',{autocomplete:'name',placeholder:'Ex.: Ana Souza'});
  const zap=campo('WhatsApp (opcional)','tel',c.zap||'',{autocomplete:'tel',placeholder:'(71) 9 9999-9999'});
  botao('Salvar','primary',()=>{const v=nome.value.trim();if(!v){falha('Digite seu nome.');return}
    LS.set('sublimae_cliente',{nome:v,zap:zap.value.trim()});const n=$('cartName');if(n)n.value=v;atualizarConta();fechar();aviso('Pronto, '+v.split(' ')[0]+'! Seu nome vai junto nos pedidos.')});
  if(c.nome)botao('Apagar meu cadastro','link',()=>{LS.del('sublimae_cliente');const n=$('cartName');if(n)n.value='';atualizarConta();fechar()});
  caixa.appendChild(el('hr'));botao('🔒 Área do admin','link',telaLogin)}

/* ---------- cifra da chave ---------- */
const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s)};
const deb64=s=>Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0));
const txt64=s=>b64(new TextEncoder().encode(s));
async function chaveDe(senha,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(senha),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function cifrar(token,senha){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await chaveDe(senha,salt),new TextEncoder().encode(token));return {salt:b64(salt),iv:b64(iv),chave:b64(ct)}}
async function decifrar(c,senha){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:deb64(c.iv)},await chaveDe(senha,deb64(c.salt)),deb64(c.chave));return new TextDecoder().decode(pt)}

/* ---------- GitHub ---------- */
async function gh(caminho,opt,token){const r=await fetch(API+caminho,Object.assign({},opt,{headers:{Authorization:'Bearer '+(token||sess.token),Accept:'application/vnd.github+json'}}));
  if(r.status===401)throw new Error('A chave do GitHub venceu ou foi apagada. Crie uma nova e troque em ⚙️ Configurações.');return r}
async function erroGh(r){let m='';try{m=(await r.json()).message||''}catch(e){}
  if(r.status===403||r.status===404)return new Error('A chave não tem permissão para gravar neste repositório ('+r.status+(m?': '+m:'')+').');
  return new Error('O GitHub recusou ('+r.status+(m?': '+m:'')+'). Tente de novo.')}
const rota=p=>'/repos/'+sess.repo+'/contents/'+p.split('/').map(encodeURIComponent).join('/');
async function lerArquivo(p,cred){const s=cred||sess,r=await gh('/repos/'+s.repo+'/contents/'+p+'?ref='+encodeURIComponent(s.branch)+'&v='+Date.now(),{cache:'no-store'},s.token);
  if(r.status===404)return null;if(!r.ok)throw await erroGh(r);const j=await r.json();return {sha:j.sha,texto:j.content?new TextDecoder().decode(deb64(j.content)):''}}
async function gravar(p,conteudo64,mensagem,sha,cred){const s=cred||sess,body={message:mensagem,content:conteudo64,branch:s.branch};if(sha)body.sha=sha;
  const r=await gh('/repos/'+s.repo+'/contents/'+p,{method:'PUT',body:JSON.stringify(body)},s.token);if(!r.ok){const e=await erroGh(r);e.status=r.status;throw e}return r.json()}
async function apagarArquivo(p){try{const a=await lerArquivo(p);if(!a)return;await gh(rota(p),{method:'DELETE',body:JSON.stringify({message:'Remove '+p,sha:a.sha,branch:sess.branch})})}catch(e){}}
async function mudarDados(mensagem,mudar){
  for(let tentativa=0;tentativa<3;tentativa++){
    const atual=await lerArquivo('produtos.json');const d=normal(atual&&atual.texto?JSON.parse(atual.texto):null);
    mudar(d);d.atualizado=Date.now();
    try{await gravar('produtos.json',txt64(JSON.stringify(d,null,1)),mensagem,atual&&atual.sha);LS.set('sublimae_pendente',d);dados=d;return}
    catch(e){if(e.status!==409&&e.status!==422||tentativa===2)throw e}}}
function recarregar(t){SS.set('sublimae_toast',t);SS.set('sublimae_scroll',scrollY);location.reload()}

/* ---------- login / primeira configuração ---------- */
const semCripto=()=>!(window.crypto&&crypto.subtle);
async function lerConfig(){return await lerSite('admin.json')||LS.get('sublimae_admin_cfg')}
async function telaLogin(){
  janela('Área do admin');
  if(semCripto()){caixa.appendChild(el('p','pm-sub','Abra o catálogo pelo link do site (https) para usar a área do admin.'));return}
  const u=campo('Usuário','text','',{autocomplete:'username'}),s=campo('Senha','password','',{autocomplete:'current-password'});
  const b=botao('Entrar','primary',async()=>{b.disabled=true;info('Entrando…');
    try{const c=await lerConfig();if(!c){fechar();telaConfigurar();return}
      if(u.value.trim().toLowerCase()!==String(c.usuario).toLowerCase())throw 0;
      let token;try{token=await decifrar(c,s.value)}catch(e){throw 0}
      sess={token,repo:c.repo,branch:c.branch||'main',usuario:c.usuario};SS.set('sublimae_admin',sess);fechar();entrarAdmin();aviso('Modo admin ligado. Toque em ✏️ nos produtos para editar.')}
    catch(e){falha(e===0?'Usuário ou senha errados.':(e.message||'Não deu certo.'));b.disabled=false}});
  s.addEventListener('keydown',e=>{if(e.key==='Enter')b.click()});
  const cx=caixa;lerConfig().then(c=>{if(!c&&caixa===cx&&cx.isConnected)botao('Primeira vez? Configurar o painel','link',()=>{fechar();telaConfigurar()})})}
function repoProvavel(){const h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/i);if(!m)return'';const seg=location.pathname.split('/').filter(Boolean)[0];
  return m[1]+'/'+(seg&&!/\.html?$/i.test(seg)?seg:h)}
async function testarChave(repo,token){const r=await gh('/repos/'+repo,{},token);if(r.status===404)throw new Error('Não achei o repositório "'+repo+'" com essa chave. Confira o nome e se a chave tem acesso a ele.');
  if(!r.ok)throw await erroGh(r);const j=await r.json();if(j.permissions&&!j.permissions.push)throw new Error('Essa chave só consegue ler o repositório. Ela precisa de permissão para escrever (Contents: Read and write).');return j.default_branch||'main'}
async function salvarConfig(repo,branch,usuario,senha,token){
  const c=Object.assign({repo,branch,usuario},await cifrar(token,senha));const cred={repo,branch,token};
  const atual=await lerArquivo('admin.json',cred);await gravar('admin.json',txt64(JSON.stringify(c,null,1)),'Configura o painel de admin',atual&&atual.sha,cred);
  LS.set('sublimae_admin_cfg',c);sess={token,repo,branch,usuario};SS.set('sublimae_admin',sess)}
async function telaConfigurar(){
  if(await lerConfig()){telaLogin();return}
  janela('Configurar o painel');
  if(semCripto()){caixa.appendChild(el('p','pm-sub','Abra o catálogo pelo link do site (https) para configurar.'));return}
  caixa.appendChild(el('p','pm-sub','Feito só uma vez. A chave fica guardada no repositório, trancada com a senha que você criar aqui.'));
  const repo=campo('Repositório (dono/nome)','text',repoProvavel(),{placeholder:'usuario/repositorio'});
  const u=campo('Crie um usuário','text','',{autocomplete:'username'});
  const s1=campo('Crie uma senha forte','password','',{autocomplete:'new-password'}),s2=campo('Repita a senha','password','',{autocomplete:'new-password'});
  const tk=campo('Chave do GitHub','password','',{placeholder:'github_pat_…',autocomplete:'off'});
  const b=botao('Salvar e entrar','primary',async()=>{
    const r=repo.value.trim().replace(/^https?:\/\/github\.com\//,'').replace(/\.git$|\/$/g,''),t=tk.value.trim();
    if(!/^[\w.-]+\/[\w.-]+$/.test(r))return falha('Escreva o repositório como dono/nome.');
    if(!u.value.trim())return falha('Crie um usuário.');if(s1.value.length<8)return falha('A senha precisa ter pelo menos 8 caracteres.');
    if(s1.value!==s2.value)return falha('As senhas não são iguais.');if(!t)return falha('Cole a chave do GitHub.');
    b.disabled=true;info('Testando a chave…');
    try{const br=await testarChave(r,t);info('Guardando…');await salvarConfig(r,br,u.value.trim(),s1.value,t);fechar();entrarAdmin();aviso('Painel configurado! Você já está no modo admin.')}
    catch(e){falha(e.message||'Não deu certo.');b.disabled=false}})}

/* ---------- modo admin ---------- */
function entrarAdmin(){
  document.body.classList.add('admin');atualizarConta();
  if(!$('admBar')){const bar=el('div','adm-bar');bar.id='admBar';
    const mk=(t,f)=>{const b=el('button',null,t);b.type='button';b.onclick=f;bar.appendChild(b);return b};
    bar.appendChild(el('strong',null,'Admin'));mk('+ Novo produto',()=>telaProduto(null)).className='novo';mk('⚙️',painelAdmin).setAttribute('aria-label','Configurações');mk('Sair',sair);document.body.appendChild(bar)}
  document.querySelectorAll('#grid .card').forEach(c=>{if(c.querySelector('.adm-tools'))return;const t=el('div','adm-tools');
    const e=el('button',null,'✏️ Editar'),d=el('button',null,'🗑️');e.type=d.type='button';d.setAttribute('aria-label','Apagar');
    e.onclick=()=>telaProduto(c.dataset.code);d.onclick=()=>apagarProduto(c.dataset.code);t.append(e,d);c.appendChild(t)})}
function sair(){SS.del('sublimae_admin');sess=null;document.body.classList.remove('admin');const b=$('admBar');if(b)b.remove();document.querySelectorAll('.adm-tools').forEach(t=>t.remove());atualizarConta();aviso('Você saiu do modo admin.')}
function painelAdmin(){
  janela('Configurações do admin');
  caixa.appendChild(el('p','pm-sub','Repositório: '+sess.repo+'. Preencha só o que quiser trocar.'));
  const atual=campo('Senha atual','password','',{autocomplete:'current-password'});
  const u=campo('Usuário','text',sess.usuario);
  const s1=campo('Nova senha (opcional)','password','',{autocomplete:'new-password'});
  const tk=campo('Nova chave do GitHub (opcional)','password','',{placeholder:'cole só se a antiga venceu',autocomplete:'off'});
  const b=botao('Salvar configurações','primary',async()=>{b.disabled=true;info('Conferindo…');
    try{const c=await lerConfig();let token;try{token=await decifrar(c,atual.value)}catch(e){throw new Error('Senha atual errada.')}
      if(s1.value&&s1.value.length<8)throw new Error('A nova senha precisa ter pelo menos 8 caracteres.');
      if(!u.value.trim())throw new Error('O usuário não pode ficar vazio.');
      const t=tk.value.trim()||token;if(tk.value.trim())await testarChave(sess.repo,t);
      await salvarConfig(sess.repo,sess.branch,u.value.trim(),s1.value||atual.value,t);fechar();aviso('Configurações salvas.')}
    catch(e){falha(e.message||'Não deu certo.');b.disabled=false}});
  botao('Ver como cliente (sair do admin)','link',()=>{fechar();sair()})}

/* ---------- produto ---------- */
function categorias(){return [...document.querySelectorAll('.filters .filter')].map(b=>b.dataset.filter).filter(f=>f!=='Todos')}
function sugerirCodigo(cat){const cs=[...document.querySelectorAll('#grid .card')],pref={};
  cs.forEach(k=>{if(k.dataset.cat===cat){const p=(k.dataset.code||'').split('-')[0];pref[p]=(pref[p]||0)+1}});
  const p=Object.keys(pref).sort((a,b)=>pref[b]-pref[a])[0]||'CAN';
  const n=Math.max(0,...cs.map(k=>(k.dataset.code||'').split('-')).filter(x=>x[0]===p).map(x=>parseInt(x[1],10)||0))+1;return p+'-'+String(n).padStart(3,'0')}
function lerCard(code){const k=cardDe(code);if(!k)return null;const q=s=>k.querySelector(s),wa=q('.btn-whatsapp');
  const preco=(wa&&wa.dataset.price)||k.dataset.price||'',texto=q('.price').textContent.trim(),num=parseFloat(preco);
  const r=q('.ribbon');return {titulo:k.dataset.title,cat:k.dataset.cat,preco:preco==='consulte'||preco===''?'consulte':num,
    precoTexto:(!isNaN(num)&&texto===brl(num))||(preco==='consulte'&&texto==='Sob consulta')?'':texto,desc:q('.product-desc').textContent,img:q('.photo-btn img').src,
    selo:r?(r.className.split(' ').find(x=>NOMES_SELO[x])||''):''}}
function comprimir(file){return new Promise((ok,erro)=>{const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const m=1400,s=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    let d=c.toDataURL('image/webp',.82),ext='webp';if(d.indexOf('data:image/webp')!==0){d=c.toDataURL('image/jpeg',.85);ext='jpg'}ok({d,ext})};
  img.onerror=()=>{URL.revokeObjectURL(url);erro(new Error('Não consegui abrir essa foto. Tente outra (JPG ou PNG).'))};img.src=url})}
function telaProduto(code){
  const novo=!code,v=novo?{titulo:'',cat:'',preco:'',precoTexto:'',desc:'',img:'',selo:'novo'}:lerCard(code);if(!v)return;
  janela(novo?'Novo produto':'Editar '+code);
  let foto=null;
  const fw=el('div','pm-photo'),pv=el('img');pv.alt='';if(v.img)pv.src=v.img;fw.appendChild(pv);
  const fl=el('label','pm-btn','📷 '+(novo?'Escolher foto':'Trocar foto'));const fi=el('input');fi.type='file';fi.accept='image/*';fi.hidden=true;fl.appendChild(fi);fw.appendChild(fl);caixa.appendChild(fw);
  fi.onchange=async()=>{if(!fi.files[0])return;info('Preparando a foto…');try{foto=await comprimir(fi.files[0]);pv.src=foto.d;info('Foto pronta ('+Math.round(foto.d.length*.75/1024)+' KB).')}catch(e){falha(e.message)}};
  const nome=campo('Nome do produto','text',v.titulo,{placeholder:'Ex.: Caneca Dia dos Pais'});
  const lc=el('label','pm-field');lc.appendChild(el('span',null,'Categoria'));const sel=el('select');
  const op=(val,t)=>{const o=el('option',null,t||val);o.value=val;sel.appendChild(o)};op('','Escolha…');categorias().forEach(c=>op(c));op('__nova','➕ Nova categoria…');sel.value=v.cat;lc.appendChild(sel);caixa.appendChild(lc);
  const nova=campo('Nome da nova categoria','text','');nova.parentNode.hidden=true;
  const cod=campo('Código','text',novo?'':code,{readOnly:!novo,placeholder:'Ex.: CAN-061'});let codAuto=novo;
  cod.oninput=()=>{codAuto=false};
  sel.onchange=()=>{nova.parentNode.hidden=sel.value!=='__nova';if(novo&&codAuto&&sel.value&&sel.value!=='__nova')cod.value=sugerirCodigo(sel.value)};
  const preco=campo('Preço (R$)','text',v.preco==='consulte'?'':String(v.preco).replace('.',','),{inputMode:'decimal',placeholder:'40,00'});
  const lk=el('label','pm-check');const ck=el('input');ck.type='checkbox';ck.checked=v.preco==='consulte'&&!novo;lk.append(ck,document.createTextNode(' Sob consulta (sem preço)'));caixa.appendChild(lk);
  const togg=()=>{preco.disabled=ck.checked};ck.onchange=togg;togg();
  const pt=campo('Texto do preço (opcional)','text',v.precoTexto,{placeholder:'Ex.: A partir de R$ 27,00 · Kit c/ 10 R$ 30,00'});
  const desc=campo('Descrição','textarea',v.desc||'Personalização conforme arte, nome, foto ou tema escolhido.');
  const ls=el('label','pm-field');ls.appendChild(el('span',null,'Selo na foto'));const ss=el('select');[['','Nenhum'],['novo','Novo'],['lancamento','Lançamento'],['mais','Mais pedido']].forEach(([a,b])=>{const o=el('option',null,b);o.value=a;ss.appendChild(o)});ss.value=v.selo;ls.appendChild(ss);caixa.appendChild(ls);
  const b=botao(novo?'Publicar produto':'Salvar alterações','primary',async()=>{
    const titulo=nome.value.trim(),c=(cod.value.trim()||'').toUpperCase().replace(/\s+/g,'-');let cat=sel.value==='__nova'?nova.value.trim():sel.value;
    if(!titulo)return falha('Escreva o nome do produto.');if(!cat)return falha('Escolha a categoria.');
    if(!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(c))return falha('Código inválido. Use letras, números e hífen (ex.: CAN-061).');
    if(novo&&cardDe(c))return falha('Já existe um produto com o código '+c+'.');
    if(novo&&!foto)return falha('Escolha uma foto.');
    let pr='consulte';if(!ck.checked){pr=parseFloat(preco.value.replace(/[^\d,.]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.'));if(isNaN(pr))return falha('Preço inválido. Ex.: 40,00 (ou marque Sob consulta).')}
    const p={titulo,cat,preco:pr,precoTexto:pt.value.trim(),desc:desc.value.trim(),selo:ss.value};
    b.disabled=true;
    try{const antiga=(dados.produtos[c]||{}).foto;
      if(foto){info('Enviando a foto…');const caminho='fotos/'+c+'-'+Date.now()+'.'+foto.ext;await gravar(caminho,foto.d.split(',')[1],'Foto '+c);p.foto=caminho;guardarFotoTmp(caminho,foto.d)}
      info('Salvando…');
      await mudarDados((novo?'Novo produto ':'Edita ')+c,d=>{const velho=d.produtos[c]||{};d.produtos[c]=Object.assign({},velho,p,{criado:velho.criado||(novo?Date.now():0)});
        d.removidos=d.removidos.filter(x=>x!==c);if(sel.value==='__nova'&&!d.categorias.includes(cat))d.categorias.push(cat)});
      if(foto&&antiga&&antiga.indexOf('fotos/')===0)await apagarArquivo(antiga);
      recarregar(novo?'Produto publicado! Para os clientes aparece em 1 a 2 minutos.':'Alterações salvas! Para os clientes aparece em 1 a 2 minutos.')}
    catch(e){falha(e.message||'Não deu certo.');b.disabled=false}})}
async function apagarProduto(code){
  const k=cardDe(code);if(!k||!confirm('Apagar "'+k.dataset.title+'" ('+code+') do catálogo?'))return;
  aviso('Apagando…');
  try{const f=(dados.produtos[code]||{}).foto;
    await mudarDados('Remove '+code,d=>{delete d.produtos[code];if(!d.removidos.includes(code))d.removidos.push(code)});
    if(f&&f.indexOf('fotos/')===0)await apagarArquivo(f);
    recarregar('Produto apagado. Para os clientes some em 1 a 2 minutos.')}
  catch(e){alert(e.message||'Não deu certo.')}}

/* ---------- estilo ---------- */
const css=`
.user-btn{position:absolute;top:16px;right:16px;z-index:5;width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line);background:#fff;color:var(--blue);display:grid;place-items:center;font:inherit;font-weight:900;font-size:18px;box-shadow:var(--shadow);cursor:pointer}
.user-btn.on{background:var(--blue);color:#fff;border-color:var(--blue)}
.pm-overlay{position:fixed;inset:0;z-index:200;background:#080c18b3;display:flex;align-items:flex-end;justify-content:center}
@media(min-width:640px){.pm-overlay{align-items:center;padding:20px}}
.pm-box{position:relative;width:100%;max-width:460px;max-height:92vh;overflow:auto;background:#fff;border-radius:22px 22px 0 0;padding:22px 18px 26px;color:var(--ink)}
@media(min-width:640px){.pm-box{border-radius:22px}}
.pm-box h2{margin:0 40px 6px 0;font-size:21px}
.pm-box hr{border:0;border-top:1px solid var(--line);margin:16px 0 6px}
.pm-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:var(--bg);font-size:22px;cursor:pointer}
.pm-sub{margin:0 0 14px;color:var(--muted);font-size:14px}
.pm-field{display:block;margin:0 0 12px}.pm-field[hidden]{display:none}.pm-field span{display:block;font-size:12px;font-weight:800;color:var(--muted);margin-bottom:5px}
.pm-field input,.pm-field select,.pm-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;padding:12px 13px;font:inherit;font-size:16px;background:#fff;color:var(--ink);outline:none}
.pm-field textarea{min-height:84px;resize:vertical}.pm-field input:focus,.pm-field select:focus,.pm-field textarea:focus{border-color:var(--blue)}
.pm-field input[readonly],.pm-field input:disabled{background:var(--bg);color:var(--muted)}
.pm-check{display:flex;align-items:center;gap:6px;margin:-4px 0 12px;font-size:14px;font-weight:700}
.pm-btn{display:block;width:100%;box-sizing:border-box;margin:8px 0 0;padding:13px;border-radius:14px;border:1.5px solid var(--blue);background:#fff;color:var(--blue);font:inherit;font-weight:900;font-size:15px;text-align:center;cursor:pointer}
.pm-btn.primary{background:var(--blue);color:#fff}.pm-btn.link{border:0;background:none;padding:10px;font-weight:800;font-size:14px}.pm-btn:disabled{opacity:.6}
.pm-msg{margin:12px 0 0;font-size:14px;font-weight:700;color:var(--blue)}.pm-msg.erro{color:#c0262d}
.pm-photo{display:grid;gap:8px;margin-bottom:14px}.pm-photo img{width:min(100%,220px);justify-self:center;aspect-ratio:1;object-fit:cover;border-radius:16px;background:var(--bg)}.pm-photo img:not([src]){display:none}.pm-photo .pm-btn{margin:0}
.pm-toast{position:fixed;left:50%;top:18px;z-index:300;transform:translate(-50%,-20px);opacity:0;transition:.3s;background:var(--ink);color:#fff;padding:12px 18px;border-radius:14px;font-weight:800;font-size:14px;max-width:calc(100vw - 32px);box-shadow:0 12px 30px #0004;text-align:center}
.pm-toast.show{opacity:1;transform:translate(-50%,0)}
.adm-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:70;display:flex;gap:8px;align-items:center;background:var(--ink);color:#fff;padding:8px 8px 8px 14px;border-radius:999px;box-shadow:0 12px 30px #0005}
.adm-bar strong{font-size:13px;margin-right:auto}.adm-bar button{border:0;border-radius:999px;padding:10px 13px;font:inherit;font-weight:900;font-size:13px;background:#ffffff1f;color:#fff;cursor:pointer}
.adm-bar button.novo{background:var(--pink)}
body.admin{padding-bottom:76px}body.admin .cart-fab{bottom:80px}
body.admin .card{position:relative}
.adm-tools{position:absolute;top:8px;right:8px;z-index:4;display:flex;gap:6px}
.adm-tools button{border:0;border-radius:999px;padding:8px 11px;background:#fff;color:var(--ink);font:inherit;font-weight:900;font-size:12px;box-shadow:0 4px 14px #0003;cursor:pointer}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

iniciar();
})();
