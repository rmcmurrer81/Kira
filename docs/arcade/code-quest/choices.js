/* Optional no-typing choices for the fourteen-mission adventure.
 * Selecting a choice still runs its code through the bounded lesson interpreter.
 */
(() => {
  "use strict";
  window.CodeQuestChoices = [
    [
      {
        label: "Change friend to PIX",
        code: 'say("Hello, PIX!");',
        why: "The words inside quotes are a string. Replacing friend with PIX changes the greeting to \"Hello, PIX!\" and awakens his rune-reader to seal the smithy."
      },
      {
        label: "Keep the greeting to friend",
        code: 'say("Hello, friend!");',
        why: "This is a valid string, but PIX is still waiting to hear his name. Change only friend to PIX so his rune-reader can open your dungeon route."
      },
      {
        label: "Say only PIX",
        code: 'say("PIX");',
        why: "say() speaks exactly the string you give it. This says only PIX; his voice-lock needs the full greeting \"Hello, PIX!\"."
      }
    ],
    [
      {
        label: "Store 3 crystals",
        code: "let crystals = 3;\ncharge(crystals);",
        why: "The variable crystals remembers 3. charge(crystals) reads that value and fills all three ward-lantern sockets, clearing your descent."
      },
      {
        label: "Store 1 crystal",
        code: "let crystals = 1;\ncharge(crystals);",
        why: "crystals still remembers 1, so the charger receives only one spark. The stair ward needs all three lantern sockets to hold the shadows back."
      },
      {
        label: "Store 2 crystals",
        code: "let crystals = 2;\ncharge(crystals);",
        why: "This changes the variable, but 2 fills only two sockets. Store 3 so charge(crystals) completes the stair ward."
      }
    ],
    [
      {
        label: "Move 3 squares",
        code: "move(3);",
        why: "The number inside move() is the distance. Three steps east take PIX onto the glowing chest stone to recover your crypt keys."
      },
      {
        label: "Move 1 square",
        code: "move(1);",
        why: "move(1) gives PIX just one step. The chest stone is three squares away, so he stops two squares short of the keys."
      },
      {
        label: "Move 4 squares",
        code: "move(4);",
        why: "Four steps carry PIX one square past the chest stone. Reaching its lock needs an exact distance of 3."
      }
    ],
    [
      {
        label: "East 2, turn right, then 2",
        code: 'move(2);\nturn("right");\nmove(2);',
        why: "Commands run from top to bottom. PIX goes east, turns right to face south, then moves to the crypt sluice that drains your crossing."
      },
      {
        label: "East 2, turn left, then 2",
        code: 'move(2);\nturn("left");\nmove(2);',
        why: "Facing east, a left turn points north: up the map and away from the crypt bridge. A right turn points toward the sluice below."
      },
      {
        label: "Move both times before turning",
        code: 'move(2);\nmove(2);\nturn("right");',
        why: "Both moves happen while PIX still faces east. The sluice is beyond the bend; put the turn between the moves so he can reach it."
      }
    ],
    [
      {
        label: "Add 1 + 2 sparks",
        code: "let energy = 1 + 2;\ncharge(energy);",
        why: "The + operator adds the lamp's one spark and PIX's two. The result, 3, is stored in energy before the chain lift is charged."
      },
      {
        label: "Add 1 + 1 sparks",
        code: "let energy = 1 + 1;\ncharge(energy);",
        why: "One plus one makes 2. PIX has two pocket sparks, so the second number must be 2 to supply the chain lift with 3 energy."
      },
      {
        label: "Multiply 1 by 2",
        code: "let energy = 1 * 2;\ncharge(energy);",
        why: "The * operator multiplies, so 1 * 2 makes 2. Combine the two supplies with addition to power the chain lift with 3."
      }
    ],
    [
      {
        label: "Require at least 2 keys",
        code: "let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",
        why: "The >= operator includes equality. Two keys are at least two, so the condition is true and the Warden vault opens."
      },
      {
        label: "Require at least 3 keys",
        code: "let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",
        why: "Two is not at least three. The false condition skips openGate(), leaving the Keeper locked inside. The vault was built to accept two keys."
      },
      {
        label: "Require more than 2 keys",
        code: "let keys = 2;\nif (keys > 2) {\n  openGate();\n}",
        why: "The > operator means strictly greater than. Two is equal to two, so this test is false. Use >= so your two crypt keys release the vault."
      }
    ],
    [
      {
        label: "Offer friendship in else",
        code: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
        why: "With no keys, the condition is false and else runs. PIX speaks the shared-light oath, reaching the Keeper beneath the storm shadow."
      },
      {
        label: "Keep Go away in else",
        code: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("Go away.");\n}',
        why: "The false condition correctly chooses else, but its unfriendly string leaves the Keeper afraid. Change the message to the shared-light oath."
      },
      {
        label: "Add 2 keys before the decision",
        code: 'let keys = 2;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
        why: "Giving keys the value 2 runs the first branch and skips the oath. Leave keys at 0 so the else message can calm the Keeper."
      }
    ],
    [
      {
        label: "Count from 0 while step < 4",
        code: "for (let step = 0; step < 4; step++) {\n  move(1);\n}",
        why: "The loop takes a step for counts 0, 1, 2 and 3. Those four repeats of move(1) wake every mine rune and release the passage gate."
      },
      {
        label: "Count from 0 while step < 3",
        code: "for (let step = 0; step < 3; step++) {\n  move(1);\n}",
        why: "This repeats for 0, 1 and 2: only three mine runes. The < sign stops before 3; use a stop number of 4 to complete the ward path."
      },
      {
        label: "Start at 1 while step < 4",
        code: "for (let step = 1; step < 4; step++) {\n  move(1);\n}",
        why: "Starting at 1 gives counts 1, 2 and 3: three steps. Starting at 0 adds the fourth step needed to light every mine rune."
      }
    ],
    [
      {
        label: "Set lanterns to 5",
        code: "let lanterns = 5;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
        why: "The loop reads 5 from lanterns. Counts 0 through 4 reach five hoist controls, releasing the focusing lens."
      },
      {
        label: "Set lanterns to 4",
        code: "let lanterns = 4;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
        why: "The condition reads the variable's value, so this stops after four steps. One hoist lantern remains dark; store 5 to release the lens."
      },
      {
        label: "Keep the loop stop number at 2",
        code: "let lanterns = 5;\nfor (let step = 0; step < 2; step++) {\n  move(1);\n}",
        why: "Although lanterns remembers 5, this condition never reads it. The fixed number 2 reaches only two hoist controls; compare step with lanterns instead."
      }
    ],
    [
      {
        label: "List stars 1, 2 and 3",
        code: "const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "The array contains each ward crystal ID. The prepared loop visits all three values and collects the complete set for the beacon core."
      },
      {
        label: "List only stars 1 and 2",
        code: "const stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "The loop can only collect IDs present in its list. Crystal 3 is missing from this array; add it before the closing square bracket."
      },
      {
        label: "List stars 1, 2 and 2",
        code: "const stars = [1, 2, 2];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "There are three items, but crystal 2 appears twice and crystal 3 is absent. Each ward socket needs its own crystal ID, so the actual values matter."
      }
    ],
    [
      {
        label: "Say the current place",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say(place);\n}',
        why: "place receives a new list item on each turn. Without quotes, say(place) reads that changing value and warns all three district watches."
      },
      {
        label: "Say harbor on every turn",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("harbor");\n}',
        why: "A quoted string stays the same. This warns harbor three times, leaving village and tower unprepared; say(place) follows each district in the list."
      },
      {
        label: "Say the word place in quotes",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("place");\n}',
        why: "Quotes make \"place\" literal text, so PIX repeats that word. Remove the quotes to read each district name and sound its warning bell."
      }
    ],
    [
      {
        label: "Define crossGap, then call it",
        code: "function crossGap() {\n  move(2);\n}\ncrossGap();",
        why: "The definition stores the crossing plan. The final crossGap() call starts it, sending PIX to the release lever that opens the tower stair."
      },
      {
        label: "Define crossGap and wait",
        code: "function crossGap() {\n  move(2);\n}",
        why: "The plan is defined, but its commands wait for a call. Add crossGap(); after the closing brace so PIX can reach the tower-stair release."
      },
      {
        label: "Say the name crossGap",
        code: 'function crossGap() {\n  move(2);\n}\nsay("crossGap");',
        why: "say(\"crossGap\") speaks the function name as text. Call crossGap() directly to make PIX reach the stair lever and open your ascent."
      }
    ],
    [
      {
        label: "Pass 3 into power",
        code: "function power(amount) {\n  charge(amount);\n}\npower(3);",
        why: "power(3) passes 3 into amount. The function gives that value to charge(), energizing the repaired beacon heart and its inner defense."
      },
      {
        label: "Pass 1 into power",
        code: "function power(amount) {\n  charge(amount);\n}\npower(1);",
        why: "The function uses the value it receives. Passing 1 gives the beacon heart only one spark; pass 3 to energize all three fitted crystals."
      },
      {
        label: "Keep charge fixed at 1",
        code: "function power(amount) {\n  charge(1);\n}\npower(3);",
        why: "This call passes 3, but charge(1) ignores amount. Use charge(amount) so the beacon heart receives the energy supplied by your call."
      }
    ],
    [
      {
        label: "Call the complete rescue plan",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
        why: "The call runs your whole plan: remember 3 ward crystals, pass the condition, charge the heart, and repeat \"Home!\" three times to raise the Stormward."
      },
      {
        label: "Write the plan without calling it",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}',
        why: "Every command is ready inside the function, but none runs yet. Add lightBeacon(); after the final brace to raise the town defenses."
      },
      {
        label: "Call it with only two signals",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 2; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
        why: "The function charges the heart, but counts 0 and 1 send only two signals. All three defense rings must rise; use signal < 3."
      }
    ]
  ];
})();
