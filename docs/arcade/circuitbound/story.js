/* Circuitbound: The Lantern Siege — original Kira Labs adventure. */
(function (root) {
  "use strict";
  const scenes = [
    {
      "id": "arrival",
      "title": "The last lantern",
      "location": "Hearthmere • outer wall",
      "objective": "First mission: open the sealed city gate with two lines of code.",
      "text": "By dawn, the storm will extinguish Hearthmere. Its lantern network protects hundreds of families, but someone has broken the heart circuit. You are an apprentice circuit-weaver. Iris, your game master, lights the road; PIX, a brass moth, carries your tools. A child knocks from behind the sealed gate. Your first spell is a program.",
      "kind": "choice",
      "visual": "storm",
      "lesson": "Your choices change who survives the siege. Puzzle mistakes teach you; you can always try again.",
      "choices": [
        {
          "label": "Approach the gate console",
          "to": "gateCode"
        }
      ]
    },
    {
      "id": "gateCode",
      "title": "A word becomes a key",
      "location": "Hearthmere • gate console",
      "objective": "Set rune to \"dawn\", then pass rune to openDoor.",
      "text": "The gate has no keyhole. Its console reads a value named rune. PIX projects two empty lines. A variable stores information; a function performs an action. Spelling and capital letters matter. Complete the tiny program to let the child out.",
      "kind": "code",
      "visual": "gate",
      "lesson": "const creates a value you will not reassign. Quotes mark text. openDoor(rune) passes that stored text to a function.",
      "code": {
        "starter": "const rune = \"_____\";\nopenDoor(_____);",
        "solution": "const rune = \"dawn\";\nopenDoor(rune);",
        "hint": "Replace the first blank with dawn inside the quotes. Replace the second blank with rune, without quotes.",
        "explain": "The value dawn is stored in rune, then passed into openDoor. The console recognizes it and unlocks the gate.",
        "validator": "rune"
      },
      "next": "breach"
    },
    {
      "id": "breach",
      "title": "Three roads into the siege",
      "location": "Hearthmere • rain square",
      "objective": "Choose your first route. Each route reaches the power workshop.",
      "text": "The gate rises. The child, Neri, points toward a collapsing workshop: her mother is trapped inside. A courier runs toward the tower with a sealed map. Below you, a drain offers a quiet shortcut. You cannot be in three places at once. The choice will be remembered.",
      "kind": "choice",
      "visual": "village",
      "choices": [
        {
          "label": "Help Neri rescue her mother",
          "to": "workshop",
          "effects": {
            "rescued": true,
            "trust": 1
          }
        },
        {
          "label": "Follow the courier and the sealed map",
          "to": "courier"
        },
        {
          "label": "Take the drain beneath the street",
          "to": "drainSensor"
        }
      ]
    },
    {
      "id": "workshop",
      "title": "Under the fallen beam",
      "location": "Tamsin’s workshop",
      "objective": "Free the engineer and reach her power bench.",
      "text": "You and PIX brace a fallen beam while Neri pulls her mother free. Tamsin, the city engineer, gives you a copper promise-ring. “The Warden did not build a weapon,” she whispers. “Ask why the lanterns remember names.” She cannot travel, but she marks the missing power unit on her bench.",
      "kind": "choice",
      "visual": "workshop",
      "lesson": "Helping people can reveal information and change an ending. No die roll can erase this choice.",
      "choices": [
        {
          "label": "Inspect the power bench",
          "to": "psu"
        }
      ]
    },
    {
      "id": "courier",
      "title": "The map with no tower",
      "location": "Hearthmere • bell alley",
      "objective": "Learn why the courier is hiding his map.",
      "text": "You catch the courier at a dead end. His map shows a garden where the tower now stands. “The Warden ordered every old map burned,” he says. “My sister lives inside that tower.” The package is not a weapon. It is the city’s forgotten history.",
      "kind": "choice",
      "visual": "alley",
      "choices": [
        {
          "label": "Hear him out",
          "to": "courierDecision"
        }
      ]
    },
    {
      "id": "courierDecision",
      "title": "An uneasy ally",
      "location": "Hearthmere • bell alley",
      "objective": "Decide what to do with the old map.",
      "text": "His name is Vale. He offers you a copy of the map if you promise to look for his sister. Or you could take the package by force and leave him behind. The tower’s searchlight sweeps the alley. There is time for one decision.",
      "kind": "choice",
      "visual": "alley",
      "choices": [
        {
          "label": "Share the map and promise to look",
          "to": "psu",
          "effects": {
            "map": true,
            "trust": 1
          }
        },
        {
          "label": "Confiscate the map and send Vale away",
          "to": "psu",
          "effects": {
            "map": true,
            "ruthless": true,
            "trust": -1
          }
        }
      ]
    },
    {
      "id": "drainSensor",
      "title": "Something in the dark",
      "location": "Flooded underpass",
      "objective": "Detect whether water has reached one dangerous level.",
      "text": "A sluice can seal this tunnel, but only when the water reaches a marked height. You need a simple level alarm, not a detailed depth reading. Three sensors lie in a dry repair box. Choose one that directly senses the water reaching that threshold.",
      "kind": "sensor",
      "visual": "flood",
      "lesson": "Pick the physical quantity first, then the sensor. Installation, environment and ratings still matter.",
      "options": [
        {
          "id": "float",
          "label": "Water-rated float switch",
          "description": "Changes state when rising water lifts its float."
        },
        {
          "id": "pir",
          "label": "PIR motion sensor",
          "description": "Detects changes in infrared radiation from moving warm bodies."
        },
        {
          "id": "ldr",
          "label": "Light-dependent resistor",
          "description": "Changes resistance with light level."
        }
      ],
      "solution": "float",
      "hint": "Which sensor is moved directly by rising water?",
      "explain": "The float switch detects a single water level directly. A PIR senses motion and an LDR senses light; neither directly answers this question.",
      "next": "cellarSurprise"
    },
    {
      "id": "cellarSurprise",
      "title": "A prisoner made of brass",
      "location": "The old pump cellar",
      "objective": "Choose what to do with the stranded automaton.",
      "text": "The sluice seals behind you. A small maintenance automaton hangs in a net of roots, still holding a lantern above the water. “I kept it lit for forty years,” it says. Its power cell could brighten your own lantern. Its hands could also help save the city.",
      "kind": "choice",
      "visual": "cellar",
      "choices": [
        {
          "label": "Free the automaton, called Morrow",
          "to": "psu",
          "effects": {
            "morrow": true,
            "trust": 1
          }
        },
        {
          "label": "Take its spare cell and leave it",
          "to": "psu",
          "effects": {
            "spareCell": true,
            "ruthless": true,
            "light": 1
          }
        }
      ]
    },
    {
      "id": "psu",
      "title": "Power is not a wish",
      "location": "Tamsin’s power bench",
      "objective": "Choose a compatible PSU with at least 25% headroom over a 500 W load.",
      "text": "The gate computer needs 280 W for its graphics card, 170 W for its processor and 50 W for everything else. Total: 500 W. This fictional build asks for 25% extra capacity: 500 × 1.25 = 625 W. All three units have the correct voltage and connectors. Which rated continuous output meets the target?",
      "kind": "psu",
      "visual": "workshop",
      "lesson": "The 25% margin is this fictional puzzle’s rule, not a universal sizing formula. A PSU rating is output capacity, not constant consumption. Real builds need maker guidance, transient capacity, suitable rails and connectors.",
      "options": [
        {
          "id": "450",
          "label": "450 W continuous",
          "description": "Below the 500 W estimated load."
        },
        {
          "id": "500",
          "label": "500 W continuous",
          "description": "Covers the estimate but leaves none of the requested headroom."
        },
        {
          "id": "650",
          "label": "650 W continuous",
          "description": "Exceeds the 625 W target with matching connections."
        }
      ],
      "solution": "650",
      "hint": "Add 280 + 170 + 50, then multiply by 1.25. Pick the smallest available rating at or above 625.",
      "wrong": "The relay refuses to start. The selected PSU misses this console’s 625 W capacity target. 450 W is below the load; 500 W leaves none of the required margin. Recalculate and try another unit.",
      "explain": "650 W meets this game’s 625 W capacity target. A too-small unit can shut down under load; a larger rating does not force the computer to consume that much power. Efficiency ratings do not replace output-capacity checks.",
      "next": "powerRestored"
    },
    {
      "id": "powerRestored",
      "title": "The city exhales",
      "location": "Hearthmere • relay square",
      "objective": "Follow the restored relay lines toward the tower.",
      "text": "Fans spin. The square’s lanterns rise on their cables and cast bridges of light across the rain. Then a voice fills every speaker: “Return what you have taken.” The Warden knows you are coming. PIX catches a second voice hidden underneath: a woman counting names.",
      "kind": "choice",
      "visual": "relay",
      "choices": [
        {
          "label": "Choose the next road",
          "to": "crossroads"
        }
      ]
    },
    {
      "id": "crossroads",
      "title": "The lower ward is flooding",
      "location": "Hearthmere • three-way relay",
      "objective": "Choose a detour or climb directly to the clock hall.",
      "text": "The tower stairs are open, but the lower ward is filling with water. Across the square, the old archive rings a distress bell. The Warden’s patrol moves closer. A detour may cost light, but could save people or uncover the truth.",
      "kind": "choice",
      "visual": "crossroads",
      "choices": [
        {
          "label": "Help the families in the lower ward",
          "to": "floodSensor"
        },
        {
          "label": "Answer the archive’s distress bell",
          "to": "archiveLock"
        },
        {
          "label": "Climb straight to the clock hall",
          "to": "clockHall"
        }
      ]
    },
    {
      "id": "floodSensor",
      "title": "A warning before the surge",
      "location": "Lower ward • sluice platform",
      "objective": "Choose a sensor to measure distance to the water surface.",
      "text": "This time the sluice needs a changing distance, not just an on/off water alarm. A sheltered bracket faces the surface from above. The game’s controller supports a suitable water-resistant ultrasonic distance sensor. Its echoes can estimate distance; poor mounting, spray and foam can still cause errors.",
      "kind": "sensor",
      "visual": "flood",
      "lesson": "A threshold switch and a continuous measurement solve different problems. Verify operating conditions and sensor limits.",
      "options": [
        {
          "id": "ultrasonic",
          "label": "Suitable ultrasonic distance sensor",
          "description": "Times a sound echo to estimate distance under supported conditions."
        },
        {
          "id": "temperature",
          "label": "Temperature sensor",
          "description": "Measures temperature, not surface distance."
        },
        {
          "id": "button",
          "label": "Push button",
          "description": "Reports a manual press, not an automatic distance."
        }
      ],
      "solution": "ultrasonic",
      "hint": "You need a distance value. Which device can time a returning echo?",
      "explain": "Ultrasonic sensing can estimate distance from echo travel time. This puzzle assumes a supported sensor and sheltered mounting; a real flood system needs further reliability and safety design.",
      "next": "floodCode"
    },
    {
      "id": "floodCode",
      "title": "Only when the water is high",
      "location": "Lower ward • control panel",
      "objective": "Use an if statement to open the sluice only when waterHigh is true.",
      "text": "The sensor reports a high-water condition. Opening the sluice will divert the surge away from the homes. An if statement runs a block only when its condition is true. Finish the program and command the gate.",
      "kind": "code",
      "visual": "sluice",
      "lesson": "true and false are Boolean values. Curly braces group the instructions controlled by if.",
      "code": {
        "starter": "const waterHigh = true;\nif (_____) {\n  openSluice();\n}",
        "solution": "const waterHigh = true;\nif (waterHigh) {\n  openSluice();\n}",
        "hint": "Put waterHigh inside the if parentheses. It is the Boolean value the condition should read.",
        "explain": "waterHigh is true, so openSluice runs. If it were false, the block would be skipped. The families gain time to reach the ferry.",
        "validator": "water"
      },
      "next": "ferry"
    },
    {
      "id": "ferry",
      "title": "One more crossing",
      "location": "Lower ward • lantern ferry",
      "objective": "Choose how long to stay with the evacuation.",
      "text": "The first ferry is full. A final family waits across the water, beside a lantern that is fading. You could hold the relay long enough for another crossing, or leave now for the tower. PIX’s wings dim as it lends power to the cable.",
      "kind": "choice",
      "visual": "ferry",
      "choices": [
        {
          "label": "Hold the relay for the last family",
          "to": "clockHall",
          "effects": {
            "refugees": true,
            "rescued": true,
            "trust": 1,
            "light": -1
          }
        },
        {
          "label": "Trust the ferryman and head for the tower",
          "to": "clockHall",
          "effects": {
            "hurried": true
          }
        }
      ]
    },
    {
      "id": "archiveLock",
      "title": "The archive’s three bells",
      "location": "The old archive",
      "objective": "Send the bell order 1, 2, 3 as an array.",
      "text": "A librarian is trapped behind an emergency shutter. Its memory holds three bell numbers in order. An array stores an ordered list between square brackets. Give sendSignal the list, and the shutter will lift.",
      "kind": "code",
      "visual": "archive",
      "lesson": "Arrays preserve order. [1, 2, 3] differs from [3, 2, 1].",
      "code": {
        "starter": "const order = [_, _, _];\nsendSignal(order);",
        "solution": "const order = [1, 2, 3];\nsendSignal(order);",
        "hint": "Replace the three blanks with 1, 2, 3 in that order. Keep the commas and square brackets.",
        "explain": "The array contains three numbers in the required sequence. sendSignal receives the whole list and rings the correct bells.",
        "validator": "array"
      },
      "next": "archiveChoice"
    },
    {
      "id": "archiveChoice",
      "title": "The names in the lanterns",
      "location": "Archive • forbidden shelf",
      "objective": "Choose what to learn before leaving the archive.",
      "text": "The librarian leads you past a burned shelf. The lanterns contain memories freely shared by the city’s founders, not stolen souls. Their agreement forbids any one person from owning the network. The Warden’s sister wrote the original circuit. Her final letter remains sealed beside a mirror lens.",
      "kind": "choice",
      "visual": "archive",
      "choices": [
        {
          "label": "Read the letter and learn the agreement",
          "to": "clockHall",
          "effects": {
            "truth": true,
            "trust": 1
          }
        },
        {
          "label": "Take the mirror lens for a brighter lantern",
          "to": "clockHall",
          "effects": {
            "lens": true,
            "light": 1
          }
        }
      ]
    },
    {
      "id": "clockHall",
      "title": "The bridge that is not there",
      "location": "Tower • clock hall",
      "objective": "Build three bridge segments with a loop.",
      "text": "Gears turn through open air. Three missing bridge segments separate you from the inner tower. The builder can place one segment per call. You could repeat the same instruction by hand, but a loop expresses the pattern clearly. PIX lands on the first gear.",
      "kind": "choice",
      "visual": "clock",
      "choices": [
        {
          "label": "Program the bridge builder",
          "to": "bridgeCode"
        }
      ]
    },
    {
      "id": "bridgeCode",
      "title": "Three steps across the void",
      "location": "Tower • bridge builder",
      "objective": "Repeat placeSegment exactly three times.",
      "text": "Start i at zero. Keep looping while i is less than three. Increase i after each pass. The values will be 0, then 1, then 2: three passes. At 3 the condition becomes false, and the builder stops.",
      "kind": "code",
      "visual": "bridge",
      "lesson": "The loop has a start, a condition and an update. Using <= 3 would create four segments from a zero start.",
      "code": {
        "starter": "for (let i = 0; i < _; i++) {\n  placeSegment();\n}",
        "solution": "for (let i = 0; i < 3; i++) {\n  placeSegment();\n}",
        "hint": "Use 3 after the less-than sign. Count the passes: i = 0, 1, 2.",
        "explain": "The builder places three segments. Starting at 0 and testing i < 3 gives exactly three calls; i++ adds one after each pass.",
        "validator": "loop"
      },
      "next": "bridgeTrap"
    },
    {
      "id": "bridgeTrap",
      "title": "The inviting lever",
      "location": "Tower • mirror landing",
      "objective": "Decide whether the obvious shortcut can be trusted.",
      "text": "A gold lever promises INSTANT DAWN. Beyond it, you see a perfectly sunny city reflected in a mirror. PIX’s antennae bend away from the glass. “That reflection has no people,” it says. A narrow maintenance route climbs behind the mirror.",
      "kind": "choice",
      "visual": "mirror",
      "choices": [
        {
          "label": "Trust PIX and use the maintenance route",
          "to": "servo",
          "effects": {
            "trustedPix": true
          }
        },
        {
          "label": "Pull the lever marked INSTANT DAWN",
          "to": "falseBeacon",
          "effects": {
            "deceived": true,
            "light": -1
          }
        }
      ]
    },
    {
      "id": "falseBeacon",
      "title": "A dawn without a city",
      "location": "Tower • false beacon",
      "objective": "Recover from the wrong turn or carry its dangerous promise.",
      "text": "The sunny reflection cracks. Cold light rushes from your lantern into the mirror. It was a decoy, built to trap anyone seeking an easy victory. You can still climb out. A black glass shard whispers that you could own every lantern if you kept it.",
      "kind": "choice",
      "visual": "fracture",
      "lesson": "A wrong story choice can cost light, but it does not end learning. Your next choice still matters.",
      "choices": [
        {
          "label": "Leave the shard and climb out",
          "to": "servo",
          "effects": {
            "rejectedShard": true
          }
        },
        {
          "label": "Carry the shard and its promise",
          "to": "servo",
          "effects": {
            "shard": true
          }
        }
      ]
    },
    {
      "id": "servo",
      "title": "Turn the eye of the tower",
      "location": "Tower • lens chamber",
      "objective": "Set the simulated calibrated servo to 90 degrees.",
      "text": "The tower lens points at an empty wall. In this simulation, its position servo uses a calibrated range from 0 to 180 degrees; 90 aligns the beam with the heart chamber. This servo targets a position. A continuous-rotation servo would instead use its command to control speed and direction.",
      "kind": "code",
      "visual": "lens",
      "lesson": "Real servos need suitable voltage, current, control signals and mechanical limits. The game’s setServo is a teaching function for this simulated position servo, not a hardware driver.",
      "code": {
        "starter": "const angle = ___;\nsetServo(angle);",
        "solution": "const angle = 90;\nsetServo(angle);",
        "hint": "Replace the blank with the number 90, without quotes.",
        "explain": "angle stores the number 90. setServo(angle) aims the simulated lens at its calibrated center position, opening the light path.",
        "validator": "servo"
      },
      "next": "summit"
    },
    {
      "id": "summit",
      "title": "The Warden’s vigil",
      "location": "Tower • heart chamber",
      "objective": "Learn why the Warden shut the circuit down.",
      "text": "The Warden’s clockwork storm-drake coils around the heart chamber, wings shielding a lantern. Inside is his sister’s recorded voice; she is not trapped alive. He has replayed her last message for forty years. When the city voted to share control, he severed the network rather than risk losing the recording. His fear is drowning Hearthmere.",
      "kind": "choice",
      "visual": "heart",
      "choices": [
        {
          "label": "Face the Warden",
          "to": "heartChoice"
        }
      ]
    },
    {
      "id": "heartChoice",
      "title": "A memory or a prison",
      "location": "Tower • heart dais",
      "objective": "Choose how to approach the heart lantern.",
      "text": "“They will erase her,” the Warden says. PIX lifts its own tiny lantern. You can examine the original agreement, ask PIX to speak, or smash the heart housing before the Warden can stop you. The circuit is fragile. Force would leave a scar.",
      "kind": "choice",
      "visual": "heart",
      "choices": [
        {
          "label": "Read the agreement engraved on the dais",
          "to": "truthReveal",
          "effects": {
            "truth": true
          }
        },
        {
          "label": "Ask PIX to reveal its own memory",
          "to": "pixReveal",
          "effects": {
            "trustedPix": true
          }
        },
        {
          "label": "Break the heart housing",
          "to": "crackHeart",
          "effects": {
            "cracked": true,
            "ruthless": true
          }
        }
      ]
    },
    {
      "id": "truthReveal",
      "title": "Her own instructions",
      "location": "Tower • heart dais",
      "objective": "Carry the shared-control agreement to the final console.",
      "text": "The Warden’s sister signed her own terms: every memory remains a gift, every family keeps a copy, and no keeper rules alone. Her recording can be preserved without locking the city out. For the first time, the Warden hears the whole message instead of its last goodbye. The clockwork drake lowers its head.",
      "kind": "choice",
      "visual": "memory",
      "choices": [
        {
          "label": "Open the final access console",
          "to": "finalGate",
          "effects": {
            "truth": true
          }
        }
      ]
    },
    {
      "id": "pixReveal",
      "title": "The smallest lantern",
      "location": "Tower • heart dais",
      "objective": "Hear the memory PIX has carried all along.",
      "text": "PIX unfolds a second pair of wings. Its brass body was built by the Warden’s sister. It carries a backup of her instructions: “A city is a circuit. Leave room for everyone.” The Warden recognizes the tiny scratch she left beneath its wing. The message was never his alone to keep.",
      "kind": "choice",
      "visual": "pix",
      "choices": [
        {
          "label": "Carry PIX’s backup to the console",
          "to": "finalGate",
          "effects": {
            "truth": true,
            "backup": true
          }
        }
      ]
    },
    {
      "id": "crackHeart",
      "title": "The price of a shortcut",
      "location": "Tower • broken heart dais",
      "objective": "Stabilize the damaged circuit before choosing its fate.",
      "text": "Your strike breaks the housing. Light escapes through a jagged seam. The Warden falls silent; his sister’s recording skips but survives in a small backup crystal. You can still evacuate the city or restore limited power, but the original heart cannot be made whole tonight.",
      "kind": "choice",
      "visual": "fracture",
      "choices": [
        {
          "label": "Reach the emergency console",
          "to": "finalGate"
        }
      ]
    },
    {
      "id": "finalGate",
      "title": "Who crosses the threshold?",
      "location": "Tower • access arch",
      "objective": "Detect an object crossing one narrow beam.",
      "text": "The emergency console wakes only when someone crosses its access arch. You need a precise crossing event at the doorway, not general motion anywhere in the chamber. Select the sensor arrangement that directly detects the interruption.",
      "kind": "sensor",
      "visual": "beam",
      "lesson": "Choose the measurement that matches the event. A break-beam arrangement detects interruption; it does not identify who crossed.",
      "options": [
        {
          "id": "beam",
          "label": "Infrared break-beam pair",
          "description": "An aligned receiver reports when its beam is interrupted."
        },
        {
          "id": "pir",
          "label": "Wide-area PIR sensor",
          "description": "Detects some warm-body motion over a broader region."
        },
        {
          "id": "thermistor",
          "label": "Thermistor",
          "description": "Changes resistance with temperature."
        }
      ],
      "solution": "beam",
      "hint": "Which arrangement notices a narrow beam being blocked at the doorway?",
      "explain": "The break-beam pair directly detects a crossing that interrupts its beam. It cannot prove identity, and it needs alignment and supported environmental conditions.",
      "next": "finalCode"
    },
    {
      "id": "finalCode",
      "title": "Two truths before the dawn",
      "location": "Tower • final console",
      "objective": "Raise the ward only when authorization AND power are ready.",
      "text": "Your access token is valid and the new PSU is ready. The ward should rise only when both values are true. Using AND protects against either requirement being missing. Combine the two conditions with &&.",
      "kind": "code",
      "visual": "console",
      "lesson": "&& means logical AND. Both conditions must be true; || would allow either one to be enough.",
      "code": {
        "starter": "const authorized = true;\nconst powerReady = true;\nif (authorized __ powerReady) {\n  raiseWard();\n}",
        "solution": "const authorized = true;\nconst powerReady = true;\nif (authorized && powerReady) {\n  raiseWard();\n}",
        "hint": "Replace __ with &&. Read it aloud: authorized AND powerReady.",
        "explain": "Both values are true, so raiseWard runs. If either were false, && would keep the ward from starting. The city is ready for your final decision.",
        "validator": "and"
      },
      "next": "council"
    },
    {
      "id": "council",
      "title": "What will you leave behind?",
      "location": "Tower • dawn switch",
      "objective": "Choose the ending. Your earlier actions shape a restoration.",
      "text": "The storm reaches the tower. The Warden steps aside. You can reconnect the lanterns under shared control, evacuate while venting their stored charge, seize their power, or cut every feed. Restoring a city also means caring for its people; a repaired machine alone cannot undo every loss.",
      "kind": "choice",
      "visual": "dawn",
      "choices": [
        {
          "label": "Restore the network under shared control",
          "to": "endingEmbers",
          "routes": [
            {
              "when": {
                "truth": true,
                "rescued": true,
                "cracked": false
              },
              "to": "endingDawn"
            }
          ]
        },
        {
          "label": "Evacuate and release the stored charge",
          "to": "endingEmbers",
          "effects": {
            "evacuated": true
          }
        },
        {
          "label": "Bind every lantern to your will",
          "to": "endingCrown"
        },
        {
          "label": "Cut every lantern feed forever",
          "to": "endingSilence"
        }
      ]
    },
    {
      "id": "endingDawn",
      "title": "The many-voiced dawn",
      "endingTitle": "Good ending • A city kept together",
      "location": "Hearthmere • sunrise",
      "objective": "You restored the circuit and protected its people.",
      "text": "The lanterns rise together. Neri brings her mother to the square; the last ferry reaches shore. Every family receives a copy of the founding memories. The Warden becomes one keeper among many. PIX leads a procession of brass moths into morning. Hearthmere survives because you treated people as part of the circuit.",
      "kind": "choice",
      "visual": "celebration",
      "ending": "good",
      "choices": [],
      "lesson": "You combined technical repair, the truth and a rescue without breaking the heart. Try a different route to discover what changes."
    },
    {
      "id": "endingEmbers",
      "title": "The road of embers",
      "endingTitle": "Good ending • Hope carries a cost",
      "location": "The eastern road",
      "objective": "The survivors carry enough light to build again.",
      "text": "Dawn finds a wounded city. The lanterns give what light they can, and the people carry its memories toward safer ground. Some streets remain empty. The old heart will need patient work, or a new beginning. PIX settles on your shoulder. “A circuit can be rebuilt,” it says. “So can a promise.”",
      "kind": "choice",
      "visual": "embers",
      "ending": "good",
      "choices": [],
      "lesson": "Evacuation is a valid success. A full restoration also needs a rescue, the founding truth and an unbroken heart. Restart to explore those choices."
    },
    {
      "id": "endingCrown",
      "title": "The iron lantern",
      "endingTitle": "Dark ending • Power without consent",
      "location": "Tower • the new throne",
      "objective": "You saved the lights and became their prison.",
      "text": "The storm recoils from your command. Every lantern turns toward the tower. No family can dim a light or leave a memory unseen. The Warden kneels before his replacement. PIX closes its wings. Hearthmere still stands, but its people now live inside your circuit. You have won control and lost the city’s trust.",
      "kind": "choice",
      "visual": "crown",
      "ending": "dark",
      "choices": [],
      "lesson": "Technical power does not grant permission to control people. Restart to choose shared control or evacuation."
    },
    {
      "id": "endingSilence",
      "title": "The unlit morning",
      "endingTitle": "Dark ending • The circuit falls silent",
      "location": "Hearthmere • after the storm",
      "objective": "The immediate threat ended, and the city lost its shared light.",
      "text": "You cut every feed. The storm passes through the dark streets. Survivors gather around ordinary fires, calling names that no lantern answers. The tower can no longer imprison a memory, but it can no longer shelter a family either. PIX’s last spark marks the path out. The choice cannot be undone in this telling.",
      "kind": "choice",
      "visual": "silence",
      "ending": "dark",
      "choices": [],
      "lesson": "An irreversible response can destroy what you hoped to protect. Restart to explore the other endings."
    }
  ];
  root.CircuitboundStory = scenes;
})(typeof window !== "undefined" ? window : globalThis);
