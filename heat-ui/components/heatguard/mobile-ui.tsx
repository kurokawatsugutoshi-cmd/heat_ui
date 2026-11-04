'use client'

import { CheckCircle2, Frown, Meh, PhoneCall, Smile, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Mood = 'good' | 'normal' | 'bad'

const moodStyles: Record<Mood, { icon: LucideIcon; active: string }> = {
  good: { icon: Smile, active: 'border-blue-600 bg-blue-50/50 text-blue-700' },
  normal: { icon: Meh, active: 'border-amber-500 bg-amber-50 text-amber-800' },
  bad: { icon: Frown, active: 'border-red-600 bg-red-50 text-red-700' },
}

type MoodPickerProps = {
  value: Mood
  onChange: (mood: Mood) => void
  labels: Record<Mood, { title: string; sub?: string }>
  legend: string
}

export function MoodPicker({ value, onChange, labels, legend }: MoodPickerProps) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(moodStyles) as Mood[]).map((mood) => {
          const { icon: Icon, active } = moodStyles[mood]
          const selected = value === mood
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
              <span className="text-sm font-semibold">{labels[mood].title}</span>
              {labels[mood].sub && <span className="text-xs leading-tight opacity-80">{labels[mood].sub}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function SectionLabel({ step, children, hint }: { step: string; children: React.ReactNode; hint?: string }) {
  return (
    <p className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-slate-900">
      <span className="text-slate-500">設問{step}</span>
      {children}
      {hint && <span className="text-xs font-normal text-slate-400">（{hint}）</span>}
    </p>
  )
}

type ActionVariant = 'primary' | 'ink' | 'alert-white' | 'alert-plain' | 'amber' | 'secondary'

const actionStyles: Record<ActionVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ink: 'bg-slate-900 text-white hover:bg-slate-800',
  'alert-white': 'bg-white font-bold text-red-700 hover:bg-red-50',
  'alert-plain': 'bg-white font-bold text-slate-900 hover:bg-slate-50',
  amber: 'bg-amber-400 font-bold text-slate-950 hover:bg-amber-300',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
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
        'flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed',
        actionStyles[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
      <span className="text-balance">{children}</span>
    </button>
  )
}

export function EmergencyButton({ label = '緊急連絡（工事課員・救護直通）' }: { label?: string }) {
  return (
    <a
      href="tel:0000000000"
      onClick={(e) => e.preventDefault()}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-red-600 bg-white px-4 py-2.5 text-base font-semibold text-red-600 transition-colors hover:bg-red-50"
    >
      <PhoneCall className="size-5" aria-hidden />
      {label}
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
