import { useCallback, useEffect, useRef, useState } from "react"
import { BookOfAnswers } from "@/components/home/BookOfAnswers"
import { HeartIcon, PawIcon } from "@/components/home/DecorIcons"

export function HomeStatusCard({
  totalSites,
  customCount,
  bgLabel,
}: {
  totalSites: number
  customCount: number
  bgLabel: string
}) {
  /* 世界线变动：翻一次答案，这张卡片自己故障抖一下 + 滚一行变动率文案。
     动画只挂在这张卡上（overflow-hidden 兜住抖动不出界），整页其它地方纹丝不动。 */
  const [shiftPct, setShiftPct] = useState<string | null>(null)
  const shiftTimer = useRef<number | null>(null)

  const startShift = useCallback(() => {
    if (shiftTimer.current) window.clearTimeout(shiftTimer.current)
    /* 变动率每次现编，0.00x% 到 2.99% 之间，中二一点 */
    setShiftPct((Math.random() * 2.99 + 0.01).toFixed(2))
    shiftTimer.current = window.setTimeout(() => setShiftPct(null), 1900)
  }, [])

  useEffect(
    () => () => {
      if (shiftTimer.current) window.clearTimeout(shiftTimer.current)
    },
    [],
  )

  return (
    <aside
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-card/85 p-5 shadow-md ring-1 ring-primary/15 backdrop-blur-md ${
        shiftPct ? "wl-glitch" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-foreground">小窝状态</h2>
        <span className="soft-bob flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <HeartIcon className="h-4 w-4" />
        </span>
      </div>

      {/* 卡片被压窄到固定宽度后，数字和标签都收小一号，三个小格排得下不挤字 */}
      <dl className="mt-4 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/15">
          <dt className="text-[11px] text-muted-foreground">站点</dt>
          <dd className="mt-0.5 text-xl font-bold text-primary">{totalSites}</dd>
        </div>
        <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/15">
          <dt className="text-[11px] text-muted-foreground">自己加的</dt>
          <dd className="mt-0.5 text-xl font-bold text-primary">{customCount}</dd>
        </div>
        <div className="rounded-xl bg-secondary p-2 ring-1 ring-primary/10">
          <dt className="text-[11px] text-muted-foreground">背景</dt>
          <dd className="mt-0.5 text-xs font-bold text-foreground">{bgLabel}</dd>
        </div>
      </dl>

      {/* 答案之书收进小窝：默念问题翻一页，一句话点给你；每翻一页触发一次世界线变动 */}
      <div className="mt-4">
        <BookOfAnswers onShift={startShift} />
      </div>

      <div className="mt-auto pt-5">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <PawIcon className="h-3.5 w-3.5 text-primary" />
            小提示
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            鼠标移到卡片上，点右边的爱心收进「收藏」；想添想删，点左边那栏底部的「更改设置」。
          </p>
        </div>
      </div>

      {/* 故障期间的扫描线纱 + 变动率文案，一闪而过 */}
      {shiftPct ? (
        <div className="wl-scan pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-3xl bg-background/45">
          <p className="wl-glitch-text rounded-full bg-primary px-4 py-1.5 text-xs font-semibold tracking-wide text-primary-foreground shadow-lg">
            世界线变动率 {shiftPct}%……
          </p>
          <p className="animate-in fade-in slide-in-from-bottom-1 [animation-delay:1000ms] text-[11px] text-muted-foreground">
            变动完成，新答案已接收
          </p>
        </div>
      ) : null}
    </aside>
  )
}
