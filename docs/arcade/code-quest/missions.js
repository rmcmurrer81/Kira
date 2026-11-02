/* Code Quest: The Vanished Sky. A gradual, complete beginner adventure.
 * Mission checks inspect interpreter results, never execute learner text.
 */
(() => {
  "use strict";
  const used = (result, feature) => Array.isArray(result.features) && result.features.includes(feature);
  const action = (result, type, test = () => true) => result.actions.some(item => item.type === type && test(item.value));
  const said = (result, text) => action(result, "say", value => value.trim().toLowerCase() === text.toLowerCase());
  const arrived = (result, x, y) => result.x === x && result.y === y;
  window.CodeQuestMissions = [
    {
      chapter: "CHAPTER 1 · THE VANISHED SKY", topic: "STRINGS", speaker: "IRIS · YOUR GUIDE",
      theme: "workshop", title: "A Voice in the Dark", place: "Mira's workshop · The night the stars disappeared",
      cue: "At midnight, every star goes out.", objective: "Wake PIX. The town needs a guide through the dark.",
      story: "The festival freezes beneath a starless sky. Across the bay, the ancient beacon goes dark. In Mira's workshop, a tiny robot waits without a voice. A crystal flickers: Iris is still here. ‘We begin with one word,’ she says. ‘His name is PIX. Can you help him hear it?’",
      goal: "Replace friend with PIX inside the quotes. Then press Run my code to wake him.",
      lessonTitle: "1. A string is a piece of text",
      lesson: "The text inside quotation marks is a string. say() makes PIX speak that text. Keep the quotes, brackets and punctuation; change only friend to PIX.",
      starter: '// Change just the word friend.\nsay("Hello, friend!");',
      solution: 'say("Hello, PIX!");',
      guided: {label: "Help me change friend to PIX", before: "friend", after: "PIX"},
      hints: [
        "Look for Hello, friend! in the editor. The word friend is the only part you need to change. Everything around it can stay.",
        'Your line should read say("Hello, PIX!");. You can use the help button to change the word, then press Run my code yourself.'
      ],
      success: "Two blue eyes blink open. ‘Hello, programmer!’ PIX whispers. A spark leaps into his lantern. Mira grins. ‘You did that. Now let's bring the sky back.’",
      explanation: 'The string "Hello, PIX!" became the message passed to say(). Your first command woke our companion.',
      start: {x: 1, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => said(result, "Hello, PIX!")
    },
    {
      chapter: "CHAPTER 1 · THE VANISHED SKY", topic: "VARIABLES", speaker: "MIRA · THE INVENTOR",
      theme: "workshop", title: "Three Sparks for a Lantern", place: "The crystal charger · A map in the dust",
      cue: "One little light can start a journey.", objective: "Fill the lantern's three crystal sockets.",
      story: "PIX can speak, but his lantern barely glows. Mira uncovers a charger with three empty sockets. ‘The storm scattered the beacon's stars,’ she says. ‘We'll need a lantern to find them.’ Iris points to a name on the charger: crystals. It remembers how much energy to send.",
      goal: "Change the number stored in crystals from 1 to 3, then run the code.",
      lessonTitle: "2. Variables remember things",
      lesson: "let creates a variable: a name that remembers a value. Here crystals remembers a number. charge(crystals) uses the number stored under that name.",
      starter: "// The lantern needs three crystals.\nlet crystals = 1;\ncharge(crystals);",
      solution: "let crystals = 3;\ncharge(crystals);",
      guided: {label: "Help me change 1 to 3", before: "= 1", after: "= 3"},
      hints: [
        "Find let crystals = 1;. The number after = is the value the name remembers.",
        "Change that line to let crystals = 3;. Leave charge(crystals); underneath, so it can use the new value."
      ],
      success: "Three sockets bloom gold. A map appears in the lantern glass: river, archive, starrail, beacon. Far away, something enormous moves beneath the dark tower.",
      explanation: "crystals remembered 3. Passing that variable to charge() filled all three sockets.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "◇"},
      check: result => used(result, "variables") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 2 · THE RIVER OF GLASS", topic: "COMMANDS", speaker: "PIX · YOUR COMPANION",
      theme: "courtyard", title: "The Moonlit Courtyard", place: "Festival square · Beyond the workshop",
      cue: "The whole town is holding its breath.", objective: "Reach the glowing stone three squares east.",
      story: "Outside, lanterns hang like sleeping fireflies. Families wait by the empty festival stage. PIX rolls to the edge of a stone path. ‘I can carry the light,’ he says, ‘but I need you to tell me where to go.’ A glowing stone waits three squares to his right.",
      goal: "Make PIX move 3 squares right onto the glowing stone.",
      lessonTitle: "3. A command makes something happen",
      lesson: "move(1) moves PIX one square in the direction he is facing. The number inside the parentheses tells him how many steps to take. He is facing east: right on this map.",
      starter: "// Count three squares to the glowing stone.\nmove(1);",
      solution: "move(3);",
      guided: {label: "Help me change move(1) to move(3)", before: "move(1)", after: "move(3)"},
      hints: [
        "The number inside move(...) controls the distance. PIX needs three steps, not one.",
        "Use move(3);. PIX always starts from the same place each time you run, so it is safe to try again."
      ],
      success: "The stone lights under PIX's wheels. A row of lamps flickers along the quay. The first families cheer as the river gate opens.",
      explanation: "move(3) gave PIX a distance of three steps. One command changed the world on the map.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 3, y: 2, icon: "✦"},
      check: result => arrived(result, 3, 2) && action(result, "move")
    },
    {
      chapter: "CHAPTER 2 · THE RIVER OF GLASS", topic: "SEQUENCING", speaker: "IRIS · YOUR GUIDE",
      theme: "river", title: "The Twisting Bridge", place: "Moonwater River · The glass crossing",
      cue: "Below the bridge, the dark water begins to rise.", objective: "Cross east twice, turn south, then cross twice more.",
      story: "A bridge of glass bends above a roaring waterfall. Mira holds the lantern high. ‘Two squares east, then two south,’ she calls. Iris glows beside the railing. ‘The instructions happen in order. A tiny turn can change the whole journey.’",
      goal: 'Run move(2), turn("right"), then move(2) to reach the far bank.',
      lessonTitle: "4. Read commands from top to bottom",
      lesson: 'The first move happens before the turn. PIX begins facing east. turn("right") points him south: down the map. The final move follows that new direction.',
      starter: 'move(2);\nturn("left");\nmove(2);',
      solution: 'move(2);\nturn("right");\nmove(2);',
      hints: [
        "Keep both move(2) commands. The middle command needs to turn PIX toward the bottom of the map.",
        'Change "left" to "right". Your route is east 2, right turn, south 2.'
      ],
      success: "Glass steps shine beneath PIX. The waterfall thunders behind him as Mira jumps to the far bank. A silver ferry waits among the reeds.",
      explanation: "The same move command followed two different directions because turn() ran between the moves. Order is part of a program's meaning.",
      start: {x: 0, y: 0, dir: "east"}, target: {x: 2, y: 2, icon: "⚑"},
      check: result => arrived(result, 2, 2) && result.actions.length === 3 && result.actions[0].type === "move" && result.actions[0].value === 2 && result.actions[1].type === "turn" && result.actions[1].value === "right" && result.actions[2].type === "move" && result.actions[2].value === 2
    },
    {
      chapter: "CHAPTER 2 · THE RIVER OF GLASS", topic: "ARITHMETIC", speaker: "MIRA · THE INVENTOR",
      theme: "river", title: "The Silver Ferry", place: "Reedwater landing · A crossing on borrowed sparks",
      cue: "The archive is on the other shore.", objective: "Combine the ferry's sparks into exactly 3 energy.",
      story: "The ferry's engine gives a tired cough. Mira finds one spark in the lamp and two in PIX's pocket. ‘We don't need to guess the total,’ she says. Iris draws a little plus sign in the air. On the far shore, the Archive's windows open like watchful eyes.",
      goal: "Change the calculation to 1 + 2, so charge(energy) receives 3.",
      lessonTitle: "5. Code can work out a number",
      lesson: "The + symbol adds numbers. JavaScript calculates the right side of = before storing the result. let energy = 1 + 2; remembers 3 under the name energy.",
      starter: "// One spark in the lamp, two in PIX's pocket.\nlet energy = 1 + 1;\ncharge(energy);",
      solution: "let energy = 1 + 2;\ncharge(energy);",
      hints: [
        "There are two sparks in the pocket. Change the second 1 in the calculation, leaving the first one alone.",
        "Use let energy = 1 + 2; followed by charge(energy);. The computer will add the numbers for you."
      ],
      success: "The engine hums: one spark plus two makes three. The ferry glides into silver mist. In its wake, the first stars reflect in the water, even though the sky is still empty.",
      explanation: "The addition produced 3 before the variable was used by charge(). Expressions let programs calculate values instead of guessing them.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "◇"},
      check: result => used(result, "arithmetic") && used(result, "variables") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 3 · THE SLEEPING ARCHIVE", topic: "CONDITIONS", speaker: "IRIS · YOUR GUIDE",
      theme: "archive", title: "The Gatekeeper's Test", place: "The Archive · Beneath the bronze doors",
      cue: "A hundred years of stories wait behind the gate.", objective: "Open the gate with Mira's two keys.",
      story: "A bronze guardian lowers its staff. ‘Two keys are enough,’ it rumbles, ‘but the storm has changed my instructions.’ Mira lays two keys in her palm. Beyond the door, star maps float in the air. PIX looks up at you. ‘Can we help it remember the rule?’",
      goal: "Change the condition so the gate opens when keys is 2.",
      lessonTitle: "6. An if statement makes a decision",
      lesson: "if runs the commands inside { } only when its condition is true. >= means greater than or equal to. Two is not at least three, but it is at least two.",
      starter: "let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",
      solution: "let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",
      hints: [
        "The keys variable already has the correct value. Look at the number after >= in the decision.",
        "Use if (keys >= 2) { with openGate(); inside the braces. Leave let keys = 2; as it is."
      ],
      success: "The guardian's eyes warm from red to gold. ‘The condition is true. Welcome, friends.’ The doors part. Inside, a shadow shaped like a child hides behind a fallen star.",
      explanation: "keys >= 2 was true, so the interpreter ran the command in the braces. A condition decides whether a piece of code runs.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "▣"},
      check: result => used(result, "if") && action(result, "openGate")
    },
    {
      chapter: "CHAPTER 3 · THE SLEEPING ARCHIVE", topic: "ELSE", speaker: "PIX · YOUR COMPANION",
      theme: "archive", title: "A Friend in the Shadow", place: "The map room · The forgotten Star Keeper",
      cue: "The thing in the dark is afraid of being forgotten.", objective: 'Send the Keeper the message "We can share the light."',
      story: "‘I didn't steal the stars,’ the small shadow says. ‘I hid them from the storm. Then I forgot how to send them home.’ This is the Star Keeper. Mira's keys cannot help here; the next door opens for a friend. Iris lowers her voice. ‘When one path is closed, a program can choose another.’",
      goal: 'Keep keys at 0. In the else branch, replace "Go away." with "We can share the light."',
      lessonTitle: "7. Else gives a second path",
      lesson: "If the condition is false, the first branch is skipped and the else branch runs instead. Here 0 >= 2 is false, so PIX speaks the message inside else.",
      starter: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("Go away.");\n}',
      solution: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
      hints: [
        'The condition is false because keys is 0. Edit the words in say() underneath else, leaving the quotes in place.',
        'Use say("We can share the light."); inside else. Leave keys at 0 so this second path runs.'
      ],
      success: "The Keeper steps into the lantern glow. ‘Share it?’ A silver smile appears. The Archive ceiling unfolds into a starrail map. ‘Then I will show you the way.’",
      explanation: "The false condition chose the else branch. Programs can respond differently to different situations, just as PIX did for the Keeper.",
      start: {x: 2, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => used(result, "if") && used(result, "else") && !action(result, "openGate") && said(result, "We can share the light.")
    },
    {
      chapter: "CHAPTER 4 · THE CLOCKWORK STARRAIL", topic: "LOOPS", speaker: "IRIS · YOUR GUIDE",
      theme: "rail", title: "Four Steps Above the Clouds", place: "Starrail station · The skyward track",
      cue: "The rails rise where the mountains end.", objective: "Take four single steps to reach the waiting starrail.",
      story: "The Star Keeper leads you to a railway suspended above the clouds. Its engine sleeps four squares away. PIX taps one wheel. ‘One little step, again and again.’ Iris wraps a circle of light around the command. ‘A loop asks the computer to repeat for you.’",
      goal: "Change the loop's stop number from 2 to 4. Move one square four times.",
      lessonTitle: "8. Loops repeat a command",
      lesson: "This for loop starts step at 0. It repeats while step < 4, then step++ adds one. The values 0, 1, 2 and 3 give four turns through the loop. Change only the stop number for now.",
      starter: "// Repeat one step four times.\nfor (let step = 0; step < 2; step++) {\n  move(1);\n}",
      solution: "for (let step = 0; step < 4; step++) {\n  move(1);\n}",
      hints: [
        "Keep move(1), the starting 0 and step++ as they are. The number after < controls when repeating stops.",
        "Change step < 2 to step < 4. Starting from 0 means the loop repeats for step values 0, 1, 2 and 3."
      ],
      success: "Four footsteps ring like bells. The starrail wakes and stretches a ribbon of light above the clouds. The Keeper leaps aboard. ‘The stars are waiting at the mountain's edge!’",
      explanation: "The loop ran move(1) four times. You described the repeated action once and let the loop do the repeating.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => used(result, "for") && arrived(result, 4, 2) && result.actions.filter(item => item.type === "move" && item.value === 1).length === 4
    },
    {
      chapter: "CHAPTER 4 · THE CLOCKWORK STARRAIL", topic: "LOOP PRACTICE", speaker: "MIRA · THE INVENTOR",
      theme: "rail", title: "The Five-Lantern Tunnel", place: "Cloudbreak tunnel · A light for every traveler",
      cue: "No one crosses the dark alone.", objective: "Reach the fifth lantern using the lanterns variable.",
      story: "The starrail shudders at a tunnel mouth. Five lanterns must wake before the engine can pass. Mira checks the map. ‘We already know variables and loops. Can we put them together?’ PIX faces the first lamp. Behind you, the village has begun to sing.",
      goal: "Set lanterns to 5 so the loop takes five single steps.",
      lessonTitle: "9. Use what you already know together",
      lesson: "A loop condition can use a variable instead of a fixed number. Here step < lanterns reads the number remembered by lanterns. Change that value, and the number of repeats changes too.",
      starter: "let lanterns = 2;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
      solution: "let lanterns = 5;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
      hints: [
        "The loop already reads lanterns. Find the value that name remembers, on the first line.",
        "Change the first line to let lanterns = 5;. Keep step < lanterns and move(1) so the same loop adapts to the new value."
      ],
      success: "One, two, three, four, five: the tunnel blazes blue. The train rushes out above a sea of clouds. Beyond it, three fallen stars tremble in a meadow of silver grass.",
      explanation: "The loop read the value 5 from lanterns and repeated five times. A small change to data can control a whole sequence of actions.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "◇"},
      check: result => used(result, "variables") && used(result, "for") && arrived(result, 5, 2) && result.actions.filter(item => item.type === "move" && item.value === 1).length === 5
    },
    {
      chapter: "CHAPTER 5 · THE FALLING SKY", topic: "ARRAYS", speaker: "IRIS · YOUR GUIDE",
      theme: "meadow", title: "Three Pieces of Starlight", place: "Starfall Meadow · The mountain's edge",
      cue: "The lost stars remember their names.", objective: "Gather stars 1, 2 and 3 into PIX's lantern.",
      story: "The three stars are small enough to hold. Each bears a number: 1, 2, 3. ‘I kept them safe,’ the Keeper says. ‘But I lost the list.’ Iris shows you two square brackets, like a little box for treasures. PIX opens his lantern. One star is still missing from its instructions.",
      goal: "Add 3 to the stars array so PIX collects stars 1, 2 and 3.",
      lessonTitle: "10. An array keeps a list together",
      lesson: "An array is a list inside [ ]. Commas separate the items. The ready-made loop below visits each item; for this mission, change only the list from [1, 2] to [1, 2, 3].",
      starter: "// Add the missing star to this list.\nconst stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",
      solution: "const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",
      hints: [
        "Find the square brackets on the first code line. The list has 1 and 2; it needs one more item.",
        "Use const stars = [1, 2, 3];. Keep the ready-made loop below it. const is another way to give a value a name; this list will keep that name."
      ],
      success: "Three stars tumble into the lantern and spin like a tiny galaxy. For the first time, the Keeper casts a golden shadow. Above the hill, the beacon answers with one faint pulse.",
      explanation: "The array contained three values. The prepared loop passed each value to collect(), gathering all three stars.",
      start: {x: 2, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "✦"},
      check: result => used(result, "arrays") && used(result, "forOf") && [1, 2, 3].every(id => action(result, "collect", value => value === id))
    },
    {
      chapter: "CHAPTER 5 · THE FALLING SKY", topic: "FOR...OF", speaker: "PIX · YOUR COMPANION",
      theme: "meadow", title: "A Message Across the Valley", place: "Windglass causeway · Three towns below",
      cue: "Hope travels farther when everyone hears it.", objective: "Call out harbor, village and tower, once each.",
      story: "Storm clouds surround Beacon Hill. Three signal stones watch the harbor, village and tower. PIX must call each place so its people can light the safe path home. ‘The list knows every destination,’ says Iris. ‘This time, let's follow what happens inside the loop.’",
      goal: 'Change say("harbor") to say(place), so each place in the list gets its own message.',
      lessonTitle: "11. For...of visits each item",
      lesson: "for (const place of places) takes one item from the array at a time and remembers it as place. First place is harbor, then village, then tower. say(place) uses the current item; quotes would make it fixed text.",
      starter: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("harbor");\n}',
      solution: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say(place);\n}',
      hints: [
        'The array and loop are ready. The repeated command still says the same word every time. It needs the current item, named place.',
        'Replace say("harbor"); with say(place);. Do not put quotes around place: you want its changing value, not the word "place".'
      ],
      success: "‘Harbor! Village! Tower!’ Three signal fires bloom below. The storm parts around a bright road up the hill. The people of Starlight Bay are helping you now.",
      explanation: "The same command used three different values because place changed with each item in the array. Lists and loops make a team.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "⚑"},
      check: result => used(result, "forOf") && ["harbor", "village", "tower"].every(place => said(result, place)) && result.actions.filter(item => item.type === "say").length === 3
    },
    {
      chapter: "CHAPTER 6 · THE LAST LIGHT", topic: "FUNCTIONS", speaker: "MIRA · THE INVENTOR",
      theme: "beacon", title: "The Stair That Remembers", place: "Beacon Hill · The broken stairway",
      cue: "The summit is closer than it looks.", objective: "Run crossGap() to move two squares to the tower stair.",
      story: "The final stair has cracked beneath the storm. Mira writes a little plan for crossing it and gives the plan a name: crossGap. PIX waits. Nothing moves. ‘A written plan isn't the journey,’ Iris says gently. ‘We have to ask it to begin.’",
      goal: "After the closing }, add crossGap(); on a new line to run the function.",
      lessonTitle: "12. A function is a named plan",
      lesson: "function gives a name to a group of commands. Writing the function defines the plan; calling its name with () runs it. Commands inside the braces wait until you call the function.",
      starter: "function crossGap() {\n  move(2);\n}\n// Call crossGap below this comment.",
      solution: "function crossGap() {\n  move(2);\n}\ncrossGap();",
      hints: [
        "The function already has the right command inside. Add a new line after the final } rather than changing move(2).",
        "On the last line, type crossGap();. The parentheses ask the named plan to run."
      ],
      success: "PIX rolls across a ribbon of starlight and reaches the tower stair. Mira follows with the Keeper. The great lens hangs above them, dark and waiting.",
      explanation: "Defining crossGap stored a plan. Calling crossGap() ran its move(2) command and carried PIX across.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 3, y: 2, icon: "▣"},
      check: result => used(result, "functions") && arrived(result, 3, 2) && action(result, "move", value => value === 2)
    },
    {
      chapter: "CHAPTER 6 · THE LAST LIGHT", topic: "PARAMETERS", speaker: "IRIS · YOUR GUIDE",
      theme: "beacon", title: "The Heart of the Beacon", place: "The lens chamber · A hundred years of waiting",
      cue: "A plan can listen as well as act.", objective: "Pass 3 into power() to charge the beacon's heart.",
      story: "The lantern slots into the beacon's heart, but its crystal must receive exactly three sparks. PIX has a charging plan named power. ‘We can tell this plan how much to use,’ says Iris. The Keeper rests one hand against the glass. ‘Please be enough.’",
      goal: "Change power(1) to power(3). Keep charge(amount) inside the function.",
      lessonTitle: "13. A parameter carries a value in",
      lesson: "amount is a parameter: a name waiting for a value when power is called. power(3) gives amount the value 3 for that call. Then charge(amount) uses it inside the function.",
      starter: "function power(amount) {\n  charge(amount);\n}\npower(1);",
      solution: "function power(amount) {\n  charge(amount);\n}\npower(3);",
      hints: [
        "Find the call at the bottom. The number between its parentheses becomes amount inside the function.",
        "Use power(3); on the final line. The function can keep charge(amount); because amount now receives 3."
      ],
      success: "Three sparks enter the lens. Rings of gold awaken around the tower. The Keeper's cloak fills with tiny constellations. Now the beacon needs one final signal to guide the stars home.",
      explanation: "The call passed 3 into the parameter amount. Your function used that value without having to change its plan.",
      start: {x: 3, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "◇"},
      check: result => used(result, "functions") && used(result, "parameters") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 6 · THE LAST LIGHT", topic: "YOUR ADVENTURE", speaker: "IRIS · YOUR GUIDE",
      theme: "beacon", title: "Bring the Stars Home", place: "The summit · A new dawn for Starlight Bay",
      cue: "The sky is waiting for your voice.", objective: "Call lightBeacon() and send the final signal.",
      story: "The storm reaches the summit. Mira braces the lens, PIX guards the lantern, and the Keeper lifts the three stars. Below, the whole town raises its lights. Iris shines beside you. ‘Strings, variables, decisions, loops, functions. You learned them one step at a time. Now let them tell the ending.’",
      goal: "Add lightBeacon(); after the last } to run the rescue plan: charge 3 and send three Home! signals.",
      lessonTitle: "14. Small ideas make a great adventure",
      lesson: 'Read the plan from top to bottom. It remembers 3 stars, checks they are enough, charges the beacon, then repeats the "Home!" signal three times. You already know how to call a function: add its name and ().',
      starter: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\n// One final line: call the plan.',
      solution: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
      hints: [
        "The whole rescue plan is ready. Its commands will wait until the named function is called, just like crossGap in the stairway mission.",
        "Add lightBeacon(); on a new line after the last }. Keep the function's name, both parentheses and the semicolon."
      ],
      success: "‘Home! Home! Home!’ A beam tears through the storm. Thousands of stars rise from the lantern and wheel into the sky. The Keeper becomes a constellation above the bay, never forgotten again. As the festival bursts into color, PIX takes a bow. ‘Our programmer brought us home.’",
      explanation: "Calling your function set the whole plan in motion. A variable fed a condition, the true branch powered the beacon, and a loop repeated your message. You turned small programming ideas into a complete rescue.",
      start: {x: 3, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "✦"},
      check: result => ["functions", "variables", "if", "for"].every(feature => used(result, feature)) && action(result, "charge", value => value === 3) && result.actions.filter(item => item.type === "say" && item.value.trim().toLowerCase() === "home!").length === 3
    }
  ];
})();
