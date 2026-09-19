import { useCallback, useState } from "react"
import { readStored, writeStored } from "@/pages/Home/useHome"
import type { TrashedEntry } from "@/pages/Home/useHome"

/* 和首页共用同一批本地键：删是首页删的，这里是"捞回来"的地方 */
const LS_CUSTOM_SITES = "navhub.custom.sites"
const LS_HIDDEN_SITES = "navhub.hidden.sites"
const LS_TRASH = "navhub.trash"
const LS_BG = "navhub.bg"
const LS_BG_CUSTOM = "navhub.bg.custom"

export function useTrash() {
  const [trash, setTrash] = useState<TrashedEntry[]>(() => readStored<TrashedEntry[]>(LS_TRASH, []))
  /* 背景跟着首页选的那套走 */
  const [bgId, setBgIdState] = useState<string>(() => readStored<string>(LS_BG, "pastel"))
  const [customBgUrl] = useState<string | null>(() => readStored<string | null>(LS_BG_CUSTOM, null))

  const saveTrash = useCallback((next: TrashedEntry[]) => {
    writeStored(LS_TRASH, next)
    setTrash(next)
  }, [])

  /* 找回：自己加的搬回清单、预置的从"藏起来"清单放出；收藏名单不动，回来还在收藏 */
  const restoreSite = useCallback(
    (id: string) => {
      setTrash((prev) => {
        const entry = prev.find((t) => t.site.id === id)
        if (!entry) return prev
        if (entry.site.custom) {
          const sites = readStored<{ id: string }[]>(LS_CUSTOM_SITES, [])
          if (!sites.some((s) => s.id === id)) {
            writeStored(LS_CUSTOM_SITES, [...sites, entry.site])
          }
        } else {
          const hidden = readStored<string[]>(LS_HIDDEN_SITES, [])
          writeStored(LS_HIDDEN_SITES, hidden.filter((x) => x !== id))
        }
        const next = prev.filter((t) => t.site.id !== id)
        writeStored(LS_TRASH, next)
        return next
      })
    },
    [],
  )

  const purgeTrash = useCallback(
    (id: string) => {
      saveTrash(trash.filter((t) => t.site.id !== id))
    },
    [trash, saveTrash],
  )

  const clearTrash = useCallback(() => {
    saveTrash([])
  }, [saveTrash])

  /* 存过的背景图哪天打不开了就换回默认粉，别停在空白背景上 */
  const handleBgImageError = useCallback(() => {
    setBgIdState("pastel")
    writeStored(LS_BG, "pastel")
  }, [])

  return {
    trash,
    restoreSite,
    purgeTrash,
    clearTrash,
    bgId,
    customBgUrl,
    handleBgImageError,
  }
}
