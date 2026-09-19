import { useEffect, useRef, useState } from "react"
import { ImagePlus, Pencil, X } from "lucide-react"
import { readSmallIcon } from "@/components/home/siteIconFile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Site } from "@/pages/Home/useHome"

/* 管理模式下点卡片弹出的编辑窗口：改个名、换个网址，分组和位置不动 */
export function EditSiteForm({
  open,
  onOpenChange,
  site,
  onEdit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /* 正在编辑的那张卡片；null 时窗口是关着的 */
  site: Site | null
  /* icon：undefined=没动图标；空串=撤掉图标；其余=新图标 */
  onEdit: (site: Site, name: string, url: string, icon?: string) => boolean
}) {
  const [displayName, setDisplayName] = useState("")
  const [urlText, setUrlText] = useState("")
  const [errMsg, setErrMsg] = useState("")
  /* null=这次没动图标；空串=撤掉图标；dataURL=换上新图标 */
  const [iconDraft, setIconDraft] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  /* 每次打开都从当前卡片回填，改一半关掉再点开不会残留上一次的输入 */
  useEffect(() => {
    if (open && site) {
      setDisplayName(site.name)
      setUrlText(site.url)
      setErrMsg("")
      setIconDraft(null)
    }
  }, [open, site])

  const pickIcon = async (file: File | undefined) => {
    if (!file) return
    const small = await readSmallIcon(file)
    if (small) setIconDraft(small)
  }

  /* 预览用的图标：这次选了新的就用新的，否则沿用卡片现有的 */
  const shownIcon = iconDraft !== null && iconDraft !== "" ? iconDraft : (site?.icon ?? "")

  const handleSubmit = () => {
    if (!site) return
    const ok = onEdit(site, displayName, urlText, iconDraft ?? undefined)
    if (!ok) {
      setErrMsg("名称和网址都要填上哦")
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Pencil className="h-4 w-4 text-primary" />
            编辑这个网站
          </DialogTitle>
          <DialogDescription>
            名字和网址都能改，改完卡片立刻变，还待在原来的分组里。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="edit-site-name">
              网站名称
            </label>
            <Input
              id="edit-site-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例如：我的云笔记"
              className="rounded-xl border-primary/25 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="edit-site-url">
              网址
            </label>
            <Input
              id="edit-site-url"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="例如：www.notion.so"
              className="rounded-xl border-primary/25 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">小图标</span>
            {shownIcon ? (
              <div className="flex items-center gap-3">
                <img
                  src={shownIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 rounded-xl object-contain ring-1 ring-primary/30"
                />
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                  {iconDraft ? "换成这张新图了。" : "现在是这张；想换成自己的图点下面按钮。"}
                </p>
                <button
                  type="button"
                  onClick={() => setIconDraft("")}
                  aria-label="撤掉小图标，回到自动识别"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ImagePlus className="h-3.5 w-3.5 text-primary" />
                上传一张小图标
              </button>
            )}
            {shownIcon ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                换一张
              </button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void pickIcon(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </div>

          {errMsg ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{errMsg}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-muted-foreground hover:text-primary-foreground"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            保存修改
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
