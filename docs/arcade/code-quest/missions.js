/* Code Quest: Stormward. An original town-rescue dungeon adventure.
 * quest.defense is cumulative town protection after this mission, not a delta.
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
      chapter: "CHAPTER 1 · THE BROKEN WARD", topic: "STRINGS", speaker: "IRIS · GAME MASTER",
      theme: "workshop", title: "The Storm at the Smithy", place: "Mira's smithy · The ruined outer gate",
      cue: "A stormwraith strikes the gate. Your quest begins here.", objective: "Wake PIX. Only his rune-reader can open the way below the town.",
      story: "You slam the smithy door as a stormwraith tears through the outer gate of Starlight Bay. Families shelter behind the failing inner wall. Mira, an artificer, sets a silent clockwork companion beside you. His name is PIX, and his rune-reader can reach the ward engines beneath the ruins. First, his voice-lock needs a greeting. Change friend to PIX. Your code is the way forward.",
      quest: {"need": "An awakened rune-reader to enter the buried wardworks.", "reward": {"id": "pix-companion", "name": "Awakened rune-reader", "icon": "⚙", "kind": "part"}, "defense": 4, "threat": "Stormwraith at the smithy door"},
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
      success: "PIX's blue eyes flare. His rune-reader seals the smithy door, driving the wraith's claws back into the rain. You gain a clockwork companion. Mira lifts a trapdoor: the town's broken defenses can only be restored from the dungeons below.",
      explanation: "The string \"Hello, PIX!\" reached the voice-lock through say(). Changing one word woke your companion and secured your first shelter.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => said(result, "Hello, PIX!")
    },
    {
      chapter: "CHAPTER 1 · THE BROKEN WARD", topic: "VARIABLES", speaker: "IRIS · GAME MASTER",
      theme: "workshop", title: "The Three-Socket Ward Lantern", place: "Smithy undercroft · The sealed descent",
      cue: "The stairs below have no daylight, and something is moving there.", objective: "Charge all three sockets to make a ward lantern for the descent.",
      story: "You descend into Mira's stone undercroft. Beyond its bars, pale shapes circle an unlit stair. An empty ward lantern hangs over the lock, its three sockets connected to a rune named crystals. Mira can build the casing, but its charge must come from your instructions. Give crystals the value 3; the lantern will hold back the things below.",
      quest: {"need": "A fully charged lantern to hold the lower shadows back.", "reward": {"id": "ward-lantern", "name": "Charged ward lantern", "icon": "◈", "kind": "part"}, "defense": 9, "threat": "Ashlings under the stairs"},
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
      success: "Three sockets ignite. A ring of light drives the shapes from the stair, and the iron bars rise. You take the charged ward lantern. Its glow reveals a chest marker beneath the ruined courtyard; Mira says the crypt keys are still inside.",
      explanation: "crystals remembered 3, and charge(crystals) used that value to power the ward lantern. A variable now controls equipment you need to survive the descent.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "◇"},
      check: result => used(result, "variables") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 2 · BELOW THE RUINS", topic: "COMMANDS", speaker: "IRIS · GAME MASTER",
      theme: "courtyard", title: "The Chest in the Broken Courtyard", place: "Ruined courtyard · The crypt entrance",
      cue: "Two keys glint inside a chest beyond the fallen stones.", objective: "Send PIX three squares east onto the glowing chest stone.",
      story: "You emerge beneath the broken courtyard. A key chest waits on a glowing stone, three squares east of PIX. In the far archway, a shadowhound sniffs the wet masonry. Mira keeps the lantern between it and you. PIX is small enough to cross the unstable stones, but he needs an exact movement command before he can fetch the crypt keys.",
      quest: {"need": "Two bronze keys from the chest beyond the unstable stones.", "reward": {"id": "twin-crypt-keys", "name": "Twin crypt keys", "icon": "⚿", "kind": "part"}, "defense": 13, "threat": "Shadowhound in the broken archway"},
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
      success: "PIX reaches the chest stone. The lock clicks open, and he brings you two bronze keys. A ward grate crashes down behind the shadowhound. With the courtyard secured, you can unlock the flooded crypt below.",
      explanation: "move(3) sent PIX the exact distance to the chest stone. One number in a command recovered the keys for your next dungeon passage.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 3, y: 2, icon: "✦"},
      check: result => arrived(result, 3, 2) && action(result, "move")
    },
    {
      chapter: "CHAPTER 2 · BELOW THE RUINS", topic: "SEQUENCING", speaker: "IRIS · GAME MASTER",
      theme: "river", title: "The Flooded Crypt Crossing", place: "Moonwater crypt · The drowned bridge",
      cue: "Black water rises between the stone tombs.", objective: "Cross east twice, turn south, then reach the crypt sluice.",
      story: "You unlock the crypt and find its bridge half drowned. The dry stones run two squares east, bend right, then continue two squares south to a sluice lever. A dark fin cuts through the water below. PIX can trip the lever and drain your path, but the commands must lead him around the bend in the right order.",
      quest: {"need": "A drained crossing into the lower vault passage.", "reward": {"id": "crypt-crossing", "name": "Flooded crypt passage cleared", "icon": "≋", "kind": "passage"}, "defense": 19, "threat": "Floodlurker beneath the crypt bridge"},
      goal: 'Run move(2), turn("right"), then move(2) to reach the far bank.',
      lessonTitle: "4. Read commands from top to bottom",
      lesson: 'The first move happens before the turn. PIX begins facing east. turn("right") points him south: down the map. The final move follows that new direction.',
      starter: 'move(2);\nturn("left");\nmove(2);',
      solution: 'move(2);\nturn("right");\nmove(2);',
      hints: [
        "Keep both move(2) commands. The middle command needs to turn PIX toward the bottom of the map.",
        'Change "left" to "right". Your route is east 2, right turn, south 2.'
      ],
      success: "PIX crosses the last stone and pulls the sluice. Water thunders into a lower shaft; the shape beneath it is swept away. You lead Mira across the exposed crypt floor. Ahead, a massive chain lift guards the way into the vaults.",
      explanation: "The first move crossed the eastward stones. turn(\"right\") changed PIX to face south before the second move reached the sluice. The order opened a real route through the crypt.",
      start: {x: 0, y: 0, dir: "east"}, target: {x: 2, y: 2, icon: "⚑"},
      check: result => arrived(result, 2, 2) && result.actions.length === 3 && result.actions[0].type === "move" && result.actions[0].value === 2 && result.actions[1].type === "turn" && result.actions[1].value === "right" && result.actions[2].type === "move" && result.actions[2].value === 2
    },
    {
      chapter: "CHAPTER 2 · BELOW THE RUINS", topic: "ARITHMETIC", speaker: "IRIS · GAME MASTER",
      theme: "river", title: "The Chain Lift Below the Graves", place: "Lower crypt · The iron lift shaft",
      cue: "A locked lift stands between you and the buried wardworks.", objective: "Combine one lamp spark and two pocket sparks to power the chain lift.",
      story: "You reach an iron cage hanging over a deep shaft. Its lift engine needs exactly three sparks. Mira finds one in the ward lamp; PIX carries two in his copper pocket. A chain sentinel stirs on the ceiling above the cage. Force will not free the lift. Add the two supplies in the engine's program and send the total to charge().",
      quest: {"need": "Three sparks to operate the lift into the Warden vault.", "reward": {"id": "chain-lift-access", "name": "Lower vault lift opened", "icon": "↟", "kind": "passage"}, "defense": 26, "threat": "Chain sentinel over the lift shaft"},
      goal: "Change the calculation to 1 + 2, so charge(energy) receives 3.",
      lessonTitle: "5. Code can work out a number",
      lesson: "The + symbol adds numbers. JavaScript calculates the right side of = before storing the result. let energy = 1 + 2; remembers 3 under the name energy.",
      starter: "// One spark in the lamp, two in PIX's pocket.\nlet energy = 1 + 1;\ncharge(energy);",
      solution: "let energy = 1 + 2;\ncharge(energy);",
      hints: [
        "There are two sparks in the pocket. Change the second 1 in the calculation, leaving the first one alone.",
        "Use let energy = 1 + 2; followed by charge(energy);. The computer will add the numbers for you."
      ],
      success: "The engine accepts three sparks. Chains tighten, carrying your party below the sentinel's reach. You step out at the Warden's vault, where a sealed bronze gate glows with a damaged instruction. Two keyholes wait beneath it.",
      explanation: "The expression 1 + 2 produced 3 before energy was used by charge(). Your calculation supplied exactly what the chain lift needed.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "◇"},
      check: result => used(result, "arithmetic") && used(result, "variables") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 3 · THE BOUND WARDEN", topic: "CONDITIONS", speaker: "IRIS · GAME MASTER",
      theme: "archive", title: "The Two-Key Vault", place: "Warden vault · The bronze gate",
      cue: "Someone is trapped behind the wrong rule.", objective: "Repair the gate condition so your two keys release the Keeper.",
      story: "You fit the two crypt keys into the vault gate. A voice echoes from inside: the Keeper of the Ward is bound there. The lock was built to accept two keys, but the storm changed its rule to demand three. Beyond the bars, a bronze sentinel raises its hammer. Repair the condition before you ask the gate to open; only the correct rune instruction can release it.",
      quest: {"need": "The open vault and its Warden seal, using the two keys you found.", "reward": {"id": "warden-seal", "name": "Warden seal", "icon": "▣", "kind": "part"}, "defense": 32, "threat": "Bronze vault sentinel"},
      goal: "Change the condition so the gate opens when keys is 2.",
      lessonTitle: "6. An if statement makes a decision",
      lesson: "if runs the commands inside { } only when its condition is true. >= means greater than or equal to. Two is not at least three, but it is at least two.",
      starter: "let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",
      solution: "let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",
      hints: [
        "The keys variable already has the correct value. Look at the number after >= in the decision.",
        "Use if (keys >= 2) { with openGate(); inside the braces. Leave let keys = 2; as it is."
      ],
      success: "The condition becomes true. Bronze bars withdraw, and the sentinel lowers its hammer. You claim the Warden seal from the open lock. Inside the vault, the Keeper staggers in a cloak of living shadow; the storm has made him fear every visitor.",
      explanation: "keys >= 2 was true with your two keys, so openGate() ran. Repairing the decision released the vault lock and recovered the Warden seal.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "▣"},
      check: result => used(result, "if") && action(result, "openGate")
    },
    {
      chapter: "CHAPTER 3 · THE BOUND WARDEN", topic: "ELSE", speaker: "IRIS · GAME MASTER",
      theme: "archive", title: "The Keeper Behind the Shadow", place: "Inner vault · The oath circle",
      cue: "The figure before you is an ally lost inside the storm.", objective: "Use the other branch to tell the Keeper: We can share the light.",
      story: "You enter the oath circle with no keys left to spend. The Keeper mistakes your lantern for an enemy flame, and shadow gathers around his hands. Mira recognizes the old ward oath: We can share the light. The locked branch cannot help now. Put the oath into else, so PIX can speak when the key test is false. This is how you reach the person beneath the shadow.",
      quest: {"need": "The Keeper as an ally and a map to the missing ward components.", "reward": {"id": "keeper-ally", "name": "Keeper of the Ward · Ally", "icon": "✧", "kind": "ally"}, "defense": 39, "threat": "Storm shadow binding the Keeper"},
      goal: 'Keep keys at 0. In the else branch, replace "Go away." with "We can share the light."',
      lessonTitle: "7. Else gives a second path",
      lesson: "If the condition is false, the first branch is skipped and the else branch runs instead. Here 0 >= 2 is false, so PIX speaks the message inside else.",
      starter: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("Go away.");\n}',
      solution: 'let keys = 0;\nif (keys >= 2) {\n  openGate();\n} else {\n  say("We can share the light.");\n}',
      hints: [
        'The condition is false because keys is 0. Edit the words in say() underneath else, leaving the quotes in place.',
        'Use say("We can share the light."); inside else. Leave keys at 0 so this second path runs.'
      ],
      success: "PIX speaks the oath. The shadow falls from the Keeper's face, and he kneels beside your lantern. You gain the Keeper as an ally. He reveals the missing ward parts: a focusing lens in the mines and three crystals sealed deeper underground. Together, they can restore the tower above the town.",
      explanation: "With keys at 0, the false condition chose else. Your message calmed the Keeper instead of trying a locked route; a second branch changed the encounter.",
      start: {x: 2, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => used(result, "if") && used(result, "else") && !action(result, "openGate") && said(result, "We can share the light.")
    },
    {
      chapter: "CHAPTER 4 · THE EMBER MINES", topic: "LOOPS", speaker: "IRIS · GAME MASTER",
      theme: "rail", title: "Four Steps Through the Ember Mine", place: "Abandoned mine · The warded track",
      cue: "Each footfall must wake the next protective rune.", objective: "Take four single steps to unlock the mine passage.",
      story: "You follow the Keeper through a door concealed behind the vault. Four dormant runes line a mine track. PIX must step on each one in turn; a long leap will leave the ward sequence incomplete. In the side tunnels, ember-red eyes open. Repeat move(1) four times with a loop to light the protective path and reach the mine gate.",
      quest: {"need": "A rune-protected path through the creature-filled mine.", "reward": {"id": "ember-mine-pass", "name": "Ember mine passage cleared", "icon": "◆", "kind": "passage"}, "defense": 46, "threat": "Cinder crawlers in the side tunnels"},
      goal: "Change the loop's stop number from 2 to 4. Move one square four times.",
      lessonTitle: "8. Loops repeat a command",
      lesson: "This for loop starts step at 0. It repeats while step < 4, then step++ adds one. The values 0, 1, 2 and 3 give four turns through the loop. Change only the stop number for now.",
      starter: "// Repeat one step four times.\nfor (let step = 0; step < 2; step++) {\n  move(1);\n}",
      solution: "for (let step = 0; step < 4; step++) {\n  move(1);\n}",
      hints: [
        "Keep move(1), the starting 0 and step++ as they are. The number after < controls when repeating stops.",
        "Change step < 2 to step < 4. Starting from 0 means the loop repeats for step values 0, 1, 2 and 3."
      ],
      success: "Four runes answer four footsteps. The mine gate opens as a band of light bars the side tunnels. You gain a protected passage through the ember mine. Farther ahead, a broken lens hoist hangs above a pit of black glass.",
      explanation: "The loop ran move(1) for counts 0, 1, 2 and 3. Four separate steps activated the mine runes in sequence and opened the guarded passage.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 4, y: 2, icon: "✦"},
      check: result => used(result, "for") && arrived(result, 4, 2) && result.actions.filter(item => item.type === "move" && item.value === 1).length === 4
    },
    {
      chapter: "CHAPTER 4 · THE EMBER MINES", topic: "LOOP PRACTICE", speaker: "IRIS · GAME MASTER",
      theme: "rail", title: "The Five-Runed Lens Hoist", place: "Mine loading hall · The suspended lens",
      cue: "The tower lens hangs over a pit of shattered glass.", objective: "Set lanterns to 5 and reach the fifth hoist control.",
      story: "You find the focusing lens chained above the mine pit. Five lantern controls operate its hoist, and PIX must cross one square to each. The loop already reads a variable named lanterns. Its value is too small, so the hoist stops before the last control. Give it the full count while Mira braces the winch and the Keeper watches a shape beneath the glass.",
      quest: {"need": "The focusing lens for the wardtower beacon.", "reward": {"id": "focusing-lens", "name": "Focusing lens", "icon": "◉", "kind": "part"}, "defense": 53, "threat": "Glasspit prowler below the hoist"},
      goal: "Set lanterns to 5 so the loop takes five single steps.",
      lessonTitle: "9. Use what you already know together",
      lesson: "A loop condition can use a variable instead of a fixed number. Here step < lanterns reads the number remembered by lanterns. Change that value, and the number of repeats changes too.",
      starter: "let lanterns = 2;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
      solution: "let lanterns = 5;\nfor (let step = 0; step < lanterns; step++) {\n  move(1);\n}",
      hints: [
        "The loop already reads lanterns. Find the value that name remembers, on the first line.",
        "Change the first line to let lanterns = 5;. Keep step < lanterns and move(1) so the same loop adapts to the new value."
      ],
      success: "Five controls glow. The hoist lowers its load into Mira's waiting arms. You gain the focusing lens, one of the town's lost defense components. The Keeper points to a crystal-lined passage beyond the pit; the ward crystals are close.",
      explanation: "The loop read 5 from lanterns and took five single steps. Connecting the loop to a variable let one value control the whole lens-hoist sequence.",
      start: {x: 0, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "◇"},
      check: result => used(result, "variables") && used(result, "for") && arrived(result, 5, 2) && result.actions.filter(item => item.type === "move" && item.value === 1).length === 5
    },
    {
      chapter: "CHAPTER 5 · THE CRYSTAL DEPTHS", topic: "ARRAYS", speaker: "IRIS · GAME MASTER",
      theme: "meadow", title: "The Three Ward Crystals", place: "Crystal cavern · The stone root chamber",
      cue: "Three numbered crystals hold the heart of the town ward.", objective: "Collect ward crystals 1, 2 and 3 from the cavern.",
      story: "You step into a cavern where silver roots bind three ward crystals to the rock. Ancient engravings call these crystals stars; each bears a number, 1, 2 or 3. PIX's collection list names only the first two. A glassback prowler scrapes its claws along the ceiling. Add the missing number so the extractor can release every crystal into the lantern.",
      quest: {"need": "All three ward crystals to rebuild the beacon core.", "reward": {"id": "ward-crystal-set", "name": "Ward crystals · Complete set", "icon": "✦", "kind": "part"}, "defense": 61, "threat": "Glassback prowler in the crystal roots"},
      goal: "Add 3 to the stars array so PIX collects stars 1, 2 and 3.",
      lessonTitle: "10. An array keeps a list together",
      lesson: "An array is a list inside [ ]. Commas separate the items. The ready-made loop below visits each item; for this mission, change only the list from [1, 2] to [1, 2, 3].",
      starter: "// Add the missing star to this list.\nconst stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",
      solution: "const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",
      hints: [
        "Find the square brackets on the first code line. The list has 1 and 2; it needs one more item.",
        "Use const stars = [1, 2, 3];. Keep the ready-made loop below it. const is another way to give a value a name; this list will keep that name."
      ],
      success: "The extractor follows the complete list. Three ward crystals lift from the roots and settle into your lantern. The cavern door seals behind the prowler. You now carry both missing components: the focusing lens and the crystal set. A bell passage leads back toward the surface.",
      explanation: "The array named all three crystal IDs. Its prepared loop passed each one to collect(), recovering the complete set rather than leaving the third ward socket empty.",
      start: {x: 2, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "✦"},
      check: result => used(result, "arrays") && used(result, "forOf") && [1, 2, 3].every(id => action(result, "collect", value => value === id))
    },
    {
      chapter: "CHAPTER 5 · THE CRYSTAL DEPTHS", topic: "FOR...OF", speaker: "IRIS · GAME MASTER",
      theme: "meadow", title: "The Three District Bells", place: "Bell passage · The surface warning stones",
      cue: "The town must know where to hold the line.", objective: "Warn harbor, village and tower once each.",
      story: "You climb to a bell passage that overlooks the trapped town. Stormwraiths gather at the three districts: harbor, village and tower. Each district has a warning stone linked to a name in PIX's list. He keeps calling only harbor. Make the loop use its current place, so every watch can shelter its people and guard your route to the wardtower.",
      quest: {"need": "All three district watches warned before the wardtower ascent.", "reward": {"id": "district-watch", "name": "Three district watches · Allies", "icon": "⚑", "kind": "ally"}, "defense": 68, "threat": "Bell stalkers on the surface approach"},
      goal: 'Change say("harbor") to say(place), so each place in the list gets its own message.',
      lessonTitle: "11. For...of visits each item",
      lesson: "for (const place of places) takes one item from the array at a time and remembers it as place. First place is harbor, then village, then tower. say(place) uses the current item; quotes would make it fixed text.",
      starter: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say("harbor");\n}',
      solution: 'const places = ["harbor", "village", "tower"];\nfor (const place of places) {\n  say(place);\n}',
      hints: [
        'The array and loop are ready. The repeated command still says the same word every time. It needs the current item, named place.',
        'Replace say("harbor"); with say(place);. Do not put quotes around place: you want its changing value, not the word "place".'
      ],
      success: "Harbor, village, tower: all three bells answer. Doors open for shelter, and the district watches raise their shields. You gain the pledged help of the town watch. Mira and the Keeper carry the lens and crystals toward the tower while PIX lights the path ahead.",
      explanation: "place changed with each array item. say(place) sent one warning to each district, bringing all three watches into the rescue.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 5, y: 2, icon: "⚑"},
      check: result => used(result, "forOf") && ["harbor", "village", "tower"].every(place => said(result, place)) && result.actions.filter(item => item.type === "say").length === 3
    },
    {
      chapter: "CHAPTER 6 · THE WARDTOWER", topic: "FUNCTIONS", speaker: "IRIS · GAME MASTER",
      theme: "beacon", title: "The Broken Tower Stair", place: "Wardtower entrance · The missing stair span",
      cue: "Stone steps have fallen away above the dungeon mouth.", objective: "Run crossGap() to reach the stair release two squares ahead.",
      story: "You reach the wardtower, but a broken stair span cuts off the ascent. A release lever waits two squares beyond PIX. Mira has written a plan named crossGap to guide him across the narrow stone rib. The plan is ready, yet he has not moved. Call the function to make him reach the lever and unfold the stair for the rest of your party.",
      quest: {"need": "An open stairway to carry the recovered parts up the wardtower.", "reward": {"id": "wardtower-stairs", "name": "Wardtower stairs opened", "icon": "↗", "kind": "passage"}, "defense": 76, "threat": "Stairbound sentinel at the tower entrance"},
      goal: "After the closing }, add crossGap(); on a new line to run the function.",
      lessonTitle: "12. A function is a named plan",
      lesson: "function gives a name to a group of commands. Writing the function defines the plan; calling its name with () runs it. Commands inside the braces wait until you call the function.",
      starter: "function crossGap() {\n  move(2);\n}\n// Call crossGap below this comment.",
      solution: "function crossGap() {\n  move(2);\n}\ncrossGap();",
      hints: [
        "The function already has the right command inside. Add a new line after the final } rather than changing move(2).",
        "On the last line, type crossGap();. The parentheses ask the named plan to run."
      ],
      success: "PIX follows the plan and throws the release. Hidden stairs grind out of the tower wall, giving you a way up with the heavy lens. You gain the wardtower stair passage. Above you, the stormwraith coils around the dark beacon chamber.",
      explanation: "Defining crossGap stored the crossing plan; crossGap() actually ran its move(2) command. Calling the function opened the tower stair instead of leaving the plan on the page.",
      start: {x: 1, y: 2, dir: "east"}, target: {x: 3, y: 2, icon: "▣"},
      check: result => used(result, "functions") && arrived(result, 3, 2) && action(result, "move", value => value === 2)
    },
    {
      chapter: "CHAPTER 6 · THE WARDTOWER", topic: "PARAMETERS", speaker: "IRIS · GAME MASTER",
      theme: "beacon", title: "The Beacon Heart", place: "Beacon chamber · The empty core socket",
      cue: "The defenses have a heart again. Now it must be powered.", objective: "Pass 3 into power() to energize the repaired beacon heart.",
      story: "You set the focusing lens above the core while the Keeper fits the three ward crystals into its heart. Mira turns the charging ring. The function named power can send energy into the core, but its call supplies only one spark. Pass 3 into its amount parameter. Outside the chamber, the stormwraith claws at the last unlit defense ring.",
      quest: {"need": "An energized beacon heart ready to raise the town-wide ward.", "reward": {"id": "beacon-heart", "name": "Beacon heart · Energized", "icon": "♥", "kind": "part"}, "defense": 86, "threat": "Stormwraith tendrils at the beacon core"},
      goal: "Change power(1) to power(3). Keep charge(amount) inside the function.",
      lessonTitle: "13. A parameter carries a value in",
      lesson: "amount is a parameter: a name waiting for a value when power is called. power(3) gives amount the value 3 for that call. Then charge(amount) uses it inside the function.",
      starter: "function power(amount) {\n  charge(amount);\n}\npower(1);",
      solution: "function power(amount) {\n  charge(amount);\n}\npower(3);",
      hints: [
        "Find the call at the bottom. The number between its parentheses becomes amount inside the function.",
        "Use power(3); on the final line. The function can keep charge(amount); because amount now receives 3."
      ],
      success: "Three sparks flow into the repaired heart. The lens turns, and the first defense ring rises around the tower. You gain an energized beacon heart. The wraith recoils, then hurls itself toward the town: the full ward still needs your final command.",
      explanation: "power(3) passed 3 into amount, and charge(amount) used that input to energize the core. The same function could accept different amounts; your call chose the one this heart needed.",
      start: {x: 3, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "◇"},
      check: result => used(result, "functions") && used(result, "parameters") && action(result, "charge", value => value === 3)
    },
    {
      chapter: "CHAPTER 6 · THE WARDTOWER", topic: "YOUR ADVENTURE", speaker: "IRIS · GAME MASTER",
      theme: "beacon", title: "Raise the Stormward", place: "Wardtower summit · Starlight Bay beneath the storm",
      cue: "The wraith descends. The whole town is behind you.", objective: "Call lightBeacon() to charge the core and raise all three ward defenses.",
      story: "You stand at the summit with the stormwraith blotting out the sky. Below, the harbor, village and tower watch hold their gates. Mira braces the lens; the Keeper locks your crystals into place; PIX awaits the final plan. lightBeacon remembers three crystals, checks the supply, charges the core and sends three Home! signals to the ward rings. Call it. Your code is the only thing between the town and the storm.",
      quest: {"need": "The completed Stormward protecting every district of Starlight Bay.", "reward": {"id": "restored-stormward", "name": "Stormward · Town defenses restored", "icon": "☀", "kind": "defense"}, "defense": 100, "threat": "Stormwraith attacking Starlight Bay"},
      goal: "Add lightBeacon(); after the last } to run the rescue plan: charge 3 and send three Home! signals.",
      lessonTitle: "14. Small ideas make a great adventure",
      lesson: 'Read the plan from top to bottom. It remembers 3 stars, checks they are enough, charges the beacon, then repeats the "Home!" signal three times. You already know how to call a function: add its name and ().',
      starter: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\n// One final line: call the plan.',
      solution: 'function lightBeacon() {\n  let stars = 3;\n  if (stars >= 3) {\n    charge(stars);\n    for (let signal = 0; signal < 3; signal++) {\n      say("Home!");\n    }\n  }\n}\nlightBeacon();',
      hints: [
        "The whole rescue plan is ready. Its commands will wait until the named function is called, just like crossGap in the stairway mission.",
        "Add lightBeacon(); on a new line after the last }. Keep the function's name, both parentheses and the semicolon."
      ],
      success: "Home! Home! Home! Three rings of light rise from the wardtower and join above the roofs. The stormwraith strikes the shield, breaks into rain and vanishes. You watch the harbor gates reopen and families step safely into the dawn. Mira grips your shoulder. The Keeper bows. PIX raises one copper hand: you restored Starlight Bay's defenses, and you brought everyone home.",
      explanation: "Your function combined a variable, a true condition, a charge command and three looped signals. Calling the plan raised the completed Stormward; every small programming skill helped save the town.",
      start: {x: 3, y: 2, dir: "east"}, target: {x: 5, y: 1, icon: "✦"},
      check: result => ["functions", "variables", "if", "for"].every(feature => used(result, feature)) && action(result, "charge", value => value === 3) && result.actions.filter(item => item.type === "say" && item.value.trim().toLowerCase() === "home!").length === 3
    }
  ];
})();
