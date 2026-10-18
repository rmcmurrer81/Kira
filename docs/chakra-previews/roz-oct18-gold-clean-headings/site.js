
document.documentElement.classList.add('js');
(()=>{'use strict';
const nav=document.getElementById('site-nav'),toggle=document.getElementById('menu-toggle');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close ✕':'Menu ☰'});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='Menu ☰'}));
const dialog=document.getElementById('product-dialog'),title=document.getElementById('dialog-title'),description=document.getElementById('dialog-description');
const products={
 rosa:['ROSA® — Runtime Operations & Systems Analytics','ROSA® transforms source information into decision-ready information. This preview represents the product direction shown in Chakra’s October 17 presentation; it is not a functioning MVP.'],
 hci:['HCI — Human–Computer Interaction','Elevate Human Capability. This is an overview of the intended HCI product world, not an operational application.'],
 di:['Decisioning Intelligence','Structure how information becomes decisions, actions, and outcomes. This product world is a concept under development.'],
 cce:['Category Creation & Education','Build the shared language, understanding, and public literacy for a new intelligence domain. This preview is a proposed product area.']
};
document.querySelectorAll('[data-product]').forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();const product=products[a.getAttribute('data-product')];if(!product)return;title.textContent=product[0];description.textContent=product[1];if(dialog?.showModal)dialog.showModal();else alert(product.join('\n'))}));
document.getElementById('dialog-close')?.addEventListener('click',()=>dialog.close());
document.querySelectorAll('.current-year').forEach(el=>el.textContent=String(new Date().getFullYear()));
})();
