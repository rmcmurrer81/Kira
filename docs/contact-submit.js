/* Direct form POST, not a mailto draft and not an opaque AJAX success guess.
 * In a downloaded review, FormSubmit's own response opens in a separate tab.
 * On kiralabs.org, the browser returns to the website after provider processing.
 * Recipient activation and a real inbox test are still required before launch.
 */
(() => {
 'use strict';
 const form=document.getElementById('contact-form');if(!form)return;
 const button=document.getElementById('send-message'),status=document.getElementById('contact-status');
 const preview=Boolean(window.KIRA_LABS_PREVIEW)||!/^https?:$/.test(location.protocol)||!['kiralabs.org','www.kiralabs.org'].includes(location.hostname);
 const show=(text,state)=>{status.textContent=text;status.dataset.state=state;};
 form.action='https://formsubmit.co/rmcmurrer@kiralabs.org';form.method='POST';form.enctype='application/x-www-form-urlencoded';
 form.target=preview?'_blank':'_self';
 const source=form.querySelector('[name="_url"]');if(source)source.value='https://kiralabs.org/contact.html';
 let next=form.querySelector('[name="_next"]');
 if(preview){
  next?.remove();
  const note=document.getElementById('contact-preview-note');if(note)note.hidden=false;
 }else{
  if(!next){next=document.createElement('input');next.type='hidden';next.name='_next';form.append(next);}
  next.value='https://kiralabs.org/message-received.html';
 }
 const u=new URL(window.__PREVIEW_URL||location.href,'https://kiralabs.org/');const reason=u.searchParams.get('reason');
 if(reason&&Array.from(form.elements.reason.options).some(o=>o.value===reason))form.elements.reason.value=reason;
 let sending=false,resetTimer;
 form.addEventListener('submit',event=>{
  if(sending){event.preventDefault();return;}
  if(!form.checkValidity()){event.preventDefault();form.reportValidity();return;}
  const name=form.elements.name,email=form.elements.email,message=form.elements.message;
  name.value=name.value.trim();email.value=email.value.trim();message.value=message.value.trim();
  if(!name.value||!message.value){event.preventDefault();show('Please enter a name and a message, not only spaces.','error');return;}
  if(name.value.length>100||email.value.length>254||message.value.length>5000){event.preventDefault();show('Please shorten your entries before sending.','error');return;}
  if(form.elements._honey.value){event.preventDefault();show('The form could not be submitted. Please reload the page and try again.','error');return;}
  if(navigator.onLine===false){event.preventDefault();show('You appear to be offline. Nothing has been sent. Your message is still here.','error');return;}
  form.querySelector('[name="_subject"]').value='Kira Labs — '+form.elements.reason.value;
  sending=true;button.disabled=true;button.textContent='Submitting…';
  show(preview?'Opening FormSubmit’s confirmation page in a new tab. This review does not claim the message was delivered; check the response there. Your text stays here.':'Submitting to the message service…','sending');
  // Do not preventDefault: this is a normal browser form submission, not fetch.
  // Do not set _captcha=false: provider spam checks stay in place.
  resetTimer=setTimeout(()=>{sending=false;button.disabled=false;button.textContent='Send message ↗';if(preview)show('Check the FormSubmit tab for confirmation, activation instructions, or an error. Do not resend if your first submission was already accepted.','info');},6000);
 });
 window.addEventListener('pageshow',()=>{sending=false;button.disabled=false;button.textContent='Send message ↗';clearTimeout(resetTimer);});
})();
