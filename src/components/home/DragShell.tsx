import { useRef } from "react"
import type { ReactNode } from "react"

/* 编辑模式下把一个现成的小组件变成"按住挪 8 个像素就开始拖"：
   只点一下不触发拖、也不影响组件原来的点击（拖完会吞掉紧跟的那一下点击） */
export function DragShell({
  editing,
  onBegin,
  children,
  className,
}: {
  editing: boolean
  onBegin: (x: number, y: number) => void
  children: ReactNode
  className?: string
}) {
  const suppressClick = useRef(false)

  const handleDown = (e: React.PointerEvent) => {
    if (!editing || e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    const cleanup = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    const onMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return
      cleanup()
      suppressClick.current = true
      onBegin(ev.clientX, ev.clientY)
    }
    const onUp = () => cleanup()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div
      className={`${className ?? ""} ${editing ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
      onPointerDown={handleDown}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          suppressClick.current = false
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {children}
    </div>
  )
}
