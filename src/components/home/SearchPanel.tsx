import { useEffect, useRef, useState } from "react"
import { ChevronDown, Clock, ImagePlus, Search, X } from "lucide-react"
import type { ClipboardEvent, FormEvent } from "react"
import type { SearchHistoryItem } from "@/pages/Home/useHome"
import { Button } from "@/components/ui/button"
import { SiteFavicon } from "@/components/home/SiteCard"
import type { EngineId, Site } from "@/pages/Home/useHome"

/* 从网址里取出域名，显示在候选行右边 */
function hitHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

/* 引擎 id 对应的人话名：历史记录行上标"当时用哪家搜的" */
const ENGINE_LABELS: Record<EngineId, string> = {
  bing: "必应",
  google: "Google",
  "google-img": "Google搜图",
  yandex: "Yandex",
  baidu: "百度",
}

/* 记录时间说成人话：一小时内=刚刚，今天内=今天，再往上按天数报 */
function histWhen(at: number): string {
  const d = Date.now() - at
  if (d < 60 * 60 * 1000) return "刚刚"
  if (d < 24 * 60 * 60 * 1000) return "今天"
  const days = Math.floor(d / (24 * 60 * 60 * 1000))
  return days >= 30 ? "很久以前" : `${days} 天前`
}

/* 常用档平时就露必应，其余引擎收进「更多」：点了才摊开，收起时也不丢已选的那个 */
const BASE_ENGINES: { id: EngineId; label: string }[] = [{ id: "bing", label: "必应" }]
const MORE_ENGINES: { id: EngineId; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "google-img", label: "Google搜图" },
  { id: "yandex", label: "Yandex" },
  { id: "baidu", label: "百度" },
]

export function SearchPanel({
  query,
  onQuery,
  engine,
  onEngine,
  onSearch,
  siteHits,
  onOpenHit,
  onDismissHits,
  sug,
  onPickSug,
  searchHistory,
  onPickHistory,
  onRemoveHistory,
  onClearHistory,
}: {
  query: string
  onQuery: (v: string) => void
  engine: EngineId
  onEngine: (v: EngineId) => void
  onSearch: () => void
  /* 输入时匹配到的自己的网站（回车直接开第一个，点哪行开哪行） */
  siteHits: Site[]
  onOpenHit: (site: Site) => void
  /* Esc 收起候选，本次输入改走普通搜索 */
  onDismissHits: () => void
  /* 当前引擎的联想词（打字歇下来后悄悄去要来的） */
  sug: string[]
  /* 点联想词：直接按这个词搜索 */
  onPickSug: (word: string) => void
  /* 最近搜索记录（满 30 天自动清） */
  searchHistory: SearchHistoryItem[]
  /* 点历史记录：填回输入框并按这个词搜 */
  onPickHistory: (word: string) => void
  /* 删掉某条搜索记录 */
  onRemoveHistory: (word: string) => void
  /* 一键清空搜索记录 */
  onClearHistory: () => void
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  /* 「最近搜索」浮层的开关；点浮层外面也收 */
  const [histOpen, setHistOpen] = useState(false)
  const histRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!histOpen) return
    const onDocDown = (ev: globalThis.MouseEvent) => {
      if (histRef.current && !histRef.current.contains(ev.target as Node)) setHistOpen(false)
    }
    document.addEventListener("mousedown", onDocDown)
    return () => document.removeEventListener("mousedown", onDocDown)
  }, [histOpen])
  /* Google搜图专用：直接 Ctrl+V 粘进来的图片（只在本地预览，不上传） */
  const [pastedImg, setPastedImg] = useState<{ url: string; name: string } | null>(null)

  useEffect(
    () => () => {
      if (pastedImg) URL.revokeObjectURL(pastedImg.url)
    },
    [pastedImg],
  )

  /* 换成别的引擎时，粘的图就作废，免得下次误触 */
  useEffect(() => {
    if (engine !== "google-img" && pastedImg) {
      URL.revokeObjectURL(pastedImg.url)
      setPastedImg(null)
    }
  }, [engine, pastedImg])

  const dropPasted = () => {
    if (pastedImg) URL.revokeObjectURL(pastedImg.url)
    setPastedImg(null)
  }

  const handlePaste = (ev: ClipboardEvent<HTMLTextAreaElement>) => {
    if (engine !== "google-img") return
    const file = Array.from(ev.clipboardData.files).find((f) => f.type.startsWith("image/"))
    if (!file) return
    /* 拦下这次粘贴：别让浏览器往输入框里塞乱七八糟的文本，改收进图片预览 */
    ev.preventDefault()
    if (pastedImg) URL.revokeObjectURL(pastedImg.url)
    setPastedImg({ url: URL.createObjectURL(file), name: file.name || "粘贴的图片" })
  }

  /* 搜索去向：粘了图 → 去谷歌搜图页面完成搜图；文字是图片网址 → 谷歌直接读图；其余按关键词搜 */
  const trySearch = () => {
    if (engine === "google-img" && pastedImg) {
      window.open("https://www.google.com/imghp?hl=zh-CN", "_blank", "noopener,noreferrer")
      return
    }
    onSearch()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    trySearch()
  }
  /* 收起状态下如果用的是折叠里的引擎，「更多」按钮就顶上它的名字，让人知道现在在用哪个 */
  const hiddenActive = MORE_ENGINES.find((item) => item.id === engine)
  const toggleLabel = !moreOpen && hiddenActive ? hiddenActive.label : "更多"

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
      active
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-primary-foreground"
    }`

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      {/* 引擎选择和搜索按钮还待在原来那一行：引擎靠左、按钮靠右，位置没动。
          relative + ref：「最近搜索」的浮层挂在这一行的下沿外侧 */}
      {/* z-50：这一行自带毛玻璃（会把自己的浮层锁在行内层级），不整行抬升的话
          最近搜索浮层会被 DOM 在后面的搜索框本体盖住 */}
      <div
        ref={histRef}
        className="relative z-50 flex items-center gap-2 rounded-full bg-card/85 p-2 shadow-lg ring-1 ring-primary/20 backdrop-blur-md"
      >
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-primary/10 p-1">
          {BASE_ENGINES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onEngine(item.id)}
              className={chipClass(engine === item.id)}
            >
              {item.label}
            </button>
          ))}

          {/* 折叠引擎：展开才出现；选完就自动收起，不占着搜索栏 */}
          {moreOpen
            ? MORE_ENGINES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onEngine(item.id)
                    setMoreOpen(false)
                  }}
                  className={chipClass(engine === item.id)}
                >
                  {item.label}
                </button>
              ))
            : null}

          {/* 「更多 / 收起」开关：收起时若藏着当前引擎，按钮文案跟着换成引擎名 */}
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={chipClass(Boolean(hiddenActive) && !moreOpen)}
          >
            <span className="inline-flex items-center gap-1">
              {toggleLabel}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
        </div>

        {/* 「最近搜索」：小钟表按钮，点开浮层看搜过的词（满 30 天自动清） */}
        <button
          type="button"
          aria-label="最近搜索"
          aria-expanded={histOpen}
          title="最近搜索"
          onClick={() => setHistOpen((v) => !v)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            histOpen
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <Clock className="h-4 w-4" />
        </button>

        <span className="min-w-0 flex-1" />
        <Button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-6 text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Search className="mr-1.5 h-4 w-4" />
          搜索
        </Button>

        {/* 最近搜索浮层：挂在引擎行下沿外侧，从上往下排；
            最多露 10 行（每行 40px），多了浮层里滚轮往下翻 */}
        {histOpen ? (
          <div className="animate-in fade-in-0 slide-in-from-top-1 absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-card/95 shadow-xl ring-1 ring-primary/25 backdrop-blur-md duration-150">
            <p className="flex items-center justify-between border-b border-primary/10 px-4 py-2 text-[11px] font-medium text-muted-foreground">
              <span>最近搜索（只保留 30 天）</span>
              <span className="flex items-center gap-1.5">
                {searchHistory.length > 0 ? (
                  <button
                    type="button"
                    /* mousedown 触发：省得先把焦点甩到别处 */
                    onMouseDown={(ev) => {
                      ev.preventDefault()
                      onClearHistory()
                    }}
                    className="rounded-full px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    清空
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="关闭最近搜索"
                  onMouseDown={(ev) => {
                    ev.preventDefault()
                    setHistOpen(false)
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </p>
            {searchHistory.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                还没有搜索记录，搜过的词会按时间顺序排在这里。
              </p>
            ) : (
              <ul className="max-h-[25rem] overflow-y-auto overscroll-contain py-1">
                {searchHistory.map((item) => (
                  <li key={item.q} className="group/row relative">
                    <button
                      type="button"
                      /* mousedown 就出发：省得输入框先失焦引起布局抖动 */
                      onMouseDown={(ev) => {
                        ev.preventDefault()
                        setHistOpen(false)
                        onPickHistory(item.q)
                      }}
                      className="flex h-10 w-full items-center gap-2.5 pl-4 pr-11 text-left transition-colors hover:bg-primary/10"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                      <span className="min-w-0 flex-1 truncate text-sm text-card-foreground">
                        {item.q}
                      </span>
                      {item.engine ? (
                        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {ENGINE_LABELS[item.engine] ?? ""}
                        </span>
                      ) : null}
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {histWhen(item.at)}
                      </span>
                    </button>
                    {/* 行上小叉：只删这一条（平时淡淡不抢戏，悬停/点按变粉） */}
                    <button
                      type="button"
                      aria-label={`删除记录「${item.q}」`}
                      title="删除这条记录"
                      onMouseDown={(ev) => {
                        ev.preventDefault()
                        onRemoveHistory(item.q)
                      }}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      {/* 搜索框本体搬下来放大：一大块输入区，点进去打字、回车就出发 */}
      <div className="relative rounded-3xl bg-card/85 shadow-lg ring-1 ring-primary/20 backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-primary">
        {/* 用多行输入框：字打到边框就自动换行显示，不再横向顶出去；回车照旧直接搜 */}
        <textarea
          value={query}
          onChange={(ev) => onQuery(ev.target.value)}
          onPaste={handlePaste}
          onKeyDown={(ev) => {
            if (ev.key === "Escape" && (siteHits.length > 0 || sug.length > 0)) {
              ev.preventDefault()
              onDismissHits()
              return
            }
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault()
              trySearch()
            }
          }}
          placeholder={
            engine === "google-img"
              ? "搜点什么吧；想按图搜，直接 Ctrl+V 粘图片进来"
              : "搜点什么吧，回车就出发"
          }
          aria-label="搜索关键词"
          rows={2}
          className="h-24 w-full resize-none rounded-3xl bg-transparent px-6 pt-4 text-xl leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none sm:h-28"
        />

        {/* Google搜图专属底部条：粘过的图在这里露个小头像，没粘时给一句提示 */}
        {engine === "google-img" ? (
          <div className="flex items-center gap-3 px-6 pb-4">
            {pastedImg ? (
              <>
                <img
                  src={pastedImg.url}
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-primary/30"
                />
                <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
                  已贴好图片（就在你电脑本地，没上传）。点「搜索」跳到谷歌搜图，在那里点相机图标再粘一次就开始找同款。
                </p>
                <button
                  type="button"
                  onClick={dropPasted}
                  aria-label="移除已贴的图片"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <ImagePlus className="h-3.5 w-3.5 shrink-0 text-primary" />
                按图搜两种玩法：直接 Ctrl+V 粘贴图片；或把图片的网址粘进来，点搜索谷歌直接帮你找同款。
              </p>
            )}
          </div>
        ) : null}

        {/* 候选浮层：绝对定位挂在输入框下沿外侧，浮在页面最上面——
            出不出候选、出多少，页面布局纹丝不动，绝不再撑开拉伸 */}
        {siteHits.length > 0 || sug.length > 0 ? (
          <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-2xl bg-card/95 shadow-xl ring-1 ring-primary/25 backdrop-blur-md">
            {siteHits.length > 0 ? (
              <ul className="pt-1">
                {siteHits.map((site) => (
                  <li key={site.id}>
                    <button
                      type="button"
                      /* mousedown 就出发：省得输入框先失焦引起布局抖动 */
                      onMouseDown={(ev) => {
                        ev.preventDefault()
                        onOpenHit(site)
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-primary/10"
                    >
                      <SiteFavicon
                        site={site}
                        tone="bg-primary/15 text-primary-foreground ring-primary/20"
                        initial={site.name.trim().charAt(0).toUpperCase()}
                        className="h-8 w-8 text-sm"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-card-foreground">
                        {site.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{hitHost(site.url)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {siteHits.length > 0 && sug.length > 0 ? (
              <p className="border-t border-primary/10 px-4 pb-0.5 pt-2 text-[11px] font-medium text-muted-foreground">
                联想词
              </p>
            ) : null}
            {sug.length > 0 ? (
              <ul className={siteHits.length > 0 ? "pb-1" : "pt-1"}>
                {sug.map((word) => (
                  <li key={word}>
                    <button
                      type="button"
                      /* mousedown 就出发：省得输入框先失焦引起布局抖动 */
                      onMouseDown={(ev) => {
                        ev.preventDefault()
                        onPickSug(word)
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-primary/10"
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span className="min-w-0 flex-1 truncate text-sm text-card-foreground">{word}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="border-t border-primary/10 px-4 py-1.5 text-[11px] text-muted-foreground">
              {siteHits.length > 0 ? `回车直接打开「${siteHits[0].name}」；` : ""}
              点联想词直接按那个词搜；按 Esc 收起
            </p>
          </div>
        ) : null}
      </div>
    </form>
  )
}
