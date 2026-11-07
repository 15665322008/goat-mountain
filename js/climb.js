/* Goat Climb: a vertical jumper. Score = height meters + WOOL. */
(function () {
  "use strict";

  const WORLD_W = 420;
  const GRAVITY = 1750;
  const BOUNCE = 900;
  const MOVE = 270;

  const canvas = document.getElementById("game");
  const stage = document.getElementById("stage");
  const how = document.getElementById("how");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnPause = document.getElementById("btn-pause");

  const keys = { left: false, right: false };
  const holds = { left: false, right: false };
  const pointers = new Map();

  let state = "play";
  let platforms = [];
  let loots = [];
  let parts = [];
  let texts = [];
  let player = { x: 180, y: -50, w: 40, h: 48, vx: 0, vy: 0 };
  let cameraY = -200;
  let originY = 0;
  let maxHeight = 0;
  let wool = 0;
  let genY = 0;
  let lastX = 180;
  let spawned = 0;
  let squashT = 0;
  let face = 1;
  let runT = 0;
  let blinkIn = 2.4;
  let blinking = 0;
  let time = 0;
  let shake = 0;
  let frames = 0;
  let pending = null;
  let lastSave = null;
  let dyingT = 0;
  let clouds = [];

  const ui = GameUI.mount({
    onResume: function () { resume(); },
    onRetry: function () { retry(); },
  });

  function view() {
    const cssW = Math.max(1, stage.clientWidth);
    const cssH = Math.max(1, stage.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = cssW / WORLD_W;
    return { cssW: cssW, cssH: cssH, dpr: dpr, scale: scale, worldH: cssH / scale };
  }

  function difficulty(fromY) {
    const risen = Math.max(0, originY - (fromY == null ? genY : fromY));
    return Draw.clamp(risen / 5200, 0, 1);
  }

  function metersNow() {
    return Math.floor(maxHeight / 10);
  }

  function scoreNow() {
    return metersNow() + wool;
  }

  function makeClouds() {
    clouds = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random(),
        y: 0.08 + Math.random() * 0.42,
        s: 0.7 + Math.random() * 0.8,
        p: 0.08 + Math.random() * 0.2,
      });
    }
  }

  function reset() {
    platforms = [];
    loots = [];
    parts = [];
    texts = [];
    wool = 0;
    maxHeight = 0;
    spawned = 0;
    shake = 0;
    pending = null;
    lastSave = null;
    dyingT = 0;
    state = "play";
    face = 1;
    player.vx = 0;
    player.vy = -BOUNCE;

    const intro = [
      { x: 146, y: 0, w: 130, type: "normal" },
      { x: 154, y: -88, w: 122, type: "normal", wool: 10 },
      { x: 170, y: -176, w: 118, type: "normal" },
      { x: 36, y: -214, w: 76, type: "break", wool: 20 },
      { x: 188, y: -264, w: 112, type: "move", wool: 10 },
      { x: 160, y: -352, w: 120, type: "normal" },
      { x: 148, y: -440, w: 124, type: "normal", wool: 10 },
      { x: 176, y: -528, w: 110, type: "normal" },
    ];
    intro.forEach(function (item) {
      const vx = item.type === "move" ? 70 : 0;
      platforms.push({
        x: item.x, y: item.y, w: item.w, h: 14,
        type: item.type, vx: vx, solid: true,
      });
      if (item.wool) {
        loots.push({
          x: item.x + item.w / 2,
          y: item.y - 34,
          r: item.wool > 10 ? 14 : 12,
          value: item.wool,
          taken: false,
        });
      }
      spawned += 1;
    });

    const first = platforms[0];
    originY = first.y;
    player.x = first.x + first.w / 2 - player.w / 2;
    player.y = first.y - player.h;
    genY = intro[intro.length - 1].y;
    lastX = intro[intro.length - 1].x;
    const worldH = view().worldH || 700;
    cameraY = player.y - worldH * 0.48;
    ui.close();
    ui.boost(0);
    paintHud();
  }

  function spawnAhead(topLimit) {
    let guard = 0;
    while (genY > topLimit && guard < 8) {
      guard += 1;
      const diff = difficulty(genY);
      const gap = 86 + diff * 62;
      const prevY = genY;
      genY -= gap;
      const w = Math.max(80, 128 - diff * 44);
      const drift = (Math.random() - 0.5) * (36 + diff * 230);
      let x = lastX + drift;
      x = Draw.clamp(x, 12, WORLD_W - w - 12);
      let type = "normal";
      if (spawned > 10 && diff > 0.12 && Math.random() < 0.12 + diff * 0.38) type = "move";
      const vx = type === "move" ? (Math.random() < 0.5 ? -1 : 1) * (60 + diff * 80) : 0;
      const plat = { x: x, y: genY, w: w, h: 14, type: type, vx: vx, solid: true };
      platforms.push(plat);
      lastX = x;
      spawned += 1;
      if (Math.random() < 0.38) {
        loots.push({ x: x + w / 2, y: genY - 34, r: 12, value: 10, taken: false });
      }
      if (spawned > 9 && Math.random() < 0.16 + diff * 0.34) {
        const bw = 74;
        let bx = x + (Math.random() < 0.5 ? -96 : w + 18);
        bx = Draw.clamp(bx, 8, WORLD_W - bw - 8);
        const by = (prevY + genY) / 2;
        platforms.push({ x: bx, y: by, w: bw, h: 12, type: "break", vx: 0, solid: true });
        if (Math.random() < 0.75) {
          loots.push({ x: bx + bw / 2, y: by - 32, r: 13, value: 20, taken: false });
        }
      }
    }
  }

  function axis() {
    let left = keys.left || holds.left;
    let right = keys.right || holds.right;
    const rect = stage.getBoundingClientRect();
    pointers.forEach(function (pt) {
      const x = pt - rect.left;
      if (x < rect.width / 2) left = true;
      else right = true;
    });
    if (left === right) return 0;
    return left ? -1 : 1;
  }

  function overlapX(px, plat) {
    const inset = 8;
    return px + player.w - inset > plat.x && px + inset < plat.x + plat.w;
  }

  function shatter(plat) {
    plat.solid = false;
    plat.dead = true;
    for (let i = 0; i < 7; i++) {
      parts.push({
        x: plat.x + Math.random() * plat.w,
        y: plat.y + 4,
        vx: (Math.random() - 0.5) * 220,
        vy: -60 - Math.random() * 140,
        life: 0.7,
        max: 0.7,
        size: 4 + Math.random() * 5,
        color: Math.random() < 0.5 ? "#a86b3c" : "#6e4124",
      });
    }
    Sfx.crack();
  }

  function dust(x, y) {
    for (let i = 0; i < 5; i++) {
      parts.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y,
        vx: (Math.random() - 0.5) * 80,
        vy: -20 - Math.random() * 40,
        life: 0.35,
        max: 0.35,
        size: 3,
        color: "rgba(255,250,240,0.9)",
      });
    }
  }

  function collect(loot) {
    loot.taken = true;
    wool += loot.value;
    texts.push({ x: loot.x, y: loot.y, text: "+" + loot.value, life: 0.7, max: 0.7 });
    for (let i = 0; i < 6; i++) {
      parts.push({
        x: loot.x, y: loot.y,
        vx: Math.cos(i) * 90, vy: Math.sin(i) * 90 - 20,
        life: 0.45, max: 0.45, size: 3.5, color: "#ffe7a8",
      });
    }
    Sfx.wool();
  }

  function beginEnd() {
    if (state === "dying" || state === "over") return;
    pending = { score: scoreNow(), wool: wool, meters: metersNow() };
    state = "dying";
    dyingT = 0.42;
    shake = 8;
    Sfx.die();
  }

  function shareUrl(text) {
    return "https://x.com/intent/post?text=" + encodeURIComponent(text);
  }

  function overModel() {
    const saved = lastSave || { name: "游客", isBest: false };
    const text = I18n.t("climbShare", {
      score: pending.score,
      meters: pending.meters,
      wool: pending.wool,
    });
    return {
      kicker: saved.isBest ? I18n.t("newRecord") : I18n.t("gameOver"),
      title: saved.isBest ? I18n.t("newRecordBang") : I18n.t("climbFall"),
      score: String(pending.score),
      sub: I18n.t("climbOverSub", {
        m: pending.meters,
        wool: pending.wool,
        name: I18n.displayName(saved.name),
      }),
      share: shareUrl(text),
      retry: I18n.t("climbAgain"),
    };
  }

  function pauseModel() {
    return {
      kicker: I18n.t("paused"),
      title: I18n.t("climbPauseTitle"),
      score: String(scoreNow()),
      sub: I18n.t("climbPauseSub", { m: metersNow(), wool: wool }),
      share: "",
      retry: I18n.t("restart"),
    };
  }

  function showOver() {
    state = "over";
    if (!lastSave) lastSave = Store.commit("climb", pending.score, pending.wool);
    ui.openOver(overModel());
  }

  function paintHud() {
    ui.hud(String(scoreNow()), I18n.t("meters", { n: metersNow() }), String(wool));
  }

  function update(dt) {
    time += dt;
    blinkIn -= dt;
    if (blinking > 0) blinking -= dt;
    if (blinkIn <= 0) {
      blinking = 0.12;
      blinkIn = 2.2 + Math.random() * 2.4;
    }
    if (shake > 0) shake *= Math.pow(0.04, dt);

    if (state === "pause" || state === "over") return;

    if (state === "dying") {
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;
      dyingT -= dt;
      stepFx(dt);
      if (dyingT <= 0) showOver();
      return;
    }

    const dir = axis();
    if (dir < 0) face = -1;
    else if (dir > 0) face = 1;
    const target = dir * MOVE;
    player.vx += (target - player.vx) * Math.min(1, dt * 12);
    player.x += player.vx * dt;
    const cx = player.x + player.w / 2;
    if (cx < 0) player.x += WORLD_W;
    if (cx > WORLD_W) player.x -= WORLD_W;

    const prevY = player.y;
    player.vy = Math.min(1400, player.vy + GRAVITY * dt);
    player.y += player.vy * dt;
    const prevFeet = prevY + player.h;
    const feet = player.y + player.h;

    if (player.vy > 0) {
      let best = null;
      for (let i = 0; i < platforms.length; i++) {
        const plat = platforms[i];
        if (!plat.solid) continue;
        const hit = overlapX(player.x, plat) || overlapX(player.x - WORLD_W, plat) || overlapX(player.x + WORLD_W, plat);
        if (!hit) continue;
        if (prevFeet <= plat.y + 12 && feet >= plat.y) {
          if (!best || plat.y < best.y) best = plat;
        }
      }
      if (best) {
        if (best.type === "break") {
          shatter(best);
        } else {
          player.y = best.y - player.h;
          player.vy = -BOUNCE;
          squashT = 0.14;
          dust(player.x + player.w / 2, best.y);
          Sfx.jump();
        }
      }
    }

    for (let i = 0; i < loots.length; i++) {
      const loot = loots[i];
      if (loot.taken) continue;
      if (circleHits(loot.x, loot.y, loot.r)) collect(loot);
    }

    const risen = originY - (player.y + player.h);
    if (risen > maxHeight) maxHeight = risen;

    const v = view();
    const desired = player.y - v.worldH * 0.4;
    if (desired < cameraY) cameraY += (desired - cameraY) * Math.min(1, dt * 4.5);

    if (player.y > cameraY + v.worldH + 30) beginEnd();

    spawnAhead(cameraY - 240);

    for (let i = 0; i < platforms.length; i++) {
      const plat = platforms[i];
      if (plat.vx) {
        plat.x += plat.vx * dt;
        if (plat.x < 8) { plat.x = 8; plat.vx = Math.abs(plat.vx); }
        if (plat.x + plat.w > WORLD_W - 8) {
          plat.x = WORLD_W - 8 - plat.w;
          plat.vx = -Math.abs(plat.vx);
        }
      }
    }

    platforms = platforms.filter(function (plat) { return plat.y < cameraY + v.worldH + 180; });
    loots = loots.filter(function (loot) {
      return !loot.taken && loot.y < cameraY + v.worldH + 80;
    });

    runT += dt * (6 + Math.abs(player.vx) * 0.03);
    squashT = Math.max(0, squashT - dt);
    stepFx(dt);
    paintHud();
  }

  function circleHits(x, y, r) {
    const nx = Draw.clamp(x, player.x + 4, player.x + player.w - 4);
    const ny = Draw.clamp(y, player.y + 4, player.y + player.h - 2);
    const dx = x - nx;
    const dy = y - ny;
    return dx * dx + dy * dy <= r * r;
  }

  function stepFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      p.vy += 700 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      texts[i].life -= dt;
      texts[i].y -= 36 * dt;
      if (texts[i].life <= 0) texts.splice(i, 1);
    }
  }

  function drawPlatform(ctx, plat) {
    if (plat.dead) return;
    const x = plat.x;
    const y = plat.y;
    const w = plat.w;
    if (plat.type === "break") {
      ctx.fillStyle = "#8a5636";
      Draw.roundRect(ctx, x, y, w, 16, 5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,236,210,0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 3);
      ctx.lineTo(x + w * 0.45, y + 12);
      ctx.lineTo(x + w - 12, y + 5);
      ctx.stroke();
      ctx.fillStyle = "rgba(90, 40, 24, 0.35)";
      ctx.fillRect(x + w * 0.5, y + 2, 2, 12);
      return;
    }
    if (plat.type === "move") {
      ctx.fillStyle = "#6f8ea3";
      Draw.roundRect(ctx, x, y + 2, w, 16, 6);
      ctx.fill();
      ctx.fillStyle = "#d7ebe4";
      Draw.roundRect(ctx, x, y, w, 10, 5);
      ctx.fill();
      ctx.fillStyle = "#2f6b4f";
      ctx.beginPath();
      if (plat.vx >= 0) {
        ctx.moveTo(x + w - 16, y + 5);
        ctx.lineTo(x + w - 8, y + 5);
        ctx.lineTo(x + w - 12, y + 2);
      } else {
        ctx.moveTo(x + 16, y + 5);
        ctx.lineTo(x + 8, y + 5);
        ctx.lineTo(x + 12, y + 2);
      }
      ctx.fill();
      return;
    }
    ctx.fillStyle = "#8d5a38";
    Draw.roundRect(ctx, x, y, w, 18, 6);
    ctx.fill();
    ctx.fillStyle = "#3f8f55";
    Draw.roundRect(ctx, x, y, w, 10, 5);
    ctx.fill();
    ctx.fillStyle = "#8dce78";
    ctx.beginPath();
    for (let i = 6; i < w - 4; i += 9) {
      ctx.moveTo(x + i, y + 3);
      ctx.quadraticCurveTo(x + i + 3, y - 5, x + i + 6, y + 3);
    }
    ctx.fill();
  }

  function render() {
    const v = view();
    const dpr = v.dpr;
    const bw = Math.max(2, Math.floor(v.cssW * dpr));
    const bh = Math.max(2, Math.floor(v.cssH * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    const ctx = canvas.getContext("2d");
    const alt = Draw.clamp(maxHeight / 4500, 0, 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, v.cssH);
    sky.addColorStop(0, alt > 0.55 ? "#1d3e73" : "#7ec8ea");
    sky.addColorStop(0.55, alt > 0.55 ? "#87a6d4" : "#d5f1fb");
    sky.addColorStop(1, alt > 0.55 ? "#e7eef6" : "#e7f6ea");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, v.cssW, v.cssH);

    if (alt > 0.35) {
      ctx.save();
      ctx.globalAlpha = (alt - 0.35) / 0.65;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 18; i++) {
        const sx = (i * 97 + cameraY * 0.02) % v.cssW;
        const sy = (i * 53) % (v.cssH * 0.7);
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.restore();
    }

    const ridges = [
      { color: alt > 0.5 ? "#d5e2ee" : "#c5dde8", base: 0.72, amp: 46, par: 0.05, freq: 0.008 },
      { color: alt > 0.5 ? "#b7c9d8" : "#8fb4c8", base: 0.82, amp: 36, par: 0.09, freq: 0.012 },
      { color: alt > 0.5 ? "#8ea4b6" : "#6d97a6", base: 0.9, amp: 24, par: 0.14, freq: 0.016 },
    ];
    ridges.forEach(function (ridge, index) {
      ctx.fillStyle = ridge.color;
      ctx.beginPath();
      ctx.moveTo(0, v.cssH);
      for (let x = 0; x <= v.cssW; x += 10) {
        const y = v.cssH * ridge.base
          + Math.sin((x + cameraY * ridge.par) * ridge.freq + index) * ridge.amp
          + Math.sin((x - cameraY * ridge.par) * ridge.freq * 0.37) * ridge.amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(v.cssW, v.cssH);
      ctx.fill();
    });

    clouds.forEach(function (cloud) {
      const x = ((cloud.x * v.cssW - cameraY * cloud.p) % (v.cssW + 160) + v.cssW + 160) % (v.cssW + 160) - 80;
      Draw.drawCloud(ctx, x, cloud.y * v.cssH * 0.55, cloud.s);
    });

    ctx.save();
    ctx.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, (Math.random() * shake - shake / 2) * dpr, (Math.random() * shake - shake / 2) * dpr);
    ctx.translate(0, -cameraY);

    const seenTop = cameraY - 40;
    const seenBot = cameraY + v.worldH + 40;
    platforms.forEach(function (plat) {
      if (plat.y > seenBot || plat.y < seenTop - 30) return;
      drawPlatform(ctx, plat);
    });
    loots.forEach(function (loot) {
      if (loot.taken || loot.y > seenBot || loot.y < seenTop) return;
      Draw.drawWool(ctx, loot.x, loot.y, loot.r, time);
    });

    const flagStep = 100;
    const topM = Math.ceil((originY - seenTop) / 10 / flagStep) * flagStep;
    const botM = Math.floor(Math.max(0, (originY - seenBot) / 10) / flagStep) * flagStep;
    ctx.font = "700 14px " + Draw.FONT;
    ctx.textAlign = "left";
    for (let m = flagStep; m <= topM; m += flagStep) {
      if (m < botM) continue;
      const y = originY - m * 10;
      ctx.fillStyle = "rgba(27,36,48,0.45)";
      ctx.fillRect(18, y, WORLD_W - 36, 1);
      ctx.fillStyle = "#1b2430";
      ctx.fillText(m + " m", 22, y - 6);
    }

    parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    });

    const squash = squashT > 0 ? 0.8 : (player.vy < -420 ? 1.08 : 1);
    const stretch = squashT > 0 ? 1.14 : (player.vy < -420 ? 0.94 : 1);
    const opt = {
      dir: face,
      phase: runT,
      size: 0.78,
      squash: squash,
      stretch: stretch,
      air: player.vy < -80 || player.vy > 180,
      vy: player.vy,
      lean: Draw.clamp(-player.vx * 0.0013, -0.22, 0.22),
      blink: blinking > 0,
    };
    const feetX = player.x + player.w / 2;
    const feetY = player.y + player.h;
    Draw.drawShadow(ctx, feetX, feetY + 2, 16);
    Draw.drawGoat(ctx, feetX, feetY, opt);
    if (feetX < 48) Draw.drawGoat(ctx, feetX + WORLD_W, feetY, opt);
    if (feetX > WORLD_W - 48) Draw.drawGoat(ctx, feetX - WORLD_W, feetY, opt);

    ctx.font = "800 15px " + Draw.FONT;
    ctx.textAlign = "center";
    texts.forEach(function (t) {
      ctx.globalAlpha = Math.max(0, t.life / t.max);
      ctx.fillStyle = "#8a5a12";
      ctx.fillText(t.text, t.x, t.y);
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

  function retry() {
    reset();
  }

  function togglePause() {
    if (state === "over" || state === "dying") return;
    if (state === "play") {
      state = "pause";
      ui.openPause(pauseModel());
    } else {
      resume();
    }
  }

  function hideHow() {
    if (how) how.classList.add("hidden");
  }

  window.addEventListener("keydown", function (e) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].indexOf(e.code) !== -1) e.preventDefault();
    Sfx.unlock();
    if (e.repeat) return;
    if (e.code === "ArrowLeft" || e.code === "KeyA") { keys.left = true; hideHow(); }
    if (e.code === "ArrowRight" || e.code === "KeyD") { keys.right = true; hideHow(); }
    if (e.code === "KeyP" || e.code === "Escape") togglePause();
    if (e.code === "KeyR") retry();
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  });

  function bindHold(button, key) {
    if (!button) return;
    function down(e) {
      e.preventDefault();
      e.stopPropagation();
      button.setPointerCapture(e.pointerId);
      holds[key] = true;
      hideHow();
      Sfx.unlock();
    }
    function up() { holds[key] = false; }
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("lostpointercapture", up);
  }
  bindHold(btnLeft, "left");
  bindHold(btnRight, "right");

  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button, a, .veil")) return;
    if (ui.isOpen()) return;
    pointers.set(e.pointerId, e.clientX);
    stage.setPointerCapture(e.pointerId);
    hideHow();
    Sfx.unlock();
  });
  stage.addEventListener("pointermove", function (e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, e.clientX);
  });
  function releasePointer(e) { pointers.delete(e.pointerId); }
  stage.addEventListener("pointerup", releasePointer);
  stage.addEventListener("pointercancel", releasePointer);

  if (btnPause) btnPause.addEventListener("click", function () {
    Sfx.unlock();
    togglePause();
  });

  window.addEventListener("resize", function () { render(); });
  I18n.onChange(function () {
    paintHud();
    if (state === "pause") ui.openPause(pauseModel(), { keepFocus: true });
    if (state === "over" && pending) ui.openOver(overModel(), { keepFocus: true });
  });

  makeClouds();
  reset();
  requestAnimationFrame(frame);

  window.__GAME__ = {
    kind: "climb",
    get state() { return state; },
    get score() { return scoreNow(); },
    get wool() { return wool; },
    get meters() { return metersNow(); },
    get frames() { return frames; },
    get x() { return player.x; },
    get y() { return player.y; },
    get vy() { return player.vy; },
    get vx() { return player.vx; },
    endNow: function () { beginEnd(); },
  };
})();
