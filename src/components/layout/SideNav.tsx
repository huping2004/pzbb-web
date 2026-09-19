import { useState } from "react"
import { Archive, Home, Palette, Settings, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { StarIcon } from "@/components/home/DecorIcons"
import { BackupDialog } from "@/components/layout/BackupDialog"
import { SideNavBrand } from "@/components/layout/SideNavBrand"
import { SideNavItem } from "@/components/layout/SideNavItem"

/* 侧栏里的页面清单：现在只有 Home 一页，以后长出来的新页面往这里排 */
const NAV_ITEMS: { id: string; label: string; hint: string; path: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", hint: "小站点收藏夹", path: "/", icon: Home },
  { id: "trash", label: "回收站", hint: "找回删掉的网站", path: "/trash", icon: Trash2 },
]

export function SideNav() {
  const [pinned, setPinned] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  /* 刚点完「更改设置」时鼠标还压在侧栏上，先按住不让它展开，等鼠标离开左边缘再恢复"靠近才滑出" */
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  /* 「更改设置」走地址上的 edit=1：点一下回主页并让卡片露出垃圾桶，再点一下收工 */
  const editing = new URLSearchParams(search).get("edit") === "1"
  const goSettings = () => {
    setDismissed(true)
    setPinned(false)
    navigate(editing ? "/" : "/?edit=1")
  }
  /* 换背景走地址上的 bg=1：主页读到它就弹出背景面板；保留 edit 等其它参数不丢 */
  const openBgPanel = () => {
    setDismissed(true)
    setPinned(false)
    const next = new URLSearchParams(search)
    next.set("bg", "1")
    navigate({ pathname, search: next.toString() })
  }

  return (
    <div
      className="group fixed left-0 top-0 z-50 h-full w-8"
      onMouseLeave={() => setDismissed(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDismissed(false)
      }}
    >
      {/* 平时只留一条极细的粉色小把手：鼠标扫到左边缘，整栏向右滑出来 */}
      <span className="pointer-events-none absolute left-0 top-1/2 h-14 w-1.5 -translate-y-1/2 rounded-r-full bg-primary/40 transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0" />

      {/* 点一下也能开合：触屏和键盘用户不走"鼠标靠近"那套 */}
      <button
        type="button"
        aria-label={pinned ? "收起导航栏" : "展开导航栏"}
        onClick={() => setPinned((v) => !v)}
        className="absolute left-0 top-1/2 h-24 w-8 -translate-y-1/2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />

      <div
        className={`absolute left-0 top-0 flex h-full w-72 flex-col rounded-r-3xl bg-card/90 p-5 shadow-2xl ring-1 ring-primary/15 backdrop-blur-md transition-transform duration-500 ease-out motion-reduce:transition-none ${
          pinned
            ? "translate-x-0"
            : dismissed
              ? "-translate-x-full"
              : "-translate-x-full group-hover:translate-x-0 group-focus-within:translate-x-0"
        }`}
      >
        <SideNavBrand onCollapse={() => setPinned(false)} />

        <nav aria-label="站点导航" className="mt-6 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <SideNavItem
              key={item.id}
              label={item.label}
              hint={item.hint}
              path={item.path}
              active={item.path === pathname}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <StarIcon className="soft-twinkle h-3.5 w-3.5 text-primary" />
            更多小站点正在赶来
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            以后添的新页面，都会排在上面，从这儿一滑就到。
          </p>
        </div>

        {/* 设置入口上面是换背景：点了回主页并把背景面板弹出来 */}
        <button
          type="button"
          onClick={openBgPanel}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-card/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Palette className="h-4 w-4" />
          换背景
        </button>

        {/* 设置入口：回主页并把每张卡片的垃圾桶亮出来，再点一下收工 */}
        <button
          type="button"
          onClick={goSettings}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Settings className="h-4 w-4" />
          {editing ? "完成" : "更改设置"}
        </button>

        {/* 最底下是备份与恢复：导出/导回这台浏览器里的所有存档 */}
        <button
          type="button"
          onClick={() => setBackupOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-card/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Archive className="h-4 w-4" />
          备份与恢复
        </button>
      </div>

      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
    </div>
  )
}