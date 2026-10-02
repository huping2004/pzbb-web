import type { EngineId } from "@/pages/Home/useHome"
import { contentExt } from "@/lib/ext"
import { getAuthHeaders } from "@/lib/auth"
import { getPocketBaseUrl } from "@/lib/pb"

/* 搜索联想词：只用百度的联想数据（用户拍板：全走百度），但换了一条路——
   **由本站后端代问百度**（GET {__pb}/api/suggest）：浏览器只跟网站自己说话，
   不直连任何第三方，所以跟本机开不开代理、网络能不能出去彻底无关。
   独立部署（没有本站后端）时退回老办法：JSONP 直连百度——
   把请求当一段脚本插进页面，远端把数据装进约定好的函数调用里送回来。
   两条路都不通就安静放弃，顶多不显示联想词，绝不影响正常搜索。 */

/* 首选：问自家后端要词（超时 2 秒，快进快出）。
   平台预览里后端挂在 __pb 代理后面；独立部署（Vercel 等静态托管）时
   同源下没有 __pb，改问站点自己的 /api/suggest（Vercel 的 Serverless 函数，见仓库 api/） */
async function backendSug(q: string): Promise<string[]> {
  const ac = new AbortController()
  const timer = window.setTimeout(() => ac.abort(), 2000)
  const onVibex = /^\/(?:app-preview|p)\/app-[0-9a-f]{32}(?=\/|$)/.test(window.location.pathname)
  const base = onVibex ? getPocketBaseUrl() : ""
  try {
    const res = await fetch(
      `${base}/api/suggest?q=${encodeURIComponent(q)}`,
      { signal: ac.signal, headers: getAuthHeaders() },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { words?: string[] }
    return Array.isArray(data.words) ? data.words : []
  } finally {
    window.clearTimeout(timer)
  }
}

let seq = 0

/* JSONP：挂一个临时全局函数，脚本回来就取数、随即扫干净。
   脚本地址过 contentExt：预览里自动换成平台代取通道，其它环境原样直连 */
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
    script.src = contentExt(`${url}${url.includes("?") ? "&" : "?"}${cbParam}=${cbName}`)
    script.onerror = () => {
      cleanup()
      reject(new Error("load-error"))
    }
    document.head.appendChild(script)
  })
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

/* 拿联想词：不分引擎，全部拿百度的词（引擎参数保留只为调用方签名不变）；
   先问自家后端（不依赖本机外网），后端没应答再试 JSONP 直连（独立部署形态）；
   都不通给空数组，安静地不显示联想词 */
export async function getSuggestions(_engine: EngineId, q: string): Promise<string[]> {
  const viaBackend = await backendSug(q).catch(() => [])
  if (viaBackend.length > 0) return viaBackend
  return baiduSug(q).catch(() => [])
}
