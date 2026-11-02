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
        why: 'The words inside quotes are a string. Replacing friend with PIX changes the greeting to "Hello, PIX!" and wakes our companion.'
      },
      {
        label: "Keep the greeting to friend",
        code: 'say("Hello, friend!");',
        why: 'This is a valid string, but PIX is still waiting to hear his name. Change only friend to PIX and keep the rest of the greeting.'
      },
      {
        label: "Say only PIX",
        code: 'say("PIX");',
        why: 'say() speaks exactly the string you give it. This says only PIX; our mission needs the full greeting "Hello, PIX!".'
      }
    ],
    [
      {
        label: "Store 3 crystals",
        code: "let crystals = 3;\ncharge(crystals);",
        why: "The variable crystals remembers 3. charge(crystals) reads that value and fills all three sockets."
      },
      {
        label: "Store 1 crystal",
        code: "let crystals = 1;\ncharge(crystals);",
        why: "crystals still remembers 1, so the charger receives only one spark. The lantern has three sockets to fill."
      },
      {
        label: "Store 2 crystals",
        code: "let crystals = 2;\ncharge(crystals);",
        why: "This changes the variable, but 2 fills only two sockets. Store 3 so charge(crystals) gets the full amount."
      }
    ],
    [
      {
        label: "Move 3 squares",
        code: "move(3);",
        why: "The number inside move() is the distance. Three steps east take PIX from the starting square to the glowing stone."
      },
      {
        label: "Move 1 square",
        code: "move(1);",
        why: "move(1) gives PIX just one step. The stone is three squares away, so he stops two squares short."
      },
      {
        label: "Move 4 squares",
        code: "move(4);",
        why: "Four steps carry PIX one square past the stone. The destination needs an exact distance of 3."
      }
    ],
    [
      {
        label: "East 2, turn right, then 2",
        code: 'move(2);\nturn("right");\nmove(2);',
        why: "Commands run from top to bottom. PIX goes east, turns right to face south, then moves down to the far bank."
      },
      {
        label: "East 2, turn left, then 2",
        code: 'move(2);\nturn("left");\nmove(2);',
        why: "Facing east, a left turn points north: up the map and away from the bridge. A right turn points toward the far bank below."
      },
      {
        label: "Move both times before turning",
        code: 'move(2);\nmove(2);\nturn("right");',
        why: "Both moves happen while PIX still faces east. Turning afterward cannot change the path he already traveled; put the turn between the moves."
      }
    ],
    [
      {
        label: "Add 1 + 2 sparks",
        code: "let energy = 1 + 2;\ncharge(energy);",
        why: "The + operator adds the lamp's one spark and PIX's two. The result, 3, is stored in energy before the ferry is charged."
      },
      {
        label: "Add 1 + 1 sparks",
        code: "let energy = 1 + 1;\ncharge(energy);",
        why: "One plus one makes 2. PIX has two sparks in his pocket, so the second number must be 2 to reach the required total of 3."
      },
      {
        label: "Multiply 1 by 2",
        code: "let energy = 1 * 2;\ncharge(energy);",
        why: "The * operator multiplies, so 1 * 2 makes 2. Here we are combining two supplies of sparks; use addition to get 3."
      }
    ],
    [
      {
        label: "Require at least 2 keys",
        code: "let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",
        why: "The >= operator includes equality. Two keys are at least two, so the condition is true and the gate-opening command runs."
      },
      {
        label: "Require at least 3 keys",
        code: "let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",
        why: "Two is not at least three. The false condition skips openGate(), leaving the door closed. The guardian said two keys are enough."
      },
      {
        label: "Require more than 2 keys",
        code: "let keys = 2;\nif (keys > 2) {\n  openGate();\n}",
        why: "The > operator means strictly greater than. Two is equal to two, so this test is false. Use >= to include travelers with exactly two keys."
      }
    ],
    [
      {
        label: "Offer friendship in else",
        code: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
        why: "With no keys, the condition is false and the else branch runs. PIX offers the friendly message the Keeper needs to hear."
      },
      {
        label: "Keep Go away in else",
        code: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("Go away.");\n}',
        why: "The false condition correctly chooses else, but that branch still sends the unfriendly message. Change its string to offer to share the light."
      },
      {
        label: "Add 2 keys before the decision",
        code: 'let keys = 2;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
        why: "Giving keys the value 2 makes the first branch run. The else message is skipped; leave keys at 0 to speak to the Keeper instead."
      }
    ],
    [
      {
        label: "Count from 0 while step < 4",
        code: "for (let step = 0; step < 4; step++) {\n  move(1);\n}",
        why: "The loop takes a step for counts 0, 1, 2 and 3. That is four repeats of move(1), reaching the starrail."
      },
      {
        label: "Count from 0 while step < 3",
        code: "for (let step = 0; step < 3; step++) {\n  move(1);\n}",
        why: "This repeats for 0, 1 and 2: only three steps. The < sign stops before 3, so set the stop number to 4 for four repeats."
      },
      {
        label: "Start at 1 while step < 4",
        code: "for (let step = 1; step < 4; step++) {\n  move(1);\n}",
        why: "Starting at 1 gives counts 1, 2 and 3: three steps. Starting at 0 adds the fourth repeat without changing the stop number."
      }
    ],
    [
      {
        label: "Set lanterns to 5",
        code: "let lanterns = 5;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
        why: "The loop reads 5 from lanterns. Counts 0 through 4 make five single steps and light the whole tunnel."
      },
      {
        label: "Set lanterns to 4",
        code: "let lanterns = 4;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
        why: "The condition reads the variable's value, so this stops after four steps. One lantern remains dark; store 5 in lanterns."
      },
      {
        label: "Keep the loop stop number at 2",
        code: "let lanterns = 5;\nfor (let step = 0; step < 2; step++) {\n  move(1);\n}",
        why: "Although lanterns remembers 5, this condition never reads it. The fixed number 2 gives only two steps; compare step with lanterns instead."
      }
    ],
    [
      {
        label: "List stars 1, 2 and 3",
        code: "const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "The array contains each missing star's number. The prepared loop visits all three values and collects the complete set."
      },
      {
        label: "List only stars 1 and 2",
        code: "const stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "The loop can only collect numbers present in its list. Star 3 is missing from this array, so add it before the closing square bracket."
      },
      {
        label: "List stars 1, 2 and 2",
        code: "const stars = [1, 2, 2];\nfor (const star of stars) {\n  collect(star);\n}",
        why: "There are three items, but star 2 appears twice and star 3 is absent. An array's actual values matter as well as how many items it holds."
      }
    ],
    [
      {
        label: "Say the current place",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say(place);\n}',
        why: "place receives a new list item on each turn. Without quotes, say(place) reads that changing value and names all three destinations."
      },
      {
        label: "Say harbor on every turn",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("harbor");\n}',
        why: 'A quoted string stays the same. This says "harbor" three times even as place changes; say(place) follows the list instead.'
      },
      {
        label: "Say the word place in quotes",
        code: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("place");\n}',
        why: 'Quotes make "place" literal text, so PIX repeats that word. Remove the quotes to read the destination stored in the variable place.'
      }
    ],
    [
      {
        label: "Define crossGap, then call it",
        code: "function crossGap() {\n  move(2);\n}\ncrossGap();",
        why: "The definition stores the crossing plan. The final crossGap() call starts it, so move(2) carries PIX to the tower stair."
      },
      {
        label: "Define crossGap and wait",
        code: "function crossGap() {\n  move(2);\n}",
        why: "The plan is defined, but its commands wait until the function is called. Add crossGap(); after the closing brace to begin the crossing."
      },
      {
        label: "Say the name crossGap",
        code: 'function crossGap() {\n  move(2);\n}\nsay("crossGap");',
        why: 'say("crossGap") speaks the function name as text. To run its commands, call crossGap() directly instead of putting its name inside say().'
      }
    ],
    [
      {
        label: "Pass 3 into power",
        code: "function power(amount) {\n  charge(amount);\n}\npower(3);",
        why: "power(3) passes 3 into the parameter amount. The function then gives that value to charge(), filling the beacon's heart."
      },
      {
        label: "Pass 1 into power",
        code: "function power(amount) {\n  charge(amount);\n}\npower(1);",
        why: "The function uses the value it receives. Passing 1 makes amount equal 1 for this call, so the beacon gets only one spark. Pass 3 instead."
      },
      {
        label: "Keep charge fixed at 1",
        code: "function power(amount) {\n  charge(1);\n}\npower(3);",
        why: "This call passes 3, but charge(1) ignores the parameter. Use charge(amount) inside the function to use the value the call supplied."
      }
    ],
    [
      {
        label: "Call the complete rescue plan",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
        why: 'The call runs your whole plan: remember 3, pass the condition, charge the beacon, and repeat "Home!" three times. Small ideas now work together.'
      },
      {
        label: "Write the plan without calling it",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}',
        why: "Every command is ready inside the function, but none runs yet. Add lightBeacon(); after the final brace to set the rescue in motion."
      },
      {
        label: "Call it with only two signals",
        code: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 2; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
        why: "The function runs and charges the beacon, but the loop stops after counts 0 and 1: two signals. The finale needs three; use signal < 3."
      }
    ]
  ];
})();
