# 山羊山 Mountain

Cashmere Labs「Mountain」的粉丝同人小游戏。首页是一座小岛山庄，里面有两个可以玩的小游戏：垂直弹跳的「山羊爬山」，以及沿着跨链桥奔跑的「Bridge 跑酷」。

WOOL、最高分和排行榜只保存在你自己的浏览器里。没有构建步骤，没有后端，不连接钱包，也不发起链上交易。

## 本地运行

在项目目录执行：

```bash
python3 -m http.server 47321
```

然后打开 [http://127.0.0.1:47321](http://127.0.0.1:47321)。入口是根目录的 `index.html`。

直接双击 `index.html` 用 `file://` 打开通常也能玩。音效和个别浏览器的本地存储在 `file://` 下可能受限，用上面的静态服务器更稳。

## 怎么玩

首页先写一个昵称。同一台设备上，不同昵称各有一份 WOOL 和最高分。不填昵称时，成绩记在「游客」下面。

**山羊爬山 Goat Climb**

山羊会自己往上弹。电脑用方向键或 `A` / `D` 左右移动，手机按住屏幕下边的「左」「右」，也可以按住屏幕左半边或右半边。草坡可以踩，石板会左右移动，裂开的木板踩上去会碎、接不住你。捡金色绒团得到 WOOL。掉出画面就结束。

得分 = 高度（米）+ 本局 WOOL。

**Bridge 跑酷 Bridge Run**

山羊自动往前跑，桥把一座座链岛连起来，岛上标着 Ethereum、Optimism、Arbitrum、Base、Solana 这些链。电脑按空格、`W` 或 `↑` 跳跃，在空中再按一次可以二段跳。手机点「跳」，或点画面。海沟和木箱都会让你停下。速度会慢慢变快。

菱形的「最佳路线」是加速道具：短时间跑得更快，这段时间里的 WOOL 翻倍，路障也碰不到你。

得分 = 距离（米）+ 本局 WOOL。

两款游戏都是 `P` 或 `Esc` 暂停，`R` 重新开始。结束时可以把自己的分数分享到 X（会 @CashmereLabs）。

页头有 **中 / EN** 开关，游戏进行中也能切，不会重开这一局。选择会记在 localStorage 里。第一次打开时，浏览器语言是中文（`zh` 开头）就用中文，否则用英文。

## 部署成静态网站

整个目录原样上传即可，发布目录就是仓库根目录，不需要安装依赖，也不要填构建命令。样式、脚本和页面之间都是相对路径（`css/style.css`、`js/climb.js`、`climb.html`），所以放在项目子路径下也能打开，例如 `https://<user>.github.io/goat-mountain/`。根目录的空文件 `.nojekyll` 用来告诉 GitHub Pages 不要用 Jekyll 处理这个仓库。

- GitHub Pages：Settings → Pages，分支选 `main`，目录选根目录 `/`。项目站点的网址是 `https://<user>.github.io/<仓库名>/`。
- Cloudflare Pages 或 Netlify：构建命令留空，输出目录填 `.`。
- 自己的服务器：把文件放到 Nginx、Caddy 或其他静态站点目录，保证能访问到 `index.html`。

上线之后如果要让「分享到 X」带上网页地址，需要自行改 `js/i18n.js` 里的分享句子。

## 说明

本站是粉丝社区作品，不是 Cashmere Labs 的官方项目。Mountain、WOOL、Barn、Herd、Cashmere Bridge V2 等名称仅用于向原作致敬。

## English

Mountain is a fan-made browser game for Cashmere Labs' Mountain. The home page is a little island hub with two games: Goat Climb, a vertical bouncer, and Bridge Run, an endless run across chain islands.

WOOL, best scores, and the leaderboard stay in your browser. There is no build step, no backend, no wallet, and no on-chain calls.

### Run it locally

From the project folder:

```bash
python3 -m http.server 47321
```

Open [http://127.0.0.1:47321](http://127.0.0.1:47321). The entry file is `index.html` at the repo root.

Opening `index.html` directly with `file://` usually works too. Sound and localStorage are more reliable through the static server above.

### How to play

The **中 / EN** switch sits in the header on every page, including during a run. Changing language does not restart the game. The choice is stored in localStorage. On a first visit, a browser language starting with `zh` uses Chinese; anything else uses English.

Type a nickname on the home page. Each nickname on this device keeps its own WOOL and best scores. Leave it blank and runs are saved under Guest.

**Goat Climb**

The goat bounces by itself. On a keyboard, use the arrow keys or `A` / `D`. On a phone, hold Left / Right, or hold either half of the screen. Grass ledges are safe, stone ledges slide, and cracked planks snap. Gold puffs are WOOL. Fall off the bottom and the run ends.

Score = height in meters + WOOL collected this run.

**Bridge Run**

The goat runs forward across bridges labeled with chain names such as Ethereum, Optimism, Arbitrum, Base, and Solana. Press space, `W`, or `↑` to jump, and press again in the air to double jump. On a phone, tap Jump or tap the screen. Gaps and crates stop you. The run gets faster.

The diamond Best Route pickup is a short boost: you run faster, WOOL is doubled, and crates can't hit you.

Score = distance in meters + WOOL collected this run.

`P` or `Esc` pauses. `R` restarts. On the game-over screen you can share the score to X, and the post mentions @CashmereLabs.

### Deploy as a static site

Upload the folder as-is. The publish directory is the repository root. Do not set a build command, and do not install dependencies. Styles, scripts, and pages link to each other with relative paths (`css/style.css`, `js/climb.js`, `climb.html`), so the site works on a project subpath such as `https://<user>.github.io/goat-mountain/`. The empty `.nojekyll` file in the root tells GitHub Pages not to run Jekyll on this repo.

- GitHub Pages: Settings → Pages, choose the `main` branch, and set the folder to `/`. A project site is served at `https://<user>.github.io/<repo-name>/`.
- Cloudflare Pages or Netlify: leave the build command empty and set the output directory to `.`.
- Your own server: put the files in an nginx, Caddy, or other static root so `index.html` is served.

To include a public URL in the share text after you deploy, edit the share sentences in `js/i18n.js`.

### Note

This is a fan-made community project, not an official Cashmere Labs product. The names Mountain, WOOL, Barn, Herd, and Cashmere Bridge V2 are used as a tribute to the original.
