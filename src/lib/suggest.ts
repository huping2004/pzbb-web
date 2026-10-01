import type { EngineId } from "@/pages/Home/useHome"

/* 搜索联想词：各家搜索引擎的老牌联想接口。
   不少接口不允许普通跨网络请求，但支持"JSONP"——把请求当一段脚本插进页面，
   远端把数据装进一个约定好的函数调用里送回来。哪路不通就安静放弃，
   顶多不显示联想词，绝不影响正常搜索。 */

let seq = 0

/* JSONP：挂一个临时全局函数，脚本回来就取数、随即扫干净 */
function jsonp(url: string, cbParam: string, timeout = 2500): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const cbName = `__navhub_sug_${(seq += 1)}`
    const script = document.createElement("script")
    const cleanup = () => {
      window.clearTimeout(timer)
      try {
        delete (window as unknown as Record<string, unknown>)[cbName]
      } catch {
        /* 删不掉就留在原地，名字带序号不会撞车 */
      }
      script.remove()
    }
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error("timeout"))
    }, timeout)
    ;(window as unknown as Record<string, unknown>)[cbName] = (data: unknown) => {
      cleanup()
      resolve(data)
    }
    script.src = `${url}${url.includes("?") ? "&" : "?"}${cbParam}=${cbName}`
    script.onerror = () => {
      cleanup()
      reject(new Error("load-error"))
    }
    document.head.appendChild(script)
  })
}

/* 带超时的小请求：到点自己掐线 */
async function fetchJson(url: string, timeout = 2500): Promise<unknown> {
  const ac = new AbortController()
  const timer = window.setTimeout(() => ac.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ac.signal })
    if (!res.ok) throw new Error(`http-${res.status}`)
    return await res.json()
  } finally {
    window.clearTimeout(timer)
  }
}

/* 必应/谷歌的形状：["你输入的", ["联想1", "联想2", ...]] */
function pickPair(data: unknown): string[] {
  if (Array.isArray(data) && Array.isArray(data[1])) {
    return (data[1] as unknown[]).filter((x): x is string => typeof x === "string")
  }
  return []
}

/* 各家主渠道：按当前引擎挑对应的那家联想接口 */
async function primary(engine: EngineId, q: string): Promise<string[]> {
  const enc = encodeURIComponent(q)
  if (engine === "baidu") return baiduSug(q)
  if (engine === "google" || engine === "google-img") {
    return pickPair(
      await jsonp(
        `https://suggestqueries.google.com/complete/search?client=chrome&hl=zh-CN&q=${enc}`,
        "callback",
      ),
    )
  }
  /* 必应/Yandex：它们的联想接口要么不给外部网页调用（浏览器必然报 "Failed to fetch"，
     就算代码接住了，预览页的错误监控也会把每条都记成报错刷屏），要么国内不稳。
     干脆不碰——这两个引擎直接走国内最稳的百度联想渠道，安静又准 */
  return baiduSug(q)
}

/* 百度联想：JSONP 回传，词条在 g/p 数组里（字段名两种版本都有过：q 或 w） */
async function baiduSug(q: string): Promise<string[]> {
  const data = await jsonp(`https://www.baidu.com/sugrec?prod=pc&wd=${encodeURIComponent(q)}`, "cb")
  if (data && typeof data === "object") {
    const d = data as { g?: { q?: string; w?: string }[]; p?: { q?: string; w?: string }[] }
    return [...(d.g ?? []), ...(d.p ?? [])]
      .map((item) => item?.q ?? item?.w)
      .filter((w): w is string => Boolean(w))
  }
  return []
}

/* 主渠道不通时的兜底（一路试到通为止）：
   百度联想（国内哪个引擎都能通）→ 中文维基条目标题（标准跨域接口）→ DuckDuckGo 联想 */
async function fallback(q: string): Promise<string[]> {
  const enc = encodeURIComponent(q)
  try {
    const list = await baiduSug(q)
    if (list.length > 0) return list
  } catch {
    /* 百度也不通（比如在墙外网络）就继续往下试 */
  }
  try {
    const list = pickPair(
      await fetchJson(
        `https://zh.wikipedia.org/w/api.php?action=opensearch&limit=8&namespace=0&origin=*&search=${enc}`,
      ),
    )
    if (list.length > 0) return list
  } catch {
    /* 维基不通就再试下家 */
  }
  try {
    const list = pickPair(await jsonp(`https://ac.duckduckgo.com/ac/?type=list&q=${enc}`, "callback"))
    if (list.length > 0) return list
  } catch {
    /* 都不通就算了 */
  }
  return []
}

/* 拿联想词：先走当前引擎的官方接口，不通换兜底，全不通给空数组 */
export async function getSuggestions(engine: EngineId, q: string): Promise<string[]> {
  try {
    const list = await primary(engine, q)
    if (list.length > 0) return list
  } catch {
    /* 这家不通，换兜底 */
  }
  return fallback(q)
}
