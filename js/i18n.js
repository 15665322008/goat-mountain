/* Static Chinese / English copy. Choice is remembered; otherwise follow the browser. */
(function () {
  "use strict";

  const KEY = "mountain-barn-lang";

  const dict = {
    zh: {
      docHome: "山羊山 Mountain · Cashmere 同人小游戏",
      docClimb: "山羊爬山 Goat Climb · 山羊山",
      docBridge: "Bridge 跑酷 Bridge Run · 山羊山",
      metaHome: "山羊山是 Cashmere Labs Mountain 的粉丝同人小游戏。爬山收集 WOOL，或沿着 Cashmere Bridge V2 的桥跑过一座座链岛。",
      langLabel: "语言",
      brand: "山羊山",
      brandSub: "MOUNTAIN",
      woolPill: "总 WOOL",
      woolPillTitle: "当前昵称累计的 WOOL",
      sceneAria: "漂在海上的山羊山，Barn 在山坡上，一座桥通向旁边的链岛",
      sceneCaption: "60+ chains · 同人小岛",
      eyebrow: "CASHMERE 社区同人",
      heroTitle: "把 WOOL 驮回山庄",
      heroEm: "A FAN GAME FOR MOUNTAIN",
      lede: "山羊住在一座漂着的小岛上。它们顺着山壁往上弹，也沿着 Cashmere Bridge V2 的桥，从 Ethereum 跑到 Base、Solana，再把捡到的 WOOL 送回 Barn。这是做给 Mountain Barn 的社区小游戏。",
      statWool: "总 WOOL",
      statClimb: "爬山最高",
      statRun: "跑酷最高",
      nickLabel: "本机昵称",
      nickPlaceholder: "例如：羊毛队长",
      nickHint: "换一个昵称就会换一份存档。不填的话，成绩记在「游客」名下。只存在这台设备里。",
      gamesLabel: "两个小游戏",
      climbEyebrow: "GOAT CLIMB",
      climbName: "山羊爬山",
      climbSmall: "GOAT CLIMB",
      climbBlurb: "山羊会自己往上弹。左右挪一挪，踩住草坡，别踩会裂开的木板。越高越难。得分 = 高度 + WOOL。",
      startClimb: "开始爬",
      bridgeEyebrow: "BRIDGE RUN",
      bridgeName: "Bridge 跑酷",
      bridgeSmall: "BRIDGE RUN",
      bridgeBlurb: "沿着跨链桥往前跑。跳跃、二段跳，越过海沟和木箱。偶尔能捡到「最佳路线」，加速并让 WOOL 翻倍。",
      startRun: "开始跑",
      best: "最高 {n}",
      herdTitle: "本机羊群",
      herdEn: "HERD",
      herdHint: "按总 WOOL 排序，最多八位",
      emptyBoard: "还没有记录。写下昵称，去爬山或者跑一座桥，成绩会留在这台设备上。",
      colClimb: "爬山",
      colRun: "跑酷",
      guest: "游客",
      footerLead: "山羊山是粉丝制作的社区同人项目，不是 Cashmere Labs 的官方产品。",
      footerBody: "Mountain、WOOL、Barn、Herd 和 Cashmere Bridge V2 这些名字属于各自的权利人，这里只拿来做玩法上的致敬。页面不会连接钱包，也不会发起任何链上交易或跨链兑换。成绩都写在你浏览器的 localStorage 里。",
      backHome: "← 山庄",
      soundOn: "音效开",
      soundOff: "音效关",
      pause: "暂停",
      hudScore: "得分",
      hudHeight: "高度",
      hudDistance: "距离",
      hudChains: "跨链",
      climbHint: "方向键或 A / D 移动 · 手机按住屏幕左右",
      left: "左",
      right: "右",
      bridgeHint: "空格 / 点击跳跃 · 空中再按一次二段跳",
      jump: "跳",
      bestRouteBanner: "最佳路线 · Best Route",
      bestRoutePop: "最佳路线",
      climbFoot: "粉丝同人作品，非官方。不连接钱包，也不发起链上交易。",
      bridgeFoot: "粉丝同人作品，非官方。Cashmere Bridge V2 只是玩法里的一座桥。",
      paused: "暂停",
      gameOver: "游戏结束",
      newRecord: "新纪录",
      newRecordBang: "新纪录！",
      resume: "继续",
      restart: "重新开始",
      shareX: "分享到 X",
      backBarn: "回到山庄",
      fanNote: "同人小游戏，非 Cashmere Labs 官方。",
      climbPauseTitle: "山羊在等你",
      climbPauseSub: "当前高度 {m} m · WOOL {wool}。得分 = 高度 + WOOL。",
      climbFall: "滑下了山壁",
      climbAgain: "再爬一次",
      climbOverSub: "得分 = 高度 {m} m + WOOL {wool}。已记入「{name}」。",
      climbShare: "我在山羊山 Mountain 的「山羊爬山 Goat Climb」得到 {score} 分（{meters} m，{wool} WOOL）。Cashmere Labs 同人小游戏，来 Barn 集合。 @CashmereLabs",
      bridgePauseTitle: "桥还在",
      bridgePauseSub: "已跑 {m} m · WOOL {wool} · 跨过 {chains} 条链。",
      hitObstacle: "撞上了路障",
      fellSea: "掉进海里了",
      runAgain: "再跑一次",
      bridgeOverSub: "得分 = 距离 {m} m + WOOL {wool} · 跨过 {chains} 条链。已记入「{name}」。",
      bridgeShare: "我在山羊山 Mountain 的「Bridge 跑酷」跨过 {chains} 条链，得到 {score} 分，收集 {wool} WOOL。Cashmere Bridge V2 最佳路线！同人小游戏 @CashmereLabs",
      meters: "{n} m",
    },
    en: {
      docHome: "Mountain · a Cashmere fan game",
      docClimb: "Goat Climb · Mountain",
      docBridge: "Bridge Run · Mountain",
      metaHome: "Mountain is a fan-made Cashmere Labs game. Bounce the goat up the peak for WOOL, or run Cashmere Bridge V2 across the chain islands.",
      langLabel: "Language",
      brand: "Mountain",
      brandSub: "山羊山",
      woolPill: "Total WOOL",
      woolPillTitle: "WOOL saved for this nickname",
      sceneAria: "A floating mountain island with a barn on the slope and a bridge to a nearby chain island",
      sceneCaption: "60+ chains · a fan island",
      eyebrow: "A CASHMERE FAN PROJECT",
      heroTitle: "Haul the WOOL home",
      heroEm: "山羊山 · FOR THE BARN",
      lede: "The goats live on a drifting island. They bounce up the cliffs, and they run Cashmere Bridge V2 from Ethereum out toward Base and Solana, carrying every puff of WOOL back to the Barn. A community game made for Mountain Barn.",
      statWool: "Total WOOL",
      statClimb: "Best climb",
      statRun: "Best run",
      nickLabel: "Nickname on this device",
      nickPlaceholder: "e.g. Wool Captain",
      nickHint: "Each nickname keeps its own save. Leave it blank and your runs go under Guest. Nothing leaves this device.",
      gamesLabel: "Two games",
      climbEyebrow: "山羊爬山",
      climbName: "Goat Climb",
      climbSmall: "山羊爬山",
      climbBlurb: "The goat bounces on its own. Steer left and right, land on the grass, and stay off planks that snap. Higher up, the mountain gets meaner. Score = height + WOOL.",
      startClimb: "Start climb",
      bridgeEyebrow: "跨链跑酷",
      bridgeName: "Bridge Run",
      bridgeSmall: "跨链跑酷",
      bridgeBlurb: "Sprint the bridges between chains. Jump, then jump again, over gaps and crates. A Best Route token speeds you up and doubles the WOOL.",
      startRun: "Start run",
      best: "Best {n}",
      herdTitle: "Herd on this device",
      herdEn: "羊群",
      herdHint: "Ranked by total WOOL, eight names",
      emptyBoard: "No runs yet. Add a nickname, climb the peak or run a bridge, and the score stays on this device.",
      colClimb: "Climb",
      colRun: "Run",
      guest: "Guest",
      footerLead: "Mountain is a fan-made community project, not an official Cashmere Labs product.",
      footerBody: "Mountain, WOOL, Barn, Herd, and Cashmere Bridge V2 belong to their owners. This page only borrows them for play. It never connects a wallet or sends a transaction. Scores stay in localStorage in your browser.",
      backHome: "← Home",
      soundOn: "Sound",
      soundOff: "Muted",
      pause: "Pause",
      hudScore: "Score",
      hudHeight: "Height",
      hudDistance: "Distance",
      hudChains: "Chains",
      climbHint: "Arrow keys or A / D to steer · On a phone, hold either side",
      left: "Left",
      right: "Right",
      bridgeHint: "Space or tap to jump · Tap again in the air to double jump",
      jump: "Jump",
      bestRouteBanner: "Best route",
      bestRoutePop: "Best route",
      climbFoot: "Fan-made, not official. No wallet, and no on-chain transactions.",
      bridgeFoot: "Fan-made, not official. Cashmere Bridge V2 is just a bridge in the game.",
      paused: "Paused",
      gameOver: "Game over",
      newRecord: "New record",
      newRecordBang: "New record!",
      resume: "Resume",
      restart: "Restart",
      shareX: "Share on X",
      backBarn: "Back home",
      fanNote: "A fan game, not official Cashmere Labs.",
      climbPauseTitle: "The goat can wait",
      climbPauseSub: "Height {m} m · {wool} WOOL. Score = height + WOOL.",
      climbFall: "Slid off the cliff",
      climbAgain: "Climb again",
      climbOverSub: "Score = {m} m + {wool} WOOL. Saved for “{name}”.",
      climbShare: "I scored {score} in Goat Climb on Mountain ({meters} m, {wool} WOOL). A fan game for Cashmere Labs — see you at the Barn. @CashmereLabs",
      bridgePauseTitle: "The bridge is still up",
      chainOne: "chain",
      chainMany: "chains",
      bridgePauseSub: "{m} m run · {wool} WOOL · {chains} {chainWord} crossed.",
      hitObstacle: "Clipped a crate",
      fellSea: "Took a swim",
      runAgain: "Run again",
      bridgeOverSub: "Score = {m} m + {wool} WOOL · {chains} {chainWord} crossed. Saved for “{name}”.",
      bridgeShare: "I crossed {chains} {chainWord} in Bridge Run on Mountain. Score {score}, {wool} WOOL collected. Best route on Cashmere Bridge V2. Fan game @CashmereLabs",
      meters: "{n} m",
    },
  };

  function browserLang() {
    const primary = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return String(primary).toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }

  function readSaved() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  let lang = readSaved() || browserLang();
  const listeners = [];

  function t(key, vars) {
    const table = dict[lang] || dict.en;
    let text = table[key];
    if (text == null) text = (dict.en[key] != null ? dict.en[key] : key);
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (_m, name) {
      return vars[name] == null ? "" : String(vars[name]);
    });
  }

  function displayName(name) {
    if (name === "游客" || name === "Guest") return t("guest");
    return name || t("guest");
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.querySelectorAll("meta[data-i18n]").forEach(function (el) {
      el.setAttribute("content", t(el.getAttribute("data-i18n")));
    });
    const docKey = document.body && document.body.getAttribute("data-i18n-doc");
    if (docKey) document.title = t(docKey);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(function (btn) {
      const on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setLang(next) {
    if (next !== "zh" && next !== "en") return;
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (err) { /* ignore */ }
    apply();
    listeners.forEach(function (fn) { fn(lang); });
  }

  function mount() {
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
    apply();
  }

  window.I18n = {
    t: t,
    setLang: setLang,
    onChange: function (fn) { listeners.push(fn); },
    displayName: displayName,
    apply: apply,
    get lang() { return lang; },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
