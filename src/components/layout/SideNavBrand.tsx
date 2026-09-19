import { ChevronLeft } from "lucide-react"
import { PetalIcon } from "@/components/home/DecorIcons"
import { useSiteTitle } from "@/pages/Home/useHome"

/* 侧栏顶部的品牌区：粉色小图标 + 站名 + 一句副标题，就是原来顶栏左边那一块 */
export function SideNavBrand({ onCollapse }: { onCollapse: () => void }) {
  const title = useSiteTitle()
  return (
    <div className="flex items-center gap-3">
      <span className="soft-bob flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-1 ring-primary/30">
        <PetalIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-base font-bold tracking-tight text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          收藏的小站点，都在这儿等你回来
        </p>
      </div>
      <button
        type="button"
        onClick={onCollapse}
        aria-label="收起导航栏"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-foreground transition-colors duration-300 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  )
}