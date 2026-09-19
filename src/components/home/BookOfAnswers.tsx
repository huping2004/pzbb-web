import { useState } from "react"
import { BookOpen } from "lucide-react"

/* 答案之书的"书页"：一本印刷品本来就是把固定的一堆句子印在各页上，
   这里随机抽一句当作翻到的那一页，问题靠你自己心里默念。
   2026-09 起嵌在「小窝状态」里，做成贴合窄栏的紧凑款 */
const ANSWERS: string[] = [
  "是的。",
  "不要怀疑。",
  "现在就去做。",
  "别急，再等等。",
  "答案是否定的。",
  "换个思路就有了。",
  "这件事值得。",
  "别想太多。",
  "问问你自己，心里早有答案。",
  "明天再决定。",
  "小心为上。",
  "放手去做吧。",
  "这样行不通。",
  "好事多磨。",
  "先睡一觉再说。",
  "还不确定。",
  "你会后悔的。",
  "不会后悔的。",
  "有人正在想你。",
  "把手机放下就知道了。",
  "再问一次。",
  "这不是什么好消息。",
  "好消息马上到。",
  "别拖了。",
  "拖一拖反而更好。",
  "相信直觉。",
  "别轻信任何人，包括这本书。",
  "吃点东西再说。",
  "出去走走就有答案了。",
  "这页被风吹走了。",
  "答案藏在上一页。",
  "翻到这本的人都说行。",
  "不行，但也没那么糟。",
  "行，但你要主动一点。",
  "重要的不是答案。",
  "你缺的不是运气。",
  "先把手头的事做完。",
  "该联系那个人了。",
  "别联系。",
  "秘密会被发现的。",
  "假装不知道就好。",
  "今晚的月亮不帮你。",
  "星星说：可以。",
  "明天同一时间再看一次。",
  "这题超纲了。",
  "保持神秘。",
  "先说好，不是我说的。",
  "你家猫知道答案。",
  "问问你最好的朋友。",
  "答案在奶茶里。",
  "睡一觉，明天答案就变了。",
  "其实你想听我说「可以」。",
  "可以，但别声张。",
  "不行，听我的。",
  "一半一半。",
  "主动权在你手里。",
  "机会已经出现了。",
  "机会还在路上。",
  "这页是空白的。",
  "别熬夜了。",
  "该存钱了。",
  "买它。",
  "再考虑考虑。",
  "你会遇到新的人。",
  "旧的不去，新的不来。",
  "保持微笑。",
  "深呼吸，然后去做。",
  "这本书也觉得难。",
  "这是命运石之门的选择。",
  "命运之书建议你再翻一页。",
]

export function BookOfAnswers({ onShift }: { onShift?: () => void }) {
  const [answer, setAnswer] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [lastIdx, setLastIdx] = useState(-1)

  /* 翻一页：随机抽一句，连着两次不落到同一页；页号是现编的，图个仪式感 */
  const flip = () => {
    let idx = Math.floor(Math.random() * ANSWERS.length)
    if (idx === lastIdx) idx = (idx + 1) % ANSWERS.length
    setLastIdx(idx)
    setAnswer(ANSWERS[idx])
    setPage(1 + Math.floor(Math.random() * 222))
    /* 每翻一页 = 世界线变动一次，通知外层小窝卡片演一段故障动画 */
    onShift?.()
  }

  return (
    <div className="rounded-2xl bg-secondary/70 p-4 ring-1 ring-primary/10">
      <p className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        命运石之门的选择
      </p>

      {answer ? (
        /* key 变了重挂载，让每页都带一次翻开的淡入 */
        <div key={`${page}-${answer}`} className="animate-in fade-in zoom-in-95 duration-500">
          {/* 页号跟在答案同一行，不再单独占一行 */}
          <p className="mt-2 text-base font-bold leading-snug text-primary">
            「{answer}」
            <span className="ml-2 whitespace-nowrap text-xs font-normal text-muted-foreground">
              —— 第 {page} 页
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={flip}
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <BookOpen className="h-3.5 w-3.5" />
              再翻一页
            </button>
            <button
              type="button"
              onClick={() => setAnswer(null)}
              className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              合上书
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            你会选择相信命运吗？
          </p>
          <button
            type="button"
            onClick={flip}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <BookOpen className="h-4 w-4" />
            相信命运
          </button>
        </>
      )}
    </div>
  )
}
