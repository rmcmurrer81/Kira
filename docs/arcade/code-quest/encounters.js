/* Original route encounters. Every route rejoins its required coding mission.
 * An ambush changes the encounter, never skips the rune lock or removes progress.
 */
(() => {
  "use strict";
  window.CodeQuestEncounters = [
    [
      {
        id: "smithy-workbench", label: "Take shelter at Mira's workbench", kind: "safe",
        description: "A lit workbench stands behind the smithy's heavy inner door.",
        narration: "You choose the workbench. Mira drops a bar across the inner door while the stormwraith claws at the outer shutters. A silent clockwork companion waits on the bench. Wake PIX with his greeting; his rune-reader is your only way into the wardworks.",
        blocked: "The undercroft lock waits for PIX's rune-reader. Wake him with Hello, PIX!",
        clear: "PIX wakes and seals the shutters. You can follow Mira into the undercroft."
      },
      {
        id: "smithy-cellar", label: "Search the unlit cellar for an exit", kind: "ambush",
        description: "A narrow cellar stair disappears behind a stack of broken shields.",
        narration: "You choose the cellar. A stormwraith bursts from the black stairwell and lashes its claws across the wall! You fall back to the workbench as Mira bars the stair. Weapons pass through the creature. Wake PIX with his greeting so his rune-reader can seal the opening and lead you below.",
        blocked: "A stormwraith blocks the cellar. Only PIX's awakened rune-reader can close its breach.",
        clear: "PIX wakes and sends a rune seal across the cellar mouth. The wraith recoils; your path to the undercroft opens."
      }
    ],
    [
      {
        id: "lantern-bracket", label: "Inspect the lantern above the iron bars", kind: "safe",
        description: "Three empty lantern sockets surround a carved stair lock.",
        narration: "You choose the lantern bracket. Its lightless sockets connect to the bars over the descent. Mira steadies the casing while PIX reads the rune named crystals. Store 3 and charge the lantern; the shadows cannot cross a complete ward ring.",
        blocked: "The ward lantern needs three sparks before the stair bars will rise.",
        clear: "Three sockets burn bright. The stair bars rise, giving you a protected descent."
      },
      {
        id: "lantern-drain", label: "Try the low drain beside the stairs", kind: "ambush",
        description: "A dry drain seems wide enough to crawl around the bars.",
        narration: "You choose the drain. Ashlings spill from its mouth, their ember eyes flaring inches above the floor! PIX pulls you behind the iron bars. The drain is a nest, and the creatures now cover the stair. Charge all three sockets of the ward lantern to drive them back; set crystals to 3.",
        blocked: "Ashlings cover the lower stair. A fully charged ward lantern must clear them.",
        clear: "The lantern's complete ring of light scatters the ashlings and lifts the stair bars."
      }
    ],
    [
      {
        id: "courtyard-chest-stones", label: "Follow the stones toward the key chest", kind: "safe",
        description: "Three clear stone squares lead east to a glowing chest marker.",
        narration: "You choose the chest stones. A shadowhound prowls beyond the far grate, but Mira's lantern keeps it at a distance. Send PIX exactly three squares east. He can reach the chest stone and recover the two keys while you guard the broken archway.",
        blocked: "The chest is three squares away. PIX must reach its marker to fetch the crypt keys.",
        clear: "PIX opens the chest and brings you the twin keys. Its ward grate seals the archway behind him."
      },
      {
        id: "courtyard-ivy-arch", label: "Slip through the ivy-covered arch", kind: "ambush",
        description: "A side arch appears to lead around the unstable chest stones.",
        narration: "You choose the ivy arch. A shadowhound leaps from behind the stonework, jaws snapping at your lantern! You retreat onto the marked path. The key chest controls a ward grate that can trap it beyond the arch. Send PIX three squares east to open the chest; the keys and the grate are your escape.",
        blocked: "The shadowhound cuts off the side arch. Reach the key chest to close its ward grate.",
        clear: "PIX triggers the chest lock. The grate drops between you and the hound, and you claim the crypt keys."
      }
    ],
    [
      {
        id: "crypt-marked-bridge", label: "Take the bent stone bridge", kind: "safe",
        description: "Dry stones run east, then bend toward the sluice below.",
        narration: "You choose the marked bridge. Water rushes between the tombs, but four dry stones still reach the sluice. Guide PIX east twice, turn right, then move twice more. He must reach the lever to drain a path for you and Mira.",
        blocked: "The sluice waits beyond the bend. PIX needs the moves and turn in the correct order.",
        clear: "PIX reaches the sluice. The flood drains and exposes a passage into the lower crypt."
      },
      {
        id: "crypt-flooded-aisle", label: "Wade down the shorter tomb aisle", kind: "ambush",
        description: "Dark water hides a straight aisle between the tombs.",
        narration: "You choose the flooded aisle. A floodlurker erupts from the water, striking the tomb beside you with a hooked fin! You scramble onto the bent bridge. It circles below, blocking every shallow crossing. Guide PIX east twice, right, then twice south to the sluice; draining the crypt is the only way past it.",
        blocked: "A floodlurker patrols the water. Reach the sluice with the correct command sequence.",
        clear: "The sluice opens. Water carries the floodlurker down a sealed channel, leaving the crypt crossing clear."
      }
    ],
    [
      {
        id: "lift-control-dais", label: "Examine the lift's rune control", kind: "safe",
        description: "The iron cage hangs beside a control marked with three sparks.",
        narration: "You choose the control dais. The lift engine will accept exactly three sparks. Mira has one in the lamp, and PIX has two in his pocket. Add the supplies in energy, then charge the engine. The cage cannot descend until your calculation powers its lock.",
        blocked: "The chain lift needs exactly 3 energy, calculated from 1 + 2.",
        clear: "The lift lock releases. You descend into the vault before the ceiling sentinel can reach you."
      },
      {
        id: "lift-service-chain", label: "Pull the loose service chain", kind: "ambush",
        description: "A free chain hangs within reach of the lift cage.",
        narration: "You choose the service chain. The ceiling opens, and a chain sentinel drops down with iron hooks outstretched! Its weight jams the manual gear. You take shelter inside the cage. Only the rune engine can move it now: add the lamp's one spark to PIX's two and charge the lift with 3.",
        blocked: "The chain sentinel has jammed the hand gear. A correct energy calculation must power your descent.",
        clear: "Three sparks turn the engine. The cage drops beneath the sentinel's hooks and carries your party to the vault."
      }
    ],
    [
      {
        id: "vault-keyholes", label: "Use the two bronze keyholes", kind: "safe",
        description: "The main vault lock bears two keyholes and one damaged condition.",
        narration: "You choose the keyholes. Both crypt keys fit, but the rune condition demands three. The Keeper calls to you through the gate. Restore the test to keys >= 2 so the lock recognizes the two keys you actually hold.",
        blocked: "A false key condition holds the vault shut. Repair it to release the Keeper.",
        clear: "The repaired condition accepts your keys. The vault opens and the Warden seal comes free."
      },
      {
        id: "vault-sentinel-alcove", label: "Search behind the bronze sentinel", kind: "ambush",
        description: "A narrow alcove runs behind a motionless bronze guardian.",
        narration: "You choose the sentinel alcove. The bronze guardian snaps awake and brings its hammer down across your path! You leap back to the main lock. Its damaged rule also controls the guardian's oath. Make the two-key condition true; opening the gate will command the sentinel to stand down.",
        blocked: "The bronze sentinel blocks the alcove. Repair the two-key gate rule to lower its hammer.",
        clear: "The true condition releases the gate and renews the sentinel's oath. It kneels as you take the Warden seal."
      }
    ],
    [
      {
        id: "keeper-oath-circle", label: "Step into the Keeper's oath circle", kind: "safe",
        description: "An old oath is carved around the lantern's resting place.",
        narration: "You choose the oath circle. With your keys spent, force cannot open the Keeper's trust. The false key test must choose another response. Put We can share the light. inside else so PIX speaks the ward oath and reaches the ally beneath the shadow.",
        blocked: "The Keeper needs the shared-light oath from the false condition's else branch.",
        clear: "The oath clears the Keeper's shadow. He joins you and reveals the paths to the missing ward parts."
      },
      {
        id: "keeper-shattered-mirror", label: "Look through the shattered oath mirror", kind: "ambush",
        description: "A broken mirror reflects the Keeper without his shadow.",
        narration: "You choose the mirror. A shard shade springs out, and the Keeper's shadow lashes across the exit! Mira shields you with the lantern. Do not fight the trapped Warden. Leave keys at 0 and speak We can share the light. through else; the oath can separate him from the shade.",
        blocked: "A shard shade binds the Keeper and the exit. The else-branch oath must calm the encounter.",
        clear: "PIX speaks the oath. The shade crumbles into harmless glass, and the Keeper stands with your party."
      }
    ],
    [
      {
        id: "mine-rune-track", label: "Follow the four mine runes", kind: "safe",
        description: "A line of four ward tiles leads along the abandoned cart track.",
        narration: "You choose the rune track. The Keeper warns you that every tile must be activated separately. Loop move(1) four times to reach the gate. The resulting ward line will keep the side tunnels closed while Mira follows with the lantern.",
        blocked: "Four individual rune steps must unlock the mine passage.",
        clear: "Four steps wake four runes. The mine gate opens, and light seals the side tunnels."
      },
      {
        id: "mine-ore-chute", label: "Take the abandoned ore chute", kind: "ambush",
        description: "A sloping ore chute seems to bypass the four ward tiles.",
        narration: "You choose the ore chute. Cinder crawlers burst from the broken carts and race along its walls! The Keeper pulls you onto the main track. Their nest has opened beside you. Repeat one step four times to wake the full rune line; a single unlit tile would leave them a way through.",
        blocked: "Cinder crawlers cover the chute. Four looped single steps must raise the mine wards.",
        clear: "The fourth rune completes the barrier. The crawlers recoil into the chute as your mine gate opens."
      }
    ],
    [
      {
        id: "hoist-lantern-controls", label: "Follow the hoist's five lantern controls", kind: "safe",
        description: "Five marked controls run beside the lens hoist over the pit.",
        narration: "You choose the control path. The hoist needs all five lanterns activated before it will lower the lens. Set lanterns to 5 and let the loop read that value. PIX must take five single steps while Mira steadies the receiving frame.",
        blocked: "The focusing lens hangs locked until all five hoist controls are reached.",
        clear: "The fifth control releases the hoist. Mira secures the focusing lens for the town's beacon."
      },
      {
        id: "hoist-glass-ledge", label: "Reach for the lens from the glass ledge", kind: "ambush",
        description: "A narrow ledge appears to put the lens chain within arm's reach.",
        narration: "You choose the glass ledge. A glasspit prowler springs from the shards below and hooks its claws over the edge! You retreat to the controls as it smashes the direct reach to the chain. Only the hoist can recover the lens now. Set lanterns to 5 so PIX completes every control step.",
        blocked: "The prowler blocks the ledge. All five loop-controlled lanterns must lower the lens safely.",
        clear: "Five lights wake the hoist's guard ring. The prowler drops back into the pit, and you recover the lens."
      }
    ],
    [
      {
        id: "crystals-extractor", label: "Read the crystal extractor's list", kind: "safe",
        description: "A stone extractor links three numbered crystals to PIX's lantern.",
        narration: "You choose the extractor. Its list is missing crystal 3, leaving one ward root locked. Add 3 to the stars array so the prepared collection loop can release all three crystals. Your lantern has a socket for each one.",
        blocked: "The ward crystal set is incomplete until the array includes 1, 2 and 3.",
        clear: "The extractor releases every numbered crystal. You secure the complete set inside the lantern."
      },
      {
        id: "crystals-root-gap", label: "Squeeze between the silver roots", kind: "ambush",
        description: "A gap in the roots appears to lead directly behind the crystal sockets.",
        narration: "You choose the root gap. A glassback prowler drops from the ceiling, scattering crystal splinters across your path! You duck behind the extractor. Its complete collection cycle also closes the cavern ward door. Add crystal 3 to the list; recovering all three is the only way to seal the creature out.",
        blocked: "The glassback prowler holds the root passage. A complete crystal list must trigger the cavern seal.",
        clear: "All three crystals lift free. The ward door seals the prowler behind the roots, and your party can leave."
      }
    ],
    [
      {
        id: "bells-signal-gallery", label: "Use the three district warning stones", kind: "safe",
        description: "The gallery links one signal stone to each threatened district.",
        narration: "You choose the warning stones. Each loop turn must call its current place: harbor, village, then tower. Change the repeated command to say(place). All three watches must hear their warning before you can move the recovered ward parts through the streets.",
        blocked: "The town route needs three distinct district warnings from the loop's current place.",
        clear: "All three bells answer. The watches shelter the townspeople and open a guarded route to the wardtower."
      },
      {
        id: "bells-silent-street", label: "Take the silent street above the gallery", kind: "ambush",
        description: "A side stair rises toward an unguarded street leading to the tower.",
        narration: "You choose the silent street. Bell stalkers leap from the roof beams and cut off the lane! You fall back into the signal gallery. The district watches can clear your route, but harbor alone cannot reach every street. Use say(place) inside the loop to warn harbor, village and tower.",
        blocked: "Bell stalkers control the street. Warn every district so the watches can open your route.",
        clear: "Three district bells ring. The watches drive back the stalkers and escort your ward components to the tower."
      }
    ],
    [
      {
        id: "stairs-stone-rib", label: "Send PIX across the narrow stone rib", kind: "safe",
        description: "A two-square stone rib reaches the folded stair's release lever.",
        narration: "You choose the stone rib. Mira has defined crossGap to carry PIX two squares to the release. A plan alone will not move him. Call crossGap() after its closing brace; reaching the lever will open the stair for everyone carrying the heavy ward parts.",
        blocked: "The tower stair is folded shut. Call the crossing function to reach its release.",
        clear: "PIX reaches the lever. The stair unfolds, giving your whole party a way into the beacon chamber."
      },
      {
        id: "stairs-broken-landing", label: "Climb the broken outer landing", kind: "ambush",
        description: "Cracked masonry forms a rough climb beside the missing stair span.",
        narration: "You choose the outer landing. A stairbound sentinel tears free of the wall and slams a stone shield across the climb! You retreat to the narrow rib. The stair release renews its guardian's command. Call crossGap() so PIX reaches the lever; only the opened stair can bring your party past the sentinel.",
        blocked: "The sentinel blocks the climb. The crossing function must open the commanded stair passage.",
        clear: "PIX throws the lever. The stair opens, and the sentinel turns its shield outward to defend your ascent."
      }
    ],
    [
      {
        id: "heart-charging-ring", label: "Fit the crystals into the charging ring", kind: "safe",
        description: "Three ward sockets face the repaired heart beneath the focusing lens.",
        narration: "You choose the charging ring. The lens and crystals are in place, but the heart needs exactly 3 energy. Pass 3 to power(), and its amount parameter will carry the value into charge(). This inner defense must rise before you can command the full town ward.",
        blocked: "The beacon heart needs power(3) to energize its three fitted crystals.",
        clear: "Three sparks wake the heart. The first defense ring rises, holding the chamber against the storm."
      },
      {
        id: "heart-outer-balcony", label: "Check the lens from the outer balcony", kind: "ambush",
        description: "The balcony gives a clear view of the dark beacon lens.",
        narration: "You choose the balcony. A stormwraith tendril whips around the rail and tears toward the exposed heart! You slam the inner hatch and return to the charging ring. Pass 3 into power() so charge(amount) raises the core defense; the tendril cannot be cut with steel.",
        blocked: "Stormwraith tendrils breach the balcony. The heart's three-energy defense must drive them out.",
        clear: "The energized heart throws a ring of light across the balcony. The tendrils unravel, and the core is secure."
      }
    ],
    [
      {
        id: "finale-command-dais", label: "Stand at the Stormward command dais", kind: "safe",
        description: "The restored core faces a command dais linked to all three town wards.",
        narration: "You choose the command dais. The stormwraith gathers above Starlight Bay while the district watches hold their gates. Your rescue plan is ready inside lightBeacon. Call it after the last brace. The charged heart and three Home! signals must work together to raise the defenses over every family below.",
        blocked: "The whole town awaits the called rescue plan: charge 3 and send all three Home! signals.",
        clear: "The completed Stormward closes over the town. The wraith breaks against the shield, and every district is safe."
      },
      {
        id: "finale-shattered-parapet", label: "Face the wraith at the shattered parapet", kind: "ambush",
        description: "A broken parapet overlooks the wraith's approach to the town gates.",
        narration: "You choose the parapet. The stormwraith surges out of the clouds and strikes the tower, claws tearing through the broken stone! You fall back to the command dais as Mira and the Keeper brace the lens. You cannot fight the storm with a weapon. Call lightBeacon(): the charge and three Home! signals are the only way to raise the shield over the town.",
        blocked: "The stormwraith attacks the tower. Only the complete rescue function can raise the town-wide Stormward.",
        clear: "Three signals join the defense rings. The wraith crashes into the completed shield and dissolves into dawn rain. You have saved Starlight Bay."
      }
    ]
  ];
})();
