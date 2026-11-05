'use client'

import { useState } from 'react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'
import { AlertPersonCard } from '@/components/heatguard/manager/alert-person-card'

const ALERTS: {
  company: string
  lang: 'JP' | 'VI'
  name: string
  step: 'pending' | 'responding'
  done?: boolean
  doneLabel?: string
  responder?: string
  report: string
  dot: 'red' | 'blue'
}[] = [
  { company: '〇〇工務店（二次請け）', lang: 'JP', name: '大和 太郎', step: 'pending', report: '14:03にめまいが報告されました', dot: 'red' },
  { company: '△△設備（三次請け）', lang: 'VI', name: 'グエン・ヴァン', step: 'responding', responder: '管理太郎', report: '14:03にめまいが報告されました', dot: 'red' },
  { company: '〇〇工務店（二次請け）', lang: 'JP', name: '林 翔太', step: 'pending', report: '14:03にめまいが報告されました', dot: 'red' },
  {
    company: '□□塗装工業',
    lang: 'JP',
    name: '中村 大輝',
    step: 'pending',
    done: true,
    doneLabel: '対応済み',
    responder: '管理太郎',
    report: '14:03にめまいが報告されました',
    dot: 'blue',
  },
]

export function AlertListScreen({ highlighted }: { highlighted?: boolean }) {
  const [lang, setLang] = useState<Lang>('JP')

  return (
    <PhoneFrame
      label="A-03 アラート者リスト画面"
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
        <h2 className="type-title flex items-baseline gap-2">
          アラート一覧
          <span className="type-meta font-normal">{ALERTS.length}件</span>
        </h2>
        <ul className="space-y-3">
          {ALERTS.map((item) => (
            <li key={item.name}>
              <button type="button" className="w-full appearance-none border-0 bg-transparent p-0 text-left">
                <AlertPersonCard
                  company={item.company}
                  lang={item.lang}
                  name={item.name}
                  step={item.step}
                  done={item.done}
                  doneLabel={item.doneLabel}
                  responder={item.responder}
                  report={item.report}
                  dot={item.dot}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <WorkerFooter label="救護本部へ電話する" />
    </PhoneFrame>
  )
}
