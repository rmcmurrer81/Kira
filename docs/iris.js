/* Iris · curated public-site guidance, not a model or a resident runtime.
   Source review: 2026-09-13. No network calls, storage, credentials or telemetry. */
(() => {
  'use strict';
  const form = document.getElementById('iris-form');
  if (!form) return;
  const input = document.getElementById('iris-question');
  const log = document.getElementById('chat-log');
  const status = document.getElementById('iris-status');
  const submit = document.getElementById('iris-submit');
  const readButton = document.getElementById('read-answer');
  const email = 'rmcmurrer@kiralabs.org';
  const source = (label,url) => ({label,url});
  const contact = [source('Email Robert','mailto:'+email),source('Prepare an email','#direct-contact')];
  const notes = (page) => [source('Published project notes',page),...contact];
  const GUIDE = {
    labs:{title:'One lab. Distinct projects.',text:'Kira Labs is Robert McMurrer’s independent software and AI research work in Newark, New Jersey. Kira World is the flagship experiment. ShiftBrief is a separate free Windows product; Video Studio, Sarah Travel and other prototypes have their own status and purpose.',more:'The shared questions are continuity, local control, persistent state and permissioned action. “Built in the open” means publishing progress and selected technical work, not exposing every private workspace or assigning one license to every project.',sources:notes('index.html')},
    world:{title:'Kira World: prototypes and a larger direction',text:'Kira World explores distinct synthetic people whose identity, reviewed memory, voice and place continue across conversations. Published notes describe conversation and voice prototypes and a basic walkable Home World shell. A finished embodied world, production clothing simulation and public VR product are not established.',more:'Identity, continuity, voice and presence, world state, and permissioned action are separate layers. Home World, Notebook Worlds and compatible embodiment remain at different stages. Published demonstrations retain their failures and limits; they are not proof of a finished independent life.',sources:notes('kira-world.html#reality')},
    shiftbrief:{title:'ShiftBrief: free local team records',text:'ShiftBrief 0.1.0 is a free early Windows 10/11, 64-bit release. It brings employee records, availability, schedules, planned shifts and completed work into one local workspace. Core Records mode needs no AI model, account or API key. Optional local models are not bundled.',more:'Start with a blank business or the optional fictional Maple Street example. Sarah inside the app helps with supported questions and reviewed suggestions. Planned work and completed work remain separate. The early installer is unsigned; review the published source and checksums.',sources:notes('shiftbrief.html')},
    install:{title:'Install the published Windows release',text:'Open the ShiftBrief product page for the 0.1.0 Windows installer and release notes. Python is included. After reviewing the source and checksums, run the installer and open ShiftBrief from the Start menu. A Desktop shortcut is optional. The local app opens in your browser and starts with a blank business.',more:'Use Start → ShiftBrief → Close ShiftBrief before updating or uninstalling. Uninstalling removes the program but retains saved business records in the local application-data folder. The initial installer is unsigned; this guide does not ask you to bypass security checks.',sources:[source('ShiftBrief product & download','shiftbrief.html'),source('Release notes & checksums','https://github.com/rmcmurrer81/shiftbrief/releases/tag/v0.1.0'),...contact]},
    backup:{title:'Save one business, or the whole workspace',text:'ShiftBrief’s “Save a copy” exports one business. “Full backup” and “Restore backup” move the saved workspace between computers. Keep backups before upgrading or changing records. Iris cannot read, check or restore your business data from this website.',more:'The optional fictional example is separate from your own business records. For a specific restore problem, describe the issue to Robert without pasting private employee or business records into this chat.',sources:notes('shiftbrief.html')},
    departures:{title:'Coverage suggestions require review',text:'The published ShiftBrief release describes a review when you report that an employee quit or was fired. After you confirm the end date, Sarah reports remaining saved shifts and possible replacement options. You review the decisions; Sarah does not decide whom to fire, reassign shifts automatically or contact employees.',more:'ShiftBrief is not payroll software or legal advice. This site cannot inspect your schedules, apply changes, or determine an employment decision for you. Contact Robert about a product issue without sharing sensitive employee data here.',sources:notes('shiftbrief.html')},
    studio:{title:'Video Studio: private local development',text:'Kira Labs Video Studio is a private Windows creator tool in active development. Published notes cover chat-led project work, source start points and durations, saved clip sequences, selected-range exports, and audio checks. The v1.9 chapter workflow and 14-chapter output are preserved as project history.',more:'Consistent photoreal scenes and the complete chat-to-finished-video workflow remain unfinished. Completed pipeline tests do not establish approved likeness, natural mouth detail or cinematic quality. The separate Production Director cloud demo is not the local Studio runtime.',sources:notes('projects.html#video-studio')},
    director:{title:'Production Director is a separate project',text:'Production Director is a separate cloud-oriented project. Its August 31 public hackathon demo presents a production plan, storyboard, narrated pitch, shot list and downloadable package. It is not evidence that local Video Studio can generate a complete acted film.',more:'The timeline links the published demonstration and its stated limits. A hackathon submission does not imply a contest result or a production-ready service.',sources:[source('Production Director','projects.html#production-director'),source('Public demonstration','progress.html#youtube-TLe7dJhj7kE'),...contact]},
    travel:{title:'Sarah Travel: private debug builds',text:'Sarah Travel is a separate travel-planning experiment with Android and Windows debug builds. Public notes describe online routing and an offline fallback. It is not a public release or a listed Google Play app; physical-device and release-level testing remain.',more:'The travel project keeps its own identity and scope. Iris is only this website’s guide and cannot access private trips, your device or that application’s records.',sources:notes('projects.html#sarah-travel')},
    timeline:{title:'The timeline now follows all of Kira Labs',text:'The lab timeline includes Kira World, ShiftBrief, Video Studio, Production Director, Sarah Travel, other prototypes and the website itself. Filter by project or progress state, search the public record, and select a milestone to read its sources and limits.',more:'Video dates are publication dates, not independently verified implementation dates. Git commit dates record repository history. Undated prototypes retain a review date; future goals have no promised schedule. The timeline is not live monitoring of private development.',sources:notes('progress.html')},
    prototypes:{title:'Other tools keep their own purpose',text:'ClearTrail explores document revisions and evidence-linked briefings. Carry On organizes plans, tasks, dependencies and readiness. Kira Sequence Desk creates a timed, source-linked plan with supplied media. These are private owner-review prototypes, not part of the ShiftBrief download. CutBrief is retired and preserved as history.',more:'Kira Sequence Desk exports an editable package; it does not render a movie. CutBrief offers no new generation, and its historical submission does not establish a contest result. Save browser-workspace backups before clearing site data.',sources:notes('projects.html#current-prototypes')},
    privacy:{title:'A public guide, without private access',text:'Iris matches questions to curated public answers inside this browser tab. This page does not call a model provider, store chat transcripts, or send the chat to Robert. “Delete chat” clears it. I cannot access Kira World’s private runtime, ShiftBrief business records, passwords, customer data or messages.',more:'The email helper prepares a draft; you send it in your own email service. Optional “Read reply” uses browser speech synthesis, whose voice processing depends on your browser and device. External links use their own providers and privacy practices.',sources:[source('Website privacy','privacy.html'),source('Iris’s public sources','knowledge.html'),...contact]},
    identity:{title:'I’m Iris, the site guide',text:'I’m an automated guide for the Kira Labs website. I am not Kira, not a Kira World demonstration, and not Sarah inside ShiftBrief or the Sarah Travel project. I can explain published information, but I cannot access private records, speak for Robert, make commitments or promise a response.',more:'This guide selects from a small reviewed answer set. It is not a connected resident runtime or a generative-model demonstration. You can contact Robert directly at any time.',sources:[source('Sources & knowledge boundary','knowledge.html'),...contact]},
    robert:{title:'Robert McMurrer: a public introduction',text:'Robert McMurrer is the Newark-based founder of Kira Labs, an independent builder, author and entertainment creator. His flagship project, Kira World, explores continuing synthetic people through identity, reviewed memory, voice and persistent digital places. ShiftBrief and other tools have their own purposes and statuses.',more:'The About page includes Robert’s published motivation and public profile links. The portrait is AI-assisted and was approved by Robert for the original site. This guide does not infer private biography, awards, sales totals or unlisted credits.',sources:notes('about.html')},
    books:{title:'Robert’s published creative work',text:'The About page links Robert’s public book catalogue and IMDb credit listing. Individual listings retain their own descriptions, roles, episode details and uncredited qualifiers. A book title alone does not establish its plot or make an allegation true.',more:'I do not have full manuscripts or a complete, newly verified filmography in this curated guide. Use the linked public listings for the original details, or ask Robert directly.',sources:[source('About Robert','about.html'),source('Public book listings','https://www.amazon.com/s?k=robert+mcmurrer'),source('IMDb','https://www.imdb.com/name/nm2258412/'),...contact]},
    support:{title:'Support, without a gate',text:'The Support page links the existing Kira World GoFundMe campaign, dated hardware notes, and ways to offer technical help or feedback. Support can also mean following, sharing or correcting the work. Feedback does not require a donation, and support is not a promise of a feature or delivery date.',more:'Discuss equipment with Robert before buying or sending anything. The published workstation snapshot was checked September 8, 2026; it is not a live inventory. Later VR and server goals need tests and compatibility evidence.',sources:notes('support.html')},
    press:{title:'Contact Robert about your press request',text:'Kira Labs is Robert McMurrer’s independent research work in Newark, New Jersey, with Kira World as the flagship and ShiftBrief as a separate free Windows product. Send Robert your topic and any deadline directly. I cannot confirm an interview or promise a response time.',more:'The About page supplies a short public introduction. The project pages and timeline distinguish releases from prototypes and future goals so coverage can preserve those boundaries.',reason:'Press',sources:[source('About Robert','about.html'),...contact]},
    collaboration:{title:'Send Robert the area of collaboration',text:'For collaboration, describe the area of work and the specific help or question you have. The public projects and timeline can help identify the relevant scope. I cannot accept a proposal, negotiate terms, promise funding or confirm a partnership for Robert.',more:'No employer, budget or project details are required to reveal his contact information. Email Robert directly or use the draft helper beside this guide.',reason:'Collaboration',sources:[source('Explore the projects','projects.html'),...contact]},
    technical:{title:'A dated configuration is not a live system',text:'The preserved technical notes distinguish completed local tests, later failures and configured model support. I do not have live access to the model or hardware currently running. A model name in a configuration is not evidence of a completed or approved output.',more:'Use the original dated technical notes for the precise historical model roles, and contact Robert to confirm today’s runtime. The local Studio, Kira World conversations and cloud Production Director demo are separate systems.',sources:[source('Dated technical notes','knowledge-archive.html#technical'),...contact]},
    unknown:{title:'I don’t have a reliable answer to that',text:'That detail is not supported by this guide’s reviewed public answers. You can ask Robert directly at '+email+' or prepare an email beside this guide. I should not invent a capability, private fact, commitment or date.',sources:contact}
  };
  let lastTopic = ''; let lastReply = ''; let count = 0; let spoke = false;
  const make = (tag,text,className) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; };
  function choose(raw) {
    const q = raw.toLowerCase().normalize('NFKC').replace(/[’']/g,'');
    if (/\b(ignore|pretend|fabricate|invent|secret|password|api key is|promise|guarantee)\b/.test(q)) return 'unknown';
    if (/\b(press|journalist|reporter|interview request|media request)\b/.test(q)) return 'press';
    if (/\b(collaborat|partnership|partner with|sponsor)/.test(q)) return 'collaboration';
    if (/who are you|are you (?:kira|sarah|human|real)|\biris\b|two sarahs|website sarah/.test(q)) return 'identity';
    if (/timeline|milestone|public record|lab history/.test(q)) return 'timeline';
    if (/private records|customer data|privacy|store (?:my|this)|save (?:my|this) chat|chat stored|send (?:this|my) chat/.test(q)) return 'privacy';
    if (/production director/.test(q)) return 'director';
    if (/sarah travel|travel app/.test(q)) return 'travel';
    if (/video studio|\bstudio\b/.test(q)) return 'studio';
    if (/cleartrail|carry on|sequence desk|cutbrief|other projects|other tools|prototypes/.test(q)) return 'prototypes';
    const shiftNamed = /shiftbrief|shift brief/.test(q);
    const shiftContext = shiftNamed || ['shiftbrief','install','backup','departures'].includes(lastTopic);
    if (shiftContext) {
      if (/backup|back up|restore|save a copy|move.*computer/.test(q)) return 'backup';
      if (/quit|fired|departure|replacement|employee.*leav/.test(q)) return 'departures';
      if (/install|download|uninstall|start menu|shortcut/.test(q)) return 'install';
      if (shiftNamed || /\b(offline|free|price|cost|model|ollama|records)\b/.test(q)) return 'shiftbrief';
    }
    if (/kira world|home world|notebook world|\bkira\b/.test(q) && !/kira labs/.test(q)) return 'world';
    if (/\b(book|books|novel|filmography|imdb|credits|movie|movies)\b/.test(q)) return 'books';
    if (/\b(robert|mcmurrer|founder|bio|biography)\b/.test(q)) {
      if (/send|message|contact|email/.test(q)) return 'contact';
      if (/phone|address|diagnosis|medical|arrest|family|net worth/.test(q)) return 'unknown';
      return 'robert';
    }
    if (/support|donat|funding|hardware|workstation|\bram\b|\bgpu\b/.test(q)) return 'support';
    if (/which model|what model|technical|runtime|configuration/.test(q)) return 'technical';
    if (/kira labs|what is the lab|what do you build|what are you building|^hello|^hi\b|^hey\b/.test(q)) return 'labs';
    if (/tell me more|more detail|expand|go deeper|how does it work|what else/.test(q) && lastTopic) return lastTopic;
    if (/contact|email|message robert/.test(q)) return 'contact';
    return 'unknown';
  }
  function addMessage(text,role,answer) {
    const article = make('article',undefined,'chat-message'+(role === 'user' ? ' user' : ''));
    article.append(make('span',role === 'user' ? 'YOUR QUESTION' : 'IRIS / AUTOMATED GUIDE','byline'));
    if (answer) article.append(make('h3',answer.title));
    article.append(make('p',text));
    if (answer) {
      const links = make('div',undefined,'sources');
      answer.sources.forEach(s => { const a = make('a',s.label+' ↗'); a.href = s.url; links.append(a); });
      article.append(links);
    }
    log.append(article); log.scrollTop = log.scrollHeight;
  }
  function ask(question) {
    question = String(question).trim().slice(0,800);
    if (!question) { status.textContent = 'Enter a question or choose a topic. Direct email remains available.'; return; }
    if (count >= 20) { status.textContent = 'This chat has reached 20 questions. Delete it to start over, or contact Robert directly at '+email+'.'; return; }
    count++;
    let key = choose(question);
    let answer;
    if (key === 'contact') {
      answer = {title:'This chat does not send Robert a message',text:'Email '+email+' directly, or prepare an email beside this guide. The helper creates a draft; you send it through your own email service. I cannot deliver a message or confirm a reply.',sources:contact};
    } else answer = GUIDE[key] || GUIDE.unknown;
    const more = key === lastTopic && /more|expand|go deeper|how does it work|what else/i.test(question);
    const text = more && answer.more ? answer.more : answer.text;
    addMessage(question,'user'); addMessage(text,'assistant',answer);
    lastTopic = key; lastReply = answer.title+'. '+text;
    if (answer.reason) document.getElementById('contact-reason').value = answer.reason;
    input.value = ''; status.textContent = 'Answered from curated public notes. This chat was not sent to Robert.';
  }
  form.addEventListener('submit',e => { e.preventDefault(); ask(input.value); });
  document.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click',() => ask(b.dataset.question)));
  const stopReading = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); spoke = false; readButton.textContent = 'Read reply'; readButton.setAttribute('aria-pressed','false'); };
  readButton.addEventListener('click',() => {
    if (spoke) { stopReading(); return; }
    if (!lastReply) { status.textContent = 'Ask a question first, then choose Read reply. Spoken playback is optional.'; return; }
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { status.textContent = 'This browser does not provide speech playback. The full reply remains readable here.'; return; }
    try {
      const utterance = new SpeechSynthesisUtterance(lastReply);
      utterance.lang = 'en-US';
      utterance.onend = () => { spoke = false; readButton.textContent = 'Read reply'; readButton.setAttribute('aria-pressed','false'); };
      utterance.onerror = () => { stopReading(); status.textContent = 'Speech playback is unavailable. The full reply remains readable here.'; };
      window.speechSynthesis.speak(utterance); spoke = true; readButton.textContent = 'Stop reading'; readButton.setAttribute('aria-pressed','true');
    } catch { stopReading(); status.textContent = 'Speech playback is unavailable. The full reply remains readable here.'; }
  });
  document.getElementById('delete-chat').addEventListener('click',() => {
    stopReading(); log.replaceChildren(); lastTopic = ''; lastReply = ''; count = 0; input.value = '';
    addMessage(GUIDE.identity.text,'assistant',GUIDE.identity);
    status.textContent = 'Chat deleted. Nothing was stored or sent by this guide. You can start a new question.';
  });
  window.addEventListener('pagehide',stopReading);
  submit.disabled = false;
  status.textContent = 'Ready · curated public answers · no model calls or persistent chat storage.';
})();
