import { useMemo, useRef, useState } from "react"
import { Bookmark, Flame, Pencil, Trash2 } from "lucide-react"
import { HeartIcon } from "@/components/home/DecorIcons"
import { flyVars } from "@/lib/intro"
import type { Site } from "@/pages/Home/useHome"

/* 每张卡片都给一朵粉色小圆标，整片网格看起来是粉粉的一片 */
const AVATAR_TONES = [
  "bg-primary/20 text-primary-foreground ring-primary/25",
  "bg-primary/15 text-primary-foreground ring-primary/20",
  "bg-primary/25 text-primary-foreground ring-primary/30",
  "bg-primary/10 text-primary-foreground ring-primary/20",
]

/* 网站真实小图标：预置站点优先用官方给的图标地址，接着去网站根目录要 favicon，
   再拿不到就借搜索服务的图标库（自己添加的网站也走这条自动识别的路），
   还不行才退回原来的首字母粉色圆标，卡片永远不会出现空白头像 */
export function SiteFavicon({
  site,
  tone,
  initial,
  className = "h-10 w-10 text-base",
}: {
  site: Site
  tone: string
  initial: string
  /* 默认是站点卡片的大圆标；「最近使用」那种紧凑列表可以传小号尺寸 */
  className?: string
}) {
  const [step, setStep] = useState(0)
  const candidates: string[] = []
  if (site.icon) candidates.push(site.icon)
  try {
    const host = new URL(site.url).hostname
    if (host) {
      candidates.push(`https://${host}/favicon.ico`)
      candidates.push(`https://www.google.com/s2/favicons?domain=${host}&sz=64`)
    }
  } catch {
    /* 链接本身有问题就只剩首字母兜底 */
  }
  const src = step < candidates.length ? candidates[step] : null
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ${className} ${tone}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          onError={() => setStep((s) => s + 1)}
          className="h-6 w-6 rounded-md object-contain"
        />
      ) : (
        initial
      )}
    </span>
  )
}

export function SiteCard({
  site,
  index,
  editing,
  favorited,
  heatCount,
  dragged,
  dropOver,
  markMode,
  marked,
  onToggleMark,
  onBeginDrag,
  onRemove,
  onToggleFavorite,
  onOpen,
  onEdit,
  solo,
}: {
  site: Site
  index: number
  editing: boolean
  favorited: boolean
  /* 真实打开过的次数；攒够 3 次挂小火苗 */
  heatCount: number
  /* 就是这张卡正被拖着 */
  dragged: boolean
  /* 拖拽中的鼠标正悬在这张卡上（它会被让出位置） */
  dropOver: boolean
  /* 「一键打开」挑名单模式：这点卡片=勾/取消勾，不打开也不开编辑窗 */
  markMode: boolean
  /* 这张卡已勾进「一键打开」名单（右上角冒小书签） */
  marked: boolean
  onToggleMark: (site: Site) => void
  /* 编辑模式下按住卡片挪动一下 = 开始拖（由页面接管后续跟踪与落点；连起点坐标一起交出去） */
  onBeginDrag: (site: Site, x: number, y: number) => void
  onRemove: (site: Site) => void
  onToggleFavorite: (id: string) => void
  /* 卡片被点开时上报一笔，「最近使用」列表靠这个记账 */
  onOpen: (site: Site) => void
  /* 管理模式下点卡片 = 打开编辑窗口 */
  onEdit: (site: Site) => void
  /* 这张卡是刚新添加的：飞入动画下单独飞入登场一次 */
  solo: boolean
}) {
  const tone = AVATAR_TONES[index % AVATAR_TONES.length]
  const initial = site.name.trim().charAt(0).toUpperCase()
  /* 拖动发生过一次之后，紧随其后的"点击"不算编辑——不然挪完位置弹窗会误开 */
  const suppressClick = useRef(false)

  const beginDragGesture = (e: React.PointerEvent) => {
    /* 挑名单模式里不兴拖——点一下就是勾/取消勾，别把卡片拖走 */
    if (!editing || markMode || e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    const cleanup = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    /* 挪出 8 个像素才算"拖"，只按一下还是点开编辑 */
    const onMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return
      cleanup()
      suppressClick.current = true
      onBeginDrag(site, ev.clientX, ev.clientY)
    }
    const onUp = () => cleanup()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const faceClass = `flex w-full items-center gap-3 rounded-2xl border border-primary/10 bg-card/85 p-3 pr-11 text-left shadow-md ring-1 ring-primary/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
    /* 拖走时原位整张藏起来，看着就是"这张卡正跟着鼠标走" */
    dragged ? "opacity-0" : ""
  } ${dropOver ? "border-dashed border-primary ring-2 ring-primary" : ""}`

  /* 卡片脸面：平时是跳转链接，管理模式下变成可拖可点的编辑入口 */
  const faceInner = (
    <>
      <SiteFavicon site={site} tone={tone} initial={initial} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{site.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {site.url.replace(/^https?:\/\//, "")}
        </span>
      </span>
      {editing ? <Pencil className="h-3.5 w-3.5 shrink-0 text-primary/50" /> : null}
    </>
  )

  /* 飞入动画的起点：这张卡自己摇一个方向，平时（没选飞入动画）毫无作用 */
  const flyStyle = useMemo(flyVars, [])

  return (
    <div
      className={`${solo ? "intro-solo" : "intro-site"} group relative`}
      style={flyStyle}
      /* 落点识别标记：页面拖拽时靠这个属性知道鼠标正悬在哪张卡上 */
      data-site-card={site.id}
    >
      {/* 勾进「一键打开」名单的：右上角一颗小书签，和小火苗同款角落徽章 */}
      {marked ? (
        <span
          title="已加入「一键打开」名单"
          className="absolute -right-1.5 -top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-background"
        >
          <Bookmark className="h-3 w-3 fill-current" />
        </span>
      ) : null}
      {/* 点得多了冒一朵小火苗：次数越多说明越常用 */}
      {heatCount >= 3 ? (
        <span
          title={`已经打开过 ${heatCount} 次`}
          className="absolute -left-1.5 -top-1.5 z-10 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow"
        >
          <Flame className="h-2.5 w-2.5" />
          {heatCount}
        </span>
      ) : null}
      {editing ? (
        <button
          type="button"
          onPointerDown={beginDragGesture}
          onClick={() => {
            if (markMode) {
              onToggleMark(site)
              return
            }
            if (suppressClick.current) {
              suppressClick.current = false
              return
            }
            onEdit(site)
          }}
          title={
            markMode
              ? `点一下把「${site.name}」加进／移出「一键打开」名单`
              : `点编辑「${site.name}」，按住挪动可拖到想要的位置`
          }
          /* touch-none：手机上按住卡片能拖动，而不是把页面划走 */
          className={`${markMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} touch-none ${faceClass}`}
        >
          {faceInner}
        </button>
      ) : (
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            /* 挑名单模式：点卡片是勾/取消勾，不是打开网页 */
            if (markMode) {
              e.preventDefault()
              onToggleMark(site)
              return
            }
            onOpen(site)
          }}
          draggable={false}
          className={faceClass}
        >
          {faceInner}
        </a>
      )}

      {/* 爱心常显：收藏着的永远亮着粉；但只有更改模式里才点得动，平时浏览不让误点 */}
      <button
        type="button"
        aria-label={favorited ? `取消收藏 ${site.name}` : `收藏 ${site.name}`}
        aria-pressed={favorited}
        disabled={!editing}
        title={editing ? (favorited ? "点一下取消收藏" : "点一下收进收藏") : "进「更改设置」才能收藏或取消收藏"}
        onClick={() => onToggleFavorite(site.id)}
        /* 手机没有"鼠标移到卡片上"这回事：小屏上爱心常显 */
        className={`absolute right-2.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          editing ? "cursor-pointer hover:bg-primary/10" : "cursor-default"
        } ${
          favorited
            ? "text-primary opacity-100"
            : "text-primary/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      {/* 管理模式下每张卡片右上角都挂一个垃圾桶，点一下删掉；挑名单模式先收起（和书签挤同一个角） */}
      {editing && !markMode ? (
        <button
          type="button"
          aria-label={`删除 ${site.name}`}
          onClick={() => onRemove(site)}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
