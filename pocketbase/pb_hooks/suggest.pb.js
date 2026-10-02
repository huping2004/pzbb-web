// 搜索联想词代取：页面浏览器直连第三方不稳（网络环境各异），改由服务端代为问百度要联想词。
// GET /api/suggest?q=词 → { words: ["…", …] }
// 上游任何闪失都安静返回空列表（前端只是不显示联想词，绝不影响正常搜索），不抛 5xx。
routerAdd("GET", "/api/suggest", function (e) {
  try {
    var info = e.requestInfo()
    var raw = info.query ? info.query["q"] : null
    var q = ""
    if (raw) {
      // url.Values 取值可能是数组，取第一个
      q = typeof raw === "string" ? raw : String(raw[0] || "")
    }
    var words = []
    if (q && q.length > 0 && q.length < 80) {
      var res = $http.send({
        url: "https://www.baidu.com/sugrec?prod=pc&wd=" + encodeURIComponent(q),
        method: "GET",
        timeout: "2s",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/json, text/javascript, */*; q=0.01",
        },
      })
      var data = res.json
      if (res.statusCode === 200 && data) {
        var buckets = [data.g || [], data.p || []]
        for (var b = 0; b < buckets.length; b++) {
          var list = buckets[b]
          if (!list || !list.length) continue
          for (var i = 0; i < list.length; i++) {
            var w = list[i] && (list[i].q || list[i].w)
            if (w) words.push(String(w))
          }
        }
      }
    }
    return e.json(200, { words: words })
  } catch (err) {
    var msg = String((err && err.message) || err)
    try {
      $app.logger().error("suggest route error", "err", msg)
    } catch (_) {
      /* 日志失败不影响返回 */
    }
    return e.json(200, { words: [] })
  }
})
