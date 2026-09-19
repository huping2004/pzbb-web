/* 二次元风格的装饰小图标：四角星星、花瓣、爱心、音符、蝴蝶结、猫爪、对话框。
   颜色一律用 currentColor，由外部 Tailwind token 类（text-primary 等）着色。 */

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 2.4c.6 4.1 2.4 6.1 6.6 7.1-4.2 1-6 3-6.6 7.1-.6-4.1-2.4-6.1-6.6-7.1 4.2-1 6-3 6.6-7.1Z"
      />
    </svg>
  )
}

export function PetalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 2.2c3.5 3.2 6.3 6.6 6.3 10.2a6.3 6.3 0 0 1-12.6 0c0-3.6 2.8-7 6.3-10.2Z"
      />
    </svg>
  )
}

export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 20.4 4.7 13.3a4.9 4.9 0 0 1 6.9-6.9l.4.4.4-.4a4.9 4.9 0 0 1 6.9 6.9L12 20.4Z"
      />
    </svg>
  )
}

export function NoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <g fill="currentColor">
        <circle cx="7" cy="17.4" r="3.1" />
        <circle cx="17.4" cy="15.4" r="3.1" />
        <rect x="8.6" y="4.2" width="1.6" height="13.4" rx="0.8" />
        <rect x="19" y="2.2" width="1.6" height="13.4" rx="0.8" />
        <path d="M8.2 4.6 20.6 1.9v2.4L8.2 7Z" />
      </g>
    </svg>
  )
}

export function BowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <g fill="currentColor">
        <path d="M11 12 4.9 8.5a2.1 2.1 0 0 0-3.1 1.8v3.4a2.1 2.1 0 0 0 3.1 1.8L11 12Z" />
        <path d="M13 12l6.1-3.5a2.1 2.1 0 0 1 3.1 1.8v3.4a2.1 2.1 0 0 1-3.1 1.8L13 12Z" />
        <path d="M12 9.6c1.3 0 2.4 1.1 2.4 2.4S13.3 14.4 12 14.4 9.6 13.3 9.6 12 10.7 9.6 12 9.6Z" />
      </g>
    </svg>
  )
}

export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <g fill="currentColor">
        <circle cx="6.9" cy="9.4" r="2.2" />
        <circle cx="12" cy="7.4" r="2.4" />
        <circle cx="17.1" cy="9.4" r="2.2" />
        <path d="M12 11.8c3 0 5.4 2.1 5.4 4.5 0 1.9-1.9 3.3-5.4 3.3s-5.4-1.4-5.4-3.3c0-2.4 2.4-4.5 5.4-4.5Z" />
      </g>
    </svg>
  )
}

export function BubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M5.6 4h12.8A3.6 3.6 0 0 1 22 7.6v6a3.6 3.6 0 0 1-3.6 3.6h-5.9l-4.8 3.6a.7.7 0 0 1-1.1-.6V17.2h-1A3.6 3.6 0 0 1 2 13.6v-6A3.6 3.6 0 0 1 5.6 4Z"
      />
    </svg>
  )
}