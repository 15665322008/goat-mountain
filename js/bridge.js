/* Bridge Run: side-scrolling islands linked by Cashmere Bridge V2. */
(function () {
  "use strict";

  const GRAVITY = 2100;
  const JUMP_V = 760;
  const DJUMP_V = 640;
  const BOOST_TIME = 5.2;

  const CHAINS = [
    { name: "Ethereum", color: "#627eea" },
    { name: "Optimism", color: "#ff4d3a" },
    { name: "Arbitrum", color: "#12aaff" },
    { name: "Base", color: "#0052ff" },
    { name: "Solana", color: "#9945ff" },
    { name: "Polygon", color: "#8247e5" },
    { name: "Avalanche", color: "#e84142" },
    { name: "BNB Chain", color: "#f0b90b" },
    { name: "zkSync", color: "#8c8dfc" },
    { name: "Scroll", color: "#c9852a" },
    { name: "Linea", color: "#121212" },
    { name: "Mantle", color: "#1f8a70" },
    { name: "Blast", color: "#e2c200" },
    { name: "Sui", color: "#4da2ff" },
    { name: "Aptos", color: "#2dd8a3" },
    { name: "Mode", color: "#c6e34a" },
    { name: "Starknet", color: "#ec796b" },
    { name: "Manta", color: "#29d0c8" },
    { name: "Taiko", color: "#e81899" },
    { name: "Sei", color: "#9b1c2e" },
    { name: "Fantom", color: "#13b5ec" },
    { name: "Core", color: "#ff9211" },
    { name: "opBNB", color: "#f3ba2f" },
    { name: "Merlin", color: "#8b5a2b" },
  ];

  const canvas = document.getElementById("game");
  const stage = document.getElementById("stage");
  const how = document.getElementById("how");
  const btnJump = document.getElementById("btn-jump");
  const btnPause = document.getElementById("btn-pause");

  let state = "play";
  let segments = [];
  let parts = [];
  let texts = [];
  let cursor = 0;
  let chainI = 0;
  let sinceRoute = 0;
  let player = { x: 150, y: 0, w: 46, h: 52, vy: 0, jumps: 0, coyote: 0 };
  let placed = false;
  let distance = 0;
  let wool = 0;
  let chains = 0;
  let boostT = 0;
  let buffer = 0;
  let time = 0;
  let runT = 0;
  let face = 1;
  let blinkIn = 2.6;
  let blinking = 0;
  let squashT = 0;
  let shake = 0;
  let frames = 0;
  let pending = null;
  let lastSave = null;
  let dyingT = 0;
  let lastGround = 0;
  let farIslands = [];

  const ui = GameUI.mount({
    onResume: function () { resume(); },
    onRetry: function () { retry(); },
  });

  function nextChain() {
    const chain = CHAINS[chainI % CHAINS.length];
    chainI += 1;
    return chain;
  }

  function viewMetrics() {
    const cssW = Math.max(1, stage.clientWidth);
    const cssH = Math.max(1, stage.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const camW = cssW < 560 ? 500 : cssW < 980 ? 700 : 880;
    const scale = cssW / camW;
    const worldH = cssH / scale;
    const ground = worldH * (worldH > 760 ? 0.62 : 0.74);
    return { cssW: cssW, cssH: cssH, dpr: dpr, camW: camW, scale: scale, worldH: worldH, ground: ground };
  }

  function speedAt(dist) {
    return 220 + Math.min(260, Math.max(0, dist) * 0.03);
  }

  function speedNow() {
    return speedAt(distance) * (boostT > 0 ? 1.38 : 1);
  }

  function metersNow() {
    return Math.floor(distance / 12);
  }

  function scoreNow() {
    return metersNow() + wool;
  }

  function pushIsland(w, opts) {
    const options = opts || {};
    const chain = nextChain();
    const obs = [];
    const picks = [];
    if (options.crate) obs.push({ x: Math.min(w - 80, Math.max(190, w * 0.58)), w: 38, h: 46, kind: "crate" });
    if (!options.safe && !options.crate && w > 340 && Math.random() < 0.8) {
      const kind = Math.random() < 0.45 ? "log" : "crate";
      const ow = kind === "log" ? 86 : 36;
      const oh = kind === "log" ? 28 : 44;
      obs.push({ x: 120 + Math.random() * Math.max(20, w - 240), w: ow, h: oh, kind: kind });
      if (w > 460 && Math.random() < 0.45) {
        obs.push({ x: Math.min(w - 90, 280 + Math.random() * 80), w: 34, h: 48, kind: "crate" });
      }
    }
    if (options.wool || Math.random() < 0.7) {
      const woolX = options.safe ? Math.min(w - 40, w * 0.62) : w * 0.42;
      picks.push({ x: woolX, dy: -34, kind: "wool", value: 10, taken: false });
    }
    sinceRoute += w;
    if (options.route || sinceRoute > 2100) {
      picks.push({ x: Math.min(w - 50, w * 0.72), dy: -108, kind: "route", value: 0, taken: false });
      sinceRoute = 0;
    }
    segments.push({ x: cursor, w: w, kind: "island", chain: chain, obs: obs, picks: picks, scored: false });
    cursor += w;
  }

  function pushBridge(w) {
    const picks = [{ x: w * 0.55, dy: -36, kind: "wool", value: 10, taken: false }];
    segments.push({ x: cursor, w: w, kind: "bridge", chain: null, obs: [], picks: picks, scored: false });
    cursor += w;
    sinceRoute += w;
  }

  function pushGap(w) {
    segments.push({ x: cursor, w: w, kind: "gap", chain: null, obs: [], picks: [], scored: false });
    cursor += w;
  }

  function reset() {
    segments = [];
    parts = [];
    texts = [];
    cursor = 0;
    chainI = 0;
    sinceRoute = 900;
    distance = 0;
    wool = 0;
    chains = 0;
    boostT = 0;
    buffer = 0;
    shake = 0;
    placed = false;
    pending = null;
    lastSave = null;
    dyingT = 0;
    state = "play";
    player.x = 150;
    player.vy = 0;
    player.jumps = 0;
    player.coyote = 0.12;
    pushIsland(500, { safe: true, wool: true });
    pushBridge(230);
    pushIsland(460, { crate: true, wool: true, route: true });
    pushBridge(210);
    pushIsland(400, { safe: true });
    ensureSegments();
    farIslands = [];
    for (let i = 0; i < 5; i++) {
      farIslands.push({
        x: i * 420 + 80,
        h: 40 + (i % 3) * 18,
        w: 120 + (i % 2) * 40,
      });
    }
    ui.close();
    ui.boost(0);
    paintHud();
  }

  function ensureSegments() {
    let guard = 0;
    while (cursor < player.x + 2000 && guard < 24) {
      guard += 1;
      const diff = Draw.clamp((cursor - 1400) / 7800, 0, 1);
      const islandW = 360 + Math.random() * (180 - diff * 30);
      pushIsland(islandW, {});
      if (Math.random() < 0.78) pushBridge(180 + Math.random() * 80);
      const spd = speedAt(cursor);
      const wide = diff > 0.22 && Math.random() < 0.28 + diff * 0.4;
      const gapT = wide ? 0.8 + diff * 0.08 : 0.26 + diff * 0.08;
      pushGap(Math.max(86, spd * gapT));
    }
  }

  function segmentAt(x) {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (x >= seg.x && x <= seg.x + seg.w) return seg;
    }
    return null;
  }

  function paintHud() {
    ui.hud(String(scoreNow()), I18n.t("meters", { n: metersNow() }), String(wool));
    ui.chains(chains);
    ui.boost(boostT > 0 ? boostT / BOOST_TIME : 0);
  }

  function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.4 + Math.random() * 0.2,
        max: 0.6,
        size: 3 + Math.random() * 2,
        color: color,
      });
    }
  }

  function takePickup(seg, pick, ground) {
    pick.taken = true;
    const py = ground + pick.dy;
    const px = seg.x + pick.x;
    if (pick.kind === "route") {
      boostT = BOOST_TIME;
      texts.push({ x: px, y: py, text: I18n.t("bestRoutePop"), life: 0.9, max: 0.9 });
      burst(px, py, "#ffe7a8", 10, 140);
      Sfx.boost();
      return;
    }
    const bonus = boostT > 0 ? pick.value * 2 : pick.value;
    wool += bonus;
    texts.push({ x: px, y: py, text: "+" + bonus, life: 0.7, max: 0.7 });
    burst(px, py, "#ffe7a8", 6, 90);
    Sfx.wool();
  }

  function beginEnd(reason) {
    if (state === "dying" || state === "over") return;
    pending = {
      reason: reason,
      score: scoreNow(),
      wool: wool,
      meters: metersNow(),
      chains: chains,
    };
    state = "dying";
    dyingT = 0.45;
    shake = 7;
    Sfx.die();
  }

  function shareUrl(text) {
    return "https://x.com/intent/post?text=" + encodeURIComponent(text);
  }

  function overModel() {
    const saved = lastSave || { name: "游客", isBest: false };
    const text = I18n.t("bridgeShare", {
      chains: pending.chains,
      chainWord: I18n.t(pending.chains === 1 ? "chainOne" : "chainMany"),
      score: pending.score,
      wool: pending.wool,
    });
    return {
      kicker: saved.isBest ? I18n.t("newRecord") : I18n.t("gameOver"),
      title: saved.isBest ? I18n.t("newRecordBang") : I18n.t(pending.reason === "hit" ? "hitObstacle" : "fellSea"),
      score: String(pending.score),
      sub: I18n.t("bridgeOverSub", {
        m: pending.meters,
        wool: pending.wool,
        chains: pending.chains,
        chainWord: I18n.t(pending.chains === 1 ? "chainOne" : "chainMany"),
        name: I18n.displayName(saved.name),
      }),
      share: shareUrl(text),
      retry: I18n.t("runAgain"),
    };
  }

  function pauseModel() {
    return {
      kicker: I18n.t("paused"),
      title: I18n.t("bridgePauseTitle"),
      score: String(scoreNow()),
      sub: I18n.t("bridgePauseSub", {
        m: metersNow(),
        wool: wool,
        chains: chains,
        chainWord: I18n.t(chains === 1 ? "chainOne" : "chainMany"),
      }),
      share: "",
      retry: I18n.t("restart"),
    };
  }

  function showOver() {
    state = "over";
    if (!lastSave) lastSave = Store.commit("bridge", pending.score, pending.wool);
    ui.openOver(overModel());
  }

  function tryJump() {
    if (player.coyote > 0 && player.jumps === 0) {
      player.vy = -JUMP_V;
      player.jumps = 1;
      player.coyote = 0;
      buffer = 0;
      squashT = 0.1;
      Sfx.jump();
      return;
    }
    if (player.jumps === 1) {
      player.vy = -DJUMP_V;
      player.jumps = 2;
      buffer = 0;
      squashT = 0.1;
      burst(player.x + player.w / 2, player.y + player.h, "#fff", 5, 70);
      Sfx.djump();
    }
  }

  function update(dt) {
    time += dt;
    blinkIn -= dt;
    if (blinking > 0) blinking -= dt;
    if (blinkIn <= 0) {
      blinking = 0.12;
      blinkIn = 2.4 + Math.random() * 2.2;
    }
    if (shake > 0) shake *= Math.pow(0.05, dt);

    const metrics = viewMetrics();
    if (!placed) {
      player.y = metrics.ground - player.h;
      placed = true;
      lastGround = metrics.ground;
    } else if (Math.abs(metrics.ground - lastGround) > 0.5) {
      player.y += metrics.ground - lastGround;
      lastGround = metrics.ground;
    }

    if (state === "pause" || state === "over") return;

    if (state === "dying") {
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;
      player.x += speedNow() * 0.35 * dt;
      dyingT -= dt;
      stepFx(dt);
      if (dyingT <= 0) showOver();
      return;
    }

    if (boostT > 0) {
      boostT -= dt;
      if (boostT < 0) boostT = 0;
    }

    const spd = speedNow();
    player.x += spd * dt;
    distance += spd * dt;

    const prevY = player.y;
    player.vy = Math.min(1500, player.vy + GRAVITY * dt);
    player.y += player.vy * dt;

    const footX = player.x + player.w * 0.55;
    const seg = segmentAt(footX);
    const groundedLine = metrics.ground;
    let grounded = false;
    const prevBottom = prevY + player.h;
    const bottom = player.y + player.h;
    const boosted = boostT > 0;

    if (seg && seg.kind !== "gap") {
      let standY = groundedLine;
      let sideHit = false;
      for (let i = 0; i < seg.obs.length; i++) {
        const obs = seg.obs[i];
        const ox = seg.x + obs.x;
        const oy = groundedLine - obs.h;
        const overlaps = player.x + player.w - 6 > ox && player.x + 8 < ox + obs.w
          && bottom > oy + 4 && player.y < groundedLine - 4;
        if (!overlaps) continue;
        const landing = player.vy >= 0 && prevBottom <= oy + 12 && bottom >= oy;
        if (landing) standY = Math.min(standY, oy);
        else if (!boosted) sideHit = true;
      }
      if (sideHit) {
        beginEnd("hit");
        return;
      }
      if (player.vy >= 0 && prevBottom <= standY + 14 && bottom >= standY) {
        player.y = standY - player.h;
        player.vy = 0;
        player.jumps = 0;
        player.coyote = 0.1;
        grounded = true;
      }
    }

    if (!grounded) player.coyote -= dt;

    if (buffer > 0) {
      buffer -= dt;
      tryJump();
    }

    if (player.y > groundedLine + 150) {
      beginEnd("fall");
      return;
    }

    segments.forEach(function (piece) {
      if (piece.kind === "island" && !piece.scored && player.x > piece.x + 36) {
        piece.scored = true;
        chains += 1;
      }
      if (piece.kind === "gap") return;
      for (let i = 0; i < piece.picks.length; i++) {
        const pick = piece.picks[i];
        if (pick.taken) continue;
        const px = piece.x + pick.x;
        const py = groundedLine + pick.dy;
        if (hitCircle(px, py, pick.kind === "route" ? 20 : 16)) takePickup(piece, pick, groundedLine);
      }
    });

    if (grounded && Math.random() < dt * 8) {
      parts.push({
        x: player.x + 6,
        y: player.y + player.h,
        vx: -40,
        vy: -20,
        life: 0.3,
        max: 0.3,
        size: 3,
        color: "rgba(255,250,240,0.8)",
      });
    }
    if (boosted && Math.random() < 0.8) {
      parts.push({
        x: player.x,
        y: player.y + 20 + Math.random() * 20,
        vx: -80,
        vy: (Math.random() - 0.5) * 30,
        life: 0.35,
        max: 0.35,
        size: 4,
        color: "#f0b429",
      });
    }

    ensureSegments();
    const keep = player.x - 700;
    segments = segments.filter(function (piece) { return piece.x + piece.w > keep; });

    runT += dt * (grounded ? 13 : 4);
    squashT = Math.max(0, squashT - dt);
    stepFx(dt);
    paintHud();
  }

  function hitCircle(x, y, r) {
    const nx = Draw.clamp(x, player.x, player.x + player.w);
    const ny = Draw.clamp(y, player.y, player.y + player.h);
    const dx = x - nx;
    const dy = y - ny;
    return dx * dx + dy * dy <= r * r;
  }

  function stepFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      texts[i].life -= dt;
      texts[i].y -= 28 * dt;
      if (texts[i].life <= 0) texts.splice(i, 1);
    }
  }

  function queueJump() {
    if (state !== "play") return;
    buffer = 0.14;
    if (how) how.classList.add("hidden");
    Sfx.unlock();
  }

  function drawIsland(ctx, seg, ground) {
    const x = seg.x;
    const w = seg.w;
    const top = ground;
    ctx.fillStyle = "rgba(20, 50, 70, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + 78, w * 0.42, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b4630";
    ctx.beginPath();
    ctx.moveTo(x + 18, top);
    ctx.lineTo(x + w - 18, top);
    ctx.lineTo(x + w - 36, top + 78);
    ctx.quadraticCurveTo(x + w / 2, top + 96, x + 36, top + 78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#8d6244";
    ctx.fillRect(x + 28, top + 8, 10, 36);

    ctx.fillStyle = "#34784a";
    Draw.roundRect(ctx, x, top - 18, w, 28, 12);
    ctx.fill();
    ctx.fillStyle = "#69b56a";
    ctx.fillRect(x + 8, top - 16, w - 16, 5);
    ctx.fillStyle = seg.chain.color;
    ctx.fillRect(x + 14, top - 6, w - 28, 5);

    const label = seg.chain.name;
    let labelSize = 15;
    ctx.font = "700 " + labelSize + "px " + Draw.FONT;
    while (labelSize > 10 && ctx.measureText(label).width > w - 58) {
      labelSize -= 1;
      ctx.font = "700 " + labelSize + "px " + Draw.FONT;
    }
    const tw = Math.min(w - 16, ctx.measureText(label).width + 34);
    const tx = x + 16;
    const ty = top - 52;
    ctx.fillStyle = "rgba(27,36,48,0.82)";
    Draw.roundRect(ctx, tx, ty, tw, 26, 13);
    ctx.fill();
    ctx.fillStyle = seg.chain.color;
    ctx.beginPath();
    ctx.arc(tx + 13, ty + 13, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#fffaf3";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, tx + 24, ty + 13.5);

    if (w > 280) {
      const px = x + w * 0.78;
      ctx.fillStyle = "#e7eef5";
      ctx.beginPath();
      ctx.moveTo(px - 16, top - 16);
      ctx.lineTo(px, top - 58);
      ctx.lineTo(px + 26, top - 16);
      ctx.fill();
      ctx.fillStyle = "#f7fbff";
      ctx.beginPath();
      ctx.moveTo(px - 6, top - 40);
      ctx.lineTo(px, top - 58);
      ctx.lineTo(px + 10, top - 42);
      ctx.fill();
    }
  }

  function drawBridge(ctx, seg, ground) {
    const x = seg.x;
    const y = ground - 10;
    const w = seg.w;
    ctx.strokeStyle = "#6e4124";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.quadraticCurveTo(x + w / 2, y + 8, x + w, y - 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 16);
    ctx.quadraticCurveTo(x + w / 2, y + 28, x + w, y + 16);
    ctx.stroke();
    for (let px = x + 2; px < x + w - 8; px += 16) {
      ctx.fillStyle = ((px / 16) | 0) % 2 === 0 ? "#c48a52" : "#a86b3c";
      ctx.fillRect(px, y - 2, 13, 16);
    }
    ctx.strokeStyle = "#5c3a22";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 16);
    ctx.moveTo(x + w, y - 18);
    ctx.lineTo(x + w, y + 16);
    ctx.stroke();
  }

  function drawObstacle(ctx, seg, obs, ground) {
    const x = seg.x + obs.x;
    const y = ground - obs.h;
    if (obs.kind === "log") {
      ctx.fillStyle = "#6e4124";
      Draw.roundRect(ctx, x, y + 8, obs.w, obs.h - 8, 6);
      ctx.fill();
      ctx.fillStyle = "#8d5a32";
      ctx.fillRect(x, y + 10, obs.w, 6);
      return;
    }
    ctx.fillStyle = "#c48a52";
    Draw.roundRect(ctx, x, y, obs.w, obs.h, 4);
    ctx.fill();
    ctx.strokeStyle = "#6e4124";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, obs.w - 6, obs.h - 6);
    ctx.beginPath();
    ctx.moveTo(x, y + obs.h / 2);
    ctx.lineTo(x + obs.w, y + obs.h / 2);
    ctx.stroke();
  }

  function render() {
    const v = viewMetrics();
    const dpr = v.dpr;
    const bw = Math.max(2, Math.floor(v.cssW * dpr));
    const bh = Math.max(2, Math.floor(v.cssH * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    const ctx = canvas.getContext("2d");
    const cameraX = player.x - v.camW * 0.24;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, v.cssH);
    sky.addColorStop(0, "#79c4ec");
    sky.addColorStop(0.55, "#d7f3fb");
    sky.addColorStop(1, "#b7e2c8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, v.cssW, v.cssH);

    ctx.save();
    const sx = (Math.random() * shake - shake / 2);
    ctx.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, sx * dpr, (Math.random() * shake - shake / 2) * dpr);
    ctx.translate(-cameraX, 0);

    const sunX = cameraX + v.camW * 0.78;
    ctx.fillStyle = "rgba(255, 236, 170, 0.95)";
    ctx.beginPath();
    ctx.arc(sunX, v.worldH * 0.16, 34, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 7; i++) {
      const span = v.camW + 260;
      const drift = cameraX * (0.12 + (i % 3) * 0.06);
      const screen = ((i * 190 - drift) % span + span) % span - 100;
      const band = [0.05, 0.12, 0.2, 0.28, 0.16, 0.34, 0.08][i];
      Draw.drawCloud(ctx, cameraX + screen, v.worldH * band, 0.65 + (i % 3) * 0.28);
    }

    function ridge(baseY, color, amp, freq, phase) {
      ctx.fillStyle = color;
      ctx.beginPath();
      const x0 = cameraX - 40;
      const x1 = cameraX + v.camW + 40;
      ctx.moveTo(x0, baseY + 30);
      for (let x = x0; x <= x1; x += 18) {
        const y = baseY - Math.abs(Math.sin(x * freq + phase)) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(x1, baseY + 30);
      ctx.fill();
    }
    ridge(v.ground - 8, "#d7e8f3", 58, 0.007, 0.4);
    ridge(v.ground + 8, "#c5d8e6", 34, 0.013, 1.6);

    for (let i = 0; i < 4; i++) {
      const span = v.camW + 160;
      const screen = ((i * 210 + time * 28) % span + span) % span - 40;
      const bx = cameraX + screen;
      const by = v.worldH * (0.1 + (i % 3) * 0.045);
      const flap = Math.sin(time * 10 + i) * 4;
      ctx.strokeStyle = "rgba(27,36,48,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 8, by);
      ctx.lineTo(bx, by + flap);
      ctx.lineTo(bx + 8, by);
      ctx.stroke();
    }

    ctx.fillStyle = "#9fc4d6";
    farIslands.forEach(function (isle) {
      const span = v.camW + 360;
      const screen = ((isle.x - cameraX * 0.35) % span + span) % span - 120;
      const x = cameraX + screen;
      ctx.beginPath();
      ctx.moveTo(x, v.ground - 36);
      ctx.lineTo(x + isle.w * 0.5, v.ground - 36 - isle.h);
      ctx.lineTo(x + isle.w, v.ground - 36);
      ctx.fill();
    });

    const seaTop = v.ground + 28;
    const sea = ctx.createLinearGradient(0, seaTop, 0, v.worldH + 40);
    sea.addColorStop(0, "#7ec8ea");
    sea.addColorStop(0.4, "#3e8eab");
    sea.addColorStop(1, "#1d4e68");
    ctx.fillStyle = sea;
    ctx.fillRect(cameraX - 20, seaTop, v.camW + 40, v.worldH - seaTop + 80);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = seaTop + 18 + i * 16;
      ctx.beginPath();
      for (let x = cameraX - 20; x < cameraX + v.camW + 20; x += 16) {
        const yy = y + Math.sin(x * 0.04 + time * 2 + i) * 3;
        if (x === cameraX - 20) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    const seenL = cameraX - 40;
    const seenR = cameraX + v.camW + 80;
    segments.forEach(function (seg) {
      if (seg.x + seg.w < seenL || seg.x > seenR) return;
      if (seg.kind === "island") drawIsland(ctx, seg, v.ground);
      else if (seg.kind === "bridge") drawBridge(ctx, seg, v.ground);
    });
    segments.forEach(function (seg) {
      if (seg.kind === "gap" || seg.x + seg.w < seenL || seg.x > seenR) return;
      seg.obs.forEach(function (obs) { drawObstacle(ctx, seg, obs, v.ground); });
      seg.picks.forEach(function (pick) {
        if (pick.taken) return;
        const px = seg.x + pick.x;
        const py = v.ground + pick.dy;
        if (pick.kind === "route") Draw.drawRouteToken(ctx, px, py, time);
        else Draw.drawWool(ctx, px, py, 12, time);
      });
    });

    const squash = squashT > 0 ? 0.84 : 1;
    const stretch = squashT > 0 ? 1.1 : 1;
    const feetX = player.x + player.w / 2;
    const feetY = player.y + player.h;
    const airborne = player.vy < -40 || player.vy > 40;
    Draw.drawShadow(ctx, feetX, v.ground + 2, airborne ? 12 : 18);
    Draw.drawGoat(ctx, feetX, feetY, {
      dir: 1,
      phase: runT,
      size: 0.9,
      squash: squash,
      stretch: stretch,
      air: airborne,
      vy: player.vy,
      boost: boostT > 0,
      blink: blinking > 0,
      lean: airborne ? -0.04 : 0,
    });

    ctx.font = "800 16px " + Draw.FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    texts.forEach(function (t) {
      ctx.globalAlpha = Math.max(0, t.life / t.max);
      ctx.fillStyle = "#6b4420";
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
    parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
    frames += 1;
  }

  function frame(now) {
    const dt = Math.min(0.034, (now - frame.last) / 1000 || 0.016);
    frame.last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  frame.last = performance.now();

  function resume() {
    if (state !== "pause") return;
    state = "play";
    ui.close();
  }

  function retry() { reset(); }

  function togglePause() {
    if (state === "over" || state === "dying") return;
    if (state === "play") {
      state = "pause";
      ui.openPause(pauseModel());
    } else resume();
  }

  window.addEventListener("keydown", function (e) {
    if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) !== -1) e.preventDefault();
    Sfx.unlock();
    if (e.repeat) return;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyK") queueJump();
    if (e.code === "KeyP" || e.code === "Escape") togglePause();
    if (e.code === "KeyR") retry();
  });

  if (btnJump) {
    btnJump.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      queueJump();
    });
  }
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button, a, .veil")) return;
    if (ui.isOpen()) return;
    queueJump();
  });
  if (btnPause) btnPause.addEventListener("click", function () {
    Sfx.unlock();
    togglePause();
  });
  I18n.onChange(function () {
    paintHud();
    if (state === "pause") ui.openPause(pauseModel(), { keepFocus: true });
    if (state === "over" && pending) ui.openOver(overModel(), { keepFocus: true });
  });

  reset();
  requestAnimationFrame(frame);

  window.__GAME__ = {
    kind: "bridge",
    get state() { return state; },
    get score() { return scoreNow(); },
    get wool() { return wool; },
    get meters() { return metersNow(); },
    get chains() { return chains; },
    get frames() { return frames; },
    get x() { return player.x; },
    get y() { return player.y; },
    get vy() { return player.vy; },
    get boost() { return boostT; },
    endNow: function () { beginEnd("fall"); },
  };
})();
