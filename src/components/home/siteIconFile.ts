/* 把用户上传的图片压成一张小图标（dataURL 存在浏览器本地，太大会把仓库撑爆）。
   最长边压到 128px，优先 webp（小且保留透明），浏览器不认就退 png。 */
const ICON_MAX_SIDE = 128

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("read-error"))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("bad-image"))
    img.src = src
  })
}

/* 返回可直接存本地的小图标；读不出来或不是图片时返回 null */
export async function readSmallIcon(file: File): Promise<string | null> {
  try {
    const dataUrl = await readAsDataUrl(file)
    const img = await loadImage(dataUrl)
    const scale = Math.min(1, ICON_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, width, height)
    const webp = canvas.toDataURL("image/webp", 0.88)
    if (webp.startsWith("data:image/webp")) return webp
    return canvas.toDataURL("image/png")
  } catch {
    return null
  }
}
