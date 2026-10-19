/* Public, readable lab milestones. Original evidence is retained in review/milestone-source-records.json. */
window.KIRA_LABS_TIMELINE = {
  "schema_version": 1,
  "prepared_on": "2026-10-18",
  "owner": "Robert McMurrer / Kira Labs",
  "source_snapshot": "5fb345f72852d180b0c4b25a4c1bb83215ace6a7",
  "note": "Public milestone summaries record dated experiments and proposed designs. Pulse, Three.js and NewBrain are not presented as an integrated running system; clinical simulation remains separate from experimental body work.",
  "projects": [
    "Kira World",
    "NewBrain",
    "Patient Horizon",
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
