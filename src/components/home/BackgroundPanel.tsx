import { ImagePlus, Palette, RotateCcw, Trash2 } from "lucide-react"
import type { ChangeEvent } from "react"
import { backgroundClass } from "@/components/home/BackgroundLayer"
import { StarIcon } from "@/components/home/DecorIcons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BACKGROUNDS } from "@/pages/Home/useHome"

/* 主题色色板：点一下就换掉全站粉色元素的主色。
   色值用 色调/饱和/明暗 三个数描述（而不是颜色字面量），用时再拼出来 */
const THEME_SWATCHES: { name: string; h: number; s: number; l: number }[] = [
  { name: "樱花粉", h: 344, s: 100, l: 76 },
  { name: "玫瑰红", h: 349, s: 100, l: 71 },
  { name: "珊瑚橙", h: 22, s: 100, l: 71 },
  { name: "奶油黄", h: 42, s: 100, l: 70 },
  { name: "薄荷绿", h: 150, s: 55, l: 67 },
  { name: "青碧", h: 172, s: 57, l: 59 },
  { name: "海蓝", h: 216, s: 100, l: 68 },
  { name: "靛蓝", h: 233, s: 100, l: 71 },
  { name: "葡萄紫", h: 262, s: 100, l: 74 },
  { name: "丁香", h: 285, s: 100, l: 81 },
  { name: "奶茶", h: 30, s: 48, l: 65 },
  { name: "石墨", h: 228, s: 11, l: 60 },
]

/* 三个数 → 系统调色盘认的六位色码（取色器初始值与选中比对都要它） */
function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  const to255 = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0")
  return `#${to255(f(0))}${to255(f(8))}${to255(f(4))}`
}

/* 没选过主题色时，取色器默认停在色板第一个上 */
const FIRST_SWATCH = THEME_SWATCHES[0]

export function BackgroundPanel({
  open,
  onOpenChange,
  bgId,
  customUrl,
  onSelect,
  onUpload,
  onClearCustom,
  notice,
  themeHex,
  onThemeColor,
  onThemeReset,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  bgId: string
  customUrl: string | null
  onSelect: (id: string) => void
  onUpload: (file: File) => void
  onClearCustom: () => void
  notice: string
  themeHex: string | null
  onThemeColor: (hex: string) => void
  onThemeReset: () => void
}) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <StarIcon className="h-4 w-4 text-primary" />
            换背景与主题色
          </DialogTitle>
          <DialogDescription>
            挑一套内置背景或上传喜欢的图片；再配一个主题色——全站粉色元素会整片跟着换。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => onSelect(bg.id)}
              className={`relative rounded-2xl p-3 text-left shadow-md ring-2 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${backgroundClass(
                bg.id,
              )} ${bgId === bg.id ? "ring-primary" : "ring-transparent"}`}
            >
              <span className="block text-sm font-bold text-foreground">{bg.name}</span>
              <span className="block text-xs text-muted-foreground">{bg.desc}</span>
              {bgId === bg.id ? (
                <StarIcon className="absolute right-3 top-3 h-4 w-4 text-primary" />
              ) : null}
            </button>
          ))}

          {customUrl ? (
            <button
              type="button"
              onClick={() => onSelect("custom")}
              className={`relative overflow-hidden rounded-2xl p-3 text-left shadow-md ring-2 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-primary ${
                bgId === "custom" ? "ring-primary" : "ring-transparent"
              }`}
            >
              <span
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${customUrl})` }}
              />
              <span className="absolute inset-0 bg-background/60" />
              <span className="relative block text-sm font-bold text-foreground">我的图片</span>
              <span className="relative block text-xs text-muted-foreground">上传的那张图</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex-1">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <span className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary/40 px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary/10">
              <ImagePlus className="h-4 w-4" />
              上传本地图片做背景
            </span>
          </label>
          {customUrl ? (
            <Button
              variant="ghost"
              onClick={onClearCustom}
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              移除
            </Button>
          ) : null}
        </div>

        {/* 调色盘：色板 + 系统自由取色 + 一键回默认粉 */}
        <div className="border-t border-primary/15 pt-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Palette className="h-4 w-4 text-primary" />
            主题色
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            按钮、图标、光斑这些粉色元素会整片换色，换好就记住。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {THEME_SWATCHES.map((c) => {
              const hex = hslToHex(c.h, c.s, c.l)
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={`主题色：${c.name}`}
                  onClick={() => onThemeColor(hex)}
                  className={`h-8 w-8 rounded-full shadow-inner ring-2 ring-background transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    themeHex?.toLowerCase() === hex ? "scale-110 ring-foreground/60" : ""
                  }`}
                  style={{ backgroundColor: `hsl(${c.h} ${c.s}% ${c.l}%)` }}
                />
              )
            })}

            {/* 系统调色盘：什么颜色都能挑 */}
            <label
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/40 transition-transform duration-300 hover:scale-110"
              title="随便挑一个颜色"
            >
              <input
                type="color"
                defaultValue={themeHex ?? hslToHex(FIRST_SWATCH.h, FIRST_SWATCH.s, FIRST_SWATCH.l)}
                onChange={(ev: ChangeEvent<HTMLInputElement>) => onThemeColor(ev.target.value)}
                className="sr-only"
                aria-label="自由挑选主题色"
              />
              <Palette className="h-4 w-4 text-primary" />
            </label>

            {themeHex ? (
              <Button
                variant="ghost"
                onClick={onThemeReset}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                回到默认粉
              </Button>
            ) : null}
          </div>
        </div>

        {notice ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{notice}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}