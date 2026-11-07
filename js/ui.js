/* Pause / game-over card and the HUD numbers shared by both games. */
(function () {
  "use strict";

  function mount(handlers) {
    const veil = document.getElementById("veil");
    const kicker = document.getElementById("dlg-kicker");
    const title = document.getElementById("dlg-title");
    const score = document.getElementById("dlg-score");
    const sub = document.getElementById("dlg-sub");
    const resume = document.getElementById("btn-resume");
    const retry = document.getElementById("btn-retry");
    const share = document.getElementById("btn-share");
    const sound = document.getElementById("btn-sound");
    const hudScore = document.getElementById("hud-score");
    const hudMid = document.getElementById("hud-mid");
    const hudWool = document.getElementById("hud-wool");
    const hudChains = document.getElementById("hud-chains");
    const boost = document.getElementById("boost");
    const boostBar = document.getElementById("boost-bar");

    function paintSound() {
      if (!sound || !window.I18n) return;
      const off = window.Sfx && Sfx.muted;
      sound.textContent = off ? I18n.t("soundOff") : I18n.t("soundOn");
      sound.setAttribute("aria-pressed", off ? "true" : "false");
    }

    if (sound) {
      paintSound();
      sound.addEventListener("click", function () {
        if (window.Sfx) Sfx.toggle();
        paintSound();
      });
    }
    if (window.I18n) I18n.onChange(paintSound);

    if (resume) resume.addEventListener("click", function () { handlers.onResume(); });
    if (retry) retry.addEventListener("click", function () { handlers.onRetry(); });

    function fill(model) {
      kicker.textContent = model.kicker || "";
      title.textContent = model.title || "";
      score.textContent = model.score || "";
      sub.textContent = model.sub || "";
      if (share) {
        if (model.share) {
          share.href = model.share;
          share.classList.remove("hidden");
        } else {
          share.classList.add("hidden");
        }
      }
      if (retry && model.retry) retry.textContent = model.retry;
    }

    return {
      hud: function (scoreValue, midValue, woolValue) {
        if (hudScore) hudScore.textContent = scoreValue;
        if (hudMid) hudMid.textContent = midValue;
        if (hudWool) hudWool.textContent = woolValue;
      },
      chains: function (n) {
        if (hudChains) hudChains.textContent = String(n);
      },
      boost: function (amount) {
        if (!boost) return;
        if (amount > 0) {
          boost.classList.remove("hidden");
          if (boostBar) boostBar.style.width = Math.max(0, Math.min(1, amount)) * 100 + "%";
        } else {
          boost.classList.add("hidden");
        }
      },
      openPause: function (model, opts) {
        fill(model);
        if (resume) resume.classList.remove("hidden");
        veil.classList.remove("hidden");
        if (resume && !(opts && opts.keepFocus)) resume.focus();
      },
      openOver: function (model, opts) {
        fill(model);
        if (resume) resume.classList.add("hidden");
        veil.classList.remove("hidden");
        if (retry && !(opts && opts.keepFocus)) retry.focus();
      },
      close: function () {
        veil.classList.add("hidden");
      },
      isOpen: function () {
        return !veil.classList.contains("hidden");
      },
    };
  }

  window.GameUI = { mount: mount };
})();
