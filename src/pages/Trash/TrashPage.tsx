import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { BackgroundLayer } from "@/components/home/BackgroundLayer"
import { HeartIcon, StarIcon } from "@/components/home/DecorIcons"
import { TrashSection } from "@/components/home/TrashSection"
import { useTrash } from "@/pages/Trash/useTrash"

export function TrashPage(p: ReturnType<typeof useTrash>) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <BackgroundLayer bgId={p.bgId} customUrl={p.customBgUrl} onImageError={p.handleBgImageError} />

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-10 sm:px-6">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <span className="text-primary">回收站</span>
              <StarIcon className="kira-pop h-6 w-6 text-primary/40" />
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              在「更改设置」里删掉的网站都先住在这里——点「找回」就回到原来的分组，收藏过的回来还在收藏栏；
              真不需要了就「彻底删」或一键清空。
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card/85 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm backdrop-blur-md transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              回主页
            </Link>
          </div>

          <TrashSection
            trash={p.trash}
            onRestore={p.restoreSite}
            onPurge={p.purgeTrash}
            onClear={p.clearTrash}
          />

          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <HeartIcon className="h-3.5 w-3.5 text-primary/50" />
            找回一个就少一个，回收站只留还没拿走的。
          </p>
        </section>
      </main>
    </div>
  )
}
