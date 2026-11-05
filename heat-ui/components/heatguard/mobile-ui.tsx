'use client'

import { CheckCircle2, Frown, Meh, PhoneCall, Smile, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Mood = 'good' | 'normal' | 'bad'

const moodStyles: Record<Mood, { icon: LucideIcon; active: string; down: string; press: string; label: string }> = {
  good: {
    icon: Smile,
    active: 'border-blue-600 bg-blue-50/50 text-blue-700',
    down: 'active:bg-blue-600 active:text-white',
    press: 'bg-blue-600 text-white',
    label: 'text-blue-700',
  },
  normal: {
    icon: Meh,
    active: 'border-amber-500 bg-amber-50 text-amber-800',
    down: 'active:bg-orange-500 active:text-white',
    press: 'bg-orange-500 text-white',
    label: 'text-orange-600',
  },
  bad: {
    icon: Frown,
    active: 'border-red-600 bg-red-50 text-red-700',
    down: 'active:bg-red-600 active:text-white',
    press: 'bg-red-600 text-white',
    label: 'text-red-600',
  },
}

type MoodPickerProps = {
  value: Mood
  onChange: (mood: Mood) => void
  labels: Record<Mood, { title: string; sub?: string }>
  legend: string
  /** lg は顔を正方形の大ボタンにし、文言は下に置く（W-02） */
  size?: 'md' | 'lg'
}

export function MoodPicker({ value, onChange, labels, legend, size = 'md' }: MoodPickerProps) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(moodStyles) as Mood[]).map((mood) => {
          const { icon: Icon, active, down, press, label: labelColor } = moodStyles[mood]
          const selected = value === mood
          const label = labels[mood]
          if (size === 'lg') {
            return (
              <div key={mood} className="@container flex w-full flex-col items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(mood)}
                  className={cn(
                    'flex h-[calc(100cqw-4px)] w-full items-center justify-center rounded-md bg-white text-ink transition-colors',
                    down,
                    selected && press,
                  )}
                >
                  <Icon className="size-11" aria-hidden />
                </button>
                <span className={cn('text-sm font-semibold', selected ? labelColor : 'text-ink')}>{label.title}</span>
                {label.sub && <span className="type-caption -mt-1 text-center leading-tight">{label.sub}</span>}
              </div>
            )
          }
          return (
            <button
              key={mood}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(mood)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md border-2 px-1 py-2.5 text-center transition-colors',
                selected ? active : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              <Icon className="size-8" aria-hidden />
              <span className="text-sm font-semibold">{label.title}</span>
              {label.sub && <span className="text-xs leading-tight opacity-80">{label.sub}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function SectionLabel({ step, children, hint }: { step: string; children: React.ReactNode; hint?: string }) {
  return (
    <p className="type-label mb-2 flex items-baseline gap-2">
      <span className="font-normal text-quiet">設問{step}</span>
      {children}
      {hint && <span className="type-caption font-normal">（{hint}）</span>}
    </p>
  )
}

type ActionVariant = 'primary' | 'danger' | 'ink' | 'alert-white' | 'alert-plain' | 'amber' | 'secondary'

const actionStyles: Record<ActionVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ink: 'bg-slate-900 text-white hover:bg-slate-800',
  'alert-white': 'bg-white font-bold text-red-700 hover:bg-red-50',
  'alert-plain': 'bg-white font-bold text-slate-900 hover:bg-slate-50',
  amber: 'bg-amber-400 font-bold text-slate-950 hover:bg-amber-300',
  secondary: 'bg-white text-ink hover:bg-canvas',
}

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant
  icon?: LucideIcon
}

export function ActionButton({ variant = 'primary', icon: Icon, className, children, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'type-button flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed',
        actionStyles[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      <span className="text-balance">{children}</span>
    </button>
  )
}

export function EmergencyButton() {
  return (
    <a
      href="tel:0000000000"
      onClick={(e) => e.preventDefault()}
      className="flex h-14 w-full items-center justify-center gap-2 bg-sub text-sm font-medium text-sub-ink transition-colors hover:bg-blue-200"
    >
      <PhoneCall className="size-4" aria-hidden />
      緊急連絡
    </a>
  )
}

export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="absolute inset-x-5 bottom-24 z-40 flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
    >
      <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
      {children}
    </div>
  )
}
