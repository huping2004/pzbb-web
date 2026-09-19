import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"

/* 深夜模式开关：平时是太阳，点一下变月亮、全站切深夜配色，再点回来。
   默认贴在网页最右边；更改设置模式下可以用手拖着放到任意位置（存的是屏幕坐标）。 */

const LS_DARK = "navhub.dark"
const LS_DARK_POS = "navhub.dark.pos"

type Pos = { x: number; y: number }

function readDark(): boolean {
  try {
    return window.localStorage.getItem(LS_DARK) === '"1"'
  } catch {
    return false
  }
}

function readPos(): Pos | null {
  try {
    const raw = window.localStorage.getItem(LS_DARK_POS)
    if (!raw) return null
    const p = JSON.parse(raw) as Pos
    if (typeof p?.x === "number" && typeof p?.y === "number") return p
    return null
  } catch {
    return null
  }
}

/* 没拖过就贴页面最右上角；拖过就把坐标收进屏幕范围内 */
function defaultPos(): Pos {
  return { x: window.innerWidth - 64, y: 16 }
}

function clampPos(p: Pos): Pos {
  const size = 48
  return {
    x: Math.min(Math.max(p.x, 4), Math.max(4, window.innerWidth - size - 4)),
    y: Math.min(Math.max(p.y, 4), Math.max(4, window.innerHeight - size - 4)),
  }
}

export function DarkToggle({ editing }: { editing: boolean }) {
  const [dark, setDark] = useState(readDark)
  const [pos, setPos] = useState<Pos>(() => (readPos() ? clampPos(readPos() as Pos) : defaultPos()))
  /* 拖动结束会顺带触发一次点击，得吞掉，不然拖完位置又顺手切换了配色 */
  const suppressClick = useRef(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      if (dark) window.localStorage.setItem(LS_DARK, '"1"')
      else window.localStorage.removeItem(LS_DARK)
    } catch {
      /* 存不下也先切着看 */
    }
  }, [dark])

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!editing || e.button !== 0) return
      /* 拖的过程中用闭包变量记最新位置，松手那一下才存进本地 */
      let latest = pos
      const move = (ev: PointerEvent) => {
        ev.preventDefault()
        suppressClick.current = true
        latest = clampPos({ x: ev.clientX - 24, y: ev.clientY - 24 })
        setPos(latest)
      }
      const up = () => {
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        try {
          window.localStorage.setItem(LS_DARK_POS, JSON.stringify(latest))
        } catch {
          /* 存不进就这次记住、下次回到默认位 */
        }
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
    },
    [editing, pos],
  )

  return (
    <button
      type="button"
      aria-label={dark ? "切回白天配色" : "换成深夜配色"}
      aria-pressed={dark}
      onPointerDown={startDrag}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false
          return
        }
        setDark((v) => !v)
      }}
      title={editing ? "按住可以拖到任意位置" : dark ? "点一下换回白天" : "点一下换深夜"}
      className={`fixed z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-card/85 text-primary shadow-lg ring-1 ring-primary/30 backdrop-blur-md transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        editing ? "cursor-grab touch-none active:cursor-grabbing" : ""
      }`}
      style={{ left: pos.x, top: pos.y }}
    >
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  )
}
