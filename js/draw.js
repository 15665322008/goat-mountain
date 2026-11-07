/* Shared palette, shapes, and the mountain goat. */
(function () {
  "use strict";

  const FONT = '"PingFang SC", "WenQuanYi Micro Hei", "Microsoft YaHei", "Noto Sans SC", sans-serif';

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(a, b) {
    if (b === undefined) return Math.random() * (a || 1);
    return a + Math.random() * (b - a);
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function leg(ctx, x, swing) {
    ctx.save();
    ctx.translate(x, -16);
    ctx.rotate(swing);
    ctx.fillStyle = "#f4ecdf";
    ctx.fillRect(-3.1, 0, 6.2, 13);
    ctx.fillStyle = "#2b241c";
    ctx.beginPath();
    ctx.ellipse(0, 13.2, 4.3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawShadow(ctx, x, y, rx) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.38);
    ctx.fillStyle = "rgba(27, 36, 48, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, rx, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGoat(ctx, x, y, o) {
    const opt = o || {};
    const size = opt.size || 1;
    const dir = opt.dir || 1;
    const phase = opt.phase || 0;
    const stretch = opt.stretch || 1;
    const squash = opt.squash || 1;
    const air = !!opt.air;
    const boost = !!opt.boost;
    const blink = !!opt.blink;
    const swing = air ? 0.45 : Math.sin(phase) * 0.62;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(opt.lean || 0);
    ctx.scale(dir * size, size);
    ctx.scale(stretch, squash);
    if ((opt.vy || 0) < -180) ctx.rotate(-0.16);
    else if ((opt.vy || 0) > 360) ctx.rotate(0.14);

    leg(ctx, -12, swing);
    leg(ctx, 8, -swing);
    leg(ctx, -4, -swing * 0.75);
    leg(ctx, 2, swing * 0.75);

    ctx.fillStyle = "#fffaf3";
    ctx.beginPath();
    ctx.ellipse(-24, -30, 7, 5.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eadcc6";
    ctx.beginPath();
    ctx.ellipse(-24, -30, 3.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f6f0e4";
    ctx.beginPath();
    ctx.ellipse(0, -28, 22, 14.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ead9c0";
    ctx.beginPath();
    ctx.ellipse(2, -22, 14, 7, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = "#fffaf3";
    [[-16, -36, 5.2], [-6, -40, 4.6], [8, -38, 5], [15, -32, 4.2]].forEach(function (tuft) {
      ctx.beginPath();
      ctx.arc(tuft[0], tuft[1], tuft[2], 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#f6f0e4";
    ctx.beginPath();
    ctx.ellipse(16, -36, 8, 10, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(24, -46, 12, 10.5, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f3d3c0";
    ctx.beginPath();
    ctx.ellipse(15, -52, 5, 3.2, -0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = "round";
    ctx.strokeStyle = "#8d5a34";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(18, -54);
    ctx.quadraticCurveTo(14, -66, 21, -68);
    ctx.stroke();
    ctx.strokeStyle = "#6b3e22";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(26, -55);
    ctx.quadraticCurveTo(32, -70, 24, -72);
    ctx.stroke();

    ctx.fillStyle = "#fffaf3";
    ctx.beginPath();
    ctx.ellipse(34, -44, 7.2, 5.2, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e7b2a4";
    ctx.beginPath();
    ctx.arc(36.6, -43.4, 1.25, 0, Math.PI * 2);
    ctx.arc(33.2, -42.6, 1.15, 0, Math.PI * 2);
    ctx.fill();

    if (!blink) {
      ctx.fillStyle = "#1b2430";
      ctx.beginPath();
      ctx.ellipse(28, -48, 2.05, 2.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(28.7, -48.8, 0.75, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#1b2430";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(26, -48);
      ctx.quadraticCurveTo(28.2, -46.4, 30.6, -48);
      ctx.stroke();
    }

    ctx.strokeStyle = "#e07a5f";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(18, -33, 6.2, 0.15, 2.3);
    ctx.stroke();
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.moveTo(18, -30);
    ctx.lineTo(21.2, -25.2);
    ctx.lineTo(14.8, -25.2);
    ctx.closePath();
    ctx.fill();

    if (boost) {
      ctx.strokeStyle = "rgba(240, 180, 41, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(8, -38, 34, 26, -0.1, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawWool(ctx, x, y, r, time) {
    const bob = Math.sin(time * 3.2 + x * 0.05) * 3;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "rgba(240, 180, 41, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, r + 7, r * 0.72, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2c14b";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe7a8";
    ctx.beginPath();
    ctx.arc(-r * 0.38, -r * 0.28, r * 0.46, 0, Math.PI * 2);
    ctx.arc(r * 0.4, -r * 0.12, r * 0.36, 0, Math.PI * 2);
    ctx.arc(0.1, r * 0.28, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-r * 0.42, -r * 0.48, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRouteToken(ctx, x, y, time) {
    const bob = Math.sin(time * 4) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(Math.sin(time * 2) * 0.12);
    ctx.fillStyle = "rgba(240, 180, 41, 0.28)";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff8e4";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.lineTo(-1, 3);
    ctx.lineTo(-1, -2);
    ctx.lineTo(6, -2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCloud(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.arc(18, 4, 12, 0, Math.PI * 2);
    ctx.arc(-16, 6, 11, 0, Math.PI * 2);
    ctx.arc(8, -8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  window.Draw = {
    FONT: FONT,
    clamp: clamp,
    lerp: lerp,
    rand: rand,
    roundRect: roundRect,
    drawShadow: drawShadow,
    drawGoat: drawGoat,
    drawWool: drawWool,
    drawRouteToken: drawRouteToken,
    drawCloud: drawCloud,
  };
})();
