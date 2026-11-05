'use client'

import { useState } from 'react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'
import { Toast } from '@/components/heatguard/mobile-ui'
import { EntryBlockModal } from '@/components/heatguard/entry/entry-block-modal'

const SAMPLE_FINDINGS = ['朝の血圧：180 / 110 mmHg（基準超過）', '昨日の睡眠：5時間以下（睡眠不足）']

export function EntryBlockScreen() {
  const [lang, setLang] = useState<Lang>('JP')
  const [open, setOpen] = useState(true)

  const resolve = () => {
    setOpen(false)
    setTimeout(() => setOpen(true), 2500)
  }

  return (
    <PhoneFrame
      label="W-03 入場制限・上長確認モーダル"
      time="7:46"
      frame="dark"
      className="bg-canvas text-ink"
      overlay={open ? <EntryBlockModal findings={SAMPLE_FINDINGS} onResolve={resolve} /> : <Toast>入場受付完了</Toast>}
    >
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className={cn(SCREEN_BODY, 'bg-canvas')} aria-hidden>
        <div className="h-6 w-44 rounded bg-white" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-24 rounded-md bg-white" />
          <div className="h-24 rounded-md bg-white" />
          <div className="h-24 rounded-md bg-white" />
        </div>
        <div className="h-11 rounded-md bg-white" />
        <div className="h-11 rounded-md bg-white" />
        <div className="h-11 rounded-md bg-white" />
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
