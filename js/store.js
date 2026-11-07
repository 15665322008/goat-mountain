/* Local profiles, WOOL, best scores, and the on-device leaderboard. */
(function () {
  "use strict";

  const KEY = "mountain-barn-save-v1";

  function empty() {
    return { current: "", profiles: {} };
  }

  function sanitize(name) {
    return String(name || "")
      .replace(/[\u0000-\u001f]/g, "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 12);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return empty();
      if (!data.profiles || typeof data.profiles !== "object") data.profiles = {};
      data.current = sanitize(data.current || "");
      return data;
    } catch (err) {
      return empty();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      /* private mode or a full disk: the run still plays */
    }
  }

  function blankProfile(name) {
    return { name: name, wool: 0, bestClimb: 0, bestBridge: 0, updated: 0 };
  }

  function getCurrent() {
    const state = load();
    const name = state.current || "";
    const profile = name && state.profiles[name] ? state.profiles[name] : blankProfile(name);
    return {
      name: name,
      wool: profile.wool || 0,
      bestClimb: profile.bestClimb || 0,
      bestBridge: profile.bestBridge || 0,
    };
  }

  function setNickname(name) {
    const state = load();
    const clean = sanitize(name);
    state.current = clean;
    save(state);
    return clean;
  }

  function commit(kind, score, wool) {
    const state = load();
    const name = state.current || "游客";
    if (!state.profiles[name]) state.profiles[name] = blankProfile(name);
    const profile = state.profiles[name];
    profile.wool = (profile.wool || 0) + Math.max(0, Math.floor(wool || 0));
    profile.updated = Date.now();
    const sc = Math.max(0, Math.floor(score || 0));
    let isBest = false;
    if (kind === "climb") {
      isBest = sc > (profile.bestClimb || 0);
      if (sc > (profile.bestClimb || 0)) profile.bestClimb = sc;
    } else if (kind === "bridge") {
      isBest = sc > (profile.bestBridge || 0);
      if (sc > (profile.bestBridge || 0)) profile.bestBridge = sc;
    }
    state.current = name;
    save(state);
    return { name: name, profile: profile, isBest: isBest };
  }

  function leaderboard() {
    const state = load();
    return Object.keys(state.profiles)
      .map(function (key) { return state.profiles[key]; })
      .filter(function (profile) {
        if (!profile || !profile.name) return false;
        return (profile.wool || 0) > 0 || (profile.bestClimb || 0) > 0 || (profile.bestBridge || 0) > 0;
      })
      .sort(function (a, b) {
        if ((b.wool || 0) !== (a.wool || 0)) return (b.wool || 0) - (a.wool || 0);
        const as = (a.bestClimb || 0) + (a.bestBridge || 0);
        const bs = (b.bestClimb || 0) + (b.bestBridge || 0);
        return bs - as;
      })
      .slice(0, 8);
  }

  window.Store = {
    sanitize: sanitize,
    getCurrent: getCurrent,
    setNickname: setNickname,
    commit: commit,
    leaderboard: leaderboard,
  };
})();
