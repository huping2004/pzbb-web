import { RotateCcw, Trash2, X } from "lucide-react"
import { HeartIcon } from "@/components/home/DecorIcons"
import type { TrashedEntry } from "@/pages/Home/useHome"

/* 回收站：删掉的网站都先落在这里，点「找回」原样回位；嫌碍眼可以彻底清掉 */
export function TrashSection({
  trash,
  onRestore,
  onPurge,
  onClear,
}: {
  trash: TrashedEntry[]
  onRestore: (id: string) => void
  onPurge: (id: string) => void
  onClear: () => void
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary-foreground shadow-sm ring-1 ring-primary/20">
          <Trash2 className="h-4 w-4" />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">回收站</h2>
        <span className="rounded-full bg-card/85 px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-sm ring-1 ring-primary/20 backdrop-blur-sm">
          {trash.length} 个
        </span>
        {trash.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3.5 w-3.5" />
            清空
          </button>
        ) : null}
        <span className="hidden h-px flex-1 border-t border-dashed border-primary/30 sm:block" />
        <HeartIcon className="soft-twinkle hidden h-4 w-4 shrink-0 text-primary/40 sm:block" />
      </div>

      {trash.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-primary/30 bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          回收站还没有东西——在「更改设置」里删掉的网站会先存到这里，随时能找回来。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {trash.map((entry) => (
            <li
              key={entry.site.id}
              className="flex items-center gap-3 rounded-2xl bg-card/85 px-4 py-3 shadow-sm ring-1 ring-primary/15 backdrop-blur-md"
            >
              {/* 回收的卡片没有图标链路，就统一用首字母圆标 */}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary-foreground ring-1 ring-primary/20">
                {entry.site.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{entry.site.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {entry.site.url} · {new Date(entry.deletedAt).toLocaleDateString("zh-CN")}删的
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRestore(entry.site.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-colors duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                找回
              </button>
              <button
                type="button"
                onClick={() => onPurge(entry.site.id)}
                aria-label={`把「${entry.site.name}」彻底删除`}
                className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Trash2 className="h-3.5 w-3.5" />
                彻底删
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
