import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function parts(d: Date): { time: string; date: string } {
  return {
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    date: `${d.getMonth() + 1}月${d.getDate()}日 · 周${WEEKDAYS[d.getDay()]}`,
  }
}

/* 和天气同款的小胶囊：时钟 + 今天的日期星期，一秒一跳 */
export function NestClock() {
  const [now, setNow] = useState(() => parts(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(parts(new Date())), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card/85 px-4 py-2 text-sm font-medium text-card-foreground shadow-md ring-1 ring-primary/20 backdrop-blur-md">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-bold text-primary-foreground">{now.time}</span>
      <span className="text-xs text-muted-foreground">{now.date}</span>
    </span>
  )
}
