import { useCallback, useState } from "react"
import { readFreshTrash, readStored, writeStored } from "@/pages/Home/useHome"
import type { TrashedEntry } from "@/pages/Home/useHome"

/* 和首页共用同一批本地键：删是首页删的，这里是"捞回来"的地方 */
const LS_CUSTOM_SITES = "navhub.custom.sites"
const LS_HIDDEN_SITES = "navhub.hidden.sites"
const LS_FAVORITES = "navhub.favorites"
const LS_TRASH = "navhub.trash"
const LS_BG = "navhub.bg"
const LS_BG_CUSTOM = "navhub.bg.custom"

export function useTrash() {
  /* 打开回收站时顺带清掉删满 30 天的旧条目（长期保存，一个月自动清一次） */
  const [trash, setTrash] = useState<TrashedEntry[]>(() => readFreshTrash())
  /* 背景跟着首页选的那套走 */
  const [bgId, setBgIdState] = useState<string>(() => readStored<string>(LS_BG, "pastel"))
  const [customBgUrl] = useState<string | null>(() => readStored<string | null>(LS_BG_CUSTOM, null))

  const saveTrash = useCallback((next: TrashedEntry[]) => {
    writeStored(LS_TRASH, next)
    setTrash(next)
  }, [])

  /* 找回现在是"复印"不是"搬家"：拿回去之后，回收站里这份还留着（删满 30 天才会自动清）。
     直接加在收藏栏里的个人网址以前找回后会"消失"——收藏名单里没有它、原分组又没有它的位置；
     现在找回时一并把收藏记回去，原样回收藏栏 */
  const restoreSite = useCallback(
    (id: string) => {
      const entry = trash.find((t) => t.site.id === id)
      if (!entry) return
      if (entry.site.custom) {
        const sites = readStored<{ id: string }[]>(LS_CUSTOM_SITES, [])
        if (!sites.some((s) => s.id === id)) {
          writeStored(LS_CUSTOM_SITES, [...sites, entry.site])
        }
      } else {
        const hidden = readStored<string[]>(LS_HIDDEN_SITES, [])
        writeStored(LS_HIDDEN_SITES, hidden.filter((x) => x !== id))
      }
      /* 收藏栏的网站：找回时把收藏身份也补回去，不然它哪一栏都不归 */
      if (entry.site.group === "fav") {
        const favs = readStored<string[]>(LS_FAVORITES, [])
        if (!favs.includes(id)) writeStored(LS_FAVORITES, [...favs, id])
      }
    },
    [trash],
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
