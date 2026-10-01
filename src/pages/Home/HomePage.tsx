import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Bookmark, Pencil, Plus } from "lucide-react"
import { INTRO_EVENT, flyVars } from "@/lib/intro"
import { AddSiteForm } from "@/components/home/AddSiteForm"
import { BackgroundLayer } from "@/components/home/BackgroundLayer"
import { BackgroundPanel } from "@/components/home/BackgroundPanel"
import { HeartIcon, NoteIcon, StarIcon } from "@/components/home/DecorIcons"
import { DragShell } from "@/components/home/DragShell"
import { DarkToggle } from "@/components/layout/DarkToggle"
import { PopupHelpDialog } from "@/components/home/PopupHelpDialog"
import { EditSiteForm } from "@/components/home/EditSiteForm"
import { HomeFooter } from "@/components/home/HomeFooter"
import { HomeStatusCard } from "@/components/home/HomeStatusCard"
import { NestClock } from "@/components/home/NestClock"
import { RecentPanel } from "@/components/home/RecentPanel"
import { SearchPanel } from "@/components/home/SearchPanel"
import { SiteGroupSection } from "@/components/home/SiteGroupSection"
import { WeatherCard } from "@/components/home/WeatherCard"
import { useHome } from "@/pages/Home/useHome"
import type { ModId, Site } from "@/pages/Home/useHome"

/* 编辑模式下正被拖着走的东西：网站卡片，或者时间/天气的小胶囊 */
type DragThing = { kind: "site"; site: Site } | { kind: "mod"; mod: ModId }

export function HomePage(p: ReturnType<typeof useHome>) {
  /* 编辑模式里大站名旁边冒小铅笔，点了就地改名 */
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  /* 「一键打开」自选清单的选择模式：点收藏栏齿轮开启，
     开着时点任意卡片 = 把它加进/移出名单，再点齿轮退出 */
  const [pickMode, setPickMode] = useState(false)
  /* 正在拖的卡片/胶囊：编辑模式下按住挪一下触发（浏览器自带的拖放换位置换栏不稳，
     改成自己盯指针位置——拖到哪都跟手，还能跨栏拖进拖出收藏栏） */
  const [dragThing, setDragThing] = useState<DragThing | null>(null)
  /* 拖拽中鼠标正悬着的卡片（亮虚线圈给落点当提示） */
  const [overSiteId, setOverSiteId] = useState<string | null>(null)
  /* 松手瞬间要落去哪：哪一栏、哪张卡的位置 */
  const dropTarget = useRef<{ groupId: string; siteId: string | null } | null>(null)
  /* 拖拽中鼠标的最新位置：胶囊松手时就按这里落下 */
  const lastPos = useRef({ x: 0, y: 0 })
  /* 起手拖胶囊时鼠标压在胶囊里的哪：松手按这个偏移把胶囊"捏着放回去" */
  const modGrab = useRef({ dx: 40, dy: 16 })
  /* 跟着鼠标飞的那张小卡片预览（直接改位置属性，不给页面添渲染负担） */
  const ghostRef = useRef<HTMLDivElement>(null)
  /* 开始拖那一刻鼠标在哪：起手的瞬间就按这里定好落点，省得"一拖就停手"落空 */
  const dragFrom = useRef({ x: 0, y: 0 })
  /* 「常用网站」大标题的飞入起点（各摇各的方向；calm 档：标题不翻滚不绕圈） */
  const headFly = useMemo(() => flyVars({ calm: true }), [])

  /* 启动动画·飞入的收尾与彩排：
     - 开场由页面第一帧的脚本挂上标记（见 index.html），这里管整场演完后摘掉；
     - 导航栏里切换启动动画时广播过来：选飞入就当场重演一遍，
       选默认就把挂着的标记摘干净 */
  useEffect(() => {
    const root = document.documentElement
    let timer = 0
    const finish = () => {
      root.classList.remove("intro-fly")
    }
    /* 逐块实测下落起点（--ui-drop）：抬到「自己离屏幕顶沿的距离+身高+一点余量」，
       起势正好贴着顶沿外，一启动就看得见在落——背景定场的尾巴上模块已经入画，
       不会再有空窗。旧版死板抬一整屏，前大半程都在画面外空飞，看起来就是
       背景演完后僵了零点几秒。必须在没有开场标记（没有位移）时量，故先摘后量再挂 */
    const measureIntroDrop = () => {
      document.querySelectorAll<HTMLElement>("[data-intro-ui]").forEach((el) => {
        const r = el.getBoundingClientRect()
        if (el.dataset.introUi === "up") {
          /* 页脚反过来：起点贴着屏幕底沿外，从下往上托回位置 */
          const rise = Math.max(window.innerHeight - r.top + 10, r.height + 20)
          el.style.setProperty("--ui-rise", `${rise.toFixed(0)}px`)
          return
        }
        const drop = Math.max(r.top + r.height + 10, 24)
        el.style.setProperty("--ui-drop", `-${drop.toFixed(0)}px`)
      })
    }
    const play = () => {
      root.classList.remove("intro-fly")
      measureIntroDrop()
      /* 摘掉后强制一次排版，再挂上动画才会从头播放 */
      void root.offsetWidth
      root.classList.add("intro-fly")
      /* 9 秒=最晚一块的起飞（1.8+2.8 迟滞）+ 最长路程（3.5 秒封底）
         + 落位星光（0.65 秒）全部闪完，才摘开场标记 */
      timer = window.setTimeout(finish, 9000)
    }
    if (root.classList.contains("intro-fly")) play()
    const replay = (ev: Event) => {
      window.clearTimeout(timer)
      if ((ev as CustomEvent<string>).detail !== "flyin") {
        root.classList.remove("intro-fly")
        return
      }
      play()
    }
    window.addEventListener(INTRO_EVENT, replay)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(INTRO_EVENT, replay)
    }
  }, [])

  useEffect(() => {
    if (!dragThing) return
    /* 拖拽期间全站禁选中，别一拖就划出一片蓝 */
    document.body.style.userSelect = "none"
    /* 跟手预览一律用被拖东西的"复印本"——胶囊和网站卡片都整块跟着鼠标走，
       直接复印页面上那份现成的，不用重新画、也不会重新加载天气数据 */
    let faceClone: HTMLElement | null = null
    if (ghostRef.current) {
      const src =
        dragThing.kind === "mod"
          ? document
              .querySelector(`[data-mod-wrap="${dragThing.mod}"]`)
              ?.firstElementChild?.firstElementChild
          : document.querySelector(`[data-site-card="${dragThing.site.id}"]`)
      if (src) {
        faceClone = src.cloneNode(true) as HTMLElement
        faceClone.id = ""
        faceClone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"))
        /* 卡片平时靠格子撑宽度，复印后要自己站住这个宽 */
        faceClone.style.width = `${src.getBoundingClientRect().width}px`
        if (dragThing.kind === "mod") {
          /* 胶囊预览按"按住的那个点"对齐——和松手落点同一套算法，
             预览停在哪、松手就落在哪，不再出现预览和实际位置错位 */
          faceClone.style.transform = `translate(${-modGrab.current.dx}px, ${-modGrab.current.dy}px)`
        } else {
          /* 网站卡片落点是"插进格子"没有坐标对应，预览保持中心跟手即可 */
          faceClone.classList.add("-translate-x-1/2", "-translate-y-1/2")
        }
        ghostRef.current.appendChild(faceClone)
      }
    }
    const scan = (x: number, y: number) => {
      /* 预览小卡片跟手飞 */
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        /* 跟手预览只半透明，样子原样不动 */
        ghostRef.current.style.opacity = "0.8"
      }
      lastPos.current = { x, y }
      const el = document.elementFromPoint(x, y)
      const card = el?.closest?.("[data-site-card]") ?? null
      const zone = el?.closest?.("[data-site-group-zone]") ?? null
      const zoneId = zone?.getAttribute("data-site-group-zone")
      const cardId = card?.getAttribute("data-site-card")
      if (zoneId) {
        dropTarget.current = { groupId: zoneId, siteId: cardId ?? null }
        setOverSiteId(cardId ?? null)
      } else {
        dropTarget.current = null
        setOverSiteId(null)
      }
    }
    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      scan(e.clientX, e.clientY)
    }
    /* 起手瞬间先扫一次：拖出去一点就立刻停手也能落位 */
    scan(dragFrom.current.x, dragFrom.current.y)
    const finish = (apply: boolean) => {
      document.body.style.userSelect = ""
      const target = dropTarget.current
      dropTarget.current = null
      setDragThing(null)
      setOverSiteId(null)
      if (!apply) return
      if (dragThing.kind === "mod") {
        /* 胶囊落哪停哪（和深夜按钮同款）：鼠标位置 − 起手时捏住的偏移 = 新的左上角 */
        p.setModPos(dragThing.mod, {
          x: lastPos.current.x - modGrab.current.dx,
          y: lastPos.current.y - modGrab.current.dy,
        })
        return
      }
      if (!target) return
      /* 落在自己身上（或就是原来那张位置）就不折腾 */
      if (target.siteId && target.siteId === dragThing.site.id) return
      p.moveSite(dragThing.site, target.groupId, target.siteId)
    }
    const onUp = () => finish(true)
    const onCancel = () => finish(false)
    window.addEventListener("pointermove", onMove, { passive: false })
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    return () => {
      document.body.style.userSelect = ""
      faceClone?.remove()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
    }
  }, [dragThing, p.moveSite, p.setModPos])

  /* 拿起胶囊开拖：先记下鼠标压在胶囊的哪个位置，松手时按这个偏移摆到新地方 */
  const beginModDrag = (mod: ModId, x: number, y: number) => {
    const rect = document.querySelector(`[data-mod-wrap="${mod}"]`)?.getBoundingClientRect()
    modGrab.current = rect ? { dx: x - rect.left, dy: y - rect.top } : { dx: 40, dy: 16 }
    lastPos.current = { x, y }
    dragFrom.current = { x, y }
    setDragThing({ kind: "mod", mod })
  }

  const startTitleEdit = () => {
    setTitleDraft(p.siteTitle)
    setTitleEditing(true)
  }
  const saveTitle = () => {
    p.saveSiteTitle(titleDraft)
    setTitleEditing(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <BackgroundLayer
        bgId={p.bgId}
        customUrl={p.customBgUrl}
        onImageError={p.handleBgImageError}
      />

      {/* 顶栏整条撤了：「换背景」搬进左侧导航栏，页面顶部更干净；天气/时钟胶囊是悬浮件（挂在页面根上） */}
      {/* 显示面积拉宽：不再挤在窄窄一条里，两侧空旷的背景被用起来 */}
      <main className="relative z-10 mx-auto w-full max-w-screen-2xl flex-1 px-4 pb-20 pt-4 sm:px-8">
        <section className="animate-in fade-in slide-in-from-bottom-4 pt-10 duration-500 sm:pt-14">
          {/* 三栏：小窝状态贴最左、搜索卡居中、最近使用贴最右 */}
          <div
            data-intro-ui=""
            className="intro-ui grid items-stretch gap-8 lg:grid-cols-[16rem_minmax(0,1fr)_16rem]"
            /* 启动动画错峰值：三栏这块侧栏之后第二个登场 */
            style={{ "--ui-d": 0.12 } as CSSProperties}
          >
            <HomeStatusCard
              totalSites={p.totalSites}
              customCount={p.customCount}
              bgLabel={p.bgLabel}
            />

            {/* z-40：整张卡抬到普通内容之上——搜索候选浮层探出卡片下沿时，
                不会被下面「常用网站」等模块盖住（时间/天气胶囊、拖拽预览仍在更高层） */}
            <div className="relative z-40 rounded-3xl bg-card/85 p-6 shadow-md ring-1 ring-primary/15 backdrop-blur-md sm:p-8">
              {/* 装饰角标单独包一层裁剪：卡片本体不再剪溢出，搜索候选的浮层才能探出卡片下沿 */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden">
                <StarIcon className="kira-pop absolute -right-4 -top-4 h-20 w-20 text-primary/25" />
                <HeartIcon className="soft-bob absolute -bottom-3 -left-3 h-8 w-8 text-primary/30" />
                <NoteIcon className="soft-twinkle absolute right-10 top-8 hidden h-4 w-4 text-primary/30 sm:block" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-primary/20">
                <StarIcon className="h-3.5 w-3.5" />
                今天也从这里出发
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {!p.editing ? (
                  <span className="text-primary">{p.siteTitle}</span>
                ) : titleEditing ? (
                  /* 就地改站名：回车或点别处保存，Esc 不保存 */
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle()
                      if (e.key === "Escape") setTitleEditing(false)
                    }}
                    aria-label="修改站名"
                    className="w-full max-w-xl rounded-xl bg-primary/10 px-2 py-1 text-3xl font-bold tracking-tight text-primary ring-2 ring-primary outline-none sm:text-4xl"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startTitleEdit}
                    title="点这里改站名"
                    className="group/title -mx-2 inline-flex items-center gap-2 rounded-xl px-2 py-1 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {p.siteTitle}
                    <Pencil className="h-4 w-4 text-primary/50 transition-colors group-hover/title:text-primary" />
                  </button>
                )}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                常用网站一触即达，想搜什么换个引擎就搜，背景心情也能随时换一种。
              </p>
              <div className="mt-6">
                <SearchPanel
                  query={p.query}
                  onQuery={p.setQuery}
                  engine={p.engine}
                  onEngine={p.setEngine}
                  onSearch={p.runSearch}
                  siteHits={p.siteHits}
                  onOpenHit={(s: Site) => {
                    p.recordRecent(s)
                    window.open(s.url, "_blank", "noopener,noreferrer")
                  }}
                  onDismissHits={p.dismissSiteHits}
                  sug={p.sug}
                  onPickSug={(w: string) => {
                    /* 填进框里留个痕（下次回来还能看见搜了啥），然后立刻按这个词出发 */
                    p.setQuery(w)
                    p.runSearch(w)
                  }}
                  searchHistory={p.searchHistory}
                  onPickHistory={(w: string) => {
                    p.setQuery(w)
                    p.runSearch(w)
                  }}
                  onRemoveHistory={p.removeSearchHistory}
                  onClearHistory={p.clearSearchHistory}
                />
              </div>
            </div>

            <RecentPanel recent={p.recent} onOpen={p.recordRecent} />
          </div>
        </section>

        <section className="pt-14">
          <div className="intro-site relative mb-6" style={headFly}>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              常用网站
              <NoteIcon className="soft-twinkle h-5 w-5 text-primary/50" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {p.editing
                  ? "点任意卡片就能改名字、改网址、换小图标；按住卡片挪动就能拖——同栏换位置、跨栏搬家都行，拖进「收藏」就是收藏，从收藏栏拖出去就回到对应栏。时间和天气两个胶囊、右上角那个深夜模式圆形按钮，都能按住拖到页面任意角落，在哪松手就停在哪；拖乱了想全部放回原来的排法，去左边导航栏的「备份与恢复」点「恢复默认位置」就行。分类的名字（比如「AI智能」）点旁边的小铅笔也能随便改，顶上的大站名点一下也能改。每个分类右边的「添加」能往里添网站；想删就点卡片右上角的垃圾桶（删掉的会进左边导航栏的「回收站」，能找回），弄完点左边那栏的「完成」收工。"
                : "点卡片新标签打开；想收藏或取消收藏，进左侧「更改设置」，点卡片右边的爱心就行。手机电脑上一样好刷。"}
            </p>
          </div>

          {/* 选择模式开着时冒提示条：怎么勾、怎么退，一目了然 */}
          {pickMode ? (
            <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary ring-1 ring-primary/30">
              <Bookmark className="h-4 w-4 shrink-0" />
              选择模式：点任意卡片，把它加进／移出「一键打开」名单（勾中的卡片右上角会冒小书签），再点一次取消；弄好点右边的「退出」或者直接再点齿轮收工。
              <button
                type="button"
                onClick={() => setPickMode(false)}
                className="ml-auto shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                退出
              </button>
            </div>
          ) : null}

          {p.groups.map((group, gi) => (
            <SiteGroupSection
              key={group.id}
              groupId={group.id}
              markMode={pickMode}
              markedIds={p.openListIds}
              onToggleMark={(s: Site) => p.toggleOpenList(s.id)}
              onTogglePickMode={() => setPickMode((v) => !v)}
              firstSection={gi === 0}
              lastSection={gi === p.groups.length - 1}
              onMoveSection={p.moveGroupSection}
              title={group.title}
              sites={group.sites}
              editing={p.editing}
              favoriteIds={p.favoriteIds}
              onRemove={p.removeSite}
              onToggleFavorite={p.toggleFavorite}
              onAddSite={p.openAddSiteForm}
              onOpen={p.recordRecent}
              onEdit={p.openEditSite}
              heat={p.heat}
              draggedId={dragThing?.kind === "site" ? dragThing.site.id : null}
              overSiteId={overSiteId}
              onBeginDrag={(s: Site, x: number, y: number) => {
                dragFrom.current = { x, y }
                setDragThing({ kind: "site", site: s })
              }}
              onSaveTitle={p.saveGroupTitle}
              onOpenAllFavorites={p.openAllFavorites}
              solo={p.soloIds.includes(group.id)}
              soloSiteIds={p.soloIds}
              onRemoveGroup={p.removeGroup}
            />
          ))}

          {/* 更改模式下最下方冒「添加新分类栏」：点一下先立一根「新分类」空栏，
              点旁边小铅笔改名字，空栏随时能用右边小叉拆掉 */}
          {p.editing ? (
            <button
              type="button"
              onClick={p.addGroup}
              className="mb-10 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-4 text-sm font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="h-4 w-4" />
              添加新分类栏
            </button>
          ) : null}
        </section>
      </main>

      <HomeFooter customCount={p.customCount} />

      <AddSiteForm
        open={p.addSiteTarget !== null}
        onOpenChange={(v) => {
          if (!v) p.closeAddSiteForm()
        }}
        defaultGroup={p.addSiteTarget ?? "office"}
        /* 自己新建的分类栏也进「放进哪个分组」的下拉 */
        extraGroups={p.groups
          .filter((g: { id: string }) => g.id.startsWith("cg"))
          .map((g: { id: string; title: string }) => ({ id: g.id, title: g.title }))}
        onAdd={p.addCustomSite}
      />
      <EditSiteForm
        open={p.editTarget !== null}
        onOpenChange={(v) => {
          if (!v) p.closeEditSite()
        }}
        site={p.editTarget}
        onEdit={p.saveSiteEdit}
      />
      <BackgroundPanel
        open={p.bgPanelOpen}
        onOpenChange={p.setBgPanelOpen}
        bgId={p.bgId}
        customUrl={p.customBgUrl}
        onSelect={p.selectBackground}
        onUpload={p.applyCustomBackground}
        onClearCustom={p.clearCustomBackground}
        notice={p.bgNotice}
        themeHex={p.themeHex}
        onThemeColor={p.setThemeColor}
        onThemeReset={p.resetTheme}
      />

      {/* 拖拽时跟手的预览：被拖的卡片/模块原样复印、半透明，一看就是"手里正拿着它" */}
      {dragThing ? (
        <div
          ref={ghostRef}
          className="pointer-events-none fixed left-0 top-0 z-[120] opacity-0"
          style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
        >
          {/* 跟手预览在拖拽开始时复印被拖的卡片/模块挂进来（见上方 effect），这里不摆东西 */}
          {null}
        </div>
      ) : null}

      {/* 时间/天气胶囊独立悬浮在页面上，默认摆在右上角一带；
          编辑模式拖到哪停哪（和深夜按钮同款），位置记在本地 */}
      {(["weather", "clock"] as ModId[]).map((mod) => (
        <div
          key={mod}
          data-mod-wrap={mod}
          data-intro-ui=""
          className={`intro-ui fixed z-[105] transition-opacity ${
            /* 拖走时原位整个藏起来，看着就是"这块模块正跟着鼠标走" */
            dragThing?.kind === "mod" && dragThing.mod === mod ? "opacity-0" : ""
          }`}
          style={{ left: p.modPos[mod].x, top: p.modPos[mod].y, "--ui-d": 0.3 } as CSSProperties}
        >
          <DragShell editing={p.editing} onBegin={(x, y) => beginModDrag(mod, x, y)}>
            {mod === "weather" ? <WeatherCard /> : <NestClock />}
          </DragShell>
        </div>
      ))}

      {/* 一键打开被浏览器拦到时，弹分浏览器的放行教程（放行过一次以后就次次全开） */}
      {p.popupHelpOpen ? (
        <PopupHelpDialog
          origin={window.location.origin}
          onClose={p.closePopupHelp}
          onDismiss={p.dismissPopupHelp}
        />
      ) : null}

      {/* 深夜模式开关：平时贴页面最右上角，编辑模式可拖去任意位置 */}
      <DarkToggle editing={p.editing} />

      {/* 开场粉雾：只在飞入动画的起幕 1.4 秒里蒙屏散去，平时完全透明零存在 */}
      <div className="intro-mist" aria-hidden="true" />
    </div>
  )
}