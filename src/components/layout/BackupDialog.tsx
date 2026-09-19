import { useRef, useState } from "react"
import { Download, RotateCcw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSiteTitle } from "@/pages/Home/useHome"

/* 备份 = 把这台浏览器里所有 navhub. 开头的存档原样抄一份存成文件；
   恢复 = 挑一个之前导出的文件，把里面的存档写回来再刷新页面 */

const LS_PREFIX = "navhub."

function collectBackup(): { exportedAt: string; data: Record<string, string> } {
  const data: Record<string, string> = {}
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key || !key.startsWith(LS_PREFIX)) continue
      const value = window.localStorage.getItem(key)
      if (value !== null) data[key] = value
    }
  } catch {
    /* 读不到就交空的，让下面的提示兜住 */
  }
  return { exportedAt: new Date().toISOString(), data }
}

export function BackupDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const title = useSiteTitle()
  const fileRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState("")

  const handleExport = () => {
    const backup = collectBackup()
    const keys = Object.keys(backup.data)
    if (keys.length === 0) {
      setNotice("这台浏览器里还没有可备份的内容")
      return
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}备份-${new Date().toLocaleDateString("zh-CN")}.json`
    a.click()
    URL.revokeObjectURL(url)
    setNotice(`已导出 ${keys.length} 份存档，把文件收好，换电脑再用它恢复。`)
  }

  /* 恢复默认位置：只抹掉时间/天气胶囊和深夜按钮三个拖拽位置的存档，
     刷新后它们回到出厂位置；网站、收藏、背景、站名等一概不碰 */
  const handleResetPos = () => {
    ;["navhub.pos.weather", "navhub.pos.clock", "navhub.dark.pos"].forEach((key) => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* 抹不掉就随它去，刷新后按各自默认位置摆 */
      }
    })
    window.location.reload()
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as { data?: Record<string, string> }
      const entries = Object.entries(parsed?.data ?? {}).filter(
        ([key, value]) => key.startsWith(LS_PREFIX) && typeof value === "string",
      )
      if (entries.length === 0) {
        setNotice("这个文件不像本站的备份文件，挑一个之前导出的「备份.json」再试")
        return
      }
      entries.forEach(([key, value]) => window.localStorage.setItem(key, value))
      /* 存档写完了整页重载一遍，所有地方直接读到新数据 */
      window.location.reload()
    } catch {
      setNotice("文件读不开，确认是这里导出的备份文件哦")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Download className="h-4 w-4 text-primary" />
            备份与恢复
          </DialogTitle>
          <DialogDescription>
            收藏的网站、挑的背景、站名、排序这些都只存在这台浏览器里。
            导出一份存档，换电脑或清了缓存还能原样搬回来。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Button
            onClick={handleExport}
            className="w-full justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Download className="mr-1.5 h-4 w-4" />
            导出备份文件
          </Button>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="w-full justify-center rounded-full border-primary/40 text-card-foreground hover:bg-primary/10 hover:text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Upload className="mr-1.5 h-4 w-4" />
            选择备份文件恢复
          </Button>
          {/* 只管“放回原位”：拖乱了想重来就点这个，其它存档原封不动 */}
          <Button
            variant="outline"
            onClick={handleResetPos}
            className="w-full justify-center rounded-full border-primary/40 text-card-foreground hover:bg-primary/10 hover:text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            恢复默认位置
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            只把时间、天气、深夜按钮放回最初的位置，其它内容一概不动。
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void handleImport(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          {notice ? (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-card-foreground">{notice}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
