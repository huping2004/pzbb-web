import { useState } from "react"
import { Check, Copy, Info } from "lucide-react"

/* 浏览器拦弹窗的放行指引：一次点开出多个网页必被浏览器拦（防广告），
   放行一次后就永久正常。按用户实际用的浏览器给对应做法 + 可复制的设置地址 */

type BrowserKind = "chrome" | "edge" | "firefox" | "safari" | "other"

function browserKind(): BrowserKind {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return "edge"
  if (/Firefox\//.test(ua)) return "firefox"
  // QQ/360/UC 等国产浏览器都基于 Chrome 内核，chrome:// 开头的设置地址同样能用
  if (/Chrome\//.test(ua)) return "chrome"
  if (/Safari\//.test(ua)) return "safari"
  return "other"
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* 老浏览器兜底：借一个临时输入框复制 */
    try {
      const box = document.createElement("textarea")
      box.value = text
      document.body.appendChild(box)
      box.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(box)
      return ok
    } catch {
      return false
    }
  }
}

function CopyRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2">
      <span className="shrink-0 text-xs font-medium text-primary-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate text-xs font-semibold text-primary">{text}</code>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(text)) {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          }
        }}
        aria-label={`复制${label}`}
        className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "好了" : "复制"}
      </button>
    </div>
  )
}

export function PopupHelpDialog({
  origin,
  onClose,
  onDismiss,
}: {
  origin: string
  onClose: () => void
  onDismiss: () => void
}) {
  const kind = browserKind()

  const settingsUrl =
    kind === "edge" ? "edge://settings/content/popups" : "chrome://settings/content/popups"

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-foreground/25 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          <Info className="h-5 w-5 text-primary" />
          让浏览器放行这个网站的弹窗
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          一次点开出多个网页会被浏览器当成广告拦下来。只需要放行一次，以后
          「一键打开」就次次全开。照下面任选一种做就行：
        </p>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-card-foreground">
          <p>
            <span className="font-bold text-primary">方法一（最快）：</span>
            被拦的瞬间，浏览器地址栏的右端会冒出一个
            <span className="font-semibold"> 带红叉的小方块图标</span>
            ——点它，在弹出条里选「
            {kind === "firefox" ? "设置" : "Always"} / 始终显示
            {kind === "firefox" ? "" : "该网站的弹出窗口"}
            」，然后回到这里再按一次「一键打开」。
          </p>

          {kind === "firefox" ? (
            <p>
              <span className="font-bold text-primary">方法二：</span>
              点浏览器菜单（右上角三条横线）→「设置」→ 左侧「隐私与安全」→
              找到「拦截弹出窗口」→ 点右边「例外…」→ 把下面这个网址粘进去 →
              点「允许」→「保存更改」。
            </p>
          ) : kind === "safari" ? (
            <p>
              <span className="font-bold text-primary">方法二：</span>
              点屏幕最上面苹果旁的「Safari 浏览器」→「设置…」→「网站」→
              左侧「弹出式窗口」→ 在右侧列表找到下面这个网址 → 改成「允许」。
            </p>
          ) : (
            <p>
              <span className="font-bold text-primary">方法二（图标没出现就用这个）：</span>
              复制下面第一条地址，粘贴到浏览器地址栏按回车打开设置页 → 在「允许」一栏点「添加」→
              把第二条网址粘进去保存 → 回这里再按一次「一键打开」。
            </p>
          )}

          {kind === "firefox" || kind === "safari" ? (
            <CopyRow label="本站网址" text={origin} />
          ) : (
            <>
              <CopyRow label="设置页地址" text={settingsUrl} />
              <CopyRow label="要添加的网址" text={origin} />
            </>
          )}
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            知道了，我去设置
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full text-center text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            不再显示这个教程
          </button>
        </div>
      </div>
    </div>
  )
}
