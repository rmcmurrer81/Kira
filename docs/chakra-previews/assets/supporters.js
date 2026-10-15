/* The five source-provided Chakra institutional marks. Preview display does not independently establish endorsement. */
(function(){'use strict';
const logos=[{"id":"njeda","alt":"NJEDA — New Jersey Economic Development Authority","caption":""},{"id":"princeton","alt":"Princeton University","caption":"OFFICE OF INNOVATION"},{"id":"rutgers","alt":"Rutgers University","caption":"MBS"},{"id":"njit","alt":"New Jersey Institute of Technology (NJIT)","caption":""},{"id":"nsf-icorps","alt":"NSF I-Corps","caption":""}];
const base='https://kiralabs.org/chakra-previews/assets/supporters/';
function install(){
if(document.getElementById('chakra-institutional-support'))return;
const section=document.createElement('section');section.id='chakra-institutional-support';section.className='cis-section';section.setAttribute('aria-labelledby','cis-heading');
const inner=document.createElement('div');inner.className='cis-inner';
const title=document.createElement('h2');title.id='cis-heading';title.className='cis-heading';title.textContent='SUPPORTED BY';inner.append(title);
const grid=document.createElement('div');grid.className='cis-grid';
for(const entry of logos){
const fig=document.createElement('figure');fig.className='cis-logo';fig.dataset.id=entry.id;
const img=document.createElement('img');img.src=base+entry.id+'.png';img.alt=entry.alt;img.loading='lazy';img.decoding='async';fig.append(img);
if(entry.caption){const cap=document.createElement('figcaption');cap.textContent=entry.caption;fig.append(cap);}
grid.append(fig);
}
inner.append(grid);section.append(inner);
const old=document.getElementById('support');
if(old&&old!==section&&(old.textContent.toLowerCase().includes('support')||old.classList.contains('institutions'))){old.replaceWith(section);return;}
const contact=document.querySelector('main #contact, #contact');
if(contact&&contact.parentNode){contact.parentNode.insertBefore(section,contact);return;}
const main=document.querySelector('main');if(main){main.append(section);return;}
const footer=document.querySelector('footer');if(footer)footer.parentNode.insertBefore(section,footer);else document.body.append(section);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();