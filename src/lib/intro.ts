import type { CSSProperties } from "react"

/* 启动动画开关：只有两种——
   default = 页面本来的样子（默认动画）；flyin = 飞入动画。
   开关存在这台浏览器里；改完广播一嗓子，主页收到就在当前页立刻演一遍给用户看效果。
   时间轴：背景 2 倍特写由内向外扩开定场（0.75 秒）→ 功能模块 0.5 秒起错峰匀速下落（各 1.15 秒）→
   1.8 秒起网站飞入段（最长 3.5 秒路程的陆续落定），每块的轨迹/速度/大小都随机。 */
export type IntroMode = "default" | "flyin"

export const INTRO_EVENT = "navhub-intro-play"

export function readIntroMode(): IntroMode {
  try {
    return window.localStorage.getItem("navhub.intro") === '"flyin"' ? "flyin" : "default"
  } catch {
    return "default"
  }
}

export function saveIntroMode(mode: IntroMode) {
  try {
    window.localStorage.setItem("navhub.intro", JSON.stringify(mode))
  } catch {
    /* 存不下就算了，当前页的预览照给 */
  }
  window.dispatchEvent(new CustomEvent<IntroMode>(INTRO_EVENT, { detail: mode }))
}

const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]
const f = (n: number) => n.toFixed(1)

/* 直飞轨迹的速度曲线也抽签：有的稳稳减速、有的冲过头弹一下、有的干脆匀速 */
const STRAIGHT_EASES = [
  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "cubic-bezier(0.16, 1, 0.3, 1)",
  "cubic-bezier(0.5, 1.35, 0.6, 1)",
  "cubic-bezier(0.3, 0.9, 0.4, 1)",
]

/* 飞入起点+出场方式抽签：每个元素挂载时摇一次。
   所有卡片都从界面外飞回原位（翻滚已删）：
   ~15% 沿途带着整圈旋转飞进来，其余本分直飞/弧线，
   只玩方向、快慢、大小——28% 概率以两三倍巨物姿态压过来、沿途缩回正常大小。
   calm 档给分栏标题用：文字不兴折腾——不旋转、不弧线、不缩放，
   只是从自己摇到的方向平移回来、由淡到实，简单利落 */
export function flyVars(opts?: { calm?: boolean }): CSSProperties {
  const calm = opts?.calm === true
  /* 转着飞的直飞选手：轨迹还是直线弧线，只是沿途带着整圈翻滚 */
  const spinFlight = !calm && Math.random() < 0.15
  /* 起点必须在全站任何一张卡的屏幕外：随机挑一个来向，
     然后把「更贴轴向的那一轴」的偏移量推到超过一整屏宽/高——
     这样无论卡片平时摆在页面哪里，起势都在视口之外，真·从界面外飞入。
     （起点在上方/左方不撑滚动条，在下方/右方也只临时存在，动画完即收） */
  const angle = Math.random() * Math.PI * 2
  const ca = Math.abs(Math.cos(angle))
  const sa = Math.abs(Math.sin(angle))
  const dist = Math.min((110 / Math.max(ca, sa, 0.35)) * rnd(1.0, 1.25), 170)
  const fx = Math.cos(angle) * dist
  const fy = Math.sin(angle) * dist
  /* 起点角度：不旋转的只带一丁点歪头；转着飞的一圈起步；分栏标题几乎正着来 */
  const fr = calm
    ? rnd(-3, 3)
    : spinFlight
      ? (Math.random() < 0.5 ? -1 : 1) * rnd(360, 720)
      : rnd(-10, 10)
  const big = !calm && Math.random() < 0.28
  const fs = calm ? 0.9 : big ? rnd(2, 3.2) : rnd(0.35, 0.8)
  const vars: Record<string, string> = {
    "--fx": `${f(fx)}vw`,
    "--fy": `${f(fy)}vh`,
    "--fr": `${f(fr)}deg`,
    "--fs": f(fs),
    "--fso": calm ? "0" : f(rnd(0.05, 0.22)),
  }
  if (calm) {
    /* 分栏标题：迟滞压小排在各栏卡片前面，路程短而干脆，全程不带花样 */
    vars["--intro-x"] = rnd(0, 0.45).toFixed(3)
    vars["--intro-dur"] = `${rnd(0.8, 1.3).toFixed(2)}s`
    vars["--intro-ease"] = "cubic-bezier(0.16, 1, 0.3, 1)"
    return vars as CSSProperties
  }
  /* 迟滞拉满 0~2.8 秒错峰；路程 2.2~3.5 秒全随机——
     最快也要两秒多，最长不超过 3.5 秒，陆续落位不扎堆 */
  vars["--intro-x"] = Math.random().toFixed(3)
  vars["--intro-dur"] = `${rnd(2.2, 3.5).toFixed(2)}s`
  vars["--intro-ease"] = pick(STRAIGHT_EASES)
  /* 中途侧偏点：把直线变成一条随机方向的弧线。
     侧偏收得很小（最多 9vw，不到一张卡的宽度）——偏移大了卡片会中途
     停在邻居家头顶磨蹭，看着就是"叠在别人上面最后才挪回自己位" */
  const side = angle + Math.PI / 2
  const bend = rnd(2, 9)
  vars["--fmx"] = `${f(Math.cos(side) * bend)}vw`
  vars["--fmy"] = `${f(Math.sin(side) * bend * 0.8)}vh`
  return vars as CSSProperties
}
