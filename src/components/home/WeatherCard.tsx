import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { CloudSun, MapPin, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/* 选好的城市存本地；经纬度是查询天气用的坐标。
   老数据里叫 admin1，新数据叫 region，两种都认 */
type Place = { name: string; region?: string; admin1?: string; lat: number; lon: number }
/* 一天的预报：高低温 + 天气编号 */
type Day = { max: number; min: number; code: number }
type Today = { temp: number; days: Day[] }
type CityHit = { name: string; region: string; lat: number; lon: number }

const LS_PLACE = "navhub.weather.place"

function readPlace(): Place | null {
  try {
    const raw = window.localStorage.getItem(LS_PLACE)
    if (!raw) return null
    const p = JSON.parse(raw) as Place
    if (typeof p?.name === "string" && typeof p?.lat === "number" && typeof p?.lon === "number") {
      return p
    }
    return null
  } catch {
    return null
  }
}

/* WMO 世界气象组织的天气编号 → 中文说法 + 表情符号 */
function describeWeather(code: number): { text: string; icon: string } {
  if (code === 0) return { text: "晴", icon: "☀️" }
  if (code <= 2) return { text: "多云", icon: "⛅" }
  if (code === 3) return { text: "阴", icon: "☁️" }
  if (code === 45 || code === 48) return { text: "雾", icon: "🌫️" }
  if (code < 60) return { text: "毛毛雨", icon: "🌦️" }
  if (code < 66) return { text: "下雨", icon: "🌧️" }
  if (code < 70) return { text: "冻雨", icon: "🌧️" }
  if (code < 80) return { text: "下雪", icon: "❄️" }
  if (code < 90) return { text: "阵雨", icon: "🌦️" }
  return { text: "雷雨", icon: "⛈️" }
}

export function WeatherCard() {
  const [place, setPlace] = useState<Place | null>(() => readPlace())
  const [today, setToday] = useState<Today | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  /* 点开胶囊看近三天详情的开关 */
  const [detailOpen, setDetailOpen] = useState(false)
  /* 打开页面自动估位的结果：没存过城市时后台悄悄估，失败才亮提示 */
  const [autoFailed, setAutoFailed] = useState(false)

  /* 第一次访问（还没存过城市）：后台按网络估位，估到直接定下来并记住，不用人点 */
  useEffect(() => {
    if (place) return
    let cancelled = false
    void (async () => {
      const hit = await locateByIp()
      if (cancelled) return
      if (!hit) {
        setAutoFailed(true)
        return
      }
      const next: Place = { name: hit.name, region: hit.region, lat: hit.lat, lon: hit.lon }
      try {
        window.localStorage.setItem(LS_PLACE, JSON.stringify(next))
      } catch {
        /* 存不下也让这一页能用 */
      }
      setPlace(next)
    })()
    return () => {
      cancelled = true
    }
  }, [place])
  /* 重新查询的触发计数：手动刷新或换城市时 +1，下面的 effect 会跟着重查 */
  const [refreshTick, setRefreshTick] = useState(0)

  /* 有城市就查天气：组件一挂载就查，之后换城市 / 点刷新再查 */
  useEffect(() => {
    if (!place) {
      setToday(null)
      setLoadFailed(false)
      return
    }
    let cancelled = false
    setLoadFailed(false)
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
      "&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto"
    void (async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error("bad-status")
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number }
          daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[]; weather_code?: number[] }
        }
        const temp = data.current?.temperature_2m
        const maxes = data.daily?.temperature_2m_max ?? []
        const mins = data.daily?.temperature_2m_min ?? []
        const codes = data.daily?.weather_code ?? []
        /* 凑今天+明天+后天三条；少一天就不显示明细、只留胶囊 */
        const days: Day[] = []
        for (let i = 0; i < Math.min(3, maxes.length, mins.length, codes.length); i += 1) {
          const max = maxes[i]
          const min = mins[i]
          const code = codes[i]
          if (typeof max === "number" && typeof min === "number" && typeof code === "number") {
            days.push({ max, min, code })
          }
        }
        if (cancelled) return
        if (typeof temp !== "number" || days.length === 0) {
          setLoadFailed(true)
          return
        }
        setToday({ temp, days })
      } catch {
        if (!cancelled) setLoadFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [place, refreshTick])

  const pickCity = useCallback((hit: CityHit) => {
    const next: Place = { name: hit.name, region: hit.region, lat: hit.lat, lon: hit.lon }
    try {
      window.localStorage.setItem(LS_PLACE, JSON.stringify(next))
    } catch {
      /* 存不下也先让这一页能用 */
    }
    setPlace(next)
    setPickerOpen(false)
  }, [])

  /* 胶囊上显示的就是"今天"那条 */
  const weather = today?.days.length ? describeWeather(today.days[0].code) : null
  const regionLabel = place ? place.region ?? place.admin1 ?? "" : ""
  /* 没查到天气时胶囊上显示的字 */
  const hintText = place
    ? loadFailed
      ? "天气没查到，点开看看"
      : "正在查天气…"
    : autoFailed
      ? "自动定位没成功，点我选城市"
      : "正在自动定位…"

  return (
    <>
      {/* 右上角小胶囊：表情 + 城市 + 现在温度 + 今天高低 */}
      <button
        type="button"
        onClick={() => {
          if (!place) setPickerOpen(true)
          else setDetailOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-full bg-card/85 px-4 py-2 text-sm font-medium text-card-foreground shadow-md ring-1 ring-primary/20 backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {weather ? <span aria-hidden>{weather.icon}</span> : <CloudSun className="h-4 w-4 text-primary" />}
        {place ? <span>{place.name}</span> : <MapPin className="h-4 w-4 text-primary" />}
        {weather ? (
          <span className="font-bold text-primary-foreground">
            {Math.round(today?.temp ?? 0)}°
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {weather.text} {Math.round(today?.days[0]?.min ?? 0)}~{Math.round(today?.days[0]?.max ?? 0)}°
            </span>
          </span>
        ) : (
          <span className={autoFailed ? "font-semibold text-destructive" : "text-muted-foreground"}>{hintText}</span>
        )}
        {/* 已选城市时角落给个小小的换城市入口 */}
        {place ? (
          <span
            role="button"
            tabIndex={0}
            title="换一个城市"
            onClick={(e) => {
              e.stopPropagation()
              setPickerOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation()
                setPickerOpen(true)
              }
            }}
            className="ml-0.5 rounded-full p-1 text-primary/70 transition-colors duration-300 hover:bg-primary/10 hover:text-primary"
          >
            <MapPin className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </button>
      {place && regionLabel && !weather ? (
        <span className="sr-only">{`${place.name}，${regionLabel}`}</span>
      ) : null}

      {/* 选城市：搜名字、从候选里点一个，选好就记住 */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              你在哪个城市？
            </DialogTitle>
            <DialogDescription>
              打开页面会按网络位置自动估算城市并记住；估得不准就在这儿搜个更精确的（县、县级市都能搜），选一次以后就一直用它。
            </DialogDescription>
          </DialogHeader>
          <CityPicker onPick={pickCity} />
        </DialogContent>
      </Dialog>

      {/* 点胶囊看近三天：今天/明天/后天的高低与天气，顺手能刷新或换城市 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="rounded-3xl bg-card shadow-xl ring-1 ring-primary/20 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <CloudSun className="h-4 w-4 text-primary" />
              {place?.name} · 近三天天气
            </DialogTitle>
            <DialogDescription>
              {today
                ? `现在 ${Math.round(today.temp)}°，下面是一直到后天的高低和天气。`
                : loadFailed
                  ? "天气没查到，点下面「重新查一下」再试。"
                  : "正在查天气…"}
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-1.5">
            {(today?.days ?? []).map((day, i) => {
              const d = describeWeather(day.code)
              const label = ["今天", "明天", "后天"][i] ?? `${i + 1} 天后`
              return (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-card-foreground ring-1 ring-primary/10"
                >
                  <span className="w-10 shrink-0 font-semibold text-primary-foreground">{label}</span>
                  <span aria-hidden className="text-lg">
                    {d.icon}
                  </span>
                  <span className="flex-1">{d.text}</span>
                  <span className="font-bold">{Math.round(day.max)}°</span>
                  <span className="text-muted-foreground">/ {Math.round(day.min)}°</span>
                </li>
              )
            })}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDetailOpen(false)
                setRefreshTick((v) => v + 1)
              }}
              className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-colors duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              重新查一下
            </button>
            <button
              type="button"
              onClick={() => {
                setDetailOpen(false)
                setPickerOpen(true)
              }}
              className="flex-1 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              换个城市
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* 地名排序偏好：行政区域点排前面，火车站商场那种同名点排后面 */
const PHOTON_ADMIN_TYPES = new Set([
  "administrative",
  "county",
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "suburb",
])

function parsePhoton(text: string): CityHit[] {
  const data = JSON.parse(text) as {
    features?: {
      properties?: { name?: string; county?: string; city?: string; state?: string; type?: string }
      geometry?: { coordinates?: [number, number] }
    }[]
  }
  const rank = (t: string | undefined) => (t && PHOTON_ADMIN_TYPES.has(t) ? 0 : 1)
  return (data.features ?? [])
    .filter(
      (f) =>
        typeof f.properties?.name === "string" &&
        Array.isArray(f.geometry?.coordinates) &&
        f.geometry.coordinates.length === 2,
    )
    .map((f) => {
      const p = f.properties ?? {}
      const [lon, lat] = (f.geometry as { coordinates: [number, number] }).coordinates
      const region = [p.state, p.city && p.city !== p.name ? p.city : p.county]
        .filter(Boolean)
        .join(" ")
      return { name: p.name as string, region, lat, lon, admin: rank(p.type) }
    })
    .sort((a, b) => a.admin - b.admin)
    .slice(0, 4)
    .map(({ admin: _admin, ...hit }) => hit)
}

/* 浏览器定位失败时改按网络出口（IP）估个大概位置。
   很多情况（比如国内网络连不上浏览器的定位服务、页面嵌在别的网页里）
   就算给了权限也拿不到坐标，这条路能救回大半 */
async function locateByIp(): Promise<CityHit | null> {
  try {
    const res = await fetch("https://ipwho.is/?lang=zh-CN")
    if (!res.ok) return null
    const d = (await res.json()) as {
      success?: boolean
      city?: string
      region?: string
      latitude?: number
      longitude?: number
    }
    if (!d?.success || typeof d.latitude !== "number" || typeof d.longitude !== "number") return null
    const name = d.city || d.region || "我的位置"
    return { name, region: d.region && d.region !== name ? d.region : "", lat: d.latitude, lon: d.longitude }
  } catch {
    return null
  }
}

/* 自动定位：先走浏览器"获取位置"，拿不到就按网络出口估个大概，让用户确认 */
function AutoLocate({ onPick }: { onPick: (hit: CityHit) => void }) {
  const [locating, setLocating] = useState(false)
  const [err, setErr] = useState("")

  const locate = () => {
    setErr("")
    setLocating(true)
    void (async () => {
      /* 首选按网络出口估位：不用授权、一秒回来，估到直接定下来 */
      const hit = await locateByIp()
      if (hit) {
        setLocating(false)
        onPick(hit)
        return
      }
      /* 估位没成功才退回浏览器定位（不少环境本来就用不了） */
      if (!("geolocation" in navigator)) {
        setLocating(false)
        setErr("按网络估位置没成功，这个浏览器也不支持定位，请在下面搜索城市")
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          void (async () => {
            /* 反查地名：拿不到就叫"我的位置"，坐标照样能用 */
            let name = "我的位置"
            let region = ""
            try {
              const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=zh`)
              if (res.ok) {
                const data = (await res.json()) as {
                  features?: { properties?: { name?: string; county?: string; city?: string; state?: string } }[]
                }
                const feats = data.features ?? []
                /* 优先挑能代表"哪个县/市"的那条，街道路名那种放后面 */
                const named = feats.find((f) => f.properties?.county || f.properties?.city) ?? feats[0]
                const p = named?.properties ?? {}
                name = p.county ?? p.city ?? p.state ?? "我的位置"
                const city = p.city && p.city !== name ? p.city : ""
                region = [p.state, city].filter(Boolean).join(" ")
              }
            } catch {
              /* 反查失败就用"我的位置"兜底 */
            }
            setLocating(false)
            onPick({ name, region, lat, lon })
          })()
        },
        () => {
          setLocating(false)
          setErr("估位和浏览器定位都没成功，请在下面搜索城市")
        },
        { timeout: 15000, maximumAge: 600000 },
      )
    })()
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-60"
      >
        <MapPin className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`} />
        {locating ? "正在定位…" : "自动定位到我这里"}
      </button>
      {err ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p> : null}
    </div>
  )
}

function CityPicker({ onPick }: { onPick: (hit: CityHit) => void }) {
  const [keyword, setKeyword] = useState("")
  const [hits, setHits] = useState<CityHit[]>([])
  const [searching, setSearching] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = keyword.trim()
    if (!q) return
    setSearching(true)
    setFailed(false)
    void (async () => {
      /* 两个免费地名库一起查：主库收录大城市全，补充库对县城乡镇更熟 */
      const [om, ph] = await Promise.allSettled([
        fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh&format=json`,
        ).then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad-status")))),
        fetch(
          `https://photon.komoot.io/api?q=${encodeURIComponent(q)}&limit=6`,
        ).then((r) => (r.ok ? r.text() : Promise.reject(new Error("bad-status")))),
      ])
      const merged: CityHit[] = []
      if (om.status === "fulfilled") {
        const data = om.value as {
          results?: { name?: string; admin1?: string; admin2?: string; latitude?: number; longitude?: number }[]
        }
        for (const r of data.results ?? []) {
          if (
            typeof r.name === "string" &&
            typeof r.latitude === "number" &&
            typeof r.longitude === "number"
          ) {
            merged.push({
              name: r.name,
              region: [r.admin1, r.admin2].filter(Boolean).join(" "),
              lat: r.latitude,
              lon: r.longitude,
            })
          }
        }
      }
      if (ph.status === "fulfilled") {
        try {
          for (const hit of parsePhoton(ph.value)) {
            /* 主库里已经有同名且位置差不多的就不重复列 */
            const dup = merged.some(
              (m) => m.name === hit.name && Math.abs(m.lat - hit.lat) < 0.2 && Math.abs(m.lon - hit.lon) < 0.2,
            )
            if (!dup) merged.push(hit)
          }
        } catch {
          /* 补充库解析失败就算了，主库结果照常用 */
        }
      }
      if (om.status !== "fulfilled" && ph.status !== "fulfilled") {
        setFailed(true)
        setHits([])
      } else {
        setHits(merged.slice(0, 8))
        setFailed(merged.length === 0)
      }
      setSearching(false)
    })()
  }

  return (
    <div className="space-y-3">
      <AutoLocate onPick={onPick} />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-primary/15" />
        或者手动搜索
        <span className="h-px flex-1 bg-primary/15" />
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="城市 / 县名，比如 义乌、桐庐"
          aria-label="搜索城市"
          className="min-w-0 flex-1 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-colors duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Search className="h-4 w-4" />
          搜索
        </button>
      </form>

      {searching ? <p className="text-sm text-muted-foreground">搜索中…</p> : null}
      {failed && !searching ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          没搜到这个地名，换个写法（比如带上「县」「市」）再试试
        </p>
      ) : null}

      <ul className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
        {hits.map((hit) => (
          <li key={`${hit.name}-${hit.lat.toFixed(2)}-${hit.lon.toFixed(2)}`}>
            <button
              type="button"
              onClick={() => onPick(hit)}
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-card-foreground transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-semibold">{hit.name}</span>
              {hit.region ? <span className="truncate text-xs text-muted-foreground">{hit.region}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
