'use client'

import { useState } from 'react'
import { Ambulance, Coffee, Eye, House, Navigation, Phone } from 'lucide-react'
import { AlertPersonCard } from '@/components/heatguard/manager/alert-person-card'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

export type ResponseStep = 'pending' | 'responding' | 'choosing'
export type Viewer = 'self' | 'other'

export const TREATMENTS = [
  { id: 'rest', title: '一時休憩後に作業復帰', sub: 'クールスポットにて水分・塩分補給後、回復を確認', icon: Coffee },
  { id: 'watch', title: '注意して作業継続（経過観察）', sub: '軽作業へ変更 ※翌日の要注意リストへ自動引継', icon: Eye },
  { id: 'leave', title: '本日の作業中止・早退', sub: '体調を考慮し、本日の作業を打ち切り帰宅指示', icon: House },
  { id: 'transport', title: '医療機関へ搬送（緊急）', sub: '現場監督・救護本部と連携し病院へ搬送', icon: Ambulance },
] as const

export type TreatmentId = (typeof TREATMENTS)[number]['id']

const REASONS = ['朝の血圧 180/110（基準超過）', '睡眠 5時間以下', '14:25 定時報告：めまい']

type AlertResponseScreenProps = {
  step: ResponseStep
  onStepChange: (step: ResponseStep) => void
  treatment: TreatmentId | null
  onTreatmentChange: (id: TreatmentId) => void
  viewer: Viewer
  highlighted?: boolean
}

export function AlertResponseScreen({
  step,
  onStepChange,
  treatment,
  onTreatmentChange,
  viewer,
  highlighted,
}: AlertResponseScreenProps) {
  const [lang, setLang] = useState<Lang>('JP')
  const isOther = viewer === 'other'
  const done = step === 'choosing' && treatment !== null

  return (
    <PhoneFrame
      label="A-02 アラート対応と処置内容4択記録画面"
      time="14:31"
      frame="dark"
      className="bg-canvas text-ink"
      highlighted={highlighted}
    >
      <WorkerHeader
        company="〇〇鉄筋工業"
        role="職長"
        name="鈴木 一郎"
        lang={lang}
        onLangChange={setLang}
        counts={{ good: 3, bad: 1 }}
      />

      <div className={cn(SCREEN_BODY, 'bg-canvas')}>
        <section>
          <AlertPersonCard company="〇〇工務店（二次請け）" name="大和 太郎" step={step} done={done}>
            <div className="mt-6">
              <p className="type-label mb-2">14:03にめまいが報告されました</p>
              <ul className="flex flex-wrap gap-1.5">
                {REASONS.map((r) => (
                  <li key={r} className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-sm text-red-700">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </AlertPersonCard>
        </section>

        {step === 'choosing' && !isOther && (
          <section>
            <p className="type-label mb-2">処置結果を選択</p>
            <ul className="space-y-2" role="radiogroup" aria-label="処置結果">
              {TREATMENTS.map((t) => {
                const selected = (treatment ?? TREATMENTS[0].id) === t.id
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onTreatmentChange(t.id)}
                      className={cn(
                        'w-full rounded-md bg-white p-3.5 text-left text-ink transition-colors active:bg-blue-600 active:text-white',
                        selected && 'bg-blue-600 text-white',
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <t.icon className="size-4 shrink-0" aria-hidden />
                        {t.title}
                      </span>
                      <span className={cn('mt-0.5 block pl-6 text-xs leading-snug', selected ? 'text-white/80' : 'text-quiet')}>
                        {t.sub}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <div className="mt-auto space-y-2">
          {step === 'pending' && (
            <>
              <ActionButton icon={Navigation} onClick={() => onStepChange('responding')}>
                向かう（自分が対応する）
              </ActionButton>
              <a
                href="tel:0000000000"
                onClick={(e) => e.preventDefault()}
                className="type-button flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-white text-ink hover:bg-canvas"
              >
                <Phone className="size-4 shrink-0" aria-hidden />
                本人へ電話
              </a>
            </>
          )}
          {step !== 'pending' && isOther && (
            <p className="type-body rounded-2xl bg-white px-4 py-3 text-center">鈴木 一郎さんが対応に向かっています</p>
          )}
          {step === 'responding' && !isOther && (
            <>
              <a
                href="tel:0000000000"
                onClick={(e) => e.preventDefault()}
                className="type-button flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-ink text-white hover:bg-zinc-700"
              >
                <Phone className="size-4 shrink-0" aria-hidden />
                本人へ電話する
              </a>
              <ActionButton onClick={() => onStepChange('choosing')}>対応完了（処置内容の記録へ進む）</ActionButton>
            </>
          )}
        </div>
      </div>
      <WorkerFooter label="救護本部へ電話する" />
    </PhoneFrame>
  )
}
