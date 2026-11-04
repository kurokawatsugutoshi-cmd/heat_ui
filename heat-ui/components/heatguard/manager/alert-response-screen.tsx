'use client'

import { useState } from 'react'
import { Ambulance, Check, Navigation, Phone } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { LangSelect, type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { cn } from '@/lib/utils'

export type ResponseStep = 'pending' | 'responding' | 'choosing'
export type Viewer = 'self' | 'other'

export const TREATMENTS = [
  { id: 'rest', title: '一時休憩後に作業復帰', sub: 'クールスポットにて水分・塩分補給後、回復を確認' },
  { id: 'watch', title: '注意して作業継続（経過観察）', sub: '軽作業へ変更 ※翌日の要注意リストへ自動引継' },
  { id: 'leave', title: '本日の作業中止・早退', sub: '体調を考慮し、本日の作業を打ち切り帰宅指示' },
  { id: 'transport', title: '医療機関へ搬送（緊急）', sub: '現場監督・救護本部と連携し病院へ搬送' },
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

function StatusBadge({ step, done }: { step: ResponseStep; done: boolean }) {
  if (done)
    return (
      <span className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-sm font-semibold text-emerald-700">
        <Check className="size-4" aria-hidden />
        対応記録完了
      </span>
    )
  if (step === 'pending')
    return <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-700">● 未対応</span>
  return (
    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-sm font-semibold text-blue-700">
      ● 対応中：鈴木 一郎（全管理者へ同期済）
    </span>
  )
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
    <PhoneFrame label="A-02 アラート対応と処置内容4択記録画面" time="14:31" highlighted={highlighted}>
      <header
        className={cn(
          'flex shrink-0 items-center justify-between gap-3 px-5 py-3 text-white transition-colors',
          step === 'pending' ? 'bg-red-600' : 'bg-slate-800',
        )}
      >
        <p className="text-base font-bold">アラート発生中（14:25 検知）</p>
        <LangSelect value={lang} onChange={setLang} tone="alert" compact />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pt-4 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="type-caption">〇〇鉄筋工業（一次請け）</p>
          <p className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="type-title">グエン・ヴァン</span>
            <span className="type-meta">言語：JP / VI</span>
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {REASONS.map((r) => (
              <li key={r} className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-sm text-red-700">
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2.5">
          <span className="text-sm text-slate-500">ステータス</span>
          <StatusBadge step={step} done={done} />
        </div>

        {step === 'choosing' && !isOther && (
          <section className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="mb-2 px-1 text-sm font-bold text-slate-900">処置結果の選択（労基署・監査ログ記録用）</h3>
            <ul className="space-y-2" role="radiogroup" aria-label="処置結果">
              {TREATMENTS.map((t) => {
                const selected = treatment === t.id
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onTreatmentChange(t.id)}
                      className={cn(
                        'w-full rounded-md border p-3.5 text-left transition-colors',
                        selected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-600 hover:bg-blue-50/50',
                      )}
                    >
                      <span className="type-label block">{t.title}</span>
                      <span className="type-caption mt-0.5 block leading-snug">{t.sub}</span>
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
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:0000000000"
                  onClick={(e) => e.preventDefault()}
                  className="type-button flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-ink hover:bg-canvas"
                >
                  <Phone className="size-4" aria-hidden />
                  本人へ電話
                </a>
                <a
                  href="tel:0000000000"
                  onClick={(e) => e.preventDefault()}
                  className="type-button flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg bg-sub text-sub-ink hover:bg-blue-200"
                >
                  <Ambulance className="size-4" aria-hidden />
                  救護本部へ連絡
                </a>
              </div>
            </>
          )}
          {step !== 'pending' && isOther && (
            <ActionButton disabled className="bg-slate-100 text-slate-500 hover:bg-slate-100">
              鈴木 一郎さんが対応に向かっています
            </ActionButton>
          )}
          {step === 'responding' && !isOther && (
            <ActionButton onClick={() => onStepChange('choosing')}>
              対応完了（処置内容の記録へ進む）
            </ActionButton>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
