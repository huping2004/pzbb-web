import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { readIntroMode } from "@/lib/intro"
import { getSuggestions } from "@/lib/suggest"

export type EngineId = "bing" | "google" | "google-img" | "yandex" | "baidu"

const ENGINE_IDS: EngineId[] = ["bing", "google", "google-img", "yandex", "baidu"]

export type Site = {
  id: string
  name: string
  url: string
  group: string
  custom?: boolean
  /* 预置站点的官方图标地址（有些网站不把图标放在默认位置，这里直接钉死）；
     自己添加的网站没有这个字段，走自动识别 */
  icon?: string
}

export type GroupDef = {
  id: string
  title: string
}

export type BackgroundDef = {
  id: string
  name: string
  desc: string
}

/* 回收站条目：被删掉的站点原样留着，附上删除时间，随时能捞回来 */
export type TrashedEntry = {
  site: Site
  deletedAt: number
}

export const SITE_NAME = "平子爸爸的Home"

export const GROUPS: GroupDef[] = [
  { id: "ai", title: "AI智能" },
  { id: "create", title: "AI创作" },
  { id: "fun", title: "影音娱乐" },
  { id: "dev", title: "功能技术" },
  { id: "office", title: "效率办公" },
  { id: "netdisk", title: "网盘阵列" },
  { id: "news", title: "资讯媒体" },
]

export const BACKGROUNDS: BackgroundDef[] = [
  { id: "pastel", name: "粉彩柔和", desc: "粉色渐变打底" },
  { id: "star", name: "星光点点", desc: "星星一闪一闪" },
  { id: "sakura", name: "樱花飘落", desc: "花瓣缓缓落下" },
  { id: "cloud", name: "奶云", desc: "云朵般的软糯色" },
]

const PRESET_SITES: Site[] = [
  { id: "p-ai-deepseek", name: "DeepSeek", url: "https://www.deepseek.com", group: "ai" },
  { id: "p-ai-doubao", name: "豆包", url: "https://www.doubao.com/chat/", group: "ai", icon: "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/favicon-doubao.png" },
  { id: "p-ai-kimi", name: "Kimi", url: "https://www.kimi.com", group: "ai" },
  { id: "p-ai-glm", name: "GLM智谱清言", url: "https://open.bigmodel.cn", group: "ai", icon: "https://open.bigmodel.cn/static/images/favicon.png" },
  { id: "p-ai-mimo", name: "小米MiMo", url: "https://mimo.mi.com/docs/zh-CN/quick-start/summary/welcome", group: "ai" },
  { id: "p-ai-workbuddy", name: "WorkBuddy", url: "https://www.workbuddy.cn", group: "ai", icon: "https://download.codebuddy.cn/web/workbuddy/0b498121de0360b3e696dea100380cff00598d5c/assets/logo.svg" },
  { id: "p-ai-opencode", name: "OpenCode", url: "https://opencode.ai", group: "ai" },
  { id: "p-ai-bailian", name: "阿里云百炼", url: "https://bailian.console.aliyun.com", group: "ai", icon: "https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico" },
  { id: "p-ai-trae", name: "Trae CN", url: "https://www.trae.com.cn", group: "ai", icon: "https://lf-cdn.trae.com.cn/obj/trae-com-cn/trae_website_prod_cn/favicon.png" },
  { id: "p-ai-claude", name: "Claude", url: "https://claude.ai", group: "ai", icon: "https://www.anthropic.com/favicon.ico" },
  { id: "p-ai-codex", name: "Codex", url: "https://chatgpt.com/codex", group: "ai" },
  { id: "p-ai-gemini", name: "Gemini", url: "https://gemini.google.com", group: "ai" },
  { id: "p-ai-grok", name: "Grok", url: "https://grok.com", group: "ai" },
  { id: "p-docs", name: "腾讯文档", url: "https://docs.qq.com", group: "office" },
  { id: "p-iciba", name: "有道词典", url: "https://www.iciba.com", group: "office" },
  { id: "p-feishu", name: "飞书", url: "https://www.feishu.cn", group: "office" },
  { id: "p-tieba", name: "贴吧", url: "https://tieba.baidu.com", group: "office" },
  { id: "p-wps", name: "WPS", url: "https://www.wps.cn", group: "office" },
  { id: "p-ifdian", name: "爱发电", url: "https://ifdian.net", group: "office" },
  { id: "p-kook", name: "KOOK", url: "https://www.kookapp.cn", group: "office" },
  { id: "p-qqmail", name: "QQ邮箱", url: "https://mail.qq.com", group: "office" },
  { id: "p-163mail", name: "网易邮箱", url: "https://mail.163.com", group: "office" },
  /* Gmail 的图标直接借谷歌主页那颗彩 G（谷歌家站点同一张） */
  { id: "p-gmail", name: "Gmail", url: "https://mail.google.com", group: "office", icon: "https://www.google.com/favicon.ico" },
  { id: "p-outlook", name: "Outlook邮箱", url: "https://outlook.live.com", group: "office" },
  { id: "p-quark", name: "夸克网盘", url: "https://pan.quark.cn", group: "netdisk" },
  { id: "p-baidupan", name: "百度网盘", url: "https://pan.baidu.com", group: "netdisk", icon: "https://nd-static.bdstatic.com/m-static/wp-brand/favicon.ico" },
  { id: "p-xunlei", name: "迅雷网盘", url: "https://pan.xunlei.com", group: "netdisk" },
  { id: "p-123pan", name: "123网盘", url: "https://www.123pan.com", group: "netdisk", icon: "https://statics.123957.com/static-by-custom/favicon.ico" },
  { id: "p-feham", name: "小飞机网盘", url: "https://www.feejii.com", group: "netdisk" },
  { id: "p-189", name: "天翼云盘", url: "https://cloud.189.cn", group: "netdisk", icon: "https://cloud.dlife.cn/web/main/logo.ico" },
  { id: "p-ucdrive", name: "UC网盘", url: "https://drive.uc.cn", group: "netdisk" },
  { id: "p-alipan", name: "阿里云盘", url: "https://www.alipan.com", group: "netdisk" },
  { id: "p-139", name: "中国移动云盘", url: "https://yun.139.com", group: "netdisk" },
  { id: "p-weibo", name: "微博", url: "https://weibo.com", group: "news" },
  { id: "p-zhihu", name: "知乎", url: "https://www.zhihu.com", group: "news" },
  { id: "p-douban", name: "豆瓣", url: "https://www.douban.com", group: "news" },
  { id: "p-163", name: "网易新闻", url: "https://www.163.com", group: "news" },
  { id: "p-github", name: "GitHub", url: "https://github.com", group: "dev" },
  { id: "p-cloudflare", name: "Cloudflare", url: "https://www.cloudflare.com", group: "dev" },
  { id: "p-cloudns", name: "ClouDNS", url: "https://www.cloudns.net", group: "dev" },
  { id: "p-tampermonkey", name: "篡改猴", url: "https://www.tampermonkey.net", group: "dev" },
  { id: "p-gname", name: "GNAME域名", url: "https://www.gname.com", group: "dev", icon: "https://file-sg.gname.net/f/favicon.ico" },
  { id: "p-curseforge", name: "CurseForge", url: "https://www.curseforge.com", group: "dev" },
  { id: "p-mcmod", name: "MC百科", url: "https://www.mcmod.cn", group: "dev" },
  { id: "p-steam", name: "Steam", url: "https://store.steampowered.com", group: "dev" },
  { id: "p-epic", name: "Epic", url: "https://www.epicgames.com", group: "dev" },
  { id: "p-neowow", name: "Neowow", url: "https://neowow.cn", group: "create" },
  { id: "p-libtv", name: "LibTV", url: "https://www.liblib.tv", group: "create" },
  { id: "p-youxi", name: "有戏AI", url: "https://youxi.fullpeace.net", group: "create", icon: "https://youxi.fullpeace.net/favicon_shortplay.png" },
  { id: "p-pixmax", name: "Pixmax", url: "https://app.pixmax.cn", group: "create" },
  { id: "p-vibex", name: "VibeX", url: "https://vibex.runninghub.cn", group: "create", icon: "https://www.runninghub.cn/favicon.ico" },
  { id: "p-douyin", name: "抖音", url: "https://www.douyin.com", group: "fun" },
  { id: "p-kuaishou", name: "快手", url: "https://www.kuaishou.com", group: "fun" },
  { id: "p-bili", name: "哔哩哔哩", url: "https://www.bilibili.com", group: "fun" },
  { id: "p-youtube", name: "YouTube", url: "https://www.youtube.com", group: "fun" },
  { id: "p-tiktok", name: "TikTok", url: "https://www.tiktok.com", group: "fun" },
  { id: "p-acfun", name: "AcFun", url: "https://www.acfun.cn", group: "fun" },
  { id: "p-necloud", name: "网易云音乐", url: "https://music.163.com", group: "fun" },
  { id: "p-qqmusic", name: "QQ音乐", url: "https://y.qq.com", group: "fun" },
  { id: "p-iqiyi", name: "爱奇艺", url: "https://www.iqiyi.com", group: "fun" },
  { id: "p-tencentvideo", name: "腾讯视频", url: "https://v.qq.com", group: "fun" },
  { id: "p-kugou", name: "酷狗音乐", url: "https://www.kugou.com", group: "fun" },
]

/* 本地存储键名与数据结构保持原样：老用户已存的网站与背景选择不会丢 */
const LS_CUSTOM_SITES = "navhub.custom.sites"
const LS_BG = "navhub.bg"
const LS_BG_CUSTOM = "navhub.bg.custom"
/* 后加的两个：被删掉的预置站点、收藏起来的站点（都只存 id） */
const LS_HIDDEN_SITES = "navhub.hidden.sites"
const LS_FAVORITES = "navhub.favorites"
/* 自定义主题色（存 hex；没有就是用回默认粉） */
const LS_THEME = "navhub.theme"
/* 回收站：被删掉的站点（含删除时间），供"找回" */
const LS_TRASH = "navhub.trash"
/* 最近使用：存最近 3 天打开过的网站（带最后记录日期，超出 3 天自动作废） */
const LS_RECENT = "navhub.recent"
/* 管理模式下对预置站点的改名/改址：按站点 id 存覆盖，预置清单本身不动 */
const LS_SITE_EDITS = "navhub.site.edits"

type SiteEdit = { name?: string; url?: string; icon?: string; group?: string }

/* 记住上次用的搜索引擎；手动拖出来的卡片顺序；每个站点的点击热度 */
const LS_ENGINE = "navhub.engine"
const LS_ORDER = "navhub.order"
const LS_HEAT = "navhub.heat"
/* 站名自定义（不改就是用默认那句「平子爸爸的Home」） */
const LS_TITLE = "navhub.title"
/* 分栏名自定义：按分组 id 存覆盖，没改过的用回原名 */
const LS_GROUP_TITLES = "navhub.group.titles"
/* 分栏自己的上下顺序（编辑模式里用小箭头调）：存一栏 id 的排列，没调过用默认顺序 */
const LS_GROUP_ORDER = "navhub.group.order"
/* 自己新建的分栏（预置栏之外的）：{id,title} 清单；栏里的网站照常存在各站点的 group 上 */
const LS_GROUP_CUSTOM = "navhub.group.custom"
/* 旧版"顶上槽放哪个模块"的存档（已被自由拖拽位置取代，只拿来继承当年的左右顺序） */
const LS_TOP_MODULE = "navhub.layout.topmod"

/* 放行教程弹窗里点过「不再显示」，以后被拦也不再弹 */
const LS_POPUP_HELP_OFF = "navhub.popuphelp.off"
/* 「一键打开」的自选清单：存勾选过的站点 id；一个都没勾就照旧全开收藏 */
const LS_OPEN_LIST = "navhub.open.list"

/* 最近搜索：每真搜一次记一条，同一个词去重挪到最前；满 30 天的自动清掉 */
const LS_SEARCH_HIST = "navhub.search.history"
const SEARCH_HIST_TTL = 30 * 24 * 60 * 60 * 1000

/* engine 是后加的字段：老记录没有就正常显示，只是不标引擎 */
export type SearchHistoryItem = { q: string; at: number; engine?: EngineId }

/* 读历史时顺手做新鲜度过滤：过期词直接请出去，留下的写回去 */
function readFreshSearchHistory(): SearchHistoryItem[] {
  const all = readStored<SearchHistoryItem[]>(LS_SEARCH_HIST, [])
  const now = Date.now()
  const fresh = all
    .filter(
      (x) =>
        x &&
        typeof x.q === "string" &&
        x.q.trim() !== "" &&
        typeof x.at === "number" &&
        now - x.at < SEARCH_HIST_TTL,
    )
    .slice(0, 100)
  if (fresh.length !== all.length) writeStored(LS_SEARCH_HIST, fresh)
  return fresh
}

export type ModId = "clock" | "weather"
export type ModPos = { x: number; y: number }

/* 时间/天气胶囊各自的位置（和深夜模式按钮同款玩法：编辑模式拖到哪停哪） */
const LS_MOD_POS: Record<ModId, string> = {
  weather: "navhub.pos.weather",
  clock: "navhub.pos.clock",
}

function clampModPos(p: ModPos): ModPos {
  const w = 250
  const h = 52
  return {
    x: Math.min(Math.max(p.x, 4), Math.max(4, window.innerWidth - w - 4)),
    y: Math.min(Math.max(p.y, 4), Math.max(4, window.innerHeight - h - 4)),
  }
}

function readModPos(key: string): ModPos | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const p = JSON.parse(raw) as ModPos
    if (typeof p?.x === "number" && typeof p?.y === "number") return p
    return null
  } catch {
    return null
  }
}

/* 没拖过就摆在右上角往左的空位（让出最右上角给深夜按钮）；
   谁在左边沿用旧版"互换位置"存的顺序，没旧档就天气在左 */
function defaultModPos(mod: ModId): ModPos {
  const first: ModId = readStored<ModId>(LS_TOP_MODULE, "weather") === "clock" ? "clock" : "weather"
  const inset = mod === first ? 570 : 330
  return clampModPos({ x: window.innerWidth - inset, y: 16 })
}

/* 搜索直达用的别名：这些叫法不是名字也不是域名，手动认领给对应站点 */
const SITE_ALIASES: Record<string, string> = {
  "b站": "p-bili",
  "油管": "p-youtube",
}

/* 输入看着就是个网址（带协议、带 www、或"域名.后缀"整串没空格）就该直接跳转而不是去搜索 */
function looksLikeUrl(q: string): boolean {
  if (/^https?:\/\//i.test(q) || /^www\./i.test(q)) return true
  const host = q.split(/[/:]/)[0]
  return (
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(host) &&
    /\.[a-z]{2,}$/i.test(host)
  )
}

/* 站名会同时出现在页首、侧栏、页脚、浏览器标签上：
   改完广播一个事件，各处听着声一起换，不用刷新页面 */
export const TITLE_EVENT = "navhub-title-change"

export function getSiteTitle(): string {
  const t = readStored<string>(LS_TITLE, "").trim()
  return t || SITE_NAME
}

/* 想跟着站名变的组件用这个（侧栏品牌区、页脚） */
export function useSiteTitle(): string {
  const [title, setTitle] = useState(getSiteTitle)
  useEffect(() => {
    const onChange = () => setTitle(getSiteTitle())
    window.addEventListener(TITLE_EVENT, onChange)
    return () => window.removeEventListener(TITLE_EVENT, onChange)
  }, [])
  return title
}

/* #rrggbb → 色调/饱和/明暗 三段数（写进 --primary 变量要用这个格式） */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h = Math.round(h * 60)
  if (h < 0) h += 360
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

const SEARCH_BASE: Record<EngineId, string> = {
  bing: "https://www.bing.com/search?q=",
  google: "https://www.google.com/search?q=",
  /* Google 图片搜索：tbm=isch 就是"搜图片"那个开关 */
  "google-img": "https://www.google.com/search?tbm=isch&q=",
  yandex: "https://yandex.com/search/?text=",
  baidu: "https://www.baidu.com/s?wd=",
}

/* 回收站等其它页面也直接读写这些本地键，导出共用 */
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStored(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* 最近使用记录：连同"最后一次记于哪一天"一起存；
   只在当天起的 3 天内保留（今天/昨天/前天），第 4 天起读的时候当没有、自动清掉 */
type RecentStore = { date: string; sites: Site[] }

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function isRecentFresh(date: string): boolean {
  const [y, m, d] = date.split("-").map(Number)
  if (!y || !m || !d) return false
  const days = Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000)
  return days <= 2
}

function readRecentToday(): Site[] {
  const stored = readStored<RecentStore | null>(LS_RECENT, null)
  if (!stored || !isRecentFresh(stored.date) || !Array.isArray(stored.sites)) return []
  return stored.sites
}

/* 回收站长期保存：删掉满 30 天的条目自动清掉；每次打开页面先过滤一遍并写回 */
const TRASH_TTL_MS = 30 * 24 * 60 * 60 * 1000
export function readFreshTrash(): TrashedEntry[] {
  const all = readStored<TrashedEntry[]>(LS_TRASH, [])
  if (!Array.isArray(all)) return []
  const fresh = all.filter((t) => Date.now() - t.deletedAt < TRASH_TTL_MS)
  if (fresh.length !== all.length) writeStored(LS_TRASH, fresh)
  return fresh
}

/* 手机拍的大图直接转 dataURL 会撑爆浏览器的小仓库：超大或超尺寸的图先等比缩到最长边 1920
   再存（背景层是 bg-cover，缩放后看不出差别），小图原样保留。 */
const BG_MAX_SIDE = 1920
const BG_MAX_BYTES = 1024 * 1024

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("read-error"))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("bad-image"))
    img.src = src
  })
}

function shrinkImage(img: HTMLImageElement, maxSide = BG_MAX_SIDE, quality = 0.82): string {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  /* 透明区域（PNG）转 JPEG 会发黑，先铺一层和页面同色的底 */
  const bgToken = getComputedStyle(document.documentElement).getPropertyValue("--background").trim()
  ctx.fillStyle = bgToken ? `hsl(${bgToken})` : "white"
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", quality)
}

export function useHome() {
  const [query, setQueryState] = useState("")
  /* 搜索直达候选被 Esc 收起后，这次输入就不再拦回车；重新改动输入就恢复候选 */
  const [hitsDismissed, setHitsDismissed] = useState(false)
  const setQuery = useCallback((v: string) => {
    setQueryState(v)
    setHitsDismissed(false)
  }, [])
  const dismissSiteHits = useCallback(() => setHitsDismissed(true), [])
  /* 时间/天气胶囊的位置：编辑模式可以拖到页面任意角落（和深夜按钮同款），坐标分开存 */
  const [modPos, setModPosState] = useState<Record<ModId, ModPos>>(() => ({
    weather: clampModPos(readModPos(LS_MOD_POS.weather) ?? defaultModPos("weather")),
    clock: clampModPos(readModPos(LS_MOD_POS.clock) ?? defaultModPos("clock")),
  }))
  const setModPos = useCallback((mod: ModId, pos: ModPos) => {
    const next = clampModPos(pos)
    setModPosState((prev) => ({ ...prev, [mod]: next }))
    writeStored(LS_MOD_POS[mod], next)
  }, [])
  /* 引擎记着用：上次挑了哪个，下次打开还是哪个 */
  const [engine, setEngineState] = useState<EngineId>(() => {
    const stored = readStored<string>(LS_ENGINE, "bing")
    return (ENGINE_IDS as string[]).includes(stored) ? (stored as EngineId) : "bing"
  })
  const setEngine = useCallback((v: EngineId) => {
    setEngineState(v)
    writeStored(LS_ENGINE, v)
  }, [])
  const [customSites, setCustomSites] = useState<Site[]>(() =>
    readStored<Site[]>(LS_CUSTOM_SITES, []),
  )
  const [hiddenSiteIds, setHiddenSiteIds] = useState<string[]>(() =>
    readStored<string[]>(LS_HIDDEN_SITES, []),
  )
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readStored<string[]>(LS_FAVORITES, []),
  )
  const [bgId, setBgIdState] = useState<string>(() => readStored<string>(LS_BG, "pastel"))
  const [customBgUrl, setCustomBgUrlState] = useState<string | null>(() =>
    readStored<string | null>(LS_BG_CUSTOM, null),
  )
  /* 从某个分组旁边的「添加」进来时记着目标分组，弹窗里就预置好它 */
  const [addSiteTarget, setAddSiteTarget] = useState<string | null>(null)
  const [bgNotice, setBgNotice] = useState("")
  const [themeHex, setThemeHexState] = useState<string | null>(() =>
    readStored<string | null>(LS_THEME, null),
  )
  const [trash, setTrash] = useState<TrashedEntry[]>(() => readFreshTrash())
  /* 今天打开过的网站：同网站只留一条，最近打开的排最前 */
  const [recent, setRecent] = useState<Site[]>(readRecentToday)
  /* 预置站点的改名/改址覆盖表；正在编辑的那张卡片 */
  const [siteEdits, setSiteEdits] = useState<Record<string, SiteEdit>>(() =>
    readStored<Record<string, SiteEdit>>(LS_SITE_EDITS, {}),
  )
  const [editTarget, setEditTarget] = useState<Site | null>(null)
  /* 手动拖出来的顺序：每组存一份 id 列表（没排在列表里的照常跟在后面） */
  const [siteOrders, setSiteOrders] = useState<Record<string, string[]>>(() =>
    readStored<Record<string, string[]>>(LS_ORDER, {}),
  )
  /* 每个站点被真实点开过多少次（编辑模式点卡片不算） */
  const [heat, setHeat] = useState<Record<string, number>>(() =>
    readStored<Record<string, number>>(LS_HEAT, {}),
  )
  /* 站名（页首/侧栏/页脚/浏览器标签共用一份） */
  const [siteTitle, setSiteTitle] = useState<string>(getSiteTitle)
  /* 分栏名覆盖表 */
  const [groupTitles, setGroupTitles] = useState<Record<string, string>>(() =>
    readStored<Record<string, string>>(LS_GROUP_TITLES, {}),
  )
  /* 分栏顺序（[] = 没调过，用默认排法） */
  const [groupOrder, setGroupOrderState] = useState<string[]>(() =>
    readStored<string[]>(LS_GROUP_ORDER, []),
  )
  /* 自己新建的分栏清单（排在预置栏之后，照样能改名/调序） */
  const [customGroups, setCustomGroups] = useState<GroupDef[]>(() =>
    readStored<GroupDef[]>(LS_GROUP_CUSTOM, []),
  )
  /* 飞入动画模式下"刚新加进来"的成员（网站/分栏）：它们单独飞入一次，
     只在本次浏览有效，不用存盘 */
  const [soloIds, setSoloIds] = useState<string[]>([])
  const markSolo = useCallback((id: string) => {
    /* 没选飞入动画就什么都不标：默认动画下新加的东西照常直接出现 */
    if (readIntroMode() !== "flyin") return
    setSoloIds((prev) => [...prev, id])
  }, [])

  const saveGroupTitle = useCallback(
    (groupId: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const next = { ...groupTitles, [groupId]: trimmed }
      if (!writeStored(LS_GROUP_TITLES, next)) return
      setGroupTitles(next)
    },
    [groupTitles],
  )
  /* 把选的颜色盖到全站主色上：按钮、图标、光斑那些 primary 元素会整片跟着变 */
  useEffect(() => {
    const root = document.documentElement.style
    const hsl = themeHex ? hexToHsl(themeHex) : null
    if (!hsl) {
      /* 收回自定义值，回到写在主题里的默认粉 */
      root.removeProperty("--primary")
      root.removeProperty("--ring")
      root.removeProperty("--primary-foreground")
      return
    }
    const value = `${hsl.h} ${hsl.s}% ${hsl.l}%`
    root.setProperty("--primary", value)
    root.setProperty("--ring", value)
    /* 主色亮就配深色字、主色暗就配亮字，按钮上的文字始终看得清 */
    root.setProperty(
      "--primary-foreground",
      `${hsl.h} ${Math.min(hsl.s, 55)}% ${hsl.l >= 55 ? 26 : 96}%`,
    )
  }, [themeHex])
  /* 侧栏点「更改设置」进来时地址上带着 edit=1，卡片右上角就冒出垃圾桶 */
  const [searchParams, setSearchParams] = useSearchParams()
  const editing = searchParams.get("edit") === "1"
  /* 换背景面板同样跟着地址走：侧栏点「换背景」挂上 bg=1，关掉面板就摘掉 */
  const bgPanelOpen = searchParams.get("bg") === "1"
  const setBgPanelOpen = useCallback(
    (v: boolean) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (v) next.set("bg", "1")
        else next.delete("bg")
        return next
      })
    },
    [setSearchParams],
  )

  useEffect(() => {
    document.title = siteTitle
  }, [siteTitle])

  /* 管理模式下改站名：写本地、广播给侧栏/页脚、浏览器标签同步换 */
  const saveSiteTitle = useCallback((v: string) => {
    const trimmed = v.trim()
    if (!trimmed) return
    writeStored(LS_TITLE, trimmed)
    setSiteTitle(trimmed)
    window.dispatchEvent(new Event(TITLE_EVENT))
  }, [])

  const groups = useMemo(() => {
    /* 编辑窗口里改过名/址/图标的站点套上覆盖（预置站靠它，个人站的改动直接写回自己那条）；
       覆盖里 icon 传空串 = 用户手动撤掉了自定义图标，回到自动识别 */
    const patch = (s: Site): Site => {
      const e = siteEdits[s.id]
      if (!e) return s
      return {
        ...s,
        name: e.name ?? s.name,
        url: e.url ?? s.url,
        icon: e.icon === undefined ? s.icon : e.icon || undefined,
        /* 跨栏拖过去时记的归属分栏 */
        group: e.group ?? s.group,
      }
    }
    const allSites = [
      ...PRESET_SITES.filter((s) => !hiddenSiteIds.includes(s.id)).map(patch),
      ...customSites.map(patch),
    ]
    /* 拖拽排过序的组按存的 id 列表重排；不在列表里的（新加的）照常排在末尾 */
    const applyOrder = (groupId: string, list: Site[]): Site[] => {
      const ord = siteOrders[groupId]
      if (!ord || ord.length === 0) return list
      const pos = new Map(ord.map((sid, i) => [sid, i]))
      return [...list].sort((a, b) => (pos.get(a.id) ?? ord.length) - (pos.get(b.id) ?? ord.length))
    }
    /* 收藏是"搬走"不是"抄一份"：收了就从原分组消失，只在收藏栏显示，取消收藏再搬回去 */
    const favorites = allSites.filter((s) => favoriteIds.includes(s.id))
    /* 预置栏之后接上自己新建的栏：改名、调序、往里加站/拖站全都一样用 */
    const base = [...GROUPS, ...customGroups].map((g) => ({
      ...g,
      /* 编辑模式里改过分栏名的用改后的，没改过用原名 */
      title: groupTitles[g.id] ?? g.title,
      sites: applyOrder(
        g.id,
        allSites.filter((s) => s.group === g.id && !favoriteIds.includes(s.id)),
      ),
    }))
    /* 收藏栏永远显示（空着也有空着的用法：能直接往里加个人网址） */
    const sections = [
      { id: "fav", title: groupTitles.fav ?? "收藏", sites: applyOrder("fav", favorites) },
      ...base,
    ]
    /* 编辑模式里用小箭头调过分栏顺序就照存的排，没调过用默认排法（收藏在最前） */
    if (groupOrder.length === 0) return sections
    const gpos = new Map(groupOrder.map((gid, i) => [gid, i]))
    return [...sections].sort(
      (a, b) => (gpos.get(a.id) ?? groupOrder.length) - (gpos.get(b.id) ?? groupOrder.length),
    )
  }, [customSites, hiddenSiteIds, favoriteIds, siteEdits, siteOrders, groupTitles, groupOrder, customGroups])

  /* 编辑模式里点小箭头：把某一栏和上/下一栏对调（按当前显示的顺序找邻居） */
  const moveGroupSection = useCallback(
    (groupId: string, dir: -1 | 1) => {
      const ids = groups.map((g) => g.id)
      const i = ids.indexOf(groupId)
      const j = i + dir
      if (i < 0 || j < 0 || j >= ids.length) return
      const next = [...ids]
      const tmp = next[i]
      next[i] = next[j]
      next[j] = tmp
      writeStored(LS_GROUP_ORDER, next)
      setGroupOrderState(next)
    },
    [groups],
  )

  /* 更改模式下新建分栏：先起个「新分类」的占位名（重名自动编号），
     建好就地用铅笔改名字；新栏自带一次飞入登场 */
  const addGroup = useCallback(() => {
    const taken = new Set([...GROUPS, ...customGroups].map((g) => groupTitles[g.id] ?? g.title))
    let title = "新分类"
    for (let i = 2; taken.has(title); i += 1) title = `新分类 ${i}`
    const group: GroupDef = { id: "cg" + Date.now().toString(36), title }
    const next = [...customGroups, group]
    if (!writeStored(LS_GROUP_CUSTOM, next)) return
    setCustomGroups(next)
    markSolo(group.id)
  }, [customGroups, groupTitles, markSolo])

  /* 拆掉自己建的分栏：只限空栏——里面还有网站就拆不了，免得网站跟着凭空没去处 */
  const removeGroup = useCallback(
    (groupId: string) => {
      if (!groupId.startsWith("cg")) return
      const section = groups.find((g) => g.id === groupId)
      if (!section || section.sites.length > 0) return
      const next = customGroups.filter((g) => g.id !== groupId)
      if (!writeStored(LS_GROUP_CUSTOM, next)) return
      setCustomGroups(next)
    },
    [groups, customGroups],
  )

  /* 收藏是搬移不是重复列出，总数照常算 */
  const totalSites = useMemo(
    () => PRESET_SITES.filter((s) => !hiddenSiteIds.includes(s.id)).length + customSites.length,
    [hiddenSiteIds, customSites],
  )
  const customCount = customSites.length
  const bgLabel = useMemo(() => {
    if (bgId === "custom") return "我的图片"
    return BACKGROUNDS.find((b) => b.id === bgId)?.name ?? "粉彩柔和"
  }, [bgId])

  /* 每打开一个网站就记一笔：同 id 挤掉旧位置、挪到最前，顺带把日期刷成今天；
     热度也在这里累计——只有真实打开才算，编辑模式点卡片不会加 */
  const recordRecent = useCallback((site: Site) => {
    setRecent((prev) => {
      const next = [site, ...prev.filter((s) => s.id !== site.id)]
      writeStored(LS_RECENT, { date: todayKey(), sites: next })
      return next
    })
    setHeat((prev) => {
      const next = { ...prev, [site.id]: (prev[site.id] ?? 0) + 1 }
      writeStored(LS_HEAT, next)
      return next
    })
  }, [])

  /* 搜索直达候选：输入对上网站名/域名/别名就列出来（收藏栏里的排前面），回车开第一个；
     纯英文要满 2 个字母才弹，免得打个 "b" 就刷屏 */
  const siteHits = useMemo(() => {
    if (hitsDismissed) return []
    const q = query.trim().toLowerCase()
    if (!q) return []
    if (!/[^\x00-\x7f]/.test(q) && q.length < 2) return []
    const aliasId = SITE_ALIASES[q]
    const seen = new Set<string>()
    const hits: Site[] = []
    for (const g of groups) {
      for (const s of g.sites) {
        if (seen.has(s.id)) continue
        seen.add(s.id)
        let host = ""
        try {
          host = new URL(s.url).hostname
        } catch {
          /* 网址异常就只比对名字 */
        }
        if (
          (aliasId && aliasId === s.id) ||
          s.name.toLowerCase().includes(q) ||
          (host && host.includes(q))
        ) {
          hits.push(s)
        }
      }
    }
    return hits.slice(0, 6)
  }, [query, groups, hitsDismissed])

  /* 搜索联想词：打字一停手就去联想接口要词（只等最短的 150 毫秒，图个跟手）；
     粘的是网址、或刚按 Esc 收起就先不折腾；响应带序号，只认最新一次输入的结果 */
  const [sugList, setSugList] = useState<string[]>([])
  const sugSeq = useRef(0)
  /* 联想缓存（本次打开页面内）：拿过的词都留着，边打字边从旧结果里筛前缀先顶上，
     删字回退也直接命中——把"每次都干等一趟网络"变成"先有得看、新结果到了再换" */
  const sugCache = useRef(new Map<string, string[]>())
  useEffect(() => {
    const q = query.trim()
    if (!q || looksLikeUrl(q)) {
      setSugList([])
      return
    }
    const qLower = q.toLowerCase()
    const norm = (list: string[]) => {
      const out: string[] = []
      const seen = new Set<string>()
      list.forEach((w) => {
        const t = (w ?? "").trim()
        const key = t.toLowerCase()
        if (!t || key === qLower || seen.has(key)) return
        seen.add(key)
        out.push(t)
      })
      return out.slice(0, 7)
    }
    const key = `${engine}|${q}`
    const exact = sugCache.current.get(key)
    if (exact) {
      /* 这个词刚搜过：原样端上来，一次网络都不用跑 */
      setSugList(exact)
      return
    }
    /* 预热：这个引擎以前拿过的联想里，凡是以当前输入开头的先亮出来（请求还没回，先有得看） */
    const warm = norm(
      Array.from(sugCache.current.entries())
        .filter(([k]) => k.startsWith(`${engine}|`))
        .flatMap(([, v]) => v),
    ).filter((w) => w.toLowerCase().startsWith(qLower))
    if (warm.length > 0) setSugList(warm)
    const my = (sugSeq.current += 1)
    const timer = window.setTimeout(() => {
      void getSuggestions(engine, q).then((list) => {
        if (sugSeq.current !== my) return
        const out = norm(list)
        sugCache.current.set(key, out)
        /* 只留最近 60 个词的缓存，多了挤掉最旧的，不占地方 */
        if (sugCache.current.size > 60) {
          const oldest = sugCache.current.keys().next().value
          if (oldest !== undefined) sugCache.current.delete(oldest)
        }
        setSugList(out)
      })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [query, engine])
  /* 和网站候选同一套规则：Esc 收起后，等下一个字才重新冒出来 */
  const sug = hitsDismissed ? [] : sugList

  /* 最近搜索：打开页面就按"满 30 天清一次"的规矩过滤一遍；
     同一个词再搜就挪到最前、刷新时间（去重不堆重复行） */
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() =>
    readFreshSearchHistory(),
  )
  const pushSearchHistory = useCallback((raw: string, usedEngine: EngineId) => {
    const q = raw.trim()
    if (!q) return
    setSearchHistory((prev) => {
      const next = [
        { q, at: Date.now(), engine: usedEngine },
        ...prev.filter((x) => x.q !== q),
      ].slice(0, 100)
      writeStored(LS_SEARCH_HIST, next)
      return next
    })
  }, [])
  /* 单条删除（记录行上的小叉）和一键清空（浮层表头） */
  const removeSearchHistory = useCallback((q: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((x) => x.q !== q)
      writeStored(LS_SEARCH_HIST, next)
      return next
    })
  }, [])
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    writeStored(LS_SEARCH_HIST, [])
  }, [])

  const runSearch = useCallback((overrideQuery?: string) => {
    /* 点联想词时会带着那个词进来：不再回读输入框，直接按它出发 */
    const q = (overrideQuery ?? query).trim()
    if (!q) return
    /* Google搜图模式下贴的是图片网址：不拿它当关键词，直接交给谷歌的"按图搜索"去读图 */
    if (engine === "google-img" && /^https?:\/\//i.test(q)) {
      window.open(
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(q)}&locale=zh-CN`,
        "_blank",
        "noopener,noreferrer",
      )
      return
    }
    /* 输入的就是个网址：直接跳，不再当搜索词 */
    if (looksLikeUrl(q)) {
      const url = /^https?:\/\//i.test(q) ? q : `https://${q}`
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    /* 对上了自己的网站：回车直接打开第一个候选（点联想词时不抢，按词去搜） */
    if (!overrideQuery && siteHits[0]) {
      window.open(siteHits[0].url, "_blank", "noopener,noreferrer")
      recordRecent(siteHits[0])
      return
    }
    /* 真去搜索引擎搜了才记一笔（粘网址直跳、回车直开自己的站都不算搜索，不记） */
    pushSearchHistory(q, engine)
    window.open(SEARCH_BASE[engine] + encodeURIComponent(q), "_blank", "noopener,noreferrer")
  }, [query, engine, siteHits, recordRecent, pushSearchHistory])

  const addCustomSite = useCallback(
    (siteName: string, url: string, group: string, icon?: string): boolean => {
      const trimmedName = siteName.trim()
      let trimmedUrl = url.trim()
      if (!trimmedName || !trimmedUrl) return false
      if (!/^https?:\/\//i.test(trimmedUrl)) trimmedUrl = "https://" + trimmedUrl
      const site: Site = {
        id: "c-" + Date.now().toString(36),
        name: trimmedName,
        url: trimmedUrl,
        group,
        custom: true,
        /* 上传了自己的小图标就带上，没有就继续走自动识别 */
        icon: icon || undefined,
      }
      const next = [...customSites, site]
      if (!writeStored(LS_CUSTOM_SITES, next)) return false
      setCustomSites(next)
      /* 新添加的网站也带一次随机飞入登场（选了飞入动画才算） */
      markSolo(site.id)
      /* 直接加进收藏栏的个人网址：也记为已收藏（收藏栏只认收藏名单），取消收藏即删 */
      if (group === "fav") {
        const nextFav = [...favoriteIds, site.id]
        writeStored(LS_FAVORITES, nextFav)
        setFavoriteIds(nextFav)
      }
      return true
    },
    [customSites, favoriteIds, markSolo],
  )

  const openAddSiteForm = useCallback((groupId: string) => {
    setAddSiteTarget(groupId)
  }, [])

  const closeAddSiteForm = useCallback(() => {
    setAddSiteTarget(null)
  }, [])

  /* 管理模式下点卡片 = 打开编辑窗口（不再是跳转去网站） */
  const openEditSite = useCallback((site: Site) => {
    setEditTarget(site)
  }, [])

  const closeEditSite = useCallback(() => {
    setEditTarget(null)
  }, [])

  /* 保存编辑：个人站直接改自己那条记录；预置站写进覆盖表。
     「最近使用」里同名条目也一起换成新名字新网址，别留旧的 */
  /* icon：undefined=这次没动图标；空串=撤掉自定义图标回自动识别；其余=新图标 dataURL */
  const saveSiteEdit = useCallback(
    (site: Site, name: string, url: string, icon?: string): boolean => {
      const trimmedName = name.trim()
      let trimmedUrl = url.trim()
      if (!trimmedName || !trimmedUrl) return false
      if (!/^https?:\/\//i.test(trimmedUrl)) trimmedUrl = "https://" + trimmedUrl
      const newIcon = icon === undefined ? site.icon : icon || undefined
      if (site.custom) {
        const next = customSites.map((s) =>
          s.id === site.id
            ? { ...s, name: trimmedName, url: trimmedUrl, icon: newIcon }
            : s,
        )
        if (!writeStored(LS_CUSTOM_SITES, next)) return false
        setCustomSites(next)
      } else {
        const next: Record<string, SiteEdit> = {
          ...siteEdits,
          [site.id]: {
            name: trimmedName,
            url: trimmedUrl,
            ...(icon === undefined ? null : { icon }),
          },
        }
        if (!writeStored(LS_SITE_EDITS, next)) return false
        setSiteEdits(next)
      }
      setRecent((prev) => {
        const next = prev.map((s) =>
          s.id === site.id ? { ...s, name: trimmedName, url: trimmedUrl, icon: newIcon } : s,
        )
        writeStored(LS_RECENT, { date: todayKey(), sites: next })
        return next
      })
      return true
    },
    [customSites, siteEdits],
  )

  /* 编辑模式里把卡片拖到同组另一张卡片上：按落点重排该组，存成 id 顺序表 */
  const reorderSites = useCallback(
    (groupId: string, ids: string[]) => {
      const next = { ...siteOrders, [groupId]: ids }
      if (!writeStored(LS_ORDER, next)) return
      setSiteOrders(next)
    },
    [siteOrders],
  )

  /* 跨栏拖拽：把 dragged 挪进 groupId 这一栏、排在 targetId 那张的位置
     - 拖进收藏栏 = 收藏它；从收藏栏拖到某个分栏 = 取消收藏并改挂到那一栏
     - 分栏与分栏之间 = 直接换归属（预置站记在覆盖表、个人站改自己那条）
     - 同一栏内 = 纯换位置 */
  const moveSite = useCallback(
    (dragged: Site, groupId: string, targetId: string | null) => {
      const section = groups.find((g) => g.id === groupId)
      if (!section) return
      /* 它现在实际显示在哪一栏（收藏栏也算） */
      const currentGroupId =
        groups.find((g) => g.sites.some((s) => s.id === dragged.id))?.id ?? dragged.group

      if (groupId === "fav" && currentGroupId !== "fav") {
        const next = [...favoriteIds, dragged.id]
        writeStored(LS_FAVORITES, next)
        setFavoriteIds(next)
      } else if (groupId !== "fav" && currentGroupId === "fav") {
        /* 从收藏栏拖出去：取消收藏，同时挂到落点那一栏 */
        const next = favoriteIds.filter((x) => x !== dragged.id)
        writeStored(LS_FAVORITES, next)
        setFavoriteIds(next)
        if (dragged.custom) {
          const nextCustoms = customSites.map((s) =>
            s.id === dragged.id ? { ...s, group: groupId } : s,
          )
          writeStored(LS_CUSTOM_SITES, nextCustoms)
          setCustomSites(nextCustoms)
        } else {
          const next = { ...siteEdits, [dragged.id]: { ...siteEdits[dragged.id], group: groupId } }
          writeStored(LS_SITE_EDITS, next)
          setSiteEdits(next)
        }
      } else if (groupId !== "fav" && currentGroupId !== groupId) {
        /* 普通分栏之间搬家 */
        if (dragged.custom) {
          const nextCustoms = customSites.map((s) =>
            s.id === dragged.id ? { ...s, group: groupId } : s,
          )
          writeStored(LS_CUSTOM_SITES, nextCustoms)
          setCustomSites(nextCustoms)
        } else {
          const next = { ...siteEdits, [dragged.id]: { ...siteEdits[dragged.id], group: groupId } }
          writeStored(LS_SITE_EDITS, next)
          setSiteEdits(next)
        }
      }

      /* 落点排序：落在某张卡的位置上，落在栏里空处就排到最后 */
      const ids = section.sites.map((s) => s.id).filter((id) => id !== dragged.id)
      const at = targetId ? ids.indexOf(targetId) : -1
      ids.splice(at < 0 ? ids.length : at, 0, dragged.id)
      const nextOrders = { ...siteOrders, [groupId]: ids }
      writeStored(LS_ORDER, nextOrders)
      setSiteOrders(nextOrders)
    },
    [groups, favoriteIds, customSites, siteEdits, siteOrders],
  )

  /* 删掉的站点先塞回收站（同 id 只留最新一条），随时能在页面底部捞回来 */
  const recordTrash = useCallback(
    (site: Site) => {
      const next = [{ site, deletedAt: Date.now() }, ...trash.filter((t) => t.site.id !== site.id)]
      writeStored(LS_TRASH, next)
      setTrash(next)
    },
    [trash],
  )

  /* 管理模式下点垃圾桶：先记进回收站，再自己加的从清单里去、预置的记进"藏起来"清单 */
  const removeSite = useCallback(
    (site: Site) => {
      recordTrash(site)
      if (site.custom) {
        const next = customSites.filter((s) => s.id !== site.id)
        writeStored(LS_CUSTOM_SITES, next)
        setCustomSites(next)
        return
      }
      const next = [...hiddenSiteIds, site.id]
      writeStored(LS_HIDDEN_SITES, next)
      setHiddenSiteIds(next)
    },
    [customSites, hiddenSiteIds, recordTrash],
  )

  /* 找回 / 彻底删 / 清空都在回收站页面里做（见 useTrash），首页只负责"删进来" */
  const toggleFavorite = useCallback(
    (id: string) => {
      if (!favoriteIds.includes(id)) {
        const next = [...favoriteIds, id]
        writeStored(LS_FAVORITES, next)
        setFavoriteIds(next)
        return
      }
      /* 取消收藏 */
      const nextFav = favoriteIds.filter((x) => x !== id)
      writeStored(LS_FAVORITES, nextFav)
      setFavoriteIds(nextFav)
      /* 直接加在收藏栏里的个人网址没有"原分组"可回：取消收藏就等于删除（回收站可找回） */
      const site = customSites.find((s) => s.id === id)
      if (site?.custom && site.group === "fav") {
        const rest = customSites.filter((s) => s.id !== id)
        writeStored(LS_CUSTOM_SITES, rest)
        setCustomSites(rest)
        recordTrash(site)
      }
    },
    [favoriteIds, customSites, recordTrash],
  )

  /* 收藏栏的「一键打开」：直接连开全部收藏。
     浏览器对"单次点击连开多页"只放行一个，被拦时弹一份分浏览器的放行教程
     （放行过一次后，以后每次都全开）；教程里点过「不再显示」后就彻底不弹 */
  const [popupHelpOpen, setPopupHelpOpen] = useState(false)
  const [helpDismissed, setHelpDismissed] = useState(
    () => readStored<boolean>(LS_POPUP_HELP_OFF, false) === true,
  )
  /* 「一键打开」自选清单：点卡片勾进来的站点（存 id，站被删了自动忽略） */
  const [openListIds, setOpenListIds] = useState<string[]>(() =>
    readStored<string[]>(LS_OPEN_LIST, []),
  )
  const toggleOpenList = useCallback(
    (id: string) => {
      const next = openListIds.includes(id)
        ? openListIds.filter((x) => x !== id)
        : [...openListIds, id]
      writeStored(LS_OPEN_LIST, next)
      setOpenListIds(next)
    },
    [openListIds],
  )

  /* 收藏栏的「一键打开」：勾过自选清单就只开勾中的（按勾选顺序），
     一个没勾就照旧全开收藏。浏览器对"单次点击连开多页"只放行一个，
     被拦时弹一份分浏览器的放行教程（放行过一次后，以后每次都全开）；
     教程里点过「不再显示」后就彻底不弹 */
  const openAllFavorites = useCallback(() => {
    const all = groups.flatMap((g) => g.sites)
    const byId = new Map(all.map((s) => [s.id, s]))
    const picked = openListIds
      .map((id) => byId.get(id))
      .filter((s): s is Site => Boolean(s))
    const fav = groups.find((g) => g.id === "fav")
    const toOpen = picked.length > 0 ? picked : fav?.sites ?? []
    if (toOpen.length === 0) return
    let blocked = 0
    toOpen.forEach((s) => {
      const win = window.open(s.url, "_blank", "noopener,noreferrer")
      if (!win) blocked += 1
    })
    if (blocked > 0 && !helpDismissed) setPopupHelpOpen(true)
  }, [groups, helpDismissed, openListIds])
  const closePopupHelp = useCallback(() => setPopupHelpOpen(false), [])
  /* 不再显示：永久记住（本地），弹窗同时关掉 */
  const dismissPopupHelp = useCallback(() => {
    writeStored(LS_POPUP_HELP_OFF, true)
    setHelpDismissed(true)
    setPopupHelpOpen(false)
  }, [])

  const selectBackground = useCallback(
    (id: string) => {
      /* 只有已经上传过图片才能切回「我的图片」，其它随时可切 */
      if (id === "custom" && !customBgUrl) return
      setBgIdState(id)
      writeStored(LS_BG, id)
      setBgNotice("")
    },
    [customBgUrl],
  )

  const applyCustomBackground = useCallback((file: File) => {
    void (async () => {
      try {
        const dataUrl = await readAsDataUrl(file)
        const img = await loadImage(dataUrl)
        const width = img.naturalWidth
        const height = img.naturalHeight
        const needsShrink =
          width > 0 && height > 0 && (file.size > BG_MAX_BYTES || Math.max(width, height) > BG_MAX_SIDE)
        /* 首选原图或压一档；万一还是存不下，再压一档更小的重试一次 */
        let storedUrl = needsShrink ? shrinkImage(img) || dataUrl : dataUrl
        if (!writeStored(LS_BG_CUSTOM, storedUrl) && needsShrink) {
          const smaller = shrinkImage(img, 1280, 0.7)
          if (smaller) storedUrl = smaller
        }
        if (!writeStored(LS_BG_CUSTOM, storedUrl)) {
          setBgNotice("这张图有点大，浏览器记不住，换张小一点的图片吧")
          return
        }
        setCustomBgUrlState(storedUrl)
        setBgIdState("custom")
        writeStored(LS_BG, "custom")
        setBgNotice("")
      } catch {
        setBgNotice("这张图读不出来，换一张 JPG 或 PNG 格式的图片试试")
      }
    })()
  }, [])

  /* 存过的图万一哪天打不开了（换了台设备、格式不被支持），别让页面停在空白背景上 */
  const handleBgImageError = useCallback(() => {
    setBgIdState("pastel")
    writeStored(LS_BG, "pastel")
    setBgNotice("之前存的背景图打不开了，已经换回粉色背景，重新上传一张吧")
  }, [])

  /* 换主题色：能解析成颜色的 hex 才存，存完立刻全站生效 */
  const setThemeColor = useCallback((hex: string) => {
    if (!hexToHsl(hex)) return
    if (!writeStored(LS_THEME, hex)) return
    setThemeHexState(hex)
  }, [])

  const resetTheme = useCallback(() => {
    try {
      window.localStorage.removeItem(LS_THEME)
    } catch {
      /* 忽略 */
    }
    setThemeHexState(null)
  }, [])

  const clearCustomBackground = useCallback(() => {
    try {
      window.localStorage.removeItem(LS_BG_CUSTOM)
    } catch {
      /* 忽略 */
    }
    setCustomBgUrlState(null)
    if (bgId === "custom") {
      setBgIdState("pastel")
      writeStored(LS_BG, "pastel")
    }
    setBgNotice("")
  }, [bgId])

  return {
    query,
    setQuery,
    dismissSiteHits,
    siteHits,
    sug,
    modPos,
    setModPos,
    engine,
    setEngine,
    runSearch,
    groups,
    totalSites,
    customCount,
    addCustomSite,
    removeSite,
    toggleFavorite,
    favoriteIds,
    openAllFavorites,
    openListIds,
    toggleOpenList,
    popupHelpOpen,
    closePopupHelp,
    dismissPopupHelp,
    bgId,
    bgLabel,
    selectBackground,
    customBgUrl,
    applyCustomBackground,
    clearCustomBackground,
    handleBgImageError,
    bgPanelOpen,
    setBgPanelOpen,
    addSiteTarget,
    openAddSiteForm,
    closeAddSiteForm,
    editTarget,
    openEditSite,
    closeEditSite,
    saveSiteEdit,
    reorderSites,
    moveSite,
    heat,
    siteTitle,
    saveSiteTitle,
    saveGroupTitle,
    moveGroupSection,
    addGroup,
    removeGroup,
    soloIds,
    bgNotice,
    themeHex,
    setThemeColor,
    resetTheme,
    editing,
    recent,
    recordRecent,
    searchHistory,
    removeSearchHistory,
    clearSearchHistory,
  }
}