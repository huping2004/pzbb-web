import type { CSSProperties } from "react"
import { PetalIcon } from "@/components/home/DecorIcons"
import "./sakura.css"

type Petal = {
  left: string
  delay: string
  duration: string
  size: string
  tone: string
  drift: string
}

const PETALS: Petal[] = [
  { left: "4%", delay: "0s", duration: "15s", size: "h-4 w-4", tone: "text-primary/45", drift: "4vw" },
  { left: "9%", delay: "2.4s", duration: "18s", size: "h-3 w-3", tone: "text-primary/30", drift: "-3vw" },
  { left: "13%", delay: "5.1s", duration: "16s", size: "h-5 w-5", tone: "text-primary/25", drift: "5vw" },
  { left: "18%", delay: "9.6s", duration: "19s", size: "h-3 w-3", tone: "text-primary/35", drift: "-4vw" },
  { left: "22%", delay: "1.2s", duration: "20s", size: "h-3 w-3", tone: "text-primary/40", drift: "-4vw" },
  { left: "27%", delay: "12.3s", duration: "17s", size: "h-4 w-4", tone: "text-primary/30", drift: "3vw" },
  { left: "31%", delay: "7.5s", duration: "17s", size: "h-4 w-4", tone: "text-primary/30", drift: "3vw" },
  { left: "36%", delay: "3.6s", duration: "21s", size: "h-6 w-6", tone: "text-primary/20", drift: "-5vw" },
  { left: "41%", delay: "10.8s", duration: "18s", size: "h-3 w-3", tone: "text-primary/35", drift: "4vw" },
  { left: "45%", delay: "6.3s", duration: "15s", size: "h-5 w-5", tone: "text-primary/25", drift: "5vw" },
  { left: "49%", delay: "14.2s", duration: "20s", size: "h-4 w-4", tone: "text-primary/25", drift: "-4vw" },
  { left: "54%", delay: "2.1s", duration: "19s", size: "h-5 w-5", tone: "text-primary/30", drift: "-3vw" },
  { left: "58%", delay: "9.2s", duration: "16s", size: "h-3 w-3", tone: "text-primary/45", drift: "4vw" },
  { left: "63%", delay: "6.3s", duration: "15s", size: "h-5 w-5", tone: "text-primary/25", drift: "5vw" },
  { left: "72%", delay: "0.8s", duration: "19s", size: "h-4 w-4", tone: "text-primary/30", drift: "-3vw" },
  { left: "76%", delay: "4.2s", duration: "18s", size: "h-3 w-3", tone: "text-primary/40", drift: "-4vw" },
  { left: "81%", delay: "11.6s", duration: "17s", size: "h-3 w-3", tone: "text-primary/30", drift: "4vw" },
  { left: "85%", delay: "8.4s", duration: "20s", size: "h-4 w-4", tone: "text-primary/30", drift: "3vw" },
  { left: "89%", delay: "13.4s", duration: "16s", size: "h-4 w-4", tone: "text-primary/25", drift: "-5vw" },
  { left: "93%", delay: "11s", duration: "17s", size: "h-3 w-3", tone: "text-primary/25", drift: "-4vw" },
  { left: "97%", delay: "3.3s", duration: "18s", size: "h-4 w-4", tone: "text-primary/35", drift: "3vw" },
]

export function SakuraFall({ density }: { density: "soft" | "full" }) {
  const petals = density === "full" ? PETALS : PETALS.filter((_, i) => i % 2 === 0)

  return (
    <div aria-hidden className="absolute inset-0">
      {petals.map((petal, i) => (
        <span
          key={i}
          className={`petal-fall select-none ${petal.size} ${petal.tone}`}
          style={
            {
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              "--petal-drift": petal.drift,
            } as CSSProperties
          }
        >
          <PetalIcon className="h-full w-full" />
        </span>
      ))}
    </div>
  )
}