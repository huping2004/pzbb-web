import { useEffect, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { StarIcon } from "@/components/home/DecorIcons"
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
import { GROUPS } from "@/pages/Home/useHome"

export function AddSiteForm({
  open,
  onOpenChange,
  defaultGroup,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /* 从哪个分类旁边的「添加」点进来，就预置哪个分类 */
  defaultGroup: string
  onAdd: (siteName: string, url: string, group: string, icon?: string) => boolean
}) {
  const [displayName, setDisplayName] = useState("")
  const [urlText, setUrlText] = useState("")
  const [groupSel, setGroupSel] = useState(defaultGroup)
  const [errMsg, setErrMsg] = useState("")
  /* 自己传的小图标（已压成小图）：不传就走自动识别 */
  const [iconDraft, setIconDraft] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickIcon = async (file: File | undefined) => {
    if (!file) return
    const small = await readSmallIcon(file)
    if (small) setIconDraft(small)
  }

  /* 每次打开都跟着进来的那个分类走 */
  useEffect(() => {
    if (open) setGroupSel(defaultGroup)
  }, [open, defaultGroup])

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      setDisplayName("")
      setUrlText("")
      setErrMsg("")
      setIconDraft(null)
    }
  }

  const handleSubmit = () => {
    const ok = onAdd(displayName, urlText, groupSel, iconDraft ?? undefined)
    if (!ok) {
      setErrMsg("名称和网址都要填上哦")
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <StarIcon className="h-4 w-4 text-primary" />
            添加我的网站
          </DialogTitle>
          <DialogDescription>
            填好名字和网址，卡片就会出现在你的分组里，只存这台电脑。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="site-name">
              网站名称
            </label>
            <Input
              id="site-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例如：我的云笔记"
              className="rounded-xl border-primary/25 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="site-url">
              网址
            </label>
            <Input
              id="site-url"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="例如：www.notion.so"
              className="rounded-xl border-primary/25 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              小图标（可不填）
            </span>
            {iconDraft ? (
              <div className="flex items-center gap-3">
                <img
                  src={iconDraft}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 rounded-xl object-contain ring-1 ring-primary/30"
                />
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                  就用这张了，不想要可以撤掉。
                </p>
                <button
                  type="button"
                  onClick={() => setIconDraft(null)}
                  aria-label="撤掉已选的小图标"
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

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="site-group"
            >
              放进哪个分组
            </label>
            <select
              id="site-group"
              value={groupSel}
              onChange={(e) => setGroupSel(e.target.value)}
              className="w-full rounded-xl border border-primary/25 bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* 收藏栏也能直接收个人网址：它没有原分组，取消收藏即删除 */}
              <option value="fav">收藏栏（取消收藏即删除）</option>
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {errMsg ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{errMsg}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="rounded-full text-muted-foreground hover:text-primary-foreground"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            添加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}