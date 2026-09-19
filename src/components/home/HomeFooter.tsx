import { BubbleIcon, HeartIcon, NoteIcon, PetalIcon, StarIcon } from "@/components/home/DecorIcons"
import { useSiteTitle } from "@/pages/Home/useHome"

export function HomeFooter({ customCount }: { customCount: number }) {
  const title = useSiteTitle()
  return (
    <footer className="relative z-10 mt-auto border-t border-primary/15 bg-card/70 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PetalIcon className="h-4 w-4 text-primary" />
          {title}
          <PetalIcon className="h-4 w-4 text-primary/50" />
        </span>
        <p className="text-xs text-muted-foreground">
          收藏的网站和挑的背景都只留在这台浏览器里
          {customCount > 0 ? `，已经装进 ${customCount} 个自己加的网站` : ""}
        </p>
        <span className="flex items-center gap-2 text-primary/50">
          <StarIcon className="soft-twinkle h-3 w-3" />
          <HeartIcon className="h-3.5 w-3.5 text-primary/40" />
          <StarIcon className="h-4 w-4" />
          <NoteIcon className="h-3.5 w-3.5 text-primary/40" />
          <BubbleIcon className="h-3 w-3 text-primary/35" />
          <StarIcon className="soft-twinkle h-3 w-3" />
        </span>
      </div>
    </footer>
  )
}