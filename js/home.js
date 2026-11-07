/* Home hub: nickname, totals, and the on-device Herd leaderboard. */
(function () {
  "use strict";

  const input = document.getElementById("nick");
  const board = document.getElementById("board");

  function fmt(n) {
    const locale = I18n.lang === "zh" ? "zh-CN" : "en-US";
    return Math.floor(n || 0).toLocaleString(locale);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paint() {
    const profile = Store.getCurrent();
    document.getElementById("wool-total").textContent = fmt(profile.wool);
    document.getElementById("wool-total-card").textContent = fmt(profile.wool);
    document.getElementById("best-climb").textContent = fmt(profile.bestClimb);
    document.getElementById("best-bridge").textContent = fmt(profile.bestBridge);
    document.getElementById("card-climb-best").textContent = I18n.t("best", { n: fmt(profile.bestClimb) });
    document.getElementById("card-bridge-best").textContent = I18n.t("best", { n: fmt(profile.bestBridge) });
    const rows = Store.leaderboard();
    if (!rows.length) {
      board.innerHTML = '<li class="empty">' + escapeHtml(I18n.t("emptyBoard")) + "</li>";
      return;
    }
    board.innerHTML = rows.map(function (row, index) {
      const mine = row.name === profile.name ? " me" : "";
      return '<li class="board-row' + mine + '">'
        + '<span class="rank">' + (index + 1) + "</span>"
        + '<span class="who">' + escapeHtml(I18n.displayName(row.name)) + "</span>"
        + '<span class="stat"><b>' + fmt(row.wool) + "</b><small>WOOL</small></span>"
        + '<span class="stat"><b>' + fmt(row.bestClimb) + "</b><small>" + escapeHtml(I18n.t("colClimb")) + "</small></span>"
        + '<span class="stat"><b>' + fmt(row.bestBridge) + "</b><small>" + escapeHtml(I18n.t("colRun")) + "</small></span>"
        + "</li>";
    }).join("");
  }

  const current = Store.getCurrent();
  input.value = current.name && current.name !== "游客" ? current.name : "";
  input.addEventListener("input", function () {
    Store.setNickname(input.value);
    paint();
  });
  I18n.onChange(paint);
  paint();
})();
