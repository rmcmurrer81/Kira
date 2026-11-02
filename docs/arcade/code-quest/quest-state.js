/* Code Quest's saved adventure state. No browser storage or rendering lives here.
 * The game calls solve() only after the bounded interpreter and mission check pass.
 * Save validation keeps state consistent; local saves are not cheat-proof evidence.
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CodeQuestState = api;
})(typeof window === "object" ? window : null, function () {
  "use strict";
  const SCHEMA = 3, MAX_DRAFT = 6000, MAX_COUNTER = 1000000;
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const integer = (value, maximum = MAX_COUNTER) => Number.isInteger(value) && value >= 0 ? Math.min(value, maximum) : 0;
  const identifier = value => typeof value === "string" && value.length > 0 && value.length <= 100;

  function create({ missions = [], encounters = [], saved = null } = {}) {
    missions = Array.isArray(missions) ? missions : [];
    encounters = Array.isArray(encounters) ? encounters : [];
    const routes = missions.map((_, index) => {
      const seen = new Set();
      return (Array.isArray(encounters[index]) ? encounters[index] : []).filter(route => {
        if (!record(route) || !identifier(route.id) || seen.has(route.id)) return false;
        seen.add(route.id); return true;
      });
    });
    const routeAt = (index, id) => routes[index]?.find(route => route.id === id) || null;
    const rewardAt = index => {
      const reward = missions[index]?.quest?.reward;
      return record(reward) && identifier(reward.id) ? reward.id : null;
    };
    const freshRoom = index => ({
      route: null, phase: "junction", gates: Object.fromEntries(routes[index].map(route => [route.id, false])),
      visited: [], reward: null, attempts: 0
    });
    const fresh = () => ({
      schema: SCHEMA, level: 0, drafts: missions.map(() => null), rooms: missions.map((_, index) => freshRoom(index)),
      inventory: [], defense: 0, setbacks: 0
    });
    const data = fresh();
    const hasGate = room => Object.values(room.gates).some(open => open === true);
    function completedCount() {
      let count = 0;
      while (count < data.rooms.length && hasGate(data.rooms[count])) count++;
      return count;
    }
    function refreshCredits() {
      const count = completedCount(), inventory = [], seen = new Set(); let defense = 0, setbacks = 0;
      data.rooms.forEach((room, index) => {
        room.reward = index < count ? rewardAt(index) : null;
        if (room.reward && !seen.has(room.reward)) { seen.add(room.reward); inventory.push(room.reward); }
        if (index < count) {
          const protection = missions[index]?.quest?.defense;
          if (typeof protection === "number" && Number.isFinite(protection)) defense = Math.max(defense, Math.max(0, Math.min(100, protection)));
        }
        for (const id of room.visited) {
          const kind = routeAt(index, id)?.kind;
          if (kind === "ambush" || kind === "detour") setbacks++;
        }
      });
      data.inventory = inventory; data.defense = defense; data.setbacks = setbacks;
    }

    // Accept only this schema. Earlier game saves remain untouched in their own
    // storage key and cannot silently award quest equipment or town protection.
    if (record(saved) && saved.schema === SCHEMA) {
      const previousDrafts = Array.isArray(saved.drafts) ? saved.drafts : [];
      const previousRooms = Array.isArray(saved.rooms) ? saved.rooms : [];
      data.drafts = missions.map((_, index) => typeof previousDrafts[index] === "string" ? previousDrafts[index].slice(0, MAX_DRAFT) : null);
      data.rooms = missions.map((_, index) => {
        const room = freshRoom(index), previous = previousRooms[index];
        if (!record(previous)) return room;
        if (record(previous.gates)) {
          for (const route of routes[index]) room.gates[route.id] = Object.hasOwn(previous.gates, route.id) && previous.gates[route.id] === true;
        }
        const visited = Array.isArray(previous.visited) ? previous.visited : [];
        room.visited = [...new Set(visited.filter(id => routeAt(index, id)))];
        room.route = routeAt(index, previous.route) ? previous.route : null;
        if (room.route && !room.visited.includes(room.route)) room.visited.push(room.route);
        // An opened gate proves that its route was visited, even if a damaged
        // save omitted the visit list. This also prevents recounting its hazard.
        for (const route of routes[index]) if (room.gates[route.id] && !room.visited.includes(route.id)) room.visited.push(route.id);
        room.phase = room.route ? room.gates[room.route] ? "cleared" : "encounter" : "junction";
        room.attempts = integer(previous.attempts);
        return room;
      });
      const first = completedCount();
      // A room after the first unfinished one was never reachable. Keep editor
      // drafts, but discard impossible future routes, gates, visits and rewards.
      for (let index = first + 1; index < missions.length; index++) data.rooms[index] = freshRoom(index);
      data.level = Math.min(integer(saved.level), first, Math.max(0, missions.length - 1));
      refreshCredits();
    }

    const room = () => data.rooms[data.level] || null;
    const activeRoute = () => routeAt(data.level, room()?.route);
    const gateOpen = () => Boolean(activeRoute() && room().gates[room().route] === true);
    const firstUnfinished = () => completedCount();
    function canVisit(index) {
      if (!Number.isInteger(index) || index < 0 || index >= missions.length || index > firstUnfinished()) return false;
      return index <= data.level || gateOpen();
    }
    function chooseRoute(id) {
      const current = room(), route = routeAt(data.level, id);
      if (!current || !route || data.level > firstUnfinished()) return false;
      current.route = route.id;
      if (!current.visited.includes(route.id)) current.visited.push(route.id);
      current.phase = current.gates[route.id] ? "cleared" : "encounter";
      refreshCredits(); return true;
    }
    function retreat() {
      const current = room(); if (!current) return false;
      current.route = null; current.phase = "junction"; return true;
    }
    function solve() {
      const current = room();
      if (!current || !activeRoute() || !record(missions[data.level]) || !rewardAt(data.level) || data.level > firstUnfinished()) return false;
      current.gates[current.route] = true; current.phase = "cleared";
      refreshCredits(); return true;
    }
    function fail() {
      const current = room(); if (!current || !activeRoute()) return false;
      current.attempts = Math.min(MAX_COUNTER, current.attempts + 1); return true;
    }
    function goTo(index) { if (!canVisit(index)) return false; data.level = index; return true; }
    function restart() { Object.assign(data, fresh()); return true; }
    function setDraft(code) {
      if (!room() || !(typeof code === "string" || code === null)) return false;
      data.drafts[data.level] = typeof code === "string" ? code.slice(0, MAX_DRAFT) : null; return true;
    }
    return { data, room, activeRoute, gateOpen, completedCount, firstUnfinished, canVisit, chooseRoute, retreat, solve, fail, goTo, restart, setDraft };
  }
  return { create };
});
