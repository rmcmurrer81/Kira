/* Public, readable lab milestones. Original evidence is retained in review/milestone-source-records.json. */
window.KIRA_LABS_TIMELINE = {
  "schema_version": 1,
  "prepared_on": "2026-10-20",
  "owner": "Robert McMurrer / Kira Labs",
  "source_snapshot": "5fb345f72852d180b0c4b25a4c1bb83215ace6a7",
  "note": "Public milestone summaries record dated experiments and proposed designs. Pulse, Three.js and NewBrain are not presented as an integrated running system; clinical simulation remains separate from experimental body work.",
  "projects": [
    "Kira World",
    "NewBrain",
    "Patient Horizon",
    "Evelyn Hart",
    "ShiftBrief",
    "Video Studio",
    "Sarah Travel",
    "Lab & website"
  ],
  "statuses": {
    "released": "Released product",
    "demo": "Published demo / update",
    "prototype": "Working prototype",
    "development": "Active development",
    "future": "Future goal"
  },
  "milestones": [
    {
      "id": "evelyn-eyelid-correction-reviewed-test-pending-2026-10-20",
      "title": "Evelyn eyelid movement correction passes source review; fresh motion test remains unrun",
      "project": "Evelyn Hart",
      "track": "Post-failure source correction for complete blink, eye stability and neutral restoration",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "October 20 development-task screenshots supplied after a previously verified failed blink-motion test; this is a task-log source-review status, not the result of a completed new runtime trial.",
      "summary": "After a blink result of about 1.7% closure on each eye against a 65% requirement, code review identified an insufficient 0.5-degree scouting movement. A bounded correction to search for enough eyelid travel passed source review. The next fresh test did not start in the reported snapshots because available RAM stayed below 8 GiB.",
      "body": "The new procedure retains eyelid stability and return-to-rest checks. The initial jaw calibration was accepted but the eyelid acceptance test failed, so the integrated six-capture sequence and video were not produced. The later attempted retest was blocked at an unchanged 8 GiB startup gate; a bounded working-set correction and lighter coordination process were being prepared. Generated voice, lip synchronization, actual completed blinking and memory after restart are not verified.",
      "image": {
        "path": "assets/evelyn-head-three-quarter-capture-20261020.webp",
        "label": "Actual three-quarter head screenshot, not animated motion",
        "alt": "Static three-quarter image of Evelyn's verified compatibility-rendered head",
        "caption": "Static head captured successfully in an earlier test. This is not a motion-test frame or proof of blinking."
      },
      "sources": [
        {
          "label": "Follow-up development task-log and RAM-gate details",
          "url": "reports/2026-10-20-evelyn-newbrain-prepared-tests.html"
        },
        {
          "label": "Preserved failed first blink calibration",
          "url": "reports/evelyn-motion-calibration-2026-10-20.html"
        },
        {
          "label": "Actual accepted head capture and scope",
          "url": "reports/70-evelyn-head-render-read.html"
        }
      ],
      "project_page": "evelyn-hart.html#evelyn-verified-reports-2026-10-20"
    },
    {
      "id": "newbrain-diagnostic-preflight-memory-and-field-2026-10-20",
      "title": "NewBrain diagnostic preparation hits RAM and metadata gates; no new model result",
      "project": "NewBrain",
      "track": "Pre-model startup guard, source-closure record correction and independent review",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "User-supplied October 20 Codex task-log screenshots; no new scored model execution is established by these snapshots.",
      "summary": "A planned fresh NewBrain diagnostic stopped before the model ran: one preparation failed the 8 GiB available-memory startup gate, and another encountered a wrong source-closure field in its prepared record. The failed originals were preserved; a corrected setup passed source review but produced no new learning measurement.",
      "body": "The unchanged startup admission guard requires 8 GiB available RAM, with a separate 3 GiB reserve. Bounded memory corrections were reported, not extra hardware. A source-closure metadata field-name mismatch caused a constructor stop before model/Native execution and was corrected in reviewed preparation. These events are not a new learning failure or gain. Original12 remains 2/12 before and after its latest completed main 256-update result, while the narrow taught three-row test remains 2/3 to 3/3 to 3/3 after restart. Qwen comparison remains untested.",
      "image": {
        "path": "assets/home-neural-highres-20261020.webp",
        "label": "Conceptual neural-system illustration",
        "alt": "Illustrative neural image, not screenshot of NewBrain execution",
        "caption": "Illustration only. Technical observations are in the linked task-log and preserved experiment reports."
      },
      "sources": [
        {
          "label": "Read diagnostic preflight and record correction note",
          "url": "reports/2026-10-20-evelyn-newbrain-prepared-tests.html"
        },
        {
          "label": "Current verified Original12 and short result comparison",
          "url": "newbrain.html#newbrain-source-reports-2026-10-20"
        },
        {
          "label": "Report 68 positive short three-row restart",
          "url": "reports/68-verified-learning-restart-read.html"
        }
      ],
      "project_page": "newbrain.html#newbrain-diagnostic-gate-2026-10-20"
    },
    {
      "id": "patient-horizon-lung-demo-plan-2026-10-20",
      "title": "Patient Horizon defines a testable synthetic-patient lung demonstration",
      "project": "Patient Horizon",
      "track": "Versioned synthetic records, transparent anatomical display, bedside-stream replay and physiology-validation plan",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "Patient Horizon research plan, Report 62, reviewed October 20, 2026. Planned acceptance tests expressly remain unrun.",
      "summary": "A four-page university research brief defines a first bounded demonstration: one synthetic patient, a versioned record, source-linked lab and scan findings, timestamped vital-sign replay, transparent anatomical display and separately validated breathing-model outputs.",
      "body": "Recorded evidence so far consists of four synthetic request-planner checks and a separate 512 weighted-vertex movement/restoration check through five poses. Those engineering results do not establish a working human lung, anatomical tissue validation, live medical connection or treatment prediction. The planned checks cover version integrity, negative controls, data quality and measured motion/physiology reference comparisons.",
      "image": {
        "path": "assets/patient-horizon-lung-concept-2026-10.webp",
        "label": "Illustrative lung demonstration concept",
        "alt": "Conceptual digital anatomical lungs illustration, not a completed working physiology simulator",
        "caption": "Concept artwork. Report 62 describes proposed synthetic demonstrations, not clinically validated lung mechanics."
      },
      "sources": [
        {
          "label": "Read the complete Patient Horizon research plan (Report 62)",
          "url": "reports/62-patient-horizon-lung-plan-read.html"
        },
        {
          "label": "Measured skin evidence (PDF)",
          "url": "reports/2026-10-measured-skin-movement-and-restoration.pdf"
        }
      ],
      "project_page": "patient-horizon.html#patient-horizon-lung-source-report-2026-10-20"
    },
    {
      "id": "evelyn-blink-calibration-fails-2026-10-20",
      "title": "Evelyn's static head is visible, but separate blink calibration fails",
      "project": "Evelyn Hart",
      "track": "Independent animation-acceptance trial and preserved negative evidence",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "October 20, 2026, latest verified local motion-trial reading guide supplied by the project. Static rendering is separately documented by Report 70.",
      "summary": "The separate motion trial failed its predeclared complete-blink gate. Both eyelid apertures reduced by about 1.7%, below the 65% acceptance requirement. Jaw calibration passed, but the six integrated motion captures and video were not produced.",
      "body": "This is a documented negative outcome, not a completed animated head. A separate successful three-camera compatibility render establishes static visibility from front, three-quarter and side views. It does not demonstrate blinking, lip synchronization, voice, visitor-memory persistence, conversation or a public installer. Audio-clock/neutral software controls do not verify actual generated speech or sound.",
      "image": {
        "path": "assets/evelyn-head-front-capture-20261020.webp",
        "label": "Static Evelyn compatibility head screenshot",
        "alt": "Actual still capture of Evelyn's head; not a successful blink-motion frame",
        "caption": "Static compatibility rendering succeeded. A different animated-blink calibration trial failed the 65% aperture-reduction requirement."
      },
      "sources": [
        {
          "label": "Full motion calibration note (failed acceptance test)",
          "url": "reports/evelyn-motion-calibration-2026-10-20.html"
        },
        {
          "label": "Three-angle verified static head rendering, Report 70",
          "url": "reports/70-evelyn-head-render-read.html"
        }
      ],
      "project_page": "evelyn-hart.html#evelyn-verified-reports-2026-10-20"
    },
    {
      "id": "evelyn-visible-three-angle-compatibility-preview-2026-10-20",
      "title": "Evelyn's 3D head becomes visible in three distinct camera views",
      "project": "Evelyn Hart",
      "track": "Compatibility head-render preview: front, three-quarter and side captures",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "October 20, 2026 local Codex development screenshots provided by Robert at approximately 7:40–7:47 PM Eastern; the latest published NewBrain research commit still documents the earlier failed render and has not independently published this successful preview.",
      "summary": "A corrected compatibility render showed Evelyn's face and eyes in distinct front, three-quarter and side views. The developer's independent image checks reported all three nonblank and matching their direct canvas captures. Blinking, voice, mouth movement and combined conversation remain unverified.",
      "body": "Earlier Evelyn preview runs were blank or failed with shader and graphics-context errors. In a subsequent separately recorded compatibility render, a licensed Base Female Character candidate (BlackProject, CC BY 4.0) was displayed using modified materials and reduced textures. The saved front, three-quarter and side screenshots visibly show a face and eyes, with different camera angles. The contemporaneous local development review reported that all three saved views passed the blank-screen checks and matched direct canvas captures. The completed run and its cleanup were recorded, with the earlier failed outputs preserved. A separate post-render audit was described as accepting the scoped head-render evidence and closing that test. This is a head-preview milestone, not a speaking or interactive Evelyn demonstration.",
      "boundary": "This success is grounded in user-supplied screenshots of the local test, not yet a new public GitHub research commit or an external replication. Original PBR materials remain unqualified. Blinking, generated voice, lip synchronization, conversational memory, and a public installer have not been verified. Next tests should measure blinking, generated speech with mouth movement, a short introduction, and visitor recall after restart. The previous failed graphics experiments remain preserved as a separate historical milestone.",
      "image": {
        "path": "assets/evelyn-head-front-capture-20261020.webp",
        "label": "Actual front-view captured 3D head",
        "alt": "Actual cropped compatibility-render screenshot showing Evelyn licensed 3D head from the front",
        "caption": "Actual captured renderer screenshot, not concept art. Base Female Character by BlackProject, CC BY 4.0; modified materials and textures. Voice and blinking remain untested."
      },
      "sources": [
        {
          "label": "Report 70: successful static head rendering and acceptance checks",
          "url": "reports/70-evelyn-head-render-read.html"
        },
        {
          "label": "Actual front, three-quarter and side screenshots plus downloadable evidence reports",
          "url": "evidence.html#evelyn-captures"
        },
        {
          "label": "Previously documented head-render failure (historical)",
          "url": "progress.html#evelyn-head-render-graphics-and-evidence-2026-10-20"
        }
      ],
      "project_page": "evelyn-hart.html#status"
    },
    {
      "id": "evelyn-head-render-graphics-and-evidence-2026-10-20",
      "title": "Evelyn head rendering: graphics and file-accounting failures identified",
      "project": "Evelyn Hart",
      "track": "Avatar renderer visual acceptance and saved-evidence review",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "October 20, 2026 NewBrain/KiraWorld/Patient-Horizon synchronized research-status documentation and saved browser evidence; one development track, not three independent successful experiments.",
      "summary": "Evelyn's head preview is not yet visible. A corrected capture encountered shader errors for eye-moisture and eyebrow materials and then WebGL context loss; an independent Chrome-profile file-accounting race also stopped a supervisor.",
      "body": "An earlier render-only run exited and cleaned up, but its front, three-quarter and side captures showed no head and were byte-identical despite camera changes, so visual acceptance failed. A distinct later capture then logged shader-validation errors for the eye-moisture and eyebrow materials and lost the WebGL context at the first front-view capture. Separately, an owned Chrome-profile temporary file disappeared between enumeration and inspection, stopping its file-accounting supervisor. The only saved follow-up images are blank baseline page/canvas captures. A saved-only review accepted the available evidence and closure records; all chosen run and review allowances closed, with some child I/O counters unknown.",
      "boundary": "These are verified observations and diagnostic evidence, not a working avatar, a confirmed root cause of WebGL context loss, successful head screenshots, tested speech or lip motion, or a released Evelyn installer. The next work is a graphics-material compatibility correction and a safer transient-file accounting path, followed by a fresh separately recorded render test with visible front, three-quarter and side views. No successful new test is claimed.",
      "image": {
        "path": "assets/evelyn-hart-demo-concept-2026-10-19.webp",
        "label": "Evelyn illustrative concept",
        "alt": "Concept portrait of the planned Evelyn Hart historian character; not a screenshot of a rendered or functioning avatar",
        "caption": "Existing concept artwork only. The tested head renders were blank or failed, so no successful render image is shown."
      },
      "sources": [
        {
          "label": "Evelyn project status and planned features",
          "url": "evelyn-hart.html#status"
        },
        {
          "label": "Dated NewBrain audit and observed failures",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/417aba66018214bc35c8205efecc62d1d41b0f89"
        }
      ],
      "project_page": "evelyn-hart.html"
    },
    {
      "id": "newbrain-longer-answer-audit-2026-10-20",
      "title": "Longer-answer teaching fixes the first token, but complete answer stays 2/3",
      "project": "NewBrain",
      "track": "Frozen three-question full-response training, saved review and premature end-marker diagnosis",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "Audited saved-result record and NewBrain research report 69 dated October 20, 2026; project-internal evidence review.",
      "summary": "A separate 64-update longer-answer trial remained 2/3 before and after training. The positive answer changed from b + EOS to cab + EOS, but missed the required source and version tokens. The control stayed 2/3.",
      "body": "The required full response was cab word one + EOS. NewBrain selected the correct first answer token but then selected the end marker rather than the required source/version sequence. The two explicitly rehearsed missing-information responses remained correct. The teacher-forced positive-example loss declined from 9.692280 to 2.136134, which does not count as complete-answer learning. A scoped separate saved-data audit passed without replaying the model. The planned distinct-process cold check was not authorized after the full-response criterion failed.",
      "boundary": "This is a separate negative longer-response result, not a regression of the earlier verified 2/3 to 3/3 to 3/3 shorter-answer result. Original12 remains 2/12. The cause of premature termination and any generalization remain unresolved.",
      "image": {
        "path": "assets/home-neural-highres-20261020.webp",
        "label": "Neural architecture concept",
        "alt": "Glowing neural network illustration, not an actual model trace",
        "caption": "Illustrative artwork. The numeric results come from saved experiment and audit records."
      },
      "sources": [
        {
          "label": "Report 69: complete source text of longer-answer test",
          "url": "reports/69-full-response-diagnostic-read.html"
        },
        {
          "label": "Current public NewBrain status and scope",
          "url": "newbrain.html#newbrain-longer-answer-2026-10-20"
        },
        {
          "label": "Dated NewBrain repository research record",
          "url": "https://github.com/rmcmurrer81/newbrain/blob/main/docs/research/2026-10-20-current-status-and-patient-horizon-plan.md"
        }
      ],
      "project_page": "newbrain.html"
    },
    {
      "id": "newbrain-short-answer-cold-restart-2026-10-20",
      "title": "A narrow three-question taught-answer improvement persists after a fresh restart",
      "project": "NewBrain",
      "track": "Short conditional-teaching study with matched no-teach controls and separate saved-output audit",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "development",
      "date_basis": "October 20 NewBrain repository research status and verified distinct-process reload, documented in university research report 68.",
      "summary": "On three explicitly taught synthetic cases, complete responses scored 2/3 before training, 3/3 after 64 updates and 3/3 after a separate-process restart. The no-training control stayed 2/3.",
      "body": "The previously missed short synthetic association became correct while both rehearsed missing-information responses remained correct. A separate process reloaded the saved trained state without further updates, loss measurements or state changes and generated the same three complete answers. The project-internal saved-evidence review passed, preserving the state and failed-audit records.",
      "boundary": "The 3/3 is specific to three rehearsed synthetic cases, not unfamiliar-fact acquisition, broad generalization or improved Original12. The main Original12 result remains 2/12 before and after its last 256-update experiment.",
      "image": {
        "path": "assets/home-neural-highres-20261020.webp",
        "label": "Synthetic learning research concept",
        "alt": "Concept art of a luminous neural architecture, not an actual runtime result",
        "caption": "Illustration of research direction. Verified measurements are described in the source record."
      },
      "sources": [
        {
          "label": "Report 68: controlled training and fresh-process restart evidence",
          "url": "reports/68-verified-learning-restart-read.html"
        },
        {
          "label": "Verified training-and-restart result",
          "url": "newbrain.html#newbrain-short-teaching-2026-10-20"
        },
        {
          "label": "Dated NewBrain research status",
          "url": "https://github.com/rmcmurrer81/newbrain/blob/main/docs/research/2026-10-20-current-status-and-patient-horizon-plan.md"
        }
      ],
      "project_page": "newbrain.html"
    },
    {
      "id": "iris-standalone-site-guide-2026-10-20",
      "title": "Iris becomes a separate public website guide, distinct from Contact",
      "project": "Lab & website",
      "track": "Public research navigation and accurate visitor expectations",
      "date": "2026-10-20",
      "reviewed_on": "2026-10-20",
      "status": "demo",
      "date_basis": "Kira Labs website source change creating an Iris guide page, with the original guide scripts and knowledge checks kept intact.",
      "summary": "Iris now has her own website page where visitors can explore published Kira Labs information. Contact remains reserved for messages to Robert.",
      "body": "The existing published Iris interface was moved from the Contact page without changing its form controls, guide scripts or knowledge-loading logic. The navigation and contact page link to the guide, but Iris chat does not send messages to the founder. Iris is a public information guide rather than a NewBrain benchmark or KiraWorld personality release.",
      "boundary": "A dedicated page is not evidence of enhanced language-model capability, new research results or independent verification of every conversational response. No website message is delivered through Iris chat.",
      "image": {
        "path": "assets/kira-labs-hero.webp",
        "label": "Kira Labs digital-world concept",
        "alt": "Illustrative Kira Labs digital spaces, not a live Iris application screenshot",
        "caption": "Concept artwork of the lab, distinct from the functional site guide."
      },
      "sources": [
        {
          "label": "Ask Iris website guide",
          "url": "iris.html"
        },
        {
          "label": "Contact Robert directly",
          "url": "contact.html"
        }
      ],
      "project_page": "iris.html"
    },
    {
      "id": "newbrain-sampled-gradient-pass-2026-10-19",
      "title": "NewBrain sampled gradient check passes 80 coordinates and four directions",
      "project": "NewBrain",
      "track": "Frozen numerical-gradient check and scoped evidence audit",
      "status": "development",
      "date": "2026-10-19",
      "date_basis": "NewBrain and KiraWorld GitHub research documentation plus university October 19 PDF61; separate project-internal reviewers, external replication pending.",
      "reviewed_on": "2026-10-19",
      "summary": "All 80 sampled coordinate comparisons, four directional comparisons and two deliberately incorrect controls passed. All ten groups including Q/K/V met the fixed signal floor; maximum absolute error ≈2.08×10⁻⁹. Original12 unchanged 2/12.",
      "body": "The separately frozen diagnostic followed corrected metadata setup and performed 170 objective evaluations, no training, generation or scoring. Its archived execution, file evidence, cleanup, initial model checkpoint and counters were checked by separate internal roles. This supports the sampled raw derivatives of the specified objective but does not prove full optimizer correctness. The earlier inconclusive and metadata-stopped attempts stay documented.",
      "boundary": "No main learning improvement or external replication; Original12 latest 2/12 baseline→2/12 after 256 updates, two gained and two lost. Earlier Original12 2/12→0/12 and separate Public2/Public4/30-of-30 histories are preserved. Qwen comparison still unrun.",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Research concept illustration",
        "caption": "Concept art, not a saved-gradient plot.",
        "alt": "Concept rendering illustrating NewBrain research."
      },
      "sources": [
        {
          "label": "GitHub successful numerical follow-up",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/b497fe43dd50ef3c0a2e9fab0a682bac43e402e3"
        },
        {
          "label": "Prior inconclusive numerical attempt",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/8aca55998eb88d2a23e8f1c0661328c449710e3"
        },
        {
          "label": "Current results and limits",
          "url": "results.html#sampled-gradient-pass-2026-10-19"
        }
      ],
      "project_page": "newbrain.html#sampled-gradient-pass-2026-10-19"
    },
    {
      "project": "NewBrain",
      "date": "2026-10-19",
      "reviewed_on": "2026-10-19",
      "status": "development",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Concept illustration",
        "caption": "Artwork illustrating the research topic, not a screenshot of experimental results.",
        "alt": "Abstract illustration for NewBrain learning and diagnostic research"
      },
      "id": "newbrain-numerical-limited-2026-10-19",
      "title": "NewBrain numerical diagnostic inconclusive; private evidence publication failed",
      "track": "Numerical diagnostics and evidence-quality limits",
      "date_basis": "October 19 NewBrain/GitHub record of a completed limited diagnostic and failed evidence publication.",
      "summary": "170 objective evaluations produced no saved sampled mismatches, but Q/K/V signals were below the frozen floor; final private evidence publication failed, so full qualification remains on hold.",
      "body": "The saved 40 coordinate-pair and two direction-pair comparisons found no mismatches and rejected two deliberately wrong-gradient controls. These signals were below the required 1e-6 nontriviality floor. Final private-owner execution evidence was not published. A subsequent metadata-only follow-up stopped before any model/worker started and made zero evaluations. No training updates occurred, and a stronger frozen probe remains unrun.",
      "boundary": "Scientific result INCONCLUSIVE; execution qualification HOLD. Older 30/30 sampled-gradient result is a different historical test. No improved Original12 score, generalized learning, Qwen comparison, optimizer fix or external university replication demonstrated.",
      "sources": [
        {
          "label": "Limited numerical diagnostic method",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/8aca55998eb88d2a23e8f1c0661328c449710e3b"
        },
        {
          "label": "Follow-up metadata-only hold",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/4be85fb73176a1d8f5ec7e26672557b0af9e594c"
        },
        {
          "label": "Read dashboard analysis",
          "url": "results.html#numerical-diagnostic-2026-10-19"
        }
      ],
      "project_page": "newbrain.html#numerical-diagnostic-2026-10-19"
    },
    {
      "project": "NewBrain",
      "date": "2026-10-19",
      "reviewed_on": "2026-10-19",
      "status": "development",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Concept illustration",
        "caption": "Artwork illustrating the research topic, not a screenshot of experimental results.",
        "alt": "Abstract illustration for NewBrain learning and diagnostic research"
      },
      "id": "newbrain-public4-retention-2026-10-19",
      "title": "NewBrain Public4 retention pilot: different outcomes, both 2/4 after reload",
      "track": "Public taught-answer acquisition and missing-information retention",
      "date_basis": "October 19 internally reviewed NewBrain four-response pilot and saved execution/cost closure documented on GitHub.",
      "summary": "Both 64-update training arms finished 2/4 after fresh reload. Supported-only teaching gained one supported answer and lost one missing-information pass; mixed teaching retained both controls but gained neither supported answer.",
      "body": "Separate from Public2 and Original12. Two training arms began at 2/4, used 64 updates each and ended at 2/4. All eight final response endpoints survived a distinct fresh-process reload with zero additional training. The mixed arm added 128 presentations and changed token-normalized loss weighting, so the comparison cannot isolate rehearsal content as the cause. Project-internal separate roles audited saved execution; independent university replication has not happened.",
      "boundary": "No net accuracy gain, unfamiliar-fact learning, held-out generalization or long-term retention established. Rehearsed missing-information controls are not learned facts. The older Original12 2/12 → 0/12 result, newer Original12 2/12 → 2/12 study and distinct Public2 1/2 → 2/2 follow-up retain their own benchmark histories.",
      "sources": [
        {
          "label": "Public4 saved method and scores",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/4da30cbc108624cf9253ae4f9e2c12840e0266f1"
        },
        {
          "label": "Read dashboard comparison",
          "url": "results.html#retention-pilot-2026-10-19"
        }
      ],
      "project_page": "newbrain.html#retention-pilot-2026-10-19"
    },
    {
      "id": "newbrain-256-training-2026-10-19",
      "title": "NewBrain completes 256-update Original12 study: 2/12 before and after",
      "project": "NewBrain",
      "track": "Controlled Original12 learning study and execution verification",
      "status": "development",
      "date": "2026-10-19",
      "date_basis": "October 19 saved execution, score and evidence records documented in the NewBrain and KiraWorld GitHub research commits; scoped internal independent audits, not university replication.",
      "reviewed_on": "2026-10-19",
      "summary": "Original12 scored 2/12 before training and 2/12 after 256 updates and a fresh-process reload. Two previously incorrect complete responses became correct while the two prior correct missing-information responses were lost. No net score gain.",
      "body": "The frozen separate study completed four 64-update blocks (256 updates; 1,536 repeated example presentations). Saved model state and counters, final strict whole-sequence scoring, process cleanup and finite evidence/cost closure passed scoped internal independent review. A successor custody/scoring adapter was separately reviewed but is not byte-identical to the historical scorer wrapper. Four current-profile execution controls (B0, B1, L0 and W0) qualified within scope; earlier failed attempts remain documented. Qwen comparison has not run.",
      "boundary": "This separate study did not improve total Original12 accuracy. Preserve the earlier Original12 2/12 baseline → 0/12 after separate 64-update training and the distinct Public2 0/2 → 1/2 earlier result plus 1/2 → 2/2 direct-trained/reload result. New gains displaced prior missing-information passes; the cause is unproven. No held-out generalization, long-term retention or external university replication was demonstrated.",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Research concept illustration",
        "caption": "Concept art for the internally audited 256-update Original12 research result, not an experiment screenshot.",
        "alt": "NewBrain neural architecture illustration for the October 19 experimental training report"
      },
      "sources": [
        {
          "label": "Latest public evidence and full report index",
          "url": "evidence.html#october-20-source-readings"
        },
        {
          "label": "October 19 evidence summary",
          "url": "research-status-2026-10-19.html"
        },
        {
          "label": "Readable development update",
          "url": "updates.html#newbrain-training-2026-10-19"
        },
        {
          "label": "GitHub four-control closure (private access may be required)",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/3f3697568cf4d28ebaeb4ab08669dcee085b3b4d"
        },
        {
          "label": "GitHub completed 256-update Original12 study (access may require sign-in)",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/bff3d65869341c0ba537a40a5e5ca66b469342a7"
        }
      ],
      "project_page": "newbrain.html#newbrain-current-2026-10-19"
    },
    {
      "id": "newbrain-three-token-reload-2026-10-18",
      "title": "NewBrain acquires a complete three-token answer and preserves it after restart",
      "project": "NewBrain",
      "track": "Trained public-answer learning and fresh-process persistence",
      "status": "prototype",
      "date": "2026-10-18",
      "date_basis": "NewBrain's independently internally audited result report in commit d46b8f46c9584893ae1edc469404a5183fd4b60d, October 18 at 10:51 PM Eastern.",
      "reviewed_on": "2026-10-18",
      "summary": "A new direct full-answer regimen moved two previously taught public examples from 1/2 to 2/2 correct, then reproduced both answers after a separate process restored the saved model.",
      "body": "The fixed direct regimen began from a pinned previously trained 1/2 Public2 checkpoint. Following 64 updates and 128 repeated presentations, the saved long target cup word one was fully generated alongside ball. Both remained correct after a different worker reloaded the saved state, with no added training. A matched-start curriculum arm stayed 1/2 and generated cup word c. The direct arm received twice the full-long-answer exposures of the curriculum arm (64 vs 32); this is a regimen contrast, not an isolated test of learning order. Original saved results and a separate four-generation reload check were independently audited internally.",
      "boundary": "Reacquisition of previously taught answers on two public examples, not unseen factual acquisition, delayed retention, resistance to interference, long-term identity memory, general conversation, verified advantage over curriculum learning, Original12 recovery or external university replication. Original12 remains 2/12 baseline and 0/12 after its separate trained/reloaded study.",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Research concept illustration",
        "caption": "Concept art representing a dated NewBrain trained-answer experiment, not a screenshot of the saved model or test logs.",
        "alt": "Glowing neural network illustration accompanying NewBrain's new trained-answer persistence milestone"
      },
      "sources": [
        {
          "label": "Read the explained new result",
          "url": "updates.html#newbrain-three-token-reload-2026-10-18"
        },
        {
          "label": "View Public2 experiment comparison",
          "url": "results.html#metrics"
        },
        {
          "label": "Research method (GitHub sign-in may be required)",
          "url": "https://github.com/rmcmurrer81/newbrain/blob/main/docs/research/2026-10-18-public2-persistence-result-and-method.md"
        }
      ],
      "project_page": "newbrain.html#latest-benchmarks-2026-10-18"
    },
    {
      "id": "newbrain-generation-diagnostic-2026-10-18",
      "title": "A read-only diagnostic isolates loss accounting from early stopping",
      "project": "NewBrain",
      "track": "Learning diagnosis and reproducibility",
      "status": "prototype",
      "date": "2026-10-18",
      "date_basis": "Internally independently audited diagnostic reported in NewBrain GitHub commit d686b298 dated October 18, 2026.",
      "reviewed_on": "2026-10-18",
      "summary": "All four execution controls qualified; three fixed loss measurements reconciled while multi-token generation still returned immediate EOS.",
      "body": "The fixed two-example read-only experiment returned short-row loss 1.311648803935947 and long-row loss 2.4736415515825474, with combined batch loss 2.086310635700347. The combined value agreed with the target-count-weighted row average to within 1e-12. Generation was ball for the one-word target and an empty output with immediate EOS for cup word one. No model updates, scoring calls, parameter or counter changes occurred. The independent reviewer inspected saved evidence without new model calls.",
      "boundary": "This is an internally audited fixed-point diagnostic, not a cause of early EOS, repair of Original12, new trained-on learning, delayed retention, Qwen comparison or external university replication. EOS-vs-word logits and position losses were not measured. The next fresh acquisition/stopping study remains proposed, not run.",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "NewBrain research concept",
        "caption": "Concept artwork for a numerical learning diagnostic; not a screenshot of its measured loss values.",
        "alt": "Illustration of a neural network as context for a completed narrow NewBrain diagnostic"
      },
      "sources": [
        {
          "label": "Read the public diagnostic summary",
          "url": "results.html#objective-generation-2026-10-18"
        },
        {
          "label": "Dated development note",
          "url": "updates.html#newbrain-generation-diagnostic-2026-10-18"
        },
        {
          "label": "GitHub NewBrain source record (access may be required)",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/d686b29810357b5f6c79c612c683e4158c140a5f"
        }
      ],
      "project_page": "newbrain.html#latest-benchmarks-2026-10-18"
    },
    {
      "id": "newbrain-sampled-gradient-2026-10-18",
      "title": "Thirty sampled NewBrain gradients pass independent internal checking",
      "project": "NewBrain",
      "track": "Numerical verification and accountable execution",
      "status": "prototype",
      "date": "2026-10-18",
      "date_basis": "GitHub NewBrain commit dated October 18, 2026, reporting an independent internal saved-data review of the original numerical-gradient producer's fixed checkpoint.",
      "reviewed_on": "2026-10-18",
      "summary": "A separate reviewer verified 30/30 sampled derivatives at each of three step sizes. The result narrows the research questions without changing learning accuracy.",
      "body": "An internal independent saved-data review accepted thirty selected primary coordinates across ten parameter arrays containing 11,914 scalars at a single Public2 checkpoint and public batch. Each of three step-size sweeps passed 30/30 (90 central differences from 181 original objective calls). The original producer ran once; the reviewer examined saved evidence without retraining or replaying model calls. Original12 stays 2/12 before training and 0/12 after a separate run; Public2 stays 0/2 to 1/2 trained-on after reload. The separate objective-versus-generation diagnostic has qualified its normal-execution and parent-exit controls while remaining scientific controls and generation evaluation are pending.",
      "boundary": "A local derivative sample, not an exhaustive gradient proof, Original12 causal diagnosis, fresh Qwen comparison, delayed retention, external academic replication, or improved answer score. The earlier failed audit attempts remain preserved.",
      "image": {
        "path": "assets/newbrain-cognitive-research-concept-2026-10-18.jpg",
        "label": "Cognitive research illustration",
        "caption": "Illustrative model-research art, not a screenshot of the numerical audit or a brain scan.",
        "alt": "Glowing synthetic neural network visualization used to represent a bounded numerical research milestone"
      },
      "sources": [
        {
          "label": "Current public research status",
          "url": "research-status-2026-10-18.html#measured"
        },
        {
          "label": "Read the Oct 18 verification summary",
          "url": "updates.html#newbrain-gradient-2026-10-18"
        },
        {
          "label": "NewBrain verification record (GitHub access may be required)",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/27c8460fd2acaf9b5eab24a140915e6f280d7f32"
        }
      ],
      "project_page": "newbrain.html#latest-benchmarks-2026-10-18"
    },
    {
      "id": "newbrain-public2-2026-10-18",
      "title": "NewBrain acquires one trained-on public answer after reload",
      "project": "NewBrain",
      "track": "Reproducible learning and numerical diagnostics",
      "status": "development",
      "date": "2026-10-18",
      "date_basis": "Internally reviewed Kira Labs Public2 and Original12 research summaries through October 18, 2026.",
      "reviewed_on": "2026-10-18",
      "summary": "One single-token trained-on answer became correct and survived an immediate fresh-process reload; a separate 12-case learning study regressed.",
      "body": "Public2: 0/2 baseline to 1/2 after 64 updates and 128 repeated presentations. The answer ball became exactly correct after reload, but the multi-token response stopped immediately. The separate Original12 study moved from 2/12 missing-information control passes to 0/12 after a different 64-update/384-presentation procedure. Four scoped execution controls have qualified. A gradient producer reported 30/30 checks within tolerance but the independent checker has not qualified them.",
      "boundary": "Not broad language learning, held-out generalization, delayed retention, a fixed Qwen head-to-head or proof of human-equivalent intelligence. The 30/30 gradient report is preliminary and its independent arithmetic audit remains incomplete.",
      "image": {
        "path": "assets/kira-labs-hero.webp",
        "label": "Kira Labs research concept art",
        "caption": "Existing lab illustration; not a screenshot of NewBrain training or a verified gradient calculation.",
        "alt": "Kira Labs research concept art used for context, not experimental evidence"
      },
      "sources": [
        {
          "label": "Current dated research status",
          "url": "research-status-2026-10-18.html#measured"
        },
        {
          "label": "Readable experiment journal",
          "url": "updates.html#newbrain-learning-2026-10-18"
        },
        {
          "label": "NewBrain repository (access may be required)",
          "url": "https://github.com/rmcmurrer81/newbrain"
        }
      ],
      "project_page": "newbrain.html#latest-benchmarks-2026-10-18"
    },
    {
      "id": "avatar-synthetic-events-2026-10-18",
      "title": "Skin geometry and eight synthetic sensory checks",
      "project": "Kira World",
      "track": "Avatar Builder / bounded sensory interfaces",
      "status": "prototype",
      "date": "2026-10-18",
      "date_basis": "Internal October 18 re-review of distinct saved geometry and synthetic-event engineering tests.",
      "reviewed_on": "2026-10-18",
      "summary": "A recorded five-pose geometry test exactly restored 512 sampled skin vertices, while an isolated invented-input event component qualified 8/8 checks.",
      "body": "The saved forearm experiment moved the declared sampled weighted vertices and restored original positions. The separate event component tested 0 V versus 0.00025 V on invented units, duplicate suppression, two-avatar isolation, session/epoch validation and explicit reset; it was internally audited without claiming an active NewBrain recipient.",
      "boundary": "No calibrated biological nerves, passive skin mechanics, 3D naturalistic deformation, working physiology, live body-to-brain sensory ingestion or motor action is established.",
      "image": {
        "path": "assets/garment-dressing-sequence-concept.png",
        "label": "Avatar concept illustration",
        "caption": "Existing concept illustration, not the recorded five-pose skin result or a live nervous system.",
        "alt": "Avatar-body concept art, not evidence of biological skin or touch"
      },
      "sources": [
        {
          "label": "October 18 avatar evidence",
          "url": "research-status-2026-10-18.html#body"
        },
        {
          "label": "Readable development note",
          "url": "updates.html#avatar-synthetic-events-2026-10-18"
        },
        {
          "label": "Kira World project",
          "url": "kira-world.html"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "temporary-creator-education-2026-10-18",
      "title": "Temporary AI Creator develops proposed educational companions",
      "project": "Kira World",
      "track": "Source-grounded expert and historical-persona research",
      "status": "development",
      "date": "2026-10-18",
      "date_basis": "October 18 review of inspected KiraWorld draft profiles, Creator templates and historical-persona guard transcript.",
      "reviewed_on": "2026-10-18",
      "summary": "KiraWorld includes draft expert identities and an archived constrained H. H. Holmes historical test. A source-grounded Civil War tutor with student-paced continuity is a future evaluation goal.",
      "body": "Temporary candidate profiles include programming, robotics, physics, legal-review and public-relations roles with distinct interests, knowledge/source plans and candidate life cycles. H. H. Holmes has a deterministic late-1893 guard transcript whose 12 accepted replies are largely identical; it does not demonstrate independent historical knowledge. A proposed classroom tutor would separate documented history and invented characterization while letting a learner ask for a break and later resume a verified step.",
      "boundary": "No certified experts, realistic free-form historical conversation, automatic stress assessment, validated school lesson-resumption, live NewBrain cognitive backend or educational effectiveness is demonstrated.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Kira World concept illustration",
        "caption": "Existing Kira World concept image; no deployed tutor or recreated historical person shown.",
        "alt": "Kira World concept illustration of connected digital environments"
      },
      "sources": [
        {
          "label": "Temporary AI Creator discussion",
          "url": "kira-world.html#temporary-ai-creator"
        },
        {
          "label": "October 18 Creator journal entry",
          "url": "updates.html#temporary-creator-2026-10-18"
        },
        {
          "label": "Dated current project boundaries",
          "url": "research-status-2026-10-18.html#people"
        }
      ],
      "project_page": "kira-world.html#temporary-ai-creator"
    },
    {
      "id": "synthetic-robert-2026-07-12",
      "title": "Synthetic Robert's first recorded day",
      "project": "Kira World",
      "track": "Digital Twin / distinct personal identities",
      "status": "prototype",
      "date": "2026-07-12",
      "date_basis": "October 18, 2026 Codex review of the owner's local profile metadata, Windows file timestamps and preserved chat log. The private originals are not published or independently replicated.",
      "reviewed_on": "2026-10-18",
      "summary": "Synthetic Robert's separate profile and first completed local text exchange date to July 12, 2026; approved self-voice reference work followed July 14–17.",
      "body": "The reported profile creation time is July 12 at 5:35:31 PM Eastern, with corroborating Windows file/folder creation at 5:37:24 PM. The earliest saved complete chat has Robert's message at 6:01:17 PM and Synthetic Robert's reply at 6:01:28 PM. The current Chatterbox reference WAV was created July 14 at 11:08:46 PM, with the saved private-use authorization dated July 17 at 3:05 AM. Subsequent work added owner-authorized, source-attributed recollections and correction-aware memory context. Synthetic Robert has a separate identity from the biological Robert.",
      "boundary": "A saved first text conversation does not establish the date of first successful Chatterbox playback; that date remains unverified. Raw private chats and audio are not published. Local records were reviewed by Codex but have not been independently replicated. A completed 3D twin body, autonomous life loop, live NewBrain-backed learning and clinical outcomes are not demonstrated.",
      "image": {
        "path": "assets/kira-world-k-logo-512.png",
        "label": "Kira Labs research milestone",
        "caption": "The Kira Labs emblem identifies this early Synthetic Robert milestone; it is not an image of the July 12 chat or a portrait of the twin.",
        "alt": "Kira Labs gold K emblem representing a dated Synthetic Robert development milestone"
      },
      "sources": [
        {
          "label": "Read the dated milestone",
          "url": "updates.html#synthetic-robert-2026-07-12"
        },
        {
          "label": "Chatterbox self-voice authorization (GitHub access may be required)",
          "url": "https://github.com/rmcmurrer81/KiraWorld/blob/main/Voice/authorizations/robert_self_voice_runtime_approval_20260717.json"
        },
        {
          "label": "September memory development",
          "url": "updates.html#digital-twin-2026-09-20"
        }
      ],
      "project_page": "kira-world.html#digital-twin"
    },
    {
      "id": "kira-friend-dual-chat-2025-08",
      "title": "Kira meets an unnamed Friend",
      "project": "Kira World",
      "track": "Early Kira",
      "status": "prototype",
      "date": "2025-08-05",
      "date_basis": "Earliest recovered project/conversation record for the Kira + Friend dual-chat prototype.",
      "reviewed_on": "2026-10-06",
      "summary": "An early desktop chatbot placed Kira beside an unnamed Friend and let the two exchange scripted or rule-driven dialogue.",
      "body": "The two-character app could alternate Kira and Friend responses and support automatic back-and-forth. This was not yet two independent persistent AIs. The experiment matters because it introduced the idea that Kira should have another synthetic companion; the unnamed Friend later became the conceptual predecessor of Lisa.",
      "boundary": "Historical working prototype. The dialogue was largely scripted or rule-driven, and the unnamed Friend did not yet have Lisa’s later separate persistent identity, memories, relationship state or continuity.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Current project illustration",
        "caption": "A current Kira World illustration used for historical context. It is not a screenshot of the 2025 Kira + Friend app.",
        "alt": "Kira World concept illustration used to represent the early Kira and Friend milestone"
      },
      "sources": [
        {
          "label": "Read the project history",
          "url": "about.html"
        },
        {
          "label": "Reviewed Kira World history",
          "url": "knowledge.html#kira-world"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-UYsKn8lzhWs",
      "title": "A public look inside Kira World",
      "project": "Kira World",
      "track": "Kira World",
      "status": "demo",
      "date": "2026-07-23",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A public update brings together person-specific continuity, local voice, Home World and body work.",
      "body": "Identity, reviewed memory and voice are discussed alongside the distinction between intended movement and completed action.",
      "boundary": "A dated progress report. Natural blinking and parts of body and world integration were still unfinished.",
      "image": {
        "path": "assets/kira-world-shell-actual.png",
        "label": "Actual development screenshot",
        "caption": "An existing public screenshot illustrating the project; it is not a frame from, or dated to, the selected video.",
        "alt": "Kira World Shell with a Home World view and conversation"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-UYsKn8lzhWs"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=UYsKn8lzhWs"
        }
      ],
      "video": {
        "id": "UYsKn8lzhWs",
        "title": "A public look inside Kira World"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-8vjcEBJTwbM",
      "title": "The Video Studio direction",
      "project": "Video Studio",
      "track": "Video Studio",
      "status": "demo",
      "date": "2026-07-23",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A public explainer describes the preserved local v1.9 production workflow and a separately staged next version.",
      "body": "The preserved workflow organizes research, scripts, narration, captions and MP4 assembly. The next version explores versioned projects and corrections that preserve good work.",
      "boundary": "The local baseline and proposed interface are distinct. Illustrated future screens are concept art.",
      "image": {
        "path": "assets/video-studio-concept.png",
        "label": "Concept visualization",
        "caption": "An illustration of a possible Video Studio interface, not the current application or a frame from the selected video.",
        "alt": "Concept of a future Video Studio production workspace"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-8vjcEBJTwbM"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=8vjcEBJTwbM"
        }
      ],
      "video": {
        "id": "8vjcEBJTwbM",
        "title": "The Video Studio direction"
      },
      "project_page": "video-studio.html"
    },
    {
      "id": "youtube-h5RQiAlBVYw",
      "title": "Temporary Creator explained",
      "project": "Kira World",
      "track": "Temporary Creator",
      "status": "demo",
      "date": "2026-07-24",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A public explainer follows creation type, sources, historical date, appearance references, voice evidence and intended world placement.",
      "body": "Historical versions are synthetic interpretations. The longer-term direction connects each person to a place in a world and to creative work.",
      "boundary": "The workflow is explained publicly; complete animated residents and world placement are not demonstrated by the description.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-h5RQiAlBVYw"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=h5RQiAlBVYw"
        }
      ],
      "video": {
        "id": "h5RQiAlBVYw",
        "title": "Temporary Creator explained"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-e3vaQFJ04Qo",
      "title": "A continuing personal expert",
      "project": "Kira World",
      "track": "Minds and learning",
      "status": "demo",
      "date": "2026-07-24",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A published concept explores a continuing tutor who adapts explanations and conversation while retaining identity and permissioned memory.",
      "body": "The intended design includes source grounding, student safeguards and the ability to move between learning and ordinary conversation.",
      "boundary": "A learning concept, not a validated tutoring product or measured educational outcome.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-e3vaQFJ04Qo"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=e3vaQFJ04Qo"
        }
      ],
      "video": {
        "id": "e3vaQFJ04Qo",
        "title": "A continuing personal expert"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-vNRTwMvkR3g",
      "title": "A spoken character test",
      "project": "Kira World",
      "track": "Temporary Creator",
      "status": "demo",
      "date": "2026-07-24",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "The public description reports spoken questions and an individualized test voice answering as an unofficial synthetic interpretation of Peter Parker.",
      "body": "The published test keeps a broken response visible and distinguishes generated continuation ideas from confirmed story details.",
      "boundary": "The test reports an internal-language error and no finished avatar. The interpretation and voice are unofficial.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-vNRTwMvkR3g"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=vNRTwMvkR3g"
        }
      ],
      "video": {
        "id": "vNRTwMvkR3g",
        "title": "A spoken character test"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-nj2ZcdfxSWI",
      "title": "An interview with the past",
      "project": "Kira World",
      "track": "Temporary Creator",
      "status": "demo",
      "date": "2026-07-24",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "The public description reports a spoken interview with an 1894-set synthetic interpretation of H. H. Holmes.",
      "body": "The description identifies the voice as generic Windows speech, not an authentic recording of the historical person.",
      "boundary": "The test retains a chronology error, disputed historical claims and evasive answers.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-nj2ZcdfxSWI"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=nj2ZcdfxSWI"
        }
      ],
      "video": {
        "id": "nj2ZcdfxSWI",
        "title": "An interview with the past"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-rYuwe1dgAeI",
      "title": "Testing a synthetic expert",
      "project": "Kira World",
      "track": "Temporary Creator and robotics",
      "status": "demo",
      "date": "2026-07-25",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A public test describes a synthetic robotics expert discussing mechanical structure, servos, sensors and a small OpenSCAD concept.",
      "body": "The test explores what an expert needs beyond professional knowledge to become a more individual conversational person.",
      "boundary": "False saved-file claims and a file-type error remain visible. The interview is not a working robot.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-rYuwe1dgAeI"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=rYuwe1dgAeI"
        }
      ],
      "video": {
        "id": "rYuwe1dgAeI",
        "title": "Testing a synthetic expert"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-5Nllo6oAfYA",
      "title": "Testing the limits of recall",
      "project": "Kira World",
      "track": "Temporary Creator",
      "status": "demo",
      "date": "2026-07-25",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A spoken character test begins with identity, interests and a Paris setting before moving into detailed factual questions.",
      "body": "Invented memories and confused story facts are corrected during the published test rather than edited into a claim of reliability.",
      "boundary": "The test reveals factual and internal-language failures. It does not establish reliable canon recall.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-5Nllo6oAfYA"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=5Nllo6oAfYA"
        }
      ],
      "video": {
        "id": "5Nllo6oAfYA",
        "title": "Testing the limits of recall"
      },
      "project_page": "kira-world.html"
    },
    {
      "id": "youtube-nsfpHVfVfho",
      "title": "A Studio workflow walkthrough",
      "project": "Video Studio",
      "track": "Video Studio",
      "status": "demo",
      "date": "2026-07-26",
      "date_basis": "Public video publication date — not an independently verified implementation date.",
      "reviewed_on": "2026-09-08",
      "summary": "A public Moon-phase walkthrough follows project setup, research, scripting, storyboard review, source audio and revisions into an owner-review package.",
      "body": "The intended workflow preserves unaffected work when one section changes. Publication remains under the user’s control.",
      "boundary": "A published workflow demonstration, with owner review and no automatic publication.",
      "image": {
        "path": "assets/video-studio-concept.png",
        "label": "Concept visualization",
        "caption": "An illustration of a possible Video Studio interface, not the current application or a frame from the selected video.",
        "alt": "Concept of a future Video Studio production workspace"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#youtube-nsfpHVfVfho"
        },
        {
          "label": "Watch the public video",
          "url": "https://www.youtube.com/watch?v=nsfpHVfVfho"
        }
      ],
      "video": {
        "id": "nsfpHVfVfho",
        "title": "A Studio workflow walkthrough"
      },
      "project_page": "video-studio.html"
    },
    {
      "id": "continuity-prototype",
      "title": "Conversation foundations",
      "project": "Kira World",
      "track": "Minds & memory",
      "status": "prototype",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-08. Completion date not established.",
      "reviewed_on": "2026-09-08",
      "summary": "Person-specific profiles, reviewed records and local speech experiments provide foundations for returning to a continuing identity.",
      "body": "The public notes describe person-specific continuity across bounded restarts. Identity records and reviewed memory remain distinct from what the model merely says.",
      "boundary": "Working prototypes do not yet establish a complete independent life in a shared world.",
      "image": {
        "path": "assets/kira-world-shell-actual.png",
        "label": "Actual development screenshot",
        "caption": "An existing public screenshot illustrating the project; it is not a frame from, or dated to, the selected video.",
        "alt": "Kira World Shell with a Home World view and conversation"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#continuity-prototype"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "continuity-now",
      "title": "Connecting people and worlds",
      "project": "Kira World",
      "track": "Minds & memory",
      "status": "development",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-08. Completion date not established.",
      "reviewed_on": "2026-09-08",
      "summary": "Integration work connects continuing conversations to places, activities and a more complete sense of presence.",
      "body": "Kira and Lisa retain distinct identities in the design. Moving between conversations, worlds and devices should preserve that distinction.",
      "boundary": "Consistent shared daily life across worlds and devices still needs direct, complete demonstrations.",
      "image": {
        "path": "assets/kira-world-shell-actual.png",
        "label": "Actual development screenshot",
        "caption": "An existing public screenshot illustrating the project; it is not a frame from, or dated to, the selected video.",
        "alt": "Kira World Shell with a Home World view and conversation"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#continuity-now"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "home-now",
      "title": "A first place to walk",
      "project": "Kira World",
      "track": "Home World",
      "status": "prototype",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-08. Completion date not established.",
      "reviewed_on": "2026-09-08",
      "summary": "A basic walkable one-bedroom Home World shell exists: a concrete starting point for the larger continuing-home vision.",
      "body": "",
      "boundary": "The prototype is the walkable shell. Populated rooms, persistent objects and shared everyday life remain further work.",
      "image": {
        "path": "assets/current-home-world-prototype.png",
        "label": "Actual development screenshot",
        "caption": "The basic walkable one-bedroom Home World shell.",
        "alt": "Walkable one-bedroom Home World development prototype"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#home-now"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "body-now",
      "title": "A body before the clothing",
      "project": "Kira World",
      "track": "Body & world interaction",
      "status": "development",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-08. Completion date not established.",
      "reviewed_on": "2026-09-08",
      "summary": "Articulated test-body requirements and garment fixtures establish how bodies, clothes and objects should interact.",
      "body": "A garment is a separate object. Dressing, closures, folding, hanging and collisions each need controlled, observable tests.",
      "boundary": "Requirements and test design are preparation, not finished clothing physics or a fully animated resident.",
      "image": {
        "path": "assets/garment-dressing-sequence-concept.png",
        "label": "Concept visualization",
        "caption": "An illustrated dressing sequence, not completed clothing physics.",
        "alt": "Concept of a garment dressing sequence"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#body-now"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "notebook-next",
      "title": "One home. More worlds.",
      "project": "Kira World",
      "track": "Notebook Worlds",
      "status": "future",
      "date": null,
      "date_basis": "Future goal — timing not set.",
      "reviewed_on": "2026-09-08",
      "summary": "Purpose-built places for learning, travel, creativity, history and play, with continuity back to Home World.",
      "body": "",
      "boundary": "Proposed uses, not a catalogue of populated worlds ready to enter. No release date is promised.",
      "image": {
        "path": "assets/kira-labs-hero.webp",
        "label": "Concept visualization",
        "caption": "A long-term Kira World illustration, not a finished world or VR product.",
        "alt": "Concept visualization of connected Kira World experiences"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#notebook-next"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "vr-next",
      "title": "Step into the same world",
      "project": "Kira World",
      "track": "Accessible virtual reality",
      "status": "future",
      "date": null,
      "date_basis": "Future goal — timing not set.",
      "reviewed_on": "2026-09-08",
      "summary": "A future VR experience would share the same places, identities and histories through multiple ways to interact.",
      "body": "",
      "boundary": "Comfort, accessibility, interaction and compatibility need testing. No finished VR product or headset support list is claimed.",
      "image": {
        "path": "assets/kira-labs-hero.webp",
        "label": "Concept visualization",
        "caption": "A long-term Kira World illustration, not a finished world or VR product.",
        "alt": "Concept visualization of connected Kira World experiences"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#vr-next"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "servers-next",
      "title": "More people. Shared worlds.",
      "project": "Kira World",
      "track": "Future servers & connected worlds",
      "status": "future",
      "date": null,
      "date_basis": "Future goal — timing not set.",
      "reviewed_on": "2026-09-08",
      "summary": "The longer-term aim is multiple synthetic people and simultaneous worlds, with visitors joining through VR and responsive conversation.",
      "body": "Shared state, recovery, end-to-end latency and simultaneous users need measured load tests before choosing capacity.",
      "boundary": "No server count, capacity, latency guarantee or hardware purchase is established.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#servers-next"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "robotics-next",
      "title": "Beyond the screen",
      "project": "Kira World",
      "track": "Compatible physical embodiment",
      "status": "future",
      "date": null,
      "date_basis": "Future goal — timing not set.",
      "reviewed_on": "2026-09-08",
      "summary": "Explore whether a continuing identity could interact through compatible robotic hardware, starting in simulation.",
      "body": "Simulation and controlled tests come first. Sensors, physical movement and authority for actions each need their own evidence.",
      "boundary": "No deployed autonomous robot, supported hardware list or delivery date is claimed.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Concept visualization",
        "caption": "An illustration of the direction of Kira World, not a finished application or a frame from this milestone.",
        "alt": "Concept illustration connecting people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#robotics-next"
        }
      ],
      "project_page": "kira-world.html"
    },
    {
      "id": "lab-website-2026-08",
      "title": "Kira Labs on the web",
      "project": "Lab & website",
      "track": "Lab & website",
      "status": "demo",
      "date": "2026-08-14",
      "date_basis": "Git commit date (Eastern Time).",
      "reviewed_on": "2026-09-13",
      "summary": "The repository records restoration of the public Kira Labs site and an automatic GitHub Pages rebuild workflow.",
      "body": "",
      "boundary": "This is a dated website-history entry, not a founding date for the lab.",
      "image": {
        "path": "assets/kira-world-k-logo-512.png",
        "label": "Lab identity",
        "caption": "The existing Kira Labs / Kira World mark, used to identify website updates. It is not a screenshot of the website on the milestone date.",
        "alt": "Kira Labs gold K logo"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#lab-website-2026-08"
        }
      ],
      "project_page": "about.html"
    },
    {
      "id": "lab-guide-2026-09",
      "title": "A public guide to the work",
      "project": "Lab & website",
      "track": "Lab & website",
      "status": "demo",
      "date": "2026-09-07",
      "date_basis": "Git commit date (Eastern Time).",
      "reviewed_on": "2026-09-13",
      "summary": "The website gained a browser-based guide, sourced biographies, a book catalogue and direct email access.",
      "body": "",
      "boundary": "The original website guide was called Sarah. The redesign names the site guide Iris; it is not a Kira World resident.",
      "image": {
        "path": "assets/kira-world-k-logo-512.png",
        "label": "Lab identity",
        "caption": "The existing Kira Labs / Kira World mark, used to identify website updates. It is not a screenshot of the website on the milestone date.",
        "alt": "Kira Labs gold K logo"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#lab-guide-2026-09"
        }
      ],
      "project_page": "about.html"
    },
    {
      "id": "lab-timeline-2026-09",
      "title": "Progress becomes easier to follow",
      "project": "Lab & website",
      "track": "Lab & website",
      "status": "demo",
      "date": "2026-09-08",
      "date_basis": "Git commit date (Eastern Time).",
      "reviewed_on": "2026-09-13",
      "summary": "An interactive timeline and versioned public knowledge packs were added to the Kira Labs website.",
      "body": "",
      "boundary": "The entries record published evidence and stated limits. They are not live monitoring of private development.",
      "image": {
        "path": "assets/kira-world-k-logo-512.png",
        "label": "Lab identity",
        "caption": "The existing Kira Labs / Kira World mark, used to identify website updates. It is not a screenshot of the website on the milestone date.",
        "alt": "Kira Labs gold K logo"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#lab-timeline-2026-09"
        }
      ],
      "project_page": "about.html"
    },
    {
      "id": "studio-tests-2026-09",
      "title": "Local media tests, with their limits",
      "project": "Video Studio",
      "track": "Video Studio",
      "status": "prototype",
      "date": "2026-09-08",
      "date_basis": "Date stated in the published technical notes; not a fresh test during this website redesign.",
      "reviewed_on": "2026-09-08",
      "summary": "Published technical notes record local portrait-generation and audio-driven facial-video tests on September 8.",
      "body": "The notes distinguish tested pipeline components from model configuration. A selected motion model is not evidence of a completed acting shot.",
      "boundary": "Completed generation is not approval of likeness, mouth detail or cinematic quality. Speech generation also had a later failure.",
      "image": {
        "path": "assets/video-studio-concept.png",
        "label": "Concept visualization",
        "caption": "An illustration of a possible Video Studio interface, not the current application or a frame from the selected video.",
        "alt": "Concept of a future Video Studio production workspace"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#studio-tests-2026-09"
        }
      ],
      "project_page": "video-studio.html"
    },
    {
      "id": "shiftbrief-010",
      "title": "ShiftBrief 0.1.0 released",
      "project": "ShiftBrief",
      "track": "ShiftBrief",
      "status": "released",
      "date": "2026-09-12",
      "date_basis": "GitHub release published September 12 at 9:20 p.m. Eastern (September 13, 01:20 UTC).",
      "reviewed_on": "2026-09-13",
      "summary": "A free Windows release brings employee records, availability, saved schedules, planned work and records-based assistance into one local workspace.",
      "body": "A fresh installation starts with a blank business. The optional Maple Street example uses fictional records. Business copies and full backups support moving saved work.",
      "boundary": "An early, unsigned independent release. Core Records mode is local; AI models are optional and not bundled. Review suggestions and keep backups.",
      "image": {
        "path": "assets/shiftbrief-overview-actual.png",
        "label": "Actual app · fictional demo records",
        "caption": "The optional fictional Maple Street demo inside ShiftBrief.",
        "alt": "ShiftBrief local workspace with fictional team records"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#shiftbrief-010"
        }
      ],
      "project_page": "shiftbrief.html"
    },
    {
      "id": "studio-ranges-now",
      "title": "Precise excerpts, preserved projects",
      "project": "Video Studio",
      "track": "Video Studio",
      "status": "development",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-12. Completion date not established.",
      "reviewed_on": "2026-09-12",
      "summary": "Private local Studio work covers source start points, durations, saved sequence rows and selected-range exports with video and audio checks.",
      "body": "The preserved v1.9 chapter workflow and 14-chapter output remain part of the project’s history. New work does not replace those originals.",
      "boundary": "Consistent photoreal scenes and the complete chat-to-finished-video workflow remain unfinished.",
      "image": {
        "path": "assets/video-studio-concept.png",
        "label": "Concept visualization",
        "caption": "An illustration of a possible Video Studio interface, not the current application or a frame from the selected video.",
        "alt": "Concept of a future Video Studio production workspace"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#studio-ranges-now"
        }
      ],
      "project_page": "video-studio.html"
    },
    {
      "id": "travel-debug",
      "title": "Sarah Travel: private debug builds",
      "project": "Sarah Travel",
      "track": "Sarah Travel",
      "status": "prototype",
      "date": null,
      "date_basis": "Dated public notes; reviewed 2026-09-12. Completion date not established.",
      "reviewed_on": "2026-09-12",
      "summary": "Android and Windows experiments bring together travel planning, protected online routing and an offline fallback.",
      "body": "",
      "boundary": "Not a public release or a listed Google Play app. Physical-device verification and release-level testing remain.",
      "image": {
        "path": "assets/sarah-travel-actual-phone.jpg",
        "label": "Actual private debug build",
        "caption": "An existing Sarah Travel Android development screenshot; this is not a public release.",
        "alt": "Sarah Travel private Android debug screen"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#travel-debug"
        }
      ],
      "project_page": "sarah-travel.html"
    },
    {
      "id": "newbrain-research-2026-09-29",
      "title": "NewBrain research begins",
      "project": "NewBrain",
      "track": "Cognitive architecture research",
      "status": "development",
      "date": "2026-09-29",
      "date_basis": "Dated repository and development records; the controlled learning benchmark was still in progress when reviewed September 30, 2026.",
      "reviewed_on": "2026-09-30",
      "summary": "NewBrain begins controlled testing as a possible reusable cognitive layer for Kira World and other synthetic people.",
      "body": "The research combines source-traceable computational neuron models, neural-recording comparisons, external simulator checks and small engineered learning experiments. A current benchmark compares six approaches on learning, retention, reversal, interference and false associations, including simple indexed memory as a control.",
      "boundary": "This is an early research prototype, not a recreated human brain. The current benchmark has not yet demonstrated an advantage, and Kira’s live identity, reviewed memories and public speech remain disconnected from the test.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Research concept visualization",
        "caption": "Kira World concept art used to represent the NewBrain research milestone; not a brain scan, benchmark chart or finished cognitive system.",
        "alt": "Concept visualization connecting synthetic people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "Read this update",
          "url": "updates.html#newbrain-research-2026-09-29"
        },
        {
          "label": "NewBrain status in Kira World",
          "url": "kira-world.html#newbrain"
        },
        {
          "label": "Watch the NewBrain video playlist",
          "url": "https://www.youtube.com/watch?v=YgV4m1xnK9A&list=PLGMVpR5GxXNw&pp=sAgC"
        }
      ],
      "playlist": {
        "id": "PLGMVpR5GxXNw",
        "lead_video": "YgV4m1xnK9A",
        "eyebrow": "NEWBRAIN · RESEARCH VIDEO COLLECTION",
        "title": "NewBrain Research Updates",
        "cover_title": "NEWBRAIN",
        "cover_emphasis": "Research updates.",
        "cover_bottom": "Learning · Memory · Vision · Hearing",
        "description": "Follow NewBrain through benchmark results, delayed-feedback learning work, vision and hearing plans, and future cognitive-architecture experiments for Kira World and synthetic people.",
        "open_label": "Open NewBrain playlist on YouTube ↗",
        "episodes_label": "Explore the NewBrain videos"
      },
      "project_page": "kira-world.html#newbrain"
    },
    {
      "id": "newbrain-first-model-2026-10-05",
      "title": "NewBrain becomes Kira Labs’ first internally developed model",
      "project": "NewBrain",
      "track": "Cognitive model research",
      "status": "development",
      "date": "2026-10-05",
      "date_basis": "Kira Labs public-site milestone dated October 5, 2026; measured claims link to preserved NewBrain repository evidence.",
      "reviewed_on": "2026-10-05",
      "summary": "Kira Labs now presents NewBrain as its first internally developed experimental trainable cognitive model, while keeping current evidence and limitations explicit.",
      "body": "NewBrain is a composite research-stage cognitive architecture with trainable components for language learning, plasticity, value learning and controlled hearing, plus episodic-memory and sensory research. On the exposed command-learning task, rehearsal retained all 216 earlier and 162 new examples in each of five repetitions. The result is task-specific, not evidence of unrestricted conversation.",
      "boundary": "NewBrain is not yet a general conversational AI or Qwen replacement. Broad vision and hearing, genuine restart-persistent semantic memory, a functioning embodied avatar and a fair matched Qwen comparison remain unproved.",
      "image": {
        "path": "assets/kira-world-ecosystem.webp",
        "label": "Research concept visualization",
        "caption": "Kira World concept art used to represent NewBrain research; not a brain scan, model diagram or benchmark chart.",
        "alt": "Concept visualization connecting synthetic people, memory and digital worlds"
      },
      "sources": [
        {
          "label": "NewBrain research repository",
          "url": "https://github.com/rmcmurrer81/newbrain"
        },
        {
          "label": "Five-run retention evidence",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/9a2588e507e75033fb3753fa33d989eecec0d769"
        },
        {
          "label": "Controlled-hearing engineering result",
          "url": "https://github.com/rmcmurrer81/newbrain/commit/1dc2d951ac310ce8b6d4cad7c1cb23a7dbc387ac"
        }
      ],
      "project_page": "newbrain.html"
    },
    {
      "id": "patient-horizon-starter-2026-10-15",
      "title": "Patient Horizon begins with synthetic research planning",
      "project": "Patient Horizon",
      "track": "Patient records and medical-avatar research",
      "status": "development",
      "date": "2026-10-15",
      "date_basis": "Patient Horizon repository initial setup October 15; continuous-record research requirements updated October 16, 2026.",
      "reviewed_on": "2026-10-16",
      "summary": "A synthetic-only scenario planner and four reported starter tests establish the first research framework for versioned patient records and future clinician-reviewed digital twins.",
      "body": "The new private repository includes a Python request planner, fictional research examples, JSON schemas and provenance templates. Four local starter tests reportedly passed on October 15. An October 16 specification prioritizes authorized lab/scans updating versioned records and medical timelines, with dated medical research and clinical-trial evidence intended for physician review. The existing generic Avatar Builder source is a versioned snapshot, not an integrated medical body.",
      "boundary": "This is not a deployed patient application. No real medical data, working intake, segmentation, disease simulator, evidence search, trial matching, treatment prediction or clinically validated medical model is present. The tests measure the synthetic planner only.",
      "image": {
        "path": "assets/kira-labs-hero.webp",
        "label": "General Kira Labs concept art",
        "caption": "Existing Kira Labs project illustration used for research context; not a screenshot of Patient Horizon, patient scans or a treatment prediction.",
        "alt": "General Kira Labs concept artwork, not a medical-avatar result"
      },
      "sources": [
        {
          "label": "Read the project page",
          "url": "patient-horizon.html"
        },
        {
          "label": "Read the October 15 development note",
          "url": "updates.html#patient-horizon-starter-2026-10-15"
        },
        {
          "label": "Patient Horizon GitHub repository (private; access required)",
          "url": "https://github.com/rmcmurrer81/Patient-Horizon"
        }
      ],
      "project_page": "patient-horizon.html"
    },
    {
      "id": "lung-body-requirements-2026-10-16",
      "title": "Lung–body–NewBrain research requirements documented",
      "project": "Kira World",
      "track": "Anatomical embodiment research",
      "status": "development",
      "date": "2026-10-16",
      "date_basis": "October 16, 2026 requirements documents in KiraWorld and Patient Horizon; no lung trial was qualified.",
      "reviewed_on": "2026-10-16",
      "summary": "The intended pathway from neural breathing control through diaphragm and lungs to blood gas exchange and return sensory signals is now specified for future testing.",
      "body": "KiraWorld documents a prospective human-inspired pathway: neural commands through breathing muscles and mechanics, lung airflow, gas exchange, circulation and observed body inputs returning through a typed adapter. Each layer needs correct units, timestamps, provenance, validation and controlled tests. A separate forearm skin test moved and exactly restored 512 sampled weighted vertices in a geometric control. The current lung requirements do not demonstrate an operating organ.",
      "boundary": "No breathing-lung prototype, working physiological lung, blood gas solver, patient-specific effect or two-way NewBrain–lung test has passed. The separate skin result is a geometric control and cannot be counted as lung or brain/body integration.",
      "image": {
        "path": "assets/garment-dressing-sequence-concept.png",
        "label": "Avatar body concept illustration",
        "caption": "Existing Avatar Builder concept art, not a screenshot of functioning lungs or a verified NewBrain–body connection.",
        "alt": "Concept illustration for avatar body work, not an organ simulation"
      },
      "sources": [
        {
          "label": "Patient Horizon lung research overview",
          "url": "patient-horizon.html#lung-research"
        },
        {
          "label": "Read the October 16 lung milestone",
          "url": "updates.html#lung-body-requirements-2026-10-16"
        },
        {
          "label": "KiraWorld requirements (private; access required)",
          "url": "https://github.com/rmcmurrer81/KiraWorld/blob/main/Avatar/avatar_builder/research/LUNG_BRAIN_HUMAN_BODY_REQUIREMENTS_2026-10-16.md"
        }
      ],
      "project_page": "patient-horizon.html#lung-research"
    },
    {
      "id": "pulse-three-architecture-2026-10-16",
      "title": "Pulse, Three.js and NewBrain: a proposed body-system bridge",
      "project": "Kira World",
      "track": "Physiology and embodied AI research",
      "status": "development",
      "date": "2026-10-16",
      "date_basis": "October 16, 2026 KiraWorld architecture research record; software bridge and combined runtime not yet tested.",
      "reviewed_on": "2026-10-16",
      "summary": "Kira Labs documents a proposed integration: Pulse for model-based physiology, Three.js for the visible avatar and a local versioned bridge for future NewBrain commands and feedback.",
      "body": "The research design assigns separate roles to Kitware's Pulse Physiology Engine, Three.js, Blender-generated body assets and NewBrain. The proposed local adapter must handle simulator time, units, provenance, per-avatar identity, disconnections and model limitations. Pulse's existing respiratory models do not automatically supply the desired neural-to-breathing-muscle controller. No concurrent Pulse–Three.js–NewBrain run has been verified. The separate measured 512-vertex forearm restoration is a geometric result, not evidence of lungs or a neural bridge.",
      "boundary": "A design milestone only. No working Pulse-driven KiraWorld lung, clinical physiology model, live 3D physiological animation, two-way NewBrain input/output or disease prediction is demonstrated; NewBrain's last measured learning benchmark remains 2/12.",
      "image": {
        "path": "assets/pulse-threejs-visuals.webp",
        "label": "Original concept illustrations",
        "caption": "Original medical-style concept illustrations, not screenshots of Pulse, Three.js, an integrated bridge or patient data.",
        "alt": "Concept imagery comparing a fictional medical physiology display and a translucent anatomical avatar; these are proposed technology roles, not running software"
      },
      "sources": [
        {
          "label": "Architecture explanation",
          "url": "patient-horizon.html#physiology-bridge"
        },
        {
          "label": "NewBrain body interface",
          "url": "newbrain.html#body-interface"
        },
        {
          "label": "Readable October 16 note",
          "url": "updates.html#pulse-three-architecture-2026-10-16"
        },
        {
          "label": "KiraWorld design requirements (private; access required)",
          "url": "https://github.com/rmcmurrer81/KiraWorld/blob/main/Avatar/avatar_builder/research/PULSE_THREE_NEWBRAIN_REUSABLE_LUNG_PLAN.md"
        }
      ],
      "project_page": "patient-horizon.html#physiology-bridge"
    },
    {
      "id": "companion-robot-ros2-bridge-2026-10-16",
      "title": "A bounded ROS 2 bridge for future companion robots",
      "project": "Kira World",
      "track": "Robotics and simulated embodiment",
      "status": "development",
      "date": "2026-10-16",
      "date_basis": "October 16, 2026 public website summary of an August 18, 2026 standalone bridge validation report and a separately proposed future NewBrain integration.",
      "reviewed_on": "2026-10-16",
      "summary": "KiraWorld documents a vendor-neutral high-level intention bridge for speech, gaze, expression and gesture, with 88 locally reported passing tests and a still-unbuilt NewBrain/robot connection.",
      "body": "The standalone reference includes ROS 2 message definitions, fail-closed request validation, source-scoped mock sessions, terminal status models, duplicate/timeout checks and privacy-reduced evidence. The August 18 project report records 88 passing standalone tests, four admitted mock social intentions, one rejected gesture and 18 verified lifecycle records. A future companion robot would accept bounded requests through a confirmed official simulator/adapter; Kira World would preserve person-specific identity, memory and continuity. NewBrain could be tested as a separate future source of learning and decision inputs, but it is not currently connected.",
      "boundary": "This milestone documents local policy/session software and an architecture plan, not a ROS 2 build in an approved target environment, authenticated Kira World session, live NewBrain-controlled action, physical robot movement or validated robot safety. Test outcomes do not imply a full humanoid integration.",
      "image": {
        "path": "assets/companion-robot-ros2-architecture.svg",
        "label": "Research architecture diagram",
        "caption": "New, original diagram of a proposed NewBrain / Kira World / ROS 2 / future companion robot architecture; it is not a screenshot or an executed hardware pathway.",
        "alt": "Proposed connection from NewBrain research through Kira World and a bounded ROS 2 bridge to a future companion robot, with status feedback"
      },
      "sources": [
        {
          "label": "Companion robotics architecture",
          "url": "companion-robotics.html#architecture"
        },
        {
          "label": "Readable development journal",
          "url": "updates.html#companion-robot-ros2-bridge-2026-10-16"
        },
        {
          "label": "KiraWorld private development repository (access required)",
          "url": "https://github.com/rmcmurrer81/KiraWorld"
        },
        {
          "label": "ROS 2 official documentation",
          "url": "https://docs.ros.org/en/rolling/index.html"
        }
      ],
      "project_page": "companion-robotics.html"
    }
  ]
};
