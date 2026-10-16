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
