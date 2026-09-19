import { Clock } from "lucide-react"
import { SiteFavicon } from "@/components/home/SiteCard"
import type { Site } from "@/pages/Home/useHome"

/* 小窝状态右边的「最近使用」：纵向列最近点开过的网站，点一下即开 */
export function RecentPanel({
  recent,
  onOpen,
}: {
  recent: Site[]
  onOpen: (site: Site) => void
}) {
  return (
    <aside className="flex h-full flex-col rounded-3xl bg-card/85 p-5 shadow-md ring-1 ring-primary/15 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          最近使用
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-foreground ring-1 ring-primary/20">
          {recent.length} 个
        </span>
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-3 py-6 text-center text-xs leading-relaxed text-muted-foreground">
          最近没打开过网站。点开任意网站就会记在这里，三天没用就自动清空。
        </p>
      ) : (
        /* 固定高度的滚动窗口：记录再多面板也不撑大（搜索栏、小窝栏都安稳不跟着长），
           新记录排最上面，旧的往下沉；鼠标滚轮在窗口里滑动就能翻到沉下去的旧记录 */
        <ul className="mt-3 h-64 shrink-0 space-y-1.5 overflow-y-auto overscroll-contain pr-0.5">
          {recent.map((site) => (
            <li key={site.id}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpen(site)}
                title={site.name}
                className="flex items-center gap-2 rounded-xl border border-primary/10 bg-card/70 px-2 py-1.5 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/10"
              >
                <SiteFavicon
                  site={site}
                  tone="bg-primary/15 text-primary-foreground ring-primary/20"
                  initial={site.name.trim().charAt(0).toUpperCase()}
                  className="h-8 w-8 text-sm"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {site.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-auto pt-3 text-[11px] leading-relaxed text-muted-foreground">
        同一个网站只记一次，最后打开的排最上面，三天没用自动清空；记录多了用鼠标滚轮往下翻。
      </p>
    </aside>
  )
}
