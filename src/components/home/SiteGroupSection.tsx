import { useState } from "react"
import { Briefcase, ChevronDown, ChevronUp, Code, Newspaper, Pencil, Play, Plus, Rocket } from "lucide-react"
import type { ComponentType } from "react"
import { BubbleIcon, HeartIcon, NoteIcon, StarIcon } from "@/components/home/DecorIcons"
import { SiteCard } from "@/components/home/SiteCard"
import type { Site } from "@/pages/Home/useHome"

const GROUP_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  office: Briefcase,
  news: Newspaper,
  dev: Code,
  fun: Play,
  fav: HeartIcon,
}

/* 每个分组的标题行尾收一颗不同的小图案，二次元的小节奏 */
const GROUP_DECOR: Record<string, ComponentType<{ className?: string }>> = {
  office: StarIcon,
  news: BubbleIcon,
  dev: NoteIcon,
  fun: HeartIcon,
  fav: StarIcon,
}

export function SiteGroupSection({
  groupId,
  title,
  sites,
  editing,
  favoriteIds,
  onRemove,
  onToggleFavorite,
  onAddSite,
  onOpen,
  onEdit,
  heat,
  draggedId,
  overSiteId,
  onBeginDrag,
  onSaveTitle,
  onMoveSection,
  firstSection,
  lastSection,
  onOpenAllFavorites,
}: {
  groupId: string
  title: string
  sites: Site[]
  editing: boolean
  favoriteIds: string[]
  onRemove: (site: Site) => void
  onToggleFavorite: (id: string) => void
  onAddSite: (groupId: string) => void
  /* 卡片点开时上报，用于「最近使用」记录 */
  onOpen: (site: Site) => void
  /* 管理模式下点卡片打开编辑窗口 */
  onEdit: (site: Site) => void
  /* 各站点打开次数（小火苗用） */
  heat: Record<string, number>
  /* 正被拖着的卡片 id（没人在拖时 null） */
  draggedId: string | null
  /* 拖拽中的鼠标正悬停的卡片 id */
  overSiteId: string | null
  /* 按住卡片挪动时通知页面开始拖（带起手时的鼠标位置） */
  onBeginDrag: (site: Site, x: number, y: number) => void
  /* 编辑模式里就地改分栏名 */
  onSaveTitle: (groupId: string, title: string) => void
  /* 编辑模式里上/下挪一整栏 */
  onMoveSection: (groupId: string, dir: -1 | 1) => void
  /* 已经到顶/到底时对应方向的箭头变灰 */
  firstSection: boolean
  lastSection: boolean
  /* 收藏栏专属：一次打开全部收藏的网页 */
  onOpenAllFavorites: () => void
}) {
  const Icon = GROUP_ICONS[groupId] ?? Newspaper
  const Decor = GROUP_DECOR[groupId] ?? StarIcon
  /* 编辑模式下标题旁冒小铅笔，点了就地改名 */
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")

  const saveTitle = () => {
    onSaveTitle(groupId, titleDraft)
    setTitleEditing(false)
  }

  return (
    <section
      className="mb-10"
      /* 落点识别标记：拖拽时鼠标停在栏里任何位置（含标题、空栏）都算落进这一栏 */
      data-site-group-zone={groupId}
    >
      <div className="mb-4 flex items-center gap-3">
        {/* 编辑模式：名称左边挂上下小箭头，点一下整栏上移/下移 */}
        {editing ? (
          <span className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              aria-label={`把「${title}」这一栏上移`}
              disabled={firstSection}
              onClick={() => onMoveSection(groupId, -1)}
              className="rounded-lg bg-card/70 p-0.5 text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={`把「${title}」这一栏下移`}
              disabled={lastSection}
              onClick={() => onMoveSection(groupId, 1)}
              className="rounded-lg bg-card/70 p-0.5 text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : null}
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary-foreground shadow-sm ring-1 ring-primary/20">
          <Icon className="h-4 w-4" />
        </span>
        {!editing ? (
          <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        ) : titleEditing ? (
          /* 就地改分栏名：回车或点别处保存，Esc 不保存 */
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle()
              if (e.key === "Escape") setTitleEditing(false)
            }}
            aria-label={`修改「${title}」的名字`}
            className="w-44 rounded-xl bg-primary/10 px-2 py-0.5 text-xl font-bold tracking-tight text-primary ring-2 ring-primary outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(title)
              setTitleEditing(true)
            }}
            title="点这里改分栏名"
            className="group/gname -mx-1 inline-flex items-center gap-1.5 rounded-lg px-1 text-xl font-bold tracking-tight text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h2>{title}</h2>
            <Pencil className="h-3.5 w-3.5 text-primary/50 transition-colors group-hover/gname:text-primary" />
          </button>
        )}
        <span className="rounded-full bg-card/85 px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-sm ring-1 ring-primary/20 backdrop-blur-sm">
          {sites.length} 个站点
        </span>
        {/* 收藏栏专属：一键把全部收藏网页都打开；鼠标放上去冒小气泡说明 */}
        {groupId === "fav" && sites.length > 0 ? (
          <span className="group/openall relative flex shrink-0">
            <button
              type="button"
              onClick={onOpenAllFavorites}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Rocket className="h-3.5 w-3.5" />
              一键打开
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-2xl bg-card/95 px-3.5 py-2.5 text-xs leading-relaxed text-card-foreground opacity-0 shadow-xl ring-1 ring-primary/20 backdrop-blur-md transition-opacity duration-200 group-hover/openall:opacity-100"
            >
              点一下把收藏的网页全部打开。要是浏览器还拦，会自动弹出放行教程——设置一次，以后次次全开。
            </span>
          </span>
        ) : null}
        {/* 设置状态下每个分类旁边冒出一个「添加」，点它只往这一组里加；收藏栏也能加个人网址 */}
        {editing ? (
          <button
            type="button"
            onClick={() => onAddSite(groupId)}
            aria-label={`往「${title}」里添加网站`}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            添加
          </button>
        ) : null}
        <span className="hidden h-px flex-1 border-t border-dashed border-primary/30 sm:block" />
        <Decor className="soft-twinkle hidden h-4 w-4 shrink-0 text-primary/40 sm:block" />
      </div>

      {sites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-primary/30 bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          {groupId === "fav"
            ? editing
              ? "点上面的「添加」可以直接把个人网址收进收藏栏；也可以在别的栏里按住卡片拖进来"
              : "鼠标移到任意卡片上点爱心，喜欢的网站就会搬到这里"
            : editing
              ? "这一栏现在是空的——把别的栏里的卡片拖进来就能收到这里"
              : "这一组的站点都被收进收藏或删除了"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {sites.map((site, i) => (
            <SiteCard
              key={site.id}
              site={site}
              index={i}
              editing={editing}
              favorited={favoriteIds.includes(site.id)}
              heatCount={heat[site.id] ?? 0}
              dragged={draggedId === site.id}
              dropOver={overSiteId === site.id && draggedId !== site.id}
              onBeginDrag={onBeginDrag}
              onRemove={onRemove}
              onToggleFavorite={onToggleFavorite}
              onOpen={onOpen}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  )
}
