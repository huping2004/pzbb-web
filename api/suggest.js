/* 搜索联想词的服务端小接口（Vercel / Netlify 等 Serverless 函数）。
   部署到静态托管后，浏览器直连第三方联想接口经常不通（网络环境各异），
   所以由这个函数在服务端代为问百度要词，页面只跟自己的站点说话。
   GET /api/suggest?q=词 → { words: ["…", …] }；任何闪失安静返回空列表。 */

export default async function handler(req, res) {
  const q = String(req.query.q || "").slice(0, 80)
  const words = []
  try {
    if (q) {
      const r = await fetch(
        `https://www.baidu.com/sugrec?prod=pc&wd=${encodeURIComponent(q)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            Accept: "application/json, text/javascript, */*; q=0.01",
          },
          // 3 秒封顶，别让请求挂着
          signal: AbortSignal.timeout(3000),
        },
      )
      if (r.ok) {
        const data = await r.json()
        for (const item of [...(data.g || []), ...(data.p || [])]) {
          const w = item && (item.q || item.w)
          if (w) words.push(String(w))
        }
      }
    }
  } catch {
    /* 上游不通就空手而归 */
  }
  res.setHeader("Cache-Control", "public, max-age=60")
  res.status(200).json({ words })
}
