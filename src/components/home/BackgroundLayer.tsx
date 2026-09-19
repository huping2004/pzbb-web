import { BowIcon, HeartIcon, StarIcon } from "@/components/home/DecorIcons"
import { FloatUp } from "@/components/home/FloatUp"
import { SakuraFall } from "@/components/home/SakuraFall"
import { SparkleField } from "@/components/home/SparkleField"

/* 每套内置背景的粉色基底：全部由 primary / card / secondary 派生，不写任何裸色值 */
export function backgroundClass(id: string): string {
  switch (id) {
    case "star":
      return "bg-gradient-to-b from-primary/20 via-primary/10 to-background"
    case "sakura":
      return "bg-gradient-to-tr from-primary/25 via-background to-primary/15"
    case "cloud":
      return "bg-gradient-to-b from-card via-primary/15 to-primary/10"
    case "custom":
      return "bg-background"
    case "pastel":
    default:
      return "bg-gradient-to-br from-primary/30 via-primary/10 to-background"
  }
}

export function BackgroundLayer({
  bgId,
  customUrl,
  onImageError,
}: {
  bgId: string
  customUrl: string | null
  onImageError: () => void
}) {
  const hasImage = bgId === "custom" && Boolean(customUrl)

  /* 不能再用负层级：页面底下的兜底底板会把整层背景盖住。抬到 z-0，内容层各自 relative z-10 压在上面 */
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hasImage && customUrl ? (
        <>
          {/* 用真图片标签而不是 background-image，加载失败时能被接住 */}
          <img
            src={customUrl}
            alt=""
            onError={onImageError}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/35" />
        </>
      ) : (
        <div className={`absolute inset-0 ${backgroundClass(bgId)}`} />
      )}

      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-secondary/60 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      {/* 角落的巨型二次元符号：星星 / 爱心 / 蝴蝶结，极慢地各自转动，像贴在背景上的水印 */}
      <span
        className="slow-spin absolute -left-12 top-20 h-44 w-44 text-primary/10"
        style={{ animationDuration: "80s" }}
      >
        <StarIcon className="h-full w-full" />
      </span>
      <span
        className="slow-spin absolute -right-8 top-1/2 h-36 w-36 text-primary/10"
        style={{ animationDuration: "110s", animationDirection: "reverse" }}
      >
        <HeartIcon className="h-full w-full" />
      </span>
      <span
        className="slow-spin absolute bottom-12 left-1/4 h-40 w-40 text-primary/10"
        style={{ animationDuration: "95s" }}
      >
        <BowIcon className="h-full w-full" />
      </span>

      <SakuraFall density={bgId === "sakura" ? "full" : "soft"} />
      <FloatUp />
      <SparkleField />
    </div>
  )
}