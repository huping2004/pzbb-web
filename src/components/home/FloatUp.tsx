import type { CSSProperties } from "react"
import { BubbleIcon, HeartIcon, NoteIcon, StarIcon } from "@/components/home/DecorIcons"
import "./sakura.css"

type Floater = {
  left: string
  delay: string
  duration: string
  size: string
  tone: string
  drift: string
  spin: string
  kind: "heart" | "star" | "note" | "bubble"
}

const ICONS = {
  heart: HeartIcon,
  star: StarIcon,
  note: NoteIcon,
  bubble: BubbleIcon,
} as const

/* 从页面底部缓缓升起的小爱心 / 星星 / 音符 / 小气泡，和飘落的樱花瓣一上一下呼应 */
const FLOATERS: Floater[] = [
  { left: "5%", delay: "0s", duration: "22s", size: "h-4 w-4", tone: "text-primary/35", drift: "4vw", spin: "26deg", kind: "heart" },
  { left: "15%", delay: "4.5s", duration: "26s", size: "h-3 w-3", tone: "text-primary/25", drift: "-3vw", spin: "-18deg", kind: "star" },
  { left: "26%", delay: "9s", duration: "24s", size: "h-5 w-5", tone: "text-primary/20", drift: "5vw", spin: "30deg", kind: "bubble" },
  { left: "37%", delay: "2s", duration: "28s", size: "h-3 w-3", tone: "text-primary/30", drift: "-4vw", spin: "-24deg", kind: "note" },
  { left: "48%", delay: "12s", duration: "23s", size: "h-4 w-4", tone: "text-primary/25", drift: "3vw", spin: "20deg", kind: "heart" },
  { left: "60%", delay: "6.5s", duration: "27s", size: "h-3 w-3", tone: "text-primary/30", drift: "-5vw", spin: "-28deg", kind: "star" },
  { left: "71%", delay: "13s", duration: "25s", size: "h-5 w-5", tone: "text-primary/20", drift: "4vw", spin: "22deg", kind: "note" },
  { left: "81%", delay: "8s", duration: "29s", size: "h-3 w-3", tone: "text-primary/25", drift: "-3vw", spin: "-20deg", kind: "bubble" },
  { left: "90%", delay: "11s", duration: "24s", size: "h-4 w-4", tone: "text-primary/30", drift: "4vw", spin: "26deg", kind: "heart" },
  { left: "96%", delay: "5.5s", duration: "27s", size: "h-3 w-3", tone: "text-primary/25", drift: "-4vw", spin: "-22deg", kind: "star" },
]

export function FloatUp() {
  return (
    <div aria-hidden className="absolute inset-0">
      {FLOATERS.map((floater, i) => {
        const Icon = ICONS[floater.kind]
        return (
          <span
            key={i}
            className={`float-up select-none ${floater.size} ${floater.tone}`}
            style={
              {
                left: floater.left,
                animationDelay: floater.delay,
                animationDuration: floater.duration,
                "--float-drift": floater.drift,
                "--float-spin": floater.spin,
              } as CSSProperties
            }
          >
            <Icon className="h-full w-full" />
          </span>
        )
      })}
    </div>
  )
}