/* Tiny synthesized sounds. Nothing plays until a key or tap unlocks audio. */
(function () {
  "use strict";

  const KEY = "mountain-barn-mute";
  let ctx = null;
  let muted = false;
  try {
    muted = localStorage.getItem(KEY) === "1";
  } catch (err) {
    muted = false;
  }

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function tone(freq, when, dur, type, gain) {
    const a = audio();
    if (!a || muted) return;
    const osc = a.createOscillator();
    const amp = a.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, when);
    amp.gain.setValueAtTime(gain, when);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(amp);
    amp.connect(a.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function burst(freqs, type, gain, step) {
    try {
      const a = audio();
      if (!a || muted) return;
      const t = a.currentTime;
      freqs.forEach(function (freq, i) {
        tone(freq, t + i * (step || 0.05), 0.12, type || "sine", gain || 0.045);
      });
    } catch (err) {
      /* ignore autoplay and missing audio devices */
    }
  }

  window.Sfx = {
    get muted() { return muted; },
    unlock: function () {
      try { audio(); } catch (err) {}
    },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (err) {}
      return muted;
    },
    jump: function () { burst([360, 540], "triangle", 0.05, 0.03); },
    djump: function () { burst([480, 720], "sine", 0.05, 0.04); },
    wool: function () { burst([660, 880, 1180], "sine", 0.04, 0.045); },
    boost: function () { burst([520, 680, 860, 1100], "triangle", 0.05, 0.05); },
    crack: function () { burst([180, 90], "square", 0.03, 0.04); },
    die: function () { burst([320, 220, 140, 90], "sawtooth", 0.03, 0.07); },
  };
})();
