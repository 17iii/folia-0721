<p align="center">
  <img src="https://github.com/user-attachments/assets/b5d0e863-48be-497b-b0e9-4bd8d8ce9bf0" alt="Folia" width="100%" />
</p>

# Folia 0.7.21 · 歌词动效增强版

基于 [Folia](https://github.com/chthollyphile/folia-major) **v0.7.21** 的二次开发版本。
只动了歌词动画和书库首页的观感——界面结构、侧面板布局、交互路径都保持与原版一致，
装上去不会觉得"这是另一个软件"，只会觉得歌词更好看了。

- 安装包：[Releases](../../releases) → `Folia-Setup-0.7.21.exe`（Windows x64）
- 上游的完整说明文档保留在 [README.upstream.md](README.upstream.md)

---

## 这个版本多了什么

### 四个歌词样式

设置 → 歌词样式里多了四个：

| 样式 | 名字 | 长什么样 |
| --- | --- | --- |
| `neon` | 霓虹 | 没唱到的词是一根根压暗的灯管，唱到哪根就亮哪根。灯芯是白热色，外面套一层独立辉光；点亮那一下会轻轻弹一下、带一点随机歪头 |
| `ink` | 墨韵 | 每个词从下方升起并淡入，边缘带洇开的模糊，关键词用主题主色做渐变 |
| `mirror` | 镜面 | 每行文字下方有一层倒影，漂移和呼吸都比主行更轻。倒影可以关掉，亮度／间距／虚化都能调 |
| `sparkle` | 星屑 | 唱到的字炸出一颗四角星 `✦`，字本身放大会带起一圈星尘，颗粒大小和闪烁速度可调 |

四个样式各有自己的参数面板（辉光强度／扩散／描边宽度、晕染浓度／升起距离、倒影亮度／虚化、
星点大小／数量……），也都能一键重置。

### 三个播放页背景

极光（流动幕帘）、噪点、涟漪。和原有背景一样在播放页背景设置里选。

### 动效强度三档真的有用

「动画强度」的 **安静 / 标准 / 混乱** 三档现在同时控制这四个样式：
位移、旋转、缩放、闪烁、漂移都随档位线性变化，不会再出现"切了档位没反应"。

### 书库首页跟随主题

首页原来盖着一层 `white/40` + `backdrop-blur` 的中性蒙层，看着灰蒙蒙的。
这层去掉了，页面直接用主题背景色打底，再叠一层主题色的微光——换主题，首页跟着变。

---

## 装

1. 到 [Releases](../../releases) 下载 `Folia-Setup-0.7.21.exe`
2. 双击安装（可以改安装目录）
3. 安装包没做代码签名，Windows 首次运行会拦一下：**更多信息 → 仍要运行**

只测过 Windows x64。上游支持 macOS / Linux，这个包没有打。

---

## 从源码构建

```bash
npm ci

# 渲染层
ELECTRON=true npx vite build

# 打 Windows 安装包（会先准备 ffmpeg / MNN 运行时 / 分析模型，需要联网）
npm run build:electron
```

两个坑，踩过的人不止一个：

- **`node_modules` 必须是真实目录**。用 `mklink /J` 这类目录联接指向另一份 `node_modules` 时，
  npm 会把每个包记成外部路径、`npm ls` 直接报错退出，electron-builder 因此拿不到版本号，
  最后打出来的包里少掉几十个运行期依赖——表现是双击打开只弹一个标题为 `Error` 的空对话框。
  自检办法：解包 `app.asar`，确认 `node_modules/streamsearch`、`qs`、`express` 都在里面。
- 构建时把 `NODE_OPTIONS` 清掉（`env -u NODE_OPTIONS`）。外部注入的 `--require` 钩子会拦住
  electron-builder 解压阶段的 rename，报 EPERM。

---

## 与上游的差异

改动集中在 `src/`：30 个新增文件 + 7 个文件修改。

```
src/components/shared/PresetLyrics.tsx                        新：样式分发
src/components/shared/presets/                                新：四个样式的实现 + 共用动效/辉光工具
src/components/visualizer/{neon,ink,mirror,sparkle}/          新：入口、参数定义、设置面板
src/components/visualizer/backgrounds/{aurora,grain,ripple}/  新：三个背景
src/components/visualizer/definition.ts                       注册新样式
src/components/visualizer/panelRows.tsx                       面板行
src/types.ts, src/types/visualizerModes.ts                    类型
src/i18n/locales/{zh-CN,en}.ts                                文案
src/library/suites/grid/home/Grid3D.tsx                       首页去掉中性蒙层，改跟主题
```

**没有改动**上游已有的样式、面板组件和交互逻辑；侧面板是"只追加行，不删不改"。

开发时踩到的几个渲染坑，记在这里省得下次再查：

1. 遮罩层里不能用 `filter: drop-shadow`，也不能有 `text-shadow`——Chromium 会把阴影切在字框边上，
   整个字变成一个方块。辉光必须**另起一层**（`color: transparent` + `text-shadow`，不套 mask），
   用 opacity 跟着进度淡入。
2. 幅度系数不能既放在形状里、又在外面乘一次强度，否则三档变成平方关系，最低档几乎没有区别。
3. 多行歌词要留行距（`rowGap: 0.46em`），否则换行时上行下缘和下行上缘会贴在一起。
4. `background-clip: text` 里用 `transparent` 收尾的渐变会出脏边，换成同色的透明值。

---

## 许可

上游采用 **AGPL-3.0**，本仓库的修改同样以 AGPL-3.0 发布，完整文本见 [LICENSE](LICENSE)。
音乐平台接口、登录态等全部沿用上游实现，本项目不额外收集任何数据。

上游项目：[chthollyphile/folia-major](https://github.com/chthollyphile/folia-major)
