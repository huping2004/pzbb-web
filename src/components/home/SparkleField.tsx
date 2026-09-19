import { StarIcon } from "@/components/home/DecorIcons"
import "./sakura.css"

/* 小星星：轻轻一明一暗地眨 */
const TWINKLES = [
  { left: "7%", top: "16%", size: "h-5 w-5", delay: "0s", tone: "text-primary/40" },
  { left: "17%", top: "42%", size: "h-3 w-3", delay: "1.1s", tone: "text-primary/30" },
  { left: "28%", top: "9%", size: "h-4 w-4", delay: "2.2s", tone: "text-primary/35" },
  { left: "34%", top: "34%", size: "h-3 w-3", delay: "3.6s", tone: "text-primary/25" },
  { left: "39%", top: "30%", size: "h-3 w-3", delay: "0.5s", tone: "text-primary/25" },
  { left: "46%", top: "58%", size: "h-4 w-4", delay: "1.4s", tone: "text-primary/20" },
  { left: "52%", top: "12%", size: "h-6 w-6", delay: "1.7s", tone: "text-primary/25" },
  { left: "63%", top: "38%", size: "h-3 w-3", delay: "2.8s", tone: "text-primary/35" },
  { left: "69%", top: "62%", size: "h-4 w-4", delay: "4.1s", tone: "text-primary/20" },
  { left: "74%", top: "18%", size: "h-5 w-5", delay: "0.9s", tone: "text-primary/30" },
  { left: "79%", top: "30%", size: "h-3 w-3", delay: "3.2s", tone: "text-primary/25" },
  { left: "83%", top: "46%", size: "h-4 w-4", delay: "2.1s", tone: "text-primary/25" },
  { left: "91%", top: "22%", size: "h-3 w-3", delay: "3.3s", tone: "text-primary/40" },
  { left: "95%", top: "52%", size: "h-3 w-3", delay: "1.9s", tone: "text-primary/30" },
]

/* 大颗 kira 闪光：慢慢放大旋转一圈，二次元的分镜感 */
const KIRAS = [
  { left: "9%", top: "28%", size: "h-9 w-9", delay: "0s", tone: "text-primary/25" },
  { left: "21%", top: "56%", size: "h-7 w-7", delay: "3.4s", tone: "text-primary/20" },
  { left: "44%", top: "16%", size: "h-8 w-8", delay: "1.6s", tone: "text-primary/20" },
  { left: "67%", top: "8%", size: "h-7 w-7", delay: "4.6s", tone: "text-primary/20" },
  { left: "88%", top: "60%", size: "h-9 w-9", delay: "2.4s", tone: "text-primary/25" },
]

export function SparkleField() {
  return (
    <div aria-hidden className="absolute inset-0">
      {TWINKLES.map((twinkle, i) => (
        <span
          key={`twinkle-${i}`}
          className={`soft-twinkle absolute select-none ${twinkle.size} ${twinkle.tone}`}
          style={{ left: twinkle.left, top: twinkle.top, animationDelay: twinkle.delay }}
        >
          <StarIcon className="h-full w-full" />
        </span>
      ))}

      {KIRAS.map((kira, i) => (
        <span
          key={`kira-${i}`}
          className={`kira-pop absolute select-none ${kira.size} ${kira.tone}`}
          style={{ left: kira.left, top: kira.top, animationDelay: kira.delay }}
        >
          <StarIcon className="h-full w-full" />
        </span>
      ))}
    </div>
  )
}