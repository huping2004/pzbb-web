import type { CSSProperties } from "react"
import { BubbleIcon, HeartIcon, NoteIcon, PetalIcon, StarIcon } from "@/components/home/DecorIcons"
import { useSiteTitle } from "@/pages/Home/useHome"

/* 图标库新版不带 GitHub 品牌图标了，这里自己描一颗猫形小标（跟随文字颜色） */
function GithubMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

export function HomeFooter({ customCount }: { customCount: number }) {
  const title = useSiteTitle()
  return (
    <footer
      data-intro-ui="up"
      className="intro-ui intro-ui-up relative z-10 mt-auto border-t border-primary/15 bg-card/70 py-8 backdrop-blur"
      /* 启动动画错峰值：页脚排在内容之后收尾 */
      style={{ "--ui-d": 0.2 } as CSSProperties}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PetalIcon className="h-4 w-4 text-primary" />
          {title}
          <PetalIcon className="h-4 w-4 text-primary/50" />
          {/* 项目主页外链：github 图标 + 「项目地址」，点新标签打开 */}
          <a
            href="https://github.com/huping2004/pzbb-web"
            target="_blank"
            rel="noopener noreferrer"
            title="项目地址"
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <GithubMark className="h-4 w-4" />
            项目地址
          </a>
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